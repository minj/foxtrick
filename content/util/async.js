'use strict';
/*
* async.js
*
* Utilities for asynchronous operations
*
* @author LA-MJ
*/

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore:line


// callbacks -> Promises
// return new Promise(function(resolve, reject) {
// 	fs.readFile('myfile.txt', function(err, file) {
// 		if (err) {
// 			return reject(err);
// 		}
// 		resolve(file);
// 	});
// });

// 	// The fetch() API returns a Promise. This function
// 	// exposes a similar API, except the fulfillment
// 	// value of this function's Promise has had more
// 	// work done on it.
// 	return fetch('current-data.json').then((response) => {
// 		if (response.headers.get('content-type') != 'application/json') {
// 			throw new TypeError('JSON expected');
// 		}
// 		return response.json();
// 	});

// ///////////////
// TODO: uncomment for generator support
// ///////////////
// Foxtrick.runAsync = function(gen) {
// 	var args = [].slice.call(arguments, 1);

// 	var it = gen.apply(this, args);

// 	return Promise.resolve().then(function getNext(value) {
// 		// push the resolved value back into the generator
// 		// and take the next Promise/value
// 		var next = it.next(value);

// 		// expand promise chain
// 		return (function handleYielded(next) {
// 			if (next.done) {
// 				// end chain
// 				return next.value;
// 			}
// 			else {
// 				// continue chain

// 				// promisify and wait for resolution
// 				return Promise.resolve(next.value)
// 					.then(getNext, function handleError(e) {

// 						// throw errors back into the generator
// 						// promisify and wait for their resolution
// 						return Promise.resolve(it.throw(e))
// 							.then(handleYielded, handleError);

// 					});
// 			}

// 		})(next);

// 	});
// };


/**
 * Error message for Foxtrick.timeout() rejects
 * @type {String}
 */
Foxtrick.TIMEOUT_ERROR = 'Foxtrick timeout';

/**
 * Error message to suppress additional logging
 * @type {String}
 */
Foxtrick.SWALLOWED_ERROR = 'Foxtrick ignore this error';

/**
 * Setup a time limit (ms) for Promise fulfillment.
 *
 * Returns a Promise that resolves with the value
 * of the Promise returned by the promisory
 * or rejects with Error(Foxtrick.TIMEOUT_ERROR).
 *
 * @param  {function} promisory {function(): Promise}
 * @param  {number}   limit     {Integer}
 * @return {Promise}
 */
Foxtrick.timeout = function(promisory, limit) {

	return Promise.race([
		Promise.resolve(promisory()),
		new Promise(function timeoutReject(resolve, reject) { // jshint ignore:line
			setTimeout(function() {
				reject(new Error(Foxtrick.TIMEOUT_ERROR));
			}, limit);
		}),
	]);

};

/**
 * Return a Promise that fulfills after a purposeful time delay (ms)
 *
 * @param  {number}  time {Integer}
 * @return {Promise}
 */
Foxtrick.delay = function(time) {

	return new Promise(function delayFinish(fulfill) {
		setTimeout(function() {
			fulfill();
		}, time);
	});

};

/**
 * Create a handler to catch errors at the end of a promise chain.
 *
 * Takes a module object or some other tag for logging.
 *
 * @param  {object}   module {object}
 * @return {function}        {function(Error)}
 */
Foxtrick.catch = function(module) {
	return function(e) {
		if (e === Foxtrick.SWALLOWED_ERROR ||
		    e.message && e.message === Foxtrick.SWALLOWED_ERROR)
			return;

		var what = module && module.MODULE_NAME || module;
		Foxtrick.log('Uncaught error in callback for', what, e);
	};
};

/**
 * Run an additional step regardless of promise resolution status.
 *
 * Returns a Promise that resolves with the value of the original promise
 * or rejects in case the additional step rejects/throws.
 *
 * then is {function(result|reason): ?Promise}.
 *
 * @param  {Promise}  promise
 * @param  {function} then
 * @return {Promise}
 */
Foxtrick.finally = function(promise, then) {

	return Promise.resolve(promise).then(function(result) {
		var next = then(result);

		return Promise.resolve(next).then(function() {
			return result;
		});

	}, function(reason) {
		var next = then(reason);

		return Promise.resolve(next).then(function() {
			throw reason;
		});

	});
};

/**
 * Set up a list of promise factories to run in a sequence.
 *
 * Returns a Promise that either fulfills when the last promise fulfills
 * or rejects and stops on first failure.
 *
 * @param  {array}   promisoryList {Array.<function(): Promise>}
 * @return {Promise}
 */
Foxtrick.promiseQueue = function(promisoryList) {
	const ERROR_UNCALLABLE_PROMISORY =
		'Promisory must be a function that returns a Promise or a value. {} given.';

	var chain = Promise.resolve();

	for (var promisory of promisoryList) {
		if (typeof promisory !== 'function')
			throw new TypeError(Foxtrick.format(ERROR_UNCALLABLE_PROMISORY, [typeof promisory]));

		chain = chain.then(promisory);
	}

	return chain;
};
