let params = new URLSearchParams(window.location.search);
let course = params.get("course");
let chapter = params.get("chapter");

let db = getDB();

// filter by course (and chapter if exists)
let questions = db.questions.filter(q => {
  return q.course === course &&
    (!chapter || q.chapter === chapter);
});

// shuffle (PRO CBT behavior)
questions = questions.sort(() => Math.random() - 0.5);

let index = 0;
let score = 0;

function loadQuestion() {
  let q = questions[index];

  document.getElementById("q").innerText =
    `Q${index + 1}: ${q.q}`;

  let html = "";

  q.options.forEach((opt, i) => {
    html += `<button onclick="answer(${i})">${opt}</button><br><br>`;
  });

  document.getElementById("options").innerHTML = html;

  document.getElementById("progress").innerText =
    `${index + 1} / ${questions.length}`;
}

function answer(i) {
  if (i === questions[index].answer) {
    score++;
  }

  next();
}

function next() {
  index++;

  if (index >= questions.length) {
    finish();
  } else {
    loadQuestion();
  }
}

function finish() {
  localStorage.setItem("score", score);
  localStorage.setItem("total", questions.length);

  window.location.href = "result.html";
}

loadQuestion();
