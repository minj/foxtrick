/**
* async.js
*
* Utilities for asynchronous operations
*
* @author LA-MJ
*/

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
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
 * @type {string}
 */
Foxtrick.TIMEOUT_ERROR = 'Foxtrick timeout';

/**
 * @typedef {'Foxtrick fetch failure'} FETCH_ERROR
 * Error message for Foxtrick.fetch() rejects
 * @type {FETCH_ERROR}
 */
Foxtrick.FETCH_ERROR = 'Foxtrick fetch failure';

/**
 * Error message to suppress additional logging
 * @type {string}
 */
Foxtrick.SWALLOWED_ERROR = 'Foxtrick ignore this error';


// eslint-disable-next-line valid-jsdoc
/**
 * Test whether object obj is a thenable
 *
 * @template T
 * @param  {T} obj
 * @return {obj is Ensure<T, 'then'>}
 */
Foxtrick.isThenable = obj => Foxtrick.hasProp(obj, 'then');

/**
 * Setup a time limit (ms) for Promise fulfillment.
 *
 * Returns a Promise that resolves with the value
 * of the Promise returned by the promisory
 * or rejects with Error(Foxtrick.TIMEOUT_ERROR).
 *
 * @template T
 * @param  {Promise<T>|function():T|Promise<T>} promisory
 * @param  {number}                             limit     miliseconds
 * @return {Promise<T>}
 */
Foxtrick.timeout = (promisory, limit) => Promise.race([
	Foxtrick.isThenable(promisory) ? promisory : Promise.resolve(promisory()),
	new Promise(function timeoutReject(_, reject) {
		setTimeout(reject, limit, new Error(Foxtrick.TIMEOUT_ERROR));
	}),
]);

/**
 * Return a Promise that fulfills after a purposeful time delay (ms)
 *
 * @template T
 * @param  {number}     time miliseconds
 * @param  {T}          val
 * @return {Promise<T>}
 */
Foxtrick.delay = (time, val) => new Promise(function delayFinish(fulfill) {
	setTimeout(fulfill, time, val);
});

// eslint-disable-next-line valid-jsdoc
/**
 * Create a handler to catch errors at the end of a promise chain.
 *
 * Takes a module object or some other tag for logging.
 *
 * @param  {{ MODULE_NAME: string } | string} module {object}
 * @return {function(any):void}
 */
// eslint-disable-next-line complexity
Foxtrick.catch = module => function(e) {
	// @ts-ignore
	if (e === Foxtrick.SWALLOWED_ERROR ||

		// @ts-ignore
		e && e.message && e.message === Foxtrick.SWALLOWED_ERROR)
		return e;

	if (e === Foxtrick.FETCH_ERROR || e && e.message && e.message === Foxtrick.FETCH_ERROR) {
		Foxtrick.log('Failed to load');
		return e;
	}

	if (e && e._cls == Foxtrick.FETCH_ERROR) {
		let f = /** @type {FetchError} */ (e);
		Foxtrick.log('Failed to load:', f.url, f.status);
		return e;
	}

	// @ts-ignore
	let what = module && module.MODULE_NAME || module;
	let err = e instanceof Error ? e : new Error(String(e));
	Foxtrick.log('Uncaught error in callback for', what, err);
	return e;
};

// eslint-disable-next-line valid-jsdoc
/**
 * Run an additional step regardless of promise resolution status.
 *
 * Returns a Promise that resolves with the value of the original promise
 * or rejects in case the additional step rejects/throws.
 *
 * then is {function(result|reason): ?Promise}.
 *
 * @template T
 * @param  {Promise<T>}             promise
 * @param  {function(T|Error):void} then
 * @return {Promise<T>}
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
 * @template T
 * @param  {(function(T):T|Promise<T>)[]} promisoryList
 * @return {Promise<T>}
 */
Foxtrick.promiseChain = (promisoryList) => {
	const ERROR_UNCALLABLE_PROMISORY =
		'Promisory must be a function that returns a Promise or a value. {} given.';

	/** @type {unknown} */
	var p = Promise.resolve();
	var chain = /** @type {Promise<T>} */ (p);

	for (let promisory of promisoryList) {
		// if (Foxtrick.isThenable(promisory))
		// 	promisory = () => promisory;
		if (typeof promisory !== 'function')
			throw new TypeError(Foxtrick.format(ERROR_UNCALLABLE_PROMISORY, [typeof promisory]));

		chain = chain.then(promisory);
	}

	return chain;
};

Foxtrick.deferred = () => {
	/** @type {(value?: any | PromiseLike<any>) => void} */
	let resolve;

	/** @type {(reason?: any) => void} */
	let reject;
	let promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { resolve, reject, promise };
};
