import OneSignal from "react-onesignal";
import { collection, doc, getDocs, query, setDoc, where, writeBatch } from "firebase/firestore";
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
      active: true,
      platform: "web",
      provider: "onesignal",
      userAgent,
      isStandalone,
      permission,
      createdAt: now,
      updatedAt: now,
    };

    // Desativa todas as subscriptions anteriores do mesmo usuário
    const deactivateAt = new Date().toISOString();
    const globalQuery = query(
      collection(db, "oneSignalSubscriptions"),
      where("userId", "==", userId),
      where("provider", "==", "onesignal")
    );
    const globalSnap = await getDocs(globalQuery);
    const batch = writeBatch(db);
    globalSnap.forEach((snap) => {
      if (snap.id !== subscriptionId) {
        batch.update(snap.ref, { active: false, updatedAt: deactivateAt });
      }
    });

    const userQuery = query(
      collection(db, "users", userId, "oneSignalSubscriptions"),
      where("provider", "==", "onesignal")
    );
    const userSnap = await getDocs(userQuery);
    userSnap.forEach((snap) => {
      if (snap.id !== subscriptionId) {
        batch.update(snap.ref, { active: false, updatedAt: deactivateAt });
      }
    });

    await batch.commit();

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
