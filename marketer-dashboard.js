import { auth, db } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ----------------------------
// AUTH
// ----------------------------

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    try {

        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
            alert("User account not found.");
            return;
        }

        const data = snap.data();

        if (!data.isMarketer) {
            alert("Join the marketer program first.");
            window.location.href = "marketer.html";
            return;
        }

        const marketer = data.marketer || {};

        // ----------------------------
        // DISPLAY DATA
        // ----------------------------

        document.getElementById("balance").innerText =
            "₦" + (marketer.balance || 0);

        document.getElementById("earnings").innerText =
            "₦" + (marketer.earnings || 0);

        document.getElementById("referrals").innerText =
            marketer.referrals || 0;

        document.getElementById("sales").innerText =
            marketer.premiumSales || 0;

        document.getElementById("withdrawn").innerText =
            "₦" + (marketer.withdrawn || 0);

        document.getElementById("referralCode").innerText =
            data.referralCode || "N/A";

        // ----------------------------
        // REFERRAL LINK
        // ----------------------------

        const referralLink =
            `${window.location.origin}/signup.html?ref=${data.referralCode}`;

        document.getElementById("referralLink").innerText =
            referralLink;

        // ----------------------------
        // COPY CODE
        // ----------------------------

        document.getElementById("copyCodeBtn").onclick = async () => {

            await navigator.clipboard.writeText(data.referralCode);

            alert("Referral code copied!");

        };

        // ----------------------------
        // COPY LINK
        // ----------------------------

        document.getElementById("copyLinkBtn").onclick = async () => {

            await navigator.clipboard.writeText(referralLink);

            alert("Referral link copied!");

        };

        // ----------------------------
        // SHARE WHATSAPP
        // ----------------------------

        document.getElementById("shareBtn").onclick = () => {

            const text =
`🎓 Prepare for your GST exams with FundsIQ!

Use my referral link to join:

${referralLink}`;

            window.open(
                `https://wa.me/?text=${encodeURIComponent(text)}`,
                "_blank"
            );

        };

        // ----------------------------
        // WITHDRAW
        // ----------------------------

        document.getElementById("withdrawBtn").onclick = () => {

            if ((marketer.balance || 0) < 2000) {

                alert("Minimum withdrawal is ₦2,000.");

                return;
            }

            alert("Withdrawal feature coming soon.");

        };

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

});
