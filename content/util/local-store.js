'use strict';
/*
 * localSet() and localGet() are a pair of functions that can store
 * permanent information.
 * The stored value must be a JSON-serializable object, or of native types.
 */

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
	catch (e) {}
	Foxtrick.localSet = function(key, value) {
		if (Foxtrick._localStore.ready)
			Foxtrick.localStore.put(key, value);
		else
			Foxtrick._localStore.setQueue.push([key, value]);
	};
	Foxtrick.localGet = function(key, callback) {
		if (Foxtrick._localStore.ready) {
			Foxtrick.localStore.get(key, function(value) {
				if (typeof value === 'undefined')
					value = null;
				callback(value);
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
			writeAccess: true
		};
		if (branch !== '') {
			options.keyRange = Foxtrick.localStore.makeKeyRange({
				lower: branch + '.', // charCode 46
				upper: branch + '/', // charCode 47
				excludeUpper: true
			});
		}
		Foxtrick.localStore.iterate(function(item, cursor) {
			cursor.delete();
		}, options);
	};

// purge localStorage
	if (Foxtrick.arch === 'Sandboxed') {
		(function(localStorage) {

			for (var key in localStorage) {
				if (key.indexOf('localStore.') === 0)
					localStorage.removeItem(key); // <- key already contains localStore.
			}
		})(localStorage);
	}
	else if (Foxtrick.arch === 'Gecko') {

		(function() {
			var url = 'http://localStore.foxtrick.org';

			var ssm = Services.scriptSecurityManager;

			var uri = Services.io.newURI(url, '', null);
			var principal = ssm.getCodebasePrincipal ? ssm.getCodebasePrincipal(uri) :
				ssm.getNoAppCodebasePrincipal(uri);
			var localStorage =
				Services.domStorageManager.getLocalStorageForPrincipal(principal, '');
			var key;
			for (key in localStorage) {
				if (key.indexOf('localStore.') === 0)
					localStorage.removeItem(key); // <- key already contains localStore.
			}
		})();

	}

}

// content
else if (Foxtrick.chromeContext() == 'content') {

	Foxtrick.localSet = function(key, value) {
		// inform background
		Foxtrick.SB.extension.sendRequest({
			req: 'localSet',
			key: key,
			value: value
		});
	};

	Foxtrick.localGet = function(key, callback) {
		// get from background
		Foxtrick.SB.extension.sendRequest({ req: 'localGet', key: key },
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
		Foxtrick.SB.extension.sendRequest({
			req: 'localDeleteBranch',
			branch: branch
		});
	};
}
