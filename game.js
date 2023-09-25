const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

var sDown = false;
var dDown = false;
var spaceDown = false;

function drawSquare(x, y, length, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, length, length);
}

class Player {
	constructor(x, y, dx, dy){
		this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
		this.rotation = 0;
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
		if(sDown){
			this.rotation += 0.1;
		}
		if(dDown){
			this.rotation -= 0.1;
		}
	}
}

document.addEventListener("keydown", 
	function(e){
		switch(e.keyCode){
			case 32: // SPACE
				spaceDown = true; break;
			case 68: // D
				dDown = true; break;
			case 65: // A
				sDown = true; break;
		}
	}
);

document.addEventListener("keyup", 
	function(e){
		switch(e.keyCode){
			case 32: // SPACE
				spaceDown = false; break;
			case 68: // D
				dDown = false; break;
			case 65: // A
				sDown = false; break;
		}
	}
);

player = new Player(100, 100, 0, 0);

function animate(){
	requestAnimationFrame(animate);
	
	ctx.fillStyle = "#1c292f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	player.draw();
	player.update();
}

animate();
