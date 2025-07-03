// script.js
// Firebase servisleri ve ilgili fonksiyonlar index.html içinde global olarak tanımlanmıştır.
// Artık burada import statement'ına gerek yok.
const auth = window.auth;
const db = window.db;
const GoogleAuthProvider = window.GoogleAuthProvider;
const EmailAuthProvider = window.EmailAuthProvider;
const FieldValue = window.FieldValue;

// Firestore'dan alınan spesifik fonksiyonlar
const collection = window.collection;
const doc = window.doc;
const getDoc = window.getDoc;
const setDoc = window.setDoc;
const updateDoc = window.updateDoc;
const arrayUnion = window.arrayUnion;
const query = window.query;
const orderBy = window.orderBy;
const limit = window.limit;
const onSnapshot = window.onSnapshot;
const addDoc = window.addDoc;
const where = window.where;

// Auth'tan alınan spesifik fonksiyonlar
const updateProfile = window.updateProfile;
const sendEmailVerification = window.sendEmailVerification;
const sendPasswordResetEmail = window.sendPasswordResetEmail;
const signInWithPopup = window.signInWithPopup;
const signInWithEmailAndPassword = window.signInWithEmailAndPassword;
const createUserWithEmailAndPassword = window.createUserWithEmailAndPassword;
const signOut = window.signOut;
const reauthenticateWithCredential = window.reauthenticateWithCredential;
const updateEmail = window.updateEmail;
const updatePassword = window.updatePassword;


// ----- HTML Elementlerini Seçme -----

// Auth Bölümü
const authSection = document.getElementById('auth-section');
const showLoginTabBtn = document.getElementById('show-login-tab');
const showRegisterTabBtn = document.getElementById('show-register-tab');
const loginTabContent = document.getElementById('login-tab-content');
const registerTabContent = document.getElementById('register-tab-content');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const googleLoginBtn = document.getElementById('google-login-btn');
const forgotPasswordBtn = document.getElementById('forgot-password-btn');

const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerMessage = document.getElementById('register-message');

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

const emailCurrentPasswordInput = document.getElementById('email-current-password');
const newEmailInput = document.getElementById('new-email');
const updateEmailBtn = document.getElementById('update-email-btn');
const emailStatus = document.getElementById('email-status');

const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const updatePasswordBtn = document.getElementById('update-password-btn');
const passwordStatus = document.getElementById('password-status');

let currentUser = null;
let currentPrivateChatRecipientId = null;
let unsubscribePrivateChat = null;
let unsubscribePublicMessages = null;
let unsubscribeFriends = null;


// ----- Yardımcı Fonksiyonlar -----

function showSection(sectionId) {
    authSection.classList.add('hidden');
    appSection.classList.add('hidden');
    privateChatModal.classList.add('hidden'); // Modal her zaman gizli başlasın

    document.getElementById(sectionId).classList.remove('hidden');

    if (sectionId === 'app-section') {
        showAppContent('main-chat-area'); // Varsayılan olarak genel sohbeti göster
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        mainChatBtn.classList.add('active');
    }
}

function showAppContent(contentId) {
    // Tüm içerik alanlarını gizle
    document.querySelectorAll('.chat-main, .content-view').forEach(content => {
        content.classList.add('hidden');
    });
    // İstenen içeriği göster
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
    messageElement.classList.add('message-item');

    const senderDisplayName = message.senderName || 'Bilinmeyen';
    const currentUserId = auth.currentUser ? auth.currentUser.uid : null;

    // Mesajın göndereni bizim kullanıcımızsa 'sent', değilse 'received' sınıfını ekle
    if (message.senderId === currentUserId) {
        messageElement.classList.add('sent');
    } else {
        messageElement.classList.add('received');
    }

    // Mesaj içeriğini ekle
    let messageHtml = '';
    if (message.senderId !== currentUserId) { // Kendi mesajımızda gönderen adını gösterme
        messageHtml += `<div class="message-sender-name">${senderDisplayName}</div>`;
    }
    messageHtml += `<div class="message-content">${message.content}</div>`;
    
    // Zaman damgasını biçimlendir ve ekle
    const date = message.timestamp && message.timestamp.toDate ? message.timestamp.toDate() : new Date();
    const timeString = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    messageHtml += `<span class="message-timestamp">${timeString}</span>`;

    messageElement.innerHTML = messageHtml;
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight; // Otomatik aşağı kaydır
}

function showStatusMessage(element, text, isError = true) {
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
    }, 5000); // 5 saniye sonra mesajı kaldır
}

// ----- Firebase Authentication İşlemleri -----

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        displayNameSpan.textContent = user.displayName || user.email.split('@')[0];
        userEmailSpan.textContent = user.email;
        showSection('app-section');

        if (!user.emailVerified) {
            alert('E-posta adresiniz doğrulanmamış. Sohbet etmeye başlamadan önce lütfen e-postanıza gönderilen doğrulama linkine tıklayın.');
            // Ayrıca UI'da daha kalıcı bir uyarı gösterebilirsiniz.
        }

        // Firestore'da kullanıcının public profilini oluştur/güncelle
        createUserProfile(user);

        // Dinleyicileri başlat
        listenForPublicMessages();
        listenForFriends();

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
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value.trim();
    registerMessage.textContent = '';

    if (password.length < 6) {
        showStatusMessage(registerMessage, 'Şifre en az 6 karakter olmalıdır.', true);
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: email.split('@')[0] }); // Display name atama
        await sendEmailVerification(userCredential.user); // E-posta doğrulama linki gönder

        showStatusMessage(registerMessage, 'Kayıt başarılı! E-postanıza doğrulama linki gönderildi. Lütfen e-postanızı kontrol edin.', false);
        registerForm.reset();
        showTab('login'); // Başarılı kayıttan sonra giriş sekmesine geç
    } catch (error) {
        showStatusMessage(registerMessage, error.message, true);
    }
});

// Giriş Yap
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();
    loginError.textContent = '';

    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginForm.reset();
        loginError.textContent = ''; // Başarılı giriş
    } catch (error) {
        showStatusMessage(loginError, error.message, true);
    }
});

// Google ile Giriş Yap
googleLoginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    loginError.textContent = '';
    try {
        await signInWithPopup(auth, provider);
        loginError.textContent = '';
    } catch (error) {
        showStatusMessage(loginError, error.message, true);
    }
});

// Şifremi Unuttum
forgotPasswordBtn.addEventListener('click', async () => {
    const email = loginEmailInput.value.trim();
    loginError.textContent = '';

    if (!email) {
        showStatusMessage(loginError, 'Şifresini sıfırlamak istediğiniz e-postayı girin.', true);
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        showStatusMessage(loginError, 'Şifre sıfırlama linki e-postanıza gönderildi.', false);
    } catch (error) {
        showStatusMessage(loginError, error.message, true);
    }
});

// Çıkış Yap
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Çıkış yaparken hata:', error);
    }
});

// Firestore'da Kullanıcı Profili Oluşturma/Güncelleme
async function createUserProfile(user) {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            friends: [],
            createdAt: FieldValue.serverTimestamp()
        });
    } else {
        await updateDoc(userRef, {
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            lastLoginAt: FieldValue.serverTimestamp()
        });
    }
    // UI'da görünen display name'i güncelle
    displayNameSpan.textContent = user.displayName || user.email.split('@')[0];
}

// ----- Genel Sohbet İşlemleri -----

function listenForPublicMessages() {
    if (unsubscribePublicMessages) {
        unsubscribePublicMessages(); // Önceki dinleyiciyi iptal et
    }

    const messagesCollection = collection(db, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'), limit(100));

    unsubscribePublicMessages = onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = '';
        snapshot.forEach(doc => {
            displayMessage(doc.data(), messagesContainer);
        });
    }, (error) => {
        console.error('Genel mesajları dinlerken hata:', error);
    });
}

sendMessageBtn.addEventListener('click', async () => {
    const content = messageInput.value.trim();
    if (content && currentUser) {
        if (!currentUser.emailVerified) {
            alert('Mesaj gönderebilmek için lütfen e-posta adresinizi doğrulayın.');
            return;
        }

        try {
            await addDoc(collection(db, 'messages'), {
                senderId: currentUser.uid,
                senderName: currentUser.displayName || currentUser.email.split('@')[0],
                content: content,
                timestamp: FieldValue.serverTimestamp()
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
    loadFriendsList();
});

async function loadFriendsList() {
    if (!currentUser) return;

    if (unsubscribeFriends) {
        unsubscribeFriends();
    }

    const userRef = doc(db, 'users', currentUser.uid);

    unsubscribeFriends = onSnapshot(userRef, async (userDocSnapshot) => {
        friendsListUL.innerHTML = '';
        if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            const friendIds = userData.friends || [];

            if (friendIds.length === 0) {
                friendsListUL.innerHTML = '<li class="info-text" style="padding: 20px;">Henüz arkadaşınız yok. Yukarıdan arkadaş ekleyebilirsiniz.</li>';
                return;
            }

            const friendPromises = friendIds.map(friendId => getDoc(doc(db, 'users', friendId)));
            const friendDocs = await Promise.all(friendPromises);

            friendDocs.forEach(friendDoc => {
                if (friendDoc.exists()) {
                    const friendData = friendDoc.data();
                    const friendItem = document.createElement('li');
                    friendItem.classList.add('friend-item');
                    friendItem.innerHTML = `
                        <div class="friend-info">
                            <div class="friend-avatar">${friendData.displayName ? friendData.displayName[0].toUpperCase() : friendData.email[0].toUpperCase()}</div>
                            <span class="friend-name">${friendData.displayName || friendData.email}</span>
                        </div>
                        <button class="start-chat-button" data-friend-id="${friendData.uid}" data-friend-name="${friendData.displayName || friendData.email}">
                            <i class="fas fa-comment"></i> Sohbet Et
                        </button>
                    `;
                    friendsListUL.appendChild(friendItem);
                }
            });
        }
    }, (error) => {
        console.error('Arkadaş listesini dinlerken hata:', error);
    });
}

addFriendBtn.addEventListener('click', async () => {
    const friendEmail = addFriendEmailInput.value.trim();
    addFriendStatus.textContent = '';
    if (!friendEmail || !currentUser) {
        showStatusMessage(addFriendStatus, 'Bir e-posta girin.', true);
        return;
    }
    if (friendEmail === currentUser.email) {
        showStatusMessage(addFriendStatus, 'Kendinizi arkadaş olarak ekleyemezsiniz.', true);
        return;
    }

    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', friendEmail));
        const usersSnapshot = await getDocs(q); // getDocs kullanıldı

        if (usersSnapshot.empty) {
            showStatusMessage(addFriendStatus, 'Bu e-postaya sahip bir kullanıcı bulunamadı.', true);
            return;
        }

        const friendDocFound = usersSnapshot.docs[0];
        const friendId = friendDocFound.id;

        // Kontrol et: zaten arkadaş mı?
        const currentUserData = (await getDoc(doc(db, 'users', currentUser.uid))).data();
        if (currentUserData.friends && currentUserData.friends.includes(friendId)) {
            showStatusMessage(addFriendStatus, `${friendDocFound.data().displayName || friendDocFound.data().email} zaten arkadaş listenizde.`, false);
            addFriendEmailInput.value = '';
            return;
        }

        // Kendi arkadaş listemize ekle
        await updateDoc(doc(db, 'users', currentUser.uid), {
            friends: arrayUnion(friendId)
        });
        // Arkadaşın listesine de bizi ekle (karşılıklı arkadaşlık)
        await updateDoc(doc(db, 'users', friendId), {
            friends: arrayUnion(currentUser.uid)
        });

        showStatusMessage(addFriendStatus, `${friendDocFound.data().displayName || friendDocFound.data().email} arkadaş listenize eklendi!`, false);
        addFriendEmailInput.value = '';

    } catch (error) {
        console.error('Arkadaş eklerken hata:', error);
        showStatusMessage(addFriendStatus, 'Arkadaş eklenirken bir hata oluştu.', true);
    }
});

// Arkadaş listesindeki "Sohbet Et" butonlarına tıklama
friendsListUL.addEventListener('click', (e) => {
    if (e.target.classList.contains('start-chat-button')) {
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
    privateChatTitle.textContent = `${recipientName} ile Özel Sohbet`;
    privateMessagesContainer.innerHTML = '';
    privateMessageInput.value = '';

    privateChatModal.classList.remove('hidden');

    if (unsubscribePrivateChat) {
        unsubscribePrivateChat();
    }

    const chatRoomId = getPrivateChatRoomId(currentUser.uid, recipientId);
    const chatCollection = collection(db, 'privateChats', chatRoomId, 'messages');
    const q = query(chatCollection, orderBy('timestamp', 'asc'));

    unsubscribePrivateChat = onSnapshot(q, (snapshot) => {
        privateMessagesContainer.innerHTML = '';
        snapshot.forEach(doc => {
            displayMessage(doc.data(), privateMessagesContainer, true);
        });
    }, (error) => {
        console.error('Özel mesajları dinlerken hata:', error);
    });
}

closePrivateChatBtn.addEventListener('click', () => {
    privateChatModal.classList.add('hidden');
    if (unsubscribePrivateChat) {
        unsubscribePrivateChat();
        unsubscribePrivateChat = null;
    }
    currentPrivateChatRecipientId = null;
});

sendPrivateMessageBtn.addEventListener('click', async () => {
    const content = privateMessageInput.value.trim();
    if (content && currentUser && currentPrivateChatRecipientId) {
        if (!currentUser.emailVerified) {
            alert('Mesaj gönderebilmek için lütfen e-posta adresinizi doğrulayın.');
            return;
        }
        try {
            const chatRoomId = getPrivateChatRoomId(currentUser.uid, currentPrivateChatRecipientId);
            await addDoc(collection(db, 'privateChats', chatRoomId, 'messages'), {
                senderId: currentUser.uid,
                senderName: currentUser.displayName || currentUser.email.split('@')[0],
                content: content,
                timestamp: FieldValue.serverTimestamp()
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
    newDisplayNameInput.value = currentUser.displayName || currentUser.email.split('@')[0];
    newEmailInput.value = currentUser.email;
    emailCurrentPasswordInput.value = '';
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    displayNameStatus.textContent = '';
    emailStatus.textContent = '';
    passwordStatus.textContent = '';
});

// Kullanıcı Adı Değiştir
updateDisplayNameBtn.addEventListener('click', async () => {
    const newName = newDisplayNameInput.value.trim();
    displayNameStatus.textContent = '';

    if (!newName) {
        showStatusMessage(displayNameStatus, 'Kullanıcı adı boş bırakılamaz.', true);
        return;
    }
    if (newName === (currentUser.displayName || currentUser.email.split('@')[0])) {
        showStatusMessage(displayNameStatus, 'Yeni kullanıcı adı mevcut isminizle aynı.', false);
        return;
    }

    try {
        await updateProfile(currentUser, { displayName: newName });
        await updateDoc(doc(db, 'users', currentUser.uid), { displayName: newName });
        displayNameSpan.textContent = newName;
        showStatusMessage(displayNameStatus, 'Kullanıcı adı başarıyla güncellendi.', false);
    } catch (error) {
        console.error('Kullanıcı adı güncellenirken hata:', error);
        showStatusMessage(displayNameStatus, error.message, true);
    }
});

// E-posta Değiştir
updateEmailBtn.addEventListener('click', async () => {
    const newEmail = newEmailInput.value.trim();
    const currentPasswordForEmail = emailCurrentPasswordInput.value;
    emailStatus.textContent = '';

    if (!newEmail || !currentPasswordForEmail) {
        showStatusMessage(emailStatus, 'Yeni e-posta ve mevcut şifre boş bırakılamaz.', true);
        return;
    }
    if (newEmail === currentUser.email) {
        showStatusMessage(emailStatus, 'Yeni e-posta mevcut e-postanızla aynı.', false);
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPasswordForEmail);
        await reauthenticateWithCredential(currentUser, credential);
        await updateEmail(currentUser, newEmail);
        await sendEmailVerification(currentUser); // Yeni e-postaya doğrulama linki gönder

        await updateDoc(doc(db, 'users', currentUser.uid), { email: newEmail });

        userEmailSpan.textContent = newEmail;
        showStatusMessage(emailStatus, 'E-posta başarıyla güncellendi. Yeni e-postanıza doğrulama linki gönderildi. Lütfen e-postanızı kontrol edin.', false);
        // Güvenlik için oturumu kapat
        await signOut(auth);
        alert('E-postanız başarıyla değiştirildi. Yeni e-postanızı doğrulamak için lütfen gelen kutunuzu kontrol edin ve ardından tekrar giriş yapın.');

    } catch (error) {
        console.error('E-posta güncellenirken hata:', error);
        showStatusMessage(emailStatus, error.message, true);
        if (error.code === 'auth/requires-recent-login') {
            showStatusMessage(emailStatus, 'Bu işlemi yapabilmek için lütfen tekrar giriş yapın (güvenlik nedeniyle).', true);
        } else if (error.code === 'auth/wrong-password') {
            showStatusMessage(emailStatus, 'Mevcut şifreniz yanlış.', true);
        }
    }
});

// Şifre Değiştir
updatePasswordBtn.addEventListener('click', async () => {
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    passwordStatus.textContent = '';

    if (!currentPassword || !newPassword) {
        showStatusMessage(passwordStatus, 'Mevcut ve yeni şifre boş bırakılamaz.', true);
        return;
    }
    if (newPassword.length < 6) {
        showStatusMessage(passwordStatus, 'Yeni şifre en az 6 karakter olmalıdır.', true);
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        showStatusMessage(passwordStatus, 'Şifreniz başarıyla güncellendi!', false);
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        await signOut(auth);
        alert('Şifreniz başarıyla değiştirildi. Lütfen yeni şifrenizle tekrar giriş yapın.');

    } catch (error) {
        console.error('Şifre güncellenirken hata:', error);
        showStatusMessage(passwordStatus, error.message, true);
        if (error.code === 'auth/wrong-password') {
            showStatusMessage(passwordStatus, 'Mevcut şifreniz yanlış.', true);
        } else if (error.code === 'auth/requires-recent-login') {
            showStatusMessage(passwordStatus, 'Bu işlemi yapabilmek için lütfen tekrar giriş yapın (güvenlik nedeniyle).', true);
        }
    }
});


// ----- Sekme (Tab) Değiştirme Mantığı -----
function showTab(tabName) {
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
    // onAuthStateChanged Firebase'den kullanıcı durumunu alana kadar her şey gizli başlasın
    authSection.classList.add('hidden');
    appSection.classList.add('hidden');
    // Sadece authSection'ın container'ı görüntülenecek, içinde login tab aktif olacak
    showTab('login');
});
