import { 
  auth, 
  db, 
  signOut,
  onAuthStateChanged,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc
} from './firebase.js';

// Tüm arkadaşlık istekleri ve mesajlaşma fonksiyonları
class ChatApp {
  constructor() {
    this.initAuth();
    this.initUI();
  }
  
  initAuth() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = user;
        this.loadUserData();
        this.setupListeners();
      } else {
        window.location.href = "login.html";
      }
    });
  }
  
  // Diğer metodlar...
}

new ChatApp();
