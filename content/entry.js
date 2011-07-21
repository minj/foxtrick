/*
 * entry.js
 * Entry point of FoxTrick modules
 * @author ryanli, convincedd
 */

if (!Foxtrick)
	var Foxtrick = {};
Foxtrick.entry = {};

Foxtrick.entry.isStandard = true;
Foxtrick.entry.isRtl = false;

// mapping from page name (defined in pages.js) to array of modules running
// on it
Foxtrick.entry.runMap = {};

Foxtrick.entry.init = function() {
	const coreModules = [FoxtrickPrefs, Foxtrickl10n, Foxtrick.XMLData];
	Foxtrick.log("Initializing FoxTrick…");
	// init core modules, for Chrome they are inited in loader-chrome.js
	if (Foxtrick.BuildFor !== "Chrome") {
		for (var i in coreModules) {
			if (typeof(coreModules[i].init) == "function")
				coreModules[i].init();
		}
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
		if (FoxtrickPrefs.isModuleEnabled(module)) {
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

		var isStandard = FoxtrickPrefs.getBool('isStandard');
		var isRTL = FoxtrickPrefs.getBool('isRTL');
		// reload CSS if not loaded or page layout changed
		if (!Foxtrick.entry.cssLoaded
			|| (Foxtrick.util.layout.isStandard(doc) !== FoxtrickPrefs.getBool('isStandard'))
			|| (Foxtrick.util.layout.isRtl(doc) !== FoxtrickPrefs.getBool('isRTL'))) {
			Foxtrick.log('layout change');
			FoxtrickPrefs.setBool('isStandard', Foxtrick.util.layout.isStandard(doc));
			FoxtrickPrefs.setBool('isRTL', Foxtrick.util.layout.isRtl(doc));
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

		Foxtrick.dumpFlush(doc);
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

			Foxtrick.dumpFlush(doc);
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
