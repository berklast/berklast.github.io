import { auth, signOut, onAuthStateChanged } from './firebase.js';

// Çıkış Yap Butonu
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = "/login.html";
  } catch (error) {
    console.error("Çıkış yapılamadı:", error);
  }
});

// Kullanıcı Bilgilerini Yükle
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('username').textContent = user.email.split('@')[0];
  } else {
    window.location.href = "/login.html";
  }
});

// Mesaj Gönderme Fonksiyonu
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  if (message) {
    // Mesaj gönderme işlemleri
    input.value = '';
  }
}
