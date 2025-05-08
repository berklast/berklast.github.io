import { auth, createUserWithEmailAndPassword } from './firebase.js';

document.getElementById('register-btn').addEventListener('click', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const confirmError = document.getElementById('confirm-error');

  // Hataları temizle
  emailError.style.display = 'none';
  passwordError.style.display = 'none';
  confirmError.style.display = 'none';

  // Doğrulamalar
  if (password !== confirmPassword) {
    confirmError.textContent = "Şifreler eşleşmiyor!";
    confirmError.style.display = 'block';
    return;
  }

  if (password.length < 6) {
    passwordError.textContent = "Şifre en az 6 karakter olmalı!";
    passwordError.style.display = 'block';
    return;
  }

  try {
    // Kayıt ol
    await createUserWithEmailAndPassword(auth, email, password);
    
    // Başarılı kayıt
    alert("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
    window.location.href = "/dashboard.html";
  } catch (error) {
    console.error("Kayıt hatası:", error);
    
    switch(error.code) {
      case "auth/email-already-in-use":
        emailError.textContent = "Bu e-posta zaten kullanımda";
        break;
      case "auth/invalid-email":
        emailError.textContent = "Geçersiz e-posta formatı";
        break;
      case "auth/weak-password":
        passwordError.textContent = "Şifre en az 6 karakter olmalı";
        break;
      default:
        emailError.textContent = "Kayıt başarısız: " + error.message;
    }
    
    emailError.style.display = 'block';
  }
});
