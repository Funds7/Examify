let examQuestions = [];
let currentIndex = 0;
let score = 0;

// ⏱️ Timer setup (10 minutes = 600 seconds)
let timeLeft = 600;
let timer;

function startExam() {
  // shuffle questions and pick 20
  examQuestions = questions
    .sort(() => 0.5 - Math.random())
    .slice(0, 20);

  currentIndex = 0;
  score = 0;

  startTimer();
  loadQuestion();
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;

    document.getElementById("timer").innerText =
      `Time Left: ${Math.floor(timeLeft / 60)}:${timeLeft % 60}`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      finishExam();
    }
  }, 1000);
}

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

function selectAnswer(selected) {
  const correct = examQuestions[currentIndex].answer;

  if (selected === correct) {
    score++;
  }

  nextQuestion();
}

function nextQuestion() {
  currentIndex++;

  if (currentIndex < examQuestions.length) {
    loadQuestion();
  } else {
    finishExam();
  }
}

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

// start automatically
startExam();
