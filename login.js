import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

// ===============================
// Toast Notification
// ===============================

const toast = document.getElementById("toast");

function showToast(message, type = "success") {

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = "toast";
    }, 3000);

}

// ===============================
// Elements
// ===============================

const loginForm = document.getElementById("loginForm");
const loginBtn = document.querySelector(".login-btn");

// ===============================
// Login
// ===============================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    // Validate fields
    if (!email || !password) {

        showToast(
            "Please enter your email and password.",
            "warning"
        );

        return;
    }

    // Loading state
    loginBtn.disabled = true;
    loginBtn.textContent = "Signing in...";

    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        // Email verification
        if (!user.emailVerified) {

            await auth.signOut();

            loginBtn.disabled = false;
            loginBtn.textContent = "Login";

            showToast(
                "Please verify your email before logging in.",
                "warning"
            );

            return;
        }

        showToast(
            "Login successful 🎉",
            "success"
        );

        setTimeout(() => {

            window.location.href = "index.html";

        }, 1200);

    } catch (error) {

        // Restore button
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";

        switch (error.code) {

            case "auth/invalid-credential":

                showToast(
                    "Incorrect email or password.",
                    "error"
                );
                break;

            case "auth/too-many-requests":

                showToast(
                    "Too many login attempts. Try again later.",
                    "error"
                );
                break;

            case "auth/network-request-failed":

                showToast(
                    "Check your internet connection.",
                    "error"
                );
                break;

            case "auth/user-disabled":

                showToast(
                    "This account has been disabled.",
                    "error"
                );
                break;

            default:

                showToast(
                    "Something went wrong. Please try again.",
                    "error"
                );

        }

    }

});
