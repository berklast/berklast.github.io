import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCxHwmk04MmfvpL53N58WcUwZ7KQjCy5SA",
  authDomain: "mesajpro-e97fc.firebaseapp.com",
  projectId: "mesajpro-e97fc",
  storageBucket: "mesajpro-e97fc.firebasestorage.app",
  messagingSenderId: "1011356406404",
  appId: "1:1011356406404:web:ba80c03aa0c177eb3768d1",
  measurementId: "G-LV2RYRMVVL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

function showRegisterForm() {
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

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

        await set(ref(db, 'users/' + user.uid), {
            username: username,
            email: email
        });

        alert("Başarıyla kayıt oldunuz!");
        window.location.href = "chat.html";
    } catch (error) {
        console.error(error.message);
        alert("Hata: " + error.message);
    }
}

async function loginUser() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Başarıyla giriş yaptınız!");
        window.location.href = "chat.html";
    } catch (error) {
        console.error(error.message);
        alert("Hata: " + error.message);
    }
}

async function resetPassword() {
    const email = document.getElementById('login-email').value;

    try {
        await sendPasswordResetEmail(auth, email);
        alert("Şifre sıfırlama e-postası gönderildi!");
    } catch (error) {
        console.error(error.message);
        alert("Hata: " + error.message);
    }
}
