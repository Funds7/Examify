const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// ======================
// IN-MEMORY DATABASE (for now)
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
const SECRET = "cbt_secret_key";

// ======================
// REGISTER
// ======================
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  const existing = users.find(u => u.email === email);
  if (existing) return res.status(400).json({ msg: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now().toString(),
    name,
    email,
    password: hashed
  };

  users.push(user);

  res.json({ msg: "User registered successfully" });
});

// ======================
// LOGIN
// ======================
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ msg: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: "Wrong password" });

  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "2h" });

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
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
  const { userId, answers } = req.body;

  let score = 0;

  questions.forEach((q, i) => {
    if (answers[i] === q.answer) {
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

  res.json({ score, total: questions.length });
});

// ======================
// GET RESULTS (optional admin view)
// ======================
app.get("/api/results", (req, res) => {
  res.json(results);
});

// ======================
// SERVER START
// ======================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`CBT Server running on port ${PORT}`);
});
