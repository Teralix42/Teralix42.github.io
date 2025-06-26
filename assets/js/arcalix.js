let currentGame = 0;
let startTime = 0;
let totalTime = 0;

// Game order
const games = ['flappy']; // Add more later

// Start the full game sequence
function startGame() {
	startTime = Date.now();
	loadGame(games[currentGame]);
}

// Load one game at a time
function loadGame(name) {
	const canvas = document.getElementById("gameCanvas");
	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (name === 'flappy') {
		initFlappyGame(); // flappy.js handles the button and calls completeCurrentGame()
	}

	// Add more: tetris, pacman, etc.
}

// Call when game is finished
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

// Auto-start
window.onload = startGame;
