import { 
  auth, 
  signInWithEmailAndPassword 
} from './firebase.js';

document.getElementById('login-btn').addEventListener('click', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');

  // Hataları temizle
  emailError.style.display = 'none';
  passwordError.style.display = 'none';

  try {
    // Giriş yap
    await signInWithEmailAndPassword(auth, email, password);
    
    // Başarılı giriş
    window.location.href = "/dashboard.html";
  } catch (error) {
    // Hata yönetimi
    console.error("Giriş hatası:", error);
    
    switch(error.code) {
      case "auth/invalid-email":
        emailError.textContent = "Geçersiz e-posta formatı";
        emailError.style.display = 'block';
        break;
      case "auth/user-not-found":
        emailError.textContent = "Bu e-posta kayıtlı değil";
        emailError.style.display = 'block';
        break;
      case "auth/wrong-password":
        passwordError.textContent = "Hatalı şifre";
        passwordError.style.display = 'block';
        break;
      default:
        emailError.textContent = "Giriş başarısız: " + error.message;
        emailError.style.display = 'block';
    }
  }
});
