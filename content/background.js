var newstart = true;

var sessionStore = {};

function init() {
	var core = [ FoxtrickPrefs, Foxtrickl10n, Foxtrick.XMLData ];
	for (var i in core)
		core[i].init();
}

function update() {
	FoxtrickPrefs.init();
	Foxtrickl10n.init();
}

init();

chrome.browserAction.onClicked.addListener(function() { FoxtrickPrefs.disable(); });

// one-time message channel
// use with chrome.extension.sendRequest({req : "{TYPE}", parameters...}, callback)
// callback will be called with a sole Object as argument
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.req == "getPrefs") {
		// @callback_param pref - user preferences
		// @callback_param prefDefault - default preferences
		if (localStorage["preferences.updated"]
			&& JSON.parse(localStorage["preferences.updated"])) {
			update();
			localStorage.removeItem("preferences.updated");
		}
		sendResponse({
			pref : FoxtrickPrefs.pref,
			prefDefault : FoxtrickPrefs.prefDefault
		});
	}
	else if (request.req == "setPrefs") {
		// @param prefs - preferences to be saved
		localStorage.clear();
		for (var i in request.prefs)
			localStorage.setItem(i, JSON.stringify(request.prefs[i]));
		update();
	}
	else if (request.req == "locale") {
		// @callback_param htLang - object of htlang.xml in plain text
		// @callback_param propsDefault - foxtrick.properties (master)
		// @callback_param props - foxtrick.properties (localized)
		// @callback_param screenshots - foxtrick.screenshots
		var htLanguagesText = {};
		var serializer = new XMLSerializer();
		for (var i in Foxtrickl10n.htLanguagesXml) {
			htLanguagesText[i] = serializer.serializeToString(Foxtrickl10n.htLanguagesXml[i]);
		}
		sendResponse({
			htLang : htLanguagesText,
			propsDefault : Foxtrickl10n.properties_default,
			props : Foxtrickl10n.properties,
			screenshots : Foxtrickl10n.screenshots
		});
	}
	else if (request.req == "addCss") {
		// @param files - a string of files to be added, separated with "\n"
		// @callback_param cssText - string of CSS content to be added
		try {
			var responseText = "";
			var cssUrl = request.files.split("\n");
			for (var i = 0; i < cssUrl.length; ++i) {
				var css_text = "";
				if (cssUrl[i].search(/^http|^chrome-extension/) != -1) {
					// a resource file, get css file content
					css_xhr = new XMLHttpRequest();
					css_xhr.open("GET", cssUrl[i], false);
					css_xhr.send();
					css_text = css_xhr.responseText;
				}
				else {
					// not a file but line is css text
					css_text = cssUrl[i];
				}
				if (css_text) {
					// remove moz-document statement
					if (css_text.search(/@-moz-document/)!=-1) {
						css_text = css_text.replace(/@-moz-document[^\{]+\{/, "");
						var closing_bracket = css_text.lastIndexOf("}");
						css_text = css_text.substr(0, closing_bracket)+css_text.substr(closing_bracket+1);
					}
				}
				responseText += css_text;
			}
			// replace ff chrome reference by google chrome refs
			var exturl = chrome.extension.getURL("");
			responseText = responseText.replace(RegExp("chrome://foxtrick/", "g"), exturl);

			sendResponse({cssText : responseText});
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
	else if (request.req == "xmlResource") {
		var serializer = new XMLSerializer();
		var currency = serializer.serializeToString(Foxtrick.XMLData.htCurrencyXml);
		var dateFormat = serializer.serializeToString(Foxtrick.XMLData.htdateformat);
		var about = serializer.serializeToString(Foxtrick.XMLData.aboutXML);
		var worldDetails = serializer.serializeToString(Foxtrick.XMLData.worldDetailsXml);
		sendResponse({
			currency : currency,
			dateFormat : dateFormat,
			about : about,
			worldDetails : worldDetails,
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
			if (xhr.readyState == 4) {
				sendResponse({data : xhr.responseText, status : xhr.status});
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
});
