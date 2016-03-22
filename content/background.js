'use strict';
/*
 * background.js
 *
 * Foxtrick background loader for Sandboxed arch and Fennec
 * executed on extension load (on activate, reload and browser start)
 *
 * @author ryanli, convincedd, LA-MJ
 */

/* global Browser */

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore:line

if (!Foxtrick.loader)
	Foxtrick.loader = {};

Foxtrick.loader.background = {};

// listener for request from content script
Foxtrick.loader.background.contentRequestsListener = function(request, sender, sendResponse) {
	try {
		Foxtrick.loader.background.requests[request.req](request, sender, sendResponse);
	}
	catch (e) {
		Foxtrick.log('Foxtrick - background onRequest error:', e);
		Foxtrick.log(request.req);
		sendResponse({ error: 'Foxtrick - background onRequest: ' + e });
	}
};


// background script unload function
Foxtrick.loader.background.browserUnload = function() {
	// remove contentRequestsListener on unload
	Foxtrick.SB.ext.onRequest.removeListener(this.contentRequestsListener);
};


// background script starter load function
Foxtrick.loader.background.browserLoad = function() {
	try {

		Foxtrick.log('Foxtrick.loader.background.browserLoad');

		var currencyJSON, aboutJSON, worldDetailsJSON, htLanguagesJSONText, cssTextCollection;

		var updateResources = function(reInit) {
			// init resources
			Foxtrick.entry.init(reInit);

			// prepare resources for later transmission to content script
			currencyJSON = JSON.stringify(Foxtrick.XMLData.htCurrencyJSON);
			aboutJSON = JSON.stringify(Foxtrick.XMLData.aboutJSON);
			worldDetailsJSON = JSON.stringify(Foxtrick.XMLData.worldDetailsJSON);
			htLanguagesJSONText = {};
			for (var lang in Foxtrick.L10n.htLanguagesJSON) {
				htLanguagesJSONText[lang] = JSON.stringify(Foxtrick.L10n.htLanguagesJSON[lang]);
			}
			cssTextCollection = Foxtrick.util.css.getCssTextCollection();

			Foxtrick.Prefs.deleteValue('preferences.updated');
		};

		updateResources();
		Foxtrick.Prefs.setBool('featureHighlight', false);
		Foxtrick.Prefs.setBool('translationKeys', false);

		// calls module.onLoad() after the extension is loaded
		for (var m in Foxtrick.modules) {
			var module = Foxtrick.modules[m];
			if (typeof module.onLoad === 'function') {
				try {
					module.onLoad(document);
				}
				catch (e) {
					Foxtrick.log('Error caught in module', module.MODULE_NAME, ':', e);
				}
			}
		}

		Foxtrick.SB.ext.onRequest.addListener(this.contentRequestsListener);

		// -- requests functions --
		// here goes the handlers to content requests of requestName
		// format: this.requests.requestName
		// callback will be called with a sole JSON as argument
		// sender not defined well for all browsers
		this.requests = {};

		// called to parse a copy of the settings and data to the content script
		// pageLoad: on HT pages for chrome/safari
		// scriptLoad: once per tab for Fennec
		this.requests.pageLoad = function(request, sender, sendResponse) {
			// access user setting directly here, since getBool uses a copy
			// which needs updating just here
			if (Foxtrick.arch == 'Sandboxed' && localStorage.getItem('preferences.updated')	||
				Foxtrick.platform == 'Android' &&
				Foxtrick.Prefs._prefs_gecko.getBoolPref('preferences.updated')) {

				updateResources(true); // reInit
			}

			var resource = {
				_prefs_chrome_user: Foxtrick.Prefs._prefs_chrome_user,
				_prefs_chrome_default: Foxtrick.Prefs._prefs_chrome_default,

				htLangJSON: htLanguagesJSONText,
				properties_default: Foxtrick.L10n.properties_default,
				properties: Foxtrick.L10n.properties,
				screenshots_default: Foxtrick.L10n.screenshots_default,
				screenshots: Foxtrick.L10n.screenshots,
				plForm: Foxtrick.L10n.plForm,
				plForm_default: Foxtrick.L10n.plForm_default,

				currencyJSON: currencyJSON,
				aboutJSON: aboutJSON,
				worldDetailsJSON: worldDetailsJSON,
				league: Foxtrick.XMLData.League,
				countryToLeague: Foxtrick.XMLData.countryToLeague,
			};

			if (request.req == 'pageLoad') {
				Foxtrick.modules.UI.update(sender.tab);
				resource.cssText = cssTextCollection;
			}

			sendResponse(resource);
		};

		// Fennec tab child processes
		this.requests.tabLoad = this.requests.pageLoad;

		// safari options page
		this.requests.optionsPageLoad = this.requests.pageLoad;
		// ----- end of init part. ------


		// from env.js. dummy for tab register
		this.requests.register = function(request, sender, sendResponse) {}; // jshint ignore:line

		// from prefs-util.js
		this.requests.setValue = function(request) {
			if (Foxtrick.Prefs.getAny(request.key) === request.value)
				return;

			Foxtrick.Prefs.setWithType(request.key, request.value, request.type);

			if (request.key == 'htLanguage')
				Foxtrick.L10n.init();
		};
		this.requests.deleteValue = function(request) {
			Foxtrick.Prefs.deleteValue(request.key);

			if (request.key == 'htLanguage')
				Foxtrick.L10n.init();
		};
		this.requests.clearPrefs = function() {
			try {
				Foxtrick.Prefs.restore();

				if (Foxtrick.platform !== 'Android') {
					updateResources();
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		// from misc.js. getting files, convert text
		this.requests.getCss = function(request, sender, sendResponse) { // jshint ignore:line
			// @param files - an array of files to be loaded into string
			var css = Foxtrick.util.css.getCssFileArrayToString(request.files);
			sendResponse({ cssText: css });
		};

		// TODO
		// this.requests.convertImages = function(request, sender, sendResponse) {
		// 	// @param files - a string for which image urls are converted to data urls
		// 	// updates cssTextCollection if 'ft-module-css' conversion was done
		// 	Foxtrick.util.css.convertImageUrlToData(request.cssText, function(cssText) {
		// 		if (request.type === 'ft-module-css')
		// 			cssTextCollection = cssText;
		//
		// 		sendResponse({ cssText: cssText });
		// 	});
		// };

		this.requests.getDataUrl = function(request, sender, sendResponse) { // jshint ignore:line
			var replaceImage = function(url) {
				var image = new Image();
				image.onload = function() {
					var canvas = document.createElement('canvas');
					canvas.width = image.width;
					canvas.height = image.height;
					var context = canvas.getContext('2d');
					context.drawImage(image, 0, 0);
					var dataUrl = canvas.toDataURL();
					Foxtrick.dataUrlStorage[url] = dataUrl;
					return sendResponse({ url: dataUrl });
				};
				image.onerror = function() {
					return sendResponse({ url: '' });
				};
				image.src = url;
			};

			var dataUrl = Foxtrick.dataUrlStorage[request.url];
			if (!dataUrl)
				replaceImage(request.url);
			else
				sendResponse({ url: dataUrl });
		};
		this.requests.playSound = function(request) {
			// @param url - the URL of new tab to create
			Foxtrick.playSound(request.url, document);
		};

		// from misc.js: tabs
		this.requests.newTab = function(request) {
			// @param url - the URL of new tab to create
			Foxtrick.SB.tabs.create({ url: request.url });
		};
		this.requests.reuseTab = function(request) { // jshint ignore:line
			// @param url - the URL of new tab to create
			// if (Foxtrick.platform == 'Android') {
			// 	// TODO
			// 	// XUL Code:
			// 	for (var i = 0; i < Browser.browsers.length; ++i) {
			// 		if (sender.tab.id == Browser.browsers[i].tid) {
			// 			Browser.selectedTab = Browser.getTabAtIndex(i);
			// 			Browser.browsers[i].loadURI(request.url);
			// 		}
			// 	}
			// }
		};

		// from misc.js
		this.requests.clipboard = function(request, sender, sendResponse) { // jshint ignore:line
			// @param content - content to copy
			// @callback_param status - success status
			try {
				if (Foxtrick.platform == 'Chrome')
					Foxtrick.loader.background.copyToClipBoard(request.content);
				else
					Foxtrick.copyStringToClipboard(request.content);

				sendResponse({ status: true });
			}
			catch (e) {
				sendResponse({ status: false });
			}
		};

		// from notify.js
		this.requests.notify = function(request, sender, sendResponse) {
			Foxtrick.util.notify.create(request.msg, sender, request, sendResponse);
		};

		// from context-menu.js: dummy. request handled in there
		this.requests.updateContextMenu = function() {}; // jshint ignore:line

		// from sessionStore.js
		this.requests.sessionSet = function(request) {
			// @param key - key of session store
			// @param value - value to store
			Foxtrick.sessionSet(request.key, request.value);
		};
		this.requests.sessionGet = function(request, sender, sendResponse) { // jshint ignore:line
			// @param key - key of session store
			sendResponse({ value: Foxtrick.sessionGet(request.key) });
		};
		this.requests.sessionDeleteBranch = function(request) {
			// @param branch - initial part of key(s) of session store to delete
			Foxtrick.sessionDeleteBranch(request.branch);
		};

		// from load.js
		this.requests.fetch = function(request, sender, sendResponse) {
			// @param url - the URL of resource to fetch with window.XMLHttpRequest
			// @param params - params != null makes it and used for a POST request
			// @callback_param data - response text
			// @callback_param status - HTTP status of request

			Foxtrick.fetch(request.url, request.params)
				.then(sendResponse, sendResponse) // use the same callback for both
				.catch(Foxtrick.catch(sender));
		};

		this.requests.load = function(request, sender, sendResponse) {
			// @param url - the URL of resource to load with caching
			// @param params - params != null makes it and used for a POST request
			// @callback_param data - response text
			// @callback_param status - HTTP status of request

			Foxtrick.load(request.url, request.params, request.lifeTime, request.now)
				.then(sendResponse, sendResponse) // use the same callback for both
				.catch(Foxtrick.catch(sender));
		};

		// from localStore.js
		this.requests.localSet = function(request) {
			// @param key - key of local store
			// @param value - value to store
			Foxtrick.localSet(request.key, request.value);
		};
		this.requests.localGet = function(request, sender, sendResponse) { // jshint ignore:line
			// @param key - key of local store
			Foxtrick.localGet(request.key, function(value) {
				sendResponse({ value: value });
			});
		};
		this.requests.localDeleteBranch = function(request) {
			// @param branch - initial part of key(s) of local store to delete
			Foxtrick.localDeleteBranch(request.branch);
		};

		// from misc.js
		this.requests.cookieSet = function(request, sender, sendResponse) { // jshint ignore:line
			// @param where - cookies type: see misc.js - cookies map
			// @param what - value to add to the cookie
			// @callback cookie - the new cookie it set
			Foxtrick._cookieSet(request.where, request.name, request.what, function(response) {
				if (sendResponse)
					sendResponse(response);
			});
		};
		this.requests.cookieGet = function(request, sender, sendResponse) { // jshint ignore:line
			// @param where - cookies type: see misc.js - cookies map
			// @callback cookie - the retrived cookie it set
			Foxtrick._cookieGet(request.where, request.name, function(response) {
				sendResponse(response);
			});
		};

		// from permissions.js
		this.requests.containsPermission =
			function(request, sender, sendResponse) { // jshint ignore:line
			// @param origin - permission origin to check
			// @callback boolean wether permission is set or not
			Foxtrick._containsPermission(request.types, function(response) {
				sendResponse(response);
			});
		};

		// TODO
		// Those 2 don't work when invoked from content scripts
		// this.requests.removePermission = function(request, sender, sendResponse) {
		// 	// @param origin - permission origin to check
		// 	// @callback ???
		// 	Foxtrick._removePermission(request.types, function(response) {
		// 		sendResponse(response);
		// 	});
		// };
		// this.requests.requestPermission = function(request, sender, sendResponse) {
		// 	// @param origin - permission origin to check
		// 	// @callback boolean wether permission was granted
		// 	Foxtrick._requestPermission(request.types, function(response) {
		// 		sendResponse(response);
		// 	});
		// };

		// from log.js
		this.requests.log = function(request) {
			// @param log - text to dump to console (Fennec)
			dump('FT: ' + request.log);
			Foxtrick.addToDebugLogStorage(request.log);
		};
		this.requests.addDebugLog = function(request) {
			// @param log - text to add to debug log storage
			Foxtrick.addToDebugLogStorage(request.log);
		};
		this.requests.getDebugLog = function(request, sender, sendResponse) { // jshint ignore:line
			// @callback_param log - contains the debug log storage
			sendResponse({ log: Foxtrick.debugLogStorage });
		};

		// from mobile-enhancements.js
		this.requests.updateViewportSize = function() {
			Browser.updateViewportSize();
		};

	}
	catch (e) {
		Foxtrick.log(e);
	}
};


// for clipboard
Foxtrick.loader.background.copyToClipBoard = function(content) {
	var clipboardStore = document.getElementById('clipboard-store');
	clipboardStore.value = content;
	clipboardStore.select();
	document.execCommand('Copy');
};


// this is the background script entry point for sandboxed arch
if (Foxtrick.arch == 'Sandboxed')
	Foxtrick.loader.background.browserLoad();
