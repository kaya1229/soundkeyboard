// --- 악기 및 장구 사운드 설정 (기존과 동일) ---
const sounds = {
    gumungo: new Howl({
        src: ['./gumungo_U_scale_mid_02.wav'],
        sprite: { 'ㄱ': [0, 4000], 'ㄴ': [4000, 5000], 'ㄷ': [9000, 5000], 'ㄹ': [14000, 5000], 'ㅁ': [19000, 5000], 'ㅂ': [24000, 5000] }
    }),
    gayageum: new Howl({
        src: ['./sanjo_gayageum_sus_mid_03.wav'],
        sprite: { 'ㅅ': [0, 7000], 'ㅇ': [7000, 7000], 'ㅈ': [14000, 7000], 'ㅊ': [21000, 7000], 'ㅋ': [28000, 7000], 'ㅌ': [35000, 7000], 'ㅍ': [42000, 7000], 'ㅎ': [49000, 7000] }
    }),
    saenghwang: new Howl({
        src: ['./생황_음계와농음_중.wav'],
        sprite: { 'ㅏ': [0, 10000], 'ㅑ': [10000, 10000], 'ㅓ': [20000, 10000], 'ㅕ': [30000, 10000], 'ㅗ': [40000, 10000] }
    }),
    haegeum: new Howl({
        src: ['./Haegeum_1.wav'],
        sprite: { 'ㅛ': [0, 2000], 'ㅜ': [2000, 3000], 'ㅠ': [5000, 3000], 'ㅡ': [8000, 3000], 'ㅣ': [11000, 3000] }
    }),
    janggu: {
        deong: new Howl({ src: ['./Janggu_3_1.wav'] }),
        gideok: new Howl({ src: ['./Janggu_2_1.wav'] }),
        kung: new Howl({ src: ['./Janggu_1_1.wav'] }),
        deoreoreo: new Howl({ src: ['./Janggu_4_1.wav'] }),
        deok: new Howl({ src: ['./Janggu_5_1.wav'] }),
        deo: new Howl({ src: ['./Janggu_6_1.wav'] })
    }
};

// --- 고도화된 수묵화 연출 로직 ---
const canvas = document.getElementById('inkCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

class InkParticle {
    constructor(x, y, maxSize, color) {
        this.x = x + (Math.random() * 20 - 10);
        this.y = y + (Math.random() * 20 - 10);
        this.size = 1; // 시작 크기
        this.maxSize = maxSize * (0.8 + Math.random() * 0.4);
        this.alpha = 0.4; // 초기 투명도
        this.expandSpeed = Math.random() * 2 + 1; // 퍼지는 속도
    }

    update() {
        if (this.size < this.maxSize) {
            this.size += this.expandSpeed;
            this.alpha -= 0.005; // 퍼지면서 흐려짐
        }
    }

    draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        grad.addColorStop(0.4, 'rgba(30, 30, 30, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function animate() {
    // 배경을 지우지 않고 조금씩 덮어서 잔상을 남길 수도 있지만, 
    // 여기서는 수묵화 느낌을 위해 입자만 계속 업데이트합니다.
    particles.forEach((p, i) => {
        p.update();
        p.draw();
        if (p.alpha <= 0) particles.splice(i, 1);
    });
    requestAnimationFrame(animate);
}
animate();

function createInkEffect(baseSize) {
    // 한 번에 여러 개의 입자를 생성해 불규칙한 스며듦 표현
    for(let i = 0; i < 3; i++) {
        particles.push(new InkParticle(
            Math.random() * canvas.width, 
            Math.random() * canvas.height, 
            baseSize
        ));
    }
}

// --- 메인 입력 로직 ---
const inputArea = document.getElementById('inputArea');

inputArea.addEventListener('input', (e) => {
    const val = e.target.value;
    const lastChar = val.charAt(val.length - 1);
    if (!lastChar) return;

    const units = Hangul.disassemble(lastChar);
    units.forEach((unit, index) => {
        if (index === 0) { // 초성: 강한 타격
            if (sounds.gumungo._sprite[unit]) sounds.gumungo.play(unit);
            else if (sounds.gayageum._sprite[unit]) sounds.gayageum.play(unit);
            sounds.janggu.deo.play();
            createInkEffect(50); 
        } 
        else if (Hangul.isVowel(unit)) { // 중성: 은은한 번짐
            if (sounds.saenghwang._sprite[unit]) sounds.saenghwang.play(unit);
            else if (sounds.haegeum._sprite[unit]) sounds.haegeum.play(unit);
            createInkEffect(80); 
        } 
        else if (index > 1) { // 종성: 맺음
            if (['ㄱ', 'ㄷ', 'ㅂ'].includes(unit)) sounds.janggu.deok.play();
            else if (unit === 'ㄹ') sounds.janggu.deoreoreo.play();
            else sounds.janggu.kung.play();
            createInkEffect(40);
        }
    });
});

inputArea.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        sounds.janggu.deong.play();
        createInkEffect(150); // 크게 스며듦
    }
    if (e.code === 'Enter') {
        sounds.janggu.gideok.play();
        createInkEffect(200);
    }
});
