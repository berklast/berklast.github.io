import { 
  auth,
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from './firebase.js';

// Kayıt fonksiyonu güncellemesi
async function register(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      username: email.split('@')[0],
      createdAt: serverTimestamp(),
      friends: [],
      friendRequests: [],
      status: "online",
      lastSeen: serverTimestamp()
    });
    
    console.log("Kullanıcı başarıyla oluşturuldu:", userCredential.user.uid);
  } catch (error) {
    console.error("Kayıt hatası:", error);
  }
}

// Kullanıcı verilerini çekme
async function getUserData(userId) {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("Kullanıcı verisi bulunamadı!");
    return null;
  }
}
