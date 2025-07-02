document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Akıllı yanıtlar veritabanı
    const knowledgeBase = {
        greetings: ["Merhaba! Nasıl yardımcı olabilirim?", "Selam! Sana nasıl destek olabilirim?", "Hoş geldin! Ben SKY, sorularını yanıtlamak için buradayım."],
        farewells: ["Görüşmek üzere!", "İyi günler!", "Sonra tekrar konuşalım!"],
        compliments: ["Teşekkür ederim! 😊", "Çok naziksin!", "Ben sadece programlandığım şeyi yapıyorum!"],
        default: ["Bunu daha detaylı açıklayabilir misin?", "Bu konuda araştırma yapabilirim.", "Sanırım tam olarak anlayamadım, başka şekilde sorabilir misin?"],
        facts: {
            "sen kimsin": "Ben SKY AI, kullanıcılarına bilgi sağlamak için tasarlanmış bir yapay zeka asistanıyım.",
            "ne yapabilirsin": "Sorularını yanıtlayabilir, basit konularda araştırma yapabilir ve sohbet edebilirim.",
            "hava durumu": "Maalesef gerçek zamanlı hava durumu bilgisine erişimim yok, ama genel iklim bilgisi verebilirim."
        }
    };

    // Mesaj gönderme fonksiyonu
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Kullanıcı mesajını ekrana ekle
        addMessage(message, 'user-message');
        userInput.value = '';
        
        // "Yazıyor..." mesajını göster
        const typingIndicator = addMessage("SKY yazıyor...", 'ai-message');
        
        // Yapay zeka yanıtını hazırla (simüle edilmiş gecikme)
        setTimeout(() => {
            const response = generateAIResponse(message);
            typingIndicator.textContent = response;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000 + Math.random() * 2000); // Rastgele gecikme (1-3 sn)
    }

    // Akıllı yanıt oluşturma
    function generateAIResponse(message) {
        const lowerMsg = message.toLowerCase();
        
        // Özel durumları kontrol et
        if (/(merhaba|selam|hey|hi)/i.test(lowerMsg)) {
            return randomChoice(knowledgeBase.greetings);
        }
        if (/(görüşürüz|bye|hoşçakal)/i.test(lowerMsg)) {
            return randomChoice(knowledgeBase.farewells);
        }
        if (/(teşekkür|thanks|sağ ol)/i.test(lowerMsg)) {
            return randomChoice(knowledgeBase.compliments);
        }
        
        // Bilgi tabanında arama
        for (const [key, response] of Object.entries(knowledgeBase.facts)) {
            if (lowerMsg.includes(key)) {
                return response;
            }
        }
        
        // Web'den araştırma simülasyonu
        if (lowerMsg.includes('araştır') || lowerMsg.includes('bilgi')) {
            return `"${message}" hakkında genel bilgi: Bu konuyla ilgili çeşitli kaynaklar bulunuyor. Detaylı araştırma için özel terimler kullanabilirsiniz.`;
        }
        
        // Varsayılan yanıt
        return randomChoice(knowledgeBase.default);
    }

    // Yardımcı fonksiyonlar
    function randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function addMessage(text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', className);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
