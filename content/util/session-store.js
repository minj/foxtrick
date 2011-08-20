/*
 * sessionSet() and sessionGet() are a pair of functions that can store some
 * useful information that has its life spanning the browser session.
 * The stored value must be a JSON-serializable object, or of native types.
 * Since for Google Chrome, the content scripts cannot store values across
 * pages, we store it in background script and thus requires asynchronous
 * callback in sessionGet().
 */
if ( typeof(firefox)==='object') {

	Foxtrick.sessionStore = {};

	Foxtrick.sessionSet = function(key, value) {
		Foxtrick.sessionStore[key] = value;
	};

	// key = string or map of keys and default values
	// returns value reps. map of keys and values
	Foxtrick.sessionGet = function(keymap, callback) {
		if (typeof(keymap) === "string")
				callback(Foxtrick.sessionStore[keymap]);
		else if (typeof(keymap) === "object") {
			var answermap = {};
			for (var key in keymap) {
				if (Foxtrick.sessionStore[key]!==null)
					answermap[key] = Foxtrick.sessionStore[key];
				else
					answermap[key] = keymap[i];
			}
				callback(answermap);
		}
	};

	Foxtrick.sessionDeleteBranch = function(branch) {
		if (branch != '') branch += '.';
		for (var key in Foxtrick.sessionStore) {
			if (key.indexOf(branch)===0)
				Foxtrick.sessionStore[key] = null;
		};
	};
}
// sessionStore in back ground for all other
else {
	if ( Foxtrick.chromeContext() == "background" )  {

		Foxtrick.sessionStore = {};

		Foxtrick.sessionSet = function(key, value) {
			Foxtrick.sessionStore[key] = value;
		};

		// key = string or map of keys and default values
		// returns value resp map of keys and values
		Foxtrick.sessionGet = function(keymap, sendResponse) {
			if (typeof(keymap) === "string")
				sendResponse({ value: Foxtrick.sessionStore[keymap] });
			else if (typeof(keymap) === "object") {
				var answermap = {};
				for (var key in keymap) {
					if (Foxtrick.sessionStore[key]!==null)
						answermap[key] = Foxtrick.sessionStore[key];
					else
						answermap[key] = keymap[i];
				}
				sendResponse({ value: answermap });
			}
		};

		Foxtrick.sessionDeleteBranch = function(branch) {
			if (branch != '') branch += '.';
			for (var key in Foxtrick.sessionStore) {
				if (key.indexOf(branch)===0)
					Foxtrick.sessionStore[key] = null;
			}
		};
	}


	else if ( Foxtrick.chromeContext() == "content" )  {

		Foxtrick.sessionSet = function(key, value) {
			sandboxed.extension.sendRequest({
				req : "sessionSet",
				key : key,
				value : value
			});
		};

		Foxtrick.sessionGet = function(key, callback) {
			sandboxed.extension.sendRequest({
					req : "sessionGet",
					key : key
				}, function(n) { callback(n.value); });
		};

		Foxtrick.sessionDeleteBranch = function(branch) {
			sandboxed.extension.sendRequest({
				req : "sessionDeleteBranch",
				branch : branch
			});
		};
	}
};
