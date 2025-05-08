import { 
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp
} from './firebase.js';

document.getElementById('register-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!validateEmail(email)) {
    alert("Geçerli bir email adresi girin!");
    return;
  }
  
  if (password.length < 6) {
    alert("Şifre en az 6 karakter olmalıdır!");
    return;
  }

  try {
    // 1. Kullanıcı oluştur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // 2. Doğrulama maili gönder
    await sendEmailVerification(userCredential.user);
    
    // 3. Firestore'a kullanıcı kaydet
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      username: email.split('@')[0],
      createdAt: serverTimestamp(),
      friends: [],
      friendRequests: [],
      status: "online",
      lastSeen: serverTimestamp()
    });

    alert('Kayıt başarılı! Doğrulama linki e-postanıza gönderildi.');
  } catch (error) {
    alert("Hata: " + error.message);
    console.error("Kayıt hatası:", error);
  }
});

document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Çevrimiçi durumu güncelle
    await updateDoc(doc(db, "users", userCredential.user.uid), {
      status: "online",
      lastSeen: serverTimestamp()
    });
    
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Giriş hatası: " + error.message);
    console.error("Giriş hatası:", error);
  }
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Sayfa kapatılırken çevrimdışı yap
window.addEventListener('beforeunload', async () => {
  if (auth.currentUser) {
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      status: "offline",
      lastSeen: serverTimestamp()
    });
  }
});
