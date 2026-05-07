// --- 1. 사운드 설정 (장구 볼륨 대폭 하향) ---
const sounds = {
    gumungo: new Howl({ 
        src: ['./gumungo_U_scale_mid_02.wav'], 
        volume: 0.75, // 거문고는 묵직하게 유지
        sprite: { 
            'scale1': [0, 3000], 'scale2': [10000, 3000], 'scale3': [20000, 3000], 
            'scale4': [35000, 3000], 'scale5': [45000, 3000] 
        } 
    }),
    gayageum: new Howl({ 
        src: ['./sanjo_gayageum_sus_mid_03.mp3'], 
        volume: 0.65, // 가야금 선율 강조
        sprite: { 
            'vocal1': [5000, 4000], 'vocal2': [25000, 4000], 
            'vocal3': [45000, 4000], 'vocal4': [65000, 4000]
        } 
    }),
    janggu: {
        // 덩(Space)과 기덕(마침표)은 박자의 마디이므로 약간만 낮춤
        deong: new Howl({ src: ['./Janggu_3_1.wav'], volume: 0.35 }), 
        gideok: new Howl({ src: ['./Janggu_2_1.wav'], volume: 0.35 }),
        // 글자마다 나는 보조음들은 아주 작게(배경음 수준으로) 설정
        deo: new Howl({ src: ['./Janggu_6_1.wav'], volume: 0.08 }), // 거의 안 들릴 정도로
        kung: new Howl({ src: ['./Janggu_1_1.wav'], volume: 0.15 })  // 받침 소리도 은은하게
    }
};

// --- 3. 음악적 연주 로직 (장구 개입 축소) ---
function playChar(char, x, y) {
    const units = Hangul.disassemble(char);
    const dynamicVol = Math.random() * 0.2 + 0.5;

    // 1. 초성 (거문고)
    const choKey = jamoMap[units[0]] || 'scale1';
    const gumungoId = sounds.gumungo.play(choKey);
    sounds.gumungo.volume(dynamicVol, gumungoId);
    
    // 장구 '더' 소리는 생략하거나 아주 미세하게만 재생
    if (Math.random() > 0.5) { // 50% 확률로만 들리게 해서 단조로움 피함
        sounds.janggu.deo.play();
    }
    
    inkSpots.push(new InkSpot(x, y, 120));

    // 2. 중성 (가야금)
    const vowel = units.find(u => Hangul.isVowel(u));
    if (vowel) {
        const jungKey = jamoMap[vowel] || 'vocal1';
        setTimeout(() => {
            const gayageumId = sounds.gayageum.play(jungKey);
            sounds.gayageum.volume(dynamicVol * 0.8, gayageumId);
            inkSpots.push(new InkSpot(x, y, 200));
        }, 150);
    }

    // 3. 종성 (장구 쿵 - 선택 사항)
    // 받침이 있을 때만 아주 작은 쿵 소리
    if (units.length > 2) {
        setTimeout(() => {
            sounds.janggu.kung.play();
            inkSpots.push(new InkSpot(x, y, 70));
        }, 300);
    }
}
