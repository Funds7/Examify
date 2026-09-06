document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // FUNDSIQ PREMIUM
  // ==========================================

  const upgradeBtn =
    document.getElementById("upgradeBtn");

  // Render backend
  const API_URL =
    "https://fundsiq-api.onrender.com";


  // ==========================================
  // CREATE PREMIUM POPUP
  // ==========================================

  function showPremiumPopup() {

    // Prevent duplicate popup
    if (
      document.getElementById("premiumModal")
    ) {
      return;
    }

    const modal =
      document.createElement("div");

    modal.id = "premiumModal";

    modal.innerHTML = `
      <div class="premium-modal-overlay">

        <div class="premium-modal">

          <div class="premium-modal-icon">
            💎
          </div>

          <h3>FundsIQ Premium</h3>

          <p class="premium-price">
            ₦2,000
          </p>

          <p class="premium-description">
            Unlock more features and remove ads.
          </p>

          <div class="premium-modal-buttons">

            <button
              type="button"
              class="premium-cancel-btn"
              id="premiumCancelBtn"
            >
              Cancel
            </button>

            <button
              type="button"
              class="premium-continue-btn"
              id="premiumContinueBtn"
            >
              Continue
            </button>

          </div>

        </div>

      </div>
    `;

    document.body.appendChild(modal);


    // ==========================================
    // CANCEL BUTTON
    // ==========================================

    const cancelBtn =
      document.getElementById(
        "premiumCancelBtn"
      );

    if (cancelBtn) {

      cancelBtn.addEventListener(
        "click",
        () => {
          closePremiumPopup();
        }
      );

    }


    // ==========================================
    // CONTINUE BUTTON
    // ==========================================

    const continueBtn =
      document.getElementById(
        "premiumContinueBtn"
      );

    if (continueBtn) {

      continueBtn.addEventListener(
        "click",
        startPremiumPayment
      );

    }


    // ==========================================
    // CLOSE WHEN TAPPING OUTSIDE
    // ==========================================

    const overlay =
      modal.querySelector(
        ".premium-modal-overlay"
      );

    if (overlay) {

      overlay.addEventListener(
        "click",
        (event) => {

          if (
            event.target === overlay
          ) {
            closePremiumPopup();
          }

        }
      );

    }

  }


  // ==========================================
  // CLOSE PREMIUM POPUP
  // ==========================================

  function closePremiumPopup() {

    const modal =
      document.getElementById(
        "premiumModal"
      );

    if (modal) {
      modal.remove();
    }

  }


  // ==========================================
  // WAIT FOR FIREBASE LOGIN
  // ==========================================

  async function getLoggedInUser(auth) {

    // Firebase already knows the user
    if (auth.currentUser) {
      return auth.currentUser;
    }


    // Firebase may still be restoring
    // the previous login session
    return await new Promise(
      (resolve) => {

        let finished = false;

        const unsubscribe =
          auth.onAuthStateChanged(
            (user) => {

              if (finished) {
                return;
              }

              finished = true;

              unsubscribe();

              resolve(user);

            }
          );

      }
    );

  }


  // ==========================================
  // START PREMIUM PAYMENT
  // ==========================================

  async function startPremiumPayment() {

    const continueBtn =
      document.getElementById(
        "premiumContinueBtn"
      );

    try {

      // ----------------------------------------
      // Load Firebase
      // ----------------------------------------

      const firebase =
        await import("./firebase.js");

      const auth =
        firebase.auth;


      // ----------------------------------------
      // Wait for Firebase to restore login
      // ----------------------------------------

      const user =
        await getLoggedInUser(auth);


      // ----------------------------------------
      // Check login
      // ----------------------------------------

      if (!user) {

        alert(
          "Please log in to your FundsIQ account first."
        );

        return;

      }


      // ----------------------------------------
      // Loading state
      // ----------------------------------------

      if (continueBtn) {

        continueBtn.disabled = true;

        continueBtn.textContent =
          "Connecting...";

        continueBtn.style.opacity =
          "0.7";

      }


      // ----------------------------------------
      // Get Firebase ID token
      // ----------------------------------------

      const idToken =
        await user.getIdToken(true);


      // ----------------------------------------
      // Send payment request
      // ----------------------------------------

      const response =
        await fetch(
          `${API_URL}/api/payments/premium/initialize`,
          {
            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              "Authorization":
                `Bearer ${idToken}`

            }

          }
        );


      // ----------------------------------------
      // Read backend response
      // ----------------------------------------

      const data =
        await response.json();


      // ----------------------------------------
      // Check backend response
      // ----------------------------------------

      if (
        !response.ok ||
        !data.status
      ) {

        console.error(
          "Premium payment error:",
          data
        );

        throw new Error(
          data.msg ||
          "Unable to start payment."
        );

      }


      // ----------------------------------------
      // Check Paystack URL
      // ----------------------------------------

      if (
        !data.authorization_url
      ) {

        throw new Error(
          "Paystack checkout URL was not returned."
        );

      }


      // ----------------------------------------
      // Redirect to Paystack
      // ----------------------------------------

      window.location.href =
        data.authorization_url;


    } catch (error) {

      console.error(
        "Premium payment error:",
        error
      );


      alert(
        "❌ Premium payment could not start.\n\n" +
        (
          error.message ||
          "Please try again."
        )
      );


      // Restore button

      if (continueBtn) {

        continueBtn.disabled = false;

        continueBtn.textContent =
          "Continue";

        continueBtn.style.opacity =
          "1";

      }

    }

  }


  // ==========================================
  // UPGRADE BUTTON
  // ==========================================

  if (upgradeBtn) {

    upgradeBtn.addEventListener(
      "click",
      () => {

        showPremiumPopup();

      }
    );

  }


  // ==========================================
  // PREMIUM POPUP STYLES
  // ==========================================

  const premiumStyles =
    document.createElement("style");

  premiumStyles.textContent = `

    .premium-modal-overlay {
      position: fixed;
      inset: 0;

      background:
        rgba(0, 0, 0, 0.68);

      display: flex;

      align-items: center;
      justify-content: center;

      padding: 20px;

      z-index: 99999;

      animation:
        premiumFadeIn 0.18s ease;
    }


    .premium-modal {
      width:
        min(330px, 90vw);

      background:
        #1d2433;

      border:
        1px solid
        rgba(255, 255, 255, 0.12);

      border-radius: 18px;

      padding:
        22px 20px 18px;

      text-align: center;

      box-shadow:
        0 18px 50px
        rgba(0, 0, 0, 0.55);

      animation:
        premiumPopIn 0.2s ease;
    }


    .premium-modal-icon {
      font-size: 28px;

      margin-bottom: 6px;
    }


    .premium-modal h3 {
      margin: 0;

      color: #ffffff;

      font-size: 18px;

      font-weight: 700;
    }


    .premium-price {
      margin:
        9px 0 3px;

      color: #ffffff;

      font-size: 17px;

      font-weight: 700;
    }


    .premium-description {
      margin:
        0 0 18px;

      color: #aeb8ca;

      font-size: 13px;

      line-height: 1.4;
    }


    .premium-modal-buttons {
      display: flex;

      gap: 9px;

      width: 100%;
    }


    .premium-modal-buttons button {
      flex: 1;

      border: none;

      border-radius: 10px;

      padding:
        11px 8px;

      font-size: 13px;

      font-weight: 600;

      cursor: pointer;

      transition:
        transform 0.15s ease,
        opacity 0.15s ease;
    }


    .premium-modal-buttons button:active {
      transform:
        scale(0.97);
    }


    .premium-modal-buttons button:disabled {
      cursor: wait;

      transform: none;
    }


    .premium-cancel-btn {
      background:
        #303848;

      color:
        #d9deea;
    }


    .premium-continue-btn {
      background:
        #2563eb;

      color:
        #ffffff;
    }


    .premium-modal-buttons button:hover {
      opacity: 0.9;
    }


    @keyframes premiumFadeIn {

      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }

    }


    @keyframes premiumPopIn {

      from {
        opacity: 0;

        transform:
          scale(0.94);
      }

      to {
        opacity: 1;

        transform:
          scale(1);
      }

    }

  `;

  document.head.appendChild(
    premiumStyles
  );


  // ==========================================
  // SHARE FUNDSIQ
  // ==========================================

  const shareBtn =
    document.getElementById(
      "share-app-btn"
    );

  if (shareBtn) {

    shareBtn.addEventListener(
      "click",
      async () => {

        const shareData = {

          title:
            "FundsIQ",

          text:
            "Study, practice CBTs and improve your performance with FundsIQ.",

          url:
            window.location.origin +
            "/FundsIQ/"

        };


        // Native phone sharing
        if (navigator.share) {

          try {

            await navigator.share(
              shareData
            );

          } catch (error) {

            console.log(
              "Share cancelled."
            );

          }

        } else {

          // Fallback

          try {

            await navigator.clipboard.writeText(
              shareData.url
            );

            alert(
              "🔗 FundsIQ link copied!\n\n" +
              "Share it with your friends."
            );

          } catch (error) {

            alert(
              "Share FundsIQ:\n\n" +
              shareData.url
            );

          }

        }

      }
    );

  }

});
