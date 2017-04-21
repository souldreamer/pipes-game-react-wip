import * as update from 'immutability-helper';

export interface ConnectionInformation {
	top: boolean;
	bottom: boolean;
	left: boolean;
	right: boolean;
};

export function rotateSymbol(connectionInformation: ConnectionInformation, clicks: number): ConnectionInformation {
	let {top, bottom, left, right} = connectionInformation;
	for (let i = 0; i < clicks % 4; i++) {
		const oldTop = top;
		top = left;
		left = bottom;
		bottom = right;
		right = oldTop;
	}
	return {top, bottom, left, right};
}

type GameSymbolInformation = {[symbol: string]: ConnectionInformation};

const baseGameSymbols: GameSymbolInformation = {
	'|': {top: true, right: false, bottom: true, left: false},
	'<': {top: true, right: true, bottom: false, left: false},
	'+': {top: true, right: true, bottom: true, left: true},
	'T': {top: false, right: true, bottom: true, left: true},
	'0': {top: false, right: false, bottom: false, left: false}
};

export const GameSymbols: GameSymbolInformation = {
	'|': baseGameSymbols['|'],
	'-': rotateSymbol(baseGameSymbols['|'], 1),
	'<': baseGameSymbols['<'],
	'^': rotateSymbol(baseGameSymbols['<'], 1),
	'>': rotateSymbol(baseGameSymbols['<'], 2),
	'_': rotateSymbol(baseGameSymbols['<'], 3),
	'+': baseGameSymbols['+'],
	'T': baseGameSymbols.T,
	'A': rotateSymbol(baseGameSymbols.T, 1),
	'I': rotateSymbol(baseGameSymbols.T, 2),
	'H': rotateSymbol(baseGameSymbols.T, 3),
	'0': baseGameSymbols['0']
};

function matchSymbol(
	top: boolean|undefined,
	right: boolean|undefined,
	bottom: boolean|undefined,
	left: boolean|undefined,
	matchWith: ConnectionInformation
): boolean {
	return (
		(top == null || top === matchWith.top) &&
		(right == null || right === matchWith.right) &&
		(bottom == null || bottom === matchWith.bottom) &&
		(left == null || left === matchWith.left)
	);
}

export function findSymbol(connectionInformation: ConnectionInformation): string {
	const {top, bottom, left, right} = connectionInformation;
	for (let symbol of Object.keys(GameSymbols)) {
		const {top: t, bottom: b, left: l, right: r} = GameSymbols[symbol];
		if (top === t && bottom === b && left === l && right === r) { return symbol; }
	}
	return '';
}

type SpatialConnectionInformation = {
	topConnection?: ConnectionInformation;
	rightConnection?: ConnectionInformation;
	bottomConnection?: ConnectionInformation;
	leftConnection?: ConnectionInformation;
};

function filterSymbols(
	{
		topConnection,
		rightConnection,
		bottomConnection,
		leftConnection
	}: SpatialConnectionInformation): string[] {
	const needsTop: boolean|undefined = topConnection && topConnection.bottom;
	const needsBottom: boolean|undefined = bottomConnection && bottomConnection.top;
	const needsRight: boolean|undefined = rightConnection && rightConnection.left;
	const needsLeft: boolean|undefined = leftConnection && leftConnection.right;

	return Object.keys(GameSymbols).filter(
		symbol => matchSymbol(needsTop, needsRight, needsBottom, needsLeft, GameSymbols[symbol])
	);
}

function shuffle(array: any[]): any[] {
	let m = array.length, t, i;
	const arr = [...array];
	while (m) {
		i = Math.floor(Math.random() * m--);
		t = arr[m];
		arr[m] = arr[i];
		arr[i] = t;
	}
	return arr;
}

interface BoardPoint {
	row: number;
	col: number;
}

function getNonEmptyStartingPoint(board: string[][]): BoardPoint {
	for (let i = 1; i < board.length - 1; i++) {
		for (let j = 1; j < board[i].length; j++) {
			if (board[i][j] && board[i][j] !== '0') { return {row: i, col: j}; }
		}
	}
	return {row: -1, col: -1}; // should not get here
}

function alreadyVisited(visiting: BoardPoint, visited: BoardPoint[]): boolean {
	return visited.some(v => v.row === visiting.row && v.col === visiting.col);
}

interface TryStatus {
	successful: boolean;
	recurseSize: number;
}
const tryUnsuccessful: (recurseSize?: number) => TryStatus =
	(recurseSize = 1) => ({successful: false, recurseSize: recurseSize as number});
const trySuccessful: () => TryStatus = () => ({successful: true, recurseSize: 0});

function getConnectedPipeSystemLength(board: string[][]): number {
	let {row, col} = getNonEmptyStartingPoint(board);
	const visited: BoardPoint[] = [];
	const toVisit: BoardPoint[] = [];
	toVisit.push({row, col});
	let visiting: BoardPoint | undefined;

	while (visiting = toVisit.shift()) {
		if (!alreadyVisited(visiting, visited)) {
			visited.push(visiting);
			const symbol = GameSymbols[board[visiting.row][visiting.col]];
			if (symbol.top) { toVisit.push({row: visiting.row - 1, col: visiting.col}); }
			if (symbol.right) { toVisit.push({row: visiting.row, col: visiting.col + 1}); }
			if (symbol.bottom) { toVisit.push({row: visiting.row + 1, col: visiting.col}); }
			if (symbol.left) { toVisit.push({row: visiting.row, col: visiting.col - 1}); }
		}
	}

	return visited.length;
}

function getNumZeroes(board: string[][]): number {
	return board.reduce(
		(totalZeroes, row, i) => totalZeroes + (i === 0 || i === board.length - 1 ? 0 : 1) * row.reduce(
			(rowZeroes, el, j) => rowZeroes + (j === 0 || j === row.length - 1 ? 0 : 1) * (el === '0' ? 1 : 0), 0
		),
		0
	);
}

function isBoardFit(board: string[][]): TryStatus {
	const rows = board.length - 2;
	const cols = board[0].length - 2;
	const numZeroes = getNumZeroes(board);

	// we have too many empty cells
	if (rows > 1 && cols > 1 && numZeroes > 0.3 * rows * cols) {
		return tryUnsuccessful(Math.floor(Math.random() * rows * cols));
	}

	// see if we only have one pipe system
	const connectedPipeSystemLength = getConnectedPipeSystemLength(board);
	if (connectedPipeSystemLength + numZeroes < rows * cols) {
		return tryUnsuccessful(Math.floor(Math.random() * rows * cols));
	}

	return trySuccessful();
}

function trySymbolOnBoard(board: string[][], row: number, col: number, rows: number, cols: number): TryStatus {
	if (row > rows) {
		return isBoardFit(board);
	}

	let possibleSymbols = shuffle(filterSymbols({
		topConnection: GameSymbols[board[row - 1][col]],
		rightConnection: GameSymbols[board[row][col + 1]],
		bottomConnection: GameSymbols[board[row + 1][col]],
		leftConnection: GameSymbols[board[row][col - 1]]
	}));

	if (possibleSymbols.length === 0) { return tryUnsuccessful(); }

	const nextRow = col === cols ? row + 1 : row;
	const nextCol = col === cols ? 1 : col + 1;

	for (let symbol of possibleSymbols) {
		board[row][col] = symbol;
		const currentTry = trySymbolOnBoard(board, nextRow, nextCol, rows, cols);
		if (currentTry.successful) { return currentTry; }
		if (--currentTry.recurseSize > 0) {
			delete board[row][col];
			return tryUnsuccessful(currentTry.recurseSize);
		}
	}
	delete board[row][col];
	return tryUnsuccessful();
}

// TODO: allow pre-seed of board

export function generateLevel(rows: number, cols: number): string[][] {
	let board: string[][] = [[]];
	for (let i = 0; i < rows + 2; i++) {
		board[i] = ['0'];
		board[i][cols + 1] = '0';
	}
	for (let i = 0; i < cols + 2; i++) {
		board[0][i] = '0';
		board[rows + 1][i] = '0';
	}
	while (!trySymbolOnBoard(board, 1, 1, rows, cols).successful) {}
	return board;
}

export function rotateBoardPieceInPlace(board: string[][], row: number, col: number, rotation: number = 1) {
	board[row][col] = findSymbol(rotateSymbol(GameSymbols[board[row][col]], rotation));
}

export function rotateBoardPiece(board: string[][], row: number, col: number, rotation: number = 1): string[][] {
	const applyRotation = (element: string) =>
		findSymbol(rotateSymbol(GameSymbols[element], rotation));
	return update(board, {[row]: {[col]: {$apply: applyRotation}}});
}

function getMutationFrequency(originalBoard: string[][], newBoard: string[][]): number {
	let mutationFreq = (newBoard.reduce(
		(total, row, i) => total + row.reduce(
			(rowMutations, el, j) => rowMutations + (
				el !== originalBoard[i][j] ||
				el === '+' ||
				el === '0'
					? 1 : 0),
			0
		),
		0
	) - 2 * newBoard.length - 2 * newBoard[0].length + 4) / ((newBoard.length - 2) * (newBoard[0].length - 2));
	console.log({mutationFreq});
	return mutationFreq;
}
export function randomizeLevel(board: string[][], mutationFrequency: number = 0.8): string[][] {
	console.log('randomizing level');
	const newBoard: string[][] = board.map(row => [...row]);
	do {
		for (let i = 1; i < board.length - 1; i++) {
			for (let j = 1; j < board[i].length - 1; j++) {
				rotateBoardPieceInPlace(newBoard, i, j, Math.floor(Math.random() * (4 - mutationFrequency) + mutationFrequency));
			}
		}
	} while (getMutationFrequency(board, newBoard) < mutationFrequency);
	return newBoard;
}

export function checkLevelCompletion(board: string[][]): boolean {
	for (let i = 1; i < board.length - 1; i++) {
		for (let j = 1; j < board[i].length - 1; j++) {
			if (GameSymbols[board[i][j]].top && !GameSymbols[board[i - 1][j]].bottom) { return false; }
			if (GameSymbols[board[i][j]].right && !GameSymbols[board[i][j + 1]].left) { return false; }
			if (GameSymbols[board[i][j]].bottom && !GameSymbols[board[i + 1][j]].top) { return false; }
			if (GameSymbols[board[i][j]].left && !GameSymbols[board[i][j - 1]].right) { return false; }
		}
	}
	return true;
}
