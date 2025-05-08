// auth.js
import { auth, db } from './firebase.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Kayıt fonksiyonu
async function register(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    
    // Firestore'a kullanıcı kaydı
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      username: email.split('@')[0],
      createdAt: new Date()
    });
    
    console.log("Kayıt başarılı!");
  } catch (error) {
    console.error("Kayıt hatası:", error.message);
    alert("Kayıt hatası: " + error.message);
  }
}

// Giriş fonksiyonu
async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Giriş başarılı!");
  } catch (error) {
    console.error("Giriş hatası:", error.message);
    alert("Giriş hatası: " + error.message);
  }
}
