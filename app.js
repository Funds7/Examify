let examQuestions = [];
let currentIndex = 0;

let userAnswers = [];
let timeLeft = 10 * 60; // 10 minutes
let timer;

// =========================
// START EXAM
// =========================
function startExam() {
  examQuestions = questions
    .sort(() => 0.5 - Math.random())
    .slice(0, 20);

  currentIndex = 0;
  userAnswers = new Array(examQuestions.length).fill(null);
  timeLeft = 10 * 60;

  startTimer();
  loadQuestion();
}

// =========================
// TIMER (AUTO SUBMIT)
// =========================
function startTimer() {
  timer = setInterval(() => {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    document.getElementById("timer").innerText =
      `Time Left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timer);
      finishExam();
    }
  }, 1000);
}

// =========================
// LOAD QUESTION
// =========================
function loadQuestion() {
  const q = examQuestions[currentIndex];

  document.getElementById("question-box").innerHTML =
    `Q${currentIndex + 1}: ${q.question}`;

  let optionsHTML = "";

  q.options.forEach((opt, index) => {
    const isSelected = userAnswers[currentIndex] === index;

    optionsHTML += `
      <button class="option-btn ${isSelected ? "selected" : ""}"
        onclick="selectAnswer(${index})">
        ${opt}
      </button>
    `;
  });

  document.getElementById("options").innerHTML = optionsHTML;

  document.getElementById("progress").innerText =
    `Question ${currentIndex + 1} / ${examQuestions.length}`;
}

// =========================
// SELECT ANSWER
// =========================
function selectAnswer(selected) {
  userAnswers[currentIndex] = selected;
  loadQuestion();
}

// =========================
// NAVIGATION
// =========================
function nextQuestion() {
  if (currentIndex < examQuestions.length - 1) {
    currentIndex++;
    loadQuestion();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    loadQuestion();
  }
}

// =========================
// FINISH EXAM (SCORING)
// =========================
function finishExam() {
  clearInterval(timer);

  let score = 0;

  examQuestions.forEach((q, i) => {
    if (userAnswers[i] === q.answer) {
      score++;
    }
  });

  document.getElementById("question-box").innerHTML =
    "🎉 Exam Completed";

  document.getElementById("options").innerHTML = "";
  document.getElementById("progress").innerHTML = "";
  document.getElementById("timer").innerHTML = "";

  document.getElementById("score").innerHTML =
    `Your Score: ${score} / ${examQuestions.length}`;
}

// =========================
// ANTI-CHEAT WARNING (BASIC)
// =========================
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    alert("Warning: Leaving the exam tab may affect your test!");
  }
});

// =========================
// AUTO START EXAM
// =========================
startExam();
