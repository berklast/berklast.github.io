import { 
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  db,
  doc,
  setDoc,
  serverTimestamp
} from './firebase.js';

// Hata mesajını göster
function showError(message) {
  const errorElement = document.getElementById('auth-error');
  errorElement.textContent = message;
  setTimeout(() => errorElement.textContent = '', 5000);
}

// Kayıt Ol
document.getElementById('signup-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Firestore'da kullanıcı profili oluştur
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    
    alert("Kayıt başarılı! Giriş yapılıyor...");
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Kayıt hatası:", error);
    showError(error.message);
  }
});

// Giriş Yap
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    
    // Son giriş zamanını güncelle
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      lastLogin: serverTimestamp()
    }, { merge: true });
    
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Giriş hatası:", error);
    showError(error.message);
  }
});
