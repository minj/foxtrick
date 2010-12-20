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

/*// remove before release
Foxtrick.globals=[];
for (Foxtrick.global in this){Foxtrick.globals.push(Foxtrick.global);} //Foxtrick.globals.sort();
*/

var FoxtrickMain = {
	new_start:true,
	isStandard:true,
	isRTL:false,
	vars:null,
	IsNewVersion:false,

	init : function() {
		Foxtrick.dump('-------------- FoxtrickMain.init start ------------------\n');
		// init core modules, for Chrome they are initialized in
		// loader-chrome.js
		if (Foxtrick.BuildFor !== "Chrome") {
			for (var i in Foxtrick.core_modules) {
				if (typeof(Foxtrick.core_modules[i].init) == "function")
					Foxtrick.core_modules[i].init();
			}
		}
		Foxtrick.MakeStatsHash();

		// check if this is a different version
		var curVersion = Foxtrick.version();
		var oldVersion = FoxtrickPrefs.getString("oldVersion");
		if (oldVersion !== curVersion) {
			// since the versioning scheme ordering is not exactly the same
			// as string ordering, only use "!==" here as Firefox itself does.
			FoxtrickMain.IsNewVersion = true;
		}

		// create handler arrays for each recognized page
		for (var i in Foxtrick.ht_pages) {
			Foxtrick.run_on_page[i] = new Array();
			Foxtrick.may_run_on_page[i] = new Array();
		}

		// init all modules
		for (var i in Foxtrick.modules) {
			var module = Foxtrick.modules[i];
			// if module has an init() function and is enabled
			if (module.MODULE_NAME
				&& (Foxtrick.isCoreModule(module) || Foxtrick.isModuleEnabled(module))) {
				if (typeof(module.init) == "function") {
					try {
						module.init();
					}
					catch (e) {
						Foxtrick.dumpError(e);
					}
				}
			}

			if (module.MODULE_NAME && module.PAGES) {
				Foxtrick.registerModulePages(module);
			}
		}

		if (Foxtrick && Foxtrick.statusbarDeactivate) {
			Foxtrick.statusbarDeactivate.setAttribute("checked", FoxtrickPrefs.getBool("disableTemporary"));
		}

		// reload skins
		Foxtrick.reload_css_permanent(Foxtrick.ResourcePath+'resources/css/foxtrick.css') ;
		Foxtrick.main_css_loaded = true;
		FoxtrickMain.new_start = true;

		Foxtrick.dump('-------------- FoxtrickMain.init end --------------------\n');
	},

	registerOnPageLoad : function(document) {
		try {
			if (!(Foxtrick.BuildFor === "Gecko"))
				return;
			// update status bar
			Foxtrick.updateStatus();

			// status bar menu
			var statusbarPreferences = document.getElementById("foxtrick-status-bar-preferences");
			statusbarPreferences.setAttribute("label", Foxtrickl10n.getString("preferences"));
			var statusbarDeactivate = document.getElementById("foxtrick-status-bar-deactivate");
			statusbarDeactivate.setAttribute("label", Foxtrickl10n.getString(
				"foxtrick.prefs.disableTemporaryLabel"));
			statusbarDeactivate.setAttribute("checked", FoxtrickPrefs.getBool("disableTemporary"));
			Foxtrick.statusbarDeactivate=statusbarDeactivate;

			// calls module.onLoad() after the browser window is loaded
			for (var i in Foxtrick.modules) {
				var module = Foxtrick.modules[i];
				if (typeof(module.onLoad) === "function") {
					try {
						module.onLoad(document);
					}
					catch (e) {
						Foxtrick.dump("Error caught in module " + module.MODULE_NAME + ":\n");
						Foxtrick.dumpError(e);
					}
				}
			}

			// tools menu
			var toolsMenu = document.getElementById("foxtrick-menu-preferences");
			toolsMenu.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.preferences"));

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
			Foxtrick.dumpError(e);
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

			Foxtrick.updateStatus();

			if (Foxtrick.isHt(doc)) {
				FoxtrickMain.run(doc, true); // recheck css
			}

			// calls module.onTabChange() after the tab focus is changed
			for (var i in Foxtrick.modules) {
				var module = Foxtrick.modules[i];
				if (typeof(module.onTabChange) === "function") {
					try {
						module.onTabChange(doc);
					}
					catch (e) {
						Foxtrick.dump("Error caught in module " + module.MODULE_NAME + ":\n");
						Foxtrick.dumpError(e);
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
		if ( doc.location.href.search(/\/Club\/Matches\/MatchOrder\//)!=-1 ||
			 doc.location.href.search(/\/Community\/CHPP\/ChppPrograms\.aspx/)!=-1) {
					return;
		}
		// ignore changes list
		if (ev.originalTarget.className && (ev.originalTarget.className=='boxBody' || ev.originalTarget.className=='myht1'))
			return;


		var panel = Foxtrick.getPanel(doc);
		// remove event listener while Foxtrick executes
		panel.removeEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
		var begin = new Date();
		FoxtrickMain.change(doc, ev);
		var end = new Date();
		var time = (end.getSeconds() - begin.getSeconds()) * 1000
				 + end.getMilliseconds() - begin.getMilliseconds();
		// re-add event listener
		panel.addEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
		} catch (e) {Foxtrick.dumpError(e);}
	},

	onPageLoad : function(ev) {
		try {
			//Foxtrick.dump('onPageLoad\n');
			var doc = ev.originalTarget;
			if (doc.nodeName != "#document")
				return;

			Foxtrick.updateStatus();

			if (Foxtrick.isHt(doc)) {
				// check if it's in exclude list
				for (var i in Foxtrick.pagesExcluded) {
					var excludeRe = new RegExp(Foxtrick.pagesExcluded[i], "i");
					// page excluded, return
					if (doc.location.href.search(excludeRe) > -1) {
						return;
					}
				}

				//Foxtrick.dump('---------------------- foxtrick onPageLoad start ----------------\n');

				var begin = new Date();
				FoxtrickMain.run(doc);
				var end = new Date();
				var time = (end.getSeconds() - begin.getSeconds()) * 1000
						 + end.getMilliseconds() - begin.getMilliseconds();
				Foxtrick.dump("run time: " + time + " ms | " + doc.location.pathname+doc.location.search + '\n');
				// listen to page content changes
				var panel = Foxtrick.getPanel(doc);
				if (panel) {
					var add_change = false;
					for (var page in Foxtrick.ht_pages) {
						if (Foxtrick.isPage(Foxtrick.ht_pages[page], doc)) {
							// on a specific page, run all handlers
							for (var i in Foxtrick.run_on_page[page]) {
								if (page=='all' || page=='all_late') continue;
								var module = Foxtrick.run_on_page[page][i];
								if (typeof(module.change) == "function") {
									add_change = true;
									break;
								}
							}
						}
						if (add_change)
							break;
					}
					if (add_change) {
						panel.addEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
					}
				}
				//Foxtrick.dump('add_change: '+add_change+'\n')
				//Foxtrick.dump('---------------------- foxtrick onPageLoad end -------------------\n')
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	onPageUnLoad : function(ev) {
		//Foxtrick.dump('onPageUnLoad\n');
		var doc = ev.originalTarget;
		if (doc.nodeName != "#document")
			return;
	},

	// main entry run on every ht page load
	run : function(doc, is_only_css_check) {
		try {
			//Foxtrick.dump('----- foxtrickmain run. is_only_css_check: '+(is_only_css_check!=null)+'\n');

			if (FoxtrickPrefs.getBool("preferences.updated")) {
				FoxtrickMain.init();
				FoxtrickPrefs.setBool("preferences.updated", false);
			}

			Foxtrick.updateStatus();

			// don't execute if on stage server and user doesn't want Foxtrick to be executed there
			// or disabled temporarily
			if ((FoxtrickPrefs.getBool("disableOnStage") && Foxtrick.isStage(doc))
				|| FoxtrickPrefs.getBool("disableTemporary")) {
				// potenial disable cleanup
				Foxtrick.dump("On Stage: " + Foxtrick.isStage(doc) + ", disabled on stage: " + FoxtrickPrefs.getBool("disableOnStage") + ".\n");
				Foxtrick.dump("Temporarily disabled: " + FoxtrickPrefs.getBool("disableTemporary") + "\n");
				FoxtrickMain.isStandard = Foxtrick.isStandardLayout(doc);
				FoxtrickMain.isRTL = Foxtrick.isRTLLayout(doc);
				//if (FoxtrickMain.isRTL)
				FoxtrickMain.new_start = false;
				if (Foxtrick.main_css_loaded) Foxtrick.unload_css_permanent(Foxtrick.ResourcePath+'resources/css/foxtrick.css') ;
				Foxtrick.main_css_loaded = false;
				Foxtrick.unload_module_css();
			}
			else {
				if (!Foxtrick.main_css_loaded) {
					Foxtrick.load_css_permanent(Foxtrick.ResourcePath+'resources/css/foxtrick.css') ;
					Foxtrick.main_css_loaded = true;
					FoxtrickMain.new_start = true;
				}

				// check newstart or design change and reload module css if needed
				if (FoxtrickMain.new_start) {
					FoxtrickMain.isStandard = Foxtrick.isStandardLayout(doc);
					FoxtrickMain.isRTL = Foxtrick.isRTLLayout(doc);
					Foxtrick.reload_module_css(doc);
					FoxtrickMain.new_start = false;
				}
				else {
					var curr_isStandard = Foxtrick.isStandardLayout(doc);
					var curr_isRTL = Foxtrick.isRTLLayout(doc);
					if (curr_isStandard != FoxtrickMain.isStandard || curr_isRTL != FoxtrickMain.isRTL) {
						FoxtrickMain.isStandard = curr_isStandard;
						FoxtrickMain.isRTL = curr_isRTL;
						Foxtrick.reload_module_css(doc);
					}
				}

				// If it's not only a CSS check, we go on to run the modules.
				if (!is_only_css_check) {
					// We run the modules that want to be run at every page.
					for (var i in Foxtrick.run_every_page) {
						var module = Foxtrick.run_every_page[i];
						if (typeof(module.run) == "function") {
							try {
								module.run(doc);
							}
							catch (e) {
								Foxtrick.dump("Error caught in module " + module.MODULE_NAME + ":\n");
								Foxtrick.dumpError(e);
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
											Foxtrick.dump("Module time: " + diff + "ms | " + module.MODULE_NAME + "\n");
										}
									}
									catch (e) {
										Foxtrick.dump("Error caught in module " + module.MODULE_NAME + ":\n");
										Foxtrick.dumpError(e);
									}
								}
							}
						}
					}

					// show version number
					var bottom = doc.getElementById("bottom");
					var server = bottom.getElementsByClassName("currentServer")[0];
					server.textContent += " / FoxTrick " + Foxtrick.version();
				}

				Foxtrick.dumpFlush(doc);
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
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
							Foxtrick.dump("Error caught in module " + fn.MODULE_NAME + ":\n");
							Foxtrick.dumpError(e);
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
									Foxtrick.dump("Error caught in module " + fn.MODULE_NAME + ":\n");
									Foxtrick.dumpError(e);
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
	return FoxtrickPrefs.getString("version");
};

Foxtrick.updateStatus = function() {
	if (Foxtrick.BuildFor === "Gecko") {
		var icon = document.getElementById("foxtrick-status-bar-img");
		var doc = content.document; // get the document of current tab

		var statusText;

		if (FoxtrickPrefs.getBool("disableTemporary")) {
			// FoxTrick is disabled temporarily
			icon.setAttribute("status", "disabled");
			statusText = Foxtrickl10n.getString("status.disabled");
		}
		else if (Foxtrick.isHt(doc)
			&& !(FoxtrickPrefs.getBool("disableOnStage") && Foxtrick.isStage(doc))) {
			// FoxTrick is enabled, and active on current page
			icon.setAttribute("status", "active");
			statusText = Foxtrickl10n.getString("status.active");
		}
		else {
			// FoxTrick is enabled, but not active on current page
			icon.setAttribute("status", "enabled");
			var hostname = Foxtrick.getHostname(doc);
			statusText = Foxtrickl10n.getString("status.enabled").replace("%s", hostname);
		}
		var tooltipText = Foxtrickl10n.getString("foxtrick") + " " + this.version() + " (" + statusText + ")";
		icon.setAttribute("tooltiptext", tooltipText);
	}
}

Foxtrick.isPage = function(page, doc) {
	var htpage_regexp = new RegExp(page.replace(/\./g,'\\.').replace(/\?/g,'\\?'), "i");
	return doc.location.href.search(htpage_regexp) > -1;
}

Foxtrick.getHref = function(doc) {
	return doc.location.href;
}

Foxtrick.getHostname = function(doc) {
	return Foxtrick.getHref(doc).replace(RegExp("^[a-zA-Z0-9]+:\/\/"), "").replace(RegExp("\/.*"), "");
}

Foxtrick.isHt = function(doc) {
	return (Foxtrick.getPanel(doc) !== null);
}

Foxtrick.isHtUrl = function(url) {
	return (url.search(FoxtrickPrefs.getString("HTURL")) > -1);
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
				if (Foxtrick.isCoreModule(module)
					|| Foxtrick.isModuleEnabled(module)) {
					Foxtrick.run_on_page[module.PAGES[i]].push(module);
				}
			}
			catch (e) {
				Foxtrick.dumpError(e);
				Foxtrick.dump('registerModulePages: '+module.MODULE_NAME+'\n');
				Foxtrick.dump('registerModulePages: '+module.PAGES[i]+'\n');
			}
		}
	}
	catch (e) {
		Foxtrick.dumpError(e);
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

/** Remove any occurences of tags ("<something>") from text */
Foxtrick.stripHTML = function(text) {
	return text.replace(/(<([^>]+)>)/ig,"");
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

Foxtrick.trim = function (text) {
	return text.replace(/^\s+/, "").replace(/\s+$/, '').replace(/&nbsp;/g,"");
}

Foxtrick.trimnum = function(text) {
	text = String(text);
	return text ? parseInt(text.replace(/&nbsp;/g, "").replace(/\s/g, "")) : 0;
}

Foxtrick.formatNumber = function(num, sep) {
	var num = Number(num);
	var negative = (num < 0);
	num = String(Math.abs(num));
	var output = num;
	if (sep === undefined) {
		sep = " ";
	}
	if (num.length > 3) {
		var mod = num.length % 3;
		output = (num > 0 ? (num.substring(0, mod)) : "");
		for (var i = 0; i < Math.floor(num.length / 3); ++i) {
			if (mod == 0 && i == 0)
				output += num.substring(mod+ 3 * i, mod + 3 * i + 3);
			else
				output += sep + num.substring(mod + 3 * i, mod + 3 * i + 3);
		}
	}
	if (negative)
		output = "-" + output;
	return output;
}

Foxtrick.substr_count = function (haystack, needle, offset, length) {
	// http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_substr_count/
	// Returns count of needle in a haystack.
	var pos = 0, cnt = 0;
	haystack += '';
	needle += '';
	if(isNaN(offset)) offset = 0;
	if(isNaN(length)) length = 0;
	offset--;
	while ((offset = haystack.indexOf(needle, offset+1)) != -1) {
		if (length > 0 && (offset+needle.length) > length) {
			return false;
		}
		else {
			cnt++;
		}
	}
	return cnt;
}

Foxtrick.isCoreModule = function(module) {
	// core modules must be executed no matter what user's preference is
	return (module.CORE_MODULE === true);
}

Foxtrick.isModuleEnabled = function(module) {
	try {
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

Foxtrick.hasClass = function(obj, cls) {
	return (obj.className !== undefined && obj.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)")) !== null);
}

Foxtrick.addClass = function(obj, cls) {
	if (!Foxtrick.hasClass(obj, cls)) {
		obj.className += " " + cls;
	}
}

Foxtrick.removeClass = function(obj, cls) {
	if (Foxtrick.hasClass(obj, cls)) {
		var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)", "g");
		obj.className = obj.className.replace(reg, " ");
	}
}

Foxtrick.toggleClass = function(obj, cls) {
	if (Foxtrick.hasClass(obj, cls)) {
		Foxtrick.removeClass(obj, cls);
	}
	else {
		Foxtrick.addClass(obj, cls);
	}
}

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
		Foxtrick.dumpError(e);
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
		Foxtrick.dumpError(e);
	}
	return null;
}

Foxtrick.playSound = function(url) {
	try {
		if (Foxtrick.BuildFor === "Gecko") {
			var soundService = Components.classes["@mozilla.org/sound;1"].getService(Components.interfaces.nsISound);
			var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
			soundService.play(ioService.newURI(url, null, null));
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			// not working yet to chrome bug: http://code.google.com/p/chromium/issues/detail?id=22152
			var music = new Audio(url);
			music.play();
		}
	}
	catch (e) {
		Foxtrick.dumpError(e);
	}
}

Foxtrick.unload_module_css = function() {
	Foxtrick.dump('unload permanents css\n');

	Foxtrick.unload_css_permanent(Foxtrick.ResourcePath+'resources/css/rtl.css') ;
	Foxtrick.unload_css_permanent(Foxtrick.ResourcePath+'resources/css/foxtrick_stage_simple.css') ;
	Foxtrick.unload_css_permanent(Foxtrick.ResourcePath+'resources/css/foxtrick_stage.css') ;

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
				Foxtrick.cssfiles += css+'\n';
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

		if (isRTL) Foxtrick.load_css_permanent(Foxtrick.ResourcePath+'resources/css/rtl.css') ;
		else Foxtrick.unload_css_permanent(Foxtrick.ResourcePath+'resources/css/rtl.css') ;

		if (isStandard) {
			Foxtrick.load_css_permanent(Foxtrick.ResourcePath+'resources/css/foxtrick_stage.css') ;
			Foxtrick.unload_css_permanent(Foxtrick.ResourcePath+'resources/css/foxtrick_stage_simple.css') ;
		}
		else {
			Foxtrick.load_css_permanent(Foxtrick.ResourcePath+'resources/css/foxtrick_stage_simple.css') ;
			Foxtrick.unload_css_permanent(Foxtrick.ResourcePath+'resources/css/foxtrick_stage.css') ;
		}
		// check permanant css
		for (var i in Foxtrick.modules) {
			var module = Foxtrick.modules[i];
			// if module has an css) function and is enabled
			if (module.MODULE_NAME) {
				if (module.OLD_CSS && module.OLD_CSS!="") {
					Foxtrick.unload_css_permanent (module.OLD_CSS);
				}
				if (module.CSS_SIMPLE) {
					if ((Foxtrick.isCoreModule(module) || Foxtrick.isModuleEnabled(module)) && !FoxtrickMain.isStandard) {
						if (!isRTL || !module.CSS_SIMPLE_RTL) {
							Foxtrick.load_css_permanent (module.CSS_SIMPLE);
							if (module.CSS_SIMPLE_RTL)
								Foxtrick.unload_css_permanent (module.CSS_SIMPLE_RTL);
						}
						else {
							Foxtrick.load_css_permanent (module.CSS_SIMPLE_RTL) ;
							Foxtrick.unload_css_permanent (module.CSS_SIMPLE);
							}
					}
					else {
						Foxtrick.unload_css_permanent (module.CSS_SIMPLE) ;
						if (module.CSS_SIMPLE_RTL)
							Foxtrick.unload_css_permanent (module.CSS_SIMPLE_RTL) ;
					}
				}
				if (module.CSS) {
					if ((Foxtrick.isCoreModule(module) || Foxtrick.isModuleEnabled(module)) && (!module.CSS_SIMPLE || FoxtrickMain.isStandard)) {
						if (!isRTL || !module.CSS_RTL){
							Foxtrick.load_css_permanent (module.CSS) ;
							if (module.CSS_RTL)
								Foxtrick.unload_css_permanent (module.CSS_RTL);
						}
						else {
							Foxtrick.load_css_permanent (module.CSS_RTL);
							Foxtrick.unload_css_permanent (module.CSS);
						}
					}
					else {
						Foxtrick.unload_css_permanent (module.CSS) ;
						if (module.CSS_RTL && module.CSS!="")
							Foxtrick.unload_css_permanent (module.CSS_RTL) ;
					}
				}
				if (module.OPTIONS_CSS) {
					for (var k=0; k<module.OPTIONS_CSS.length;++k) {
						if ((Foxtrick.isCoreModule(module) || Foxtrick.isModuleEnabled(module)) && Foxtrick.isModuleFeatureEnabled(module, module.OPTIONS[k])) {
							if (module.OPTIONS_CSS[k] != "" && (!isRTL || !module.OPTIONS_CSS_RTL)) {
						 		if (module.OPTIONS_CSS_RTL && module.OPTIONS_CSS_RTL[k] != "")
									Foxtrick.unload_css_permanent (module.OPTIONS_CSS_RTL[k]) ;
								Foxtrick.load_css_permanent (module.OPTIONS_CSS[k]) ;
							}
							else {
								if (module.OPTIONS_CSS[k] != "")
										Foxtrick.unload_css_permanent (module.OPTIONS_CSS[k]) ;
								if (isRTL) {
									if (module.OPTIONS_CSS_RTL && module.OPTIONS_CSS_RTL[k] != "")
										Foxtrick.load_css_permanent (module.OPTIONS_CSS_RTL[k]) ;
								}
								else {
									if (module.OPTIONS_CSS_RTL && module.OPTIONS_CSS_RTL[k] != "")
										Foxtrick.unload_css_permanent (module.OPTIONS_CSS_RTL[k]) ;
								}
							}
						}
						else {
							if (module.OPTIONS_CSS[k] != "")
								Foxtrick.unload_css_permanent (module.OPTIONS_CSS[k]) ;
							if (module.OPTIONS_CSS_RTL && module.OPTIONS_CSS_RTL[k] != "")
								Foxtrick.unload_css_permanent (module.OPTIONS_CSS_RTL[k]) ;
						}
					}
				}
			}
		}
		if (Foxtrick.BuildFor === "Chrome")
			portsetpref.postMessage({reqtype: "get_css_text", css_filelist: Foxtrick.cssfiles});
	}
	catch (e) {
		Foxtrick.dumpError(e);
	}
}

Foxtrick.hasElement = function(doc, id) {
	if (doc.getElementById(id)) {
		return true;
	}
	return false;
}

Foxtrick.getChildIndex = function(element) {
	var count = 0;
	while (element.previousSibling) {
		++count;
		element = element.previousSibling;
	}
	return count;
}

/* Foxtrick.addBoxToSidebar
* Parameters:
* doc - the document the box needs to be added to
* title - the title of the new box
* content - the content of the new box (should be a DOM element)
* id - the id the new box should get (has to be unique!)
* insertBefore - the header of the reference-object: the new box will be placed *before* this reference-object;
* 	-- Should be a string with the header, e.g. "Actions"
* 	-- or a string "last" if it should be put at the very bottom of the sidebar
* 	-- or a string "first" if it should be put at the very top
*	-- if left empty, it'll be placed on top
* altInsertBefore - specify an alternative header if the referenceHeader cannot be found
* 	-- Can be left empty
* column - specify which column the box shall be added to
*
* Note: if the header is the same as one of the other boxes in the sidebar,
* the content will be added to that sidebarbox instead of creating a new one
*/
Foxtrick.addBoxToSidebar = function(doc, title, content, id, insertBefore, altInsertBefore, column) {
	try {
		if (!id || !content.id) {
			// No id, return
			Foxtrick.dump("addBoxToSidebar: error: id should be specified and content should have an id.\n");
			return;
		}

		if (Foxtrick.hasElement(doc, id) || Foxtrick.hasElement(doc, content.id)) {
			// Box with same id already existed, return
			return;
		}

		var sidebar = null;
		var boxClass;
		if (!column || column == "right") {
			sidebar = doc.getElementById("sidebar");
			boxClass = "sidebarBox";
		}
		else {
			sidebar = doc.getElementsByClassName("subMenu")[0]
				|| doc.getElementsByClassName("subMenuConf")[0];
			boxClass = "subMenuBox";
		}
		if (!sidebar) {
			// No sidebar, nothing can be added.
			// An option to create sidebar could be implemented sometime.
			return;
		}

		var divs = sidebar.getElementsByTagName("div");

		// Check if any of the other sidebarboxes have the same header
		// and find the (alternative/normal) reference-object in the process
		var existingBox = null;
		var insertBeforeObject = null;
		var altInsertBeforeObject = null;
		var currentBox, i = 0;
		while (currentBox = divs[i++]) {
			// Check if this child is of box_class
			if (currentBox.className === boxClass) {
				var header = currentBox.getElementsByTagName("h2")[0];
				if (header.innerHTML === title) {
					existingBox = currentBox;
				}
				if (header.innerHTML === insertBefore) {
					insertBeforeObject = currentBox;
				}
				if (header.innerHTML === altInsertBefore) {
					altInsertBeforeObject = currentBox;
				}
			}
			currentBox = currentBox.nextSibling;
		}

		if (!insertBeforeObject && insertBefore != "first"
			&& insertBefore != "last") {
			// the reference header could not be found; try the alternative
			if (!altInsertBeforeObject && altInsertBefore != "first"
				&& altInsertBefore != "last") {
				// alternative header couldn't be found either
				// place the box on top
				Foxtrick.dump("addBoxToSidebar: Could not find insertBefore " +
				insertBefore + "\n" + "nor altInsertBefore " +
				altInsertBefore + "\n");
				insertBefore = "first";
			}
			else {
				insertBeforeObject = altInsertBeforeObject;
				insertBefore = altInsertBefore;
			}
		}
		if (insertBefore == "first") {
			insertBeforeObject = sidebar.firstChild;
		}

		if (FoxtrickMain.isStandard) {
			// Standard layout
			if (existingBox) {
				existingBox.id = id;
				var boxBody = existingBox.getElementsByClassName("boxBody")[0];
				boxBody.insertBefore(content, boxBody.firstChild);
				return existingBox;
			}
			else {
				// sidebarBox
				var sidebarBox = doc.createElement("div");
				sidebarBox.id = id;
				sidebarBox.className = boxClass;
				// boxHead
				var boxHead = doc.createElement("div");
				boxHead.className = "boxHead";
				sidebarBox.appendChild(boxHead);
				// boxHead - boxLeft
				var headBoxLeft = doc.createElement("div");
				headBoxLeft.className = "boxLeft";
				boxHead.appendChild(headBoxLeft);
				// boxHead - boxLeft - h2
				var h2 = doc.createElement("h2");
				h2.innerHTML = title;
				headBoxLeft.appendChild(h2);
				// boxBody
				var boxBody = doc.createElement("div");
				boxBody.className = "boxBody";
				sidebarBox.appendChild(boxBody);
				// append content to boxBody
				boxBody.appendChild(content);
				// boxFooter
				var boxFooter = doc.createElement("div");
				boxFooter.className = "boxFooter";
				sidebarBox.appendChild(boxFooter);
				// boxFooter - boxLeft
				var footBoxLeft = doc.createElement("div");
				footBoxLeft.className = "boxLeft";
				footBoxLeft.innerHTML = "&nbsp;";
				boxFooter.appendChild(footBoxLeft);

				// insert the sidebar box
				sidebar.insertBefore(sidebarBox, insertBeforeObject);
			}
		}
		else {
			// Simple layout
			if (existingBox) {
				var existingBoxHeader = existingBox.getElementsByTagName("h2")[0];
				existingBox.id = id;
				existingBox.insertBefore(content, existingBoxHeader.nextSibling);
			}
			else {
				// sidebar box
				var sidebarBox = doc.createElement("div");
				sidebarBox.id = id;
				sidebarBox.className = boxClass;
				// header
				var header = doc.createElement("h2");
				header.innerHTML = title;
				sidebarBox.appendChild(header);
				// append content to body
				sidebarBox.appendChild(content);

				// insert the sidebar box
				sidebar.insertBefore(sidebarBox, insertBeforeObject);
			}
		}
	}
	catch (e) {
		Foxtrick.dumpError(e);
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

Foxtrick.substr = function(f_string, f_start, f_length) {
	f_string += '';

	if(f_start < 0) {
		f_start += f_string.length;
	}

	if(f_length == undefined) {
		f_length = f_string.length;
	}
	else if (f_length < 0){
		f_length += f_string.length;
	}
	else {
		f_length += f_start;
	}

	if (f_length < f_start) {
		f_length = f_start;
	}

	return f_string.substring(f_start, f_length);
}

Foxtrick.strrpos = function(haystack, needle, offset){
	var i = (haystack+'').lastIndexOf(needle, offset); // returns -1
	return i >= 0 ? i : false;
}

Foxtrick.copyStringToClipboard = function (string) {
	if (Foxtrick.BuildFor === "Gecko") {
		var gClipboardHelper = Components
			.classes["@mozilla.org/widget/clipboardhelper;1"]
			.getService(Components.interfaces.nsIClipboardHelper);
		gClipboardHelper.copyString(string);
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


Foxtrick.setActiveTextBox = function (field, cssClass, text) {
	var fieldObj = document.getElementById(field);
	fieldObj.className = cssClass;
	if (fieldObj.value == text) {
		fieldObj.value = "";
		return true;
	}
}

Foxtrick.setInactiveTextBox = function (field, cssClass, text) {
	var fieldObj = document.getElementById(field);
	if (fieldObj.value.length === 0) {
		fieldObj.className = cssClass;
		fieldObj.value = text;
	}
	return true;
}


Foxtrick.GetElementPosition = function (This,ref){
	var el = This;var pT = 0; var pL = 0;
	while(el && el!=ref){pT+=el.offsetTop; pL+=el.offsetLeft; el=el.offsetParent;}
	return {'top':pT,'left':pL};
}

Foxtrick.GetDataURIText = function (filetext) {
	return "data:text/plain;charset=utf-8,"+encodeURIComponent(filetext);
}


Foxtrick.LoadXML = function(xmlfile, callback, crossSite) {
	if (Foxtrick.BuildFor == "Chrome" && Foxtrick.chromeContext() == "content"
		&& crossSite) {
		// the evil Chrome that requires us to send a message to
		// background script for cross-site requests
		chrome.extension.sendRequest({req : "xml", url : xmlfile},
			function(response) {
				var parser = new DOMParser();
				var xml = parser.parseFromString(response.data, "text/xml");
				callback(xml);
			}
		);
	}
	else {
		var req = new XMLHttpRequest();
		if (!callback) {
			req.open("GET", xmlfile, false);
			req.send(null);
			var response = req.responseXML;
			if (response.documentElement.nodeName == "parsererror") {
				Foxtrick.dump("error parsing " + xmlfile + "\n");
				return null;
			}
			return response;
		}
		else {
			req.open("GET", xmlfile, true);
			req.onreadystatechange = function(aEvt) {
				try {
					if (req.readyState == 4) {
						// only HTTP request has status 200, 0 for file://, etc
						if (req.status == 200
							|| req.status == 0) {
							callback(req.responseXML);
						}
					}
				}
				catch (e) {
					Foxtrick.dumpError(e);
				}
			};
			req.send();
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
	//var path = "hattricklanguages/language[@name='" + lang + "']/tactics/tactic[@value=\"" + tactics + "\"]";
	/*try {
		splitpath = path.split(/\/|\[/g);
		var result = xmldoc;
		for (var j=0;j<splitpath.length;++j) {
			if (j!=splitpath.lenght-1 && splitpath[j+1].search('@')==-1) continue;
			result = xmldoc.getElementsByTagName(splitpath[j]);
			var s_attr = splitpath[j+1].match(/@(.+)=/)[1];
			var s_val = splitpath[j+1].match(/=(.+)\]/)[1].replace(/'|"/g,'');
			//dump(splitpath[j+1]+' a:'+s_attr+' v:'+s_val+'\n');
			for (var i=0;i<result.length;++i) { if(result[i].getAttribute(s_attr)==s_val) {
				result = result[i]; break;}}
			j++;
		}
		if (attribute) result = result.getAttribute(attribute);
		//dump (attribute+' '+result+'\n');
		return result;
	} catch (e) {return null;}*/

	var obj = xmldoc.evaluate(path,xmldoc,null,xmldoc.DOCUMENT_NODE,null).singleNodeValue;
	if (obj)
		if (attribute) return obj.attributes.getNamedItem(attribute).textContent;
		else return obj;
	else
		return null;
}

Foxtrick.linebreak = function (txt, where) {
	try {
		if (txt == null) return '';
		txt = txt.replace(/\<br\>/gi, ' <br> ');
		var d = txt.split(' ');
		// Foxtrick.dump ('TEXT= [' + d + ']\n');
		for (var j = 0; j < d.length; j++) {
			//Foxtrick.dump(' LB [' + j + '] => "'+ d[j] + '"\n');
			if (d[j].length > where && d[j].search(/href\=|title\=/i) == -1) {
				d[j] = Foxtrick.cut_word(d[j], where);
				//Foxtrick.dump(' LB [' + j + '] <= "'+ d[j] + '"\n');
			}
		}
		return d.join(" ");
	}
	catch (e) {
		Foxtrick.dump('LINEBREAK: ' + e + '\n');
	}
}

Foxtrick.cut_word = function (txt, where) {
	try {
		if (txt == null) return '';
		txt = txt.replace(/\<\//g, ' </')
		var c, a=0, g=0, d = new Array();
		for (c = 0; c < txt.length; c++) {

			d[c + g] = txt[c];
			if (txt[c] != " ") a++;
			else if (txt[c] == " ") a = 0;
			if (a == where) {
				g++;
				d[c+g] = " ";
				a = 0;
			}

		}
		return d.join("");
	}
	catch (e) {
		Foxtrick.dump('CUT WORD: ' + e + '\n');
	}
}

Foxtrick.in_array = function(arr, needle) {
	for (var i=0; i < arr.length; i++) {
		if (arr[i] === needle) return true;
		if (i>10000) return false;
	}
	return false;
}

Foxtrick.var_dump = function(arr,level) {
	var dumped_text = "";
	if(!level) level = 0;

	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "	";

	if (typeof(arr) == 'object') { //Array/Hashes/Objects
		for(var item in arr) {
			var value = arr[item];

			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...<br>\n";
				dumped_text += Foxtrick.var_dump(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"<br>\n";
			}
		}
	}
	else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}

Foxtrick.dumpCache = '';
Foxtrick.dumpFlush = function(doc) {
	if (doc.getElementById("page") != null
		&& FoxtrickPrefs.getBool("DisplayHTMLDebugOutput")
		&& Foxtrick.dumpCache != '') {
		try {
			var div = doc.getElementById('ft_dump');
			if (div == null) {
				var div = doc.createElement('div');
				div.id = "ft_dump";
				var header = doc.createElement('h1');
				header.textContent = "FoxTrick Log";
				var pre = doc.createElement('pre');
				pre.textContent = Foxtrick.dumpCache;
				div.appendChild(header);
				div.appendChild(pre);
				doc.getElementById('page').appendChild(div);
			}
			else {
				div.getElementsByTagName('pre')[0].textContent += Foxtrick.dumpCache;
			}
			Foxtrick.dumpCache = '';
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
}

Foxtrick.dump = function(content) {
	content = String(content);
	Foxtrick.dumpCache += content;
	if (Foxtrick.BuildFor === "Gecko")
		dump("FT: " + content);
	else if (Foxtrick.BuildFor === "Chrome")
		console.log(content);
}

Foxtrick.dumpError = function(error) {
	if (Foxtrick.BuildFor === "Gecko") {
		Foxtrick.dump(error.fileName + "(" + error.lineNumber + "): " + error + "\n");
		Foxtrick.dump("Stack trace:\n" + error.stack + "\n\n");
		Components.utils.reportError(error);
	}
	else if (Foxtrick.BuildFor === "Chrome") {
		var msg = "";
		for (var i in error)
			msg += i + ": " + error[i] + "; ";
		Foxtrick.dump(msg + "\n");
	}
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
