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
Foxtrick.loader.chrome.browserLoad = function(document) {
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

	// for clipboard
	var copyToClipBoard = function(content) {
		clipboardStore = document.getElementById("clipboard-store");
		clipboardStore.value = content;
		clipboardStore.select();
		document.execCommand("Copy");
	}

	
	// get resources
	var core = [ FoxtrickPrefs, Foxtrickl10n, Foxtrick.XMLData ];
	for (var i in core) 
		core[i].init(); 
		
	// prepare resources for later transmission to content script
	var serializer = new XMLSerializer();
	var currency = serializer.serializeToString(Foxtrick.XMLData.htCurrencyXml);
	var dateFormat = serializer.serializeToString(Foxtrick.XMLData.htdateformat);
	var about = serializer.serializeToString(Foxtrick.XMLData.aboutXML);
	var worldDetails = serializer.serializeToString(Foxtrick.XMLData.worldDetailsXml);
	var htLanguagesText = {};
	for (var i in Foxtrickl10n.htLanguagesXml) {
		htLanguagesText[i] = serializer.serializeToString(Foxtrickl10n.htLanguagesXml[i]);
	} 
	var cssTextCollection = Foxtrick.getCssTextCollection();

	
	// one-time message channel
	// use with chrome.extension.sendRequest({req : "{TYPE}", parameters...}, callback)
	// callback will be called with a sole Object as argument
	chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
		try {
			Foxtrick.log('request: ',request.req, ' ',request )
				
			if (request.req == "init") {
				try {
					chrome.pageAction.show(sender.tab.id);
					FoxtrickCore.setPageIcon(sender.tab);
					
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
						dateFormat : dateFormat,
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
				localStorage.setItem(request.key, JSON.stringify(request.value));
				if (!no_update_needed[request.key]) 
					localStorage.setItem("preferences.updated",'true');
			}
			else if (request.req == "deleteValue") {
				localStorage.removeItem(request.key);
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
				// @param files - a array of files to be added
				sendResponse({ cssText : Foxtrick.getCssFileArrayToString(request.files) });
			}
			else if (request.req == "xml") {
				// @param url - the URL of resource to load with XMLHttpRequest
				// @callback_param data - response text
				// @callback_param status - HTTP status of request
				// synchronous, since messaging is async already
				var xhr = new XMLHttpRequest();
				xhr.open("GET", request.url, false);
				xhr.send();
				sendResponse({data : xhr.responseText, status : xhr.status});
			}
			else if (request.req == "newTab") {
				// @param url - the URL of new tab to create
				chrome.tabs.create({url : request.url});
			}
			else if (request.req == "clipboard") {
				// @param content - content to copy
				// @callback_param status - success status
				try {
					copyToClipBoard(request.content);
					sendResponse({status : true});
				}
				catch (e) {
					sendResponse({status : false});
				}
			}
			else if (request.req == "notify") {
				// @param msg - message to notify the user
				var notification = webkitNotifications.createNotification(
					"resources/img/hattrick-logo.png", // logo location
					"Hattrick", // notification title
					request.msg // notification body text
				);

				// Then show the notification.
				notification.show();

				// close after 5 sec
				setTimeout(function() { notification.cancel(); }, 5000);
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
		}
		catch (e) {
			Foxtrick.log('Foxtrick - background onRequest: ', e)
			Foxtrick.log(request)
			sendResponse({ error : 'Foxtrick - background onRequest: ' + e });
		}
	});

	
	// page action listener
	chrome.pageAction.onClicked.addListener(function(tab) { FoxtrickPrefs.disable(tab); });

  } catch (e) {Foxtrick.log('Foxtrick.loader.chrome.browserLoad: ', e );}
};

/*
// context copy stuff. copy ids work
function linkOnClick(info, tab) {
  Foxtrick.log(info);
  var id_container = Foxtrick.util.htMl.getIdFromLink(info.linkUrl);
  if (id_container) copyToClipBoard(id_container.id);
  Foxtrick.log(id_container);
}

function selectionOnClick(info, tab) {
	// only plain text. useless as it is. maybe scan content document textContent for section and gather nodes there
	copyToClipBoard(info.selectionText);
}

var id_contexts = [
	{'title':'Copy Team ID', 	"contexts":["link"], "onclick": linkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*TeamID=*','*://*.hattrick.org/*teamId=*'] },
	{'title':'Copy User ID', 	"contexts":["link"], "onclick": linkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*UserID=*','*://*.hattrick.org/*userId=*'] },
	{'title':'Copy League ID', 	"contexts":["link"], "onclick": linkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*LeagueLevelUnitID=*','*://*.hattrick.org/*LeagueLevelUnitId=*'] },
	{'title':'Copy Match ID', 	"contexts":["link"], "onclick": linkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*matchID=*','*://*.hattrick.org/*matchId=*'] },
	{'title':'Copy Player ID', 	"contexts":["link"], "onclick": linkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*PlayerID=*','*://*.hattrick.org/*playerId=*'] },
	{'title':'Copy ArenaID', 	"contexts":["link"], "onclick": linkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*ArenaID=*','*://*.hattrick.org/*arenaId=*'] },
	//{'title':'Copy in HT-ML', 	"contexts":["selection"], "onclick": selectionOnClick, 'documentUrlPatterns': ['*://*.hattrick.org/*'] },
];

for (var i = 0; i < id_contexts.length; i++) {
	chrome.contextMenus.create(id_contexts[i]);
}


// example: Create a parent item and two children.
//var parent = chrome.contextMenus.create({"title": "Test parent item"});
//var child1 = chrome.contextMenus.create({"title": "Child 1", "parentId": parent, "onclick": genericOnClick});
//var child2 = chrome.contextMenus.create({"title": "Child 2", "parentId": parent, "onclick": genericOnClick});
*/

Foxtrick.loader.chrome.browserLoad (document);
