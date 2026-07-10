"use strict";

// ==========================================
// EXAMIFY RESULT ENGINE
// ==========================================

// Load Exam Data
const score = Number(localStorage.getItem("score")) || 0;
const total = Number(localStorage.getItem("total")) || 0;
const course = localStorage.getItem("course") || "GST";

// Prevent division by zero
const percentage = total > 0 ? ((score / total) * 100) : 0;

// ==========================================
// DELSU GRADING SYSTEM
// ==========================================

let grade = "";
let gradePoint = "";
let remark = "";
let badge = "";
let color = "";

if (percentage >= 70) {
    grade = "A";
    gradePoint = "5.00";
    remark = "Outstanding Performance!";
    badge = "🏆";
    color = "#22c55e";
}
else if (percentage >= 60) {
    grade = "B";
    gradePoint = "4.00";
    remark = "Very Good Performance!";
    badge = "🥈";
    color = "#3b82f6";
}
else if (percentage >= 50) {
    grade = "C";
    gradePoint = "3.00";
    remark = "Good Performance!";
    badge = "👍";
    color = "#f59e0b";
}
else if (percentage >= 45) {
    grade = "D";
    gradePoint = "2.00";
    remark = "Fair Performance!";
    badge = "📚";
    color = "#fb923c";
}
else if (percentage >= 40) {
    grade = "E";
    gradePoint = "1.00";
    remark = "Pass";
    badge = "🙂";
    color = "#eab308";
}
else {
    grade = "F";
    gradePoint = "0.00";
    remark = "Failed. Practice More!";
    badge = "❌";
    color = "#ef4444";
}

// ==========================================
// DISPLAY RESULT
// ==========================================

document.getElementById("course-name").textContent = course.toUpperCase();

document.getElementById("score").textContent =
`${score}/${total}`;

document.getElementById("percentage").textContent =
`${percentage.toFixed(1)}%`;

document.getElementById("grade").textContent = grade;
document.getElementById("grade-point").textContent = gradePoint;
document.getElementById("remark").textContent = `${badge} ${remark}`;

document.getElementById("grade").style.color = color;
document.getElementById("percentage").style.color = color;

// ==========================================
// PROGRESS CIRCLE
// ==========================================

const circle = document.querySelector(".progress-ring-circle");

if (circle) {

    const radius = 90;
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = circumference;

    const offset =
        circumference - (percentage / 100) * circumference;

    circle.style.strokeDashoffset = offset;
    circle.style.stroke = color;
}

// ==========================================
// CONFETTI
// ==========================================

if (percentage >= 70 && typeof confetti === "function") {

    confetti({
        particleCount: 180,
        spread: 90,
        origin: {
            y: 0.6
        }
    });

}

// ==========================================
// BUTTONS
// ==========================================

function goHome() {
    window.location.href = "index.html";
}

function retakeExam() {
    history.back();
}

function viewCorrections() {
    window.location.href = "corrections.html";
}

// Make available to HTML
window.goHome = goHome;
window.retakeExam = retakeExam;
window.viewCorrections = viewCorrections;
