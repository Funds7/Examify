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


    const unlocked =
        localStorage.getItem("leaderboardAccess");



    if(unlocked !== "true"){

        list.innerHTML = `

        <div class="premium-banner">

            <h3>🔒 Leaderboard Locked</h3>

            <p>
                Unlock full rankings with 500 🪙 Coins.
            </p>


            <button onclick="unlockLeaderboard()">
                🪙 Unlock Leaderboard
            </button>


        </div>

        `;

        return;

    }



    list.innerHTML =
    "<p>Loading leaderboard...</p>";



    try {


        const q = query(

            collection(db, "users"),

            orderBy(
                "totalScore",
                "desc"
            ),

            limit(100)

        );



        const snap =
        await getDocs(q);



        list.innerHTML = "";



        if(snap.empty){

            list.innerHTML = `

            <p style="text-align:center;">
                No students on leaderboard yet.
            </p>

            `;

            return;

        }



        let rank = 1;



        snap.forEach((docSnap)=>{


            const user =
            docSnap.data();



            let position;


            if(rank === 1)
                position="🥇 1st";

            else if(rank === 2)
                position="🥈 2nd";

            else if(rank === 3)
                position="🥉 3rd";

            else
                position=rank+"th";



            list.innerHTML += `


            <div class="leader-card">


                <h3>
                    ${position}
                </h3>


                <strong>
                    ${user.name || "Anonymous"}
                </strong>


                <p>
                    ⭐ Level ${user.level ?? 1}
                </p>


                <p>
                    🎯 ${user.totalScore ?? 0} Points
                </p>


                <p>
                    📚 ${user.completedTests ?? 0} Exams
                </p>


                <p>
                    🔥 ${user.studyStreak ?? 0} Day Streak
                </p>


            </div>


            `;



            rank++;


        });



    }
    catch(error){


        console.error(error);



        list.innerHTML = `

        <div class="leader-card">

            <h3>
                ❌ Failed to load leaderboard
            </h3>


            <p>
                ${error.message}
            </p>


        </div>

        `;

    }


}



window.addEventListener(
"DOMContentLoaded",
loadLeaderboard
);
