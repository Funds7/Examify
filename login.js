import { auth } from "./firebase.js";

import {
signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


const loginBtn = document.getElementById("loginBtn");


loginBtn.onclick = async()=>{

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;


try{

await signInWithEmailAndPassword(
auth,
email,
password
);


alert("Login successful 🎉");

window.location.href="courses.html";


}

catch(error){

alert(error.message);

}

};
