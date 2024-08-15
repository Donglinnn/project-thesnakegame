const canvas = document.getElementById("myCanvas");

// getContext() return a drawing context of canvas.
// Drawing context let us can draw in the canvas.
// 2d stands for 2-dimensional
const ctx = canvas.getContext("2d");
const unit = 20;
const row = canvas.height / unit; // 320 / 20 = 16
const column = canvas.width / unit; // 320 / 20 = 16

let snake = []; // Every element in array is an object, the object stores the coordinate of snake body.
function createSnake() {
  // Initilize the snake
  // Position: upper left corner
  // Length: 4
  // Direction: right
  snake[0] = {
    x: unit * 3,
    y: 0,
  };
  snake[1] = {
    x: unit * 2,
    y: 0,
  };
  snake[2] = {
    x: unit,
    y: 0,
  };
  snake[3] = {
    x: 0,
    y: 0,
  };
}

// Set fruit, which enlarges the snake.
class Fruit {
  // Generate new fruit on the random place (but in multiple of unit, ensure that the snake can eat).
  constructor() {
    this.x = Math.floor(Math.random() * column) * unit;
    this.y = Math.floor(Math.random() * row) * unit;
  }

  // Draw the fruit with yellow color
  drawFruit() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, unit, unit);
  }

  // Generate the new location of fruit
  pickNewLoc() {
    let isOverlap = false;
    let new_x;
    let new_y;
    function checkOverlap(new_x, new_y) {
      for (let i = 0; i < snake.length; i++) {
        if (new_x == snake[i].x && new_y == snake[i].y) {
          isOverlap = true;
        } else {
          isOverlap = false;
        }
      }
    }

    // If the new fruit overlaps the snake, generate a new fruit.
    do {
      new_x = Math.floor(Math.random() * column) * unit;
      new_y = Math.floor(Math.random() * row) * unit;
    } while (isOverlap);

    this.x = new_x;
    this.y = new_y;
  }
}

// Initialize the game:
// 1. Show the initial score: 0.
// 2. Show the historic high score.
// 3. Create the initial snake.
// 4. Generate a fruit.
let score = 0;
document.getElementById("myScore").innerHTML = "Game Score: " + score;
let highestScore;
loadHighestScore();
document.getElementById("myScore2").innerHTML =
  "Highest Score: " + highestScore;
createSnake();
let myFruit = new Fruit();
let dir = "Right";
// Control the direction of snake
window.addEventListener("keydown", changeDirection);
// Change the direction based on the key use press down.
// Mind that snake cannot turn 180 degrees.
function changeDirection(event) {
  if (event.key == "ArrowDown" && dir != "Up") {
    dir = "Down";
  } else if (event.key == "ArrowUp" && dir != "Down") {
    dir = "Up";
  } else if (event.key == "ArrowLeft" && dir != "Right") {
    dir = "Left";
  } else if (event.key == "ArrowRight" && dir != "Left") {
    dir = "Right";
  }

  // Every time presses down the direction key, we don't accept any keydown event anymore before next time interval.
  // To avoid the unexpected 180 degrees turn that the snake hit itself and suicide accidentally.
  window.removeEventListener("keydown", changeDirection);
}

//
//
//
function draw() {
  // Check if the snake hits itself.
  for (let i = 1; i < snake.length; i++) {
    // Check if the location of head is equal to any of its body (without head)
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      clearInterval(myGame);
      alert("Game Over!");
      return;
    }
  }

  // Refresh the canvas when snake moves,
  // otherwise the position snake walked will still be filled with lightblue.
  // Method: Fill the canvas black evry time draw() is executed.
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Fruit
  myFruit.drawFruit();

  // Draw Snake
  for (let i = 0; i < snake.length; i++) {
    if (i == 0) {
      ctx.fillStyle = "lightgreen"; // Draw the head with lightgreen
    } else {
      ctx.fillStyle = "lightblue"; // Draw the snake with lightblue
    }
    ctx.strokeStyle = "white";

    // Check if the snake is out of the canvas.
    if (snake[i].x >= canvas.width) {
      // Snake towards right
      snake[i].x = 0;
    } else if (snake[i].x < 0) {
      // Snake towards left
      snake[i].x = canvas.width - unit;
    } else if (snake[i].y >= canvas.height) {
      // Snake towards down
      snake[i].y = 0;
    } else if (snake[i].y < 0) {
      // Snake towards up
      snake[i].y = canvas.height - unit;
    }

    // After determine the position of all parts of the snake,
    // fill the snake with rectangle and give stroke it with color white.
    // Arguments of fillRect(): x, y, width, height
    ctx.fillRect(snake[i].x, snake[i].y, unit, unit);
    ctx.strokeRect(snake[i].x, snake[i].y, unit, unit);
  }

  // Direction (the position of new head, i.e., new position of the unshift rectangle):
  //  Right: x += unit
  //  Left: x -= unit
  //  Up: y -= unit
  //  Down: y += unit
  let snakeHeadX = snake[0].x;
  let snakeHeadY = snake[0].y;
  switch (dir) {
    case "Right":
      snakeHeadX += unit;
      break;
    case "Left":
      snakeHeadX -= unit;
      break;
    case "Up":
      snakeHeadY -= unit;
      break;
    case "Down":
      snakeHeadY += unit;
      break;
    default:
      break;
  }

  let newHead = {
    x: snakeHeadX,
    y: snakeHeadY,
  };

  // Move snake
  // Thoughts: snake.pop() to eliminate the last rectangle,
  //           then snake.unshift() to add the position of head.
  //           If the snake eats a fruit, don't execute snake.pop(), just execute snake.unshift().
  if (snake[0].x == myFruit.x && snake[0].y == myFruit.y) {
    // Regenerate the new fruit, add score and update the highest score if needed:
    myFruit.pickNewLoc();
    score++;
    setHighestScore(score);
    document.getElementById("myScore").innerHTML = "Game Score: " + score;
    document.getElementById("myScore2").innerHTML =
      "Highest Score: " + highestScore;
    // Don't need to draw a fruit now, since the new fruit is drawn when draw() executes within 0.1s.
  } else {
    // Pop the snake
    snake.pop();
  }
  snake.unshift(newHead);

  // Because we remove the event listerner earlier,
  // add the event listener back when the next location of head determined.
  window.addEventListener("keydown", changeDirection);
}

let myGame = setInterval(draw, 100);

// Hightest score
function loadHighestScore() {
  // If there is no highestScore, i.e., the user has not played yet.
  // Set the highestScore to 0.
  if (localStorage.getItem("highestScore") == null) {
    highestScore = 0;
  } else {
    highestScore = Number(localStorage.getItem("highestScore"));
  }
}

function setHighestScore(score) {
  if (score > highestScore) {
    localStorage.setItem("highestScore", score);
    highestScore = score;
  }
}
