import { setCell, type Board } from './board'

export type Direction = 'N' | 'E' | 'S' | 'W'

export interface Ant {
    id: string
    x: number
    y: number
    dir: Direction
    color: string
    lastX?: number
    lastY?: number
}

const directionOrder: Direction[] = ['N', 'E', 'S', 'W']

function turnRight(dir: Direction): Direction {
    const index = directionOrder.indexOf(dir)
    return directionOrder[(index + 1) % 4]
}

function turnLeft(dir: Direction): Direction {
    const index = directionOrder.indexOf(dir)
    return directionOrder[(index + 3) % 4] // Wrap around to the left
}

function moveForward(ant: Ant, board: Board) {
    switch (ant.dir) {
        case 'N': ant.y = (ant.y - 1 + board.height) % board.height; break
        case 'E': ant.x = (ant.x + 1) % board.width; break
        case 'S': ant.y = (ant.y + 1) % board.height; break
        case 'W': ant.x = (ant.x - 1 + board.width) % board.width; break
    }
}

export function stepAnts(board: Board, ants: Ant[], structuresEnabled: boolean = false, solidity: number = 0) {
    for (const ant of ants) {
        if (ant.x < 0 || ant.x >= board.width || ant.y < 0 || ant.y >= board.height) continue;
        
        const currentCell = board.grid[ant.y][ant.x];

        // Turn based on current cell state
        if (currentCell.value === 1) {
            ant.dir = turnRight(ant.dir);
        } else {
            ant.dir = turnLeft(ant.dir);
        }

        // Flip the cell state
        const newValue = currentCell.value === 1 ? 0 : 1;
        if (structuresEnabled && newValue === 1) {
            setCell(board, ant.x, ant.y, newValue, ant.color, solidity);
        } else {
            setCell(board, ant.x, ant.y, newValue, null, 0);
        }

        moveForward(ant, board);
    }
}

export function createAnt(id: string, x: number, y: number, dir: Direction, color: string): Ant {
    return { id, x, y, dir, color, lastX: undefined, lastY: undefined }
}