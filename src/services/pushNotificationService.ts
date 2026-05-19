import { getToken, deleteToken } from "firebase/messaging";
import { collection, doc, getDoc, setDoc, addDoc } from "firebase/firestore";
import { db, getFirebaseMessaging } from "./firebase";

// ─────────────────────────────────────────────────────────────────────────────
// VAPID KEY — obter em:
//   Firebase Console → Project Settings → Cloud Messaging
//   → Certificados push da Web → Gerar par de chaves
//   Cole a chave pública abaixo.
// ─────────────────────────────────────────────────────────────────────────────
const VAPID_KEY = "BPhFErB4BOBxd5Ta867XJk5Avscshg251YnSRckvrJr7VF4XMy6acqFXZ2sWRuKArppsQ32MfJrkbiC8pbK6qQk";

// ─────────────────────────────────────────────────────────────────────────────
// Regras Firestore necessárias (adicionar no Firebase Console → Firestore → Rules):
//
//   match /users/{userId}/notificationTokens/{tokenId} {
//     allow read, write: if true;
//   }
// ─────────────────────────────────────────────────────────────────────────────

// ── Service Worker ────────────────────────────────────────────────────────────

async function getFcmSwRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.error("[Push] serviceWorker não suportado neste browser.");
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    console.log("[Push] serviceWorkerRegistration:", registration);
    return registration;
  } catch (err) {
    console.error("[Push] erro ao registrar SW:", err);
    return null;
  }
}

// ── Permissão + Token ─────────────────────────────────────────────────────────

export async function requestNotificationPermission(
  userId: string
): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("[Push] Notification API não disponível.");
    return "denied";
  }

  let permission: NotificationPermission;
  try {
    permission = await Notification.requestPermission();
  } catch (err) {
    console.error("[Push] erro ao solicitar permissão:", err);
    return "denied";
  }

  console.log("[Push] permission:", permission);

  if (permission !== "granted") return permission;

  try {
    await activatePushForUser(userId);
  } catch (err) {
    console.error("[Push] erro ao ativar notificações:", err);
  }

  return permission;
}

async function activatePushForUser(userId: string): Promise<void> {
  console.log("[Push] userId:", userId);

  if (VAPID_KEY === "SUBSTITUA_PELA_VAPID_KEY_DO_FIREBASE_CONSOLE") {
    console.error(
      "[Push] VAPID_KEY não configurada. " +
      "Acesse Firebase Console → Project Settings → Cloud Messaging → " +
      "Certificados push da Web → Gerar par de chaves."
    );
    return;
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    console.error("[Push] Firebase Messaging não disponível neste browser.");
    return;
  }

  const registration = await getFcmSwRegistration();
  if (!registration) {
    console.error("[Push] Falha ao registrar service worker FCM.");
    return;
  }

  let token: string;
  try {
    token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
  } catch (err) {
    console.error("[Push] erro ao gerar token FCM:", err);
    return;
  }

  if (!token) {
    console.error("[Push] getToken retornou token vazio.");
    return;
  }

  console.log("[Push] token gerado:", token);
  await saveUserFcmToken(userId, token);
}

// ── Firestore ─────────────────────────────────────────────────────────────────

export async function saveUserFcmToken(userId: string, token: string): Promise<void> {
  const now = new Date().toISOString();
  const tokensRef = collection(db, "users", userId, "notificationTokens");

  // Deduplicação: ID derivado dos últimos 28 caracteres alfanuméricos do token
  const tokenDocId = `web_${token.replace(/[^a-zA-Z0-9]/g, "").slice(-28)}`;
  const tokenRef = doc(tokensRef, tokenDocId);

  try {
    const existing = await getDoc(tokenRef);

    await setDoc(tokenRef, {
      token,
      platform: "web",
      userAgent: navigator.userAgent,
      createdAt: existing.exists() ? (existing.data().createdAt ?? now) : now,
      updatedAt: now,
      active: true,
    });

    console.log("[Push] token salvo no Firestore");
    console.log("[Push] token salvo para usuário:", userId);
  } catch (err) {
    console.error("[Push] erro ao salvar token no Firestore:", err);
    console.error(
      "[Push] Verifique as regras do Firestore: " +
      "match /users/{userId}/notificationTokens/{tokenId} { allow read, write: if true; }"
    );
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

// ── Utilitários — referência para n8n ─────────────────────────────────────────

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
