// ==========================================
// FundsIQ Corrections
// ==========================================

const questions =
    JSON.parse(localStorage.getItem("examQuestions")) || [];

const answers =
    JSON.parse(localStorage.getItem("examAnswers")) || [];

let current = 0;

function showQuestion(index){

    if(!questions.length){
        document.querySelector(".correction-container").innerHTML =
        "<h2>No correction data available.</h2>";
        return;
    }

    const q = questions[index];

    document.getElementById("questionCounter").innerHTML =
    `Question ${index + 1} of ${questions.length}`;

    document.getElementById("questionText").innerHTML =
    q.question;

    const optionsContainer =
    document.getElementById("optionsContainer");

    optionsContainer.innerHTML = "";

    q.options.forEach((option,i)=>{

        const div = document.createElement("div");

        div.className = "option normal";

        if(i===q.answer){

            div.className="option correct";

        }
        else if(answers[index]===i){

            div.className="option wrong";

        }

        div.innerHTML =
        `<strong>${String.fromCharCode(65+i)}.</strong> ${option}`;

        optionsContainer.appendChild(div);

    });

    document.getElementById("yourAnswer").innerHTML =
    answers[index]!==undefined ?
    q.options[answers[index]] :
    "Not Answered";

    document.getElementById("correctAnswer").innerHTML =
    q.options[q.answer];

    document.getElementById("explanationText").innerHTML =
    q.explanation ||
    "No explanation was provided for this question.";
}

function nextCorrection(){

    if(current < questions.length-1){

        current++;

        showQuestion(current);

    }

}

function previousCorrection(){

    if(current>0){

        current--;

        showQuestion(current);

    }

}

showQuestion(current);
