const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function drawSquare(x, y, length, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, length, length);
}

function animate(){
	requestAnimationFrame(animate);
	
	ctx.fillStyle = "#1c292f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	drawSquare(100, 100, 50, "red");
}

animate();
