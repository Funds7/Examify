import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

// Wait until user is logged in
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const joinBtn = document.getElementById("joinBtn");

    joinBtn.onclick = async () => {

        joinBtn.disabled = true;
        joinBtn.innerHTML = "Creating Account...";

        try {

            const userRef = doc(db, "users", user.uid);

            const snap = await getDoc(userRef);

            if (!snap.exists()) {
                alert("User account not found.");
                return;
            }

            const data = snap.data();

            // Already a marketer
            if (data.isMarketer === true) {

                window.location.href = "marketer-dashboard.html";

                return;
            }

            // Generate referral code
            const random = Math.floor(Math.random() * 9000 + 1000);

            const username =
                (data.firstName ||
                 data.displayName ||
                 user.email.split("@")[0])
                 .replace(/\s/g, "")
                 .toUpperCase();

            const referralCode =
                username + random;

            // Save marketer data
            await setDoc(userRef, {

                isMarketer: true,

                referralCode: referralCode,

                marketer: {

                    earnings: 0,

                    referrals: 0,

                    premiumSales: 0,

                    withdrawn: 0,

                    joinedAt: serverTimestamp()

                }

            }, { merge: true });

            alert("🎉 Welcome to the FundsIQ Affiliate Program!");

            window.location.href = "marketer-dashboard.html";

        }

        catch (error) {

            console.error(error);

            alert(error.message);

            joinBtn.disabled = false;

            joinBtn.innerHTML = "Become a Marketer";

        }

    };

});
