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
		var errors = '';
		var updatePrefs = function () {
			// @callback_param pref - user preferences
			// @callback_param prefDefault - default preferences
			update();
			localStorage.removeItem("preferences.updated");
		};		
		var getLocale = function () {
			// @callback_param htLang - object of htlang.xml in plain text
			// @callback_param propsDefault - foxtrick.properties (master)
			// @callback_param props - foxtrick.properties (localized)
			// @callback_param screenshots - foxtrick.screenshots
			var htLanguagesText = {};
			var serializer = new XMLSerializer();
			for (var i in Foxtrickl10n.htLanguagesXml) {
				htLanguagesText[i] = serializer.serializeToString(Foxtrickl10n.htLanguagesXml[i]);
			}
			return htLanguagesText;
		};
		var getXmlResource = function () {		
			var serializer = new XMLSerializer();
			var currency = serializer.serializeToString(Foxtrick.XMLData.htCurrencyXml);
			var dateFormat = serializer.serializeToString(Foxtrick.XMLData.htdateformat);
			var about = serializer.serializeToString(Foxtrick.XMLData.aboutXML);
			var worldDetails = serializer.serializeToString(Foxtrick.XMLData.worldDetailsXml);
			return {currency:currency, dateFormat:dateFormat, about:about, worldDetails:worldDetails};
		};
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
		var replaceExtensionDirectory = function(cssTextCollection) {		
			// replace ff chrome reference by google chrome refs
			var exturl = chrome.extension.getURL("");
			return cssTextCollection.replace(RegExp("chrome://foxtrick/", "g"), exturl);
		};

		if (request.req == "init") {
			try {
				updatePrefs();
				var htLanguagesText = getLocale();
				var xmlResource = getXmlResource();

				
				var cssTextCollection = '';
				for (var i in request.css_files) { 
					// skip disabled modules
					var enabled = Boolean(FoxtrickPrefs.getBool("module." + i + ".enabled"));
					if (request.css_files[i].CORE_MODULE) enabled = true;
					if (!enabled) continue;

					// select layout
					var cssList = request.css_files[i].CSS;
					if (localStorage["isRTL"]=='true' && typeof(request.css_files[i].CSS_RTL)!= 'undefined')
						cssList = request.css_files[i].CSS_RTL;
					if (localStorage["isStandard"]=='false' && typeof(request.css_files[i].CSS_SIMPLE)!= 'undefined')
						cssList = request.css_files[i].CSS_SIMPLE;					
					if (localStorage["isStandard"]=='false' && localStorage["isRTL"]=='true' && typeof(request.css_files[i].CSS_SIMPLE_RTL)!= 'undefined' )
						cssList = request.css_files[i].CSS_SIMPLE_RTL;
					
					// get css text from selected resource
					if (cssList) {
						if (typeof(cssList) === "string")
							cssTextCollection += getCssFromResource(cssList);
						else if (typeof(cssList) === "object") {
							for (var j in cssList)
								cssTextCollection += getCssFromResource(cssList[j]);
						}
					}
				}				
				cssTextCollection = replaceExtensionDirectory(cssTextCollection);
				
				// send all back now
				sendResponse({
					cssText : cssTextCollection,

					pref : FoxtrickPrefs.pref,
					prefDefault : FoxtrickPrefs.prefDefault,

					htLang : htLanguagesText,
					propsDefault : Foxtrickl10n.properties_default,
					props : Foxtrickl10n.properties,
					screenshots : Foxtrickl10n.screenshots,

					currency : xmlResource.currency,
					dateFormat : xmlResource.dateFormat,
					about : xmlResource.about,
					worldDetails : xmlResource.worldDetails,
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
			var htLanguagesText = getLocale();
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
			var cssTextCollection='';
			for (var i = 0; i < cssUrl.length; ++i) {
				cssTextCollection += getCssFromResource(cssUrl[i]);
			}
			cssTextCollection = replaceExtensionDirectory(cssTextCollection);
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
			chrome.tabs.create({url : request.url, index: 1});
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
