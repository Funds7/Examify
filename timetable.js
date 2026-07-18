import { auth, db } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
serverTimestamp
} from 
"https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const saveBtn = document.getElementById("saveBtn");


saveBtn.onclick = async()=>{


const user = auth.currentUser;


if(!user){

alert("Please login first");
return;

}


const data = {

courseCode:
document.getElementById("courseCode").value,

courseTitle:
document.getElementById("courseTitle").value,

lecturer:
document.getElementById("lecturer").value,

venue:
document.getElementById("venue").value,

day:
document.getElementById("day").value,

startTime:
document.getElementById("startTime").value,

endTime:
document.getElementById("endTime").value,

createdAt:serverTimestamp()

};


await addDoc(
collection(
db,
"users",
user.uid,
"timetable"
),
data
);


alert("Class saved ✅");


loadTimetable();


};


async function loadTimetable(){


const user = auth.currentUser;

if(!user)return;


const box =
document.getElementById("timetableList");


box.innerHTML="";


const snap =
await getDocs(
collection(
db,
"users",
user.uid,
"timetable"
)
);


snap.forEach(doc=>{


const item=doc.data();


box.innerHTML += `

<div class="timetable-card">

<h3>${item.courseCode}</h3>

<p>${item.courseTitle}</p>

<p>📅 ${item.day}</p>

<p>⏰ ${item.startTime} - ${item.endTime}</p>

<p>📍 ${item.venue}</p>

<p>👨‍🏫 ${item.lecturer}</p>

</div>

`;


});


}


auth.onAuthStateChanged(()=>{

loadTimetable();

});
