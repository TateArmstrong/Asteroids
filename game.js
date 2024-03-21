const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

var width = canvas.width;
var height = canvas.height;

var wDown, aDown, dDown, spaceDown = false;
var canShoot = true;
//var rocks = [];
var gameObjects = [];

// Player ship control variables. 
const SHIP_SPEED = 0.02;
const MAX_SHIP_SPEED = 10;
const SHIP_ROTATION_SPEED = 0.005;
const BULLET_SPEED = 1;
const FIRE_RATE_INTERVAL = 250;

// Rock generation control variables. 
const ROCK_RADIUS = 40; // Controls the size of rocks. 
const ROCK_SIDES = 12; // Controls the number of sides the rocks have. 
const ROCK_VARIATION = 20; // Controls how bumpy the rocks are. Weird results if larger than ROCK_RADIUS. 

var mouse = {
	x: 0,
	y: 0
}

function drawSquare(x, y, length, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, length, length);
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
				gameObjects.splice(gameObjects.indexOf(obj1), 1);
				gameObjects.splice(gameObjects.indexOf(obj2), 1);
				return;
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
	}
	
	update(deltaTime){

		// Rotates the ship to point to the mouse cursor. 
		//this.rotation = Math.atan2(mouse.y - this.y, mouse.x - this.x) + Math.PI/2;

		if(wDown){
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
			if(canShoot){
				this.shootBullet();
				canShoot = false;
				setTimeout(function(){canShoot = true}, FIRE_RATE_INTERVAL);
			}
		}
		
		this.x += this.dx;
		this.y += this.dy;
		
		this.wrapCoords();
	}
}

class Rock {
	constructor(x, y, radius = ROCK_RADIUS, numPoints = ROCK_SIDES){
		this.x = x;
        this.y = y;
        this.rotation = Math.random() * (Math.PI * 2);
		this.drawRotation = this.rotation;
		this.rotationSpeed = (Math.random() * 0.06) - 0.03;
		this.radius = radius;
		this.accel = 0.1; 
		this.numPoints = numPoints;
		this.radi = []

		this.init();
	}

	init() {
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
		}
	}
);

document.addEventListener("mousemove", 
	function(e){
		mouse.x = e.offsetX;
		mouse.y = e.offsetY;
	}
);

player = new Player(width / 2, height / 2);
gameObjects.push(player);

// Randomly generates 5 rocks. 
for(var i = 0; i < 5; i++){
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

		// COLLISION DETECTION
		for(var i = 0; i < gameObjects.length; i++){
			for(var j = 0; j < gameObjects.length; j++){
				resolveCollision(gameObjects[i], gameObjects[j]);
			}
		}

		// DRAW
		player.draw();
		for(var i = 0; i < gameObjects.length; i++){
			gameObjects[i].draw();
		}

        lastTime = now;
    }
    
}
