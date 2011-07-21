/**
 * foxtrick.js
 * Loader for FoxTrick and core functions
 * @homepage http://code.google.com/p/foxtrick/
 */

if (!Foxtrick) var Foxtrick = {};

/** Modules that are to be called on specific hattrick page loads.
 * Should implement a run() method.
 * DON'T EDIT THIS, use PAGES property of the module instead
 */
Foxtrick.run_on_page = [];

/** Core Foxtrick modules, always used.
 * Don't add here unless you have a good reason to. */
Foxtrick.core_modules = [ FoxtrickPrefs, Foxtrickl10n, Foxtrick.XMLData ];

// entry point for all FoxTrick modules
var FoxtrickMain = {
	isStandard : true,
	isRTL : false,

	init : function() {
		Foxtrick.log("Initializing FoxTrick…");
		// init core modules, for Chrome they are initialized in
		// loader-chrome.js
		if (Foxtrick.BuildFor !== "Chrome") {
			for (var i in Foxtrick.core_modules) {
				if (typeof(Foxtrick.core_modules[i].init) == "function")
					Foxtrick.core_modules[i].init();
			}
		}
		Foxtrick.MakeStatsHash();

		// create arrays for each recognized page that contains modules
		// that run on it
		for (var i in Foxtrick.ht_pages) {
			Foxtrick.run_on_page[i] = [];
		}

		// initialize all enabled modules
		var modules = [];
		for (var i in Foxtrick.modules) {
			var module = Foxtrick.modules[i];
			if (FoxtrickPrefs.isModuleEnabled(module)) {
				// push to array modules for executing init()
				modules.push(module);
				// register modules on the pages they are operating on according
				// to their PAGES property
				if (module.MODULE_NAME && module.PAGES) {
					for (var i = 0; i < module.PAGES.length; ++i)
						Foxtrick.run_on_page[module.PAGES[i]].push(module);
				}
			}
		}
		Foxtrick.niceRun(modules, function(m) {
			if (typeof(m.init) == "function")
				return function() { m.init(); };
		});

		Foxtrick.log("FoxTrick initialization completed.");
	},

	// main entry run on every ht page load
	run : function(doc, is_only_css_check) {
		try {
			if (FoxtrickPrefs.getBool("preferences.updated")) {
				Foxtrick.log('prefs updated');
				FoxtrickMain.init();
				Foxtrick.reload_module_css(doc);
				FoxtrickMain.cssLoaded = true;
				FoxtrickPrefs.setBool("preferences.updated", false);
			}

			// don't execute if not enabled on the document
			if (!FoxtrickPrefs.isEnabled(doc)) {
				// potenial disable cleanup
				Foxtrick.unload_module_css();
				FoxtrickMain.cssLoaded = false;
				return;
			}

			var isStandard = FoxtrickPrefs.getBool('isStandard');
			var isRTL = FoxtrickPrefs.getBool('isRTL');
			// reload CSS if not loaded or page layout changed
			if (!FoxtrickMain.cssLoaded
				|| (Foxtrick.util.layout.isStandard(doc) !== FoxtrickPrefs.getBool('isStandard'))
				|| (Foxtrick.util.layout.isRtl(doc) !== FoxtrickPrefs.getBool('isRTL'))) {
				Foxtrick.log('layout change');
				FoxtrickPrefs.setBool('isStandard', Foxtrick.util.layout.isStandard(doc));
				FoxtrickPrefs.setBool('isRTL', Foxtrick.util.layout.isRtl(doc));
				FoxtrickPrefs.setBool('isStage', Foxtrick.isStage(doc));
				Foxtrick.reload_module_css(doc);
				FoxtrickMain.cssLoaded = true;
			}

			// if only a CSS check, return now.
			if (is_only_css_check)
				return;

			// call all modules that registered as page listeners
			// if their page is loaded
			var modules = [];
			// modules running on current page
			for (var page in Foxtrick.ht_pages) {
				if (Foxtrick.isPage(page, doc)) {
					for (var i in Foxtrick.run_on_page[page])
						modules.push(Foxtrick.run_on_page[page][i]);
				}
			}

			// invoke niceRun to run modules
			Foxtrick.niceRun(modules, function(m) {
				if (typeof(m.run) == "function")
					return function() { m.run(doc); };
			});

			Foxtrick.dumpFlush(doc);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	// function run on every ht page change
	change : function(ev) {
		try { 
			var doc = ev.target.ownerDocument;
			if (ev.target.nodeType !== Node.ELEMENT_NODE)
				return;

			// not on matchlineup
			if (doc.location.href.search(/\/Club\/Matches\/MatchOrder\//)!=-1 ||
				doc.location.href.search(/\/Community\/CHPP\/ChppPrograms\.aspx/)!=-1) {
				return;
			}
			// ignore changes list
			if (ev.originalTarget && ev.originalTarget.className
				&& (ev.originalTarget.className=='boxBody'
					|| ev.originalTarget.className=='myht1'))
				return;

			var content = doc.getElementById("content");
			if (!content) {
				Foxtrick.log("Cannot find #content at ", doc.location);
				return;
			}
			// remove event listener while Foxtrick executes
			Foxtrick.stopListenToChange(doc);
			if (FoxtrickPrefs.isEnabled(doc)) {
				var modules = [];
				// modules running on current page
				for (var page in Foxtrick.ht_pages) {
					if (Foxtrick.isPage(page, doc)) {
						for (var i in Foxtrick.run_on_page[page])
							modules.push(Foxtrick.run_on_page[page][i]);
					}
				}

				// invoke niceRun to run modules
				Foxtrick.niceRun(modules, function(m) {
					if (typeof(m.change) == "function")
						return function() { m.change(doc, ev); };
				});

				Foxtrick.dumpFlush(doc);
			}
			// re-add event listener
			Foxtrick.startListenToChange(doc);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}
};

/**
 * Runs the specified function of each module in the array in the order
 * of nice index
 */
Foxtrick.niceRun = function(modules, pick) {
	modules = Foxtrick.unique(modules);
	modules.sort(function(a, b) {
		var aNice = a.NICE || 0;
		var bNice = b.NICE || 0;
		return aNice - bNice;
	});
	Foxtrick.map(modules, function(m) {
		try {
			if (typeof(pick(m)) == "function")
				pick(m)();
		}
		catch (e) {
			Foxtrick.log(e);
		}
	});
};

Foxtrick.version = function() {
	//FoxtrickPrefs.deleteValue("version"); what is that for, is never set. 
	return FoxtrickPrefs.getString("version");
};

Foxtrick.isPage = function(page, doc) {
	if (Foxtrick.ht_pages[page])
		return Foxtrick.isPageHref(Foxtrick.ht_pages[page], doc.location.href);
	else
		return false;
}

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
	content.removeEventListener("DOMSubtreeModified", FoxtrickMain.change, true);
}

Foxtrick.startListenToChange = function(doc) {
	var content = doc.getElementById("content");
	content.addEventListener("DOMSubtreeModified", FoxtrickMain.change, true);
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
