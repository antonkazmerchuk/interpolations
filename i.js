(function (window, undefined) {

	var METHODS = {
		'Newton' : Newton,
		'Lagrange' : {
			'standard' : StandardLagrange
		}
	};

	function Polynomial (polynomial, xs) {
		var polynomial = window.expandPolynomial(polynomial);

		function asString() {
			var accum = [], i;

			for (i = 0; i < polynomial.length; i++) {
				accum.push('(' + polynomial[i] + 'x^' + (polynomial.length - i - 1) + ')')
			}

			return accum.join('+');
		}

		function poly(x) {
			var result = 0, i;

			if (notInRange(x, xs.start, xs.end)) {
				return 0;
			}

			for(i = polynomial.length - 1; i >= 0; i--) {
				result += polynomial[i] * Math.pow(x, polynomial.length - i - 1);
			}

			return result;
		}

		poly.interpolationStartX = xs.start;
		poly.interpolationEndX = xs.end;
		poly.asString = asString;

		return poly;
	}

	function string(potentialString) {
		return typeof potentialString === 'string';
	}

	function number(potentialNumber) {
		return (typeof potentialNumber === 'number' || 
				potentialNumber instanceof 'Number') && 
				!isNaN(potentialNumber);
	}

	function array(potentialArray) {
		return Array.isArray(potentialArray);
	}

	function hasProp(obj, prop) {
		return obj.hasOwnProperty(prop);
	}

	function isTupleArray(potentialTupleArray) {
		if (!Array.isArray(potentialTupleArray)) {
			return false;
		}

		var hash = {}, i;

		for (i = 0; i < potentialTupleArray.length; i++) {
			if (!hasProp(potentialTupleArray[i], 'x') || 
				!hasProp(potentialTupleArray[i], 'y') || 
				!number(potentialTupleArray[i].x) || 
				!number(potentialTupleArray[i].y)) {
				return false;
			}

			if (hash.hasOwnProperty(potentialTupleArray[i].x)) {
				return false;
			}

			hash[potentialTupleArray[i].x] = true;
		}

		return true;
	}

	function notInRange(val, min, max) {
		if (val < min || val > max) {
			return true;
		} 

		return false;
	}

	function isTupleArrayPrecondition(potentialTupleArray) {
		if (isTupleArray(potentialTupleArray)) {
			return {
				result: true,
				description: ''
			}
		} else {
			return {
				result: false,
				description: '[' + potentialTupleArray + '] is not a tuple array'  
			}
		}
	}

	function modifyTuples(tuples) {
		var modifiedTuples = {xs : [], ys : []}
		for (i = 0; i < tuples.length; i++) {
			modifiedTuples.xs.push(tuples[i].x);
			modifiedTuples.ys.push(tuples[i].y);
		}

		return modifiedTuples;
	}

	function min(array) {
		return Math.min.apply(null, array);
	}

	function max(array) {
		return Math.max.apply(null, array);
	}

	// Polynomial is obtained by Neville (finite-differences algorithm)
	// TODO : it is ok, we have xs and coeffs (Neville), how do we compute poly using this most efficiently
	function Newton (tuples) {
		// TODO: tuples should be sorted

		var modifiedTuples = {},
			coefficients = [],
			polynomial,
			i, j;

		function finiteDifferences(params, step) {
			if (params.ys.length === 1) {
				return [params.ys[0]];
			}

			var newDifferences = {xs : [], ys : []},
				i, j,
				result,
				multTerm, subMultTerm;

			for (i = 0; i < params.ys.length - 1; i++) {
				newDifferences.ys.push(
					(params.ys[i + 1] - params.ys[i]) / (params.xs[i + step] - params.xs[i])
				);
			}

			newDifferences.xs = newDifferences.xs.concat(params.xs);

			result = finiteDifferences(newDifferences, step + 1);
			result.unshift(params.ys[0]);

			return result;
		}

		modifiedTuples = modifyTuples(tuples);

		coefficients = finiteDifferences(modifiedTuples, 1);

		//  In poly-expander syntax
		polynomial = [[]];

		for (i = 0; i < coefficients.length; i++) {
			multTerm = [];
			multTerm.push(coefficients[i]);



			for (j = 0; j < i; j++) {

				subMultTerm = [];
				subMultTerm.push(1);
				subMultTerm.push(-modifiedTuples.xs[j]);
				multTerm.push(subMultTerm);
			}

			polynomial.push(multTerm);
		}

		polynomial = new Polynomial(polynomial, {start : tuples[0].x, end: tuples[tuples.length - 1].x});
		polynomial.originalData = tuples;

		return polynomial;
	}

	Newton.preconditions = isTupleArrayPrecondition;

	// Produces instant polynomial
	function StandardLagrange(tuples) {
		var modifiedTuples = modifyTuples(tuples),
			xs = modifiedTuples.xs
			ys = modifiedTuples.ys,
			minX = min(xs), 
			maxX = max(xs);
			polynomial = function standardLagrange(x) {
				var i, j, res = 0, y;

				if(notInRange(x, minX, maxX)) {
					return 0;
				}

				// n ^ 2
				for (i = 0; i < tuples.length; i++) {
					y = ys[i];

					for (j = 0; j < tuples.length; j++) {
						y *= i === j && 1 || (x - xs[j]) / (xs[i] - xs[j]);
					}

					res += y;
				}

				return res;
			};

		polynomial.interpolationStartX = minX;
		polynomial.interpolationEndX = maxX;
		polynomial.originalData = tuples;

		return polynomial;
	}

	StandardLagrange.preconditions = isTupleArrayPrecondition;

	function interpolate (method, params) {
		var i, mthd, preconditionsResult;

		function warnNoMethod() {
			console.error('Interpolation method is not defined!');	
		}

		if(!string(method) && !array(method)) {
			console.error('Interpolation method is neither string nor array!');
			return; // Non-intrusively return
		}

		if (string(method) && !(mthd = METHODS.hasOwnProperty(method) && METHODS[method])) {
			warnNoMethod();
			return; // Non-intrusively return
		}

		if (array(method)) {
			mthd = METHODS;
			for (i = 0; i < method.length; i++) {
				if (!(mthd = mthd[method[i]])) {
					warnNoMethod();
					return; 
				}
			}
		}

		if (mthd.preconditions && 
			(typeof mthd.preconditions === 'function') && 
			((preconditionsResult = !mthd.preconditions(params)).result)) {
			console.error('Preconditions for interpolation method are not met:');
			console.error(preconditionsResult.description);
			return;
		}

		return mthd(params);
	}

	window.interpolate = interpolate;
}(window))