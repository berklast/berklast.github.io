document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const newChatButton = document.getElementById('new-chat');
    const conversationList = document.getElementById('conversation-list');

    // Ücretsiz API'ler
    const APIS = {
        WIKIPEDIA: 'https://tr.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=',
        DUCKDUCKGO: 'https://api.duckduckgo.com/?format=json&q=',
        WORDSAPI: 'https://wordsapiv1.p.rapidapi.com/words/'
    };

    // Konuşma geçmişi
    let conversations = [];
    let currentConversationId = null;

    // Yeni konuşma oluştur
    function createNewConversation() {
        const newConversation = {
            id: Date.now().toString(),
            title: 'Yeni Sohbet',
            messages: []
        };
        conversations.push(newConversation);
        currentConversationId = newConversation.id;
        renderConversationList();
        renderChatMessages();
        return newConversation;
    }

    // Konuşma listesini render et
    function renderConversationList() {
        conversationList.innerHTML = '';
        conversations.forEach(conversation => {
            const conversationElement = document.createElement('div');
            conversationElement.className = `conversation-item ${conversation.id === currentConversationId ? 'active' : ''}`;
            conversationElement.innerHTML = `
                <div class="conversation-title">${conversation.title}</div>
                <div class="conversation-preview">${conversation.messages.length > 0 ? 
                    conversation.messages[0].content.substring(0, 30) + '...' : 'Yeni sohbet'}</div>
            `;
            conversationElement.addEventListener('click', () => {
                currentConversationId = conversation.id;
                renderChatMessages();
                renderConversationList();
            });
            conversationList.appendChild(conversationElement);
        });
    }

    // Mesajları render et
    function renderChatMessages() {
        const conversation = conversations.find(c => c.id === currentConversationId);
        chatMessages.innerHTML = '';
        
        if (!conversation || conversation.messages.length === 0) {
            chatMessages.innerHTML = `
                <div class="welcome-message">
                    <h3>SKY PRO'ya Hoş Geldiniz</h3>
                    <p>Bana her konuda soru sorabilirsiniz. İnternetten araştırıp size en doğru bilgileri sunacağım.</p>
                </div>
            `;
            return;
        }
        
        conversation.messages.forEach(message => {
            addMessageToChat(message.content, message.role);
        });
    }

    // Mesaj gönderme fonksiyonu
    async function sendMessage() {
        const messageContent = userInput.value.trim();
        if (!messageContent) return;

        // Kullanıcı mesajını ekle
        addMessageToChat(messageContent, 'user');
        saveMessage(messageContent, 'user');
        userInput.value = '';
        
        // Konuşma başlığını güncelle (ilk mesajsa)
        const currentConversation = conversations.find(c => c.id === currentConversationId);
        if (currentConversation.messages.length === 1) {
            currentConversation.title = messageContent.substring(0, 20) + (messageContent.length > 20 ? '...' : '');
            renderConversationList();
        }
        
        // "Yazıyor..." göstergesi
        const typingIndicator = showTypingIndicator();
        
        try {
            // API'den yanıt al
            const aiResponse = await generateAIResponse(messageContent);
            
            // Yanıtı ekle
            typingIndicator.remove();
            addMessageToChat(aiResponse, 'assistant');
            saveMessage(aiResponse, 'assistant');
        } catch (error) {
            typingIndicator.remove();
            addMessageToChat("Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.", 'assistant');
            saveMessage("Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.", 'assistant');
            console.error("API Hatası:", error);
        }
    }

    // Mesajı sohbete ekle
    function addMessageToChat(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${time}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Mesajı kaydet
    function saveMessage(content, role) {
        const conversation = conversations.find(c => c.id === currentConversationId);
        if (conversation) {
            conversation.messages.push({
                content,
                role,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Yazıyor göstergesi
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return typingDiv;
    }

    // Akıllı yanıt oluştur
    async function generateAIResponse(query) {
        // Önce basit soruları kontrol et
        const simpleResponses = {
            "merhaba": ["Merhaba! Size nasıl yardımcı olabilirim?", "Selam! Ben SKY PRO, sorularınızı yanıtlamak için buradayım."],
            "teşekkürler": ["Rica ederim! Başka bir konuda daha yardımcı olabilirim.", "Ne demek! Her zaman buradayım :)"],
            "nasılsın": ["Ben bir yapay zeka olduğum için her zaman iyiyim! Peki ya siz?", "Teşekkür ederim, sanal dünyada her şey yolunda. Size nasıl yardımcı olabilirim?"]
        };
        
        const lowerQuery = query.toLowerCase();
        for (const [key, responses] of Object.entries(simpleResponses)) {
            if (lowerQuery.includes(key)) {
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
        
        // API'den araştırma yap
        try {
            const wikiResponse = await fetchWithTimeout(`${APIS.WIKIPEDIA}${encodeURIComponent(query)}&origin=*`, {}, 3000);
            const wikiData = await wikiResponse.json();
            
            if (wikiData.query?.search?.length > 0) {
                const snippet = wikiData.query.search[0].snippet.replace(/<[^>]+>/g, '');
                return `Wikipedia'ya göre: ${snippet}... \n\nDaha fazla bilgi için: https://tr.wikipedia.org/wiki/${encodeURIComponent(wikiData.query.search[0].title)}`;
            }
            
            const ddgResponse = await fetchWithTimeout(`${APIS.DUCKDUCKGO}${encodeURIComponent(query)}`, {}, 3000);
            const ddgData = await ddgResponse.json();
            
            if (ddgData.AbstractText) {
                return `DuckDuckGo bilgisine göre: ${ddgData.AbstractText}`;
            }
            
            if (ddgData.RelatedTopics?.length > 0) {
                return `İlgili bilgi: ${ddgData.RelatedTopics[0].Text || 'Konuyla ilgili çeşitli kaynaklar bulunuyor.'}`;
            }
            
            return `"${query}" hakkında net bir bilgi bulamadım. Sorunuzu daha spesifik hale getirebilir misiniz?`;
        } catch (error) {
            console.error("Araştırma hatası:", error);
            return `"${query}" hakkında araştırma yaparken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.`;
        }
    }

    // Timeout'lu fetch
    function fetchWithTimeout(url, options = {}, timeout = 5000) {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), timeout)
            )
        ]);
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    newChatButton.addEventListener('click', createNewConversation);

    // İlk konuşmayı oluştur
    createNewConversation();
});
