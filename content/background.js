var resources_changed = true;
var newstart = true;

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
				var ntId = serializer.serializeToString(Foxtrick.XMLData.htNTidsXml);
				var dateFormat = serializer.serializeToString(Foxtrick.XMLData.htdateformat);
				var about = serializer.serializeToString(Foxtrick.XMLData.aboutXML);
				port.postMessage({
					currency : currency,
					ntId : ntId,
					dateFormat : dateFormat,
					about : about,
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
						alert('css xhr '+e);
						alert(cssUrl[i]);
					}
				}
			}
			catch (e) {
				alert('error msg.reqtype : '+msg.reqtype+' '+e);
			}
		});
	}
	if (port.name == "alert") {
		port.onMessage.addListener(function(msg) {
			try {
				if (msg.reqtype == "show_note") {
					// Create a simple text notification:
					var notification = webkitNotifications.createNotification(
						"resources/img/hattrick-logo.png", // logo location
						"Hattrick", // notification title
						msg.message // notification body text
					);

					// Then show the notification.
					notification.show();

					// close after 5 sec
					setTimeout(function(){
							notification.cancel();
						}, 5000);
				}
				else if (msg.reqtype == "get_old_alerts") {
					if (newstart) port.postMessage({response:'resetalert'});
					else port.postMessage({response:'noresetalert'});
					newstart = false;
				}
				else if (msg.reqtype == "set_mail_count") {
					mail_count = msg.mail_count;
					getInboxCount(function(count) {
							updateUnreadCount(String(parseInt(mail_count)+parseInt(forum_count))+'/'+String(unreadticker_count));
					});
				}
				else if (msg.reqtype == "set_forum_count") {
					forum_count = msg.forum_count;
					getInboxCount(function(count) {
							updateUnreadCount(String(parseInt(mail_count)+parseInt(forum_count))+'/'+String(unreadticker_count));
					});
				}
				 else port.postMessage({});
			}
			catch (e) {
				console.log('error msg.reqtype : '+msg.reqtype+' '+e);
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


chrome.extension.onConnect.addListener(function(port) {
	if (port.name == "htms") {
		port.onMessage.addListener(function(msg) {
			if (msg.reqtype=="get_htms") {
				var req = new XMLHttpRequest();
				var abortTimerId = window.setTimeout(function(){req.abort()}, 20000);
				var stopTimer = function(){window.clearTimeout(abortTimerId); };
				req.onreadystatechange = function(){
					if (req.readyState == 4){
						stopTimer();
						port.postMessage({set:'htms', responseText: req.responseText});
					}
				}
				req.open('GET', msg.url , true);
				req.send(null);
			}
			else
				port.postMessage({});
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

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.req == "xml") {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(aEvt) {
			if (xhr.readyState == 4) {
				sendResponse({data : xhr.responseText});
			}
		};
		xhr.open("GET", request.url, true);
		xhr.send();
	}
	else if (request.req == "newTab") {
		chrome.tabs.create({url : request.url});
	}
	else if (request.req == "clipboard") {
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
});
