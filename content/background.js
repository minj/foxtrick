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

// send resource to content scripts
chrome.extension.onConnect.addListener(function(port) {
	if (port.name == "pref") {
		port.onMessage.addListener(function(msg) {
			function post() {
				port.postMessage({
					pref : FoxtrickPrefs.pref,
					prefDefault : FoxtrickPrefs.prefDefault
				});
			}
			if (msg.req == "get") {
				if (localStorage["preferences.updated"]
					&& JSON.parse(localStorage["preferences.updated"])) {
					update();
					localStorage.removeItem("preferences.updated");
				}
				post();
			}
			else if (msg.req == "set") {
				localStorage.clear();
				for (var i in msg.pref)
					localStorage.setItem(i, JSON.stringify(msg.pref[i]));
				update();
				post();
			}
		});
	}
	else if (port.name == "locale") {
		port.onMessage.addListener(function(msg) {
			if (msg.req == "get") {
				var htLanguagesText = {};
				var serializer = new XMLSerializer();
				for (var i in Foxtrickl10n.htLanguagesXml) {
					htLanguagesText[i] = serializer.serializeToString(Foxtrickl10n.htLanguagesXml[i]);
				}
				port.postMessage({
					htLang : htLanguagesText,
					propsDefault : Foxtrickl10n.properties_default,
					props : Foxtrickl10n.properties,
					screenshots : Foxtrickl10n.screenshots
				});
			}
		});
	}
	else if (port.name == "xml") {
		port.onMessage.addListener(function(msg) {
			if (msg.req == "get") {
				var serializer = new XMLSerializer();
				var currency = serializer.serializeToString(Foxtrick.XMLData.htCurrencyXml);
				var dateFormat = serializer.serializeToString(Foxtrick.XMLData.htdateformat);
				var about = serializer.serializeToString(Foxtrick.XMLData.aboutXML);
				var worldDetails = serializer.serializeToString(Foxtrick.XMLData.worldDetailsXml);
				port.postMessage({
					currency : currency,
					dateFormat : dateFormat,
					about : about,
					worldDetails : worldDetails,
					league : Foxtrick.XMLData.League,
					countryToLeague : Foxtrick.XMLData.countryToLeague
				});
			}
		});
	}
	if (port.name == "ftpref-query") {
		port.onMessage.addListener(function(msg) {
			try {  //alert(msg.reqtype);
				if (msg.reqtype == "get_css_text") {
					try {
						var css_text_from_response='';
						var cssUrl = msg.css_filelist.split('\n');
						for (var i=0; i<cssUrl.length; ++i) {
							var css_text='';
							if (cssUrl[i].search(/^http|^chrome-extension/)!=-1) { //is a resource file. get cssfile content
								css_xhr = new XMLHttpRequest();
								css_xhr.open("GET", cssUrl[i], false);
								css_xhr.send();
								css_text = css_xhr.responseText;
							}
							else {  css_text = cssUrl[i]; // not a file but line is css text
							}
							if (css_text) {  // remove moz-document statement
								if ( css_text.search('@-moz-document')!=-1) {
									css_text = css_text.replace(/@-moz-document[^\{]+\{/,'');
									var closing_bracket = css_text.lastIndexOf('}');
									css_text = css_text.substr(0,closing_bracket)+css_text.substr(closing_bracket+1);
								}
							}
							css_text_from_response += css_text;
						}
						// replace ff chrome reference by google chrome refs
						var exturl = chrome.extension.getURL('');
						css_text_from_response = css_text_from_response.replace(RegExp("chrome://foxtrick/", "g"), exturl);

						port.postMessage({set:'css_text_set', css_text: css_text_from_response});
					}
					catch (e) {
						Foxtrick.dumpError(e);
					}
				}
			}
			catch (e) {
				alert('error msg.reqtype : '+msg.reqtype+' '+e);
			}
		});
	}
	if (port.name == "chatoldserver") {
		port.onMessage.addListener(function(msg) {
			if (msg.reqtype == "set_last_server") {
				localStorage['lastserver'] = msg.lastserver;
			}
			else if (msg.reqtype == "get_last_server") {
				port.postMessage({response:'lastserver', lastserver:localStorage['lastserver']});
			}
		});
	}
});

// reload strings after lang change
chrome.extension.onConnect.addListener(function(port) {
	if (port.name == "setpref") {
		port.onMessage.addListener(function(msg) {
			localStorage[msg.pref] = msg.value;
			if (msg.pref=="extensions.foxtrick.prefs.htLanguage") {
				listUrl = chrome.extension.getURL('locale/'+msg.value+"/foxtrick.properties");
				propertiesxhr.open("GET", listUrl, false);
				propertiesxhr.send();
				properties = propertiesxhr.responseText;
				port.postMessage({set:"setlang", properties: propertiesxhr.responseText, from: msg.from});
			}
		});
	}
});

// one-time message channel
// use with chrome.extension.sendRequest({req : "{TYPE}", parameters...}, callback)
// callback will be called with a sole Object as argument
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.req == "xml") {
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
