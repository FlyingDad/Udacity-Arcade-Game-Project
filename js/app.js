/* jshint esversion: 6 */
let score = 0;
let scoreText = document.getElementById('score');
let lives = 1;
let livesText = document.getElementById('lives');
let gameIsRunning = true;
let playerCollision = false;
initGame();

// Grid is a 7 x 6 grid, with cols 0 and 7 offscreen
// Sets default to grid 0, 0 (upper left offscreen)
var xHome = -101;
var yHome = -101;

//Offets to center sprites
var xOffset = 101;
var yOffset = 83;

class Character {
  constructor() {
    this.x = 0;
    this.y = 2;
  }

  render() {}

  // called by game engine for smooth movement adjusted for deltatime.
  update() {
  }
}
class Enemy extends Character {
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
          this.x = -1;
        }
      } else {
        speed = 0;
      }
    }
  }

  checkForCollision(enemy) {
    // Suntract 0.2 from player x pos. Collisions will occur 20% into grid square to make them more realistic
    let playerPos = [player.x - 0.4, player.y];
    if (enemy.x >= playerPos[0] && enemy.x < (playerPos[0] + 0.8) && enemy.y == playerPos[1]) {
      // collision
      handleCollision();
      //debugger
      return true;
    }
    return false;
  }
}

class Player extends Character {
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
          // comparisons keep player on grid by limiting them to min/max coords
          // if position is == max position dont move, else move
          this.y == this.minY ? this.minY : this.y--;
          break;
        case 'down':
          this.y == this.maxY ? this.maxY : this.y++;
          break;
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

class Gem extends Character {
  constructor() {
    super();
    this.x = 3;
    this.y = 3;
    this.blue =  'images/gem-blue.png';
    this.orange =  'images/gem-orange.png';
    this.green =  'images/gem-green.png';
    this.sprite = this.green;
  }
}

class Heart extends Character {
  constructor() {
    super();
    this.x = 2;
    this.y = 3;
    this.sprite = 'images/Heart.png';
  }
}

class GameOver extends Character {
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
          console.log('yes');
          // TODO: reset game
          break;
        case 'no':
          console.log('no');
          break;
        default:
          break;
      }
    }
  }
}


function handleCollision() {
  gameIsRunning = false; // stops updates
  playerCollision = true;
  lives--;
  livesText.innerHTML = lives;
  setTimeout(function(){
    player.reset();
    gameIsRunning = true;
    playerCollision = false;
  },2000);
}

// Draw the enemy on the screen, required method for game
Character.prototype.render = function () {
  ctx.drawImage(Resources.get(this.sprite), xHome + (this.x * xOffset), yHome + (this.y * yOffset));
};

var allEnemies = [];
//var enemy1 = new Enemy(2, generateRandomEnemySpeed());
//var enemy2 = new Enemy(3, generateRandomEnemySpeed());
var enemy3 = new Enemy(4, generateRandomEnemySpeed());
//allEnemies.push(enemy1);
//allEnemies.push(enemy2);
allEnemies.push(enemy3);
// Place the player object in a variable called player
var player = new Player();
var gems = [];
var gem = new Gem();
gems.push(gem);
var hearts = [];
var heart = new Heart();
hearts.push(heart);

let gameOverModal = new GameOver();

function generateRandomEnemyStartX() {
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

function initGame() {
  livesText.innerHTML = lives;
  scoreText.innerText = 0;
}

function gameOver(){
  gameIsRunning = false;
  gameOverModal.active = true;
}
