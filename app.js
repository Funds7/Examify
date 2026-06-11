let examQuestions = [];
let currentIndex = 0;
let score = 0;

// ⏱️ Timer (10 minutes)
let timeLeft = 10 * 60;
let timer;

// START EXAM
function startExam() {
  examQuestions = questions
    .sort(() => 0.5 - Math.random())
    .slice(0, 20);

  currentIndex = 0;
  score = 0;
  timeLeft = 10 * 60;

  startTimer();
  loadQuestion();
}

// TIMER (ONLY ONE TIMER)
function startTimer() {
  timer = setInterval(() => {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    seconds = seconds < 10 ? "0" + seconds : seconds;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    document.getElementById("timer").innerText =
      `${minutes}:${seconds}`;

    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timer);
      finishExam();
    }
  }, 1000);
}

// LOAD QUESTION
function loadQuestion() {
  const q = examQuestions[currentIndex];

  document.getElementById("question-box").innerHTML =
    `Q${currentIndex + 1}: ${q.question}`;

  let optionsHTML = "";

  q.options.forEach((opt, index) => {
    optionsHTML += `
      <button class="option-btn" onclick="selectAnswer(${index})">
        ${opt}
      </button>
    `;
  });

  document.getElementById("options").innerHTML = optionsHTML;

  document.getElementById("progress").innerText =
    `Question ${currentIndex + 1} / ${examQuestions.length}`;
}

// SELECT ANSWER
function selectAnswer(selected) {
  const correct = examQuestions[currentIndex].answer;

  if (selected === correct) {
    score++;
  }

  nextQuestion();
}

// NEXT QUESTION
function nextQuestion() {
  currentIndex++;

  if (currentIndex < examQuestions.length) {
    loadQuestion();
  } else {
    finishExam();
  }
}

// FINISH EXAM
function finishExam() {
  clearInterval(timer);

  document.getElementById("question-box").innerHTML =
    "🎉 Exam Finished";

  document.getElementById("options").innerHTML = "";
  document.getElementById("progress").innerHTML = "";
  document.getElementById("timer").innerHTML = "";

  document.getElementById("score").innerHTML =
    `Your Score: ${score} / ${examQuestions.length}`;
}

// START
startExam();
