import { db } from "./firebase.js";

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

    list.innerHTML = "<p>Loading leaderboard...</p>";

    try {

        const q = query(
            collection(db, "users"),
            orderBy("totalScore", "desc"),
            limit(100)
        );

        const snap = await getDocs(q);

        list.innerHTML = "";

        if (snap.empty) {
            list.innerHTML = `
                <p style="text-align:center;">
                    No students on the leaderboard yet.
                </p>
            `;
            return;
        }

        let rank = 1;

        snap.forEach((docSnap) => {

            const user = docSnap.data();

            const medal =
                rank === 1 ? "🥇" :
                rank === 2 ? "🥈" :
                rank === 3 ? "🥉" :
                "#" + rank;

            list.innerHTML += `
                <div class="leader-card">

                    <h3>${medal} ${user.name || "Anonymous"}</h3>

                    <p>⭐ Level ${user.level || 1}</p>

                    <p>🎯 ${user.totalScore || 0} Points</p>

                    <p>📚 ${user.completedTests || 0} Exams</p>

                    <p>🔥 ${user.studyStreak || 0} Day Streak</p>

                </div>
            `;

            rank++;

        });

    } catch (error) {

        console.error("Leaderboard Error:", error);

        alert(
            "Leaderboard Error\n\n" +
            error.message
        );

        list.innerHTML = `
            <div class="leader-card">

                <h3>❌ Leaderboard Error</h3>

                <p>${error.message}</p>

            </div>
        `;

    }

}

window.addEventListener("DOMContentLoaded", loadLeaderboard);
