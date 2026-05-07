// --- 악기 및 장구 사운드 설정 ---
const sounds = {
    // 거문고: 처음 4초, 이후 5초씩
    gumungo: new Howl({
        src: ['./gumungo_U_scale_mid_02.wav'],
        sprite: {
            'ㄱ': [0, 4000], 'ㄴ': [4000, 5000], 'ㄷ': [9000, 5000], 'ㄹ': [14000, 5000],
            'ㅁ': [19000, 5000], 'ㅂ': [24000, 5000]
        }
    }),
    // 가야금: 7초 단위
    gayageum: new Howl({
        src: ['./sanjo_gayageum_sus_mid_03.wav'],
        sprite: {
            'ㅅ': [0, 7000], 'ㅇ': [7000, 7000], 'ㅈ': [14000, 7000], 'ㅊ': [21000, 7000],
            'ㅋ': [28000, 7000], 'ㅌ': [35000, 7000], 'ㅍ': [42000, 7000], 'ㅎ': [49000, 7000]
        }
    }),
    // 생황: 10초 단위
    saenghwang: new Howl({
        src: ['./생황_음계와농음_중.wav'],
        sprite: {
            'ㅏ': [0, 10000], 'ㅑ': [10000, 10000], 'ㅓ': [20000, 10000], 'ㅕ': [30000, 10000], 'ㅗ': [40000, 10000]
        }
    }),
    // 해금: 처음 2초, 이후 3초씩
    haegeum: new Howl({
        src: ['./Haegeum_1.wav'],
        sprite: {
            'ㅛ': [0, 2000], 'ㅜ': [2000, 3000], 'ㅠ': [5000, 3000], 'ㅡ': [8000, 3000], 'ㅣ': [11000, 3000]
        }
    }),
    // 장구 주법 매핑
    janggu: {
        deong: new Howl({ src: ['./Janggu_3_1.wav'] }),      // 덩 (Space)
        gideok: new Howl({ src: ['./Janggu_2_1.wav'] }),     // 기덕 (Enter)
        kung: new Howl({ src: ['./Janggu_1_1.wav'] }),       // 쿵 (울림 받침)
        deoreoreo: new Howl({ src: ['./Janggu_4_1.wav'] }),  // 더러러 (ㄹ 받침)
        deok: new Howl({ src: ['./Janggu_5_1.wav'] }),       // 덕 (맺음 받침)
        deo: new Howl({ src: ['./Janggu_6_1.wav'] })         // 더 (초성 보조)
    }
};

// --- Canvas 수묵화 연출 ---
const canvas = document.getElementById('inkCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function drawInk(size = 50, alpha = 0.2) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
    grad.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
}

// --- 메인 입력 로직 ---
const inputArea = document.getElementById('inputArea');

inputArea.addEventListener('input', (e) => {
    const val = e.target.value;
    const lastChar = val.charAt(val.length - 1);
    if (!lastChar) return;

    const units = Hangul.disassemble(lastChar);
    units.forEach((unit, index) => {
        if (index === 0) { // 초성
            if (sounds.gumungo._sprite[unit]) sounds.gumungo.play(unit);
            else if (sounds.gayageum._sprite[unit]) sounds.gayageum.play(unit);
            sounds.janggu.deo.play(); // 초성 시 '더' 소리 추가
            drawInk(40, 0.3);
        } 
        else if (Hangul.isVowel(unit)) { // 중성
            if (sounds.saenghwang._sprite[unit]) sounds.saenghwang.play(unit);
            else if (sounds.haegeum._sprite[unit]) sounds.haegeum.play(unit);
            drawInk(60, 0.1);
        } 
        else if (index > 1) { // 종성(받침)
            if (['ㄱ', 'ㄷ', 'ㅂ'].includes(unit)) sounds.janggu.deok.play();
            else if (unit === 'ㄹ') sounds.janggu.deoreoreo.play();
            else sounds.janggu.kung.play();
            drawInk(30, 0.4);
        }
    });
});

// 기능키 설정
inputArea.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        sounds.janggu.deong.play();
        drawInk(100, 0.1);
    }
    if (e.code === 'Enter') {
        sounds.janggu.gideok.play();
        drawInk(120, 0.05);
    }
});
