// ==========================================
// LOAD RESULT
// ==========================================

const score = Number(localStorage.getItem("score")) || 0;
const total = Number(localStorage.getItem("total")) || 0;
const course = localStorage.getItem("course") || "GST 101";

const percent =
total > 0 ? ((score / total) * 100) : 0;

const wrong = total - score;

// ==========================================
// DELSU GRADING
// ==========================================

let grade = "";
let gradePoint = "";
let message = "";
let color = "";

if (percent >= 70) {
    grade = "Grade A";
    gradePoint = "5.00";
    message = "🏆 Outstanding Performance!";
    color = "#22c55e";
}
else if (percent >= 60) {
    grade = "Grade B";
    gradePoint = "4.00";
    message = "🎉 Very Good Performance!";
    color = "#3b82f6";
}
else if (percent >= 50) {
    grade = "Grade C";
    gradePoint = "3.00";
    message = "👍 Good Performance!";
    color = "#f59e0b";
}
else if (percent >= 45) {
    grade = "Grade D";
    gradePoint = "2.00";
    message = "🙂 Fair Performance!";
    color = "#fb923c";
}
else if (percent >= 40) {
    grade = "Grade E";
    gradePoint = "1.00";
    message = "⚠ Pass";
    color = "#eab308";
}
else {
    grade = "Grade F";
    gradePoint = "0.00";
    message = "💪 Don't give up. Practice more!";
    color = "#ef4444";
}

// ==========================================
// DISPLAY
// ==========================================

document.getElementById("percentText").innerHTML =
`${percent.toFixed(1)}%`;

document.getElementById("gradeText").innerHTML =
grade;

document.getElementById("messageText").innerHTML =
message;

document.getElementById("scoreText").innerHTML =
`${score}/${total}`;

document.getElementById("wrongText").innerHTML =
wrong;

document.getElementById("totalText").innerHTML =
total;

document.getElementById("gradePointText").innerHTML =
gradePoint;

document.getElementById("courseText").innerHTML =
course.toUpperCase();

// Change grade card colour
document.querySelector(".grade-card").style.background = color;

// ==========================================
// PROGRESS RING
// ==========================================

const ring = document.getElementById("progressRing");

const radius = 75;
const circumference = 2 * Math.PI * radius;

ring.style.strokeDasharray = circumference;

const offset =
circumference - (percent / 100) * circumference;

ring.style.strokeDashoffset = offset;
ring.style.stroke = color;

// ==========================================
// BUTTONS
// ==========================================

function viewCorrections() {
    window.location.href = "corrections.html";
}

function retakeExam() {
    history.back();
}

function goHome() {
    window.location.href = "index.html";
}
