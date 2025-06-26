// Function to load and display the button (very bad Flappy Bird clone)
function initFlappyGame() {
	const canvas = document.getElementById("gameCanvas");
	const ctx = canvas.getContext("2d");

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "28px monospace";
	ctx.fillStyle = "lime";
	ctx.fillText("Pretend there's a bird.", 100, canvas.height / 2 - 20);
	ctx.fillText("Press to flap through pipes.", 100, canvas.height / 2 + 20);

	const flapBtn = document.createElement("button");
	flapBtn.innerText = "Flap!";
	flapBtn.style.position = "absolute";
	flapBtn.style.top = "60%";
	flapBtn.style.left = "50%";
	flapBtn.style.transform = "translate(-50%, -50%)";
	flapBtn.onclick = () => {
		// Generate fake pipe score
		const rawScore = Math.floor(Math.random() * 16 + 5); // 5–20 pipes
		const timeTaken = (Date.now() - startTime) / 1000;
		const score = Math.round((rawScore / timeTaken) * 100) / 100;

		localStorage.setItem("flappy_score", score);
		flapBtn.remove();
		completeCurrentGame();
	};

	document.body.appendChild(flapBtn);
}
