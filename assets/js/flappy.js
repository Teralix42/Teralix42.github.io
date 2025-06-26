// Real Flappy Bird clone with assets
let bird, bg, pipeNorth, pipeSouth;
let gap = 120, constant;
let pipe = [];
let score = 0;
let bestScore = 0;
let gravity = 1.5;
let fly = -25;
let fps = 60;

// Load images
function loadImages() {
  bg = new Image(); bg.src = '/assets/images/background.png';
  bird = new Image(); bird.src = '/assets/images/yellowbird-midflap.png';
  pipeNorth = new Image(); pipeNorth.src = '/assets/images/down.png';
  pipeSouth = new Image(); pipeSouth.src = '/assets/images/pipe-green.png';
}

// Start Flappy game
function initFlappyGame() {
  loadImages();
  const cvs = document.getElementById('gameCanvas');
  const ctx = cvs.getContext('2d');

  let birdX = 50, birdY = cvs.height / 2;
  let velocity = 0;
  let pipeW = 80;
  
  constant = pipeNorth.height + gap;

  pipe[0] = { x: cvs.width, y: -Math.floor(Math.random() * pipeNorth.height) };

  document.addEventListener('keydown', flap);
  document.addEventListener('click', flap);

  const gameLoop = setInterval(() => {
    ctx.drawImage(bg, 0, 0);

    for (let i = 0; i < pipe.length; i++) {
      ctx.drawImage(pipeNorth, pipe[i].x, pipe[i].y);
      ctx.drawImage(pipeSouth, pipe[i].x, pipe[i].y + constant);

      pipe[i].x--;

      if (pipe[i].x === cvs.width - pipeW - 200) {
        const y = -Math.floor(Math.random() * pipeNorth.height);
        pipe.push({ x: cvs.width, y: y });
      }

      // Collision detection
      if (
        birdX + bird.width >= pipe[i].x && birdX <= pipe[i].x + pipeW &&
        (birdY <= pipe[i].y + pipeNorth.height || birdY + bird.height >= pipe[i].y + constant)
        || birdY + bird.height >= cvs.height
        || birdY <= 0
      ) {
        clearInterval(gameLoop);
        endFlappyGame();
      }

      // Score logic
      if (pipe[i].x + pipeW === birdX) {
        score++;
      }
    }

    ctx.drawImage(bird, birdX, birdY);
    birdY += velocity;
    velocity += gravity;

    ctx.fillStyle = '#000';
    ctx.font = '20px Courier New';
    ctx.fillText('Score: ' + score, 10, cvs.height - 20);
  }, 1000 / fps);
}

// Bird flap handler
function flap() {
  velocity = fly;
}

// On death, store score/time and clean up
function endFlappyGame() {
  const timeTaken = (Date.now() - startTime) / 1000;
  localStorage.setItem('flappy_score', score);
  completeCurrentGame();
}
