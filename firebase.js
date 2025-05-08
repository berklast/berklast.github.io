import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase konfigürasyonunuz (sizin bilgilerinizle)
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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Kullanılacak fonksiyonları export et
export { 
  app,
  analytics,
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  addDoc
};
