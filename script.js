const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameOverElement = document.getElementById('game-over');

const gridSize = 20;
const canvasSize = 400;

let snake = [{ x: 10, y: 10 }];
let food = {};
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let direction = 'right';
let changingDirection = false;
let gameIsOver = false;
let gameSpeed = 100; // ms per update

highScoreElement.textContent = `最高分: ${highScore}`;

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (canvasSize / gridSize)),
        y: Math.floor(Math.random() * (canvasSize / gridSize))
    };
    // Ensure food doesn't spawn on the snake
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) {
            generateFood();
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw snake
    snake.forEach(part => {
        ctx.fillStyle = '#00ff00';
        ctx.strokeStyle = '#1a1a1a';
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
    });

    // Draw food
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

    // Wall collision
    if (head.x < 0 || head.x * gridSize >= canvasSize || head.y < 0 || head.y * gridSize >= canvasSize) {
        return true;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

function updateGame() {
    if (gameIsOver) return;
    
    changingDirection = false;
    moveSnake();

    if (checkCollision()) {
        endGame();
        return;
    }

    // Check for food
    if (snake[0].x === food.x && snake[0].y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
        // Speed up slightly as the game progresses
        gameSpeed = Math.max(50, gameSpeed - 2);
    } else {
        snake.pop();
    }

    draw();
    setTimeout(updateGame, gameSpeed);
}

function changeDirection(event) {
    if (changingDirection) return;
    changingDirection = true;

    const keyPressed = event.key;
    const goingUp = direction === 'up';
    const goingDown = direction === 'down';
    const goingLeft = direction === 'left';
    const goingRight = direction === 'right';

    if (keyPressed === 'ArrowUp' && !goingDown) direction = 'up';
    if (keyPressed === 'ArrowDown' && !goingUp) direction = 'down';
    if (keyPressed === 'ArrowLeft' && !goingRight) direction = 'left';
    if (keyPressed === 'ArrowRight' && !goingLeft) direction = 'right';
}

function endGame() {
    gameIsOver = true;
    gameOverElement.classList.remove('hidden');

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = `最高分: ${highScore}`;
    }
}

function restartGame(event) {
    if (event.key === 'Enter' && gameIsOver) {
        gameIsOver = false;
        gameOverElement.classList.add('hidden');
        snake = [{ x: 10, y: 10 }];
        score = 0;
        scoreElement.textContent = '0';
        direction = 'right';
        gameSpeed = 100;
        main();
    }
}

function setupButtonControls() {
    document.getElementById('up-btn').addEventListener('click', () => changeDirectionByKey('ArrowUp'));
    document.getElementById('down-btn').addEventListener('click', () => changeDirectionByKey('ArrowDown'));
    document.getElementById('left-btn').addEventListener('click', () => changeDirectionByKey('ArrowLeft'));
    document.getElementById('right-btn').addEventListener('click', () => changeDirectionByKey('ArrowRight'));
}

function changeDirectionByKey(key) {
    // This function simulates a keydown event for the main logic
    changeDirection({ key: key });
}

function main() {
    generateFood();
    updateGame();
    setupButtonControls(); // Initialize button controls
}


document.addEventListener('keydown', changeDirection);
document.addEventListener('keydown', restartGame);
main();
