import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ==========================
// GET USER COINS
// ==========================

async function getCoins() {

    const user = auth.currentUser;

    if (!user) return 0;

    const userRef = doc(db, "users", user.uid);

    const snap = await getDoc(userRef);

    if (!snap.exists()) return 0;

    return snap.data().coins ?? 20;

}

// ==========================
// UPDATE DISPLAY
// ==========================

async function updateCoinDisplay() {

    const coin = document.getElementById("coinBalance");

    if (!coin) return;

    coin.innerText = await getCoins();

}

// ==========================
// SPEND COINS
// ==========================

async function spendCoins(amount) {

    const user = auth.currentUser;

    if (!user) return false;

    const userRef = doc(db, "users", user.uid);

    const snap = await getDoc(userRef);

    const coins = snap.data().coins ?? 20;

    if (coins < amount) {

        alert("❌ You need more coins.");

        return false;

    }

    await updateDoc(userRef, {

        coins: coins - amount

    });

    updateCoinDisplay();

    return true;

}

// ==========================
// ADD COINS
// ==========================

async function rewardCoins(amount) {

    const user = auth.currentUser;

    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {

        coins: increment(amount)

    });

    updateCoinDisplay();

    alert(`🎉 +${amount} Coins added!`);

}

// ==========================
// START PRACTICE
// ==========================

async function startPractice() {

    const ok = await spendCoins(10);

    if (ok) {

        window.location.href = "exam.html";

    }

}

// ==========================
// GLOBAL
// ==========================

window.startPractice = startPractice;
window.rewardCoins = rewardCoins;
window.updateCoinDisplay = updateCoinDisplay;

document.addEventListener("DOMContentLoaded", updateCoinDisplay);
