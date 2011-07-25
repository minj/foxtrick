/**
 * env.js
 * FoxTrick environment
 * @author FoxTrick developers
 */

if (!Foxtrick)
	var Foxtrick={};

if (typeof(opera) === "object") {
	Foxtrick.BuildFor = "Chrome";
	Foxtrick.InternalPath = "content/";
	Foxtrick.ResourcePath = "http://foxtrick.googlecode.com/svn/trunk/content/";
	
	// to tell which context the chrome script is running at
	// either background page, or content script
	Foxtrick.chromeContext = function() {
		if (Foxtrick.BuildFor != "Chrome")
			return null;
		try {
			//Foxtrick.log(opera.extension.postMessage);
			if (opera.extension.postMessage) {
				return "content";
			}
			else {
				return "background";
			}
		}
		catch (e) {
			return "content";
		}
	}

	// opera to chrome ports. based on safari adblockplus ports.js
	var console = {
		log : function ( string ) {
			opera.postError(string);
		},
	};
	

	addListener = function(handler) {
		 opera.extension.addEventListener("message", handler, false);
	};

	var chrome = {
		// Track tabs that make requests to the global page, assigning them
		// IDs so we can recognize them later.
		__getTabId: (function() {
			// Tab objects are destroyed when no one has a reference to them,
			// so we keep a list of them, lest our IDs get lost.
			var tabs = [];
			var lastAssignedTabId = 0;
			var theFunction = function(tab) {
				// Clean up closed tabs, to avoid memory bloat.
				tabs = tabs.filter(function(t) { return t.browserWindow != null; });

				if (tab.id == undefined) {
					// New tab
					tab.id = lastAssignedTabId + 1;
					lastAssignedTabId = tab.id;
					tabs.push(tab); // save so it isn't garbage collected, losing our ID.
				}
				return tab.id;
			};
			return theFunction;
		})(),

		extension : {
			sendRequest: (function() {
				// The function we'll return at the end of all this
				function theFunction(data, callback) {
					var callbackToken = "callback" + Math.random();

					// Listen for a response for our specific request token.
					addOneTimeResponseListener(callbackToken, callback);

					opera.extension.postMessage({
						name: 'request',
						data: data,
						callbackToken: callbackToken
					});
				}

				// Make a listener that, when it hears sendResponse for the given 
				// callbackToken, calls callback(resultData) and deregisters the 
				// listener.
				function addOneTimeResponseListener(callbackToken, callback) {
					var responseHandler = function(messageEvent) {
						if (messageEvent.data.name != "response")
						  return;
						if (messageEvent.data.callbackToken != callbackToken)
						  return;

						if (callback) callback(messageEvent.data.data);
						// Change to calling in 0-ms setTimeout, as Safari team thinks
						// this will work around their crashing until they can release
						// a fix.
						window.setTimeout(function() {
							opera.extension.removeEventListener("message", responseHandler, false);
						}, 0);
					};
					addListener(responseHandler);
				}

				return theFunction;
			})(),

			onRequest : {
				addListener: function(handler) {
					addListener(function(messageEvent) {
					   // Only listen for "sendRequest" messages
						if (messageEvent.data.name != "request")
							return;

						var request = messageEvent.data.data;
						var id = chrome.__getTabId(messageEvent.target);

						var sender = { tab: { id: id, url: messageEvent.target.url } };
						var sendResponse = function(dataToSend) {
							var responseMessage = { name: 'response', callbackToken: messageEvent.data.callbackToken, data: dataToSend };
							messageEvent.source.postMessage(responseMessage);
						}
						handler(request, sender, sendResponse);
					});
				},
 			},
			getURL : function (path) {return './'+path;},
		},
			
		tabs : {
			create : function(props){opera.extension.tabs.create(props)},	
		},
	};

	DOMParser = window.DOMParser;
	if (!XMLSerializer) var XMLSerializer = window.XMLSerializer;
}
else if (typeof(chrome) === "object") {
	Foxtrick.BuildFor = "Chrome";
	Foxtrick.InternalPath = chrome.extension.getURL("content/");
	Foxtrick.ResourcePath = chrome.extension.getURL("content/");
	
	// to tell which context the chrome script is running at
	// either background page, or content script
	Foxtrick.chromeContext = function() {
		if (Foxtrick.BuildFor != "Chrome")
			return null;
		try {
			if (chrome.bookmarks) {
				return "background";
			}
			else {
				return "content";
			}
		}
		catch (e) {
			return "content";
		}
	}
}
else {
	Foxtrick.BuildFor = "Gecko";
	Foxtrick.InternalPath = "chrome://foxtrick/content/";
	Foxtrick.ResourcePath = "chrome://foxtrick/content/";
}


// List of categories
Foxtrick.moduleCategories = {
	INFORMATION_AGGREGATION : 'information_aggregation',
	SHORTCUTS_AND_TWEAKS : 'shortcuts_and_tweaks',
	PRESENTATION : 'presentation',
	MATCHES : 'matches',
	FORUM : 'forum',
	LINKS : 'links',
	ALERT : 'alert'
};
