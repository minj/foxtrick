'use strict';
/*
 * storage.set() and storage.get() are a pair of functions that can store
 * permanent information.
 * The stored value must be a JSON-serializable object, or of native types.
 *
 * @author convincedd, LA-MJ
 */

/* global indexedDB */

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore:line

Foxtrick.storage = {};

// background
if (Foxtrick.context == 'background') {

	// localStore is a Promise that
	// a) fulfills with a IDBStore value which is **NOT** a promise-aware utility
	// b) rejects if initialization failed

	Object.defineProperty(Foxtrick, 'localStore', (function defineLocalStore() {

		var getIDBShim = function() {

			const PREFIX = 'localStore.';
			const CLEANUP = Foxtrick.catch(PREFIX);

			const STORE = {
				put: function(key, value, success, failure) {

					var promise = new Promise(function(resolve) {

						key = PREFIX + key;
						var val = JSON.stringify(value);

						window.localStorage.setItem(key, val);

						resolve(key);

					}).then(success, failure);

					// return a 'raw' Promise for internal use if failure is null
					if (failure === null) {
						return promise;
					}

					// log any errors otherwise
					return promise.catch(CLEANUP);

				},

				get: function(key, success, failure) {

					var promise = new Promise(function(resolve) {

						key = PREFIX + key;
						var val = window.localStorage.getItem(key);

						resolve(JSON.parse(val));

					}).then(success, failure);

					// return a 'raw' Promise for internal use if failure is null
					if (failure === null) {
						return promise;
					}

					// log any errors otherwise
					return promise.catch(CLEANUP);

				},

				iterate: function(cb, options) {

					var makeIterAdapter = function(key) {
						return function iterAdapter(val) {
							var cursor = {
								key: key,
								source: STORE,
							};

							if (options.writeAccess) {
								cursor.update = function(newVal) {
									return Foxtrick.storage.set(key, newVal).catch(CLEANUP);
								};

								cursor.delete = function() {
									return new Promise(function(resolve) {
										window.localStorage.removeItem(PREFIX + key);
										resolve();
									}).catch(CLEANUP);
								};
							}

							cb(val, cursor);
						};
					};

					options.onError = options.onError || CLEANUP;

					var range = options.keyRange || STORE.makeKeyRange({});
					var lower = range.lower;
					var upper = range.upper;

					var keyMatches = function(key) {
						var lowOK = range.lowerOpen ? key > lower : key >= lower;
						var upOK = range.upperOpen ? key < upper : key <= upper;
						return lowOK && upOK;
					};

					var promises = [];

					for (var key in window.localStorage) {
						key = key.slice(PREFIX.length);

						if (keyMatches(key)) {
							// get a 'raw' Promise by
							// overriding error callback with null
							var promise = this.get(key, makeIterAdapter(key), null);
							promises.push(promise);
						}
					}

					Promise.all(promises)
						.then(options.onEnd, options.onError)
						.catch(CLEANUP);
				},

				makeKeyRange: function(opts) {
					const MAX_CHAR = String.fromCharCode(0xffff);
					const MIN_CHAR = String.fromCharCode(0);

					var ret = {};

					if (opts.only) {
						ret.lower = opts.only;

						var len = ret.lower.length;
						if (len) {
							var last = ret.lower.charCodeAt(len - 1);
							ret.upper = ret.lower.slice(0, len - 1) + String.fromCharCode(last + 1);
						}
						else
							ret.upper = MIN_CHAR;

						ret.lowerOpen = false;
						ret.upperOpen = true;
					}
					else {
						var lower = ret.lower = opts.lower || '';
						var maxString = Foxtrick.repeat(MAX_CHAR, lower.length + 1);
						ret.upper = opts.upper || maxString;

						ret.lowerOpen = opts.excludeLower;
						ret.upperOpen = opts.excludeUpper;
					}

					return ret;
				},

			};

			return STORE;
		};

		const STORE_PROMISE = new Promise(function(fulfill, reject) {

			if (indexedDB !== null) {

				const STORE = new Foxtrick.IDBStore({
					storeName: 'localStore',
					storePrefix: 'Foxtrick',
					keyPath: null,
					autoIncrement: true,
					indexes: [],
					onStoreReady: function() {
						fulfill(STORE);
					},
					onError: reject,
				});

			}
			else if (window.localStorage) {

				Promise.resolve(getIDBShim()).then(fulfill);

			}
		});

		// return localStore property descriptor
		return {
			get: function() {

				// catch every time localStore is used
				// will make it easier to spot in the logs
				return STORE_PROMISE.catch(function(e) {

					// just log a simple message to disable stack: most likely Private mode
					var message = e.message || e.target.error.message;
					Foxtrick.log('WARNING: localStore has not been initialized:', message);

					// re-throw to disable chain
					throw e;
				});

			},
		};

	})());
}

/**
 * Get a promise when storage value is set.
 *
 * key should be a string.
 * value may be any stringify-able object.
 *
 * @param  {string}  key
 * @param  {object}  value
 * @return {Promise}       {Promise.<key>}
 */
Foxtrick.storage.set = function(key, value) {

	if (Foxtrick.context == 'content') {
		return new Promise(function(fulfill, reject) {
			Foxtrick.SB.ext.sendRequest({
				req: 'storageSet',
				key: key,
				value: value,
			}, function onSendResponse(response) {

				if (response instanceof Error)
					reject(response);
				else
					fulfill(response);

			});
		});
	}

	return Foxtrick.localStore.then(function(store) {

		return new Promise(function(fulfill, reject) {
			store.put(key, value, fulfill, reject);
		}).catch(function(e) {
			Foxtrick.log('Error in storage.set', key, e);
			throw e;
		});

	}, function() {
		// swallow Foxtrick.localStore failure here
		// already logged
		throw Foxtrick.SWALLOWED_ERROR;
	});

};

/**
 * Get a promise for a storage value.
 *
 * Promise will never reject, returns null instead.
 *
 * key should be a string.
 * value may be any stringify-able object or null if N/A.
 *
 * @param  {string}  key
 * @return {Promise}     {Promise.<?value>}
 */
Foxtrick.storage.get = function(key) {

	if (Foxtrick.context == 'content') {
		return new Promise(function(fulfill) {
			// background never rejects
			Foxtrick.SB.ext.sendRequest({ req: 'storageGet', key: key }, fulfill);
		});
	}

	return Foxtrick.localStore.then(function(store) {

		return new Promise(function(resolve, reject) {
			store.get(key, function onStoreGet(value) {

				// type-cast undefined to null
				if (typeof value === 'undefined')
					value = null;

				resolve(value);

			}, reject);
		});

	}, function() {
		// swallow Foxtrick.localStore failure here
		// already logged
		return null;
	}).catch(function(e) {
		try {
			Foxtrick.log('Error in storage.get', key, e);
		}
		catch (ee) {}

		return null;
	});

};

/**
 * Get a promise for when a certain storage branch is deleted
 *
 * @param  {string}  branch
 * @return {Promise}
 */
Foxtrick.storage.deleteBranch = function(branch) {

	if (Foxtrick.context == 'content') {
		return new Promise(function(fulfill, reject) {
			Foxtrick.SB.ext.sendRequest({
				req: 'storageDeleteBranch',
				branch: branch,
			}, function onSendResponse(response) {

				if (response instanceof Error)
					reject(response);
				else
					fulfill(response);

			});
		});
	}

	return Foxtrick.localStore.then(function(store) {

		return new Promise(function(fulfill, reject) {
			if (branch == null)
				branch = '';

			branch = branch.toString();

			var options = {
				writeAccess: true,

				onEnd: function() {
					Foxtrick.log('localStore branch "' + branch + '" deleted');

					fulfill();
				},

				onError: function(e) {
					Foxtrick.log('Error deleting localStore branch', branch, e.message);

					reject(e);
				},
			};

			try {
				if (branch !== '') {
					options.keyRange = store.makeKeyRange({
						lower: branch + '.', // charCode 46
						upper: branch + '/', // charCode 47
						excludeUpper: true,
					});
				}
			}
			catch (e) {
				Foxtrick.log('Error deleting localStore branch', branch,
				             'in makeKeyRange', e.message);

				reject(e);
				return;
			}

			store.iterate(function onStoreIterate(item, cursor) { // jshint ignore:line
				cursor.delete();
			}, options);

		}).catch(function(e) {
			Foxtrick.log('Error in localDeleteBranch', branch, e);
			throw e;
		});

	});

};

// /////////////////////////
// TODO: remove deprecated
// ////////////////////////

/**
 * Save a value in local storage
 *
 * @deprecated use storage.set() instead
 *
 * @param {string} key
 * @param {object} value
 */
Foxtrick.localSet = function(key, value) {
	Foxtrick.storage.set(key, value).catch(Foxtrick.catch('localSet'));
};

/**
 * Get a value from local storage
 *
 * @deprecated use storage.get() instead
 *
 * @param {string}   key
 * @param {function} callback
 */
Foxtrick.localGet = function(key, callback) {
	Foxtrick.storage.get(key).then(callback).catch(Foxtrick.catch('localGet'));
};

/**
 * Remove a branch from local storage
 *
 * @deprecated use storage.deleteBranch() instead
 *
 * @param {string} branch
 */
Foxtrick.localDeleteBranch = function(branch) {
	Foxtrick.storage.deleteBranch(branch).catch(Foxtrick.catch('localDeleteBranch'));
};
