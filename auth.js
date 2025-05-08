import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  db,
  doc,
  setDoc,
  serverTimestamp
} from './firebase.js';

// Kayıt Ol Fonksiyonu
document.getElementById('register-btn')?.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Firestore'da kullanıcı profili oluştur
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: "online",
      friends: [],
      settings: {
        theme: "dark",
        notifications: true
      }
    });
    
    // Hoş geldin e-postası gönder (Firebase Functions ile entegre edilebilir)
    window.location.href = "dashboard.html";
  } catch (error) {
    // Hata yönetimi
  }
});

// Şifre Sıfırlama
document.getElementById('reset-btn')?.addEventListener('click', async () => {
  const email = document.getElementById('reset-email').value;
  
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi");
    window.location.href = "login.html";
  } catch (error) {
    // Hata yönetimi
  }
});
