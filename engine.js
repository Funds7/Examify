// ==========================================
// COURSE DICTIONARY
// ==========================================
const COURSE_TITLES = {
    "gst101": "GST 101 – Use of English and Library",
    "gst102": "GST 102 – Philosophy and Human Existence",
    "gst103": "GST 103 – Nigerian Peoples and Culture",
    "gst111": "GST 111 – Communication in English",
    "gst112": "GST 112 – Logic and Critical Thinking",
    "gst113": "GST 113 – Peace and Conflict Resolution",
    "gst114": "GST 114 – Social Sciences"
};

// ==========================================
// STATE VARIABLES
// ==========================================
let questions = [];
let currentQuestion = 0;
let answers = [];
let review = [];
let timerInterval = null;
let timeLeft = 0;

// Config state initialized from Setup Screen defaults
let selectedCourse = "";
let selectedQuestionsCount = 50; 
let selectedMode = "Exam"; // Exam Mode vs Quiz Mode (Quiz = Practice)

// ==========================================
// PAGE INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Parse URL Parameters
    const params = new URLSearchParams(window.location.search);
    selectedCourse = params.get("course") || "gst101"; // Fallback default to gst101

    // 2. Resolve and display Course Title dynamically
    const courseTitle = COURSE_TITLES[selectedCourse.toLowerCase()] || selectedCourse.toUpperCase();
    document.getElementById("setup-course-title").innerText = courseTitle;

    // 3. Set up click listeners for the interactive Questions grid
    const gridButtons = document.querySelectorAll(".grid-btn");
    gridButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active style classes and checkmark spans from all siblings
            gridButtons.forEach(b => {
                b.classList.remove("active");
                const check = b.querySelector(".check-mark");
                if (check) check.remove();
            });

            // Make clicked button active
            btn.classList.add("active");
            const rawVal = btn.getAttribute("data-value");

            if (rawVal === "CUSTOM") {
                const customVal = prompt("Enter custom number of questions:");
                if (customVal && !isNaN(customVal) && parseInt(customVal, 10) > 0) {
                    selectedQuestionsCount = parseInt(customVal, 10);
                    btn.innerHTML = `${selectedQuestionsCount} <span class="check-mark">✓</span>`;
                } else {
                    // Fall back to default '50' if custom input is cancelled/invalid
                    const defaultBtn = document.querySelector('[data-value="50"]');
                    defaultBtn.classList.add("active");
                    if (!defaultBtn.querySelector(".check-mark")) {
                        defaultBtn.innerHTML += ' <span class="check-mark">✓</span>';
                    }
                    selectedQuestionsCount = 50;
                }
            } else {
                selectedQuestionsCount = parseInt(rawVal, 10);
                btn.innerHTML = `${rawVal} <span class="check-mark">✓</span>`;
            }
        });
    });

    // Enforce Screen view states initially
    document.getElementById("exam-screen").style.display = "none";
    document.getElementById("setup-screen").style.display = "block";
});

// ==========================================
// INTERACTIVE SELECTIONS
// ==========================================
function setMode(mode) {
    selectedMode = mode;
    document.querySelectorAll(".mode-card").forEach(card => card.classList.remove("active"));
    
    if (mode === 'Exam') {
        document.getElementById("mode-exam").classList.add("active");
    } else {
        document.getElementById("mode-quiz").classList.add("active");
    }
}

// ==========================
// START EXAM
// ==========================
function startExam() {

    // Check questions database
    if (typeof QUESTIONS === "undefined") {
        alert("questions.js failed to load.");
        return;
    }

    // Read URL parameters
    const params = new URLSearchParams(window.location.search);

    selectedCourse = (params.get("course") || "").toLowerCase();
    const chapter = params.get("chapter");

    // Filter questions
    if (chapter) {
        questions = QUESTIONS.filter(q =>
            q.course.toLowerCase() === selectedCourse &&
            Number(q.chapter) === Number(chapter)
        );
    } else {
        questions = QUESTIONS.filter(q =>
            q.course.toLowerCase() === selectedCourse
        );
    }

    // No questions
    if (questions.length === 0) {
        alert("No questions found for " + selectedCourse.toUpperCase());
        return;
    }

    // Shuffle questions
    questions.sort(() => Math.random() - 0.5);

    // Limit number of questions
    if (selectedQuestionsCount < questions.length) {
        questions = questions.slice(0, selectedQuestionsCount);
    }

    // Get exam duration
    const hrs = parseInt(document.getElementById("time-hours").value) || 0;
    const mins = parseInt(document.getElementById("time-minutes").value) || 0;

    const totalMinutes = (hrs * 60) + mins;

    if (totalMinutes <= 0) {
        alert("Please select a valid exam duration.");
        return;
    }

    // Reset exam state
    currentQuestion = 0;
    answers = [];
    review = [];
    timeLeft = totalMinutes * 60;

    // Update mode label
    document.getElementById("mode").innerText = selectedMode + " Mode";

    // Show exam screen
    document.getElementById("setup-screen").style.display = "none";
    document.getElementById("exam-screen").style.display = "block";

    // Start timer
    if (selectedMode === "Exam") {
        startTimer();
    } else {
        document.getElementById("timer").innerText = "♾️ Unlimited";
    }

    // Load first question
    loadQuestion();
}

// ==========================
// LOAD QUESTION
// ==========================
function loadQuestion() {
    if (questions.length === 0) {
        document.getElementById("question-box").innerHTML = "<h3>No questions found.</h3>";
        return;
    }

    let q = questions[currentQuestion];

    document.getElementById("question-number").innerText = `Question ${currentQuestion + 1}`;
    document.getElementById("question-box").innerText = q.question;
    document.getElementById("progress").innerText = `Question ${currentQuestion + 1} / ${questions.length}`;

    let html = "";
    const letters = ["A", "B", "C", "D"];

    q.options.forEach((option, i) => {
        let styleStr = "";

        if (answers[currentQuestion] !== undefined) {
            if (selectedMode === "Quiz") {
                // Quiz (Practice) Mode: Immediate feedback styling (Correct vs Wrong options)
                if (i === q.answer) {
                    styleStr = "style='background:#22c55e;color:#fff;border-color:#22c55e;'";
                } else if (answers[currentQuestion] === i) {
                    styleStr = "style='background:#ef4444;color:#fff;border-color:#ef4444;'";
                }
            } else {
                // Exam Mode: Standard single background blue highlight
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

    // Set contextual review label string
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
// CHOICE SELECT
// ==========================
function answer(choice) {
    // Lock answers on immediate feedback screens in Quiz Mode
    if (selectedMode === "Quiz" && answers[currentQuestion] !== undefined) {
        return;
    }

    answers[currentQuestion] = choice;
    loadQuestion();
}

// ==========================
// NAVIGATION HANDLERS
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
// REVIEW TOGGLE
// ==========================
function markForReview() {
    const index = review.indexOf(currentQuestion);
    
    if (index > -1) {
        review.splice(index, 1);
    } else {
        review.push(currentQuestion);
    }

    loadQuestion();
}

// ==========================
// PROCESS PROGRESS BAR
// ==========================
function updateProgressBar() {
    let percent = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById("progress-fill").style.width = percent + "%";
}

// ==========================
// BUILD PALETTE
// ==========================
function createPalette() {
    const palette = document.getElementById("question-palette");
    if (!palette) return;

    palette.innerHTML = "";

    questions.forEach((q, i) => {
        let btn = document.createElement("button");
        btn.innerText = i + 1;
        btn.className = "palette-btn";

        if (answers[i] !== undefined) {
            btn.style.background = "#22c55e"; // Green answered button
            btn.style.color = "#fff";
        }

        if (review.includes(i)) {
            btn.style.background = "#f59e0b"; // Orange reviewed button
            btn.style.color = "#fff";
        }

        if (i === currentQuestion) {
            btn.style.border = "3px solid #3b82f6"; // Light Blue highlight for Active indicator
        }

        btn.onclick = function () {
            currentQuestion = i;
            loadQuestion();
        };

        palette.appendChild(btn);
    });
}

// ==========================
// TIMER LOOPS
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
    let hrs = Math.floor(timeLeft / 3600);
    let min = Math.floor((timeLeft % 3600) / 60);
    let sec = timeLeft % 60;

    if (hrs > 0) {
        document.getElementById("timer").innerText =
            `⏰ ${hrs}:${min.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;
    } else {
        document.getElementById("timer").innerText =
            `⏰ ${min}:${sec.toString().padStart(2,"0")}`;
    }
}

// ==========================
// SUBMIT ACTIONS
// ==========================
function finishExam() {

    if (!confirm("Are you sure you want to submit your exam?")) {
        return;
    }

    if (timerInterval) clearInterval(timerInterval);

    let score = 0;

    questions.forEach((q, i) => {
        if (answers[i] === q.answer) {
            score++;
        }
    });

    localStorage.setItem("score", score);
    localStorage.setItem("total", questions.length);
    localStorage.setItem("course", selectedCourse);

    window.location.href = "result.html";
}

