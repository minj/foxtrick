'use strict';
/**
 * env.js
 * FoxTrick environment
 * @author convinced
 */

if (!Foxtrick)
	var Foxtrick = {};


// sandboxed object for chrome, safari, opera and fennec
// used to communicate between content script and background script
/*
sandboxed.extension.sendRequest(data, callback)
// send JSON data from content to background
// callback: function(JSON)

sandboxed.extension.onRequest.addListener(listener)
// listen to requests (background and content side)
// with listener = function(JSON data, sender, callback);
// sender - content: { tab: { id: id, url: messageEvent.target.url } };
// sender - background: undefined
// callback: function(JSON)

sandboxed.extension.broadcastMessage(data, callback)
// send JSON data from background to all tabs
// with callback function(JSON)

sandboxed.extension.getURL(path)
// get extension url of path relative to extension folder

sandboxed.tabs.create(url)
// create a tab from background with url
*/

// Foxtrick.arch: 'Sandboxed' (chrome,opera,safari) or 'Gecko' (firefox, fennec)
// used mainly in l10n, prefs and css injection

// Foxtrick.platform: 'Chrome', 'Opera', 'Safari', 'Firefox', 'Mobile', 'Android'
// used mainly in UI and script starting

// Foxtrick.InternalPath: called from extension - path to extension folder
// Foxtrick.ResourcePath: called from html page - external page
// (opera, access to extension folder prohibited), path to extension folder (all other)


Foxtrick.DataPath = 'https://foxtrick.googlecode.com/svn/trunk/res/';
// used to cache dataUrl images
Foxtrick.dataUrlStorage = {};

if (typeof(opera) == 'object') {
	Foxtrick.arch = 'Sandboxed';
	Foxtrick.platform = 'Opera';
	Foxtrick.InternalPath = 'content/';
	Foxtrick.ResourcePath = 'https://foxtrick.googlecode.com/svn/trunk/content/';

	// to tell which context the chrome script is running at
	// either background page, or content script
	Foxtrick.chromeContext = function() {
		try {
			if (opera.extension.postMessage) {
				return 'content';
			}
			else {
				return 'background';
			}
		}
		catch (e) {
			return 'content';
		}
	};

	var addListener = function(handler) {
		opera.extension.addEventListener('message', handler, false);
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

		extension: {
			sendRequest: (function() {
				// The function we'll return at the end of all this
				function theFunction(data, callback) {
					var callbackToken = 'callback' + Math.random();

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
						if (messageEvent.data.name != 'response')
							return;
						if (messageEvent.data.callbackToken != callbackToken)
							return;

						if (callback)
							callback(messageEvent.data.data);

						opera.extension.removeEventListener('message', responseHandler, false);
					};
					addListener(responseHandler);
				}

				return theFunction;
			})(),

			onRequest: {
				addListener: function(handler) {
					addListener(function(messageEvent) {
						// Only listen for 'sendRequest' messages
						if (messageEvent.data.name != 'request')
							return;

						var request = messageEvent.data.data;
						var id = sandboxed.__getTabId(messageEvent.target);

						var sender = { tab: { id: id, url: messageEvent.target.url } };
						var sendResponse = function(dataToSend) {
							var responseMessage = {
								name: 'response',
								callbackToken: messageEvent.data.callbackToken,
								data: dataToSend
							};
							messageEvent.source.postMessage(responseMessage);
						};
						handler(request, sender, sendResponse);
					});
				},
			},
			// sending everywhere including options and popups
			broadcastMessage: function(message) {
				opera.extension.broadcastMessage(message);
			},
			getURL: function(path) {
				return './' + path;
			},
			getBackgroundPage: function() {
				return opera.extension.bgProcess;
			},
		},

		tabs: {
			create: function(props) {
				opera.extension.tabs.create(props);
			},
		},
	};
}

else if (typeof(safari) == 'object') {
	Foxtrick.arch = 'Sandboxed';
	Foxtrick.platform = 'Safari';
	Foxtrick.InternalPath = Foxtrick.ResourcePath = safari.extension.baseURI + 'content/';

	// to tell which context the chrome script is running at
	// either background page, or content script
	Foxtrick.chromeContext = function() {
		try {
			if (safari.application) {
				return 'background';
			}
			else {
				return 'content';
			}
		}
		catch (e) {
			return 'content';
		}
	};

	var addListener = function(handler) {
		var x = safari.self;
		if (!x.addEventListener)
			x = safari.application;
		x.addEventListener('message', handler, false);
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
					var callbackToken = 'callback' + Math.random();

					// Listen for a response for our specific request token.
					addOneTimeResponseListener(callbackToken, callback);

					var x = safari.self.tab || safari.application.activeBrowserWindow.activeTab.page;
					x.dispatchMessage('request', {
						data: data,
						callbackToken: callbackToken
					});
				}

				// Make a listener that, when it hears sendResponse for the given
				// callbackToken, calls callback(resultData) and deregisters the
				// listener.
				function addOneTimeResponseListener(callbackToken, callback) {

					var responseHandler = function(messageEvent) {
						if (messageEvent.name != 'response')
							return;
						if (messageEvent.message.callbackToken != callbackToken)
							return;
						if (callback)
							callback(messageEvent.message.data);
						safari.self.removeEventListener('message', responseHandler, false);
					};

					addListener(responseHandler);
				}

				return theFunction;
			})(),

			onRequest: {
				addListener: function(handler) {
					addListener(function(messageEvent) {
						// Only listen for 'sendRequest' messages
						if (messageEvent.name != 'request')
							return;

						var request = messageEvent.message.data;
						var id = sandboxed.__getTabId(messageEvent.target);

						var sender = { tab: { id: id, url: messageEvent.target.url } };
						var sendResponse = function(dataToSend) {
							var responseMessage = {
								callbackToken: messageEvent.message.callbackToken, data: dataToSend
							};
							messageEvent.target.page.dispatchMessage('response', responseMessage);
						};
						handler(request, sender, sendResponse);
					});
				},
			},
			// sending to just all tabs
			broadcastMessage: (function() {
				// The function we'll return at the end of all this
				function theFunction(data, callback) {
					for (var i = 0; i < safari.application.activeBrowserWindow.tabs.length; ++i) {
						var callbackToken = 'callback' + Math.random();

						// Listen for a response for our specific request token.
						addOneTimeResponseListener(callbackToken, callback);

						safari.application.activeBrowserWindow.tabs[i].page
							.dispatchMessage('request', {
							data: data,
							callbackToken: callbackToken
						});
					}
				}

				// Make a listener that, when it hears sendResponse for the given
				// callbackToken, calls callback(resultData) and deregisters the
				// listener.
				function addOneTimeResponseListener(callbackToken, callback) {

					var responseHandler = function(messageEvent) {
						if (messageEvent.name != 'response')
							return;
						if (messageEvent.message.callbackToken != callbackToken)
							return;
						if (callback)
							callback(messageEvent.message.data);

						safari.self.removeEventListener('message', responseHandler, false);
					};

					addListener(responseHandler);
				}

				return theFunction;
			})(),
		},
		tabs: {
			create: function(options) {
				var window = safari.application.activeBrowserWindow;
				window.openTab('foreground').url = options.url;
			},
		}
	};
}

else if (typeof(chrome) == 'object') {
	Foxtrick.arch = 'Sandboxed';
	Foxtrick.platform = 'Chrome';
	Foxtrick.InternalPath = Foxtrick.ResourcePath = chrome.extension.getURL('content/');

	// to tell which context the chrome script is running at
	// either background page, or content script
	Foxtrick.chromeContext = function() {
		try {
			if (window.location.protocol == 'chrome-extension:') {
				return 'background';
			}
			else {
				return 'content';
			}
		}
		catch (e) {
			return 'content';
		}
	};

	// port common functions to sandboxed
	var sandboxed = {
		extension: {
			sendRequest: function(data, callback) {
				if (callback)
					chrome.extension.sendRequest(data, callback);
				else
					chrome.extension.sendRequest(data);
			},
			onRequest: {
				addListener: function(listener) {
					chrome.extension.onRequest.addListener(listener);
				},
			},
			// send message to all registered tabs
			broadcastMessage: (function() {
				// The function we'll return at the end of all this
				function theFunction(data, callback) {
					var i;
					for (i in sandboxed.tabs.tab) {
						chrome.tabs.sendRequest(Number(i), data, callback);
					}
				}

				return theFunction;
			})(),
			getURL: function(path) {
				chrome.extension.getURL(path);
			},
			// tabid of a content script
			tabid: -1,
		},
		tabs: {
			create: function(url) {
				chrome.tabs.create(url);
			},
			// activetabs { id: true/false,.. }
			tab: {},
		},
	};

	// register tab for broadcastMessage
	if (Foxtrick.chromeContext() == 'content') {
		//  recieve tab id on register
		sandboxed.extension.sendRequest({ req: 'register' },
		  function(response) {
			sandboxed.extension.tabid = response.tabid;
		});
		// answer to status check after every new page load
		sandboxed.extension.onRequest.addListener(
		  function(request, sender, sendResponse) {
			if (request.req == 'checkAlive') {
				// send back who answered
				sendResponse({ id: request.id });
			}
		});
	}
	else if (Foxtrick.chromeContext() == 'background') {
		(function() {
			// request tabs to confirm being alive
			function updateTabList(senderid) {
				var tabListCopy = sandboxed.tabs.tab, i;
				// clear list and add alive tabs again
				sandboxed.tabs.tab = {};
				for (i in tabListCopy) {
					// not the sender
					if (i != senderid) {
						chrome.tabs.sendRequest(Number(i), { id: i, req: 'checkAlive' },
						  function(response) {
							if (response)
								sandboxed.tabs.tab[response.id] = true;
						});
					}
				}
				sandboxed.tabs.tab[senderid] = true;
			};
			// listen to tab register
			sandboxed.extension.onRequest.addListener(
			  function(request, sender, sendResponse) {
				if (request.req == 'register') {
					updateTabList(sender.tab.id);
					sendResponse({ tabid: sender.tab.id });
				}
			});
		})();
	}
}

else {
	Foxtrick.arch = 'Gecko';
	Foxtrick.InternalPath = Foxtrick.ResourcePath = 'chrome://foxtrick/content/';

	try {
		var Cc = Components.classes;
		var Ci = Components.interfaces;
		var Cu = Components.utils;
		Cu.import('resource://gre/modules/Services.jsm');
		var appInfoID = Cc['@mozilla.org/xre/app-info;1'].getService(Ci.nsIXULAppInfo).ID;
		if (appInfoID == '{aa3c5121-dab2-40e2-81ca-7ea25febc110}')
			Foxtrick.platform = 'Android';
		else if (appInfoID == '{a23983c0-fd0e-11dc-95ff-0800200c9a66}')
			Foxtrick.platform = 'Mobile';
		else
			Foxtrick.platform = 'Firefox';  // includes SeaMonkey here
	} catch (e) {
		// above not working in mobile content. so it's that
		if (typeof(addMessageListener) !== 'undefined' || typeof(messageManager) !== 'undefined')
			Foxtrick.platform = 'Mobile';
		else
			Foxtrick.platform = 'Firefox';  // includes SeaMonkey here
	}

	if (Foxtrick.platform == 'Mobile' || Foxtrick.platform == 'Android') {
		Foxtrick.chromeContext = function() {
			if (typeof(sendSyncMessage) == 'function')
				return 'content';
			else
				return 'background';
		};
	}
	else {
		Foxtrick.chromeContext = function() {
			return 'background';
		};
	}

	// fennec ports
	if (Foxtrick.platform == 'Mobile' || Foxtrick.platform == 'Android') {
		Foxtrick.DataPath = 'chrome://foxtrick/content/res/';

		if (typeof(addMessageListener) !== 'undefined' || typeof(messageManager) !== 'undefined') {
			var addListener = function(name, handler) {
				if (typeof(addMessageListener) == 'function')
					addMessageListener(name, handler);
				else
					messageManager.addMessageListener(name, handler);
			};
			var removeListener = function(name, handler) {
				if (typeof(removeMessageListener) == 'function')
					removeMessageListener(name, handler);
				else
					messageManager.removeMessageListener(name, handler);
			};
		}
		else // happens for fennec prefs. not needed thus ignored or it would mess up above
			var addListener = function(name, handler) {};

		// fennec adapter. adapted from adblockplus for safari
		var sandboxed = {
			// Track tabs that make requests to the global page, assigning them
			// IDs so we can recognize them later.
			__getTabId: (function() {
				// Tab objects are destroyed when no one has a reference to them,
				// so we keep a list of them, lest our IDs get lost.
				var tabs = [];
				var lastAssignedTabId = -1;
				var theFunction = function(tab) {
					// Clean up closed tabs, to avoid memory bloat.
					tabs = tabs.filter(function(t) { return t.browser != null; });

					if (tab.tid === undefined) {
						// New tab
						tab.tid = lastAssignedTabId + 1;
						lastAssignedTabId = tab.tid;
						tabs.push(tab); // save so it isn't garbage collected, losing our ID.
					}
					return tab.tid;
				};
				return theFunction;
			})(),
			__listener: function(messageEvent) {
				var request = messageEvent.json.data;
				var id = sandboxed.__getTabId(messageEvent.target);

				var sender = { tab: {
					id: id, url: messageEvent.target.lastLocation,
					target: messageEvent.target
				} };
				var sendResponse = function(dataToSend) {
					var responseMessage = {
						callbackToken: messageEvent.json.callbackToken, data: dataToSend
					};
					if (typeof(sendAsyncMessage) == 'function')
						sendAsyncMessage('response', responseMessage);
					else
						messageManager.broadcastAsyncMessage('response', responseMessage);
				};
				handler(request, sender, sendResponse);
			},
			extension: {
				getURL: function(path) {
					return 'chrome://foxtrick/' + path;
				},

				sendRequest: (function() {
					// The function we'll return at the end of all this
					function theFunction(data, callback) {
						var callbackToken = 'callback' + Math.random();

						// Listen for a response for our specific request token.
						addOneTimeResponseListener(callbackToken, callback);
						if (typeof(sendAsyncMessage) == 'function')
							sendAsyncMessage('request', {
							data: data,
							callbackToken: callbackToken
						});
						else
							messageManager.broadcastAsyncMessage('request', {
							data: data,
							callbackToken: callbackToken
						});
					}

					// Make a listener that, when it hears sendResponse for the given
					// callbackToken, calls callback(resultData) and deregisters the
					// listener.
					function addOneTimeResponseListener(callbackToken, callback) {

						var responseHandler = function(messageEvent) {
							try {
								if (messageEvent.json.callbackToken != callbackToken)
									return;

								if (callback)
									callback(messageEvent.json.data, messageEvent.target);

								removeListener('response', responseHandler, false);
							} catch (e) {
								Foxtrick.log('callback error:', e);
							}
						};

						addListener('response', responseHandler);
					}

					return theFunction;
				})(),

				onRequest: {
					// make wrapper for the handler so we can send cack to the requestion function
					__makeHandlerWrapper: function(handler) {
						return {
							receiveMessage: function(messageEvent) {
								var request = messageEvent.json.data;
								var id = sandboxed.__getTabId(messageEvent.target);

								var sender = { tab: {
									id: id,
									url: messageEvent.target.lastLocation,
									target: messageEvent.target
								} };
								var sendResponse = function(dataToSend) {
									var responseMessage = {
										callbackToken: messageEvent.json.callbackToken,
										data: dataToSend
									};
									if (typeof(sendAsyncMessage) == 'function')
										sendAsyncMessage('response', responseMessage);
									else if (typeof(messageManager) !== 'undefined') {
										try {
											var childMM = Foxtrick.getFennecMM(messageEvent);
											childMM.sendAsyncMessage('response', responseMessage);
										}
										catch (e) {
											Foxtrick.log('No MessageSender');
											messageManager.broadcastAsyncMessage('response',
																				 responseMessage);
										}
									}
								};
								handler(request, sender, sendResponse);
							}
						};
					},
					// stores handler wrappers so we can unregister them again
					__handlerWrappers: {},

					addListener: function(handler) {
						var handlerWrapper = this.__makeHandlerWrapper(handler);
						this.__handlerWrappers[handlerWrapper] = handlerWrapper;
						addListener('request', this.__handlerWrappers[handlerWrapper]);
					},

					removeListener: function(handler) {
						var handlerWrapper = this.__makeHandlerWrapper(handler);
						removeListener('request', this.__handlerWrappers[handlerWrapper]);
					}
				},

				broadcastMessage: function(message) {
					messageManager.broadcastAsyncMessage('request', { data: message });
				},

				// tabid of a content script
				tabid: -1,
			},
			tabs: {
				create: function(data) {
					if (Foxtrick.platform == 'Mobile')
						Browser.addTab(data.url, true);
					else if (Foxtrick.platform == 'Android')
						BrowserApp.addTab(data.url);
				}
			},
		};
		/*
		// register tab for broadcastMessage
		if (Foxtrick.chromeContext() == 'content') {
			//  recieve tab id on register
			sandboxed.extension.sendRequest({ req: 'register' },
			  function(response) {
				sandboxed.extension.tabid = response.tabid;
			});
		}
		else {
			// listen to tab register
			sandboxed.extension.onRequest.addListener(
			  function(request, sender, sendResponse) {
				if (request.req=='register') {
					sendResponse({ tabid: sender.tab.id });
				}
			});
		}*/
	}
}


// Node not available for all browsers. let's just use our own
Foxtrick.NodeTypes = {
	ELEMENT_NODE: 1,
	ATTRIBUTE_NODE: 2,
	TEXT_NODE: 3,
	CDATA_SECTION_NODE: 4,
	ENTITY_REFERENCE_NODE: 5,
	ENTITY_NODE: 6,
	PROCESSING_INSTRUCTION_NODE: 7,
	COMMENT_NODE: 8,
	DOCUMENT_NODE: 9,
	DOCUMENT_TYPE_NODE: 10,
	DOCUMENT_FRAGMENT_NODE: 11,
	NOTATION_NODE: 12
};


// List of categories
Foxtrick.moduleCategories = {
	INFORMATION_AGGREGATION: 'informationAggregation',
	SHORTCUTS_AND_TWEAKS: 'shortcutsAndTweaks',
	PRESENTATION: 'presentation',
	MATCHES: 'matches',
	FORUM: 'forum',
	LINKS: 'links',
	ALERT: 'alert',
	ACCESSIBILITY: 'accessibility'
};
