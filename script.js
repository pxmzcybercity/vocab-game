let hp = 100;
let currentLevel = 0;
let currentQIndex = 0;
let correctCount = 0;
let questionsAnswered = 0;
let timer;
let timeLeft = 30;
const wordsPerLevel = 50;

// โหลดไฟล์เสียง
const sCorrect = new Audio('sounds/cr.wav');
const sWrong = new Audio('sounds/icr.wav');
const sClash = new Audio('sounds/swords-clash.wav');
const sBoss = [
    new Audio('sounds/s0.wav'), new Audio('sounds/s1.wav'), new Audio('sounds/s2.wav'),
    new Audio('sounds/s3.wav'), new Audio('sounds/s4.wav'), new Audio('sounds/s5.wav'), new Audio('sounds/s6.wav')
];

// ระบบเซฟเกม
function saveGame() {
    localStorage.setItem('vocabSlayerSave', JSON.stringify({ level: currentLevel }));
}

function loadGame() {
    const saved = localStorage.getItem('vocabSlayerSave');
    if (saved) {
        const data = JSON.parse(saved);
        currentLevel = data.level;
    }
}

function resetGame() {
    localStorage.removeItem('vocabSlayerSave');
    location.reload();
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 30;
    document.getElementById("timer").innerText = "เวลา: " + timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = "เวลา: " + timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            sWrong.play();
            alert("หมดเวลา! บอสโจมตี!");
            hp += 10;
            document.getElementById('hp').innerText = hp;
            nextQuestion();
        }
    }, 1000);
}

function loadQuestion() {
    let levelQs = wordBank.filter(i => i.level === currentLevel);
    let qObj = levelQs[Math.floor(Math.random() * levelQs.length)];
    
    document.getElementById("question").innerText = "คำศัพท์: " + qObj.q + " แปลว่าอะไร?";
    document.getElementById("boss-img").src = qObj.bossImg;
    document.getElementById("level-display").innerText = "ด่านปัจจุบัน: " + (currentLevel + 1);
    
    sBoss[currentLevel].play().catch(() => {});
    
    let choices = [...qObj.choices].sort(() => Math.random() - 0.5);
    let buttons = document.querySelectorAll("button");
    for(let i = 0; i < 4; i++) {
        buttons[i].innerText = choices[i];
        buttons[i].onclick = function() { checkAnswer(this.innerText, qObj.correct); };
    }
    startTimer();
}

function checkAnswer(answer, correct) {
    clearInterval(timer);
    questionsAnswered++;
    if (answer === correct) {
        correctCount++;
        hp -= 20;
        sCorrect.play();
        sClash.play();
        alert("ถูกต้อง! คะแนนด่านนี้: " + correctCount);
    } else {
        sWrong.play();
        hp += 10;
        alert("ผิด! บอสโจมตีสวน!");
    }
    document.getElementById('hp').innerText = hp;

    if (questionsAnswered >= wordsPerLevel) {
        let percent = correctCount / wordsPerLevel;
        if (percent >= 0.9) {
            alert("ผ่านด่าน! คะแนน: " + (percent * 100) + "%");
            currentLevel++;
            if(currentLevel > 5) currentLevel = 0;
            saveGame(); // เซฟเมื่อผ่านด่าน
        } else {
            alert("คะแนนไม่ถึง 90% ต้องเริ่มเลเวลนี้ใหม่!");
        }
        correctCount = 0;
        questionsAnswered = 0;
        hp = 100;
    }
    loadQuestion();
}

function nextQuestion() {
    questionsAnswered++;
    if (questionsAnswered >= wordsPerLevel) {
        correctCount = 0;
        questionsAnswered = 0;
        hp = 100;
    }
    loadQuestion();
}

// เริ่มเกม
loadGame();
loadQuestion();