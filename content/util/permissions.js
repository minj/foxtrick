'use strict';
/*
 * permissions.js
 * chrome permissions management
 * http://developer.chrome.com/extensions/permissions.html
 * https://groups.google.com/a/chromium.org/forum/?fromgroups=#!topic/chromium-extensions/8L0kORbNg8U
 */

if (!Foxtrick) var Foxtrick = {};

(function() {
	Foxtrick.containsPermission = function(types, callback){
		if (Foxtrick.platform == 'Chrome') {
			if (Foxtrick.chromeContext() == 'content') {
				sandboxed.extension.sendRequest({
						req: 'containsPermission', types: types
				  },
				  function(response) {
					callback(response);
				});
			} else
				Foxtrick._containsPermission(types, callback);
		}
		else
			{} //callback(null); //not chrome, do nothing
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
				// sandboxed.extension.sendRequest({
				// 		req: 'requestPermission', types: types
				//   },
				//   function(response) {
				// 	callback(response);
				// });
				throw "can't request permission from content scripts";
			} else
				Foxtrick._requestPermission(types, callback);
		}
		else
			{} //callback(null); //not chrome, do nothing
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
				// sandboxed.extension.sendRequest({
				// 		req: 'removePermission', types: types
				//   },
				//   function(response) {
				// 	callback(response);
				// });
				throw "can't remove permission from content scripts";
			} else
				Foxtrick._removePermission(types, callback);
		}
		else
			{} //callback(null); //not chrome, do nothing
	}
	// chrome background
	Foxtrick._removePermission = function(types, callback){
		chrome.permissions.request(types, 
			function(result) {
				callback(result);
		});	
	}
})();