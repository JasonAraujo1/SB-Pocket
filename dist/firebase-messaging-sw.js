importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA7HR8B7J_DKedpSOXDKzGCfJZDMKr_C8k",
  authDomain: "sb-pocket.firebaseapp.com",
  projectId: "sb-pocket",
  storageBucket: "sb-pocket.firebasestorage.app",
  messagingSenderId: "1029945706494",
  appId: "1:1029945706494:web:400d41cf946b72682da2af",
});

const messaging = firebase.messaging();

// Notificações em background (app fechado ou em outra aba)
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "SB Pocket";
  const body = payload.notification?.body ?? "";
  const icon = payload.data?.icon ?? "/icons/icon-192.png";

  self.registration.showNotification(title, {
    body,
    icon,
    badge: "/icons/icon-192.png",
    data: payload.data ?? {},
    requireInteraction: false,
  });
});

// Abrir o app ao clicar na notificação
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/home";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});
