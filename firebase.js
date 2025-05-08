import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase konfigürasyonu (Spark/Ücretsiz plan)
const firebaseConfig = {
  apiKey: "AIzaSyDH5GBWQNoZv7LZZ2MbFjh-twI1jZuYqK0",
  authDomain: "newdc-d6404.firebaseapp.com",
  projectId: "newdc-d6404",
  storageBucket: "newdc-d6404.appspot.com",
  messagingSenderId: "101292652984",
  appId: "1:101292652984:web:59d6b49b400572bec1774d"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
  auth, 
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  doc,
  setDoc,
  serverTimestamp
};
