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
				
				
				// can be used to preload chpp xml
				/*document.addEventListener("click",
					function (e)
					{ 	
						if (typeof(e.target.tagName) != "undefined" && e.target.tagName == 'A') {
							var a = e.target; 
							if (Foxtrick.isHtUrl(a.href))
							{
								dump('do load:'+a.href+'\n');
							}
						}
					},
					true);*/
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

			var content = doc.getElementById("content");
			if (!content) {
				Foxtrick.log("Cannot find #content at ", doc.location);
				return;
			}
			// remove event listener while Foxtrick executes
			Foxtrick.stopListenToChange(doc);
			FoxtrickMain.change(doc, ev);
			// re-add event listener
			Foxtrick.startListenToChange(doc);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	lastTime : 0,
	onPageLoad : function(ev) {
		try {
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

				var begin = (new Date()).getTime();
				//var begin=FoxtrickMain.lastTime;
					FoxtrickMain.run(doc);
				var diff = (new Date()).getTime() - begin;
				Foxtrick.dump("run time: " + diff + " ms | " + doc.location.pathname+doc.location.search + '\n');
				// listen to page content changes
				var content = doc.getElementById("content");
				if (!content) {
					Foxtrick.log("Cannot find #content at ", doc.location);
					return;
				}
				Foxtrick.startListenToChange(doc);
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	// do nothing
	onPageUnLoad : function(ev) { FoxtrickMain.lastTime = (new Date()).getTime();},

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

			var isStandard = FoxtrickPrefs.getBool('isStandard');
			var isRTL = FoxtrickPrefs.getBool('isRTL');
			// reload CSS if not loaded or page layout changed
			if ( Foxtrick.isHt(doc) && 
				(!FoxtrickMain.cssLoaded
				|| (Foxtrick.isStandardLayout(doc) !== FoxtrickPrefs.getBool('isStandard'))
				|| (Foxtrick.isRTLLayout(doc) !== FoxtrickPrefs.getBool('isRTL')))) {
				Foxtrick.log('layout change');
				FoxtrickPrefs.setBool('isStandard', Foxtrick.isStandardLayout(doc));
				FoxtrickPrefs.setBool('isRTL', Foxtrick.isRTLLayout(doc));
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
	change : function(doc, ev) {
		if(!(FoxtrickPrefs.getBool("disableOnStage") && Foxtrick.isStage(doc))
			&& !FoxtrickPrefs.getBool("disableTemporary")) {

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
	content.removeEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
}

Foxtrick.startListenToChange = function(doc) {
	var content = doc.getElementById("content");
	content.addEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
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

Foxtrick.addStyleSheetSnippet = function(doc, css, id) {
	if ( Foxtrick.BuildFor === "Chrome" ) css = Foxtrick.replaceExtensionDirectory(css);

	var head = doc.getElementsByTagName("head")[0];
	var style = doc.createElement("style");
	style.setAttribute("type", "text/css");
	if (id) style.setAttribute("id", id);
	style.appendChild(doc.createTextNode(css));
	head.appendChild(style);
}

Foxtrick.removeStyleSheetSnippet = function(doc, id) {
	var head = doc.getElementsByTagName("head")[0];
	var style = doc.getElementById(id);
	if (style) head.removeChild(style);
}

Foxtrick.replaceExtensionDirectory = function(cssTextCollection) {		
	// replace ff chrome reference by google chrome refs
	var exturl = chrome.extension.getURL("");
	return cssTextCollection.replace(RegExp("chrome://foxtrick/", "g"), exturl);
};

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
		Foxtrick.removeStyleSheetSnippet(doc, 'module_css');
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
	else Foxtrick.removeStyleSheetSnippet(doc, 'module_css');
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
			Foxtrick.removeStyleSheetSnippet(doc, 'module_css');
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
					Foxtrick.addStyleSheetSnippet(doc, data.cssText);
				}
			);
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
}

// Check whether the site is in standard theme instead of simple theme
Foxtrick.isStandardLayout = function (doc) {
	var head = doc.getElementsByTagName("head")[0];
	if (!head)
		return null;
	var links = head.getElementsByTagName("link");
	if (links.length!=0){
		var i=0,link;
		while (link=links[i++]) {
			if (link.href.search(/\/App_Themes\/Simple/i)!=-1) return false;
		}
	}
	else { // mobile internet may have style embedded
		var styles = head.getElementsByTagName("style");
		var i=0,style;
		while (style=styles[i++]) {
			if (style.textContent.search(/\/App_Themes\/Simple/i)!=-1) return false;
		}
	}
	return true; // true = standard / false = simple
}

// Check whether the site is right-to-left layout
Foxtrick.isRTLLayout = function (doc) {
	var head = doc.getElementsByTagName("head")[0];
	if (!head)
		return null;
	var links = head.getElementsByTagName("link");
	var rtl=false;
	if (links.length!=0) {
		var i=0,link;
		while (link=links[i++]) {
			if (link.href.search("_rtl.css") != -1) rtl = true;
		}
	}
	else { // mobile internet may have style embedded
		var styles = head.getElementsByTagName("style");
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
	var hasScroll=false;
	var mainBodyChildren = doc.getElementById('mainBody').getElementsByTagName('script');
	var i = 0, child;
	while (child = mainBodyChildren[i++]) {
		if (child.innerHTML && child.innerHTML.search(/adjustHeight\(\'mainBody\'/) != -1) {hasScroll=true; break;}
	}
	return hasScroll;
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
				.replace(/%4/, Foxtrick.isStandardLayout(doc) ? "standard" : "simple")
				.replace(/%5/, Foxtrick.isRTLLayout(doc) ? "RTL" : "LTR");
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
