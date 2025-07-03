// script.js
// Firebase servislerini ve yardımcı sınıfları içeri aktar
import { auth, db } from './firebase-config.js'; // Firebase yapılandırmasını içeri aktar
import { GoogleAuthProvider, EmailAuthProvider } from "firebase/auth"; // Kimlik doğrulama sağlayıcıları için
import { FieldValue } from "firebase/firestore"; // Firestore alan değerleri için (serverTimestamp gibi)

// ----- HTML Elementlerini Seçme -----
// Auth Bölümü
const authSection = document.getElementById('auth-section');
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const googleLoginBtn = document.getElementById('google-login-btn');
const authError = document.getElementById('auth-error');
const forgotPasswordBtn = document.getElementById('forgot-password-btn');
const verifyEmailLink = document.getElementById('verify-email-link');

// Uygulama Bölümü
const appSection = document.getElementById('app-section');
const displayNameSpan = document.getElementById('display-name');
const userEmailSpan = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const settingsBtn = document.getElementById('settings-btn');
const friendsListBtn = document.getElementById('friends-list-btn');

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
const backToChatBtn = document.getElementById('back-to-chat-btn');

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
const newEmailInput = document.getElementById('new-email');
const updateEmailBtn = document.getElementById('update-email-btn');
const emailStatus = document.getElementById('email-status');
const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const updatePasswordBtn = document.getElementById('update-password-btn');
const passwordStatus = document.getElementById('password-status');
const backFromSettingsBtn = document.getElementById('back-from-settings-btn');

let currentUser = null; // Giriş yapan kullanıcı
let currentPrivateChatRecipientId = null; // Özel sohbet yapılan kişinin ID'si
let unsubscribePrivateChat = null; // Özel sohbet dinleyicisini iptal etmek için

// ----- Fonksiyonlar -----

function showSection(section) {
    authSection.classList.add('hidden');
    appSection.classList.add('hidden');
    mainChatArea.classList.add('hidden');
    friendsSection.classList.add('hidden');
    settingsSection.classList.add('hidden');
    privateChatModal.classList.add('hidden'); // Modal her zaman gizli başlasın

    if (section === 'auth') {
        authSection.classList.remove('hidden');
    } else if (section === 'app') {
        appSection.classList.remove('hidden');
        mainChatArea.classList.remove('hidden'); // Varsayılan olarak ana sohbeti göster
    } else if (section === 'friends') {
        appSection.classList.remove('hidden'); // Uygulama bölümü açık kalsın
        friendsSection.classList.remove('hidden');
    } else if (section === 'settings') {
        appSection.classList.remove('hidden'); // Uygulama bölümü açık kalsın
        settingsSection.classList.remove('hidden');
    } else if (section === 'private-chat-modal') {
        privateChatModal.classList.remove('hidden');
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

    messageElement.innerHTML = `
        <div class="message-sender">${senderDisplayName}</div>
        <div class="message-content">${message.content}</div>
    `;
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight; // Otomatik aşağı kaydır
}

// ----- Firebase Authentication İşlemleri -----

// Kullanıcı durumu değiştiğinde
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        displayNameSpan.textContent = user.displayName || 'Misafir';
        userEmailSpan.textContent = user.email;
        showSection('app');

        // E-posta doğrulaması kontrolü
        if (!user.emailVerified) {
            console.log("E-posta doğrulanmadı. Doğrulama linki gönderilebilir.");
            // Kullanıcıya e-posta doğrulaması hatırlatma gibi bir UI ekleyebilirsiniz.
        }

        // Ana sohbet mesajlarını dinlemeye başla
        listenForPublicMessages();
        // Arkadaş listesini ve durumunu dinlemeye başla
        listenForFriends();
        // Firestore'da kullanıcının public profilini oluştur/güncelle
        createUserProfile(user);

    } else {
        currentUser = null;
        showSection('auth');
        // Mesaj dinleyicilerini durdur (varsa)
        if (unsubscribePublicMessages) {
            unsubscribePublicMessages();
        }
        if (unsubscribeFriends) {
            unsubscribeFriends();
        }
        if (unsubscribePrivateChat) { // Özel sohbet dinleyicisini de durdur
            unsubscribePrivateChat();
        }
        messagesContainer.innerHTML = ''; // Mesajları temizle
        friendsListUL.innerHTML = ''; // Arkadaş listesini temizle
        authError.textContent = ''; // Hata mesajlarını temizle
    }
});

// Kayıt Ol
registerBtn.addEventListener('click', async () => {
    const email = authEmailInput.value;
    const password = authPasswordInput.value;
    authError.textContent = '';

    if (!email || !password) {
        authError.textContent = 'E-posta ve şifre boş bırakılamaz.';
        return;
    }
    if (password.length < 6) {
        authError.textContent = 'Şifre en az 6 karakter olmalıdır.';
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        // Kayıt sonrası kullanıcıya varsayılan bir isim ata
        await userCredential.user.updateProfile({ displayName: email.split('@')[0] });
        await userCredential.user.sendEmailVerification(); // E-posta doğrulama linki gönder
        authError.textContent = 'Kayıt başarılı! E-postanıza doğrulama linki gönderildi. Lütfen e-postanızı kontrol edin.';
        authError.classList.add('success-message');
        setTimeout(() => { authError.textContent = ''; authError.classList.remove('success-message');}, 5000);
    } catch (error) {
        authError.textContent = error.message;
        authError.classList.remove('success-message');
    }
});

// Giriş Yap
loginBtn.addEventListener('click', async () => {
    const email = authEmailInput.value;
    const password = authPasswordInput.value;
    authError.textContent = '';

    try {
        await auth.signInWithEmailAndPassword(email, password);
        authError.textContent = ''; // Başarılı giriş
    } catch (error) {
        authError.textContent = error.message;
    }
});

// Google ile Giriş Yap
googleLoginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider(); // Modüler import kullanıldı
    authError.textContent = '';
    try {
        await auth.signInWithPopup(provider);
        authError.textContent = '';
    } catch (error) {
        authError.textContent = error.message;
    }
});

// Şifremi Unuttum
forgotPasswordBtn.addEventListener('click', async () => {
    const email = authEmailInput.value;
    authError.textContent = '';

    if (!email) {
        authError.textContent = 'Şifresini sıfırlamak istediğiniz e-postayı girin.';
        return;
    }

    try {
        await auth.sendPasswordResetEmail(email);
        authError.textContent = 'Şifre sıfırlama linki e-postanıza gönderildi.';
        authError.classList.add('success-message');
        setTimeout(() => { authError.textContent = ''; authError.classList.remove('success-message');}, 5000);
    } catch (error) {
        authError.textContent = error.message;
        authError.classList.remove('success-message');
    }
});

// E-posta Doğrulama Linki Gönder
verifyEmailLink.addEventListener('click', async (e) => {
    e.preventDefault();
    if (currentUser && !currentUser.emailVerified) {
        try {
            await currentUser.sendEmailVerification();
            authError.textContent = 'Doğrulama linki e-postanıza tekrar gönderildi.';
            authError.classList.add('success-message');
            setTimeout(() => { authError.textContent = ''; authError.classList.remove('success-message');}, 5000);
        } catch (error) {
            authError.textContent = error.message;
            authError.classList.remove('success-message');
        }
    } else if (currentUser && currentUser.emailVerified) {
        authError.textContent = 'E-postanız zaten doğrulanmış.';
        authError.classList.add('success-message');
        setTimeout(() => { authError.textContent = ''; authError.classList.remove('success-message');}, 5000);
    } else {
        authError.textContent = 'Önce giriş yapmalısınız.';
        authError.classList.remove('success-message');
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

// Kullanıcı Profilini Oluştur/Güncelle (Firestore'da public profil)
async function createUserProfile(user) {
    const userRef = db.collection('users').doc(user.uid);
    const doc = await userRef.get();
    if (!doc.exists) {
        await userRef.set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            friends: [], // Başlangıçta arkadaş listesi boş
            createdAt: FieldValue.serverTimestamp() // Modüler import kullanıldı
        });
    } else {
        // Kullanıcı bilgileri güncellenmiş olabilir
        await userRef.update({
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            lastLoginAt: FieldValue.serverTimestamp() // Modüler import kullanıldı
        });
    }
    // Ekran adını güncelle
    if (user.displayName) {
        displayNameSpan.textContent = user.displayName;
    } else {
        // Eğer displayName yoksa email'in ilk kısmını kullan
        displayNameSpan.textContent = user.email.split('@')[0];
    }
}

// ----- Genel Sohbet İşlemleri -----

let unsubscribePublicMessages = null; // Genel sohbet dinleyicisini iptal etmek için

function listenForPublicMessages() {
    // Önceki dinleyiciyi iptal et
    if (unsubscribePublicMessages) {
        unsubscribePublicMessages();
    }

    // `messages` koleksiyonunu dinlemeye başla
    unsubscribePublicMessages = db.collection('messages')
        .orderBy('timestamp', 'asc') // Zamana göre sırala
        .limit(100) // Son 100 mesajı göster
        .onSnapshot(snapshot => {
            messagesContainer.innerHTML = ''; // Temizle
            snapshot.forEach(doc => {
                displayMessage(doc.data(), messagesContainer);
            });
        }, error => {
            console.error('Mesajları dinlerken hata:', error);
        });
}

sendMessageBtn.addEventListener('click', async () => {
    const content = messageInput.value.trim();
    if (content && currentUser) {
        try {
            await db.collection('messages').add({
                senderId: currentUser.uid,
                senderName: currentUser.displayName || currentUser.email.split('@')[0],
                content: content,
                timestamp: FieldValue.serverTimestamp() // Modüler import kullanıldı
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

let unsubscribeFriends = null; // Arkadaş listesi dinleyicisini iptal etmek için

friendsListBtn.addEventListener('click', () => {
    showSection('friends');
    loadFriendsList(); // Arkadaş listesini her açtığında yeniden yükle
});

backToChatBtn.addEventListener('click', () => {
    showSection('app'); // Ana sohbet alanına geri dön
});

async function loadFriendsList() {
    if (!currentUser) return;

    // Önceki dinleyiciyi iptal et
    if (unsubscribeFriends) {
        unsubscribeFriends();
    }

    // Firestore'daki kendi kullanıcı belgenizi dinleyin
    unsubscribeFriends = db.collection('users').doc(currentUser.uid)
        .onSnapshot(async doc => {
            friendsListUL.innerHTML = ''; // Listeyi temizle
            if (doc.exists) {
                const userData = doc.data();
                const friendIds = userData.friends || [];

                if (friendIds.length === 0) {
                    friendsListUL.innerHTML = '<li>Henüz arkadaşınız yok.</li>';
                    return;
                }

                // Arkadaşların bilgilerini paralel olarak çek
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
        addFriendStatus.textContent = 'Bir e-posta girin.';
        addFriendStatus.classList.remove('success-message');
        return;
    }
    if (friendEmail === currentUser.email) {
        addFriendStatus.textContent = 'Kendinizi arkadaş olarak ekleyemezsiniz.';
        addFriendStatus.classList.remove('success-message');
        return;
    }

    try {
        // Arkadaş e-postasına sahip kullanıcıyı bul
        const usersSnapshot = await db.collection('users').where('email', '==', friendEmail).get();

        if (usersSnapshot.empty) {
            addFriendStatus.textContent = 'Bu e-postaya sahip bir kullanıcı bulunamadı.';
            addFriendStatus.classList.remove('success-message');
            return;
        }

        const friendDoc = usersSnapshot.docs[0];
        const friendId = friendDoc.id;

        // Kendi arkadaş listemize ekle
        await db.collection('users').doc(currentUser.uid).update({
            friends: FieldValue.arrayUnion(friendId) // Modüler import kullanıldı
        });
        // Arkadaşın listesine de bizi ekle (karşılıklı arkadaşlık)
        await db.collection('users').doc(friendId).update({
            friends: FieldValue.arrayUnion(currentUser.uid) // Modüler import kullanıldı
        });

        addFriendStatus.textContent = `${friendDoc.data().displayName || friendDoc.data().email} arkadaş listenize eklendi!`;
        addFriendStatus.classList.add('success-message');
        addFriendEmailInput.value = '';
        setTimeout(() => {addFriendStatus.textContent = ''; addFriendStatus.classList.remove('success-message');}, 3000);

    } catch (error) {
        console.error('Arkadaş eklerken hata:', error);
        addFriendStatus.textContent = 'Arkadaş eklenirken bir hata oluştu.';
        addFriendStatus.classList.remove('success-message');
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

    showSection('private-chat-modal'); // Modalı göster

    // Önceki özel sohbet dinleyicisini iptal et
    if (unsubscribePrivateChat) {
        unsubscribePrivateChat();
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
    showSection('friends'); // Özel sohbeti kapatıp arkadaş listesine dön
    if (unsubscribePrivateChat) {
        unsubscribePrivateChat();
        unsubscribePrivateChat = null;
    }
    currentPrivateChatRecipientId = null;
});

sendPrivateMessageBtn.addEventListener('click', async () => {
    const content = privateMessageInput.value.trim();
    if (content && currentUser && currentPrivateChatRecipientId) {
        try {
            const chatRoomId = getPrivateChatRoomId(currentUser.uid, currentPrivateChatRecipientId);
            await db.collection('privateChats').doc(chatRoomId).collection('messages').add({
                senderId: currentUser.uid,
                senderName: currentUser.displayName || currentUser.email.split('@')[0],
                content: content,
                timestamp: FieldValue.serverTimestamp() // Modüler import kullanıldı
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
    showSection('settings');
    // Mevcut değerleri inputlara yükle
    newDisplayNameInput.value = currentUser.displayName || currentUser.email.split('@')[0];
    newEmailInput.value = currentUser.email;
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    displayNameStatus.textContent = '';
    emailStatus.textContent = '';
    passwordStatus.textContent = '';
});

backFromSettingsBtn.addEventListener('click', () => {
    showSection('app'); // Ana sohbet ekranına dön
});

// İsim Değiştir
updateDisplayNameBtn.addEventListener('click', async () => {
    const newName = newDisplayNameInput.value.trim();
    displayNameStatus.textContent = '';

    if (!newName) {
        displayNameStatus.textContent = 'İsim boş bırakılamaz.';
        return;
    }
    if (newName === currentUser.displayName) {
        displayNameStatus.textContent = 'Yeni isim mevcut isminizle aynı.';
        return;
    }

    try {
        await currentUser.updateProfile({ displayName: newName });
        // Firestore'daki public profili de güncelle
        await db.collection('users').doc(currentUser.uid).update({ displayName: newName });
        displayNameSpan.textContent = newName; // UI'yı güncelle
        displayNameStatus.textContent = 'İsim başarıyla güncellendi.';
        displayNameStatus.classList.add('success-message');
        setTimeout(() => { displayNameStatus.textContent = ''; displayNameStatus.classList.remove('success-message'); }, 3000);
    } catch (error) {
        console.error('İsim güncellenirken hata:', error);
        displayNameStatus.textContent = error.message;
        displayNameStatus.classList.remove('success-message');
    }
});

// E-posta Değiştir (E-postaya kod/link göndererek doğrulama)
updateEmailBtn.addEventListener('click', async () => {
    const newEmail = newEmailInput.value.trim();
    emailStatus.textContent = '';

    if (!newEmail) {
        emailStatus.textContent = 'Yeni e-posta boş bırakılamaz.';
        return;
    }
    if (newEmail === currentUser.email) {
        emailStatus.textContent = 'Yeni e-posta mevcut e-postanızla aynı.';
        return;
    }

    try {
        // Kullanıcının kimliğini yeniden doğrula
        // Bu, güvenlik için Firebase'in gerektirdiği bir adımdır.
        // Kullanıcının mevcut şifresini alıp reauthenticateWithCredential ile yeniden kimlik doğrulaması yapmalıyız.
        const credential = EmailAuthProvider.credential(currentUser.email, currentPasswordInput.value); // Modüler import kullanıldı
        await currentUser.reauthenticateWithCredential(credential);

        await currentUser.updateEmail(newEmail);
        await currentUser.sendEmailVerification(); // Yeni e-postaya doğrulama linki gönder

        // Firestore'daki public profili de güncelle
        await db.collection('users').doc(currentUser.uid).update({ email: newEmail });

        userEmailSpan.textContent = newEmail; // UI'yı güncelle
        emailStatus.textContent = 'E-posta başarıyla güncellendi. Yeni e-postanıza doğrulama linki gönderildi.';
        emailStatus.classList.add('success-message');
        setTimeout(() => { emailStatus.textContent = ''; emailStatus.classList.remove('success-message'); }, 5000);
        // E-posta değiştikten sonra Firebase genellikle oturumu sonlandırır veya yeniden giriş ister.
        await auth.signOut(); // Güvenlik için oturumu kapat
        alert('E-postanız başarıyla değiştirildi. Yeni e-postanızı doğrulamak için lütfen gelen kutunuzu kontrol edin ve ardından tekrar giriş yapın.');

    } catch (error) {
        console.error('E-posta güncellenirken hata:', error);
        emailStatus.textContent = error.message;
        emailStatus.classList.remove('success-message');
        if (error.code === 'auth/requires-recent-login') {
            emailStatus.textContent = 'Bu işlemi yapabilmek için lütfen tekrar giriş yapın (güvenlik nedeniyle). Mevcut şifrenizi girerek tekrar deneyin.';
        } else if (error.code === 'auth/wrong-password') {
            emailStatus.textContent = 'Mevcut şifreniz yanlış. E-posta değiştirmek için doğru şifreyi girin.';
        }
    }
});

// Şifre Değiştir
updatePasswordBtn.addEventListener('click', async () => {
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    passwordStatus.textContent = '';

    if (!currentPassword || !newPassword) {
        passwordStatus.textContent = 'Mevcut ve yeni şifre boş bırakılamaz.';
        return;
    }
    if (newPassword.length < 6) {
        passwordStatus.textContent = 'Yeni şifre en az 6 karakter olmalıdır.';
        return;
    }

    try {
        // Kullanıcının kimliğini yeniden doğrula
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword); // Modüler import kullanıldı
        await currentUser.reauthenticateWithCredential(credential);

        // Şifreyi güncelle
        await currentUser.updatePassword(newPassword);
        passwordStatus.textContent = 'Şifreniz başarıyla güncellendi!';
        passwordStatus.classList.add('success-message');
        setTimeout(() => { passwordStatus.textContent = ''; passwordStatus.classList.remove('success-message');}, 3000);
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        await auth.signOut(); // Şifre değiştikten sonra oturumu kapat
        alert('Şifreniz başarıyla değiştirildi. Lütfen yeni şifrenizle tekrar giriş yapın.');

    } catch (error) {
        console.error('Şifre güncellenirken hata:', error);
        passwordStatus.textContent = error.message;
        passwordStatus.classList.remove('success-message');
        if (error.code === 'auth/wrong-password') {
            passwordStatus.textContent = 'Mevcut şifreniz yanlış.';
        } else if (error.code === 'auth/requires-recent-login') {
            passwordStatus.textContent = 'Bu işlemi yapabilmek için lütfen tekrar giriş yapın (güvenlik nedeniyle).';
        }
    }
});

// Uygulama yüklendiğinde varsayılan olarak yetkilendirme ekranını göster
showSection('auth');
