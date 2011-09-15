/*
 * misc.js
 * Miscellaneous utilities
 */

if (!Foxtrick) var Foxtrick = {};

Foxtrick.filePickerForDataUrl = function(doc, callback) {
	var input = doc.createElement('input');
	input.type = 'file';
	input.addEventListener('change',function(ev) {
		var file = ev.target.files[0];
		var reader = new window.FileReader();
		reader.onerror = function(e) {
			alert('Error code: ' + e.target.error.code);
		};
		reader.onload = function(evt) {
			callback(evt.target.result);
		}
		reader.readAsDataURL(file);
	}, false);
	return input;
}

Foxtrick.filePickerForText = function(doc, callback) {
	var input = doc.createElement('input');
	input.type = 'file';
	input.addEventListener('change',function(ev) {
		var file = ev.target.files[0];
		var reader = new window.FileReader();
		reader.onerror = function(e) {
			alert('Error code: ' + e.target.error.code);
		};
		reader.onload = function(evt) {
			callback(evt.target.result);
		}
		reader.readAsText(file);
	}, false);
	return input;
}

// Play the sound with URL given as parameter.
// Gecko only supports WAV format at the moment.
// May throw an error if unable to play the sound.
Foxtrick.playSound = function(url, doc) {
	try {
		if (Foxtrick.arch === "Gecko") {
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

Foxtrick.copyStringToClipboard = function (string) {
	if (Foxtrick.arch === "Gecko") {
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
	else if (Foxtrick.platform == "Opera" || Foxtrick.platform == "Safari") {
		Foxtrick.sessionSet('clipboard', string);
	}
	else if (Foxtrick.arch === "Sandboxed") {
		if (Foxtrick.chromeContext()=='content')
			sandboxed.extension.sendRequest({req : "clipboard", content : string});
		else {
			if (Foxtrick.platform == "Chrome")
				Foxtrick.loader.chrome.copyToClipBoard(string);
			else
				Foxtrick.copyStringToClipboard(string);
		}
	}
}

Foxtrick.newTab = function(url) {
	if (Foxtrick.chromeContext()==='content') {
		sandboxed.extension.sendRequest({
			req : "newTab",
			url : url
		})
	}
	else if (Foxtrick.platform == "Firefox") {
		gBrowser.selectedTab = gBrowser.addTab(url);
	}
}

/*
 * Load external URL as string
 * @param url - URL
 * @param callback - function to be called when succeeded or failed
 * @param crossSite - whether it's to a site other than current Hattrick host
 * @callback_param String of text content if success or null if failure
 * @callback_param HTTP status code
 */
Foxtrick.load = function(url, callback, crossSite) {
	if (Foxtrick.chromeContext()==='content' && callback) {
		// background script for xml requests
		sandboxed.extension.sendRequest({req : "xml", url : url, crossSite: crossSite },
			function(response) {
				try {
					callback(response.data, response.status);
				}
				catch (e) {
					Foxtrick.dump('Uncaught callback error: - url: ' + url + ' callback: '+ callback + ' crossSite: ' + crossSite + ' ' + e);
					Foxtrick.log(e);
				}
			}
		);
	}
	else {
		var req = new window.XMLHttpRequest();
		req.open("GET", url, callback ? true : false);
		if (typeof(req.overrideMimeType) == "function")
			req.overrideMimeType("text/plain");
		if (!callback) {
			req.send(null);
			var response = req.responseText;
			return response;
		}
		else {
			req.onreadystatechange = function(aEvt) {
				if (req.readyState == 4) {
					try {
						callback(req.responseText, req.status);
					}
					catch (e) {
						Foxtrick.dump('Uncaught callback error: - url: ' + url + ' callback: '+ callback + ' crossSite: ' + crossSite + ' ' + e);
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
				var parser = new window.DOMParser();
				var xml = parser.parseFromString(text, "text/xml");
			}
			catch (e) {
				// invalid XML
				Foxtrick.log("Foxtrick.loadXml@async: Cannot parse XML:\n" , url,  ' ', text, ' ', status, " ", e);
				callback(null, status);
			}
			callback(xml, status);
		}, crossSite);
	}
	else {
		var text = Foxtrick.load(url);
		try {
			var parser = new window.DOMParser();
			var xml = parser.parseFromString(text, "text/xml");
		}
		catch (e) {
			// invalid XML
			Foxtrick.log("Foxtrick.loadXml@sync: Cannot parse XML:\n" , url,  ' ', text, " ", e);
			return null;
		}
		return xml;
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
	// get rid of user-imported value
	FoxtrickPrefs.deleteValue("version");
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
		new RegExp("^http://hattrick\.org/.+", "i"),
		new RegExp("^http://www\\d{2}\.hattrick\.org/.+", "i"),
		new RegExp("^http://stage\.hattrick\.org/.+", "i"),
		new RegExp("^http://www\\d{2}\.hattrick\.interia\.pl/.+", "i"),
		new RegExp("^http://www\\d{2}\.hattrick\.uol\.com\.br/.+", "i"),
		new RegExp("^http://www\\d{2}\.hattrick\.ws/.+", "i"),
		new RegExp("^http://www\\d{2}\.hat-trick\.net/.+", "i"),
		new RegExp("^http://www\\d{2}\.hattrick\.name/.+", "i"),
	];
	return Foxtrick.any(function(re) { return url.match(re) != null; }, htMatches);
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

// global change listeners
if (Foxtrick.platform == "Opera") {
// replacement for missing DOMSubtreeModified 

	Foxtrick.changeScheduled = false;
	
	Foxtrick.waitForChanges = function (ev) {
		if (Foxtrick.changeScheduled) 
			return;
		Foxtrick.changeScheduled = true;
		window.setTimeout ( function() {
			Foxtrick.changeScheduled = false;
			Foxtrick.entry.change(ev);
		}, 0)
	}
	
	Foxtrick.stopListenToChange = function (doc) {
		var content = doc.getElementById("content");
		content.removeEventListener("DOMNodeInserted", Foxtrick.waitForChanges, true);
	}
	
	Foxtrick.startListenToChange = function(doc) {
		var content = doc.getElementById("content");
		content.addEventListener("DOMNodeInserted", Foxtrick.waitForChanges, true);
	}
}
else {
	Foxtrick.stopListenToChange = function (doc) {
		var content = doc.getElementById("content");
		content.removeEventListener("DOMSubtreeModified", Foxtrick.entry.change, true);
	}
	
	Foxtrick.startListenToChange = function(doc) {
		var content = doc.getElementById("content");
		content.addEventListener("DOMSubtreeModified", Foxtrick.entry.change, true);
	}
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
		var InternalPathRegExp = RegExp("chrome://foxtrick/content/", "ig");
		cssTextCollection = cssTextCollection.replace(InternalPathRegExp, Foxtrick.InternalPath);

		if (urls) {
			// first check dataurl cache
			for (var i = 0; i<urls.length; ++i) {
				urls[i] = urls[i].replace(/\(\'?\"?|\'?\"?\)/g,'').replace(InternalPathRegExp, Foxtrick.InternalPath);
				if (Foxtrick.dataUrlStorage[urls[i]]) {
					cssTextCollection = cssTextCollection.replace(RegExp(urls[i],'g'), Foxtrick.dataUrlStorage[urls[i]]);
				}
			}
			// convert missing images
			for (var i = 0; i<urls.length; ++i) {
				urls[i] = urls[i].replace(/\(\'?\"?|\'?\"?\)/g,'').replace(InternalPathRegExp, Foxtrick.InternalPath);
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
	var InternalPathRegExp = RegExp("chrome://foxtrick/content/", "ig");

	if (Foxtrick.platform == "Opera") {
		if (cssTextCollection.search(InternalPathRegExp)!=-1 )
			sandboxed.extension.sendRequest({ req : "convertImages", cssText: cssTextCollection, type: id},
				function (data) { callback(data.cssText);
				});
		else callback(cssTextCollection);
	}
	else if (Foxtrick.platform == "Chrome" || Foxtrick.platform == "Safari") {
		callback( cssTextCollection.replace(InternalPathRegExp, Foxtrick.InternalPath) );
	}
	else callback(cssTextCollection);
}

Foxtrick.confirmDialog = function(msg) {
	if (Foxtrick.arch === "Gecko") {
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);
		return promptService.confirm(null, null, msg);
	}
	else {
		return window.confirm(msg);
	}
}

Foxtrick.alert = function(msg) {
	if (Foxtrick.arch === "Gecko") {
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
	Foxtrick.log('unload permanents css');

	if (Foxtrick.arch === "Gecko") {
		if (Foxtrick.current_css) {
			Foxtrick.unload_css_permanent(Foxtrick.current_css);
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
			// convert text css to data url
			if ( css.search(/^[A-Za-z_-]+:\/\//) == -1 ) {
				// needs to be uncompressed to have the right csss precedence
				css = 'data:text/css;charset=US-ASCII,'+encodeURIComponent(css);
			}
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
	if (Foxtrick.arch === "Gecko") {
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
	Foxtrick.map(collect, modules);
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
	Foxtrick.unload_module_css(doc);

	if (Foxtrick.platform === "Firefox") {
		Foxtrick.current_css = Foxtrick.getCssTextCollection();
		Foxtrick.load_css_permanent(Foxtrick.current_css);
	}
	else {
		Foxtrick.collect_module_css();
		sandboxed.extension.sendRequest(
			{ req : "getCss", files :Foxtrick.cssFiles },
			function (data) {
				if (Foxtrick.platform === "Fennec") {
					Foxtrick.current_css = data.cssText;
					Foxtrick.load_css_permanent(Foxtrick.current_css);
				} else {
					var style = Foxtrick.util.inject.css(doc, data.cssText);
					style.id = "ft-module-css";
				}
			}
		);
	}
};

Foxtrick.reload_module_css = function(doc) {
	try {
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
	css_text = css_text.replace(new RegExp('\\[data-theme="'+FoxtrickPrefs.getString('theme')+'"\\]','g'), "");
	css_text = css_text.replace(new RegExp('\\[dir="'+FoxtrickPrefs.getString('dir')+'"\\]','g'), "");
	if (Foxtrick.arch == "Sandboxed") {
		// remove moz-document statement
		if (css_text && css_text.search(/@-moz-document/)!=-1) {
			css_text = css_text.replace(/@-moz-document[^\{]+\{/, "");
			var closing_bracket = css_text.lastIndexOf("}");
			css_text = css_text.substr(0, closing_bracket) + css_text.substr(closing_bracket+1);
		}
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
	Foxtrick.log('getCssTextCollection ',FoxtrickPrefs.getString('theme'),' - ',FoxtrickPrefs.getString('dir'));
	Foxtrick.collect_module_css();
	return 	Foxtrick.getCssFileArrayToString(Foxtrick.cssFiles);
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
