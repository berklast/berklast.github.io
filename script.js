document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');

    // Sohbet geçmişini saklamak için basit bir dizi (isteğe bağlı)
    const chatHistory = [];

    // Mesaj gönderme fonksiyonu
    function sendMessage() {
        const messageText = userInput.value.trim();
        if (messageText === '') {
            return; // Boş mesaj gönderme
        }

        // Kullanıcı mesajını ekle
        addMessage(messageText, 'user');
        userInput.value = ''; // Giriş alanını temizle

        // SKY'dan yanıt bekle ve ekle (basit, önceden tanımlı yanıtlar)
        setTimeout(() => {
            const botResponse = getSkyResponse(messageText);
            addMessage(botResponse, 'bot');
        }, 500); // Yarım saniye sonra yanıtla
    }

    // Mesajı sohbet penceresine ekleyen fonksiyon
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        const senderSpan = document.createElement('span');
        senderSpan.classList.add('message-sender');
        senderSpan.textContent = sender === 'user' ? 'Siz' : 'SKY';

        const textP = document.createElement('p');
        textP.textContent = text;

        const timeSpan = document.createElement('span');
        timeSpan.classList.add('message-time');
        timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Saati ekle

        messageDiv.appendChild(senderSpan);
        messageDiv.appendChild(textP);
        messageDiv.appendChild(timeSpan);
        chatMessages.appendChild(messageDiv);

        // Sohbeti en aşağı kaydır
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Geçmişe ekle (isteğe bağlı)
        chatHistory.push({ sender, text, time: new Date() });
    }

    // SKY'ın yanıtlarını belirleyen basit fonksiyon
    function getSkyResponse(userMessage) {
        userMessage = userMessage.toLowerCase(); // Küçük harfe çevir

        if (userMessage.includes('merhaba') || userMessage.includes('selam')) {
            return "Merhaba! Size nasıl yardımcı olabilirim?";
        } else if (userMessage.includes('nasılsın')) {
            return "Ben bir yapay zekayım, bir hissim yok ama her şey yolunda. Sizin için ne yapabilirim?";
        } else if (userMessage.includes('adın ne') || userMessage.includes('kimsin')) {
            return "Benim adım SKY. Google tarafından eğitilmiş büyük bir dil modeliyim.";
        } else if (userMessage.includes('teşekkürler') || userMessage.includes('sağ ol')) {
            return "Rica ederim, yardımcı olabildiğime sevindim!";
        } else if (userMessage.includes('hava durumu')) {
             return "Maalesef şu anda hava durumu bilgisi sağlayamıyorum. İnternet erişimim kısıtlı.";
        } else if (userMessage.includes('saat kaç')) {
            const now = new Date();
            return `Şu an saat ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (userMessage.includes('ne yapabilirsin') || userMessage.includes('özelliklerin')) {
            return "Size bilgi verebilir, sorularınızı yanıtlayabilir ve çeşitli konularda yardımcı olabilirim. Ama unutmayın, ben sadece bir simülasyonum!";
        } else if (userMessage.includes('güle güle') || userMessage.includes('hoşça kal')) {
             return "Güle güle! Tekrar görüşmek üzere.";
        } else {
            return "Bu konuda size yardımcı olamıyorum. Daha spesifik bir soru sorabilir misiniz?";
        }
    }

    // Enter tuşuna basıldığında mesaj gönderme
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendButton.click(); // Gönder düğmesini tıkla
        }
    });

    // Gönder düğmesine tıklandığında mesaj gönderme
    sendButton.addEventListener('click', sendMessage);

    // Sayfa yüklendiğinde giriş alanına odaklan
    userInput.focus();
});
