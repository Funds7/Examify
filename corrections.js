// ==========================================
// FundsIQ Corrections
// ==========================================

const questions =
JSON.parse(localStorage.getItem("examQuestions")) || [];

const answers =
JSON.parse(localStorage.getItem("examAnswers")) || [];

let current = 0;

// ==========================================
// SHOW QUESTION
// ==========================================

function showQuestion(index){

    if(questions.length===0){

        document.querySelector(".container").innerHTML =
        "<h2>No correction data available.</h2>";

        return;
    }

    const q = questions[index];

    // Counter
    document.getElementById("questionCounter").innerHTML =
    `${index+1} / ${questions.length}`;

    // Progress Bar
    document.getElementById("progressFill").style.width =
    `${((index+1)/questions.length)*100}%`;

    // Question
    document.getElementById("questionText").innerHTML =
    q.question;

    // Options
    const options =
    document.getElementById("optionsContainer");

    options.innerHTML="";

    q.options.forEach((option,i)=>{

        const div=document.createElement("div");

        div.className="option";

        if(i===q.answer){

            div.classList.add("correct");

        }
        else if(answers[index]===i){

            div.classList.add("wrong");

        }

        div.innerHTML=
        `<strong>${String.fromCharCode(65+i)}.</strong> ${option}`;

        options.appendChild(div);

    });

    // Show only letters
    const yourAnswer =
    answers[index]!==undefined
    ? String.fromCharCode(65+answers[index])
    : "--";

    const correctAnswer =
    String.fromCharCode(65+q.answer);

    document.getElementById("your-answer").innerHTML =
    yourAnswer;

    document.getElementById("correct-answer").innerHTML =
    correctAnswer;

    // Explanation
    document.getElementById("explanationText").innerHTML =
    q.explanation ||
    "No explanation available.";

    // Collapse explanation every new question
    document.getElementById("explanationBody").style.display="none";
    document.getElementById("arrow").innerHTML="▼";

}

// ==========================================
// NEXT
// ==========================================

function nextCorrection(){

    if(current<questions.length-1){

        current++;

        showQuestion(current);

    }

}

// ==========================================
// PREVIOUS
// ==========================================

function previousCorrection(){

    if(current>0){

        current--;

        showQuestion(current);

    }

}

// ==========================================
// TOGGLE EXPLANATION
// ==========================================

function toggleExplanation(){

    const body=
    document.getElementById("explanationBody");

    const arrow=
    document.getElementById("arrow");

    if(body.style.display==="block"){

        body.style.display="none";

        arrow.innerHTML="▼";

    }else{

        body.style.display="block";

        arrow.innerHTML="▲";

    }

}

// ==========================================

showQuestion(current);
