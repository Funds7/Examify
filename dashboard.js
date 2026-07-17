import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

console.log("Dashboard.js connected");

/**
 * FundsIQ Dashboard
 * Developed by Odigwe Joshua
 */

// ==========================================
// TIME GREETING
// ==========================================

function getGreeting() {

    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return "🌅 Good morning";
    }

    else if (hour >= 12 && hour < 17) {
        return "☀️ Good afternoon";
    }

    else if (hour >= 17 && hour < 21) {
        return "🌇 Good evening";
    }

    else {
        return "🌙 Good night";
    }

}

// ==========================================
// LOAD USER FROM FIREBASE
// ==========================================

function loadUser() {

    onAuthStateChanged(auth, async (user) => {

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        try {

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {

                const data = userSnap.data();

                // Greeting
                const greeting = document.getElementById("dynamic-greeting");

                if (greeting) {
                    greeting.innerHTML = `
                        ${getGreeting()},
                        <span style="color:#8b5cf6;">
                            ${data.name}
                        </span> 👋
                    `;
                }

                // Coins
                const coin = document.getElementById("coinBalance");

                if (coin) {
                    coin.innerText = data.coins ?? 20;
                }

            } else {

                alert("User profile not found.");

            }

        } catch (error) {

            console.error(error);

        }

    });

}

// ==========================================
// SHARE APP
// ==========================================

function setupShare() {

    const shareBtn = document.getElementById("share-app-btn");

    if (!shareBtn) return;

    shareBtn.addEventListener("click", async () => {

        if (navigator.share) {

            try {

                await navigator.share({
                    title: "FundsIQ CBT",
                    text: "Study GST courses smarter with FundsIQ",
                    url: window.location.origin
                });

            }

            catch (error) {
                console.log(error);
            }

        }

        else {

            alert("FundsIQ link: " + window.location.origin);

        }

    });

}

// ==========================================
// LOCAL STORAGE
// ==========================================

function setupStorage() {

    try {

        if (!localStorage.getItem("course")) {
            localStorage.setItem("course", "gst101");
        }

        if (!localStorage.getItem("selectedCourse")) {
            localStorage.setItem("selectedCourse", "gst101");
        }

    }

    catch (error) {

        console.warn(error);

    }

}

// ==========================================
// START APP
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadUser();

    setupShare();

    setupStorage();
    
});
