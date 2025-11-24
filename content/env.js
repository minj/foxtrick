/**
 * env.js
 * Foxtrick environment
 * @author convinced, LA-MJ
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	// @ts-ignore
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

/* globals safari */

/**
 * Browser architecture: Sandboxed|Gecko.
 *
 * Sandboxed: Chrome/Opera and Safari.
 * Gecko: Firefox/Android.
 * Used to help abstract Foxtrick APIs in the back-end and utils.
 *
 * README: Many of the Sandboxed features also applies to Android and
 * will apply to Firefox after e10s support is finished hence this
 * distinction needs to be redesigned.
 *
 * @type {string}
 */
Foxtrick.arch = 'arch';

/**
 * Browser name: Chrome|Safari|Firefox|Android.
 *
 * Used to help abstract Foxtrick APIs in the back-end and utils.
 *
 * README: Opera is currently detected as Chrome and uses the same API.
 *
 * @type {string}
 */
Foxtrick.platform = 'Browser';

/**
 * Execution context: background|content.
 *
 * Signifies separation of permissions
 *
 * @type {string}
 */
Foxtrick.context = 'content';

/**
 * Path to content/ files from an internal context.
 *
 * Typically used to load CSS and other non-script files.
 *
 * README: used for images but this likely needs to be switched to ResourcePath.
 *
 * @type {string}
 */
Foxtrick.InternalPath = 'content/';

/**
 * Path to content/ files from an external context.
 *
 * Typically used for image URLs in CSS.
 * May be different from InternalPath.
 *
 * @type {string}
 */
Foxtrick.ResourcePath = 'content/';

/**
 * Path to independently updated resource files like links.json.
 *
 * Is currently local for Android to limit network requests.
 *
 * @type {string}
 */
Foxtrick.DataPath = 'res/';

/**
 * Data URL image cache.
 *
 * For image path conversion to data URLs.
 * {URL: dataURL}
 *
 * README: currently unused.
 *
 * @type {Object} {string: string}
 */
Foxtrick.dataUrlStorage = {};

/**
 * Sandboxed adapter, based on AdBlockPlus for Safari
 */
Foxtrick.SB = (() => ({

	/* eslint-disable no-unused-vars */
	// --------------------- function stubs ----------------
	ext: {

		/**
		 * Get a reference to background page from another elevated context
		 *
		 * README: does not make sense in Gecko for now
		 *
		 * @return {object} Global object/window
		 */
		getBackgroundPage() { return null; },

		/**
		 * Get the URL of a path relative to the extension folder
		 *
		 * @param  {string} path
		 * @return {string}
		 */
		getURL(path) { return ''; },

		/**
		 * Send data (plain JSON-like object) from content to background.
		 *
		 * callback: function(response).
		 *
		 * @param {object}   data
		 * @param {function(any):void} [callback] {function(object)}
		 */
		sendRequest(data, callback) {},

		/**
		 * Send data (plain JSON-like object) from background to all tabs.
		 *
		 * callback: function(response).
		 *
		 * @param {object}   data
		 * @param {function(any):void} callback {function(object)}
		 */
		broadcastMessage(data, callback) {},

		onRequest: {
			/**
			 * Listen to requests (background and content side).
			 *
			 * listener: function(data, sender, sendResponse);
			 * data: request object;
			 * sender: { tab: { id, url }}, undefined from background;
			 * sendResponse: function(response).
			 *
			 * sendResponse(response) should be called at the end of the listener.
			 *
			 * @param {OnMessageListener} listener {function(*, {tab: {id, url}}, function(*))}
			 */
			addListener(listener) {},

			/**
			 * Remove a listener added with onRequest.addListener
			 *
			 * @param {OnMessageListener} listener {function(*, {tab: {id, url}}, function(*))}
			 */
			removeListener(listener) {},
		},

		/**
		 * tabId of this content script.
		 *
		 * Somewhat unreliable.
		 *
		 * @type {number}
		 */
		tabId: -1,
	},

	tabs: {
		/**
		 * Get the tab ID for a tab
		 *
		 * @param  {object} tab
		 * @return {number}
		 */
		getId(tab) { return 0; },

		/**
		 * Open an URL in a new tab
		 *
		 * @param {chrome.tabs.CreateProperties} opts
		 */
		create(opts) {},
	},

	/* eslint-enable no-unused-vars */

}))();

/**
 * Define a lazy-loaded cached property
 *
 * @param {object}   obj
 * @param {string}   prop
 * @param {function} calc
 */
Foxtrick.lazyProp = function(obj, prop, calc) {
	Object.defineProperty(obj, prop, {
		configurable: true,
		enumerable: true,
		get: function() {
			var val = calc();
			delete this[prop];
			this[prop] = val;
			return val;
		},
	});
};

(function() {

	// messaging abstraction
	var addListener, removeListener, sendRequest, makeHandler;
	var REQUEST = 'request@foxtrick.org';
	var RESPONSE = 'response@foxtrick.org';

	// stores onRequest handlers so we can unregister them again
	var ONREQUEST_HANDLERS = new Map();
	Foxtrick.SB.ext.onRequest.addListener = function(handler) {
		var requestHandler = makeHandler(handler);
		ONREQUEST_HANDLERS.set(handler, requestHandler);
		addListener(requestHandler);
	};
	Foxtrick.SB.ext.onRequest.removeListener = function(handler) {
		var requestHandler = ONREQUEST_HANDLERS.get(handler);
		if (typeof requestHandler !== 'undefined') {
			ONREQUEST_HANDLERS.delete(handler);
			removeListener(requestHandler);
		}
	};

	if (typeof safari === 'object') {
		Foxtrick.arch = 'Sandboxed';
		Foxtrick.platform = 'Safari';
		Foxtrick.InternalPath = Foxtrick.ResourcePath = safari.extension.baseURI + 'content/';
		Foxtrick.DataPath = safari.extension.baseURI + 'res/';

		// to tell which context the chrome script is running at
		// either background page, or content script
		Foxtrick.lazyProp(Foxtrick, 'context', function() {
			var ret;
			try {
				if (safari.application)
					ret = 'background';
				else
					ret = 'content';
			}
			catch (e) {
				ret = 'content';
			}
			return ret;
		});

		addListener = function(handler) {
			/** @type {SafariEventTarget} */
			var target = safari.self;
			if (!target.addEventListener)
				target = safari.application;

			target.addEventListener('message', handler);
		};
		removeListener = function(handler) {
		/** @type {SafariEventTarget} */
			var target = safari.self;
			if (!target.removeEventListener)
				target = safari.application;

			target.removeEventListener('message', handler);
		};
		makeHandler = function(handler) {
			return function(ev) {
				// Only listen for 'sendRequest' messages
				if (ev.name != REQUEST)
					return;

				var request = ev.message.data;
				var id = Foxtrick.SB.tabs.getId(ev.target);
				var sender = { tab: { id: id, url: ev.target.url }};

				var sendResponse = function(dataToSend) {
					var reply = {
						callbackToken: ev.message.callbackToken,
						data: dataToSend,
					};

					ev.target.page.dispatchMessage(RESPONSE, reply);
				};
				handler(request, sender, sendResponse);
			};
		};

		sendRequest = (function() {
			// Make a listener which, when activated for the given callbackToken,
			// calls callback(resultData) and unregisters itself
			var addOneTimeResponseListener = function(callbackToken, callback) {

				var responseHandler = function(ev) {
					var run = function(callback) {
						try {
							callback(ev.message.data);
							return;
						}
						catch (e) {
							Foxtrick.log('callback error:', e);
						}
					};

					if (ev.name != RESPONSE)
						return;
					if (ev.message.callbackToken != callbackToken)
						return;

					removeListener(responseHandler);

					if (typeof callback === 'function')
						run(callback);
				};

				addListener(responseHandler);
			};

			// The actual sendRequest implementation
			return function(target, data, callback) {
				var callbackToken = 'callback' + Math.random();
				var msg = { data: data, callbackToken: callbackToken };

				// Listen for a response for our specific request token.
				addOneTimeResponseListener(callbackToken, callback);

				target.dispatchMessage(REQUEST, msg);
			};
		})();

		Foxtrick.SB.ext.getBackgroundPage = function() {
			let ext = /** @type {SafariExtension} */ (safari.extension);
			return ext.globalPage.contentWindow;
		};

		Foxtrick.SB.ext.getURL = function(path) {
			return safari.extension.baseURI + path;
		};

		Foxtrick.SB.ext.sendRequest = function(data, callback) {
			var target = safari.self.tab ||
				safari.application.activeBrowserWindow.activeTab.page;

			sendRequest(target, data, callback);
		};

		// sending to all tabs
		Foxtrick.SB.ext.broadcastMessage = function(data, callback) {
			Foxtrick.forEach(function(tab) {
				sendRequest(tab.page, data, callback);
			}, safari.application.activeBrowserWindow.tabs);
		};

		// Track tabs that make requests to the global page, assigning them
		// IDs so we can recognize them later.
		Foxtrick.SB.tabs.getId = (function() {
			// Tab objects are destroyed when no one has a reference to them,
			// so we keep a list of them, lest our IDs get lost.
			var tabs = [];
			var lastAssignedTabId = -1;

			var theFunction = function(tab) {
				// Clean up closed tabs, to avoid memory bloat.
				tabs = tabs.filter(t => t.browserWindow !== null);

				if (typeof tab._ftId === 'undefined') {
					// New tab
					tab._ftId = ++lastAssignedTabId;
					tabs.push(tab); // save so it isn't garbage collected, losing our ID.
				}
				return tab._ftId;
			};
			return theFunction;
		})();

		Foxtrick.SB.tabs.create = function(options) {
			var window = safari.application.activeBrowserWindow;
			window.openTab('foreground').url = options.url;
		};
	}

	else if (typeof chrome === 'object') {
		Foxtrick.arch = 'Sandboxed';
		Foxtrick.platform = 'Chrome';
		Foxtrick.InternalPath = Foxtrick.ResourcePath = chrome.runtime.getURL('content/');
		Foxtrick.DataPath = chrome.runtime.getURL('res/');

		// to tell which context the chrome script is running at
		// either background page, or content script
		Foxtrick.lazyProp(Foxtrick, 'context', function() {
			var ret;
			try {
				// MV3: Use self.location for service worker compatibility
			var protocol = (typeof self !== 'undefined' && self.location)
				? self.location.protocol
				: '';
				if (protocol === 'chrome-extension:' || protocol === 'moz-extension:')
					ret = 'background';
				else
					ret = 'content';
			}
			catch (e) {
				ret = 'content';
			}
			return ret;
		});

		var ACTIVE_TABS = new Set();

		Foxtrick.SB.tabs.getId = function(tab) {
			return tab.id;
		};

		Foxtrick.SB.tabs.create = function(url) {
			chrome.tabs.create(url);
		};

		addListener = function(handler) {
			chrome.runtime.onMessage.addListener(handler);
		};
		removeListener = function(handler) {
			chrome.runtime.onMessage.removeListener(handler);
		};
		makeHandler = function(handler) {
			// no custom wrapper in this arch
			// however, the handler must return true
			// if sendResponse will be called asynchronously
			return handler; // (request, sender, sendResponse) => bool
		};

		// MV3: chrome.extension.getBackgroundPage() is deprecated
		// Use message passing instead to communicate with service worker
		Foxtrick.SB.ext.getBackgroundPage = function() {
			// Return null - service workers don't have a window/document
			// Code should use sendRequest() for communication instead
			Foxtrick.log.warn('getBackgroundPage() is deprecated in MV3. Use sendRequest() instead.');
			return null;
		};
		Foxtrick.SB.ext.getURL = function(path) {
			return chrome.runtime.getURL(path);
		};

		Foxtrick.SB.ext.sendRequest = function(data, callback) {
			try {
				if (callback)
					chrome.runtime.sendMessage(data, callback);
				else
					chrome.runtime.sendMessage(data);
			}
			catch (e) {}
		};

		// README: chrome implementation uses direct binding to sendResponse function rather
		// than callback tokens, thus normally there are no listeners on the content side.
		Foxtrick.SB.ext.broadcastMessage = function(data, callback) {
			try {
				for (var i in ACTIVE_TABS) {
					if (callback)
						chrome.tabs.sendMessage(Number(i), data, callback);
					else
						chrome.tabs.sendMessage(Number(i), data);
				}
			}
			catch (e) {}
		};

		if (Foxtrick.context === 'content') {
			// register this tab for broadcastMessage messages and receive tabId
			Foxtrick.SB.ext.sendRequest({ req: 'register' }, (response) => {
				Foxtrick.SB.ext.tabId = response.tabId;
			});

			// README: chrome content listeners go here

			// answer to status check after every new page load
			Foxtrick.SB.ext.onRequest.addListener((request, _, sendResponse) => {
				if (request.req == 'checkAlive') {
					// send back who answered
					sendResponse({ id: request.id });
				}
			});
		}
		else if (Foxtrick.context === 'background') {
			(function() {

				var confirmAlive = function(response) {
					if (response)
						ACTIVE_TABS.add(response.id);
				};

				// request tabs to confirm being alive
				var updateTabList = function(senderId) {
					ACTIVE_TABS.delete(senderId);

					var tabListOld = [...ACTIVE_TABS];

					ACTIVE_TABS.clear();
					ACTIVE_TABS.add(senderId);

					for (let i of tabListOld) {
						let msg = { req: 'checkAlive', id: i };
						chrome.tabs.sendMessage(Number(i), msg, confirmAlive);
					}
				};

				// listen to tab register
				Foxtrick.SB.ext.onRequest.addListener((request, sender, sendResponse) => {
					if (request.req != 'register')
						return;

					updateTabList(sender.tab.id);
					sendResponse({ tabId: sender.tab.id });
				});

			})();
		}
	}

})();

if (Foxtrick.platform !== 'Android') {
	// use a remote DataPath for desktop installs unless running from source
	// branch cannot be accessed so early so we need a lazy getter
	(function() {
		var localDataPath = Foxtrick.DataPath;
		var remoteDataPath = 'https://cdn.rawgit.com/minj/foxtrick/res/%d/res/';
		Foxtrick.lazyProp(Foxtrick, 'DataPath', function() {
			if (Foxtrick.branch !== 'dev')
				return remoteDataPath;

			return localDataPath;
		});
	})();
}

/** @typedef {(response?: any) => void} ResponseCb */
// eslint-disable-next-line max-len
/** @typedef {(message: any, sender: chrome.runtime.MessageSender, sendResponse: ResponseCb) => boolean|void} OnMessageListener */
