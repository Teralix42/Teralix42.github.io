let canvas, ctx;
const WIDTH = 288, HEIGHT = 512;

let bgImg = new Image(),
	birdImgs = [],
	pipeImg = new Image(),
	baseImg = new Image(),
	digitImgs = [];

let bird = { x: 50, y: 250, width: 34, height: 24, velocity: 0, frame: 0, frameCount: 0 };
let gravity = 1.0, flapForce = -14;
let pipes = [];
let pipeGap = 100, pipeWidth = 52;
let bgX = 0, baseX = 0, bgSpeed = 1, baseSpeed = 2;
let score = 0;
let isRunning = false;
let waitingForStart = false;
let assetsLoaded = 0;
let lastTime = 0;

function initFlappyGame() {
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	canvas.style.width = "100%";
	canvas.style.maxWidth = WIDTH + "px";
	canvas.style.height = "auto";

	loadAssets();
}

function loadAssets() {
	const totalAssets = 5 + 3 + 10; // bg, pipe, base + bird frames + digits
	let loaded = 0;

	const onLoad = () => {
		loaded++;
		if (loaded === totalAssets) waitForFlap();
	};

	bgImg.onload = onLoad;
	pipeImg.onload = onLoad;
	baseImg.onload = onLoad;

	const up = new Image(), mid = new Image(), down = new Image();
	birdImgs = [up, mid, down];
	up.onload = onLoad;
	mid.onload = onLoad;
	down.onload = onLoad;

	bgImg.src = "/assets/images/flappy/background-night.png";
	pipeImg.src = "/assets/images/flappy/pipe.png";
	baseImg.src = "/assets/images/flappy/base.png";
	up.src = "/assets/images/flappy/up-flap.png";
	mid.src = "/assets/images/flappy/mid-flap.png";
	down.src = "/assets/images/flappy/down-flap.png";

	// Score digits 0-9
	for (let i = 0; i <= 9; i++) {
		let img = new Image();
		img.onload = onLoad;
		img.src = `/assets/images/flappy/${i}.png`;
		digitImgs.push(img);
	}
}

function waitForFlap() {
	resetGame();
	waitingForStart = true;
	drawFrame();
	document.addEventListener("keydown", startOnFlap);
	document.addEventListener("click", startOnFlap);
}

function startOnFlap(e) {
	if (e.type === "click" || e.code === "ArrowUp" || e.key === " ") {
		waitingForStart = false;
		document.removeEventListener("keydown", startOnFlap);
		document.removeEventListener("click", startOnFlap);
		flap();
		startFlappy();
	}
}

function resetGame() {
	bird.y = HEIGHT / 2;
	bird.velocity = 0;
	bird.frame = 0;
	bird.frameCount = 0;
	score = 0;
	pipes = [{ x: WIDTH, y: randomPipeY() }];
	bgX = 0;
	baseX = 0;
}

function startFlappy() {
	isRunning = true;
	document.addEventListener("keydown", flap);
	document.addEventListener("click", flap);
	lastTime = performance.now();
	requestAnimationFrame(gameLoop);
}

function flap() {
	if (!isRunning) return;
	bird.velocity = flapForce;
}

function gameLoop(timestamp) {
	const delta = (timestamp - lastTime) / (1000 / 60); // 1 = 60fps, 2 = 30fps, etc.
	lastTime = timestamp;

	update(delta);
	draw();

	if (isRunning) requestAnimationFrame(gameLoop);
}

function update(delta) {
	bgX = (bgX - bgSpeed * delta) % WIDTH;
	baseX = (baseX - baseSpeed * delta) % WIDTH;

	for (let p of pipes) {
		p.x -= 2 * delta;

		let bottomY = p.y + pipeImg.height + pipeGap;

		if (
			bird.x + bird.width > p.x &&
			bird.x < p.x + pipeWidth &&
			(bird.y < p.y + pipeImg.height || bird.y + bird.height > bottomY)
		) {
			endFlappy();
			return;
		}
	}

	if (pipes[pipes.length - 1].x < WIDTH - pipeWidth - 100) {
		pipes.push({ x: WIDTH, y: randomPipeY() });
	}

	if (bird.y + bird.height >= HEIGHT - baseImg.height || bird.y <= 0) {
		endFlappy();
		return;
	}

	for (let i = 0; i < pipes.length; i++) {
		if (pipes[i].x + pipeWidth === bird.x) score++;
	}

	bird.velocity += gravity * delta;
	bird.y += bird.velocity * delta;

	bird.frameCount++;
	if (bird.frameCount >= 5) {
		bird.frame = (bird.frame + 1) % birdImgs.length;
		bird.frameCount = 0;
	}
}

function draw() {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);

	ctx.drawImage(bgImg, bgX, 0);
	ctx.drawImage(bgImg, bgX + WIDTH, 0);

	for (let p of pipes) {
		let bottomY = p.y + pipeImg.height + pipeGap;

		// Top pipe flipped
		ctx.save();
		ctx.translate(p.x + pipeWidth / 2, p.y + pipeImg.height / 2);
		ctx.scale(1, -1);
		ctx.drawImage(pipeImg, -pipeWidth / 2, -pipeImg.height / 2);
		ctx.restore();

		// Bottom pipe
		ctx.drawImage(pipeImg, p.x, bottomY);
	}

	ctx.drawImage(birdImgs[bird.frame], bird.x, bird.y);

	ctx.drawImage(baseImg, baseX, HEIGHT - baseImg.height);
	ctx.drawImage(baseImg, baseX + WIDTH, HEIGHT - baseImg.height);

	drawScore();
}

function drawFrame() {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);

	ctx.drawImage(bgImg, bgX, 0);
	ctx.drawImage(bgImg, bgX + WIDTH, 0);

	ctx.drawImage(birdImgs[1], bird.x, bird.y); // mid flap

	ctx.drawImage(baseImg, baseX, HEIGHT - baseImg.height);
	ctx.drawImage(baseImg, baseX + WIDTH, HEIGHT - baseImg.height);

	ctx.fillStyle = "#FFF";
	ctx.font = "20px Courier New";
	ctx.fillText("Press Up or Click to start", 30, HEIGHT / 2);
}

function drawScore() {
	const digits = String(score).split("");
	const totalWidth = digits.length * digitImgs[0].width;
	const startX = (WIDTH - totalWidth) / 2;

	for (let i = 0; i < digits.length; i++) {
		let digit = parseInt(digits[i]);
		ctx.drawImage(digitImgs[digit], startX + i * digitImgs[0].width, 50);
	}
}

function endFlappy() {
	isRunning = false;
	document.removeEventListener("keydown", flap);
	document.removeEventListener("click", flap);

	if (score >= 5) {
		const timeElapsed = (Date.now() - startTime) / 1000;
		const finalScore = Math.floor((score * 100) / timeElapsed);
		localStorage.setItem("flappy_score", finalScore);
		completeCurrentGame();
	} else {
		waitForFlap();
	}
}

function randomPipeY() {
	return Math.random() * (HEIGHT - pipeGap - pipeImg.height) - pipeImg.height;
}
