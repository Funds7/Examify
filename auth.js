import { auth, db } from "./firebase.js";

import {
createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
doc,
setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const signupBtn = document.getElementById("signupBtn");


signupBtn.addEventListener("click", async()=>{

const name = document.getElementById("name").value.trim();
const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value;


if(!name || !email || !password){
    alert("Please fill all fields");
    return;
}


try {

const userCredential = await createUserWithEmailAndPassword(
auth,
email,
password
);


const user = userCredential.user;


// Save profile in Firestore

await setDoc(
doc(db,"users",user.uid),
{
uid:user.uid,
name:name,
email:email,
coins:0,
role:"student",
completedTests:0,
createdAt:new Date()
}
);


alert("Account created successfully 🎉");


window.location.href="index.html";


}

catch(error){

if(error.code==="auth/email-already-in-use"){
alert("Email already registered");
}

else if(error.code==="auth/weak-password"){
alert("Password must be at least 6 characters");
}

else{
alert(error.message);
}

}

});
