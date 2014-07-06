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
		answermap = {};
		for (var key in keymap) {
			if (Foxtrick.sessionStore[key] !== null)
				answermap[key] = Foxtrick.sessionStore[key];
			else
				answermap[key] = keymap[key];
		}
	}

	if (typeof(callback) == 'function') {
		try {
			callback(answermap);
		}
		catch (e) {
			Foxtrick.log('Error in callback for sessionGet', keymap);
		}
	}
	return answermap;
};

Foxtrick._sessionDeleteBranch = function(branch) {
	if (!branch)
		branch = '';
	if (branch !== '')
		branch += '.';
	var key;
	for (key in Foxtrick.sessionStore) {
		if (key.indexOf(branch) === 0)
			Foxtrick.sessionStore[key] = null;
	}
};

// for Firefox
if (Foxtrick.platform == 'Firefox') {
	Foxtrick.sessionSet = Foxtrick._sessionSet;
	Foxtrick.sessionGet = function(key, callback) {
		try {
			callback(Foxtrick._sessionGet(key));
		}
		catch (e) {
			Foxtrick.log('Error in callback for sessionGet', key);
		}
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
			Foxtrick.SB.ext.sendRequest({ req: 'sessionSet', key: key, value: value });
		};

		Foxtrick.sessionGet = function(key, callback) {
			// get from background
			Foxtrick.SB.ext.sendRequest({ req: 'sessionGet', key: key },
			  function(response) {
				try {
					callback(response.value);
				}
				catch (e) {
					Foxtrick.log('Error in callback for sessionGet', key, response, e);
				}
			});
		};

		Foxtrick.sessionDeleteBranch = function(branch) {
			// inform background
			Foxtrick.SB.ext.sendRequest({ req: 'sessionDeleteBranch', branch: branch });
		};
	}
}
