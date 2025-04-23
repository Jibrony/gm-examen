let paddle, ball, blocks = [], level = 1;
let cols = 8;
let rows = 4;
let score = 0;
let lives = 3;
let gameStarted = false;
let hitSound;

function preload() {
    hitSound = loadSound('hit.wav');
}

function setup() {
    createCanvas(600, 400);
    paddle = new Paddle();
    ball = new Ball();
    createBlocks();
}

function draw() {
    background(30, 30, 40);
    paddle.display();
    paddle.move();

    if (gameStarted) ball.move();
    ball.display();
    ball.checkEdges(paddle);

    for (let i = blocks.length - 1; i >= 0; i--) {
        blocks[i].display();
        if (ball.hits(blocks[i])) {
            let block = blocks[i];

            // Determinar si el impacto fue lateral o vertical
            let overlapLeft = ball.x + ball.r - block.x;
            let overlapRight = block.x + block.w - (ball.x - ball.r);
            let overlapTop = ball.y + ball.r - block.y;
            let overlapBottom = block.y + block.h - (ball.y - ball.r);
            let minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            if (minOverlap === overlapTop || minOverlap === overlapBottom) {
                ball.yspeed *= -1;
            } else {
                ball.xspeed *= -1;
            }

            // Reproducir el sonido de colisión
            if (hitSound && hitSound.isLoaded()) {
                hitSound.setVolume(random(0.5, 0.8));
                hitSound.play(); // sonido al impactar
            }

            if (block.hit()) {
                blocks.splice(i, 1);
                score++;
            }
        }
    }

    displayUI();

    if (blocks.length === 0) nextLevel();

    if (ball.offScreen()) {
        lives--;
        gameStarted = false;
        ball.reset();
        if (lives < 0) {
            background(0);
            fill(255, 0, 0);
            textAlign(CENTER, CENTER);
            textSize(32);
            text("Game Over", width / 2, height / 2);
            noLoop();
        }
    }
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) paddle.setDir(-1);
    else if (keyCode === RIGHT_ARROW) paddle.setDir(1);
    else if (key === ' ' && !gameStarted) gameStarted = true;
}

function keyReleased() {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) paddle.setDir(0);
}

function displayUI() {
    fill(255);
    textSize(16);
    text(`Puntuación: ${score}`, 10, 20);
    text(`Vidas: ${lives}`, 10, 40);
    text(`Nivel: ${level}`, 10, 60);
    if (!gameStarted) text("Presiona ESPACIO para lanzar la pelota", width / 2 - 130, height / 2);
}

function createBlocks() {
    blocks = [];
    let totalRows = rows + level - 1;
    let hitsPerLevel = level; // 1 para nivel 1, 2 para nivel 2, etc.

    for (let r = 0; r < totalRows; r++) {
        for (let c = 0; c < cols; c++) {
            let x = c * 70 + 35;
            let y = r * 30 + 30;
            let hits = hitsPerLevel;

            blocks.push(new Block(x, y, hits));
        }
    }
}



function nextLevel() {
    if (level < 3) {
        level++;
        ball.speedUp();
        createBlocks();
        ball.reset();
        gameStarted = false;
    } else {
        fill(0, 255, 0);
        textAlign(CENTER, CENTER);
        textSize(32);
        text("¡Ganaste!", width / 2, height / 2);
        noLoop();
    }
}

class Paddle {
    constructor() {
        this.w = 100;
        this.h = 15;
        this.x = width / 2 - this.w / 2;
        this.y = height - 30;
        this.dir = 0;
    }

    display() {
        fill(255);
        rect(this.x, this.y, this.w, this.h);
    }

    move() {
        this.x += this.dir * 7;
        this.x = constrain(this.x, 0, width - this.w);
    }

    setDir(dir) {
        this.dir = dir;
    }
}

class Ball {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = width / 2;
        this.y = height / 2;
        this.r = 10;
        this.speed = 3 + level;
        this.xspeed = this.speed;
        this.yspeed = -this.speed;
    }

    move() {
        this.x += this.xspeed;
        this.y += this.yspeed;
    }

    display() {
        fill(255);
        ellipse(this.x, this.y, this.r * 2);
    }

    checkEdges(paddle) {
        if (this.x < this.r || this.x > width - this.r) this.xspeed *= -1;
        if (this.y < this.r) this.yspeed *= -1;

        if (
            this.y + this.r > paddle.y &&
            this.x > paddle.x &&
            this.x < paddle.x + paddle.w
        ) {
            this.yspeed *= -1;
            this.y = paddle.y - this.r;
        }
    }

    hits(block) {
        return (
            this.x > block.x &&
            this.x < block.x + block.w &&
            this.y - this.r < block.y + block.h &&
            this.y + this.r > block.y
        );
    }

    offScreen() {
        return this.y > height;
    }

    speedUp() {
        this.speed += 1;
        this.xspeed = this.speed * Math.sign(this.xspeed);
        this.yspeed = -this.speed;
    }
}

class Block {
    constructor(x, y, hits) {
        this.x = x;
        this.y = y;
        this.w = 60;
        this.h = 20;
        this.hits = hits;
        this.totalHits = hits; // Guarda el total de golpes necesarios
    }

    display() {
        if (this.hits === -1) {
            fill(150); // Irrompible
        } else {
            // Cambiar color según cuántos golpes le quedan
            if (this.hits === 3) fill(255, 0, 0);       // Rojo
            else if (this.hits === 2) fill(255, 165, 0); // Amarillo
            else if (this.hits === 1) fill(0, 255, 0);    // Verde
        }
        rect(this.x, this.y, this.w, this.h);
    }

    hit() {
        if (this.hits === -1) return false;
        this.hits--;
        return this.hits <= 0;
    }
}

