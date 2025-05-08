import {
  db,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from './firebase.js';

// Mesaj gönderme
async function sendMessage(senderId, receiverId, text) {
  try {
    const messageData = {
      text: text,
      senderId: senderId,
      users: [senderId, receiverId],
      timestamp: serverTimestamp(),
      isRead: false
    };
    
    if (!receiverId) {
      messageData.channel = "general";
      delete messageData.users;
    }
    
    await addDoc(collection(db, "messages"), messageData);
    console.log("Mesaj başarıyla gönderildi");
  } catch (error) {
    console.error("Mesaj gönderilemedi:", error);
  }
}

// Gerçek zamanlı mesaj dinleyici
function setupMessageListener(userId, callback) {
  const q = query(
    collection(db, "messages"),
    where("users", "array-contains", userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  });
}
