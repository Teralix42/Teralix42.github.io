let flappyCanvas, flappyCtx;
let birdImgs = {}, bgImg, baseImg, pipeTopImg, pipeBottomImg;
let pipes = [];
let bird = { x: 50, y: 150, velocity: 0, frame: 0 };
let score = 0;
let gravity = 0.6;
let gap = 100;
let gameLoopId = null;
let bgOffset = 0;
let baseOffset = 0;
let gameStarted = false;
let scrollSpeed = 2;
let flapCooldown = 0;

// Asset paths
const assetsPath = "/assets/images/";
const canvasWidth = 288;
const canvasHeight = 512;

function initFlappyGame() {
	flappyCanvas = document.getElementById("gameCanvas");
	flappyCtx = flappyCanvas.getContext("2d");

	setCanvasScale();
	loadAssets();
}

function setCanvasScale() {
	const container = flappyCanvas.parentElement || document.body;
	const scale = Math.min(window.innerWidth / canvasWidth, window.innerHeight / canvasHeight);
	flappyCanvas.style.width = canvasWidth * scale + "px";
	flappyCanvas.style.height = canvasHeight * scale + "px";
}

function loadAssets() {
	const toLoad = [
		["bg", "background-day.png"],
		["base", "base.png"],
		["pipeTop", "down.png"],
		["pipeBottom", "pipe-green.png"],
		["mid", "yellowbird-midflap.png"],
		["up", "yellowbird-upflap.png"],
		["down", "yellowbird-downflap.png"]
	];

	let loaded = 0;

	const onLoad = () => {
		loaded++;
		if (loaded === toLoad.length) startFlappy();
	};

	toLoad.forEach(([key, file]) => {
		const img = new Image();
		img.onload = onLoad;
		img.src = assetsPath + file;

		if (key === "bg") bgImg = img;
		else if (key === "base") baseImg = img;
		else if (key === "pipeTop") pipeTopImg = img;
		else if (key === "pipeBottom") pipeBottomImg = img;
		else birdImgs[key] = img;
	});
}

function startFlappy() {
	bird.y = canvasHeight / 2;
	bird.velocity = 0;
	score = 0;
	bgOffset = 0;
	baseOffset = 0;
	gameStarted = false;
	pipes = [{ x: canvasWidth, y: randomY(), scored: false }];
	bird.frame = 0;

	drawFlappyFrame(); // frozen start screen

	document.addEventListener("keydown", handleFlappyStart);
	document.addEventListener("click", handleFlappyStart);
}

function handleFlappyStart(e) {
	if (!gameStarted) {
		gameStarted = true;
		gameLoopId = setInterval(flappyLoop, 1000 / 60);
	}
	flap();
	document.removeEventListener("keydown", handleFlappyStart);
	document.removeEventListener("click", handleFlappyStart);
}

function flap() {
	if (flapCooldown > 0) return;
	bird.velocity = -8;
	flapCooldown = 5;
}

function flappyLoop() {
	bgOffset = (bgOffset + scrollSpeed * 0.5) % bgImg.width;
	baseOffset = (baseOffset + scrollSpeed) % baseImg.width;

	// Background
	flappyCtx.drawImage(bgImg, -bgOffset, 0);
	flappyCtx.drawImage(bgImg, bgImg.width - bgOffset, 0);

	// Pipes
	for (let i = 0; i < pipes.length; i++) {
		const p = pipes[i];
		const bottomY = p.y + pipeTopImg.height + gap;

		flappyCtx.drawImage(pipeTopImg, p.x, p.y);
		flappyCtx.drawImage(pipeBottomImg, p.x, bottomY);

		if (gameStarted) p.x -= scrollSpeed;

		// Collision
		if (
			bird.x + birdImgs.mid.width > p.x &&
			bird.x < p.x + pipeTopImg.width &&
			(bird.y < p.y + pipeTopImg.height || bird.y + birdImgs.mid.height > bottomY)
		) return endFlappy();
	}

	if (gameStarted) {
		// Add new pipe
		if (pipes[pipes.length - 1].x < 150) {
			pipes.push({ x: canvasWidth, y: randomY(), scored: false });
		}

		// Remove old pipes
		pipes = pipes.filter(p => p.x + pipeTopImg.width > 0);

		// Bird physics
		bird.velocity += gravity;
		bird.y += bird.velocity;

		if (bird.y <= 0 || bird.y + birdImgs.mid.height >= canvasHeight - baseImg.height) return endFlappy();

		// Score logic
		for (const p of pipes) {
			if (!p.scored && p.x + pipeTopImg.width < bird.x) {
				p.scored = true;
				score++;
			}
		}
	}

	// Animate bird
	bird.frame = (bird.frame + 1) % 30;
	const flapFrame = bird.velocity < -1 ? "up" : bird.velocity > 1 ? "down" : "mid";
	flappyCtx.drawImage(birdImgs[flapFrame], bird.x, bird.y);

	// Base
	flappyCtx.drawImage(baseImg, -baseOffset, canvasHeight - baseImg.height);
	flappyCtx.drawImage(baseImg, baseImg.width - baseOffset, canvasHeight - baseImg.height);

	// Score
	flappyCtx.fillStyle = "#0f0";
	flappyCtx.font = "20px monospace";
	flappyCtx.fillText("Score: " + score, 10, 25);

	// Flap cooldown
	if (flapCooldown > 0) flapCooldown--;
}

function drawFlappyFrame() {
	flappyCtx.drawImage(bgImg, 0, 0);
	flappyCtx.drawImage(pipeBottomImg, canvasWidth, canvasHeight - baseImg.height - pipeBottomImg.height);
	flappyCtx.drawImage(baseImg, 0, canvasHeight - baseImg.height);
	flappyCtx.drawImage(birdImgs.mid, bird.x, bird.y);
	flappyCtx.fillStyle = "#0f0";
	flappyCtx.font = "20px monospace";
	flappyCtx.fillText("Press Up/Click to Start", 50, canvasHeight / 2);
}

function randomY() {
	return Math.floor(Math.random() * -pipeTopImg.height);
}

function endFlappy() {
	clearInterval(gameLoopId);
	document.removeEventListener("keydown", flap);
	document.removeEventListener("click", flap);

	if (score >= 5) {
		const timeTaken = (Date.now() - startTime) / 1000;
		const finalScore = Math.floor((score * 100) / timeTaken);
		localStorage.setItem("flappy_score", finalScore);
		completeCurrentGame();
	} else {
		startFlappy();
	}
}
