'use strict';
/*
 * array.js
 * Array handler functions
 * Most of them can be used with array-like structures like node lists.
 * @author ryanli, convincedd, LA-MJ
 */

if (!Foxtrick)
	var Foxtrick = {};

/**
 * Convert an array-like object to an array
 * Suitable for node lists, arrays, strings,
 * match() object and the arguments object
 * Anything that has a length property and properties 0, 1, 2...
 * @param	{Array}	arrayLike
 * @return	{Array}
 */
Foxtrick.toArray = function(arrayLike) {
	if (typeof arrayLike === 'undefined') {
		try {
			throw new Error('No array specified');
		}
		catch (e) {
			Foxtrick.log(e);
			return [];
		}
	}
	else if (arrayLike === null)
		return [];

	return Array.prototype.slice.call(arrayLike);
};

/**
 * Runs func(el, i, array) for each element in an array-like.
 * @param  {function(*, number, Array)} func
 * @param  {Array}                      array array-like
 */
Foxtrick.forEach = function(func, array) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	array.forEach(func);
};

/**
 * Returns an array with the values of func(el, i, array)
 * for each element el in array-like.
 * @param  {function(*, number, Array)} func
 * @param  {Array}                      array array-like
 * @return {Array}
 */
Foxtrick.map = function(func, array) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.map(func);
};

/**
 * Returns an array that contains elements in a given array-like
 * that satisfy func(el, i, array) == true.
 * @param  {function(*, number, Array)} func
 * @param  {Array}                      array array-like
 * @return {Array}
 */
Foxtrick.filter = function(func, array) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.filter(func);
};

/**
 * Tests whether at least one element in a given array-like
 * satisfies func(el, i, array) == true.
 * @param  {function(*, number, Array)} func
 * @param  {Array}                      array array-like
 * @return {boolean}
 */
Foxtrick.any = function(func, array) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.some(func);
};

/**
 * Tests whether all elements in a given array-like
 * satisfy func(el, i, array) == true.
 * @param  {function(*, number, Array)} func
 * @param  {Array}                      array array-like
 * @return {boolean}
 */
Foxtrick.all = function(func, array) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.every(func);
};

/**
 * Tests how many elements in a given array-like
 * satisfy func(el, i, array) == true.
 * @param  {function(*, number, Array)} func
 * @param  {Array}                      array array-like
 * @return {number}
 */
Foxtrick.count = function(func, array) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.reduce(function(ct, e, i, a) {
		if (func(e, i, a))
			ct++;
		return ct;
	}, 0);
};

/**
 * Returns the n-th element in a given array-like
 * that satisfies func(el, i, array) == true, or null if not found.
 * n is optional and defaults to 0 (first element).
 * @param  {function(*, number, Array)} func
 * @param  {Array}                      array array-like
 * @param  {number=}                    n
 * @return {*}                                found element or null
 */
Foxtrick.nth = function(func, array, n) {
	var count = 0;
	var ret = null;
	if (!n)
		n = 0;

	Foxtrick.any(function(e, i, a) {
		// loop until found
		if (func(e, i, a)) {
			// we have a match
			if (count++ === n) {
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
 * @param  {Array} a array-like
 * @param  {Array} b array-like
 * @return {Array}   concat
 */
Foxtrick.concat = function(a, b) {
	if (!Array.isArray(a))
		a = Foxtrick.toArray(a);
	if (!Array.isArray(b))
		b = Foxtrick.toArray(b);
	return a.concat(b);
};

/**
 * Returns the unique intersection (===) of two array-likes a and b.
 * Does not modify originals.
 * @param  {Array} a array-like
 * @param  {Array} b array-like
 * @return {Array}   intersection
 */
Foxtrick.intersect = function(a, b) {
	var r = Foxtrick.filter(function(e, i, a) { return Foxtrick.has(b, e); }, a);
	return Foxtrick.unique(r);
};

/**
 * Pushes all elements of array b onto array a.
 * Better use native arrays only.
 * @param  {Array}  a array
 * @param  {Array}  b array
 * @return {number}   new length
 */
Foxtrick.push = function(a, b) {
	if (typeof a !== 'object' || a === null) {
		try {
			throw new Error('No array specified');
		}
		catch (e) {
			Foxtrick.log(e);
			return 0;
		}
	}
	return Array.prototype.push.apply(a, b);
};

/**
 * Pushes all elements of array b onto array  a if they don't already exist (===) there.
 * Better use native arrays only.
 * @param  {Array}  a array
 * @param  {Array}  b array
 * @return {number}   new length
 */
Foxtrick.pushNew = function(a, b) {
	// find elements in b but not in a
	var newElements = Foxtrick.filter(function(e, i, b) { return !Foxtrick.has(a, e); }, b);
	return Foxtrick.push(a, newElements);
};

/**
 * Returns the first index of an element e in an array-like (===), or -1 if not found.
 * @param  {Array}  array
 * @param  {*}      e
 * @return {number}
 */
Foxtrick.indexOf = function(array, e) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.indexOf(e);
};

/**
 * Tests whether an element e is in an array-like (===).
 * @param  {Array}   array
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
 * @param  {Array} array array-like
 * @param  {*}     e     element to exclude
 * @return {Array}
 */
Foxtrick.exclude = function(array, e) {
	return Foxtrick.filter(function(current, i, array) {
		if (current !== e)
			return true;
		return false;
	}, array);
};

/**
 * Returns an array that contains unique elements in a given array-like.
 * Does not modify the original array.
 * @param  {Array} array array-like
 * @return {Array}
 */
Foxtrick.unique = function(array) {
	if (typeof array !== 'object' || array === null) {
		try {
			throw new Error('No array specified');
		}
		catch (e) {
			Foxtrick.log(e);
			return [];
		}
	}
	var ret = [];
	var n = array.length;
	for (var i = 0; i < n; ++i) {
		for (var j = i + 1; j < n; ++j) {
			if (array[i] === array[j])
				j = ++i;
		}
		ret.push(array[i]);
	}
	return ret;
};
