document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Ücretsiz API endpoint'i (örnek olarak DuckDuckGo Instant Answer API)
    const FREE_API_ENDPOINT = "https://api.duckduckgo.com/?format=json&q=";

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Kullanıcı mesajını ekrana ekle
        addMessage(message, 'user-message');
        userInput.value = '';
        userInput.focus();

        // "Yazıyor..." mesajını göster
        const typingIndicator = addMessage("SKY düşünüyor...", 'ai-message');
        
        try {
            // Ücretsiz API'den veri çek
            const response = await fetch(FREE_API_ENDPOINT + encodeURIComponent(message));
            const data = await response.json();
            
            // API yanıtını işle
            let aiResponse = "Üzgünüm, bu konuda yeterli bilgi bulamadım.";
            
            if (data.AbstractText) {
                aiResponse = data.AbstractText;
            } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                aiResponse = data.RelatedTopics[0].Text || "İlgili bilgiler buldum ama detaylı açıklama yok.";
            }
            
            // "Yazıyor..." mesajını güncelle
            typingIndicator.textContent = aiResponse;
        } catch (error) {
            typingIndicator.textContent = "Bir hata oluştu, lütfen daha sonra tekrar deneyin.";
            console.error("API Hatası:", error);
        }
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
