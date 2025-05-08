// dashboard.js
import { auth, db, storage } from './firebase.js';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// DOM Elements
const userAvatar = document.getElementById('user-avatar');
const username = document.getElementById('username');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const logoutBtn = document.getElementById('logout-btn');

let currentUser = null;

// Check auth state
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    
    currentUser = user;
    
    // Load user data
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        username.textContent = userData.username;
        userAvatar.textContent = userData.username.substring(0, 2).toUpperCase();
        
        if (userData.profilePicture) {
            userAvatar.style.backgroundImage = `url(${userData.profilePicture})`;
            userAvatar.style.backgroundSize = 'cover';
            userAvatar.textContent = '';
        }
    }
    
    // Load messages
    const messagesQuery = query(collection(db, "messages"), where("channel", "==", "general"));
    onSnapshot(messagesQuery, (snapshot) => {
        chatMessages.innerHTML = '';
        snapshot.forEach((doc) => {
            const message = doc.data();
            displayMessage(message);
        });
    });
    
    // Load friends
    // You would implement this similarly to messages
});

// Send message
sendBtn.addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (!text) return;
    
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    const userData = userDoc.data();
    
    await addDoc(collection(db, "messages"), {
        text: text,
        author: userData.username,
        authorId: currentUser.uid,
        channel: "general",
        createdAt: new Date()
    });
    
    messageInput.value = '';
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

// Display message
function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = message.author.substring(0, 2).toUpperCase();
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    
    const authorSpan = document.createElement('div');
    authorSpan.className = 'message-author';
    authorSpan.textContent = message.author;
    
    const timeSpan = document.createElement('div');
    timeSpan.className = 'message-time';
    timeSpan.textContent = new Date(message.createdAt?.toDate()).toLocaleTimeString();
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = message.text;
    
    headerDiv.appendChild(authorSpan);
    headerDiv.appendChild(timeSpan);
    contentDiv.appendChild(headerDiv);
    contentDiv.appendChild(textDiv);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Logout function
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = "index.html";
    } catch (error) {
        alert("Çıkış yapılırken bir hata oluştu: " + error.message);
    }
});
