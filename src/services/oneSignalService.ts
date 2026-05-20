import OneSignal from "react-onesignal";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;

let initialized = false;

export async function initOneSignal(): Promise<void> {
  if (initialized) return;

  if (!ONESIGNAL_APP_ID) {
    console.error("[OneSignal] VITE_ONESIGNAL_APP_ID não configurado.");
    return;
  }

  await OneSignal.init({
    appId: ONESIGNAL_APP_ID,
    serviceWorkerPath: "/OneSignalSDKWorker.js",
    serviceWorkerParam: { scope: "/" },
    allowLocalhostAsSecureOrigin: true,
  });

  initialized = true;
  console.log("[OneSignal] inicializado");
}

export async function requestOneSignalPermission(
  userId: string,
  userName = ""
): Promise<{ permission: boolean; subscriptionId: string | undefined; optedIn: boolean | undefined }> {
  await initOneSignal();

  const permission = await OneSignal.Notifications.requestPermission();
  console.log("[OneSignal] permission:", permission);

  const userAgent = navigator.userAgent;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  const subscriptionId = OneSignal.User.PushSubscription.id;
  const optedIn = OneSignal.User.PushSubscription.optedIn;

  console.log("[OneSignal] subscriptionId:", subscriptionId);
  console.log("[OneSignal] optedIn:", optedIn);

  if (userId) {
    await OneSignal.login(userId);
  }

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
  }

  return { permission, subscriptionId, optedIn };
}

export async function getOneSignalStatus(): Promise<{
  permission: boolean;
  subscriptionId: string | undefined;
  optedIn: boolean | undefined;
}> {
  await initOneSignal();

  return {
    permission: OneSignal.Notifications.permission,
    subscriptionId: OneSignal.User.PushSubscription.id,
    optedIn: OneSignal.User.PushSubscription.optedIn,
  };
}
