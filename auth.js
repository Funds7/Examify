import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const signupBtn = document.getElementById("signupBtn");


signupBtn.addEventListener("click", async () => {


    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;



    if(!name || !email || !password){

        alert("Please fill in all fields.");
        return;

    }



    signupBtn.disabled = true;
    signupBtn.textContent = "Creating Account...";



    try {


        const userCredential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );


        const user = userCredential.user;



        // Create user profile
        await setDoc(
            doc(db,"users",user.uid),
            {

                uid:user.uid,

                name:name,

                email:email,


                // Starting coins 🪙
                coins:20,


                // Student data
                role:"student",
                completedTests:0,
                totalScore:0,
                studyStreak:0,


                // Rewards
                referralCount:0,


                createdAt:serverTimestamp()

            }
        );



        alert(
            "🎉 Account created!\n\nYou received 20 coins 🪙"
        );


        window.location.href="login.html";



    }catch(error){


        console.log(error);


        if(error.code==="auth/email-already-in-use"){

            alert("Email already registered.");

        }
        else if(error.code==="auth/weak-password"){

            alert("Password must be at least 6 characters.");

        }
        else{

            alert(error.message);

        }


    }


    signupBtn.disabled=false;
    signupBtn.textContent="Create Account";


});
