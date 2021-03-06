/* jshint esversion: 6 */
/* jshint browser: true */
const STARTINGLIVES = 3;
const MAXGEMS = 1;
const MAXHEARTS =1; 
// If we decide to increase enemies with difficulty in later versions
const MAXENEMIES = 5; 
let score = 0;
let scoreText = document.getElementById('score');
let lives = 3;
let livesText = document.getElementById('lives');
let gameIsRunning = false;
let playerCollision = false;
let heart;
let gem;



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

  render() {
    ctx.drawImage(Resources.get(this.sprite), xHome + (this.x * xOffset), yHome + (this.y * yOffset));
  }
}

class Enemy extends GameObject {
  constructor() {
    super();
    this.x = this.generateRandomEnemyStartX();
    this.y = this.generateRandomEnemyStartY();
    this.speedMultiplier =  this.generateRandomEnemySpeed();
    this.images = ['images/enemy-bug.png', 'images/enemy-bug-green.png'];
    this.sprite = (this.speedMultiplier > 2) ? this.images[1] : this.images[0];
    this.sound = './sounds/bite.wav';
  }

  // when enemy is recycled set new image based on speed;
  setImage(){
    this.sprite = (this.speedMultiplier > 2) ? this.images[1] : this.images[0];
  }

  generateRandomEnemyStartX() {
    // get random row between 2 and 4
    return Math.floor(Math.random() * - 3);
  }

  generateRandomEnemyStartY() {
    // get random row between 2 and 4
    return Math.floor(Math.random() * 3) + 2;
  }
  
  generateRandomEnemySpeed() {
    return (Math.random() * 2) + 1;
  }

  // Update the enemy's position, required method for game
  // Parameter: dt, a time delta between ticks
  update(dt) {
    if (gameIsRunning) {
      if (!this.checkForCollision(this)) {
        this.x += dt * this.speedMultiplier;
        if (this.x > 8) {
          // reset to new random x, y, speed
          this.x = this.generateRandomEnemyStartX();
          this.y = this.generateRandomEnemyStartY();
          this.speedMultiplier = this.generateRandomEnemySpeed();
          this.setImage();
        }
      }
    }
  }

  checkForCollision() {
    // Subtract 0.2 from player x pos. Collisions will occur 20% into grid square to make them more realistic
    let playerPos = [player.x - 0.8, player.y];
    if (this.x >= playerPos[0] && this.x < (playerPos[0] + 1.6) && this.y == playerPos[1]) {
      // collision
      this.handlePlayerEnemyCollision();
      this.playSound();
      return true;
    }
    return false;
  }

  handlePlayerEnemyCollision() {
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
      allEnemies = [];
      gameIsRunning = true;
      playerCollision = false;
    },2000);
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
    this.sound = './sounds/move.wav';
    // only allowed one bonus per play
    this.heartReceived = false;
    this.gemReceived = false;
    // player in the bug zone? He won't be able to return to the grass.
    this.playerInBugZone = false;
    this.gemCount = 0;
    this.heartCount = 0;
  }

  reset(){
    this.x = 3;
    this.y = 6;
    clearTimeout(heart);
    clearTimeout(gem);
    this.gemCount = 0;
    this.heartCount = 0;
    hearts = [];
    gems = [];
  }

  update(){
    if(lives === 0){
      gameOver();
    }
    if(this.y === 1 && gameIsRunning){
      var audio = new Audio('./sounds/win.wav');
      audio.loop = false;
      audio.play();
      gameIsRunning = false;     
      player.playerInBugZone = false;
      let self = this;
      setTimeout(function(){
        score += 10;
        scoreText.innerHTML = score;
        self.reset();
        gameIsRunning = true;
      }, 1500);
      
    }
  }

  handleInput(key) {
    if (!playerCollision && gameIsRunning) {
      switch (key) {
        case 'up':
          // if first move in game start gem and heart timers if
          // they haven't already got one
          if(!player.gemReceived)createHeart();
          if(!player.heartReceived) createGem();
          // comparisons keep player on grid by limiting them to 
          // min/max coords
          // if position is == max position dont move, else move
          this.y = (this.y == this.minY) ? this.minY : --this.y;
          this.playSound();
          if(this.y <= 4 && !player.playerInBugZone){
            player.playerInBugZone = true;
          }
          break;
        case 'down':
          if(player.playerInBugZone && this.y >= 4) {
            break;
          }           
          this.y = (this.y == this.maxY) ? this.maxY : ++this.y;            
          this.playSound();
          break;     
        case 'left':
          this.x = (this.x == this.minX) ? this.minX : --this.x;
          this.playSound();
          break;
        case 'right':
          this.x = (this.x == this.maxX) ? this.maxX : ++this.x;
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
    this.sound = './sounds/gem.wav';
  }
  update() {
    this.checkForCollision();
  }

  checkForCollision() {
    // Subtract 0.2 from player x pos. Collisions will occur 20% into grid square to make them more realistic
    let playerPos = [player.x - 0.4, player.y];
    if (this.x >= playerPos[0] && this.x < (playerPos[0] + 0.8) && this.y == playerPos[1]) {
      this.handleGemCollision();
      this.playSound();
    }
  }

  handleGemCollision() {
    score += 30;
    scoreText.innerHTML = score;
    // clear gems array
    gems = [];
    player.gemReceived = true;
  
  }
}

class Heart extends GameObject {
  constructor(x = 2, y = 3) {
    super();
    this.x = x;
    this.y = y;
    this.sprite = 'images/Heart.png';
    this.sound = './sounds/heart.wav';
  }

  update() {
    this.checkForCollision();
  }

  checkForCollision() {
    // Subtract 0.2 from player x pos. Collisions will occur 20% into grid square to make them more realistic
    let playerPos = [player.x - 0.4, player.y];
    if (this.x >= playerPos[0] && this.x < (playerPos[0] + 0.8) && this.y == playerPos[1]) {
      this.handleHeartCollision();
      this.playSound();
    }
  }
  
  handleHeartCollision() {
    lives++;
    livesText.innerHTML = lives;
    // clear hearts array
    hearts = [];
    player.heartReceived = true;
  }
  
}

class GameOver extends GameObject {
  constructor() {
    super();
    this.x = 1.5;
    this.y = 3.5;
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
          let cv = document.querySelector('canvas');
          cv.parentNode.removeChild(cv);
          let thanks = document.getElementById('thanks');
          thanks.classList.remove('thanks');
          break;
        default:
          break;
      }
    }
  }
}

class Instructions extends GameObject {
  constructor() {
    super();
    this.x = 1;
    this.y = 2.3
    ;
    this.active = false;
    this.sprite = 'images/instructions.png';
  }

  handleInput(key) {
    if (!gameIsRunning) {
      this.active = false;
      gameIsRunning = true;
    }
  }
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
  instructionsModal.handleInput();
});

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
  lives = STARTINGLIVES;
  // also clear out hearts and gems that didn'y activate
  clearTimeout(heart);
  clearTimeout(gem);
  player.gemCount = 0;
  player.heartCount = 0;
  player.playerInBugZone = false;
  initGame();
  allEnemies = [];
  gems = [];
  hearts = [];
  gameOverModal.active = false;
  gameIsRunning = true;
  enemyGenerator();
}

// Generate enemy every X seconds
function enemyGenerator() { 
  setInterval(() => {
    if(allEnemies.length < MAXENEMIES){
      let enemy = new Enemy();
      allEnemies.push(enemy);
    }
  }, 1000);
}

// generate a life heart every 10 seconds
function createHeart() {
  if(player.heartCount < MAXHEARTS){
    player.heartCount++;
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
  if(player.gemCount < MAXGEMS){
    player.gemCount++;
    gem = setTimeout(() => { 
      let x = Math.floor(Math.random() * 5) + 1;
      let y = Math.floor(Math.random() * 3) + 2;
      let gem = new Gem(x, y);
      gems.push(gem);
    }, 3000);
  }
}


// Game logic -----------------------------------------

let instructionsModal = new Instructions();
instructionsModal.active = true;
let allEnemies = [];
let gems = [];
let hearts = [];
let player = new Player();
let gameOverModal = new GameOver();
enemyGenerator();
