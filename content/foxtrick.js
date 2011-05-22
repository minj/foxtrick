/**
 * Foxtrick - an extension for hattrick.org
 * Contact us: by HT-mail to Mod-Spambot on hattrick.org
 */

if (!Foxtrick) var Foxtrick = {};

////////////////////////////////////////////////////////////////////////////////
/** Modules that are to be called every time any hattrick page loads.
 * Should implement a run() method.
 * DON'T EDIT THIS, use registerAllPagesHandler() instead.
 */
Foxtrick.run_every_page = [];

/** Modules that are to be called on specific hattrick page loads.
 * Should implement a run() method.
 * DON'T EDIT THIS, use registerPageHandler() instead.
 */
Foxtrick.run_on_page = [];

/*Modules that may! be called on specific hattrick page loads independent one being enanbled or not.*/
Foxtrick.may_run_on_page = [];

/** Core Foxtrick modules, always used.
 * Don't add here unless you have a good reason to. */
Foxtrick.core_modules = [ FoxtrickPrefs, Foxtrickl10n, Foxtrick.XMLData ];

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
			Foxtrick.may_run_on_page[i] = [];
		}

		// initialize all enabled modules
		for (var i in Foxtrick.modules) {
			var module = Foxtrick.modules[i];
			if (Foxtrick.isModuleEnabled(module)
				&& (typeof(module.init) == "function")) {
				try {
					module.init();
				}
				catch (e) {
					Foxtrick.log(e);
				}
			}

			if (module.MODULE_NAME && module.PAGES) {
				Foxtrick.registerModulePages(module);
			}
		}

		Foxtrick.log("FoxTrick initialization completed.");
	},

	registerOnPageLoad : function(document) {
		try {
			if (Foxtrick.BuildFor !== "Gecko")
				return;

			// calls module.onLoad() after the browser window is loaded
			for (var i in Foxtrick.modules) {
				var module = Foxtrick.modules[i];
				if (typeof(module.onLoad) === "function") {
					try {
						module.onLoad(document);
					}
					catch (e) {
						Foxtrick.log("Error caught in module ", module.MODULE_NAME, ":", e);
					}
				}
			}

			var appcontent = document.getElementById("appcontent");
			if (appcontent) {
				// listen to page loads
				appcontent.addEventListener("DOMContentLoaded", this.onPageLoad, true);
				appcontent.addEventListener("unload", this.onPageUnLoad, true);

				// add listener to tab focus changes
				var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						 .getService(Components.interfaces.nsIWindowMediator);
				var browserEnumerator = wm.getEnumerator("navigator:browser");
				var browserWin = browserEnumerator.getNext();
				var tabbrowser = browserWin.getBrowser();
				tabbrowser.tabContainer.onselect = FoxtrickMain.ontabfocus;
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	ontabfocus : function(ev) {
		try{
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
						 .getService(Components.interfaces.nsIWindowMediator);
			var browserEnumerator = wm.getEnumerator("navigator:browser");
			var browserWin = browserEnumerator.getNext();
			var tabbrowser = browserWin.getBrowser();
			var currentBrowser = tabbrowser.getBrowserAtIndex(ev.target.selectedIndex);
			var doc = currentBrowser.contentDocument;

			FoxtrickMain.run(doc, true); // recheck css

			// calls module.onTabChange() after the tab focus is changed
			for (var i in Foxtrick.modules) {
				var module = Foxtrick.modules[i];
				if (typeof(module.onTabChange) === "function") {
					try {
						module.onTabChange(doc);
					}
					catch (e) {
						Foxtrick.log("Error caught in module ", module.MODULE_NAME, ": ", e);
					}
				}
			}
		}
		catch (e) {
			dump('foxtrickmain onfocus '+e+'\n');
		}
	},

	onPageChange : function(ev) {
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
			try {
				if (ev.originalTarget.className
					&& (ev.originalTarget.className=='boxBody'
						|| ev.originalTarget.className=='myht1'))
					return;
			}
			catch (e) {
				// some browsers doesn't support ev.originalTarget
			}

			var panel = Foxtrick.getPanel(doc);
			// remove event listener while Foxtrick executes
			panel.removeEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
			FoxtrickMain.change(doc, ev);
			// re-add event listener
			panel.addEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	onPageLoad : function(ev) {
		try {
			//Foxtrick.dump('onPageLoad\n');
			var doc = ev.originalTarget;
			if (doc.nodeName != "#document")
				return;

			if (Foxtrick.isHt(doc)) {
				// check if it's in exclude list
				for (var i in Foxtrick.pagesExcluded) {
					var excludeRe = new RegExp(Foxtrick.pagesExcluded[i], "i");
					// page excluded, return
					if (doc.location.href.search(excludeRe) > -1) {
						return;
					}
				}

				var begin = new Date();
				FoxtrickMain.run(doc);
				var end = new Date();
				var time = (end.getSeconds() - begin.getSeconds()) * 1000
						 + end.getMilliseconds() - begin.getMilliseconds();
				Foxtrick.dump("run time: " + time + " ms | " + doc.location.pathname+doc.location.search + '\n');
				// listen to page content changes
				var panel = Foxtrick.getPanel(doc);
				if (panel) {
					panel.addEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
				}
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	// do nothing
	onPageUnLoad : function(ev) { },

	// main entry run on every ht page load
	run : function(doc, is_only_css_check) {
		try {
			if (FoxtrickPrefs.getBool("preferences.updated")) {
				FoxtrickMain.init();
				Foxtrick.reload_module_css(doc);
				FoxtrickMain.cssLoaded = true;
				FoxtrickPrefs.setBool("preferences.updated", false);
			}

			// don't execute if on stage server and user doesn't want Foxtrick to be executed there
			// or disabled temporarily
			if ((FoxtrickPrefs.getBool("disableOnStage") && Foxtrick.isStage(doc))
				|| FoxtrickPrefs.getBool("disableTemporary")) {
				// potenial disable cleanup
				Foxtrick.log("On Stage: ", Foxtrick.isStage(doc), ", disabled on stage: ", FoxtrickPrefs.getBool("disableOnStage") + ".");
				Foxtrick.log("Temporarily disabled: ", FoxtrickPrefs.getBool("disableTemporary"));
				Foxtrick.unload_module_css();
				FoxtrickMain.cssLoaded = false;
				return;
			}

			// reload CSS if not loaded or page layout changed
			if (!FoxtrickMain.cssLoaded
				|| (Foxtrick.isStandardLayout(doc) !== FoxtrickMain.isStandard)
				|| (Foxtrick.isRTLLayout(doc) !== FoxtrickMain.isRTL)) {
				FoxtrickMain.isStandard = Foxtrick.isStandardLayout(doc);
				FoxtrickMain.isRTL = Foxtrick.isRTLLayout(doc);
				Foxtrick.reload_module_css(doc);
				FoxtrickMain.cssLoaded = true;
			}

			// if only a CSS check, return now.
			if (is_only_css_check)
				return;

			// We run the modules that want to be run at every page.
			for (var i in Foxtrick.run_every_page) {
				var module = Foxtrick.run_every_page[i];
				if (typeof(module.run) == "function") {
					try {
						module.run(doc);
					}
					catch (e) {
						Foxtrick.log("Error caught in module ", module.MODULE_NAME, ": ", e);
					}
				}
			}

			// call all modules that registered as page listeners
			// if their page is loaded

			// find current page index/name and run all handlers for this page
			for (var page in Foxtrick.ht_pages) {
				if (Foxtrick.isPage(Foxtrick.ht_pages[page], doc)) {
					// on a specific page, run all handlers
					for (var i in Foxtrick.run_on_page[page]) {
						var module = Foxtrick.run_on_page[page][i];
						if (typeof(module.run) == "function") {
							try {
								var begin = (new Date()).getTime();
								module.run(page, doc);
								var end = (new Date()).getTime();
								var diff = end - begin;
								if (diff > 50) {
									// Show time used by a module if it's over
									// 50ms.
									Foxtrick.log("Module time: ", diff, "ms | ", module.MODULE_NAME, "");
								}
							}
							catch (e) {
								Foxtrick.log("Error caught in module ", module.MODULE_NAME, ": ", e);
							}
						}
					}
				}
			}
			Foxtrick.dumpFlush(doc);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	// function run on every ht page change
	change : function(doc, ev) {
		if(!(FoxtrickPrefs.getBool("disableOnStage") && Foxtrick.isStage(doc))
			&& !FoxtrickPrefs.getBool("disableTemporary")) {

			// call the modules that want to be run() on every hattrick page
			Foxtrick.run_every_page.forEach(
				function(fn) {
					if (typeof(fn.change) == "function") {
						try {
							fn.change(doc, ev);
						}
						catch (e) {
							Foxtrick.log("Error caught in module ", fn.MODULE_NAME, ": ", e);
						}
					}
				});

			// call all modules that registered as page listeners
			// if their page is loaded

			// find current page index/name and run all handlers for this page
			for (var i in Foxtrick.ht_pages) {
				if (Foxtrick.isPage(Foxtrick.ht_pages[i], doc)) {
					// on a specific page, run all handlers
					Foxtrick.run_on_page[i].forEach(
						function(fn) {
							if (typeof(fn.change) == "function") {
								try {
									fn.change(i, doc, ev);
								}
								catch (e) {
									Foxtrick.log("Error caught in module ", fn.MODULE_NAME, ": ", e);
								}
							}
						});
				}
			}
			Foxtrick.dumpFlush(doc);
		}
	}
};

Foxtrick.version = function() {
	FoxtrickPrefs.deleteValue("version");
	return FoxtrickPrefs.getString("version");
};

Foxtrick.isPage = function(page, doc) {
	var htpage_regexp = new RegExp(page.replace(/\./g,'\\.').replace(/\?/g,'\\?'), "i");
	return doc.location.href.search(htpage_regexp) > -1;
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

Foxtrick.registerModulePages = function(module) {
	try {
		if (module.ONPAGEPREF_PAGE) {
			// a module may specify on-page pref on which pages to
			// be shown through ONPAGEPREF_PAGE
			Foxtrick.may_run_on_page[module.ONPAGEPREF_PAGE].push(module);
		}

		for (var i=0;i<module.PAGES.length;++i) {
			try {
				if (!module.ONPAGEPREF_PAGE) {
					// if ONPAGEPREF_PAGE is not set, add all
					Foxtrick.may_run_on_page[module.PAGES[i]].push(module);
				}
				if (Foxtrick.isModuleEnabled(module)) {
					Foxtrick.run_on_page[module.PAGES[i]].push(module);
				}
			}
			catch (e) {
				Foxtrick.log(e);
				Foxtrick.log("registerModulePages: ", module.MODULE_NAME);
				Foxtrick.log("registerModulePages: ", module.PAGES[i]);
			}
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
}


/**
 * Register with this method to have your module's run()
 * function called on specific pages (names can be found
 * in Foxtrick.ht_pages in module.js.
 * Your function should accept two arguments:
 * the page name (from ht_pages) and current document.
 */
Foxtrick.registerPageHandler = function(page, who) {
	Foxtrick.run_on_page[page].push(who);
}

/**
 * Register with this method to have your module's run() function
 * called every time any hattrick page is loaded.
 * Please use registerPageHandler() if you need only to run
 * on specific pages.
 * Your run() function will be called with only one argument,
 * the current document.
 */
Foxtrick.registerAllPagesHandler = function(who) {
	Foxtrick.run_every_page.push(who);
}

Foxtrick.stopListenToChange = function (doc) {
	var panel = Foxtrick.getPanel(doc);
	panel.removeEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
}

Foxtrick.startListenToChange = function(doc) {
	var panel = Foxtrick.getPanel(doc);
	panel.addEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
}

Foxtrick.addEventListenerChangeSave = function(node, type, fkt, trickle) {
	node.addEventListener(
		type,
		function(ev){
			var doc = ev.target.ownerDocument;
			var panel = Foxtrick.getPanel(doc);
			panel.removeEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
			fkt(ev);
			panel.addEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
		},
		trickle
	);
}

/** Insert text in given textarea at the current position of the cursor */
Foxtrick.insertAtCursor = function(textarea, text) {
	textarea.value = textarea.value.substring(0, textarea.selectionStart)
		+ text
		+ textarea.value.substring(textarea.selectionEnd, textarea.value.length);
}

Foxtrick.addStyleSheet = function(doc, css) {
	Foxtrick.dump('addStyleSheet: '+css+'\n');
	var path = "head[1]";
	var head = doc.evaluate(path,doc.documentElement,null,doc.DOCUMENT_NODE,null).singleNodeValue;

	var link = doc.createElement("link");
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("media", "all");
	link.setAttribute("href", css);
	head.appendChild(link);
}

Foxtrick.addStyleSheetSnippet = function(doc, css) {
	var head = doc.getElementsByTagName("head")[0];
	var style = doc.createElement("style");
	style.setAttribute("type", "text/css");
	style.appendChild(doc.createTextNode(css));
	head.appendChild(style);
}

// attaches a JavaScript file to the page
Foxtrick.addJavaScript = function(doc, js) {
	var path = "head[1]";
	var head = doc.evaluate(path,doc.documentElement,null,doc.DOCUMENT_NODE,null).singleNodeValue;

	var script = doc.createElement("script");
	script.setAttribute("language", "JavaScript");
	script.setAttribute("src", js);
	head.appendChild(script);
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

Foxtrick.isCoreModule = function(module) {
	// core modules must be executed no matter what user's preference is
	return (module.CORE_MODULE === true);
}

Foxtrick.isModuleEnabled = function(module) {
	try {
		if (module.CORE_MODULE)
			return true;
		const moduleName = (module.MODULE_NAME) ? String(module.MODULE_NAME) : String(module);
		const val = Boolean(FoxtrickPrefs.getBool("module." + moduleName + ".enabled"));
		return val;
	}
	catch (e) {
		return false;
	}
}

Foxtrick.isModuleFeatureEnabled = function(module, feature) {
	try {
		const moduleName = (module.MODULE_NAME) ? String(module.MODULE_NAME) : String(module);
		const val = Boolean(FoxtrickPrefs.getBool("module." + moduleName + "." + feature + ".enabled"));
		return val;
	}
	catch (e) {
		return false;
	}
}

Foxtrick.unload_module_css = function() {
	Foxtrick.dump('unload permanents css\n');

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
		}
	}
}

Foxtrick.unload_css_permanent = function(cssList) {
	var unload_css_permanent_impl = function(css) {
		try {
			if (Foxtrick.BuildFor === "Gecko") {
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
					Foxtrick.dump('unload ' + css + '\n');
				}
			}
		}
		catch (e) {
			Foxtrick.dump ('> load_css_permanent ' + e + '\n');
		}
	};
	if (typeof(cssList) === "string")
		unload_css_permanent_impl(cssList);
	else if (typeof(cssList) === "object") {
		for (var i in cssList)
			unload_css_permanent_impl(cssList[i]);
	}
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
					Foxtrick.dump('load ' + css + '\n');
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
		var isStandard = FoxtrickMain.isStandard;
		var isRTL = FoxtrickMain.isRTL;
		Foxtrick.dump('reload_module_css - StdLayout: '+isStandard+' - RTL: '+isRTL+'\n');

		// unload all CSS files
		for (var i in Foxtrick.modules) {
			var module = Foxtrick.modules[i];
			var list = [module.OLD_CSS, module.CSS, module.CSS_SIMPLE, module.CSS_RTL, module.CSS_SIMPLE_RTL];
			for (var j = 0; j < list.length; ++j)
				if (list[j])
					Foxtrick.unload_css_permanent(list[j]);
			if (module.OPTIONS_CSS) {
				for (var j = 0; j < module.OPTIONS_CSS.length; ++j)
					Foxtrick.unload_css_permanent(module.OPTIONS_CSS[j]);
			}
		}

		// load CSS
		for (var i in Foxtrick.modules) {
			var module = Foxtrick.modules[i];
			if (!Foxtrick.isModuleEnabled(module))
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
					if (!Foxtrick.isModuleFeatureEnabled(module, module.OPTIONS[j]))
						continue;
					loadCss(module.OPTIONS_CSS[j],
						null,
						module.OPTIONS_CSS_RTL ? module.OPTIONS_CSS_RTL[j] : null,
						null);
				}
			}
		}
		if (Foxtrick.BuildFor === "Chrome") {
			chrome.extension.sendRequest(
				{ req : "addCss", files : Foxtrick.cssFiles },
				function(data) {
					Foxtrick.addStyleSheetSnippet(doc, data.cssText);
				}
			);
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
}

Foxtrick.setStatusIconStyle = function(ev) {
	var image = ev.target;
	if (FoxtrickPrefs.getBool("statusbarshow")) {
		image.style.display = "display";
	}
	else {
		image.style.display = "none";
	}
}

// to tell which context the chrome script is running at
// either background page, or content script
Foxtrick.chromeContext = function() {
	if (Foxtrick.BuildFor != "Chrome")
		return null;
	try {
		if (chrome.bookmarks) {
			return "background";
		}
		else {
			return "content";
		}
	}
	catch (e) {
		return "content";
	}
}

Foxtrick.isStandardLayout = function (doc) {
	// Check if this is the simple or standard layout
	var links = doc.getElementsByTagName("head")[0].getElementsByTagName("link");
	if (links.length!=0){
		var i=0,link;
		while (link=links[i++]) {
			if (link.href.search(/\/App_Themes\/Simple/i)!=-1) return false;
		}
	}
	else { // mobile internet may have style embedded
		var styles = doc.getElementsByTagName("head")[0].getElementsByTagName("style");
		var i=0,style;
		while (style=styles[i++]) {
			if (style.textContent.search(/\/App_Themes\/Simple/i)!=-1) return false;
		}
	}
	return true; // true = standard / false = simple
}

Foxtrick.isRTLLayout = function (doc) {
	// Check if this is the simple or standard layout
	var links = doc.getElementsByTagName("head")[0].getElementsByTagName("link");
	var rtl=false;
	if (links.length!=0) {
		var i=0,link;
		while (link=links[i++]) {
			if (link.href.search("_rtl.css") != -1) rtl = true;
		}
	}
	else { // mobile internet may have style embedded
		var styles = doc.getElementsByTagName("head")[0].getElementsByTagName("style");
		var i=0,style;
		while (style=styles[i++]) {
			if (style.textContent.search(/direction:rtl/i)!=-1) rtl = true;
		}
	}
	return rtl;
}


Foxtrick.isSupporter = function (doc) {
	return (doc.getElementsByClassName("hattrickNoSupporter").length === 0);
}

Foxtrick.hasMainBodyScroll = function (doc) {
	// Check if scrolling is on for MainBody
	var mainBodyChildren = doc.getElementById('mainBody').childNodes;
	var i = 0, child;
	while (child = mainBodyChildren[i++])
		if (child.nodeName == 'SCRIPT' && child.innerHTML && child.innerHTML.search(/adjustHeight\(\'mainBody\'/) != -1) return true;
	return false;
}

Foxtrick.dumpCache = '';
Foxtrick.dumpFlush = function(doc) {
	if (doc.getElementById("page") != null
		&& FoxtrickPrefs.getBool("DisplayHTMLDebugOutput")
		&& Foxtrick.dumpCache != '') {
		var div = doc.getElementById("ft-log");
		if (div == null) {
			// create div as log container
			var div = doc.createElement('div');
			div.id = "ft-log";
			var header = doc.createElement("h2");
			header.textContent = Foxtrickl10n.getString("foxtrick.log");
			var pre = doc.createElement('pre');
			pre.textContent = Foxtrick.dumpCache;
			div.appendChild(header);
			div.appendChild(pre);

			// add to page
			var bottom = doc.getElementById("bottom");
			if (bottom)
				bottom.parentNode.insertBefore(div, bottom);
		}
		else {
			div.getElementsByTagName("pre")[0].textContent += Foxtrick.dumpCache;
		}
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
				item += "Stack trace: " + content.stack;
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
