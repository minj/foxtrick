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
		localStorage.removeItem("preferences.updated");
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
	var serializer = new XMLSerializer();
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
			//Foxtrick.log('request: ',request.req, ' ',request )
				
			if (request.req == "init") {
				try {
					updatePageAction(request, sender);
					
					if (localStorage["preferences.updated"]
						&& JSON.parse(localStorage["preferences.updated"])) {
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
					Foxtrick.log('Foxtrick request.req == "init": ' , e );
				}
			}
			else if (request.req == "setValue") {
				FoxtrickPrefs.setValue(request.key, request.value);
				if (!no_update_needed[request.key]) 
					localStorage.setItem("preferences.updated",'true');
			}
			else if (request.req == "deleteValue") {
				FoxtrickPrefs.deleteValue(request.key);
				if (!no_update_needed[request.key]) 
					localStorage.setItem("preferences.updated",'true');
			}
			else if (request.req == "clearPrefs") {
				try { 
					Foxtrick.log('clearPrefs ');
					for (var i in localStorage) {
						if (i.indexOf('module.')===0 && FoxtrickPrefs.isPrefSetting(i)) {
							localStorage.removeItem(i);
						}
					}
					updatePrefs();
				} catch(e) {Foxtrick.log(e)}
			}
			else if (request.req == "getCss") {
				// @param files - an array of files to be loaded into string
				sendResponse({ cssText : Foxtrick.getCssFileArrayToString(request.files) });
			}
			else if (request.req == "convertImages") {
				// @param files - a string for which image urls are converted to data urls
				// updates cssTextCollection if module_css conversion was done
				Foxtrick.convertImageUrlToData(request.cssText,
						function(cssText){ 
							if (request.type=='module_css') 
								cssTextCollection = cssText;
							sendResponse({cssText:cssText});
				});
			}
			else if (request.req == "xml") {
				// @param url - the URL of resource to load with XMLHttpRequest
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
					Foxtrick.loader.chrome.copyToClipBoard(request.content);
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
						if ( typeof(chrome)=='object' )
							chrome.tabs.update(sender.tab.id, { url:request.url, selected:true });
						else 
							sandboxed.tabs.create({url: request.url});
						notification.cancel();
					};

					// Then show the notification.
					notification.show();

					// close after 10 sec
					setTimeout(function() { notification.cancel(); }, 10000);
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
						return sendResponse({ url:canvas.toDataURL() });
					};
					image.onerror = function() {
						return sendResponse({ url:'' });
					};
					return image.src = url;
				};
				replaceImage(request.url);
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


if (Foxtrick.BuildFor === "Sandboxed" && Foxtrick.chromeContext()==="background" ) {
	Foxtrick.loader.chrome.browserLoad ();
}
