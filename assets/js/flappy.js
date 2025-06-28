let canvas, ctx;
const WIDTH = 288, HEIGHT = 512;

let bgImg = new Image(),
    birdImgs = [],
    pipeNorthImg = new Image(),
    pipeSouthImg = new Image(),
    baseImg = new Image();

let bird = { x: 50, y: 200, width: 34, height: 24, velocity: 0, frame: 0, frameCount: 0 };
let gravity = 1.2, flapForce = -15;
let pipes = [];
let pipeGap = 100, pipeWidth = 52;
let bgX = 0, baseX = 0, bgSpeed = 1, baseSpeed = 2;
let score = 0;
let gameLoopId;
let assetsLoaded = 0;

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
  const totalAssets = 6;

  function onAssetLoad() {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) startFlappy();
  }

  bgImg.onload = onAssetLoad;
  pipeNorthImg.onload = onAssetLoad;
  pipeSouthImg.onload = onAssetLoad;
  baseImg.onload = onAssetLoad;

  // Bird frames
  const up = new Image(), mid = new Image(), down = new Image();
  up.onload = mid.onload = down.onload = onAssetLoad;
  birdImgs = [up, mid, down];

  bgImg.src = "/assets/images/background-day.png";
  pipeNorthImg.src = "/assets/images/down.png";
  pipeSouthImg.src = "/assets/images/pipe-green.png";
  baseImg.src = "/assets/images/base.png";
  up.src = "/assets/images/yellowbird-upflap.png";
  mid.src = "/assets/images/yellowbird-midflap.png";
  down.src = "/assets/images/yellowbird-downflap.png";
}

function startFlappy() {
  bird.y = HEIGHT / 2;
  bird.velocity = 0;
  bird.frame = 0;
  bird.frameCount = 0;
  score = 0;
  pipes = [{ x: WIDTH, y: Math.random() * (HEIGHT - pipeGap - pipeNorthImg.height) - pipeNorthImg.height }];

  document.addEventListener("keydown", flap);
  document.addEventListener("click", flap);

  gameLoopId = setInterval(gameLoop, 1000 / 60);
}

function flap() {
  bird.velocity = flapForce;
}

function gameLoop() {
  // Draw scrolling background
  bgX = (bgX - bgSpeed) % WIDTH;
  ctx.drawImage(bgImg, bgX, 0);
  ctx.drawImage(bgImg, bgX + WIDTH, 0);

  // Pipes
  for (let p of pipes) {
    let bottomY = p.y + pipeNorthImg.height + pipeGap;
    ctx.drawImage(pipeNorthImg, p.x, p.y);
    ctx.drawImage(pipeSouthImg, p.x, bottomY);
    p.x -= 2;
    if (p.x === WIDTH - pipeWidth - 100) {
      pipes.push({ x: WIDTH, y: Math.random() * (HEIGHT - pipeGap - pipeNorthImg.height) - pipeNorthImg.height });
    }
    if ((bird.x + bird.width > p.x && bird.x < p.x + pipeWidth &&
        (bird.y < p.y + pipeNorthImg.height || bird.y + bird.height > bottomY)) ||
        bird.y + bird.height >= HEIGHT - baseImg.height) {
      return endFlappy();
    }
    if (p.x + pipeWidth === bird.x) score++;
  }

  // Bird physics & animation
  bird.velocity += gravity;
  bird.y += bird.velocity;
  bird.frameCount++;
  if (bird.frameCount === 5) { // switch every 5 frames for 12 FPS
    bird.frame = (bird.frame + 1) % birdImgs.length;
    bird.frameCount = 0;
  }
  ctx.drawImage(birdImgs[bird.frame], bird.x, bird.y);

  // Draw floor (scrolling)
  baseX = (baseX - baseSpeed) % WIDTH;
  ctx.drawImage(baseImg, baseX, HEIGHT - baseImg.height);
  ctx.drawImage(baseImg, baseX + WIDTH, HEIGHT - baseImg.height);

  // Score
  ctx.fillStyle = "#FFF";
  ctx.font = "30px Courier New";
  ctx.fillText(score, WIDTH / 2, 50);
}

function endFlappy() {
	clearInterval(gameLoopId);
	document.removeEventListener("keydown", flap);
	document.removeEventListener("click", flap);

	if (score >= 5) {
		const timeElapsed = (Date.now() - startTime) / 1000;
		const finalScore = Math.floor((score * 100) / timeElapsed);
		localStorage.setItem("flappy_score", finalScore);
		completeCurrentGame();
	} else {
		// Restart quietly, no alert
		startFlappy(); 
	}
}
