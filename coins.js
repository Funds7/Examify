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


    const userRef = doc(
        db,
        "users",
        user.uid
    );


    const snap = await getDoc(userRef);


    if (!snap.exists()) return 0;


    return snap.data().coins ?? 0;

}



// ==========================
// UPDATE COIN DISPLAY
// ==========================

async function updateCoinDisplay() {

    const coin = document.getElementById(
        "coinBalance"
    );


    if (!coin) return;


    try {

        const balance = await getCoins();

        coin.innerText = balance;

    } 
    catch(error){

        console.error(
            "Coin display error:",
            error
        );

    }

}



// ==========================
// SPEND COINS
// ==========================

async function spendCoins(
    amount,
    reason = "Exam Attempt"
){

    const user = auth.currentUser;


    if(!user){

        alert("Please login first.");

        return false;

    }



    const userRef = doc(
        db,
        "users",
        user.uid
    );



    const snap = await getDoc(userRef);



    if(!snap.exists()){

        alert(
            "User profile not found."
        );

        return false;

    }



    const currentCoins =
    snap.data().coins ?? 0;



    if(currentCoins < amount){

        alert(
`❌ Not enough coins 🪙

${reason} costs ${amount} coins.

Your balance: ${currentCoins} 🪙

Earn more:
📺 Watch Rewarded Ad +12
🎁 Daily Login +5
👥 Invite Friend +50
🔥 7-Day Study Streak +20`
        );


        return false;

    }



    await updateDoc(
        userRef,
        {

            coins: increment(-amount)

        }
    );



    await updateCoinDisplay();



    console.log(
        `${amount} coins spent for ${reason}`
    );


    return true;

}



// ==========================
// ADD COINS REWARD
// ==========================

async function rewardCoins(
    amount,
    reason = "Reward"
){


    const user = auth.currentUser;


    if(!user) return false;



    const userRef = doc(
        db,
        "users",
        user.uid
    );



    await updateDoc(
        userRef,
        {

            coins: increment(amount)

        }
    );



    await updateCoinDisplay();



    alert(
`🎉 +${amount} Coins added!

${reason}`
    );


    return true;

}



// ==========================
// EXAMPLE: CBT PRACTICE
// ==========================

async function startPractice(){


    const paid =
    await spendCoins(
        10,
        "GST CBT Practice"
    );



    if(paid){

        window.location.href =
        "exam.html";

    }

}



// ==========================
// GLOBAL FUNCTIONS
// ==========================

window.startPractice =
startPractice;


window.rewardCoins =
rewardCoins;


window.spendCoins =
spendCoins;


window.updateCoinDisplay =
updateCoinDisplay;



// ==========================
// LOAD COINS AFTER LOGIN
// ==========================

onAuthStateChanged(
auth,
(user)=>{

    if(user){

        updateCoinDisplay();

    }

});
