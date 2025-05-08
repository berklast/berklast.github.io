import { 
  auth, 
  db, 
  signOut,
  onAuthStateChanged,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from './firebase.js';

// UI Elementleri
const chatArea = document.getElementById('chat-area');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const logoutBtn = document.getElementById('logout-btn');
const userAvatar = document.getElementById('user-avatar');
const usernameElement = document.getElementById('username');

// Mesaj Gönderme Fonksiyonu
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message || !auth.currentUser) return;

  try {
    await addDoc(collection(db, "messages"), {
      text: message,
      sender: auth.currentUser.uid,
      timestamp: serverTimestamp()
    });
    messageInput.value = '';
  } catch (error) {
    console.error("Mesaj gönderilemedi:", error);
    alert("Mesaj gönderilemedi: " + error.message);
  }
}

// Mesajları Dinleme
function setupMessages() {
  const q = query(collection(db, "messages"), orderBy("timestamp"));
  
  onSnapshot(q, (snapshot) => {
    chatArea.innerHTML = '';
    snapshot.forEach((doc) => {
      const message = doc.data();
      const messageElement = document.createElement('div');
      messageElement.className = 'message';
      messageElement.textContent = message.text;
      chatArea.appendChild(messageElement);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
  });
}

// Kullanıcı Bilgilerini Yükle
function loadUser(user) {
  usernameElement.textContent = user.email.split('@')[0];
  userAvatar.textContent = user.email.charAt(0).toUpperCase();
}

// Çıkış Yap
logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Çıkış yapılamadı:", error);
  }
});

// Enter tuşu ile mesaj gönderme
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Gönder butonu
sendBtn.addEventListener('click', sendMessage);

// Oturum Kontrolü
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUser(user);
    setupMessages();
  } else {
    window.location.href = "index.html";
  }
});
