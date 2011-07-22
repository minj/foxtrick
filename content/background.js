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
	var sessionStore = {};

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
			
			var updatePrefs = function () {
				// @callback_param pref - user preferences
				// @callback_param _default_prefs_chrome - default preferences
				localStorage.removeItem("preferences.updated");
				FoxtrickPrefs.init(); 
				cssTextCollection = Foxtrick.getCssTextCollection();
				Foxtrick.log('prefs updated');
			};		
			var getLocale = function () {
				// @callback_param htLang - object of htlang.xml in plain text
				// @callback_param propsDefault - foxtrick.properties (master)
				// @callback_param props - foxtrick.properties (localized)
				// @callback_param screenshots - foxtrick.screenshots
				return htLanguagesText;
			};
			var getXmlResource = function () {
				return {currency:currency, dateFormat:dateFormat, about:about, worldDetails:worldDetails};
			};
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

					_user_prefs_chrome : FoxtrickPrefs._user_prefs_chrome,
					_default_prefs_chrome : FoxtrickPrefs._default_prefs_chrome,

					htLang : htLanguagesText,
					propsDefault : Foxtrickl10n.properties_default,
					props : Foxtrickl10n.properties,
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
				FoxtrickPrefs.setValue(request.key, request.value) ;
			}
			else if (request.req == "deleteValue") {
				FoxtrickPrefs.deleteValue(request.key);
			}
			else if (request.req == "clearPrefs") {
				FoxtrickPrefs.cleanupBranch ( request.branch , request.no_user_settings); 
			}
			else if (request.req == "getCss") {
				// @param files - a string of files to be added, separated with "\n"
				var cssUrl = request.files.split("\n");
				cssTextCollection='';
				for (var i = 0; i < cssUrl.length; ++i) {
					cssTextCollection += Foxtrick.getCssTextFromFile(cssUrl[i]);
				}
				sendResponse({ cssText : cssTextCollection });
			}
			else if (request.req == "xml") {
				// @param url - the URL of resource to load with XMLHttpRequest
				// @callback_param data - response text
				// @callback_param status - HTTP status of request
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function(aEvt) {
					try {
						if (xhr.readyState == 4) 
							sendResponse({data : xhr.responseText, status : xhr.status});
					}
					catch (e) {
						// port may be disconnected
						sendResponse({ error : 'Foxtrick - background xml: ' + e });
					}
				};
				xhr.open("GET", request.url, true);
				//xhr.setRequestHeader('Cache-Control','only-if-cached') ;
				xhr.send();
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
	chrome.pageAction.onClicked.addListener(function(tab) { 
		FoxtrickPrefs.setBool("disableTemporary", !FoxtrickPrefs.getBool("disableTemporary"));
		FoxtrickCore.setPageIcon(tab);
	});
	
  } catch (e) {Foxtrick.log('Foxtrick.loader.chrome.browserLoad: ', e);}
};

// or clipboard
var copyToClipBoard = function(content) {
	clipboardStore = document.getElementById("clipboard-store");
	clipboardStore.value = content;
	clipboardStore.select();
	document.execCommand("Copy");
}

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
