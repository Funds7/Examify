/**
 * FundsIQ Dashboard Framework Script
 * Developed by Odigwe Joshua
 */
(function() {
    "use strict";

    // ==========================================
    // MODULE: TIME GREETING LOOPS
    // ==========================================
    const GreetingManager = {
        init() {
            const hour = new Date().getHours();
            let greeting = "";

            if (hour >= 5 && hour < 12) {
                greeting = "🌅 Good morning";
            } else if (hour >= 12 && hour < 17) {
                greeting = "☀️ Good afternoon";
            } else if (hour >= 17 && hour < 21) {
                greeting = "🌇 Good evening";
            } else {
                greeting = "🌙 Good night";
            }

            const element = document.getElementById("dynamic-greeting");
            if (element) {
                element.innerHTML = `${greeting}, <span style="color:#8b5cf6;">Odigwe Joshua</span>`;
            }
        }
    };

    // ==========================================
    // MODULE: SHARE FUNCTIONALITY
    // ==========================================
    const ShareManager = {
        init() {
            const shareBtn = document.getElementById("share-app-btn");
            if (!shareBtn) return;

            shareBtn.addEventListener("click", () => {
                if (navigator.share) {
                    navigator.share({
                        title: 'FundsIQ CBT',
                        text: 'Study GST courses smarter and score higher with FundsIQ CBT portal.',
                        url: window.location.origin
                    })
                    .then(() => console.log('Successful share'))
                    .catch((error) => console.log('Error sharing:', error));
                } else {
                    // Fallback to Clipboard copy action
                    try {
                        const dummyInput = document.createElement('input');
                        dummyInput.value = window.location.origin;
                        document.body.appendChild(dummyInput);
                        dummyInput.select();
                        document.execCommand('copy');
                        document.body.removeChild(dummyInput);
                        alert("FundsIQ invitation link copied to Clipboard!");
                    } catch (e) {
                        alert("Visit FundsIQ at: " + window.location.origin);
                    }
                }
            });
        }
    };

    // ==========================================
    // MODULE: UTILITY SYSTEM INITIALIZER
    // ==========================================
    const System = {
        bootstrap() {
            GreetingManager.init();
            ShareManager.init();

            // Set default active values in localStorage if they don't exist
            try {
                if (!localStorage.getItem("course")) {
                    localStorage.setItem("course", "gst101");
                }
                if (!localStorage.getItem("selectedCourse")) {
                    localStorage.setItem("selectedCourse", "gst101");
                }
            } catch (e) {
                console.warn("Cookies / local storage block detected:", e);
            }
        }
    };

    // Safe execution
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", System.bootstrap);
    } else {
        System.bootstrap();
    }
})();
