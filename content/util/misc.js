/*
 * misc.js
 * Miscellaneous utilities
 */

if (!Foxtrick) var Foxtrick = {};

Foxtrick.filePickerForDataUrl = function(doc, callback, data) {
	var form = doc.createElement('form');
	var input = doc.createElement('input');
	input.type = 'file';
	input.addEventListener('change',function(ev) {
		var file = ev.target.files[0];
		var reader = new window.FileReader();
		reader.onerror = function(e) {
			alert('Error code: ' + e.target.error.code);
		};
		reader.onload = function(evt) {
			callback(evt.target.result, data);
		}
		reader.readAsDataURL(file);
	}, false);
	form.appendChild(input);
	return form;
}

Foxtrick.filePickerForText = function(doc, callback, data) {
	var form = doc.createElement('form');
	var input = doc.createElement('input');
	input.type = 'file';
	input.addEventListener('change',function(ev) {
		var file = ev.target.files[0];
		var reader = new window.FileReader();
		reader.onerror = function(e) {
			alert('Error code: ' + e.target.error.code);
		};
		reader.onload = function(evt) {
			callback(evt.target.result, data);
		}
		reader.readAsText(file);
	}, false);
	form.appendChild(input);
	return form;
}



// Play the sound with URL given as parameter.
// Gecko only supports WAV format at the moment.
// May throw an error if unable to play the sound.
Foxtrick.playSound = function(url, doc) {
	try {
		if (Foxtrick.BuildFor === "Gecko") {
			try {
				var soundService = Components.classes["@mozilla.org/sound;1"].getService(Components.interfaces.nsISound);
				var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
				soundService.play(ioService.newURI(url, null, null));
				return;
			} catch(e) {}
		}
		try  {
			var music = new Audio(url);
			music.play();
		} catch(e) {
			var music = doc.createElement('audio');
			music.setAttribute("autoplay","autoplay");
			var source = doc.createElement('source');
			source.setAttribute('src',url);
			source.setAttribute('type','audio/wav');
			music.appendChild(source);
			doc.getElementsByTagName('body')[0].appendChild(music);
		}
	} catch(e){
		Foxtrick.log("Cannot play sound: ", url);
		Foxtrick.log(e);
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

Foxtrick.count = function(array, func) {
	try {
		var ret = 0;
		for (var i = 0; i < array.length; ++i) {
			if (func(array[i]))
				++ret;
		}
		return ret;
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

Foxtrick.in_array = function(a, n) {
	return Foxtrick.some(a, function(t) { return n === t; });
}

Foxtrick.intersect = function(a, b) {
	var r = [];
	for (var i = 0; i < a.length; ++i)
		if (Foxtrick.in_array(b, a[i]))
			r.push(a[i]);
	r = Foxtrick.unique(r);
	return r;
};

Foxtrick.copyStringToClipboard = function (string) {
	if (Foxtrick.BuildFor === "Gecko") {
		if (Foxtrick.chromeContext()==='content') {
			sandboxed.extension.sendRequest({req : "clipboard", content : string});
		}
		else {
			var gClipboardHelper = Components
				.classes["@mozilla.org/widget/clipboardhelper;1"]
				.getService(Components.interfaces.nsIClipboardHelper);
			gClipboardHelper.copyString(string);
		}
	}
	else if (typeof(opera) === "object" || typeof(safari) === "object") {
		Foxtrick.sessionSet('clipboard', string);
	}
	else if (Foxtrick.BuildFor === "Sandboxed") {
		sandboxed.extension.sendRequest({req : "clipboard", content : string});
	}
}

Foxtrick.newTab = function(url) {
	if (Foxtrick.chromeContext()==='content') {
		sandboxed.extension.sendRequest({
			req : "newTab",
			url : url
		})
	}
	else if (typeof(firefox)==='object') {
		gBrowser.selectedTab = gBrowser.addTab(url);
	}
}

Foxtrick.load = function(url, callback, crossSite) {
	try {
		if ( Foxtrick.chromeContext()==='content' && callback ) {
			// background script for xml requests
			sandboxed.extension.sendRequest({req : "xml", url : url, crossSite: crossSite},
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
			if (!crossSite) {
				// a request to load local resource
				url = url.replace(Foxtrick.ResourcePath, Foxtrick.InternalPath);
			}
			var req = new window.XMLHttpRequest();
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
	}
	catch (e) {
		Foxtrick.log('xml load error - url: ', url, ' callback: ', callback, ' crossSite: ', crossSite);
		Foxtrick.dump('error: '+e);
		if (callback) callback(null);
	}
};

Foxtrick.loadXml = function(url, callback, crossSite) {
	if (callback) {
		Foxtrick.load(url, function(text, status) {
			try {
				var parser = new window.DOMParser();
				var xml = parser.parseFromString(text, "text/xml");
				try {
					callback(xml, status);
				}
				catch (e) {
					Foxtrick.log("Foxtrick.loadXml: Uncaught callback error:" , url,  ' ', text, ' ', status, " ", e);
				}
			}
			catch (e) {
				// invalid XML
				Foxtrick.log("Foxtrick.loadXml a: Cannot parse XML:\n" , url,  ' ', text, ' ', status, " ", e);
				callback(null, status);
			}
		}, crossSite);
	}
	else {
		try {
			var text = Foxtrick.load(url);
			var parser = new window.DOMParser();
			var xml = parser.parseFromString(text, "text/xml");
			return xml;
		}
		catch (e) {
			// invalid XML
			Foxtrick.log("Foxtrick.loadXml b: Cannot parse XML:\n" , url,  ' ', text, " ", e);
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
		new RegExp("^http://hattrick\.org(/|$)", "i"),
		new RegExp("^http://www\\d{2}\.hattrick\.org(/|$)", "i"),
		new RegExp("^http://stage\.hattrick\.org(/|$)", "i"),
		new RegExp("^http://www\\d{2}\.hattrick\.interia\.pl(/|$)", "i"),
		new RegExp("^http://www\\d{2}\.hattrick\.uol\.com\.br(/|$)", "i"),
		new RegExp("^http://www\\d{2}\.hattrick\.ws(/|$)", "i"),
		new RegExp("^http://www\\d{2}\.hat-trick\.net(/|$)", "i"),
		new RegExp("^http://www\\d{2}\.hattrick\.name(/|$)", "i"),
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

Foxtrick.convertImageUrlToData = function(cssTextCollection, callback) {
	var pending = 0;

	// send back when all images are converted
	var resolve = function() {
		if (--pending <= 0) {
			callback(cssTextCollection);
		}
	};
	// convert an image
	var replaceImage = function (url) {
		var image = new Image;
		image.onload = function() {
			var canvas = document.createElement("canvas");
			canvas.width = image.width;
			canvas.height = image.height;
			var context = canvas.getContext('2d');
			context.drawImage(image, 0, 0);
			var dataUrl = canvas.toDataURL()
			Foxtrick.dataUrlStorage[url] = dataUrl;
			cssTextCollection = cssTextCollection.replace(RegExp(url,'g'), dataUrl);
			return resolve();
		};
		image.onerror = function() {
			return resolve();
		};
		return image.src = url;
	};

	if (cssTextCollection) {
		var fullUrlRegExp = new RegExp("\\(\'?\"?chrome://foxtrick/content/([^\\)]+)\'?\"?\\)", "gi");
		var urls = cssTextCollection.match(fullUrlRegExp);
		var resourcePathRegExp = RegExp("chrome://foxtrick/content/", "ig");
		cssTextCollection = cssTextCollection.replace(resourcePathRegExp, Foxtrick.InternalPath);

		if (urls) {
			// first check dataurl cache
			for (var i = 0; i<urls.length; ++i) {
				urls[i] = urls[i].replace(/\(\'?\"?|\'?\"?\)/g,'').replace(resourcePathRegExp, Foxtrick.InternalPath);
				if (Foxtrick.dataUrlStorage[urls[i]]) {
					cssTextCollection = cssTextCollection.replace(RegExp(urls[i],'g'), Foxtrick.dataUrlStorage[urls[i]]);
				}
			}
			// convert missing images
			for (var i = 0; i<urls.length; ++i) {
				urls[i] = urls[i].replace(/\(\'?\"?|\'?\"?\)/g,'').replace(resourcePathRegExp, Foxtrick.InternalPath);
				if (!Foxtrick.dataUrlStorage[urls[i]]) {
					pending++;
					replaceImage(urls[i]);
				}
			}
			// resolve cached dataurls
			pending++;
			resolve();
		}
	}
};

Foxtrick.replaceExtensionDirectory = function(cssTextCollection, callback, id) {
	var resourcePathRegExp = RegExp("chrome://foxtrick/content/", "ig");

	if (typeof(opera) === "object") {
		if (cssTextCollection.search(resourcePathRegExp)!=-1 )
			sandboxed.extension.sendRequest({ req : "convertImages", cssText: cssTextCollection, type: id},
				function (data) { callback(data.cssText);
				});
		else callback(cssTextCollection);
	}
	else if (typeof(chrome) === "object" || typeof(safari) === "object") {
		callback( cssTextCollection.replace(resourcePathRegExp, Foxtrick.InternalPath) );
	}
	else callback(cssTextCollection);
}

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


// ------------------------  css loading ----------------------------

// unload all css files, enabled or not
Foxtrick.unload_module_css = function(doc) {
	Foxtrick.dump('unload permanents css\n');

	if (Foxtrick.BuildFor === "Gecko") {
		for (var i in Foxtrick.modules) {
			var module = Foxtrick.modules[i];
			if (module.CSS)
				Foxtrick.unload_css_permanent(module.CSS);
			if (module.OPTIONS_CSS) {
				Foxtrick.map(module.OPTIONS_CSS, function(n) {
					Foxtrick.unload_css_permanent(n);
				});
			}
		}
	}
	else {
		var moduleCss = doc.getElementById("ft-module-css");
		if (moduleCss)
			moduleCss.parentNode.removeChild(moduleCss);
	}
}

// unload single css file or array of css files
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
			}
		}
		catch (e) {
			Foxtrick.log ('> load_css_permanent ' , e , '\n');
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
	else {
		var moduleCss = doc.getElementById("ft-module-css");
		if (moduleCss)
			moduleCss.parentNode.removeChild(moduleCss);
	}
}

// collect all enabled module css urls in Foxtrick.cssFiles array
Foxtrick.collect_module_css = function() {
	Foxtrick.cssFiles = [];
	var collect = function(module) {
		if (FoxtrickPrefs.isModuleEnabled(module.MODULE_NAME)) {
			// module main CSS
			if (module.CSS) {
				if (module.CSS instanceof Array) {
					for (var i = 0; i < module.CSS.length; ++i)
						Foxtrick.cssFiles.push(module.CSS[i]);
				}
				else if (typeof(module.CSS) == "string") {
					Foxtrick.cssFiles.push(module.CSS);
				}
				else {
					Foxtrick.log("Unrecognized CSS from module ",
						module.MODULE_NAME, ": ", module.CSS);
				}
			}
			// module options CSS
			if (module.OPTIONS && module.OPTIONS_CSS) {
				for (var i = 0;
					i < Math.min(module.OPTIONS.length, module.OPTIONS_CSS.length);
					++i) {
					if (FoxtrickPrefs.isModuleOptionEnabled(module.MODULE_NAME, module.OPTIONS[i])
						&& module.OPTIONS_CSS[i])
						Foxtrick.cssFiles.push(module.OPTIONS_CSS[i]);
				}
			}
		}
	};
	// sort modules, place SkinPlugin at last
	// FIXME - implement a more general method
	var modules = [];
	for (var i in Foxtrick.modules)
		modules.push(Foxtrick.modules[i]);
	modules.sort(function(a, b) {
		if (a.MODULE_NAME == b.MODULE_NAME)
			return 0;
		if (a.MODULE_NAME == "SkinPlugin")
			return 1;
		if (b.MODULE_NAME == "SkinPlugin")
			return -1;
	});
	Foxtrick.map(modules, collect);
};

// load single into browser or page
Foxtrick.load_css_permanent = function(css) {
	try {
		// convert text css to data url
		if ( css.search(/^[A-Za-z_-]+:\/\//) == -1 ) {
			// needs to be uncompressed to have the right csss precedence
			css = 'data:text/css;charset=US-ASCII,'+encodeURIComponent(css);
		}

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
		}
	}
	catch (e) {
		Foxtrick.log ('> ERROR load_css_permanent: ' , css , '\n');
		Foxtrick.log (e);
	}
};

// load all Foxtrick.cssFiles into browser or page
Foxtrick.load_module_css = function(doc) {

	if (Foxtrick.BuildFor === "Gecko") {
		for (var i = 0; i < Foxtrick.cssFiles.length; ++i)
			Foxtrick.load_css_permanent(Foxtrick.cssFiles[i]);
	}
	else if (Foxtrick.BuildFor === "Sandboxed") {
		sandboxed.extension.sendRequest(
			{ req : "getCss", files :Foxtrick.cssFiles },
			function(data) {
				var style = Foxtrick.util.inject.css(doc, data.cssText);
				style.id = "ft-module-css";
			}
		);
	}
};

Foxtrick.reload_module_css = function(doc) {
	try {
		Foxtrick.unload_module_css(doc);

		Foxtrick.collect_module_css();
		Foxtrick.load_module_css(doc);
	}
	catch (e) {
		Foxtrick.log(e);
	}
};


// loads css file from local resource and return a string with the content for injection into page
Foxtrick.getCssTextFromFile = function (cssUrl) {
	// @callback_param cssText - string of CSS content
	var css_text = "";
	if (cssUrl && cssUrl.search(/{/) == -1) { // has no class
		try {
			// a resource file, get css file content
			css_text = Foxtrick.load(cssUrl);
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
Foxtrick.getCssFileArrayToString = function(cssUrls) {
	var cssTextCollection='';
	for (var i = 0; i < cssUrls.length; ++i) {
		cssTextCollection += Foxtrick.getCssTextFromFile(cssUrls[i]);
	}
	return cssTextCollection;
};

	// gets all css from modules.CSS settings
Foxtrick.getCssTextCollection = function() {
	// fennec can/does load css direct from content
	if (typeof(fennec)==='object')
		return '';
	Foxtrick.collect_module_css();
	return Foxtrick.getCssFileArrayToString(Foxtrick.cssFiles);
};




// gecko: find first occurence of host and open+focus there
Foxtrick.openAndReuseOneTabPerURL = function(url, reload) {
	try{
	  var host = url.match(/(http:\/\/[a-zA-Z0-9_.-]+)/)[1];

	  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						 .getService(Components.interfaces.nsIWindowMediator);
	  var browserEnumerator = wm.getEnumerator("navigator:browser");

	  // Check each browser instance for our URL
	  var found = false;
	  while (!found && browserEnumerator.hasMoreElements()) {
		var browserWin = browserEnumerator.getNext();
		var tabbrowser = browserWin.getBrowser();

		// Check each tab of this browser instance
		var numTabs = tabbrowser.browsers.length;
		for(var index=0; index<numTabs; index++) {
		  var currentBrowser = tabbrowser.getBrowserAtIndex(index);
		  Foxtrick.log('tab: ',currentBrowser.currentURI.spec,' is searched url: ',host,' = '+(currentBrowser.currentURI.spec.search(host)!=-1));
		  if (currentBrowser.currentURI.spec.search(host)!=-1)
			{
			// The URL is already opened. Select this tab.
			tabbrowser.selectedTab = tabbrowser.mTabs[index];

			// Focus *this* browser-window
			browserWin.focus();
			if (reload) {
				browserWin.loadURI(url )
				Foxtrick.log('reload: ',url);
			}
			found = true;
			break;
		  }
		}
	  }

	  // Our URL isn't open. Open it now.
	  if (!found) {
		var recentWindow = wm.getMostRecentWindow("navigator:browser");
		if (recentWindow) { //Foxtrick.log('open recentWindow: ',url);
		  // Use an existing browser window
		  recentWindow.delayedOpenTab(url, null, null, null, null);
		}
		else { Foxtrick.log('open new window: ',url);
		  // No browser windows are open, so open a new one.
		  window.open(url);
		}
	  }
	}catch(e){Foxtrick.log(e);}
}

// ----------------------------- log and dump ------------------------------
// debug log storage (sandboxed)
Foxtrick.debugLogStorage = '';

Foxtrick.addToDebugLogStorage = function (text) {
	var cutoff = Foxtrick.debugLogStorage.length-3500;
	cutoff = (cutoff<0)?0:cutoff;
	Foxtrick.debugLogStorage = Foxtrick.debugLogStorage.substr(cutoff) + text;
};

Foxtrick.dumpHeader = function(doc) {
	var headString = Foxtrickl10n.getString("foxtrick.log.env")
				.replace(/%1/, Foxtrick.version())
				.replace(/%2/, Foxtrick.BuildFor + ' ' + Foxtrick.BuildForDetail)
				.replace(/%3/, FoxtrickPrefs.getString("htLanguage"))
				.replace(/%4/, Foxtrick.util.layout.isStandard(doc) ? "standard" : "simple")
				.replace(/%5/, Foxtrick.util.layout.isRtl(doc) ? "RTL" : "LTR");
	if (Foxtrick.isStage(doc)) headString += ', Stage';
	headString += "\n";
	return headString;
}

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
			pre.textContent = Foxtrick.dumpHeader(doc);
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
				item += "Stack trace: " + content.stack.substr(0,1000);
				Components.utils.reportError(item);
			}
			else if (Foxtrick.BuildFor == "Sandboxed") {
				for (var i in content)
					item += i + ": " + content[i] + ";\n";
			}
		}
		else if (typeof(content) != "string") {
			try {
				item = JSON.stringify(content).substr(0,1000);
			}
			catch (e) {
				item = String(content).substr(0,1000);
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
		if (Foxtrick.chromeContext() === "content")
			sandboxed.extension.sendRequest({ req : "log", log : concated });
		else
			dump("FT: " + concated);
	}
	else if (Foxtrick.BuildFor === "Sandboxed") {
		if (Foxtrick.chromeContext() == "content")
			sandboxed.extension.sendRequest({req : "addDebugLog", log : concated});
		else {
			Foxtrick.addToDebugLogStorage(concated);
		}
		console.log(concated);
		Foxtrick.dumpFlush(document);
	}
}
