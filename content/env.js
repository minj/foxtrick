/**
 * env.js
 * FoxTrick environment
 * @author FoxTrick developers
 */

if (!Foxtrick)
	var Foxtrick={};

if (typeof(opera) === "object") {
	Foxtrick.BuildFor = "Sandboxed";
	Foxtrick.BuildForDetail = "Opera";
	Foxtrick.InternalPath = "content/";
	Foxtrick.ResourcePath = "http://foxtrick.googlecode.com/svn/trunk/content/";
	
	// used to cache dataUrls images in opera
	Foxtrick.dataUrlStorage = {};
	
	// to tell which context the chrome script is running at
	// either background page, or content script
	Foxtrick.chromeContext = function() {
		if (Foxtrick.BuildFor != "Sandboxed")
			return null;
		try {
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

	// opera ports to sandboxed. based on safari adblockplus ports.js
	var console = {
		log : function ( string ) {
			opera.postError(string);
		},
	};
	
	// overwritten later. early version here to make sure there is one all times
	Foxtrick.log = function ( string ) {
		opera.postError(string);
	};

	addListener = function(handler) {
		 opera.extension.addEventListener("message", handler, false);
	};

	var sandboxed = {
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
						var id = sandboxed.__getTabId(messageEvent.target);

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

	// fix other opera oddities
	DOMParser = window.DOMParser;
	if (!XMLSerializer) var XMLSerializer = window.XMLSerializer;
	var FileReader = window.FileReader;
	var Node = {
		ELEMENT_NODE : 1,
		ATTRIBUTE_NODE : 2,
		TEXT_NODE :3,
	};
	
	
	
}
else if (typeof(safari) === "object") {
	Foxtrick.BuildFor = "Sandboxed";
	Foxtrick.BuildForDetail = "Safari";
	Foxtrick.InternalPath = safari.extension.baseURI + "content/";
	Foxtrick.ResourcePath = safari.extension.baseURI + "content/";
	
	// to tell which context the chrome script is running at
	// either background page, or content script
	Foxtrick.chromeContext = function() {
		if (Foxtrick.BuildFor != "Sandboxed")
			return null;
		try {
			if (safari.application) {
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

	addListener = function(handler) {
		var x = safari.self;
		if (!x.addEventListener)
			x = safari.application;
		x.addEventListener("message", handler, false);
	};

	// Safari adapter. copied from adblockplus for safari
	var sandboxed = {
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

		extension: {
		  getBackgroundPage: function() {
			return safari.extension.globalPage.contentWindow;
		  },

		  getURL: function(path) { 
			return safari.extension.baseURI + path;
		  },

		  sendRequest: (function() {
			// The function we'll return at the end of all this
			function theFunction(data, callback) {
			  var callbackToken = "callback" + Math.random();

			  // Listen for a response for our specific request token.
			  addOneTimeResponseListener(callbackToken, callback);

			  var x = safari.self.tab || safari.application.activeBrowserWindow.activeTab.page;
			  x.dispatchMessage("request", {
				data: data,
				callbackToken: callbackToken
			  });
			}

			// Make a listener that, when it hears sendResponse for the given 
			// callbackToken, calls callback(resultData) and deregisters the 
			// listener.
			function addOneTimeResponseListener(callbackToken, callback) {

			  var responseHandler = function(messageEvent) {
				if (messageEvent.name != "response")
				  return;
				if (messageEvent.message.callbackToken != callbackToken)
				  return;

				if (callback) callback(messageEvent.message.data);
				// Change to calling in 0-ms setTimeout, as Safari team thinks
				// this will work around their crashing until they can release
				// a fix.
				// safari.self.removeEventListener("message", responseHandler, false);
				window.setTimeout(function() {
				  safari.self.removeEventListener("message", responseHandler, false);
				}, 0);
			  };

			  addListener(responseHandler);
			}

			return theFunction;
		  })(),

		  onRequest: {
			addListener: function(handler) {
			  addListener(function(messageEvent) {
				// Only listen for "sendRequest" messages
				if (messageEvent.name != "request")
				  return;

				var request = messageEvent.message.data;
				var id = sandboxed.__getTabId(messageEvent.target);

				var sender = { tab: { id: id, url: messageEvent.target.url } };
				var sendResponse = function(dataToSend) {
				  var responseMessage = { callbackToken: messageEvent.message.callbackToken, data: dataToSend };
				  messageEvent.target.page.dispatchMessage("response", responseMessage);
				}
				handler(request, sender, sendResponse);
			  });
			},
		  },

		  connect: function(port_data) {
			var portUuid = "portUuid" + Math.random();
			var x = safari.self.tab || safari.application.activeBrowserWindow.activeTab.page;
			x.dispatchMessage("port-create", {name: port_data.name, uuid: portUuid});

			var newPort = {
			  name: port_data.name,
			  onMessage: { 
				addListener: function(listener) {
				  addListener(function(messageEvent) {
					// If the message was a port.postMessage to our port, notify our listener.
					if (messageEvent.name != "port-postMessage") 
					  return;
					if (messageEvent.message.portUuid != portUuid)
					  return;
					listener(messageEvent.message.data);
				  });
				} 
			  }
			};
			return newPort;
		  },

		  onConnect: {
			addListener: function(handler) {
			  // Listen for port creations
			  addListener(function(messageEvent) {
				if (messageEvent.name != "port-create")
				  return;

				var portName = messageEvent.message.name;
				var portUuid = messageEvent.message.uuid;

				var id = sandboxed.__getTabId(messageEvent.target);

				var newPort = {
				  name: portName,
				  sender: { tab: { id: id, url: messageEvent.target.url } },
				  onDisconnect: { 
					addListener: function() { 
					  console.log("CHROME PORT LIBRARY: chrome.extension.onConnect.addListener: port.onDisconnect is not implemented, so I'm doing nothing.");
					}
				  },
				  postMessage: function(data) {
					if (! messageEvent.target.page) {
					  console.log("Oops, this port has already disappeared -- cancelling.");
					  return;
					}
					messageEvent.target.page.dispatchMessage("port-postMessage", { portUuid: portUuid, data: data });
				  }
				};

				// Inform the onNewPort caller about the new port
				handler(newPort);
			  });
			}
		  },

		  onRequestExternal: {
			addListener: function() {
			  console.log("CHROME PORT LIBRARY: onRequestExternal not supported.");
			}
		  }
		},
		tabs: {
		  create: function(options) {
			var window = safari.application.activeBrowserWindow;
			window.openTab("foreground").url = options.url;
			//var urlToOpen = chrome.extension.getURL(options.url);
			//window.openTab("foreground").url = urlToOpen;
		  }
		}
	};
}
else if (typeof(chrome) === "object") {
	Foxtrick.BuildFor = "Sandboxed";
	Foxtrick.BuildForDetail = "Chrome";
	Foxtrick.InternalPath = chrome.extension.getURL("content/");
	Foxtrick.ResourcePath = chrome.extension.getURL("content/");
	
	// to tell which context the chrome script is running at
	// either background page, or content script
	Foxtrick.chromeContext = function() {
		if (Foxtrick.BuildFor != "Sandboxed")
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
	// port common functions to sandboxed
	var sandboxed = {
		extension : {
			sendRequest: function (data, callback) {
				if (callback) chrome.extension.sendRequest(data, callback);
				else chrome.extension.sendRequest(data);
			},
			onRequest : {
				addListener : function (listener) {chrome.extension.onRequest.addListener(listener)},
			},
			getURL : function (path) {chrome.extension.getURL(path)},
		},
		tabs : {
			create : function (url) {chrome.tabs.create(url)},
		},
	};
}

else {
	Foxtrick.BuildFor = "Gecko";
	Foxtrick.BuildForDetail = "";
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
