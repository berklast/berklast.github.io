// auth.js
import { 
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  db,
  doc,
  setDoc
} from './firebase.js';

document.getElementById('register-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    
    // Firestore'a kullanıcı kaydı
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      username: email.split('@')[0],
      createdAt: new Date(),
      friends: []
    });
    
    alert('Kayıt başarılı! Lütfen e-postanızı doğrulayın.');
  } catch (error) {
    alert('Hata: ' + error.message);
    console.error(error);
  }
});

document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert('Giriş başarılı! Yönlendiriliyorsunuz...');
    window.location.href = 'dashboard.html';
  } catch (error) {
    alert('Hata: ' + error.message);
    console.error(error);
  }
});
