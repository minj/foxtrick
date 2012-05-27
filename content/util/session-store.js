"use strict";
/*
 * sessionSet() and sessionGet() are a pair of functions that can store some
 * useful information that has its life spanning the browser session.
 * The stored value must be a JSON-serializable object, or of native types.
 * For sandboxed, the content scripts stores copies which get updated 
 * via background script with every change.
 */


Foxtrick.sessionStore = {};

Foxtrick._sessionSet = function(key, value) {
	Foxtrick.sessionStore[key] = value;
};

// key = string or map of keys and default values
// returns value reps. map of keys and values
Foxtrick._sessionGet = function(keymap) {
	if (typeof(keymap) === "string")
		return Foxtrick.sessionStore[keymap];
	else if (typeof(keymap) === "object") {
		var answermap = {};
		for (var key in keymap) {
			if (Foxtrick.sessionStore[key]!==null)
				answermap[key] = Foxtrick.sessionStore[key];
			else
				answermap[key] = keymap[i];
		}
		return answermap;
	}
};
// dummy for testing async calls
Foxtrick.sessionGetAsync = function(key, callback) {
	window.setTimeout(function(){
		//Foxtrick.log(key,Foxtrick._sessionGet(key));
		callback(Foxtrick._sessionGet(key));
	}, 1);
};

Foxtrick._sessionDeleteBranch = function(branch) {
	if (branch != '') branch += '.';
	for (var key in Foxtrick.sessionStore) {
		if (key.indexOf(branch)===0)
			Foxtrick.sessionStore[key] = null;
	};
};

// for Firefox
if (Foxtrick.platform == "Firefox") {
	Foxtrick.sessionSet = Foxtrick._sessionSet;
	Foxtrick.sessionGet = Foxtrick._sessionGet;
	Foxtrick.sessionDeleteBranch = Foxtrick._sessionDeleteBranch;
}
// sessionStore for all other
else {
	// background copy for transmission to tabs on init
	if ( Foxtrick.chromeContext() == "background" )  {
		Foxtrick.sessionSet = Foxtrick._sessionSet;
		Foxtrick.sessionGet = Foxtrick._sessionGet; 
		Foxtrick.sessionDeleteBranch = Foxtrick._sessionDeleteBranch;
	}

	// content copy. updated with every change via background broadcasting
	else if ( Foxtrick.chromeContext() == "content" )  {
		
		// listen to updates from other tabs
		// don't update if this tab initiated the update
		sandboxed.extension.onRequest.addListener(
		 function(request, sender, sendResponse) {
			//Foxtrick.log('sessionStore broadcast listen ', 'this_tabid:', sandboxed.extension.tabid, ' senderid:',request.senderid);
			if (request.req=='sessionSet' && sandboxed.extension.tabid != request.senderid ) {
				Foxtrick.log('broadcast sessionSet from ', request.senderid, ' this_tabid:', sandboxed.extension.tabid, ' :', request.key);
				Foxtrick._sessionSet(request.key, request.value);
			}
			else if (request.req=='sessionDeleteBranch' && sandboxed.extension.tabid != request.senderid ) {
				Foxtrick._sessionDeleteBranch(request.branch);
				Foxtrick.log('broadcast sessionDeleteBranch from ', request.senderid, ' this_tabid:', sandboxed.extension.tabid, ' :', request.branch);
			}
		});

		Foxtrick.sessionSet = function(key, value) {
			// local copy
			Foxtrick._sessionSet(key, value)
			// inform background and other tabs
			sandboxed.extension.sendRequest({
				req : "sessionSet",
				key : key,
				value : value
			});
		};

		Foxtrick.sessionGet = Foxtrick._sessionGet;

		Foxtrick.sessionDeleteBranch = function(branch) {
			// local copy
			Foxtrick._sessionDeleteBranch(branch);
			// inform background and other tabs
			sandboxed.extension.sendRequest({
				req : "sessionDeleteBranch",
				branch : branch
			});
		};
	}
}
