import { db } from "./firebase.js";

import {
collection,
query,
orderBy,
limit,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";



async function loadLeaderboard(){


const q=query(

collection(db,"users"),

orderBy("totalScore","desc"),

limit(100)

);



const snap=await getDocs(q);



let users=[];


snap.forEach(doc=>{

users.push(doc.data());

});




if(users.length===0)return;



// TOP 3


let first=users[0];
let second=users[1];
let third=users[2];



document.getElementById("first-name").innerText=
first?.name || "Anonymous";

document.getElementById("first-score").innerText=
`⭐ ${first?.totalScore || 0} Points`;



document.getElementById("second-name").innerText=
second?.name || "Anonymous";

document.getElementById("second-score").innerText=
`⭐ ${second?.totalScore || 0} Points`;



document.getElementById("third-name").innerText=
third?.name || "Anonymous";

document.getElementById("third-score").innerText=
`⭐ ${third?.totalScore || 0} Points`;





// CHECK UNLOCK


let unlocked=
localStorage.getItem("leaderboardAccess");



const list=
document.getElementById("leaderboard-list");



const unlock=
document.getElementById("unlock-area");



if(unlocked !== "true"){


unlock.style.display="block";

list.innerHTML="";

return;

}


unlock.style.display="none";





// SHOW 4-100


list.innerHTML="";



for(let i=3;i<users.length;i++){


let user=users[i];


list.innerHTML+=`

<div class="leader-card">

<h3>
${i+1}. ${user.name || "Anonymous"}
</h3>

<p>
⭐ ${user.totalScore || 0} Points
</p>

</div>

`;

}


}



window.addEventListener(
"DOMContentLoaded",
loadLeaderboard
);
