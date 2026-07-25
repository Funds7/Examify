/**
 * FundsIQ Affiliate & Marketer Dashboard Engine
 * Integrates directly with Cloud Firestore (Modular SDK v12)
 * Developed by Odigwe Joshua
 */

// Import Modular Firebase SDK from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =========================================================================
// 1. FIREBASE CONFIGURATION
// =========================================================================
// Insert your unique Firebase credentials inside this config block:
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID_HERE.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID_HERE",
    storageBucket: "YOUR_PROJECT_ID_HERE.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID_HERE",
    appId: "YOUR_APP_ID_HERE"
};

// Initialize Firebase securely
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =========================================================================
// 2. TIMETABLE RUNTIME SYSTEM STATE
// =========================================================================
const State = {
    user: null,
    activeTab: "overview",
    marketerData: {
        balance: 0,
        totalEarnings: 0,
        totalReferrals: 0,
        premiumReferrals: 0,
        referralCode: "FUNDS-XXXXXX",
        bankName: "",
        accountNumber: "",
        accountName: "",
        status: "Active"
    },
    activityLogs: [],       // Stores dynamic activity list items
    unsubscribes: []        // Cache snapshot unlisteners for cleanup
};

// =========================================================================
// 3. UX ALERTS (TOAST NOTIFIER ENGINE)
// =========================================================================
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-indicator"></span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Fade and destroy
    setTimeout(() => {
        toast.style.animation = "toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// =========================================================================
// 4. SECURE DATA SUBSCRIPTION (FIRESTORE SYNC)
// =========================================================================
function subscribeToMarketerData(user) {
    // Clear any existing active listeners
    State.unsubscribes.forEach(unsub => unsub());
    State.unsubscribes = [];

    const userRef = doc(db, "users", user.uid);
    toggleSkeleton(true);

    // 1. Subscribe to User Profile Document (Balance, Code, Stats)
    const unsubUser = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Map values into runtime state
            State.marketerData = {
                balance: Number(data.balance || 0),
                totalEarnings: Number(data.totalEarnings || 0),
                totalReferrals: Number(data.completedTests || 0), // maps referred counts if desired, or custom
                premiumReferrals: Number(data.premiumReferrals || 0),
                referralCode: data.referralCode || ("FUNDS-" + user.uid.substring(0, 6).toUpperCase()),
                bankName: data.bankName || "",
                accountNumber: data.accountNumber || "",
                accountName: data.accountName || "",
                status: data.isMarketer ? "Active" : "Inactive"
            };

            // Calculate mock total referrals as backup if empty
            if (State.marketerData.totalReferrals === 0 && State.marketerData.premiumReferrals > 0) {
                State.marketerData.totalReferrals = State.marketerData.premiumReferrals + 1;
            }

            syncUI();
        } else {
            // Document doesn't exist, register empty marketer profile securely
            setDoc(userRef, {
                isMarketer: true,
                balance: 0,
                totalEarnings: 0,
                completedTests: 0,
                premiumReferrals: 0,
                referralCode: "FUNDS-" + user.uid.substring(0, 6).toUpperCase()
            }, { merge: true });
        }
        toggleSkeleton(false);
    }, (error) => {
        console.error("User profile subscription error:", error);
        toggleSkeleton(false);
        loadOfflineMockData();
    });

    State.unsubscribes.push(unsubUser);

    // 2. Subscribe to Referral History Sub-collection (Activity Logs)
    const activityRef = collection(db, `users/${user.uid}/results`); // Reads logs
    const unsubActivity = onSnapshot(activityRef, (snapshot) => {
        const tempLogs = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            tempLogs.push({
                id: docSnap.id,
                ...data
            });
        });

        State.activityLogs = tempLogs;
        renderActivityLogs();
    });

    State.unsubscribes.push(unsubActivity);
}

// Seamless offline fallback with pre-populated, high-fidelity mock data
function loadOfflineMockData() {
    const key = "fundsiq_offline_marketer_mock";
    let data = localStorage.getItem(key);

    if (data) {
        const parsed = JSON.parse(data);
        State.marketerData = parsed.marketerData;
        State.activityLogs = parsed.activityLogs;
    } else {
        State.marketerData = {
            balance: 1600,
            totalEarnings: 4000,
            totalReferrals: 15,
            premiumReferrals: 10,
            referralCode: "FUNDS-JOSHUA",
            bankName: "Kuda Bank",
            accountNumber: "2013894456",
            accountName: "Odigwe Joshua",
            status: "Active"
        };
        State.activityLogs = [
            { id: "act_1", friendName: "John upgraded to Premium", value: "+₦400", date: "Today" },
            { id: "act_2", friendName: "Precious joined via Link", value: "Registered", date: "Yesterday" },
            { id: "act_3", friendName: "Samuel upgraded to Premium", value: "+₦400", date: "3 days ago" }
        ];
        saveOfflineData();
    }
    syncUI();
}

function saveOfflineData() {
    const key = "fundsiq_offline_marketer_mock";
    localStorage.setItem(key, JSON.stringify({
        marketerData: State.marketerData,
        activityLogs: State.activityLogs
    }));
}

// =========================================================================
// 5. SYNCHRONIZE UI VIEWS (RENDER COMPONENT ACTIONS)
// =========================================================================
function syncUI() {
    const data = State.marketerData;

    // Overview Tab Displays
    const overviewBal = document.getElementById("overview-balance");
    if (overviewBal) overviewBal.textContent = formatCurrency(data.balance);

    const totalEarned = document.getElementById("stat-total-earnings");
    if (totalEarned) totalEarned.textContent = formatCurrency(data.totalEarnings);

    const totalRefs = document.getElementById("stat-total-referrals");
    if (totalRefs) totalRefs.textContent = data.totalReferrals;

    const premRefs = document.getElementById("stat-premium-referrals");
    if (premRefs) premRefs.textContent = data.premiumReferrals;

    // Referral Tab Displays
    const codeDisplay = document.getElementById("referral-code-display");
    if (codeDisplay) codeDisplay.textContent = data.referralCode;

    const linkDisplay = document.getElementById("referral-link-display");
    const generatedLink = `https://fundsiq.app/r/${data.referralCode}`;
    if (linkDisplay) linkDisplay.textContent = generatedLink;

    // Withdraw Tab Displays
    const withdrawBal = document.getElementById("withdraw-balance-amount");
    if (withdrawBal) withdrawBal.textContent = formatCurrency(data.balance);

    // Form value pre-loads
    const bName = document.getElementById("draw-bank-name");
    const aNum = document.getElementById("draw-account-number");
    const aName = document.getElementById("draw-account-name");
    if (bName && data.bankName) bName.value = data.bankName;
    if (aNum && data.accountNumber) aNum.value = data.accountNumber;
    if (aName && data.accountName) aName.value = data.accountName;

    // Evaluate minimum withdrawal limits
    const submitBtn = document.getElementById("btn-execute-withdrawal");
    const warningText = document.getElementById("withdraw-restriction-sub");

    if (data.balance >= 2000) {
        if (submitBtn) submitBtn.disabled = false;
        if (warningText) {
            warningText.textContent = "Your balance is eligible for immediate cash out.";
            warningText.style.color = "var(--green)";
        }
    } else {
        if (submitBtn) submitBtn.disabled = true;
        if (warningText) {
            const needed = 2000 - data.balance;
            warningText.textContent = `You need ${formatCurrency(needed)} more to withdraw.`;
            warningText.style.color = "var(--danger)";
        }
    }

    renderActivityLogs();
}

function renderActivityLogs() {
    const listContainer = document.getElementById("activity-logs-list");
    const emptyState = document.getElementById("activity-empty-state");

    if (!listContainer || !emptyState) return;

    if (State.activityLogs.length === 0) {
        listContainer.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";
    listContainer.innerHTML = "";

    const fragment = document.createDocumentFragment();

    State.activityLogs.forEach(log => {
        const card = document.createElement("div");
        card.className = "activity-log-card fade-in";

        // Fallback value mapping if Firestore records differ
        const valText = log.value || `+₦${log.score || 400}`;
        const labelText = log.friendName || `${log.courseTitle || 'Friend'} upgraded to Premium`;
        const dateText = log.date || (log.completedAt ? new Date(log.completedAt).toLocaleDateString() : 'Today');

        card.innerHTML = `
            <div class="activity-log-details">
                <h5>${labelText}</h5>
                <p>${dateText}</p>
            </div>
            <div class="activity-log-value">${valText}</div>
        `;
        fragment.appendChild(card);
    });

    listContainer.appendChild(fragment);
}

// =========================================================================
// 6. UTILITIES (CLIPBOARD, SHARING, TOASTS)
// =========================================================================
function formatCurrency(num) {
    return "₦" + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function copyToClipboard(text, successMsg) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
            .then(() => showToast(successMsg))
            .catch(() => showToast("Permission denied to write clipboard.", "error"));
    } else {
        // Safe document-write DOM input copy fallback
        const input = document.createElement("input");
        input.value = text;
        document.body.appendChild(input);
        input.select();
        try {
            document.execCommand("copy");
            showToast(successMsg);
        } catch (e) {
            showToast("Failed to copy link. Please select manually.", "error");
        }
        document.body.removeChild(input);
    }
}

// =========================================================================
// 7. INTERACTIVE DOM EVENT BINDINGS
// =========================================================================
function initTabNavigation() {
    const tabs = document.querySelectorAll("#dashboard-tab-bar .tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const targetViewId = "view-" + tab.getAttribute("data-tab");
            document.querySelectorAll(".tab-panel").forEach(view => {
                view.classList.remove("active-view");
            });

            const targetView = document.getElementById(targetViewId);
            if (targetView) {
                targetView.classList.add("active-view");
            }
        });
    });
}

function triggerEditBankDetails() {
    // Navigate smoothly to the Withdraw tab where the details form is located
    const withdrawTabBtn = document.querySelector('[data-tab="withdraw"]');
    if (withdrawTabBtn) {
        withdrawTabBtn.click();
        const firstFormInput = document.getElementById("draw-bank-name");
        if (firstFormInput) firstFormInput.focus();
    }
}

// Expose settings triggers globally
window.triggerEditBankDetails = triggerEditBankDetails;

// =========================================================================
// 8. BOOTSTRAP EVENT BINDINGS
// =========================================================================
function toggleSkeleton(show) {
    const loader = document.getElementById("skeleton-loader");
    const viewport = document.querySelector(".tab-viewport");
    
    if (loader) loader.style.display = show ? "flex" : "none";
    if (viewport) viewport.style.opacity = show ? "0" : "1";
}

document.addEventListener("DOMContentLoaded", () => {
    initTabNavigation();
    toggleSkeleton(false);

    // 1. Observe Authentication States
    onAuthStateChanged(auth, (user) => {
        const dot = document.querySelector(".status-dot");
        const txt = document.getElementById("status-text");

        if (user) {
            State.user = user;
            if (dot) dot.className = "status-dot online";
            if (txt) txt.textContent = "Cloud Sync";
            subscribeToMarketerData(user);
        } else {
            State.user = null;
            if (dot) dot.className = "status-dot offline";
            if (txt) txt.textContent = "Sandbox Mode";
            toggleSkeleton(false);
            loadOfflineMockData();
        }
    });

    // 2. Setup Clipboard Click Listeners
    document.getElementById("btn-copy-code")?.addEventListener("click", () => {
        copyToClipboard(State.marketerData.referralCode, "Referral code copied!");
    });

    document.getElementById("btn-copy-link")?.addEventListener("click", () => {
        const link = `https://fundsiq.app/r/${State.marketerData.referralCode}`;
        copyToClipboard(link, "Referral link copied!");
    });

    // 3. WhatsApp Direct Share Message Builder
    document.getElementById("btn-whatsapp-share")?.addEventListener("click", () => {
        const inviteMessage = `Hey! Start practicing real DELSU GST CBT exams on FundsIQ and master your courses! Use my invite code *${State.marketerData.referralCode}* to get free welcome coins instantly. Sign up here: https://fundsiq.app/r/${State.marketerData.referralCode}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessage)}`;
        window.open(whatsappUrl, '_blank');
    });

    // 4. Quick Action Overview tab trigger
    document.getElementById("overview-withdraw-trigger-btn")?.addEventListener("click", () => {
        const withdrawTab = document.querySelector('[data-tab="withdraw"]');
        if (withdrawTab) withdrawTab.click();
    });

    // 5. Withdrawal Submission form handler
    const withdrawForm = document.getElementById("withdrawal-form");
    if (withdrawForm) {
        withdrawForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const bank = document.getElementById("draw-bank-name").value;
            const accountNo = document.getElementById("draw-account-number").value.trim();
            const accountName = document.getElementById("draw-account-name").value.trim();

            if (State.marketerData.balance < 2000) {
                showToast("Withdrawal failed. Minimum limit is ₦2,000.", "error");
                return;
            }

            const submitBtn = document.getElementById("btn-execute-withdrawal");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>⏳</span> Processing Payout...`;
            }

            if (State.user) {
                try {
                    const userRef = doc(db, "users", State.user.uid);
                    
                    // Log withdrawal request to withdrawals sub-collection
                    const payoutLogsRef = collection(db, `users/${State.user.uid}/withdrawals`);
                    await addDoc(payoutLogsRef, {
                        bankName: bank,
                        accountNumber: accountNo,
                        accountName: accountName,
                        amount: State.marketerData.balance,
                        status: "Processing",
                        requestedAt: serverTimestamp()
                    });

                    // Update user profile document details and reset balance
                    await updateDoc(userRef, {
                        bankName: bank,
                        accountNumber: accountNo,
                        accountName: accountName,
                        balance: 0 // Withdraw full amount
                    });

                    showToast("Payout request submitted successfully!");
                } catch (err) {
                    console.error("Withdrawal transaction failed:", err);
                    showToast("Payment processing failed. Try again.", "error");
                }
            } else {
                // Offline sandbox simulation writes
                State.marketerData.balance = 0;
                State.marketerData.bankName = bank;
                State.marketerData.accountNumber = accountNo;
                State.marketerData.accountName = accountName;
                
                State.activityLogs.unshift({
                    id: "payout_" + Date.now(),
                    friendName: "Withdrew into bank account",
                    value: "Processing",
                    date: "Today"
                });

                saveOfflineData();
                syncUI();
                showToast("Sandbox payout request simulated.");
            }

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "📝 Submit Payout Request";
            }
        });
    }
});
