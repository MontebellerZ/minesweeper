import gaussJordan from "./gaussJordan";

function getValidPos(row, column, fieldCopy) {
	let sizeX = fieldCopy.length;
	let sizeY = fieldCopy[0].length;
	return row >= 0 && row < sizeX && column >= 0 && column < sizeY
		? { cell: fieldCopy[row][column], row: row, column: column }
		: null;
}

function getUnknownAmount(row, column, fieldCopy) {
	let cell = fieldCopy[row][column];
	let cell1 = getValidPos(row - 1, column - 1, fieldCopy);
	let cell2 = getValidPos(row - 1, column, fieldCopy);
	let cell3 = getValidPos(row - 1, column + 1, fieldCopy);
	let cell4 = getValidPos(row, column - 1, fieldCopy);
	let cell5 = getValidPos(row, column + 1, fieldCopy);
	let cell6 = getValidPos(row + 1, column - 1, fieldCopy);
	let cell7 = getValidPos(row + 1, column, fieldCopy);
	let cell8 = getValidPos(row + 1, column + 1, fieldCopy);

	let flaggedNeighbour = [cell1, cell2, cell3, cell4, cell5, cell6, cell7, cell8].filter(
		(c) => c != null && c.cell.cover && c.cell.flagged
	);

	return cell.label - flaggedNeighbour.length;
}

function checkCompleteness(fieldCopy) {
	for (let i = 0; i < fieldCopy.length; i++) {
		for (let j = 0; j < fieldCopy[i].length; j++) {
			if (fieldCopy[i][j].cover === true && fieldCopy[i][j].flagged === false) {
				return false;
			}
		}
	}

	return true;
}

export default function autoSolver(fieldCopy) {
	let sizeX = fieldCopy.length;
	let sizeY = fieldCopy[0].length;
	let unknownAmount = sizeX * sizeY;
	let flaggedAmount = 0;
	let uncoveredBorder;

	if (checkCompleteness(fieldCopy)) return true;

	let sureCellFound = true;
	while (sureCellFound === true) {
		sureCellFound = false;
		uncoveredBorder = [];
		unknownAmount = sizeX * sizeY;

		for (let i = 0; i < sizeX; i++) {
			for (let j = 0; j < sizeY; j++) {
				let cell = fieldCopy[i][j];

				if (!cell.cover || cell.flagged) {
					unknownAmount--;
				}

				if (!cell.cover) {
					let cell1 = getValidPos(i - 1, j - 1, fieldCopy);
					let cell2 = getValidPos(i - 1, j, fieldCopy);
					let cell3 = getValidPos(i - 1, j + 1, fieldCopy);
					let cell4 = getValidPos(i, j - 1, fieldCopy);
					let cell5 = getValidPos(i, j + 1, fieldCopy);
					let cell6 = getValidPos(i + 1, j - 1, fieldCopy);
					let cell7 = getValidPos(i + 1, j, fieldCopy);
					let cell8 = getValidPos(i + 1, j + 1, fieldCopy);

					let coveredNeighbour = [
						cell1,
						cell2,
						cell3,
						cell4,
						cell5,
						cell6,
						cell7,
						cell8,
					].filter((c) => c != null && c.cell.cover && !c.cell.flagged);

					let flaggedNeighbour = [
						cell1,
						cell2,
						cell3,
						cell4,
						cell5,
						cell6,
						cell7,
						cell8,
					].filter((c) => c != null && c.cell.cover && c.cell.flagged);

					if (coveredNeighbour.length > 0 && cell.label - flaggedNeighbour.length === 0) {
						for (let cellFound of coveredNeighbour) {
							fieldCopy[cellFound.row][cellFound.column].cover = false;
						}

						sureCellFound = true;
						break;
					}

					if (
						coveredNeighbour.length > 0 &&
						coveredNeighbour.length === cell.label - flaggedNeighbour.length
					) {
						for (let cellFound of coveredNeighbour) {
							fieldCopy[cellFound.row][cellFound.column].flagged = true;
						}

						sureCellFound = true;
						break;
					}

					if (coveredNeighbour.length > 0) {
						uncoveredBorder.push({
							cell: cell,
							row: i,
							column: j,
							coveredNeighbour: coveredNeighbour,
						});
					}
				}
			}

			if (sureCellFound) {
				break;
			}
		}
	}

	if (checkCompleteness(fieldCopy)) return true;

	let coveredNeighbours = [];
	for (let ub of uncoveredBorder) {
		ub.coveredNeighbour.forEach((un) => {
			if (!coveredNeighbours.find((cn) => cn.row === un.row && cn.column === un.column)) {
				coveredNeighbours.push(un);
			}
		});
	}

	let bombs = [];
	let matrix = [];

	uncoveredBorder.forEach((ub) => {
		bombs.push(getUnknownAmount(ub.row, ub.column, fieldCopy));

		matrix.push(
			coveredNeighbours.map((cn) => {
				let finded = ub.coveredNeighbour.find(
					(ubcn) => cn.row === ubcn.row && cn.column === ubcn.column
				);

				return finded ? 1 : 0;
			})
		);
	});

	if (matrix.length > 0) {
		for (let k = 0; k < 4 && !sureCellFound; k++) {
			[matrix, bombs] = gaussJordan(matrix, bombs);

			for (let i = 0; i < matrix.length; i++) {
				let low_bound = 0;
				let up_bound = 0;
				let anwser = bombs[i];

				for (let j in matrix[i]) {
					if (matrix[i][j] > 0) up_bound++;
					if (matrix[i][j] < 0) low_bound--;
				}

				if (low_bound === anwser) {
					for (let j = 0; j < coveredNeighbours.length; j++) {
						// undetermined
						if (matrix[i][j] === 0) {
							continue;
						}
						let cellChange = coveredNeighbours[j];
						// not mines
						if (matrix[i][j] > 0) {
							fieldCopy[cellChange.row][cellChange.column].cover = false;
							sureCellFound = true;
						}
						// mines
						else if (matrix[i][j] < 0) {
							fieldCopy[cellChange.row][cellChange.column].flagged = true;
							sureCellFound = true;
						}
					}
				} else if (up_bound === anwser) {
					for (let j = 0; j < coveredNeighbours.length; j++) {
						if (matrix[i][j] === 0) {
							continue;
						}
						let cellChange = coveredNeighbours[j];
						// mines
						if (matrix[i][j] > 0) {
							fieldCopy[cellChange.row][cellChange.column].flagged = true;
							sureCellFound = true;
						}
						// not mines
						else if (matrix[i][j] < 0) {
							fieldCopy[cellChange.row][cellChange.column].cover = false;
							sureCellFound = true;
						}
					}
				}
			}

			if (k === 2 && !sureCellFound) {
				bombs = [];
				matrix = [];

				uncoveredBorder.forEach((ub) => {
					bombs.push(getUnknownAmount(ub.row, ub.column, fieldCopy));

					matrix.push(
						coveredNeighbours.map((cn) => {
							let finded = ub.coveredNeighbour.find(
								(ubcn) => cn.row === ubcn.row && cn.column === ubcn.column
							);

							return finded ? 1 : 0;
						})
					);
				});
			}
		}
	}

	if (sureCellFound) {
		if (checkCompleteness(fieldCopy)) return true;

		return autoSolver(fieldCopy);
	}

	return false;
}
