import { getToken, deleteToken } from "firebase/messaging";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, getFirebaseMessaging, firebaseConfig } from "./firebase";

// ─────────────────────────────────────────────────────────────────────────────
// VAPID KEY — Firebase Console → Project Settings → Cloud Messaging
//             → Web Push certificates → Key pair
// ─────────────────────────────────────────────────────────────────────────────
const VAPID_KEY =
  "BPhFErB4BOBxd5Ta867XJk5Avscshg251YnSRckvrJr7VF4XMy6acqFXZ2sWRuKArppsQ32MfJrkbiC8pbK6qQk";

// ─────────────────────────────────────────────────────────────────────────────
// Regras Firestore necessárias:
//   match /users/{userId}/notificationTokens/{tokenId} { allow read, write: if true; }
//   match /pushTokens/{tokenId} { allow read, write: if true; }
// ─────────────────────────────────────────────────────────────────────────────

// ── Permissão + Token ─────────────────────────────────────────────────────────

export async function requestNotificationPermission(
  userId: string,
  userName = ""
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
  console.log("[Push] userId:", userId);

  if (permission !== "granted") return permission;

  try {
    await activatePushForUser(userId, userName);
  } catch (err) {
    console.error("[Push] erro ao ativar notificações:", err);
  }

  return permission;
}

async function activatePushForUser(userId: string, userName: string): Promise<void> {
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    console.error("[Push] Firebase Messaging não disponível neste browser.");
    return;
  }

  try {
    await deleteToken(messaging);
    console.log("[Push] token anterior deletado.");
  } catch (error) {
    console.warn("[Push] não foi possível deletar token anterior:", error);
  }

  let registration: ServiceWorkerRegistration;
  try {
    registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("[Push] serviceWorkerRegistration:", registration);
  } catch (err) {
    console.error("[Push] erro ao registrar service worker:", err);
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

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  console.log("[Push] projectId:", firebaseConfig.projectId);
  console.log("[Push] messagingSenderId:", firebaseConfig.messagingSenderId);
  console.log("[Push] isStandalone:", isStandalone);
  console.log("[Push] token novo:", token);

  await saveFcmToken(userId, userName, token, isStandalone);
}

// ── Firestore ─────────────────────────────────────────────────────────────────

function makeTokenId(token: string): string {
  return `web_${token.replace(/[^a-zA-Z0-9]/g, "").slice(-28)}`;
}

async function saveFcmToken(
  userId: string,
  userName: string,
  token: string,
  isStandalone: boolean
): Promise<void> {
  const now = new Date().toISOString();
  const tokenId = makeTokenId(token);

  const userTokenRef = doc(db, "users", userId, "notificationTokens", tokenId);
  const globalTokenRef = doc(db, "pushTokens", tokenId);

  const [existingUser, existingGlobal] = await Promise.all([
    getDoc(userTokenRef),
    getDoc(globalTokenRef),
  ]);

  const payload = {
    token,
    userId,
    name: userName,
    active: true,
    platform: "web",
    userAgent: navigator.userAgent,
    projectId: firebaseConfig.projectId,
    messagingSenderId: firebaseConfig.messagingSenderId,
    isStandalone,
    notificationPermission: Notification.permission,
    updatedAt: now,
  };

  await Promise.all([
    setDoc(userTokenRef, {
      ...payload,
      createdAt: existingUser.exists() ? (existingUser.data().createdAt ?? now) : now,
    }),
    setDoc(globalTokenRef, {
      ...payload,
      createdAt: existingGlobal.exists() ? (existingGlobal.data().createdAt ?? now) : now,
    }),
  ]);

  console.log("[Push] token salvo em users/{cpf}/notificationTokens");
  console.log("[Push] token salvo em pushTokens");
}

// Mantido como export para compatibilidade com chamadas externas
export async function saveUserFcmToken(
  userId: string,
  userName: string,
  token: string
): Promise<void> {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  await saveFcmToken(userId, userName, token, isStandalone);
}

export async function removeUserFcmToken(userId: string, token: string): Promise<void> {
  try {
    const now = new Date().toISOString();
    const tokenId = makeTokenId(token);
    const userTokenRef = doc(db, "users", userId, "notificationTokens", tokenId);
    const globalTokenRef = doc(db, "pushTokens", tokenId);

    const [existingUser, existingGlobal] = await Promise.all([
      getDoc(userTokenRef),
      getDoc(globalTokenRef),
    ]);

    await Promise.all([
      existingUser.exists()
        ? setDoc(userTokenRef, { ...existingUser.data(), active: false, updatedAt: now })
        : Promise.resolve(),
      existingGlobal.exists()
        ? setDoc(globalTokenRef, { ...existingGlobal.data(), active: false, updatedAt: now })
        : Promise.resolve(),
    ]);

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
