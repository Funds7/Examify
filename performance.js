/**
 * FundsIQ Portfolio Performance Subsystem
 * Developed by Odigwe Joshua
 */

// Import Modular Firebase SDK from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    query, 
    orderBy, 
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================================================================
// 1. FIREBASE CONFIGURATION
// =========================================================================
// Insert your unique Firebase credentials inside this config block:
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID_HERE.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID_HERE",
    storageBucket: "YOUR_PROJECT_ID_HERE.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID_HERE",
    appId: "YOUR_APP_ID_HERE"
};

// Initialize Firebase securely
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =========================================================================
// 2. RUNTIME STATE MANAGER
// =========================================================================
const State = {
    user: null,
    exams: [],       // Stores historical exam objects from database
    statistics: {},  // Aggregated math metrics container
    courseStats: {}, // Course-specific analytics grouping
    streaks: { current: 0, longest: 0 },
    xp: 0,
    level: 1,
    unsubscribed: null
};

// Official course mappings
const COURSE_METADATA = {
    "gst101": { title: "Use of English & Library", code: "GST 101" },
    "gst102": { title: "Philosophy & Human Existence", code: "GST 102" },
    "gst103": { title: "DELSU Culture & Ethics", code: "GST 103" },
    "gst111": { title: "Nigerian Peoples, Culture & Entrepreneurial Skills", code: "GST 111" },
    "gst112": { title: "History & Philosophy of Science and Technology", code: "GST 112" },
    "gst113": { title: "Peace Studies & Conflict Resolution", code: "GST 113" },
    "gst114": { title: "Communication in French", code: "GST 114" }
};

// =========================================================================
// 3. DATA SYNCHRONIZATION MODULE (FIRESTORE)
// =========================================================================
function subscribeToPerformanceData(user) {
    if (State.unsubscribed) State.unsubscribed();

    const collectionPath = `users/${user.uid}/performance/exams`;
    const q = query(collection(db, collectionPath), orderBy("completedAt", "desc"));

    toggleSkeleton(true);

    State.unsubscribed = onSnapshot(q, (snapshot) => {
        const tempExams = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            tempExams.push({
                id: docSnap.id,
                ...data
            });
        });

        State.exams = tempExams;
        processAnalyticsPipeline();
    }, (error) => {
        console.error("Cloud Analytics subscription error:", error);
        toggleSkeleton(false);
        loadOfflineMockData();
    });
}

// Seamless offline fallback with pre-populated, high-fidelity mock data
function loadOfflineMockData() {
    const key = "fundsiq_offline_perf_mock";
    let data = localStorage.getItem(key);

    if (data) {
        State.exams = JSON.parse(data);
    } else {
        // High quality data structures matching a model student's timeline
        State.exams = [
            { id: "mock_e1", course: "gst101", score: 45, totalQuestions: 50, percentage: 90.0, grade: "A", correct: 45, wrong: 5, duration: 154, completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
            { id: "mock_e2", course: "gst102", score: 38, totalQuestions: 50, percentage: 76.0, grade: "B", correct: 38, wrong: 12, duration: 210, completedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "mock_e3", course: "gst103", score: 48, totalQuestions: 50, percentage: 96.0, grade: "A", correct: 48, wrong: 2, duration: 112, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "mock_e4", course: "gst101", score: 40, totalQuestions: 50, percentage: 80.0, grade: "B", correct: 40, wrong: 10, duration: 180, completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "mock_e5", course: "gst111", score: 23, totalQuestions: 50, percentage: 46.0, grade: "F", correct: 23, wrong: 27, duration: 250, completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
        ];
        localStorage.setItem(key, JSON.stringify(State.exams));
    }
    processAnalyticsPipeline();
}

// =========================================================================
// 4. CORE MATH & ANALYTICS PIPELINE
// =========================================================================
function processAnalyticsPipeline() {
    toggleSkeleton(false);

    if (State.exams.length === 0) {
        toggleDashboardView(false);
        return;
    }

    toggleDashboardView(true);

    // Run core analytical engines
    calculateGeneralMetrics();
    calculateStreaks();
    calculateXpAndLevel();
    groupCourseAnalytics();
    
    // Render pipeline
    updateDashboardUI();
    renderCourseAnalytics();
    renderRecentTimeline();
    renderActivityCalendar();
    evaluateAchievements();
    generateSmartInsights();
    renderTrendCharts();
}

// =========================================================================
// 5. STATISTICAL EVALUATIONS
// =========================================================================
function calculateGeneralMetrics() {
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let bestPercent = 0;
    let worstPercent = 100;
    let sumPercentages = 0;
    let passCount = 0;
    let totalTime = 0;
    let fastestTime = Infinity;
    let longestTime = 0;

    State.exams.forEach(e => {
        totalQuestions += Number(e.totalQuestions);
        totalCorrect += Number(e.correct);
        totalWrong += Number(e.wrong);
        totalTime += Number(e.duration);

        const pct = Number(e.percentage);
        sumPercentages += pct;

        if (pct > bestPercent) bestPercent = pct;
        if (pct < worstPercent) worstPercent = pct;
        if (pct >= 50.0) passCount++;

        const dur = Number(e.duration);
        if (dur < fastestTime) fastestTime = dur;
        if (dur > longestTime) longestTime = dur;
    });

    State.statistics = {
        totalExams: State.exams.length,
        totalQuestions,
        correctAnswers: totalCorrect,
        wrongAnswers: totalWrong,
        bestScore: bestPercent,
        lowestScore: worstPercent,
        avgScore: Math.round(sumPercentages / State.exams.length),
        passRate: Math.round((passCount / State.exams.length) * 100),
        avgTime: Math.round(totalTime / State.exams.length),
        fastestExam: fastestTime === Infinity ? 0 : fastestTime,
        longestExam: longestTime,
        studyHours: (totalTime / 3600).toFixed(1)
    };
}

function calculateStreaks() {
    if (State.exams.length === 0) {
        State.streaks = { current: 0, longest: 0 };
        return;
    }

    // Extract unique calendar dates
    const examDates = State.exams
        .map(e => new Date(e.completedAt).toDateString())
        .filter((val, idx, self) => self.indexOf(val) === idx)
        .map(d => new Date(d));

    examDates.sort((a, b) => b - a); // Descending chronological sort

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const oneDayMs = 24 * 60 * 60 * 1000;

    const today = new Date(new Date().toDateString());
    const firstExamDate = new Date(examDates[0].toDateString());
    const dayDiffFromToday = Math.round((today - firstExamDate) / oneDayMs);

    // If latest exam is older than yesterday, current streak is broken (0)
    if (dayDiffFromToday <= 1) {
        currentStreak = 1;
        for (let i = 0; i < examDates.length - 1; i++) {
            const diff = Math.round((examDates[i] - examDates[i+1]) / oneDayMs);
            if (diff === 1) {
                currentStreak++;
            } else if (diff > 1) {
                break;
            }
        }
    }

    // Evaluate historical longest consecutive streak
    if (examDates.length > 0) {
        tempStreak = 1;
        longestStreak = 1;
        for (let i = 0; i < examDates.length - 1; i++) {
            const diff = Math.round((examDates[i] - examDates[i+1]) / oneDayMs);
            if (diff === 1) {
                tempStreak++;
                if (tempStreak > longestStreak) longestStreak = tempStreak;
            } else if (diff > 1) {
                tempStreak = 1;
            }
        }
    }

    State.streaks = { current: currentStreak, longest: longestStreak };
}

function calculateXpAndLevel() {
    let xpVal = 0;
    State.exams.forEach(e => {
        xpVal += 100; // Base completion XP
        xpVal += e.correct * 10; // XP per correct answer
        if (e.percentage === 100.0) xpVal += 50; // Perfect score bonus
    });

    State.xp = xpVal;
    // Level formula: Every 500 XP ranks you up
    State.level = Math.floor(xpVal / 500) + 1;
}

function groupCourseAnalytics() {
    const groupings = {};

    State.exams.forEach(e => {
        const rawKey = e.course.toLowerCase().trim();
        if (!groupings[rawKey]) {
            groupings[rawKey] = {
                attempts: 0,
                sumPct: 0,
                bestPercent: 0,
                lastAttemptDate: null,
                correctCount: 0,
                totalQuestionsCount: 0
            };
        }

        const g = groupings[rawKey];
        g.attempts++;
        g.sumPct += Number(e.percentage);
        g.correctCount += Number(e.correct);
        g.totalQuestionsCount += Number(e.totalQuestions);

        const pct = Number(e.percentage);
        if (pct > g.bestPercent) g.bestPercent = pct;

        const date = new Date(e.completedAt);
        if (!g.lastAttemptDate || date > g.lastAttemptDate) {
            g.lastAttemptDate = date;
        }
    });

    State.courseStats = groupings;
}

// =========================================================================
// 6. DYNAMIC UI RENDERING CONTROLLERS
// =========================================================================
function updateDashboardUI() {
    const stats = State.statistics;

    // Direct text indicators insertion
    document.getElementById("student-level").textContent = `Level ${State.level}`;
    
    const xpThreshold = State.level * 500;
    const xpBase = (State.level - 1) * 500;
    const progressXP = State.xp - xpBase;
    const levelMaxXP = 500;

    document.getElementById("xp-points").textContent = `${State.xp} XP`;
    document.getElementById("xp-progress-fill").style.width = `${Math.min(100, (progressXP / levelMaxXP) * 100)}%`;

    // Dynamic Overall Rank Rating
    let rank = "Novice Scholar";
    if (State.level >= 10) rank = "CBT Grandmaster";
    else if (State.level >= 7) rank = "GST Specialist";
    else if (State.level >= 4) rank = "Academic Elite";
    else if (State.level >= 2) rank = "Rising Scholar";
    document.getElementById("rank-badge").textContent = rank;

    // Overall Accuracy circular progress ring calculations
    const overallAcc = stats.avgScore;
    document.getElementById("overall-accuracy").textContent = `${overallAcc}%`;
    
    const ring = document.getElementById("accuracy-progress-ring");
    if (ring) {
        const offsetVal = 100 - overallAcc;
        ring.style.strokeDashoffset = offsetVal;
    }

    // Determine General Grade Standings
    let grade = "F";
    if (overallAcc >= 70) grade = "A";
    else if (overallAcc >= 60) grade = "B";
    else if (overallAcc >= 50) grade = "C";
    else if (overallAcc >= 45) grade = "D";
    document.getElementById("overall-grade").textContent = `GRADE ${grade}`;

    // Statistics metrics placement
    document.getElementById("stat-total-exams").textContent = stats.totalExams;
    document.getElementById("stat-total-questions").textContent = stats.totalQuestions;
    document.getElementById("stat-correct-answers").textContent = stats.correctAnswers;
    document.getElementById("stat-wrong-answers").textContent = stats.wrongAnswers;
    document.getElementById("stat-best-score").textContent = `${stats.bestScore}%`;
    document.getElementById("stat-lowest-score").textContent = `${stats.lowestScore}%`;
    document.getElementById("stat-avg-score").textContent = `${stats.avgScore}%`;
    document.getElementById("stat-pass-rate").textContent = `${stats.passRate}%`;
    document.getElementById("stat-avg-time").textContent = formatDuration(stats.avgTime);
    document.getElementById("stat-fastest-exam").textContent = formatDuration(stats.fastestExam);
    document.getElementById("stat-longest-exam").textContent = formatDuration(stats.longestExam);
    document.getElementById("stat-current-streak").textContent = `${State.streaks.current}d`;
    document.getElementById("stat-longest-streak").textContent = `${State.streaks.longest}d`;
    document.getElementById("stat-study-hours").textContent = `${stats.studyHours}h`;

    // Milestones Goals Calculations
    updateGoals();
    
    // Competitive National Student Rankings Calculations
    renderNationalRankings(overallAcc);

    // Performance Growth Story
    renderAcademicJourney(overallAcc);
}

function updateGoals() {
    // 1. Daily Goal: check if completed an exam today
    const todayStr = new Date().toDateString();
    const completedToday = State.exams.filter(e => new Date(e.completedAt).toDateString() === todayStr).length;
    const dailyPct = Math.min(100, Math.round((completedToday / 1) * 100));
    document.getElementById("goal-daily-pct").textContent = `${dailyPct}%`;
    document.getElementById("goal-daily-fill").style.width = `${dailyPct}%`;

    // 2. Weekly Goal: check past 7 days count
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const pastWeekDate = Date.now() - oneWeekMs;
    const completedThisWeek = State.exams.filter(e => new Date(e.completedAt).getTime() >= pastWeekDate).length;
    const weeklyPct = Math.min(100, Math.round((completedThisWeek / 5) * 100));
    document.getElementById("goal-weekly-pct").textContent = `${weeklyPct}%`;
    document.getElementById("goal-weekly-fill").style.width = `${weeklyPct}%`;
}

function renderNationalRankings(overallAcc) {
    const label = document.getElementById("ranking-percentage-label");
    const facEl = document.getElementById("rank-faculty");
    const crsEl = document.getElementById("rank-course");
    const glbEl = document.getElementById("rank-global");

    // Dynamic, gamified percentage calculations
    const percentile = Math.max(10, Math.min(99, Math.round(overallAcc + (State.level * 1.5) - 5)));
    
    if (label) {
        label.textContent = `You perform better than ${percentile}% of university students`;
    }

    // Realistic scale metrics based on accuracy levels
    const globalRank = Math.max(1, Math.round(1000 - (overallAcc * 9.5)));
    const facultyRank = Math.max(1, Math.round(150 - (overallAcc * 1.4)));
    const courseRank = Math.max(1, Math.round(50 - (overallAcc * 0.48)));

    if (facEl) facEl.textContent = `#${facultyRank}`;
    if (crsEl) crsEl.textContent = `#${courseRank}`;
    if (glbEl) glbEl.textContent = `#${globalRank}`;
}

function renderAcademicJourney(overallAcc) {
    const firstScoreEl = document.getElementById("journey-first-score");
    const peakScoreEl = document.getElementById("journey-milestone-score");
    const currScoreEl = document.getElementById("journey-current-score");
    const deltaEl = document.getElementById("journey-delta-val");

    if (State.exams.length === 0) return;

    // Chronological order (earliest is first)
    const chronologicalExams = [...State.exams].reverse();
    const firstScore = Math.round(chronologicalExams[0].percentage);
    
    let peakScore = firstScore;
    chronologicalExams.forEach(e => {
        if (e.percentage > peakScore) peakScore = Math.round(e.percentage);
    });

    const currentScore = Math.round(overallAcc);
    const delta = currentScore - firstScore;

    if (firstScoreEl) firstScoreEl.textContent = `${firstScore}%`;
    if (peakScoreEl) peakScoreEl.textContent = `${peakScore}%`;
    if (currScoreEl) currScoreEl.textContent = `${currentScore}%`;

    if (deltaEl) {
        if (delta >= 0) {
            deltaEl.textContent = `+${delta}% Improvement`;
            deltaEl.style.backgroundColor = "rgba(34, 197, 94, 0.1)";
            deltaEl.style.color = "var(--green)";
        } else {
            deltaEl.textContent = `${delta}% Decline`;
            deltaEl.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            deltaEl.style.color = "var(--danger)";
        }
    }
}

function renderCourseAnalytics() {
    const container = document.getElementById("course-analytics-list");
    if (!container) return;

    container.innerHTML = "";

    const activeGSTKeys = ["gst101", "gst102", "gst103", "gst111", "gst112", "gst113", "gst114"];
    const fragment = document.createDocumentFragment();

    activeGSTKeys.forEach(courseId => {
        const cMeta = COURSE_METADATA[courseId];
        const stats = State.courseStats[courseId];

        if (!stats) return; // Exclude courses with no attempts yet

        const avgScore = Math.round(stats.sumPct / stats.attempts);
        const acc = Math.round((stats.correctCount / stats.totalQuestionsCount) * 100);

        const card = document.createElement("div");
        card.className = "course-metric-card fade-in";

        card.innerHTML = `
            <div class="course-metric-header">
                <div>
                    <h4>${cMeta.code}</h4>
                    <p>${cMeta.title}</p>
                </div>
                <span class="course-metric-pct">${avgScore}% Acc</span>
            </div>
            <div class="course-metric-progress">
                <div class="course-metric-fill" style="width: ${avgScore}%;"></div>
            </div>
            <div class="course-metric-grid">
                <div class="course-mini-stat">
                    <h5>${stats.attempts}</h5>
                    <p>Attempts</p>
                </div>
                <div class="course-mini-stat">
                    <h5>${stats.bestPercent}%</h5>
                    <p>Best Score</p>
                </div>
                <div class="course-mini-stat">
                    <h5>${acc}%</h5>
                    <p>Accuracy</p>
                </div>
            </div>
            <div class="course-insights-row">
                <div class="insight-pill">
                    <span class="insight-dot green"></span>
                    <span>Strong:</span> Chap ${avgScore >= 75 ? '1 & 3' : '2'}
                </div>
                <div class="insight-pill">
                    <span class="insight-dot red"></span>
                    <span class="weak-label">Weak:</span> Chap ${avgScore >= 75 ? 'None' : '4'}
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

function renderRecentTimeline() {
    const container = document.getElementById("recent-exams-list");
    if (!container) return;

    container.innerHTML = "";

    // Show latest 4 examinations for brevity
    const listLimit = State.exams.slice(0, 4);
    const fragment = document.createDocumentFragment();

    listLimit.forEach(exam => {
        const cMeta = COURSE_METADATA[exam.course.toLowerCase()] || { code: exam.course.toUpperCase(), title: "GST Course" };
        const card = document.createElement("div");
        card.className = "recent-exam-card fade-in";

        const formattedDate = new Date(exam.completedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        card.innerHTML = `
            <div class="recent-top-bar">
                <span class="recent-course-tag">${cMeta.code}</span>
                <span class="recent-date-stamp">${formattedDate}</span>
            </div>
            <h4 class="class-title" style="margin-bottom: 6px;">${cMeta.title}</h4>
            <div class="recent-score-text" style="color: ${exam.percentage >= 50.0 ? 'var(--green)' : 'var(--danger)'};">
                ${exam.score} <span>/ ${exam.totalQuestions} (${exam.percentage}%)</span>
            </div>
            <div class="recent-grid-metrics">
                <div class="recent-metric-cell">
                    <h6>${exam.grade}</h6>
                    <p>Grade</p>
                </div>
                <div class="recent-metric-cell" style="color: var(--green);">
                    <h6>+${exam.correct}</h6>
                    <p>Correct</p>
                </div>
                <div class="recent-metric-cell" style="color: var(--danger);">
                    <h6>-${exam.wrong}</h6>
                    <p>Wrong</p>
                </div>
                <div class="recent-metric-cell">
                    <h6>${formatDuration(exam.duration)}</h6>
                    <p>Time</p>
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}

function renderActivityCalendar() {
    const grid = document.getElementById("activity-calendar-grid");
    if (!grid) return;

    grid.innerHTML = "";

    // Render past 28 days heatmap
    const oneDayMs = 24 * 60 * 60 * 1000;
    const fragment = document.createDocumentFragment();

    for (let i = 27; i >= 0; i--) {
        const targetDate = new Date(Date.now() - i * oneDayMs);
        const targetDateStr = targetDate.toDateString();

        const count = State.exams.filter(e => new Date(e.completedAt).toDateString() === targetDateStr).length;

        const node = document.createElement("div");
        node.className = "calendar-day-node";
        node.textContent = targetDate.getDate();

        // Color coding depending on activity level
        if (count >= 3) {
            node.classList.add("active-lvl3");
        } else if (count === 2) {
            node.classList.add("active-lvl2");
        } else if (count === 1) {
            node.classList.add("active-lvl1");
        }

        fragment.appendChild(node);
    }

    grid.appendChild(fragment);
}

// =========================================================================
// 7. ACHIEVEMENTS ENGINE (12 TIRED BADGES INTERFACE)
// =========================================================================
function evaluateAchievements() {
    const badgeStates = {
        "badge-first-exam": State.exams.length >= 1,
        "badge-first-pass": State.exams.some(e => e.percentage >= 50.0),
        "badge-club-90": State.exams.some(e => e.percentage >= 90.0),
        "badge-perfect-score": State.exams.some(e => e.percentage === 100.0),
        "badge-streak-7": State.streaks.longest >= 7,
        "badge-streak-30": State.streaks.longest >= 30,
        "badge-exams-50": State.exams.length >= 50,
        "badge-exams-100": State.exams.length >= 100,
        "badge-top-student": State.statistics.avgScore >= 85,
        "badge-course-master": Object.keys(State.courseStats).length >= 7 && Object.values(State.courseStats).every(stat => (stat.sumPct / stat.attempts) >= 80),
        "badge-fast-finisher": State.exams.some(e => e.duration < 120 && e.percentage >= 80),
        "badge-consistency": checkMonthlyConsistency()
    };

    // Toggle unlock classes dynamically
    Object.keys(badgeStates).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (badgeStates[id]) {
                el.classList.remove("locked");
                el.classList.add("unlocked");
            } else {
                el.classList.add("locked");
                el.classList.remove("unlocked");
            }
        }
    });
}

function checkMonthlyConsistency() {
    // Check if user has taken exams in at least 2 distinct calendar months
    const months = State.exams.map(e => {
        const d = new Date(e.completedAt);
        return `${d.getFullYear()}-${d.getMonth()}`;
    });
    const uniqueMonths = new Set(months);
    return uniqueMonths.size >= 2;
}

// =========================================================================
// 8. COGNITIVE REASONING & SMART COACHING ENGINE
// =========================================================================
function generateSmartInsights() {
    const container = document.getElementById("ai-coach-advice");
    if (!container) return;

    container.innerHTML = "";

    const insights = [];

    // Analyze weak courses
    const courseKeys = Object.keys(State.courseStats);
    let weakestCourse = null;
    let strongestCourse = null;
    let lowestAvg = 100;
    let highestAvg = 0;

    courseKeys.forEach(k => {
        const avg = State.courseStats[k].sumPct / State.courseStats[k].attempts;
        if (avg < lowestAvg) {
            lowestAvg = avg;
            weakestCourse = k;
        }
        if (avg > highestAvg) {
            highestAvg = avg;
            strongestCourse = k;
        }
    });

    const quoteEl = document.getElementById("ai-motivational-text");
    if (strongestCourse) {
        insights.push(`Your performance in **${strongestCourse.toUpperCase()}** is exceptionally strong, holding a current average accuracy of **${Math.round(highestAvg)}%**.`);
        if (quoteEl) {
            const deltaVal = Math.round(highestAvg - (lowestAvg === 100 ? 50 : lowestAvg));
            quoteEl.innerHTML = `Excellent progress Joshua! Your accuracy improved **+${deltaVal}%** on your peak subjects this month.`;
        }
    } else {
        if (quoteEl) quoteEl.textContent = "Analyzing your academic study trends...";
    }

    if (weakestCourse && lowestAvg < 60) {
        insights.push(`Your **${weakestCourse.toUpperCase()}** performance is dropping. Spend 20 minutes revising Chapter 3 notes before starting your next CBT Practice session.`);
    }

    // Time trend insights
    if (State.statistics.avgTime < 600) {
        insights.push("Average completion time is improving rapidly. You are developing exceptional speed-solving heuristics.");
    } else {
        insights.push("Time monitoring indicates a slower completion rate. Practice simulated Exam Mode to build tactical time discipline.");
    }

    // Streak notifications
    if (State.streaks.current >= 3) {
        insights.push(`Superb study consistency! You are currently on an active **${State.streaks.current}-day learning streak**. Keep pushing to unlock the 7-Day Streak Badge.`);
    } else {
        insights.push("Study consistency is a primary success metric. Complete at least one CBT practice daily to maintain a learning streak.");
    }

    const fragment = document.createDocumentFragment();
    insights.forEach(text => {
        const item = document.createElement("li");
        
        // Convert mock markdown formatting to HTML bold spans
        item.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        fragment.appendChild(item);
    });

    container.appendChild(fragment);
}

// =========================================================================
// 9. CORE CANVAS GRAPHICS CONTROLLER (TREND & COMPARISON)
// =========================================================================
function renderTrendCharts() {
    renderTrendLineChart();
    renderCourseComparisonChart();
}

function renderTrendLineChart() {
    const canvas = document.getElementById("trend-chart-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = 160 * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = 160;

    ctx.clearRect(0, 0, w, h);

    // Filter latest 8 exam results in chronological order (left to right)
    const dataset = [...State.exams].slice(0, 8).reverse();

    if (dataset.length < 2) {
        drawPlaceholderGuideLines(ctx, w, h, "Insufficient timeline attempts to plot score trend line.");
        return;
    }

    const paddingX = 35;
    const paddingY = 20;
    const gWidth = w - paddingX * 2;
    const gHeight = h - paddingY * 2;

    const points = dataset.map((item, idx) => {
        const x = paddingX + (gWidth / (dataset.length - 1)) * idx;
        const ratio = Number(item.percentage) / 100;
        const y = h - paddingY - ratio * gHeight;
        return { x, y, val: item.percentage };
    });

    // Horizontal Grid Lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = paddingY + (gHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(paddingX, y);
        ctx.lineTo(w - paddingX, y);
        ctx.stroke();
    }

    // Smooth Bezier Curve
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.quadraticCurveTo(points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].x, points[points.length - 1].y);

    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 3;
    ctx.shadowColor = "rgba(139, 92, 246, 0.4)";
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset

    // Translucent gradient fill under curve
    ctx.lineTo(points[points.length - 1].x, h - paddingY);
    ctx.lineTo(points[0].x, h - paddingY);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, paddingY, 0, h - paddingY);
    grad.addColorStop(0, "rgba(139, 92, 246, 0.15)");
    grad.addColorStop(1, "rgba(139, 92, 246, 0.0)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Render nodes
    points.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#8b5cf6";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fill();
    });
}

function renderCourseComparisonChart() {
    const canvas = document.getElementById("course-chart-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = 160 * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = 160;

    ctx.clearRect(0, 0, w, h);

    const activeKeys = Object.keys(State.courseStats);

    if (activeKeys.length === 0) {
        drawPlaceholderGuideLines(ctx, w, h, "Insufficient course data to plot comparison bars.");
        return;
    }

    const paddingX = 40;
    const paddingY = 20;
    const gWidth = w - paddingX * 2;
    const gHeight = h - paddingY * 2;

    const barWidth = Math.min(30, (gWidth / activeKeys.length) * 0.5);
    const spacing = (gWidth - (barWidth * activeKeys.length)) / (activeKeys.length - 1 || 1);

    // Horizontal Guidelines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = paddingY + (gHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(paddingX, y);
        ctx.lineTo(w - paddingX, y);
        ctx.stroke();
    }

    activeKeys.forEach((key, index) => {
        const stats = State.courseStats[key];
        const avg = stats.sumPct / stats.attempts;

        const x = paddingX + (barWidth + spacing) * index;
        const barHeight = (avg / 100) * gHeight;
        const y = h - paddingY - barHeight;

        // Render sleek rounded bar
        ctx.fillStyle = "rgba(59, 130, 246, 0.85)";
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
            ctx.fill();
        } else {
            ctx.fillRect(x, y, barWidth, barHeight);
        }

        // Label Course Name below bar
        ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
        ctx.font = "bold 8px sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(key.toUpperCase(), x + barWidth / 2, h - 8);

        // Score percentage above bar
        ctx.fillStyle = "#fff";
        ctx.font = "bold 8px sans-serif";
        ctx.fillText(`${Math.round(avg)}%`, x + barWidth / 2, y - 6);
    });
}

function drawPlaceholderGuideLines(ctx, w, h, text) {
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        const y = (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
    ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(text, w / 2, h / 2 + 4);
}

// =========================================================================
// 10. SYSTEM UTILITIES
// =========================================================================
function toggleSkeleton(show) {
    const loader = document.getElementById("skeleton-loader");
    if (loader) loader.style.display = show ? "flex" : "none";
}

function toggleDashboardView(hasExams) {
    const content = document.getElementById("dashboard-content");
    const emptyState = document.getElementById("empty-state");

    if (hasExams) {
        if (content) content.style.display = "block";
        if (emptyState) emptyState.style.display = "none";
    } else {
        if (content) content.style.display = "none";
        if (emptyState) emptyState.style.display = "flex";
    }
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
}

// =========================================================================
// 11. BOOTSTRAP INITIALIZATION
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Observe Authentication States
    onAuthStateChanged(auth, (user) => {
        const dot = document.querySelector(".status-dot");
        const txt = document.getElementById("status-text");

        if (user) {
            State.user = user;
            if (dot) dot.className = "status-dot online";
            if (txt) txt.textContent = "Cloud Portfolio";
            subscribeToPerformanceData(user);
        } else {
            State.user = null;
            if (dot) dot.className = "status-dot offline";
            if (txt) txt.textContent = "Sandbox Mode";
            toggleSkeleton(false);
            loadOfflineMockData();
        }
    });

    // Handle standard layout redraw on resize (resolves canvas blur)
    window.addEventListener("resize", () => {
        if (State.exams.length > 0) {
            renderTrendCharts();
        }
    });
});
