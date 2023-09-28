const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

var wDown, aDown, dDown, spaceDown = false;

function drawSquare(x, y, length, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, length, length);
}

class Player {
	constructor(x, y){
		this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
		this.accel = 0.05;
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
			this.rotation -= 0.05;
		}
		if(dDown){ // Rotate the ship right.
			this.rotation += 0.05;
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

player = new Player(100, 100);

function animate(){
	requestAnimationFrame(animate);
	
	ctx.fillStyle = "#1c292f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	player.update();

	player.draw();
}

animate();
