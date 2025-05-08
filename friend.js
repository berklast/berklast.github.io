import { 
  db,
  collection,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs
} from './firebase.js';

// Arkadaş isteği gönderme
async function sendFriendRequest(fromUserId, toEmail) {
  try {
    // E-posta ile kullanıcı bulma
    const q = query(collection(db, "users"), where("email", "==", toEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error("Bu e-posta ile kayıtlı kullanıcı bulunamadı");
    }
    
    const toUser = querySnapshot.docs[0];
    const toUserId = toUser.id;
    
    // İstek oluşturma
    await setDoc(doc(collection(db, "friendRequests")), {
      from: fromUserId,
      to: toUserId,
      status: "pending",
      createdAt: serverTimestamp()
    });
    
    // Alıcının istek listesini güncelle
    await updateDoc(doc(db, "users", toUserId), {
      friendRequests: arrayUnion(fromUserId)
    });
    
    console.log("Arkadaşlık isteği gönderildi");
  } catch (error) {
    console.error("İstek gönderilemedi:", error);
  }
}

// İstek kabul etme
async function acceptFriendRequest(requestId, fromUserId, toUserId) {
  try {
    // İstek durumunu güncelle
    await updateDoc(doc(db, "friendRequests", requestId), {
      status: "accepted"
    });
    
    // Her iki kullanıcıyı da birbirinin arkadaş listesine ekle
    await updateDoc(doc(db, "users", fromUserId), {
      friends: arrayUnion(toUserId)
    });
    
    await updateDoc(doc(db, "users", toUserId), {
      friends: arrayUnion(fromUserId),
      friendRequests: arrayRemove(fromUserId)
    });
    
    console.log("Arkadaşlık isteği kabul edildi");
  } catch (error) {
    console.error("İstek kabul edilemedi:", error);
  }
}
