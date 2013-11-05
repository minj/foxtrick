'use strict';
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

// invoked on DOMContentLoaded (all browsers)
// @param doc - HTML document to run on
Foxtrick.entry.docLoad = function(doc) {
	if (doc.nodeName != '#document')
		return;

	//init html debug (somehow needed for feenc atm)
	Foxtrick.log.flush(doc);

	// don't execute if disabled
	if (Foxtrick.Prefs.getBool('disableTemporary')) {
		Foxtrick.log('disabled');
		// potenial disable cleanup
		if (Foxtrick.entry.cssLoaded) {
			Foxtrick.util.css.unload_module_css(doc);
			Foxtrick.entry.cssLoaded = false;
		}
		return;
	}

	// we shall not run here
	if (Foxtrick.arch == 'Sandboxed' && !Foxtrick.isHt(doc)) {
		// potential cleanup for injected css
		if (Foxtrick.entry.cssLoaded) {
			Foxtrick.util.css.unload_module_css(doc);
			Foxtrick.entry.cssLoaded = false;
		}
		return;
	}

	// ensure #content is available
	var content = doc.getElementById('content');
	if (!content)
		return;

	// run FoxTrick modules
	var begin = (new Date()).getTime();
	Foxtrick.entry.run(doc);
	var diff = (new Date()).getTime() - begin;
	Foxtrick.log('run time: ', diff, ' ms | ',
		doc.location.pathname, doc.location.search);

	Foxtrick.log.flush(doc);

	// listen to page content changes
	Foxtrick.startListenToChange(doc);
};

// invoved for each new instance of a content script
// for chrome/safari/opera after each page load
// for fennec on new tab opened
// @param data - copy of the resources passed from the background script
Foxtrick.entry.contentScriptInit = function(data) {

	Foxtrick.log('Foxtrick.entry.contentScriptInit');
	// add MODULE_NAME to modules
	var i;
	for (i in Foxtrick.modules)
		Foxtrick.modules[i].MODULE_NAME = i;

	if (Foxtrick.platform != 'Mobile' && Foxtrick.platform != 'Android') {
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
			// fennec can access them from context, but they still need to get initilized
			var coreModules = [Foxtrick.Prefs, Foxtrick.L10n, Foxtrick.XMLData];
			for (var i = 0; i < coreModules.length; ++i) {
				if (typeof(coreModules[i].init) == 'function')
					coreModules[i].init();
			}
		}
		for (i in data.htLangJSON) {
			Foxtrick.L10n.htLanguagesJSON[i] = JSON.parse(data.htLangJSON[i]);
		}

		Foxtrick.XMLData.htCurrencyJSON = JSON.parse(data.currencyJSON);
		Foxtrick.XMLData.aboutJSON = JSON.parse(data.aboutJSON);
		Foxtrick.XMLData.worldDetailsJSON = JSON.parse(data.worldDetailsJSON);
		Foxtrick.XMLData.League = data.league;
		Foxtrick.XMLData.countryToLeague = data.countryToLeague;
};

// called on browser load and after preferences changes (background side for sandboxed, fennec)
Foxtrick.entry.init = function() {
	Foxtrick.log('Initializing FoxTrick...');

	// add MODULE_NAME to modules
	var i;
	for (i in Foxtrick.modules)
		Foxtrick.modules[i].MODULE_NAME = i;

	var coreModules = [Foxtrick.Prefs, Foxtrick.L10n, Foxtrick.XMLData];
	for (var i = 0; i < coreModules.length; ++i) {
		if (typeof(coreModules[i].init) == 'function')
			coreModules[i].init();
	}

	// create arrays for each recognized page that contains modules
	// that run on it
	var i;
	for (i in Foxtrick.ht_pages) {
		Foxtrick.entry.runMap[i] = [];
	}

	// initialize all enabled modules
	var modules = [];
	for (i in Foxtrick.modules) {
		var module = Foxtrick.modules[i];
		if (Foxtrick.Prefs.isModuleEnabled(module.MODULE_NAME)) {
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
		if (typeof(m.init) == 'function')
			return function() { m.init(); };
		return null;
	});

	Foxtrick.log('FoxTrick initialization completed.');
};

Foxtrick.entry.run = function(doc, is_only_css_check) {
	try {
		if (Foxtrick.platform == 'Firefox' && Foxtrick.Prefs.getBool('preferences.updated')) {
			Foxtrick.log('prefs updated');
			Foxtrick.entry.init();
			Foxtrick.util.css.reload_module_css(doc);
			Foxtrick.entry.cssLoaded = true;
			Foxtrick.Prefs.setBool('preferences.updated', false);
		}

		// don't execute if not enabled on the document
		if (!Foxtrick.Prefs.isEnabled(doc)) {
			// potenial disable cleanup
			Foxtrick.util.css.unload_module_css(doc);
			Foxtrick.entry.cssLoaded = false;
			return;
		}

		// set up direction and style attributes
		var current_theme = Foxtrick.util.layout.isStandard(doc) ? 'standard' : 'simple';
		var current_dir = Foxtrick.util.layout.isRtl(doc) ? 'rtl' : 'ltr';
		var oldtheme = Foxtrick.Prefs.getString('theme');
		var olddir = Foxtrick.Prefs.getString('dir');
		if (current_theme != oldtheme || current_dir != olddir) {
			Foxtrick.log('layout change');
			Foxtrick.Prefs.setString('theme', current_theme);
			Foxtrick.Prefs.setString('dir', current_dir);
			Foxtrick.util.css.reload_module_css(doc);
			Foxtrick.entry.cssLoaded = true;
		}
		var html = doc.getElementsByTagName('html')[0];
		html.dir = current_dir;
		html.setAttribute('data-theme', current_theme);
		if (Foxtrick.platform == 'Mobile' || Foxtrick.platform == 'Android') {
			html.setAttribute('data-fennec-theme',
				doc.location.href.search(/Forum/i) == -1 ? 'default' : 'forum');
		}
		html.setAttribute(Foxtrick.platform, '');
		if (Foxtrick.util.layout.hasMultipleTeams(doc))
			html.setAttribute('data-multiple', '');

		// reload CSS if not loaded
		if (!Foxtrick.entry.cssLoaded) {
			Foxtrick.log('CSS not loaded');
			Foxtrick.Prefs.setBool('isStage', Foxtrick.isStage(doc));
			Foxtrick.util.css.reload_module_css(doc);
			Foxtrick.entry.cssLoaded = true;
		}

		// if only a CSS check, return now.
		if (is_only_css_check)
			return;
		if (Foxtrick.isExcluded(doc) ||
			(Foxtrick.isLoginPage(doc) && !Foxtrick.Prefs.getBool('runLoggedOff')))
			return;

		// create arrays for each recognized page that contains modules
		// that run on it
		var i;
		for (i in Foxtrick.ht_pages) {
			Foxtrick.entry.runMap[i] = [];
		}
		for (i in Foxtrick.modules) {
			var module = Foxtrick.modules[i];
			if (Foxtrick.Prefs.isModuleEnabled(module.MODULE_NAME)) {
				// register modules on the pages they are operating on according
				// to their PAGES property
				if (module.MODULE_NAME && module.PAGES) {
					for (var i = 0; i < module.PAGES.length; ++i)
						Foxtrick.entry.runMap[module.PAGES[i]].push(module);
				}
			}
		}

		// call all modules that registered as page listeners
		// if their page is loaded
		var modules = [];
		// modules running on current page
		var page;
		for (page in Foxtrick.ht_pages) {
			if (Foxtrick.isPage(doc, page) && Foxtrick.entry.runMap[page]) {
				for (var i = 0; i < Foxtrick.entry.runMap[page].length; ++i)
					modules.push(Foxtrick.entry.runMap[page][i]);
			}
		}

		// invoke niceRun to run modules
		Foxtrick.entry.niceRun(modules, function(m) {
			if (typeof(m.run) == 'function')
				return function() {
					var begin = new Date();

					m.run(doc);

					var diff = (new Date()).getTime() - begin;
					if (diff > 50)
						Foxtrick.log(m.MODULE_NAME, ' run time: ', diff, ' ms');
				};
			return null;
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
		if (ev.target.nodeType !== Foxtrick.NodeTypes.ELEMENT_NODE &&
			ev.target.nodeType !== Foxtrick.NodeTypes.TEXT_NODE)
			return;

		// don't act to changes on the excluded pages
		var excludes = [
			/\/Club\/Matches\/MatchOrder\//i,
			/\/Community\/CHPP\/ChppPrograms\.aspx/i,
			/\/Club\/Arena\/ArenaUsage\.aspx/i
		];
		if (Foxtrick.any(function(ex) {	return doc.location.href.search(ex) > -1; }, excludes)) {
			return;
		}

		var content = doc.getElementById('content');
		if (!content) {
			Foxtrick.log('Cannot find #content at ', doc.location);
			return;
		}

		var node = ev.target;
		while (node && node.nodeName != '#document') {
			if (node && Foxtrick.hasClass(node, 'ft-ignore-changes'))
				return;
			node = node.parentNode;
		}
		// ignore changes list
		if (ev.originalTarget &&
			(Foxtrick.hasClass(ev.originalTarget, 'boxBody')
			|| Foxtrick.hasClass(ev.originalTarget, 'ft-popup-span')))
			return;

		if (Foxtrick.Prefs.isEnabled(doc)) {
			Foxtrick.log('call modules change functions');
			var modules = [];
			// modules running on current page
			var page;
			for (page in Foxtrick.ht_pages) {
				if (Foxtrick.isPage(doc, page) && Foxtrick.entry.runMap[page]) {
					for (var i = 0; i < Foxtrick.entry.runMap[page].length; ++i)
						modules.push(Foxtrick.entry.runMap[page][i]);
				}
			}

			// invoke niceRun to run modules
			Foxtrick.entry.niceRun(modules, function(m) {
				if (typeof(m.change) == 'function')
					return function() { m.change(doc, ev); };
				return null;
			});

			Foxtrick.log.flush(doc);
		}
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
			if (typeof(pick(m)) == 'function')
				pick(m)();
		}
		catch (e) {
			if (m.MODULE_NAME)
				Foxtrick.log('Error in ', m.MODULE_NAME, ': ', e);
			else
				Foxtrick.log(e);
		}
	}, modules);
};
