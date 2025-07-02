document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Ücretsiz API Endpoint'leri
    // Bu URL'ler, kendi kuracağımız Node.js proxy sunucusuna işaret ediyor.
    // Böylece CORS hatalarını aşmış olacağız.
    const FREE_APIS = {
        WIKIPEDIA: '/api/wikipedia?q=',
        SPELLCHECK: (word) => `/api/spellcheck?word=${word}`
    };

    // --- GENİŞLETİLMİŞ YEREL BİLGİ BANKASI VE AKILLI YANITLAR ---
    const LOCAL_KNOWLEDGE = {
        greetings: {
            patterns: [/merhaba/i, /selam/i, /hey/i, /hi/i, /naber/i, /mrhb/i, /slm/i, /hola/i, /günaydın/i, /iyi günler/i, /selamlar/i],
            responses: [
                "Merhaba! Size nasıl yardımcı olabilirim? 😊",
                "Selamlar! Ben Ultimate SKY AI, sorularınızı yanıtlamak için buradayım.",
                "Hoş geldiniz! Bana istediğinizi sorabilirsiniz.",
                "Selam! Bugün size ne gibi bilgiler sağlayabilirim?",
                "Merhaba, sizin için buradayım."
            ]
        },
        howAreYou: { // "Nasılsın" gibi sorular için yeni kategori
            patterns: [/nasılsın/i, /nasıl gidiyor/i, /durumun ne/i],
            responses: [
                "Ben bir yapay zekayım, bu yüzden duygularım veya bir halim yok. Ama size yardım etmek için her zaman hazırım!",
                "Ben harikayım, teşekkür ederim! Sizin için ne yapabilirim?",
                "Ben iyi çalışıyorum! Size nasıl yardımcı olabilirim?",
                "Her zamanki gibi, veri işlemekle meşgulüm! 😊 Siz nasılsınız?"
            ]
        },
        compliments: {
            patterns: [/teşekkür/i, /thanks/i, /sağ ol/i, /harikasın/i, /mükemmel/i, /süpersin/i, /çok iyi/i, /eline sağlık/i, /çok güzel/i],
            responses: [
                "Rica ederim! 😊 Başka nasıl yardımcı olabilirim?",
                "Ne demek! Ben sadece görevimi yapıyorum.",
                "Teşekkür ederim! Daha fazlası için hazırım.",
                "Yardımcı olabildiğime sevindim!",
                "Benim için bir zevkti."
            ]
        },
        farewells: {
            patterns: [/güle güle/i, /hoşça kal/i, /bay bay/i, /görüşürüz/i, /iyi günler/i, /bye/i, /hoşcakal/i],
            responses: [
                "Güle güle! Tekrar beklerim.",
                "Hoşça kalın! Kendinize iyi bakın.",
                "Görüşmek üzere! Her zaman buradayım.",
                "İyi günler dilerim!"
            ]
        },
        aboutMe: {
            patterns: [/sen kimsin/i, /nesin/i, /ne yaparsın/i, /amacın ne/i, /sen bir ai misin/i, /adın ne/i, /kimsin/i],
            responses: [
                "Ben Ultimate SKY AI, sınırsız bilgiye erişim sağlayan bir yapay zekayım. Sorularınızı yanıtlamak ve size yardımcı olmak için buradayım.",
                "Ben Google tarafından eğitilmiş büyük bir dil modeliyim.",
                "Ben, sorularınıza yanıt vermek ve bilgi sağlamak için tasarlanmış bir yapay zekayım. Adım Ultimate SKY AI."
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
            patterns: [/hava durumu/i, /hava nasıl/i, /yağmur/i, /kar/i, /güneş/i, /sıcak mı/i, /soğuk mu/i, /bugün hava/i],
            responses: [
                "Maalesef gerçek zamanlı hava durumu bilgisi veremiyorum, çünkü internetten anlık veri çekme yeteneğim kısıtlı. Hava durumu için yerel meteoroloji sitelerini kontrol etmenizi öneririm.",
                "Üzgünüm, şu anki hava durumu hakkında bilgi sağlayamıyorum. Genel iklim bilgisi isterseniz yardımcı olabilirim."
            ]
        },
        unresponsive: { // Belirli ifadeler için daha iyi yanıtlar
            patterns: [/salak/i, /aptal/i, /gerizekalı/i, /kötü/i, /işe yaramaz/i, /anlamadın/i, /yapamıyorsun/i, /mal/i],
            responses: [
                "Ben bir yapay zekayım ve öğrenmeye devam ediyorum. Bana karşı nazik olursanız, size daha iyi yardımcı olabilirim. 😊",
                "Sizi anladığımdan emin olmak için sorunuzu farklı bir şekilde ifade edebilir misiniz?",
                "Amacım size yardımcı olmak. Eğer bir konuda hata yaptıysam veya sizi anlayamadıysam üzgünüm.",
                "Lütfen, daha iyi bir sohbet deneyimi için kibar olalım."
            ]
        },
        understanding: { // "Evet anladım" benzeri geri bildirimler için
            patterns: [/evet anladım/i, /tamamdır/i, /anlıyorum/i, /harika/i, /evet/i, /doğru/i, /anlaşıldı/i],
            responses: [
                "Sevindim! Başka ne bilmek istersiniz?",
                "Güzel! Aklınıza takılan başka bir şey var mı?",
                "Memnun oldum. Devam edelim mi?",
                "Harika! Sorularınız için hazırım."
            ]
        },
        codeRelated: { // "Kod yaz" gibi komutlar için
            patterns: [/kod yaz/i, /kodlama yap/i, /program yaz/i, /yazılım yap/i, /nasıl kodlanır/i],
            responses: [
                "Ben doğrudan kod yazamam veya çalıştıramam, ancak size çeşitli programlama dilleri, algoritmalar veya kodlama prensipleri hakkında bilgi verebilirim. Hangi konuda yardıma ihtiyacınız var?",
                "Kodlama konusunda size bilgi ve örnekler sunabilirim. Örneğin, 'Python nedir?' veya 'JavaScript'te döngüler nasıl kullanılır?' gibi sorular sorabilirsiniz.",
                "Ben bir metin tabanlı yapay zekayım. Kod yazmak veya uygulamalar geliştirmek yerine, kodlama konseptleri hakkında bilgi sağlamakta iyiyim."
            ]
        },
        simpleSocial: { // "hha", "baba" gibi daha basit, sosyal kelimeler için
            patterns: [/hha/i, /haha/i, /lol/i, /hehe/i, /baba/i, /anne/i, /abi/i, /abla/i, /kardeş/i, /arkadaş/i],
            responses: [
                "Gülmenize sevindim! Başka ne konuşmak istersiniz?",
                "Haha, neşelenmenize yardımcı olabildiğime sevindim.",
                "Bu komikti! 😄",
                "Anlıyorum. Aile bağları ve ilişkiler çok önemlidir.",
                "Bu konuda size nasıl yardımcı olabilirim?",
                "Daha fazla bilgi veya sohbet etmek istediğiniz başka bir konu var mı?"
            ]
        }
        // generalQuestions kategorisini kaldırıldı, çünkü mantık API çağrısı ile daha iyi yönetiliyor
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
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Yazım düzeltme ve kelime tamamlama fonksiyonu (Datamuse API)
    async function correctAndCompleteSpelling(word) {
        if (!word || word.length < 2) return word; // Çok kısa kelimeleri düzeltmeye çalışma
        try {
            const response = await fetch(FREE_APIS.SPELLCHECK(word));
            const data = await response.json();
            if (data.length > 0 && data[0].word.toLowerCase() !== word.toLowerCase()) {
                // Skoru 8000'den yüksekse veya çok yakın bir eşleşmeyse düzeltmeyi kullan
                // Bu skor eşiğini kendi denemelerinizle ayarlayabilirsiniz.
                if (data[0].score > 8000 || (data[0].word.startsWith(word) && data[0].word.length - word.length < 3)) {
                    return data[0].word;
                }
            }
            return word;
        } catch (error) {
            console.warn("Yazım düzeltme API hatası:", error);
            return word;
        }
    }

    // Akıllı metin işleme (kelime düzeltme ve özel durumları yakalama)
    async function processInput(text) {
        const lowerText = text.toLowerCase().trim();
        let correctedText = text;

        // Kelimeleri tek tek düzeltmeye çalış
        const words = lowerText.split(/\s+/);
        const correctedWordsPromises = words.map(word => correctAndCompleteSpelling(word));
        const correctedWords = await Promise.all(correctedWordsPromises);
        correctedText = correctedWords.join(' ');

        // Özel olarak yakalanacak kelime hataları (sıkça yapılan typo'lar)
        const customCorrections = {
            "mrb": "merhaba", "slm": "selam", "tşkkr": "teşekkür", "tesekkur": "teşekkür",
            "nslsn": "nasılsın", "nbr": "naber", "yzm": "yazım", "knk": "kanka", "tm": "tamam"
        };
        for (const [typo, correct] of Object.entries(customCorrections)) {
            const regex = new RegExp(`\\b${typo}\\b`, 'gi');
            correctedText = correctedText.replace(regex, correct);
        }

        // Metinde tekrar eden harfleri temizleme (örn: mmerhaba -> merhaba)
        correctedText = correctedText.replace(/(.)\1{2,}/g, '$1$1');

        return { corrected: correctedText.trim(), original: text.trim() };
    }

    // API'den bilgi çek (Wikipedia öncelikli)
    async function fetchInformation(query) {
        try {
            const wikiResponse = await fetch(`${FREE_APIS.WIKIPEDIA}${encodeURIComponent(query)}`); // 'origin=*' proxy'de ayarlandığı için kaldırıldı
            const wikiData = await wikiResponse.json();

            if (wikiData.query?.search?.length > 0) {
                const snippet = wikiData.query.search[0].snippet.replace(/<[^>]+>/g, '');
                return {
                    source: 'Wikipedia',
                    content: snippet,
                    url: `https://tr.wikipedia.org/wiki/${encodeURIComponent(wikiData.query.search[0].title)}`
                };
            }
            return null;
        } catch (error) {
            console.error("API'den bilgi çekme hatası (Wikipedia):", error);
            return null;
        }
    }

    // Yerel bilgiyi kontrol et
    function checkLocalKnowledge(text) {
        const lowerText = text.toLowerCase();

        for (const category in LOCAL_KNOWLEDGE) {
            const data = LOCAL_KNOWLEDGE[category];
            for (const pattern of data.patterns) {
                if (pattern.test(lowerText)) {
                    if (data.responses && data.responses.length > 0) {
                        return data.responses[Math.floor(Math.random() * data.responses.length)];
                    } else {
                        // Eğer kategori desenleri eşleşti ama yanıtları boşsa, API'ye yönlendir
                        // (Örn: "Yapay zeka nedir" gibi sorular için)
                        return null;
                    }
                }
            }
        }
        return null;
    }

    // --- AKILLI YANIT OLUŞTURMA FONKSİYONU ---
    async function generateResponse(userInputText) {
        // Hoş geldin mesajını gizle (ilk mesaj gönderildiğinde)
        const welcomeScreen = document.querySelector('.welcome-message');
        if (welcomeScreen) {
            welcomeScreen.remove();
        }

        const { corrected, original } = await processInput(userInputText);
        let responseContent = null;
        let correctionNote = null;

        // 1. Yazım düzeltmesi yapıldıysa notu hazırla
        if (corrected !== original) {
            correctionNote = `Not: "${original}" yerine "${corrected}" olarak anladım.`;
        }

        // 2. Önce yerel bilgi bankasını kontrol et (chatbot gibi yanıtlar için)
        responseContent = checkLocalKnowledge(corrected);
        if (responseContent) {
            return {
                response: responseContent,
                corrected: correctionNote
            };
        }

        // 3. Eğer yerel bir chatbot cevabı yoksa, API'den bilgi arayışına uygun mu diye bak.
        // Bu kısım, direkt bilgi arayan sorgular için API'ye gitmeyi tetiklerken,
        // kısa, sosyal veya anlamsız girdilerde API'ye gitmesini engeller.
        const searchKeywords = ['nedir', 'kimdir', 'nasıl yapılır', 'bilgi ver', 'açıkla', 'hakkında', 'ne demek'];
        const isAQuestion = corrected.endsWith('?') || searchKeywords.some(keyword => corrected.includes(keyword));
        const isLongEnoughForSearch = corrected.split(' ').length > 2; // Cümle en az 3 kelimeyse

        if (isAQuestion || isLongEnoughForSearch) {
            const apiInfo = await fetchInformation(corrected);
            if (apiInfo) {
                return {
                    response: `${apiInfo.source} bilgisine göre: ${apiInfo.content}\n\nDaha fazlası için: ${apiInfo.url || 'Arama yapabilirsiniz'}`,
                    corrected: correctionNote
                };
            }
        }

        // 4. Eğer hiçbir yere düşmezse, varsayılan anlayamadım yanıtı ver
        return {
            response: `Üzgünüm, "${corrected}" hakkında net bir bilgi bulamadım veya sorunuzu tam olarak anlayamadım. Lütfen daha farklı bir şekilde ifade etmeyi deneyin.`,
            corrected: correctionNote
        };
    }

    // Mesaj gönderme fonksiyonu
    async function sendMessage() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        addMessage(userMessage, 'user');
        userInput.value = '';

        const typingIndicator = showTypingIndicator();

        try {
            const { response, corrected } = await generateResponse(userMessage);

            if (corrected) {
                addMessage(corrected, 'ai', true); // true, bu mesajın bir not olduğunu belirtir (italik olabilir)
            }

            typingIndicator.remove();
            addMessage(response, 'ai');
        } catch (error) {
            typingIndicator.remove();
            addMessage("Üzgünüm, bir hata oluştu veya bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.", 'ai');
            console.error("Mesaj gönderme hatası:", error);
        }
    }

    // Mesaj ekle
    function addMessage(content, type, isNote = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        let formattedContent = content;
        if (isNote) {
            formattedContent = `<i>${content}</i>`;
        } else if (type === 'ai') {
            // AI yanıtlarında linkleri tıklanabilir hale getir (URL tespiti basit)
            formattedContent = formattedContent.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        }

        messageDiv.innerHTML = `<div class="message-content">${formattedContent}</div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Yazıyor göstergesi
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator ai-message';
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

    // Örnek sorulara tıklama özelliği
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
