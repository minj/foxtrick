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
	try {
		var ret = [];
		for (var i = 0; i < array.length; ++i)
			ret.push(func(array[i]));
		return ret;
	} catch(e) {Foxtrick.log('Uncaught function error: ',e)}
}

Foxtrick.filter = function(array, func) {
	try {
		var ret = [];
		for (var i = 0; i < array.length; ++i) {
			if (func(array[i]))
				ret.push(array[i]);
		}
		return ret;
	} catch(e) {Foxtrick.log('Uncaught function error: ',e)}
}

Foxtrick.some = function(array, func) {
	try {
		for (var i = 0; i < array.length; ++i)
			if (func(array[i]))
				return true;
		return false;
	} catch(e) {Foxtrick.log('Uncaught function error: ',e)}
}

/**
 * Return an array with duplicate items reduced to one
 */
Foxtrick.unique = function(array) {
	var ret = [];
	var n = array.length;
    for (var i = 0; i < n; ++i) {
		for (var j = i + 1; j < n; ++j) {
			if (array[i] === array[j])
				j = ++i;
		}
		ret.push(array[i]);
	}
    return ret;
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

Foxtrick.version = function() {
	//FoxtrickPrefs.deleteValue("version"); what is that for, is never set. 
	return FoxtrickPrefs.getString("version");
};

Foxtrick.isPageHref = function(page, href) {
	var htpage_regexp = new RegExp(page.replace(/\./g,'\\.').replace(/\?/g,'\\?'), "i");
	return href.replace(/#.+/,'').search(htpage_regexp) > -1;
}

Foxtrick.getHref = function(doc) {
	return doc.location.href;
}

Foxtrick.isHt = function(doc) {
	return (Foxtrick.getPanel(doc) !== null)
		&& (doc.getElementById("aspnetForm") !== null);
}

Foxtrick.isHtUrl = function(url) {
	var htMatches = [
		new RegExp("^http://www\\d{2}\.hattrick\.org(/|$)", "i"),
		new RegExp("^http://stage\.hattrick\.org(/|$)", "i"),
		new RegExp("^http://hattrick\.interia\.pl(/|$)", "i"),
		new RegExp("^http://hattrick\.uol\.com\.br(/|$)", "i")
	];
	return Foxtrick.some(htMatches, function(re) { return url.match(re) != null; });
}

Foxtrick.isStage = function(doc) {
	const stage_regexp = /http:\/\/stage\.hattrick\.org/i;
	return (Foxtrick.getHref(doc).search(stage_regexp) > -1);
}

Foxtrick.isLoginPage = function(doc) { 
	return (doc.getElementById('teamLinks').getElementsByTagName('a').length===0);
}
		
Foxtrick.getPanel = function(doc) {
	try {
		if (doc.getElementsByClassName("hattrick").length > 0)
			return doc.getElementsByClassName("hattrick")[0];
		else if (doc.getElementsByClassName("hattrickNoSupporter").length > 0)
			return doc.getElementsByClassName("hattrickNoSupporter")[0];
		else
			return null;
	}
	catch (e) {
		return null;
	}
}

Foxtrick.setLastHost = function(host) {
	FoxtrickPrefs.setString("last-host", String(host));
}

Foxtrick.getLastHost = function(host) {
	return FoxtrickPrefs.getString("last-host") || "http://www.hattrick.org";
}

Foxtrick.setLastPage = function(host) {
	FoxtrickPrefs.setString("last-page", String(host));
}

Foxtrick.getLastPage = function(host) {
	return FoxtrickPrefs.getString("last-page") || "http://www.hattrick.org";
}

Foxtrick.stopListenToChange = function (doc) {
	var content = doc.getElementById("content");
	content.removeEventListener("DOMSubtreeModified", Foxtrick.entry.change, true);
}

Foxtrick.startListenToChange = function(doc) {
	var content = doc.getElementById("content");
	content.addEventListener("DOMSubtreeModified", Foxtrick.entry.change, true);
}

/** Insert text in given textarea at the current position of the cursor */
Foxtrick.insertAtCursor = function(textarea, text) {
	textarea.value = textarea.value.substring(0, textarea.selectionStart)
		+ text
		+ textarea.value.substring(textarea.selectionEnd, textarea.value.length);
}

Foxtrick.replaceExtensionDirectory = function(cssTextCollection) {		
	// replace ff chrome reference by google chrome refs
	var exturl = chrome.extension.getURL("");
	return cssTextCollection.replace(RegExp("chrome://foxtrick/", "g"), exturl);
};

Foxtrick.confirmDialog = function(msg) {
	if (Foxtrick.BuildFor === "Gecko") {
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);
		return promptService.confirm(null, null, msg);
	}
	else {
		return window.confirm(msg);
	}
}

Foxtrick.alert = function(msg) {
	if (Foxtrick.BuildFor === "Gecko") {
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);
		return promptService.alert(null, null, msg);
	}
	else {
		window.alert(msg);
	}
}

Foxtrick.unload_module_css = function() {
	Foxtrick.dump('unload permanents css\n');

	if (Foxtrick.BuildFor === "Gecko") {
	  for (var i in Foxtrick.modules) {
		var module = Foxtrick.modules[i];
		if (module.MODULE_NAME) {
			if (module.OLD_CSS && module.OLD_CSS!="")
				Foxtrick.unload_css_permanent (module.OLD_CSS);
			if (module.CSS_SIMPLE)
				Foxtrick.unload_css_permanent (module.CSS_SIMPLE);
			if (module.CSS_SIMPLE_RTL)
				Foxtrick.unload_css_permanent (module.CSS_SIMPLE_RTL) ;
			if (module.CSS)
				 Foxtrick.unload_css_permanent (module.CSS);
			if (module.CSS_RTL)
				Foxtrick.unload_css_permanent (module.CSS_RTL);
			if (module.OPTIONS_CSS)
				for (var k=0; k<module.OPTIONS_CSS.length; ++k)
					if (module.OPTIONS_CSS[k] != "") Foxtrick.unload_css_permanent (module.OPTIONS_CSS[k]) ;
			if (module.OPTIONS_CSS_RTL)
				for (var k=0; k<module.OPTIONS_CSS_RTL.length; ++k)
					if (module.OPTIONS_CSS_RTL[k] != "") Foxtrick.unload_css_permanent (module.OPTIONS_CSS_RTL[k]) ;
			if (module.OPTIONS_CSS_SIMPLE)
				for (var k=0; k<module.OPTIONS_CSS_SIMPLE.length; ++k)
					if (module.OPTIONS_CSS_SIMPLE[k] != "") Foxtrick.unload_css_permanent (module.OPTIONS_CSS_SIMPLE[k]) ;
			if (module.OPTIONS_CSS_RTL_SIMPLE)
				for (var k=0; k<module.OPTIONS_CSS_RTL_SIMPLE.length; ++k)
					if (module.OPTIONS_CSS_RTL_SIMPLE[k] != "") Foxtrick.unload_css_permanent (module.OPTIONS_CSS_RTL_SIMPLE[k]) ;
		}
	  }
	}
	else {
		Foxtrick.util.inject.removeStyleSheetSnippet(doc, 'module_css');
	}
}

Foxtrick.unload_css_permanent = function(cssList) {
	var unload_css_permanent_impl = function(css) {
		try {
			try {
				var sss = Components
					.classes["@mozilla.org/content/style-sheet-service;1"]
					.getService(Components.interfaces.nsIStyleSheetService);
				var ios = Components
					.classes["@mozilla.org/network/io-service;1"]
					.getService(Components.interfaces.nsIIOService);
				var uri = ios.newURI(css, null, null);
			}
			catch (e) {
				return;
			}
			// try unload
			if (sss.sheetRegistered(uri, sss.USER_SHEET)) {
				sss.unregisterSheet(uri, sss.USER_SHEET);
				//Foxtrick.dump('unload ' + css + '\n');
			}
		}
		catch (e) {
			Foxtrick.dump ('> load_css_permanent ' + e + '\n');
		}
	};
	if (Foxtrick.BuildFor === "Gecko") {
		if (typeof(cssList) === "string")
			unload_css_permanent_impl(cssList);
		else if (typeof(cssList) === "object") {
			for (var i in cssList)
				unload_css_permanent_impl(cssList[i]);
		}
	}
	else Foxtrick.util.inject.removeStyleSheetSnippet(doc, 'module_css');
}

Foxtrick.load_css_permanent = function(cssList) {
	var load_css_permanent_impl = function(css) {
		try {
			if (Foxtrick.BuildFor === "Gecko") {
				try {
					var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
					var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
					var uri = ios.newURI(css, null, null);
				}
				catch (e) {
					return;
				}
				// load
				if (!sss.sheetRegistered(uri, sss.USER_SHEET)) {
					sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
					//Foxtrick.dump('load ' + css + '\n');
				}
			}
			else if (Foxtrick.BuildFor === "Chrome") {
				Foxtrick.cssFiles += css+'\n';
			}
		}
		catch (e) {
			Foxtrick.dump ('> ERROR load_css_permanent: ' + css + '\n');
		}
	};
	if (typeof(cssList) === "string")
		load_css_permanent_impl(cssList);
	else if (typeof(cssList) === "object") {
		for (var i in cssList)
			load_css_permanent_impl(cssList[i]);
	}
}

Foxtrick.reload_css_permanent = function(css) {
	Foxtrick.unload_css_permanent(css);
	Foxtrick.load_css_permanent(css);
}

Foxtrick.reload_module_css = function(doc) {
	try {
		var isStandard = FoxtrickPrefs.getBool('isStandard');
		var isRTL = FoxtrickPrefs.getBool('isRTL');

		// unload all CSS files
		if (Foxtrick.BuildFor === "Gecko") 
			for (var i in Foxtrick.modules) {
				var module = Foxtrick.modules[i];
				var list = [module.OLD_CSS, module.CSS, module.CSS_SIMPLE, module.CSS_RTL, module.CSS_SIMPLE_RTL];
				for (var j = 0; j < list.length; ++j)
					if (list[j])
						Foxtrick.unload_css_permanent(list[j]);
				if (module.OPTIONS_CSS)
					for (var k=0; k<module.OPTIONS_CSS.length; ++k)
						if (module.OPTIONS_CSS[k] != "") Foxtrick.unload_css_permanent (module.OPTIONS_CSS[k]) ;
				if (module.OPTIONS_CSS_RTL)
					for (var k=0; k<module.OPTIONS_CSS_RTL.length; ++k)
						if (module.OPTIONS_CSS_RTL[k] != "") Foxtrick.unload_css_permanent (module.OPTIONS_CSS_RTL[k]) ;
				if (module.OPTIONS_CSS_SIMPLE)
					for (var k=0; k<module.OPTIONS_CSS_SIMPLE.length; ++k)
						if (module.OPTIONS_CSS_SIMPLE[k] != "") Foxtrick.unload_css_permanent (module.OPTIONS_CSS_SIMPLE[k]) ;
				if (module.OPTIONS_CSS_RTL_SIMPLE)
					for (var k=0; k<module.OPTIONS_CSS_RTL_SIMPLE.length; ++k)
						if (module.OPTIONS_CSS_RTL_SIMPLE[k] != "") Foxtrick.unload_css_permanent (module.OPTIONS_CSS_RTL_SIMPLE[k]) ;
			}
		else if (Foxtrick.BuildFor === "Chrome") {
			Foxtrick.util.inject.removeStyleSheetSnippet(doc, 'module_css');
			Foxtrick.cssFiles = "";
		}
		
		// load CSS
		for (var i in Foxtrick.modules) {
			var module = Foxtrick.modules[i];
			if (!FoxtrickPrefs.isModuleEnabled(module))
				continue;
			var loadCss = function(normal, simple, rtl, simpleRtl) {
				var loadSimpleRtl = function() {
					if (simpleRtl)
						Foxtrick.load_css_permanent(simpleRtl);
					else if (loadRtl(true))
						;
					else if (loadSimple(true))
						;
					else
						load();
				};
				var loadRtl = function(noFallback) {
					if (rtl)
						Foxtrick.load_css_permanent(rtl);
					else if (!noFallback)
						load();
					else
						return false;
					return true;
				};
				var loadSimple = function(noFallback) {
					if (simple)
						Foxtrick.load_css_permanent(simple);
					else if (!noFallback)
						load();
					else
						return false;
					return true;
				};
				var load = function() {
					if (normal)
						Foxtrick.load_css_permanent(normal);
				};
				if (!isStandard) {
					if (isRTL)
						loadSimpleRtl();
					else
						loadSimple();
				}
				else {
					if (isRTL)
						loadRtl();
					else
						load();
				}
			}

			// load module main CSS
			loadCss(module.CSS, module.CSS_SIMPLE, module.CSS_RTL, module.CSS_SIMPLE_RTL);

			// load module options CSS
			if (module.OPTIONS_CSS) {
				for (var j = 0; j < module.OPTIONS_CSS.length; ++j) {
					if (!FoxtrickPrefs.isModuleOptionEnabled(module, module.OPTIONS[j]))
						continue;
					loadCss(module.OPTIONS_CSS[j],
						module.OPTIONS_CSS_SIMPLE ? module.OPTIONS_CSS_SIMPLE[j] : null,
						module.OPTIONS_CSS_RTL ? module.OPTIONS_CSS_RTL[j] : null,
						module.OPTIONS_CSS_RTL_SIMPLE ? module.OPTIONS_CSS_RTL_SIMPLE[j] : null
						);
				}
			}
		}
		if (Foxtrick.BuildFor === "Chrome") {
			chrome.extension.sendRequest(
				{ req : "getCss", files : Foxtrick.cssFiles },
				function(data) {
					Foxtrick.log('getCss response');
					Foxtrick.util.inject.addStyleSheetSnippet(doc, data.cssText);
				}
			);
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
}


// loads css file from local resource and return a string with the content for injection into page
Foxtrick.getCssTextFromFile = function (cssUrl) {
	// @callback_param cssText - string of CSS content
	var css_text = "";
	if (cssUrl && cssUrl.search(/^http|^chrome-extension/) != -1) {
		try { 
			// a resource file, get css file content
			css_xhr = new XMLHttpRequest();
			css_xhr.open("GET", cssUrl, false);
			css_xhr.send();
			css_text = css_xhr.responseText;
		} catch(e) { Foxtrick.log('get css: ', cssUrl , ' ', e) }
	}
	else {
		// not a file. line is css text already
		css_text = cssUrl;
	}
	// remove moz-document statement
	if (css_text && css_text.search(/@-moz-document/)!=-1) {
		css_text = css_text.replace(/@-moz-document[^\{]+\{/, "");
		var closing_bracket = css_text.lastIndexOf("}");
		css_text = css_text.substr(0, closing_bracket) + css_text.substr(closing_bracket+1);
	}
	return css_text; 
};

// gets all css from modules.CSS settings
Foxtrick.getCssTextCollection = function() { 
	// @callback_param cssTextCollection - string of CSS content of all enabled modules and module options
	var cssTextCollection = '';
	for (var i in Foxtrick.modules) { 
		var module = Foxtrick.modules[i]; 
		
		// skip disabled modules
		if ( !module.CORE_MODULE &&  !FoxtrickPrefs.isModuleEnabled(module) ) 
			continue;
			
		// select layout
		var cssURL = module.CSS;
		if (localStorage["isRTL"]=='true' 
				&& typeof(module.CSS_RTL)!= 'undefined')
			cssURL = module.CSS_RTL;
		if (localStorage["isStandard"]=='false' 
				&& typeof(module.CSS_SIMPLE)!= 'undefined')
			cssURL = module.CSS_SIMPLE;
		if (localStorage["isStandard"]=='false' 
				&& localStorage["isRTL"]=='true' 
				&& typeof(module.CSS_SIMPLE_RTL)!= 'undefined' )
			cssURL = module.CSS_SIMPLE_RTL;
		
		// get css text from selected resource
		if (cssURL) {
			if (typeof(cssURL) === "string")
				cssTextCollection += Foxtrick.getCssTextFromFile(cssURL);
			else if (typeof(cssURL) === "object") {
				for (var j in cssURL)
					cssTextCollection += Foxtrick.getCssTextFromFile(cssURL[j]);
			}
		}
		// load module options CSS
		if (module.OPTIONS_CSS) {
			for (var j = 0; j < module.OPTIONS_CSS.length; ++j) {
				var enabled = FoxtrickPrefs.isModuleOptionEnabled( module, module.OPTIONS[j] );
				if (!enabled) continue;
				
				var cssURL = '';
				if (typeof(module.OPTIONS_CSS)!= 'undefined' 
						&& typeof(module.OPTIONS_CSS[j])!= 'undefined')
					cssURL = module.OPTIONS_CSS[j];
				if (localStorage["isRTL"]=='true' 
						&& typeof(module.OPTIONS_CSS_RTL)!= 'undefined' 
						&& typeof(module.OPTIONS_CSS_RTL[j])!= 'undefined')
					cssURL = module.OPTIONS_CSS_RTL[j];
				if (localStorage["isStandard"]=='false' 
						&& typeof(module.OPTIONS_CSS_SIMPLE)!= 'undefined' 
						&& typeof(module.OPTIONS_CSS_SIMPLE[j])!= 'undefined')
					cssURL = module.OPTIONS_CSS_SIMPLE[j];
				if (localStorage["isStandard"]=='false' && localStorage["isRTL"]=='true' 
						&& typeof(module.OPTIONS_CSS_RTL_SIMPLE)!= 'undefined' 
						&& typeof(module.OPTIONS_CSS_RTL_SIMPLE[j])!= 'undefined')
					cssURL = module.OPTIONS_CSS_RTL_SIMPLE[j];
				cssTextCollection += Foxtrick.getCssTextFromFile(cssURL);
			}
		}
	}
	return cssTextCollection;
};


Foxtrick.dumpCache = "";
Foxtrick.dumpFlush = function(doc) {
	if (doc.getElementById("page") != null
		&& FoxtrickPrefs.getBool("DisplayHTMLDebugOutput")
		&& Foxtrick.dumpCache != "") {
		var div = doc.getElementById("ft-log");
		if (div == null) {
			// create log container
			div = doc.createElement("div");
			div.id = "ft-log";
			var header = doc.createElement("h2");
			header.textContent = Foxtrickl10n.getString("foxtrick.log.header");
			div.appendChild(header);
			var pre = doc.createElement("pre");
			pre.textContent = Foxtrickl10n.getString("foxtrick.log.env")
				.replace(/%1/, Foxtrick.version())
				.replace(/%2/, Foxtrick.BuildFor)
				.replace(/%3/, FoxtrickPrefs.getString("htLanguage"))
				.replace(/%4/, Foxtrick.util.layout.isStandard(doc) ? "standard" : "simple")
				.replace(/%5/, Foxtrick.util.layout.isRtl(doc) ? "RTL" : "LTR");
			if (Foxtrick.isStage(doc)) pre.textContent += ', Stage';
			pre.textContent += "\n";
			div.appendChild(pre);
			// add to page
			var bottom = doc.getElementById("bottom");
			if (bottom)
				bottom.parentNode.insertBefore(div, bottom);
		}
		// add to log
		div.getElementsByTagName("pre")[0].textContent += Foxtrick.dumpCache;
		// clear the cache
		Foxtrick.dumpCache = "";
	}
}

// a wrapper around Foxtrick.log for compatibility
Foxtrick.dump = function(content) {
	Foxtrick.log(String(content).replace(/\s+$/, ""));
}

// outputs a list of strings/objects/errors to FoxTrick log
Foxtrick.log = function() {
	var i, concated = "";
	for (i = 0; i < arguments.length; ++i) {
		var content = arguments[i];
		var item = "";
		if (content instanceof Error) {
			if (Foxtrick.BuildFor == "Gecko") {
				item = content.fileName + " (" + content.lineNumber + "): " + String(content) + "\n";
				item += "Stack trace: " + content.stack.substr(0,10000);
				Components.utils.reportError(item);
			}
			else if (Foxtrick.BuildFor == "Chrome") {
				for (var i in content)
					item += i + ": " + content[i] + ";\n";
			}
		}
		else if (typeof(content) != "string") {
			try {
				item = JSON.stringify(content);
			}
			catch (e) {
				item = String(content);
			}
		}
		else {
			item = content;
		}
		concated += item;
	}
	concated += "\n";
	Foxtrick.dumpCache += concated;
	if (Foxtrick.BuildFor === "Gecko") {
		dump("FT: " + concated);
	}
	else if (Foxtrick.BuildFor === "Chrome") {
		console.log(concated);
		Foxtrick.dumpFlush(document);
	}
}
