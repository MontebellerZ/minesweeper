import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import autoSolver from "./solver/solver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate, faBomb, faCircleNotch, faStar } from "@fortawesome/free-solid-svg-icons";

function EmptyField({ size, startGame }) {
	let field = [];

	for (let i = 0; i < size; i++) {
		let row = [];
		for (let j = 0; j < size; j++) {
			row.push(
				<button
					key={j}
					className="cell closed"
					onClick={() => {
						startGame(i, j);
					}}
					onDoubleClick={() => {}}
					onContextMenu={(e) => {
						e.preventDefault();
					}}
				></button>
			);
		}
		field.push(row);
	}

	return <>{field}</>;
}

function StartField({ size, mines, startPos }) {
	function addToLabel(row, column, defaultField = []) {
		if (row >= 0 && row < size && column >= 0 && column < size) {
			defaultField[row][column].label++;
		}
	}

	function setBombs(defaultField) {
		let availableCells = [];
		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				if (i === startPos[0] - 1 && j === startPos[1] - 1) continue;
				if (i === startPos[0] - 1 && j === startPos[1]) continue;
				if (i === startPos[0] - 1 && j === startPos[1] + 1) continue;
				if (i === startPos[0] && j === startPos[1] - 1) continue;
				if (i === startPos[0] && j === startPos[1]) continue;
				if (i === startPos[0] && j === startPos[1] + 1) continue;
				if (i === startPos[0] + 1 && j === startPos[1] - 1) continue;
				if (i === startPos[0] + 1 && j === startPos[1]) continue;
				if (i === startPos[0] + 1 && j === startPos[1] + 1) continue;

				availableCells.push({
					row: i,
					column: j,
				});
			}
		}

		for (let i = 0; i < mines; i++) {
			let randPos = Math.floor(Math.random() * availableCells.length);

			let randCell = availableCells.splice(randPos, 1)[0];

			defaultField[randCell.row][randCell.column].bomb = true;

			addToLabel(randCell.row - 1, randCell.column - 1, defaultField);
			addToLabel(randCell.row - 1, randCell.column, defaultField);
			addToLabel(randCell.row - 1, randCell.column + 1, defaultField);
			addToLabel(randCell.row, randCell.column - 1, defaultField);
			addToLabel(randCell.row, randCell.column + 1, defaultField);
			addToLabel(randCell.row + 1, randCell.column - 1, defaultField);
			addToLabel(randCell.row + 1, randCell.column, defaultField);
			addToLabel(randCell.row + 1, randCell.column + 1, defaultField);
		}
	}

	function getValidPos(row, column, fieldCopy) {
		let sizeX = fieldCopy.length;
		let sizeY = fieldCopy[0].length;
		return row >= 0 && row < sizeX && column >= 0 && column < sizeY
			? { cell: fieldCopy[row][column], row: row, column: column }
			: null;
	}

	function changeUncovered(defaultField, copyField) {
		let bombsAmount = 0;
		let bombCells = [];
		let cleanCells = [];

		for (let i = 0; i < copyField.length; i++) {
			for (let j = 0; j < copyField[i].length; j++) {
				let cell = copyField[i][j];

				if (cell.cover && !cell.flagged) {
					if (cell.bomb) {
						bombsAmount++;
						bombCells.push({ cell, row: i, column: j });
					} else {
						cleanCells.push({ cell, row: i, column: j });
					}
				}
			}
		}

		for (let i = 0; i < bombsAmount && bombCells.length > 0 && cleanCells.length > 0; i++) {
			let cellBomb = bombCells.splice(Math.floor(Math.random() * bombCells.length), 1)[0];
			let cellClean = cleanCells.splice(Math.floor(Math.random() * cleanCells.length), 1)[0];

			let cellB1 = getValidPos(cellBomb.row - 1, cellBomb.column - 1, copyField);
			let cellB2 = getValidPos(cellBomb.row - 1, cellBomb.column, copyField);
			let cellB3 = getValidPos(cellBomb.row - 1, cellBomb.column + 1, copyField);
			let cellB4 = getValidPos(cellBomb.row, cellBomb.column - 1, copyField);
			let cellB5 = getValidPos(cellBomb.row, cellBomb.column + 1, copyField);
			let cellB6 = getValidPos(cellBomb.row + 1, cellBomb.column - 1, copyField);
			let cellB7 = getValidPos(cellBomb.row + 1, cellBomb.column, copyField);
			let cellB8 = getValidPos(cellBomb.row + 1, cellBomb.column + 1, copyField);

			[cellB1, cellB2, cellB3, cellB4, cellB5, cellB6, cellB7, cellB8].forEach((cb) => {
				if (cb) {
					copyField[cb.row][cb.column].label--;
					defaultField[cb.row][cb.column].label--;
				}
			});

			copyField[cellBomb.row][cellBomb.column].bomb = false;
			defaultField[cellBomb.row][cellBomb.column].bomb = false;
			cleanCells.push(cellBomb);

			let cellC1 = getValidPos(cellClean.row - 1, cellClean.column - 1, copyField);
			let cellC2 = getValidPos(cellClean.row - 1, cellClean.column, copyField);
			let cellC3 = getValidPos(cellClean.row - 1, cellClean.column + 1, copyField);
			let cellC4 = getValidPos(cellClean.row, cellClean.column - 1, copyField);
			let cellC5 = getValidPos(cellClean.row, cellClean.column + 1, copyField);
			let cellC6 = getValidPos(cellClean.row + 1, cellClean.column - 1, copyField);
			let cellC7 = getValidPos(cellClean.row + 1, cellClean.column, copyField);
			let cellC8 = getValidPos(cellClean.row + 1, cellClean.column + 1, copyField);

			[cellC1, cellC2, cellC3, cellC4, cellC5, cellC6, cellC7, cellC8].forEach((cc) => {
				if (cc) {
					copyField[cc.row][cc.column].label++;
					defaultField[cc.row][cc.column].label++;
				}
			});

			copyField[cellClean.row][cellClean.column].bomb = true;
			defaultField[cellClean.row][cellClean.column].bomb = true;
			bombCells.push(cellClean);
		}
	}

	function clearField(defaultField) {
		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				defaultField[i][j].bomb = false;
				defaultField[i][j].label = 0;
			}
		}
	}

	function firstState() {
		let lastGameId = localStorage.getItem("lastGameId");
		if (!isNaN(lastGameId)) lastGameId = parseInt(lastGameId);
		else lastGameId = 0;

		let lastGames = localStorage.getItem("lastGames");
		if (lastGames) lastGames = JSON.parse(!Array.isArray(lastGames));
		if (!lastGames || !Array.isArray(lastGames)) lastGames = [];

		let nextId = lastGameId + 1;
		let nextGame = {
			id: nextId,
			height: size,
			width: size,
			mines: mines,
			data: new Date().valueOf(),
		};

		lastGames.push(nextGame);
		sessionStorage.setItem("lastGameId", nextId.toString());
		sessionStorage.setItem("lastGames", JSON.stringify(lastGames));
		sessionStorage.setItem("actualGame", JSON.stringify(nextGame));

		let defaultField = [];

		for (let i = 0; i < size; i++) {
			let row = [];

			for (let j = 0; j < size; j++) {
				row.push({
					bomb: false, // refers to if the cell has a bomb in it
					flagged: false, // refers to if the cell is marked as a bomb by the player
					cover: !(i === startPos[0] && j === startPos[1]) ? true : false, // refers to if the cell is opened or stay closed
					label: 0, // refers to the amount of bombs surrounding this cell
				});
			}

			defaultField.push(row);
		}

		while (true) {
			setBombs(defaultField);

			let copyField = JSON.parse(JSON.stringify(defaultField));

			let solvable = autoSolver(copyField);

			for (let i = 0; i < 30 && !solvable; i++) {
				changeUncovered(defaultField, copyField);

				solvable = autoSolver(copyField);
			}

			if (solvable) break;
			else clearField(defaultField);
		}

		uncoverNeighbours(startPos[0], startPos[1], defaultField);

		setGameStatus(2);

		return defaultField;
	}

	const uncoverNeighbours = (row, column, nField) => {
		let address1 = { row: row - 1, column: column - 1 };
		let address2 = { row: row - 1, column: column };
		let address3 = { row: row - 1, column: column + 1 };
		let address4 = { row: row, column: column - 1 };
		let address5 = { row: row, column: column + 1 };
		let address6 = { row: row + 1, column: column - 1 };
		let address7 = { row: row + 1, column: column };
		let address8 = { row: row + 1, column: column + 1 };

		[address1, address2, address3, address4, address5, address6, address7, address8].forEach(
			({ row, column }) => {
				if (row >= 0 && row < size && column >= 0 && column < size) {
					let cell = nField[row][column];

					if (cell.cover && !cell.flagged) {
						cell.cover = false;

						if (cell.label === 0) {
							uncoverNeighbours(row, column, nField);
						}
					}
				}
			}
		);
	};

	const uncoverCell = (row, column) => {
		if (field[row][column].cover && !field[row][column].flagged) {
			setField((field) => {
				let nField = JSON.parse(JSON.stringify(field));

				let cell = nField[row][column];

				cell.cover = false;

				if (cell.bomb) {
					return nField;
				}

				if (cell.label === 0) {
					uncoverNeighbours(row, column, nField);
				}

				return nField;
			});
		}
	};

	const flagCell = (row, column) => {
		if (field[row][column].cover) {
			setField((field) => {
				let nField = JSON.parse(JSON.stringify(field));
				nField[row][column].flagged = !nField[row][column].flagged;
				return nField;
			});
		}
	};

	const openRemaining = (row, column) => {
		let cell = field[row][column];

		let address1 = { row: row - 1, column: column - 1 };
		let address2 = { row: row - 1, column: column };
		let address3 = { row: row - 1, column: column + 1 };
		let address4 = { row: row, column: column - 1 };
		let address5 = { row: row, column: column + 1 };
		let address6 = { row: row + 1, column: column - 1 };
		let address7 = { row: row + 1, column: column };
		let address8 = { row: row + 1, column: column + 1 };

		let foundMines = 0;

		[address1, address2, address3, address4, address5, address6, address7, address8].forEach(
			({ row, column }) => {
				if (row >= 0 && row < size && column >= 0 && column < size) {
					let neighbourCell = field[row][column];

					if (neighbourCell.flagged) {
						foundMines++;
					}
				}
			}
		);

		if (cell.label - foundMines === 0) {
			setField((field) => {
				let nField = JSON.parse(JSON.stringify(field));
				uncoverNeighbours(row, column, nField);
				return nField;
			});
		}
	};

	function saveGame(field) {
		let lastGames = JSON.parse(sessionStorage.getItem("lastGames"));
		let actualGame = JSON.parse(sessionStorage.getItem("actualGame"));

		actualGame.field = field;
		for (let i = lastGames.length - 1; i >= 0; i--) {
			if (lastGames[i].id === actualGame.id) {
				lastGames[i].field = field;
				break;
			}
		}

		sessionStorage.setItem("lastGames", JSON.stringify(lastGames));
		sessionStorage.setItem("actualGame", JSON.stringify(actualGame));
	}

	const [field, setField] = useState(new Array(size).fill(new Array(size).fill({ cover: true })));
	const [gameStatus, setGameStatus] = useState(0);
	const [remainingMines, setRemainingMines] = useState(mines);

	useEffect(() => {
		setGameStatus(1);
	}, []);

	useEffect(() => {
		if (gameStatus === 1) setField(firstState());
	}, [gameStatus]);

	useEffect(() => {
		if (gameStatus === 2) {
			let unknownAmount = 0;
			let flaggedAmount = 0;
			let bombFound = false;

			for (let i = 0; i < field.length; i++) {
				for (let j = 0; j < field[i].length; j++) {
					let cell = field[i][j];
					if (!cell.cover && cell.bomb) {
						bombFound = true;
					}
					if (cell.cover && !cell.flagged) {
						unknownAmount++;
					}
					if (cell.cover && cell.flagged) {
						flaggedAmount++;
					}
				}
			}

			setRemainingMines(mines - flaggedAmount);

			if (bombFound) setGameStatus(4);
			else if (unknownAmount === 0 && flaggedAmount === mines) setGameStatus(3);

			saveGame(field);
		}
	}, [gameStatus, field, mines]);

	return (
		<>
			{field.map((row, i) => {
				return row.map((cell, j) => {
					return (
						<button
							key={j}
							className={`cell ${
								cell.cover
									? "closed" + (cell.flagged ? " flagged" : "")
									: cell.bomb
									? "bomb"
									: ""
							}`}
							onClick={() => {
								uncoverCell(i, j);
							}}
							onContextMenu={(e) => {
								e.preventDefault();
								flagCell(i, j);
							}}
							onDoubleClick={() => {
								openRemaining(i, j);
							}}
						>
							{cell.cover
								? cell.flagged || <span>{`${i},${j}`}</span>
								: cell.bomb
								? ""
								: cell.label || ""}
						</button>
					);
				});
			})}

			<div
				id="status"
				style={{
					display:
						gameStatus === 0 || gameStatus === 1 || gameStatus === 3 || gameStatus === 4
							? "flex"
							: "none",
				}}
			>
				<div className="statusCenter">
					{gameStatus === 0 && (
						<>
							<span>
								<FontAwesomeIcon
									// icon={faSpinner}
									// className="fa-pulse"
									icon={faCircleNotch}
									className="fa-spin"
								/>
							</span>
							<span>Game will start soon</span>
						</>
					)}
					{gameStatus === 1 && (
						<>
							<span>
								<FontAwesomeIcon
									// icon={faSpinner}
									// className="fa-pulse"
									icon={faCircleNotch}
									className="fa-spin"
								/>
							</span>
							<span>Generating field</span>
						</>
					)}
					{gameStatus === 3 && (
						<>
							<span>
								<FontAwesomeIcon icon={faStar} />
							</span>
							<span>You won!</span>
						</>
					)}
					{gameStatus === 4 && (
						<>
							<span>
								<FontAwesomeIcon icon={faBomb} />
							</span>
							<span>You lost!</span>
						</>
					)}
				</div>
			</div>
		</>
	);
}

function App() {
	const [startPos, setStartPos] = useState();

	const [size, setSize] = useState(20);
	const [mines, setMines] = useState(Math.ceil(size * size * 0.2));

	const [sizeInput, setSizeInput] = useState(size);
	const [minesInput, setMinesInput] = useState(mines);

	const refApp = useRef(null);
	const refGameHolder = useRef(null);
	const refInputSize = useRef(null);
	const refInputMines = useRef(null);

	const [windowSize, setWindowSize] = useState();

	const startGame = (row, column) => {
		setStartPos([row, column]);
	};

	const resetGame = (e) => {
		if (e) e.preventDefault();
		setSize(sizeInput);
		setMines(minesInput);
		setStartPos();
	};

	const keyDown = (e) => {
		switch (e.key) {
			case "r":
				resetGame();
				break;
			case "s":
				refInputSize.current.focus();
				break;
			case "m":
				refInputMines.current.focus();
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		function handleResize() {
			setWindowSize({
				width: refGameHolder.current.clientWidth,
				height: refGameHolder.current.clientHeight,
			});
		}

		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		refApp.current.focus();
	}, [startPos]);

	return (
		<div className="App" ref={refApp} tabIndex={0} onKeyDown={keyDown}>
			<form id="configs" onSubmit={resetGame}>
				<label>
					<span>Size</span>
					<input
						type={"number"}
						max={30}
						min={0}
						ref={refInputSize}
						value={sizeInput}
						onChange={(e) => {
							setSizeInput(Math.round(e.target.value));
						}}
					/>
				</label>

				<label>
					<span>Mines</span>
					<input
						type={"number"}
						max={Math.floor(size * size * 0.4)}
						min={0}
						ref={refInputMines}
						value={minesInput}
						onChange={(e) => {
							setMinesInput(Math.round(e.target.value));
						}}
					/>
				</label>

				<button type="submit">
					<FontAwesomeIcon icon={faArrowsRotate} />
				</button>
			</form>

			<div id="gameHolder" ref={refGameHolder}>
				<div
					id="field"
					style={{
						gridTemplateColumns: `repeat(${size}, 1fr)`,
						...(windowSize && windowSize.height > windowSize.width
							? { width: "100%" }
							: { height: "100%" }),
					}}
				>
					{startPos ? (
						<StartField size={size} mines={mines} startPos={startPos} />
					) : (
						<EmptyField size={size} startGame={startGame} />
					)}
				</div>
			</div>

			{/* <div id="modalHolder">
				<div id="modal"></div>
			</div> */}
		</div>
	);
}

export default App;
