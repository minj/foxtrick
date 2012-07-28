"use strict";
/*
 * localSet() and localGet() are a pair of functions that can store 
 * permanent information.
 * The stored value must be a JSON-serializable object, or of native types.
 */


Foxtrick._localSet = function(key, value) {
	Foxtrick.localStore.setItem('localStore.'+key, JSON.stringify(value));
};

// key = string or map of keys and default values
// returns value reps. map of keys and values
// key = string or map of keys and default values
// returns value reps. map of keys and values
Foxtrick._localGet = function(keymap) {
	if (typeof(keymap) === "string")
		return JSON.parse(Foxtrick.localStore.getItem('localStore.'+keymap));
	else if (typeof(keymap) === "object") {
		var answermap = {};
		for (var key in keymap) {
			if (Foxtrick.localStore.getItem('localStore.'+key)!==null)
				answermap[key] = Foxtrick.localStore.getItem('localStore.'+key);
			else
				answermap[key] = keymap[i];
		}
		return JSON.parse(answermap);
	}
};

Foxtrick._localDeleteBranch = function(branch) {
	if (!branch) branch = '';
	if (branch != '') branch += '.';
	for (var key in Foxtrick.localStore) {
		if (key.indexOf('localStore.'+branch)===0)
			Foxtrick.localStore.removeItem(key); // <- key already contains localStore.
	};
};

// for Firefox
if (Foxtrick.arch == "Gecko") {
	var url = "http://localStore.foxtrick.org";
	var ios = Components.classes["@mozilla.org/network/io-service;1"]
			  .getService(Components.interfaces.nsIIOService);
	var ssm = Components.classes["@mozilla.org/scriptsecuritymanager;1"]
			  .getService(Components.interfaces.nsIScriptSecurityManager);
	var dsm = Components.classes["@mozilla.org/dom/storagemanager;1"]
			  .getService(Components.interfaces.nsIDOMStorageManager);

	alert(ssm);
	var uri = ios.newURI(url, "", null);
	var principal = ssm.getCodebasePrincipal?ssm.getCodebasePrincipal(uri):ssm.getNoAppCodebasePrincipal(uri);
	Foxtrick.localStore = dsm.getLocalStorageForPrincipal(principal, "");

	Foxtrick.localSet = Foxtrick._localSet;
	Foxtrick.localGet = function(key, callback) {
		callback(Foxtrick._localGet(key));
	};
	Foxtrick.localDeleteBranch = Foxtrick._localDeleteBranch;
}
// localStore for all other
else {
	// background 
	if ( Foxtrick.chromeContext() == "background" )  {
		Foxtrick.localStore = localStorage;
		Foxtrick.localSet = Foxtrick._localSet;
		Foxtrick.localGet = function(key, callback) {
			callback(Foxtrick._localGet(key));
		};
		Foxtrick.localDeleteBranch = Foxtrick._localDeleteBranch;
	}

	// content 
	else if ( Foxtrick.chromeContext() == "content" )  {
		
		Foxtrick.localSet = function(key, value) {
			// inform background 
			sandboxed.extension.sendRequest({
				req : "localSet",
				key : key,
				value : value
			});
		};

		Foxtrick.localGet = function(key, callback) {
			// get from background 
			sandboxed.extension.sendRequest({
				req : "localGet",
				key : key
			}, function(response){
				callback(response.value);
			});
		};

		Foxtrick.localDeleteBranch = function(branch) {
			// inform background 
			sandboxed.extension.sendRequest({
				req : "localDeleteBranch",
				branch : branch
			});
		};
	}
}
