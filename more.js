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
// GET USER DATA
// ==========================

async function getUserData() {

    const user = auth.currentUser;

    if (!user) return null;

    const userRef = doc(
        db,
        "users",
        user.uid
    );

    const snap = await getDoc(userRef);

    if (!snap.exists()) {
        return null;
    }

    return snap.data();
}


// ==========================
// CHECK PREMIUM STATUS
// ==========================

async function isPremiumUser() {

    const userData =
        await getUserData();

    return userData?.premium === true;
}


// ==========================
// GET USER COINS
// ==========================

async function getCoins() {

    const userData =
        await getUserData();

    if (!userData) return 0;

    return userData.coins ?? 0;
}


// ==========================
// UPDATE COIN DISPLAY
// ==========================

async function updateCoinDisplay() {

    const coin =
        document.getElementById(
            "coinBalance"
        );

    if (!coin) return;

    const balance =
        await getCoins();

    coin.innerText = balance;
}


// ==========================
// UPDATE PREMIUM DISPLAY
// ==========================

async function updatePremiumDisplay() {

    const premium =
        await isPremiumUser();

    // Optional Premium status element
    const status =
        document.getElementById(
            "premiumStatus"
        );

    if (status) {

        if (premium) {

            status.innerText =
                "💎 Premium Active";

            status.classList.add(
                "premium-active"
            );

        } else {

            status.innerText =
                "Free Account";

            status.classList.remove(
                "premium-active"
            );

        }

    }


    // Add a class to the page
    // so CSS/features can detect Premium
    document.body.classList.toggle(
        "is-premium",
        premium
    );

}


// ==========================
// SPEND COINS
// ==========================

async function spendCoins(
    amount,
    reason = "Purchase"
) {

    const user =
        auth.currentUser;

    if (!user) {

        alert(
            "Please login first."
        );

        return false;
    }


    // Premium users don't need to
    // spend coins for coin-gated features
    const premium =
        await isPremiumUser();

    if (premium) {

        return true;

    }


    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    const snap =
        await getDoc(userRef);


    if (!snap.exists()) {

        alert(
            "User profile not found."
        );

        return false;
    }


    const currentCoins =
        snap.data().coins ?? 0;


    if (currentCoins < amount) {

        alert(

`❌ Not enough coins 🪙

Need: ${amount} coins

Your balance:
${currentCoins} 🪙`

        );

        return false;
    }


    await updateDoc(
        userRef,
        {
            coins:
                increment(-amount)
        }
    );


    await updateCoinDisplay();

    return true;
}


// ==========================
// ADD COINS
// ==========================

async function rewardCoins(
    amount,
    reason = "Reward"
) {

    const user =
        auth.currentUser;

    if (!user) return false;


    // Premium users can still receive
    // legitimate coin rewards.
    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    await updateDoc(
        userRef,
        {
            coins:
                increment(amount)
        }
    );


    await updateCoinDisplay();


    alert(
`🎉 +${amount} Coins

${reason}`
    );


    return true;
}


// ==========================
// CBT PRACTICE
// ==========================

async function startPractice() {

    const premium =
        await isPremiumUser();


    // Premium users get direct access
    if (premium) {

        window.location.href =
            "exam.html";

        return;
    }


    // Free users pay 10 coins
    const paid =
        await spendCoins(
            10,
            "GST CBT Practice"
        );


    if (paid) {

        window.location.href =
            "exam.html";

    }
}


// ==========================
// LEADERBOARD UNLOCK
// ==========================

async function unlockWithCoins() {

    const premium =
        await isPremiumUser();


    // Premium users don't need to
    // purchase leaderboard access
    if (premium) {

        localStorage.setItem(
            "leaderboardAccess",
            "true"
        );


        alert(
            "💎 Premium Leaderboard Access Activated!"
        );


        location.reload();

        return;
    }


    // Free users need 50 coins
    const paid =
        await spendCoins(
            50,
            "Leaderboard Access"
        );


    if (paid) {

        localStorage.setItem(
            "leaderboardAccess",
            "true"
        );


        alert(
            "🏆 Leaderboard Activated!"
        );


        location.reload();

    }
}


// ==========================
// PREMIUM UNLOCK
// ==========================

async function premiumUnlock() {

    const premium =
        await isPremiumUser();


    if (premium) {

        alert(
`💎 FundsIQ Premium

Premium is already active on your account.

Enjoy your Premium benefits!`
        );

        return;
    }


    // If the user isn't Premium,
    // send them to the Premium button
    const upgradeBtn =
        document.getElementById(
            "upgradeBtn"
        );


    if (upgradeBtn) {

        upgradeBtn.click();

        return;
    }


    alert(
        "💎 Upgrade to FundsIQ Premium for ₦2,000."
    );
}


// ==========================
// LOGIN CHECK
// ==========================

onAuthStateChanged(
    auth,
    async (user) => {

        if (user) {

            await updateCoinDisplay();

            await updatePremiumDisplay();

        }

    }
);


// ==========================
// GLOBAL EXPORTS
// ==========================

window.startPractice =
    startPractice;

window.rewardCoins =
    rewardCoins;

window.spendCoins =
    spendCoins;

window.updateCoinDisplay =
    updateCoinDisplay;

window.unlockWithCoins =
    unlockWithCoins;

window.premiumUnlock =
    premiumUnlock;

window.isPremiumUser =
    isPremiumUser;

window.updatePremiumDisplay =
    updatePremiumDisplay;
