// firebase-config.js
// Firebase SDK'larından gerekli fonksiyonları içeri aktarın
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; // Kullanıcı isteği üzerine eklendi
import { getAuth } from "firebase/auth"; // Authentication servisi için
import { getFirestore } from "firebase/firestore"; // Firestore servisi için

// Web uygulamanızın Firebase yapılandırması
// Bu bilgiler Firebase konsolunuzdan alınmıştır.
const firebaseConfig = {
  apiKey: "AIzaSyDH5GBWQNoZv7LZZ2MbFjh-twI1jZuYqK0",
  authDomain: "newdc-d6404.firebaseapp.com",
  projectId: "newdc-d6404",
  storageBucket: "newdc-d6404.firebasestorage.app",
  messagingSenderId: "101292652984",
  appId: "1:101292652984:web:59d6b49b400572bec1774d",
  measurementId: "G-NV86JDVJ27"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Analytics servisini başlat (kullanıcı isteği üzerine)
const analytics = getAnalytics(app);

// Firebase servislerini dışa aktar
export const auth = getAuth(app);
export const db = getFirestore(app);
// İsterseniz analytics'i de dışa aktarabilirsiniz:
// export const analytics = getAnalytics(app);
