const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

var wDown, aDown, dDown, spaceDown = false;
var canShoot = true;
var bullets = [];

const SHIP_SPEED = 0.05;
const SHIP_ROTATION_SPEED = 0.05;
const BULLET_SPEED = 7;
const FIRE_RATE_INTERVAL = 250;

function drawSquare(x, y, length, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, length, length);
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
		this.index;
	}

	deleteOutOfBounds(){
		if(this.x > canvas.width){
			delete this;
		}
		if(this.x < 0){
			delete this;
		}
		if(this.y > canvas.height){
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

	update(){
		this.x += Math.sin(this.rotation) * this.accel;
		this.y += -Math.cos(this.rotation) * this.accel;

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
		if(this.x > canvas.width){
			this.x = 0;
		}
		if(this.x < 0){
			this.x = canvas.width;
		}
		if(this.y > canvas.height){
			this.y = 0;
		}
		if(this.y < 0){
			this.y = canvas.height;
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
	
	update(){

		// Rotates the ship to point to the mouse cursor. 
		//this.rotation = Math.atan2(mouse.y - this.y, mouse.x - this.x) + Math.PI/2;

		if(wDown){
			var nor = Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
			// If the velocity is over 5, set it back to 5. 
			if(Math.abs(nor) > 5){
				this.dx = this.dx * 1/nor * 5;
				this.dy = this.dy * 1/nor * 5;
			}
			else {
				this.dx += Math.sin(this.rotation) * this.accel;
				this.dy += -Math.cos(this.rotation) * this.accel;
			}
		}
		if(aDown){ // Rotate the ship left.
			this.rotation -= SHIP_ROTATION_SPEED;
		}
		if(dDown){ // Rotate the ship right.
			this.rotation += SHIP_ROTATION_SPEED;
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

player = new Player(100, 100);

function animate(){
	requestAnimationFrame(animate);
	
	ctx.fillStyle = "#1c292f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
	

	player.update();
	// update all the bullets. 
	for(var i = 0; i < bullets.length; i++){
		bullets[i].update();
		if(bullets[i].x > canvas.width){
			bullets.splice(i, 1);
			continue;
		}
		if(bullets[i].x < 0){
			bullets.splice(i, 1);
			continue;
		}
		if(bullets[i].y > canvas.height){
			bullets.splice(i, 1);
			continue;
		}
		if(bullets[i].y < 0){
			bullets.splice(i, 1);
			continue;
		}
	}

	player.draw();
	for(var i = 0; i < bullets.length; i++){
		bullets[i].draw();
	}
	
}

animate();
