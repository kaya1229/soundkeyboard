// --- 1. 사운드 로드 (MP3와 WAV 혼용) ---
const sounds = {
    // MP3 파일
    gayageum: new Howl({ src: ['./sanjo_gayageum_sus_mid_03.mp3'], volume: 0.6, sprite: { 'ㅅ': [0, 7000], 'ㅇ': [7000, 7000], 'ㅈ': [14000, 7000], 'ㅊ': [21000, 7000], 'ㅋ': [28000, 7000], 'ㅌ': [35000, 7000], 'ㅍ': [42000, 7000], 'ㅎ': [49000, 7000] } }),
    saenghwang: new Howl({ src: ['./생황_음계와농음_중.mp3'], volume: 0.3, sprite: { 'ㅏ': [0, 10000], 'ㅑ': [10000, 10000], 'ㅓ': [20000, 10000], 'ㅕ': [30000, 10000], 'ㅗ': [40000, 10000] } }),
    
    // WAV 파일
    gumungo: new Howl({ src: ['./gumungo_U_scale_mid_02.wav'], volume: 0.6, sprite: { 'ㄱ': [0, 4000], 'ㄴ': [4000, 5000], 'ㄷ': [9000, 5000], 'ㄹ': [14000, 5000], 'ㅁ': [19000, 5000], 'ㅂ': [24000, 5000] } }),
    haegeum: new Howl({ src: ['./Haegeum_1.wav'], volume: 0.3, sprite: { 'ㅛ': [0, 2000], 'ㅜ': [2000, 3000], 'ㅠ': [5000, 3000], 'ㅡ': [8000, 3000], 'ㅣ': [11000, 3000] } }),
    
    // 장구 (WAV)
    janggu: {
        deong: new Howl({ src: ['./Janggu_3_1.wav'], volume: 0.5 }),
        gideok: new Howl({ src: ['./Janggu_2_1.wav'], volume: 0.5 }),
        kung: new Howl({ src: ['./Janggu_1_1.wav'], volume: 0.4 }),
        deoreoreo: new Howl({ src: ['./Janggu_4_1.wav'], volume: 0.4 }),
        deok: new Howl({ src: ['./Janggu_5_1.wav'], volume: 0.4 }),
        deo: new Howl({ src: ['./Janggu_6_1.wav'], volume: 0.2 })
    }
};

// --- 2. 리듬 기록 시스템 ---
let rhythmData = []; 
let lastTime = Date.now();
const inputArea = document.getElementById('inputArea');

inputArea.addEventListener('input', (e) => {
    if (e.inputType === 'deleteContentBackward') {
        rhythmData.pop(); 
        return;
    }
    const now = Date.now();
    const delay = now - lastTime;
    const char = e.target.value.slice(-1);
    
    rhythmData.push({ char: char, delay: delay });
    lastTime = now;
});

// --- 3. 수묵화 애니메이션 엔진 ---
const canvas = document.getElementById('inkCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
let inkSpots = [];

class InkSpot {
    constructor(x, y, targetSize) {
        this.x = x; this.y = y;
        this.currentSize = 0;
        this.targetSize = targetSize;
        this.opacity = 0.2;
        this.blur = 25; // 환공포증 방지를 위해 더 뭉게줌
    }
    update() { if (this.currentSize < this.targetSize) { this.currentSize += 1.5; this.opacity -= 0.0008; } }
    draw() {
        if (this.opacity <= 0) return;
        ctx.save();
        ctx.filter = `blur(${this.blur}px)`;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.currentSize);
        grad.addColorStop(0, `rgba(0,0,0,${this.opacity})`);
        grad.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }
}

function animate() {
    ctx.fillStyle = 'rgba(244, 241, 234, 0.02)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    inkSpots.forEach((s, i) => { s.update(); s.draw(); if(s.opacity <= 0) inkSpots.splice(i,1); });
    requestAnimationFrame(animate);
}
animate();

// --- 4. 연주 핵심 함수 ---
function playChar(char, x, y) {
    const units = Hangul.disassemble(char);
    units.forEach((unit, i) => {
        setTimeout(() => {
            if (i === 0) { // 초성
                if (sounds.gumungo._sprite[unit]) sounds.gumungo.play(unit);
                else if (sounds.gayageum._sprite[unit]) sounds.gayageum.play(unit);
                sounds.janggu.deo.play();
                inkSpots.push(new InkSpot(x, y, 70));
            } else if (Hangul.isVowel(unit)) { // 중성
                if (sounds.saenghwang._sprite[unit]) sounds.saenghwang.play(unit);
                else if (sounds.haegeum._sprite[unit]) sounds.haegeum.play(unit);
                inkSpots.push(new InkSpot(x, y, 130));
            } else { // 종성
                if (['ㄱ', 'ㄷ', 'ㅂ'].includes(unit)) sounds.janggu.deok.play();
                else if (unit === 'ㄹ') sounds.janggu.deoreoreo.play();
                else sounds.janggu.kung.play();
                inkSpots.push(new InkSpot(x, y, 40));
            }
        }, i * 80);
    });
}

function playMyRhythm() {
    let accumulatedDelay = 0;
    rhythmData.forEach((item) => {
        const delay = Math.min(item.delay, 1500); // 너무 긴 공백은 1.5초로 제한
        accumulatedDelay += delay;
        setTimeout(() => {
            if (item.char === ' ' || item.char === '\n') {
                sounds.janggu.deong.play();
            } else {
                playChar(item.char, Math.random()*canvas.width, Math.random()*canvas.height);
            }
        }, accumulatedDelay);
    });
}

function clearAll() {
    inputArea.value = '';
    rhythmData = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    inkSpots = [];
}
