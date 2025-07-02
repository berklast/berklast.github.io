document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');

    // ARKA UÇ SUNUCUNUZUN ADRESİ BURAYA GELECEK!
    // Örneğin, yerel geliştirme için: 'http://127.0.0.1:5000/chat'
    // Dağıtımdan sonra (Heroku, Render vb.): 'https://your-app-name.herokuapp.com/chat'
    const API_ENDPOINT = 'http://127.0.0.1:5000/chat'; // <-- BURAYI GÜNCELLEYİN!

    // Sohbet geçmişini saklamak için basit bir dizi
    // Gelişmiş uygulamalarda sunucu tarafında yönetilmelidir.
    const chatHistory = [];

    // Mesaj gönderme fonksiyonu
    async function sendMessage() {
        const messageText = userInput.value.trim();
        if (messageText === '') {
            return; // Boş mesaj gönderme
        }

        // Kullanıcı mesajını ekle
        addMessage(messageText, 'user');
        userInput.value = ''; // Giriş alanını temizle
        sendButton.disabled = true; // Gönder düğmesini devre dışı bırak
        userInput.disabled = true;  // Giriş alanını devre dışı bırak

        // "SKY düşünüyor..." göstergesini göster
        showTypingIndicator();

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText }),
            });

            if (!response.ok) {
                // HTTP hatası durumunda detaylı bilgi çek
                const errorData = await response.json().catch(() => ({ message: 'Sunucu hatası.' }));
                throw new Error(`API Hatası ${response.status}: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            const botResponse = data.response; // Arka uçtan gelen yanıt

            // "SKY düşünüyor..." göstergesini gizle ve gerçek yanıtı ekle
            hideTypingIndicator();
            addMessage(botResponse, 'bot');

        } catch (error) {
            console.error('Mesaj göndermede hata:', error);
            hideTypingIndicator(); // Hata durumunda da göstergeyi gizle
            addMessage('Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 'bot');
        } finally {
            sendButton.disabled = false; // Gönder düğmesini tekrar etkinleştir
            userInput.disabled = false;  // Giriş alanını tekrar etkinleştir
            userInput.focus(); // Giriş alanına odaklan
        }
    }

    // Mesajı sohbet penceresine ekleyen fonksiyon
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`, 'fade-in');

        const senderSpan = document.createElement('span');
        senderSpan.classList.add('message-sender');
        senderSpan.textContent = sender === 'user' ? 'Siz' : 'SKY';

        const textP = document.createElement('p');
        // Metin içeriğini HTML'den arındır (güvenlik için)
        textP.textContent = text; 

        const timeSpan = document.createElement('span');
        timeSpan.classList.add('message-time');
        timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(textP);
        messageDiv.appendChild(timeSpan);
        chatMessages.appendChild(messageDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight; // Sohbeti en aşağı kaydır

        // Geçmişe ekle (isteğe bağlı)
        chatHistory.push({ sender, text, time: new Date() });
    }

    // "Düşünüyor" göstergesini göster
    function showTypingIndicator() {
        typingIndicator.classList.add('visible');
        chatMessages.scrollTop = chatMessages.scrollHeight + typingIndicator.offsetHeight; // Gösterge için yer aç
    }

    // "Düşünüyor" göstergesini gizle
    function hideTypingIndicator() {
        typingIndicator.classList.remove('visible');
    }

    // Enter tuşuna basıldığında mesaj gönderme
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Varsayılan Enter davranışını engelle (yeni satır gibi)
            sendButton.click();
        }
    });

    // Gönder düğmesine tıklandığında mesaj gönderme
    sendButton.addEventListener('click', sendMessage);

    // Sayfa yüklendiğinde giriş alanına odaklan
    userInput.focus();
});
