const express = require('express');
const axios = require('axios');
const cors = require('cors'); // CORS middleware'i
const app = express();
const port = 3000; // Bu port numarasını değiştirebilirsiniz, çakışma olursa

// Tüm kaynaklardan gelen isteklere izin ver (geliştirme için uygun)
// Gerçek bir uygulamada belirli domainlere izin vermek daha güvenlidir.
app.use(cors());

// Frontend dosyalarını sunar (index.html, style.css, script.js)
// Bu, projenizi doğrudan bir web sunucusu üzerinden çalıştırmanızı sağlar.
app.use(express.static('.'));

// Wikipedia API için proxy endpoint'i
app.get('/api/wikipedia', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Sorgu parametresi eksik.' });
    }
    try {
        const response = await axios.get(`https://tr.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&origin=*`);
        res.json(response.data);
    } catch (error) {
        console.error("Wikipedia proxy hatası:", error);
        res.status(500).json({ error: 'Wikipedia API hatası.' });
    }
});

// Datamuse (Yazım Düzeltme) API için proxy endpoint'i
app.get('/api/spellcheck', async (req, res) => {
    const word = req.query.word;
    if (!word) {
        return res.status(400).json({ error: 'Kelime parametresi eksik.' });
    }
    try {
        const response = await axios.get(`https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&max=1&v=ml`);
        res.json(response.data);
    } catch (error) {
        console.error("Datamuse proxy hatası:", error);
        res.status(500).json({ error: 'Datamuse API hatası.' });
    }
});

// Sunucuyu belirtilen portta dinlemeye başla
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
    console.log(`Uygulamanızı açmak için bu adresi tarayıcınızda ziyaret edin.`);
});
