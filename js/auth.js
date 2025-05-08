// Giriş Formu
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = e.target.elements[0].value;
    const password = e.target.elements[1].value;
    alert(`Giriş başarılı: ${email}`);
    // window.location.href = "dashboard.html"; // Yönlendirme örneği
});

// Kayıt Formu
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = e.target.elements[0].value;
    const email = e.target.elements[1].value;
    const password = e.target.elements[2].value;
    alert(`Kayıt başarılı: ${email}`);
});

// Şifremi Unuttum Formu
document.getElementById('forgotPasswordForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = e.target.elements[0].value;
    alert(`Şifre sıfırlama linki gönderildi: ${email}`);
});
