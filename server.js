const express = require('express');
const axios = require('axios');
const cors = require('cors'); // CORS middleware'i
const app = express();
const port = 3000;

app.use(cors()); // Tüm kaynaklardan gelen isteklere izin ver
app.use(express.static('.')); // Frontend dosyalarını sunar (index.html, style.css, script.js)

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

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});
