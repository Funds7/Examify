import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


const loginBtn = document.getElementById("loginBtn");


loginBtn.addEventListener("click", async()=>{


    const email = document
    .getElementById("email")
    .value
    .trim();


    const password =
    document.getElementById("password").value;



    if(!email || !password){

        alert("Please enter email and password");

        return;

    }



    try{


        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        alert("Login successful 🎉");


        window.location.href = "index.html";


    }


    catch(error){


        if(error.code === "auth/invalid-credential"){

            alert("Incorrect email or password");

        }

        else if(error.code === "auth/too-many-requests"){

            alert("Too many attempts. Try again later");

        }

        else{

            alert(error.message);

        }


    }


});
