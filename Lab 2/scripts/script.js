console.log("Whoa");

//make a variable called answer with a value of 48
//set aside a space named answer that has 48 in it
let answer = Math.floor(Math.random() * 99) + 1;
let guesses = 0;
let triesLeft = 7;
let guessInput = document.querySelector("#guessInput");
let gamesWon = 0;
let gamesLost = 0;

const userGuesses = [];
const buttonGuess = document.getElementById('guessButton');
const buttonReset = document.getElementById('resetButton');
const loseMessage = "You lost! The answer was: ";
const totalAttemptsUsed = "Total Attempts Used: ";
const tooHigh = "Too High";
const tooLow = "Too Low";
const winMessage = "Congratulations, you guessed correctly. The answer was: ";



//look up an element with an id of guessMessage (#guessMessage)
//and bind it to a variable named guessMessage
let guessMessage = document.querySelector("#guessMessage");


//making a  function sets aside the code so you can run it later
//it's a named block of code, it starts and ends with curly braces
function showWin() {
    //equals (=) in javascript means change the value
    //change the text inside an element
    guessMessage.textContent = winMessage;

    //the style object in any element lets you change CSS stuff
    //change the color of the font to green
    guessMessage.style.color = "green";
}

//a function name with parentheses after it, 
//makes the funciton happen immediately
//showWin();


let guessButton = document.querySelector("#guessButton");
//this makes it so when you click on guess button, the function showWin happens
//guessButton.addEventListener("click", showWin);


//shorthand 
guessButton.addEventListener('click', function () {

    //this changes the variable's value so it's one less than it used to be
    if (+guessInput.value > 99) {
        guessMessage.innerText = "Please enter a number no higher than 99.";
        guessMessage.style.color = "red";
        return;
    }
    else if (+guessInput.value < 1) {
        guessMessage.innerText = "Please enter a number higher than 0.";
        guessMessage.style.color = "red";
        return;
    }
    guesses += 1;
    triesLeft -= 1; //-=, +=, /=, *=
    userGuesses.push(+guessInput.value);
    document.getElementById('remainingGuessAmount').innerText = triesLeft;
    document.getElementById('userGuessArray').innerText = userGuesses;
    //This makes it so "You won" only shows up in the console if the input you typed matches the correct answer
    if (+guessInput.value === answer) {
        //what happens if the value you typed matches the answer
        gamesWon += 1;
        document.getElementById("gamesWonAmount").innerText = gamesWon;
        guessMessage.textContent = winMessage;
        guessMessage.style.color = "green";
        document.getElementById('guessMessage').innerText = winMessage + answer; // Winning Condition
        buttonGuess.style.display = 'none';
        buttonReset.style.display = "inline-block";
        return;
    }
    else if (triesLeft <= 0) {
        gamesLost += 1;
        document.getElementById("gamesLostAmount").innerText = gamesLost;
        document.getElementById('guessMessage').innerText = loseMessage + answer; // Losing Condition
        guessMessage.style.color = "red";
        buttonGuess.style.display = 'none';
        buttonReset.style.display = "inline-block";
        return;
    }
    else if (+guessInput.value >= answer) {
        guessMessage.textContent = tooHigh;
        guessMessage.style.color = "red";
        document.getElementById('guessMessage').innerText = tooHigh;
    }
    else {
        guessMessage.textContent = tooLow;
        guessMessage.style.color = "red";
        document.getElementById('guessMessage').innerText = tooLow;
    }
}

);

buttonReset.addEventListener("click", function () { // Reset game back to default
    guesses = 0;
    triesLeft = 7;
    userGuesses.length = 0;
    answer = Math.floor(Math.random() * 99) + 1;
    document.getElementById("remainingGuessAmount").innerText = triesLeft;
    document.getElementById("userGuessArray").innerText = "";
    guessMessage.innerText = "Guess a number between 1 and 99";
    guessMessage.style.color = "";
    guessInput.value = "";
    buttonGuess.style.display = "inline-block";
    buttonReset.style.display = "none";
});





//Question operators
// == match - the left and right have to match values for the answer to be yes
// != not match - the left and right have to be different for the answer to be yes
// === strict match - the left right have to have the same value and type for the answer to be yes

//the + converts the text in the input box to a number
// we compare to the answer to see if they match
// +guessInput.value === answer


//if statement:
// if (question) {
//     if answer is yes, do this
// }
// else {
//     otherwise, do this
// }


//stacked if statement
//if (question 1) {
// if answer is yes, do this
//} else if (question 2) {
//if answer is yes, do this
//} else if (question 3) {
//if answer is yes, do this
//}