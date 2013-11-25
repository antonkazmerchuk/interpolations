(function (window, undefined) {

	var METHODS = {
		'Newton' : Newton,
		'Lagrange' : {
			'standard' : StandardLagrange,
			'barycentric' : {
				'first form' : BarycentricLagrange1,
				'second form' : BarycentricLagrange2
			}
		}
	};

	function repeat(num, times) {
		var array = [], i;

		for (i = 0; i < times; i++) {
			array.push(num);
		}

		return array;
	}

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

	function AbstractLagrange(tuples, computer) {
		var modifiedTuples = modifyTuples(tuples),
			xs = modifiedTuples.xs,
			ys = modifiedTuples.ys,
			minX = min(xs), 
			maxX = max(xs);
			polynomial = computer(xs, ys, minX, maxX);

		polynomial.interpolationStartX = minX;
		polynomial.interpolationEndX = maxX;
		polynomial.originalData = tuples;

		return polynomial;	
	}

	// Produces instant polynomial
	function StandardLagrange(tuples) {
		return AbstractLagrange(
				tuples, 
				function standardLagrange(xs, ys, minX, maxX) {
					return function standardLagrange(x) {
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
					}
			});	
	}

	StandardLagrange.preconditions = isTupleArrayPrecondition;

	// Produces instant polynomial
	function AbstractBarycentricLagrange(tuples, computer) {
		function computeWeights(xs) {
			var weights = repeat(1, xs.length),
				j, k;

			for (j = 1; j < xs.length; j++) {
				for (k = 0; k < j; k++) {
					weights[k] *= xs[k] - xs[j];
					weights[j] *= xs[j] - xs[k];
				}
			}

			for(j = 0; j < xs.length; j++) {
				weights[j] = 1/ weights[j];
			}

			return weights;
		}

		var modifiedTuples = modifyTuples(tuples),
			xs = modifiedTuples.xs,
			weights = computeWeights(xs);

		return AbstractLagrange(
				tuples, 
				computer(weights));	
	}

	function BarycentricLagrange1(tuples) {
		return AbstractBarycentricLagrange(tuples, function (weights) {
			return function standardLagrange(xs, ys, minX, maxX) {
					return function standardLagrange(x) {
						var lx = 1, i, result = 0;

						for (i = 0; i < xs.length; i++) {
							lx *= x - xs[i];
							if (lx === 0) return ys[i];
						}

						for (i = 0; i < xs.length; i++) {
							result += ys[i] * weights[i] / (x - xs[i]);
						}

						return result * lx;
					}
			}
		});
	}

	BarycentricLagrange1.preconditions = isTupleArrayPrecondition;
	
	function BarycentricLagrange2(tuples) {
		return AbstractBarycentricLagrange(tuples, function (weights) {
			return function standardLagrange(xs, ys, minX, maxX) {
					return function standardLagrange(x) {
						var i, num = denom = 0, term, diff;

						for (i = 0; i < xs.length; i++) {
							diff = (x - xs[i]);
							if (diff === 0) return ys[i];
							term = (weights[i] / diff);
							num += ys[i] * term;
							denom += term;
						}

						return num/denom;
					}
			}
		});
	}

	BarycentricLagrange2.preconditions = isTupleArrayPrecondition;

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