// --- Constants & State (keep these unchanged) ---
let canvas, ctx;
const WIDTH = 288, HEIGHT = 512;

let bgImg = new Image(),
    birdImgs = [],
    pipeImg = new Image(),
    baseImg = new Image(),
    digitImgs = [];

let bird = { x: 50, y: 300, width: 34, height: 24, velocity: 0, frame: 0, frameCount: 0, angle: 0 };
let gravity = 0.5, flapForce = -7;
let pipes = [];
let pipeGap = 100, pipeWidth = 52;
let bgX = 0, baseX = 0, bgSpeed = 1, baseSpeed = 2;
let score = 0;
let isRunning = false, waitingForStart = false;
let lastTime = 0;

function initFlappyGame() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  canvas.width = WIDTH; canvas.height = HEIGHT;
  canvas.style.width = "100%"; canvas.style.maxWidth = WIDTH + "px";
  canvas.style.height = "auto";
  loadAssets();
}

function loadAssets() {
  const totalAssets = 16; let loaded = 0;
  const loadingDiv = document.createElement("div");
  loadingDiv.style.cssText = "color:white;font-family:monospace;text-align:center;margin-top:10px";
  loadingDiv.innerText = "Loading: 0%";
  document.body.appendChild(loadingDiv);

  const onLoad = () => {
    if (++loaded === totalAssets) {
      document.body.removeChild(loadingDiv);
      waitForFlap();
    } else {
      loadingDiv.innerText = `Loading: ${Math.floor((loaded/totalAssets)*100)}%`;
    }
  };

  bgImg.onload = pipeImg.onload = baseImg.onload = onLoad;
  const up = new Image(), mid = new Image(), down = new Image();
  birdImgs = [up, mid, down];
  up.onload = mid.onload = down.onload = onLoad;

  bgImg.src = "/assets/images/flappy/background-night.png";
  pipeImg.src = "/assets/images/flappy/pipe.png";
  baseImg.src = "/assets/images/flappy/base.png";
  up.src = "/assets/images/flappy/up-flap.png";
  mid.src = "/assets/images/flappy/mid-flap.png";
  down.src = "/assets/images/flappy/down-flap.png";

  for(let i=0;i<10;i++){
    const img = new Image(); img.onload = onLoad;
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
  if (["click","Space","ArrowUp"].includes(e.type==="click" ? "click" : e.code)) {
    waitingForStart = false;
    document.removeEventListener("keydown", startOnFlap);
    document.removeEventListener("click", startOnFlap);
    bird.velocity = flapForce;
    bird.angle = -45 * Math.PI/180;
    startFlappy();
  }
}

function resetGame() {
  Object.assign(bird, { y: HEIGHT/2, velocity:0, frame:0, frameCount:0, angle: 0 });
  score = 0;
  pipes = [{ x: WIDTH, y: randomPipeY() }];
  bgX = baseX = 0;
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
  bird.angle = -45 * Math.PI/180; // instant flap tilt
}

function gameLoop(timestamp) {
  const delta = (timestamp - lastTime) / (1000/60);
  lastTime = timestamp;
  updateGame(delta);
  drawGame();
  if (isRunning) requestAnimationFrame(gameLoop);
}

function updateGame(delta) {
  bgX = (bgX - bgSpeed) % WIDTH;
  baseX = (baseX - baseSpeed) % WIDTH;
  pipes.forEach(p => p.x -= 2);
  const last = pipes[pipes.length-1];
  if (last.x <= WIDTH - pipeWidth - 100) pipes.push({x: WIDTH, y: randomPipeY()});
  
  for (let p of pipes){
    const bottomY = p.y + pipeImg.height + pipeGap;
    if (bird.x + bird.width > p.x && bird.x < p.x + pipeWidth &&
       (bird.y < p.y + pipeImg.height || bird.y + bird.height > bottomY)) return endFlappy();
  }

  if (bird.y + bird.height >= HEIGHT - baseImg.height || bird.y <= 0) return endFlappy();

  pipes.forEach(p => {
    if (!p.scored && p.x + pipeWidth < bird.x) { score++; p.scored = true; }
  });

  bird.velocity += gravity * delta;
  bird.y += bird.velocity;

  if (bird.angle < Math.PI/2) bird.angle += 0.03; // tilt downward gradually

  bird.frameCount++;
  if (bird.frameCount >= 5) { bird.frame = (bird.frame +1) % birdImgs.length; bird.frameCount = 0; }
}

function drawGame() {
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  ctx.drawImage(bgImg, bgX,0); ctx.drawImage(bgImg, bgX+WIDTH,0);

  pipes.forEach(p => {
    const bottomY = p.y + pipeImg.height + pipeGap;
    ctx.save();
    ctx.translate(p.x + pipeWidth/2, p.y + pipeImg.height/2);
    ctx.scale(1,-1);
    ctx.drawImage(pipeImg, -pipeWidth/2, -pipeImg.height/2);
    ctx.restore();
    ctx.drawImage(pipeImg, p.x, bottomY);
  });

  ctx.save();
  ctx.translate(bird.x + bird.width/2, bird.y + bird.height/2);
  ctx.rotate(bird.angle);
  ctx.drawImage(birdImgs[bird.frame], -bird.width/2, -bird.height/2);
  ctx.restore();

  ctx.drawImage(baseImg, baseX, HEIGHT - baseImg.height);
  ctx.drawImage(baseImg, baseX + WIDTH, HEIGHT - baseImg.height);
  drawScore();
}

function drawFrame() {
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  ctx.drawImage(bgImg, bgX,0); ctx.drawImage(bgImg, bgX+WIDTH,0);
  ctx.drawImage(birdImgs[1], bird.x, bird.y);
  ctx.drawImage(baseImg, baseX, HEIGHT - baseImg.height);
  ctx.drawImage(baseImg, baseX + WIDTH, HEIGHT - baseImg.height);
  ctx.fillStyle="#FFF"; ctx.font="20px Courier New";
  ctx.fillText("Press Up or Click to start", 30, HEIGHT/2);
}

function endFlappy() {
  isRunning = false;
  document.removeEventListener("keydown", flap);
  document.removeEventListener("click", flap);
  if (score >= 5) {
    const timeElapsed = (Date.now() - startTime)/1000;
    const finalScore = Math.floor((score*100)/timeElapsed);
    localStorage.setItem("flappy_score", finalScore);
    completeCurrentGame();
  } else waitForFlap(); // quiet retry
}

function drawScore() {
  const digits = String(score).split('');
  let x = (WIDTH - digits.length * digitImgs[0].width)/2;
  for (let d of digits) { ctx.drawImage(digitImgs[+d], x, 20); x += digitImgs[0].width; }
}

function randomPipeY() {
  const min = HEIGHT - baseImg.height - pipeGap - 462;
  const max = HEIGHT - baseImg.height - pipeGap - 250;
  const bottom = Math.random() * (Math.abs(max-min)) + min;
  return bottom - pipeImg.height;
}
