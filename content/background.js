'use strict';
/*
 * background.js
 * FoxTrick background loader for sandboxed arch and fennec
 * executed on extension load (on activate, reload and browser start)
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.loader)
	Foxtrick.loader = {};
if (!Foxtrick.loader.background)
	Foxtrick.loader.background = {};


// listener for request from content script
Foxtrick.loader.background.contentRequestsListener = function(request, sender, sendResponse) {
	try {
		Foxtrick.loader.background.requests[request.req](request, sender, sendResponse);
	}
	catch (e) {
		Foxtrick.log('Foxtrick - background onRequest error: ', e);
		Foxtrick.log(request.req);
		sendResponse({ error: 'Foxtrick - background onRequest: ' + e });
	}
};


// background script unload function
Foxtrick.loader.background.browserUnload = function() {
	// remove contentRequestsListener on unload
	Foxtrick.SB.ext.onRequest.removeListener(Foxtrick.loader.background.contentRequestsListener);
};


// background script starter load function
Foxtrick.loader.background.browserLoad = function() {
	try {

		Foxtrick.log('Foxtrick.loader.background.browserLoad');

		var currencyJSON, aboutJSON, worldDetailsJSON, htLanguagesJSONText, cssTextCollection;

		var updateResources = function(reinit) {
			// init resources
			Foxtrick.entry.init(reinit);

			// prepare resources for later transmission to content script
			currencyJSON = JSON.stringify(Foxtrick.XMLData.htCurrencyJSON);
			aboutJSON = JSON.stringify(Foxtrick.XMLData.aboutJSON);
			worldDetailsJSON = JSON.stringify(Foxtrick.XMLData.worldDetailsJSON);
			htLanguagesJSONText = {};
			var i;
			for (i in Foxtrick.L10n.htLanguagesJSON) {
				htLanguagesJSONText[i] = JSON.stringify(Foxtrick.L10n.htLanguagesJSON[i]);
			}
			cssTextCollection = Foxtrick.util.css.getCssTextCollection();

			Foxtrick.Prefs.deleteValue('preferences.updated');
		};

		updateResources();
		Foxtrick.Prefs.setBool('featureHighlight', false);
		Foxtrick.Prefs.setBool('translationKeys', false);

		// calls module.onLoad() after the extension is loaded
		var i;
		for (i in Foxtrick.modules) {
			var module = Foxtrick.modules[i];
			if (typeof(module.onLoad) === 'function') {
				try {
					module.onLoad(document);
				}
				catch (e) {
					Foxtrick.log('Error caught in module ', module.MODULE_NAME, ':', e);
				}
			}
		}

		Foxtrick.SB.ext.onRequest.addListener(Foxtrick.loader.background.contentRequestsListener);

		// -- requests functions --
		// here goes the handlers to content requests of requestName
		// format: Foxtrick.loader.background.requests.requestName
		// callback will be called with a sole JSON as argument
		// sender not defined well for all browsers
		Foxtrick.loader.background.requests = {};

		// called to parse a copy of the settings and data to the content script
		// pageLoad: on HT pages for chrome/safari
		// scriptLoad: once per tab for fennec
		Foxtrick.loader.background.requests.pageLoad = function(request, sender, sendResponse) {
			// access user setting directly here, since getBool uses a copy
			// which needs updating just here
			if (Foxtrick.arch == 'Sandboxed' && localStorage.getItem('preferences.updated')	||
				Foxtrick.platform == 'Android' &&
				Foxtrick.Prefs._prefs_gecko.getBoolPref('preferences.updated')) {
					updateResources(true); // reinit
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
		// fennecs tab child processes
		Foxtrick.loader.background.requests.tabLoad = Foxtrick.loader.background.requests.pageLoad;

		// ----- end of init part. ------


		// from env.js. dummy for tab register
		Foxtrick.loader.background.requests.register = function(request, sender, sendResponse) {};


		// from prefs.js
		Foxtrick.loader.background.requests.setValue = function(request, sender, sendResponse) {
			if (Foxtrick.Prefs.get(request.key) == request.value)
				return;
			Foxtrick.Prefs.setValue(request.key, request.value, request.type);
			if (request.key == 'htLanguage')
				Foxtrick.L10n.init();
		};
		Foxtrick.loader.background.requests.deleteValue = function(request, sender, sendResponse) {
			Foxtrick.Prefs.deleteValue(request.key);
			if (request.key == 'htLanguage')
				Foxtrick.L10n.init();
		};
		Foxtrick.loader.background.requests.clearPrefs = function(request, sender, sendResponse) {
			try {
				if (Foxtrick.platform == 'Android') {
					Foxtrick.Prefs.cleanupBranch();
				}
				else {
					var i;
					for (i in localStorage) {
						if (i.indexOf('module.') === 0 && Foxtrick.Prefs.isPrefSetting(i)) {
							localStorage.removeItem(i);
						}
					}
					updateResources();
				}
			} catch (e) { Foxtrick.log(e); }
		};

		// from misc.js. getting files, convert text
		Foxtrick.loader.background.requests.getCss = function(request, sender, sendResponse) {
			// @param files - an array of files to be loaded into string
			sendResponse({ cssText: Foxtrick.util.css.getCssFileArrayToString(request.files) });
		};
		// Foxtrick.loader.background.requests.convertImages =
		// function(request, sender, sendResponse) {
		// 	// @param files - a string for which image urls are converted to data urls
		// 	// updates cssTextCollection if 'ft-module-css' conversion was done
		// 	Foxtrick.util.css.convertImageUrlToData(request.cssText,
		// 	  function(cssText) {
		// 		if (request.type == 'ft-module-css')
		// 			cssTextCollection = cssText;
		// 		sendResponse({ cssText: cssText });
		// 	});
		// };
		Foxtrick.loader.background.requests.getXml = function(request, sender, sendResponse) {
			// @param url - the URL of resource to load with window.XMLHttpRequest
			// @param params - params != null makes it and used for a POST request
			// @callback_param data - response text
			// @callback_param status - HTTP status of request

			var callback = function(responseText, status) {
				sendResponse({ data: responseText, status: status });
			};
			Foxtrick.util.load.async(request.url, callback, request.params);
		};
		Foxtrick.loader.background.requests.getDataUrl = function(request, sender, sendResponse) {
			// @param branch - initial part of key(s) of session store to delete
			var replaceImage = function(url) {
				var image = new Image;
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
				return image.src = url;
			};
			if (!Foxtrick.dataUrlStorage[request.url])
				replaceImage(request.url);
			else
				sendResponse({ url: Foxtrick.dataUrlStorage[request.url] });
		};
		Foxtrick.loader.background.requests.playSound = function(request, sender, sendResponse) {
			// @param url - the URL of new tab to create
			Foxtrick.playSound(request.url, document);
		};

		// from misc.js: tabs
		Foxtrick.loader.background.requests.newTab = function(request, sender, sendResponse) {
			// @param url - the URL of new tab to create
			Foxtrick.SB.tabs.create({ url: request.url });
		};
		Foxtrick.loader.background.requests.reuseTab = function(request, sender, sendResponse) {
			// @param url - the URL of new tab to create
			if (Foxtrick.platform == 'Android') {
				// TODO
				// XUL Code:
				//for (var i = 0; i < Browser.browsers.length; ++i) {
				//	if (sender.tab.id == Browser.browsers[i].tid) {
				//		Browser.selectedTab = Browser.getTabAtIndex(i);
				//		Browser.browsers[i].loadURI(request.url);
				//	}
				//}
			}
		};

		// from misc.js
		Foxtrick.loader.background.requests.clipboard = function(request, sender, sendResponse) {
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
		Foxtrick.loader.background.requests.notify = function(request, sender, sendResponse) {
			Foxtrick.util.notify.create(request, sender, sendResponse);
		};

		// from context-menu.js: dummy. request handled in there
		Foxtrick.loader.background.requests.updateContextMenu =
			function(request, sender, sendResponse) {};

		// from sessionStore.js
		Foxtrick.loader.background.requests.sessionSet = function(request, sender, sendResponse) {
			// @param key - key of session store
			// @param value - value to store
			Foxtrick.sessionSet(request.key, request.value);
		};
		Foxtrick.loader.background.requests.sessionGet = function(request, sender, sendResponse) {
			// @param key - key of session store
			sendResponse({ value: Foxtrick.sessionGet(request.key) });
		};
		Foxtrick.loader.background.requests.sessionDeleteBranch =
		  function(request, sender, sendResponse) {
			// @param branch - initial part of key(s) of session store to delete
			Foxtrick.sessionDeleteBranch(request.branch);
		};

		// from localStore.js
		Foxtrick.loader.background.requests.localSet = function(request, sender, sendResponse) {
			// @param key - key of local store
			// @param value - value to store
			Foxtrick.localSet(request.key, request.value);
		};
		Foxtrick.loader.background.requests.localGet = function(request, sender, sendResponse) {
			// @param key - key of local store
			Foxtrick.localGet(request.key, function(value) {
				sendResponse({ value: value });
			});
		};
		Foxtrick.loader.background.requests.localDeleteBranch =
		  function(request, sender, sendResponse) {
			// @param branch - initial part of key(s) of local store to delete
			Foxtrick.localDeleteBranch(request.branch);
		};

		// from misc.js
		Foxtrick.loader.background.requests.cookieSet = function(request, sender, sendResponse) {
			// @param where - cookies type: see misc.js - cookies map
			// @param what - value to add to the cookie
			// @callback cookie - the new cookie it set
			Foxtrick._cookieSet(request.where, request.name, request.what,
			  function(response) {
				if (sendResponse)
					sendResponse(response);
			});
		};
		Foxtrick.loader.background.requests.cookieGet = function(request, sender, sendResponse) {
			// @param where - cookies type: see misc.js - cookies map
			// @callback cookie - the retrived cookie it set
			Foxtrick._cookieGet(request.where, request.name,
			  function(response) {
				sendResponse(response);
			});
		};

		//from permissions.js
		Foxtrick.loader.background.requests.containsPermission = function(request, sender, sendResponse) {
			// @param origin - permission origin to check
			// @callback boolean wether permission is set or not
			Foxtrick._containsPermission(request.types,
			  function(response) {
				sendResponse(response);
			});
		};
		/**
		 * Those 2 don't work when invoked content scripts
		 */
		// Foxtrick.loader.background.requests.removePermission = function(request, sender, sendResponse) {
		// 	// @param origin - permission origin to check
		// 	// @callback ???
		// 	Foxtrick._removePermission(request.types,
		// 	  function(response) {
		// 		sendResponse(response);
		// 	});
		// };
		// Foxtrick.loader.background.requests.requestPermission = function(request, sender, sendResponse) {
		// 	// @param origin - permission origin to check
		// 	// @callback boolean wether permission was granted
		// 	Foxtrick._requestPermission(request.types,
		// 	  function(response) {
		// 		sendResponse(response);
		// 	});
		// };

		// from log.js
		Foxtrick.loader.background.requests.log = function(request, sender, sendResponse) {
			// @param log - text to dump to console (fennec)
			dump('FT: ' + request.log);
			Foxtrick.addToDebugLogStorage(request.log);
		};
		Foxtrick.loader.background.requests.addDebugLog = function(request, sender, sendResponse) {
			// @param log - text to add to debug log storage
			Foxtrick.addToDebugLogStorage(request.log);
		};
		Foxtrick.loader.background.requests.getDebugLog = function(request, sender, sendResponse) {
			// @callback_param log - contains the debug log storage
			sendResponse({ log: Foxtrick.debugLogStorage });
		};

		// from mobile-enhancements.js
		Foxtrick.loader.background.requests.updateViewportSize =
		  function(request, sender, sendResponse) {
			Browser.updateViewportSize();
		};

	} catch (e) {
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
