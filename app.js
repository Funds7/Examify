// =========================
function generateQuestionPalette() {
  const palette = document.getElementById("palette");

  if (!palette) return;

  palette.innerHTML = "";

  for (let i = 0; i < examQuestions.length; i++) {
    palette.innerHTML += `
      <button
        id="pal-${i}"
        onclick="jumpToQuestion(${i})">
        ${i + 1}
      </button>
    `;
  }
}

function updatePalette() {
  for (let i = 0; i < examQuestions.length; i++) {
    const btn = document.getElementById(`pal-${i}`);

    if (!btn) continue;

    btn.style.background =
      userAnswers[i] !== null ? "#28a745" : "#ccc";

    if (i === currentIndex) {
      btn.style.border = "3px solid blue";
    } else {
      btn.style.border = "1px solid #999";
    }
  }
}

function jumpToQuestion(index) {
  currentIndex = index;
  loadQuestion();
}

// =========================
// SAVE PROGRESS
// =========================
function saveProgress() {
  localStorage.setItem(
    "examProgress",
    JSON.stringify({
      answers: userAnswers,
      currentIndex
    })
  );
}

// =========================
// FINISH EXAM
// =========================
function finishExam() {
  if (examFinished) return;

  examFinished = true;

  clearInterval(timer);

  let score = 0;

  examQuestions.forEach((q, i) => {
    if (userAnswers[i] === q.answer) {
      score++;
    }
  });

  const percentage =
    Math.round((score / examQuestions.length) * 100);

  const status =
    percentage >= 50 ? "PASS ✅" : "FAIL ❌";

  const unanswered =
    userAnswers.filter(a => a === null).length;

  localStorage.removeItem("examProgress");

  document.getElementById("question-box").innerHTML =
    "🎉 Exam Completed";

  document.getElementById("options").innerHTML = "";
  document.getElementById("progress").innerHTML = "";
  document.getElementById("timer").innerHTML = "";

  const palette = document.getElementById("palette");
  if (palette) palette.innerHTML = "";

  document.getElementById("score").innerHTML = `
    <h2>Result</h2>
    <p>Score: ${score}/${examQuestions.length}</p>
    <p>Percentage: ${percentage}%</p>
    <p>Status: ${status}</p>
    <p>Unanswered: ${unanswered}</p>
  `;
}

// =========================
// SUBMIT BUTTON
// =========================
function submitExam() {
  const confirmSubmit = confirm(
    "Are you sure you want to submit your exam?"
  );

  if (confirmSubmit) {
    finishExam();
  }
}

// =========================
// ANTI-CHEAT WARNING
// =========================
document.addEventListener("visibilitychange", () => {
  if (document.hidden && !examFinished) {
    alert("Warning: You left the exam tab.");
  }
});
function updateGreeting(){

const hour = new Date().getHours();

let greeting="";

if(hour<12){

greeting="🌅 Good Morning";

}

else if(hour<17){

greeting="☀️ Good Afternoon";

}

else if(hour<21){

greeting="🌇 Good Evening";

}

else{

greeting="🌙 Good Night";

}

const element=document.getElementById("greeting");

if(element){

element.innerText=greeting;

}

}

updateGreeting();

// =========================
// START
// =========================
startExam();
