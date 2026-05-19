import { getToken, deleteToken } from "firebase/messaging";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, getFirebaseMessaging } from "./firebase";

// Gerar em: Firebase Console → Project Settings → Cloud Messaging → Certificados push da Web
// Clique em "Gerar par de chaves" e cole a chave pública aqui.
const VAPID_KEY = "SUBSTITUA_PELA_VAPID_KEY_DO_FIREBASE_CONSOLE";

// ── Service Worker ────────────────────────────────────────────────────────────

async function getFcmSwRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    // Escopo separado do VitePWA (que usa '/') para evitar conflito.
    return await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/firebase-messaging/",
    });
  } catch (err) {
    console.error("[Push] erro ao registrar SW:", err);
    return null;
  }
}

// ── Token FCM ─────────────────────────────────────────────────────────────────

export async function getFcmToken(): Promise<string | null> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  try {
    const swRegistration = await getFcmSwRegistration();
    if (!swRegistration) return null;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });
    console.log("[Push] token:", token);
    return token || null;
  } catch (err) {
    console.error("[Push] erro ao obter token FCM:", err);
    return null;
  }
}

export async function requestNotificationPermission(
  userId: string
): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";

  const permission = await Notification.requestPermission();
  console.log("[Push] permissão:", permission);

  if (permission === "granted") {
    const token = await getFcmToken();
    if (token) await saveUserFcmToken(userId, token);
  }

  return permission;
}

// ── Firestore — salvar/remover token ─────────────────────────────────────────

export async function saveUserFcmToken(userId: string, token: string): Promise<void> {
  try {
    // ID do doc derivado do token — evita duplicatas sem precisar de query
    const tokenDocId = `web_${token.replace(/[^a-zA-Z0-9]/g, "").slice(-28)}`;
    const tokenRef = doc(db, "users", userId, "notificationTokens", tokenDocId);
    const existing = await getDoc(tokenRef);
    const now = new Date().toISOString();

    await setDoc(tokenRef, {
      token,
      platform: "web",
      userAgent: navigator.userAgent,
      createdAt: existing.exists() ? (existing.data().createdAt ?? now) : now,
      updatedAt: now,
      active: true,
    });

    console.log("[Push] token salvo para usuário:", userId);
  } catch (err) {
    console.error("[Push] erro ao salvar token:", err);
    throw err;
  }
}

export async function removeUserFcmToken(userId: string, token: string): Promise<void> {
  try {
    const tokenDocId = `web_${token.replace(/[^a-zA-Z0-9]/g, "").slice(-28)}`;
    const tokenRef = doc(db, "users", userId, "notificationTokens", tokenDocId);
    const existing = await getDoc(tokenRef);

    if (existing.exists()) {
      await setDoc(tokenRef, {
        ...existing.data(),
        active: false,
        updatedAt: new Date().toISOString(),
      });
    }

    const messaging = await getFirebaseMessaging();
    if (messaging) await deleteToken(messaging);
  } catch (err) {
    console.error("[Push] erro ao remover token:", err);
  }
}

// ── Utilitário — formatar corpo da notificação (referência para n8n) ──────────

const RATING_LABELS: Record<string, string> = {
  UNCLASSIFIED: "Não classificado",
  BRONZE: "Bronze",
  SILVER: "Prata",
  GOLD: "Ouro",
  DIAMOND: "Diamante",
};

const PILLAR_SHORT: Record<string, string> = {
  gestao_comercial: "Comercial",
  omni_digital: "Omni",
  esg: "ESG",
  excelencia_operacional: "Op.",
  gestao_pessoas_financas: "Pess/Fin",
};

export function formatRating(rating: string): string {
  return RATING_LABELS[rating] ?? rating;
}

export function buildPushPayload(
  current: {
    rankingSummary: {
      points: { raw: number; formatado: string };
      rating: string;
    };
    pillarsSummary: Record<string, { variation?: number | null; variationLabel?: string }>;
  },
  previous: { rankingSummary: { points: { raw: number } } }
): { title: string; body: string } {
  const curr = current.rankingSummary.points.raw;
  const prev = previous.rankingSummary.points.raw;
  const trend = curr > prev ? "subiu" : curr < prev ? "caiu" : "manteve";
  const rating = formatRating(current.rankingSummary.rating);
  const cpPart = `CP ${trend} para ${current.rankingSummary.points.formatado} • ${rating}`;

  const pillarsText = Object.entries(current.pillarsSummary)
    .filter(([, s]) => s.variation !== null && s.variation !== undefined && s.variation !== 0)
    .map(([key, s]) => `${PILLAR_SHORT[key] ?? key} ${s.variationLabel ?? ""}`.trim())
    .join(" • ");

  return {
    title: "IAF atualizado",
    body: pillarsText ? `${cpPart} | ${pillarsText}` : cpPart,
  };
}
