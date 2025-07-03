// script.js
// Firebase servislerini ve yardımcı sınıfları global window nesnesinden alıyoruz.
// Bunlar index.html içindeki <script type="module"> bloğunda tanımlandı.
const auth = window.auth;
const db = window.db;
const GoogleAuthProvider = window.GoogleAuthProvider;
const EmailAuthProvider = window.EmailAuthProvider;
const FieldValue = window.FieldValue;

// ----- HTML Elementlerini Seçme -----

// Auth Bölümü
const authSection = document.getElementById('auth-section');
const showLoginTabBtn = document.getElementById('show-login-tab');
const showRegisterTabBtn = document.getElementById('show-register-tab');
const loginTabContent = document.getElementById('login-tab-content');
const registerTabContent = document.getElementById('register-tab-content');

const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const googleLoginBtn = document.getElementById('google-login-btn');
const loginError = document.getElementById('login-error');
const forgotPasswordBtn = document.getElementById('forgot-password-btn');

const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerBtn = document.getElementById('register-btn'); // ID çakışmaması için burada tekrar tanımlandı
const registerMessage = document.getElementById('register-message'); // Yeni eklendi

// Uygulama Bölümü
const appSection = document.getElementById('app-section');
const displayNameSpan = document.getElementById('display-name');
const userEmailSpan = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const mainChatBtn = document.getElementById('main-chat-btn');
const friendsListBtn = document.getElementById('friends-list-btn');
const settingsBtn = document.getElementById('settings-btn');

// Ana Sohbet Bölümü
const mainChatArea = document.getElementById('main-chat-area');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');

// Arkadaş Listesi Bölümü
const friendsSection = document.getElementById('friends-section');
const addFriendEmailInput = document.getElementById('add-friend-email');
const addFriendBtn = document.getElementById('add-friend-btn');
const addFriendStatus = document.getElementById('add-friend-status');
const friendsListUL = document.getElementById('friends-list');

// Özel Sohbet Modalı
const privateChatModal = document.getElementById('private-chat-modal');
const closePrivateChatBtn = document.getElementById('close-private-chat');
const privateChatTitle = document.getElementById('private-chat-title');
const privateMessagesContainer = document.getElementById('private-messages-container');
const privateMessageInput = document.getElementById('private-message-input');
const sendPrivateMessageBtn = document.getElementById('send-private-message-btn');

// Ayarlar Bölümü
const settingsSection = document.getElementById('settings-section');
const newDisplayNameInput = document.getElementById('new-display-name');
const updateDisplayNameBtn = document.getElementById('update-display-name-btn');
const displayNameStatus = document.getElementById('display-name-status');

const emailCurrentPasswordInput = document.getElementById('email-current-password'); // E-posta değişimi için mevcut şifre
const newEmailInput = document.getElementById('new-email');
const updateEmailBtn = document.getElementById('update-email-btn');
const emailStatus = document.getElementById('email-status');

const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const updatePasswordBtn = document.getElementById('update-password-btn');
const passwordStatus = document.getElementById('password-status');

let currentUser = null; // Giriş yapan kullanıcı
let currentPrivateChatRecipientId = null; // Özel sohbet yapılan kişinin ID'si
let unsubscribePrivateChat = null; // Özel sohbet dinleyicisini iptal etmek için
let unsubscribePublicMessages = null; // Genel sohbet dinleyicisini iptal etmek için
let unsubscribeFriends = null; // Arkadaş listesi dinleyicisini iptal etmek için


// ----- Yardımcı Fonksiyonlar -----

function showSection(sectionId) {
    // Tüm ana bölümleri gizle
    authSection.classList.add('hidden');
    appSection.classList.add('hidden');
    privateChatModal.classList.add('hidden');

    // İstenen bölümü göster
    document.getElementById(sectionId).classList.remove('hidden');

    // Eğer ana uygulama alanı gösteriliyorsa, varsayılan olarak genel sohbeti göster
    if (sectionId === 'app-section') {
        showAppContent('main-chat-area');
        // Navigasyon butonlarının aktif durumunu güncelle
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        mainChatBtn.classList.add('active');
    }
}

function showAppContent(contentId) {
    // Tüm uygulama içeriğini gizle
    mainChatArea.classList.add('hidden');
    friendsSection.classList.add('hidden');
    settingsSection.classList.add('hidden');

    // İstenen uygulama içeriğini göster
    document.getElementById(contentId).classList.remove('hidden');

    // Navigasyon butonlarının aktif durumunu güncelle
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if (contentId === 'main-chat-area') {
        mainChatBtn.classList.add('active');
    } else if (contentId === 'friends-section') {
        friendsListBtn.classList.add('active');
    } else if (contentId === 'settings-section') {
        settingsBtn.classList.add('active');
    }
}

function displayMessage(message, container, isPrivate = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    const senderDisplayName = message.senderName || 'Bilinmeyen';
    const currentUserId = auth.currentUser ? auth.currentUser.uid : null;

    if (message.senderId === currentUserId) {
        messageElement.classList.add('sent');
    } else {
        messageElement.classList.add('received');
    }

    // Kendi mesajımızda gönderen ismini göstermeyelim
    if (message.senderId !== currentUserId) {
        messageElement.innerHTML = `<div class="message-sender">${senderDisplayName}</div>`;
    }
    messageElement.innerHTML += `<div class="message-content">${message.content}</div>`;
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight; // Otomatik aşağı kaydır
}

function showMessage(element, text, isError = true) {
    element.textContent = text;
    element.classList.remove('error-message', 'success-message');
    if (isError) {
        element.classList.add('error-message');
    } else {
        element.classList.add('success-message');
    }
    element.classList.remove('hidden');
    setTimeout(() => {
        element.textContent = '';
        element.classList.add('hidden');
    }, 5000);
}

// ----- Firebase Authentication İşlemleri -----

// Kullanıcı durumu değiştiğinde
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        displayNameSpan.textContent = user.displayName || user.email.split('@')[0];
        userEmailSpan.textContent = user.email;
        showSection('app-section');

        // E-posta doğrulaması kontrolü
        if (!user.emailVerified) {
            alert('E-posta adresiniz doğrulanmamış. Sohbet etmeye başlamadan önce lütfen e-postanıza gönderilen doğrulama linkine tıklayın.');
            // Burada kullanıcıya uyarı gösteren bir UI elemanı da ekleyebilirsiniz.
        }

        // Ana sohbet mesajlarını dinlemeye başla
        listenForPublicMessages();
        // Arkadaş listesini ve durumunu dinlemeye başla
        listenForFriends();
        // Firestore'da kullanıcının public profilini oluştur/güncelle
        createUserProfile(user);

    } else {
        currentUser = null;
        showSection('auth-section');
        // Tüm dinleyicileri durdur
        if (unsubscribePublicMessages) unsubscribePublicMessages();
        if (unsubscribeFriends) unsubscribeFriends();
        if (unsubscribePrivateChat) unsubscribePrivateChat();
        messagesContainer.innerHTML = '';
        friendsListUL.innerHTML = '';
        loginError.textContent = '';
        registerMessage.textContent = '';
    }
});

// Kayıt Ol
registerBtn.addEventListener('click', async () => {
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value.trim();
    registerMessage.textContent = '';

    if (!email || !password) {
        showMessage(registerMessage, 'E-posta ve şifre boş bırakılamaz.', true);
        return;
    }
    if (password.length < 6) {
        showMessage(registerMessage, 'Şifre en az 6 karakter olmalıdır.', true);
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        // Kayıt sonrası kullanıcıya varsayılan bir isim ata (e-postanın ilk kısmı)
        await userCredential.user.updateProfile({ displayName: email.split('@')[0] });
        await userCredential.user.sendEmailVerification(); // E-posta doğrulama linki gönder

        showMessage(registerMessage, 'Kayıt başarılı! E-postanıza doğrulama linki gönderildi. Lütfen e-postanızı kontrol edin.', false);
        registerEmailInput.value = '';
        registerPasswordInput.value = '';
        // Başarılı kayıttan sonra giriş sekmesine geç
        showTab('login');
    } catch (error) {
        showMessage(registerMessage, error.message, true);
    }
});

// Giriş Yap
loginBtn.addEventListener('click', async () => {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();
    loginError.textContent = '';

    try {
        await auth.signInWithEmailAndPassword(email, password);
        loginError.textContent = ''; // Başarılı giriş
        loginEmailInput.value = '';
        loginPasswordInput.value = '';
    } catch (error) {
        showMessage(loginError, error.message, true);
    }
});

// Google ile Giriş Yap
googleLoginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider(); // Global olarak tanımlanan GoogleAuthProvider kullanıldı
    loginError.textContent = '';
    try {
        await auth.signInWithPopup(provider);
        loginError.textContent = '';
    } catch (error) {
        showMessage(loginError, error.message, true);
    }
});

// Şifremi Unuttum
forgotPasswordBtn.addEventListener('click', async () => {
    const email = loginEmailInput.value.trim(); // Giriş e-posta alanındaki değeri kullan
    loginError.textContent = '';

    if (!email) {
        showMessage(loginError, 'Şifresini sıfırlamak istediğiniz e-postayı girin.', true);
        return;
    }

    try {
        await auth.sendPasswordResetEmail(email);
        showMessage(loginError, 'Şifre sıfırlama linki e-postanıza gönderildi.', false);
    } catch (error) {
        showMessage(loginError, error.message, true);
    }
});

// Çıkış Yap
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Çıkış yaparken hata:', error);
    }
});

// Firestore'da Kullanıcı Profilini Oluştur/Güncelle
async function createUserProfile(user) {
    const userRef = db.collection('users').doc(user.uid);
    const doc = await userRef.get();
    if (!doc.exists) {
        await userRef.set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            friends: [], // Başlangıçta arkadaş listesi boş
            createdAt: FieldValue.serverTimestamp() // Global olarak tanımlanan FieldValue kullanıldı
        });
    } else {
        // Kullanıcı bilgileri güncellenmiş olabilir
        await userRef.update({
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            lastLoginAt: FieldValue.serverTimestamp() // Global olarak tanımlanan FieldValue kullanıldı
        });
    }
    // Ekran adını güncelle
    displayNameSpan.textContent = user.displayName || user.email.split('@')[0];
}

// ----- Genel Sohbet İşlemleri -----

function listenForPublicMessages() {
    if (unsubscribePublicMessages) {
        unsubscribePublicMessages(); // Önceki dinleyiciyi iptal et
    }

    unsubscribePublicMessages = db.collection('messages')
        .orderBy('timestamp', 'asc') // Zamana göre sırala
        .limit(100) // Son 100 mesajı göster
        .onSnapshot(snapshot => {
            messagesContainer.innerHTML = ''; // Temizle
            snapshot.forEach(doc => {
                displayMessage(doc.data(), messagesContainer);
            });
        }, error => {
            console.error('Genel mesajları dinlerken hata:', error);
        });
}

sendMessageBtn.addEventListener('click', async () => {
    const content = messageInput.value.trim();
    if (content && currentUser) {
        // E-posta doğrulanmış mı kontrol et
        if (!currentUser.emailVerified) {
            alert('Mesaj gönderebilmek için lütfen e-posta adresinizi doğrulayın. Doğrulama linki e-postanıza gönderildi.');
            return;
        }

        try {
            await db.collection('messages').add({
                senderId: currentUser.uid,
                senderName: currentUser.displayName || currentUser.email.split('@')[0],
                content: content,
                timestamp: FieldValue.serverTimestamp() // Global olarak tanımlanan FieldValue kullanıldı
            });
            messageInput.value = '';
        } catch (error) {
            console.error('Mesaj gönderirken hata:', error);
        }
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessageBtn.click();
    }
});

// ----- Arkadaşlık İşlemleri -----

friendsListBtn.addEventListener('click', () => {
    showAppContent('friends-section');
    loadFriendsList(); // Arkadaş listesini her açtığında yeniden yükle
});

async function loadFriendsList() {
    if (!currentUser) return;

    if (unsubscribeFriends) {
        unsubscribeFriends(); // Önceki dinleyiciyi iptal et
    }

    unsubscribeFriends = db.collection('users').doc(currentUser.uid)
        .onSnapshot(async doc => {
            friendsListUL.innerHTML = ''; // Listeyi temizle
            if (doc.exists) {
                const userData = doc.data();
                const friendIds = userData.friends || [];

                if (friendIds.length === 0) {
                    friendsListUL.innerHTML = '<li style="text-align: center; color: #666; padding: 20px;">Henüz arkadaşınız yok. Arkadaş ekle kısmından ekleyebilirsiniz.</li>';
                    return;
                }

                const friendPromises = friendIds.map(friendId => db.collection('users').doc(friendId).get());
                const friendDocs = await Promise.all(friendPromises);

                friendDocs.forEach(friendDoc => {
                    if (friendDoc.exists) {
                        const friendData = friendDoc.data();
                        const friendItem = document.createElement('li');
                        friendItem.innerHTML = `
                            <span class="friend-name">${friendData.displayName || friendData.email}</span>
                            <button class="start-chat-btn" data-friend-id="${friendData.uid}" data-friend-name="${friendData.displayName || friendData.email}">Özel Sohbet</button>
                        `;
                        friendsListUL.appendChild(friendItem);
                    }
                });
            }
        }, error => {
            console.error('Arkadaş listesini dinlerken hata:', error);
        });
}

addFriendBtn.addEventListener('click', async () => {
    const friendEmail = addFriendEmailInput.value.trim();
    addFriendStatus.textContent = '';
    if (!friendEmail || !currentUser) {
        showMessage(addFriendStatus, 'Bir e-posta girin.', true);
        return;
    }
    if (friendEmail === currentUser.email) {
        showMessage(addFriendStatus, 'Kendinizi arkadaş olarak ekleyemezsiniz.', true);
        return;
    }

    try {
        const usersSnapshot = await db.collection('users').where('email', '==', friendEmail).get();

        if (usersSnapshot.empty) {
            showMessage(addFriendStatus, 'Bu e-postaya sahip bir kullanıcı bulunamadı.', true);
            return;
        }

        const friendDoc = usersSnapshot.docs[0];
        const friendId = friendDoc.id;

        // Kontrol et: zaten arkadaş mı?
        const currentUserData = (await db.collection('users').doc(currentUser.uid).get()).data();
        if (currentUserData.friends && currentUserData.friends.includes(friendId)) {
            showMessage(addFriendStatus, `${friendDoc.data().displayName || friendDoc.data().email} zaten arkadaş listenizde.`, false);
            addFriendEmailInput.value = '';
            return;
        }


        // Kendi arkadaş listemize ekle
        await db.collection('users').doc(currentUser.uid).update({
            friends: FieldValue.arrayUnion(friendId) // Global olarak tanımlanan FieldValue kullanıldı
        });
        // Arkadaşın listesine de bizi ekle (karşılıklı arkadaşlık)
        await db.collection('users').doc(friendId).update({
            friends: FieldValue.arrayUnion(currentUser.uid) // Global olarak tanımlanan FieldValue kullanıldı
        });

        showMessage(addFriendStatus, `${friendDoc.data().displayName || friendDoc.data().email} arkadaş listenize eklendi!`, false);
        addFriendEmailInput.value = '';

    } catch (error) {
        console.error('Arkadaş eklerken hata:', error);
        showMessage(addFriendStatus, 'Arkadaş eklenirken bir hata oluştu.', true);
    }
});

// Arkadaş listesindeki "Özel Sohbet" butonlarına tıklama
friendsListUL.addEventListener('click', (e) => {
    if (e.target.classList.contains('start-chat-btn')) {
        const friendId = e.target.dataset.friendId;
        const friendName = e.target.dataset.friendName;
        openPrivateChat(friendId, friendName);
    }
});

// ----- Özel Sohbet İşlemleri -----

function getPrivateChatRoomId(user1Id, user2Id) {
    // Oda ID'sini belirlemek için UID'leri alfabetik sıraya göre birleştir
    return [user1Id, user2Id].sort().join('_');
}

async function openPrivateChat(recipientId, recipientName) {
    if (!currentUser) return;

    currentPrivateChatRecipientId = recipientId;
    privateChatTitle.textContent = `${recipientName} ile Sohbet`;
    privateMessagesContainer.innerHTML = ''; // Önceki mesajları temizle
    privateMessageInput.value = ''; // Giriş kutusunu temizle

    privateChatModal.classList.remove('hidden'); // Modalı göster

    if (unsubscribePrivateChat) {
        unsubscribePrivateChat(); // Önceki özel sohbet dinleyicisini iptal et
    }

    const chatRoomId = getPrivateChatRoomId(currentUser.uid, recipientId);
    const chatRef = db.collection('privateChats').doc(chatRoomId).collection('messages');

    // Özel sohbet mesajlarını dinle
    unsubscribePrivateChat = chatRef.orderBy('timestamp', 'asc').onSnapshot(snapshot => {
        privateMessagesContainer.innerHTML = '';
        snapshot.forEach(doc => {
            displayMessage(doc.data(), privateMessagesContainer, true);
        });
    }, error => {
        console.error('Özel mesajları dinlerken hata:', error);
    });
}

closePrivateChatBtn.addEventListener('click', () => {
    privateChatModal.classList.add('hidden'); // Modalı kapat
    if (unsubscribePrivateChat) {
        unsubscribePrivateChat();
        unsubscribePrivateChat = null;
    }
    currentPrivateChatRecipientId = null;
});

sendPrivateMessageBtn.addEventListener('click', async () => {
    const content = privateMessageInput.value.trim();
    if (content && currentUser && currentPrivateChatRecipientId) {
        // E-posta doğrulanmış mı kontrol et
        if (!currentUser.emailVerified) {
            alert('Mesaj gönderebilmek için lütfen e-posta adresinizi doğrulayın. Doğrulama linki e-postanıza gönderildi.');
            return;
        }
        try {
            const chatRoomId = getPrivateChatRoomId(currentUser.uid, currentPrivateChatRecipientId);
            await db.collection('privateChats').doc(chatRoomId).collection('messages').add({
                senderId: currentUser.uid,
                senderName: currentUser.displayName || currentUser.email.split('@')[0],
                content: content,
                timestamp: FieldValue.serverTimestamp() // Global olarak tanımlanan FieldValue kullanıldı
            });
            privateMessageInput.value = '';
        } catch (error) {
            console.error('Özel mesaj gönderirken hata:', error);
        }
    }
});

privateMessageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendPrivateMessageBtn.click();
    }
});


// ----- Ayarlar İşlemleri -----

settingsBtn.addEventListener('click', () => {
    showAppContent('settings-section');
    // Mevcut değerleri inputlara yükle
    newDisplayNameInput.value = currentUser.displayName || currentUser.email.split('@')[0];
    newEmailInput.value = currentUser.email;
    emailCurrentPasswordInput.value = ''; // E-posta değişimi için şifreyi temizle
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    displayNameStatus.textContent = '';
    emailStatus.textContent = '';
    passwordStatus.textContent = '';
});

// İsim Değiştir
updateDisplayNameBtn.addEventListener('click', async () => {
    const newName = newDisplayNameInput.value.trim();
    displayNameStatus.textContent = '';

    if (!newName) {
        showMessage(displayNameStatus, 'Kullanıcı adı boş bırakılamaz.', true);
        return;
    }
    if (newName === currentUser.displayName) {
        showMessage(displayNameStatus, 'Yeni kullanıcı adı mevcut isminizle aynı.', false);
        return;
    }

    try {
        await currentUser.updateProfile({ displayName: newName });
        // Firestore'daki public profili de güncelle
        await db.collection('users').doc(currentUser.uid).update({ displayName: newName });
        displayNameSpan.textContent = newName; // UI'yı güncelle
        showMessage(displayNameStatus, 'Kullanıcı adı başarıyla güncellendi.', false);
    } catch (error) {
        console.error('Kullanıcı adı güncellenirken hata:', error);
        showMessage(displayNameStatus, error.message, true);
    }
});

// E-posta Değiştir
updateEmailBtn.addEventListener('click', async () => {
    const newEmail = newEmailInput.value.trim();
    const currentPasswordForEmail = emailCurrentPasswordInput.value; // E-posta değişimi için mevcut şifre
    emailStatus.textContent = '';

    if (!newEmail || !currentPasswordForEmail) {
        showMessage(emailStatus, 'Yeni e-posta ve mevcut şifre boş bırakılamaz.', true);
        return;
    }
    if (newEmail === currentUser.email) {
        showMessage(emailStatus, 'Yeni e-posta mevcut e-postanızla aynı.', false);
        return;
    }

    try {
        // Kullanıcının kimliğini yeniden doğrula
        const credential = EmailAuthProvider.credential(currentUser.email, currentPasswordForEmail); // Global olarak tanımlanan EmailAuthProvider kullanıldı
        await currentUser.reauthenticateWithCredential(credential);

        await currentUser.updateEmail(newEmail);
        await currentUser.sendEmailVerification(); // Yeni e-postaya doğrulama linki gönder

        // Firestore'daki public profili de güncelle
        await db.collection('users').doc(currentUser.uid).update({ email: newEmail });

        userEmailSpan.textContent = newEmail; // UI'yı güncelle
        showMessage(emailStatus, 'E-posta başarıyla güncellendi. Yeni e-postanıza doğrulama linki gönderildi. Lütfen e-postanızı kontrol edin.', false);
        // E-posta değiştikten sonra güvenlik için oturumu kapatıyoruz
        await auth.signOut();
        alert('E-postanız başarıyla değiştirildi. Yeni e-postanızı doğrulamak için lütfen gelen kutunuzu kontrol edin ve ardından tekrar giriş yapın.');

    } catch (error) {
        console.error('E-posta güncellenirken hata:', error);
        showMessage(emailStatus, error.message, true);
        if (error.code === 'auth/requires-recent-login') {
            showMessage(emailStatus, 'Bu işlemi yapabilmek için lütfen tekrar giriş yapın (güvenlik nedeniyle).', true);
        } else if (error.code === 'auth/wrong-password') {
            showMessage(emailStatus, 'Mevcut şifreniz yanlış.', true);
        }
    }
});

// Şifre Değiştir
updatePasswordBtn.addEventListener('click', async () => {
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    passwordStatus.textContent = '';

    if (!currentPassword || !newPassword) {
        showMessage(passwordStatus, 'Mevcut ve yeni şifre boş bırakılamaz.', true);
        return;
    }
    if (newPassword.length < 6) {
        showMessage(passwordStatus, 'Yeni şifre en az 6 karakter olmalıdır.', true);
        return;
    }

    try {
        // Kullanıcının kimliğini yeniden doğrula
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword); // Global olarak tanımlanan EmailAuthProvider kullanıldı
        await currentUser.reauthenticateWithCredential(credential);

        // Şifreyi güncelle
        await currentUser.updatePassword(newPassword);
        showMessage(passwordStatus, 'Şifreniz başarıyla güncellendi!', false);
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        await auth.signOut(); // Şifre değiştikten sonra oturumu kapat
        alert('Şifreniz başarıyla değiştirildi. Lütfen yeni şifrenizle tekrar giriş yapın.');

    } catch (error) {
        console.error('Şifre güncellenirken hata:', error);
        showMessage(passwordStatus, error.message, true);
        if (error.code === 'auth/wrong-password') {
            showMessage(passwordStatus, 'Mevcut şifreniz yanlış.', true);
        } else if (error.code === 'auth/requires-recent-login') {
            showMessage(passwordStatus, 'Bu işlemi yapabilmek için lütfen tekrar giriş yapın (güvenlik nedeniyle).', true);
        }
    }
});


// ----- Sekme (Tab) Değiştirme Mantığı -----
function showTab(tabName) {
    // Butonları güncelle
    showLoginTabBtn.classList.remove('active');
    showRegisterTabBtn.classList.remove('active');
    loginTabContent.classList.add('hidden');
    registerTabContent.classList.add('hidden');

    if (tabName === 'login') {
        showLoginTabBtn.classList.add('active');
        loginTabContent.classList.remove('hidden');
    } else if (tabName === 'register') {
        showRegisterTabBtn.classList.add('active');
        registerTabContent.classList.remove('hidden');
    }
    // Mesajları temizle
    loginError.textContent = '';
    registerMessage.textContent = '';
}

showLoginTabBtn.addEventListener('click', () => showTab('login'));
showRegisterTabBtn.addEventListener('click', () => showTab('register'));


// Uygulama yüklendiğinde varsayılan olarak giriş sekmesini göster
document.addEventListener('DOMContentLoaded', () => {
    showSection('auth-section'); // İlk olarak auth bölümünü göster
    showTab('login'); // Varsayılan olarak giriş sekmesini göster
});
