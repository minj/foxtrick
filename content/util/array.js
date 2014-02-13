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
	return Array.prototype.slice.call(arrayLike);
};

// loops over an array-like with a function
Foxtrick.forEach = function(func, array) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	array.forEach(func);
};
// returns an array with the value of each member of given array applied
// with func
Foxtrick.map = function(func, array) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.map(func);
};

// returns an array which contains the members in given array that satisfy
// func
Foxtrick.filter = function(func, array) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.filter(func);
};

// returns whether at least a member in given array satisfy func
Foxtrick.any = function(func, array) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.some(func);
};

// returns whether all members in given array satisfy func
Foxtrick.all = function(func, array) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.every(func);
};

// returns count of members in given array that satisfy func
Foxtrick.count = function(func, array) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.reduce(function(ct, e, i, a) {
		if (func(e, i, a))
			ct++;
		return ct;
	}, 0);
};

// TODO: review
// returns (n+1)'th value in array that satisfy func
// -- returns first if n === 0
// returns null if not found
Foxtrick.nth = function(n, func, array) {
	var count = 0;
	var ret = null;
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

// return the union of array a and array b
// does not modify the original array
Foxtrick.union = function(a, b) {
	if (!Array.isArray(a))
		a = Foxtrick.toArray(a);
	if (!Array.isArray(b))
		b = Foxtrick.toArray(b);
	return a.concat(b);
};

// returns the intersection of array a and array b
Foxtrick.intersect = function(a, b) {
	var r = Foxtrick.filter(function(e, i, a) { return Foxtrick.has(b, e); }, a);
	return Foxtrick.unique(r);
};

// TODO: review
// returns the concat of array a and array b
// a is changed
Foxtrick.concat = function(a, b) {
	return b.reduce(function(conc, e) {
		conc.push(e);
		return conc;
	}, a);
};

// TODO: review
// returns the unique concat of array a and array b
// a is changed
Foxtrick.concat_unique = function(a, b) {
	return b.reduce(function(conc, e) {
		if (!Foxtrick.has(conc, e))
			conc.push(e);
		return conc;
	}, a);
};

// test if e is in array a, returns -1 if not
Foxtrick.indexOf = function(array, e) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.indexOf(e);
};

// returns whether e is a member of array
Foxtrick.has = function(array, e) {
	return Foxtrick.indexOf(array, e) !== -1;
};

// removes element e from array and returns the result array
// does not modify original
Foxtrick.remove = function(array, e) {
	return Foxtrick.filter(function(current, i, array) {
		if (current !== e)
			return true;
		return false;
	});
};

// returns an array with duplicate items reduced to one
Foxtrick.unique = function(array) {
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
