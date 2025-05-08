// Import the necessary Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCxHwmk04MmfvpL53N58WcUwZ7KQjCy5SA",
  authDomain: "mesajpro-e97fc.firebaseapp.com",
  projectId: "mesajpro-e97fc",
  storageBucket: "mesajpro-e97fc.firebasestorage.app",
  messagingSenderId: "1011356406404",
  appId: "1:1011356406404:web:ba80c03aa0c177eb3768d1",
  measurementId: "G-LV2RYRMVVL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and Firestore
const auth = getAuth();
const db = getFirestore();
const rtdb = getDatabase();

// Show register form
function showRegisterForm() {
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
}

// Show login form
function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

// Register new user
async function registerUser() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (username.length < 3) {
        alert("Kullanıcı adı en az 3 harf olmalı!");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save additional user info (e.g., username) to Firestore or Realtime Database
        await set(ref(rtdb, 'users/' + user.uid), {
            username: username,
            email: email,
            profilePic: ""  // Placeholder for profile picture (can be added later)
        });
        
        alert("Başarıyla kayıt oldunuz!");
    } catch (error) {
        console.error("Error during registration:", error.message);
        alert(error.message);
    }
}

// Log in user
async function loginUser() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Başarıyla giriş yaptınız!");
        // Redirect to the main chat page or dashboard
        window.location.href = "chat.html";
    } catch (error) {
        console.error("Error during login:", error.message);
        alert(error.message);
    }
}

// Send password reset email
async function resetPassword() {
    const email = document.getElementById('login-email').value;

    try {
        await sendPasswordResetEmail(auth, email);
        alert("Şifre sıfırlama e-postası gönderildi!");
    } catch (error) {
        console.error("Error sending reset email:", error.message);
        alert(error.message);
    }
}
