/*
 * background-chrome.js
 * FoxTrick background loader for Chrome platform
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

	// content preference copy not updated if those change
	var no_update_needed = {'last-host':true, 'last-page':true};

	// for updating content preference copy and injected css list
	var updatePrefs = function () {
		FoxtrickPrefs.deleteValue("preferences.updated");
		FoxtrickPrefs.init(); 
		Foxtrickl10n.init(); 
		cssTextCollection = Foxtrick.getCssTextCollection();
		Foxtrick.log('prefs updated');
	};

	var updatePageAction = function(request, sender) {
		if (typeof(opera) === "object") {
			if (request.sender!='options') FoxtrickCore.setOperaIcon(Foxtrick.loader.chrome.button);
		}
		else if (typeof(chrome) === "object") {
			chrome.pageAction.show(sender.tab.id);
			FoxtrickCore.setChromeIcon(sender.tab);
		}
	};
	
	// calls module.onLoad() after the browser window is loaded
	for (var i in Foxtrick.modules) {
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

	// get resources
	var core = [ FoxtrickPrefs, Foxtrickl10n, Foxtrick.XMLData ];
	for (var i in core) 
		core[i].init(); 
		
	// prepare resources for later transmission to content script
	var serializer = new window.XMLSerializer();
	var currency = serializer.serializeToString(Foxtrick.XMLData.htCurrencyXml);
	var about = serializer.serializeToString(Foxtrick.XMLData.aboutXML);
	var worldDetails = serializer.serializeToString(Foxtrick.XMLData.worldDetailsXml);
	var htLanguagesText = {};
	for (var i in Foxtrickl10n.htLanguagesXml) {
		htLanguagesText[i] = serializer.serializeToString(Foxtrickl10n.htLanguagesXml[i]);
	} 
	var cssTextCollection = Foxtrick.getCssTextCollection();

	
	// one-time message channel
	// use with sandboxed.extension.sendRequest({req : "{TYPE}", parameters...}, callback)
	// callback will be called with a sole Object as argument
	sandboxed.extension.onRequest.addListener(function(request, sender, sendResponse) {
		try {
			//Foxtrick.log('request: ',request.req)//, ' ',request )
				
			if (request.req == "init") {
				try {
					updatePageAction(request, sender);
					
					if (FoxtrickPrefs.getBool("preferences.updated")
						&& JSON.parse(FoxtrickPrefs.getBool("preferences.updated"))) {
							updatePrefs();
					}

					sendResponse({
						cssText : cssTextCollection,

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
					});
				} catch(e) {
					dump(e)
					Foxtrick.log('Foxtrick request.req == "init": ' , e );
				}
			}
			else if (request.req == "setValue") {
				FoxtrickPrefs.setValue(request.key, request.value, request.type);
				if (!no_update_needed[request.key]) 
					FoxtrickPrefs.setBool("preferences.updated",true);
			}
			else if (request.req == "deleteValue") {
				FoxtrickPrefs.deleteValue(request.key);
				if (!no_update_needed[request.key]) 
					FoxtrickPrefs.setBool("preferences.updated",true);
			}
			else if (request.req == "clearPrefs") {
				try { 
					Foxtrick.log('clearPrefs ');
					if (typeof(fennec)==='object') {
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
				} catch(e) {Foxtrick.log(e)}
			}
			else if (request.req == "getCss") {
				// @param files - an array of files to be loaded into string
				sendResponse({ cssText : Foxtrick.getCssFileArrayToString(request.files) });
			}
			else if (request.req == "convertImages") {
				// @param files - a string for which image urls are converted to data urls
				// updates cssTextCollection if "ft-module-css" conversion was done
				Foxtrick.convertImageUrlToData(request.cssText,
						function(cssText){ 
							if (request.type=="ft-module-css") 
								cssTextCollection = cssText;
							sendResponse({cssText:cssText});
				});
			}
			else if (request.req == "xml") {
				// @param url - the URL of resource to load with window.XMLHttpRequest
				// @callback_param data - response text
				// @callback_param status - HTTP status of request
				// synchronous, since messaging is async already
				var callback = function(responseText,status){
					sendResponse({data : responseText, status : status});
				}; 
				Foxtrick.load(request.url, callback, request.crossSite )
			}
			else if (request.req == "newTab") {
				// @param url - the URL of new tab to create
				sandboxed.tabs.create({url : request.url});
			}
			else if (request.req == "clipboard") {
				// @param content - content to copy
				// @callback_param status - success status
				try {
					if (typeof(chrome)=='object')
						Foxtrick.loader.chrome.copyToClipBoard(request.content);
					else 
						Foxtrick.copyStringToClipboard(request.content)
					sendResponse({status : true});
				}
				catch (e) {
					sendResponse({status : false});
				}
			}
			else if (request.req == "notify") {
				// @param msg - message to notify the user
				if (window.webkitNotifications) {
					var notification = webkitNotifications.createNotification(
						"resources/img/hattrick-logo.png", // logo location
						"Hattrick", // notification title
						request.msg // notification body text
					);
					notification.onclick = function() { 
						if ( typeof(chrome)=='object' ) {
							// focus last window
							chrome.windows.update( sender.tab.windowId, { focused:true });
							// goto msg.url in sender tab
							chrome.tabs.update( sender.tab.id, { url:request.url, selected:true });
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
			}
			else if (request.req == "sessionSet") {
				// @param key - key of session store
				// @param value - value to store
				Foxtrick.sessionSet(request.key, request.value);
			}
			else if (request.req == "sessionGet") {
				// @param key - key of session store
				// @callback_param value - contains the object stored
				Foxtrick.sessionGet(request.key, sendResponse );
			}
			else if (request.req == "sessionDeleteBranch") {
				// @param branch - initial part of key(s) of session store to delete
				Foxtrick.sessionDeleteBranch(request.branch);
			}
			else if (request.req == "log") {
				// @param log - text to dump to console (fennec)
				dump("FT: "+request.log);
			}
			else if (request.req == "addDebugLog") {
				// @param log - text to add to debug log storage
				Foxtrick.addToDebugLogStorage(request.log);
			}
			else if (request.req == "getDebugLog") {
				// @callback_param log - contains the debug log storage
				sendResponse({ log : Foxtrick.debugLogStorage });
				Foxtrick.debugLogStorage = '';
			}
			else if (request.req == "getDataUrl") {
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
			}
		}
		catch (e) {
			Foxtrick.log('Foxtrick - background onRequest: ', e)
			Foxtrick.log(request)
			sendResponse({ error : 'Foxtrick - background onRequest: ' + e });
		}
	});

	
	// page action init and listeners
	if (typeof(opera) === "object") {
		// Specify the properties of the button before creating it.
		var UIItemProperties = {
			disabled: false,
			title: "FoxTrick",
			icon: "skin/icon-16.png",
			onclick: function(event) {
				FoxtrickPrefs.disable(event.currentTarget);
			}
		};
		// Create the button and add it to the toolbar.
		Foxtrick.loader.chrome.button = opera.contexts.toolbar.createItem( UIItemProperties );
		opera.contexts.toolbar.addItem(Foxtrick.loader.chrome.button);
		FoxtrickCore.setOperaIcon(Foxtrick.loader.chrome.button);

	}
	
	else if (typeof(chrome) === "object") {
		chrome.pageAction.onClicked.addListener(function(tab) { FoxtrickPrefs.disable(tab); });
		Foxtrick.loader.chrome.contextCopyChrome();
	}
	
	else if (typeof(safari) === "object") {
	   // Open Options page upon settings checkbox click.
		safari.extension.settings.openFoxtrickOptions = false;
		safari.extension.settings.addEventListener("change", function(e) {
			 try {
				 if (e.key == 'openFoxtrickOptions')
					sandboxed.tabs.create({url: Foxtrick.ResourcePath + "preferences.xhtml"});
			} catch(e) {Foxtrick.log(e)}
		}, false);

		safari.application.addEventListener("command", function(commandEvent) {
		  // Open Options page upon Toolbar button click.
		  if (commandEvent.command == "FoxtrickOptions")
			sandboxed.tabs.create({url: Foxtrick.ResourcePath+ "preferences.xhtml"});
		}, false);
		
		Foxtrick.loader.chrome.contextCopySafari();
	}
	
	else if (typeof(fennec)==='object') {
		addEventListener("UIReady", onWindowLoad, false);
	}
  } catch (e) {Foxtrick.log('Foxtrick.loader.chrome.browserLoad: ', e );}
};



// for clipboard
Foxtrick.loader.chrome.copyToClipBoard = function(content) {
	var clipboardStore = document.getElementById("clipboard-store");
	clipboardStore.value = content;
	clipboardStore.select();
	document.execCommand("Copy");
};



Foxtrick.loader.chrome.contextCopyChrome = function () {
	// context copy stuff. copy ids work
	function idLinkOnClick(info, tab) {
	  var id_container = Foxtrick.util.htMl.getIdFromLink(info.linkUrl);
	  if (id_container) Foxtrick.loader.chrome.copyToClipBoard(id_container.id);
	}

	function linkOnClick(info, tab) {
		var markup = Foxtrick.util.htMl.getMarkupFromLink(info.linkUrl);
		if (markup) Foxtrick.loader.chrome.copyToClipBoard(markup);
	}
	
	function selectionOnClick(info, tab) {
		// only plain text. useless as it is. maybe scan content document textContent for section and gather nodes there
		Foxtrick.loader.chrome.copyToClipBoard(info.selectionText);
	}

	var local_string = Foxtrickl10n.getString('Copy');
	if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "Id")) {
		var id_contexts = [
			{'title':local_string+ ': Team ID', 	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*TeamID=*','*://*.hattrick.org/*teamId=*'] },
			{'title':local_string+ ': User ID', 	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*UserID=*','*://*.hattrick.org/*userId=*'] },
			{'title':local_string+ ': Series ID',	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*LeagueLevelUnitID=*','*://*.hattrick.org/*LeagueLevelUnitId=*'] },
			{'title':local_string+ ': YouthSeries ID',	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*YouthLeagueID=*','*://*.hattrick.org/*YouthLeagueId=*'] },
			{'title':local_string+ ': Match ID', 	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*matchID=*','*://*.hattrick.org/*matchId=*'] },
			{'title':local_string+ ': Player ID',	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*PlayerID=*','*://*.hattrick.org/*playerId=*'] },
			{'title':local_string+ ': Arena ID', 	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*ArenaID=*','*://*.hattrick.org/*arenaId=*'] },
			{'title':local_string+ ': Post ID', 	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/Forum/Read.aspx?t=*&n=*'] },
		];
	}
	else var id_contexts = [];
	
	if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "Link")) {
		id_contexts.push( {'title':Foxtrickl10n.getString("copy.link"), "contexts":["link"], "onclick": linkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*'] });
	}		
	if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "HtMl")) {
	//not working. just keeping it for future use
	//	id_contexts.push( {'title':'Copy in HT-ML', 	"contexts":["selection"], "onclick": selectionOnClick, 'documentUrlPatterns': ['*://*.hattrick.org/*'] },);
	}
	
	for (var i = 0; i < id_contexts.length; i++) {
		chrome.contextMenus.create(id_contexts[i]);
	}

	// example: Create a parent item and two children.
	//var parent = chrome.contextMenus.create({"title": "Test parent item"});
	//var child1 = chrome.contextMenus.create({"title": "Child 1", "parentId": parent, "onclick": genericOnClick});
	//var child2 = chrome.contextMenus.create({"title": "Child 2", "parentId": parent, "onclick": genericOnClick});
}

Foxtrick.loader.chrome.contextCopySafari = function () {	
	// Add context menus
	safari.application.addEventListener("contextmenu", function(event) {
		try{
			if (event.userInfo.nodeName === "A") {
				if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "Id")) {
					var id = Foxtrick.util.htMl.getIdFromLink(event.userInfo.href);
					if (id !== null) {
						var idText = Foxtrickl10n.getString("copy.id").replace("%s", id.type + " ID").replace("%i", id.id);
						event.contextMenu.appendContextMenuItem("copyid", idText);
					}
				}
				if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "Link")) {
					var markup = Foxtrick.util.htMl.getMarkupFromLink(event.userInfo.href);
					if (markup !== null) {
						event.contextMenu.appendContextMenuItem("copylink", Foxtrickl10n.getString("copy.link"));
					}
				}
				safari.application.addEventListener("command", function(commandEvent) {
					if (commandEvent.command == "copyid")
						Foxtrick.copyStringToClipboard(id.id);
					else if (commandEvent.command == "copylink")
						Foxtrick.copyStringToClipboard(markup);
				}, false );
			}
		} catch(e){Foxtrick.log(e)}
	});
};

// fennec script injection
var onWindowLoad = function(event) {
	try {
		Foxtrick.log('inject scripts');
		// run only once
		removeEventListener("UIReady", onWindowLoad, false);

		// inject scripts
		messageManager.loadFrameScript("chrome://foxtrick/content/env.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/prefs.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/l10n.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/xml-load.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/pages.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/stats.js", true);

		messageManager.loadFrameScript("chrome://foxtrick/content/util/module.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/api.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/copy-button.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/currency.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/html.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/ht-ml.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/id.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/inject.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/layout.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/util/links-box.js", true);
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

		messageManager.loadFrameScript("chrome://foxtrick/content/preferences.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/entry.js", true);

		messageManager.loadFrameScript("chrome://foxtrick/content/loader-gecko.js", true);
		
	} catch(e){Foxtrick.log(e);}
};

Foxtrick.loader.chrome.browserLoad ();
