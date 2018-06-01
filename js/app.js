/* jshint esversion: 6 */
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
		this.x += speed + this.speedMultiplier;
		//console.log(this.x);
		if(this.x > 8){
			this.x = -1;
		}
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

	// Variables applied to each of our instances go here,
	// we've provided one for you to get started

	// The image/sprite for our enemies, this uses
	// a helper we've provided to easily load images

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
var enemy1 = new Enemy(generateRandomEnemyStartX(), generateRandomEnemySpeed());
var enemy2 = new Enemy(generateRandomEnemyStartX(), generateRandomEnemySpeed());
//console.table(enemy1);
//console.table(enemy2);
allEnemies.push(enemy1);
allEnemies.push(enemy2);
// Place the player object in a variable called player
var player = new Player();
//console.table(player);

function generateRandomEnemyStartX(){
	// get random row between 2 and 4
	return Math.floor(Math.random() * 3) + 2;
}

// TODO:  add parameter for difficulty
function generateRandomEnemySpeed(){
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