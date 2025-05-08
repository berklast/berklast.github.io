import { 
  auth, 
  db, 
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs
} from './firebase.js';

// DOM Elements
const userAvatar = document.getElementById('user-avatar');
const username = document.getElementById('username');
const userTag = document.getElementById('user-tag');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const friendsList = document.getElementById('friends-list');
const friendsCount = document.getElementById('friends-count');
const onlineCount = document.getElementById('online-count');
const onlineUsers = document.getElementById('online-users');
const addFriendBtn = document.getElementById('add-friend-btn');
const friendRequestsBtn = document.getElementById('friend-requests-btn');
const friendRequestsBadge = document.getElementById('friend-requests-badge');
const requestsModal = document.getElementById('requests-modal');
const requestsClose = document.getElementById('requests-close');
const requestsList = document.getElementById('requests-list');
const logoutBtn = document.getElementById('logout-btn');
const settingsBtn = document.getElementById('settings-btn');

let currentUser = null;
let currentUserData = null;
let currentChat = 'general';
let onlineUsersList = [];

// Initialize the app
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  
  currentUser = user;
  await loadUserData();
  loadFriends();
  loadFriendRequests();
  loadOnlineUsers();
  loadMessages();
  setupEventListeners();
  
  // Update user status to online
  await updateDoc(doc(db, "users", currentUser.uid), {
    status: 'online',
    lastSeen: serverTimestamp()
  });
  
  // Update status when user closes the tab
  window.addEventListener('beforeunload', async () => {
    await updateDoc(doc(db, "users", currentUser.uid), {
      status: 'offline',
      lastSeen: serverTimestamp()
    };
  });
});

async function loadUserData() {
  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  if (userDoc.exists()) {
    currentUserData = userDoc.data();
    username.textContent = currentUserData.username;
    userTag.textContent = `#${currentUser.uid.substring(0, 4)}`;
    userAvatar.textContent = currentUserData.username.charAt(0).toUpperCase();
  }
}

function loadMessages() {
  let messagesQuery;
  
  if (currentChat === 'general') {
    messagesQuery = query(
      collection(db, "messages"), 
      where("channel", "==", "general")
    );
  } else {
    messagesQuery = query(
      collection(db, "messages"),
      where("users", "array-contains", currentUser.uid)
    );
  }

  onSnapshot(messagesQuery, (snapshot) => {
    chatMessages.innerHTML = '';
    snapshot.forEach((doc) => {
      const message = doc.data();
      if (currentChat === 'general' || 
          (message.users && message.users.includes(currentChat))) {
        displayMessage(message);
      }
    });
    scrollToBottom();
  });
}

function displayMessage(message) {
  const isCurrentUser = message.senderId === currentUser.uid;
  const isOnline = onlineUsersList.includes(message.senderId);
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.innerHTML = `
    <div class="message-avatar ${isCurrentUser ? 'you' : ''}">
      ${message.senderName?.charAt(0).toUpperCase() || '?'}
      ${!isCurrentUser && isOnline ? '<span class="online-dot"></span>' : ''}
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-author">${message.senderName || 'Bilinmeyen'}</span>
        <span class="message-time">
          ${message.timestamp?.toDate().toLocaleTimeString() || 'Şimdi'}
        </span>
      </div>
      <div class="message-text">${message.text}</div>
    </div>
  `;
  
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  try {
    const messageData = {
      text: text,
      senderId: currentUser.uid,
      senderName: currentUserData.username,
      timestamp: serverTimestamp()
    };

    if (currentChat === 'general') {
      messageData.channel = 'general';
    } else {
      messageData.users = [currentUser.uid, currentChat];
      messageData.receiverId = currentChat;
    }

    await addDoc(collection(db, "messages"), messageData);
    messageInput.value = '';
  } catch (error) {
    console.error("Mesaj gönderilemedi:", error);
    alert("Mesaj gönderilemedi: " + error.message);
  }
}

async function loadFriends() {
  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  if (!userDoc.exists()) return;

  const friends = userDoc.data().friends || [];
  friendsCount.textContent = friends.length;
  friendsList.innerHTML = '';

  if (friends.length === 0) {
    friendsList.innerHTML = '<div class="no-friends">Henüz arkadaş eklemediniz</div>';
    return;
  }

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
        <div class="friend-actions">
          <i class="fas fa-comment friend-action" title="Mesaj Gönder"></i>
          <i class="fas fa-user-minus friend-action" title="Arkadaşlıktan Çıkar"></i>
        </div>
      `;
      
      friendItem.addEventListener('click', (e) => {
        if (e.target.classList.contains('fa-comment')) {
          openPrivateChat(friendId, friend.username);
        } else if (e.target.classList.contains('fa-user-minus')) {
          removeFriend(friendId);
        }
      });
      
      friendsList.appendChild(friendItem);
    }
  });
}

async function loadFriendRequests() {
  const q = query(
    collection(db, "friendRequests"),
    where("to", "==", currentUser.uid),
    where("status", "==", "pending")
  );

  onSnapshot(q, (snapshot) => {
    const count = snapshot.size;
    friendRequestsBadge.textContent = count;
    friendRequestsBadge.style.display = count > 0 ? 'flex' : 'none';

    // Modal açıkken güncelle
    if (requestsModal.classList.contains('active')) {
      displayFriendRequests(snapshot);
    }
  });
}

function displayFriendRequests(snapshot) {
  requestsList.innerHTML = '';

  if (snapshot.empty) {
    requestsList.innerHTML = '<div class="no-requests">Bekleyen arkadaş isteği bulunmamaktadır</div>';
    return;
  }

  snapshot.forEach(async (doc) => {
    const request = doc.data();
    const fromUserDoc = await getDoc(doc(db, "users", request.from));
    
    if (fromUserDoc.exists()) {
      const fromUser = fromUserDoc.data();
      
      const requestItem = document.createElement('div');
      requestItem.className = 'request-item';
      requestItem.innerHTML = `
        <div class="request-avatar">
          ${fromUser.username.charAt(0).toUpperCase()}
        </div>
        <div class="request-info">
          <div class="request-name">${fromUser.username}</div>
          <div>Arkadaşlık isteği gönderdi</div>
        </div>
        <div class="request-actions">
          <button class="btn btn-primary accept-request" data-id="${doc.id}" data-from="${request.from}">Kabul Et</button>
          <button class="btn btn-danger reject-request" data-id="${doc.id}">Reddet</button>
        </div>
      `;
      
      requestsList.appendChild(requestItem);
    }
  });
}

async function addFriend() {
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
}

async function acceptFriendRequest(requestId, fromUserId) {
  try {
    // İsteği güncelle
    await updateDoc(doc(db, "friendRequests", requestId), {
      status: "accepted"
    });
    
    // Her iki kullanıcının da arkadaş listesine ekle
    await updateDoc(doc(db, "users", currentUser.uid), {
      friends: arrayUnion(fromUserId)
    });
    
    await updateDoc(doc(db, "users", fromUserId), {
      friends: arrayUnion(currentUser.uid)
    });
    
    alert("Arkadaşlık isteği kabul edildi!");
    loadFriends();
    loadFriendRequests();
  } catch (error) {
    console.error("İstek kabul edilirken hata:", error);
    alert("Hata: " + error.message);
  }
}

async function rejectFriendRequest(requestId) {
  try {
    await updateDoc(doc(db, "friendRequests", requestId), {
      status: "rejected"
    });
    alert("Arkadaşlık isteği reddedildi!");
    loadFriendRequests();
  } catch (error) {
    console.error("İstek reddedilirken hata:", error);
    alert("Hata: " + error.message);
  }
}

async function removeFriend(friendId) {
  if (!confirm("Bu arkadaşı listenizden çıkarmak istediğinize emin misiniz?")) return;
  
  try {
    await updateDoc(doc(db, "users", currentUser.uid), {
      friends: arrayRemove(friendId)
    });
    
    await updateDoc(doc(db, "users", friendId), {
      friends: arrayRemove(currentUser.uid)
    });
    
    alert("Arkadaşlıktan çıkarıldı!");
    loadFriends();
  } catch (error) {
    console.error("Arkadaş çıkarılırken hata:", error);
    alert("Hata: " + error.message);
  }
}

function openPrivateChat(userId, username) {
  currentChat = userId;
  document.getElementById('chat-title').textContent = username;
  document.getElementById('chat-description').textContent = "Özel sohbet";
  loadMessages();
}

function loadOnlineUsers() {
  const q = query(
    collection(db, "users"),
    where("status", "==", "online")
  );

  onSnapshot(q, (snapshot) => {
    onlineUsersList = [];
    onlineUsers.innerHTML = '';
    let onlineCountValue = 0;

    snapshot.forEach((doc) => {
      if (doc.id !== currentUser.uid) {
        onlineUsersList.push(doc.id);
        const user = doc.data();
        
        const avatar = document.createElement('div');
        avatar.className = 'member-avatar';
        avatar.title = user.username;
        avatar.textContent = user.username.charAt(0).toUpperCase();
        onlineUsers.appendChild(avatar);
        
        onlineCountValue++;
      }
    });

    onlineCount.textContent = `Çevrimiçi: ${onlineCountValue}`;
  });
}

function setupEventListeners() {
  // Mesaj gönderme
  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Textarea otomatik yüksekliği
  messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

  // Arkadaş ekleme
  addFriendBtn.addEventListener('click', addFriend);

  // Arkadaş istekleri modalı
  friendRequestsBtn.addEventListener('click', () => {
    const q = query(
      collection(db, "friendRequests"),
      where("to", "==", currentUser.uid),
      where("status", "==", "pending")
    );
    
    getDocs(q).then((snapshot) => {
      displayFriendRequests(snapshot);
      requestsModal.classList.add('active');
    });
  });

  requestsClose.addEventListener('click', () => {
    requestsModal.classList.remove('active');
  });

  // İstek kabul/reddetme
  requestsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('accept-request')) {
      const requestId = e.target.getAttribute('data-id');
      const fromUserId = e.target.getAttribute('data-from');
      acceptFriendRequest(requestId, fromUserId);
    } else if (e.target.classList.contains('reject-request')) {
      const requestId = e.target.getAttribute('data-id');
      rejectFriendRequest(requestId);
    }
  });

  // Genel sohbete dön
  document.getElementById('general-chat').addEventListener('click', () => {
    currentChat = 'general';
    document.getElementById('chat-title').textContent = '# Genel Sohbet';
    document.getElementById('chat-description').textContent = "Herkesin katılabileceği genel sohbet odası";
    loadMessages();
  });

  // Çıkış yap
  logoutBtn.addEventListener('click', async () => {
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        status: 'offline',
        lastSeen: serverTimestamp()
      });
      
      await signOut(auth);
      window.location.href = 'index.html';
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error);
      alert("Hata: " + error.message);
    }
  });
}
