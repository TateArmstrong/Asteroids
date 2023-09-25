const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

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
		ctx.moveTo(0, -20);
		ctx.lineTo(-20, 20);
		ctx.lineTo(20, 20);
		ctx.lineTo(0, -20);
		ctx.restore();
		ctx.strokeStyle = "white";
		ctx.stroke();
		ctx.closePath();
	}
}

document.addEventListener("keydown", 
	function(e){
		switch(e.keyCode){
			case 32: // SPACE
				console.log("SPACE BAR!!!!"); break;
			case 68: // D
				console.log("D WAS PRESSED"); break;
			case 65: // A
				console.log("A WAS PRESSED"); break;
		}
	}
);

player = new Player(100, 100, 0, 0);

function animate(){
	requestAnimationFrame(animate);
	
	ctx.fillStyle = "#1c292f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	player.draw();
}

animate();
