import { 
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  db,
  doc,
  setDoc,
  serverTimestamp
} from './firebase.js';

// Kayıt Ol Fonksiyonu
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
    
    alert("Kayıt başarılı!");
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Kayıt hatası:", error);
    alert("Hata: " + error.message);
  }
});

// Giriş Yap Fonksiyonu
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    
    // Son giriş zamanını güncelle
    await setDoc(doc(db, "users", auth.currentUser.uid), {
      lastLogin: serverTimestamp()
    }, { merge: true });
    
    alert("Giriş başarılı!");
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Giriş hatası:", error);
    alert("Hata: " + error.message);
  }
});
