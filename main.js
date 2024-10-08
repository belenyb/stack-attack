const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const score = document.querySelector('#score')

// CONSTANTS
const MODES = {
  FALL: 'fall',
  BOUNCE: 'bounce',
  GAMEOVER: 'gameover'
}
const INITIAL_BOX_WIDTH = 200
const INITIAL_BOX_Y = 600

const BOX_HEIGHT = 40
const INITIAL_Y_SPEED = 5
const INITIAL_X_SPEED = 2

// STATE
let boxes = []
let debris = { x: 0, y: 0, width: 0 }
let scrollCounter, cameraY, current, mode, xSpeed, ySpeed

function createStepColor(step) {
  if (step === 0) return 'white';

  const minBrightness = 100;

  const red = Math.floor(Math.random() * (255 - minBrightness) + minBrightness);
  const green = Math.floor(Math.random() * (255 - minBrightness) + minBrightness);
  const blue = Math.floor(Math.random() * (255 - minBrightness) + minBrightness);

  return `rgb(${red}, ${green}, ${blue})`;
}

function updateCamera() {
  if (scrollCounter > 0) {
    cameraY++
    scrollCounter--
  }
}

function initializeGameState() {
  boxes = [{
    x: (canvas.width / 2) - (INITIAL_BOX_WIDTH / 2),
    y: 200,
    width: INITIAL_BOX_WIDTH,
    color: 'white'
  }]

  debris = { x: 0, y: 0, width: 0 }
  current = 1
  mode = MODES.BOUNCE
  xSpeed = INITIAL_X_SPEED
  ySpeed = INITIAL_Y_SPEED
  scrollCounter = 0
  cameraY = 0

  createNewBox()
}

function restart() {
  initializeGameState();
  draw();
  startButton.classList.add('hidden');
  restartButton.classList.add('hidden');
}

function draw() {
  if (mode === MODES.GAMEOVER) return

  drawBackground()
  drawBoxes()
  drawDebris()

  if (mode === MODES.BOUNCE) {
    moveAndDetectCollision()
  } else if (mode === MODES.FALL) {
    updateFallMode()
  }

  debris.y -= ySpeed
  updateCamera()

  window.requestAnimationFrame(draw)
}

function drawBackground() {
  context.fillStyle = 'rgba(0, 0, 0, 0.5)'
  context.fillRect(0, 0, canvas.width, canvas.height)
}

function drawDebris() {
  const { x, y, width } = debris
  const newY = INITIAL_BOX_Y - y + cameraY

  context.fillStyle = 'red'
  context.fillRect(x, newY, width, BOX_HEIGHT)
}

function drawBoxes() {
  boxes.forEach((box) => {
    const { x, y, width, color } = box
    const newY = INITIAL_BOX_Y - y + cameraY

    context.fillStyle = color
    context.fillRect(x, newY, width, BOX_HEIGHT)
  })
}

function createNewBox() {
  boxes[current] = {
    x: 0,
    y: (current + 10) * BOX_HEIGHT,
    width: boxes[current - 1].width,
    color: createStepColor(current)
  }
}

function createNewDebris(difference) {
  const currentBox = boxes[current]
  const previousBox = boxes[current - 1]

  const debrisX = currentBox.x > previousBox.x
    ? currentBox.x + currentBox.width
    : currentBox.x

  debris = {
    x: debrisX,
    y: currentBox.y,
    width: difference
  }
}

function updateFallMode() {
  const currentBox = boxes[current]
  currentBox.y -= ySpeed

  const positionPreviousBox = boxes[current - 1].y + BOX_HEIGHT

  if (currentBox.y === positionPreviousBox) {
    handleBoxLanding()
  }
}

function adjustCurrentBox(difference) {
  const currentBox = boxes[current]
  const previousBox = boxes[current - 1]

  if (currentBox.x > previousBox.x) {
    currentBox.width -= difference
  } else {
    currentBox.width += difference
    currentBox.x = previousBox.x
  }
}

function gameOver() {
  mode = MODES.GAMEOVER

  context.fillStyle = 'rgba(255, 0, 0, 0.5)'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.font = 'bold 20px Arial'
  context.fillStyle = 'white'
  context.textAlign = 'center'
  context.fillText(
    'Game Over',
    canvas.width / 2,
    canvas.height / 2
  )
  restartButton.classList.remove('hidden');
}

function handleBoxLanding() {
  const currentBox = boxes[current]
  const previousBox = boxes[current - 1]

  const difference = currentBox.x - previousBox.x

  if (Math.abs(difference) >= currentBox.width) {
    gameOver()
    return
  }

  adjustCurrentBox(difference)
  createNewDebris(difference)

  xSpeed += xSpeed > 0 ? 1 : -1
  current++
  scrollCounter = BOX_HEIGHT
  mode = MODES.BOUNCE

  score.textContent = parseInt(score.textContent) + 10

  createNewBox()
}

function moveAndDetectCollision() {
  const currentBox = boxes[current]
  currentBox.x += xSpeed

  const isMovingRight = xSpeed > 0
  const isMovingLeft = xSpeed < 0

  const hasHitRightSide =
    currentBox.x + currentBox.width > canvas.width

  const hasHitLeftSide = currentBox.x < 0

  if (
    (isMovingRight && hasHitRightSide) ||
    (isMovingLeft && hasHitLeftSide)
  ) {
    xSpeed = -xSpeed
  }
}

document.addEventListener('keydown', (event) => {
  if (event.key === ' ' && mode === MODES.BOUNCE) {
    mode = MODES.FALL
  }
})

canvas.onpointerdown = () => {
  if (mode === MODES.GAMEOVER) {
    restart()
  } else if (mode === MODES.BOUNCE) {
    mode = MODES.FALL
  }
}

document.querySelectorAll('.handle-restart').forEach(button => {
  button.addEventListener('click', () => {
    score.textContent = 0;
    restart();
  });
});
