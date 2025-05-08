// Firebase bağlantı bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyCxHwmk04MmfvpL53N58WcUwZ7KQjCy5SA",
  authDomain: "mesajpro-e97fc.firebaseapp.com",
  projectId: "mesajpro-e97fc",
  storageBucket: "mesajpro-e97fc.appspot.com",
  messagingSenderId: "1011356406404",
  appId: "1:1011356406404:web:ba80c03aa0c177eb3768d1",
  measurementId: "G-LV2RYRMVVL"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Firebase servislerini tanımla
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Firestore ayarları
db.settings({
  timestampsInSnapshots: true,
  merge: true
});

// Auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    // Kullanıcı giriş yapmışsa dashboard'a yönlendir
    if (!window.location.pathname.includes('dashboard.html')) {
      window.location.href = 'dashboard.html';
    }
  } else {
    // Kullanıcı giriş yapmamışsa auth sayfasına yönlendir
    if (!window.location.pathname.includes('auth.html') && 
        !window.location.pathname.includes('index.html')) {
      window.location.href = 'index.html';
    }
  }
});
