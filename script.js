const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

let bird = {
    x: 50,
    y: 150,
    size: 30,
    gravity: 0.15,
    lift: -5,
    velocity: 0,
    image: new Image()
};

bird.image.src = 'assets/bird.png';

let pipes = [];
let frame = 0;
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;  // Load best score from localStorage
let gameOver = false;
let animationFrameId;
let paused = false;  // Pause flag
let soundEnabled = true;  // Sound toggle flag

let background = new Image();
background.src = 'assets/background.png';

let pipeImage = new Image();
pipeImage.src = 'assets/pipe.png';

let jumpSound = new Audio('assets/jump.mp3');
let hitSound = new Audio('assets/hit.mp3');
let fallSound = new Audio('assets/fall.mp3');

jumpSound.load();
hitSound.load();
fallSound.load();

function drawBackground() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawBird() {
    ctx.drawImage(bird.image, bird.x, bird.y, bird.size, bird.size);
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.velocity *= 0.95;
    bird.y += bird.velocity;

    if (bird.y + bird.size > canvas.height) {
        bird.y = canvas.height - bird.size;
        bird.velocity = 0;
        gameOver = true;
        if (soundEnabled) fallSound.play();
    }

    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.drawImage(pipeImage, pipe.x, 0, pipe.width, pipe.top);
        ctx.drawImage(pipeImage, pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= 2;
    });

    if (frame % 150 === 0) {
        const pipeWidth = 30;
        const pipeGap = 150;
        const pipeTopHeight = Math.random() * (canvas.height / 2);
        const pipeBottomHeight = canvas.height - pipeTopHeight - pipeGap;

        pipes.push({
            x: canvas.width,
            width: pipeWidth,
            top: pipeTopHeight,
            bottom: pipeBottomHeight,
            passed: false
        });
    }

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
}

function checkCollision() {
    pipes.forEach(pipe => {
        if (
            bird.x < pipe.x + pipe.width &&
            bird.x + bird.size > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.size > canvas.height - pipe.bottom)
        ) {
            gameOver = true;
            if (soundEnabled) hitSound.play();
        }
    });
}

function updateScore() {
    pipes.forEach(pipe => {
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score++;
            pipe.passed = true;
        }
    });
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function drawBestScore() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    const bestScoreText = `Best Score: ${bestScore}`;
    const bestScoreTextWidth = ctx.measureText(bestScoreText).width;
    ctx.fillText(bestScoreText, canvas.width - bestScoreTextWidth - 10, 30);
}

function updateBestScore() {
    bestScore = Math.max(score, bestScore);
    localStorage.setItem('bestScore', bestScore);
}

function gameLoop() {
    if (!paused && !gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        drawBird();
        updateBird();
        drawPipes();
        updatePipes();
        checkCollision();
        updateScore();
        frame++;
        drawScore();
        drawBestScore();
    } else if (gameOver) {
        updateBestScore();
        ctx.fillStyle = 'red';
        ctx.font = 'bold 32px Arial';
        const gameOverText = 'Game Over';
        const gameOverTextWidth = ctx.measureText(gameOverText).width;
        ctx.fillText(gameOverText, (canvas.width - gameOverTextWidth) / 2, canvas.height / 2);

        ctx.fillStyle = 'black';
        ctx.font = '24px Arial';
        ctx.fillText(`Current Score: ${score}`, (canvas.width - ctx.measureText(`Current Score: ${score}`).width) / 2, canvas.height / 2 + 40);
        ctx.fillText(`Best Score: ${bestScore}`, (canvas.width - ctx.measureText(`Best Score: ${bestScore}`).width) / 2, canvas.height / 2 + 80);
        ctx.fillText('Press Space or Arrow Up to Restart', (canvas.width - ctx.measureText('Press Space or Arrow Up to Restart').width) / 2, canvas.height / 2 + 120);
        return;
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

document.getElementById('startButton').addEventListener('click', () => {
    bird = { x: 50, y: 150, size: 30, gravity: 0.15, lift: -5, velocity: 0, image: new Image() };
    bird.image.src = 'assets/bird.png';
    pipes = [];
    frame = 0;
    score = 0;
    gameOver = false;
    document.getElementById('start-screen').style.display = 'none';
    cancelAnimationFrame(animationFrameId);
    gameLoop();
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (soundEnabled) {
            jumpSound.currentTime = 0;  // Reset the sound to the beginning
            jumpSound.play();
        }
        if (gameOver) {
            updateBestScore();
            bird = { x: 50, y: 150, size: 30, gravity: 0.15, lift: -5, velocity: 0, image: new Image() };
            bird.image.src = 'assets/bird.png';
            pipes = [];
            frame = 0;
            score = 0;
            gameOver = false;
            document.getElementById('start-screen').style.display = 'none';
            gameLoop();
        } else {
            bird.velocity = bird.lift;
        }
    } else if (e.code === 'Escape') {
        paused = !paused;
    }
});

canvas.addEventListener('click', () => {
    if (soundEnabled) {
        jumpSound.currentTime = 0;  // Reset the sound to the beginning
        jumpSound.play();
    }
    if (gameOver) {
        updateBestScore();
        bird = { x: 50, y: 150, size: 30, gravity: 0.15, lift: -5, velocity: 0, image: new Image() };
        bird.image.src = 'assets/bird.png';
        pipes = [];
        frame = 0;
        score = 0;
        gameOver = false;
        document.getElementById('start-screen').style.display = 'none';
        gameLoop();
    } else {
        bird.velocity = bird.lift;
    }
});



