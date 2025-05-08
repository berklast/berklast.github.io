import { auth, sendPasswordResetEmail } from './firebase.js';

document.getElementById('reset-btn').addEventListener('click', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const emailError = document.getElementById('email-error');

  emailError.style.display = 'none';

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!");
    window.location.href = "/login.html";
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    
    switch(error.code) {
      case "auth/invalid-email":
        emailError.textContent = "Geçersiz e-posta formatı";
        break;
      case "auth/user-not-found":
        emailError.textContent = "Bu e-posta kayıtlı değil";
        break;
      default:
        emailError.textContent = "Hata: " + error.message;
    }
    
    emailError.style.display = 'block';
  }
});
