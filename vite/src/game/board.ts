export type CellState = 0 | 1;

export interface BoardSize {
	width: number;
	height: number;
}

export interface Cell {
	value: number;
	solidity: number;
	color: string | null;
}

export interface Board extends BoardSize {
	grid: Cell[][];
}

export function createBoard(width: number, height: number, defaultValue: number): Board {
	return {
		width,
		height,
		grid: Array(height)
			.fill(null)
			.map(() =>
				Array(width)
					.fill(null)
					.map(() => ({
						value: defaultValue,
						solidity: 0,
						color: null,
					}))
			),
	};
}

export function cloneBoard(board: Board): Board {
	return { width: board.width, height: board.height, grid: [...board.grid] };
}

export function clearBoard(board: Board): void {
	board.grid.forEach((row) => row.forEach((cell) => (cell.value = 0)));
}

export function indexOf(board: Board, x: number, y: number): number {
	return y * board.width + x;
}

export function inBounds(board: Board, x: number, y: number): boolean {
	return x >= 0 && x < board.width && y >= 0 && y < board.height;
}

export function getCell(board: Board, x: number, y: number): number {
	return board.grid[y][x].value;
}

export function setCell(
	board: Board,
	x: number,
	y: number,
	value: number,
	color?: string | null,
	solidity?: number
) {
	const cell = board.grid[y][x];
	cell.value = value;
	if (color !== undefined) cell.color = color;
	if (solidity !== undefined) cell.solidity = solidity;
}

export function toggleCell(board: Board, x: number, y: number): void {
	if (!inBounds(board, x, y)) return;
	const cell = board.grid[y][x];
	cell.value = cell.value ? 0 : 1;
	cell.color = null;
	cell.solidity = 0;
}

export function countNeighbors(board: Board, x: number, y: number): number {
	let count = 0;
	for (let dy = -1; dy <= 1; dy++) {
		for (let dx = -1; dx <= 1; dx++) {
			if (dx === 0 && dy === 0) continue;
			const nx = x + dx;
			const ny = y + dy;
			if (!inBounds(board, nx, ny)) continue; // finite board; off-grid is dead
			count += getCell(board, nx, ny);
		}
	}
	return count;
}

export function reduceSolidity(board: Board): Board {
	const newBoard = createBoard(board.width, board.height, 0);

	for (let y = 0; y < board.height; y++) {
		for (let x = 0; x < board.width; x++) {
			const cell = board.grid[y][x];
			newBoard.grid[y][x] = {
				value: cell.value,
				color: cell.solidity > 1 ? cell.color : null,
				solidity: cell.solidity > 0 ? cell.solidity - 1 : 0,
			};
		}
	}
	return newBoard;
}

export function nextGeneration(board: Board): Board {
	const newBoard = createBoard(board.width, board.height, 0);

	for (let y = 0; y < board.height; y++) {
		for (let x = 0; x < board.width; x++) {
			const cell = board.grid[y][x];

			// Copy solid cells without applying GoL rules
			if (cell.solidity > 0) {
				newBoard.grid[y][x] = {
					value: cell.value,
					color: cell.color,
					solidity: cell.solidity,
				};
				continue;
			}

			// Count live neighbors (excluding cells with solidity)
			let neighbors = 0;
			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					if (dx === 0 && dy === 0) continue;
					const ny = (y + dy + board.height) % board.height;
					const nx = (x + dx + board.width) % board.width;
					const neighborCell = board.grid[ny][nx];
					if (neighborCell.value === 1 && neighborCell.solidity === 0) {
						neighbors++;
					}
				}
			}

			// Apply Game of Life rules only to cells without solidity
			newBoard.grid[y][x].value =
				cell.value === 1
					? neighbors === 2 || neighbors === 3
						? 1
						: 0
					: neighbors === 3
					? 1
					: 0;
		}
	}
	return newBoard;
}

export function fromCoords(width: number, height: number, liveCoords: Array<[number, number]>): Board {
	const board = createBoard(width, height, 0);
	for (const [x, y] of liveCoords) {
		if (inBounds(board, x, y)) setCell(board, x, y, 1);
	}
	return board;
}

export function toCoords(board: Board): Array<[number, number]> {
	const coords: Array<[number, number]> = [];
	for (let y = 0; y < board.height; y++) {
		for (let x = 0; x < board.width; x++) {
			if (getCell(board, x, y) === 1) coords.push([x, y]);
		}
	}
	return coords;
}