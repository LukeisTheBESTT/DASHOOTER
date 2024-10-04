const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

class Player {
  constructor() {
    this.width = 50;
    this.height = 30;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 10;
    this.speed = 15;
    this.moveLeft = false;
    this.moveRight = false;
  }

  draw() {
    ctx.fillStyle = "cyan";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    if (this.moveLeft && this.x > 0) {
      this.x -= this.speed;
    }
    if (this.moveRight && this.x < canvas.width - this.width) {
      this.x += this.speed;
    }
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 15;
    this.speed = 5;
  }

  draw() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y -= this.speed;
  }
}

class Enemy {
  constructor() {
    this.width = 45;
    this.height = 45;
    this.x = Math.random() * (canvas.width - this.width);
    this.y = -this.height;
    this.speed = 1.5;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y += this.speed;
  }
}

let player;
let bullets;
let enemies;
let score;
let gameOver;
let canShoot = true;
const shootCooldown = 1; // 1 ms cooldown between shots

function initGame() {
  player = new Player();
  bullets = [];
  enemies = [];
  score = 0;
  gameOver = false;
  canShoot = true;
}

initGame();

// Game controls
document.addEventListener("keydown", (e) => {
  if (!gameOver) {
    if (e.key === "ArrowLeft") {
      player.moveLeft = true;
    }
    if (e.key === "ArrowRight") {
      player.moveRight = true;
    }
    if (e.key === " " && canShoot) {
      shootBullet();
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") {
    player.moveLeft = false;
  }
  if (e.key === "ArrowRight") {
    player.moveRight = false;
  }
});

function shootBullet() {
  bullets.push(new Bullet(player.x + player.width / 2 - 2.5, player.y));
  canShoot = false; // Prevent shooting again until cooldown finishes
  setTimeout(() => {
    canShoot = true; // Allow shooting after cooldown period
  }, shootCooldown);
}

// Collision detection
function detectCollision(bullet, enemy) {
  return (
    bullet.x < enemy.x + enemy.width &&
    bullet.x + bullet.width > enemy.x &&
    bullet.y < enemy.y + enemy.height &&
    bullet.y + bullet.height > enemy.y
  );
}

function restartGame() {
  initGame(); // Reset the game variables
  gameLoop(); // Restart the game loop
}

// Game loop
function gameLoop() {
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over!", canvas.width / 2 - 100, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press Enter to Restart", canvas.width / 2 - 100, canvas.height / 2 + 40);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        restartGame(); // Restart when the game is over and Enter is pressed
      }
    });
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update();
  player.draw();

  // Update and draw bullets
  bullets.forEach((bullet, bulletIndex) => {
    bullet.update();
    bullet.draw();

    if (bullet.y < 0) {
      bullets.splice(bulletIndex, 1); // Remove bullets that go off screen
    }
  });

  // Generate enemies
  if (Math.random() < 0.02) {
    enemies.push(new Enemy());
  }

  // Update and draw enemies
  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();
    enemy.draw();

    // Check for collision between bullet and enemy
    bullets.forEach((bullet, bulletIndex) => {
      if (detectCollision(bullet, enemy)) {
        enemies.splice(enemyIndex, 1);
        bullets.splice(bulletIndex, 1);
        score += 10;
      }
    });

    // Check if the enemy reaches the player (Game Over)
    if (enemy.y + enemy.height > canvas.height) {
      gameOver = true;
    }
  });

  // Draw the score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);

  requestAnimationFrame(gameLoop);
}

gameLoop();
