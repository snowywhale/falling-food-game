// متغیرهای اصلی
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const menu = document.getElementById("menu");
const result = document.getElementById("result");

canvas.width = 400;
canvas.height = 600;

// تصاویر
const images = {};
const imageSources = {
  rabbit: "assets/rabbit.png",
  carrot: "assets/carrot.png",
  goldenCarrot: "assets/golden_carrot.png",
  candy: "assets/candy.png",
  stone: "assets/stone.png",
  bomb: "assets/bomb.png",
  missile: "assets/missile.png",
};

let loadedImages = 0;
const totalImages = Object.keys(imageSources).length;

for (let key in imageSources) {
  images[key] = new Image();
  images[key].src = imageSources[key];
  images[key].onload = () => {
    loadedImages++;
    if (loadedImages === totalImages) {
      startButton.disabled = false;
    }
  };
}

// خرگوش
const rabbit = {
  x: canvas.width / 2 - 32,
  y: canvas.height - 80,
  width: 64,
  height: 64,
  speed: 5,
};

let leftPressed = false;
let rightPressed = false;

// آیتم‌ها
const items = [];
let score = 0;
let lives = 3;
let badHits = 0;
let collected = 0;
let gameRunning = false;
let extraLivesGiven = 0; // ✅ تعداد جون‌هایی که از هویج طلایی گرفته

// کنترل‌های صفحه کلید
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") leftPressed = true;
  if (e.key === "ArrowRight") rightPressed = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") leftPressed = false;
  if (e.key === "ArrowRight") rightPressed = false;
});

// شروع بازی
startButton.addEventListener("click", () => {
  resetGame();
  menu.style.display = "none";
  canvas.style.display = "block";
  result.textContent = "";
  gameRunning = true;
  requestAnimationFrame(update);
});

function resetGame() {
  score = 0;
  lives = 3;
  badHits = 0;
  collected = 0;
  extraLivesGiven = 0;
  items.length = 0;
}

// ظاهر شدن آیتم‌ها
function spawnItem() {
  let type;
  const rand = Math.random();
  if (rand < 0.05) type = "goldenCarrot"; // 🔁 حدود 5٪ احتمال
  else if (rand < 0.45) type = "carrot";
  else if (rand < 0.65) type = "candy";
  else if (rand < 0.8) type = "stone";
  else if (rand < 0.9) type = "bomb";
  else type = "missile";

  const x = Math.random() * (canvas.width - 40);
  items.push({ x, y: -50, type, width: 40, height: 40, speed: 2 + Math.random() * 1.5 });
}

// کشیدن آیتم‌ها و خرگوش
function drawRabbit() {
  ctx.drawImage(images.rabbit, rabbit.x, rabbit.y, rabbit.width, rabbit.height);
}
function drawItems() {
  items.forEach((item) => {
    ctx.drawImage(images[item.type], item.x, item.y, item.width, item.height);
  });
}
function drawStats() {
  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText(`خوراکی: ${collected}/50`, 10, 20);
  ctx.fillText(`جون: ${lives}`, 10, 40);
}

// برخورد
function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// بروزرسانی فریم
function update() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // حرکت خرگوش
  if (leftPressed && rabbit.x > 0) rabbit.x -= rabbit.speed;
  if (rightPressed && rabbit.x + rabbit.width < canvas.width) rabbit.x += rabbit.speed;

  drawRabbit();
  drawItems();
  drawStats();

  // آیتم‌ها و برخورد
  items.forEach((item, index) => {
    item.y += item.speed;

    if (checkCollision(rabbit, item)) {
      if (["carrot", "candy"].includes(item.type)) {
        collected++;
        score += 1;
      } else if (item.type === "goldenCarrot") {
        if (lives < 3 && extraLivesGiven < 3) {
          lives++;
          extraLivesGiven++;
        }
      } else {
        badHits++;
        lives--;
      }
      items.splice(index, 1);
    } else if (item.y > canvas.height) {
      items.splice(index, 1);
    }
  });

  // پایان بازی
  if (collected >= 50) {
    gameRunning = false;
    canvas.style.display = "none";
    if (badHits === 0) result.textContent = "🏅 مدال طلا!";
    else if (badHits === 1) result.textContent = "🥈 مدال نقره!";
    else if (badHits === 2) result.textContent = "🥉 مدال برنز!";
    else result.textContent = "💥 باختی!";
    return;
  }

  if (lives <= 0) {
    gameRunning = false;
    canvas.style.display = "none";
    result.textContent = "💥 باختی!";
    return;
  }

  if (Math.random() < 0.025) {
    spawnItem();
  }

  requestAnimationFrame(update);
}
