// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.4.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.4.1/firebase-messaging.js');
if (firebase.messaging.isSupported()) {
    // Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
    firebase.initializeApp({
        apiKey: 'AIzaSyCBkLa8AGLQphOL9plilhBktsCdQMQB0zk',
        authDomain: 'fir-sportsbook-by-vivarob.firebaseapp.com',
        databaseURL: 'https://fir-sportsbook-by-vivarob.firebaseio.com',
        projectId: 'firebase-sportsbook-by-vivarob',
        storageBucket: 'firebase-sportsbook-by-vivarob.appspot.com',
        messagingSenderId: '811040901579',
        appId: '1:811040901579:web:36fc9529fc7662c235ce4e',
        measurementId: 'G-XZETCM9B84'
    });

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
    const messaging = firebase.messaging();
}

