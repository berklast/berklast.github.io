document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Ücretsiz API Endpoint'leri
    // NOT: CORS hatası alıyorsanız, bu API'lerin sunucu tarafında bir proxy üzerinden çağrılması gerekebilir.
    // Bu, özellikle tarayıcı tabanlı uygulamalarda sıkça karşılaşılan bir durumdur.
    const FREE_APIS = {
        WIKIPEDIA: 'https://tr.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=',
        // DuckDuckGo API'si için proxy gerekebilir veya direk tarayıcıdan çalışmayabilir.
        // Daha güvenilir bir alternatif: Sadece Wikipedia veya daha genel bir bilgi API'si kullanmak.
        // Bu örnek için Wikipedia'yı öncelikli tutalım.
        // DUCKDUCKGO: 'https://api.duckduckgo.com/?format=json&q=', // Bu API doğrudan tarayıcıdan CORS hatası verebilir.
        // DICTIONARY: 'https://api.dictionaryapi.dev/api/v2/entries/en/', // İngilizce için, Türkçe için uygun değil.
        SPELLCHECK: (word) => `https://api.datamuse.com/words?sp=${word}&max=1&v=ml` // Kelime tamamlama/düzeltme için
    };

    // Yerel bilgi bankası ve daha akıllı yanıtlar
    // Patternler düzenli ifade (RegExp) ile daha esnek hale getirildi
    const LOCAL_KNOWLEDGE = {
        greetings: {
            patterns: [/merhaba/i, /selam/i, /hey/i, /hi/i, /naber/i, /mrhb/i, /slm/i, /hola/i, /günaydın/i, /iyi günler/i],
            responses: [
                "Merhaba! Size nasıl yardımcı olabilirim? 😊",
                "Selamlar! Ben Ultimate SKY AI, sorularınızı yanıtlamak için buradayım.",
                "Hoş geldiniz! Bana istediğinizi sorabilirsiniz.",
                "Selam! Bugün size ne gibi bilgiler sağlayabilirim?",
                "Merhaba, sizin için buradayım."
            ]
        },
        compliments: {
            patterns: [/teşekkür/i, /thanks/i, /sağ ol/i, /harikasın/i, /mükemmel/i, /süpersin/i, /çok iyi/i, /eline sağlık/i],
            responses: [
                "Rica ederim! 😊 Başka nasıl yardımcı olabilirim?",
                "Ne demek! Ben sadece görevimi yapıyorum.",
                "Teşekkür ederim! Daha fazlası için hazırım.",
                "Yardımcı olabildiğime sevindim!",
                "Benim için bir zevkti."
            ]
        },
        farewells: {
            patterns: [/güle güle/i, /hoşça kal/i, /bay bay/i, /görüşürüz/i, /iyi günler/i, /bye/i],
            responses: [
                "Güle güle! Tekrar beklerim.",
                "Hoşça kalın! Kendinize iyi bakın.",
                "Görüşmek üzere! Her zaman buradayım.",
                "İyi günler dilerim!"
            ]
        },
        aboutMe: {
            patterns: [/sen kimsin/i, /nesin/i, /ne yaparsın/i, /amacın ne/i, /sen bir ai misin/i],
            responses: [
                "Ben Ultimate SKY AI, sınırsız bilgiye erişim sağlayan bir yapay zekayım. Sorularınızı yanıtlamak ve size yardımcı olmak için buradayım.",
                "Ben Google tarafından eğitilmiş büyük bir dil modeliyim.",
                "Ben, sorularınıza yanıt vermek ve bilgi sağlamak için tasarlanmış bir yapay zekayım."
            ]
        },
        jokes: {
            patterns: [/şaka yap/i, /beni güldür/i, /fıkra anlat/i],
            responses: [
                "Temel ile Dursun bir otobüse binmişler. Temel camdan bakarken Dursun da dışarı bakmış. 😂",
                "Atom bombası ne zaman patlamış? İlk atom patladığında! 😜",
                "Bilgisayarlar neden denize giremez? Çünkü virüs kaparlar! 🦠"
            ]
        },
        weather: {
            patterns: [/hava durumu/i, /hava nasıl/i, /yağmur/i, /kar/i, /güneş/i, /sıcak mı/i, /soğuk mu/i],
            responses: [
                "Maalesef gerçek zamanlı hava durumu bilgisi veremiyorum, çünkü internetten anlık veri çekme yeteneğim kısıtlı. Ancak genel iklim bilgisi verebilirim.",
                "Hava durumu için yerel meteoroloji sitelerini kontrol etmenizi öneririm.",
                "Üzgünüm, şu anki hava durumu hakkında bilgi sağlayamıyorum."
            ]
        },
        unresponsive: { // Belirli ifadeler için daha iyi yanıtlar
            patterns: [/salak/i, /aptal/i, /gerizekalı/i, /kötü/i, /işe yaramaz/i, /anlamadın/i],
            responses: [
                "Ben bir yapay zekayım ve öğrenmeye devam ediyorum. Bana karşı nazik olursanız, size daha iyi yardımcı olabilirim. 😊",
                "Sizi anladığımdan emin olmak için sorunuzu farklı bir şekilde ifade edebilir misiniz?",
                "Amacım size yardımcı olmak. Eğer bir konuda hata yaptıysam veya sizi anlayamadıysam üzgünüm.",
                "Lütfen, daha iyi bir sohbet deneyimi için kibar olalım."
            ]
        },
        understanding: { // "Evet anladım" benzeri geri bildirimler için
            patterns: [/evet anladım/i, /tamamdır/i, /anlıyorum/i, /harika/i, /evet/i],
            responses: [
                "Sevindim! Başka ne bilmek istersiniz?",
                "Güzel! Aklınıza takılan başka bir şey var mı?",
                "Memnun oldum. Devam edelim mi?",
                "Harika! Sorularınız için hazırım."
            ]
        }
    };

    // Hoş geldin mesajını göster (sayfa yüklendiğinde)
    addWelcomeMessage();

    function addWelcomeMessage() {
        const welcomeMessageHTML = `
            <div class="welcome-message">
                <div class="welcome-icon"><i class="fas fa-robot"></i></div>
                <h2>Ultimate SKY AI'ya Hoş Geldiniz</h2>
                <p>Bana istediğinizi sorun! Yazım hatalarınızı düzeltebilir, eksik harfleri tamamlayabilirim.</p>
                <div class="examples">
                    <p><strong>Örnek Sorular:</strong></p>
                    <ul>
                        <li>"Yapay zeka nedir?"</li>
                        <li>"Bugün hava nasıl?"</li>
                        <li>"En iyi programlama dili hangisi?"</li>
                    </ul>
                </div>
            </div>
        `;
        chatMessages.innerHTML = welcomeMessageHTML;
        chatMessages.scrollTop = chatMessages.scrollHeight; // Kaydırma
    }

    // Yazım düzeltme ve kelime tamamlama fonksiyonu (Datamuse API)
    async function correctAndCompleteSpelling(word) {
        if (!word) return word;
        try {
            // Sadece tek kelime için düzeltme/tamamlama yap.
            // Çok kelimeli cümleler için daha karmaşık NLP gerekir.
            const response = await fetch(FREE_APIS.SPELLCHECK(word));
            const data = await response.json();
            // Yüksek olasılıklı bir eşleşme varsa düzeltmeyi kullan
            if (data.length > 0 && data[0].word.toLowerCase() !== word.toLowerCase()) {
                // Eğer kelime çok benziyorsa ve bir öneri varsa kullan
                if (data[0].score > 8000) { // Score'u deneyerek optimize edebilirsiniz
                    return data[0].word;
                }
            }
            return word; // Düzeltme yoksa orijinali döndür
        } catch (error) {
            console.warn("Yazım düzeltme API hatası:", error);
            return word; // Hata durumunda orijinal kelimeyi döndür
        }
    }

    // Akıllı metin işleme (kelime düzeltme ve özel durumları yakalama)
    async function processInput(text) {
        const lowerText = text.toLowerCase().trim();
        let correctedText = text; // Varsayılan olarak orijinal metin

        // Kelimeleri tek tek düzeltmeye çalış (Datamuse sınırlı olduğu için)
        const words = lowerText.split(/\s+/); // Boşluklara göre ayır
        const correctedWordsPromises = words.map(word => correctAndCompleteSpelling(word));
        const correctedWords = await Promise.all(correctedWordsPromises);
        correctedText = correctedWords.join(' ');

        // Özel olarak yakalanacak kelime hataları (sıkça yapılan typo'lar)
        // Bu kısım Datamuse API'sinin yakalayamadığı daha spesifik hataları düzeltebilir.
        const customCorrections = {
            "mrb": "merhaba",
            "slm": "selam",
            "tşkkr": "teşekkür",
            "tesekkur": "teşekkür",
            "nslsn": "nasılsın",
            "nbr": "naber",
            "yzm": "yazım"
        };
        for (const [typo, correct] of Object.entries(customCorrections)) {
            const regex = new RegExp(`\\b${typo}\\b`, 'gi'); // Kelimenin tamamını eşleştir
            correctedText = correctedText.replace(regex, correct);
        }

        // Metinde tekrar eden harfleri temizleme (örn: mmerhaba -> merhaba)
        // Bu daha basit bir Regex ile yapılabilir, daha gelişmiş NLP gerekebilir.
        correctedText = correctedText.replace(/(.)\1{2,}/g, '$1$1'); // 3 veya daha fazla aynı harfi 2'ye düşürür.

        return { corrected: correctedText.trim(), original: text.trim() };
    }

    // API'den bilgi çek (Wikipedia öncelikli)
    async function fetchInformation(query) {
        try {
            // Wikipedia'dan bilgi çekme
            // CORS hatası yaşanıyorsa, bir proxy sunucusu kullanmanız gerekebilir.
            // Örneğin: https://cors-anywhere.herokuapp.com/https://tr.wikipedia.org/...
            const wikiResponse = await fetch(`${FREE_APIS.WIKIPEDIA}${encodeURIComponent(query)}&origin=*`);
            const wikiData = await wikiResponse.json();

            if (wikiData.query?.search?.length > 0) {
                const snippet = wikiData.query.search[0].snippet.replace(/<[^>]+>/g, ''); // HTML etiketlerini temizle
                return {
                    source: 'Wikipedia',
                    content: snippet,
                    url: `https://tr.wikipedia.org/wiki/${encodeURIComponent(wikiData.query.search[0].title)}`
                };
            }

            // DuckDuckGo API'si doğrudan tarayıcıdan CORS hatası verebilir.
            // Bu yüzden şimdilik devre dışı bırakıyorum veya sadece Wikipedia'ya odaklanıyorum.
            // Eğer DuckDuckGo kullanmak isterseniz, sunucu tarafında bir proxy kurmanız gerekebilir.

            return null; // Bilgi bulunamazsa null döndür
        } catch (error) {
            console.error("API'den bilgi çekme hatası:", error);
            return null;
        }
    }

    // Yerel bilgiyi kontrol et
    function checkLocalKnowledge(text) {
        const lowerText = text.toLowerCase();

        for (const category in LOCAL_KNOWLEDGE) {
            const data = LOCAL_KNOWLEDGE[category];
            for (const pattern of data.patterns) {
                if (pattern.test(lowerText)) { // RegExp ile test et
                    return data.responses[Math.floor(Math.random() * data.responses.length)];
                }
            }
        }
        return null;
    }

    // Akıllı yanıt oluştur
    async function generateResponse(userInputText) {
        // Hoş geldin mesajını gizle (ilk mesaj gönderildiğinde)
        const welcomeScreen = document.querySelector('.welcome-message');
        if (welcomeScreen) {
            welcomeScreen.remove();
        }

        const { corrected, original } = await processInput(userInputText);

        // Kullanıcının niyetini analiz et (basit bir yaklaşım)
        // Eğer giriş sadece "salak" gibi tek kelimeyse ve bu yerel bilgide varsa
        if (words.length === 1 && checkLocalKnowledge(corrected)) {
             return {
                response: checkLocalKnowledge(corrected),
                corrected: corrected !== original ? `Not: "${original}" yerine "${corrected}" olarak anladım.` : null
            };
        }

        // Yerel bilgiyi kontrol et (daha öncelikli)
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

        // Varsayılan yanıt (eğer hiçbir yerden bilgi bulunamazsa)
        return {
            response: `Üzgünüm, "${corrected}" hakkında net bir bilgi bulamadım veya anlayamadım. Sorunuzu daha spesifik hale getirebilir misiniz?`,
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

            // Yazım düzeltme/anlama notu varsa göster
            if (corrected) {
                addMessage(corrected, 'ai', true); // true, bu mesajın bir not olduğunu belirtir (italik olabilir)
            }

            // Yanıtı göster
            typingIndicator.remove(); // Yazıyor göstergesini kaldır
            addMessage(response, 'ai');
        } catch (error) {
            typingIndicator.remove(); // Hata durumunda da göstergeyi kaldır
            addMessage("Üzgünüm, bir hata oluştu veya bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.", 'ai');
            console.error("Mesaj gönderme hatası:", error);
        }
    }

    // Mesaj ekle
    function addMessage(content, type, isNote = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        let formattedContent = content;
        if (isNote) { // Eğer bir notsa italik yap
            formattedContent = `<i>${content}</i>`;
        } else if (type === 'ai') {
            // AI yanıtlarında linkleri tıklanabilir hale getir (URL tespiti basit)
            formattedContent = formattedContent.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        }

        messageDiv.innerHTML = `<div class="message-content">${formattedContent}</div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Her zaman en alta kaydır
    }

    // Yazıyor göstergesi
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator ai-message'; // AI mesajı gibi görünmesi için sınıf eklendi
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return typingDiv;
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { // Shift+Enter yeni satır için kalsın
            e.preventDefault(); // Varsayılan Enter davranışını engelle (form gönderme vb.)
            sendMessage();
        }
    });

    // Örnek sorulara tıklama özelliği ekle (Eğer hoş geldin ekranınız varsa)
    chatMessages.addEventListener('click', (event) => {
        if (event.target.closest('.example-card p')) {
            userInput.value = event.target.closest('.example-card p').textContent.replace(/"/g, '');
            sendMessage();
        } else if (event.target.tagName === 'LI' && event.target.closest('.examples ul')) {
            userInput.value = event.target.textContent.replace(/"/g, '');
            sendMessage();
        }
    });
});
