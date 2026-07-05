// ==========================
// STATE VARIABLES
// ==========================
let questions = [];
let currentQuestion = 0;
let answers = [];
let review = [];
let timerInterval = null;
let timeLeft = 0;
let examMode = "Exam"; // Default mode
let selectedCourse = "";

// Ensure code doesn't execute automatically on load; wait for startExam()
document.addEventListener("DOMContentLoaded", () => {
    // Hidden initially till startExam is clicked
    document.getElementById("exam-screen").style.display = "none";
    document.getElementById("setup-screen").style.display = "block";
});

// ==========================
// START EXAM (Triggered by button)
// ==========================
function startExam() {
    // 1. Get selections from Setup Screen
    selectedCourse = document.getElementById("course-select").value;
    examMode = document.getElementById("mode-select").value;
    const countVal = document.getElementById("count-select").value;
    const timeVal = document.getElementById("time-select").value;

    // 2. Validate QUESTIONS array exists (from questions.js)
    if (typeof QUESTIONS === 'undefined') {
        alert("Error: QUESTIONS array is missing. Ensure questions.js is correctly loaded.");
        return;
    }

    // 3. Filter questions by selected course
    questions = QUESTIONS.filter(q => q.course === selectedCourse);

    if (questions.length === 0) {
        alert(`No questions found for course: ${selectedCourse.toUpperCase()}`);
        return;
    }

    // 4. Shuffle questions
    questions = questions.sort(() => Math.random() - 0.5);

    // 5. Limit question count
    if (countVal && countVal !== "ALL") {
        const limit = parseInt(countVal, 10);
        questions = questions.slice(0, limit);
    }

    // 6. Initialize state variables
    currentQuestion = 0;
    answers = [];
    review = [];
    timeLeft = parseInt(timeVal, 10) * 60;

    // 7. Update UI Status Bars
    document.getElementById("mode").innerText = `Mode: ${examMode}`;
    
    // 8. Screen transitions
    document.getElementById("setup-screen").style.display = "none";
    document.getElementById("exam-screen").style.display = "block";

    // 9. Start Timer and render first question
    startTimer();
    loadQuestion();
}

// ==========================
// LOAD QUESTION
// ==========================
function loadQuestion() {
    if (questions.length === 0) {
        document.getElementById("question-box").innerHTML = "<h3>No questions loaded.</h3>";
        return;
    }

    let q = questions[currentQuestion];

    // Display progress information
    document.getElementById("question-number").innerText = `Question ${currentQuestion + 1}`;
    document.getElementById("question-box").innerText = q.question;
    document.getElementById("progress").innerText = `Question ${currentQuestion + 1} / ${questions.length}`;

    let html = "";
    const letters = ["A", "B", "C", "D"];

    q.options.forEach((option, i) => {
        let styleStr = "";

        // Determine styles dynamically depending on selected Mode
        if (answers[currentQuestion] !== undefined) {
            if (examMode === "Practice") {
                // Practice Mode: Show immediate feedback green/red
                if (i === q.answer) {
                    styleStr = "style='background:#22c55e;color:#fff;border-color:#22c55e;'"; // Correct option
                } else if (answers[currentQuestion] === i) {
                    styleStr = "style='background:#ef4444;color:#fff;border-color:#ef4444;'"; // Wrong chosen option
                }
            } else {
                // Exam Mode: Highlight chosen option silently in Blue
                if (answers[currentQuestion] === i) {
                    styleStr = "style='background:#2563eb;color:#fff;'";
                }
            }
        }

        html += `
            <button class="btn option-btn"
                ${styleStr}
                onclick="answer(${i})">
                <strong>${letters[i]}.</strong> ${option}
            </button><br><br>
        `;
    });

    document.getElementById("options").innerHTML = html;

    // Display review status context
    const reviewStatus = document.getElementById("review-status");
    if (review.includes(currentQuestion)) {
        reviewStatus.innerText = "⭐ Flagged for Review";
    } else {
        reviewStatus.innerText = "";
    }

    updateProgressBar();
    createPalette();
}

// ==========================
// ANSWER SELECTION
// ==========================
function answer(choice) {
    // If in Practice Mode, lock selection once chosen
    if (examMode === "Practice" && answers[currentQuestion] !== undefined) {
        return;
    }

    answers[currentQuestion] = choice;
    loadQuestion();
}

// ==========================
// NAVIGATION
// ==========================
function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        loadQuestion();
    }
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
}

// ==========================
// MARK FOR REVIEW (Toggleable)
// ==========================
function markForReview() {
    const index = review.indexOf(currentQuestion);
    
    if (index > -1) {
        // Toggle off if already flagged
        review.splice(index, 1);
    } else {
        // Flag for review
        review.push(currentQuestion);
    }

    loadQuestion();
}

// ==========================
// PROGRESS BAR
// ==========================
function updateProgressBar() {
    let percent = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById("progress-fill").style.width = percent + "%";
}

// ==========================
// QUESTION PALETTE
// ==========================
function createPalette() {
    const palette = document.getElementById("question-palette");
    if (!palette) return;

    palette.innerHTML = "";

    questions.forEach((q, i) => {
        let btn = document.createElement("button");
        btn.innerText = i + 1;
        btn.className = "palette-btn";

        // Style overrides based on question state
        if (answers[i] !== undefined) {
            btn.style.background = "#22c55e"; // Green for answered
            btn.style.color = "#fff";
        }

        if (review.includes(i)) {
            btn.style.background = "#f59e0b"; // Orange for flagged
            btn.style.color = "#fff";
        }

        if (i === currentQuestion) {
            btn.style.border = "3px solid #2563eb"; // Blue border for active
        }

        btn.onclick = function () {
            currentQuestion = i;
            loadQuestion();
        };

        palette.appendChild(btn);
    });
}

// ==========================
// TIMER ENGINE
// ==========================
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishExam();
            return;
        }

        timeLeft--;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    let min = Math.floor(timeLeft / 60);
    let sec = timeLeft % 60;
    document.getElementById("timer").innerText = `⏰ ${min}:${sec.toString().padStart(2, "0")}`;
}

// ==========================
// FINISH EXAM
// ==========================
function finishExam() {
    if (timerInterval) clearInterval(timerInterval);

    let score = 0;
    questions.forEach((q, i) => {
        if (answers[i] === q.answer) {
            score++;
        }
    });

    // Write metadata to localStorage for result.html to process
    localStorage.setItem("score", score);
    localStorage.setItem("total", questions.length);
    localStorage.setItem("course", selectedCourse);

    window.location.href = "result.html";
}
