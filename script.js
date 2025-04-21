const canvas = document.getElementById('oyunAlani');
const ctx = canvas.getContext('2d');
const skorElementi = document.getElementById('skor');
const siradakiRenkElementi = document.getElementById('siradakiRenk');
const gucBarElementi = document.getElementById('gucBar');

let skor = 0;
const kareler = [];
const duvarKalınlığı = 5;
const kareBoyutu = 20;
const renkler = ['red', 'blue', 'yellow', 'purple', 'orange'];
let siradakiRenk;
let firlatmaGucu = 0;
let firlatmaAktif = false;
let baslangicX, baslangicY;
let hedefX, hedefY;

function rastgeleRenk() {
    return renkler[Math.floor(Math.random() * renkler.length)];
}

function Kare(x, y, vx, vy, renk) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.renk = renk;
    this.boyut = kareBoyutu;

    this.çiz = function() {
        ctx.fillStyle = this.renk;
        ctx.fillRect(this.x, this.y, this.boyut, this.boyut);
    }

    this.güncelle = function() {
        this.x += this.vx;
        this.y += this.vy;

        // Sürtünme (yavaşlama) ekleyelim
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.vy += 0.1; // Yerçekimi

        // Duvarlara çarpma kontrolü ve sekme
        if (this.x + this.boyut > canvas.width - duvarKalınlığı || this.x < duvarKalınlığı) {
            this.vx = -this.vx;
        }
        if (this.y < duvarKalınlığı) {
            this.vy = -this.vy;
        }
        // Alt duvara çarparsa oyundan çıkar
        if (this.y + this.boyut > canvas.height) {
            const index = kareler.indexOf(this);
            if (index > -1) {
                kareler.splice(index, 1);
            }
        }
    }
}

function yeniRenkBelirle() {
    siradakiRenk = rastgeleRenk();
    siradakiRenkElementi.textContent = siradakiRenk;
    siradakiRenkElementi.style.color = siradakiRenk;
}

canvas.addEventListener('mousedown', (e) => {
    firlatmaAktif = true;
    baslangicX = e.clientX - canvas.getBoundingClientRect().left;
    baslangicY = canvas.height - kareBoyutu - duvarKalınlığı; // Alttan fırlat
    firlatmaGucu = 0;
    gucBarElementi.style.display = 'block';
});

canvas.addEventListener('mouseup', (e) => {
    if (firlatmaAktif) {
        firlatmaAktif = false;
        hedefX = e.clientX - canvas.getBoundingClientRect().left;
        hedefY = e.clientY - canvas.getBoundingClientRect().top;

        const dx = hedefX - baslangicX;
        const dy = hedefY - baslangicY;
        const mesafe = Math.sqrt(dx * dx + dy * dy);

        const hizCarpani = firlatmaGucu / 50; // Gücü hıza çeviriyoruz
        const vx = (dx / mesafe) * hizCarpani * 5;
        const vy = (dy / mesafe) * hizCarpani * 5;

        kareler.push(new Kare(baslangicX, baslangicY, vx, vy, siradakiRenk));
        yeniRenkBelirle();
        gucBarElementi.style.display = 'none';
        gucBarElementi.style.setProperty('--guc', '0%');
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (firlatmaAktif) {
        firlatmaGucu = Math.min(100, firlatmaGucu + 2); // Gücü artır
        gucBarElementi.style.setProperty('--guc', `${firlatmaGucu}%`);
        gucBarElementi.style.background = `linear-gradient(to right, red ${firlatmaGucu}%, #ccc ${firlatmaGucu}%)`;
    }
});

function çarpışmaKontrolü() {
    for (let i = 0; i < kareler.length; i++) {
        for (let j = i + 1; j < kareler.length; j++) {
            const kare1 = kareler[i];
            const kare2 = kareler[j];

            // Karelerin merkez noktaları arasındaki mesafeyi kontrol et
            const dx = kare1.x + kare1.boyut / 2 - (kare2.x + kare2.boyut / 2);
            const dy = kare1.y + kare1.boyut / 2 - (kare2.y + kare2.boyut / 2);
            const mesafeKare = dx * dx + dy * dy;
            const minimumMesafeKare = kareBoyutu * kareBoyutu; // Köşegen mesafe

            if (mesafeKare < minimumMesafeKare) {
                if (kare1.renk === kare2.renk) {
                    skor++;
                    skorElementi.textContent = `Skor: ${skor}`;
                    kareler.splice(j, 1);
                    kareler.splice(i, 1);
                    return;
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

    kareler.forEach(kare => {
        kare.güncelle();
        kare.çiz();
    });

    çarpışmaKontrolü();

    requestAnimationFrame(oyunDöngüsü);
}

// Mobil cihazlar için dokunma olayları
canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        firlatmaAktif = true;
        baslangicX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        baslangicY = canvas.height - kareBoyutu - duvarKalınlığı;
        firlatmaGucu = 0;
        gucBarElementi.style.display = 'block';
    }
});

canvas.addEventListener('touchend', (e) => {
    if (firlatmaAktif) {
        firlatmaAktif = false;
        hedefX = e.changedTouches[0].clientX - canvas.getBoundingClientRect().left;
        hedefY = e.changedTouches[0].clientY - canvas.getBoundingClientRect().top;

        const dx = hedefX - baslangicX;
        const dy = hedefY - baslangicY;
        const mesafe = Math.sqrt(dx * dx + dy * dy);

        const hizCarpani = firlatmaGucu / 50;
        const vx = (dx / mesafe) * hizCarpani * 5;
        const vy = (dy / mesafe) * hizCarpani * 5;

        kareler.push(new Kare(baslangicX, baslangicY, vx, vy, siradakiRenk));
        yeniRenkBelirle();
        gucBarElementi.style.display = 'none';
        gucBarElementi.style.setProperty('--guc', '0%');
    }
});

canvas.addEventListener('touchmove', (e) => {
    if (firlatmaAktif && e.touches.length === 1) {
        firlatmaGucu = Math.min(100, firlatmaGucu + 2);
        gucBarElementi.style.setProperty('--guc', `${firlatmaGucu}%`);
        gucBarElementi.style.background = `linear-gradient(to right, red ${firlatmaGucu}%, #ccc ${firlatmaGucu}%)`;
    }
});

yeniRenkBelirle();
oyunDöngüsü();
