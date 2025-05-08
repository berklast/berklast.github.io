import { 
  auth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from './firebase.js';

// Giriş Yap
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "/dashboard.html";
  } catch (error) {
    document.getElementById('email-error').textContent = "Hatalı giriş bilgileri!";
    document.getElementById('email-error').style.display = 'block';
  }
});

// Kayıt Ol
document.getElementById('signup-btn').addEventListener('click', () => {
  window.location.href = "/register.html";
});
