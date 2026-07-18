import { auth, db } from "./firebase.js";

import {
    collection,
    query,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";



let allUsers = [];
let currentField = "totalScore";




// ==========================
// LOAD LEADERBOARD
// ==========================

async function loadLeaderboard(){

try{


const q = query(
    collection(db,"users"),
    orderBy(currentField, "desc"),
    limit(50)
);



const snap = await getDocs(q);



allUsers = [];



snap.forEach(doc=>{

    allUsers.push({
        id:doc.id,
        ...doc.data()
    });

});



if(allUsers.length === 0) return;



// TOP 3

showTopThree();



// PUBLIC LIST

showLeaderboard();



// PERSONAL RANK

showPersonalRank();



}
catch(error){

console.error(
"Leaderboard error:",
error
);

}

}






// ==========================
// TOP THREE
// ==========================

function showTopThree(){


const first = allUsers[0] || {};
const second = allUsers[1] || {};
const third = allUsers[2] || {};



document.getElementById("first-name").innerText =
first.name || "Anonymous";


document.getElementById("first-score").innerText =
`⭐ ${first[currentField] || 0} Points`;



document.getElementById("second-name").innerText =
second.name || "Anonymous";


document.getElementById("second-score").innerText =
`⭐ ${second[currentField] || 0} Points`;



document.getElementById("third-name").innerText =
third.name || "Anonymous";


document.getElementById("third-score").innerText =
`⭐ ${third[currentField] || 0} Points`;

}






// ==========================
// PUBLIC RANKINGS (FROM 4TH)
// ==========================

function showLeaderboard(){

const list = document.getElementById(
"leaderboard-list"
);

list.innerHTML = "";


// Remove top 3 and show only 4th onward
const remainingUsers = allUsers.slice(3);


remainingUsers.forEach((user,index)=>{


const rank = index + 4;


list.innerHTML += `

<div class="leader-card">

<h3>
${rank}th
${user.name || "Anonymous"}
</h3>


<p>
⭐ ${user[currentField] || 0} Points
</p>


</div>

`;

});


}






// ==========================
// PERSONAL RANK
// ==========================

function showPersonalRank(){


const box =
document.querySelector(
".activate-box"
);



const unlocked =
localStorage.getItem(
"leaderboardAccess"
);



const user =
auth.currentUser;



if(!user) return;



const index =
allUsers.findIndex(
u=>u.id === user.uid
);



if(unlocked === "true" && index !== -1){


box.innerHTML = `


<h2>
👤 Your Ranking
</h2>


<p>
Rank: #${index + 1}
</p>


<p>
${allUsers[index].name}
</p>


<p>
⭐ ${allUsers[index][currentField] || 0} Points
</p>


`;



}

}








// ==========================
// ACTIVATE BUTTON
// ==========================

window.activateLeaderboard=function(){


const box =
document.querySelector(
".activate-box"
);



box.innerHTML = `


<h2>
🏆 Unlock Your Ranking
</h2>


<p>
See your exact position among students.
</p>



<button onclick="unlockWithCoins()">

🪙 Use 50 Coins

</button>



<button onclick="premiumUnlock()">

💎 Premium Unlock

</button>


`;



}


window.loadCourseLeaderboard = function(course, button){

    document.querySelectorAll(".course-filter button")
        .forEach(btn => btn.classList.remove("active"));

    if(button){
        button.classList.add("active");
    }

    if(course === "overall"){
        currentField = "totalScore";
    }else{
        currentField = course + "Score";
    }

    loadLeaderboard();

};

window.addEventListener("DOMContentLoaded", () => {

    onAuthStateChanged(auth, (user) => {

        if (user) {

            const firstButton = document.querySelector(".course-filter button");

            if(firstButton){
                firstButton.classList.add("active");
            }

            loadLeaderboard();
        }

    });

});
