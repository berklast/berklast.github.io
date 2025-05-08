<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NewDC | Giriş Yap</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #5865F2;
            --primary-dark: #4752C4;
            --secondary: #ED4245;
            --dark: #23272A;
            --light: #FFFFFF;
            --gray: #99AAB5;
            --bg: #F8F9FA;
            --success: #3BA55C;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: var(--light);
        }
        
        .auth-container {
            width: 100%;
            max-width: 420px;
            padding: 2rem;
        }
        
        .auth-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
            border-radius: 16px;
            padding: 2.5rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }
        
        .auth-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
        }
        
        .logo-icon {
            font-size: 2rem;
            margin-right: 0.75rem;
        }
        
        .logo-text {
            font-size: 1.75rem;
            font-weight: 700;
        }
        
        .auth-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .auth-subtitle {
            opacity: 0.8;
            font-size: 0.95rem;
        }
        
        .auth-form .form-group {
            margin-bottom: 1.5rem;
            position: relative;
        }
        
        .auth-form label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            font-size: 0.9rem;
        }
        
        .auth-form input {
            width: 100%;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.1);
            color: var(--light);
            font-size: 0.95rem;
            transition: all 0.3s ease;
        }
        
        .auth-form input::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }
        
        .auth-form input:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.6);
            background: rgba(255, 255, 255, 0.15);
        }
        
        .password-toggle {
            position: absolute;
            right: 12px;
            top: 38px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        
        .password-toggle:hover {
            opacity: 1;
        }
        
        .btn {
            width: 100%;
            padding: 0.75rem;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .btn-primary {
            background: var(--light);
            color: var(--primary);
            margin-bottom: 1rem;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .auth-footer {
            text-align: center;
            margin-top: 1.5rem;
            font-size: 0.9rem;
        }
        
        .auth-footer a {
            color: var(--light);
            font-weight: 500;
            text-decoration: none;
            transition: opacity 0.2s;
        }
        
        .auth-footer a:hover {
            opacity: 0.8;
            text-decoration: underline;
        }
        
        .mode-switch {
            margin-top: 1rem;
        }
        
        /* Kayıt formu için ek alanlar */
        #name-field, #photo-field {
            display: none;
        }
        
        .photo-upload {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-top: 0.5rem;
        }
        
        .photo-preview {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .photo-label {
            background: rgba(255, 255, 255, 0.1);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 0.2s;
        }
        
        .photo-label:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        #photo {
            display: none;
        }
        
        /* Responsive */
        @media (max-width: 480px) {
            .auth-card {
                padding: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <div class="logo">
                    <i class="fas fa-comment-dots logo-icon"></i>
                    <span class="logo-text">NewDC</span>
                </div>
                <h2 class="auth-title" id="auth-title">Hesabınıza Giriş Yapın</h2>
                <p class="auth-subtitle" id="auth-subtitle">Devam etmek için lütfen giriş yapın</p>
            </div>
            
            <form class="auth-form" id="auth-form">
                <div id="name-field" class="form-group">
                    <label for="name">Kullanıcı Adı</label>
                    <input type="text" id="name" name="name" placeholder="En az 3 karakter" minlength="3">
                </div>
                
                <div class="form-group">
                    <label for="email">E-posta Adresi</label>
                    <input type="email" id="email" name="email" placeholder="email@ornek.com" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Şifre</label>
                    <input type="password" id="password" name="password" placeholder="En az 6 karakter" minlength="6" required>
                    <i class="fas fa-eye password-toggle" id="toggle-password"></i>
                </div>
                
                <div id="photo-field" class="form-group">
                    <label>Profil Fotoğrafı</label>
                    <div class="photo-upload">
                        <img src="https://via.placeholder.com/50" alt="Profil Önizleme" class="photo-preview" id="photo-preview">
                        <label for="photo" class="photo-label">Fotoğraf Seç</label>
                        <input type="file" id="photo" name="photo" accept="image/*">
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary" id="auth-submit">Giriş Yap</button>
                
                <div class="auth-footer">
                    <div class="mode-switch">
                        <span id="switch-text">Hesabınız yok mu?</span>
                        <a href="#" id="switch-mode">Kayıt Ol</a>
                    </div>
                    <a href="#" id="forgot-password">Şifremi Unuttum</a>
                </div>
            </form>
        </div>
    </div>

    <script>
        // Mod değiştirme (Giriş/Kayıt)
        const authTitle = document.getElementById('auth-title');
        const authSubtitle = document.getElementById('auth-subtitle');
        const authSubmit = document.getElementById('auth-submit');
        const switchMode = document.getElementById('switch-mode');
        const switchText = document.getElementById('switch-text');
        const forgotPassword = document.getElementById('forgot-password');
        const nameField = document.getElementById('name-field');
        const photoField = document.getElementById('photo-field');
        const photoInput = document.getElementById('photo');
        const photoPreview = document.getElementById('photo-preview');
        const togglePassword = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('password');
        
        // URL'den mod kontrolü
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode === 'register') {
            setRegisterMode();
        }
        
        // Mod değiştirme butonu
        switchMode.addEventListener('click', (e) => {
            e.preventDefault();
            if (authSubmit.textContent === 'Giriş Yap') {
                setRegisterMode();
            } else {
                setLoginMode();
            }
        });
        
        // Şifre göster/gizle
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye-slash');
        });
        
        // Fotoğraf önizleme
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    photoPreview.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        
        function setRegisterMode() {
            authTitle.textContent = 'Hesap Oluştur';
            authSubtitle.textContent = 'Yeni bir hesap oluşturmak için bilgilerinizi girin';
            authSubmit.textContent = 'Kayıt Ol';
            switchText.textContent = 'Zaten hesabınız var mı?';
            switchMode.textContent = 'Giriş Yap';
            forgotPassword.style.display = 'none';
            nameField.style.display = 'block';
            photoField.style.display = 'block';
        }
        
        function setLoginMode() {
            authTitle.textContent = 'Hesabınıza Giriş Yapın';
            authSubtitle.textContent = 'Devam etmek için lütfen giriş yapın';
            authSubmit.textContent = 'Giriş Yap';
            switchText.textContent = 'Hesabınız yok mu?';
            switchMode.textContent = 'Kayıt Ol';
            forgotPassword.style.display = 'block';
            nameField.style.display = 'none';
            photoField.style.display = 'none';
        }
    </script>
</body>
</html>
