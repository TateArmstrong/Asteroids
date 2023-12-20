const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

var width = canvas.width;
var height = canvas.height;

var wDown, aDown, dDown, spaceDown = false;
var canShoot = true;
var bullets = [];
var rocks = [];

const SHIP_SPEED = 0.02;
const MAX_SHIP_SPEED = 10;
const SHIP_ROTATION_SPEED = 0.005;
const BULLET_SPEED = 1;
const FIRE_RATE_INTERVAL = 250;

function drawSquare(x, y, length, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, length, length);
}

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
}

var mouse = {
	x: 0,
	y: 0
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
			delete this;
		}
		if(this.x < 0){
			delete this;
		}
		if(this.y > height){
			delete this;
		}
		if(this.y < 0){
			delete this;
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
		bullets.push(new Bullet(this.x, this.y, this.rotation));
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
	constructor(x, y){
		this.x = x;
        this.y = y;
        this.rotation = Math.random() * 6.28319;
		this.accel = 0.1
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
		ctx.arc(this.x, this.y, 40, 0, 2 * Math.PI);
		ctx.fillStyle = "white";
		ctx.fill();
	}

	update(deltaTime){
		this.x += Math.sin(this.rotation) * this.accel * deltaTime;
		this.y += -Math.cos(this.rotation) * this.accel * deltaTime;

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

// Randomly generates 5 rocks. 
for(var i = 0; i < 5; i++){
	rocks.push(new Rock(getRndInteger(0, width), getRndInteger(0, height)));
}

var lastTime;
var requiredElapsed = 1000 / 90; // desired interval is 60fps

requestAnimationFrame(loop);

function loop(now) {
    requestAnimationFrame(loop);
    
    if (!lastTime) { lastTime = now; }
    var elapsed = now - lastTime;

    if (elapsed > requiredElapsed) {
        // do stuff
		ctx.fillStyle = "#1c292f";
    	ctx.fillRect(0, 0, width, height);

		// UPDATE
		player.update(elapsed);
		// update all the bullets. 
		for(var i = 0; i < bullets.length; i++){
			bullets[i].update(elapsed);
			if(bullets[i].x > width){
				bullets.splice(i, 1);
				continue;
			}
			if(bullets[i].x < 0){
				bullets.splice(i, 1);
				continue;
			}
			if(bullets[i].y > height){
				bullets.splice(i, 1);
				continue;
			}
			if(bullets[i].y < 0){
				bullets.splice(i, 1);
				continue;
			}
		}
		for(var i = 0; i < rocks.length; i++){
			rocks[i].update(elapsed);
		}

		// DRAW
		player.draw();
		for(var i = 0; i < bullets.length; i++){
			bullets[i].draw();
		}
		for(var i = 0; i < rocks.length; i++){
			rocks[i].draw();
		}

        lastTime = now;
    }
    
}
