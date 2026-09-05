document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // FUNDSIQ PREMIUM BUTTON
  // ==========================================

  const upgradeBtn = document.getElementById("upgradeBtn");

  if (upgradeBtn) {

    upgradeBtn.addEventListener("click", () => {

      alert(
        "💎 FundsIQ Premium\n\n" +
        "Premium upgrade: ₦2,000\n\n" +
        "Payment system coming soon."
      );

    });

  }


  // ==========================================
  // SHARE FUNDSIQ
  // ==========================================

  const shareBtn = document.getElementById("share-app-btn");

  if (shareBtn) {

    shareBtn.addEventListener("click", async () => {

      const shareData = {
        title: "FundsIQ",
        text: "Study, practice CBTs and improve your performance with FundsIQ.",
        url: window.location.origin + "/FundsIQ/"
      };


      // Use Android/browser sharing when available
      if (navigator.share) {

        try {

          await navigator.share(shareData);

        } catch (error) {

          // User cancelled sharing.
          // No action needed.
          console.log("Share cancelled.");

        }

      } else {

        // Fallback for browsers without Web Share API

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

    });

  }

});
