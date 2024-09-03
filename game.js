const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

var width = canvas.width;
var height = canvas.height;

var wDown, aDown, dDown, spaceDown, fDown = false;
var gameObjects = [];
var lives = 3;
var score = 0;
var playerCanRespawn = false;

// Player ship control variables. 
const SHIP_SPEED = 0.02;
const MAX_SHIP_SPEED = 10;
const SHIP_ROTATION_SPEED = 0.005;
const BULLET_SPEED = 1;
const FIRE_RATE_INTERVAL = 250;
const ROCKET_SOUND_INTERVAL = 100;

// Rock generation control variables. 
const ROCK_RADIUS = 60; // Controls the size of rocks. 
const ROCK_SIDES = 12; // Controls the number of sides the rocks have. 
const ROCK_VARIATION = 20; // Controls how bumpy the rocks are. Weird results if larger than ROCK_RADIUS. 

var mouse = {
	x: 0,
	y: 0
}

function rockHitPlayer(player){
	// TO-DO: Make like a for loop or something with random values. 
	gameObjects.push(new ShipPart(player.x, player.y-20, player.dx, player.dy));
	gameObjects.push(new ShipPart(player.x+20, player.y, player.dx, player.dy));
	gameObjects.push(new ShipPart(player.x, player.y, player.dx, player.dy));
	gameObjects.push(new ShipPart(player.x, player.y+20, player.dx, player.dy));
	gameObjects.push(new ShipPart(player.x, player.y, player.dx, player.dy));
	gameObjects.push(new ShipPart(player.x-20, player.y, player.dx, player.dy));
	if(lives <= 0){
		audioManager.playSound("death");
		gameObjects.splice(gameObjects.indexOf(player), 1);
		gameObjects.push(new TextObject((width/2) - 150, height/2, 24, "GAME OVER"));
		return;
	}
	else {
		audioManager.playSound("hurt");
		gameObjects.splice(gameObjects.indexOf(player), 1);
		gameObjects.push(respawnText);
		playerCanRespawn = true;
	}
}

function drawSquare(x, y, length, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, length, length);
}

function drawText(x, y, size, text, color){
	ctx.fillStyle = color;
	ctx.font = size + "pt press_start_kregular";
	ctx.fillText(text, x, y);
}

function drawLives(){
	for(var i = 0; i < lives; i++){
		ctx.beginPath();
		ctx.save();
		ctx.translate(30 + (i * 45), 75);
		ctx.moveTo(0, -30);
		ctx.lineTo(-20, 20);
		ctx.lineTo(0, 10);
		ctx.lineTo(20, 20);
		ctx.lineTo(0, -30);
		ctx.restore();
		ctx.strokeStyle = "white";
		ctx.stroke();
		ctx.closePath();
	}
}

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}

// Returns true if a point is in a circle. 
function isPointInCircle(cx, cy, r, px, py){
	dist = Math.sqrt(Math.pow(px - cx, 2) + Math.pow(py - cy, 2));

	return dist <= r;
}

function resolveCollision(obj1, obj2){
	// Handle collisions for rocks. 
	if(obj1 instanceof Rock){
		if(obj2 instanceof Bullet){
			if(isPointInCircle(obj1.x, obj1.y, obj1.radius, obj2.x, obj2.y)){
				this.audioManager.playSound("break");
				score++;
				if(obj1.radius <= ROCK_RADIUS * (1 / 3)){
					gameObjects.splice(gameObjects.indexOf(obj2), 1);
					gameObjects.splice(gameObjects.indexOf(obj1), 1);
					return;
				}
				if(obj1.radius <= ROCK_RADIUS * (2 / 3)){
					// TO-DO: Make like a for loop or something with random values. 
					gameObjects.splice(gameObjects.indexOf(obj2), 1);
					gameObjects.push(new Rock(obj1.x, obj1.y, 1));
					gameObjects[gameObjects.length - 1].accel = 0.2;
					gameObjects.push(new Rock(obj1.x, obj1.y, 1));
					gameObjects[gameObjects.length - 1].accel = 0.2;
					gameObjects.push(new Rock(obj1.x, obj1.y, 1));
					gameObjects.splice(gameObjects.indexOf(obj1), 1);
					return;
				}
				// TO-DO: Make like a for loop or something with random values. 
				gameObjects.splice(gameObjects.indexOf(obj2), 1);
				gameObjects.push(new Rock(obj1.x, obj1.y, 2));
				gameObjects[gameObjects.length - 1].accel = 0.2;
				gameObjects.push(new Rock(obj1.x, obj1.y, 2));
				gameObjects[gameObjects.length - 1].accel = 0.2;
				gameObjects.push(new Rock(obj1.x, obj1.y, 2));
				gameObjects[gameObjects.length - 1].accel = 0.2;
				gameObjects.splice(gameObjects.indexOf(obj1), 1);
				return;
			}
		}
		if(obj2 instanceof Player){
			if(isPointInCircle(obj1.x, obj1.y, obj1.radius, obj2.x, obj2.y)){
				rockHitPlayer(obj2);
			}
		}
	}
}

function drawPolygon(x, y, numPoints, radius) {
	var angleBetweenPoints = (2 * Math.PI) / numPoints;

	ctx.beginPath();
	ctx.save();
	ctx.translate(x, y);
	ctx.moveTo(0, -radius);
	for(var i = 0; i < numPoints; i++){
		ctx.rotate(angleBetweenPoints);
		ctx.lineTo(0, -radius);
	}
	ctx.restore();
	ctx.strokeStyle = "white";
	ctx.stroke();
	ctx.closePath();
}

function drawRandomPolygon(x, y, numPoints, radius, radi, rotation) {
	var angleBetweenPoints = (2 * Math.PI) / numPoints;

	ctx.beginPath();
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(rotation);
	ctx.moveTo(0, -radius);
	for(var i = 0; i < numPoints - 1; i++){
		ctx.rotate(angleBetweenPoints);
		ctx.lineTo(0, -radi[i]);
	}
	ctx.rotate(angleBetweenPoints);
	ctx.lineTo(0, -radius);
	ctx.restore();
	ctx.strokeStyle = "white";
	ctx.stroke();
	ctx.closePath();
}

class Bullet {
	constructor(x, y, rotation){
		this.x = x;
		this.y = y;
		this.rotation = rotation;
		this.accel = BULLET_SPEED;
	}

	deleteOutOfBounds(){
		if(this.x > width){
			gameObjects.splice(gameObjects.indexOf(this), 1);
			return;
		}
		if(this.x < 0){
			gameObjects.splice(gameObjects.indexOf(this), 1);
			return;
		}
		if(this.y > height){
			gameObjects.splice(gameObjects.indexOf(this), 1);
			return;
		}
		if(this.y < 0){
			gameObjects.splice(gameObjects.indexOf(this), 1);
			return;
		}
	}

	draw(){
		ctx.beginPath();
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation);
		ctx.moveTo(-4, -10);
		ctx.lineTo(-4, 10);
		ctx.lineTo(4, 10);
		ctx.lineTo(4, -10);
		ctx.restore();
		ctx.fillStyle = "white";
		ctx.fill();
	}

	update(deltaTime){
		this.x += Math.sin(this.rotation) * this.accel * deltaTime;
		this.y += -Math.cos(this.rotation) * this.accel * deltaTime;

		this.deleteOutOfBounds();
	}
}

class Player {
	constructor(x, y){
		this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
		this.accel = SHIP_SPEED;
		this.rotation = 0;
		this.canShoot = true;
	}

	wrapCoords(){
		if(this.x > width){
			this.x = 0;
		}
		if(this.x < 0){
			this.x = width;
		}
		if(this.y > height){
			this.y = 0;
		}
		if(this.y < 0){
			this.y = height;
		}
	}

	shootBullet(){
		audioManager.playSound("shoot");
		gameObjects.push(new Bullet(this.x, this.y, this.rotation));
	}
	
	draw(){
		ctx.beginPath();
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation);
		ctx.moveTo(0, -30);
		ctx.lineTo(-20, 20);
		ctx.lineTo(0, 10);
		ctx.lineTo(20, 20);
		ctx.lineTo(0, -30);
		ctx.restore();
		ctx.strokeStyle = "white";
		ctx.stroke();
		ctx.closePath();

		if(wDown){
			ctx.beginPath();
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(this.rotation);
			ctx.moveTo(0, 17);
			ctx.lineTo(-15, 25);
			ctx.lineTo(0, Math.sin(performance.now() * 0.05) * 10 + 40);
			ctx.lineTo(15, 25);
			ctx.lineTo(0, 17);
			ctx.restore();
			ctx.strokeStyle = "white";
			ctx.fillStyle = "white";
			ctx.stroke();
			ctx.fill();
			ctx.closePath();
		}
	}
	
	update(deltaTime){

		// Rotates the ship to point to the mouse cursor. 
		//this.rotation = Math.atan2(mouse.y - this.y, mouse.x - this.x) + Math.PI/2;

		if(wDown){
			audioManager.playSound("rocket");
			var nor = Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
			// If the velocity is over 5, set it back to 5. 
			if(Math.abs(nor) > MAX_SHIP_SPEED){
				this.dx = this.dx * 1/nor * MAX_SHIP_SPEED;
				this.dy = this.dy * 1/nor * MAX_SHIP_SPEED;
			}
			else {
				this.dx += Math.sin(this.rotation) * this.accel * deltaTime;
				this.dy += -Math.cos(this.rotation) * this.accel * deltaTime;
			}
		}
		if(aDown){ // Rotate the ship left.
			this.rotation -= SHIP_ROTATION_SPEED * deltaTime;
		}
		if(dDown){ // Rotate the ship right.
			this.rotation += SHIP_ROTATION_SPEED * deltaTime;
		}
		if(spaceDown){
			// Limits the ammout the player can shoot. 
			if(this.canShoot){
				this.shootBullet();
				this.canShoot = false;
				setTimeout(() => {this.canShoot = true}, FIRE_RATE_INTERVAL);
			}
		}
		
		this.x += this.dx;
		this.y += this.dy;
		
		this.wrapCoords();
	}
}

class Rock {
	constructor(x, y, size = 3){
		this.x = x;
        this.y = y;
        this.rotation = Math.random() * (Math.PI * 2);
		this.drawRotation = this.rotation;
		this.rotationSpeed = (Math.random() * 0.06) - 0.03;
		this.accel = 0.1; 
		this.radi = []
		this.size = size;

		this.init();
	}

	init() {
		if(this.size === 3){
			this.radius = ROCK_RADIUS;
			this.numPoints = ROCK_SIDES;
		}
		if(this.size === 2){
			this.radius = ROCK_RADIUS * (2/3);
			this.numPoints = ROCK_SIDES * (2/3);
		}
		if(this.size === 1){
			this.radius = ROCK_RADIUS * (1/3);
			this.numPoints = ROCK_SIDES * (1/3);
		}

		this.radi.push(this.radius);
		for(var i = 0; i < this.numPoints - 1; i++){
			this.radi.push(this.radius + getRndInteger(-ROCK_VARIATION, ROCK_VARIATION));
		}
	}

	wrapCoords(){
		if(this.x > width){
			this.x = 0;
		}
		if(this.x < 0){
			this.x = width;
		}
		if(this.y > height){
			this.y = 0;
		}
		if(this.y < 0){
			this.y = height;
		}
	}

	draw(){
		drawRandomPolygon(this.x, this.y, this.numPoints, this.radius, this.radi, this.drawRotation);
	}

	update(deltaTime){
		this.x += Math.sin(this.rotation) * this.accel * deltaTime;
		this.y += -Math.cos(this.rotation) * this.accel * deltaTime;

		this.drawRotation += this.rotationSpeed;

		this.wrapCoords();
	}
}

class TextObject {
	constructor(x, y, size = 16, text = "", color = "white"){
		this.x = x;
        this.y = y;
		this.size = size;
		this.text = text;
		this.color = color
	}

	draw(){
		ctx.fillStyle = this.color;
		ctx.font = this.size + "pt press_start_kregular";
		ctx.fillText(this.text, this.x, this.y);
	}

	update(deltaTime){}
}

class ShipPart {
	constructor(x, y, dx, dy){
		this.x = x;
        this.y = y;
        this.rotation = Math.atan2(dx, -dy) + (Math.random() - 0.5);
		this.drawRotation = this.rotation;
		this.rotationSpeed = (Math.random() * 0.3) - 0.1;
		this.accel = (Math.random() * 0.1) + 0.1;
		this.size = getRndInteger(10, 20);

		this.init();
	}

	init(){
		setTimeout(() => {
			gameObjects.splice(gameObjects.indexOf(this), 1);
		}, 2000);
	}

	wrapCoords(){
		if(this.x > width){
			this.x = 0;
		}
		if(this.x < 0){
			this.x = width;
		}
		if(this.y > height){
			this.y = 0;
		}
		if(this.y < 0){
			this.y = height;
		}
	}

	draw(){
		ctx.beginPath();
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.drawRotation);
		ctx.moveTo(0, -this.size);
		ctx.lineTo(0, this.size);
		ctx.restore();
		ctx.strokeStyle = "white";
		ctx.stroke();
		ctx.closePath();
	}

	update(deltaTime){
		this.x += Math.sin(this.rotation) * this.accel * deltaTime;
		this.y += -Math.cos(this.rotation) * this.accel * deltaTime;

		this.drawRotation += this.rotationSpeed;

		this.wrapCoords();
	}
}

class AudioManager {
	constructor (){
		this.gameMuted = false;
		this.canPlayRocketSound = true;
		this.playerShoot = new Audio("./sounds/shoot.wav");
		this.rocket = new Audio("./sounds/rocket.wav");
		this.break = new Audio("./sounds/break.wav");
		this.hurt = new Audio("./sounds/hurt.wav");
		this.death = new Audio("./sounds/death.wav");
	}

	playSound(sound){
		if(this.gameMuted){return;}
		switch(sound){
			case "shoot":
				this.playerShoot.currentTime = 0;
				this.playerShoot.play(); break;
			case "rocket": 
				if(this.canPlayRocketSound){
					this.rocket.currentTime = 0;
					this.rocket.play();
					this.canPlayRocketSound = false;
					setTimeout(() => {this.canPlayRocketSound = true}, ROCKET_SOUND_INTERVAL);
				}
				break;
			case "break":
				this.break.currentTime = 0;
				this.break.play(); break;
			case "hurt":
				this.hurt.currentTime = 0;
				this.hurt.play(); break;
			case "death":
				this.death.currentTime = 0;
				this.death.play(); break;
		}
	}
}

document.addEventListener("keydown", 
	function(e){
		switch(e.keyCode){
			case 32: // SPACE
				spaceDown = true; break;
			case 87: // W
				wDown = true; break;
			case 65: // A
				aDown = true; break;
			case 68: // D
				dDown = true; break;
		}
	}
);

document.addEventListener("keyup", 
	function(e){
		switch(e.keyCode){
			case 32: // SPACE
				spaceDown = false; break;
			case 87: // W
				wDown = false; break;
			case 65: // A
				aDown = false; break;
			case 68: // D
				dDown = false; break;
			case 70: // F
				fDown = true; break;
		}
	}
);

document.addEventListener("mousemove", 
	function(e){
		mouse.x = e.offsetX;
		mouse.y = e.offsetY;
	}
);

var respawnText = new TextObject((width/2) - 210, (height/2) + 200, 18, "Press F To Respawn");

var audioManager = new AudioManager();

var player = new Player(width / 2, height / 2);
gameObjects.push(player);

// Randomly generates 3 rocks. 
for(var i = 0; i < 3; i++){
	gameObjects.push(new Rock(getRndInteger(0, width), getRndInteger(0, height)));
}

var lastTime;
var requiredElapsed = 1000 / 90; // desired interval is 60fps

requestAnimationFrame(loop);

function loop(now) {
    requestAnimationFrame(loop);
    
    if (!lastTime) { lastTime = now; }
    var elapsed = now - lastTime;

    if (elapsed > requiredElapsed) {
		// Fill the background. 
		ctx.fillStyle = "#1c292f";
    	ctx.fillRect(0, 0, width, height);

		// UPDATE
		for(var i = 0; i < gameObjects.length; i++){
			gameObjects[i].update(elapsed);
		}

		// Detect player input. 
		if(playerCanRespawn && fDown){
			lives--;
			fDown = false;
			playerCanRespawn = false;
			player = new Player(width / 2, height / 2);
			gameObjects.push(player);
			gameObjects.splice(gameObjects.indexOf(respawnText), 1);
		}
		else {
			fDown = false;
		}

		// COLLISION DETECTION
		for(var i = 0; i < gameObjects.length; i++){
			for(var j = 0; j < gameObjects.length; j++){
				resolveCollision(gameObjects[i], gameObjects[j]);
			}
		}

		// DRAW
		for(var i = 0; i < gameObjects.length; i++){
			gameObjects[i].draw();
		}
		drawLives();
		drawText(10, 35, 24, "SCORE: " + score, "white");

        lastTime = now;
    }
    
}
