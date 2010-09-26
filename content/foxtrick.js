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
Foxtrick.core_modules = [ FoxtrickPrefs, Foxtrickl10n ];

/*// remove before release
Foxtrick.globals=[];
for (Foxtrick.global in this){Foxtrick.globals.push(Foxtrick.global);} //Foxtrick.globals.sort();
*/

var changecount = 0;

////////////////////////////////////////////////////////////////////////////////
var FoxtrickMain = {
	new_start:true,
	isStandard:true,
	isRTL:false,
	vars:null,
	IsNewVersion:false,

	init : function() {
		Foxtrick.dump('-------------- FoxtrickMain.init start ------------------\n');
/*		// remove before release
		if (!Foxtrick.numglobals) {
				for (var i=0;i<Foxtrick.globals.length;++i) Foxtrick.dump('global: ' +Foxtrick.globals[i]+'\n');
				Foxtrick.numglobals=Foxtrick.globals.length;
		}
		else {
			for (var i=Foxtrick.numglobals;i<Foxtrick.globals.length;++i)
				if (Foxtrick.globals[i]!='QueryInterface') Foxtrick.dump('undeclared local global variable: ' +Foxtrick.globals[i]+'\n');
		}
*/
		// init core modules
		for (var i in Foxtrick.core_modules) {
			if (typeof(Foxtrick.core_modules[i].init) == "function")
				Foxtrick.core_modules[i].init();
		}
		Foxtrick.MakeStatsHash();

		// check if this is a new version
		var curVersion = FoxtrickPrefs.getString("curVersion");
		var oldVersion = FoxtrickPrefs.getString("oldVersion");
		Foxtrick.dump(curVersion+' > '+ oldVersion+': '+(curVersion>oldVersion)+'\n');
		if (oldVersion < curVersion) {
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
			if (module.MODULE_NAME && Foxtrick.isModuleEnabled(module)) {
				if (typeof(module.init) == "function") {
					try {
						module.init();
						//Foxtrick.dump("Foxtrick enabled module: " + module.MODULE_NAME + "\n");
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
			dumpError(e);
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
		var doc = ev.originalTarget.ownerDocument;
		if (doc.nodeName != "#document")
			return;

		// not on matchlineup
		if ( doc.location.href.search(/\/Club\/Matches\/MatchOrder\//)!=-1 ||
			 doc.location.href.search(/\/Community\/CHPP\/ChppPrograms\.aspx/)!=-1) {
					return;
		}
		// ignore changes list
		if (ev.originalTarget.className && (ev.originalTarget.className=='boxBody' || ev.originalTarget.className=='myht1'))
			return;

		if (changecount++ > 100) return;

		var content = doc.getElementById("content");
		// remove event listener while Foxtrick executes
		content.removeEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
		var begin = new Date();
		FoxtrickMain.change(doc, ev);
		var end = new Date();
		var time = (end.getSeconds() - begin.getSeconds()) * 1000
				 + end.getMilliseconds() - begin.getMilliseconds();
		//Foxtrick.dump('changecount: '+changecount+' '+ev.target.nodeName+' '+ev.target.className+" " + time + " ms\n");
		// re-add event listener
		content.addEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
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
				changecount = 0;
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
				var content = doc.getElementById("content");
				if (content) {
					var add_change = false;
					for (var page in Foxtrick.ht_pages) {
						if (Foxtrick.isPage(Foxtrick.ht_pages[page], doc)) {
							// on a specific page, run all handlers
							for (var i in Foxtrick.run_on_page[page]) {
								if (page=='all' || page=='all_late') continue;
								var module = Foxtrick.run_on_page[page][i];
								if (typeof(module.change) == "function") {
									add_change = true;
									// Foxtrick.dump('module has change on page "' + page + '": ' + module.MODULE_NAME + '.\n');
								}
							}
						}
					}
					if (add_change) {
						content.addEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
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
					FoxtrickReadHtPrefsFromHeader.run('', doc, true);
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
					server.textContent += " / FoxTrick v" + FoxtrickPrefs.getString("curVersion");
				}

				Foxtrick.dump_flush(doc);
			}
		}
		catch (e) {
			Foxtrick.dump('Foxtrick.run: '+e+'\n');
		}
	},

	// function run on every ht page change
	change : function(doc, ev) {
		var stage_regexp = /http:\/\/stage\.hattrick\.org/i;
		if(!(FoxtrickPrefs.getBool("disableOnStage")
			&& Foxtrick.getHref(doc).search(stage_regexp) > -1)
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
			Foxtrick.dump_flush(doc);
		}
	}
};

Foxtrick.updateStatus = function() {
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
	var tooltipText = Foxtrickl10n.getString("foxtrick") + " (" + statusText + ")";
	icon.setAttribute("tooltiptext", tooltipText);
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
//	return (Foxtrick.getHref(doc).search(FoxtrickPrefs.getString("HTURL")) > -1);
	return (doc.getElementById('hattrick')!==null || doc.getElementById('hattrickNoSupporter')!==null);
}

var stage_regexp = /http:\/\/stage\.hattrick\.org/i;
Foxtrick.isStage = function(doc) {
	return (Foxtrick.getHref(doc).search(stage_regexp) > -1);
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
	var content = doc.getElementById("content");
	content.removeEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
}

Foxtrick.startListenToChange = function (doc) {
	var content = doc.getElementById("content");
	content.addEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
}

Foxtrick.addEventListenerChangeSave = function(node, type, fkt, trickle) {
	node.addEventListener(
			type,
			function(ev){
				var doc = ev.target.ownerDocument;
				var content = doc.getElementById("content");
				content.removeEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
					fkt(ev);
				content.addEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true);
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
	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
		.getService(Components.interfaces.nsIPromptService);
	return promptService.confirm(null, null, msg);
}

Foxtrick.alert = function(msg) {
	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
		.getService(Components.interfaces.nsIPromptService);
	return promptService.alert(null, null, msg);
}

Foxtrick.trim = function (text) {
	return text.replace(/^\s+/, "").replace(/\s+$/, '').replace(/&nbsp;/g,"");
}

Foxtrick.trimnum = function(text) {
	text = String(text);
	return text ? parseInt(text.replace(/&nbsp;/g, "").replace(/\s/g, "")) : 0;
}

Foxtrick.formatNumber = function(num, sep) {
	num = String(num);
	if (sep === undefined) {
		sep = " ";
	}
	var output = num.substr(num.length-3,3);
	for (var pos = num.length-3; pos>0; pos-=3) {
		output = num.substring(pos-3,pos) + sep + output;
	}
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

// this function is used to escape special characters in strings so that they
// can be used in RegExp. Otherwise, a single unescaped special charcater like
// "*"(asterisk) used in RegExp matching will result in an "invalid quantifier"
// error.
Foxtrick.stringToRegExp = function(string) {
	var ret = "";
	var special = [];
	special["*"] = special["+"] = special["?"] = special["$"] = special["^"]
		= special["{"] = special["}"] = special["("] = special[")"] = true;
	for (var i = 0; i < string.length; ++i) {
		if (special[string[i]] === true) {
			ret += "\\"; // escape it here
		}
		ret += string[i];
	}
	return RegExp(ret);
};

Foxtrick.isModuleEnabled = function(module) {
	try {
		var val = FoxtrickPrefs.getBool("module." + module.MODULE_NAME + ".enabled");
		return (val != null) ? val : module.DEFAULT_ENABLED;
	}
	catch (e) {
		return false;
	}
}

Foxtrick.isModuleFeatureEnabled = function(module , feature) {
	try {
		var val = FoxtrickPrefs.getBool("module." + module.MODULE_NAME + "." + feature + ".enabled");
		return (val != null) ? val : module.DEFAULT_ENABLED;
	}
	catch (e) {
		return false;
	}
}

Foxtrick.getModuleValue = function(module) {
	try {
		var val = FoxtrickPrefs.getInt("module." + module.MODULE_NAME + ".value");
		return (val != null) ? val : 0;
	}
	catch (e) {
		return false;
	}
}

Foxtrick.LOG = function (msg) {
	var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
		 .getService(Components.interfaces.nsIConsoleService);
	consoleService.logStringMessage(msg);
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
		var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker);
		fp.init(parentWindow, "", fp.modeSave);
		var ret=fp.show();
		if (ret == fp.returnOK || ret==fp.returnReplace) {
			return fp.file.path;
		}
	}
	catch (e) {
		Foxtrick.dumpError(e);
	}
	return null;
}

Foxtrick.selectFile = function (parentWindow) {
	try {
		var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker);
		fp.init(parentWindow, "", fp.modeOpen);
		if (fp.show() == fp.returnOK) {
			return fp.file.path;
		}
	}
	catch (e) {
		Foxtrick.dumpError(e);
	}
	return null;
}

Foxtrick.playSound = function(url) {
	try {
		Foxtrick.dump('playSound: '+url+'\n');
		var soundService = Components.classes["@mozilla.org/sound;1"].getService(Components.interfaces.nsISound);
		var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
		soundService.play(ioService.newURI(url, null, null));
	}
	catch (e) {
		Foxtrick.dump('playSound'+e+'\n');
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

Foxtrick.unload_css_permanent = function(css) {
	try {
		try {
			var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
			var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
			var uri = ios.newURI(css, null, null);
		}
		catch (e) {
			return;
		}
		// try unload
		if (sss.sheetRegistered(uri, sss.USER_SHEET)) {
				sss.unregisterSheet(uri, sss.USER_SHEET);
				Foxtrick.dump('unload '+css.substr(0,65)+'\n');
		}
		//else Foxtrick.dump('not loaded '+css+'\n');
	}
	catch (e) {
		Foxtrick.dump ('> load_css_permanent ' + e + '\n');
	}
}

Foxtrick.load_css_permanent = function(css) {
	try {
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
					Foxtrick.dump('load '+css.substr(0,65)+'\n');
		}
		//else Foxtrick.dump('was loaded '+css+'\n');
	}
	catch (e) {
		Foxtrick.dump ('> ERROR load_css_permanent: ' + css + '\n');
	}
}

Foxtrick.reload_css_permanent = function(css) {
	Foxtrick.unload_css_permanent (css) ;
	Foxtrick.load_css_permanent (css) ;
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
				if (module.CSS_SIMPLE && module.CSS_SIMPLE!="") {
					if (Foxtrick.isModuleEnabled(module) && !FoxtrickMain.isStandard) {
						if (!isRTL || !module.CSS_SIMPLE_RTL) {
							Foxtrick.load_css_permanent (module.CSS_SIMPLE);
							if (module.CSS_SIMPLE_RTL) Foxtrick.unload_css_permanent (module.CSS_SIMPLE_RTL);
						}
						else {
							Foxtrick.load_css_permanent (module.CSS_SIMPLE_RTL) ;
							Foxtrick.unload_css_permanent (module.CSS_SIMPLE);
							}
					}
					else {
						Foxtrick.unload_css_permanent (module.CSS_SIMPLE) ;
						if (module.CSS_SIMPLE_RTL) Foxtrick.unload_css_permanent (module.CSS_SIMPLE_RTL) ;
					}
				}
				if (module.CSS && module.CSS!="") {
					if (Foxtrick.isModuleEnabled(module) && (!module.CSS_SIMPLE || FoxtrickMain.isStandard)) {
						if (!isRTL || !module.CSS_RTL){
							Foxtrick.load_css_permanent (module.CSS) ;
							if (module.CSS_RTL) Foxtrick.unload_css_permanent (module.CSS_RTL);
						}
						else {
							Foxtrick.load_css_permanent (module.CSS_RTL);
							Foxtrick.unload_css_permanent (module.CSS);
						}
					}
					else {
						Foxtrick.unload_css_permanent (module.CSS) ;
						if (module.CSS_RTL&& module.CSS!="") Foxtrick.unload_css_permanent (module.CSS_RTL) ;
					}
				}
				if (module.OPTIONS_CSS) {
					for (var k=0; k<module.OPTIONS_CSS.length;++k) {
						if (Foxtrick.isModuleEnabled(module) && Foxtrick.isModuleFeatureEnabled(module, module.OPTIONS[k]))
						{	if (module.OPTIONS_CSS[k] != "" && (!isRTL || !module.OPTIONS_CSS_RTL)) {
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
			sidebar = doc.getElementById("content").getElementsByTagName("div")[0];
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

Foxtrick.getSortedLinks = function(links) {
	function sortfunction(a,b) {
		return a.link.title.localeCompare(b.link.title);
	}
	links.sort(sortfunction);
	return links;
}

Foxtrick.keysortfunction = function(a,b) {
	return a["title"].localeCompare(b["title"]);
}

Foxtrick.initOptionsLinks = function(module,linktype,extra_options) {
	try {
		module.OPTIONS = new Array();
		var country_options = new Array();

		for (var key in Foxtrick.LinkCollection.stats) {
			var stat = Foxtrick.LinkCollection.stats[key];
			if (stat[linktype]!=null) {
				var title = stat["title"];

				var filters = stat[linktype]["filters"];
				var countries='';

				for (var i=0; i<filters.length; i++) {
					var filtertype = filters[i];
					if (filtertype == "countryid"
						&& stat["countryidranges"]
						&& stat["countryidranges"].length!=0) {

							var k=0,range;
							while (range = stat["countryidranges"][k++]) {
								var r0=String(range[0]);
								if (k==1) {
									if (r0.length==2) r0='0'+r0;
									else if (r0.length==1) r0='00'+r0;
								}
								if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
								else countries += '[' + r0+']';
								if (stat["countryidranges"][k]) 	countries+=',';
							}
					}
				}
				for (var i=0; i<filters.length; i++) {
					var filtertype = filters[i];
					if (filtertype == "owncountryid"
						&& stat["owncountryidranges"]
						&& stat["owncountryidranges"].length!=0) {
						var k=0,range;
						while (range = stat["owncountryidranges"][k++]) {
							var r0=String(range[0]);
							if (k==1) {
								if (r0.length==2) r0='0'+r0;
								else if (r0.length==1) r0='00'+r0;
							}
							if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
							else countries += '[' + r0+']';
							if (stat["owncountryidranges"][k]) 	countries+=',';
						}
					}
				}
				if (countries!='') country_options.push({"key":key,"title":countries+' : '+title});
				else module.OPTIONS.push({"key":key,"title":title});
			}
		}
		module.OPTIONS.sort(Foxtrick.keysortfunction);
		country_options.sort(Foxtrick.keysortfunction);
		var i=0,country_option;
		while (country_option = country_options[i++]) {module.OPTIONS.push({"key":country_option.key,"title":country_option.title.replace(/^\[0+/,'[')});}
		for (var key in extra_options) {
			module.OPTIONS.push({"key":key,"title":extra_options[key]});
		}
	}
	catch (e) {
		Foxtrick.dumpError(e);
	}
}

Foxtrick.initOptionsLinksArray = function(module,linktypes) {
	try {
		module.OPTIONS = new Array();
		var country_options = new Array();
		for (var linktype=0; linktype< linktypes.length; linktype++) {
			for (var key in Foxtrick.LinkCollection.stats) {
				var stat = Foxtrick.LinkCollection.stats[key];
				if (stat[linktypes[linktype]]!=null) {
					var title = stat["title"];
					var filters = stat[linktypes[linktype]]["filters"];
					var countries='';
					for (var i=0; i<filters.length; i++) {
						var filtertype = filters[i];
						if (filtertype == "nationality")
							if (stat["nationalityranges"] && stat["nationalityranges"].length!=0) {
								var k=0,range;
								while (range = stat["nationalityranges"][k++]) {
									var r0=String(range[0]);
									if (countries=='') {
										if (r0.length==2) r0='0'+r0;
										else if (r0.length==1) r0='00'+r0;
									}
									if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
									else countries += '[' + r0+']';
									if (stat["nationalityranges"][k]) 	countries+=',';
								}
							}
						}
						if (filtertype == "countryid"
							&& stat["countryidranges"]
							&& stat["countryidranges"].length!=0) {
							var k=0,range;
							while (range = stat["countryidranges"][k++]) {
								var r0=String(range[0]);
								if (countries=='') {
									if (r0.length==2) r0='0'+r0;
									else if (r0.length==1) r0='00'+r0;
								}
								if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
								else countries += '[' + r0+']';
								if (stat["countryidranges"][k]) 	countries+=',';
							}
						}
					var has_entry=false;
					for (var i = 0; i < module.OPTIONS.length; i++) {
						if (module.OPTIONS[i]["key"]!=null && module.OPTIONS[i]["key"]==key) {
							has_entry=true;
						}
					}
					if (!has_entry)
					if (countries!='') country_options.push({"key":key,"title":countries+' : '+title});
					else module.OPTIONS.push({"key":key,"title":title});
				}
			}
		}
		module.OPTIONS.sort(Foxtrick.keysortfunction);
		country_options.sort(Foxtrick.keysortfunction);
		var i=0,country_option;
		while (country_option = country_options[i++]) {module.OPTIONS.push({"key":country_option.key,"title":country_option.title.replace(/^\[0+/,'[')});}
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

Foxtrick.getElementsByClass = function(searchClass,node,tag) {
	var classElements = new Array();
	if (node == null)
		node = document;
	if (tag == null)
		tag = '*';
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
	for (var i = 0, j = 0; i < elsLen; i++) {
		if (pattern.test(els[i].className)) {
			classElements[j] = els[i];
			j++;
		}
	}
	return classElements;
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

Foxtrick.gregorianToHT = function(date,weekdayoffset) {
	/*
	Returns HT Week and Season like (15/37)
	date can be like dd.mm.yyyyy or d.m.yy or dd/mm/yy
	separator or leading zero is irrelevant
	*/
	if (date == '') return false;
	date +=' ';
	if(!weekdayoffset) weekdayoffset=0;
	var reg = /(\d{1,4})(.*?)(\d{1,2})(.*?)(\d{1,4})(.*?)(\d+)(.*?)(\d+)(.*?)/i;
	var ar = reg.exec(date);
	var months = [];
	var years = [];

	months[1] = 0;
	months[2] = months[1] + 31;
	months[3] = months[2] + 28;
	months[4] = months[3] + 31;
	months[5] = months[4] + 30;
	months[6] = months[5] + 31;
	months[7] = months[6] + 30;
	months[8] = months[7] + 31;
	months[9] = months[8] + 31;
	months[10] = months[9] + 30;
	months[11] = months[10] + 31;
	months[12] = months[11] + 30;


	// Check http://www.hattrick.org/Club/History/Default.aspx?teamId=100
	// The season start/end was not really a fixed date.

	years[0] = 830;			// From 2000
	years[1] = years[0] + 366; // leap year
	years[2] = years[1] + 365;
	years[3] = years[2] + 365;
	years[4] = years[3] + 365;
	years[5] = years[4] + 366; // leap year
	years[6] = years[5] + 365;
	years[7] = years[6] + 365;
	years[8] = years[7] + 365;
	years[9] = years[8] + 366; // leap year
	years[10] = years[9] + 365;

	for (var i = 0; i < ar.length; i++) {
		ar[i] = ar[i].replace(/^(0+)/g, '');
	}

	var DATEFORMAT = FoxtrickPrefs.getString("htDateformat");
	if (DATEFORMAT == null) DATEFORMAT = 'ddmmyyyy';

	var day = parseInt(ar[1]);
	var month = parseInt(ar[3]);
	var year = parseInt(ar[5]);

	switch (DATEFORMAT) {
		case 'ddmmyyyy':
			var day = parseInt(ar[1]);
			var month = parseInt(ar[3]);
			var year = parseInt(ar[5]);
			break;
		case 'mmddyyyy':
			var day = parseInt(ar[3]);
			var month = parseInt(ar[1]);
			var year = parseInt(ar[5]);
			break;
		case 'yyyymmdd':
			var day = parseInt(ar[5]);
			var month = parseInt(ar[3]);
			var year = parseInt(ar[1]);
			break;
	}
	var dayCount = years[year-2000] + months[month] + (day) -parseInt(weekdayoffset);
	//Foxtrick.dump (' > DATEFORMAT: ' + DATEFORMAT + ' [ ' + date + '] ' + day + '/' + month + '/' + year + ':dayoff='+weekdayoffset+'\n');
	// leap day
	if (year % 4 == 0 && month > 2)
		++dayCount;

	var htDate = Foxtrick.htDatePrintFormat(
					year,
					(Math.floor(dayCount/(16*7)) + 1),
					(Math.floor((dayCount%(16*7))/7) +1),
					dayCount%7 + 1,
					date);
	return htDate;
}

Foxtrick.htDatePrintFormat = function(year, season, week, day, date) {
	var offset = 0;
	try {
		if (Foxtrick.isModuleFeatureEnabled(FoxtrickHTDateFormat, "LocalSaison"))
			offset = FoxtrickPrefs.getInt("htSeasonOffset");
	}
	catch (e) {
		// Foxtrick.dump('offset: ' + e + '\n');
		offset = 0;
	}
	 //Foxtrick.dump ('offset:' +Foxtrick.isModuleFeatureEnabled(FoxtrickHTDateFormat, "LocalSaison")+' '+ offset + '\n');
	if (year <= 2000)
		// return "<font color='red'>(Y: " + year + " S: " + season + " W: " + week + " D: " + day + ")</font>";
		// return "<font color='#808080'>(old)</font>";
		return '';
	else {
		return "<span id='ft_HTDateFormat'>(" + week + "/" + (Math.floor(season) - offset) + ")</span>";
	}
}

Foxtrick.getDateFromText = function(text) {
	/*
		Returns Date object for given text.
		Text could be like dd-mm-yyyy, mm-dd-yyyy or yyyy-mm-dd
		according to date format setting,
		trailing minute:second is optional,
		while separator and leading zero are irrelevant.
	*/
	if (!text) {
		return null;
	}

	var reLong = /(\d+)\D+(\d+)\D+(\d+)\D+(\d+)\D+(\d+)/;
	var reShort = /(\d+)\D+(\d+)\D+(\d+)/;
	var matches;
	if (text.match(reLong)) {
		matches = text.match(reLong);
	}
	else if (text.match(reShort)) {
		matches = text.match(reShort);
	}
	else {
		return null;
	}

	const DATEFORMAT = FoxtrickPrefs.getString("htDateformat") || "ddmmyyyy";
	switch (DATEFORMAT) {
		case 'ddmmyyyy':
			var day = matches[1];
			var month = matches[2];
			var year = matches[3];
			break;
		case 'mmddyyyy':
			var day = matches[2];
			var month = matches[1];
			var year = matches[3];
			break;
		case 'yyyymmdd':
			var day = matches[3];
			var month = matches[2];
			var year = matches[1];
			break;
	}
	var hour = (matches.length == 6) ? matches[4] : 0;
	var minute = (matches.length == 6) ? matches[5] : 0;

	var date = new Date(year, month - 1, day, hour, minute);
	return date;
}

TimeDifferenceToText = function(time_sec, short) {

	var org_time = time_sec;
	// Returns the time differnce as DDD days, HHh MMm
	// if short, only DDD day(s) will be returned

	var Text = "";
	var Days = 0; var Minutes = 0; var Hours = 0;

	if (Math.floor(time_sec) < 0)
		return 'NaN';

	//days
	if(time_sec >= 86400) {
		Days = Math.floor(time_sec/86400);
		time_sec = time_sec-Days*86400;
		var d1 = Foxtrickl10n.getString("foxtrick.datetimestrings.day");
		var d5 = Foxtrickl10n.getString("foxtrick.datetimestrings.days");
		try {
			//days for slavian numbers (2 3 4)
			var d2 = Foxtrickl10n.getString("foxtrick.datetimestrings.days234");
		} catch(e) {
			d2 = d5;
		}

		Text += Days + '&nbsp;';
		if (Days == 1) // 1 single day
			Text += d1
		else {
			// same word for 2-4 and 0,5-9
			if (d2 == d5)
				Text += d2;
			else {
				var units = Days % 10;
				if (Math.floor((Days % 100) / 10) == 1)
					Text += d5;
				else
					Text += (units==1) ? d1 :(((units > 1) && (units < 5)) ? d2 : d5);
			}
		}
	}
	// only days returned
	if (short) {
		var display_option = FoxtrickPrefs.getInt("module." + FoxtrickExtendedPlayerDetails.MODULE_NAME + ".value");
		if (display_option == null) var display_option = 0;
		var PJD_D = Math.floor(org_time / 86400);
		var PJD_W = Math.floor(PJD_D / 7);
		var PJD_S = Math.floor(PJD_D / (16*7));
		var print_S = ''; var print_W = ''; var print_D = '';
		// Foxtrick.dump (display_option + ': ' + PJD_D + '/' + PJD_W + '/' + PJD_S + '\n');
		try {
			switch (display_option) { //("SWD", "SW", "SD", "WD", "D")
				case 0: //SWD
					print_S = PJD_S;
					print_W = PJD_W - (print_S * 16);
					print_D = PJD_D - (print_S * 16 * 7) - (print_W * 7);
				break;

				case 1: //SW
					print_S = PJD_S;
					print_W = PJD_W - (print_S * 16);
					break;

				case 2: //SD
					print_S = PJD_S;
					print_D = PJD_D - (print_S * 16 * 7);
				break;

				case 3: //WD
					print_W = PJD_W;
					print_D = PJD_D - (print_W * 7);
				break;

				case 4: //D
					print_D = PJD_D;
				break;
			} // switch
		} // try
		catch(e_print) {
			// Foxtrick.dump('TimeDifferenceToText'+e_print);
		}
		if (print_S == 0) {print_S = '';} else {print_S = '<b>' + print_S + '</b>'+Foxtrickl10n.getString("foxtrick.datetimestrings.short_seasons");}
		if (print_W != 0 && print_S != '') print_S += '&nbsp;';
		if (print_W == 0) {print_W = '';} else {print_W = '<b>' + print_W + '</b>'+Foxtrickl10n.getString("foxtrick.datetimestrings.short_weeks");}
		if (print_D != 0) print_W += '&nbsp;';
		if (print_D == 0 && (print_S != 0 || print_W != 0)) {print_D = '';} else {print_D = '<b>' + print_D + '</b>'+Foxtrickl10n.getString("foxtrick.datetimestrings.short_days");}

		// Foxtrick.dump(' SWD OPT[' + display_option + ']: ' + print_S + '/' + print_W + '/' + print_D + '\n');
		return print_S + print_W + print_D;

		if (Days == 0) {
			Text += '0&nbsp;' + Foxtrickl10n.getString("foxtrick.datetimestrings.days");
		}
		return Text;
	}

	//insert white space between days and hours
	if (Text != "") Text += "&nbsp;";

	//hours
	if ((time_sec >= 3600) || (Days > 0))
	{
		Hours = Math.floor(time_sec/3600);
		time_sec = time_sec-Hours*3600;
		Text += Hours + Foxtrickl10n.getString("foxtrick.datetimestrings.hours") + '&nbsp;';
	}

	//minutes
	Minutes = Math.floor(time_sec/60);
	time_sec = time_sec - Minutes * 60;
	Text += Minutes + Foxtrickl10n.getString("foxtrick.datetimestrings.minutes");

	return Text;
}

Foxtrick.modifyDates = function (doc, short, elm, before, after ,weekdayoffset, strip) {
	/*
	Returns HT-Week & Season
	short == true => Date is without time.

	don't use span as elm! use next outer nodetype instead
	*/

	//Foxtrick.dump (' == > HTDF '+elm+'\n');

	var tds = doc.getElementsByTagName(elm);
	for (var i = 0; tds[i] != null; ++i) {
		var node = tds[i];
		if (node.getElementsByTagName('span').length!=0)
			node = node.getElementsByTagName('span')[0];

		// not nested
		if (node.getElementsByTagName(elm).length!=0) {
			continue;
		}

		if (node.id == 'ft_HTDateFormat') return;
		if (!strip) var dt_inner = Foxtrick.trim(node.innerHTML);
		else var dt_inner = Foxtrick.trim(Foxtrick.stripHTML(node.innerHTML));

		if (!Foxtrick.strrpos(dt_inner, "ft_HTDateFormat")) {
			//Foxtrick.dump('>'+node.nodeName+' '+dt_inner.substr(0,50)+'\n');
			if ((dt_inner.length <= 11 && short) || (dt_inner.length <= 17 && !short) || strip) {
				var reg = /(\d{1,4})(\W{1})(\d{1,2})(\W{1})(\d{1,4})(.*?)/g;
				var ar = reg.exec(dt_inner);

				if (ar != null) {
					var td_date = ar[1] + '.' + ar[3] + '.' + ar[5] + ' 00.00.01';

					if (Foxtrick.trim(td_date).match(reg) != null && ar[1] != '' && ar[3] != '' && ar[5] != '') {
						if (!strip) node.innerHTML = dt_inner + before + Foxtrick.gregorianToHT(td_date,weekdayoffset) + after;
						else node.innerHTML = node.innerHTML + before + Foxtrick.gregorianToHT(td_date,weekdayoffset) + after;
						//Foxtrick.dump (' == > HTDF ['+ FoxtrickPrefs.getString("htDateformat")+ '] - [' + td_date + '] - [' + Foxtrick.gregorianToHT(td_date)+ '] => [' + node.innerHTML + ']\n');
					}
				}
			}
		}
	}
}

Foxtrick.copyStringToClipboard = function (string) {
	var gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
	gClipboardHelper.copyString(string);
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
	if (doc.getElementById('hattrickNoSupporter')) return false;
	return true;
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


Foxtrick.LoadXML = function (xmlfile) {
	var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
	req.open("GET", xmlfile, false);
	req.send(null);
	var response = req.responseXML;
	if (response.documentElement.nodeName == "parsererror") {
		Foxtrick.dump("error parsing " + xmlfile + "\n");
		return null;
	}
	return response;
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

Foxtrick.getSelectBoxFromXML = function (doc,xmlfile, basenodestr, labelstr, valuestr, selected_value_str) {
	var selectbox = doc.createElement("select");

	var xmlresponse = Foxtrick.LoadXML(xmlfile);
	var versions = Foxtrick.XML_evaluate(xmlresponse, basenodestr, labelstr, valuestr);

	var indexToSelect=0;
	for (var i = 0; i < versions.length; i++) {
		var label = versions[i][0];
		var value = versions[i][1];

		var option = doc.createElement("option");
		option.setAttribute("value",value);
		option.innerHTML=label;
		selectbox.appendChild(option);

		if (selected_value_str==value)
			indexToSelect=i;
	}
	selectbox.selectedIndex=indexToSelect;

	return selectbox;
}

Foxtrick.getSelectBoxFromXML2 = function (doc,xmlfile, basenodestr, labelstr, valuestr, selected_value_str) {
	var selectbox = doc.createElement("select");

	var versions = Foxtrick.XML_evaluate(xmlfile, basenodestr, labelstr, valuestr);

	var indexToSelect=0;
	for (var i = 0; i < versions.length; i++) {
		var label = versions[i][0];
		var value = versions[i][1];

		var option = doc.createElement("option");
		option.setAttribute("value",value);
		option.innerHTML=label;
		selectbox.appendChild(option);

		if (selected_value_str==value)
			indexToSelect=i;
	}
	selectbox.selectedIndex=indexToSelect;

	return selectbox;
}

Foxtrick.getSelectBoxFromXML3 = function (doc,xmlarray, valuestr, selected_value_str) {
	var selectbox = doc.createElement("select");

	var indexToSelect=0,j=0;
	for (var i in xmlarray) {
		var label = xmlarray[i][valuestr];
		var value = xmlarray[i][valuestr];

		var option = doc.createElement("option");
		option.setAttribute("value",value);
		option.innerHTML=label;
		selectbox.appendChild(option);

		if (selected_value_str==value)
			indexToSelect=j;
		j++;
	}
	selectbox.selectedIndex=indexToSelect;

	return selectbox;
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

Foxtrick.dump_HTML = '';
Foxtrick.dump_flush = function(doc) {
	if (doc.getElementById("page") != null
		&& FoxtrickPrefs.getBool("DisplayHTMLDebugOutput")
		&& Foxtrick.dump_HTML != '') {
		try {
			var div = doc.getElementById('ft_dump');
			if (div == null) {
				var div = doc.createElement('div');
				div.id = "ft_dump";
				var header = doc.createElement('h1');
				header.textContent = "FoxTrick Log";
				var pre = doc.createElement('pre');
				pre.textContent = Foxtrick.dump_HTML;
				div.appendChild(header);
				div.appendChild(pre);
				doc.getElementById('page').appendChild(div);
			}
			else {
				div.getElementsByTagName('pre')[0].textContent += Foxtrick.dump_HTML;
			}
			Foxtrick.dump_HTML = '';
		}
		catch (e) {
			dump('dump_flush '+e+'\n');
		}
	}
}

Foxtrick.dump = function(cnt) {
	if (FoxtrickPrefs.getBool("DisplayHTMLDebugOutput")) Foxtrick.dump_HTML += cnt + '';
	dump('FT: '+String(cnt).replace(/\<\w*\>|\<\/\w*\>/gi,''));
}

Foxtrick.dumpError = function(error) {
	Foxtrick.dump(error.fileName + "(" + error.lineNumber + "): " + error + "\n");
	Foxtrick.dump("Stack trace:\n" + error.stack + "\n\n");
	Components.utils.reportError(error);
}


// find first occurence of host and open+focus there
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
				Foxtrick.dump('tab: '+currentBrowser.currentURI.spec+' is searched url: '+host+' = '+(currentBrowser.currentURI.spec.search(host)!=-1)+'\n');
				if (currentBrowser.currentURI.spec.search(host)!=-1) {
					// The URL is already opened. Select this tab.
					tabbrowser.selectedTab = tabbrowser.mTabs[index];

					// Focus *this* browser-window
					browserWin.focus();
					if (reload) {
						browserWin.loadURI(url)
						Foxtrick.dump('reload: '+url+'\n');
					}
					found = true;
					break;
				}
			}
		}

		// Our URL isn't open. Open it now.
		if (!found) {
			var recentWindow = wm.getMostRecentWindow("navigator:browser");
			if (recentWindow) {
				//Foxtrick.dump('open recentWindow: '+url+'\n');
				// Use an existing browser window
				recentWindow.delayedOpenTab(url, null, null, null, null);
			}
			else {
				Foxtrick.dump('open new window: '+url+'\n');
				// No browser windows are open, so open a new one.
				window.open(url);
			}
		}
	}
	catch (e) {
		Foxtrick.dump('openAndReuseOneTabPerURL '+e+'\n');
	}
	Foxtrick.dump_flush(document);
}
