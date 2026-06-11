let currentQuestion = 0;
let score = 0;

function loadQuestion() {
  const q = questions[currentQuestion];

  document.getElementById("question-box").innerHTML = q.question;

  let optionsHTML = "";

  q.options.forEach((option, index) => {
    optionsHTML += `
      <button onclick="checkAnswer(${index})">${option}</button>
    `;
  });

  document.getElementById("options").innerHTML = optionsHTML;
}

function checkAnswer(selected) {
  const correct = questions[currentQuestion].answer;

  if (selected === correct) {
    score++;
  }

  nextQuestion();
}

function nextQuestion() {
  currentQuestion++;

  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    document.getElementById("question-box").innerHTML = "Exam Finished!";
    document.getElementById("options").innerHTML = "";
    document.getElementById("score").innerHTML =
      `Your Score: ${score} / ${questions.length}`;
  }
}

loadQuestion();
