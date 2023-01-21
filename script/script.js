// Project setup
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

// style canvas
canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

/////////////////////////////////////////////////////////

const gravity = 0.7;

class Sprite {
  constructor({ position, velocity, offset, color = "red" }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 50;
    this.height = 150;
    this.lastKey = "";
    this.attackBox = {
      position: {
        // will do bitwsie coping so we need to update it with each draw
        x: this.position.x,
        y: this.position.y,
      },
      offset,
      width: 100,
      height: 50,
    };
    this.color = color;
    this.isAttacking;
    this.health = 100;
  }

  draw() {
    c.fillStyle = this.color;
    c.fillRect(this.position.x, this.position.y, this.width, this.height);

    if (this.isAttacking) {
      // draw attack box
      c.fillStyle = "green";
      c.fillRect(
        this.attackBox.position.x,
        this.attackBox.position.y,
        this.attackBox.width,
        this.attackBox.height
      );
    }
  }
  update() {
    this.draw();
    // update bitwise copies of attackBox
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y;

    // update x position
    this.position.x += this.velocity.x;
    // update y position
    this.position.y += this.velocity.y;
    this.velocity.y += gravity;

    if (this.position.y + this.height + this.velocity.y >= canvas.height) {
      // stop player from moving downward
      this.velocity.y = 0;
    } else {
      // keep pulling player downward
      this.position.y += gravity;
    }
  }
  attack() {
    this.isAttacking = true;
    setTimeout(() => {
      this.isAttacking = false;
    }, 100);
  }
}

// create objects
const player = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
});
const enemy = new Sprite({
  position: {
    x: 400,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: -50,
    y: 0,
  },
  color: "blue",
});

///////////////////////////////////////////////////////////////
// controllers

const keyPressed = {
  a: false,
  w: false,
  d: false,
  s: false,
  ArrowLeft: false,
  ArrowUp: false,
  ArrowRight: false,
  ArrowDown: false,
};

function detectCollison({ rec1, rec2 }) {
  return (
    rec1.attackBox.position.x + rec1.attackBox.width >=
      rec2.attackBox.position.x &&
    rec1.attackBox.position.x <= rec2.position.x + rec2.width && // if u crossed object
    //accont for y axis
    rec1.attackBox.position.y + rec1.attackBox.height >= rec2.position.y &&
    rec1.attackBox.position.y <= rec2.position.y + rec2.height
  );
}

function determineWinner({ player, enemy, timerId }) {
  clearTimeout(timerId);

  document.querySelector("#displayText").style.display = "flex";
  if (player.health === enemy.health) {
    document.querySelector("#displayText").innerHTML = "Tie";
  } else if (player.health > enemy.health) {
    document.querySelector("#displayText").innerHTML = "Player 1 Wins";
  } else if (player.health < enemy.health) {
    document.querySelector("#displayText").innerHTML = "Player 2 Wins";
  }
}

let timer = 60;
let timerId;
function decreaseTimer() {
  timerId = setTimeout(decreaseTimer, 1000);
  if (timer > 0) {
    timer--;
    document.querySelector("#timer").innerHTML = timer;
  }
  if (timer === 0) {
    determineWinner({ player, enemy, timerId });
  }
}
decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);

  player.update();
  enemy.update();

  // player movement
  if (keyPressed.d && player.lastKey === "d") {
    player.velocity.x = 5;
  } else if (keyPressed.a && player.lastKey === "a") {
    player.velocity.x = -5;
  } else {
    // make sure to stop if no key pressed
    player.velocity.x = 0;
    enemy.velocity.x = 0;
  }

  // enemy movement
  if (keyPressed.ArrowRight && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
  } else if (keyPressed.ArrowLeft && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
  }

  // detect player attack
  if (detectCollison({ rec1: player, rec2: enemy }) && player.isAttacking) {
    player.isAttacking = false;
    enemy.health -= 20;
    document.querySelector("#enemyHealth").style.width = enemy.health + "%";
    console.log("collision");
  }
  // detect enemy attack
  if (detectCollison({ rec1: enemy, rec2: player }) && enemy.isAttacking) {
    enemy.isAttacking = false;
    player.health -= 20;
    document.querySelector("#playerHealth").style.width = player.health + "%";
    console.log("enemy collision");
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}
animate();

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "d":
      player.lastKey = "d";
      keyPressed.d = true;
      break;
    case "a":
      player.lastKey = "a";
      keyPressed.a = true;
      break;
    case "w":
      player.velocity.y = -20;
      break;
    case " ":
      player.attack();
      break;
    //enemy keys
    case "ArrowRight":
      enemy.lastKey = "ArrowRight";
      keyPressed.ArrowRight = true;
      break;
    case "ArrowLeft":
      enemy.lastKey = "ArrowLeft";
      keyPressed.ArrowLeft = true;
      break;
    case "ArrowUp":
      enemy.velocity.y = -20;
      break;
    case "ArrowDown":
      enemy.attack();
      break;
    default:
      break;
  }
});
window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "d":
      keyPressed.d = false;
      break;
    case "a":
      keyPressed.a = false;
      break;
    case "w":
      keyPressed.w = false;
      break;
    //enemy keys
    case "ArrowRight":
      keyPressed.ArrowRight = false;
      break;
    case "ArrowLeft":
      keyPressed.ArrowLeft = false;
      break;
    case "ArrowUp":
      keyPressed.ArrowUp = false;
      break;

    default:
      break;
  }
});
