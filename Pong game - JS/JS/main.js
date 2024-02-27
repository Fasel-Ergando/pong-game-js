/* DOM Elements */
const gameCanvas = document.querySelector('.gameCanvas .canvas');
const ctx = gameCanvas.getContext('2d');
const playerAScoreEl = document.querySelector('.playerA');
const playerBScoreEl = document.querySelector('.playerB');
const startGameEl = document.querySelector('.startGame');
const resetGameEl = document.querySelector('.resetGame');
const settingsSVG = document.querySelector('.settingsSVG');
const settingList = document.querySelectorAll('.settingList');
const settingsContainer = document.querySelector('.settingsContainer');
const wrapper = document.querySelector('.wrapper');
const paddle1ColorEl = document.querySelector('.paddle1Color input');
const paddle2ColorEl = document.querySelector('.paddle2Color input');
const ballSpeedEl = document.querySelector('.ballSpeed input');
const highScoreEl = document.querySelector('.highScore span');
const resetHighScoreEl = document.querySelector('.highScore .resetHighScore');
const arrowImgs = document.querySelectorAll('.arrow .arrowImg');

const canvasWidth = gameCanvas.width;
const canvasHeight = gameCanvas.height;
const rootNum = 20;
const ballRadius = 13;
let gameRunning;
let ballSpeedEnabled = true;
let intervalId;
let ballX = canvasWidth / 2, ballY = canvasHeight / 2;//center of the canvas
let ballXDirection, ballYDirection;
let paddle1, paddle2;
let paddle1Color = '#90ee90', paddle2Color = '#90ee90';
let playerAScore = 0, playerBScore = 0;
let ballSpeed = 0.7;
let highScore = 0;
let popupId;

window.addEventListener('DOMContentLoaded', e => {
  if (e.target.readyState === 'interactive') {
    renderState();
  }
});

function renderState() {
  getState();
  checkCompatibility();
  //creating the rotating setting feature
  settingsSVG.addEventListener('mouseenter', e => {
    settingsSVG.classList.remove('rotateLeft');
    settingsSVG.classList.add('rotateRight');
  });
  settingsSVG.addEventListener('mouseleave', e => {
    settingsSVG.classList.remove('rotateRight');
    settingsSVG.classList.add('rotateLeft');
  });

  //displaying the settings
  settingsSVG.addEventListener('click', launchSettings);
  window.addEventListener('keydown', e => {
    if ((e.key ==='x') && e.ctrlKey && e.altKey) {
      closeSettings();
    } else if ((e.key === 'i') && e.ctrlKey && e.altKey)  {
      launchSettings();
    }
  });
  function launchSettings() {
    clearInterval(intervalId);

    settingsContainer.classList.remove('displayNone');
    wrapper.classList.add('focusRemoved');
    settingsSVG.classList.add('focusRemoved');

    document.querySelector('.closeSettings').addEventListener('click', closeSettings);
  }
  function closeSettings() {
    settingsContainer.classList.add('displayNone');
    wrapper.classList.remove('focusRemoved');
    settingsSVG.classList.remove('focusRemoved');

    if (gameRunning) startGame();
  }

  //adding the setting selection feature
  settingList.forEach(setting => {
    setting.addEventListener('click', e => {
      settingList.forEach(sL => sL.classList.remove('settingSelected'));
      setting.classList.add('settingSelected');
      
      document.querySelectorAll('.settingDetail').forEach(sD => sD.classList.add('displayNone'));
      if (setting.textContent === 'Ball Speed') {
        document.querySelector('.ballSpeed').classList.remove('displayNone');
      } else if (setting.textContent === 'Paddle Color') {
        document.querySelector('.paddleColor').classList.remove('displayNone');
      } else if (setting.textContent === 'High Score') {
        document.querySelector('.highScore').classList.remove('displayNone');
      }
    });
  });

  //extracting the values when it is being inputted
  //extracting the ball speed input
  ballSpeedEl.addEventListener('input', e => {
    ballSpeedEnabled = (ballSpeedEl.checked)? true: false;
    saveState();
  });

  //extracting the paddle color
  paddle1ColorEl.value = paddle1Color;
  paddle2ColorEl.value = paddle2Color;

  paddle1ColorEl.addEventListener('input', e => {
    paddle1Color = e.target.value;
    saveState();
  });
  paddle2ColorEl.addEventListener('input', e => {
    paddle2Color = e.target.value;
    saveState();
  });

  //reset high score functionality
  resetHighScoreEl.addEventListener('click', e => {
    clearInterval(popupId);
    highScore = 0;
    highScoreEl.textContent = highScore;
    saveState();
    document.querySelector('.infoDisplayPopup').classList.remove('displayNone');
    popupId =  setTimeout(() => {
      document.querySelector('.infoDisplayPopup').classList.add('displayNone');
    }, 2000);
  });

  window.addEventListener('resize', checkCompatibility);
  startGameEl.addEventListener('click', startGame);
  resetGameEl.classList.add('buttonDisabled');
}

function checkCompatibility() {
  if (window.innerWidth <= 350 || window.innerHeight <= 545) {
    alert('The height or the width of your device is too small to render the game. You might experience a sliced portion of the canvas.');
  }
}

function startGame () {
  gameRunning = true;

  startGameEl.removeEventListener('click', startGame);
  startGameEl.classList.add('buttonDisabled');
  resetGameEl.addEventListener('click', resetGame);
  resetGameEl.classList.remove('buttonDisabled');

  //Add functionality to the arrow Imgs
  arrowImgs.forEach(arrow => {
    arrow.addEventListener('click', e => {
      const keyName = {
        key: e.target.getAttribute('data-arrowName')
      };
      movePaddles(keyName);
    });
  });

  generateBallDirection();
  generatePaddleCoord();
  window.addEventListener('keydown', movePaddles);

  intervalId = setInterval(() => {
    if (gameRunning) {
      paintCanvas();
      renderBall();
      renderPaddle();
      moveBall();
      bounceBall();
    }
  }, 10);
}

function paintCanvas() {
  ctx.fillStyle = getComputedStyle(gameCanvas).backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}
function generateBallDirection() {
  //generate a random number that is either +1, or -1 and continuously add this number to the ballX and ballY variables
  const randomCoord = () => Math.round(Math.random());
  ballXDirection = (randomCoord() === 0)? -1: 1;
  ballYDirection = (randomCoord() === 1)? 1: -1;
  ballX = canvasWidth / 2;
  ballY = canvasHeight / 2;
  ballSpeed = 0.7;
}
function renderBall() {
  ctx.fillStyle = 'rgb(141, 141, 14)';
  ctx.beginPath();
  ctx.arc(ballX, ballY,  ballRadius, 0, 2 * Math.PI);
  ctx.fill();
}
function moveBall() {
  ballX += ballXDirection * ballSpeed;
  ballY += ballYDirection * ballSpeed;
}
function generatePaddleCoord() {
  paddle1 = {
    x: 0,
    y: 0
  };
  paddle2 = {
    x: canvasWidth - 20, 
    y: canvasHeight - 80
  }
}
function renderPaddle() {
  //render paddle 1
  ctx.fillStyle = paddle1Color;
  ctx.fillRect(paddle1.x, paddle1.y, 20, 80);

  //render paddle 2
  ctx.fillStyle = paddle2Color;
  ctx.fillRect(paddle2.x, paddle2.y, 20, 80);
}
function movePaddles(e) {
  const keyPressed = e.key;
  
  if (keyPressed === 'ArrowUp') {
    if (paddle2.y > 0) {
    paddle2.y -= 20;
    }
  } else if (keyPressed === 'ArrowDown') {
    if (paddle2.y < canvasHeight - 80) {
      paddle2.y += 20;
    }
  } else if (keyPressed === 'w'||keyPressed === 'W') {
      if (paddle1.y > 0) {
        paddle1.y -= 20;
      }
  } else if (keyPressed === 's'||keyPressed === 'S') {
    if (paddle1.y < canvasHeight - 80) {
      paddle1.y += 20;
    }
  }
}
function bounceBall() {
  //bounce if the top or bottom of the canvas are in contact with the ball
  if (ballY <= 0 + ballRadius) {
    ballYDirection *= -1;
  } else if (ballY > canvasHeight - ballRadius) {
    ballYDirection *= -1;
  }

  //Record player1's score and player2's score
  if (ballX < 0) {
    generateBallDirection();
    playerBScore++;
    highScore = (playerAScore > playerBScore)? playerAScore: playerBScore;

    highScoreEl.textContent = highScore;
    playerAScoreEl.textContent = playerAScore;
    playerBScoreEl.textContent = playerBScore;
    saveState();
  } else if (ballX > canvasWidth) {
    generateBallDirection();
    playerAScore++;
    highScore = (playerAScore > playerBScore)? playerAScore: playerBScore;

    highScoreEl.textContent = highScore;
    playerAScoreEl.textContent = playerAScore;
    playerBScoreEl.textContent = playerBScore;
    saveState();
  }

  //bounce the ball if a paddle and the ball are in contact
  if ((ballX <= 20 + ballRadius) && (ballX >= paddle1.x)) {
    if ((ballY >= paddle1.y) && (ballY <= (80 + paddle1.y))) {
      ballX = paddle1.x + ballRadius + 20;
      ballXDirection *= -1;
      if (ballSpeedEnabled) ballSpeed+=0.5;
    }
  } else if ((ballX >= (canvasWidth - 20) - ballRadius) && (ballX <= paddle2.x)) {
    if ((ballY >= paddle2.y) && (ballY <= paddle2.y + 80)) {
      ballX = paddle2.x - ballRadius;
      ballXDirection *= -1;
      if (ballSpeedEnabled) ballSpeed+=0.5;
    }
  }
}
function saveState() {
  const gameState = {
    paddle1Color,
    paddle2Color, 
    highScore,
    ballSpeedEnabled
   }
   
  const JSONData = JSON.stringify(gameState);
  localStorage.setItem('pongGameData', JSONData);
}

function getState() {
  const savedData = JSON.parse(localStorage.getItem('pongGameData'))||{paddle1Color, paddle2Color, highScore, ballSpeedEnabled: true};
  savedData.ballSpeedEnabled = savedData.ballSpeedEnabled == true? true: false;
  
  paddle1Color = savedData.paddle1Color;
  paddle2Color = savedData.paddle2Color;
  highScore = savedData.highScore;
  ballSpeedEnabled = savedData.ballSpeedEnabled;

  paddle1ColorEl.value = savedData.paddle1Color;
  paddle2ColorEl.value = savedData.paddle2Color;
  highScoreEl.innerHTML = savedData.highScore;
  ballSpeedEl.checked = savedData.ballSpeedEnabled;
  return JSON.parse(localStorage.getItem('pongGameData'));
}
function resetGame() {
  clearInterval(intervalId);
  ballX = canvasWidth / 2, ballY = canvasHeight / 2;//center of the canvas
  playerAScore = 0, playerBScore = 0;
  playerAScoreEl.textContent = playerAScore;
  playerBScoreEl.textContent = playerBScore;
  ballSpeed = 0.5;
  startGame();
}
