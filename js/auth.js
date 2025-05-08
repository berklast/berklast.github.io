import { auth, signInWithEmailAndPassword } from './firebase.js';

document.getElementById('login-btn').addEventListener('click', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "/dashboard.html";
  } catch (error) {
    document.getElementById('password-error').textContent = "Hatalı giriş bilgileri!";
    document.getElementById('password-error').style.display = 'block';
  }
});
