// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDH5GBWQNoZv7LZZ2MbFjh-twI1jZuYqK0",
  authDomain: "newdc-d6404.firebaseapp.com",
  projectId: "newdc-d6404",
  storageBucket: "newdc-d6404.appspot.com", // .appspot.com olarak düzeltildi
  messagingSenderId: "101292652984",
  appId: "1:101292652984:web:59d6b49b400572bec1774d",
  measurementId: "G-NV86JDVJ27"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; // Diğer dosyalarda kullanmak için export
