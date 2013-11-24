(function (window, undefined) {

	var METHODS = {
		'Newton' : Newton
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

			if (x > xs.end || x < xs.start) {
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

	function hasProp(obj, prop) {
		return obj.hasOwnProperty(prop);
	}

	function isTupleArray(potentialTupleArray) {
		if (!Array.isArray(potentialTupleArray)) {
			return false;
		}

		for (var i = 0; i < potentialTupleArray.length; i++) {
			if (!hasProp(potentialTupleArray[i], 'x') || 
				!hasProp(potentialTupleArray[i], 'y') || 
				!number(potentialTupleArray[i].x) || 
				!number(potentialTupleArray[i].y)) {
				return false;
			}
		}

		return true;
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


	// Params should be (x,y) tuple array
	// Interpolates only, doesn't attempt to extrapole in any way
	// In extrapolation-range it is zero
	function Newton (tuples) {
		var modifiedTuples = {xs : [], ys : []},
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

		for (i = 0; i < tuples.length; i++) {
			modifiedTuples.xs.push(tuples[i].x);
			modifiedTuples.ys.push(tuples[i].y);
		}

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

		return new Polynomial(polynomial, {start : tuples[0].x, end: tuples[tuples.length - 1].x});
	}

	Newton.preconditions = isTupleArrayPrecondition;

	function interpolate (method, params) {
		var preconditionsResult;

		if(!string(method)) {
			console.error('Interpolation method is not a string!');
			return; // Non-intrusively return
		}

		if (!METHODS.hasOwnProperty(method)) {
			console.error('Interpolation method is not defined!');
			return; // Non-intrusively return
		}

		if (METHODS[method].preconditions && 
			(typeof METHODS[method].preconditions === 'function') && 
			(preconditionsResult = !METHODS[method].preconditions(params).result)) {
			console.error('Preconditions for interpolation method are not met:');
			console.error(preconditionsResult.description);
			return;
		}

		return METHODS[method](params);
	}

	window.interpolate = interpolate;
}(window))