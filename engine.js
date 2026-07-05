let params = new URLSearchParams(window.location.search);

let course = params.get("course");
let chapter = params.get("chapter");

let questions;

if (chapter) {
    questions = QUESTIONS.filter(q =>
        q.course === course &&
        q.chapter == chapter
    );
} else {
    questions = QUESTIONS.filter(q =>
        q.course === course
    );
}

// Shuffle questions
questions = questions.sort(() => Math.random() - 0.5);

// ==========================
// VARIABLES
// ==========================

let currentQuestion = 0;
let answers = [];
let review = [];

// No questions found
if (questions.length === 0) {
    document.getElementById("question-box").innerHTML =
        "<h3>No questions found for this course.</h3>";
}

// ==========================
// LOAD QUESTION
// ==========================

function loadQuestion() {

    if (questions.length === 0) return;

    let q = questions[currentQuestion];

    document.getElementById("question-number").innerText =
        `Question ${currentQuestion + 1}`;

    document.getElementById("question-box").innerText =
        q.question;

    let html = "";

    const letters = ["A", "B", "C", "D"];

    q.options.forEach((option, i) => {

        let selected =
            answers[currentQuestion] === i
                ? "style='background:#2563eb;color:#fff;'"
                : "";

        html += `
            <button class="btn option-btn"
                ${selected}
                onclick="answer(${i})">

                <strong>${letters[i]}.</strong> ${option}

            </button><br><br>
        `;

    });

    document.getElementById("options").innerHTML = html;

    document.getElementById("progress").innerText =
        `Question ${currentQuestion + 1} / ${questions.length}`;

    updateProgressBar();
}

// ==========================
// ANSWER
// ==========================

function answer(choice) {

    answers[currentQuestion] = choice;

    loadQuestion();

}

// ==========================
// NEXT
// ==========================

function nextQuestion() {

    if (currentQuestion < questions.length - 1) {

        currentQuestion++;

        loadQuestion();

    }

}

// ==========================
// PREVIOUS
// ==========================

function prevQuestion() {

    if (currentQuestion > 0) {

        currentQuestion--;

        loadQuestion();

    }

}

// ==========================
// MARK FOR REVIEW
// ==========================

function markForReview() {

    if (!review.includes(currentQuestion)) {

        review.push(currentQuestion);

    }

    document.getElementById("review-status").innerText =
        "Marked for review: " + review.length;

}

// ==========================
// PROGRESS BAR
// ==========================

function updateProgressBar() {

    let percent =
        ((currentQuestion + 1) / questions.length) * 100;

    document.getElementById("progress-fill").style.width =
        percent + "%";

}

// ==========================
// FINISH EXAM
// ==========================

function finishExam() {

    let score = 0;

    questions.forEach((q, i) => {

        if (answers[i] === q.answer) {

            score++;

        }

    });

    localStorage.setItem("score", score);
    localStorage.setItem("total", questions.length);
    localStorage.setItem("course", course);

    window.location.href = "result.html";

}

// ==========================
// TIMER
// ==========================

let time = 10 * 60;

let timer = setInterval(() => {

    if (time <= 0) {

        clearInterval(timer);

        finishExam();

        return;

    }

    time--;

    let min = Math.floor(time / 60);
    let sec = time % 60;

    document.getElementById("timer").innerText =
        `⏰ ${min}:${sec.toString().padStart(2, "0")}`;

}, 1000);

// ==========================
// START
// ==========================

loadQuestion();

