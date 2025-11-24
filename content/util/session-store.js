/**
 * session-store.js
 *
 * session.set() and session.get() are a pair of functions that can store some
 * useful information that has its life spanning the browser session.
 *
 * The stored value must be a JSON-serializable object, or of native types.
 *
 * @author ryanli, convincedd, LA-MJ
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

Foxtrick.session = {};

if (Foxtrick.context === 'background')
	Foxtrick.session.__STORE = {};

/**
 * Get a promise when session value is set.
 *
 * key should be a string.
 * value may be any stringify-able object.
 *
 * @param  {string}          key
 * @param  {object}          value
 * @return {Promise<string>}       {Promise.<key>}
 */
Foxtrick.session.set = function(key, value) {

	if (Foxtrick.context == 'content') {
		return new Promise(function(fulfill, reject) {
			Foxtrick.SB.ext.sendRequest({
				req: 'sessionSet',
				key: key,
				value: value,
			}, function onSendResponse(response) {

				var err = Foxtrick.jsonError(response);
				if (err instanceof Error)
					reject(err);
				else
					fulfill(response);

			});
		});
	}

	return new Promise(function(resolve) {
		Foxtrick.session.__STORE[key] = value;
		resolve(key);
	});

};

/**
 * Get a promise for a session value.
 *
 * Promise will never reject, returns null instead.
 *
 * key should be a string.
 * value may be any stringify-able object or null if N/A.
 *
 * @param  {string}     key
 * @return {Promise<?>}     {Promise.<?value>}
 */
Foxtrick.session.get = function(key) {
	if (Foxtrick.context == 'content') {
		return new Promise(function(fulfill) {
			// background never rejects
			Foxtrick.SB.ext.sendRequest({ req: 'sessionGet', key: key }, fulfill);
		});
	}

	return new Promise(function(resolve) {
		try {
			var value = Foxtrick.session.__STORE[key];

			// cast undefined to null
			if (value == null)
				value = null;

			resolve(value);
		}
		catch (e) {
			try {
				Foxtrick.log('Error in session.get', key, e);
			}
			catch (ee) {}

			resolve(null);
		}
	});

};

/**
 * Get a promise for when a certain session branch is deleted
 *
 * @param  {string}  branch
 * @return {Promise}
 */
Foxtrick.session.deleteBranch = function(branch) {

	if (Foxtrick.context == 'content') {
		return new Promise(function(fulfill, reject) {
			Foxtrick.SB.ext.sendRequest({
				req: 'sessionDeleteBranch',
				branch: branch,
			}, function onSendResponse(response) {

				var err = Foxtrick.jsonError(response);
				if (err instanceof Error)
					reject(err);
				else
					fulfill(response);

			});
		});
	}

	return new Promise(function(resolve) {
		let br;
		if (branch == null)
			br = '';

		br = branch.toString();

		for (var key in Foxtrick.session.__STORE) {
			if (key.indexOf(br) === 0)
				Foxtrick.session.__STORE[key] = null;
		}

		resolve();
	});

};


// /////////////////////////
// TODO: remove deprecated
// ////////////////////////

/**
 * Save a value in temporary storage
 *
 * @deprecated use session.set() instead
 *
 * @param {string} key
 * @param {object} value
 */
Foxtrick.sessionSet = function(key, value) {
	Foxtrick.session.set(key, value).catch(Foxtrick.catch('sessionSet'));
};

/**
 * Get a value from temporary storage
 *
 * @deprecated use session.get() instead
 *
 * @param {string}   key
 * @param {function(any):any} callback
 */
Foxtrick.sessionGet = function(key, callback) {
	Foxtrick.session.get(key).then(callback).catch(Foxtrick.catch('sessionGet'));
};

/**
 * Remove a branch from temporary storage
 *
 * @deprecated use session.deleteBranch() instead
 *
 * @param {string} branch
 */
Foxtrick.sessionDeleteBranch = function(branch) {
	Foxtrick.session.deleteBranch(branch).catch(Foxtrick.catch('sessionDeleteBranch'));
};
