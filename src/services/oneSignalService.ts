import OneSignal from "react-onesignal";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;

let initialized = false;

export async function initOneSignal(): Promise<boolean> {
  if (initialized) return true;

  if (!ONESIGNAL_APP_ID) {
    console.error("[OneSignal] VITE_ONESIGNAL_APP_ID não configurado.");
    return false;
  }

  await OneSignal.init({
    appId: ONESIGNAL_APP_ID,
    serviceWorkerPath: "/OneSignalSDKWorker.js",
    serviceWorkerParam: { scope: "/" },
    allowLocalhostAsSecureOrigin: true,
  });

  initialized = true;
  console.log("[OneSignal] inicializado");
  return true;
}

export async function requestOneSignalPermission(
  userId: string,
  userName = ""
): Promise<{ permission: boolean; subscriptionId: string | undefined | null; optedIn: boolean | undefined }> {
  console.log("[OneSignal] usando fluxo principal de notificações");

  const ok = await initOneSignal();
  if (!ok) {
    return { permission: false, subscriptionId: null, optedIn: false };
  }

  const permission = await OneSignal.Notifications.requestPermission();
  console.log("[OneSignal] permission:", permission);

  if (userId) {
    await OneSignal.login(userId);
  }

  // Aguarda propagação do login antes de ler o subscriptionId
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const subscriptionId = OneSignal.User.PushSubscription.id;
  const optedIn = OneSignal.User.PushSubscription.optedIn;
  const userAgent = navigator.userAgent;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  console.log("[OneSignal] subscriptionId:", subscriptionId);
  console.log("[OneSignal] optedIn:", optedIn);
  console.log("[OneSignal] isStandalone:", isStandalone);

  const now = new Date().toISOString();

  if (subscriptionId) {
    const payload = {
      subscriptionId,
      userId,
      name: userName,
      active: optedIn === true,
      platform: "web",
      provider: "onesignal",
      userAgent,
      isStandalone,
      permission,
      createdAt: now,
      updatedAt: now,
    };

    await Promise.all([
      setDoc(doc(db, "oneSignalSubscriptions", subscriptionId), payload, { merge: true }),
      setDoc(doc(db, "users", userId, "oneSignalSubscriptions", subscriptionId), payload, { merge: true }),
    ]);

    console.log("[OneSignal] subscription salva no Firestore");
  } else {
    console.warn("[OneSignal] subscriptionId ainda não disponível após permissão.");
  }

  return { permission, subscriptionId, optedIn };
}

export async function getOneSignalStatus(): Promise<{
  permission: boolean;
  subscriptionId: string | undefined;
  optedIn: boolean | undefined;
}> {
  const ok = await initOneSignal();
  if (!ok) {
    return { permission: false, subscriptionId: undefined, optedIn: false };
  }

  return {
    permission: OneSignal.Notifications.permission,
    subscriptionId: OneSignal.User.PushSubscription.id,
    optedIn: OneSignal.User.PushSubscription.optedIn,
  };
}
