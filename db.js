// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyDH5GBWQNoZv7LZZ2MbFjh-twI1jZuYqK0",
  authDomain: "newdc-d6404.firebaseapp.com",
  projectId: "newdc-d6404",
  storageBucket: "newdc-d6404.appspot.com",
  messagingSenderId: "101292652984",
  appId: "1:101292652984:web:59d6b49b400572bec1774d",
  measurementId: "G-NV86JDVJ27"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Firebase servisleri
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();

// Firestore ayarları
db.settings({ timestampsInSnapshots: true });

// Auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    // Kullanıcı giriş yaptığında dashboard'a yönlendir
    if (!window.location.pathname.includes('dashboard.html')) {
      window.location.href = 'dashboard.html';
    }
    
    // Analiz verisi gönder
    analytics.logEvent('login');
    
    // Kullanıcı bilgilerini güncelle
    updateUserInfo(user);
  } else {
    // Kullanıcı çıkış yaptığında auth sayfasına yönlendir
    if (!window.location.pathname.includes('auth.html') && 
        !window.location.pathname.includes('index.html')) {
      window.location.href = 'auth.html';
    }
  }
});

// Kullanıcı bilgilerini güncelle
function updateUserInfo(user) {
  db.collection('users').doc(user.uid).get()
    .then(doc => {
      if (doc.exists) {
        const userData = doc.data();
        if (document.getElementById('username')) {
          document.getElementById('username').textContent = userData.name;
        }
        if (document.getElementById('user-avatar')) {
          document.getElementById('user-avatar').src = userData.photoURL || 'https://via.placeholder.com/40';
        }
      }
    });
}

// Çıkış yap
function logout() {
  auth.signOut()
    .then(() => {
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.error('Çıkış yaparken hata:', error);
    });
}

// Global erişim için
window.logout = logout;
