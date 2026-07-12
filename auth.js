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

const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;


try {

const userCredential =
await createUserWithEmailAndPassword(
auth,
email,
password
);


const user = userCredential.user;


// Save user profile

await setDoc(
doc(db,"users",user.uid),
{
name:name,
email:email,
coins:0,
role:"student",
createdAt:new Date()
}
);


alert("Account created successfully 🎉");

window.location.href="index.html";


}

catch(error){

alert(error.message);

}

});
