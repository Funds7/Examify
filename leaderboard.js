import { db } from "./firebase.js";

import {
    collection,
    query,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";



async function loadLeaderboard() {

    try {

        const q = query(
            collection(db, "users"),
            orderBy("totalScore", "desc"),
            limit(100)
        );


        const snap = await getDocs(q);


        const users = [];


        snap.forEach((doc) => {

            users.push(doc.data());

        });



        if(users.length === 0){

            console.log("No users found");

            return;

        }



        // ==========================
        // TOP 3 PODIUM
        // ==========================


        const first = users[0] || {};
        const second = users[1] || {};
        const third = users[2] || {};



        document.getElementById("first-name").innerText =
        first.name || "Anonymous";


        document.getElementById("first-score").innerText =
        `⭐ ${first.totalScore ?? 0} Points`;



        document.getElementById("second-name").innerText =
        second.name || "Anonymous";


        document.getElementById("second-score").innerText =
        `⭐ ${second.totalScore ?? 0} Points`;



        document.getElementById("third-name").innerText =
        third.name || "Anonymous";


        document.getElementById("third-score").innerText =
        `⭐ ${third.totalScore ?? 0} Points`;




        // ==========================
        // RANKINGS 4 - 100
        // ==========================


        const list =
        document.getElementById("leaderboard-list");



        if(!list) return;



        list.innerHTML = "";



        for(let i = 3; i < users.length; i++){


            const user = users[i];


            const rank = i + 1;



            list.innerHTML += `

            <div class="leader-card">


                <h3>
                    ${rank}th
                    ${user.name || "Anonymous"}
                </h3>


                <p>
                    ⭐ ${user.totalScore ?? 0} Points
                </p>


                <p>
                    📚 ${user.completedTests ?? 0} Exams
                </p>


                <p>
                    🔥 ${user.studyStreak ?? 0} Day Streak
                </p>


            </div>

            `;


        }



    }
    catch(error){

        console.error(
            "Leaderboard error:",
            error
        );

    }

}



window.addEventListener(
"DOMContentLoaded",
loadLeaderboard
);
