// dashboard.js
import { auth, db } from './firebase.js';
import { 
    onAuthStateChanged, 
    signOut,
    updateProfile,
    updateEmail,
    updatePassword
} from "firebase/auth";
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    addDoc, 
    doc, 
    getDoc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove,
    getDocs,
    setDoc
} from "firebase/firestore";

// DOM Elements
const userAvatar = document.getElementById('user-avatar');
const username = document.getElementById('username');
const userTag = document.getElementById('user-tag');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsClose = document.getElementById('settings-close');
const changeUsernameBtn = document.getElementById('change-username-btn');
const changeEmailBtn = document.getElementById('change-email-btn');
const changePasswordBtn = document.getElementById('change-password-btn');
const logoutBtn = document.getElementById('logout-btn');

let currentUser = null;
let currentUserData = null;

// Initialize the app
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    
    currentUser = user;
    
    // Load user data
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        currentUserData = userDoc.data();
        updateUI();
    }
    
    // Load messages
    loadMessages();
    
    // Load friends
    loadFriends();
});

function updateUI() {
    // Set username and avatar
    username.textContent = currentUserData.username;
    userTag.textContent = `#${currentUser.uid.substring(0, 4)}`;
    userAvatar.textContent = currentUserData.username.substring(0, 1).toUpperCase();
}

// Load messages
function loadMessages() {
    const messagesQuery = query(collection(db, "messages"), where("channel", "==", "general"));
    
    onSnapshot(messagesQuery, (snapshot) => {
        chatMessages.innerHTML = '';
        snapshot.forEach((doc) => {
            const message = doc.data();
            displayMessage(message);
        });
    });
}

// Display message
function displayMessage(message) {
    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.title = message.author;
    avatarDiv.textContent = message.author.substring(0, 1).toUpperCase();
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    
    const authorSpan = document.createElement('div');
    authorSpan.className = 'message-author';
    authorSpan.textContent = message.author;
    
    const timeSpan = document.createElement('div');
    timeSpan.className = 'message-time';
    timeSpan.textContent = new Date(message.createdAt?.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = message.text;
    
    headerDiv.appendChild(authorSpan);
    headerDiv.appendChild(timeSpan);
    contentDiv.appendChild(headerDiv);
    contentDiv.appendChild(textDiv);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    messageGroup.appendChild(messageDiv);
    
    chatMessages.appendChild(messageGroup);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message
messageInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        await sendMessage();
    }
});

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentUser || !currentUserData) return;
    
    try {
        await addDoc(collection(db, "messages"), {
            text: text,
            author: currentUserData.username,
            authorId: currentUser.uid,
            channel: "general",
            createdAt: new Date()
        });
        
        messageInput.value = '';
    } catch (error) {
        console.error("Mesaj gönderilemedi:", error);
    }
}

// Load friends
async function loadFriends() {
    if (!currentUser || !currentUserData) return;
    
    const friendsQuery = query(collection(db, "users"), where("__name__", "in", currentUserData.friends));
    const querySnapshot = await getDocs(friendsQuery);
    
    // Burada arkadaş listesini güncelleyecek kodlar olacak
    // Örnek UI güncellemesi için dashboard.html'de statik arkadaş listesi bulunuyor
}

// Settings modal
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
});

settingsClose.addEventListener('click', () => {
    settingsModal.classList.remove('active');
});

// Change username
changeUsernameBtn.addEventListener('click', async () => {
    const newUsername = prompt("Yeni kullanıcı adınızı girin:", currentUserData.username);
    if (!newUsername || newUsername.length < 3) {
        alert("Kullanıcı adı en az 3 karakter olmalıdır!");
        return;
    }
    
    try {
        await updateDoc(doc(db, "users", currentUser.uid), {
            username: newUsername
        });
        
        currentUserData.username = newUsername;
        updateUI();
        alert("Kullanıcı adı başarıyla güncellendi!");
    } catch (error) {
        alert("Kullanıcı adı güncellenirken hata oluştu: " + error.message);
    }
});

// Change email
changeEmailBtn.addEventListener('click', async () => {
    const newEmail = prompt("Yeni e-posta adresinizi girin:", currentUser.email);
    if (!newEmail || !newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert("Geçerli bir e-posta adresi girin!");
        return;
    }
    
    try {
        await updateEmail(currentUser, newEmail);
        await updateDoc(doc(db, "users", currentUser.uid), {
            email: newEmail
        });
        alert("E-posta adresi başarıyla güncellendi! Lütfen yeni adresinizi doğrulayın.");
    } catch (error) {
        alert("E-posta güncellenirken hata oluştu: " + error.message);
    }
});

// Change password
changePasswordBtn.addEventListener('click', async () => {
    const newPassword = prompt("Yeni şifrenizi girin (en az 6 karakter):");
    if (!newPassword || newPassword.length < 6) {
        alert("Şifre en az 6 karakter olmalıdır!");
        return;
    }
    
    try {
        await updatePassword(currentUser, newPassword);
        alert("Şifre başarıyla güncellendi!");
    } catch (error) {
        alert("Şifre güncellenirken hata oluştu: " + error.message);
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = "index.html";
    } catch (error) {
        alert("Çıkış yapılırken hata oluştu: " + error.message);
    }
});

// Auto-resize textarea
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});
