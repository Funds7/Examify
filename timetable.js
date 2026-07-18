import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const saveBtn = document.getElementById("saveBtn");


if(saveBtn){

saveBtn.addEventListener("click", async()=>{

    const user = auth.currentUser;

    if(!user){
        alert("Please login first");
        return;
    }


    const timetableData = {

        courseCode: document.getElementById("courseCode").value.trim(),

        courseTitle: document.getElementById("courseTitle").value.trim(),

        lecturer: document.getElementById("lecturer").value.trim(),

        venue: document.getElementById("venue").value.trim(),

        day: document.getElementById("day").value,

        startTime: document.getElementById("startTime").value,

        endTime: document.getElementById("endTime").value,

        createdAt: serverTimestamp()

    };


    await addDoc(
        collection(db,"users",user.uid,"timetable"),
        timetableData
    );


    alert("Class added successfully ✅");


    loadTimetable();

});

}



async function loadTimetable(){

const user = auth.currentUser;

if(!user) return;


const list = document.getElementById("timetableList");

list.innerHTML="";


const snapshot = await getDocs(
collection(db,"users",user.uid,"timetable")
);


if(snapshot.empty){

list.innerHTML = `
<div class="empty">

📚 No classes added yet

</div>
`;

return;

}


snapshot.forEach((doc)=>{

const data = doc.data();

list.innerHTML += `

<div class="timetable-card">

<h3>${data.courseCode}</h3>

<p>${data.courseTitle}</p>

<p>📅 ${data.day}</p>

<p>⏰ ${data.startTime} - ${data.endTime}</p>

<p>📍 ${data.venue}</p>

<p>👨‍🏫 ${data.lecturer}</p>

</div>

`;

});

}


// ADD THIS 👇

auth.onAuthStateChanged(()=>{

    loadTimetable();

});
