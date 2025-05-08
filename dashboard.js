// Çevrimiçi kullanıcıları yükleme fonksiyonu
async function loadOnlineUsers() {
  const q = query(
    collection(db, "users"),
    where("status", "==", "online")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    let onlineCount = 0;
    const onlineUsersContainer = document.getElementById('online-users');
    onlineUsersContainer.innerHTML = '';

    snapshot.forEach((doc) => {
      if (doc.id !== auth.currentUser?.uid) {
        onlineCount++;
        const user = doc.data();
        const avatar = document.createElement('div');
        avatar.className = 'member-avatar';
        avatar.textContent = user.username?.charAt(0) || '?';
        avatar.title = user.username || 'Kullanıcı';
        onlineUsersContainer.appendChild(avatar);
      }
    });

    document.getElementById('online-count').textContent = `Çevrimiçi: ${onlineCount}`;
  });

  return unsubscribe;
}

// Mesaj gönderme fonksiyonu (düzeltilmiş)
async function sendMessage() {
  const messageInput = document.getElementById('message-input');
  const text = messageInput.value.trim();
  if (!text || !auth.currentUser) return;

  try {
    const messageData = {
      text: text,
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
      timestamp: serverTimestamp()
    };

    if (currentChat === 'general') {
      messageData.channel = 'general';
    } else {
      messageData.receiverId = currentChat;
      messageData.users = [auth.currentUser.uid, currentChat];
    }

    await addDoc(collection(db, "messages"), messageData);
    messageInput.value = '';
  } catch (error) {
    console.error("Mesaj gönderilemedi:", error);
    alert("Hata: " + error.message);
  }
}

// Event listener'ları yeniden bağlama
function setupEventListeners() {
  // Mesaj gönderme
  document.getElementById('send-btn').addEventListener('click', sendMessage);
  
  // Mesaj input'unda Enter tuşu
  document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Diğer butonlar
  document.getElementById('add-friend-btn').addEventListener('click', addFriend);
  document.getElementById('logout-btn').addEventListener('click', logout);
}
