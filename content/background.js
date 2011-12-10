"use strict";
/*
 * background.js
 * FoxTrick background loader for sandboxed arch
 */
 
if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.loader)
	Foxtrick.loader = {};
Foxtrick.loader.chrome = {};

	
// invoked after the browser chrome is loaded
Foxtrick.loader.chrome.browserLoad = function() {
  try {
	Foxtrick.log('Foxtrick.loader.chrome.browserLoad');

	var currency, about, worldDetails, htLanguagesText, cssTextCollection;
	
	var updateResources = function() {
		// init resources
		Foxtrick.entry.init();

		// prepare resources for later transmission to content script
		var serializer = new window.XMLSerializer(), i;
		
		currency = serializer.serializeToString(Foxtrick.XMLData.htCurrencyXml);
		about = serializer.serializeToString(Foxtrick.XMLData.aboutXML);
		worldDetails = serializer.serializeToString(Foxtrick.XMLData.worldDetailsXml);
		htLanguagesText = {};
		for (i in Foxtrickl10n.htLanguagesXml) {
			htLanguagesText[i] = serializer.serializeToString(Foxtrickl10n.htLanguagesXml[i]);
		}
		cssTextCollection = Foxtrick.getCssTextCollection();

		FoxtrickPrefs.deleteValue("preferences.updated");
	};

	updateResources();

	// calls module.onLoad() after the browser window is loaded
	var i;
	for (i in Foxtrick.modules) {
		var module = Foxtrick.modules[i];
		if (typeof(module.onLoad) === "function") {
			try {
				module.onLoad(document);
			}
			catch (e) {
				Foxtrick.log("Error caught in module ", module.MODULE_NAME, ":", e);
			}
		}
	}

	// use with sandboxed.extension.sendRequest({req : "nameOfResponseFunction", parameters...}, callback)
	// calls bellow response function by name 'request.req'
	// callback will be called with a sole JSON as argument
	sandboxed.extension.onRequest.addListener( function(request, sender, sendResponse) {
		try {
			// just for fun get rid of non-alphanums to make all content code useless 
			var funcString = request.req.replace(/\W+/g,"") + "(request, sender, sendResponse)";
			// call requested function with parameters
			eval( funcString );
		}
		catch (e) {
			Foxtrick.log('Foxtrick - background onRequest: ', e)
			Foxtrick.log(request)
			sendResponse({ error : 'Foxtrick - background onRequest: ' + e });
		}
	});


	// called to parse a copy of the settings and data to the content script
	//   pageLoad : on HT pages for chrome/safari/opera
	//   scriptLoad : once per tab/browser(?) for fennec
	//   optionsPageLoad : on options page for opera 
	//
	var pageLoad = function(request, sender, sendResponse) {
		// access user setting directly here, since getBool uses a copy which needs updating just here
		if ( (Foxtrick.arch == "Sandboxed" && localStorage.getItem("preferences.updated"))
			|| (Foxtrick.platform == "Fennec" && FoxtrickPrefs._prefs_gecko.getBoolPref("preferences.updated")) ) {
				updateResources();
		}

		var resource = {
			_prefs_chrome_user : FoxtrickPrefs._prefs_chrome_user,
			_prefs_chrome_default : FoxtrickPrefs._prefs_chrome_default,

			htLang : htLanguagesText,
			properties_default : Foxtrickl10n.properties_default,
			properties : Foxtrickl10n.properties,
			screenshots_default : Foxtrickl10n.screenshots_default,
			screenshots : Foxtrickl10n.screenshots,

			currency : currency,
			about : about,
			worldDetails : worldDetails,
			league : Foxtrick.XMLData.League,
			countryToLeague : Foxtrick.XMLData.countryToLeague,
		
			sessionStore : Foxtrick.sessionStore,
		};
	
		if (request.req == "pageLoad") {
			FoxtrickUI.update(sender.tab);
			resource.cssText = cssTextCollection;
		}
		
		sendResponse ( resource );
	};
	// fennecs tab child processes
	var tabLoad = pageLoad;

	// operas options page
	var optionsPageLoad = pageLoad;
	// ----- end of init part. ------

	// from env.js. dummy for tab register
	var register = function(request, sender, sendResponse) {};


	// from prefs.js
	var setValue = function(request, sender, sendResponse) {
		if (FoxtrickPrefs.get(request.key)==request.value) 
			return;
		FoxtrickPrefs.setValue(request.key, request.value, request.type);
		if ( request.key == 'htLanguage' )
			Foxtrickl10n.init();
	};
	var deleteValue = function(request, sender, sendResponse) {
		FoxtrickPrefs.deleteValue(request.key);
		if ( request.key == 'htLanguage' )
			Foxtrickl10n.init();
	};
	var clearPrefs = function(request, sender, sendResponse) {
		try {
			if (Foxtrick.platform == "Fennec") {
				FoxtrickPrefs.cleanupBranch();
			}
			else {
				for (var i in localStorage) {
					if (i.indexOf('module.')===0 && FoxtrickPrefs.isPrefSetting(i)) {
						localStorage.removeItem(i);
					}
				}
				updateResources();
			}
		} catch(e) {Foxtrick.log(e)}
	};

	// from misc.js. getting files, convert text
	var getCss = function(request, sender, sendResponse) {
		// @param files - an array of files to be loaded into string
		sendResponse({ cssText : Foxtrick.getCssFileArrayToString(request.files) });
	};
	var convertImages = function(request, sender, sendResponse) {
		// @param files - a string for which image urls are converted to data urls
		// updates cssTextCollection if "ft-module-css" conversion was done
		Foxtrick.convertImageUrlToData(request.cssText,
				function(cssText){
					if (request.type=="ft-module-css")
						cssTextCollection = cssText;
					sendResponse({cssText:cssText});
		});
	};
	var getXml = function(request, sender, sendResponse) {
		// @param url - the URL of resource to load with window.XMLHttpRequest
		// @callback_param data - response text
		// @callback_param status - HTTP status of request
		// synchronous, since messaging is async already
		var callback = function(responseText, status){
			sendResponse({data : responseText, status : status});
		};
		Foxtrick.load(request.url, callback);
	};
	var getDataUrl = function(request, sender, sendResponse) {
		// @param branch - initial part of key(s) of session store to delete
		var replaceImage = function (url) {
			var image = new Image;
			image.onload = function() {
				var canvas = document.createElement("canvas");
				canvas.width = image.width;
				canvas.height = image.height;
				var context = canvas.getContext('2d');
				context.drawImage(image, 0, 0);
				var dataUrl = canvas.toDataURL()
				Foxtrick.dataUrlStorage[url] = dataUrl;
				return sendResponse({ url: dataUrl });
			};
			image.onerror = function() {
				return sendResponse({ url:'' });
			};
			return image.src = url;
		};
		if (!Foxtrick.dataUrlStorage[request.url]) replaceImage(request.url);
		else sendResponse({ url: Foxtrick.dataUrlStorage[request.url] });
	};

	// from misc.js: tabs
	var newTab = function(request, sender, sendResponse) {
		// @param url - the URL of new tab to create
		sandboxed.tabs.create({url : request.url});
	};
	var reuseTab = function(request, sender, sendResponse) {
		// @param url - the URL of new tab to create
		if (Foxtrick.platform == "Fennec") {
			for (var i = 0; i<Browser.browsers.length; ++i) {
				if (sender.tab.id == Browser.browsers[i].tid) {
					Browser.selectedTab = Browser.getTabAtIndex(i);
					Browser.browsers[i].loadURI(request.url);
				}
			}
		}
	};

	// from misc.js
	var clipboard = function(request, sender, sendResponse) {
		// @param content - content to copy
		// @callback_param status - success status
		try {
			if (Foxtrick.platform == "Chrome")
				Foxtrick.loader.chrome.copyToClipBoard(request.content);
			else
				Foxtrick.copyStringToClipboard(request.content)
			sendResponse({status : true});
		}
		catch (e) {
			sendResponse({status : false});
		}
	};

	// from notify.js
	var notify = function(request, sender, sendResponse) {
		// @param msg - message to notify the user
		if (window.webkitNotifications) {
			var notification = webkitNotifications.createNotification(
				"resources/img/hattrick-logo.png", // logo location
				"Hattrick", // notification title
				request.msg // notification body text
			);
			notification.onclick = function() {
				if ( Foxtrick.platform == "Chrome" ) {
					// goto msg.url in sender tab
					chrome.tabs.update( sender.tab.id, { url:request.url, selected:true });
					// focus last window. needs permissions: tabs. only nightly as for now
					try { 
						chrome.windows.update( sender.tab.windowId, { focused:true });
					} catch(e){}
				}
				else
					sandboxed.tabs.create({url: request.url});
				notification.cancel();
			};
			// Then show the notification.
			notification.show();
			// close after 10 sec
			window.setTimeout(function() { notification.cancel(); }, 10000);
		}
	};

	// from context-menu.js: dummy. request handled in there
	var updateContextMenu = function(request, sender, sendResponse) {
	};

	// from sessionStore.js
	var sessionSet = function(request, sender, sendResponse) {
		// @param key - key of session store
		// @param value - value to store
		Foxtrick.sessionSet(request.key, request.value);
		// inform other tabs to update their copies
		sandboxed.extension.broadcastMessage( {req: 'sessionSet', senderid: sender.tab.id, key: request.key, value: request.value });
	};
	var sessionDeleteBranch = function(request, sender, sendResponse) {
		// @param branch - initial part of key(s) of session store to delete
		Foxtrick.sessionDeleteBranch(request.branch);
		// inform other tabs to update their copies
		sandboxed.extension.broadcastMessage( {req: 'sessionDeleteBranch', senderid: sender.tab.id, branch: request.branch });
	};

	// from log.js
	var log = function(request, sender, sendResponse) {
		// @param log - text to dump to console (fennec)
		dump("FT: "+request.log);
	};
	var addDebugLog = function(request, sender, sendResponse) {
		// @param log - text to add to debug log storage
		Foxtrick.addToDebugLogStorage(request.log);
	};
	var getDebugLog = function(request, sender, sendResponse) {
		// @callback_param log - contains the debug log storage
		sendResponse({ log : Foxtrick.debugLogStorage });
		Foxtrick.debugLogStorage = '';
	};

	// from mobile-enhancements.js
	var updateViewportSize = function(request, sender, sendResponse) {
		Browser.updateViewportSize();
	};
	
  } catch(e) { Foxtrick.log(e); }
};


// for clipboard
Foxtrick.loader.chrome.copyToClipBoard = function(content) {
	var clipboardStore = document.getElementById("clipboard-store");
	clipboardStore.value = content;
	clipboardStore.select();
	document.execCommand("Copy");
};


Foxtrick.loader.chrome.fennecScriptInjection= function(event) {
		// run only once
		removeEventListener("UIReady", Foxtrick.loader.chrome.fennecScriptInjection, false);

		// inject scripts
		messageManager.loadFrameScript("chrome://foxtrick/content/env.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/prefs.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/l10n.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/xml-load.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/pages.js", true);

		messageManager.loadFrameScript("chrome://foxtrick/content/util/module.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/api.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/array.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/copy-button.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/currency.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/dom.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/ht-ml.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/id.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/inject.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/layout.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/links-box.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/log.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/match-view.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/misc.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/note.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/notify.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/session-store.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/string.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/time.js", true);

		messageManager.loadFrameScript("chrome://foxtrick/content/lib/jquery.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/lib/oauth.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/lib/sha1.js", true);

		messageManager.loadFrameScript("chrome://foxtrick/content/pages/all.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/pages/country.js" , true);
		messageManager.loadFrameScript("chrome://foxtrick/content/pages/players.js" , true);
		messageManager.loadFrameScript("chrome://foxtrick/content/pages/player.js" , true);
		messageManager.loadFrameScript("chrome://foxtrick/content/pages/youth-player.js" , true);
		messageManager.loadFrameScript("chrome://foxtrick/content/pages/transfer-search-results.js" , true);
		messageManager.loadFrameScript("chrome://foxtrick/content/pages/match.js" , true);

		messageManager.loadFrameScript("chrome://foxtrick/content/redirections.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/read-ht-prefs.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum-stage.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/core.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/add-class.js", true);

		// load categorized modules 
		var files = Foxtrick.loadSync(Foxtrick.InternalPath + "modules.json");
		files = JSON.parse(files);
		Foxtrick.map(function(f) {
			messageManager.loadFrameScript(Foxtrick.InternalPath + f, true);
			return ;
		}, files);
		
		messageManager.loadFrameScript("chrome://foxtrick/content/entry.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/ui.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/loader-gecko.js", true);
};

if (Foxtrick.platform == "Fennec") {
	addEventListener("UIReady", Foxtrick.loader.chrome.fennecScriptInjection, false);
};

// run it
if (Foxtrick.chromeContext() == "background")
	Foxtrick.loader.chrome.browserLoad();

