// http://github.com/antonkazmerchuk/poly-expander/

(function (context, undefined) {

	function minmax(arr1, arr2) {
		function pred() {
			return arr1.length > arr2.length;
		}
		var longer = pred() ? arr1 : arr2,
			shorter = pred() ? arr2 : arr1;

		return {longer : longer, shorter : shorter};
	}

	function plus(arr1, arr2) {
		var longer = minmax(arr1, arr2).longer,
			shorter = minmax(arr1, arr2).shorter,
			diff = Math.abs(arr1.length - arr2.length),
			result = [],
			i;

		while(diff--) {
			shorter.unshift(0);
		}

		for (i = 0; i < longer.length; i++) {
			result[i] = longer[i] + shorter[i];
		}

		return result;
	}
	function map(array, fn) {
		var result = [];
		for (var i = 0; i < array.length; i++) {
			result.push(fn(array[i]));
		}

		return result;
	}

	function mult(factor, array) {
		return map(array, function (a) {return a * factor;});
	}

	function reduce(array, fn, init) {
		var arr = init && array || array.slice(1),
			init = init || array[0];

		for (var i = 0; i < arr.length; i++) {
			init = fn(init, arr[i]);
		}

		return init;
	}

	// Here we get list of simplified polys, like: [[1, 3, 5] [4,5], [7, 8, whateva]]
	function distribute(polys) {
		function distributeInternal(poly1, poly2) {
			var sums = [],
				longer = minmax(poly1, poly2).longer,
				shorter = minmax(poly1, poly2).shorter,
				i, j;

			for (i = 0; i < shorter.length; i++) {
				var sum = [];

				for (j = 0; j < longer.length; j++) {
					sum.push(longer[j] * shorter[i]);
				}

				for (j = 0; j < shorter.length - i - 1; j++) {
					sum.push(0);
				}

				sums.push(sum);
			}

			sums = reduce(sums, plus);


			return sums;
		}

		return reduce(polys, distributeInternal);
	}

	function number(potentialNumber) {
		return (typeof(potentialNumber) === 'number' ||
				 Object.prototype.toString.apply(potentialNumber) === '[object Number]') && 
				!isNaN(potentialNumber);
	}

	function isArray(potentialArray) {
		return Array.isArray(potentialArray);
	}

	function isEmptyArray(potentialEmptyArray) {
		return isArray(potentialEmptyArray) && potentialEmptyArray.length === 0;
	}

	function isNonEmptyArray(potentialEmptyArray) {
		return isArray(potentialEmptyArray) && potentialEmptyArray.length !== 0;
	}

	// The algo goes as following:
	// 1. If the first element is array and it's an empty array
	// 		or the first element is a number then it is 'complex' polynomial. In sense that it is not simple
	//	  - Then the remaining elements must be non-empty arrays
	// 2. If the first element is a number, it is a 'simple' polynomial
	// 	  - Then the remaining elements must be numbers
	// 3. If the polynomial consists of one term, it cannot be an empty array or non-number
	// 4. If it poly is empty array that's pretty incorrect
	// 5. If all elements are non-empty arrays that is correct
	// 5. Otherwise it is incorrect
	function incorrect(poly) {
		var i, wereArrays, wereNumbers;

		if (poly.length === 0) {
			return true;
		}

		if (poly.length === 1) {
			return isEmptyArray(poly[0]) || (!isArray(poly[0]) && !number(poly[0]));
		} else if (number(poly[0])) {
			wereArrays = false;
			wereNumbers = false;

			for (i = 1; i < poly.length; i++) {
				if (number(poly[i]) && wereArrays) {
					return true;
				} else if (number(poly[i])) {
					wereNumbers = true;
					continue;
				}

				if (isNonEmptyArray(poly[i]) && wereNumbers) {
					return true;
				} else if (isNonEmptyArray(poly[i])) {
					wereArrays = true;
					continue;
				}

				return true;
			}

			return false;
		} else if (isEmptyArray(poly[0]) || isNonEmptyArray(poly[0])) {
			for (i = 1; i < poly.length; i++) {
				if (!isNonEmptyArray(poly[i])) {
					return true;
				}
			}

			return false;
		}

		return true;
	}

	function simplePolynomial(poly) {
		if (poly.length === 0) {
			return false;
		}

		for (var i = 0; i < poly.length; i++) {
			if (!number(poly[i])) {
				return false;
			}
		}

		return true;
	}

	function expandPolynomial(poly) {
		var coefficient, polys;

		if (incorrect(poly)) {
			throw new Error('Incorrect polynomial specified !' + ' Couldn\'t understand: ' + JSON.stringify(poly));
		}

		if (simplePolynomial(poly)) {
			return poly;
		} else if (number(poly[0]) || isEmptyArray(poly[0])) {
			coefficient = poly[0];
			poly = poly.slice(1);
		} else {
			coefficient = 1;
		}

		if (number(coefficient)) {
			return mult(coefficient, distribute(map(poly, expandPolynomial)));	
		} else {
			return reduce(map(poly, expandPolynomial), plus);
		}
	}

	context.expandPolynomial = expandPolynomial;

	// DO TESTS:!

	// context.tests = {
	// 	map : map,
	// 	minmax: minmax,
	// 	plus : plus,
	// 	mult : mult,
	// 	reduce : reduce,
	// 	distribute : distribute,
	// 	number : number,
	// 	incorrect : incorrect,
	// 	simplePolynomial : simplePolynomial,
	// 	expandPolynomial : expandPolynomial
	// };
}(window))