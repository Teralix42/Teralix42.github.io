let currentGame = 0;
let startTime = 0;
let totalTime = 0;

// Game order
const games = ['flappy']; // Add more later

function startGame() {
	const hud = document.getElementById("hud");
	const canvas = document.getElementById("gameCanvas");
	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Clear HUD
	hud.innerHTML = "";

	// Start timer
	startTime = Date.now();

	// Start first game
	loadGame(games[currentGame]);

	// Start timer display loop
	const timerElement = document.createElement("p");
	timerElement.id = "timer";
	hud.appendChild(timerElement);

	const updateTimer = () => {
		if (currentGame < games.length) {
			const elapsed = (Date.now() - startTime) / 1000;
			timerElement.textContent = `Time: ${elapsed.toFixed(2)}s`;
			requestAnimationFrame(updateTimer);
		}
	};
	updateTimer();
}

function loadGame(name) {
	const canvas = document.getElementById("gameCanvas");
	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const status = document.getElementById("game-status") || document.createElement("p");
	status.id = "game-status";
	status.textContent = `Level ${currentGame + 1}: ${name.toUpperCase()}`;
	document.getElementById("hud").appendChild(status);

	if (name === 'flappy') {
		initFlappyGame(); // flappy.js handles button and calls completeCurrentGame()
	}
}

function completeCurrentGame() {
	const name = games[currentGame];
	localStorage.setItem(`${name}_completed`, "true");

	currentGame++;
	if (currentGame < games.length) {
		loadGame(games[currentGame]);
	} else {
		totalTime = (Date.now() - startTime) / 1000;
		localStorage.setItem("total_time", totalTime.toFixed(2));
		localStorage.setItem("arcalix_clearance", "true");
		window.location.href = "/arcalix/complete/";
	}
}

// Show start button on load
window.onload = () => {
	const canvas = document.getElementById("gameCanvas");
	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "32px monospace";
	ctx.fillText("Press the button to begin your trials", 100, canvas.height / 2 - 40);

	const startBtn = document.createElement("button");
	startBtn.innerText = "🎮 Start Trials";
	startBtn.style.position = "absolute";
	startBtn.style.top = "50%";
	startBtn.style.left = "50%";
	startBtn.style.transform = "translate(-50%, -50%)";
	startBtn.onclick = () => {
		startBtn.remove();
		startGame();
	};

	document.body.appendChild(startBtn);
};
