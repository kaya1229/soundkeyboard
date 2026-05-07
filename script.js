// 사운드 설정 (실제 파일이 없으면 소리가 나지 않으니 4단계를 꼭 확인하세요)
const sounds = {
    'group1': new Howl({ src: ['https://cdn.jsdelivr.net/gh/gugak/samples/gayageum.mp3'] }), // 임시 주소
    'group2': new Howl({ src: ['https://cdn.jsdelivr.net/gh/gugak/samples/geomungo.mp3'] }),
    'group3': new Howl({ src: ['https://cdn.jsdelivr.net/gh/gugak/samples/haegeum.mp3'] }),
    'vowel': new Howl({ src: ['https://cdn.jsdelivr.net/gh/gugak/samples/daegeum.mp3'] }),
    'last': new Howl({ src: ['https://cdn.jsdelivr.net/gh/gugak/samples/janggu.mp3'] })
};

const canvas = document.getElementById('inkCanvas');
const ctx = canvas.getContext('2d');
const inputArea = document.getElementById('inputArea');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 먹 번짐 효과
function drawInk() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 40 + 20;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

inputArea.addEventListener('input', (e) => {
    const val = e.target.value;
    const lastChar = val.charAt(val.length - 1);
    
    if (!lastChar) return;

    drawInk();

    // 한글 분석 및 소리 재생
    if (Hangul.isVowel(lastChar)) {
        sounds.vowel.play();
    } else {
        if (['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'].includes(lastChar)) sounds.group1.play();
        else if (['ㅋ', 'ㅌ', 'ㅍ', 'ㅊ'].includes(lastChar)) sounds.group2.play();
        else sounds.group3.play();
    }
});
