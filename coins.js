// ==========================
// FUNDSIQ COIN SYSTEM
// ==========================

// Give every new user 20 coins
if (localStorage.getItem("coins") === null) {
    localStorage.setItem("coins", "20");
}

// Get coins
function getCoins() {
    return Number(localStorage.getItem("coins")) || 0;
}

// Save coins
function setCoins(value) {
    localStorage.setItem("coins", value);
    updateCoinDisplay();
}

// Update dashboard coin display
function updateCoinDisplay() {

    const coin = document.getElementById("coinBalance");

    if (coin) {
        coin.textContent = getCoins();
    }

}

// Spend coins
function spendCoins(amount) {

    let coins = getCoins();

    if (coins < amount) {

        alert("❌ You don't have enough coins.\n\nWatch a rewarded ad to earn 12 coins.");

        return false;

    }

    coins -= amount;

    setCoins(coins);

    return true;

}

// Reward user
function rewardCoins() {

    let coins = getCoins();

    coins += 12;

    setCoins(coins);

    alert("🎉 You earned 12 coins!");

}

// Start Practice
function startPractice() {

    if (spendCoins(10)) {

        window.location.href = "exam.html";

    }

}

// Show coins when page loads
document.addEventListener("DOMContentLoaded", () => {
    updateCoinDisplay();
});

// Make functions available everywhere
window.getCoins = getCoins;
window.setCoins = setCoins;
window.updateCoinDisplay = updateCoinDisplay;
window.spendCoins = spendCoins;
window.rewardCoins = rewardCoins;
window.startPractice = startPractice;
