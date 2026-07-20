/**
 * FundsIQ CGPA Pro Math Engine & Trajectory Graph
 * Developed by Odigwe Joshua
 */
import { auth, db } from "./firebase.js";

import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

let currentUser = null;

(function () {
"use strict";

  // ==========================================
  // STATE MANAGEMENT VARIABLES
  // ==========================================
  const State = {
    gradingScale: 5.0, // Default 5.0 (DELSU). Toggles between 5.0 and 4.0
    courses: [],      // Registered course data array
    selectedEditId: null,
    activeConfirmAction: null, // Callback for reset/delete dialog execution
    searchQuery: "",
    filterLevel: "ALL",
    filterSemester: "ALL"
  };

  // Grade point mapping matrices
  const POINT_SCALES = {
    5.0: { "A": 5, "B": 4, "C": 3, "D": 2, "E": 1, "F": 0 },
    4.0: { "A": 4, "B": 3, "C": 2, "D": 1, "F": 0 } // E grade is disabled on 4.0 scale
  };

  // ==========================================
  // TOAST ALERTS MODULE
  // ==========================================
  function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-indicator"></span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ==========================================
  // MATHEMATICAL EVALUATION ENGINE
  // ==========================================
  function calculateCoreGpaMetrics() {
    let cumulativeQP = 0;
    let cumulativeUnits = 0;

    State.courses.forEach(c => {
      const points = POINT_SCALES[State.gradingScale][c.grade];
      const qp = points * Number(c.units);
      cumulativeQP += qp;
      cumulativeUnits += Number(c.units);
    });

    const cgpa = cumulativeUnits > 0 ? (cumulativeQP / cumulativeUnits) : 0;
    const standing = evaluateAcademicClass(cgpa, State.gradingScale);

    // Filter unique semesters count
    const semesterKeys = new Set(State.courses.map(c => `${c.level}-${c.semester}`));

    return {
      cgpa: cgpa.toFixed(2),
      standing,
      totalCourses: State.courses.length,
      activeSemesters: semesterKeys.size,
      totalUnits: cumulativeUnits,
      totalQP: cumulativeQP
    };
  }

  function evaluateAcademicClass(cgpa, scale) {
    if (cgpa <= 0) return "Evaluation Pending";

    if (scale === 5.0) {
      if (cgpa >= 4.50) return "First Class 🎓";
      if (cgpa >= 3.50) return "Second Class Upper 🌟";
      if (cgpa >= 2.40) return "Second Class Lower 👍";
      if (cgpa >= 1.50) return "Third Class 📘";
      return "Pass 📝";
    } else {
      if (cgpa >= 3.50) return "First Class 🎓";
      if (cgpa >= 3.00) return "Second Class Upper 🌟";
      if (cgpa >= 2.00) return "Second Class Lower 👍";
      if (cgpa >= 1.50) return "Third Class 📘";
      return "Pass 📝";
    }
  }

  function calculateSemesterGpa(level, semester) {
    let qp = 0;
    let units = 0;

    State.courses
      .filter(c => c.level === level && c.semester === Number(semester))
      .forEach(c => {
        const pts = POINT_SCALES[State.gradingScale][c.grade];
        qp += pts * Number(c.units);
        units += Number(c.units);
      });

    return units > 0 ? (qp / units).toFixed(2) : "0.00";
  }

  // ==========================================
  // GRAPHICS CONTROLLER (RAW HTML CANVAS GRAPH)
  // ==========================================
  function renderTrajectoryGraph() {
    const canvas = document.getElementById("gpa-trend-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    
    // Size and scaling adjustments for crisp high-DPI rendering
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 180 * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 180;

    // Clear frame
    ctx.clearRect(0, 0, width, height);

    // Extract sorted semesters chronological trend
    const semesterTotals = {};
    State.courses.forEach(c => {
      const key = `${c.level} S${c.semester}`;
      if (!semesterTotals[key]) {
        semesterTotals[key] = { qp: 0, units: 0, level: c.level, sem: c.semester };
      }
      const pts = POINT_SCALES[State.gradingScale][c.grade];
      semesterTotals[key].qp += pts * Number(c.units);
      semesterTotals[key].units += Number(c.units);
    });

    const timelineData = Object.keys(semesterTotals)
      .map(key => {
        const item = semesterTotals[key];
        return {
          label: key,
          gpa: Number((item.qp / item.units).toFixed(2)),
          level: item.level,
          sem: item.sem
        };
      })
      .sort((a, b) => {
        // Chronological sort: 100L S1 -> 100L S2 -> 200L S1 etc.
        const levelA = parseInt(a.level) || 0;
        const levelB = parseInt(b.level) || 0;
        if (levelA !== levelB) return levelA - levelB;
        return a.sem - b.sem;
      });

    if (timelineData.length < 2) {
      // Draw placeholder guide grids if data is insufficient
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Insufficient semester data to plot trend line", width / 2, height / 2 + 5);
      return;
    }

    const paddingX = 40;
    const paddingY = 25;
    const graphWidth = width - paddingX * 2;
    const graphHeight = height - paddingY * 2;

    const points = timelineData.map((data, index) => {
      const x = paddingX + (graphWidth / (timelineData.length - 1)) * index;
      const ratio = data.gpa / State.gradingScale;
      const y = height - paddingY - ratio * graphHeight;
      return { x, y, val: data.gpa, label: data.label };
    });

    // Draw horizontal grid lines and vertical anchors
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = paddingY + (graphHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(paddingX, y);
      ctx.lineTo(width - paddingX, y);
      ctx.stroke();
    }

    // Render smooth glowing Bezier curve
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.quadraticCurveTo(points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].x, points[points.length - 1].y);

    // Curve outline style
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(139, 92, 246, 0.4)";
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // Draw translucent glow area below the curve
    ctx.lineTo(points[points.length - 1].x, height - paddingY);
    ctx.lineTo(points[0].x, height - paddingY);
    ctx.closePath();
    const fillGradient = ctx.createLinearGradient(0, paddingY, 0, height - paddingY);
    fillGradient.addColorStop(0, "rgba(139, 92, 246, 0.15)");
    fillGradient.addColorStop(1, "rgba(139, 92, 246, 0.0)");
    ctx.fillStyle = fillGradient;
    ctx.fill();

    // Render nodes and numeric overlays
    points.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#8b5cf6";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fill();

      // GPA badge text label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(pt.val.toFixed(2), pt.x, pt.y - 10);

      // Semester label at bottom
      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.font = "7.5px sans-serif";
      ctx.fillText(pt.label, pt.x, height - 10);
    });
  }

  // ==========================================
  // DYNAMIC COMPONENT RENDERING LOGIC
  // ==========================================
  function updateDashboardUI() {
    const metrics = calculateCoreGpaMetrics();

    // Display numbers
    document.getElementById("stat-total-courses").textContent = metrics.totalCourses;
    document.getElementById("stat-active-semesters").textContent = metrics.activeSemesters;
    document.getElementById("stat-total-units").textContent = metrics.totalUnits;
    document.getElementById("stat-total-qp").textContent = metrics.totalQP;

    const cgpaDisplay = document.getElementById("cgpa-display-val");
    if (cgpaDisplay) cgpaDisplay.textContent = metrics.cgpa;

    const scaleLabel = document.getElementById("cgpa-scale-label");
    if (scaleLabel) scaleLabel.textContent = `of ${State.gradingScale.toFixed(1)}`;

    const standingBadge = document.getElementById("class-standing-badge");
    if (standingBadge) {
      standingBadge.textContent = metrics.standing;
      // Clear status classes
      standingBadge.className = "class-badge";

      if (metrics.cgpa > 0) {
        if (metrics.standing.includes("First Class")) standingBadge.classList.add("first-class");
        else if (metrics.standing.includes("Upper")) standingBadge.classList.add("second-upper");
        else if (metrics.standing.includes("Lower")) standingBadge.classList.add("second-lower");
        else if (metrics.standing.includes("Third")) standingBadge.classList.add("third-class");
        else standingBadge.classList.add("pass");
      }
    }

    const summaryText = document.getElementById("stats-summary-text");
    if (summaryText) {
      if (metrics.totalCourses > 0) {
        summaryText.textContent = `You maintain a cumulative average of ${metrics.cgpa} units.`;
      } else {
        summaryText.textContent = "Register semesters to begin calculations.";
      }
    }

    // Update glowing progress circle dash offset
    const ring = document.getElementById("cgpa-progress-ring");
    if (ring) {
      const pct = Math.min(100, (Number(metrics.cgpa) / State.gradingScale) * 100);
      const strokeVal = 100 - pct;
      ring.style.strokeDashoffset = strokeVal;
    }

    renderTrajectoryGraph();
  }

  function renderSemestersList() {
    const viewport = document.getElementById("semesters-viewport");
    const emptyState = document.getElementById("empty-state");
    const container = document.getElementById("dynamic-semesters-content");

    if (!viewport || !emptyState || !container) return;

    let filtered = [...State.courses];

    // Filter by Search Query
    if (State.searchQuery.trim() !== "") {
        const q = State.searchQuery.toLowerCase();
        filtered = filtered.filter(c => 
            c.courseCode.toLowerCase().includes(q) ||
            c.courseTitle.toLowerCase().includes(q)
        );
    }

    // Filter by Level
    if (State.filterLevel !== "ALL") {
        filtered = filtered.filter(c => c.level === State.filterLevel);
    }

    // Filter by Semester
    if (State.filterSemester !== "ALL") {
        filtered = filtered.filter(c => c.semester === Number(State.filterSemester));
    }

    if (filtered.length === 0) {
        container.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";
    container.innerHTML = "";

    // Group remaining entries by semester
    const groups = {};
    filtered.forEach(c => {
      const groupKey = `${c.level}-${c.semester}`;
      if (!groups[groupKey]) {
        groups[groupKey] = {
          level: c.level,
          semester: c.semester,
          courses: []
        };
      }
      groups[groupKey].courses.push(c);
    });

    // Chronological sort: 100L Sem 1 -> 100L Sem 2 -> etc.
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const levelA = parseInt(groups[a].level) || 0;
      const levelB = parseInt(groups[b].level) || 0;
      if (levelA !== levelB) return levelA - levelB;
      return groups[a].semester - groups[b].semester;
    });

    const fragment = document.createDocumentFragment();

    sortedKeys.forEach(key => {
      const g = groups[key];
      const semGPA = calculateSemesterGpa(g.level, g.semester);

      const section = document.createElement("section");
      section.className = "semester-section fade-in";

      section.innerHTML = `
        <div class="semester-title-bar">
          <h3>${g.level} – ${g.semester === 1 ? 'First' : 'Second'} Semester</h3>
          <span class="semester-gpa-stat">GPA: <span>${semGPA}</span></span>
        </div>
      `;

      g.courses.forEach(course => {
        const card = createCourseCard(course);
        section.appendChild(card);
      });

      fragment.appendChild(section);
    });

    container.appendChild(fragment);
  }

  function createCourseCard(course) {
    const card = document.createElement("div");
    card.className = "course-gpa-card";
    const color = getCourseThemeColor(course.courseCode);

    card.innerHTML = `
      <div class="course-color-bar" style="background-color: ${color};"></div>
      <div class="course-gpa-body">
        <div class="course-top-row">
          <span class="course-code">${course.courseCode}</span>
          <div class="grade-badge-circle grade-${course.grade}">${course.grade}</div>
        </div>
        <p class="course-title">${course.courseTitle}</p>
        <div class="course-bottom-row">
          <div class="units-indicator">Units: <span>${course.units}</span></div>
          <div class="card-actions-wrapper">
            <button class="icon-btn" onclick="window.duplicateCourseSession('${course.id}')" title="Duplicate Course">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
            <button class="icon-btn" onclick="window.editCourseModal('${course.id}')" title="Edit Course">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="icon-btn delete-icon" onclick="window.triggerDeleteConfirmation('${course.id}')" title="Delete Course">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 3 21 3 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `;
    return card;
  }

  function getCourseThemeColor(str) {
    const colors = ["#8b5cf6", "#ec4899", "#22c55e", "#f59e0b", "#3b82f6", "#f97316"];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  // ==========================================
  // DATA ACTIONS CONTROLLER
  // ==========================================
  async function saveCourseToState(data) {

  if (!currentUser) {
    showToast("Please login first.", "error");
    return;
  }

  if (State.selectedEditId) {

    await updateDoc(
      doc(db, "users", currentUser.uid, "courses", State.selectedEditId),
      data
    );

    const index = State.courses.findIndex(c => c.id === State.selectedEditId);

    State.courses[index] = {
      id: State.selectedEditId,
      ...data
    };

    showToast("Academic record updated.");

  } else {

    const docRef = await addDoc(
      collection(db, "users", currentUser.uid, "courses"),
      data
    );

    State.courses.push({
      id: docRef.id,
      ...data
    });

    showToast("Course record saved.");
}

updateDashboardUI();
renderSemestersList();

// Optional now since Firebase is your database
// syncStateToStorage();

  }

  // ==========================================
  // VIEW MODE TRIGGERS & INITIALIZERS
  // ==========================================
  window.toggleGradingScale = function () {
    const badge = document.getElementById("scale-badge");
    const eOption = document.getElementById("e-grade-option");

    if (State.gradingScale === 5.0) {
      State.gradingScale = 4.0;
      if (badge) badge.textContent = "4.0 Scale";
      if (eOption) eOption.style.display = "none"; // Grade E doesn't exist on 4.0

      // Convert any E grades currently entered to F grades on scale switch
      State.courses = State.courses.map(c => c.grade === "E" ? { ...c, grade: "F" } : c);
      showToast("Toggled to standard 4.0 Scale.");
    } else {
      State.gradingScale = 5.0;
      if (badge) badge.textContent = "5.0 Scale";
      if (eOption) eOption.style.display = "block";
      showToast("Toggled to DELSU 5.0 Scale.");
    }

    updateDashboardUI();
    renderSemestersList();
  };

  window.editCourseModal = function (id) {
    const modal = document.getElementById("course-modal");
    const item = State.courses.find(c => c.id === id);
    if (!modal || !item) return;

    State.selectedEditId = id;
    document.getElementById("modal-title").textContent = "Modify Course Record";
    document.getElementById("form-edit-id").value = id;
    document.getElementById("form-course-code").value = item.courseCode;
    document.getElementById("form-course-title").value = item.courseTitle;
    document.getElementById("form-level").value = item.level;
    document.getElementById("form-semester").value = item.semester;
    document.getElementById("form-units").value = item.units;
    document.getElementById("form-grade").value = item.grade;

    modal.classList.add("active");
  };

  window.triggerDeleteConfirmation = function (id) {
    const modal = document.getElementById("confirm-modal");
    if (!modal) return;

    document.getElementById("confirm-title").textContent = "Delete Course Session?";
    document.getElementById("confirm-desc").textContent = "This action will remove this course completely from your GPA calculations.";
    
    State.activeConfirmAction = async function () {

  await deleteDoc(
    doc(db, "users", currentUser.uid, "courses", id)
  );

  State.courses = State.courses.filter(c => c.id !== id);

  updateDashboardUI();
  renderSemestersList();

  showToast("Course removed permanently.");
};

    modal.classList.add("active");
  };

  window.triggerResetConfirmation = function () {
    const modal = document.getElementById("confirm-modal");
    if (!modal) return;

    document.getElementById("confirm-title").textContent = "Reset All Academic Data?";
    document.getElementById("confirm-desc").textContent = "This will wipe every single level, semester, and course from your local FundsIQ app.";

    State.activeConfirmAction = async function () {

  const snapshot = await getDocs(
    collection(db, "users", currentUser.uid, "courses")
  );

  for (const course of snapshot.docs) {
    await deleteDoc(course.ref);
  }

  State.courses = [];

  updateDashboardUI();
  renderSemestersList();

  showToast("All academic files purged.", "error");
};

    modal.classList.add("active");
  };

  // ==========================================
  // TRANSCRIPT EXPORT MODULE (RAW PRINTER)
  // ==========================================
  window.printTranscript = function () {
    const printableArea = document.getElementById("print-transcript-area");
    if (!printableArea) return;

    if (State.courses.length === 0) {
      showToast("No courses exist to write a transcript.", "error");
      return;
    }

    const metrics = calculateCoreGpaMetrics();

    // Group courses by level and semester
    const groups = {};
    State.courses.forEach(c => {
      const key = `${c.level}-${c.semester}`;
      if (!groups[key]) {
        groups[key] = { level: c.level, sem: c.semester, items: [] };
      }
      groups[key].items.push(c);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const lvlA = parseInt(groups[a].level) || 0;
      const lvlB = parseInt(groups[b].level) || 0;
      if (lvlA !== lvlB) return lvlA - lvlB;
      return groups[a].sem - groups[b].sem;
    });

    let tablesHTML = "";
    sortedKeys.forEach(key => {
      const g = groups[key];
      const gpa = calculateSemesterGpa(g.level, g.sem);

      tablesHTML += `
        <h3 style="margin-top:20px;font-size:11pt;border-bottom:1px solid #000;padding-bottom:4px;">
          ${g.level} – ${g.sem === 1 ? 'First' : 'Second'} Semester (GPA: ${gpa})
        </h3>
        <table class="print-table">
          <thead>
            <tr>
              <th style="width: 20%;">Course Code</th>
              <th>Course Title</th>
              <th style="width: 15%; text-align:center;">Credit Units</th>
              <th style="width: 15%; text-align:center;">Grade</th>
              <th style="width: 15%; text-align:center;">Points</th>
            </tr>
          </thead>
          <tbody>
            ${g.items.map(c => `
              <tr>
                <td>${c.courseCode}</td>
                <td>${c.courseTitle}</td>
                <td style="text-align:center;">${c.units}</td>
                <td style="text-align:center;font-weight:bold;">${c.grade}</td>
                <td style="text-align:center;">${POINT_SCALES[State.gradingScale][c.grade]}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    });

    printableArea.innerHTML = `
      <div class="print-header">
        <h1>FundsIQ Academic Transcript</h1>
        <h2>Official Record of Course Assessment</h2>
      </div>
      <div class="print-metadata-grid">
        <div><strong>Student Name:</strong> Odigwe Joshua</div>
        <div><strong>Institution:</strong> Delta State University (DELSU)</div>
        <div><strong>Date Compiled:</strong> ${new Date().toLocaleDateString()}</div>
        <div><strong>Grading System:</strong> ${State.gradingScale.toFixed(1)} Point Scale</div>
      </div>
      
      ${tablesHTML}

      <div class="print-summary-box">
        <div class="print-summary-row"><span>Total Credit Units:</span> <span>${metrics.totalUnits}</span></div>
        <div class="print-summary-row"><span>Quality Points:</span> <span>${metrics.totalQP}</span></div>
        <div class="print-summary-row" style="border-top:1px solid #000;padding-top:4px;margin-top:4px;">
          <span>CGPA:</span> <span>${metrics.cgpa}</span>
        </div>
        <div class="print-summary-row"><span>Standing:</span> <span style="font-size:9pt;">${metrics.standing}</span></div>
      </div>

      <div class="print-footer">
        <p>This transcript was digitally compiled using the FundsIQ academic module. Verified design by Odigwe Joshua.</p>
      </div>
    `;

    // Invoke browser printing system
    // Invoke browser printing system
window.print();

window.onafterprint = () => {
    printableArea.innerHTML = "";
};

}; // <-- THIS closes window.printTranscript

// ==========================================
// INITIALIZERS & EVENT LISTENERS BINDINGS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

  // Load grading scale
  try {
    const savedScale = localStorage.getItem("gpa_scale_setting");
    if (savedScale) {
      State.gradingScale = Number(savedScale);

      const badge = document.getElementById("scale-badge");
      const eOption = document.getElementById("e-grade-option");

      if (badge) badge.textContent = `${State.gradingScale.toFixed(1)} Scale`;
      if (eOption && State.gradingScale === 4.0) {
        eOption.style.display = "none";
      }
    }
  } catch (e) {
    console.warn(e);
  }

  // Load courses from Firebase
  onAuthStateChanged(auth, async (user) => {

    if (!user) return;

    currentUser = user;

    const snapshot = await getDocs(
      collection(db, "users", user.uid, "courses")
    );

    State.courses = [];

    snapshot.forEach((docSnap) => {
      State.courses.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    updateDashboardUI();
    renderSemestersList();

  });

  // Floating Action Button
  const fab = document.getElementById("fab-add-course");
  const modal = document.getElementById("course-modal");

  if (fab && modal) {
    fab.addEventListener("click", () => {
      State.selectedEditId = null;
      document.getElementById("course-form").reset();
      document.getElementById("form-edit-id").value = "";
      document.getElementById("modal-title").textContent = "Record Academic Course";
      modal.classList.add("active");
    });
  }

    // 4. Modal closes triggers
    document.getElementById("close-course-modal")?.addEventListener("click", () => {
      modal.classList.remove("active");
    });

    const confirmModal = document.getElementById("confirm-modal");
    document.getElementById("cancel-confirm-btn")?.addEventListener("click", () => {
      confirmModal.classList.remove("active");
    });

    document.getElementById("execute-confirm-btn")?.addEventListener("click", () => {
      if (State.activeConfirmAction) {
        State.activeConfirmAction();
      }
      confirmModal.classList.remove("active");
    });

    // 5. Course registration form listener
    const courseForm = document.getElementById("course-form");
    if (courseForm) {
      courseForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const data = {
          courseCode: document.getElementById("form-course-code").value.trim().toUpperCase(),
          courseTitle: document.getElementById("form-course-title").value.trim(),
          level: document.getElementById("form-level").value,
          semester: Number(document.getElementById("form-semester").value),
          units: Number(document.getElementById("form-units").value),
          grade: document.getElementById("form-grade").value
        };

        saveCourseToState(data);
        modal.classList.remove("active");
      });
    }

    // 6. Search and Filters Input Listeners
    document.getElementById("course-search-input")?.addEventListener("input", (e) => {
      State.searchQuery = e.target.value;
      renderSemestersList();
    });

    document.getElementById("filter-level")?.addEventListener("change", (e) => {
      State.filterLevel = e.target.value;
      renderSemestersList();
    });

    document.getElementById("filter-semester")?.addEventListener("change", (e) => {
      State.filterSemester = e.target.value;
      renderSemestersList();
    });

    // Render smooth graph adjustments if viewport changes
    window.addEventListener("resize", renderTrajectoryGraph);
  });

})();

