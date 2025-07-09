// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBMU21_f6W0BNtpmXh94bf7nuwTYlGK9l0",
    authDomain: "daftar-push-notif.firebaseapp.com",
    projectId: "daftar-push-notif",
    messagingSenderId: "997351259970",
    appId: "1:997351259970:web:4ff865b1c9a859d498d2db",
    measurementId: "G-76BPR5ZJZ0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
