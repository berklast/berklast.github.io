document.addEventListener('DOMContentLoaded', () => {
  // Sadece auth.html sayfasında çalışacak kodlar
  if (window.location.pathname.includes('auth.html')) {
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authSubmit = document.getElementById('auth-submit');
    const switchMode = document.getElementById('switch-mode');
    const forgotPassword = document.getElementById('forgot-password');
    const nameField = document.getElementById('name-field');
    const photoField = document.getElementById('photo-field');
    
    // URL'den modu kontrol et (login veya register)
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'login';
    
    // Moda göre formu ayarla
    if (mode === 'register') {
      setRegisterMode();
    } else {
      setLoginMode();
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
    
    // Şifremi unuttum butonu
    forgotPassword.addEventListener('click', (e) => {
      e.preventDefault();
      const email = prompt('Şifrenizi sıfırlamak için e-posta adresinizi girin:');
      if (email) {
        sendPasswordResetEmail(email);
      }
    });
    
    // Form gönderimi
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      if (authSubmit.textContent === 'Giriş Yap') {
        // Giriş yap
        loginUser(email, password);
      } else {
        // Kayıt ol
        const name = document.getElementById('name').value;
        const photoFile = document.getElementById('photo').files[0];
        registerUser(email, password, name, photoFile);
      }
    });
    
    // Mod ayarlama fonksiyonları
    function setRegisterMode() {
      authTitle.textContent = 'Hesap Oluştur';
      authSubtitle.textContent = 'Yeni bir hesap oluşturun';
      authSubmit.textContent = '
