// dashboard.js
import { 
  auth, 
  db, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from './firebase.js';

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const friendsList = document.getElementById('friends-list');
const addFriendBtn = document.getElementById('add-friend-btn');
const friendRequestsBtn = document.getElementById('friend-requests-btn');

let currentUser = null;
let currentChatUserId = null;

// Kullanıcı oturumunu kontrol et
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  
  currentUser = user;
  loadUserData();
  loadFriends();
  loadMessages();
});

// Mesajları yükle
function loadMessages() {
  const messagesQuery = query(
    collection(db, "messages"),
    where("users", "array-contains", currentUser.uid)
  );
  
  onSnapshot(messagesQuery, (snapshot) => {
    chatMessages.innerHTML = '';
    snapshot.forEach((doc) => {
      const message = doc.data();
      displayMessage(message);
    });
  });
}

// Mesaj göster
function displayMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  
  messageDiv.innerHTML = `
    <div class="message-avatar ${message.senderId === currentUser.uid ? 'you' : ''}">
      ${message.senderName.charAt(0).toUpperCase()}
      ${message.senderId !== currentUser.uid && message.isOnline ? 
        '<span class="online-dot"></span>' : ''}
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-author">${message.senderName}</span>
        <span class="message-time">${new Date(message.timestamp?.toDate()).toLocaleTimeString()}</span>
      </div>
      <div class="message-text">${message.text}</div>
    </div>
  `;
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Mesaj gönder
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentChatUserId) return;

  try {
    await addDoc(collection(db, "messages"), {
      text: text,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email.split('@')[0],
      receiverId: currentChatUserId,
      users: [currentUser.uid, currentChatUserId],
      timestamp: serverTimestamp(),
      isRead: false
    });
    
    messageInput.value = '';
  } catch (error) {
    console.error("Mesaj gönderilemedi:", error);
  }
}

// Arkadaşları yükle
async function loadFriends() {
  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  if (!userDoc.exists()) return;

  const friends = userDoc.data().friends || [];
  friendsList.innerHTML = '';

  friends.forEach(async friendId => {
    const friendDoc = await getDoc(doc(db, "users", friendId));
    if (friendDoc.exists()) {
      const friend = friendDoc.data();
      const isOnline = friend.status === 'online';
      
      const friendItem = document.createElement('div');
      friendItem.className = 'friend-item';
      friendItem.innerHTML = `
        <div class="friend-avatar">
          ${friend.username.charAt(0).toUpperCase()}
          ${isOnline ? '<span class="online-dot"></span>' : ''}
        </div>
        <div class="friend-info">
          <div class="friend-name">${friend.username}</div>
          <div class="friend-status">${isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</div>
        </div>
      `;
      
      friendItem.addEventListener('click', () => {
        currentChatUserId = friendId;
        loadChat(friendId);
      });
      
      friendsList.appendChild(friendItem);
    }
  });
}

// Arkadaş ekle
addFriendBtn.addEventListener('click', async () => {
  const email = prompt("Arkadaşınızın e-posta adresini girin:");
  if (!email) return;

  try {
    // Kullanıcıyı bul
    const usersQuery = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(usersQuery);
    
    if (querySnapshot.empty) {
      alert("Bu e-posta ile kayıtlı kullanıcı bulunamadı!");
      return;
    }
    
    const friendId = querySnapshot.docs[0].id;
    if (friendId === currentUser.uid) {
      alert("Kendinize arkadaş isteği gönderemezsiniz!");
      return;
    }
    
    // Arkadaş isteği gönder
    await addDoc(collection(db, "friendRequests"), {
      from: currentUser.uid,
      to: friendId,
      status: "pending",
      createdAt: serverTimestamp()
    });
    
    alert("Arkadaş isteği gönderildi!");
  } catch (error) {
    console.error("Arkadaş eklenirken hata:", error);
    alert("Hata: " + error.message);
  }
});

// CSS Eklemeleri (style tag'i içinde)
/*
.online-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #3BA55C;
  border-radius: 50%;
  border: 2px solid var(--dark);
}
*/
