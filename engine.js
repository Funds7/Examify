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
                ? "    localStorage.setItem("total", questions.length);
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

    
