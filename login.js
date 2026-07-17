const loginForm = document.getElementById("loginForm");
const loginBtn = document.querySelector(".login-btn");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (!email) {
        alert("Please enter your email.");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Entering...";

    setTimeout(() => {
        window.location.href = "index.html";
    }, 500);
});
