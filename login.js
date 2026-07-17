import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const loginBtn = document.querySelector(".login-btn");

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        // Check email verification
        if (!user.emailVerified) {

            await signOut(auth);

            alert(
                "Please verify your email before logging in."
            );

            loginBtn.disabled = false;
            loginBtn.textContent = "Login";

            return;
        }

        // Login successful
        window.location.href = "index.html";

    } catch (error) {

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";

        switch (error.code) {

            case "auth/invalid-credential":
                alert("Incorrect email or password.");
                break;

            case "auth/user-not-found":
                alert("Account not found.");
                break;

            case "auth/wrong-password":
                alert("Incorrect password.");
                break;

            case "auth/invalid-email":
                alert("Invalid email address.");
                break;

            case "auth/network-request-failed":
                alert("Check your internet connection.");
                break;

            default:
                alert(error.message);
        }

    }

});
