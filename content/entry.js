/*
 * entry.js
 * Entry point of FoxTrick modules
 * @author ryanli, convincedd
 */

if (!Foxtrick)
	var Foxtrick = {};
Foxtrick.entry = {};

// mapping from page name (defined in pages.js) to array of modules running
// on it
Foxtrick.entry.runMap = {};

// invoked on DOMContentLoaded
// @param doc - HTML document to run on
Foxtrick.entry.docLoad = function(doc) {
	if (doc.nodeName != "#document")
		return;

	// we shall not run here
	if (!Foxtrick.isHt(doc) || Foxtrick.isExcluded(doc))
		return;

	// ensure #content is available
	var content = doc.getElementById("content");
	if (!content)
		return;

	if (Foxtrick.platform == "Fennec") {
		Foxtrick.entry.init();
	}

	// run FoxTrick modules
	var begin = (new Date()).getTime();
	Foxtrick.entry.run(doc);
	var diff = (new Date()).getTime() - begin;
	Foxtrick.log("run time: ", diff, " ms | ",
		doc.location.pathname, doc.location.search);

	// listen to page content changes
	Foxtrick.startListenToChange(doc);
};

Foxtrick.entry.setRetrievedLocalResources = function(data) {
		FoxtrickPrefs._prefs_chrome_user = data._prefs_chrome_user;
		FoxtrickPrefs._prefs_chrome_default = data._prefs_chrome_default;

		var parser = new window.DOMParser();
		for (var i in data.htLang) {
			Foxtrickl10n.htLanguagesXml[i] = parser.parseFromString(data.htLang[i], "text/xml");
		}

		Foxtrickl10n.properties_default = data.properties_default;
		Foxtrickl10n.properties = data.properties;
		Foxtrickl10n.screenshots_default = data.screenshots_default;
		Foxtrickl10n.screenshots = data.screenshots;

		Foxtrick.XMLData.htCurrencyXml = parser.parseFromString(data.currency, "text/xml");
		Foxtrick.XMLData.aboutXML = parser.parseFromString(data.about, "text/xml");
		Foxtrick.XMLData.worldDetailsXml = parser.parseFromString(data.worldDetails, "text/xml");
		Foxtrick.XMLData.League = data.league;
		Foxtrick.XMLData.countryToLeague = data.countryToLeague;
};

// called on browser load for gecko
// and on each page for chrome
Foxtrick.entry.init = function() {
	const coreModules = [FoxtrickPrefs, Foxtrickl10n, Foxtrick.XMLData];
	Foxtrick.log("Initializing FoxTrick…");
	// init core modules, for Chrome they are inited in loader-chrome.js
	if (Foxtrick.arch !== "Sandboxed") {
		for (var i in coreModules) {
			if (typeof(coreModules[i].init) == "function")
				coreModules[i].init();
		}
	}
	else if (Foxtrick.chromeContext() == "background") {
		// only content side
		return;
	}

	Foxtrick.MakeStatsHash();

	// create arrays for each recognized page that contains modules
	// that run on it
	for (var i in Foxtrick.ht_pages) {
		Foxtrick.entry.runMap[i] = [];
	}

	// initialize all enabled modules
	var modules = [];
	for (var i in Foxtrick.modules) {
		var module = Foxtrick.modules[i];
		if (FoxtrickPrefs.isModuleEnabled(module.MODULE_NAME)) {
			// push to array modules for executing init()
			modules.push(module);
			// register modules on the pages they are operating on according
			// to their PAGES property
			if (module.MODULE_NAME && module.PAGES) {
				for (var i = 0; i < module.PAGES.length; ++i)
					Foxtrick.entry.runMap[module.PAGES[i]].push(module);
			}
		}
	}
	Foxtrick.entry.niceRun(modules, function(m) {
		if (typeof(m.init) == "function")
			return function() { m.init(); };
	});

	Foxtrick.log("FoxTrick initialization completed.");
};

Foxtrick.entry.run = function(doc, is_only_css_check) {
	try {
		if (FoxtrickPrefs.getBool("preferences.updated")) {
			Foxtrick.log('prefs updated');
			Foxtrick.entry.init();
			Foxtrick.reload_module_css(doc);
			Foxtrick.entry.cssLoaded = true;
			FoxtrickPrefs.setBool("preferences.updated", false);
		}

		// don't execute if not enabled on the document
		if (!FoxtrickPrefs.isEnabled(doc)) {
			// potenial disable cleanup
			Foxtrick.unload_module_css();
			Foxtrick.entry.cssLoaded = false;
			return;
		}

		// set up direction and style attributes
		var current_theme = Foxtrick.util.layout.isStandard(doc) ? "standard" : "simple";
		var current_dir = Foxtrick.util.layout.isRtl(doc) ? "rtl" : "ltr";
		var oldtheme = FoxtrickPrefs.getString('theme');
		var olddir = FoxtrickPrefs.getString('dir');
		if ( current_theme!= oldtheme || current_dir != olddir) {
			Foxtrick.log('layout change');
			FoxtrickPrefs.setString('theme', current_theme);
			FoxtrickPrefs.setString('dir', current_dir);
			Foxtrick.reload_module_css(doc);
			Foxtrick.entry.cssLoaded = true;
		}
		var html = doc.getElementsByTagName("html")[0];
		html.dir = current_dir;
		html.setAttribute("data-theme", current_theme);
		html.setAttribute("data-fennec-theme", doc.location.href.search(/forum/i)==-1 ? "default" : "forum");

		// reload CSS if not loaded
		if (!Foxtrick.entry.cssLoaded) {
			Foxtrick.log("CSS not loaded");
			FoxtrickPrefs.setBool('isStage', Foxtrick.isStage(doc));
			Foxtrick.reload_module_css(doc);
			Foxtrick.entry.cssLoaded = true;
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
				for (var i in Foxtrick.entry.runMap[page])
					modules.push(Foxtrick.entry.runMap[page][i]);
			}
		}

		// invoke niceRun to run modules
		Foxtrick.entry.niceRun(modules, function(m) {
			if (typeof(m.run) == "function")
				return function() { m.run(doc); };
		});

		Foxtrick.log.flush(doc);
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

Foxtrick.entry.change = function(ev) {
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
					for (var i in Foxtrick.entry.runMap[page])
						modules.push(Foxtrick.entry.runMap[page][i]);
				}
			}

			// invoke niceRun to run modules
			Foxtrick.entry.niceRun(modules, function(m) {
				if (typeof(m.change) == "function")
					return function() { m.change(doc, ev); };
			});

			Foxtrick.log.flush(doc);
		}
		// re-add event listener
		Foxtrick.startListenToChange(doc);
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

/**
 * Runs the specified function of each module in the array in the order
 * of nice index
 */
Foxtrick.entry.niceRun = function(modules, pick) {
	modules = Foxtrick.unique(modules);
	modules.sort(function(a, b) {
		var aNice = a.NICE || 0;
		var bNice = b.NICE || 0;
		return aNice - bNice;
	});
	Foxtrick.map(function(m) {
		try {
			if (typeof(pick(m)) == "function")
				pick(m)();
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}, modules);
};
