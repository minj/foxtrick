/**
* async.js
*
* Utilities for asynchronous operations
*
* @author LA-MJ
*/

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	var Foxtrick = {};
/* eslint-enable */

// callbacks -> Promises
// return new Promise(function(resolve, reject) {
// 	fs.readFile('myfile.txt', function(err, file) {
// 		if (err) {
// 			return reject(err);
// 		}
// 		resolve(file);
// 	});
// });

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
 * Test whether object obj is a thenable
 *
 * @param  {object}  obj
 * @return {Boolean}
 */
Foxtrick.isThenable = obj => Foxtrick.hasProp(obj, 'then');

/**
 * Setup a time limit (ms) for Promise fulfillment.
 *
 * Returns a Promise that resolves with the value
 * of the Promise returned by the promisory
 * or rejects with Error(Foxtrick.TIMEOUT_ERROR).
 *
 * @param  {function} promisory {Promise|function(): Promise}
 * @param  {number}   limit     {Integer}
 * @return {Promise}
 */
Foxtrick.timeout = (promisory, limit) => Promise.race([
	Foxtrick.isThenable(promisory) ? promisory : Promise.resolve(promisory()),
	new Promise(function timeoutReject(resolve, reject) {
		setTimeout(reject, limit, new Error(Foxtrick.TIMEOUT_ERROR));
	}),
]);

/**
 * Return a Promise that fulfills after a purposeful time delay (ms)
 *
 * @param  {number}  time miliseconds
 * @param  {object}   val
 * @return {Promise}
 */
Foxtrick.delay = (time, val) => new Promise(function delayFinish(fulfill) {
	setTimeout(fulfill, time, val);
});

/**
 * Create a handler to catch errors at the end of a promise chain.
 *
 * Takes a module object or some other tag for logging.
 *
 * @param  {object}   module {object}
 * @return {function(any):any}        {function(Error)}
 */
Foxtrick.catch = module => (e) => {
	if (e === Foxtrick.SWALLOWED_ERROR ||
		e && e.message && e.message === Foxtrick.SWALLOWED_ERROR)
		return;

	let what = module && module.MODULE_NAME || module;
	Foxtrick.log('Uncaught error in callback for', what, e);
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
 * @param  {function(any):any} then
 * @return {Promise}
 */
Foxtrick.finally = async (promise, then) => {
	let result, reason;
	try {
		result = await promise;
	}
	catch (e) {
		reason = e;
	}

	await Promise.resolve(result || reason).then(then)
		.catch(Foxtrick.catch('finally'));

	if (reason)
		throw reason;

	return result;
};

/**
 * Set up a list of promise factories to run in a sequence.
 *
 * Returns a Promise that either fulfills when the last promise fulfills
 * or rejects and stops on first failure.
 *
 * @param  {Array}   promisoryList {Array.<function(): Promise>}
 * @return {Promise}
 */
Foxtrick.promiseChain = (promisoryList) => {
	const ERROR_UNCALLABLE_PROMISORY =
		'Promisory must be a function that returns a Promise or a value. {} given.';

	var chain = Promise.resolve();

	for (let promisory of promisoryList) {
		// if (Foxtrick.isThenable(promisory))
		// 	promisory = () => promisory;
		if (typeof promisory !== 'function')
			throw new TypeError(Foxtrick.format(ERROR_UNCALLABLE_PROMISORY, [typeof promisory]));

		chain = chain.then(promisory);
	}

	return chain;
};
