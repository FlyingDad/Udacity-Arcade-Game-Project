/* jshint esversion: 6 */
const startingLives = 3;
let score = 0;
let scoreText = document.getElementById('score');
let lives = 3;
let livesText = document.getElementById('lives');
let gameIsRunning = true;
let playerCollision = false;
let heart;
let gem;
let gemCount = 0;
let maxGems = 1;
let heartCount = 0;
let maxHearts =1; 
// If we decide to increase enemies with difficulty global is here
let maxEnemies = 5; 
// used to start heart and gem timers
let firstMove = false;
// only allowed one bonus per play
let heartReceived = false;
let gemReceived = false;
// player in the bug zone? LOL He won't be able to return to the grass.
let playerInBugZone = false;
initGame();

// Grid is a 7 x 6 grid, with cols 0 and 7 offscreen
// Sets default to grid 0, 0 (upper left offscreen)
let xHome = -101;
let yHome = -101;

//Offets to center sprites
let xOffset = 101;
let yOffset = 83;

class GameObject {
  constructor() {
    this.x = 0;
    this.y = 2;
    this.sound = '';
  }

  playSound() {
    var audio = new Audio(this.sound);
    audio.loop = false;
    audio.play();
  }

  render() {}

  // called by game engine for smooth movement adjusted for deltatime.
  update() {
  }
}

// Draw the enemy on the screen, required method for game
GameObject.prototype.render = function () {
  ctx.drawImage(Resources.get(this.sprite), xHome + (this.x * xOffset), yHome + (this.y * yOffset));
};

class Enemy extends GameObject {
  constructor(yPos, speedMultiplier) {
    super();
    this.y = yPos;
    this.speedMultiplier = speedMultiplier;
    this.sprite = 'images/enemy-bug.png';
    this.defaultSpeed = 0.01;
    this.sound = '../sounds/bite.wav'
  }


  // Update the enemy's position, required method for game
  // Parameter: dt, a time delta between ticks
  update(speed = defaultSpeed) {
    if (gameIsRunning) {
      if (!this.checkForCollision(this)) {
        this.x += speed + this.speedMultiplier;
        if (this.x > 8) {
          let newLocation = resetEnemy();
          this.x = newLocation[0];
          this.y = newLocation[1];
          this.speedMultiplier = newLocation[2];
        }
      } else {
        speed = 0;
      }
    }
  }

  checkForCollision() {
    // Subtract 0.2 from player x pos. Collisions will occur 20% into grid square to make them more realistic
    let playerPos = [player.x - 0.4, player.y];
    if (this.x >= playerPos[0] && this.x < (playerPos[0] + 0.8) && this.y == playerPos[1]) {
      // collision
      handlePlayerEnemyCollision();
      this.playSound();
      return true;
    }
    return false;
  }
}

class Player extends GameObject {
  constructor() {
    super();
    this.x = 3;
    this.y = 6;
    this.maxX = 5;
    this.minX = 1;
    this.maxY = 6;
    this.minY = 1;
    this.sprite = 'images/char-boy.png';
    this.sound = '../sounds/move.wav';
  }

  reset(){
    this.x = 3;
    this.y = 6;
    clearTimeout(heart);
    clearTimeout(gem);
    gemCount = 0;
    heartCount = 0;
    hearts = [];
    gems = [];
  }

  update(){
    if(lives === 0){
      gameOver();
    }
    if(this.y === 1 && gameIsRunning){
      var audio = new Audio('../sounds/win.wav');
      audio.loop = false;
      audio.play();
      gameIsRunning = false;
      score += 10;
      scoreText.innerHTML = score;
      let self = this;
      setTimeout(function(){
        self.reset();
        gameIsRunning = true;
      }, 1000);
      
    }
  }

  handleInput(key) {
    if (!playerCollision && gameIsRunning) {
      switch (key) {
        case 'up':
          // if first move in game start gem and heart timers if
          // they haven't already got one
          if(!gemReceived)createHeart();
          if(!heartReceived) createGem();
          // comparisons keep player on grid by limiting them to min/max coords
          // if position is == max position dont move, else move
          this.y == this.minY ? this.minY : this.y--;
          this.playSound();
          break;
        case 'down':
          if(this.y == 4 && playerInBugZone) {
            break;
          } else {
            this.y == this.maxY ? this.maxY : this.y++;
            if(this.y >= 4 && !playerInBugZone){
              playerInBugZone = true;
            }
            this.playSound();
            break;
          }
        case 'left':
          this.x == this.minX ? this.minX : this.x--;
          this.playSound();
          break;
        case 'right':
          this.x == this.maxX ? this.maxX : this.x++;
          this.playSound();
          break;
        default:
          break;
      }
    }
  }
}

class Gem extends GameObject {
  constructor(x = 3, y = 3) {
    super();
    this.x = x;
    this.y = y;
    this.blue =  'images/gem-blue.png';
    this.orange =  'images/gem-orange.png';
    this.green =  'images/gem-green.png';
    this.sprite = this.green;
    this.sound = '../sounds/gem.wav'
  }
  update() {
    this.checkForCollision();
  }

  checkForCollision() {
    // Subtract 0.2 from player x pos. Collisions will occur 20% into grid square to make them more realistic
    let playerPos = [player.x - 0.4, player.y];
    if (this.x >= playerPos[0] && this.x < (playerPos[0] + 0.8) && this.y == playerPos[1]) {
      handleGemCollision();
      this.playSound();
    }
  }
}

class Heart extends GameObject {
  constructor(x = 2, y = 3) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = 'images/Heart.png';
    this.sound = '../sounds/heart.wav';
  }

  update() {
    this.checkForCollision();
  }

  checkForCollision() {
    // Subtract 0.2 from player x pos. Collisions will occur 20% into grid square to make them more realistic
    let playerPos = [player.x - 0.4, player.y];
    if (this.x >= playerPos[0] && this.x < (playerPos[0] + 0.8) && this.y == playerPos[1]) {
      handleHeartCollision();
      this.playSound();
    }
  }
}

class GameOver extends GameObject {
  constructor() {
    super();
    this.x = 1.5;
    this.y = 3.5
    this.active = false;
    this.sprite = 'images/gameover.png';
  }

  handleInput(key) {
    if (!gameIsRunning) {
      switch (key) {
        case 'yes':
          resetGame();
          break;
        case 'no':
          break;
        default:
          break;
      }
    }
  }
}

// Game Functions -----------------------------------------

function handlePlayerEnemyCollision() {
  gameIsRunning = false; // stops updates
  playerCollision = true;
  lives--;
  livesText.innerHTML = lives;
  hearts = [];
  gem = [];
  clearTimeout(heart);
  clearTimeout(gem);
  setTimeout(function(){
    player.reset();
    gameIsRunning = true;
    playerCollision = false;
  },2000);
}

function handleHeartCollision() {
  lives++;
  livesText.innerHTML = lives;
  //clearTimeout(heart);
  // clear hearts array
  hearts = [];
  heartReceived = true;
  //createHeart();
}

function handleGemCollision() {
  score += 30;
  scoreText.innerHTML = score;
  //clearTimeout(gem);
  // clear gems array
  gems = [];
  gemReceived = true;
  //createGem();
}

function generateRandomEnemyStartY() {
  // get random row between 2 and 4
  return Math.floor(Math.random() * 3) + 2;
}

function generateRandomEnemyStartX() {
  // get random row between 2 and 4
  return Math.floor(Math.random() * -3);
}
// TODO:  add parameter for difficulty
function generateRandomEnemySpeed() {
  return Math.random() * .03;
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    89: 'yes',
    78: 'no'
  };

  player.handleInput(allowedKeys[e.keyCode]);
  gameOverModal.handleInput(allowedKeys[e.keyCode]);
});


function updateLivesText(){

}

function initGame() {

  livesText.innerHTML = lives;
  scoreText.innerText = 0;
}

function gameOver(){
  gameIsRunning = false;
  gameOverModal.active = true; 
}

function resetGame(){
  //TODO: reset enemies
  lives = startingLives;
  // also clear out hearts and gems that didn'y activate
  clearTimeout(heart);
  clearTimeout(gem);
  gemCount = 0;
  heartCount = 0;
  playerInBugZone = false;
  initGame();
  allEnemies = [];
  gems = [];
  hearts = [];
  //let player = new Player();
  gameOverModal.active = false;
  gameIsRunning = true;
  enemyGenerator();
}

// Generate enemy every X seconds
function enemyGenerator() { 
  setInterval(() => {
    if(allEnemies.length < maxEnemies){
      let enemy = new Enemy(generateRandomEnemyStartX(),generateRandomEnemyStartY(), generateRandomEnemySpeed());
      allEnemies.push(enemy);
    }
  }, 1000);
}

// reset to random row and -x location
function resetEnemy(){
  let x = Math.floor(Math.random() * -3);
  playerInBugZone = false;
  return [x, generateRandomEnemyStartY(), generateRandomEnemySpeed()];
}

// generate a life heart every 10 seconds
function createHeart() {
  if(heartCount < maxHearts){
    heartCount++;
    heart = setTimeout(() => {
      let x = Math.floor(Math.random() * 5) + 1;
      let y = Math.floor(Math.random() * 3) + 2;
      let heart = new Heart(x, y);
      hearts.push(heart);
    }, 10000);
  }
}

// generate a life heart every 5 seconds
function createGem() {  
  if(gemCount < maxGems){
    gemCount++;
    gem = setTimeout(() => { 
      let x = Math.floor(Math.random() * 5) + 1;
      let y = Math.floor(Math.random() * 3) + 2;
      let gem = new Gem(x, y);
      gems.push(gem);
    }, 3000);
  }
}


// Game logic -----------------------------------------

let allEnemies = [];
let gems = [];
let hearts = [];
let player = new Player();
let gameOverModal = new GameOver();
enemyGenerator();

  


