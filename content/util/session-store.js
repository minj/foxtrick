'use strict';
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

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore:line

Foxtrick.session = {};

if (Foxtrick.context === 'background') {
	Foxtrick.session.__STORE = {};
}

/**
 * Get a promise when session value is set.
 *
 * key should be a string.
 * value may be any stringify-able object.
 *
 * @param  {string}  key
 * @param  {object}  value
 * @return {Promise}       {Promise.<key>}
 */
Foxtrick.session.set = function(key, value) {

	if (Foxtrick.context == 'content') {
		return new Promise(function(fulfill, reject) {
			Foxtrick.SB.ext.sendRequest({
				req: 'sessionSet',
				key: key,
				value: value,
			}, function onSendResponse(response) {

				var err = Foxtrick.JSONError(response);
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
 * @param  {string}  key
 * @return {Promise}     {Promise.<?value>}
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

			// type-cast undefined to null
			if (typeof value === 'undefined')
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

				var err = Foxtrick.JSONError(response);
				if (err instanceof Error)
					reject(err);
				else
					fulfill(response);

			});
		});
	}

	return new Promise(function(resolve) {
		if (branch == null)
			branch = '';

		branch = branch.toString();

		for (var key in Foxtrick.session.__STORE) {
			if (key.indexOf(branch) === 0)
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
 * @param {function} callback
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
