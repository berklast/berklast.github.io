// Arkadaş arama ve ekleme fonksiyonları
function initializeFriendSystem() {
    const searchBtn = document.getElementById('searchFriendBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchFriends);
    }

    // Enter tuşu ile arama
    const searchInput = document.getElementById('friendSearchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchFriends();
        });
    }
}

function searchFriends() {
    const searchTerm = document.getElementById('friendSearchInput').value.trim();
    if (!searchTerm) {
        alert("Lütfen bir arama terimi girin!");
        return;
    }

    const db = firebase.firestore();
    db.collection("users")
        .where("name", ">=", searchTerm)
        .where("name", "<=", searchTerm + '\uf8ff')
        .get()
        .then((querySnapshot) => {
            const resultsContainer = document.getElementById('friendSearchResults');
            resultsContainer.innerHTML = '';

            if (querySnapshot.empty) {
                resultsContainer.innerHTML = '<p>Kullanıcı bulunamadı.</p>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const user = doc.data();
                if (user.email !== firebase.auth().currentUser.email) {
                    const userElement = document.createElement('div');
                    userElement.className = 'user-result';
                    userElement.innerHTML = `
                        <span>${user.name} (${user.email})</span>
                        <button class="add-friend-btn" data-uid="${doc.id}">Ekle</button>
                    `;
                    resultsContainer.appendChild(userElement);
                }
            });

            // Ekle butonlarına event ekle
            document.querySelectorAll('.add-friend-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    addFriend(btn.getAttribute('data-uid'));
                });
            });
        })
        .catch((error) => {
            console.error("Arama hatası:", error);
            alert("Arama sırasında hata oluştu!");
        });
}

function addFriend(friendUID) {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) return;

    const db = firebase.firestore();
    db.collection("friend_requests").add({
        from: currentUser.uid,
        to: friendUID,
        status: "pending",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert("Arkadaşlık isteği gönderildi!");
    })
    .catch((error) => {
        console.error("Arkadaş ekleme hatası:", error);
        alert("İstek gönderilemedi!");
    });
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', initializeFriendSystem);
