// Firebase push notifications service worker
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBC0QGKpBD_5LjTS6pTiURG28jgyGDL9AFWdN38WG", // from .env
  authDomain: "gen-lang-client.firebaseapp.com",
  projectId: "gen-lang-client",
  storageBucket: "gen-lang-client.firebasestorage.app",
  messagingSenderId: "804854369368",
  appId: "1:804854369368:web:81e5e7d3904a8c3d301e57"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
