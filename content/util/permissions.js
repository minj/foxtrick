/**
 * permissions.js
 * chrome permissions management
 * http://developer.chrome.com/extensions/permissions.html
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

Foxtrick.containsPermission = function(types, callback) {
	if (Foxtrick.platform == 'Chrome') {
		if (Foxtrick.context == 'content')
			Foxtrick.SB.ext.sendRequest({ req: 'containsPermission', types: types }, callback);
		else
			chrome.permissions.contains(types, callback);

		return;
	}
	callback(true);
};

// Needs to be invoked by user gesture, such as an onclick handler
Foxtrick.requestPermission = function(types, callback) {
	if (Foxtrick.platform == 'Chrome') {
		if (Foxtrick.context == 'content') {
			// Foxtrick.SB.ext.sendRequest({ req: 'requestPermission', types: types },
			//   function(response) {
			// 	callback(response);
			// });
			throw Error("can't request permission from content scripts");
		}
		else if (Foxtrick.hasProp(chrome, 'permissions')) {
			chrome.permissions.request(types, callback);
		}
		else {
			browser.permissions.request(types).then(callback);
		}
		return;
	}
	callback(true);
};

// Needs to be invoked by user gesture, such as an onclick handler
Foxtrick.removePermission = function(types, callback) {
	if (Foxtrick.platform == 'Chrome') {
		if (Foxtrick.context == 'content') {
			// Foxtrick.SB.ext.sendRequest({ req: 'removePermission', types: types },
			//   function(response) {
			// 	callback(response);
			// });
			throw Error("can't remove permission from content scripts");
		}
		else {
			chrome.permissions.request(types, callback);
		}
		return;
	}
	callback(false);
};
