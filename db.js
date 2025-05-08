// Firebase yapılandırma bilgileri
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

// Firebase servisleri
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Firestore ayarları
db.settings({ timestampsInSnapshots: true });

// Auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    // Kullanıcı giriş yaptığında dashboard'a yönlendir
    if (!window.location.pathname.includes('dashboard.html')) {
      window.location.href = 'dashboard.html';
    }
    
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
          document.getElementById('settings-username').value = userData.name;
        }
        if (document.getElementById('user-avatar')) {
          const avatarUrl = userData.photoURL || 'https://via.placeholder.com/40';
          document.getElementById('user-avatar').src = avatarUrl;
          document.getElementById('settings-avatar').src = avatarUrl;
        }
        if (document.getElementById('settings-email')) {
          document.getElementById('settings-email').value = user.email;
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
