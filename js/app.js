/* jshint esversion: 6 */
const startingLives = 3;
let score = 0;
let scoreText = document.getElementById('score');
let lives = 1;
let livesText = document.getElementById('lives');
let gameIsRunning = true;
let playerCollision = false;
let heart;
let gem;
// used to start heart and gem timers
let firstMove = false;
// player in the bug zone? LOL He won't be able to return to the grass.
let playerInBugZone = false;
initGame();

// Grid is a 7 x 6 grid, with cols 0 and 7 offscreen
// Sets default to grid 0, 0 (upper left offscreen)
var xHome = -101;
var yHome = -101;

//Offets to center sprites
var xOffset = 101;
var yOffset = 83;

class GameObject {
  constructor() {
    this.x = 0;
    this.y = 2;
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
  }


  // Update the enemy's position, required method for game
  // Parameter: dt, a time delta between ticks
  update(speed = defaultSpeed) {
    if (gameIsRunning) {
      if (!this.checkForCollision(this)) {
        this.x += speed + this.speedMultiplier;
        if (this.x > 8) {
          //
          let newLocation = resetPlayer();
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
      handlePlayerCollision();
      //debugger
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
  }

  reset(){
    this.x = 3;
    this.y = 6;
  }

  update(){
    if(lives === 0){
      gameOver();
    }
    if(this.y === 1 && gameIsRunning){
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
          // if first move in game start gem and heart timers
          createHeart();
          createGem();
          // comparisons keep player on grid by limiting them to min/max coords
          // if position is == max position dont move, else move
          this.y == this.minY ? this.minY : this.y--;
          break;
        case 'down':
          if(this.y == 4 && playerInBugZone) {
            break;
          } else {
            this.y == this.maxY ? this.maxY : this.y++;
            if(this.y >= 4 && !playerInBugZone){
              playerInBugZone = true;
            }
            break;
          }
        case 'left':
          this.x == this.minX ? this.minX : this.x--;
          break;
        case 'right':
          this.x == this.maxX ? this.maxX : this.x++;
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
  }
  update() {
    this.checkForCollision();
  }

  checkForCollision() {
    // Subtract 0.2 from player x pos. Collisions will occur 20% into grid square to make them more realistic
    let playerPos = [player.x - 0.4, player.y];
    if (this.x >= playerPos[0] && this.x < (playerPos[0] + 0.8) && this.y == playerPos[1]) {
      handleGemCollision();
    }
  }
}

class Heart extends GameObject {
  constructor(x = 2, y = 3) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = 'images/Heart.png';
  }

  update() {
    this.checkForCollision();
  }

  checkForCollision() {
    // Subtract 0.2 from player x pos. Collisions will occur 20% into grid square to make them more realistic
    let playerPos = [player.x - 0.4, player.y];
    if (this.x >= playerPos[0] && this.x < (playerPos[0] + 0.8) && this.y == playerPos[1]) {
      handleHeartCollision();
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

function handlePlayerCollision() {
  gameIsRunning = false; // stops updates
  playerCollision = true;
  lives--;
  livesText.innerHTML = lives;
  hearts = [];
  setTimeout(function(){
    player.reset();
    gameIsRunning = true;
    playerCollision = false;
  },2000);
}

function handleHeartCollision() {
  lives++;
  livesText.innerHTML = lives;
  // clear hearts array
  hearts = [];
  createHeart();
}

function handleGemCollision() {
  score += 30;
  scoreText.innerHTML = score;
  // clear gems array
  gems = [];
  createGem();
}



function generateRandomEnemyStartY() {
  // get random row between 2 and 4
  return Math.floor(Math.random() * 3) + 2;
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
    if(allEnemies.length < 3){
      let enemy = new Enemy(generateRandomEnemyStartY(), generateRandomEnemySpeed());
      allEnemies.push(enemy);
    }
  }, 1000);
}

// reset to random row and -x location
function resetPlayer(){
  let x = Math.floor(Math.random() * -3);
  return [x, generateRandomEnemyStartY(), generateRandomEnemySpeed()];
  // also clear out hearts and gems that didn'y activate
  clearTimeout(heart);
  clearTimeout(gem);
  playerInBugZone = false;
}

// generate a life heart every 10 seconds
function createHeart() {
  heart = setTimeout(() => {
    if(hearts.length < 1){
      let x = Math.floor(Math.random() * 5) + 1;
      let y = Math.floor(Math.random() * 3) + 2;
      let heart = new Heart(x, y);
      hearts.push(heart);
    }
  }, 10000);
}

// generate a life heart every 5 seconds
function createGem() {
  let gem = setTimeout(() => {
    if(gems.length < 1){
      let x = Math.floor(Math.random() * 5) + 1;
      let y = Math.floor(Math.random() * 3) + 2;
      let gem = new Gem(x, y);
      gems.push(gem);
    }
  }, 5000);
}

// Game logic -----------------------------------------

let allEnemies = [];
let gems = [];
let hearts = [];
let player = new Player();
let gameOverModal = new GameOver();
enemyGenerator();

  


