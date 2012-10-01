'use strict';
/*
 * sessionSet() and sessionGet() are a pair of functions that can store some
 * useful information that has its life spanning the browser session.
 * The stored value must be a JSON-serializable object, or of native types.
 */


Foxtrick.sessionStore = {};

Foxtrick._sessionSet = function(key, value) {
	Foxtrick.sessionStore[key] = value;
};

// key = string or map of keys and default values
// returns value reps. map of keys and values
Foxtrick._sessionGet = function(keymap, callback) {
	var answermap;
	if (typeof(keymap) === 'string')
		answermap = Foxtrick.sessionStore[keymap];
	else if (typeof(keymap) === 'object') {
		var answermap = {};
		for (var key in keymap) {
			if (Foxtrick.sessionStore[key] !== null)
				answermap[key] = Foxtrick.sessionStore[key];
			else
				answermap[key] = keymap[i];
		}
	}

	if (typeof(callback) == 'function')
		callback(answermap);
	return answermap;
};

Foxtrick._sessionDeleteBranch = function(branch) {
	if (!branch) branch = '';
	if (branch != '') branch += '.';
	for (var key in Foxtrick.sessionStore) {
		if (key.indexOf(branch) === 0)
			Foxtrick.sessionStore[key] = null;
	}
};

// for Firefox
if (Foxtrick.platform == 'Firefox') {
	Foxtrick.sessionSet = Foxtrick._sessionSet;
	Foxtrick.sessionGet = function(key, callback) {
		callback(Foxtrick._sessionGet(key));
	};
	Foxtrick.sessionDeleteBranch = Foxtrick._sessionDeleteBranch;
}
// sessionStore for all other
else {
	// background
	if (Foxtrick.chromeContext() == 'background') {
		Foxtrick.sessionSet = Foxtrick._sessionSet;
		Foxtrick.sessionGet = Foxtrick._sessionGet;
		Foxtrick.sessionDeleteBranch = Foxtrick._sessionDeleteBranch;
	}

	// content
	else if (Foxtrick.chromeContext() == 'content') {

		Foxtrick.sessionSet = function(key, value) {
			// inform background
			sandboxed.extension.sendRequest({
				req: 'sessionSet',
				key: key,
				value: value
			});
		};

		Foxtrick.sessionGet = function(key, callback) {
			// get from background
			sandboxed.extension.sendRequest({
				req: 'sessionGet',
				key: key
			}, function(response) {
				callback(response.value);
			});
		};

		Foxtrick.sessionDeleteBranch = function(branch) {
			// inform background
			sandboxed.extension.sendRequest({
				req: 'sessionDeleteBranch',
				branch: branch
			});
		};
	}
}
