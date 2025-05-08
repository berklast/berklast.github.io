import { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  doc,
  setDoc,
  serverTimestamp
} from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const signupBtn = document.getElementById('signup-btn');
  const loginBtn = document.getElementById('login-btn');

  // Kayıt Ol
  signupBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user);
      alert('Kayıt başarılı!');
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  });

  // Giriş Yap
  loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Giriş başarılı!');
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  });

  // Kullanıcı Profili Oluşturma
  async function createUserProfile(user) {
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      username: user.email.split('@')[0],
      status: "online",
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp()
    });
  }

  // Oturum Durumu Takibi
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log("Oturum açık:", user.email);
      updateUserStatus(user.uid, "online");
    } else {
      console.log("Oturum kapalı");
    }
  });

  async function updateUserStatus(uid, status) {
    await setDoc(doc(db, "users", uid), {
      status: status,
      lastSeen: serverTimestamp()
    }, { merge: true });
  }
});
