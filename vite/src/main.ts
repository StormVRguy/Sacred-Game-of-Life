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

// Lifecycle state
let lifecycleEnabled = false
let maxFullness = 50
let maxLifeDuration = 100 // Default life duration value

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
const toggleLifecycleBtn = document.createElement('button')
const speedLabel = document.createElement('label')
const speedInput = document.createElement('input')
const solidityLabel = document.createElement('label')
const soliditySlider = document.createElement('input')
const solidityValue = document.createElement('span')
const fullnessLabel = document.createElement('label')
const fullnessSlider = document.createElement('input')
const lifeDurationLabel = document.createElement('label')
const lifeDurationSlider = document.createElement('input')
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
toggleLifecycleBtn.textContent = `Ants Lifecycle: ${lifecycleEnabled ? 'ON' : 'OFF'}`
title.textContent = 'Sacred Game of Life'
genCounter.textContent = `Generation: ${generation}`

// Before creating the sliders, add number input fields
const widthInput = document.createElement('input')
const heightInput = document.createElement('input')
const speedNumberInput = document.createElement('input')
const solidityInput = document.createElement('input')
const fullnessInput = document.createElement('input')
const lifeDurationInput = document.createElement('input')

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
configureNumberInput(fullnessInput)
configureNumberInput(lifeDurationInput)

// Set initial values
widthInput.value = gridWidth.toString()
heightInput.value = gridHeight.toString()
speedNumberInput.value = '20'
solidityInput.value = '25'
fullnessInput.value = maxFullness.toString()
lifeDurationInput.value = maxLifeDuration.toString()

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

fullnessSlider.type = 'range'
fullnessSlider.min = '10'
fullnessSlider.max = '200'
fullnessSlider.value = maxFullness.toString()

lifeDurationSlider.type = 'range'
lifeDurationSlider.min = '20'
lifeDurationSlider.max = '500'
lifeDurationSlider.value = maxLifeDuration.toString()

// Update labels, simplify them
speedLabel.textContent = 'Speed (ms): '
solidityLabel.textContent = 'Structure Solidity: '
fullnessLabel.textContent = 'Max Fullness: '
lifeDurationLabel.textContent = 'Life Duration: '

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

const fullnessContainer = document.createElement('div')
fullnessContainer.className = 'slider-container'
fullnessContainer.append(fullnessLabel, fullnessSlider, fullnessInput)

const lifeDurationContainer = document.createElement('div')
lifeDurationContainer.className = 'slider-container'
lifeDurationContainer.append(lifeDurationLabel, lifeDurationSlider, lifeDurationInput)

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
    toggleStructuresBtn,
    toggleLifecycleBtn
)

// Create separate container for sliders
const slidersContainer = document.createElement('div')
slidersContainer.style.display = 'flex'
slidersContainer.style.gap = '1rem'
slidersContainer.style.flexWrap = 'wrap'
slidersContainer.style.justifyContent = 'center'
slidersContainer.style.width = '100%'
slidersContainer.style.margin = '0.5rem 0'

slidersContainer.append(speedContainer, solidityContainer, fullnessContainer, lifeDurationContainer)
container.append(title, controls, gridControls, slidersContainer, genCounter, canvas)
app.innerHTML = ''
app.appendChild(container)

// Initialize canvas with correct dimensions
canvas.width = gridWidth * cellSize
canvas.height = gridHeight * cellSize
const ctx = canvas.getContext('2d')!

// Extend the Ant interface to include fullness and ownership tracking
interface ExtendedAnt extends Ant {
    fullness?: number;
    ownedCells?: Array<{x: number, y: number}>; // Track cells owned by this ant
    lifeDuration?: number; // Track remaining life duration
}

function nextDistinctColor(): string {
	const hue = nextHue % 360
	nextHue += 47 // step by a prime-ish number to spread hues
	return `hsl(${hue}, 90%, 55%)`
}

// Modify the addAntAt function to initialize fullness, owned cells, and life duration
function addAntAt(x: number, y: number, dir: Direction = 'N') {
    const id = `ant-${antCounter++}`
    const color = nextDistinctColor()
    const ant = createAnt(id, x, y, dir, color) as ExtendedAnt
    ant.fullness = 1; // Initialize fullness to 1
    ant.ownedCells = []; // Initialize owned cells as empty array
    ant.lifeDuration = maxLifeDuration; // Initialize life duration
    ants.push(ant)
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

    // Draw ants on top with fullness indicator when lifecycle is enabled
    for (const ant of ants) {
        const extAnt = ant as ExtendedAnt;
        ctx.fillStyle = ant.color
        ctx.fillRect(ant.x * cellSize, ant.y * cellSize, cellSize - 1, cellSize - 1)
        
        // If lifecycle is enabled, show fullness as a small indicator
        if (lifecycleEnabled && structuresEnabled && extAnt.fullness !== undefined) {
            // Draw fullness indicator - a small filled circle based on fullness percentage
            const fullnessPercentage = Math.min(extAnt.fullness / maxFullness, 1);
            const radius = (cellSize - 2) * 0.4 * fullnessPercentage;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(
                ant.x * cellSize + cellSize / 2, 
                ant.y * cellSize + cellSize / 2, 
                radius, 0, Math.PI * 2
            );
            ctx.fill();
            
            // Draw life duration indicator - a small border around the ant that shrinks
            if (extAnt.lifeDuration !== undefined) {
                const lifePercentage = extAnt.lifeDuration / maxLifeDuration;
                const borderWidth = Math.max(1, Math.floor(lifePercentage * 3));
                ctx.strokeStyle = lifePercentage > 0.3 ? '#ffffff' : '#ff3333'; // White for normal, red when close to death
                ctx.lineWidth = borderWidth;
                ctx.strokeRect(
                    ant.x * cellSize + borderWidth/2, 
                    ant.y * cellSize + borderWidth/2, 
                    cellSize - 1 - borderWidth, 
                    cellSize - 1 - borderWidth
                );
            }
        }
    }
}

// Improved helper function to release all cells owned by an ant
function releaseAntCells(ant: ExtendedAnt) {
    if (!ant.ownedCells || ant.ownedCells.length === 0) return;
    
    // Force a scan of the entire board to find cells with this ant's color
    if (structuresEnabled) {
        const antColor = ant.color;
        
        // First pass - reset any cell that matches the ant's color
        for (let y = 0; y < board.height; y++) {
            for (let x = 0; x < board.width; x++) {
                const cell = board.grid[y][x];
                if (cell.color === antColor) {
                    // Reset cells that match this ant's color
                    cell.solidity = 0;
                    cell.color = null;
                }
            }
        }
        
        // Second pass - also process cells in the ownedCells array as a backup
        ant.ownedCells.forEach(cell => {
            if (cell.x >= 0 && cell.x < board.width && cell.y >= 0 && cell.y < board.height) {
                const boardCell = board.grid[cell.y][cell.x];
                boardCell.solidity = 0;
                boardCell.color = null;
            }
        });
    }
    
    // Clear the owned cells array
    ant.ownedCells = [];
}

// Function to check for and handle ant death due to old age
function checkAntLifeDuration() {
    if (!lifecycleEnabled || !structuresEnabled || ants.length === 0) return false;
    
    const deadAnts: ExtendedAnt[] = [];
    
    // Decrease life duration for all ants and identify those that have died
    for (const ant of ants as ExtendedAnt[]) {
        if (ant.lifeDuration !== undefined) {
            ant.lifeDuration -= 1;
            
            // Check if ant has died of old age
            if (ant.lifeDuration <= 0) {
                deadAnts.push(ant);
            }
        }
    }
    
    // Thoroughly clean up cells for all ants that have reached the end of their life
    deadAnts.forEach(ant => {
        releaseAntCells(ant);
    });
    
    // Remove dead ants from the ants array
    if (deadAnts.length > 0) {
        ants = ants.filter(ant => !deadAnts.includes(ant as ExtendedAnt));
        return true; // Return true if any ants were removed
    }
    
    return false;
}

// Modified function to handle ant reproduction and death
function checkAntReproduction(ant: ExtendedAnt) {
    if (!lifecycleEnabled || !structuresEnabled || ant.fullness === undefined) return;
    
    // Check if ant is full
    if (ant.fullness >= maxFullness) {
        // Find valid adjacent cells (8 neighbors)
        const adjacentPositions = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue; // Skip current position
                
                const nx = ant.x + dx;
                const ny = ant.y + dy;
                
                // Check if position is within board boundaries
                if (nx >= 0 && nx < board.width && ny >= 0 && ny < board.height) {
                    adjacentPositions.push({ x: nx, y: ny });
                }
            }
        }
        
        // If we have valid positions, create new ants
        if (adjacentPositions.length >= 1) {
            // Shuffle the positions array for randomness
            for (let i = adjacentPositions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [adjacentPositions[i], adjacentPositions[j]] = [adjacentPositions[j], adjacentPositions[i]];
            }

            // Determine how many offspring to create (40% chance for 1, 60% chance for 2)
            const willCreateTwo = Math.random() < 0.6;
            const numNewAnts = willCreateTwo ? 
                Math.min(2, adjacentPositions.length) : 
                Math.min(1, adjacentPositions.length);
            
            for (let i = 0; i < numNewAnts; i++) {
                const pos = adjacentPositions[i];
                const dirs: Direction[] = ['N', 'E', 'S', 'W'];
                const dir = dirs[Math.floor(Math.random() * dirs.length)];
                
                // Determine if this offspring will have a mutation (5% chance)
                const hasMutation = Math.random() < 0.05;
                
                // Set the color - either parent's color or a new random color if mutation occurs
                const color = hasMutation ? nextDistinctColor() : ant.color;
                
                // Create ant
                const id = `ant-${antCounter++}`;
                const newAnt = createAnt(id, pos.x, pos.y, dir, color) as ExtendedAnt;
                newAnt.fullness = 1; // Initialize fullness
                newAnt.ownedCells = []; // Initialize owned cells as empty array
                newAnt.lifeDuration = maxLifeDuration; // Initialize life duration
                ants.push(newAnt);
            }
            
            // Handle ant death: release all owned cells
            releaseAntCells(ant);
            
            // Remove the ant from the ants array
            const antIndex = ants.findIndex(a => a.id === ant.id);
            if (antIndex !== -1) {
                ants.splice(antIndex, 1);
            }
        }
    }
}

// Fix the function to check for conflicts between ants
function checkAntConflicts() {
    if (!lifecycleEnabled || !structuresEnabled || ants.length < 2) return false;
    
    // Create a list of ants to remove after checking all conflicts
    const antsToRemove: ExtendedAnt[] = [];
    
    // Check each pair of ants for conflicts
    for (let i = 0; i < ants.length; i++) {
        const ant1 = ants[i] as ExtendedAnt;
        
        for (let j = i + 1; j < ants.length; j++) {
            const ant2 = ants[j] as ExtendedAnt;
            
            // Skip if both ants are already marked for removal
            if (antsToRemove.includes(ant1) && antsToRemove.includes(ant2)) continue;
            
            // Check if ants are of different colors and within 1 cell of each other
            if (ant1.color !== ant2.color && 
                Math.abs(ant1.x - ant2.x) <= 1 && 
                Math.abs(ant1.y - ant2.y) <= 1) {
                
                // Determine which ant is less full
                const ant1Fullness = ant1.fullness || 0;
                const ant2Fullness = ant2.fullness || 0;
                
                let antToRemove: ExtendedAnt | null = null;
                
                if (ant1Fullness < ant2Fullness) {
                    antToRemove = ant1;
                } else if (ant2Fullness < ant1Fullness) {
                    antToRemove = ant2;
                } else {
                    // If equal fullness, randomly choose one to die
                    antToRemove = Math.random() < 0.5 ? ant1 : ant2;
                }
                
                if (antToRemove && !antsToRemove.includes(antToRemove)) {
                    antsToRemove.push(antToRemove);
                    
                    // Immediately release the cells owned by this ant
                    // We'll do a more thorough cleanup after all conflicts are resolved
                }
            }
        }
    }
    
    // Remove the ants from the ants array and clean up all their cells
    if (antsToRemove.length > 0) {
        // First ensure all cells are released
        antsToRemove.forEach(ant => {
            releaseAntCells(ant);
        });
        
        // Then remove the ants
        ants = ants.filter(ant => !antsToRemove.includes(ant));
        return true; // Return true if any ants were removed
    }
    
    return false;
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
                        // Correctly checks if lifecycle is enabled before decreasing life duration
                        if (lifecycleEnabled && structuresEnabled) {
                            checkAntLifeDuration();
                        }
                        
                        // Check for conflicts between ants before movement
                        checkAntConflicts();
                        
                        // Track cell states before movement to detect changes
                        const cellStatesBefore = ants.map(ant => {
                            const { x, y } = ant;
                            return { ant, state: board.grid[y][x].value };
                        });
                        
                        // Call the imported stepAnts function
                        stepAnts(board, ants, structuresEnabled, parseInt(solidityInput.value))
                        
                        // Check for conflicts after movement
                        checkAntConflicts();
                        
                        // If lifecycle is enabled, check for cell state changes
                        if (lifecycleEnabled && structuresEnabled) {
                            // Process this in reverse order since we may be removing ants
                            for (let i = cellStatesBefore.length - 1; i >= 0; i--) {
                                const { ant, state: beforeState } = cellStatesBefore[i];
                                // Skip if ant no longer exists (was removed during conflict)
                                if (!ants.includes(ant)) continue;
                                
                                const extAnt = ant as ExtendedAnt;
                                const afterState = board.grid[ant.y][ant.x].value;
                                
                                // Track if fullness was increased in this step
                                let fullnessIncreased = false;
                                
                                // If ant turned off a cell (changed from 1 to 0), increase fullness once per step
                                if (beforeState === 1 && afterState === 0 && extAnt.fullness !== undefined && !fullnessIncreased) {
                                    extAnt.fullness += 1;
                                    fullnessIncreased = true;
                                    
                                    // Check for reproduction after fullness increases
                                    checkAntReproduction(extAnt);
                                }
                                
                                // Track cells that the ant turns on with solidity
                                if (beforeState === 0 && afterState === 1 && structuresEnabled) {
                                    // Cell was turned on and has solidity
                                    const cell = board.grid[ant.y][ant.x];
                                    if (cell.solidity > 0 && cell.color) {
                                        if (!extAnt.ownedCells) extAnt.ownedCells = [];
                                        // Add to owned cells if not already there
                                        if (!extAnt.ownedCells.some(c => c.x === ant.x && c.y === ant.y)) {
                                            extAnt.ownedCells.push({ x: ant.x, y: ant.y });
                                        }
                                    }
                                }
                            }
                        }
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
                // Correctly checks if lifecycle is enabled before decreasing life duration
                if (lifecycleEnabled && structuresEnabled) {
                    checkAntLifeDuration();
                }
                
                // Check for conflicts between ants before movement
                checkAntConflicts();
                
                // Track cell states before movement to detect changes
                const cellStatesBefore = ants.map(ant => {
                    const { x, y } = ant;
                    return { ant, state: board.grid[y][x].value };
                });
                
                // Call the imported stepAnts function
                stepAnts(board, ants, structuresEnabled, parseInt(solidityInput.value))
                
                // Check for conflicts after movement
                checkAntConflicts();
                
                // If lifecycle is enabled, check for cell state changes
                if (lifecycleEnabled && structuresEnabled) {
                    // Process this in reverse order since we may be removing ants
                    for (let i = cellStatesBefore.length - 1; i >= 0; i--) {
                        const { ant, state: beforeState } = cellStatesBefore[i];
                        // Skip if ant no longer exists (was removed during conflict)
                        if (!ants.includes(ant)) continue;
                        
                        const extAnt = ant as ExtendedAnt;
                        const afterState = board.grid[ant.y][ant.x].value;
                        
                        // Track if fullness was increased in this step
                        let fullnessIncreased = false;
                        
                        // If ant turned off a cell (changed from 1 to 0), increase fullness once per step
                        if (beforeState === 1 && afterState === 0 && extAnt.fullness !== undefined && !fullnessIncreased) {
                            extAnt.fullness += 1;
                            fullnessIncreased = true;
                            
                            // Check for reproduction after fullness increases
                            checkAntReproduction(extAnt);
                        }
                        
                        // Track cells that the ant turns on with solidity
                        if (beforeState === 0 && afterState === 1 && structuresEnabled) {
                            // Cell was turned on and has solidity
                            const cell = board.grid[ant.y][ant.x];
                            if (cell.solidity > 0 && cell.color) {
                                if (!extAnt.ownedCells) extAnt.ownedCells = [];
                                // Add to owned cells if not already there
                                if (!extAnt.ownedCells.some(c => c.x === ant.x && c.y === ant.y)) {
                                    extAnt.ownedCells.push({ x: ant.x, y: ant.y });
                                }
                            }
                        }
                    }
                }
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
        lifecycleEnabled = false
        toggleLifecycleBtn.textContent = `Ants Lifecycle: ${lifecycleEnabled ? 'ON' : 'OFF'}`
        
        // Reset all cells' solidity and color - more thorough cleanup
        for (let y = 0; y < board.height; y++) {
            for (let x = 0; x < board.width; x++) {
                board.grid[y][x].solidity = 0
                board.grid[y][x].color = null
            }
        }
        
        // Also clear ownedCells arrays for all ants
        for (const ant of ants as ExtendedAnt[]) {
            if (ant.ownedCells) {
                ant.ownedCells = [];
            }
        }
        
        drawGrid()
    }
})

// Add lifecycle toggle event listener
toggleLifecycleBtn.addEventListener('click', () => {
    if (structuresEnabled) {
        lifecycleEnabled = !lifecycleEnabled;
    } else {
        lifecycleEnabled = false;
    }
    toggleLifecycleBtn.textContent = `Ants Lifecycle: ${lifecycleEnabled ? 'ON' : 'OFF'}`
    drawGrid()
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

// Add fullness slider event listeners
fullnessSlider.addEventListener('input', (e) => {
    fullnessInput.value = (e.target as HTMLInputElement).value
    maxFullness = parseInt(fullnessInput.value)
})

fullnessInput.addEventListener('change', (e) => {
    const value = Math.max(10, parseInt((e.target as HTMLInputElement).value) || 50)
    fullnessSlider.value = Math.min(Math.max(value, parseInt(fullnessSlider.min)), parseInt(fullnessSlider.max)).toString()
    maxFullness = value
})

// Add life duration slider event listeners
lifeDurationSlider.addEventListener('input', (e) => {
    lifeDurationInput.value = (e.target as HTMLInputElement).value
    maxLifeDuration = parseInt(lifeDurationInput.value)
})

lifeDurationInput.addEventListener('change', (e) => {
    const value = Math.max(20, parseInt((e.target as HTMLInputElement).value) || 100)
    lifeDurationSlider.value = Math.min(Math.max(value, parseInt(lifeDurationSlider.min)), parseInt(lifeDurationSlider.max)).toString()
    maxLifeDuration = value
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
const buttons = [playBtn, stepBtn, clearBtn, randomBtn, antModeBtn, addRandomAntBtn, toggleGoLBtn, toggleStructuresBtn, toggleLifecycleBtn]
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
