/**
 * credits to: https://jsfiddle.net/Tinytsunami/6j4ru96n/
 *
 * just did a few minor changes (removed everything related to printing
 * the results to the screen and inserted everything rest into a function
 * called gaussJordan(A,b) that mainly joins A and b to the same matrix
 * and then call the other functions with it)
 *
 * @param {*} A Matrix
 * @param {*} b Augmented array
 * @returns [A, b]: A and b after the Gauss and Jordan funcionalities
 */
export default function gaussJordan(A, b) {
	let matrix = JSON.parse(JSON.stringify(A));

	for (let i = 0; i < matrix.length; i++) {
		matrix[i].push(b[i]);
	}

	let exchange = function (A, a, b) {
		let T = Array.from(A[a]);
		A[a] = A[b];
		A[b] = T;
	};

	let addition = function (A, a, b, scalar) {
		A[b] = A[b].map(function (v, k) {
			return v + A[a][k] * scalar;
		});
	};

	let scalar = function (A, a, scalar) {
		A[a] = A[a].map(function (v, k) {
			return v * scalar;
		});
	};

	let findPivots = function (A, from) {
		return Array.from(
			{
				length: A.length - from,
			},
			function (e, i) {
				for (let j = 0; j < A[i + from].length; j++) {
					if (A[i + from][j] !== 0) {
						return j;
					}
				}
				return A[0].length;
			}
		);
	};

	let minIndex = function (arr) {
		let index = 0;
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] < arr[index]) {
				index = i;
			}
		}
		return index;
	};

	let Gauss = function (A) {
		let m = A.length;
		let n = A[0].length;
		for (let i = 0; i < m; i++) {
			let pivots = findPivots(A, i);
			let p = {
				i: 0,
				j: 0,
			};
			p.i = minIndex(pivots);
			p.j = pivots[p.i];
			if (p.j === n) {
				return;
			}
			exchange(A, i, i + p.i);
			scalar(A, i, 1 / A[i][p.j]);
			for (let j = i + 1; j < m; j++) {
				addition(A, i, j, -A[j][p.j] / A[i][p.j]);
			}
		}
	};

	let Jordan = function (A) {
		let m = A.length;
		let n = A[0].length;
		for (let i = m - 1; i >= 0; i--) {
			let pivots = findPivots(A, i);
			let p = {
				i: null,
				j: pivots[0],
			};
			if (p.j === n) {
				continue;
			}
			for (let j = i - 1; j >= 0; j--) {
				addition(A, i, j, -A[j][p.j] / A[i][p.j]);
			}
		}
	};

	if (matrix !== null) {
		Gauss(matrix);
		Jordan(matrix);

		let newA = [];
		let newB = [];
		for (let line of matrix) {
			newA.push(line.slice(0, -1));
			newB.push(line.slice(-1)[0]);
		}
		return [newA, newB];
	}

	return null;
}
