import { 
  auth, 
  signInWithEmailAndPassword 
} from './firebase.js';

// Giriş Yap Butonu
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Giriş başarılı:", userCredential.user);
    window.location.href = "/dashboard.html";
  } catch (error) {
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

// Kayıt Ol Butonu
document.getElementById('signup-btn').addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = "/register.html";
});
