// Function to load and display the button (simulate the Flappy Bird game)
function initFlappyGame() {
	const gameCanvas = document.getElementById("gameCanvas");
	const ctx = gameCanvas.getContext("2d");

	ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
	ctx.fillStyle = "black";
	ctx.font = "30px Arial";
	ctx.fillText("Flappy Bird", gameCanvas.width / 2 - 75, gameCanvas.height / 2 - 30);

	const button = document.createElement("button");
	button.innerText = "Click to Complete";
	button.style.position = "absolute";
	button.style.top = "50%";
	button.style.left = "50%";
	button.style.transform = "translate(-50%, -50%)";
	button.onclick = () => {
		alert("You completed Flappy Bird!");
		button.remove();
		localStorage.setItem("flappy_completed", "true");
		completeCurrentGame(); // from arcalix.js
	};

	document.body.appendChild(button);
}
