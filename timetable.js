import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const saveBtn = document.getElementById("saveBtn");
let editingId = null;


if(saveBtn){

saveBtn.addEventListener("click", async()=>{


    const user = auth.currentUser;


    if(!user){

        alert("Please login first");

        return;

    }



    const timetableData = {


        courseCode:
        document.getElementById("courseCode").value.trim(),


        courseTitle:
        document.getElementById("courseTitle").value.trim(),


        lecturer:
        document.getElementById("lecturer").value.trim(),


        venue:
        document.getElementById("venue").value.trim(),


        day:
        document.getElementById("day").value,


        startTime:
        document.getElementById("startTime").value,


        endTime:
        document.getElementById("endTime").value,


        createdAt: serverTimestamp()

    };



    if(editingId){

    await updateDoc(
        doc(db,"users",user.uid,"timetable",editingId),
        timetableData
    );

    alert("Class updated successfully ✅");

    editingId = null;

    saveBtn.textContent = "Save Class";

}else{

    await addDoc(
        collection(db,"users",user.uid,"timetable"),
        timetableData
    );

    alert("Class added successfully ✅");

}

loadTimetable();


});

}





async function loadTimetable(){


const user = auth.currentUser;


if(!user) return;



const list = document.getElementById("timetableList");


if(!list) return;



list.innerHTML = "";



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




snapshot.forEach((docSnap)=>{


const data = docSnap.data();


const id = docSnap.id;



list.innerHTML += `


<div class="timetable-card">


<h3>${data.courseCode}</h3>


<p>${data.courseTitle}</p>


<p>📅 ${data.day}</p>


<p>⏰ ${data.startTime} - ${data.endTime}</p>


<p>📍 ${data.venue}</p>


<p>👨‍🏫 ${data.lecturer}</p>



<button onclick="editTimetable('${id}')">

✏️ Edit

</button>



<button onclick="deleteTimetable('${id}')">

🗑️ Delete

</button>



</div>


`;



});


}

// DELETE FUNCTION
window.deleteTimetable = async function(id){

    const user = auth.currentUser;

    if(!user) return;

    await deleteDoc(
        doc(db,"users",user.uid,"timetable",id)
    );

    alert("Class deleted 🗑️");

    loadTimetable();

};

// EDIT FUNCTION
window.editTimetable = async function(id){

    const user = auth.currentUser;

    if(!user) return;

    const snapshot = await getDocs(
        collection(db,"users",user.uid,"timetable")
    );

    snapshot.forEach((docSnap)=>{

        if(docSnap.id === id){

            const data = docSnap.data();

            document.getElementById("courseCode").value = data.courseCode;
            document.getElementById("courseTitle").value = data.courseTitle;
            document.getElementById("lecturer").value = data.lecturer;
            document.getElementById("venue").value = data.venue;
            document.getElementById("day").value = data.day;
            document.getElementById("startTime").value = data.startTime;
            document.getElementById("endTime").value = data.endTime;

            editingId = id;
            saveBtn.textContent = "Update Class ✏️";

        }

    });

};


// LOAD AFTER LOGIN
auth.onAuthStateChanged(()=>{

    loadTimetable();

});
