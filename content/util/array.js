'use strict';
/*
 * array.js
 * Array handler functions
 * @author ryanli, convincedd
 */

if (!Foxtrick)
	var Foxtrick = {};

// returns an array with the value of each member of given array applied
// with func
Foxtrick.map = function(func, array) {
	var ret = [];
	for (var i = 0; i < array.length; ++i)
		ret.push(func(array[i]));
	return ret;
};

// returns an array which contains the members in given array that satisfy
// func
Foxtrick.filter = function(func, array) {
	var ret = [];
	for (var i = 0; i < array.length; ++i) {
		if (func(array[i]))
			ret.push(array[i]);
	}
	return ret;
};

// returns whether at least a member in given array satisfy func
Foxtrick.any = function(func, array) {
	for (var i = 0; i < array.length; ++i)
		if (func(array[i]))
			return true;
	return false;
};

// returns whether all members in given array satisfy func
Foxtrick.all = function(func, array) {
	for (var i = 0; i < array.length; ++i)
		if (!func(array[i]))
			return false;
	return true;
};

// returns count of members in given array that satisfy func
Foxtrick.count = function(func, array) {
	var ret = 0;
	for (var i = 0; i < array.length; ++i) {
		if (func(array[i]))
			++ret;
	}
	return ret;
};

// returns (n+1)'th value in array that satisfy func
// -- returns first if n == 0
// returns null if not found
Foxtrick.nth = function(n, func, array) {
	var count = 0;
	for (var i = 0; i < array.length; ++i)
		if (func(array[i]))
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

// returns whether n is a member of array
Foxtrick.member = function(n, array) {
	return Foxtrick.any(function(t) { return n === t; }, array);
};

// returns the intersection of array a and array b
Foxtrick.intersect = function(a, b) {
	var r = [];
	for (var i = 0; i < a.length; ++i)
		if (Foxtrick.member(a[i], b))
			r.push(a[i]);
	r = Foxtrick.unique(r);
	return r;
};

// returns the concat of array a and array b
Foxtrick.concat = function(a, b) {
	for (var i = 0; i < b.length; ++i)
			a.push(b[i]);
	return a;
};

// returns the unique concat of array a and array b
Foxtrick.concat_unique = function(a, b) {
	for (var i = 0; i < b.length; ++i)
		if (!Foxtrick.member(b[i], a))
			a.push(b[i]);
	return a;
};

// removes a element b from array a and returns a
Foxtrick.remove = function(a, b) {
	var r = [];
	for (var i = 0; i < a.length; ++i)
		if (a[i] !== b)
			r.push(a[i]);
	return r;
};
