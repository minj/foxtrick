/**
 * storage.set() and storage.get() are a pair of functions that can store
 * permanent information.
 * The stored value must be a JSON-serializable object, or of native types.
 *
 * @author convincedd, LA-MJ
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

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

			/** @type {IDBStore} */
			const STORE = {
				put: function(key, value, success, failure) {
					let k = PREFIX + key;

					/** @type {Promise<string>} */
					let promise = Promise.resolve().then(() => {

						let val = JSON.stringify(value);

						// MV3: localStorage only in non-SW context
					if (typeof window !== 'undefined' && window.localStorage)
						window.localStorage.setItem(k, val);

						return k;

					}).then(success, failure);

					// return a 'raw' Promise for internal use if failure is null
					if (failure === null)
						return promise;

					// log any errors otherwise
					return promise.catch(CLEANUP).then(() => k);

				},

				get: function(key, success, failure) {

					let promise = Promise.resolve().then(() => {

						let k = PREFIX + key;
						let val = (typeof window !== 'undefined' && window.localStorage)
						? window.localStorage.getItem(k)
						: null;

						return JSON.parse(val);

					}).then(success, failure);

					// return a 'raw' Promise for internal use if failure is null
					if (failure === null)
						return promise;

					// log any errors otherwise
					return promise.catch(CLEANUP);

				},

				iterate: function(callback, options) {

					/**
					 * @param  {string} key
					 * @return {function(any):void}
					 */
					var makeIterAdapter = function(key) {
						return function iterAdapter(val) {
							/** @type {IDBStore.CursorAny} */
							let cursor = {
								key: key,
								source: STORE,
							};

							if (options.writeAccess) {
								let mutCursor = /** @type {IDBStore.Cursor} */ (cursor);
								mutCursor.update = function(newVal) {
									return Foxtrick.storage.set(key, newVal).catch(CLEANUP);
								};

								mutCursor.delete = function() {
									return Promise.resolve().then(() => {
										if (typeof window !== 'undefined' && window.localStorage)
										window.localStorage.removeItem(PREFIX + key);
									}).catch(CLEANUP);
								};
							}

							callback(val, cursor);
						};
					};

					options.onError = options.onError || CLEANUP;

					let range = options.keyRange || STORE.makeKeyRange({});
					let lower = range.lower;
					let upper = range.upper;

					/**
					 * @param  {string} key
					 * @return {boolean}
					 */
					var keyMatches = function(key) {
						let lowOK = range.lowerOpen ? key > lower : key >= lower;
						let upOK = range.upperOpen ? key < upper : key <= upper;
						return lowOK && upOK;
					};

					var promises = [];

					let localStorage = (typeof window !== 'undefined' && window.localStorage) || {};
				for (let key in localStorage) {
						key = key.slice(PREFIX.length);

						if (keyMatches(key)) {
							// get a 'raw' Promise by
							// overriding error callback with null
							let promise = this.get(key, makeIterAdapter(key), null);
							promises.push(promise);
						}
					}

					Promise.all(promises)
						.then(options.onEnd, options.onError)
						.catch(CLEANUP);
				},

				makeKeyRange: function(opts) {
					const MAX_CHAR_CODE = 0xffff;
					const MAX_CHAR = String.fromCharCode(MAX_CHAR_CODE);
					const MIN_CHAR = String.fromCharCode(0);

					/** @type {IDBStore.KeyRange} */
					var ret = {};

					if (opts.only) {
						ret.lower = opts.only;

						let len = ret.lower.length;
						if (len) {
							let last = ret.lower.charCodeAt(len - 1);
							ret.upper = ret.lower.slice(0, len - 1) + String.fromCharCode(last + 1);
						}
						else {
							ret.upper = MIN_CHAR;
						}

						ret.lowerOpen = false;
						ret.upperOpen = true;
					}
					else {
						let lower = ret.lower = opts.lower || '';
						let maxString = Foxtrick.repeat(MAX_CHAR, lower.length + 1);
						ret.upper = opts.upper || maxString;

						ret.lowerOpen = opts.excludeLower;
						ret.upperOpen = opts.excludeUpper;
					}

					return ret;
				},

			};

			return STORE;
		};

		/** @type {Promise<IDBStore>} */
		const STORE_PROMISE = new Promise(function(fulfill, reject) {

			if (indexedDB !== null) {

				/** @type {IDBStore} */
				// @ts-ignore
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
			else if (typeof window !== 'undefined' && window.localStorage) {

				Promise.resolve(getIDBShim()).then(fulfill);

			}
			else {
				reject(new Error('No storage implementation available'));
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
 * @param  {string}          key
 * @param  {*}               value
 * @return {Promise<string>}       {Promise.<key>}
 */
Foxtrick.storage.set = function(key, value) {

	if (Foxtrick.context == 'content') {
		return new Promise(function(fulfill, reject) {
			Foxtrick.SB.ext.sendRequest({
				req: 'storageSet',
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

	return Foxtrick.localStore.then(function(store) {

		return new Promise(function(fulfill, reject) {
			try {
				store.put(key, value, fulfill, reject);
			}
			catch (e) {
				if (e.name == 'InvalidStateError')
					return;

				throw e;
			}
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
 * @param  {string}      key
 * @return {Promise<*>}      {Promise.<?value>}
 */
Foxtrick.storage.get = function(key) {

	if (Foxtrick.context == 'content') {
		return new Promise(function(fulfill) {
			// background never rejects
			Foxtrick.SB.ext.sendRequest({ req: 'storageGet', key: key }, fulfill);
		});
	}

	return Foxtrick.localStore.then(function(/** @type {IDBStore} */ store) {

		return new Promise(function(resolve, reject) {
			try {
				store.get(key, function onStoreGet(value) {
					let val = value;

					// cast undefined to null
					if (val == null)
						val = null;

					resolve(val);

				}, reject);
			}
			catch (e) {
				if (e instanceof DOMException && e.name == 'InvalidStateError') {
					resolve(null);
					return;
				}
				reject(e);
			}
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
 * @return {Promise<void>}
 */
Foxtrick.storage.deleteBranch = function(branch) {

	if (Foxtrick.context == 'content') {
		return new Promise(function(fulfill, reject) {
			Foxtrick.SB.ext.sendRequest({
				req: 'storageDeleteBranch',
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

	return Foxtrick.localStore.then(function(store) {

		return new Promise(function(fulfill, reject) {
			let br = branch == null ? '' : branch.toString();

			/** @type {IDBStore.IterateOpts} */
			var options = {
				writeAccess: true,

				onEnd: function() {
					Foxtrick.log('localStore branch "' + br + '" deleted');

					fulfill();
				},

				onError: function(e) {
					Foxtrick.log('Error deleting localStore branch', br, e.message);

					reject(e);
				},
			};

			try {
				if (br !== '') {
					options.keyRange = store.makeKeyRange({
						lower: br + '.', // charCode 46
						upper: br + '/', // charCode 47
						excludeUpper: true,
					});
				}
			}
			catch (e) {
				Foxtrick.log('Error deleting localStore branch', br,
				             'in makeKeyRange', e.message);

				reject(e);
				return;
			}

			try {
				store.iterate(function onStoreIterate(_, /** @type {IDBStore.Cursor} */ cursor) {
					cursor.delete();
				}, options);
			}
			catch (e) {
				if (e.name == 'InvalidStateError')
					return;

				throw e;
			}
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
 * @param {any} value
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
 * @param {function(any):any} callback
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

/* eslint-disable max-len */
/**
 * @typedef IDBStore
 * @prop {(key:string, success:(val:any)=>any, failure:((err:any)=>void)|null)=>Promise<any>} get
 * @prop {(key:string, val:any, success:(key:string)=>any, failure:((err:any)=>void)|null)=>Promise<string>} put
 * @prop {(callback:IDBStore.IterateCallback, options:IDBStore.IterateOpts)=>void} iterate
 * @prop {(options:IDBStore.KeyRangeOpts)=>IDBStore.KeyRange} makeKeyRange
 */
/* eslint-enable max-len */
/**
 * @typedef IDBStore.KeyRangeOpts
 * @prop {string} [only]
 * @prop {string} [lower]
 * @prop {string} [upper]
 * @prop {boolean} [excludeLower]
 * @prop {boolean} [excludeUpper]
 */
/**
 * @typedef IDBStore.KeyRange
 * @prop {string} lower
 * @prop {string} upper
 * @prop {boolean} lowerOpen
 * @prop {boolean} upperOpen
 */
/**
 * @typedef IDBStore.IterateReadOnlyOpts
 * @prop {(values:any[])=>void} onEnd
 * @prop {(error:any)=>void} [onError]
 * @prop {IDBStore.KeyRange} [keyRange]
 */
/**
 * @typedef {IDBStore.IterateReadOnlyOpts & {writeAccess: true}} IDBStore.IterateOpts
 */
/**
 * @typedef IDBStore.CursorReadOnly
 * @prop {string} key
 * @prop {IDBStore} source
 */
/**
 * @typedef IDBStore.CursorMutable
 * @prop {()=>any} [delete]
 * @prop {(val:any)=>any} [update]
 */
/** @typedef {IDBStore.CursorReadOnly & IDBStore.CursorMutable} IDBStore.Cursor */
/** @typedef {IDBStore.CursorReadOnly | IDBStore.Cursor} IDBStore.CursorAny */
/** @typedef {(val:any, cursor:IDBStore.CursorAny)=>void} IDBStore.IterateCallback */
