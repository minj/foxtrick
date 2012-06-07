"use strict";
/*
 * background.js
 * FoxTrick background loader for sandboxed arch and fennec
 * executed on extension load (on activate, reload and browser start)
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
		var serializer = new window.XMLSerializer();
		
		currency = serializer.serializeToString(Foxtrick.XMLData.htCurrencyXml);
		about = serializer.serializeToString(Foxtrick.XMLData.aboutXML);
		worldDetails = serializer.serializeToString(Foxtrick.XMLData.worldDetailsXml);
		htLanguagesText = {};
		for (var i in Foxtrickl10n.htLanguagesXml) {
			htLanguagesText[i] = serializer.serializeToString(Foxtrickl10n.htLanguagesXml[i]);
		}
		cssTextCollection = Foxtrick.getCssTextCollection();

		FoxtrickPrefs.deleteValue("preferences.updated");
	};

	updateResources();
	FoxtrickPrefs.setBool("featureHighlight", false);
	FoxtrickPrefs.setBool("translationKeys", false);

	// calls module.onLoad() after the extension is loaded
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
	// calls below response function by name 'request.req'
	// callback will be called with a sole JSON as argument
	sandboxed.extension.onRequest.addListener( function(request, sender, sendResponse) {
		try {
			Foxtrick.loader.chrome.background[request.req](request, sender, sendResponse);
		}
		catch (e) {
			Foxtrick.log('Foxtrick - background onRequest: ', e);
			Foxtrick.log(request);
			sendResponse({ error : 'Foxtrick - background onRequest: ' + e });
		}
	});


	// -- background functions --
	Foxtrick.loader.chrome.background = {};

	
	// called to parse a copy of the settings and data to the content script
	//   pageLoad : on HT pages for chrome/safari/opera
	//   scriptLoad : once per tab for fennec
	//   optionsPageLoad : on options page for opera 
	//
	Foxtrick.loader.chrome.background.pageLoad = function(request, sender, sendResponse) {
		// access user setting directly here, since getBool uses a copy which needs updating just here
		if ( (Foxtrick.arch == "Sandboxed" && localStorage.getItem("preferences.updated"))
			|| ((Foxtrick.platform == "Mobile" || Foxtrick.platform == "Android") && FoxtrickPrefs._prefs_gecko.getBoolPref("preferences.updated")) ) {
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
			plForm : Foxtrickl10n.plForm,
			plForm_default : Foxtrickl10n.plForm_default,

			currency : currency,
			about : about,
			worldDetails : worldDetails,
			league : Foxtrick.XMLData.League,
			countryToLeague : Foxtrick.XMLData.countryToLeague,
		};
	
		if (request.req == "pageLoad") {
			Foxtrick.modules.UI.update(sender.tab);
			resource.cssText = cssTextCollection;
		}
		
		sendResponse ( resource );
	};
	// fennecs tab child processes
	Foxtrick.loader.chrome.background.tabLoad = Foxtrick.loader.chrome.background.pageLoad;

	// operas options page
	Foxtrick.loader.chrome.background.optionsPageLoad = Foxtrick.loader.chrome.background.pageLoad;
	// ----- end of init part. ------

	
	// from env.js. dummy for tab register
	Foxtrick.loader.chrome.background.register = function(request, sender, sendResponse) {};


	// from prefs.js
	Foxtrick.loader.chrome.background.setValue = function(request, sender, sendResponse) {
		if (FoxtrickPrefs.get(request.key)==request.value) 
			return;
		FoxtrickPrefs.setValue(request.key, request.value, request.type);
		if ( request.key == 'htLanguage' )
			Foxtrickl10n.init();
	};
	Foxtrick.loader.chrome.background.deleteValue = function(request, sender, sendResponse) {
		FoxtrickPrefs.deleteValue(request.key);
		if ( request.key == 'htLanguage' )
			Foxtrickl10n.init();
	};
	Foxtrick.loader.chrome.background.clearPrefs = function(request, sender, sendResponse) {
		try {
			if (Foxtrick.platform == "Mobile" || Foxtrick.platform == "Android") {
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
	Foxtrick.loader.chrome.background.getCss = function(request, sender, sendResponse) {
		// @param files - an array of files to be loaded into string
		sendResponse({ cssText : Foxtrick.getCssFileArrayToString(request.files) });
	};
	Foxtrick.loader.chrome.background.convertImages = function(request, sender, sendResponse) {
		// @param files - a string for which image urls are converted to data urls
		// updates cssTextCollection if "ft-module-css" conversion was done
		Foxtrick.convertImageUrlToData(request.cssText,
			function(cssText){
				if (request.type=="ft-module-css")
					cssTextCollection = cssText;
				sendResponse({cssText:cssText});
		});
	};
	Foxtrick.loader.chrome.background.getXml = function(request, sender, sendResponse) {
		// @param url - the URL of resource to load with window.XMLHttpRequest
		// @param params - params != null makes it and used for a POST request
		// @callback_param data - response text
		// @callback_param status - HTTP status of request
		
		var callback = function(responseText, status){
			sendResponse({data : responseText, status : status});
		};
		Foxtrick.load(request.url, callback, request.params);
	};
	Foxtrick.loader.chrome.background.getDataUrl = function(request, sender, sendResponse) {
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
		if ( !Foxtrick.dataUrlStorage[request.url] ) 
			replaceImage(request.url);
		else 
			sendResponse({ url: Foxtrick.dataUrlStorage[request.url] });
	};
	Foxtrick.loader.chrome.background.playSound = function(request, sender, sendResponse) {
		// @param url - the URL of new tab to create
		Foxtrick.playSound(request.url, document);
	};

	// from misc.js: tabs
	Foxtrick.loader.chrome.background.newTab = function(request, sender, sendResponse) {
		// @param url - the URL of new tab to create
		sandboxed.tabs.create({url : request.url});
	};
	Foxtrick.loader.chrome.background.reuseTab = function(request, sender, sendResponse) {
		// @param url - the URL of new tab to create
		if (Foxtrick.platform == "Mobile") {
			for (var i = 0; i<Browser.browsers.length; ++i) {
				if (sender.tab.id == Browser.browsers[i].tid) {
					Browser.selectedTab = Browser.getTabAtIndex(i);
					Browser.browsers[i].loadURI(request.url);
				}
			}
		}
		else if (Foxtrick.platform == "Android") {
		// todo
		}
	};

	// from misc.js
	Foxtrick.loader.chrome.background.clipboard = function(request, sender, sendResponse) {
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
	Foxtrick.loader.chrome.background.notify = function(request, sender, sendResponse) {
		// @param msg - message to notify the user
		if (window.webkitNotifications) {
			var notification = webkitNotifications.createNotification(
				"resources/img/hattrick-logo.png", // logo location
				"Hattrick", // notification title
				request.msg // notification body text
			);
			// this webkit notification. onclick is needed
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
	Foxtrick.loader.chrome.background.updateContextMenu = function(request, sender, sendResponse) {
	};

	// from sessionStore.js
	Foxtrick.loader.chrome.background.sessionSet = function(request, sender, sendResponse) {
		// @param key - key of session store
		// @param value - value to store
		Foxtrick.sessionSet(request.key, request.value);
	};
	Foxtrick.loader.chrome.background.sessionGet = function(request, sender, sendResponse) {
		// @param key - key of session store
		sendResponse( {value: Foxtrick.sessionGet(request.key)} );
	};
	Foxtrick.loader.chrome.background.sessionDeleteBranch = function(request, sender, sendResponse) {
		// @param branch - initial part of key(s) of session store to delete
		Foxtrick.sessionDeleteBranch(request.branch);
	};

	// from localStore.js
	Foxtrick.loader.chrome.background.localSet = function(request, sender, sendResponse) {
		// @param key - key of local store
		// @param value - value to store
		Foxtrick.localSet(request.key, request.value);
	};
	Foxtrick.loader.chrome.background.localGet = function(request, sender, sendResponse) {
		// @param key - key of local store
		sendResponse( {value: Foxtrick.localGet(request.key)} );
	};
	Foxtrick.loader.chrome.background.localDeleteBranch = function(request, sender, sendResponse) {
		// @param branch - initial part of key(s) of local store to delete
		Foxtrick.localDeleteBranch(request.branch);
	};

	// from entry.js
	Foxtrick.loader.chrome.background.cookieSet = function(request, sender, sendResponse) {
		// @param cookie object - http://code.google.com/chrome/extensions/cookies.html#method-set
		chrome.cookies.set(request.cookie);	
	};

	// from log.js
	Foxtrick.loader.chrome.background.log = function(request, sender, sendResponse) {
		// @param log - text to dump to console (fennec)
		dump("FT: "+request.log);
		Foxtrick.addToDebugLogStorage(request.log);
	};
	Foxtrick.loader.chrome.background.addDebugLog = function(request, sender, sendResponse) {
		// @param log - text to add to debug log storage
		Foxtrick.addToDebugLogStorage(request.log);
	};
	Foxtrick.loader.chrome.background.getDebugLog = function(request, sender, sendResponse) {
		// @callback_param log - contains the debug log storage
		sendResponse({ log : Foxtrick.debugLogStorage });
		Foxtrick.debugLogStorage = '';
	};

	// from mobile-enhancements.js
	Foxtrick.loader.chrome.background.updateViewportSize = function(request, sender, sendResponse) {
		Browser.updateViewportSize();
	};
	
  } catch(e) { 
	Foxtrick.log(e); 
  }
};


// for clipboard
Foxtrick.loader.chrome.copyToClipBoard = function(content) {
	var clipboardStore = document.getElementById("clipboard-store");
	clipboardStore.value = content;
	clipboardStore.select();
	document.execCommand("Copy");
};


// fennec injects content scripts at 'runtime'
if (Foxtrick.platform == "Mobile" || Foxtrick.platform == "Android") 
	addEventListener("UIReady", Foxtrick.loader.gecko.fennecScriptInjection, false);


// this is the background script entry point for sandboxed arch and fennec
if (Foxtrick.chromeContext() == "background")
	Foxtrick.loader.chrome.browserLoad();

