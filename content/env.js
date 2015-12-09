'use strict';
/**
 * env.js
 * Foxtrick environment
 * @author convinced, LA-MJ
 */

/* globals Components, Services, BrowserApp */
/* globals addMessageListener, removeMessageListener, messageManager, sendAsyncMessage */
/* globals safari, chrome */

if (!Foxtrick)
	var Foxtrick = {};


// sandboxed object for chrome, safari and fennec
// used to communicate between content script and background script
/*
Foxtrick.SB.ext.sendRequest(data, callback)
// send JSON data from content to background
// callback: function(reply)

Foxtrick.SB.ext.onRequest.addListener(listener)
// listen to requests (background and content side)
// with listener = function(JSON data, sender, callback);
// sender - content: { tab: { id: id, url: ev.target.url }};
// sender - background: undefined
// callback: function(reply)

Foxtrick.SB.ext.broadcastMessage(data, callback)
// send JSON data from background to all tabs
// with callback function(reply)

Foxtrick.SB.ext.getURL(path)
// get extension url of path relative to extension folder

Foxtrick.SB.tabs.create(url)
// create a tab from background with url
*/

// Foxtrick.arch: 'Sandboxed' (chrome, safari) or 'Gecko' (firefox, fennec)
// used mainly in l10n, prefs and css injection

// Foxtrick.platform: 'Chrome', 'Safari', 'Firefox', 'Android'
// used mainly in UI and script starting

// Foxtrick.InternalPath: called from extension - path to extension folder
// Foxtrick.ResourcePath: called from html page - external page
// Foxtrick.DataPath: path to res/

(function() {

	// used to cache dataUrl images
	Foxtrick.dataUrlStorage = {};

	// messaging abstraction
	var addListener, removeListener;

	if (typeof safari === 'object') {
		Foxtrick.arch = 'Sandboxed';
		Foxtrick.platform = 'Safari';
		Foxtrick.InternalPath = Foxtrick.ResourcePath = safari.extension.baseURI + 'content/';
		Foxtrick.DataPath = safari.extension.baseURI + 'res/';

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

		addListener = function(handler) {
			var target = safari.self;
			if (!target.addEventListener)
				target = safari.application;

			target.addEventListener('message', handler);
		};
		removeListener = function(handler) {
			var target = safari.self;
			if (!target.removeListener)
				target = safari.application;

			target.removeEventListener('message', handler);
		};

		// Safari adapter. copied from adblockplus for safari
		Foxtrick.SB = {
			ext: {
				getBackgroundPage: function() {
					return safari.extension.globalPage.contentWindow;
				},

				getURL: function(path) {
					return safari.extension.baseURI + path;
				},

				__request: (function() {
					// The function we'll return at the end of all this
					var theFunction = function(target, data, callback) {
						var callbackToken = 'callback' + Math.random();
						var msg = { data: data, callbackToken: callbackToken };

						// Listen for a response for our specific request token.
						addOneTimeResponseListener(callbackToken, callback);

						target.dispatchMessage('request', msg);
					};

					// Make a listener which, when activated for the given callbackToken,
					// calls callback(resultData) and unregisters itself
					var addOneTimeResponseListener = function(callbackToken, callback) {

						var responseHandler = function(ev) {
							var run = function(callback) {
								try {
									callback(ev.message.data);
								}
								catch (e) {
									Foxtrick.log('callback error:', e);
								}
							};

							if (ev.name != 'response')
								return;
							if (ev.message.callbackToken != callbackToken)
								return;

							removeListener(responseHandler);

							if (typeof callback === 'function') {
								run(callback);
							}
						};

						addListener(responseHandler);
					};

					return theFunction;
				})(),

				sendRequest: function(data, callback) {
					var target = safari.self.tab ||
						safari.application.activeBrowserWindow.activeTab.page;

					this.__request(target, data, callback);
				},
				// sending to all tabs
				broadcastMessage: function(data, callback) {
					Foxtrick.forEach(function(tab) {
						Foxtrick.SB.ext.__request(tab.page, data, callback);
					}, safari.application.activeBrowserWindow.tabs);
				},

				onRequest: {
					addListener: function(handler) {
						var responseHandler = function(ev) {
							// Only listen for 'sendRequest' messages
							if (ev.name != 'request')
								return;

							var request = ev.message.data;
							var id = Foxtrick.SB.tabs.getId(ev.target);
							var sender = { tab: { id: id, url: ev.target.url }};

							var sendResponse = function(dataToSend) {
								var reply = {
									callbackToken: ev.message.callbackToken,
									data: dataToSend,
								};

								ev.target.page.dispatchMessage('response', reply);
							};
							handler(request, sender, sendResponse);
						};

						addListener(responseHandler);
					},
				},

			},
			tabs: {
				// Track tabs that make requests to the global page, assigning them
				// IDs so we can recognize them later.
				getId: (function() {
					// Tab objects are destroyed when no one has a reference to them,
					// so we keep a list of them, lest our IDs get lost.
					var tabs = [];
					var lastAssignedTabId = -1;

					var theFunction = function(tab) {
						// Clean up closed tabs, to avoid memory bloat.
						tabs = tabs.filter(function(t) { return t.browserWindow !== null; });

						if (typeof tab._ftId === 'undefined') {
							// New tab
							tab._ftId = ++lastAssignedTabId;
							tabs.push(tab); // save so it isn't garbage collected, losing our ID.
						}
						return tab._ftId;
					};
					return theFunction;
				})(),

				create: function(options) {
					var window = safari.application.activeBrowserWindow;
					window.openTab('foreground').url = options.url;
				},
			},
		};
	}

	else if (typeof chrome === 'object') {
		Foxtrick.arch = 'Sandboxed';
		Foxtrick.platform = 'Chrome';
		Foxtrick.InternalPath = Foxtrick.ResourcePath = chrome.extension.getURL('content/');
		Foxtrick.DataPath = chrome.extension.getURL('res/');

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
		Foxtrick.SB = {
			ext: {
				getBackgroundPage: function() {
					return chrome.extension.getBackgroundPage();
				},
				getURL: function(path) {
					return chrome.runtime.getURL(path);
				},

				sendRequest: function(data, callback) {
					try {
						if (callback)
							chrome.extension.sendRequest(data, callback);
						else
							chrome.extension.sendRequest(data);
					}
					catch (e) {}
				},
				onRequest: {
					addListener: function(listener) {
						chrome.extension.onRequest.addListener(listener);
					},
				},

				// README: chrome implementation uses direct binding to sendResponse function rather
				// than callback tokens, thus normally there are no listeners on the content side.
				broadcastMessage: function(data, callback) {
					for (var i in Foxtrick.SB.tabs.active) {
						chrome.tabs.sendRequest(Number(i), data, callback);
					}
				},
				// tabId of a content script
				tabId: -1,
			},
			tabs: {
				getId: function(tab) {
					return tab.id;
				},
				create: function(url) {
					chrome.tabs.create(url);
				},
				// activeTabs { id: true/false,.. }
				active: {},
			},
		};

		if (Foxtrick.chromeContext() == 'content') {
			// register this tab for broadcastMessage messages and receive tabId
			Foxtrick.SB.ext.sendRequest({ req: 'register' },
			  function(response) {
				Foxtrick.SB.ext.tabId = response.tabId;
			});

			// README: chrome content listeners go here

			// answer to status check after every new page load
			Foxtrick.SB.ext.onRequest.addListener(
			  function(request, sender, sendResponse) {
				if (request.req == 'checkAlive') {
					// send back who answered
					sendResponse({ id: request.id });
				}
			});
		}
		else if (Foxtrick.chromeContext() == 'background') {
			(function() {
				var confirmAlive = function(response) {
					if (response)
						Foxtrick.SB.tabs.active[response.id] = true;
				};

				// request tabs to confirm being alive
				var updateTabList = function(senderId) {
					var tabListOld = Foxtrick.SB.tabs.active;
					// clear list and add alive tabs again
					Foxtrick.SB.tabs.active = {};
					for (var i in tabListOld) {
						// not the sender
						if (i != senderId) {
							var msg = { req: 'checkAlive', id: i };
							chrome.tabs.sendRequest(Number(i), msg, confirmAlive);
						}
					}
					Foxtrick.SB.tabs.active[senderId] = true;
				};

				// listen to tab register
				Foxtrick.SB.ext.onRequest.addListener(
				  function(request, sender, sendResponse) {
					if (request.req == 'register') {
						updateTabList(sender.tab.id);
						sendResponse({ tabId: sender.tab.id });
					}
				});
			})();
		}
	}

	else {
		Foxtrick.arch = 'Gecko';
		Foxtrick.InternalPath = Foxtrick.ResourcePath = 'chrome://foxtrick/content/';
		Foxtrick.DataPath = 'chrome://foxtrick_resources/content/';

		Components.utils.import('resource://gre/modules/Services.jsm');
		var appInfoID = Services.appinfo.ID;
		if (appInfoID == '{aa3c5121-dab2-40e2-81ca-7ea25febc110}')
			Foxtrick.platform = 'Android';
		else
			Foxtrick.platform = 'Firefox'; // includes SeaMonkey here

		if (Foxtrick.platform === 'Android') {
			Foxtrick.chromeContext = function() {
				if (typeof sendSyncMessage === 'function')
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

		if (Foxtrick.platform === 'Android') {
			if (typeof addMessageListener !== 'undefined' ||
			    typeof messageManager !== 'undefined') {

				addListener = function(name, handler) {
					if (typeof addMessageListener === 'function')
						addMessageListener(name, handler);
					else
						messageManager.addMessageListener(name, handler);
				};
				removeListener = function(name, handler) {
					if (typeof removeMessageListener === 'function')
						removeMessageListener(name, handler);
					else
						messageManager.removeMessageListener(name, handler);
				};
			}
			else {
				// happens for fennec prefs. not needed thus ignored or it would mess up above

				/* jshint ignore:start */
				addListener = function(name, handler) {};
				removeListener = function(name, handler) {};
				/* jshint ignore:end */
			}

			// fennec adapter. adapted from adblockplus for safari
			Foxtrick.SB = {
				ext: {
					getURL: function(path) {
						return 'chrome://foxtrick/' + path;
					},

					sendRequest: (function() {
						// The function we'll return at the end of all this
						var theFunction = function(data, callback) {
							var callbackToken = 'callback' + Math.random();
							var msg = { data: data, callbackToken: callbackToken };

							// Listen for a response for our specific request token.
							addOneTimeResponseListener(callbackToken, callback);

							if (typeof sendAsyncMessage === 'function') {
								sendAsyncMessage('request', msg);
							}
							else {
								messageManager.broadcastAsyncMessage('request', msg);
							}
						};

						// Make a listener which, when activated for the given callbackToken,
						// calls callback(resultData) and unregisters itself
						var addOneTimeResponseListener = function(callbackToken, callback) {

							var responseHandler = function(ev) {
								var run = function(callback) {
									try {
										callback(ev.json.data, ev.target);
									}
									catch (e) {
										Foxtrick.log('callback error:', e);
									}
								};

								// content context
								if (ev.json.callbackToken != callbackToken)
									return;

								removeListener('response', responseHandler);

								if (typeof callback === 'function') {
									run(callback);
								}
							};

							addListener('response', responseHandler);
						};

						return theFunction;
					})(),

					onRequest: {
						// make a wrapper for the handler to pass a sendResponse reference
						__makeHandlerWrapper: function(handler) {
							return function(ev) {
								// bg context
								var request = ev.json.data;
								var id = Foxtrick.SB.tabs.getId(ev.target);

								var sender = {
									tab: {
										id: id,
										url: ev.target.lastLocation,
										target: ev.target,
									},
								};

								var sendResponse = function(dataToSend) {
									var reply = {
										callbackToken: ev.json.callbackToken,
										data: dataToSend,
									};

									if (typeof sendAsyncMessage === 'function') {
										sendAsyncMessage('response', reply);
									}
									else if (typeof messageManager !== 'undefined') {
										try {
											var childMM = ev.target.messageManager;
											childMM.sendAsyncMessage('response', reply);
										}
										catch (e) {
											Foxtrick.error('No MessageSender');
											messageManager.
												broadcastAsyncMessage('response', reply);
										}
									}
								};

								handler(request, sender, sendResponse);
							};
						},
						// stores handler wrappers so we can unregister them again
						__handlerWrappers: new Map(),

						addListener: function(handler) {
							var handlerWrapper = this.__makeHandlerWrapper(handler);
							this.__handlerWrappers.set(handler, handlerWrapper);
							addListener('request', handlerWrapper);
						},

						removeListener: function(handler) {
							var handlerWrapper = this.__handlerWrappers.get(handler);
							if (typeof handlerWrapper !== 'undefined') {
								this.__handlerWrappers.delete(handler);
								removeListener('request', handlerWrapper);
							}
						},
					},

					broadcastMessage: function(message) {
						messageManager.broadcastAsyncMessage('request', { data: message });
					},

					// tabId of a content script
					tabId: -1,
				},
				tabs: {
					// Track tabs that make requests to the global page, assigning them
					// IDs so we can recognize them later.
					getId: (function() {
						// Tab objects are destroyed when no one has a reference to them,
						// so we keep a list of them, lest our IDs get lost.
						var tabs = [];
						var lastAssignedTabId = -1;

						var theFunction = function(tab) {
							// Clean up closed tabs, to avoid memory bloat.
							tabs = tabs.filter(function(t) { return t.browser !== null; });

							if (typeof tab._ftId === 'undefined') {
								// New tab
								tab._ftId = ++lastAssignedTabId;
								// save it so it isn't garbage collected, losing our ID
								tabs.push(tab);
							}
							return tab._ftId;
						};

						return theFunction;
					})(),

					create: function(data) {
						if (Foxtrick.platform === 'Android')
							BrowserApp.addTab(data.url);
						else
							window.gBrowser.selectedTab = window.gBrowser.addTab(data.url);
					},
				},
			};
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
		NOTATION_NODE: 12,
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
		ACCESSIBILITY: 'accessibility',
	};
})();

if (Foxtrick.arch === 'Gecko') {
	/* jshint ignore:start */
	var Cc = Components.classes, Ci = Components.interfaces, Cu = Components.utils;
	/* jshint ignore:end */
}

// this is external URL for builds
// uncommented in MakeFile
/* <BUILD>
if (Foxtrick.platform !== 'Android')
	Foxtrick.DataPath = 'https://cdn.rawgit.com/minj/foxtrick/res/%d/res/';
</BUILD> */
