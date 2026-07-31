import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// Auto-fill referral code from URL
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref) {
        const referralInput = document.getElementById("referralCode");
        if (referralInput) {
            referralInput.value = ref.toUpperCase();
        }
    }
});

const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", async () => {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const referralCode = document.getElementById("referralCode").value.trim().toUpperCase();

    if (!name || !email || !password) {
        alert("Please fill in all required fields.");
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
            doc(db, "users", user.uid),
            {

                uid: user.uid,

                name: name,

                email: email,

                // Starting coins
                coins: 20,

                // Student data
                role: "student",
                completedTests: 0,
                totalScore: 0,
                studyStreak: 0,

                // Referral
                referralCount: 0,
                referredBy: referralCode || "",

                createdAt: serverTimestamp()

            }
        );

        alert(
            "🎉 Account created!\n\nYou received 20 coins 🪙"
        );

        window.location.href = "login.html";

    } catch (error) {

        console.log(error);

        if (error.code === "auth/email-already-in-use") {

            alert("Email already registered.");

        } else if (error.code === "auth/weak-password") {

            alert("Password must be at least 6 characters.");

        } else {

            alert(error.message);

        }

    }

    signupBtn.disabled = false;
    signupBtn.textContent = "Create Account";

});
