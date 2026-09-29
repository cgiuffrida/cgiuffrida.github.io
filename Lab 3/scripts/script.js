const submitButton = document.querySelector("#submitButton");
const quizScores = document.querySelector("#quizScores");
const attemptCount = document.querySelector("#attemptCount");
const congratsMessage = document.querySelector("#congratsMessage");

const q1Question = document.querySelector("#q1Question");
const q2Question = document.querySelector("#q2Question");
const q3Question = document.querySelector("#q3Question");
const q4Question = document.querySelector("#q4Question");
const q5Question = document.querySelector("#q5Question");

let totalAttempts = Number(localStorage.getItem("totalAttempts"));
attemptCount.textContent = totalAttempts;

shuffleQ1();

submitButton.addEventListener("click", gradeQuiz);

function shuffleQ1() {
    let q1Choices = ["select", "option", "dropdown", "menu"];
    q1Choices = shuffleArray(q1Choices);

    for (let i of q1Choices) {
        const inputElement = document.createElement("input");
        inputElement.type = "radio";
        inputElement.name = "q1";
        inputElement.value = i;

        const labelElement = document.createElement("label");

        labelElement.textContent = " " + i;
        labelElement.prepend(inputElement)
        document.querySelector("#q1Choices").append(labelElement);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showFeedback(questionNumber, isCorrect) {
    const feedback = document.querySelector("#q" + questionNumber + "Feedback");

    const feedbackImage = document.createElement("img");

    if (isCorrect) {
        feedback.textContent = " Correct!";
        feedbackImage.src = "images/correct.png";
        feedbackImage.alt = "Correct";
    } else {
        feedback.textContent = " Incorrect";
        feedbackImage.src = "images/incorrect.png";
        feedbackImage.alt = "Incorrect";
    }

    feedbackImage.width = 24;
    feedbackImage.height = 24;

    feedback.prepend(feedbackImage);
}

function gradeQuiz() {
    let points = 0

    // Q1

    const q1Answer = "select";
    const selectedQ1Ans = document.querySelector("input[name='q1']:checked");

    const userAnswerQ1 = selectedQ1Ans?.value;
    const q1Correct = q1Answer === userAnswerQ1;

    if (q1Correct) {
        q1Question.style.color = "green";
        points++;
    } else {
        q1Question.style.color = "red";
    }

    showFeedback(1, q1Correct);

    // Q2

    const q2Answers = ["michael jackson", "mj"];
    const userAnswerQ2 = document.querySelector("#q2").value.trim().toLowerCase();

    const q2Correct = q2Answers.includes(userAnswerQ2);

    if (q2Correct) {
        q2Question.style.color = "green";
        points++;
    }
    else {
        q2Question.style.color = "red";
    }
    showFeedback(2, q2Correct);

    // Q3

    const q3Answer = "1982";
    const userAnswerQ3 = document.querySelector("#q3").value;

    const q3Correct = q3Answer === userAnswerQ3;

    if (q3Correct) {
        q3Question.style.color = "green";
        points++;
    }
    else {
        q3Question.style.color = "red";
    }
    showFeedback(3, q3Correct);

    // Q4

    const q4Answer = 6;
    const userAnswerQ4 = Number(document.querySelector("#q4").value);

    const q4Correct = q4Answer === userAnswerQ4;

    if (q4Correct) {
        q4Question.style.color = "green";
        points++;
    }
    else {
        q4Question.style.color = "red";
    }
    showFeedback(4, q4Correct);

    // Q5

    const q5Header = document.querySelector("#q5Header");
    const q5Nav = document.querySelector("#q5Nav");
    const q5Main = document.querySelector("#q5Main");
    const q5Div = document.querySelector("#q5Div");

    const q5Correct = q5Header.checked && q5Nav.checked && q5Main.checked && !q5Div.checked;

    if (q5Correct) {
        q5Question.style.color = "green";
        points++;
    } else {
        q5Question.style.color = "red";
    }

    showFeedback(5, q5Correct);

    const finalScore = points * 20;
    quizScores.textContent = `Score: ${finalScore} out of 100`;

    totalAttempts++;

    localStorage.setItem("totalAttempts", totalAttempts);
    attemptCount.textContent = totalAttempts;

    if (finalScore > 80) {
        congratsMessage.textContent = "Congratulations! You got a perfect score!";
    }
    else {
        congratsMessage.textContent = "";
    }
}
