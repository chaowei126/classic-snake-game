const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameOverElement = document.getElementById('game-over');
const startScreenElement = document.getElementById('start-screen');
const startButton = document.getElementById('start-btn');

const gridSize = 20;
const canvasSize = 400;

let snake, food, score, direction, gameSpeed;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let changingDirection = false;
let gameLoopTimeout;
let isGameRunning = false;

highScoreElement.textContent = `最高分: ${highScore}`;

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    food = {};
    score = 0;
    direction = 'right';
    gameSpeed = 100;
    
    scoreElement.textContent = score;
    drawInitialState();
}

function drawInitialState() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    // Draw initial snake
    ctx.fillStyle = '#00ff00';
    ctx.strokeStyle = '#1a1a1a';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize, gridSize);
    ctx.strokeRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize, gridSize);
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvasSize / gridSize)),
        y: Math.floor(Math.random() * (canvasSize / gridSize))
    };
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) {
            generateFood();
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    snake.forEach(part => {
        ctx.fillStyle = '#00ff00';
        ctx.strokeStyle = '#1a1a1a';
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
    });
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function moveSnake() {
    const head = { x: snake[0].x, y: snake[0].y };
    switch (direction) {
        case 'up': head.y -= 1; break;
        case 'down': head.y += 1; break;
        case 'left': head.x -= 1; break;
        case 'right': head.x += 1; break;
    }
    snake.unshift(head);
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvasSize / gridSize || head.y < 0 || head.y >= canvasSize / gridSize) {
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function gameLoop() {
    if (!isGameRunning) return;
    
    changingDirection = false;
    moveSnake();

    if (checkCollision()) {
        endGame();
        return;
    }

    if (snake[0].x === food.x && snake[0].y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
        gameSpeed = Math.max(50, gameSpeed - 2);
    } else {
        snake.pop();
    }

    draw();
    gameLoopTimeout = setTimeout(gameLoop, gameSpeed);
}

function changeDirection(event) {
    if (changingDirection || !isGameRunning) return;
    changingDirection = true;

    const keyPressed = event.key;
    const goingUp = direction === 'up';
    const goingDown = direction === 'down';
    const goingLeft = direction === 'left';
    const goingRight = direction === 'right';

    if ((keyPressed === 'ArrowUp' || keyPressed === 'w') && !goingDown) direction = 'up';
    if ((keyPressed === 'ArrowDown' || keyPressed === 's') && !goingUp) direction = 'down';
    if ((keyPressed === 'ArrowLeft' || keyPressed === 'a') && !goingRight) direction = 'left';
    if ((keyPressed === 'ArrowRight' || keyPressed === 'd') && !goingLeft) direction = 'right';
}

function setupButtonControls() {
    document.getElementById('up-btn').addEventListener('click', () => changeDirectionByKey('ArrowUp'));
    document.getElementById('down-btn').addEventListener('click', () => changeDirectionByKey('ArrowDown'));
    document.getElementById('left-btn').addEventListener('click', () => changeDirectionByKey('ArrowLeft'));
    document.getElementById('right-btn').addEventListener('click', () => changeDirectionByKey('ArrowRight'));
}

function changeDirectionByKey(key) {
    changeDirection({ key: key });
}

function startGame() {
    if (isGameRunning) return;
    isGameRunning = true;
    
    startScreenElement.classList.add('hidden');
    gameOverElement.classList.add('hidden');
    
    resetGame();
    generateFood();
    gameLoop();
}

function endGame() {
    isGameRunning = false;
    clearTimeout(gameLoopTimeout);
    gameOverElement.classList.remove('hidden');

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = `最高分: ${highScore}`;
    }
}

function handleRestart(event) {
    if (event.key === 'Enter' && !isGameRunning) {
        startGame();
    }
}

// Initial setup
drawInitialState(); // Draw something on canvas at start
setupButtonControls();
document.addEventListener('keydown', changeDirection);
document.addEventListener('keydown', handleRestart);
startButton.addEventListener('click', startGame);
