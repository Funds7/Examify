const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const admin = require("firebase-admin");

const app = express();

// ======================
// MIDDLEWARE
// ======================

app.use(cors());
app.use(express.json());


// ======================
// FIREBASE ADMIN
// ======================

const serviceAccountPath =
  "/etc/secrets/firebase-service-account.json";

if (!fs.existsSync(serviceAccountPath)) {
  console.error("Firebase service account file not found");
  process.exit(1);
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();


// ======================
// CONFIGURATION
// ======================

const SECRET =
  process.env.JWT_SECRET || "development_secret";

const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY;

const PREMIUM_PRICE_NAIRA = 2000;
const PREMIUM_AMOUNT_KOBO =
  PREMIUM_PRICE_NAIRA * 100;

const FRONTEND_URL =
  "https://funds7.github.io/FundsIQ/";


// ======================
// IN-MEMORY DATABASE
// TEMPORARY CBT DATA
// ======================

let users = [];

let questions = [
  {
    question: "What is 2 + 2?",
    options: ["1", "2", "3", "4"],
    answer: 3
  },
  {
    question: "Capital of Nigeria?",
    options: ["Lagos", "Abuja", "Kano", "Ibadan"],
    answer: 1
  }
];

let results = [];


// ======================
// HEALTH CHECK
// ======================

app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "FundsIQ API",
    message: "FundsIQ backend is running"
  });
});


// ======================
// FIREBASE AUTH MIDDLEWARE
// ======================

async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader =
      req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        msg: "Authorization token required"
      });
    }

    const idToken =
      authHeader.substring(7);

    const decodedToken =
      await auth.verifyIdToken(idToken);

    req.firebaseUser = decodedToken;

    next();

  } catch (error) {
    console.error(
      "Firebase authentication error:",
      error
    );

    return res.status(401).json({
      msg: "Invalid or expired authentication token"
    });
  }
}


// ======================
// REGISTER
// ======================

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        msg:
          "Name, email and password are required"
      });
    }

    const existing = users.find(
      user =>
        user.email.toLowerCase() ===
        email.toLowerCase()
    );

    if (existing) {
      return res.status(400).json({
        msg: "User already exists"
      });
    }

    const hashed =
      await bcrypt.hash(password, 10);

    const user = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      password: hashed
    };

    users.push(user);

    res.json({
      msg: "User registered successfully"
    });

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      msg: "Registration failed"
    });
  }
});


// ======================
// LOGIN
// ======================

app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        msg:
          "Email and password are required"
      });
    }

    const user = users.find(
      user =>
        user.email.toLowerCase() ===
        email.toLowerCase()
    );

    if (!user) {
      return res.status(400).json({
        msg: "User not found"
      });
    }

    const match =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!match) {
      return res.status(400).json({
        msg: "Wrong password"
      });
    }

    const token =
      jwt.sign(
        { id: user.id },
        SECRET,
        { expiresIn: "2h" }
      );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      msg: "Login failed"
    });
  }
});


// ======================
// PREMIUM STATUS
// ======================

app.get(
  "/api/premium/status",
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const uid =
        req.firebaseUser.uid;

      const userRef =
        db.collection("users").doc(uid);

      const userSnap =
        await userRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({
          msg: "User account not found"
        });
      }

      const userData =
        userSnap.data();

      res.json({
        premium:
          userData.premium === true
      });

    } catch (error) {
      console.error(
        "Premium status error:",
        error
      );

      res.status(500).json({
        msg:
          "Unable to check Premium status"
      });
    }
  }
);


// ======================
// INITIALIZE PREMIUM PAYMENT
// ======================

app.post(
  "/api/payments/premium/initialize",
  verifyFirebaseToken,
  async (req, res) => {
    try {
      if (!PAYSTACK_SECRET_KEY) {
        return res.status(500).json({
          msg:
            "Paystack is not configured"
        });
      }

      const uid =
        req.firebaseUser.uid;

      const email =
        req.firebaseUser.email;

      if (!email) {
        return res.status(400).json({
          msg:
            "Firebase account email is required"
        });
      }

      const userRef =
        db.collection("users").doc(uid);

      const userSnap =
        await userRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({
          msg:
            "User account not found"
        });
      }

      const userData =
        userSnap.data();

      if (userData.premium === true) {
        return res.status(400).json({
          msg:
            "User is already Premium"
        });
      }

      const reference =
        `FUNDSIQ-PREMIUM-${uid}-${Date.now()}`;

      const response =
        await fetch(
          "https://api.paystack.co/transaction/initialize",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${PAYSTACK_SECRET_KEY}`,
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              email,
              amount:
                PREMIUM_AMOUNT_KOBO,
              currency: "NGN",
              reference,

              callback_url:
                "https://fundsiq-api.onrender.com/api/payments/paystack/callback",

              metadata: {
                product:
                  "FundsIQ Premium",

                uid,

                premiumPrice:
                  PREMIUM_PRICE_NAIRA
              }
            })
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.status
      ) {
        console.error(
          "Paystack initialization failed:",
          data
        );

        return res.status(500).json({
          msg:
            "Unable to initialize Paystack payment"
        });
      }

      res.json({
        status: true,

        authorization_url:
          data.data.authorization_url,

        access_code:
          data.data.access_code,

        reference:
          data.data.reference
      });

    } catch (error) {
      console.error(
        "Premium payment initialization error:",
        error
      );

      res.status(500).json({
        msg:
          "Payment initialization failed"
      });
    }
  }
);


// ======================
// VERIFY PAYSTACK PAYMENT
// ======================

async function verifyPremiumPayment(
  reference
) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error(
      "Paystack secret key is not configured"
    );
  }

  const response =
    await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

  const data =
    await response.json();

  if (
    !response.ok ||
    !data.status
  ) {
    throw new Error(
      data.message ||
      "Paystack verification failed"
    );
  }

  return data.data;
}


// ======================
// COMPLETE PREMIUM PURCHASE
// ======================

async function completePremiumPurchase(
  transaction
) {
  if (!transaction) {
    throw new Error(
      "Transaction data missing"
    );
  }

  if (
    transaction.status !==
    "success"
  ) {
    throw new Error(
      "Payment was not successful"
    );
  }

  if (
    Number(transaction.amount) !==
    PREMIUM_AMOUNT_KOBO
  ) {
    throw new Error(
      "Incorrect payment amount"
    );
  }

  if (
    transaction.currency !==
    "NGN"
  ) {
    throw new Error(
      "Incorrect payment currency"
    );
  }

  const metadata =
    transaction.metadata;

  if (
    !metadata ||
    !metadata.uid
  ) {
    throw new Error(
      "Payment user information missing"
    );
  }

  const uid =
    metadata.uid;

  const userRef =
    db.collection("users").doc(uid);

  await db.runTransaction(
    async firestoreTransaction => {

      const userSnap =
        await firestoreTransaction.get(
          userRef
        );

      if (!userSnap.exists) {
        throw new Error(
          "FundsIQ user not found"
        );
      }

      const userData =
        userSnap.data();

      // Prevent duplicate fulfillment
      if (
        userData.premium === true
      ) {
        return;
      }

      firestoreTransaction.update(
        userRef,
        {
          premium: true,

          premiumActivatedAt:
            admin.firestore
              .FieldValue
              .serverTimestamp(),

          premiumPaymentReference:
            transaction.reference,

          premiumPaymentAmount:
            transaction.amount,

          premiumPaymentCurrency:
            transaction.currency
        }
      );
    }
  );

  return {
    uid,
    reference:
      transaction.reference
  };
}


// ======================
// PAYSTACK CALLBACK
// ======================

app.get(
  "/api/payments/paystack/callback",
  async (req, res) => {

    try {
      const reference =
        req.query.reference;

      if (!reference) {
        return res.redirect(
          `${FRONTEND_URL}?payment=failed`
        );
      }

      const transaction =
        await verifyPremiumPayment(
          reference
        );

      await completePremiumPurchase(
        transaction
      );

      return res.redirect(
        `${FRONTEND_URL}?payment=success`
      );

    } catch (error) {
      console.error(
        "Paystack callback error:",
        error
      );

      return res.redirect(
        `${FRONTEND_URL}?payment=failed`
      );
    }
  }
);


// ======================
// PAYSTACK WEBHOOK
// ======================

app.post(
  "/api/payments/paystack/webhook",
  async (req, res) => {

    try {
      const signature =
        req.headers[
          "x-paystack-signature"
        ];

      if (!signature) {
        return res.sendStatus(401);
      }

      const hash =
        crypto
          .createHmac(
            "sha512",
            PAYSTACK_SECRET_KEY
          )
          .update(
            JSON.stringify(req.body)
          )
          .digest("hex");

      if (
        hash !== signature
      ) {
        return res.sendStatus(401);
      }

      const event =
        req.body;

      // Acknowledge Paystack
      res.sendStatus(200);

      if (
        event.event !==
        "charge.success"
      ) {
        return;
      }

      const transaction =
        event.data;

      if (
        transaction &&
        transaction.metadata &&
        transaction.metadata.product ===
          "FundsIQ Premium"
      ) {

        try {
          await completePremiumPurchase(
            transaction
          );

          console.log(
            "Premium activated:",
            transaction.reference
          );

        } catch (error) {
          console.error(
            "Webhook Premium fulfillment error:",
            error
          );
        }
      }

    } catch (error) {
      console.error(
        "Paystack webhook error:",
        error
      );

      if (!res.headersSent) {
        res.sendStatus(500);
      }
    }
  }
);


// ======================
// GET QUESTIONS
// ======================

app.get(
  "/api/exam/questions",
  (req, res) => {
    res.json(questions);
  }
);


// ======================
// SUBMIT EXAM
// ======================

app.post(
  "/api/exam/submit",
  (req, res) => {

    try {
      const {
        userId,
        answers
      } = req.body;

      if (
        !userId ||
        !answers
      ) {
        return res.status(400).json({
          msg:
            "User ID and answers are required"
        });
      }

      let score = 0;

      questions.forEach(
        (question, index) => {

          if (
            answers[index] ===
            question.answer
          ) {
            score++;
          }
        }
      );

      const result = {
        userId,
        score,
        total:
          questions.length,
        date:
          new Date()
      };

      results.push(result);

      res.json({
        score,
        total:
          questions.length
      });

    } catch (error) {
      console.error(
        "Exam submission error:",
        error
      );

      res.status(500).json({
        msg:
          "Exam submission failed"
      });
    }
  }
);


// ======================
// GET RESULTS
// ======================

app.get(
  "/api/results",
  (req, res) => {
    res.json(results);
  }
);


// ======================
// SERVER START
// ======================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `FundsIQ API running on port ${PORT}`
    );
  }
);
