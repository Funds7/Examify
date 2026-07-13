import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", async () => {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
        alert("Please fill all fields.");
        return;
    }

    signupBtn.disabled = true;
    signupBtn.textContent = "Creating account...";

    try {

        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        await setDoc(
            doc(db, "users", user.uid),
            {
                uid: user.uid,
                name: name,
                email: email,
                coins: 0,
                role: "student",
                completedTests: 0,
                createdAt: new Date()
            }
        );

        // Send verification email
        await sendEmailVerification(user);

        // Sign out until verification
        await auth.signOut();

        alert(
            "Account created successfully! 🎉\n\nA verification email has been sent.\nPlease verify your email before logging in."
        );

        window.location.href = "login.html";

    } catch (error) {

        signupBtn.disabled = false;
        signupBtn.textContent = "Create Account";

        switch (error.code) {

            case "auth/email-already-in-use":
                alert("This email is already registered.");
                break;

            case "auth/weak-password":
                alert("Password must be at least 6 characters.");
                break;

            case "auth/invalid-email":
                alert("Please enter a valid email address.");
                break;

            default:
                alert(error.message);

        }

    }

});
