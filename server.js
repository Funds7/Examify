const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// ======================
// MIDDLEWARE
// ======================

app.use(cors());
app.use(express.json());


// ======================
// IN-MEMORY DATABASE
// TEMPORARY — WILL BE REPLACED
// WITH FIRESTORE LATER
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
// JWT SECRET
// ======================

const SECRET =
  process.env.JWT_SECRET || "development_secret";


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
// REGISTER
// ======================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        msg: "Name, email and password are required"
      });
    }

    const existing = users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      return res.status(400).json({
        msg: "User already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

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
    console.error("Registration error:", error);

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        msg: "Email and password are required"
      });
    }

    const user = users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return res.status(400).json({
        msg: "User not found"
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(400).json({
        msg: "Wrong password"
      });
    }

    const token = jwt.sign(
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
    console.error("Login error:", error);

    res.status(500).json({
      msg: "Login failed"
    });
  }
});


// ======================
// GET QUESTIONS
// ======================

app.get("/api/exam/questions", (req, res) => {
  res.json(questions);
});


// ======================
// SUBMIT EXAM
// ======================

app.post("/api/exam/submit", (req, res) => {
  try {
    const { userId, answers } = req.body;

    if (!userId || !answers) {
      return res.status(400).json({
        msg: "User ID and answers are required"
      });
    }

    let score = 0;

    questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        score++;
      }
    });

    const result = {
      userId,
      score,
      total: questions.length,
      date: new Date()
    };

    results.push(result);

    res.json({
      score,
      total: questions.length
    });

  } catch (error) {
    console.error("Exam submission error:", error);

    res.status(500).json({
      msg: "Exam submission failed"
    });
  }
});


// ======================
// GET RESULTS
// ======================

app.get("/api/results", (req, res) => {
  res.json(results);
});


// ======================
// SERVER START
// ======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `FundsIQ API running on port ${PORT}`
  );
});
