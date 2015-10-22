'use strict';
/*
 * entry.js
 * Entry point of Foxtrick modules
 * @author ryanli, convincedd, LA-MJ
 */

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore:line

Foxtrick.entry = {};

// invoked on DOMContentLoaded (all browsers)
// @param doc - HTML document to run on
Foxtrick.entry.docLoad = function(doc) {
	if (doc.nodeName != '#document' || !doc.body.childNodes.length) {
		// fennec raises annoying DOMContentLoaded events for blank pages
		return;
	}

	// don't execute if disabled
	if ((Foxtrick.arch == 'Sandboxed' || Foxtrick.platform === 'Android') && !Foxtrick.isHt(doc) ||
	    !Foxtrick.Prefs.isEnabled(doc) ||
	    Foxtrick.isExcluded(doc)) {
		// potential cleanup for injected CSS
		if (Foxtrick.entry.cssLoaded) {
			Foxtrick.util.css.unload_module_css(doc);
			Foxtrick.entry.cssLoaded = false;
		}
		return;
	}

	Foxtrick.entry.checkCSS(doc);

	// ensure #content is available
	var content = doc.getElementById('content');
	if (!content)
		return;

	// init html debug (somehow needed for fennec atm)
	Foxtrick.log.flush(doc);

	// run Foxtrick modules
	var begin = new Date().getTime();

	Foxtrick.entry.run(doc);

	var diff = new Date().getTime() - begin;
	Foxtrick.log('page run time:', diff, 'ms |', doc.location.pathname, doc.location.search);

	Foxtrick.log.flush(doc);

	// listen to page content changes
	Foxtrick.startListenToChange(doc);
};

// invoked for each new instance of a content script
// for chrome/safari after each page load
// for fennec on new tab opened
// @param data - copy of the resources passed from the background script
Foxtrick.entry.contentScriptInit = function(data) {
	// Foxtrick.log('Foxtrick.entry.contentScriptInit');

	// add MODULE_NAME to modules
	for (var mName in Foxtrick.modules)
		Foxtrick.modules[mName].MODULE_NAME = mName;

	if (Foxtrick.platform != 'Android') {
		Foxtrick.Prefs._prefs_chrome_user = data._prefs_chrome_user;
		Foxtrick.Prefs._prefs_chrome_default = data._prefs_chrome_default;

		Foxtrick.L10n.properties_default = data.properties_default;
		Foxtrick.L10n.properties = data.properties;
		Foxtrick.L10n.screenshots_default = data.screenshots_default;
		Foxtrick.L10n.screenshots = data.screenshots;
		Foxtrick.L10n.plForm_default = data.plForm_default;
		Foxtrick.L10n.plForm = data.plForm;
	}
	else {
		// fennec can access them from context, but they still need to get initialized
		// xmldata has nothing to init only fetch
		var coreModules = [Foxtrick.Prefs, Foxtrick.L10n];
		for (var i = 0; i < coreModules.length; ++i) {
			if (typeof coreModules[i].init === 'function')
				coreModules[i].init();
		}
	}

	for (var lang in data.htLangJSON) {
		Foxtrick.L10n.htLanguagesJSON[lang] = JSON.parse(data.htLangJSON[lang]);
	}

	Foxtrick.XMLData.htCurrencyJSON = JSON.parse(data.currencyJSON);
	Foxtrick.XMLData.aboutJSON = JSON.parse(data.aboutJSON);
	Foxtrick.XMLData.worldDetailsJSON = JSON.parse(data.worldDetailsJSON);
	Foxtrick.XMLData.League = data.league;
	Foxtrick.XMLData.countryToLeague = data.countryToLeague;
};

// called on browser load and after preferences changes
// (background side for sandboxed, fennec)
Foxtrick.entry.init = function(reInit) {
	// Foxtrick.log('Initializing Foxtrick... reInit:', reInit);

	// add MODULE_NAME to modules
	for (var mName in Foxtrick.modules)
		Foxtrick.modules[mName].MODULE_NAME = mName;

	var coreModules = [Foxtrick.Prefs, Foxtrick.L10n, Foxtrick.XMLData];
	for (var i = 0; i < coreModules.length; ++i) {
		if (typeof coreModules[i].init === 'function')
			coreModules[i].init(reInit);
	}

	var modules = Foxtrick.util.modules.getActive();

	Foxtrick.entry.niceRun(modules, function(m) {
		if (typeof m.init == 'function')
			return function() { m.init(reInit); };
		return null;
	});

	// Foxtrick.log('Foxtrick initialization completed.');
};

Foxtrick.entry.run = function(doc) {
	try {
		var modules = Foxtrick.util.modules.getActive(doc);

		// invoke niceRun to run modules
		Foxtrick.entry.niceRun(modules, function(m) {
			if (typeof m.run === 'function') {
				return function() {
					var begin = new Date();

					m.run(doc);

					var diff = new Date().getTime() - begin;
					if (diff > 50)
						Foxtrick.log(m.MODULE_NAME, 'run time:', diff, 'ms');
				};
			}
			return null;
		});

		Foxtrick.log.flush(doc);
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

Foxtrick.entry.change = function(doc, changes) {
	try {
		// don't act to changes on the excluded pages
		var mutationExcludes = [
			/^\/Club\/Matches\/MatchOrder\//i,
			/^\/Community\/CHPP\/ChppPrograms\.aspx/i,
			/^\/Club\/Arena\/ArenaUsage\.aspx/i,
			/^\/Club\/Matches\/Live\.aspx/i,
			/^\/MatchOrder\/(Default.aspx|$)/i,
		];
		var excluded = Foxtrick.any(function(ex) {
			return ex.test(doc.location.pathname);
		}, mutationExcludes);

		if (excluded)
			return;

		var ignoredClasses = [
			'ft-ignore-changes',
			'ft-popup-span',
		];
		var isIgnored = function(node) {
			return Foxtrick.any(function(cls) {
				return Foxtrick.hasClass(node, cls);
			}, ignoredClasses);
		};

		if (Foxtrick.any(isIgnored, changes))
			return;

		Foxtrick.log('call modules change functions');

		var modules = Foxtrick.util.modules.getActive(doc);

		// invoke niceRun to run modules
		Foxtrick.entry.niceRun(modules, function(m) {
			if (typeof m.change === 'function')
				return function() { m.change(doc); };
			return null;
		});

		Foxtrick.log.flush(doc);
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

/**
 * Make and run a function for each module in the array in order of NICEness
 *
 * makeFn(module) should return function(void) or null
 * @param {array}    modules {Array.<object>}
 * @param {function} makeFn  {function(object)->?function}
 */
Foxtrick.entry.niceRun = function(modules, makeFn) {
	modules = Foxtrick.unique(modules);
	modules.sort(function(a, b) {
		var aNice = a.NICE || 0;
		var bNice = b.NICE || 0;
		return aNice - bNice;
	});

	Foxtrick.map(function(m) {
		try {
			var fn = makeFn(m);
			if (typeof fn === 'function')
				fn();
		}
		catch (e) {
			if (m.MODULE_NAME)
				Foxtrick.log('Error in', m.MODULE_NAME, ':', e);
			else
				Foxtrick.log(e);
		}
	}, modules);
};

Foxtrick.entry.checkCSS = function(doc) {
	if (Foxtrick.platform == 'Firefox' && Foxtrick.Prefs.getBool('preferences.updated')) {
		Foxtrick.log('prefs updated');

		Foxtrick.entry.init(true); // reInit

		Foxtrick.util.css.reload_module_css(doc);
		Foxtrick.entry.cssLoaded = true;

		Foxtrick.Prefs.setBool('preferences.updated', false);
	}

	// set up direction and style attributes
	var currentTheme = Foxtrick.util.layout.isStandard(doc) ? 'standard' : 'simple';
	var currentDir = Foxtrick.util.layout.isRtl(doc) ? 'rtl' : 'ltr';
	var oldTheme = Foxtrick.Prefs.getString('theme');
	var oldDir = Foxtrick.Prefs.getString('dir');
	if (currentTheme != oldTheme || currentDir != oldDir) {
		Foxtrick.log('layout change');

		Foxtrick.Prefs.setString('theme', currentTheme);
		Foxtrick.Prefs.setString('dir', currentDir);

		Foxtrick.util.css.reload_module_css(doc);
		Foxtrick.entry.cssLoaded = true;
	}

	var html = doc.documentElement;
	html.dir = currentDir;
	html.setAttribute('data-theme', currentTheme);

	if (Foxtrick.platform == 'Android') {
		var fennecTheme = /Forum/i.test(doc.location.href) ? 'forum' : 'default';
		html.setAttribute('data-fennec-theme', fennecTheme);
	}

	html.setAttribute(Foxtrick.platform, '');

	if (Foxtrick.util.layout.hasMultipleTeams(doc))
		html.setAttribute('data-multiple', '');

	// reload CSS if not loaded
	if (!Foxtrick.entry.cssLoaded) {
		Foxtrick.log('CSS not loaded');

		Foxtrick.util.css.reload_module_css(doc);
		Foxtrick.entry.cssLoaded = true;
	}
};
