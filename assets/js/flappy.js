let flappyCtx, flappyCanvas;
let birdImg, bgImg, pipeTopImg, pipeBottomImg;
let pipes = [];
let bird = { x: 50, y: 150, velocity: 0 };
let score = 0;
let gravity = 1.5;
let gap = 120;
let gameLoopId = null;
let imagesLoaded = 0;

function initFlappyGame() {
	flappyCanvas = document.getElementById("gameCanvas");
	flappyCtx = flappyCanvas.getContext("2d");

	// Load all images
	bgImg = new Image();
	birdImg = new Image();
	pipeTopImg = new Image();
	pipeBottomImg = new Image();

	bgImg.src = "/assets/images/background.png";
	birdImg.src = "/assets/images/yellowbird-midflap.png";
	pipeTopImg.src = "/assets/images/down.png";
	pipeBottomImg.src = "/assets/images/pipe-green.png";

	bgImg.onload = birdImg.onload = pipeTopImg.onload = pipeBottomImg.onload = function () {
		imagesLoaded++;
		if (imagesLoaded === 4) startFlappy();
	};
}

function startFlappy() {
	bird.y = flappyCanvas.height / 2;
	bird.velocity = 0;
	score = 0;
	pipes = [{ x: flappyCanvas.width, y: randomY() }];

	document.addEventListener("keydown", flap);
	document.addEventListener("click", flap);

	gameLoopId = setInterval(flappyLoop, 1000 / 60);
}

function flap() {
	bird.velocity = -20;
}

function flappyLoop() {
	// Clear + draw background
	flappyCtx.drawImage(bgImg, 0, 0);

	// Pipes
	for (let i = 0; i < pipes.length; i++) {
		let p = pipes[i];
		let bottomY = p.y + pipeTopImg.height + gap;

		flappyCtx.drawImage(pipeTopImg, p.x, p.y);
		flappyCtx.drawImage(pipeBottomImg, p.x, bottomY);

		p.x -= 2;

		// New pipe
		if (p.x === 250) pipes.push({ x: flappyCanvas.width, y: randomY() });

		// Collision
		if (
			bird.x + birdImg.width > p.x &&
			bird.x < p.x + pipeTopImg.width &&
			(bird.y < p.y + pipeTopImg.height || bird.y + birdImg.height > bottomY)
		) {
			endFlappy();
			return;
		}
	}

	// Bird physics
	bird.velocity += gravity;
	bird.y += bird.velocity;

	// Bird + ground or ceiling = death
	if (bird.y + birdImg.height >= flappyCanvas.height || bird.y <= 0) {
		endFlappy();
		return;
	}

	flappyCtx.drawImage(birdImg, bird.x, bird.y);

	// Score update (based on pipe passed)
	for (let i = 0; i < pipes.length; i++) {
		if (pipes[i].x + pipeTopImg.width === bird.x) score++;
	}

	flappyCtx.fillStyle = "#0f0";
	flappyCtx.font = "24px monospace";
	flappyCtx.fillText("Score: " + score, 10, 30);
}

function randomY() {
	return Math.floor(Math.random() * -pipeTopImg.height);
}

function endFlappy() {
	clearInterval(gameLoopId);
	document.removeEventListener("keydown", flap);
	document.removeEventListener("click", flap);

	// placeholder score calc
	const timeTaken = (Date.now() - startTime) / 1000;
	const scoreVal = Math.floor((score * 100) / timeTaken);
	localStorage.setItem("flappy_score", scoreVal);

	completeCurrentGame();
}
