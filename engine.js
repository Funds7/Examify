let params = new URLSearchParams(window.location.search);

let course = params.get("course");

// Load ALL questions for selected course
let questions = QUESTIONS.filter(q => q.course === course);

// Shuffle questions
questions = questions.sort(() => Math.random() - 0.5);

let index = 0;
let score = 0;
let review = [];

// No questions found
if (questions.length === 0) {
    document.getElementById("question-box").innerHTML =
        "<h3>No questions found for this course.</h3>";
}

/* =========================
   LOAD QUESTION
========================= */

function loadQuestion() {

    if (questions.length === 0) return;

    let q = questions[index];

    document.getElementById("question-number").innerText =
        `Question ${index + 1}`;

    document.getElementById("question-box").innerText =
        q.question;

    let html = "";

    q.options.forEach((option, i) => {

        html += `
            <button class="btn option-btn" onclick="answer(${i})">
                ${option}
            </button><br><br>
        `;

    });

    document.getElementById("options").innerHTML = html;

    document.getElementById("progress").innerText =
        `Question ${index + 1} / ${questions.length}`;

    updateProgressBar();
}

/* =========================
   ANSWER
========================= */

function answer(choice) {

    if (choice === questions[index].answer) {
        score++;
    }

    nextQuestion();

}

/* =========================
   NEXT
========================= */

function nextQuestion() {

    if (index < questions.length - 1) {

        index++;
        loadQuestion();

    } else {

        finishExam();

    }

}

/* =========================
   PREVIOUS
========================= */

function prevQuestion() {

    if (index > 0) {

        index--;
        loadQuestion();

    }

}

/* =========================
   REVIEW
========================= */

function markForReview() {

    if (!review.includes(index)) {
        review.push(index);
    }

    document.getElementById("review-status").innerText =
        "Marked for review: " + review.length;

}

/* =========================
   PROGRESS BAR
========================= */

function updateProgressBar() {

    let percent = ((index + 1) / questions.length) * 100;

    document.getElementById("progress-fill").style.width =
        percent + "%";

}

/* =========================
   FINISH
========================= */

function finishExam() {

    localStorage.setItem("score", score);
    localStorage.setItem("total", questions.length);
    localStorage.setItem("course", course);

    window.location.href = "result.html";

}

/* =========================
   TIMER
========================= */

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

/* =========================
   START
========================= */

loadQuestion();
