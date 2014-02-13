'use strict';
/*
 * array.js
 * Array handler functions
 * @author ryanli, convincedd
 */

if (!Foxtrick)
	var Foxtrick = {};

// loops over an array-like with a function
Foxtrick.forEach = function(func, array) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.forEach(func);
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

// return the union of array a and array b
// does not modify the original array
Foxtrick.union = function(a, b) {
	if (!Array.isArray(a))
		a = Foxtrick.toArray(a);
	if (!Array.isArray(b))
		b = Foxtrick.toArray(b);
	return a.concat(b);
};

// TODO: review
// returns the intersection of array a and array b
Foxtrick.intersect = function(a, b) {
	var r = [];
	for (var i = 0; i < a.length; ++i)
		if (Foxtrick.member(a[i], b))
			r.push(a[i]);
	r = Foxtrick.unique(r);
	return r;
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
		if (!Foxtrick.member(e, conc))
			conc.push(e);
		return conc;
	}, a);
};

// TODO: review
// test if e is in array a, returns -1 if not
Foxtrick.indexOf = function(array, e) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.indexOf(e);
};

// TODO: review
// returns whether e is a member of array
Foxtrick.member = function(e, array) {
	if (!Array.isArray(array))
		array = Foxtrick.toArray(array);
	return array.indexOf(e) !== -1;
};


// returns count of members in given array that satisfy func
Foxtrick.count = function(func, array) {
	array = Foxtrick.toArray(array);
	return array.reduce(function(ct, e, i, a) {
		if (func(e, i, a))
			ct++;
		return ct;
	}, 0);
};

// returns (n+1)'th value in array that satisfy func
// -- returns first if n == 0
// returns null if not found
Foxtrick.nth = function(n, func, array) {
	var count = 0;
	for (var i = 0; i < array.length; ++i)
		if (func(array[i], i, array))
			if (count++ == n)
				return array[i];
	return null;
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


// removes a element b from array a and returns a
Foxtrick.remove = function(a, b) {
	var r = [];
	for (var i = 0; i < a.length; ++i)
		if (a[i] !== b)
			r.push(a[i]);
	return r;
};

/**
 * Convert an array-like object to an array
 * Suitable for node lists, arrays, strings, and the arguments object
 * @param	{Array}	arrayLike
 * @return	{Array}
 */
Foxtrick.toArray = function(arrayLike) {
	return Array.prototype.slice.call(arrayLike);
};
