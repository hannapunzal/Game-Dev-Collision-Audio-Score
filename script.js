const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width = window.innerWidth;
const CANVAS_HEIGHT = canvas.height = window.innerHeight;
const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let gameSpeed = 2;

const backgroundLayer1 = new Image();
backgroundLayer1.src = 'assets/parallax/bg.png';
const backgroundLayer2 = new Image();
backgroundLayer2.src = 'assets/parallax/farplanets.png';
const backgroundLayer3 = new Image();
backgroundLayer3.src = 'assets/parallax/ringplanet.png';
const backgroundLayer4 = new Image();
backgroundLayer4.src = 'assets/parallax/bigplanet.png';
const backgroundLayer5 = new Image();
backgroundLayer5.src = 'assets/parallax/stars.png';

let score = 0;
let gameOver = false;


let timeToNextvehicle = 0;
let vehicleInterval = 500;
let lastTime = 0;

class Layer {
    constructor(image, speedModifier){
        this.x = 0;
        this.y = 0;
        this.width = 3000;
        this.height = 1080;
        this.x2 = this.width;
        this.image = image;
        this.speedModifier = speedModifier;
        this.speed = gameSpeed * this.speedModifier;
    }
    update(){
        this.speed = gameSpeed * this.speedModifier;
        if(this.x <= -this.width){
            this.x = this.width + this.x2 - this.speed;
        }
        if(this.x2 <= -this.width){
            this.x2 = this.width + this.x - this.speed;
        }
        this.x = Math.floor(this.x - this.speed);
        this.x2 = Math.floor(this.x2 - this.speed);
    }
    draw()
    {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x2, this.y, this.width, this.height);
    }
}

let vehicles = [];
class vehicle {
    constructor(){
        this.spriteWidth = 300;
        this.spriteHeight = 250;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'assets/sprite/spacevehicle.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() & 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + "," + this.randomColors[2] + ")";
        this.hasTrail = Math.random() > 0.5;
        this.speed = gameSpeed
    }
    update(deltatime){
        if (this.y < 0 || this.y > canvas.height - this.height){
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceFlap += deltatime;
        if (this.timeSinceFlap > this.flapInterval){
            if (this.frame > this.maxFrame) this.frame = 0
            else this.frame++;
            this.timeSinceFlap = 0;
            if (this.hasTrail){
                for (let i = 0; i < 5; i++){
                    particles.push(new Particle(this.x, this.y, this.width, this.color));
                }
            }
        }
        if (this.x < 0 - this.width) {
            gameOver = true;
            this.sound = new Audio();
            this.sound.src = 'assets/audio/gameover.mp3';
            this.sound.play();
        }
    }
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, 0, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}
let explosions = [];
class Explosion {
    constructor(x, y, size){
        this.image = new Image();
        this.image.src = 'assets/sprite/boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = 'assets/audio/boomboom.wav';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
    }
    update(deltatime){
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltatime;
        if (this.timeSinceLastFrame > this.frameInterval){
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) this.markedForDeletion = true;
        }
    }
    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size)
    }
}

let particles = [];
class Particle {
    constructor(x, y, size, color){
        this.size = size;
        this.x = x + this.size/2 + Math.random() * 50 - 30;
        this.y = y + this.size/3 + Math.random()* 50 - 25
        this.radius = Math.random() * this.size/15;
        this.maxRadius = Math.random() * 20 + 50;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
        this.color = color;
    }
    update(){
        this.x += this.speedX;
        this.radius += 0.5;
        if (this.radius > this.maxRadius) this.markedForDeletion = true;
    }
    draw(){
        ctx.save();
        ctx.globalAlpha = 1 - this.radius/this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

ctx.font = '30px Trebuchet MS'; //Courier New
function drawScore(){
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SCORE: ' + score, 50, 80);
}
function drawGameOver(){
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px Trebuchet MS'; //Courier New
    ctx.fillText('GAME OVER' ,canvas.width/2, canvas.height/2 - 25);
    ctx.font = '40px Trebuchet MS'; //Courier New
    ctx.fillText('YOUR SCORE: ' + score, canvas.width/2, canvas.height/2 + 25);
    const retryButton = document.createElement("img");
    retryButton.src = "assets/images/retry.png";
    retryButton.style.width = "78px";
    retryButton.style.height = "78px";
    retryButton.style.position = "absolute";
    retryButton.style.left = canvas.width/2 - 40 + "px";
    retryButton.style.top = canvas.height/2 + 20 + "px";
    retryButton.addEventListener("click", function(){
        location.reload();
    
    });
    document.body.appendChild(retryButton);
    window.onload=function(){
        document.getElementById("assets/audio/restart.mp3").play();
      }
}


const layer1 = new Layer(backgroundLayer1, 0.2);
const layer2 = new Layer(backgroundLayer2, 0.3);
const layer3 = new Layer(backgroundLayer3, 0.4);
const layer4 = new Layer(backgroundLayer4, 0.6);
const layer5 = new Layer(backgroundLayer5, 0.8);

const gameObjects = [layer1, layer2, layer3, layer4, layer5];

window.addEventListener('click', function(e){
    const detectPixelColor =  collisionCtx.getImageData(e.x, e.y, 1, 1);
    console.log(detectPixelColor);
    const pc = detectPixelColor.data;
    vehicles.forEach(object => {
        if (object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]){
            //collisiondetected
            object.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(object.x, object.y, object.width));
            console.log(explosions);
        }
    });
});

function animate(timestamp){
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    collisionCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gameObjects.forEach(object => {
       object.update();
       object.draw();
    });
    let deltatime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextvehicle += deltatime;
    if (timeToNextvehicle > vehicleInterval){
        vehicles.push(new vehicle());
        timeToNextvehicle = 0;
        vehicles.sort(function(a,b){
            return a.width - b.width;
        });
    };
    drawScore(); //vehicle
    [...particles, ...vehicles, ...explosions].forEach(object => object.update(deltatime));
    [...particles, ...vehicles, ...explosions].forEach(object => object.draw());
    vehicles = vehicles.filter(object => !object.markedForDeletion);
    explosions = explosions.filter(object => !object.markedForDeletion);
    particles = vehicles.filter(object => !object.markedForDeletion);
    if (!gameOver) requestAnimationFrame(animate);
    else drawGameOver();
}
animate(0);

const slider = document.getElementById("slider");
slider.value = gameSpeed;
const showGameSpeed = document.getElementById("showGameSpeed");
showGameSpeed.innerHTML = gameSpeed;
slider.addEventListener("change", function (e) {
  gameSpeed = e.target.value;
  showGameSpeed.innerHTML = e.target.value;
});

var input = document.querySelector('input');
const colors = ['#AB78FF', '#FF9393', '#78A6FF', '#FF78F2', '#78FFDF']

input.oninput = (e) => {
    let color = colors[Math.floor(Math.random() * colors.length)]
    input.style.borderColor = color
    input.style.boxShadow = `0px 0px 5px 5px ${color}`
    input.style.color = color
    if (input.value == '') {
        input.style.borderColor = '#fff'
        input.style.boxShadow = `0px 0px 100px 5px #fff`
        input.style.color = '#fff'
    }
}

  