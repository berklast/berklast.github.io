// Kullanıcı verileri
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = null;

// Giriş yap
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('mainPanel').style.display = 'block';
        document.getElementById('currentUser').textContent = currentUser.username;
        listUsers();
    } else {
        alert("Hatalı giriş!");
    }
}

// Kayıt ol
function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const profilePic = document.getElementById('profilePicUpload').files[0];

    if (users.find(u => u.username === username)) {
        alert("Kullanıcı adı alınmış!");
        return;
    }

    const newUser = { username, password, profilePic: URL.createObjectURL(profilePic), friends: [] };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
    hideRegister();
}

// Kullanıcıları listeleme
function listUsers() {
    const userListDiv = document.getElementById('userList');
    userListDiv.innerHTML = '';

    users.forEach(user => {
        if (user.username !== currentUser.username) {
            userListDiv.innerHTML += `
                <div>
                    <img src="${user.profilePic || 'default-profile.png'}" width="40">
                    <span>${user.username}</span>
                    <button onclick="sendFriendRequest('${user.username}')">İstek Gönder</button>
                </div>`;
        }
    });
}

// Arkadaşlık isteği gönderme
function sendFriendRequest(friendUsername) {
    const friend = users.find(u => u.username === friendUsername);
    if (friend) {
        friend.friends.push(currentUser.username);
        localStorage.setItem('users', JSON.stringify(users));
        alert(`${friend.username} artık arkadaşınız!`);
    }
}

// Mesajlaşma
function sendMessage() {
    const message = document.getElementById('messageInput').value;
    if (message) {
        document.getElementById('chatMessages').innerHTML += `<p><strong>${currentUser.username}:</strong> ${message}</p>`;
        document.getElementById('messageInput').value = '';
    }
}

// Çıkış yap
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('mainPanel').style.display = 'none';
}
