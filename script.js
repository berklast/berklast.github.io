const canvas = document.getElementById('oyunAlani');
const ctx = canvas.getContext('2d');
const skorElementi = document.getElementById('skor');

let skor = 0;
const toplar = [];
const duvarKalınlığı = 5;
const topYarıçapı = 10;
const fırlatmaHızı = 2;

function rastgeleRenk() {
    const renkler = ['red', 'blue', 'yellow', 'purple', 'orange'];
    return renkler[Math.floor(Math.random() * renkler.length)];
}

function Top(x, y, vx, vy, renk) {
    this.x = x;
    this.y = y;
    this.vx = vx; // x yönündeki hız
    this.vy = vy; // y yönündeki hız
    this.renk = renk;
    this.yarıçap = topYarıçapı;

    this.çiz = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.yarıçap, 0, Math.PI * 2);
        ctx.fillStyle = this.renk;
        ctx.fill();
        ctx.closePath();
    }

    this.güncelle = function() {
        this.x += this.vx;
        this.y += this.vy;

        // Duvarlara çarpma kontrolü ve sekme
        if (this.x + this.yarıçap > canvas.width - duvarKalınlığı || this.x - this.yarıçap < duvarKalınlığı) {
            this.vx = -this.vx;
        }
        if (this.y - this.yarıçap < duvarKalınlığı) {
            this.vy = -this.vy;
        }
        // Alt duvara çarparsa oyundan çıkar (şimdilik)
        if (this.y + this.yarıçap > canvas.height) {
            const index = toplar.indexOf(this);
            if (index > -1) {
                toplar.splice(index, 1);
            }
        }
    }
}

function yeniTopFırlat() {
    const rastgeleX = canvas.width / 2; // Ortadan fırlat
    const rastgeleY = canvas.height - 50; // Biraz yukarıdan
    const rastgeleVX = (Math.random() - 0.5) * fırlatmaHızı; // Rastgele yatay hız
    const rastgeleVY = -Math.abs(Math.random() * fırlatmaHızı); // Yukarı doğru rastgele hız
    const renk = rastgeleRenk();
    toplar.push(new Top(rastgeleX, rastgeleY, rastgeleVX, rastgeleVY, renk));
}

function çarpışmaKontrolü() {
    for (let i = 0; i < toplar.length; i++) {
        for (let j = i + 1; j < toplar.length; j++) {
            const top1 = toplar[i];
            const top2 = toplar[j];
            const mesafeKare = (top1.x - top2.x) ** 2 + (top1.y - top2.y) ** 2;
            const yarıçapToplamıKare = (top1.yarıçap + top2.yarıçap) ** 2;

            if (mesafeKare < yarıçapToplamıKare) {
                // Çarpışma oldu
                if (top1.renk === top2.renk) {
                    // Aynı renkteyse birleştir
                    skor++;
                    skorElementi.textContent = `Skor: ${skor}`;
                    toplar.splice(j, 1);
                    toplar.splice(i, 1); // Önce j'yi silmek indeksi kaydıracağı için dikkatli olmalı
                    return; // Bir çarpışma yeterli, döngüden çık
                }
            }
        }
    }
}

function oyunDöngüsü() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Duvarları çiz
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, duvarKalınlığı, canvas.height); // Sol duvar
    ctx.fillRect(0, 0, canvas.width, duvarKalınlığı);  // Üst duvar
    ctx.fillRect(canvas.width - duvarKalınlığı, 0, duvarKalınlığı, canvas.height); // Sağ duvar

    toplar.forEach(top => {
        top.güncelle();
        top.çiz();
    });

    çarpışmaKontrolü();

    requestAnimationFrame(oyunDöngüsü);
}

// Belirli aralıklarla yeni toplar fırlat
setInterval(yeniTopFırlat, 1500); // Her 1.5 saniyede bir yeni top

oyunDöngüsü();
