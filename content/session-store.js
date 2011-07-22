/*
 * sessionSet() and sessionGet() are a pair of functions that can store some
 * useful information that has its life spanning the browser session.
 * The stored value must be a JSON-serializable object, or of native types.
 * Since for Google Chrome, the content scripts cannot store values across
 * pages, we store it in background script and thus requires asynchronous
 * callback in sessionGet().
 */
if ( Foxtrick.BuildFor === "Gecko") {

	Foxtrick.sessionStore = {};

	Foxtrick.sessionSet = function(key, value) {
		Foxtrick.sessionStore[key] = value;
	};

	Foxtrick.sessionGet = function(key, callback) {
		callback(Foxtrick.sessionStore[key]);
	};

	Foxtrick.sessionDeleteBranch = function(branch) {
		if (branch != '') branch += '.';
		for (var key in Foxtrick.sessionStore) {
			if (key.indexOf(branch)===0) 
				Foxtrick.sessionStore[key] = null;
		};
	};
}


if (Foxtrick.BuildFor === "Chrome") {
	
	if ( Foxtrick.chromeContext() == "background" )  {
	
		Foxtrick.sessionStore = {};

		Foxtrick.sessionSet = function(key, value) {
			Foxtrick.sessionStore[key] = value;
		};

		Foxtrick.sessionGet = function(key, sendResponse) {
			sendResponse({ value: Foxtrick.sessionStore[key] });
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
			chrome.extension.sendRequest({
				req : "sessionSet",
				key : key,
				value : value
			});
		};
		
		Foxtrick.sessionGet = function(key, callback) {
			chrome.extension.sendRequest({
					req : "sessionGet",
					key : key
				}, function(n) { callback(n.value); });
		};

		Foxtrick.sessionDeleteBranch = function(branch) {
			chrome.extension.sendRequest({
				req : "sessionDeleteBranch",
				branch : branch
			});
		};
	}
};
