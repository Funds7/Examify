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

            // TOP 3
            if(rank <= 3){

                const medal =
                    rank === 1 ? "🥇 1st" :
                    rank === 2 ? "🥈 2nd" :
                    "🥉 3rd";

                list.innerHTML += `
                    <div class="leader-card top-three">

                        <h2>${medal}</h2>

                        <h3>${user.name || "Anonymous"}</h3>

                        <p>⭐ Level ${user.level ?? 1}</p>

                        <p>🎯 ${user.totalScore ?? 0} Points</p>

                        <p>📚 ${user.completedTests ?? 0} Exams</p>

                        <p>🔥 ${user.studyStreak ?? 0} Day Streak</p>

                    </div>
                `;

            }

            // PREMIUM BANNER AFTER TOP 3
            if(rank === 4){

                list.innerHTML += `

                <div class="premium-banner">

                    <h3>🔒 Premium Leaderboard</h3>

                    <p>
                        The remaining rankings are available only to
                        Premium members.
                    </p>

                    <p>
                        Don't have Premium?
                        Spend Coins to unlock your ranking.
                    </p>

                    <button onclick="location.href='premium.html'">
                        Upgrade to Premium 👑
                    </button>

                </div>

                `;

            }

            // REMAINING RANKS
            if(rank >= 4){

                let position;

                if(rank===4) position="4th";
                else if(rank===5) position="5th";
                else if(rank===6) position="6th";
                else if(rank===7) position="7th";
                else if(rank===8) position="8th";
                else if(rank===9) position="9th";
                else if(rank===10) position="10th";
                else position = rank + "th";

                list.innerHTML += `

                <div class="leader-card">

                    <h3>${position}</h3>

                    <strong>${user.name || "Anonymous"}</strong>

                    <p>⭐ Level ${user.level ?? 1}</p>

                    <p>🎯 ${user.totalScore ?? 0} Points</p>

                </div>

                `;

            }

            rank++;

        });

    } catch(error){

        console.error(error);

        list.innerHTML = `

        <div class="leader-card">

            <h3>❌ Failed to load leaderboard</h3>

            <p>${error.message}</p>

        </div>

        `;

    }

}

window.addEventListener("DOMContentLoaded", loadLeaderboard);
