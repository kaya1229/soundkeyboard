// --- 1. 음악적 스케일 기반 사운드 설정 ---
// 거문고 55초, 가야금 80초 중 가장 맑은 음색 구간만 선별하여 매핑
const sounds = {
    gumungo: new Howl({ 
        src: ['./gumungo_U_scale_mid_02.wav'], 
        volume: 0.6, 
        sprite: { 
            // 핵심 5음계로 그룹화 (어떤 자음을 쳐도 이 5가지 중 하나가 나옴)
            'scale1': [0, 3000],   // 궁
            'scale2': [10000, 3000], // 상
            'scale3': [20000, 3000], // 각
            'scale4': [35000, 3000], // 치
            'scale5': [45000, 3000]  // 우
        } 
    }),
    gayageum: new Howl({ 
        src: ['./sanjo_gayageum_sus_mid_03.mp3'], 
        volume: 0.5, 
        sprite: { 
            'vocal1': [5000, 4000], 
            'vocal2': [25000, 4000], 
            'vocal3': [45000, 4000], 
            'vocal4': [65000, 4000]
        } 
    }),
    janggu: {
        deong: new Howl({ src: ['./Janggu_3_1.wav'], volume: 0.6 }),
        gideok: new Howl({ src: ['./Janggu_2_1.wav'], volume: 0.6 }),
        deo: new Howl({ src: ['./Janggu_6_1.wav'], volume: 0.15 }),
        kung: new Howl({ src: ['./Janggu_1_1.wav'], volume: 0.35 })
    }
};

// 자음/모음을 위에서 정의한 '음악적 그룹'에 할당
const jamoMap = {
    // 거문고 그룹 (자음)
    'ㄱ': 'scale1', 'ㄴ': 'scale2', 'ㄷ': 'scale3', 'ㄹ': 'scale4', 'ㅁ': 'scale5',
    'ㅂ': 'scale1', 'ㅅ': 'scale2', 'ㅇ': 'scale3', 'ㅈ': 'scale4', 'ㅊ': 'scale5',
    'ㅋ': 'scale1', 'ㅌ': 'scale2', 'ㅍ': 'scale3', 'ㅎ': 'scale4',
    // 모음 그룹 (가야금)
    'ㅏ': 'vocal1', 'ㅑ': 'vocal2', 'ㅓ': 'vocal3', 'ㅕ': 'vocal4',
    'ㅗ': 'vocal1', 'ㅛ': 'vocal2', 'ㅜ': 'vocal3', 'ㅠ': 'vocal4',
    'ㅡ': 'vocal1', 'ㅣ': 'vocal2'
};

// --- 2. 수묵 효과 (더욱 부드럽게) ---
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
        this.opacity = 0.15;
        this.blur = 40; // 블러를 극대화하여 형태보다 색감 위주로
    }
    update() { if (this.currentSize < this.targetSize) { this.currentSize += 2; this.opacity -= 0.0007; } }
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
    ctx.fillStyle = 'rgba(244, 241, 234, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    inkSpots.forEach((s, i) => { s.update(); s.draw(); if(s.opacity <= 0) inkSpots.splice(i,1); });
    requestAnimationFrame(animate);
}
animate();

// --- 3. 음악적 연주 로직 (Ducking & Dynamics 추가) ---
function playChar(char, x, y) {
    const units = Hangul.disassemble(char);
    const dynamicVol = Math.random() * 0.2 + 0.4; // 강약 조절

    // 1. 초성 (거문고)
    const choKey = jamoMap[units[0]] || 'scale1';
    const gumungoId = sounds.gumungo.play(choKey);
    sounds.gumungo.volume(dynamicVol, gumungoId);
    sounds.janggu.deo.play();
    inkSpots.push(new InkSpot(x, y, 120));

    // 2. 중성 (가야금) - 0.15초 뒤에 선율 연결
    const vowel = units.find(u => Hangul.isVowel(u));
    if (vowel) {
        const jungKey = jamoMap[vowel] || 'vocal1';
        setTimeout(() => {
            const gayageumId = sounds.gayageum.play(jungKey);
            sounds.gayageum.volume(dynamicVol * 0.7, gayageumId);
            inkSpots.push(new InkSpot(x, y, 200));
        }, 150);
    }

    // 3. 종성 (장구 쿵)
    if (units.length > 2) {
        setTimeout(() => {
            sounds.janggu.kung.play();
            inkSpots.push(new InkSpot(x, y, 70));
        }, 300);
    }
}

async function playMyRhythm() {
    const text = document.getElementById('inputArea').value;
    if (!text) return;

    for (let char of text) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        if (char === ' ') {
            sounds.janggu.deong.play();
            inkSpots.push(new InkSpot(x, y, 350));
            await new Promise(r => setTimeout(r, 800));
        } else if (['.', '!', '?'].includes(char)) {
            sounds.janggu.gideok.play();
            await new Promise(r => setTimeout(r, 1200));
        } else if (char === ',') {
            await new Promise(r => setTimeout(r, 500));
        } else {
            playChar(char, x, y);
            // 글자당 기본 간격을 600ms로 늘려 여백 확보
            await new Promise(r => setTimeout(r, 600)); 
        }
    }
}

function clearAll() {
    document.getElementById('inputArea').value = '';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    inkSpots = [];
}
