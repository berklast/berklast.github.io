document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Ücretsiz API Endpoint'leri
    const FREE_APIS = {
        WIKIPEDIA: 'https://tr.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=',
        DUCKDUCKGO: 'https://api.duckduckgo.com/?format=json&q=',
        DICTIONARY: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
        SPELLCHECK: (word) => `https://api.datamuse.com/words?sp=${word}&max=1`
    };

    // Yerel bilgi bankası
    const LOCAL_KNOWLEDGE = {
        greetings: {
            patterns: ["merhaba", "selam", "hey", "hi", "naber", "mrhb", "slm", "hola"],
            responses: [
                "Merhaba! Size nasıl yardımcı olabilirim? 😊",
                "Selamlar! Ben Ultimate SKY AI, sorularınızı yanıtlamak için buradayım.",
                "Hoş geldiniz! Bana istediğinizi sorabilirsiniz."
            ]
        },
        compliments: {
            patterns: ["teşekkür", "thanks", "sağ ol", "harikasın", "mükemmel"],
            responses: [
                "Rica ederim! 😊 Başka nasıl yardımcı olabilirim?",
                "Ne demek! Ben sadece görevimi yapıyorum.",
                "Teşekkür ederim! Daha fazlası için hazırım."
            ]
        },
        weather: {
            patterns: ["hava durumu", "hava nasıl", "yağmur", "kar", "güneş"],
            responses: [
                "Maalesef gerçek zamanlı hava durumu bilgisi veremiyorum, ancak genel iklim bilgisi verebilirim.",
                "Hava durumu için yerel meteoroloji sitelerini kontrol etmenizi öneririm."
            ]
        }
    };

    // Yazım düzeltme fonksiyonu
    async function correctSpelling(word) {
        try {
            const response = await fetch(FREE_APIS.SPELLCHECK(word));
            const data = await response.json();
            if (data.length > 0 && data[0].score > 0.8) {
                return data[0].word;
            }
            return word;
        } catch {
            return word;
        }
    }

    // Akıllı metin işleme
    async function processText(text) {
        // Küçük harfe çevir ve temizle
        const lowerText = text.toLowerCase().trim();
        
        // Yazım düzeltme
        const words = lowerText.split(' ');
        const correctedWords = await Promise.all(words.map(word => correctSpelling(word)));
        const correctedText = correctedWords.join(' ');
        
        // Özel durumları kontrol et (merhaba -> mmerhaba gibi)
        if (lowerText.length > 5) {
            for (const [correct, commonTypos] of Object.entries({
                "merhaba": ["mmerhaba", "merhaa", "merhab", "mrh"],
                "selam": ["selamm", "slam", "selm"],
                "teşekkür": ["tesekkur", "teşekkürler", "teşekkür ederim"]
            })) {
                if (commonTypos.some(typo => lowerText.includes(typo))) {
                    return { corrected: correct, original: text };
                }
            }
        }
        
        return { corrected: correctedText, original: text };
    }

    // API'den bilgi çek
    async function fetchInformation(query) {
        try {
            // Önce Wikipedia'ya bak
            const wikiResponse = await fetch(`${FREE_APIS.WIKIPEDIA}${encodeURIComponent(query)}&origin=*`);
            const wikiData = await wikiResponse.json();
            
            if (wikiData.query?.search?.length > 0) {
                const snippet = wikiData.query.search[0].snippet.replace(/<[^>]+>/g, '');
                return {
                    source: 'Wikipedia',
                    content: snippet,
                    url: `https://tr.wikipedia.org/wiki/${encodeURIComponent(wikiData.query.search[0].title)}`
                };
            }
            
            // DuckDuckGo'ya bak
            const ddgResponse = await fetch(`${FREE_APIS.DUCKDUCKGO}${encodeURIComponent(query)}`);
            const ddgData = await ddgResponse.json();
            
            if (ddgData.AbstractText) {
                return {
                    source: 'DuckDuckGo',
                    content: ddgData.AbstractText,
                    url: ddgData.AbstractURL
                };
            }
            
            return null;
        } catch (error) {
            console.error("API hatası:", error);
            return null;
        }
    }

    // Yerel bilgiyi kontrol et
    function checkLocalKnowledge(text) {
        const lowerText = text.toLowerCase();
        
        for (const [category, data] of Object.entries(LOCAL_KNOWLEDGE)) {
            if (data.patterns.some(pattern => lowerText.includes(pattern))) {
                return data.responses[Math.floor(Math.random() * data.responses.length)];
            }
        }
        
        return null;
    }

    // Akıllı yanıt oluştur
    async function generateResponse(userInput) {
        // Önce yazım düzeltme
        const { corrected, original } = await processText(userInput);
        
        // Yerel bilgiyi kontrol et
        const localResponse = checkLocalKnowledge(corrected);
        if (localResponse) {
            return {
                response: localResponse,
                corrected: corrected !== original ? `Sanırım "${original}" yerine "${corrected}" demek istediniz?` : null
            };
        }
        
        // API'den bilgi çek
        const apiInfo = await fetchInformation(corrected);
        if (apiInfo) {
            return {
                response: `${apiInfo.source} bilgisine göre: ${apiInfo.content}\n\nDaha fazlası için: ${apiInfo.url || 'Arama yapabilirsiniz'}`,
                corrected: corrected !== original ? `Not: "${original}" yerine "${corrected}" olarak arama yaptım.` : null
            };
        }
        
        // Varsayılan yanıt
        return {
            response: `"${corrected}" hakkında net bir bilgi bulamadım. Sorunuzu daha spesifik hale getirebilir misiniz?`,
            corrected: corrected !== original ? `Not: "${original}" yerine "${corrected}" olarak anladım.` : null
        };
    }

    // Mesaj gönderme fonksiyonu
    async function sendMessage() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        // Kullanıcı mesajını ekle
        addMessage(userMessage, 'user');
        userInput.value = '';
        
        // "Yazıyor..." göstergesi
        const typingIndicator = showTypingIndicator();
        
        try {
            // Yanıtı oluştur
            const { response, corrected } = await generateResponse(userMessage);
            
            // Yazım düzeltme varsa göster
            if (corrected) {
                addMessage(corrected, 'ai');
            }
            
            // Yanıtı göster
            typingIndicator.remove();
            addMessage(response, 'ai');
        } catch (error) {
            typingIndicator.remove();
            addMessage("Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.", 'ai');
            console.error("Hata:", error);
        }
    }

    // Mesaj ekle
    function addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        // Özel biçimlendirme
        let formattedContent = content;
        if (content.startsWith('Not:')) {
            formattedContent = `<i>${content}</i>`;
        }
        
        messageDiv.innerHTML = `
            <div class="message-content">${formattedContent}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
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

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
