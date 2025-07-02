<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SKY AI PRO MAX</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="super-container">
        <div class="ai-container">
            <div class="ai-header">
                <div class="ai-title">
                    <i class="fas fa-star"></i>
                    <h1>SKY AI <span>PRO MAX</span></h1>
                </div>
                <div class="ai-subtitle">Sınırsız Bilgi · Anında Yanıt · Ücretsiz</div>
            </div>
            
            <div class="chat-container">
                <div class="welcome-screen">
                    <div class="welcome-icon">
                        <i class="fas fa-robot"></i>
                    </div>
                    <h2>Ultimate SKY AI PRO MAX</h2>
                    <p>Bana <strong>her şeyi</strong> sorabilirsiniz! Yazım hatalarınızı otomatik düzeltir, eksik bilgileri tamamlarım.</p>
                    
                    <div class="examples">
                        <div class="example-card">
                            <i class="fas fa-lightbulb"></i>
                            <p>"Yapay zeka nedir?"</p>
                        </div>
                        <div class="example-card">
                            <i class="fas fa-cloud-sun"></i>
                            <p>"İstanbul'da hava nasıl?"</p>
                        </div>
                        <div class="example-card">
                            <i class="fas fa-code"></i>
                            <p>"Python nasıl öğrenilir?"</p>
                        </div>
                    </div>
                </div>
                
                <div class="messages" id="messages"></div>
                
                <div class="input-area">
                    <div class="typing-indicator" id="typing-indicator">
                        <span>SKY AI yazıyor...</span>
                        <div class="dots">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                    </div>
                    
                    <div class="input-box">
                        <input type="text" id="user-input" placeholder="SKY AI PRO MAX'e soru sorun..." autofocus>
                        <button id="send-button">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="features">
                        <span><i class="fas fa-check"></i> Yazım Düzeltme</span>
                        <span><i class="fas fa-check"></i> Ücretsiz API'ler</span>
                        <span><i class="fas fa-check"></i> Akıllı Tamamlama</span>
                        <span><i class="fas fa-check"></i> Anında Yanıt</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
