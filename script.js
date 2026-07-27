let currentLevel = 0;
let totalCorrectCount = 0;
let levelCorrectCount = 0;
let questionsAnsweredInLevel = 0;
let timer;
let timeLeft = 30;
let usedQuestionsInLevel = []; 

const levelRequirements = [10, 14, 20, 24, 30, 40];
const bossNames = ["Vocab Poring", "Vocab Golem", "Vocab Blue-Eyes", "Vocab Black Panther", "Vocab Red Dragon", "Vocab Yamathūt"];

const sCorrect = new Audio('sounds/cr.wav');
const sWrong = new Audio('sounds/icr.wav');
const sClash = new Audio('sounds/swords-clash.wav');
const sBoss = [
    new Audio('sounds/s0.wav'), new Audio('sounds/s1.wav'), new Audio('sounds/s2.wav'),
    new Audio('sounds/s3.mp3'), new Audio('sounds/s4.wav'), new Audio('sounds/s5.wav'), new Audio('sounds/s6.wav')
];

function stopAllBossSounds() { sBoss.forEach(audio => { audio.pause(); audio.currentTime = 0; }); }
function updateHP() { 
    let currentMaxHP = levelRequirements[currentLevel] * 20;
    document.getElementById('hp').innerText = Math.max(0, currentMaxHP - (levelCorrectCount * 20)); 
}

function startGame() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    loadQuestion();
}

function loadQuestion() {
    clearInterval(timer);
    stopAllBossSounds();
    
    let levelQs = wordBank.filter(i => i.level === currentLevel);
    let availableQs = levelQs.filter((_, index) => !usedQuestionsInLevel.includes(index));
    
    if (availableQs.length === 0) { usedQuestionsInLevel = []; availableQs = levelQs; }
    
    let qObj = availableQs[Math.floor(Math.random() * availableQs.length)];
    usedQuestionsInLevel.push(levelQs.indexOf(qObj));
    
    document.getElementById("game-title").innerText = bossNames[currentLevel];
    document.getElementById("question").innerText = "คำศัพท์: " + qObj.q;
    document.getElementById("boss-img").src = qObj.bossImg;
    document.getElementById("level-display").innerText = "ด่านปัจจุบัน: " + (currentLevel + 1);
    
    updateHP();
    sBoss[currentLevel].loop = true;
    sBoss[currentLevel].play().catch(e => console.log("รอการโต้ตอบ"));
    
    let choices = [...qObj.choices].sort(() => Math.random() - 0.5);
    let buttons = document.querySelectorAll("button[id^='b']");
    buttons.forEach((btn, i) => {
        btn.className = "";
        btn.disabled = false;
        btn.innerText = choices[i];
        btn.onclick = function() { checkAnswer(this, qObj.correct); };
    });
    startTimer();
}

function checkAnswer(btn, correct) {
    clearInterval(timer);
    stopAllBossSounds();
    sClash.play();
    document.querySelectorAll("button[id^='b']").forEach(b => b.disabled = true);
    
    setTimeout(() => {
        questionsAnsweredInLevel++;
        if (btn.innerText === correct) {
            levelCorrectCount++;
            totalCorrectCount++;
            sCorrect.play();
            btn.className = "correct";
            document.getElementById('score-board').innerText = "คะแนนรวม: " + totalCorrectCount;
        } else {
            sWrong.play();
            btn.className = "wrong";
            // เฉลยข้อถูก
            document.querySelectorAll("button[id^='b']").forEach(b => {
                if(b.innerText === correct) b.className = "correct";
            });
        }
        updateHP();

        setTimeout(() => {
            if (questionsAnsweredInLevel >= levelRequirements[currentLevel]) {
                let passThreshold = Math.ceil(levelRequirements[currentLevel] * 0.5);
                if (levelCorrectCount >= passThreshold) {
                    alert("ผ่านด่าน! ไปสู้กับบอสตัวถัดไป!");
                    currentLevel++;
                    if(currentLevel > 5) {
                        document.getElementById("game-container").style.display = "none";
                        document.getElementById("victory-screen").style.display = "block";
                        document.getElementById("final-score").innerText = totalCorrectCount;
                        return;
                    }
                } else {
                    alert("ไม่ผ่านเกณฑ์ 90% เริ่มด่านเดิมใหม่ครับ!");
                }
                questionsAnsweredInLevel = 0;
                levelCorrectCount = 0;
                usedQuestionsInLevel = [];
            }
            loadQuestion();
        }, 600);
    }, 400);
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
            alert("หมดเวลา!");
            checkAnswer({innerText: "TIMEOUT"}, "none");
        }
    }, 1000);
}

function resetGame() { location.reload(); }
