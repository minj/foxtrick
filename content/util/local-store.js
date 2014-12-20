'use strict';
/*
 * localSet() and localGet() are a pair of functions that can store
 * permanent information.
 * The stored value must be a JSON-serializable object, or of native types.
 */

if (!Foxtrick)
	var Foxtrick = {};

// background
if (Foxtrick.chromeContext() == 'background') {
	if (Foxtrick.arch === 'Gecko') {
		(function() {
			var hasIDB = false;
			try {
				// bootstrap
				hasIDB = typeof indexedDB !== 'undefined';
			}
			catch (e) {}
			finally {
				if (!hasIDB) {
					if (typeof Cu.importGlobalProperties === 'function')
						// FF27+ preferences.html
						Cu.importGlobalProperties(['indexedDB']);
				}
			}
		})();
	}
	// queues that track access to localStore until it becomes available
	// should mainly apply to init stage
	Foxtrick._localStore = {
		ready: false,
		getQueue: [],
		setQueue: [],
	};
	try {
		if (indexedDB !== null) {
			Foxtrick.localStore = new Foxtrick.IDBStore({
				storeName: 'localStore',
				storePrefix: 'Foxtrick',
				keyPath: null,
				autoIncrement: true,
				indexes: [],
				onStoreReady: function() {
					var ls = Foxtrick._localStore;
					ls.ready = true;
					for (var i = 0; i < ls.setQueue.length; ++i) {
						Foxtrick.localSet(ls.setQueue[i][0], ls.setQueue[i][1]);
					}
					for (var i = 0; i < ls.getQueue.length; ++i) {
						Foxtrick.localGet(ls.getQueue[i][0], ls.getQueue[i][1]);
					}
					ls.setQueue = [];
					ls.getQueue = [];
				},
				onError: function(error) { throw error; }
			});
		}
		else if (window.localStorage) {
			Foxtrick.localStore = {
				put: function(key, value) {
					window.localStorage.setItem('localStore.' + key, JSON.stringify(value));
				},
				get: function(key, callback) {
					callback(JSON.parse(window.localStorage.getItem('localStore.' + key)));
				},
				iterate: function(cb, options) {
					// fake, only implements deletion
					var branch = options.keyRange.lower;
					for (var key in window.localStorage) {
						if (key.indexOf('localStore.' + branch) === 0)
							// key already contains localStore.
							window.localStorage.removeItem(key);
					}
				},
				makeKeyRange: function(opts) {
					// fake
					return opts;
				}
			};
			Foxtrick._localStore.ready = true;
		}
	}
	catch (e) {}
	Foxtrick.localSet = function(key, value) {
		if (Foxtrick._localStore.ready)
			Foxtrick.localStore.put(key, value);
		else {
			Foxtrick._localStore.setQueue.push([key, value]);
		}
	};
	Foxtrick.localGet = function(key, callback) {
		if (Foxtrick._localStore.ready) {
			Foxtrick.localStore.get(key, function(value) {
				if (typeof value === 'undefined')
					value = null;
				try {
					callback(value);
				}
				catch (e) {
					Foxtrick.log('Error in callback for localGet', key, value, e);
				}
			});
		}
		else
			Foxtrick._localStore.getQueue.push([key, callback]);
	};
	Foxtrick.localDeleteBranch = function(branch) {
		if (typeof branch === 'undefined' || branch === null)
			branch = '';

		branch = String(branch);

		var options = {
			onEnd: function() {
				Foxtrick.log('localStore branch "' + branch + '" deleted');
			},
			writeAccess: true,
			onError: function(e) {
				Foxtrick.log('Error deleting localStore branch ' + branch, e);
			},
		};
		if (branch !== '') {
			try {
				options.keyRange = Foxtrick.localStore.makeKeyRange({
					lower: branch + '.', // charCode 46
					upper: branch + '/', // charCode 47
					excludeUpper: true
				});
			}
			catch (e) {
				Foxtrick.log('Error deleting localStore branch ' + branch +
				             'in makeKeyRange', e);
			}
		}
		Foxtrick.localStore.iterate(function(item, cursor) {
			cursor.delete();
		}, options);
	};

}

// content
else if (Foxtrick.chromeContext() == 'content') {

	Foxtrick.localSet = function(key, value) {
		// inform background
		Foxtrick.SB.ext.sendRequest({
			req: 'localSet',
			key: key,
			value: value
		});
	};

	Foxtrick.localGet = function(key, callback) {
		// get from background
		Foxtrick.SB.ext.sendRequest({ req: 'localGet', key: key },
		  function(response) {
			try {
				callback(response.value);
			}
			catch (e) {
				Foxtrick.log('Error in callback for localGet', response, e);
			}
		});
	};

	Foxtrick.localDeleteBranch = function(branch) {
		// inform background
		Foxtrick.SB.ext.sendRequest({ req: 'localDeleteBranch', branch: branch });
	};
}
