// ==========================
// FUNDSIQ COIN SYSTEM
// ==========================

// Give new user 20 coins
if (localStorage.getItem("coins") === null) {
    localStorage.setItem("coins", "20");
}

// Get coins
function getCoins() {
    return Number(localStorage.getItem("coins"));
}

// Save coins
function setCoins(value) {
    localStorage.setItem("coins", value);
    updateCoinDisplay();
}

// Update dashboard
function updateCoinDisplay() {
    const coin = document.getElementById("coinBalance");

    if (coin) {
        coin.innerText = getCoins();
    }
}

// Spend coins
function spendCoins(amount) {

    let coins = getCoins();

    if (coins < amount) {
        alert(
            "❌ You don't have enough coins.\n\nWatch a rewarded ad to earn 12 coins."
        );
        return false;
    }

    coins -= amount;

    setCoins(coins);

    return true;
}

// Reward coins
function rewardCoins() {

    let coins = getCoins();

    coins += 12;

    setCoins(coins);

    alert("🎉 You earned 12 coins!");
}

// Update display when page opens
document.addEventListener("DOMContentLoaded", updateCoinDisplay);
// ==========================
// START PRACTICE
// ==========================

function startPractice() {

    if (spendCoins(10)) {
        window.location.href = "exam.html";
    }

}

// Make it available to HTML onclick
window.startPractice = startPractice;
