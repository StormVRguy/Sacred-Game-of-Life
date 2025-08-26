import './style.css'
import { createBoard, nextGeneration, toggleCell, getCell, setCell, clearBoard, reduceSolidity, type Board } from './game/board'
import { createAnt, stepAnts, type Ant, type Direction } from './game/ants'

// Game configuration
const cellSize = 12
const gridWidth = 80  // Changed from 50 to 80
const gridHeight = 80 // Changed from 50 to 80

// Game state
let board: Board = createBoard(gridWidth, gridHeight, 0)
let running = false
let timer: number | null = null
let generation = 0
let showGrid = false // New state variable to track grid visibility
let showAntsTable = false // New state variable to track ants table visibility
let colorSupremacy = false // New state variable for Color Supremacy mode
let revertColors = false // New state variable for Revert Colors mode

// Ants state
let ants: Ant[] = []
let antCounter = 0
let nextHue = 0
let stepPhase = 0
let golEnabled = true
let isPlacingAnts = false
let isDragging = false

// Structures state
let structuresEnabled = true  // Changed from false to true
let maxSolidity = 100        // Add new variable for maximum solidity

// Lifecycle state
let lifecycleEnabled = true   // Changed from false to true
let maxFullness = 110        // Changed from 50 to 110
let maxLifeDuration = 500    // Changed from 100 to 500

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
const toggleGridBtn = document.createElement('button') // New button for grid visibility
const toggleAntsTableBtn = document.createElement('button') // New button for ants table visibility
const toggleColorSupremacyBtn = document.createElement('button') // New button for Color Supremacy mode
const toggleRevertColorsBtn = document.createElement('button') // New button for Revert Colors mode
const speedLabel = document.createElement('label')
const speedInput = document.createElement('input')
const fullnessLabel = document.createElement('label')
const fullnessSlider = document.createElement('input')
const lifeDurationLabel = document.createElement('label')
const lifeDurationSlider = document.createElement('input')
const maxSolidityLabel = document.createElement('label')  // New label for max solidity
const maxSoliditySlider = document.createElement('input') // New slider for max solidity
const genCounter = document.createElement('div')
const canvas = document.createElement('canvas')
const gridControls = document.createElement('div')
const gameContainer = document.createElement('div') // Container for game elements (canvas + table)
const antsTableContainer = document.createElement('div') // Container for ants table
const antsTable = document.createElement('table') // Table for displaying ants

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
toggleGridBtn.textContent = `Grid: ${showGrid ? 'ON' : 'OFF'}` // Initialize grid toggle button
toggleAntsTableBtn.textContent = `Show Ants Table: ${showAntsTable ? 'ON' : 'OFF'}` // Initialize ants table toggle button
toggleColorSupremacyBtn.textContent = `Color Supremacy: ${colorSupremacy ? 'ON' : 'OFF'}` // Initialize Color Supremacy button
toggleRevertColorsBtn.textContent = `Revert Colors: ${revertColors ? 'ON' : 'OFF'}` // Initialize Revert Colors button
title.textContent = 'Sacred Game of Life'
genCounter.textContent = `Generation: ${generation}`

// Before creating the sliders, add number input fields
const widthInput = document.createElement('input')
const heightInput = document.createElement('input')
const speedNumberInput = document.createElement('input')
const fullnessInput = document.createElement('input')
const lifeDurationInput = document.createElement('input')
const maxSolidityInput = document.createElement('input')  // New input for max solidity

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
configureNumberInput(fullnessInput)
configureNumberInput(lifeDurationInput)
configureNumberInput(maxSolidityInput)  // Configure the new input

// Set initial values
widthInput.value = gridWidth.toString()
heightInput.value = gridHeight.toString()
speedNumberInput.value = '20'
fullnessInput.value = maxFullness.toString()
lifeDurationInput.value = maxLifeDuration.toString()
maxSolidityInput.value = maxSolidity.toString()  // Set initial value for max solidity

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

fullnessSlider.type = 'range'
fullnessSlider.min = '10'
fullnessSlider.max = '200'
fullnessSlider.value = maxFullness.toString()

lifeDurationSlider.type = 'range'
lifeDurationSlider.min = '20'
lifeDurationSlider.max = '500'
lifeDurationSlider.value = maxLifeDuration.toString()

maxSoliditySlider.type = 'range'  // Configure max solidity slider
maxSoliditySlider.min = '10'
maxSoliditySlider.max = '200'
maxSoliditySlider.value = maxSolidity.toString()

// Update labels, simplify them
speedLabel.textContent = 'Speed (ms): '
fullnessLabel.textContent = 'Max Fullness: '
lifeDurationLabel.textContent = 'Life Duration: '
maxSolidityLabel.textContent = 'Max Solidity: '  // Set label text

// Update container appending with correct order - keep only one input per slider
widthContainer.innerHTML = '';
widthContainer.append(widthLabel, widthSlider, widthInput)

heightContainer.innerHTML = '';
heightContainer.append(heightLabel, heightSlider, heightInput)

// Create containers for speed and sliders with the same layout
const speedContainer = document.createElement('div')
speedContainer.className = 'slider-container'
speedContainer.append(speedLabel, speedInput, speedNumberInput)

const fullnessContainer = document.createElement('div')
fullnessContainer.className = 'slider-container'
fullnessContainer.append(fullnessLabel, fullnessSlider, fullnessInput)

const lifeDurationContainer = document.createElement('div')
lifeDurationContainer.className = 'slider-container'
lifeDurationContainer.append(lifeDurationLabel, lifeDurationSlider, lifeDurationInput)

const maxSolidityContainer = document.createElement('div')  // Create container for max solidity
maxSolidityContainer.className = 'slider-container'
maxSolidityContainer.append(maxSolidityLabel, maxSoliditySlider, maxSolidityInput)

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
    toggleLifecycleBtn,
    toggleGridBtn,
    toggleAntsTableBtn,
    toggleColorSupremacyBtn,
    toggleRevertColorsBtn // Add the Revert Colors toggle button
)

// Create separate container for sliders
const slidersContainer = document.createElement('div')
slidersContainer.style.display = 'flex'
slidersContainer.style.gap = '1rem'
slidersContainer.style.flexWrap = 'wrap'
slidersContainer.style.justifyContent = 'center'
slidersContainer.style.width = '100%'
slidersContainer.style.margin = '0.5rem 0'

slidersContainer.append(speedContainer, fullnessContainer, lifeDurationContainer, maxSolidityContainer)  // Add the new container
container.append(title, controls, gridControls, slidersContainer, genCounter, gameContainer)
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
    updateAntsTable() // Update ants table when adding a new ant
}

function addRandomAnt() {
	const x = Math.floor(Math.random() * board.width)
	const y = Math.floor(Math.random() * board.height)
	const dirs: Direction[] = ['N', 'E', 'S', 'W']
	const dir = dirs[Math.floor(Math.random() * dirs.length)]
	addAntAt(x, y, dir)
}

function drawGrid() {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg') || '#242424'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Get max solidity from the new input
    const displayMaxSolidity = parseInt(lifeDurationInput.value)

    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            const cell = board.grid[y][x]
            
            if (cell.value === 1) {
                // Handle live cells
                if (cell.color && cell.solidity > 0) {
                    // Cell has color and positive solidity - apply color transitions
                    const normalProgress = cell.solidity / displayMaxSolidity;
                    
                    if (revertColors && structuresEnabled) {
                        // Revert Colors mode: black -> ant color -> transparent color
                        const hslMatch = cell.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
                        if (hslMatch) {
                            const [_, h, s, l] = hslMatch.map(Number)
                            
                            if (normalProgress > 0.5) {
                                // First half of life: black to ant color
                                const phase1Progress = (1 - normalProgress) * 2; // Maps 1.0->0.5 to 0.0->1.0
                                const newLightness = l * phase1Progress;
                                const newSaturation = s * phase1Progress;
                                ctx.fillStyle = `hsl(${h}, ${newSaturation}%, ${newLightness}%)`;
                            } else {
                                // Second half of life: ant color to transparent color
                                const phase2Progress = (0.5 - normalProgress) * 2; // Maps 0.5->0.0 to 0.0->1.0
                                const alpha = Math.max(0.1, 1.0 - (phase2Progress * 0.9));
                                ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
                            }
                        } else {
                            ctx.fillStyle = '#ffffff'; // Fallback
                        }
                    } else {
                        // Original mode: ant color to transparent color
                        const hslMatch = cell.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
                        if (hslMatch) {
                            const [_, h, s, l] = hslMatch.map(Number)
                            const newSat = s * normalProgress;
                            const alpha = Math.max(0.1, normalProgress);
                            ctx.fillStyle = `hsla(${h}, ${newSat}%, ${l}%, ${alpha})`;
                        } else {
                            ctx.fillStyle = '#ffffff'; // Fallback
                        }
                    }
                } else {
                    // Standard white for normal live cells (without color or with zero solidity)
                    ctx.fillStyle = '#ffffff';
                }
            } else {
                // Cell is dead (value === 0)
                if (cell.color && cell.solidity === 0 && !golEnabled) {
                    // For dead cells with a color and solidity === 0, when GoL is OFF
                    // Show a faint version of the cell's color
                    const hslMatch = cell.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
                    if (hslMatch) {
                        const [_, h, s, l] = hslMatch.map(Number);
                        ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, 0.1)`;
                    } else {
                        ctx.fillStyle = '#111827'; // Default dead cell color
                    }
                } else {
                    ctx.fillStyle = '#111827'; // Default dead cell color
                }
            }
            
            // Draw cell with or without gap based on grid visibility
            if (showGrid) {
                ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1)
            } else {
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
            }
        }
    }

    // Draw grid lines explicitly if grid is visible
    if (showGrid) {
        ctx.strokeStyle = '#333333'; // Dark gray grid lines
        ctx.lineWidth = 0.5;
        
        // Draw vertical grid lines
        for (let x = 0; x <= board.width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cellSize, 0);
            ctx.lineTo(x * cellSize, board.height * cellSize);
            ctx.stroke();
        }
        
        // Draw horizontal grid lines
        for (let y = 0; y <= board.height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * cellSize);
            ctx.lineTo(board.width * cellSize, y * cellSize);
            ctx.stroke();
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

// Function to check if any ants of a given color exist in the game
function antsOfColorExist(color: string): boolean {
    // Make sure we don't count the ant that's being removed
    return ants.some(ant => ant.color === color);
}

// Add a new function to check for extinct colors and clean up their cells
function cleanupExtinctColors() {
    if (!colorSupremacy || !structuresEnabled) return;
    
    // Collect all active ant colors
    const activeColors = new Set<string>();
    ants.forEach(ant => activeColors.add(ant.color));
    
    // Find cells with colors that aren't in the active colors set
    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            const cell = board.grid[y][x];
            if (cell.color && !activeColors.has(cell.color)) {
                // This color is extinct - reset the cell
                cell.solidity = 0;
                cell.color = null;
            }
        }
    }
}

// Modified helper function to release all cells owned by an ant, respecting Color Supremacy mode
function releaseAntCells(ant: ExtendedAnt) {
    if (!ant.ownedCells || ant.ownedCells.length === 0) return;
    
    // Force a scan of the entire board to find cells with this ant's color
    if (structuresEnabled) {
        const antColor = ant.color;
        
        // In Color Supremacy mode, don't clear cells belonging to the color
        // that still has other ants alive
        if (colorSupremacy) {
            // First, remove this ant from the array to check if others of this color exist
            const antIndex = ants.indexOf(ant);
            if (antIndex !== -1) {
                const tempAnt = ants.splice(antIndex, 1)[0];
                
                // Now check if any other ants of this color remain
                const othersExist = antsOfColorExist(antColor);
                
                // Put the ant back (we'll remove it properly later)
                ants.splice(antIndex, 0, tempAnt);
                
                if (othersExist) {
                    // If other ants of this color still exist, only clear this specific ant's owned cells array
                    ant.ownedCells = [];
                    return;
                }
            }
        }
        
        // If we're here, either Color Supremacy is off or this was the last ant of its color
        
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
            
            // Mutations only happen for single offspring, not when producing 2 offspring
            const hasMutation = numNewAnts === 1 && Math.random() < 0.1;
            
            for (let i = 0; i < numNewAnts; i++) {
                const pos = adjacentPositions[i];
                // Make sure positions are within the current board dimensions
                if (pos.x < 0 || pos.x >= board.width || pos.y < 0 || pos.y >= board.height) continue;
                
                const dirs: Direction[] = ['N', 'E', 'S', 'W'];
                const dir = dirs[Math.floor(Math.random() * dirs.length)];
                
                // Set the color - either parent's color or a new random color if mutation occurs
                // Note: hasMutation is already false when creating 2 offspring
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

// Add a new function to handle the behavior of cells when solidity reaches 0
function handleSolidityZero(board: Board): Board {
    // Only do special handling if structures are enabled
    if (!structuresEnabled) return board;
    
    for (let y = 0; y < board.height; y++) {
        for (let x = 0; x < board.width; x++) {
            const cell = board.grid[y][x];
            
            // Find cells with color but zero solidity
            if (cell.color && cell.solidity === 0) {
                if (golEnabled) {
                    // When GoL is ON: cells with solidity=0 become normal live cells
                    // This means they keep their alive state (value=1) but lose their color
                    cell.color = null;
                    // The cell remains alive (value=1) and will participate in GoL rules
                } else {
                    // When GoL is OFF: cells with solidity=0 should just disappear
                    // Set them to dead if they're not already
                    if (cell.value === 1) {
                        cell.value = 0;
                    }
                    // Keep the color for rendering with low opacity
                }
            }
        }
    }
    
    return board;
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
                    board = handleSolidityZero(board) // Call the new function
                    if (golEnabled) {
                        board = nextGeneration(board)
                    }
                    if (colorSupremacy) {
                        cleanupExtinctColors();
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
                        
                        // Update to pass maxSolidity from the input
                        stepAnts(board, ants, structuresEnabled, parseInt(lifeDurationInput.value), parseInt(maxSolidityInput.value))
                        
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
                    if (colorSupremacy) {
                        cleanupExtinctColors();  // Check for extinct colors at the end of each ant movement phase
                    }
                    break
            }
            genCounter.textContent = `Generation: ${generation}`
            drawGrid()
            updateAntsTable() // Update ants table on each step
        }, interval / 2)
    }
}

function stepOnce() {
    switch (stepPhase) {
        case 0:
            board = reduceSolidity(board)
            board = handleSolidityZero(board) // Call the new function
            if (golEnabled) {
                board = nextGeneration(board)
            }
            if (colorSupremacy) {
                cleanupExtinctColors();
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
                
                // Update to pass maxSolidity from the input
                stepAnts(board, ants, structuresEnabled, parseInt(lifeDurationInput.value), parseInt(maxSolidityInput.value))
                
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
            if (colorSupremacy) {
                cleanupExtinctColors();  // Check for extinct colors at the end of each ant movement phase
            }
            break
    }
    genCounter.textContent = `Generation: ${generation}`
    drawGrid()
    updateAntsTable() // Update ants table after each step
}

function clearAll() {
    clearBoard(board)
    ants = []
    antModeBtn.disabled = true
    generation = 0
    genCounter.textContent = `Generation: ${generation}`
    drawGrid()
    updateAntsTable() // Update ants table when clearing all
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
    updateAntsTable() // Update ants table when removing all ants
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
    
    // Update Revert Colors button state based on Structures mode
    toggleRevertColorsBtn.disabled = !structuresEnabled;
    if (!structuresEnabled && revertColors) {
        revertColors = false;
        toggleRevertColorsBtn.textContent = `Revert Colors: OFF`;
    }
    
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

toggleGridBtn.addEventListener('click', () => {
    showGrid = !showGrid;
    toggleGridBtn.textContent = `Grid: ${showGrid ? 'ON' : 'OFF'}`;
    drawGrid();
});

// Add ants table toggle event listener
toggleAntsTableBtn.addEventListener('click', () => {
    showAntsTable = !showAntsTable;
    antsTableContainer.style.display = showAntsTable ? 'block' : 'none';
    toggleAntsTableBtn.textContent = `Show Ants Table: ${showAntsTable ? 'ON' : 'OFF'}`;
    if (showAntsTable) {
        updateAntsTable();
    }
});

// Add Color Supremacy toggle event listener
toggleColorSupremacyBtn.addEventListener('click', () => {
    colorSupremacy = !colorSupremacy;
    toggleColorSupremacyBtn.textContent = `Color Supremacy: ${colorSupremacy ? 'ON' : 'OFF'}`;
    
    // When turning on, immediately clean up extinct colors
    if (colorSupremacy) {
        cleanupExtinctColors();
        drawGrid(); // Redraw to show changes
    }
});

// Add Revert Colors toggle event listener
toggleRevertColorsBtn.addEventListener('click', () => {
    if (structuresEnabled) {
        revertColors = !revertColors;
        toggleRevertColorsBtn.textContent = `Revert Colors: ${revertColors ? 'ON' : 'OFF'}`;
        drawGrid();
    }
});

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

// Add max solidity slider event listeners
maxSoliditySlider.addEventListener('input', (e) => {
    maxSolidityInput.value = (e.target as HTMLInputElement).value
    maxSolidity = parseInt(maxSolidityInput.value)
})

maxSolidityInput.addEventListener('change', (e) => {
    const value = Math.max(10, parseInt((e.target as HTMLInputElement).value) || 100)
    maxSoliditySlider.value = Math.min(Math.max(value, parseInt(maxSoliditySlider.min)), parseInt(maxSoliditySlider.max)).toString()
    maxSolidity = value
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

// canvas.addEventListener('mousedown', (e) => {
// 	isDragging = true
// 	handleCanvasPointer(e)
// })
// canvas.addEventListener('mousemove', (e) => {
//     if (isDragging && !isPlacingAnts) handleCanvasPointer(e) // Changed from antMode to isPlacingAnts
// })
// canvas.addEventListener('mouseup', () => { isDragging = false })
// canvas.addEventListener('mouseleave', () => { isDragging = false })

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

// Style the game container for side-by-side layout
gameContainer.style.display = 'flex'
gameContainer.style.gap = '1rem'
gameContainer.style.justifyContent = 'center'
gameContainer.style.width = '100%'
gameContainer.style.maxWidth = '100vw'
gameContainer.style.overflow = 'auto'

// Style the ants table container
antsTableContainer.style.display = showAntsTable ? 'block' : 'none'
antsTableContainer.style.maxHeight = '600px'
antsTableContainer.style.overflowY = 'auto'
antsTableContainer.style.border = '1px solid #666'
antsTableContainer.style.borderRadius = '4px'
antsTableContainer.style.padding = '0.5rem'
antsTableContainer.style.backgroundColor = '#1a1a1a'
antsTableContainer.style.minWidth = '300px'

// Style the ants table
antsTable.style.width = '100%'
antsTable.style.borderCollapse = 'collapse'
antsTable.style.fontSize = '0.8rem'
antsTable.style.color = '#fff'

antsTableContainer.appendChild(antsTable)
gameContainer.appendChild(canvas)
gameContainer.appendChild(antsTableContainer)

// Function to update the ants table with current ant data
function updateAntsTable() {
    if (!showAntsTable) return;

    // Clear the table
    antsTable.innerHTML = '';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Remove 'Direction' from the headers array
    const headers = ['Color', 'Position', 'Fullness', 'Life Duration'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '0.5rem';
        th.style.textAlign = 'left';
        th.style.borderBottom = '1px solid #666';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    antsTable.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    
    // Add a row for each ant
    ants.forEach((ant, index) => {
        const extAnt = ant as ExtendedAnt;
        const row = document.createElement('tr');
        
        // Color cell with color indicator
        const colorCell = document.createElement('td');
        const colorBox = document.createElement('div');
        colorBox.style.width = '15px';
        colorBox.style.height = '15px';
        colorBox.style.backgroundColor = ant.color;
        colorBox.style.borderRadius = '2px';
        colorBox.style.margin = '0 auto';
        colorCell.appendChild(colorBox);
        
        // Position cell
        const positionCell = document.createElement('td');
        positionCell.textContent = `(${ant.x}, ${ant.y})`;
        
        // Remove direction cell creation
        
        // Fullness cell
        const fullnessCell = document.createElement('td');
        if (extAnt.fullness !== undefined && lifecycleEnabled && structuresEnabled) {
            const percentage = Math.min(100, Math.round((extAnt.fullness / maxFullness) * 100));
            fullnessCell.textContent = `${extAnt.fullness}/${maxFullness} (${percentage}%)`;
        } else {
            fullnessCell.textContent = 'N/A';
        }
        
        // Life duration cell
        const durationCell = document.createElement('td');
        if (extAnt.lifeDuration !== undefined && lifecycleEnabled && structuresEnabled) {
            const percentage = Math.min(100, Math.round((extAnt.lifeDuration / maxLifeDuration) * 100));
            durationCell.textContent = `${extAnt.lifeDuration}/${maxLifeDuration} (${percentage}%)`;
            // Color-code based on remaining life
            if (percentage < 30) {
                durationCell.style.color = '#ff6666';
            }
        } else {
            durationCell.textContent = 'N/A';
        }
        
        // Style the row
        if (index % 2 === 1) {
            row.style.backgroundColor = '#2a2a2a';
        }
        
        // Add cells to row - remove directionCell from the array
        [colorCell, positionCell, fullnessCell, durationCell].forEach(cell => {
            cell.style.padding = '0.5rem';
            cell.style.borderBottom = '1px solid #444';
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
    
    antsTable.appendChild(tbody);
    
    // If no ants, show a message
    if (ants.length === 0) {
        const noAntsRow = document.createElement('tr');
        const noAntsCell = document.createElement('td');
        // Update column span to 4 instead of 5 since we removed a column
        noAntsCell.colSpan = 4;
        noAntsCell.textContent = 'No ants active';
        noAntsCell.style.textAlign = 'center';
        noAntsCell.style.padding = '1rem 0';
        noAntsRow.appendChild(noAntsCell);
        tbody.appendChild(noAntsRow);
    }
}

// Add button styling to prevent size changes
const buttons = [
    playBtn, stepBtn, clearBtn, randomBtn, antModeBtn, 
    addRandomAntBtn, toggleGoLBtn, toggleStructuresBtn, 
    toggleLifecycleBtn, toggleGridBtn, toggleAntsTableBtn,
    toggleColorSupremacyBtn, toggleRevertColorsBtn // Add the new button to the styling array
]
buttons.forEach(btn => {
    btn.style.flexShrink = '0';
    btn.style.padding = '0.5rem 1rem';
    btn.style.fontSize = '1rem';
    btn.style.borderRadius = '4px';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'background-color 0.3s, transform 0.3s';
    btn.addEventListener('mouseover', () => {
        btn.style.backgroundColor = '#444';
        btn.style.transform = 'scale(1.05)';
    });
    btn.addEventListener('mouseout', () => {
        btn.style.backgroundColor = '';
        btn.style.transform = '';
    });
});

// Initialize Revert Colors button state based on Structures mode
toggleRevertColorsBtn.disabled = !structuresEnabled;