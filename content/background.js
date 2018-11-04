/*
 * background.js
 *
 * Foxtrick background loader for Sandboxed arch and Fennec
 * executed on extension load (on activate, reload and browser start)
 *
 * @author ryanli, convincedd, LA-MJ
 */

'use strict';

/* global Browser */

/* eslint-disable */
if (!Foxtrick)
	var Foxtrick = {};
/* eslint-enable */

if (!Foxtrick.loader)
	Foxtrick.loader = {};

Foxtrick.loader.background = {};

// listener for request from content script
Foxtrick.loader.background.contentRequestsListener = function(request, sender, sendResponse) {
	try {
		let reqHandlers = Foxtrick.loader.background.requests;
		let handler = reqHandlers[request.req];

		return handler.call(reqHandlers, request, sender, sendResponse);
	}
	catch (e) {
		Foxtrick.log('Foxtrick - background onRequest error:', request.req, e);
		sendResponse({ error: 'Foxtrick - background onRequest: ' + e });
	}
	return false;
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

		let updateResources = function(reInit) {
			// init resources
			Foxtrick.entry.init(reInit);

			// prepare resources for later transmission to content script
			currencyJSON = JSON.stringify(Foxtrick.XMLData.htCurrencyJSON);
			aboutJSON = JSON.stringify(Foxtrick.XMLData.aboutJSON);
			worldDetailsJSON = JSON.stringify(Foxtrick.XMLData.worldDetailsJSON);

			htLanguagesJSONText = {};
			for (let [lang, obj] of Object.entries(Foxtrick.L10n.htLanguagesJSON))
				htLanguagesJSONText[lang] = JSON.stringify(obj);

			cssTextCollection = Foxtrick.util.css.getCssTextCollection();

			Foxtrick.Prefs.deleteValue('preferences.updated');
		};

		updateResources();
		Foxtrick.Prefs.setBool('featureHighlight', false);
		Foxtrick.Prefs.setBool('translationKeys', false);

		// calls module.onLoad() after the extension is loaded
		for (let module of Object.values(Foxtrick.modules)) {
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

			let resource = {
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
		this.requests.register = function() {};

		// from prefs-util.js
		this.requests.setValue = function({ key, value, type }) {
			if (Foxtrick.Prefs.getAny(key) === value)
				return;

			Foxtrick.Prefs.setWithType(key, value, type);

			if (key == 'htLanguage')
				Foxtrick.L10n.init();
		};
		this.requests.deleteValue = function({ key }) {
			Foxtrick.Prefs.deleteValue(key);

			if (key == 'htLanguage')
				Foxtrick.L10n.init();
		};
		this.requests.clearPrefs = function(request, sender, sendResponse) {
			try {
				Foxtrick.Prefs.restore();

				if (Foxtrick.platform !== 'Android') {
					updateResources();
				}
				sendResponse();
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		// from misc.js. getting files, convert text
		this.requests.getCss = function({ files }, sender, sendResponse) {
			// @param files - an array of files to be loaded into string
			let cssText = Foxtrick.util.css.getCssFileArrayToString(files);
			sendResponse({ cssText });
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
		// 	return true; // async
		// };

		this.requests.getDataUrl = function({ url }, sender, sendResponse) {
			let replaceImage = function(url) {
				let image = new Image();
				image.onload = function() {
					let canvas = document.createElement('canvas');
					canvas.width = image.width;
					canvas.height = image.height;
					let context = canvas.getContext('2d');
					context.drawImage(image, 0, 0);
					let dataUrl = canvas.toDataURL();
					Foxtrick.dataUrlStorage[url] = dataUrl;
					return sendResponse({ url: dataUrl });
				};
				image.onerror = function() {
					return sendResponse({ url: '' });
				};
				image.src = url;
			};

			let dataUrl = Foxtrick.dataUrlStorage[url];
			if (dataUrl)
				sendResponse({ url: dataUrl });
			else
				replaceImage(url);

			return true; // async
		};

		this.requests.playSound = function({ url }) {
			// @param url - the URL of new tab to create
			Foxtrick.playSound(url);
		};

		// from misc.js: tabs
		this.requests.newTab = function({ url }) {
			// @param url - the URL of new tab to create
			Foxtrick.SB.tabs.create({ url });
		};
		this.requests.reuseTab = function({ url }) { // eslint-disable-line
			// @param url - the URL of new tab to create
			// if (Foxtrick.platform == 'Android') {
			// 	// TODO
			// 	// XUL Code:
			// 	for (let [idx, browser] of Browser.browsers.entries()) {
			// 		if (sender.tab.id == browser.tid) {
			// 			Browser.selectedTab = Browser.getTabAtIndex(idx);
			// 			browser.loadURI(url);
			// 		}
			// 	}
			// }
		};

		// from notify.js
		this.requests.notify = function(request, sender, sendResponse) {
			Foxtrick.util.notify.create(request.msg, sender, request)
				.then(sendResponse, err => sendResponse(Foxtrick.jsonError(err)))
				.catch(Foxtrick.catch(sender));

			return true; // async
		};

		// from context-menu.js: dummy. request handled in there
		this.requests.updateContextMenu = function() {};

		// from load.js
		this.requests.fetch = function({ url, params }, sender, sendResponse) {
			// @param url - the URL of resource to fetch with window.XMLHttpRequest
			// @param params - params != null makes it and used for a POST request
			// @callback_param data - response text
			// @callback_param status - HTTP status of request

			Foxtrick.fetch(url, params)
				.then(sendResponse, sendResponse) // use the same callback for both
				.catch(Foxtrick.catch(sender));

			return true; // async
		};

		this.requests.load = function(request, sender, sendResponse) {
			// @param url - the URL of resource to load with caching
			// @param params - params != null makes it and used for a POST request
			// @callback_param data - response text
			// @callback_param status - HTTP status of request
			let { url, params, lifeTime, now } = request;
			Foxtrick.load(url, params, lifeTime, now)
				.then(sendResponse, sendResponse) // use the same callback for both
				.catch(Foxtrick.catch(sender));

			return true; // async
		};

		// from localStore.js
		this.requests.storageGet = function({ key }, sender, sendResponse) {
			Foxtrick.storage.get(key) // never rejects
				.then(sendResponse)
				.catch(Foxtrick.catch(sender));

			return true; // async
		};
		this.requests.storageSet = function({ key, value }, sender, sendResponse) {
			Foxtrick.storage.set(key, value)
				.then(sendResponse, err => sendResponse(Foxtrick.jsonError(err)))
				.catch(Foxtrick.catch(sender));

			return true; // async
		};
		this.requests.storageDeleteBranch = function({ branch }, sender, sendResponse) {
			Foxtrick.storage.deleteBranch(branch)
				.then(sendResponse, err => sendResponse(Foxtrick.jsonError(err)))
				.catch(Foxtrick.catch(sender));

			return true; // async
		};

		// from session-store.js
		this.requests.sessionGet = function({ key }, sender, sendResponse) {
			Foxtrick.session.get(key) // never rejects
				.then(sendResponse)
				.catch(Foxtrick.catch(sender));

			return true; // async
		};
		this.requests.sessionSet = function({ key, value }, sender, sendResponse) {
			Foxtrick.session.set(key, value)
				.then(sendResponse, err => sendResponse(Foxtrick.jsonError(err)))
				.catch(Foxtrick.catch(sender));

			return true; // async
		};
		this.requests.sessionDeleteBranch = function({ branch }, sender, sendResponse) {
			Foxtrick.session.deleteBranch(branch)
				.then(sendResponse, err => sendResponse(Foxtrick.jsonError(err)))
				.catch(Foxtrick.catch(sender));

			return true; // async
		};

		// from load.js
		this.requests.cacheClear = () => Foxtrick.cache.clear();

		// from misc.js
		this.requests.cookiesGet = function({ key, name }, sender, sendResponse) {
			Foxtrick.cookies.get(key, name) // never rejects
				.then(sendResponse)
				.catch(Foxtrick.catch(sender));

			return true; // async
		};
		this.requests.cookiesSet = function({ key, value, name }, sender, sendResponse) {
			Foxtrick.cookies.set(key, value, name) // never rejects
				.then(sendResponse)
				.catch(Foxtrick.catch(sender));

			return true; // async
		};

		// from permissions.js
		this.requests.containsPermission = ({ types }, sender, sendResponse) => {
			// @param origin - permission origin to check
			// @callback boolean wether permission is set or not
			Foxtrick.containsPermission(types, sendResponse);
			return true; // async
		};

		// TODO
		// Those 2 don't work when invoked from content scripts
		// this.requests.removePermission = function(request, sender, sendResponse) {
		// 	// @param origin - permission origin to check
		// 	// @callback ???
		// 	Foxtrick.removePermission(request.types, function(response) {
		// 		sendResponse(response);
		// 	});
		// return true; // async
		// };
		// this.requests.requestPermission = function(request, sender, sendResponse) {
		// 	// @param origin - permission origin to check
		// 	// @callback boolean wether permission was granted
		// 	Foxtrick.requestPermission(request.types, function(response) {
		// 		sendResponse(response);
		// 	});
		// return true; // async
		// };

		// from log.js
		this.requests.log = function({ log }) {
			// @param log - text to dump to console (Fennec)
			window.dump(`FT: ${log}`);
			Foxtrick.addToDebugLogStorage(log);
		};
		this.requests.addDebugLog = function({ log }) {
			// @param log - text to add to debug log storage
			Foxtrick.addToDebugLogStorage(log);
		};
		this.requests.getDebugLog = function(request, sender, sendResponse) {
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

// this is the background script entry point for sandboxed arch
if (Foxtrick.arch == 'Sandboxed')
	Foxtrick.loader.background.browserLoad();
