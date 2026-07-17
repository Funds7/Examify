import { auth, db } from "./firebase.js";

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

async function loadLeaderboard() {

    const list = document.getElementById("leaderboard-list");

    if (!list) return;

    list.innerHTML = "<p>Loading...</p>";

    const q = query(
        collection(db, "users"),
        orderBy("totalScore", "desc"),
        limit(100)
    );

    const snap = await getDocs(q);

    list.innerHTML = "";

    let rank = 1;

    snap.forEach(doc => {

        const user = doc.data();

        const medal =
            rank === 1 ? "🥇" :
            rank === 2 ? "🥈" :
            rank === 3 ? "🥉" :
            `#${rank}`;

        list.innerHTML += `
        <div class="leader-card">
            <h3>${medal} ${user.name}</h3>

            <p>⭐ Level ${user.level ?? 1}</p>

            <p>🎯 ${user.totalScore ?? 0} Points</p>

            <p>📚 ${user.completedTests ?? 0} Exams</p>

            <p>🔥 ${user.studyStreak ?? 0} Day Streak</p>
        </div>
        `;

        rank++;

    });

}

loadLeaderboard();
