import { 
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  doc,
  setDoc
} from './firebase.js';

// DOM Elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');

// Kayıt Ol Fonksiyonu (Düzeltilmiş)
async function registerUser(email, password) {
  try {
    // 1. Kullanıcı oluştur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // 2. E-posta doğrulama gönder
    await sendEmailVerification(userCredential.user);
    
    // 3. Firestore'da kullanıcı dokümanı oluştur
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      username: email.split('@')[0],
      createdAt: new Date(),
      friends: [],
      friendRequests: [],
      status: "offline",
      lastSeen: null
    });
    
    alert('Kayıt başarılı! Lütfen e-postanızı doğrulayın.');
    return true;
  } catch (error) {
    console.error("Kayıt hatası:", error);
    alert(`Kayıt hatası: ${error.message}`);
    return false;
  }
}

// Giriş Yap Fonksiyonu (Düzeltilmiş)
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Kullanıcı durumunu güncelle
    await updateDoc(doc(db, "users", userCredential.user.uid), {
      status: "online",
      lastSeen: new Date()
    });
    
    window.location.href = "dashboard.html";
    return true;
  } catch (error) {
    console.error("Giriş hatası:", error);
    alert(`Giriş hatası: ${error.message}`);
    return false;
  }
}

// Event Listeners
registerBtn?.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  
  if (!validateEmail(email) {
    alert("Geçerli bir e-posta adresi girin!");
    return;
  }
  
  if (password.length < 6) {
    alert("Şifre en az 6 karakter olmalıdır!");
    return;
  }
  
  await registerUser(email, password);
});

loginBtn?.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  
  if (!email || !password) {
    alert("E-posta ve şifre girin!");
    return;
  }
  
  await loginUser(email, password);
});

// Basit email validasyonu
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
