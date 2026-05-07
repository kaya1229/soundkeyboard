// --- 1. 사운드 설정 (볼륨 밸런스 재조정) ---
const sounds = {
    gumungo: new Howl({ 
        src: ['./gumungo_U_scale_mid_02.wav'], 
        volume: 0.7, 
        sprite: { 
            'scale1': [0, 3000], 'scale2': [10000, 3000], 'scale3': [20000, 3000], 
            'scale4': [35000, 3000], 'scale5': [45000, 3000] 
        } 
    }),
    gayageum: new Howl({ 
        src: ['./sanjo_gayageum_sus_mid_03.wav'], 
        volume: 0.6, 
        sprite: { 
            'vocal1': [5000, 4000], 'vocal2': [25000, 4000], 
            'vocal3': [45000, 4000], 'vocal4': [65000, 4000]
        } 
    }),
    janggu: {
        deong: new Howl({ src: ['./Janggu_3_1.wav'], volume: 0.3 }),
        gideok: new Howl({ src: ['./Janggu_2_1.wav'], volume: 0.3 }),
        deo: new Howl({ src: ['./Janggu_6_1.wav'], volume: 0.05 }), // 아주 미세하게
        kung: new Howl({ src: ['./Janggu_1_1.wav'], volume: 0.15 })
    }
};

// --- 2. 연주 로직 (순차적 흐름) ---
async function playChar(char, x, y) {
    const units = Hangul.disassemble(char);
    
    // 1단계: 초성 (거문고) - "문장을 여는 소리"
    const choKey = jamoMap[units[0]] || 'scale1';
    sounds.gumungo.play(choKey);
    inkSpots.push(new InkSpot(x, y, 100));

    // 2단계: 중성 (가야금) - 초성이 울리고 0.25초 뒤에 "대답하는 소리"
    // 여기서 await를 써서 소리가 겹치지 않고 '이어지게' 만듭니다.
    await new Promise(r => setTimeout(r, 250));
    
    const vowel = units.find(u => Hangul.isVowel(u));
    if (vowel) {
        const jungKey = jamoMap[vowel] || 'vocal1';
        sounds.gayageum.play(jungKey);
        inkSpots.push(new InkSpot(x, y, 160));
    }

    // 3단계: 종성 (장구 쿵) - 가야금이 울리고 0.3초 뒤에 "맺는 소리"
    if (units.length > 2) {
        await new Promise(r => setTimeout(r, 300));
        sounds.janggu.kung.play();
        inkSpots.push(new InkSpot(x, y, 60));
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
            inkSpots.push(new InkSpot(x, y, 300));
            await new Promise(r => setTimeout(r, 900)); // 여백을 길게
        } else if (['.', '!', '?'].includes(char)) {
            sounds.janggu.gideok.play();
            await new Promise(r => setTimeout(r, 1500)); // 문장 끝은 더 길게
        } else if (char === ',') {
            await new Promise(r => setTimeout(r, 600));
        } else {
            // 한 글자의 모든 자소가 순차적으로 끝날 때까지 기다린 후 다음 글자로 이동
            await playChar(char, x, y);
            await new Promise(r => setTimeout(r, 400)); // 글자와 글자 사이의 여백
        }
    }
}
