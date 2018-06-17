/* jshint esversion: 6 */
let score = 123;
let scoreText = document.getElementById('score');
let lives = 45;
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
  update() {}
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
        //console.log(this.x);
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

  handleInput(key) {
    console.log(key);
    if (!playerCollision) {
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

  // Variables applied to each of our instances go here,
  // we've provided one for you to get started

  // The image/sprite for our enemies, this uses
  // a helper we've provided to easily load images

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
    // this.maxX = 5;
    // this.minX = 1;
    // this.maxY = 6;
    // this.minY = 1;
    this.sprite = 'images/Heart.png';
  }
}

function handleCollision() {
  gameIsRunning = false; // stops updates
  playerCollision = true;
  lives--;
  livesText.innerHTML = lives;
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
// Enemy.prototype.update = function(dt) {
//     // You should multiply any movement by the dt parameter
//     // which will ensure the game runs at the same speed for
// 		// all computers.
// 		//this.x += .01;
// };

// Draw the enemy on the screen, required method for game
Character.prototype.render = function () {
  ctx.drawImage(Resources.get(this.sprite), xHome + (this.x * xOffset), yHome + (this.y * yOffset));
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
//var enemy1 = new Enemy(2, generateRandomEnemySpeed());
//var enemy2 = new Enemy(3, generateRandomEnemySpeed());
var enemy3 = new Enemy(4, generateRandomEnemySpeed());
//console.table(enemy1);
//console.table(enemy2);
//allEnemies.push(enemy1);
//allEnemies.push(enemy2);
allEnemies.push(enemy3);
// Place the player object in a variable called player
var player = new Player();
//console.table(player);
var gems = [];
var gem = new Gem();
gems.push(gem);
var hearts = [];
var heart = new Heart();
hearts.push(heart);

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
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});

function initGame() {
  livesText.innerHTML = 3;
  scoreText.innerText = 0;
}