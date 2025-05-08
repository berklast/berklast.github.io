import { 
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  db,
  doc,
  setDoc,
  serverTimestamp
} from './firebase.js';

// DOM Elementleri
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');

// Doğrulama Fonksiyonları
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

// Hata Göster/Gizle
function showError(element, message) {
  element.style.display = 'block';
  element.textContent = message;
}

function hideError(element) {
  element.style.display = 'none';
}

// Input Event Listeners
emailInput.addEventListener('input', () => {
  if (!validateEmail(emailInput.value)) {
    emailInput.classList.add('input-error');
    showError(emailError, 'Geçerli bir e-posta adresi girin (@ işareti içermeli)');
  } else {
    emailInput.classList.remove('input-error');
    hideError(emailError);
  }
});

passwordInput.addEventListener('input', () => {
  if (!validatePassword(passwordInput.value)) {
    passwordInput.classList.add('input-error');
    showError(passwordError, 'Şifre en az 6 karakter olmalı');
  } else {
    passwordInput.classList.remove('input-error');
    hideError(passwordError);
  }
});

// Kayıt Ol Fonksiyonu
document.getElementById('signup-btn').addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  // Doğrulamalar
  if (!validateEmail(email)) {
    showError(emailError, 'Lütfen geçerli bir e-posta girin');
    emailInput.classList.add('input-error');
    return;
  }

  if (!validatePassword(password)) {
    showError(passwordError, 'Şifre en az 6 karakter olmalı');
    passwordInput.classList.add('input-error');
    return;
  }

  try {
    // Kayıt işlemi
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Firestore'a kullanıcı bilgilerini kaydet
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: "online"
    });

    // Başarılı kayıt sonrası yönlendirme
    window.location.href = "dashboard.html";
    
  } catch (error) {
    console.error("Kayıt hatası:", error);
    
    // Firebase hata mesajlarını kullanıcı dostu hale getir
    let errorMessage = "Kayıt sırasında bir hata oluştu";
    switch(error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Bu e-posta adresi zaten kullanımda";
        break;
      case "auth/weak-password":
        errorMessage = "Şifre en az 6 karakter olmalı";
        break;
      case "auth/invalid-email":
        errorMessage = "Geçersiz e-posta formatı";
        break;
    }
    
    showError(emailError, errorMessage);
    emailInput.classList.add('input-error');
  }
});

// Giriş Yap Butonu
document.getElementById('login-btn').addEventListener('click', () => {
  window.location.href = "login.html"; // Ayrı bir giriş sayfası
});
