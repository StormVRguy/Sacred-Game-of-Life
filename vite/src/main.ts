import './style.css'
import { createBoard, nextGeneration, toggleCell, getCell, setCell, clearBoard, reduceSolidity, type Board } from './game/board'
import { createAnt, stepAnts, type Ant, type Direction } from './game/ants'

// Game configuration
const cellSize = 12
const gridWidth = 50
const gridHeight = 50 // Changed to 50

// Game state
let board: Board = createBoard(gridWidth, gridHeight, 0)
let running = false
let timer: number | null = null
let generation = 0

// Ants state
let ants: Ant[] = []
let antCounter = 0
let nextHue = 0
let stepPhase = 0
let golEnabled = true
let isPlacingAnts = false
let isDragging = false

// Structures state
let structuresEnabled = false

// UI elements
const app = document.querySelector<HTMLDivElement>('#app')!

// UI elements
const container = document.createElement('div')
const title = document.createElement('h1')
const controls = document.createElement('div')
const playBtn = document.createElement('button')
const stepBtn = document.createElement('button')
const clearBtn = document.createElement('button')
const randomBtn = document.createElement('button')
const antModeBtn = document.createElement('button')
const addRandomAntBtn = document.createElement('button')
const toggleGoLBtn = document.createElement('button')
const toggleStructuresBtn = document.createElement('button')
const speedLabel = document.createElement('label')
const speedInput = document.createElement('input')
const solidityLabel = document.createElement('label')
const soliditySlider = document.createElement('input')
const solidityValue = document.createElement('span')
const genCounter = document.createElement('div')
const canvas = document.createElement('canvas')
const gridControls = document.createElement('div')

// Initialize button text content
playBtn.textContent = 'Play'
stepBtn.textContent = 'Step'
clearBtn.textContent = 'Clear'
randomBtn.textContent = 'Random'
antModeBtn.textContent = 'Remove Ants'
addRandomAntBtn.textContent = 'Add Random Ant'
toggleGoLBtn.textContent = `GoL: ${golEnabled ? 'ON' : 'OFF'}`
toggleStructuresBtn.textContent = `Structures: ${structuresEnabled ? 'ON' : 'OFF'}`
title.textContent = 'Sacred Game of Life'
genCounter.textContent = `Generation: ${generation}`

// Before creating the sliders, add number input fields
const widthInput = document.createElement('input')
const heightInput = document.createElement('input')
const speedNumberInput = document.createElement('input')
const solidityInput = document.createElement('input')

// Configure number inputs
const configureNumberInput = (input: HTMLInputElement) => {
    input.type = 'number'
    input.style.width = '60px'
    input.style.marginLeft = '0.5rem'
    input.style.padding = '2px 4px'
    input.style.borderRadius = '4px'
    input.style.border = '1px solid #666'
    input.style.backgroundColor = '#333'
    input.style.color = '#fff'
}

configureNumberInput(widthInput)
configureNumberInput(heightInput)
configureNumberInput(speedNumberInput)
configureNumberInput(solidityInput)

// Set initial values
widthInput.value = gridWidth.toString()
heightInput.value = gridHeight.toString()
speedNumberInput.value = '20'
solidityInput.value = '25'

container.style.display = 'flex'
container.style.flexDirection = 'column'
container.style.gap = '1rem'
container.style.alignItems = 'center'
container.style.maxWidth = '100vw'
container.style.margin = '0 auto'
container.style.padding = '1rem'

controls.style.display = 'flex'
controls.style.gap = '0.5rem'
controls.style.flexWrap = 'wrap'
controls.style.justifyContent = 'center'
controls.style.maxWidth = '100%'
controls.style.margin = '0 auto'

gridControls.className = 'grid-controls'

const widthContainer = document.createElement('div')
const heightContainer = document.createElement('div')
widthContainer.className = 'slider-container'
heightContainer.className = 'slider-container'

const widthLabel = document.createElement('label')
const heightLabel = document.createElement('label')
widthLabel.textContent = 'Width:'
heightLabel.textContent = 'Height:'

const widthSlider = document.createElement('input')
const heightSlider = document.createElement('input')
widthSlider.type = 'range'
heightSlider.type = 'range'
widthSlider.min = '25'   // Changed from 50
heightSlider.min = '25'   // Changed from 50
widthSlider.max = '150'  // Changed from 2000
heightSlider.max = '150'  // Changed from 2000
widthSlider.value = gridWidth.toString()
heightSlider.value = gridHeight.toString()

// Configure sliders
speedInput.type = 'range'
speedInput.min = '1'
speedInput.max = '200'
speedInput.value = '20'

soliditySlider.type = 'range'
soliditySlider.min = '1'
soliditySlider.max = '100'
soliditySlider.value = '25'

// Update labels, simplify them
speedLabel.textContent = 'Speed (ms): '
solidityLabel.textContent = 'Structure Solidity: '

// Update container appending with correct order - keep only one input per slider
widthContainer.innerHTML = '';
widthContainer.append(widthLabel, widthSlider, widthInput)

heightContainer.innerHTML = '';
heightContainer.append(heightLabel, heightSlider, heightInput)

// Create containers for speed and solidity sliders with the same layout
const speedContainer = document.createElement('div')
speedContainer.className = 'slider-container'
speedContainer.append(speedLabel, speedInput, speedNumberInput)

const solidityContainer = document.createElement('div')
solidityContainer.className = 'slider-container'
solidityContainer.append(solidityLabel, soliditySlider, solidityInput)

gridControls.append(widthContainer, heightContainer)

// Fix controls layout
controls.append(
    playBtn, 
    stepBtn, 
    clearBtn, 
    randomBtn, 
    antModeBtn, 
    addRandomAntBtn, 
    toggleGoLBtn,
    toggleStructuresBtn
)

// Create separate container for sliders
const slidersContainer = document.createElement('div')
slidersContainer.style.display = 'flex'
slidersContainer.style.gap = '1rem'
slidersContainer.style.flexWrap = 'wrap'
slidersContainer.style.justifyContent = 'center'
slidersContainer.style.width = '100%'
slidersContainer.style.margin = '0.5rem 0'

slidersContainer.append(speedContainer, solidityContainer)
container.append(title, controls, gridControls, slidersContainer, genCounter, canvas)
app.innerHTML = ''
app.appendChild(container)

// Initialize canvas with correct dimensions
canvas.width = gridWidth * cellSize
canvas.height = gridHeight * cellSize
const ctx = canvas.getContext('2d')!

function nextDistinctColor(): string {
	const hue = nextHue % 360
	nextHue += 47 // step by a prime-ish number to spread hues
	return `hsl(${hue}, 90%, 55%)`
}

function drawGrid() {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg') || '#242424'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const maxSolidity = parseInt(solidityInput.value)

    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            const cell = board.grid[y][x]
            if (cell.value === 1) {
                if (cell.color && cell.solidity > 0) {
                    // Linear interpolation from ant color to white based on solidity
                    const progress = cell.solidity / maxSolidity
                    const hslMatch = cell.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
                    if (hslMatch) {
                        const [_, h, s, l] = hslMatch.map(Number)
                        // Linear interpolation of saturation (from original to 0%)
                        // and lightness (from original to 100%)
                        const newSat = s * progress
                        const newLight = l + (100 - l) * (1 - progress)
                        ctx.fillStyle = `hsl(${h}, ${newSat}%, ${newLight}%)`
                    }
                } else {
                    ctx.fillStyle = '#ffffff' // Changed: white for normal live cells
                }
            } else {
                ctx.fillStyle = '#111827' // Dead cell color
            }
            ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1)
        }
    }

    // Draw ants on top
    for (const ant of ants) {
        ctx.fillStyle = ant.color
        ctx.fillRect(ant.x * cellSize, ant.y * cellSize, cellSize - 1, cellSize - 1)
    }
}

function setRunning(next: boolean) {
    running = next
    playBtn.textContent = running ? 'Pause' : 'Play'
    if (timer) {
        clearInterval(timer)
        timer = null
    }
    if (running) {
        const interval = Number(speedNumberInput.value)
        timer = window.setInterval(() => {
            switch (stepPhase) {
                case 0:
                    board = reduceSolidity(board)
                    if (golEnabled) {
                        board = nextGeneration(board)
                    }
                    stepPhase = 1
                    break
                case 1:
                    if (ants.length > 0) {
                        stepAnts(board, ants, structuresEnabled, parseInt(solidityInput.value))
                    }
                    stepPhase = 0
                    generation += 1
                    break
            }
            genCounter.textContent = `Generation: ${generation}`
            drawGrid()
        }, interval / 2)
    }
}

function stepOnce() {
    switch (stepPhase) {
        case 0:
            board = reduceSolidity(board)
            if (golEnabled) {
                board = nextGeneration(board)
            }
            stepPhase = 1
            break
        case 1: // Ants phase (movement and cell flipping combined)
            if (ants.length > 0) {
                // Pass structures parameters
                stepAnts(board, ants, structuresEnabled, parseInt(solidityInput.value))
            }
            stepPhase = 0
            generation += 1
            break
    }
    genCounter.textContent = `Generation: ${generation}`
    drawGrid()
}

function clearAll() {
    clearBoard(board)
    ants = []
    antModeBtn.disabled = true
    generation = 0
    genCounter.textContent = `Generation: ${generation}`
    drawGrid()
}

function randomize(density = 0.25) {
	for (let y = 0; y < board.height; y++) {
		for (let x = 0; x < board.width; x++) {
			setCell(board, x, y, Math.random() < density ? 1 : 0)
		}
	}
	drawGrid()
}

function addAntAt(x: number, y: number, dir: Direction = 'N') {
    const id = `ant-${antCounter++}`
    const color = nextDistinctColor()
    ants.push(createAnt(id, x, y, dir, color))
    antModeBtn.disabled = false // Enable button when we have ants
    drawGrid()
}

function addRandomAnt() {
	const x = Math.floor(Math.random() * gridWidth)
	const y = Math.floor(Math.random() * gridHeight)
	const dirs: Direction[] = ['N', 'E', 'S', 'W']
	const dir = dirs[Math.floor(Math.random() * dirs.length)]
	addAntAt(x, y, dir)
}

// Interactions
playBtn.addEventListener('click', () => setRunning(!running))
stepBtn.addEventListener('click', () => { if (!running) stepOnce() })
clearBtn.addEventListener('click', () => { setRunning(false); clearAll() })
randomBtn.addEventListener('click', () => { setRunning(false); randomize() })
antModeBtn.disabled = true // Initially disabled since there are no ants

antModeBtn.addEventListener('click', () => {
    ants = [] // Remove all ants
    antModeBtn.disabled = true
    drawGrid()
})

addRandomAntBtn.addEventListener('click', () => {
    addRandomAnt()
})
toggleGoLBtn.addEventListener('click', () => {
    golEnabled = !golEnabled
    toggleGoLBtn.textContent = `GoL: ${golEnabled ? 'ON' : 'OFF'}`
})
toggleStructuresBtn.addEventListener('click', () => {
    structuresEnabled = !structuresEnabled
    toggleStructuresBtn.textContent = `Structures: ${structuresEnabled ? 'ON' : 'OFF'}`
    
    if (!structuresEnabled) {
        // Reset all cells' solidity
        for (let y = 0; y < board.height; y++) {
            for (let x = 0; x < board.width; x++) {
                board.grid[y][x].solidity = 0
                board.grid[y][x].color = null
            }
        }
        drawGrid()
    }
})

widthInput.addEventListener('change', (e) => {
    const value = Math.max(1, parseInt((e.target as HTMLInputElement).value) || 25)
    widthSlider.value = Math.min(Math.max(value, parseInt(widthSlider.min)), parseInt(widthSlider.max)).toString()
    handleGridResize()
})

heightInput.addEventListener('change', (e) => {
    const value = Math.max(1, parseInt((e.target as HTMLInputElement).value) || 25)
    heightSlider.value = Math.min(Math.max(value, parseInt(heightSlider.min)), parseInt(heightSlider.max)).toString()
    handleGridResize()
})

speedNumberInput.addEventListener('change', (e) => {
    const value = Math.max(1, parseInt((e.target as HTMLInputElement).value) || 20)
    speedInput.value = Math.min(Math.max(value, parseInt(speedInput.min)), parseInt(speedInput.max)).toString()
    if (running) setRunning(true)
})

solidityInput.addEventListener('change', (e) => {
    const value = Math.max(1, parseInt((e.target as HTMLInputElement).value) || 25)
    soliditySlider.value = Math.min(Math.max(value, parseInt(soliditySlider.min)), parseInt(soliditySlider.max)).toString()
})

// Update existing slider event listeners to sync with number inputs - simplified
widthSlider.addEventListener('input', (e) => {
    widthInput.value = (e.target as HTMLInputElement).value
})

heightSlider.addEventListener('input', (e) => {
    heightInput.value = (e.target as HTMLInputElement).value
})

speedInput.addEventListener('input', (e) => {
    speedNumberInput.value = (e.target as HTMLInputElement).value
    if (running) setRunning(true)
})

soliditySlider.addEventListener('input', (e) => {
    solidityInput.value = (e.target as HTMLInputElement).value
})

canvas.addEventListener('mousedown', (e) => {
	isDragging = true
	handleCanvasPointer(e)
})
canvas.addEventListener('mousemove', (e) => {
    if (isDragging && !isPlacingAnts) handleCanvasPointer(e) // Changed from antMode to isPlacingAnts
})
canvas.addEventListener('mouseup', () => { isDragging = false })
canvas.addEventListener('mouseleave', () => { isDragging = false })

canvas.addEventListener('click', (e) => {
    if (isPlacingAnts) {
        const rect = canvas.getBoundingClientRect()
        const x = Math.floor((e.clientX - rect.left) / cellSize)
        const y = Math.floor((e.clientY - rect.top) / cellSize)
        addAntAt(x, y)
    }
})

// Update handleCanvasPointer function
function handleCanvasPointer(e: MouseEvent) {
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / cellSize)
    const y = Math.floor((e.clientY - rect.top) / cellSize)
    if (!isPlacingAnts) {
        toggleCell(board, x, y)
        drawGrid()
    }
}

// Add resize handling
function handleGridResize() {
    const newWidth = parseInt(widthInput.value)
    const newHeight = parseInt(heightInput.value)
    
    // Create new board with current content
    const newBoard = createBoard(newWidth, newHeight, 0)
    
    // Copy existing cells
    for (let y = 0; y < Math.min(board.height, newHeight); y++) {
        for (let x = 0; x < Math.min(board.width, newWidth); x++) {
            setCell(newBoard, x, y, getCell(board, x, y))
        }
    }
    
    // Adjust ants positions if needed
    ants = ants.filter(ant => {
        if (ant.x >= newWidth || ant.y >= newHeight) {
            return false
        }
        return true
    })
    
    board = newBoard
    resizeCanvas()
    drawGrid()
}

// Update the resizeCanvas function
function resizeCanvas() {
    const maxWidth = Math.min(window.innerWidth - 40, board.width * cellSize)
    const scale = maxWidth / (board.width * cellSize)
    const maxHeight = board.height * cellSize * scale
    
    canvas.width = board.width * cellSize
    canvas.height = board.height * cellSize
    canvas.style.width = `${maxWidth}px`
    canvas.style.height = `${maxHeight}px`
    canvas.style.imageRendering = 'pixelated'
}

// Add resize listener
window.addEventListener('resize', resizeCanvas)

// Update title styling
title.style.margin = '0'
title.style.textAlign = 'center'
title.style.fontSize = 'clamp(1.5rem, 4vw, 2rem)'

// Update generation counter styling
genCounter.style.textAlign = 'center'
genCounter.style.fontSize = '1rem'
genCounter.style.margin = '0.5rem 0'

// Call resize initially
resizeCanvas()

// Add button styling to prevent size changes
const buttons = [playBtn, stepBtn, clearBtn, randomBtn, antModeBtn, addRandomAntBtn, toggleGoLBtn, toggleStructuresBtn]
buttons.forEach(btn => {
    btn.style.minWidth = '100px'
    btn.style.minHeight = '60px'
    btn.style.padding = '0.5rem 1rem'
    btn.style.border = '1px solid #666'
    btn.style.borderRadius = '4px'
    btn.style.backgroundColor = '#333'
    btn.style.color = '#fff'
    btn.style.cursor = 'pointer'
    btn.style.fontFamily = 'inherit'
    btn.style.fontSize = '14px'
    btn.style.lineHeight = '1.2'
})
buttons.forEach(btn => {
    btn.style.minWidth = '100px'
    btn.style.minHeight = '60px'
    btn.style.padding = '0.5rem 1rem'
    btn.style.border = '1px solid #666'
    btn.style.borderRadius = '4px'
    btn.style.backgroundColor = '#333'
    btn.style.color = '#fff'
    btn.style.cursor = 'pointer'
    btn.style.fontFamily = 'inherit'
    btn.style.fontSize = '14px'
    btn.style.lineHeight = '1.2'
})
