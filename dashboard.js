document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.includes('dashboard.html')) return;

  // DOM Elements
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const logoutBtn = document.getElementById('logout-btn');
  const friendsContainer = document.getElementById('friends-container');
  const chatMessages = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const friendSearch = document.getElementById('friend-search');
  const requestsBadge = document.getElementById('requests-badge');
  const profileForm = document.getElementById('profile-form');
  const passwordForm = document.getElementById('password-form');
  const avatarUpload = document.getElementById('avatar-upload');
  const settingsAvatar = document.getElementById('settings-avatar');
  const userAvatar = document.getElementById('user-avatar');
  const currentUser = auth.currentUser;

  // Tab geçişleri
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Tüm aktif sınıfları kaldır
      navItems.forEach(i => i.classList.remove('active'));
      tabContents.forEach(tab => tab.classList.remove('active'));
      
      // Tıklanan öğeye aktif sınıfı ekle
      item.classList.add('active');
      
      // İlgili tabı göster
      const tabId = item.getAttribute('data-tab') + '-tab';
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Çıkış yap butonu
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Arkadaş listesini yükle
  function loadFriends() {
    if (!currentUser) return;

    db.collection('users').where('email', '!=', currentUser.email).get()
      .then(querySnapshot => {
        friendsContainer.innerHTML = '';
        querySnapshot.forEach(doc => {
          const user = doc.data();
          const friendItem = document.createElement('div');
          friendItem.className = 'friend-item';
          friendItem.innerHTML = `
            <img src="${user.photoURL || 'https://via.placeholder.com/40'}" alt="Profil" class="friend-avatar">
            <div class="friend-info">
              <div class="friend-name">${user.name}</div>
              <div class="friend-status">Çevrimdışı</div>
            </div>
          `;
          friendItem.addEventListener('click', () => startChat(user));
          friendsContainer.appendChild(friendItem);
        });
      });
  }

  // Sohbet başlat
  function startChat(user) {
    document.getElementById('chat-username').textContent = user.name;
    document.getElementById('chat-avatar').src = user.photoURL || 'https://via.placeholder.com/40';
    document.getElementById('chat-status').textContent = 'Çevrimiçi';
    
    // Mesajları yükle
    loadMessages(user);
  }

  // Mesajları yükle
  function loadMessages(user) {
    if (!currentUser) return;

    const chatId = [currentUser.uid, user.uid].sort().join('_');
    
    db.collection('chats').doc(chatId).collection('messages')
      .orderBy('timestamp')
      .onSnapshot(snapshot => {
        chatMessages.innerHTML = '';
        snapshot.forEach(doc => {
          const message = doc.data();
          displayMessage(message);
        });
        
        // En son mesaja scroll
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
  }

  // Mesaj göster
  function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    const isCurrentUser = message.senderId === currentUser.uid;
    
    messageDiv.innerHTML = `
      <img src="${message.senderPhoto || 'https://via.placeholder.com/40'}" alt="Profil" class="message-avatar">
      <div class="message-content">
        <div class="message-header">
          <span class="message-sender">${isCurrentUser ? 'Sen' : message.senderName}</span>
          <span class="message-time">${formatTime(message.timestamp)}</span>
        </div>
        <div class="message-text">${message.text}</div>
      </div>
    `;
    
    chatMessages.appendChild(messageDiv);
  }

  // Mesaj gönder
  function sendMessage(receiver) {
    const text = messageInput.value.trim();
    if (!text || !currentUser) return;

    const chatId = [currentUser.uid, receiver.uid].sort().join('_');
    
    db.collection('chats').doc(chatId).collection('messages').add({
      text: text,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'Anonim',
      senderPhoto: currentUser.photoURL || null,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      messageInput.value = '';
    })
    .catch(error => {
      console.error('Mesaj gönderilemedi:', error);
    });
  }

  // Zaman formatı
  function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Profil fotoğrafı güncelleme
  avatarUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onload = (event) => {
        settingsAvatar.src = event.target.result;
        userAvatar.src = event.target.result;
        
        // Firebase'e yükle
        const storageRef = storage.ref(`profile_photos/${currentUser.uid}`);
        storageRef.put(file).then(() => {
          storageRef.getDownloadURL().then(url => {
            db.collection('users').doc(currentUser.uid).update({
              photoURL: url
            });
          });
        });
      };
      reader.readAsDataURL(file);
    }
  });

  // Profil bilgilerini güncelle
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newUsername = document.getElementById('settings-username').value;
    
    if (currentUser && newUsername) {
      db.collection('users').doc(currentUser.uid).update({
        name: newUsername
      })
      .then(() => {
        document.getElementById('username').textContent = newUsername;
        alert('Profil bilgileri güncellendi!');
      })
      .catch(error => {
        console.error('Profil güncellenemedi:', error);
        alert('Bir hata oluştu: ' + error.message);
      });
    }
  });

  // Şifre değiştir
  passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
      alert('Yeni şifreler uyuşmuyor!');
      return;
    }
    
    if (currentUser) {
      const credential = firebase.auth.EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      
      currentUser.reauthenticateWithCredential(credential)
        .then(() => {
          currentUser.updatePassword(newPassword)
            .then(() => {
              alert('Şifreniz başarıyla değiştirildi!');
              passwordForm.reset();
            })
            .catch(error => {
              console.error('Şifre güncellenemedi:', error);
              alert('Bir hata oluştu: ' + error.message);
            });
        })
        .catch(error => {
          console.error('Doğrulama başarısız:', error);
          alert('Mevcut şifreniz yanlış!');
        });
    }
  });

  // Uygulama başlat
  loadFriends();
});
