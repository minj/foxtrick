'use strict';
/*
 * localSet() and localGet() are a pair of functions that can store
 * permanent information.
 * The stored value must be a JSON-serializable object, or of native types.
 * Due to async nature of indexedDB these functions might fail during init stage
 */

// background
if (Foxtrick.chromeContext() == 'background') {
	if (Foxtrick.arch === 'Gecko') {
		(function () {
			var hasIDB = false;
			try {
				// works in bootstrap.js and FF27 preferences
				hasIDB = (typeof indexedDB !== 'undefined' || typeof mozIndexedDB !== 'undefined');
			}
			catch (e) {
				// FF25 preferences.html throws 'UnknownError'
			}
			finally {
				if (!hasIDB) {
					var idbManager = Cc['@mozilla.org/dom/indexeddb/manager;1']
						.getService(Ci.nsIIndexedDatabaseManager);
					if (typeof idbManager.initWindowless === 'function') {
						// FF26 and earlier
						Foxtrick.IDBProxy = {};
						idbManager.initWindowless(Foxtrick.IDBProxy);
					}
					else {
						// in the future in FF28?
						Cu.importGlobalProperties(['indexedDB']);
					}
				}
			}
		})();
	}
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
		Foxtrick.localStore.get(key, function(value) {
			if (typeof value === 'undefined')
				value = null;
			callback(value);
		});
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
		(function(localStorage){

			for (var key in localStorage) {
				if (key.indexOf('localStore.') === 0)
					localStorage.removeItem(key); // <- key already contains localStore.
			}
		})(localStorage);
	}
	else if (Foxtrick.arch === 'Gecko') {

		(function(){
			var url = 'http://localStore.foxtrick.org';
			var ios = Components.classes['@mozilla.org/network/io-service;1']
					  .getService(Components.interfaces.nsIIOService);
			var ssm = Components.classes['@mozilla.org/scriptsecuritymanager;1']
					  .getService(Components.interfaces.nsIScriptSecurityManager);
			var smc = Components.classes['@mozilla.org/dom/storagemanager;1'] ||
				Components.classes['@mozilla.org/dom/localStorage-manager;1'];
			var dsm = smc.getService(Components.interfaces.nsIDOMStorageManager);

			var uri = ios.newURI(url, '', null);
			var principal = ssm.getCodebasePrincipal ? ssm.getCodebasePrincipal(uri) :
				ssm.getNoAppCodebasePrincipal(uri);
			var localStorage = dsm.getLocalStorageForPrincipal(principal, '');
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
