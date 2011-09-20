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
	
	// calls module.onLoad() after the browser window is loaded
	var i;
	for (i in Foxtrick.modules) {
		var module = Foxtrick.modules[i];
		if (typeof(module.onLoad) === "function") {
			try {
				module.onLoad(document);
			}
			catch (e) {
				console.log("Error caught in module ", module.MODULE_NAME, ":", e);
			}
		}
	}

	// get resources
	var core = [ FoxtrickPrefs, Foxtrickl10n, Foxtrick.XMLData ], i;
	for (i in core)
		core[i].init();

	// prepare resources for later transmission to content script
	var serializer = new window.XMLSerializer();
	var currency = serializer.serializeToString(Foxtrick.XMLData.htCurrencyXml);
	var about = serializer.serializeToString(Foxtrick.XMLData.aboutXML);
	var worldDetails = serializer.serializeToString(Foxtrick.XMLData.worldDetailsXml);
	var htLanguagesText = {};
	var i;
	for (i in Foxtrickl10n.htLanguagesXml) {
		htLanguagesText[i] = serializer.serializeToString(Foxtrickl10n.htLanguagesXml[i]);
	}
	if (Foxtrick.platform != "Fennec")
		var cssTextCollection = Foxtrick.getCssTextCollection();

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
			console.log('Foxtrick - background onRequest: ', e)
			console.log(request)
			sendResponse({ error : 'Foxtrick - background onRequest: ' + e });
		}
	});

	// for updating content preference copy and injected css list
	var updatePrefs = function () {
		FoxtrickPrefs.deleteValue("preferences.updated");
		FoxtrickPrefs.init();
		Foxtrickl10n.init();
		if (Foxtrick.platform != "Fennec")
			cssTextCollection = Foxtrick.getCssTextCollection();
		console.log('prefs updated');
	};

	
	// called to parse a copy of the settings and data to the content script
	//   pageLoad : on HT pages for chrome/safari/opera
	//   scriptLoad : once per tab/browser(?) for fennec
	//   optionsPageLoad : on options page for opera 
	//
	var pageLoad = function(request, sender, sendResponse) {
		if (request.req == "pageLoad") 
			FoxtrickUI.update(sender.tab);
		
		// access user setting directly here, since getBool uses a copy which needs updating just here
		if ( (Foxtrick.arch == "Sandboxed" && localStorage.getItem("preferences.updated"))
			|| (Foxtrick.platform == "Fennec" && FoxtrickPrefs._prefs_gecko.getBoolPref("preferences.updated")) ) {
				updatePrefs();
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
			resource.cssText = cssTextCollection;
		}
		
		sendResponse ( resource );
		
	};
	// fennecs single child process
	var scriptLoad = pageLoad;
	
	// operas options page
	var optionsPageLoad = pageLoad;
	// ----- end of init part. ------

	// from env.js. dummy for tab register
	var register = function(request, sender, sendResponse) {};
	
	
	// content preference copy not updated if those change
	var no_update_needed = {'preferences.updated':true, 'last-host':true, 'last-page':true, 'version':true};

	// from prefs.js
	var setValue = function(request, sender, sendResponse) {
		if (FoxtrickPrefs.get(request.key)==request.value) 
			return;
		FoxtrickPrefs.setValue(request.key, request.value, request.type);
		if ( !no_update_needed[request.key] )
			FoxtrickPrefs.setBool("preferences.updated",true);
	};
	var deleteValue = function(request, sender, sendResponse) {
		FoxtrickPrefs.deleteValue(request.key);
		if (!no_update_needed[request.key])
			FoxtrickPrefs.setBool("preferences.updated",true);
	};
	var clearPrefs = function(request, sender, sendResponse) {
		try {
			console.log('clearPrefs ');
			if (Foxtrick.platform == "Fennec") {
				FoxtrickPrefs.cleanupBranch();
			}
			else {
				for (var i in localStorage) {
					if (i.indexOf('module.')===0 && FoxtrickPrefs.isPrefSetting(i)) {
						localStorage.removeItem(i);
					}
				}
			updatePrefs();
			}
		} catch(e) {console.log(e)}
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
		var callback = function(responseText,status){
			sendResponse({data : responseText, status : status});
		};
		Foxtrick.load(request.url, callback, request.crossSite )
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

  } catch (e) {dump('Foxtrick.loader.chrome.browserLoad: ', e );}
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
		messageManager.loadFrameScript("chrome://foxtrick/content/stats.js", true);

		messageManager.loadFrameScript("chrome://foxtrick/content/util/module.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/api.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/array.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/copy-button.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/currency.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/html.js", true);
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

		messageManager.loadFrameScript("chrome://foxtrick/content/alert/live-alert.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/alert/new-mail.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/alert/ticker-alert.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/alert/ticker-coloring.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/add-leave-conf-button.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-change-posts.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-change-posts-modules.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-last-post.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-next-and-previous.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-presentation.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-preview.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-strip-hattrick-links.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-templates.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-thread-auto-ignore.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-youth-icons.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/go-to-post-box.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/hide-signatures.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/ht-thread-marker.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/mark-all-as-read.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/mark-unread.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/show-forum-pref-button.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/staff-marker.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/cross-table.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/election-table.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/extended-player-details.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/extra-player-info.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/flag-collection-to-map.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/goal-difference-to-tables.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/history-stats.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/htms-points.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/last-login.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/median-transfer-price.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/my-monitor.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/nt-peek.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/player-birthday.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/season-stats.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/series-flags.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/show-friendly-booked.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/show-lineup-set.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/skill-table.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/team-stats.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/transfer-deadline.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/youth-promotes.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/youth-series-estimation.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/supporterstats-enhancements.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-achievements.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-alliances.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-arena.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-challenges.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-club-transfers.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-coach.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-country.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-economy.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-fans.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-league.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-manager.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-match.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-national.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-player-detail.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-players.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-staff.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-team.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-tracker.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-training.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-youth.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/att-vs-def.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/copy-ratings.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/htms-prediction.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/match-income.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/match-player-colouring.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/match-report-format.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/ratings.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/stars-counter.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/background-fixed.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/bookmark-adjust.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/country-list.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/currency-converter.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/custom-medals.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/fix-css-problems.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/friendly-interface.js", true);
//		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/header-fix.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/highlight-cup-wins.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/highlight-ownerless.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/ht-date-format.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/large-flags.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/league-news-filter.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/local-time.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/match-tables.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/mobile-enhancements.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/move-manager-online.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/move-player-select-box.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/move-player-statement.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/old-style-face.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/original-face.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/personality-images.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/simple-presentation.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/skill-coloring.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/skill-translation.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/skin-plugin.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/smaller-pages.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/team-select-box.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/youth-skill-hide-unknown.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/confirm-actions.js", true);
//		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/context-menu-copy.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/copy-match-id.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/copy-player-ad.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/copy-youth.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/extra-shortcuts.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/league-and-match-chat.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/lineup-shortcut.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/manager-buttons.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/player-filters.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/rapid-id.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/senior-team-shortcuts.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/table-sort.js", true);
//		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/team-popup-links.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/transfer-search-filters.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/transfer-search-result-filters.js", true);

		messageManager.loadFrameScript("chrome://foxtrick/content/entry.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/ui.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/loader-gecko.js", true);
};

if (Foxtrick.platform == "Fennec") {
	addEventListener("UIReady", Foxtrick.loader.chrome.fennecScriptInjection, false);
};

// run it
Foxtrick.loader.chrome.browserLoad();

