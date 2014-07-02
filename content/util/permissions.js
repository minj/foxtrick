'use strict';
/*
 * permissions.js
 * chrome permissions management
 * http://developer.chrome.com/extensions/permissions.html
 * https://groups.google.com/a/chromium.org/forum/?fromgroups=#!topic/chromium-extensions/8L0kORbNg8U
 */

(function() {
	Foxtrick.containsPermission = function(types, callback){
		if (Foxtrick.platform == 'Chrome') {
			if (Foxtrick.chromeContext() == 'content') {
				Foxtrick.SB.ext.sendRequest({ req: 'containsPermission', types: types },
				  function(response) {
					callback(response);
				});
			} else
				Foxtrick._containsPermission(types, callback);
		}
		else
			{ callback(true); } //not chrome, access has to be granted otherwise or is not required, assume permissions
	}

	// chrome background
	Foxtrick._containsPermission = function(types, callback){
		chrome.permissions.contains(types,
			function(result) {
				callback(result);
		});
	}

	/*Needs to be invoked by user gesture, such as an onclick handler*/
	Foxtrick.requestPermission = function(types, callback){
		if (Foxtrick.platform == 'Chrome') {
			if (Foxtrick.chromeContext() == 'content') {
				// Foxtrick.SB.ext.sendRequest({ req: 'requestPermission', types: types },
				//   function(response) {
				// 	callback(response);
				// });
				throw "can't request permission from content scripts";
			} else
				Foxtrick._requestPermission(types, callback);
		}
		else
			{ callback(true); } //not chrome, access has to be granted otherwise or is not required, assume permissions were granted
	}
	// chrome background
	Foxtrick._requestPermission = function(types, callback){
		chrome.permissions.request(types,
			function(result) {
				callback(result);
		});
	}

	/*Needs to be invoked by user gesture, such as an onclick handler*/
	Foxtrick.removePermission = function(types, callback){
		if (Foxtrick.platform == 'Chrome') {
			if (Foxtrick.chromeContext() == 'content') {
				// Foxtrick.SB.ext.sendRequest({ req: 'removePermission', types: types },
				//   function(response) {
				// 	callback(response);
				// });
				throw "can't remove permission from content scripts";
			} else
				Foxtrick._removePermission(types, callback);
		}
		else
			{ callback(false); } //not chrome, remove should not be possible, fake failed revoke
	}
	// chrome background
	Foxtrick._removePermission = function(types, callback){
		chrome.permissions.request(types,
			function(result) {
				callback(result);
		});
	}
})();
