import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    try {

        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        if (!user.emailVerified) {
    await auth.signOut();
    alert("Please verify your email before logging in.");
    return;
        }

        alert("Login successful 🎉");

        window.location.href = "index.html";

    } catch (error) {

        switch (error.code) {

            case "auth/invalid-credential":
                alert("Incorrect email or password.");
                break;

            case "auth/too-many-requests":
                alert("Too many login attempts. Try again later.");
                break;

            case "auth/network-request-failed":
                alert("Check your internet connection.");
                break;

            default:
                alert(error.message);
        }

    }

});
