// app.js
import { auth, db, storage } from './firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification,
    onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// DOM Elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const switchLink = document.getElementById('switch-link');
const switchText = document.getElementById('switch-text');
const authContainer = document.getElementById('auth-container');

let isLoginMode = true;

// Switch between login and register
switchLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'none';
        switchText.textContent = "Hesabınız yok mu?";
        switchLink.textContent = "Kayıt Ol";
    } else {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'block';
        switchText.textContent = "Zaten hesabınız var mı?";
        switchLink.textContent = "Giriş Yap";
    }
});

// Login function
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    
    if (password.length < 6) {
        alert("Şifre en az 6 karakter olmalıdır!");
        return;
    }
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html";
    } catch (error) {
        alert("Giriş başarısız: " + error.message);
    }
});

// Register function
registerBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    
    if (password.length < 6) {
        alert("Şifre en az 6 karakter olmalıdır!");
        return;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        
        // Create user profile in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            email: email,
            username: email.split('@')[0],
            createdAt: new Date(),
            friends: [],
            friendRequests: [],
            profilePicture: ""
        });
        
        alert("Kayıt başarılı! Lütfen e-postanızı doğrulayın.");
    } catch (error) {
        alert("Kayıt başarısız: " + error.message);
    }
});

// Check auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "dashboard.html";
    }
});
