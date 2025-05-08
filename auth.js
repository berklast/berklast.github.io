// auth.js
import { auth, db } from './firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut,
    updateProfile,
    updateEmail,
    updatePassword,
    sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

// DOM Elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const switchLink = document.getElementById('switch-link');
const switchText = document.getElementById('switch-text');
const togglePassword = document.getElementById('toggle-password');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');

let isLoginMode = true;

// Toggle password visibility
togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
});

// Form validation
emailInput.addEventListener('input', validateForm);
passwordInput.addEventListener('input', validateForm);

function validateForm() {
    let isValid = true;
    
    // Email validation
    if (!emailInput.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        emailError.style.display = 'block';
        isValid = false;
    } else {
        emailError.style.display = 'none';
    }
    
    // Password validation
    if (passwordInput.value.length < 6) {
        passwordError.style.display = 'block';
        isValid = false;
    } else {
        passwordError.style.display = 'none';
    }
    
    return isValid;
}

// Switch between login and register
switchLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        loginBtn.style.display = 'flex';
        registerBtn.style.display = 'none';
        switchText.textContent = "Hesabınız yok mu?";
        switchLink.textContent = "Kayıt Ol";
    } else {
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'flex';
        switchText.textContent = "Zaten hesabınız var mı?";
        switchLink.textContent = "Giriş Yap";
    }
});

// Login function
loginBtn.addEventListener('click', async () => {
    if (!validateForm()) return;
    
    const email = emailInput.value;
    const password = passwordInput.value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html";
    } catch (error) {
        alert("Giriş başarısız: " + error.message);
    }
});

// Register function
registerBtn.addEventListener('click', async () => {
    if (!validateForm()) return;
    
    const email = emailInput.value;
    const password = passwordInput.value;
    const username = email.split('@')[0];
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        
        // Create user profile in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            email: email,
            username: username,
            createdAt: new Date(),
            friends: [],
            friendRequests: [],
            status: "online"
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
