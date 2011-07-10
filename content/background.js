var sessionStore = {};

var errors = '';
var cssTextCollection = '';
var currency = null;
var dateFormat = null;
var about = null;
var worldDetails = null;
var htLanguagesText = {};
		

var getCssFromResource = function (cssUrl) {
	// @callback_param cssText - string of CSS content to be added
	var css_text = "";
	if (cssUrl && cssUrl.search(/^http|^chrome-extension/) != -1) {
		try { 
			// a resource file, get css file content
			css_xhr = new XMLHttpRequest();
			css_xhr.open("GET", cssUrl, false);
			css_xhr.send();
			css_text = css_xhr.responseText;
		} catch(e) { errors += 'get css: '+cssUrl+' \n'+e; }
	}
	else {
		// not a file but line is css text
		css_text = cssUrl;
	}
	if (css_text) {
		// remove moz-document statement
		if (css_text.search(/@-moz-document/)!=-1) {
			css_text = css_text.replace(/@-moz-document[^\{]+\{/, "");
			var closing_bracket = css_text.lastIndexOf("}");
			css_text = css_text.substr(0, closing_bracket)+css_text.substr(closing_bracket+1);
		}
	}
	return css_text; 
};
var makeCssTextCollection = function() { 
	cssTextCollection = '';
	for (var i in Foxtrick.modules) { 
		var module = Foxtrick.modules[i]; 
		
		// skip disabled modules
		var enabled = Boolean(FoxtrickPrefs.getBool("module." + module.MODULE_NAME + ".enabled"));
		if (module.CORE_MODULE) enabled = true;
		if (!enabled) continue;

		// select layout
		var cssList = module.CSS;
		if (localStorage["isRTL"]=='true' && typeof(module.CSS_RTL)!= 'undefined')
			cssList = module.CSS_RTL;
		if (localStorage["isStandard"]=='false' && typeof(module.CSS_SIMPLE)!= 'undefined')
			cssList = module.CSS_SIMPLE;					
		if (localStorage["isStandard"]=='false' && localStorage["isRTL"]=='true' && typeof(module.CSS_SIMPLE_RTL)!= 'undefined' )
			cssList = module.CSS_SIMPLE_RTL;
		
		// get css text from selected resource
		if (cssList) {
			if (typeof(cssList) === "string")
				cssTextCollection += getCssFromResource(cssList);
			else if (typeof(cssList) === "object") {
				for (var j in cssList)
					cssTextCollection += getCssFromResource(cssList[j]);
			}
		}
		// load module options CSS
		if (module.OPTIONS_CSS) {
			for (var j = 0; j < module.OPTIONS_CSS.length; ++j) {
				var enabled = Boolean(FoxtrickPrefs.getBool("module." + module.MODULE_NAME + "." + module.OPTIONS[j] + ".enabled"));
				if (!enabled) continue;
				
				var cssList = '';
				if (typeof(module.OPTIONS_CSS)!= 'undefined' && typeof(module.OPTIONS_CSS[j])!= 'undefined')
					cssList = module.OPTIONS_CSS[j];
				if (localStorage["isRTL"]=='true' && typeof(module.OPTIONS_CSS_RTL)!= 'undefined' && typeof(module.OPTIONS_CSS_RTL[j])!= 'undefined')
					cssList = module.OPTIONS_CSS_RTL[j];
				if (localStorage["isStandard"]=='false' && typeof(module.OPTIONS_CSS_SIMPLE)!= 'undefined' && typeof(module.OPTIONS_CSS_SIMPLE[j])!= 'undefined')
					cssList = module.OPTIONS_CSS_SIMPLE[j];					
				if (localStorage["isStandard"]=='false' && localStorage["isRTL"]=='true' && typeof(module.OPTIONS_CSS_RTL_SIMPLE)!= 'undefined' && typeof(module.OPTIONS_CSS_RTL_SIMPLE[j])!= 'undefined')
					cssList = module.OPTIONS_CSS_RTL_SIMPLE[j];
				cssTextCollection += getCssFromResource(cssList);
			}
		}
	}
};

function init() { 
	var core = [ FoxtrickPrefs, Foxtrickl10n, Foxtrick.XMLData ];
	for (var i in core) 
		core[i].init(); 
		
	cssTextCollection = '';
	var serializer = new XMLSerializer();
	currency = serializer.serializeToString(Foxtrick.XMLData.htCurrencyXml);
	dateFormat = serializer.serializeToString(Foxtrick.XMLData.htdateformat);
	about = serializer.serializeToString(Foxtrick.XMLData.aboutXML);
	worldDetails = serializer.serializeToString(Foxtrick.XMLData.worldDetailsXml);
	var serializer = new XMLSerializer();
	for (var i in Foxtrickl10n.htLanguagesXml) {
		htLanguagesText[i] = serializer.serializeToString(Foxtrickl10n.htLanguagesXml[i]);
	} 
	makeCssTextCollection();
}

function update() {
	FoxtrickPrefs.init();
	Foxtrickl10n.init();
	makeCssTextCollection();				
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key))
        	++size;
    }
    return size;
};

init();

chrome.browserAction.onClicked.addListener(function() { FoxtrickPrefs.disable(); });

// one-time message channel
// use with chrome.extension.sendRequest({req : "{TYPE}", parameters...}, callback)
// callback will be called with a sole Object as argument
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	try {
		errors = '';
		var updatePrefs = function () {
			// @callback_param pref - user preferences
			// @callback_param prefDefault - default preferences
			update();
			localStorage.removeItem("preferences.updated");
			errors += 'updatePrefs\n';
			errors += 'css: '+(cssTextCollection!='')+'\n'
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
			if (localStorage["preferences.updated"]
				&& JSON.parse(localStorage["preferences.updated"])) {
					updatePrefs();
			}
			
			sendResponse({
				cssText : cssTextCollection,

				pref : FoxtrickPrefs.pref,
				prefDefault : FoxtrickPrefs.prefDefault,

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
		
				error : errors				
			});
			} catch(e) {
				errors += 'Foxtrick request.req == "init": ' + e ;
				sendResponse({error : errors});				
			}
		}
		else if (request.req == "getPrefs") {
			// @callback_param pref - user preferences
			// @callback_param prefDefault - default preferences
			if (localStorage["preferences.updated"]
				&& JSON.parse(localStorage["preferences.updated"])) {
					updatePrefs();
			}
			sendResponse({
				pref : FoxtrickPrefs.pref,
				prefDefault : FoxtrickPrefs.prefDefault
			});
		}
		else if (request.req == "setPrefs") {
			// @param prefs - preferences to be saved

			// prevent from setting empty preferences, use clearPrefs below
			// instead
			if (typeof(request.prefs) != "object"
				|| Object.size(request.prefs) == 0)
				return;

			localStorage.clear();
			for (var i in request.prefs)
				localStorage.setItem(i, JSON.stringify(request.prefs[i]));
			update();
		}
		else if (request.req == "clearPrefs") {
			localStorage.clear();
			update();
		}
		else if (request.req == "locale") {
			htLanguagesText = getLocale();
			sendResponse({
				htLang : htLanguagesText,
				propsDefault : Foxtrickl10n.properties_default,
				props : Foxtrickl10n.properties,
				screenshots : Foxtrickl10n.screenshots
			});
		}
		else if (request.req == "getCss") {
			// @param files - a string of files to be added, separated with "\n"
			var cssUrl = request.files.split("\n");
			cssTextCollection='';
			for (var i = 0; i < cssUrl.length; ++i) {
				cssTextCollection += getCssFromResource(cssUrl[i]);
			}
			sendResponse({cssText : cssTextCollection,	error : errors });
		}
		else if (request.req == "xmlResource") {
			var xmlResource = getXmlResource();
			sendResponse({
				currency : xmlResource.currency,
				dateFormat : xmlResource.dateFormat,
				about : xmlResource.about,
				worldDetails : xmlResource.worldDetails,
				league : Foxtrick.XMLData.League,
				countryToLeague : Foxtrick.XMLData.countryToLeague
			});
		}
		else if (request.req == "xml") {
			// @param url - the URL of resource to load with XMLHttpRequest
			// @callback_param data - response text
			// @callback_param status - HTTP status of request
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function(aEvt) {
				try {
					if (xhr.readyState == 4) {
						sendResponse({data : xhr.responseText, status : xhr.status});
					}
				}
				catch (e) {
					// port may be disconnected
					sendResponse({ error : 'Foxtrick - background xml: ' + e });			
				}
			};
			xhr.open("GET", request.url, true);
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
				clipboardStore = document.getElementById("clipboard-store");
				clipboardStore.value = request.content;
				clipboardStore.select();
				document.execCommand("Copy");
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
			sessionStore[request.key] = request.value;
		}
		else if (request.req == "sessionGet") {
			// @param key - key of session store
			// @callback_param value - contains the object stored
			sendResponse({value : sessionStore[request.key]});
		}
	}
	catch (e) {
		sendResponse({ error : 'Foxtrick - background onRequest: ' + e });			
	}
});



/*
// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// A generic onclick callback function.
function genericOnClick(info, tab) {
  alert("item " + info.menuItemId + " was clicked");
  alert("info: " + JSON.stringify(info));
  alert("tab: " + JSON.stringify(tab));
}

// Create one test item for each context type.
var contexts = ["page","selection","link","editable","image","video",
                "audio"];
for (var i = 0; i < contexts.length; i++) {
  var context = contexts[i];
  var title = "Test '" + context + "' menu item";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});
  alert("'" + context + "' item:" + id);
}


// Create a parent item and two children.
var parent = chrome.contextMenus.create({"title": "Test parent item"});
var child1 = chrome.contextMenus.create(
  {"title": "Child 1", "parentId": parent, "onclick": genericOnClick});
var child2 = chrome.contextMenus.create(
  {"title": "Child 2", "parentId": parent, "onclick": genericOnClick});
alert("parent:" + parent + " child1:" + child1 + " child2:" + child2);


// Create some radio items.
function radioOnClick(info, tab) {
  alert("radio item " + info.menuItemId +
              " was clicked (previous checked state was "  +
              info.wasChecked + ")");
}
var radio1 = chrome.contextMenus.create({"title": "Radio 1", "type": "radio",
                                         "onclick":radioOnClick});
var radio2 = chrome.contextMenus.create({"title": "Radio 2", "type": "radio",
                                         "onclick":radioOnClick});
alert("radio1:" + radio1 + " radio2:" + radio2);


// Create some checkbox items.
function checkboxOnClick(info, tab) {
  alert('ss');
  alert(JSON.stringify(info));
  alert("checkbox item " + info.menuItemId +
              " was clicked, state is now: " + info.checked +
              "(previous state was " + info.wasChecked + ")");

}
var checkbox1 = chrome.contextMenus.create(
  {"title": "Checkbox1", "type": "checkbox", "onclick":checkboxOnClick});
var checkbox2 = chrome.contextMenus.create(
  {"title": "Checkbox2", "type": "checkbox", "onclick":checkboxOnClick});
alert("checkbox1:" + checkbox1 + " checkbox2:" + checkbox2);


// Intentionally create an invalid item, to show off error checking in the
// create callback.
alert("About to try creating an invalid item - an error about " +
            "item 999 should show up");
chrome.contextMenus.create({"title": "Oops", "parentId":999}, function() {
  if (chrome.extension.lastError) {
    alert("Got expected error: " + chrome.extension.lastError.message);
  }
});
*/