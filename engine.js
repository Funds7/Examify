let params = new URLSearchParams(window.location.search);
let course = params.get("course");

let db = getDB();

// get questions for selected course
let questions = db.questions.filter(q => q.course === course);

// fallback if empty
if (questions.length === 0) {
  document.getElementById("question-box").innerText =
    "No questions found for this course.";
}

// shuffle questions (CBT realism)
questions = questions.sort(() => Math.random() - 0.5);

let index = 0;
let score = 0;
let review = [];

function loadQuestion() {
  let q = questions[index];

  if (!q) return;

  document.getElementById("question-number").innerText =
    `Question ${index + 1}`;

  document.getElementById("question-box").innerText = q.q;

  let html = "";

  q.options.forEach((opt, i) => {
    html += `
      <button class="btn option-btn" onclick="answer(${i})">
        ${opt}
      </button><br><br>
    `;
  });

  document.getElementById("options").innerHTML = html;

  document.getElementById("progress").innerText =
    `Question ${index + 1} / ${questions.length}`;

  updateProgressBar();
}

/* =========================
   ANSWER HANDLER
========================= */
function answer(i) {
  let q = questions[index];

  if (i === q.answer) {
    score++;
  }

  nextQuestion();
}

/* =========================
   NAVIGATION
========================= */
function nextQuestion() {
  if (index < questions.length - 1) {
    index++;
    loadQuestion();
  } else {
    finishExam();
  }
}

function prevQuestion() {
  if (index > 0) {
    index--;
    loadQuestion();
  }
}

function markForReview() {
  review.push(index);
  document.getElementById("review-status").innerText =
    "Marked for review: " + review.join(", ");
}

/* =========================
   PROGRESS BAR
========================= */
function updateProgressBar() {
  let percent = ((index + 1) / questions.length) * 100;
  document.getElementById("progress-fill").style.width = percent + "%";
}

/* =========================
   FINISH EXAM
========================= */
function finishExam() {
  localStorage.setItem("score", score);
  localStorage.setItem("total", questions.length);
  localStorage.setItem("course", course);

  window.location.href = "result.html";
}

/* =========================
   SIMPLE TIMER (OPTIONAL)
========================= */
let time = 10 * 60; // 10 minutes

setInterval(() => {
  if (time <= 0) return;

  time--;

  let min = Math.floor(time / 60);
  let sec = time % 60;

  document.getElementById("timer").innerText =
    `⏰ ${min}:${sec < 10 ? "0" + sec : sec}`;

  if (time === 0) {
    finishExam();
  }
}, 1000);

/* =========================
   START
========================= */
loadQuestion();
