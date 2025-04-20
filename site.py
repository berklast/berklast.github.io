<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kişisel Portal</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        header {
            background-color: #2c3e50;
            color: white;
            padding: 20px 0;
            text-align: center;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .form-container {
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .content {
            display: none;
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        input {
            padding: 10px;
            width: 100%;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 10px;
            box-sizing: border-box;
        }
        button {
            padding: 10px 15px;
            background-color: #2c3e50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
        }
        button:hover {
            background-color: #1a252f;
        }
        .message {
            margin: 10px 0;
            padding: 10px;
            border-radius: 4px;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
        }
        .info {
            background-color: #d1ecf1;
            color: #0c5460;
        }
        .form-switch {
            text-align: center;
            margin-top: 15px;
        }
        .form-switch a {
            color: #2c3e50;
            cursor: pointer;
            text-decoration: underline;
        }
        footer {
            text-align: center;
            margin-top: 20px;
            padding: 10px;
            font-size: 0.8em;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Kişisel Portal</h1>
            <p>Hesabınıza giriş yapın veya kayıt olun</p>
        </header>

        <!-- Giriş Formu -->
        <div class="form-container" id="loginForm">
            <h2>Giriş Yap</h2>
            <div id="loginMessage" class="message" style="display: none;"></div>
            <input type="email" id="loginEmail" placeholder="E-posta">
            <input type="password" id="loginPassword" placeholder="Şifre">
            <button onclick="login()">Giriş Yap</button>
            <div class="form-switch">
                Hesabınız yok mu? <a onclick="showRegisterForm()">Kayıt Olun</a>
            </div>
        </div>

        <!-- Kayıt Formu -->
        <div class="form-container" id="registerForm" style="display: none;">
            <h2>Kayıt Ol</h2>
            <div id="registerMessage" class="message" style="display: none;"></div>
            <input type="text" id="registerName" placeholder="Adınız">
            <input type="email" id="registerEmail" placeholder="E-posta">
            <input type="password" id="registerPassword" placeholder="Şifre">
            <input type="password" id="registerPasswordConfirm" placeholder="Şifre (Tekrar)">
            <button onclick="register()">Kayıt Ol</button>
            <div class="form-switch">
                Zaten hesabınız var mı? <a onclick="showLoginForm()">Giriş Yapın</a>
            </div>
        </div>

        <!-- Doğrulama Formu -->
        <div class="form-container" id="verifyForm" style="display: none;">
            <h2>E-posta Doğrulama</h2>
            <div id="verifyMessage" class="message info">
                <strong>SIMÜLASYON:</strong> E-postanıza 6 haneli bir kod gönderildi. (Gerçekte gönderilmez)
                <br>Kod: <strong id="verificationCodeDisplay"></strong>
            </div>
            <input type="text" id="verificationCode" placeholder="Doğrulama Kodu">
            <button onclick="verifyEmail()">Doğrula</button>
        </div>

        <!-- Kullanıcı İçeriği -->
        <div class="content" id="userContent">
            <h2>Hoş Geldiniz, <span id="userName"></span>!</h2>
            <p>E-posta: <span id="userEmail"></span></p>
            
            <h3>Kişisel Bilgiler</h3>
            <p>Bu alanı kişisel bilgilerinizle doldurabilirsiniz.</p>
            
            <button onclick="logout()" style="background-color: #dc3545; margin-top: 20px;">Çıkış Yap</button>
        </div>

        <footer>
            &copy; 2023 Kişisel Portal. Tüm hakları saklıdır.
        </footer>
    </div>

    <script>
        // Kullanıcı verilerini saklamak için
        let users = JSON.parse(localStorage.getItem('users')) || [];
        let currentUser = null;
        let verificationCode = null;

        // Formları göster/gizle
        function showLoginForm() {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('verifyForm').style.display = 'none';
            clearMessages();
        }

        function showRegisterForm() {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'block';
            document.getElementById('verifyForm').style.display = 'none';
            clearMessages();
        }

        function showVerifyForm(email) {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('verifyForm').style.display = 'block';
            
            // Rastgele doğrulama kodu oluştur
            verificationCode = Math.floor(100000 + Math.random() * 900000);
            document.getElementById('verificationCodeDisplay').textContent = verificationCode;
            
            // SIMÜLASYON: Gerçekte burada e-posta gönderilirdi
            console.log(`Doğrulama kodu ${email} adresine gönderildi: ${verificationCode}`);
        }

        function showUserContent() {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('verifyForm').style.display = 'none';
            document.getElementById('userContent').style.display = 'block';
            
            document.getElementById('userName').textContent = currentUser.name;
            document.getElementById('userEmail').textContent = currentUser.email;
        }

        function clearMessages() {
            document.getElementById('loginMessage').style.display = 'none';
            document.getElementById('registerMessage').style.display = 'none';
        }

        // Kayıt işlemi
        function register() {
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            const messageElement = document.getElementById('registerMessage');
            
            // Validasyon
            if (!name || !email || !password || !passwordConfirm) {
                messageElement.textContent = 'Lütfen tüm alanları doldurun.';
                messageElement.className = 'message error';
                messageElement.style.display = 'block';
                return;
            }
            
            if (password !== passwordConfirm) {
                messageElement.textContent = 'Şifreler eşleşmiyor.';
                messageElement.className = 'message error';
                messageElement.style.display = 'block';
                return;
            }
            
            if (password.length < 6) {
                messageElement.textContent = 'Şifre en az 6 karakter olmalıdır.';
                messageElement.className = 'message error';
                messageElement.style.display = 'block';
                return;
            }
            
            // E-posta kontrolü
            const emailExists = users.some(user => user.email === email);
            if (emailExists) {
                messageElement.textContent = 'Bu e-posta adresi zaten kayıtlı.';
                messageElement.className = 'message error';
                messageElement.style.display = 'block';
                return;
            }
            
            // Kullanıcıyı kaydet (henüz doğrulanmamış)
            const newUser = {
                name: name,
                email: email,
                password: password, // Gerçek uygulamada şifre hash'lenmeli
                verified: false
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Doğrulama formunu göster
            currentUser = newUser;
            showVerifyForm(email);
        }

        // E-posta doğrulama
        function verifyEmail() {
            const enteredCode = document.getElementById('verificationCode').value.trim();
            const messageElement = document.getElementById('verifyMessage');
            
            if (enteredCode === verificationCode.toString()) {
                // Kullanıcıyı doğrulanmış olarak işaretle
                const userIndex = users.findIndex(user => user.email === currentUser.email);
                if (userIndex !== -1) {
                    users[userIndex].verified = true;
                    localStorage.setItem('users', JSON.stringify(users));
                    currentUser.verified = true;
                    
                    // Kullanıcı içeriğini göster
                    showUserContent();
                }
            } else {
                messageElement.textContent = 'Hatalı doğrulama kodu. Lütfen tekrar deneyin.';
                messageElement.className = 'message error';
            }
        }

        // Giriş işlemi
        function login() {
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const messageElement = document.getElementById('loginMessage');
            
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                if (user.verified) {
                    currentUser = user;
                    showUserContent();
                } else {
                    currentUser = user;
                    showVerifyForm(email);
                    messageElement.textContent = 'E-postanız doğrulanmamış. Lütfen doğrulama kodunu girin.';
                    messageElement.className = 'message error';
                    messageElement.style.display = 'block';
                }
            } else {
                messageElement.textContent = 'Hatalı e-posta veya şifre.';
                messageElement.className = 'message error';
                messageElement.style.display = 'block';
            }
        }

        // Çıkış işlemi
        function logout() {
            currentUser = null;
            document.getElementById('userContent').style.display = 'none';
            showLoginForm();
        }

        // Sayfa yüklendiğinde giriş formunu göster
        window.onload = showLoginForm;
    </script>
</body>
</html>