// --- 1. 사운드 설정 (거문고 55초, 가야금 80초 기준 매핑) ---
const sounds = {
    gumungo: new Howl({ 
        src: ['./gumungo_U_scale_mid_02.wav'], 
        volume: 0.7, 
        sprite: { 
            'ㄱ': [0, 2800], 'ㄲ': [2800, 2800], 'ㄴ': [5600, 2800], 'ㄷ': [8400, 2800], 
            'ㄸ': [11200, 2800], 'ㄹ': [14000, 2800], 'ㅁ': [16800, 2800], 'ㅂ': [19600, 2800], 
            'ㅃ': [22400, 2800], 'ㅅ': [25200, 2800], 'ㅆ': [28000, 2800], 'ㅇ': [30800, 2800], 
            'ㅈ': [33600, 2800], 'ㅉ': [36400, 2800], 'ㅊ': [39200, 2800], 'ㅋ': [42000, 2800], 
            'ㅌ': [44800, 2800], 'ㅍ': [47600, 2800], 'ㅎ': [50400, 2800]
        } 
    }),
    gayageum: new Howl({ 
        src: ['./sanjo_gayageum_sus_mid_03.mp3'], 
        volume: 0.6, 
        sprite: { 
            'ㅏ': [0, 3800], 'ㅐ': [3800, 3800], 'ㅑ': [7600, 3800], 'ㅒ': [11400, 3800], 
            'ㅓ': [15200, 3800], 'ㅔ': [19000, 3800], 'ㅕ': [22800, 3800], 'ㅖ': [26600, 3800], 
            'ㅗ': [30400, 3800], 'ㅘ': [34200, 3800], 'ㅙ': [38000, 3800], 'ㅚ': [41800, 3800], 
            'ㅛ': [45600, 3800], 'ㅜ': [49400, 3800], 'ㅝ': [53200, 3800], 'ㅞ': [57000, 3800], 
            'ㅟ': [60800, 3800], 'ㅠ': [64600, 3800], 'ㅡ': [68400, 3800], 'ㅢ': [72200, 3800], 'ㅣ': [76000, 3800]
        } 
    }),
    janggu: {
        deong: new Howl({ src: ['./Janggu_3_1.wav'], volume: 0.6 }),
        gideok: new Howl({ src: ['./Janggu_2_1.wav'], volume: 0.6 }),
        deo: new Howl({ src: ['./Janggu_6_1.wav'], volume: 0.15 }),
        kung: new Howl({ src: ['./Janggu_1_1.wav'], volume: 0.35 })
    }
};

// --- 2. 입력 감지 (이제 리듬 기록 없이 텍스트만 유지) ---
const inputArea = document.getElementById('inputArea');

// --- 3. 수묵 애니메이션 (안개형 번짐) ---
const canvas = document.getElementById('inkCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
let inkSpots = [];

class InkSpot {
    constructor(x, y, targetSize) {
        this.x = x + (Math.random() * 100 - 50);
        this.y = y + (Math.random() * 100 - 50);
        this.currentSize = 0;
        this.targetSize = targetSize;
        this.opacity = 0.2;
        this.blur = 30; 
    }
    update() { if (this.currentSize < this.targetSize) { this.currentSize += 1.5; this.opacity -= 0.0006; } }
    draw() {
        if (this.opacity <= 0) return;
        ctx.save();
        ctx.filter = `blur(${this.blur}px)`;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.currentSize);
        grad.addColorStop(0, `rgba(0,0,0,${this.opacity})`);
        grad.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

function animate() {
    ctx.fillStyle = 'rgba(244, 241, 234, 0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    inkSpots.forEach((s, i) => { s.update(); s.draw(); if(s.opacity <= 0) inkSpots.splice(i,1); });
    requestAnimationFrame(animate);
}
animate();

// --- 4. 연주 핵심 로직 ---
function playChar(char, x, y) {
    const units = Hangul.disassemble(char);
    
    // 초성 연주
    if (sounds.gumungo._sprite[units[0]]) {
        sounds.gumungo.play(units[0]);
        sounds.janggu.deo.play();
        inkSpots.push(new InkSpot(x, y, 100));
    }

    // 중성 연주 (시차 부여)
    const vowel = units.find(u => Hangul.isVowel(u));
    if (vowel && sounds.gayageum._sprite[vowel]) {
        setTimeout(() => {
            sounds.gayageum.play(vowel);
            inkSpots.push(new InkSpot(x, y, 180));
        }, 120);
    }

    // 종성 연주 (시차 부여)
    if (units.length > 2) {
        setTimeout(() => {
            sounds.janggu.kung.play();
            inkSpots.push(new InkSpot(x, y, 60));
        }, 280);
    }
}

async function playMyRhythm() {
    const text = inputArea.value;
    if (!text) return;

    for (let char of text) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        if (char === ' ') {
            sounds.janggu.deong.play();
            inkSpots.push(new InkSpot(x, y, 300));
            await new Promise(r => setTimeout(r, 700)); // 띄어쓰기 휴지기
        } else if (['.', '!', '?'].includes(char)) {
            sounds.janggu.gideok.play();
            inkSpots.push(new InkSpot(x, y, 250));
            await new Promise(r => setTimeout(r, 1000)); // 문장 마침 휴지기
        } else if (char === ',') {
            await new Promise(r => setTimeout(r, 400)); // 쉼표 휴지기
        } else if (char === '\n') {
            sounds.janggu.deong.play();
            await new Promise(r => setTimeout(r, 1200)); // 줄바꿈 긴 휴지기
        } else {
            playChar(char, x, y);
            await new Promise(r => setTimeout(r, 500)); // 일반 글자 간격
        }
    }
}

function clearAll() {
    inputArea.value = '';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    inkSpots = [];
}
