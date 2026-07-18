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

async function getCoins(){

    const user = auth.currentUser;

    if(!user) return 0;


    const userRef = doc(
        db,
        "users",
        user.uid
    );


    const snap = await getDoc(userRef);


    if(!snap.exists()) return 0;


    return snap.data().coins ?? 0;

}




// ==========================
// UPDATE COIN DISPLAY
// ==========================

async function updateCoinDisplay(){

    const coin =
    document.getElementById("coinBalance");


    if(!coin) return;


    const balance =
    await getCoins();


    coin.innerText = balance;

}




// ==========================
// SPEND COINS
// ==========================

async function spendCoins(
    amount,
    reason="Purchase"
){


    const user = auth.currentUser;


    if(!user){

        alert("Please login first.");

        return false;

    }



    const userRef =
    doc(
        db,
        "users",
        user.uid
    );



    const snap =
    await getDoc(userRef);



    if(!snap.exists()){

        alert("User profile not found.");

        return false;

    }



    const currentCoins =
    snap.data().coins ?? 0;



    if(currentCoins < amount){

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
    reason="Reward"
){


    const user =
    auth.currentUser;


    if(!user) return false;



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
// LEADERBOARD UNLOCK
// ==========================

async function unlockWithCoins(){


    const paid =
    await spendCoins(
        50,
        "Leaderboard Access"
    );



    if(paid){


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

function premiumUnlock(){


    alert(
        "💎 Premium Leaderboard coming soon"
    );

}





// ==========================
// LOGIN CHECK
// ==========================

onAuthStateChanged(
auth,
(user)=>{

    if(user){

        updateCoinDisplay();

    }

});





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
