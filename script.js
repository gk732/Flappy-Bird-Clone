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
let bestScore = 0; // Initialize best score
let gameOver = false;
let animationFrameId;

// Load background and pipe images
let background = new Image();
background.src = 'assets/background.png';

let pipeImage = new Image();
pipeImage.src = 'assets/pipe.png';

// Load sound effects
let jumpSound = new Audio('assets/jump.mp3');
let hitSound = new Audio('assets/hit.mp3');
let fallSound = new Audio('assets/fall.mp3');

// Preload sounds to ensure they are ready
jumpSound.load();
hitSound.load();
fallSound.load();

// Draw the background
function drawBackground() {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

// Draw the bird
function drawBird() {
    ctx.drawImage(bird.image, bird.x, bird.y, bird.size, bird.size);
}

// Update bird's position
function updateBird() {
    bird.velocity += bird.gravity;
    bird.velocity *= 0.95;
    bird.y += bird.velocity;

    if (bird.y + bird.size > canvas.height) {
        bird.y = canvas.height - bird.size;
        bird.velocity = 0;
        gameOver = true;
        fallSound.play(); // Play fall sound
    }

    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

// Pipe generation
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

// Collision detection
function checkCollision() {
    pipes.forEach(pipe => {
        if (
            bird.x < pipe.x + pipe.width &&
            bird.x + bird.size > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.size > canvas.height - pipe.bottom)
        ) {
            gameOver = true;
            hitSound.play(); // Play hit sound
        }
    });
}

// Score update
function updateScore() {
    pipes.forEach(pipe => {
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score++;
            pipe.passed = true;
        }
    });
}

// Draw the score
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// Draw the best score
function drawBestScore() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    const bestScoreText = `Best Score: ${bestScore}`;
    const bestScoreTextWidth = ctx.measureText(bestScoreText).width;
    ctx.fillText(bestScoreText, canvas.width - bestScoreTextWidth - 10, 30); // Adjust the x position dynamically
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    if (!gameOver) {
        drawBird();
        updateBird();
        drawPipes();
        updatePipes();
        checkCollision();
        updateScore();

        frame++;
    } else {
        ctx.fillStyle = 'red';
        ctx.font = 'bold 32px Arial';
        const gameOverText = 'Game Over';
        const gameOverTextWidth = ctx.measureText(gameOverText).width;
        ctx.fillText(gameOverText, (canvas.width - gameOverTextWidth) / 2, canvas.height / 2);

        ctx.fillStyle = 'black'; // Set color to black for scores
        ctx.font = '24px Arial';
        const currentScoreText = `Current Score: ${score}`;
        const currentScoreTextWidth = ctx.measureText(currentScoreText).width;
        ctx.fillText(currentScoreText, (canvas.width - currentScoreTextWidth) / 2, canvas.height / 2 + 40);

        const bestScoreText = `Best Score: ${bestScore}`;
        const bestScoreTextWidth = ctx.measureText(bestScoreText).width;
        ctx.fillText(bestScoreText, (canvas.width - bestScoreTextWidth) / 2, canvas.height / 2 + 80);

        ctx.fillStyle = 'black'; // Set color to black for restart instruction
        ctx.font = '24px Arial';
        const restartText = 'Press Space or Arrow Up to Restart';
        const restartTextWidth = ctx.measureText(restartText).width;
        ctx.fillText(restartText, (canvas.width - restartTextWidth) / 2, canvas.height / 2 + 120);

        return; // Exit the loop to prevent further updates
    }

    drawScore();
    drawBestScore(); // Draw the best score
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Handle game start
document.getElementById('startButton').addEventListener('click', () => {
    bird = { x: 50, y: 150, size: 30, gravity: 0.15, lift: -5, velocity: 0, image: new Image() };
    bird.image.src = 'assets/bird.png';
    pipes = [];
    frame = 0;
    score = 0;
    gameOver = false;
    document.getElementById('start-screen').style.display = 'none';
    cancelAnimationFrame(animationFrameId);
    gameLoop(); // Start the game loop here
});

// Handle bird jump with keyboard
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        jumpSound.currentTime = 0; // Reset the sound to start
        jumpSound.play(); // Play jump sound every time the key is pressed

        if (gameOver) {
            // Update best score if current score is higher
            bestScore = Math.max(score, bestScore); 
            bird = { x: 50, y: 150, size: 30, gravity: 0.15, lift: -5, velocity: 0, image: new Image() };
            bird.image.src = 'assets/bird.png'; // Reset the bird image on restart
            pipes = [];
            frame = 0;
            score = 0;
            gameOver = false;
            document.getElementById('start-screen').style.display = 'none';
            gameLoop();
        } else {
            bird.velocity = bird.lift; // Apply lift to the bird if the game is not over
        }
    }
});

// Handle touch event for jump on the entire game area
canvas.addEventListener('click', () => {
    jumpSound.currentTime = 0; // Reset the sound to start
    jumpSound.play(); // Play jump sound on click

    if (gameOver) {
        // Update best score if current score is higher
        bestScore = Math.max(score, bestScore); 
        bird = { x: 50, y: 150, size: 30, gravity: 0.15, lift: -5, velocity: 0, image: new Image() };
        bird.image.src = 'assets/bird.png'; // Reset the bird image on restart
        pipes = [];
        frame = 0;
        score = 0;
        gameOver = false;
        document.getElementById('start-screen').style.display = 'none';
        gameLoop();
    } else {
        bird.velocity = bird.lift; // Apply lift to the bird if the game is not over
    }
});
