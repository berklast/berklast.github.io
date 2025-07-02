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
            patterns: [/sen kimsin/i, /nesin/i, /ne yaparsın/i, /amacın ne/i, /sen bir ai misin/i, /adın ne/i, /kimsin/i, /ismin ne/i],
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
        // 'unresponsive' kalıpları daha çok hakaret ve aşağılama üzerine odaklandı
        unresponsive: {
            patterns: [/\bsalak\b/i, /\baptal\b/i, /\bgerizekalı\b/i, /\bmal\b/i, /\baptalca\b/i, /\bnankör\b/i, /\bişe yaramaz\b/i],
            responses: [
                "Ben bir yapay zekayım ve öğrenmeye devam ediyorum. Bana karşı nazik olursanız, size daha iyi yardımcı olabilirim. 😊",
                "Lütfen daha kibar olalım. Amacım size yardımcı olmak.",
                "Bu tür ifadelerle iletişim kurmakta zorlanıyorum. Daha yapıcı bir dil kullanabilir miyiz?"
            ]
        },
        understanding: {
            patterns: [/evet anladım/i, /tamamdır/i, /anlıyorum/i, /harika/i, /evet/i, /doğru/i, /anlaşıldı/i],
            responses: [
                "Sevindim! Başka ne bilmek istersiniz?",
                "Güzel! Aklınıza takılan başka bir şey var mı?",
                "Memnun oldum. Devam edelim mi?",
                "Harika! Sorularınız için hazırım."
            ]
        },
        codeRelated: {
            patterns: [/kod yaz/i, /kodlama yap/i, /program yaz/i, /yazılım yap/i, /nasıl kodlanır/i, /algoritma/i, /programlama dili/i],
            responses: [
                "Ben doğrudan kod yazamam veya çalıştıramam, ancak size çeşitli programlama dilleri, algoritmalar veya kodlama prensipleri hakkında bilgi verebilirim. Hangi konuda yardıma ihtiyacınız var?",
                "Kodlama konusunda size bilgi ve örnekler sunabilirim. Örneğin, 'Python nedir?' veya 'JavaScript'te döngüler nasıl kullanılır?' gibi sorular sorabilirsiniz.",
                "Ben bir metin tabanlı yapay zekayım. Kod yazmak veya uygulamalar geliştirmek yerine, kodlama konseptleri hakkında bilgi sağlamakta iyiyim."
            ]
        },
        simpleSocial: {
            patterns: [/hha/i, /haha/i, /lol/i, /hehe/i, /baba/i, /anne/i, /abi/i, /abla/i, /kardeş/i, /arkadaş/i, /kanka/i, /dostum/i],
            responses: [
                "Gülmenize sevindim! Başka ne konuşmak istersiniz?",
                "Haha, neşelenmenize yardımcı olabildiğime sevindim.",
                "Bu komikti! 😄",
                "Anlıyorum. Aile ve ilişkiler önemli konular.",
                "Bu konuda size nasıl yardımcı olabilirim?",
                "Daha fazla bilgi veya sohbet etmek istediğiniz başka bir konu var mı?"
            ]
        },
        // YENİ KATEGORİ: Açıklama ve Netleştirme
        clarification: {
            patterns: [
                /öyle demedim/i, /yanlış anladın/i, /demek istediğim/i, /ben onu kastetmedim/i,
                /bak şimdi/i, /tekrar et/i, /daha açık/i, /hayır/i, /anlamadın/i, /yapamıyorsun/i // 'anlamadın', 'yapamıyorsun' buraya taşındı
            ],
            responses: [
                "Öyle mi? Üzgünüm, bazen tam olarak ne demek istediğinizi anlamakta zorlanabiliyorum. Lütfen daha net ifade edebilir misiniz?",
                "Yanlış anladıysam özür dilerim. Lütfen sorunuzu farklı bir şekilde tekrar sorar mısınız?",
                "Amacım size en doğru yanıtı vermek. Sanırım bir önceki sorunuzu tam olarak kavrayamadım. Ne demek istediğinizi biraz daha açabilir misiniz?",
                "Hımm, anladım. Bir önceki cevabımdan memnun kalmadınız. Lütfen bana yardımcı olmak için sorunuzu yeniden ifade edin."
            ]
        },
        // YENİ KATEGORİ: Oyun Yapımı Tavsiyesi
        gameDevelopment: {
            patterns: [
                /oyun yapıcam ne tarz oyun yapmalıyım/i, /nasıl oyun yapmalıyım/i, /hangi oyun türünü yapmalıyım/i,
                /oyun fikirleri/i, /oyun önerisi/i, /ne tür oyun/i, /oyun geliştirmek/i
            ],
            responses: [
                "Harika bir fikir! Oyun yapmak gerçekten keyifli olabilir. Ne tarz oyunlar oynamaktan hoşlanırsınız? Ya da hangi türlerde kendinizi daha yetenekli hissediyorsunuz?",
                "Oyun yapımı heyecan verici! İlk olarak hangi platformu hedefliyorsunuz (mobil, PC, konsol)? Bu, oyun türünü belirlemenizde yardımcı olabilir.",
                "Bir oyun fikri arayışında mısınız? İsterseniz size farklı oyun türleri hakkında bilgi verebilirim (RPG, platform, strateji vb.) veya ilgi alanlarınıza göre önerilerde bulunabilirim.",
                "Oyun geliştirme çok geniş bir alan. Hangi aşamada yardıma ihtiyacınız var? Fikir aşaması, motor seçimi, programlama, tasarım mı?"
            ]
        }
    };

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

    async function correctAndCompleteSpelling(word) {
        if (!word || word.length < 2) return word;
        try {
            // console.log(`Datamuse API için "${word}" sorgusu gönderiliyor...`); // Hata ayıklama için
            const response = await fetch(FREE_APIS.SPELLCHECK(word));
            // console.log(`Datamuse API yanıtı (RAW):`, response); // Hata ayıklama için

            // Yanıtın OK (200) olup olmadığını kontrol et
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP Hata! Durum: ${response.status}, Yanıt: ${errorText}`);
            }

            const data = await response.json();
            // console.log(`Datamuse API yanıtı (JSON):`, data); // Hata ayıklama için

            if (data.length > 0 && data[0].word.toLowerCase() !== word.toLowerCase()) {
                if (data[0].score > 8000 || (data[0].word.startsWith(word) && data[0].word.length - word.length < 3)) {
                    // console.log(`Düzeltildi: "${word}" -> "${data[0].word}"`); // Hata ayıklama için
                    return data[0].word;
                }
            }
            return word;
        } catch (error) {
            console.warn("Yazım düzeltme API hatası:", error);
            // Hata durumunda orijinal kelimeyi döndür
            return word;
        }
    }

    async function processInput(text) {
        const lowerText = text.toLowerCase().trim();
        let correctedText = text;

        const words = lowerText.split(/\s+/);
        const correctedWordsPromises = words.map(word => correctAndCompleteSpelling(word));
        const correctedWords = await Promise.all(correctedWordsPromises);
        correctedText = correctedWords.join(' ');

        const customCorrections = {
            "mrb": "merhaba", "slm": "selam", "tşkkr": "teşekkür", "tesekkur": "teşekkür",
            "nslsn": "nasılsın", "nbr": "naber", "yzm": "yazım", "knk": "kanka", "tm": "tamam",
            "berhbaa": "merhaba", // 'merhbaa' gibi sık yapılan hatalar için manuel ekleme
            "yapay zeka nedır": "yapay zeka nedir" // Basit hatalar için
        };
        for (const [typo, correct] of Object.entries(customCorrections)) {
            const regex = new RegExp(`\\b${typo}\\b`, 'gi');
            correctedText = correctedText.replace(regex, correct);
        }

        correctedText = correctedText.replace(/(.)\1{2,}/g, '$1$1');

        return { corrected: correctedText.trim(), original: text.trim() };
    }

    async function fetchInformation(query) {
        try {
            // console.log(`Wikipedia API için "${query}" sorgusu gönderiliyor...`); // Hata ayıklama için
            const wikiResponse = await fetch(`${FREE_APIS.WIKIPEDIA}${encodeURIComponent(query)}`);
            // console.log(`Wikipedia API yanıtı (RAW):`, wikiResponse); // Hata ayıklama için

            if (!wikiResponse.ok) {
                 const errorText = await wikiResponse.text();
                 throw new Error(`HTTP Hata! Durum: ${wikiResponse.status}, Yanıt: ${errorText}`);
            }

            const wikiData = await wikiResponse.json();
            // console.log(`Wikipedia API yanıtı (JSON):`, wikiData); // Hata ayıklama için

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

    function checkLocalKnowledge(text) {
        const lowerText = text.toLowerCase();

        // Önemli: Kategorilerin sırası çok önemli!
        // İlk olarak en spesifik ve "öncelikli" kategorileri kontrol etmeliyiz.
        // Clarification ve unresponsive gibi meta-sohbet kategorileri, diğerlerinden önce gelmeli.
        const orderedCategories = [
            'clarification', // Düzeltmeler ve netleştirmeler (örn: "öyle demedim", "anlamadın")
            'unresponsive',  // Olumsuz, saldırgan ifadeler (örn: "salak")
            'greetings',     // Selamlaşmalar (örn: "merhaba")
            'howAreYou',     // Nasılsın soruları
            'compliments',
            'farewells',
            'aboutMe',
            'jokes',
            'weather',
            'codeRelated',
            'gameDevelopment',
            'simpleSocial'
        ];

        for (const category of orderedCategories) {
            const data = LOCAL_KNOWLEDGE[category];
            for (const pattern of data.patterns) {
                if (pattern.test(lowerText)) {
                    if (data.responses && data.responses.length > 0) {
                        return data.responses[Math.floor(Math.random() * data.responses.length)];
                    } else {
                        return null; // Bu, API'ye gitmesi gerektiği anlamına gelir.
                    }
                }
            }
        }
        return null;
    }

    async function generateResponse(userInputText) {
        const welcomeScreen = document.querySelector('.welcome-message');
        if (welcomeScreen) {
            welcomeScreen.remove();
        }

        const { corrected, original } = await processInput(userInputText);
        let responseContent = null;
        let correctionNote = null;

        if (corrected !== original) {
            correctionNote = `Not: "${original}" yerine "${corrected}" olarak anladım.`;
        }

        // ÖNEMLİ: checkLocalKnowledge fonksiyonu şimdi kategorileri belirli bir sıraya göre kontrol ediyor.
        responseContent = checkLocalKnowledge(corrected);
        if (responseContent) {
            return {
                response: responseContent,
                corrected: correctionNote
            };
        }

        // Eğer yerel bir chatbot cevabı yoksa, API'den bilgi arayışına uygun mu diye bak.
        const searchKeywords = ['nedir', 'kimdir', 'nasıl yapılır', 'bilgi ver', 'açıkla', 'hakkında', 'ne demek', 'hangi', 'nelerdir']; // 'nelerdir' eklendi
        const isAQuestion = corrected.endsWith('?') || searchKeywords.some(keyword => corrected.includes(keyword)) || corrected.split(' ').length > 3; // Daha uzun cümleler için de API'ye git

        if (isAQuestion) {
            const apiInfo = await fetchInformation(corrected);
            if (apiInfo) {
                return {
                    response: `${apiInfo.source} bilgisine göre: ${apiInfo.content}\n\nDaha fazlası için: ${apiInfo.url || 'Arama yapabilirsiniz'}`,
                    corrected: correctionNote
                };
            }
        }

        // Eğer hiçbir yere düşmezse, varsayılan anlayamadım yanıtı ver
        return {
            response: `Üzgünüm, "${corrected}" hakkında net bir bilgi bulamadım veya sorunuzu tam olarak anlayamadım. Lütfen daha farklı bir şekilde ifade etmeyi deneyin.`,
            corrected: correctionNote
        };
    }

    async function sendMessage() {
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        addMessage(userMessage, 'user');
        userInput.value = '';

        const typingIndicator = showTypingIndicator();

        try {
            const { response, corrected } = await generateResponse(userMessage);

            if (corrected) {
                addMessage(corrected, 'ai', true);
            }

            typingIndicator.remove();
            addMessage(response, 'ai');
        } catch (error) {
            typingIndicator.remove();
            addMessage("Üzgünüm, bir hata oluştu veya bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.", 'ai');
            console.error("Mesaj gönderme hatası:", error);
        }
    }

    function addMessage(content, type, isNote = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        let formattedContent = content;
        if (isNote) {
            formattedContent = `<i>${content}</i>`;
        } else if (type === 'ai') {
            formattedContent = formattedContent.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        }

        messageDiv.innerHTML = `<div class="message-content">${formattedContent}</div>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

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

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

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
