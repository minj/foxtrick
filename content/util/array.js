/*
* array.js
* Array handler functions
* Most of them can be used with array-like structures like node lists.
* @author ryanli, convincedd, LA-MJ
*/

'use strict';

/* eslint-disable */
if (!Foxtrick)
	var Foxtrick = {};
/* eslint-enable */

/**
 * Convert an array-like object to an array
 * Suitable for node lists, arrays, strings,
 * match() object and the arguments object
 * Anything that has a length property and properties 0, 1, 2...
 * @param	{array}	arrayLike
 * @return	{array}
 */
Foxtrick.toArray = function(arrayLike) {
	if (typeof arrayLike === 'undefined') {
		Foxtrick.error('No array specified');
		return [];
	}
	else if (arrayLike === null) {
		return [];
	}

	return Array.from(arrayLike);
};

/**
 * Runs func(el, i, array) for each element in an array-like.
 * @param  {function(*, number, array)} func
 * @param  {array}                      array array-like
 */
Foxtrick.forEach = function(func, array) {
	Foxtrick.toArray(array).forEach(func);
};

/**
 * Returns an array with the values of func(el, i, array)
 * for each element el in array-like.
 * @param  {function(*, number, array)} func
 * @param  {array}                      array array-like
 * @return {array}
 */
Foxtrick.map = function(func, array) {
	return Foxtrick.toArray(array).map(func);
};

/**
 * Returns an array that contains elements in a given array-like
 * that satisfy func(el, i, array) == true.
 * @param  {function(*, number, array)} func
 * @param  {array}                      array array-like
 * @return {array}
 */
Foxtrick.filter = function(func, array) {
	return Foxtrick.toArray(array).filter(func);
};

/**
 * Tests whether at least one element in a given array-like
 * satisfies func(el, i, array) == true.
 * @param  {function(*, number, array)} func
 * @param  {array}                      array array-like
 * @return {boolean}
 */
Foxtrick.any = function(func, array) {
	return Foxtrick.toArray(array).some(func);
};

/**
 * Tests whether all elements in a given array-like
 * satisfy func(el, i, array) == true.
 * @param  {function(*, number, array)} func
 * @param  {array}                      array array-like
 * @return {boolean}
 */
Foxtrick.all = function(func, array) {
	return Foxtrick.toArray(array).every(func);
};

/**
 * Tests how many elements in a given array-like
 * satisfy func(el, i, array) == true.
 * @param  {function(*, number, array)} func
 * @param  {array}                      array array-like
 * @return {number}
 */
Foxtrick.count = function(func, array) {
	return Foxtrick.toArray(array).reduce(function(ct, e, i, a) {
		var newCt = ct;
		if (func(e, i, a))
			newCt++;

		return newCt;
	}, 0);
};

/**
 * Returns the n-th element in a given array-like
 * that satisfies func(el, i, array) == true, or null if not found.
 * n is optional and defaults to 0 (first element).
 * @param  {function(*, number, array)} func
 * @param  {array}                      array array-like
 * @param  {number=}                    n
 * @return {*}                                found element or null
 */
Foxtrick.nth = function(func, array, n) {
	var count = n || 0;
	var ct = 0;
	var ret = null;

	Foxtrick.any(function(e, i, a) {
		// loop until found
		if (func(e, i, a)) {
			// we have a match
			if (ct++ === count) {
				// found n-th match: stop
				ret = e;
				return true;
			}
		}

		// continue
		return false;

	}, array);

	return ret;
};

/**
 * Returns the concat of two array-likes a and b.
 * Does not modify originals.
 * @param  {array} a array-like
 * @param  {array} b array-like
 * @return {array}   concat
 */
Foxtrick.concat = function(a, b) {
	return Foxtrick.toArray(a).concat(Foxtrick.toArray(b));
};

/**
 * Returns the unique intersection (===) of two array-likes a and b.
 * Does not modify originals.
 * @param  {array} a array-like
 * @param  {array} b array-like
 * @return {array}   intersection
 */
Foxtrick.intersect = function(a, b) {
	var r = Foxtrick.filter(function(e) {
		return Foxtrick.has(b, e);
	}, a);
	return Foxtrick.unique(r);
};

/**
 * Pushes all elements of array b onto array a.
 * Better use native arrays only.
 * @param  {array}  a array
 * @param  {array}  b array
 * @return {number}   new length
 */
Foxtrick.push = function(a, b) {
	return Array.prototype.push.apply(a, Foxtrick.toArray(b));
};

/**
 * Pushes all elements of array b onto array  a if they don't already exist (===) there.
 * Better use native arrays only.
 * @param  {array}  a array
 * @param  {array}  b array
 * @return {number}   new length
 */
Foxtrick.pushNew = function(a, b) {
	// find elements in b but not in a
	var newElements = Foxtrick.filter(function(e) {
		return !Foxtrick.has(a, e);
	}, b);

	return Foxtrick.push(a, newElements);
};

/**
 * Returns the first index of an element e in an array-like (===), or -1 if not found.
 * @param  {array}  array
 * @param  {*}      e
 * @return {number}
 */
Foxtrick.indexOf = function(array, e) {
	return Foxtrick.toArray(array).indexOf(e);
};

/**
 * Tests whether an element e is in an array-like (===).
 * @param  {array}   array
 * @param  {*}       e
 * @return {boolean}
 */
Foxtrick.has = function(array, e) {
	return Foxtrick.indexOf(array, e) !== -1;
};

/**
 * Returns an array that contains elements in a given array-like
 * that are not (!==) element e.
 * Does not modify the original array.
 * @param  {array} array array-like
 * @param  {*}     e     element to exclude
 * @return {array}
 */
Foxtrick.exclude = function(array, e) {
	return Foxtrick.filter(function(current) {
		return current !== e;
	}, array);
};

/**
 * Returns an array that contains unique elements in a given array-like.
 * Does not modify the original array.
 * @param  {array} arrayLike array-like
 * @return {array}
 */
Foxtrick.unique = function(arrayLike) {
	return Array.from(new Set(Foxtrick.toArray(arrayLike)));
};

/**
 * Python's range implementation.
 *
 * @param  {number}           start
 * @param  {number?}          limit optional; becomes (0, start) effectively
 * @param  {number?}          step  optional; defaults to 1
 * @return {Iterable<number>}       iterable of numbers, NOT an array
 */
Foxtrick.range = (start, limit, step = 1) => (function*(start, limit, step) {
	let i = start, lim = limit;
	if (typeof limit == 'undefined') {
		lim = start;
		i = 0;
	}

	let stp = Number(step);

	if (!stp) {
		throw new TypeError('Step must be non-zero');
	}
	else if (stp > 0) {
		while (i < lim) {
			yield i;
			i += stp;
		}
	}
	else {
		while (i > lim) {
			yield i;
			i += stp;
		}
	}

})(start, limit, step);
