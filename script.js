let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = null;

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

function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const profilePic = document.getElementById('profilePicUpload').files[0];

    if (!username || !password || !profilePic) {
        alert("Tüm alanları doldurun!");
        return;
    }

    if (users.find(u => u.username === username)) {
        alert("Kullanıcı adı alınmış!");
        return;
    }

    const newUser = {
        username,
        password,
        profilePic: URL.createObjectURL(profilePic),
        friends: []
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
    hideRegister();
}
