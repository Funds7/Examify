import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

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

    try {
    coin.innerText = await getCoins();
} catch (error) {
    console.error(error);
    }

}

// ==========================
// SPEND COINS
// ==========================

async function spendCoins(amount) {

    const user = auth.currentUser;

    if (!user) return false;

    const userRef = doc(db, "users", user.uid);

    const snap = await getDoc(userRef);

    if (!snap.exists()) {
    alert("User profile not found.");
    return false;
}

const coins = snap.data().coins ?? 20;

    if (coins < amount) {

        alert(
    "❌ Not enough coins.\n\n" +
    "Every exam attempt costs 10 Coins.\n\n" +
    "Earn more coins by:\n\n" +
    "📺 Watch Rewarded Ad (+12)\n" +
    "🎁 Daily Login (+5)\n" +
    "👥 Invite Friend (+50)\n" +
    "🔥 7-Day Study Streak (+20)"
);

        return false;

    }

    await updateDoc(userRef, {
    coins: increment(-amount)
});

await updateCoinDisplay();

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

    await updateCoinDisplay();

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

// ==========================
// LOAD COINS AFTER LOGIN
// ==========================

onAuthStateChanged(auth, (user) => {
    if (user) {
        updateCoinDisplay();
    }
});
