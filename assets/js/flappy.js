let canvas, ctx;
const WIDTH = 288, HEIGHT = 512;

let bgImg = new Image(),
    birdImg = new Image(),
    pipeNorthImg = new Image(),
    pipeSouthImg = new Image();

let bird = { x: 50, y: 200, width: 34, height: 24, velocity: 0 };
let gravity = 1.2, flapForce = -15;
let pipes = [];
let pipeGap = 100, pipeWidth = 52;
let bgX = 0, bgSpeed = 1;
let score = 0;
let gameLoopId;

function initFlappyGame() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  loadAssets();
}

function loadAssets() {
  let assetsLoaded = 0;
  const totalAssets = 4;

  function checkStart() {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) startFlappy();
  }

  bgImg.onload = checkStart;
  birdImg.onload = checkStart;
  pipeNorthImg.onload = checkStart;
  pipeSouthImg.onload = checkStart;

  bgImg.src = "/assets/images/background-day.png";
  birdImg.src = "/assets/images/yellowbird-midflap.png";
  pipeNorthImg.src = "/assets/images/down.png";
  pipeSouthImg.src = "/assets/images/pipe-green.png";
}

function startFlappy() {
  bird.y = HEIGHT / 2;
  bird.velocity = 0;
  pipes = [{ x: WIDTH, y: Math.random() * (HEIGHT - pipeGap - pipeNorthImg.height) - pipeNorthImg.height }];
  score = 0;
  document.addEventListener("keydown", flap);
  document.addEventListener("click", flap);

  gameLoopId = setInterval(gameLoop, 1000 / 60);
}

function flap() {
  bird.velocity = flapForce;
}

function gameLoop() {
  // scroll background
  bgX = (bgX - bgSpeed) % WIDTH;
  ctx.drawImage(bgImg, bgX, 0);
  ctx.drawImage(bgImg, bgX + WIDTH, 0);

  // pipes logic
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    let bottomY = p.y + pipeNorthImg.height + pipeGap;

    ctx.drawImage(pipeNorthImg, p.x, p.y);
    ctx.drawImage(pipeSouthImg, p.x, bottomY);

    p.x -= 2;

    if (p.x === WIDTH - pipeWidth - 100) {
      pipes.push({
        x: WIDTH,
        y: Math.random() * (HEIGHT - pipeGap - pipeNorthImg.height) - pipeNorthImg.height
      });
    }

    // collision
    if (
      bird.x + bird.width > p.x &&
      bird.x < p.x + pipeWidth &&
      (bird.y < p.y + pipeNorthImg.height || bird.y + bird.height > bottomY)
    ) return endFlappy();

    if (p.x + pipeWidth === bird.x) score++;
  }

  // bird physics
  bird.velocity += gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.height >= HEIGHT || bird.y <= 0) return endFlappy();

  ctx.drawImage(birdImg, bird.x, bird.y);

  // score text
  ctx.fillStyle = "#FFF";
  ctx.font = "30px Courier New";
  ctx.fillText(score, WIDTH / 2, 50);
}

function endFlappy() {
  clearInterval(gameLoopId);
  document.removeEventListener("keydown", flap);
  document.removeEventListener("click", flap);

  const timeElapsed = (Date.now() - startTime) / 1000;
  const finalScore = Math.floor((score * 100) / timeElapsed);

  localStorage.setItem("flappy_score", finalScore);
  completeCurrentGame();
}
