// ==========================================
// COIN SYSTEM
// ==========================================
async function payForExam() {

    if (typeof spendCoins !== "function") {

        alert("Coin system not loaded. Please refresh.");
        return false;

    }

    const paid = await spendCoins(
        10,
        selectedMode + " Attempt"
    );

    return paid;
}
// ==========================================
// COURSE DICTIONARY (DELSU Curriculum)
// ==========================================
const COURSE_TITLES = {
    "gst101": "GST 101 – Use of English & Library",
    "gst102": "GST 102 – Philosophy & Human Existence",
    "gst103": "GST 103 – DELSU Culture & Ethics",
    "gst111": "GST 111 – Nigerian Peoples, Culture & Entrepreneurial Skills",
    "gst112": "GST 112 – History & Philosophy of Science and Technology",
    "gst113": "GST 113 – Peace Studies & Conflict Resolution",
    "gst114": "GST 114 – Communication in French"
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
// UNIFIED COURSE RESOLUTION HELPER
// ==========================================
function getSelectedCourse() {
    try {
        const params = new URLSearchParams(window.location.search);
        let course = params.get("course") || localStorage.getItem("selectedCourse") || localStorage.getItem("course") || "gst101";
        return course.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    } catch (e) {
        return "gst101"; // Secure fallback for incognito environments
    }
}

// ==========================================
// PAGE INITIALIZATION FLOW
// ==========================================
function initPage() {
    // Prevent double initialization
    if (window.pageInitialized) return;
    window.pageInitialized = true;

    // 1. Resolve selected course consistently
    selectedCourse = getSelectedCourse();

    // 2. Resolve and display Course Title dynamically
    const courseTitle = COURSE_TITLES[selectedCourse] || selectedCourse.toUpperCase();
    const titleEl = document.getElementById("setup-course-title");
    if (titleEl) {
        titleEl.innerText = courseTitle;
    }

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
                    if (defaultBtn) {
                        defaultBtn.classList.add("active");
                        if (!defaultBtn.querySelector(".check-mark")) {
                            defaultBtn.innerHTML += ' <span class="check-mark">✓</span>';
                        }
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
    const examScreen = document.getElementById("exam-screen");
    const setupScreen = document.getElementById("setup-screen");
    if (examScreen) examScreen.style.display = "none";
    if (setupScreen) setupScreen.style.display = "block";
}

// Safe multi-mode DOM Ready check (solves mobile cache loading delay)
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
} else {
    initPage();
}

// ==========================================
// INTERACTIVE SELECTIONS
// ==========================================
function setMode(mode) {
    selectedMode = mode;
    document.querySelectorAll(".mode-card").forEach(card => card.classList.remove("active"));
    
    if (mode === 'Exam') {
        const examEl = document.getElementById("mode-exam");
        if (examEl) examEl.classList.add("active");
    } else {
        const quizEl = document.getElementById("mode-quiz");
        if (quizEl) quizEl.classList.add("active");
    }
}

// ==========================
// START EXAM
// ==========================
async function startExam() {
    // Ensure our dynamic loader successfully populated the QUESTIONS variable
    if (typeof QUESTIONS === "undefined") {
        alert(`Questions file failed to load. Please make sure your "${selectedCourse}.js" file exists and is in the correct directory.`);
        return;
    }

    // Resolve course dynamically
    selectedCourse = getSelectedCourse();
    
    const params = new URLSearchParams(window.location.search);
    const chapter = params.get("chapter");

    // Filter questions matching normalized course keys (ignores case and spaces)
    if (chapter) {
        questions = QUESTIONS.filter(q =>
            q.course.toLowerCase().replace(/[^a-z0-9]/g, '') === selectedCourse &&
            Number(q.chapter) === Number(chapter)
        );
    } else {
        questions = QUESTIONS.filter(q =>
            q.course.toLowerCase().replace(/[^a-z0-9]/g, '') === selectedCourse
        );
    }

    // Fallback: If strict matching returned nothing, but questions exist, try raw match
    if (questions.length === 0 && QUESTIONS.length > 0) {
        questions = QUESTIONS;
    }

    // No questions
    if (questions.length === 0) {
        alert("No questions found for " + selectedCourse.toUpperCase());
        return;
    }
    // ==========================
// PAY 10 COINS TO START
// ==========================

const payment = await payForExam();

if (!payment) {
    return;
}

    // Shuffle questions
    questions.sort(() => Math.random() - 0.5);

    // Limit number of questions
    if (selectedQuestionsCount < questions.length) {
        questions = questions.slice(0, selectedQuestionsCount);
    }

    // Get exam duration
    const hrsEl = document.getElementById("time-hours");
    const minsEl = document.getElementById("time-minutes");
    const hrs = hrsEl ? (parseInt(hrsEl.value) || 0) : 0;
    const mins = minsEl ? (parseInt(minsEl.value) || 0) : 0;

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
    const modeEl = document.getElementById("mode");
    if (modeEl) modeEl.innerText = selectedMode + " Mode";

    // Show exam screen
    const setupScreen = document.getElementById("setup-screen");
    const examScreen = document.getElementById("exam-screen");
    if (setupScreen) setupScreen.style.display = "none";
    if (examScreen) examScreen.style.display = "block";

    // Start timer
    if (selectedMode === "Exam") {
        startTimer();
    } else {
        const timerEl = document.getElementById("timer");
        if (timerEl) timerEl.innerText = "♾️ Unlimited";
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
updateNextButton();
}

// ==========================
// CHOICE SELECT
// ==========================
function answer(choice) {
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
// UPDATE PROGRESS BAR
// ==========================
function updateProgressBar() {
    const fill = document.getElementById("progress-fill");

    if (!fill || questions.length === 0) return;

    const percent = ((currentQuestion + 1) / questions.length) * 100;
    fill.style.width = percent + "%";
}

// ==========================
// UPDATE NEXT BUTTON
// ==========================
function updateNextButton() {
    const nextBtn = document.getElementById("next-btn");

    if (!nextBtn) return;

    nextBtn.onclick = null;

    if (currentQuestion === questions.length - 1) {
        nextBtn.innerHTML = "📝 Submit Exam";
        nextBtn.onclick = finishExam;
        nextBtn.style.background = "#16a34a";
    } else {
        nextBtn.innerHTML = "Next ➡";
        nextBtn.onclick = nextQuestion;
        nextBtn.style.background = "#374151";
    }
}

// ==========================
// BUILD PALETTE
// ==========================
function createPalette() {
    const palette = document.getElementById("question-palette");
    if (!palette) return;

    palette.innerHTML = "";

    questions.forEach((q, i) => {
        const btn = document.createElement("button");

        btn.innerText = i + 1;
        btn.className = "palette-btn";

        if (answers[i] !== undefined) {
            btn.style.background = "#22c55e";
            btn.style.color = "#fff";
        }

        if (review.includes(i)) {
            btn.style.background = "#f59e0b";
            btn.style.color = "#fff";
        }

        if (i === currentQuestion) {
            btn.style.border = "3px solid #3b82f6";
        }

        btn.onclick = function () {
            currentQuestion = i;
            loadQuestion();
        };

        palette.appendChild(btn);
    });
}

// ==========================
// TIMER
// ==========================
function startTimer() {
    clearInterval(timerInterval);

    updateTimerDisplay();

    timerInterval = setInterval(() => {

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishExam(true);
            return;
        }

        timeLeft--;
        updateTimerDisplay();

    }, 1000);
}

function updateTimerDisplay() {
    const hrs = Math.floor(timeLeft / 3600);
    const mins = Math.floor((timeLeft % 3600) / 60);
    const secs = timeLeft % 60;

    const timerEl = document.getElementById("timer");
    if (!timerEl) return;

    if (hrs > 0) {
        timerEl.innerText =
            `⏰ ${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    } else {
        timerEl.innerText =
            `⏰ ${mins}:${String(secs).padStart(2, "0")}`;
    }
}

// ==========================
// FINISH EXAM
// ==========================
function finishExam(autoSubmit = false) {

    if (!autoSubmit) {
        if (!confirm("Are you sure you want to submit your exam?")) {
            return;
        }
    }

    clearInterval(timerInterval);

    let score = 0;

    questions.forEach((q, i) => {
        if (answers[i] === q.answer) {
            score++;
        }
    });

    // Save result
    localStorage.setItem("score", score);
    localStorage.setItem("total", questions.length);
    localStorage.setItem("course", selectedCourse);

    // Save exam data for Corrections page
    localStorage.setItem("examQuestions", JSON.stringify(questions));
    localStorage.setItem("examAnswers", JSON.stringify(answers));

    // Go to result page
    window.location.href = "result.html";
}
