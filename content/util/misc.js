/*
 * misc.js
 * Miscellaneous utilities
 */

if (!Foxtrick) var Foxtrick = {};

Foxtrick.selectFileSave = function (parentWindow) {
	try {
		if (Foxtrick.BuildFor === "Gecko") {
			var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker);
			fp.init(parentWindow, "", fp.modeSave);
			var ret=fp.show();
			if (ret == fp.returnOK || ret==fp.returnReplace) {
				return fp.file.path;
			}
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return null;
}

Foxtrick.selectFile = function (parentWindow) {
	try {
		if (Foxtrick.BuildFor === "Gecko") {
			var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker);
			fp.init(parentWindow, "", fp.modeOpen);
			if (fp.show() == fp.returnOK) {
				return fp.file.path;
			}
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return null;
}

// Play the sound with URL given as parameter.
// Gecko only supports WAV format at the moment.
// May throw an error if unable to play the sound.
Foxtrick.playSound = function(url) {
	if (Foxtrick.BuildFor === "Gecko") {
		var soundService = Components.classes["@mozilla.org/sound;1"].getService(Components.interfaces.nsISound);
		var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		soundService.play(ioService.newURI(url, null, null));
	}
	else if (Foxtrick.BuildFor === "Chrome") {
		var music = new Audio(url);
		music.play();
	}
}

Foxtrick.map = function(array, func) {
	var ret = [];
	for (var i = 0; i < array.length; ++i)
		ret.push(func(array[i]));
	return ret;
}

Foxtrick.filter = function(array, func) {
	var ret = [];
	for (var i = 0; i < array.length; ++i) {
		if (func(array[i]))
			ret.push(array[i]);
	}
	return ret;
}

Foxtrick.some = function(array, func) {
	for (var i = 0; i < array.length; ++i)
		if (func(array[i]))
			return true;
	return false;
}

Foxtrick.copyStringToClipboard = function (string) {
	if (Foxtrick.BuildFor === "Gecko") {
		var gClipboardHelper = Components
			.classes["@mozilla.org/widget/clipboardhelper;1"]
			.getService(Components.interfaces.nsIClipboardHelper);
		gClipboardHelper.copyString(string);
	}
	else if (Foxtrick.BuildFor === "Chrome") {
		chrome.extension.sendRequest({req : "clipboard", content : string});
	}
}

Foxtrick.in_array = function(a, n) {
	return Foxtrick.some(a, function(t) { return n === t; });
}

Foxtrick.newTab = function(url) {
	if (Foxtrick.BuildFor == "Gecko") {
		gBrowser.selectedTab = gBrowser.addTab(url);
	}
	else if (Foxtrick.BuildFor == "Chrome") {
		chrome.extension.sendRequest({
			req : "newTab",
			url : url
		})
	}
}

Foxtrick.load = function(url, callback, crossSite) {
	if (Foxtrick.BuildFor == "Chrome" && Foxtrick.chromeContext() == "content"
		&& crossSite) {
		// the evil Chrome that requires us to send a message to
		// background script for cross-site requests
		chrome.extension.sendRequest({req : "xml", url : url},
			function(response) {
				try {
					callback(response.data, response.status);
				}
				catch (e) {
					Foxtrick.dump("Uncaught callback error:");
					Foxtrick.log(e);
				}
			}
		);
	}
	else {
		var req = new XMLHttpRequest();
		if (!callback) {
			req.open("GET", url, false);
			req.send(null);
			var response = req.responseText;
			return response;
		}
		else {
			req.open("GET", url, true);
			req.onreadystatechange = function(aEvt) {
				if (req.readyState == 4) {
					try {
						callback(req.responseText, req.status);
					}
					catch (e) {
						Foxtrick.dump("Uncaught callback error:");
						Foxtrick.log(e);
					}
				}
			};
			req.send(null);
		}
	}
};

Foxtrick.loadXml = function(url, callback, crossSite) {
	if (callback) {
		Foxtrick.load(url, function(text, status) {
			try {
				var parser = new DOMParser();
				var xml = parser.parseFromString(text, "text/xml");
				try {
					callback(xml, status);
				}
				catch (e) {
					Foxtrick.log("Foxtrick.loadXml: Uncaught callback error:" , url,  ' ', text, ' ', status, ' ', text , " ", e);
				}
			}
			catch (e) {
				// invalid XML
				Foxtrick.log("Foxtrick.loadXml a: Cannot parse XML:\n" , url,  ' ', text, ' ', status, ' ', text , " ", e);
				callback(null, status);
			}
		}, crossSite);
	}
	else {
		try {
			var text = Foxtrick.load(url);
			var parser = new DOMParser();
			var xml = parser.parseFromString(text, "text/xml");
			return xml;
		}
		catch (e) {
			// invalid XML
			Foxtrick.log("Foxtrick.loadXml b: Cannot parse XML:\n" , url,  ' ', text, ' ', status, ' ', text , " ", e);
			return null;
		}
	}
}

Foxtrick.XML_evaluate = function (xmlresponse, basenodestr, labelstr, valuestr, value2str, value3str) {
	var result = new Array();
	if (xmlresponse) {
		//var nodes = xmlresponse.evaluate(basenodestr, xmlresponse, null, 7 , null);
		var splitpath = basenodestr.split(/\/|\[/g);
		var base = xmlresponse;
			for (var j=0;j<splitpath.length-1;++j) {
				base = base.getElementsByTagName(splitpath[j])[0];
			}
		var nodes = base.getElementsByTagName(splitpath[j]);
		for (var i = 0; i < nodes.length; i++) {
		//for (var i = 0; i < nodes.snapshotLength; i++) {
			//var node = nodes.snapshotItem(i);
			var node = nodes[i];
			var label = node.getAttribute(labelstr);
			var value = null;
			var value2=null;
			var value3=null;

			if (valuestr) value = node.getAttribute(valuestr);
			if (value2str) value2 = node.getAttribute(value2str);
			if (value3str) value3 = node.getAttribute(value3str);

			if (valuestr) result.push([label,value,value2,value3]);
			else result.push(label);
		}
	}
	return result;
}

Foxtrick.xml_single_evaluate = function (xmldoc, path, attribute) {
	var obj = xmldoc.evaluate(path, xmldoc, null, xmldoc.DOCUMENT_NODE, null).singleNodeValue;
	if (obj) {
		if (attribute)
			return obj.attributes.getNamedItem(attribute).textContent;
		else
			return obj;
	}
	else
		return null;
}

/*
 * sessionSet() and sessionGet() are a pair of functions that can store some
 * useful information that has its life spanning the browser session.
 * The stored value must be a JSON-serializable object, or of native types.
 * Since for Google Chrome, the content scripts cannot store values across
 * pages, we store it in background script and thus requires asynchronous
 * callback in sessionGet().
 */
Foxtrick.sessionStore = {};
Foxtrick.sessionSet = function(key, value) {
	if (Foxtrick.BuildFor === "Gecko") {
		Foxtrick.sessionStore[key] = value;
	}
	else if (Foxtrick.BuildFor === "Chrome") {
		chrome.extension.sendRequest({
			req : "sessionSet",
			key : key,
			value : value
		});
	}
};
Foxtrick.sessionGet = function(key, callback) {
	if (Foxtrick.BuildFor === "Gecko") {
		callback(Foxtrick.sessionStore[key]);
	}
	else if (Foxtrick.BuildFor === "Chrome") {
		chrome.extension.sendRequest({
				req : "sessionGet",
				key : key
			}, function(n) { callback(n.value); });
	}
};
