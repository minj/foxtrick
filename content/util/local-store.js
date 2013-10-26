'use strict';
/*
 * localSet() and localGet() are a pair of functions that can store
 * permanent information.
 * The stored value must be a JSON-serializable object, or of native types.
 */

// background
if (Foxtrick.chromeContext() == 'background') {
	Foxtrick.localStore = new IDBStore({
		storeName: 'localStore',
		storePrefix: 'Foxtrick',
		keyPath: null,
		autoIncrement: true,
		indexes: [],
		onStoreReady: function(){},
		onError: function(error){ throw error; }
	});
	Foxtrick.localSet = function(key, value) {
		Foxtrick.localStore.put(key, value);
	};
	Foxtrick.localGet = function(key, callback) {
		Foxtrick.localStore.get(key, callback);
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
}

// content
else if (Foxtrick.chromeContext() == 'content') {

	Foxtrick.localSet = function(key, value) {
		// inform background
		sandboxed.extension.sendRequest({
			req: 'localSet',
			key: key,
			value: value
		});
	};

	Foxtrick.localGet = function(key, callback) {
		// get from background
		sandboxed.extension.sendRequest({ req: 'localGet', key: key },
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
		sandboxed.extension.sendRequest({
			req: 'localDeleteBranch',
			branch: branch
		});
	};
}
