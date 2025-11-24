/**
* entry.js
* Entry point of Foxtrick modules
* @author ryanli, convincedd, LA-MJ
*/

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	// @ts-ignore
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

Foxtrick.entry = {};

/**
 * invoked on DOMContentLoaded (all browsers)
 *
 * @param  {document} doc HTML document to run on
 */
Foxtrick.entry.docLoad = function(doc) {
	if (doc.nodeName != '#document' || !doc.body || !doc.body.childNodes.length)
		return;

	// don't execute if disabled
	if ((Foxtrick.arch == 'Sandboxed' || Foxtrick.platform === 'Android') && !Foxtrick.isHt(doc) ||
	    !Foxtrick.Prefs.isEnabled(doc) ||
	    Foxtrick.isExcluded(doc)) {

		// potential cleanup for injected CSS
		if (Foxtrick.entry.cssLoaded) {
			Foxtrick.util.css.unloadModuleCSS(doc);
			Foxtrick.entry.cssLoaded = false;
		}
		return;
	}

	Foxtrick.entry.checkCSS(doc);

	// ensure #content is available
	let content = doc.getElementById('content');
	if (!content)
		return;

	// init html debug just in case
	Foxtrick.log.flush(doc);

	// run Foxtrick modules
	let begin = new Date().getTime();

	let blockChange = Foxtrick.entry.run(doc);

	let diff = new Date().getTime() - begin;

	// eslint-disable-next-line no-restricted-properties
	Foxtrick.log('page run time:', diff, 'ms |', doc.location.pathname, doc.location.search);

	Foxtrick.log.flush(doc);

	if (!blockChange) {
		// listen to page content changes
		Foxtrick.startObserver(doc);
	}
};

/**
 * invoked for each new instance of a content script
 *
 * for sandboxed after each page load
 *
 * @param  {FT.ResourceDict} data copy of the resources passed from the background script
 */
Foxtrick.entry.contentScriptInit = function(data) {
	// Foxtrick.log('Foxtrick.entry.contentScriptInit');

	// add MODULE_NAME to modules
	/** @type {FTAppModuleMixin[]} */
	for (let mName in Foxtrick.modules)
		Foxtrick.modules[mName].MODULE_NAME = mName;

	if (Foxtrick.platform == 'Android') {
		// fennec can access them from content, but they still need to get initialized
		// xmldata has nothing to init only fetch
		/** @type {FTBackgroundModuleMixin[]} */
		let coreModules = [Foxtrick.Prefs, Foxtrick.L10n];
		for (let cModule of coreModules) {
			if (typeof cModule.init === 'function')
				cModule.init();
		}
	}
	else {
		/* eslint-disable camelcase */
		Foxtrick.Prefs.initContent(data.prefsChromeDefault, data.prefsChromeUser);

		Foxtrick.L10n.propertiesDefault = data.propertiesDefault;
		Foxtrick.L10n.properties = data.properties;
		Foxtrick.L10n.screenshotsDefault = data.screenshotsDefault;
		Foxtrick.L10n.screenshots = data.screenshots;
		Foxtrick.L10n.plFormDefault = data.plFormDefault;
		Foxtrick.L10n.plForm = data.plForm;
		/* eslint-enable camelcase */
	}

	for (let lang in data.htLangJSON)
		Foxtrick.L10n.htLanguagesJSON[lang] = JSON.parse(data.htLangJSON[lang]);

	Foxtrick.XMLData.htCurrencyJSON = JSON.parse(data.currencyJSON);
	Foxtrick.XMLData.aboutJSON = JSON.parse(data.aboutJSON);
	Foxtrick.XMLData.worldDetailsJSON = JSON.parse(data.worldDetailsJSON);
	Foxtrick.XMLData.League = data.league;
	Foxtrick.XMLData.countryToLeague = data.countryToLeague;
};


/**
 * called on browser load and after preferences changes
 *
 * (background side for sandboxed)
 *
 * @param  {boolean} reInit
 */
Foxtrick.entry.init = function(reInit) {
	// Foxtrick.log('Initializing Foxtrick... reInit:', reInit);

	// add MODULE_NAME to modules
	for (let mName in Foxtrick.modules)
		Foxtrick.modules[mName].MODULE_NAME = mName;

	/** @type {FTBackgroundModuleMixin[]} */
	let coreModules = [Foxtrick.Prefs, Foxtrick.L10n, Foxtrick.XMLData];
	for (let core of coreModules) {
		if (typeof core.init === 'function')
			core.init(reInit);
	}

	let modules = Foxtrick.util.modules.getActive();

	Foxtrick.entry.niceRun(modules, function(m) {
		if (typeof m.init == 'function')
			return () => m.init(reInit);

		return null;
	});

	// Foxtrick.log('Foxtrick initialization completed.');
};

/**
 * @param  {document} doc
 * @return {boolean}      whether to block automatic change() run
 */
Foxtrick.entry.run = function(doc) {
	const PERFORMANCE_LOG_THRESHOLD = 50;

	/**
	 * @param  {document} doc
	 * @param  {FTModule} m
	 * @return {function}
	 */
	let getModuleRunner = (doc, m) => () => {
		let begin = new Date();

		m.run(doc);

		let diff = new Date().getTime() - begin.getTime();
		if (diff > PERFORMANCE_LOG_THRESHOLD)
			Foxtrick.log(m.MODULE_NAME, 'run time:', diff, 'ms');
	};

	try {
		let modules = Foxtrick.util.modules.getActive(doc);
		let ngApp = doc.querySelector('#mainWrapper ng-app, #mainBody ng-app, ' +
			'#mainWrapper [ng-app], #mainBody [ng-app]');
		let shouldDelay = !!ngApp && ngApp.getAttribute('app') != 'chat';

		/** @type {FTModule[]} */
		let delayed = [];

		/** @type {Promise<document>} */
		let promise;

		if (shouldDelay) {
			promise = new Promise((resolve) => {
				Foxtrick.onChange(ngApp, (doc, app) => {
					if (!doc.getElementById('mainBody'))
						return false;

					if (app.getElementsByTagName('ht-loading').length)
						return false;

					let spinner = app.querySelector('img[src$="/loading.gif"]');
					if (spinner && !spinner.closest('ht-community-reactions'))
						return false;

					Promise.resolve(doc).then(resolve);
					return true;
				});
			});
		}

		// invoke niceRun to run modules
		Foxtrick.entry.niceRun(modules, function(m) {
			if (typeof m.run !== 'function')
				return null;

			if (shouldDelay && !m.OUTSIDE_MAINBODY) {
				delayed.push(m);
				return null;
			}

			return getModuleRunner(doc, m);
		});

		if (delayed.length) {
			promise.then((doc) => {
				Foxtrick.entry.niceRun(delayed, m => getModuleRunner(doc, m));
				Foxtrick.entry.change(doc, []);
				Foxtrick.startObserver(doc);
			});
			return true; // block change
		}

		Foxtrick.log.flush(doc);
	}
	catch (e) {
		Foxtrick.log(e);
	}

	return false;
};

/**
 * @param  {document} doc
 * @param  {Node[]}   changes
 */
Foxtrick.entry.change = function(doc, changes) {
	try {
		// don't act to changes on the excluded pages
		let mutationExcludes = [
			/^\/Club\/Matches\/MatchOrder\//i,
			/^\/Community\/CHPP\/ChppPrograms\.aspx/i,
			/^\/Club\/Arena\/ArenaUsage\.aspx/i,
			/^\/Club\/Matches\/Live\.aspx/i,
			/^\/MatchOrder\/(Default.aspx|$)/i,
		];
		let excluded = Foxtrick.any(function(ex) {
			let ret = false;

			try {
				ret = ex.test(doc.location.pathname);
			}
			catch (e) { }

			return ret;
		}, mutationExcludes);

		if (excluded)
			return;

		let ignoredClasses = [
			'ft-ignore-changes',
			'ft-popup-span',
		];

		/**
		 * @param  {Element} node
		 * @return {boolean}
		 */
		let isIgnored = function(node) {
			return Foxtrick.any(cls => Foxtrick.hasClass(node, cls), ignoredClasses);
		};

		// @ts-ignore
		let filtered = changes.filter(c => c instanceof doc.defaultView.Element);
		let els = /** @type {Element[]} */ (filtered);

		if (Foxtrick.any(isIgnored, els))
			return;

		Foxtrick.log('call modules change functions');

		let modules = Foxtrick.util.modules.getActive(doc);

		// invoke niceRun to run modules
		Foxtrick.entry.niceRun(modules, (m) => {
			if (typeof m.change === 'function')
				return () => m.change(doc);

			return null;
		});

		Foxtrick.log.flush(doc);
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

/**
 * Make and run a function for each module in the array in order of NICEness.
 *
 * makeFn(module) should return function(void) or null.
 *
 * @template {FTModule} M
 * @param {M[]}                  modules {Array.<object>}
 * @param {function(M):function} makeFn  {function(object)->?function}
 */
Foxtrick.entry.niceRun = function(modules, makeFn) {
	let mdls = Foxtrick.unique(modules);
	mdls.sort(function(a, b) {
		let aNice = a.NICE || 0;
		let bNice = b.NICE || 0;
		return aNice - bNice;
	});

	Foxtrick.forEach(function(m) {
		try {
			let fn = makeFn(m);
			if (typeof fn === 'function')
				fn();
		}
		catch (e) {
			if (m.MODULE_NAME)
				Foxtrick.log('Error in', m.MODULE_NAME, ':', e);
			else
				Foxtrick.log(e);
		}
	}, mdls);
};

/**
 * @param  {document} doc
 */
Foxtrick.entry.checkCSS = function(doc) {
	// TODO arch: {contentPrivileged: boolean}
	if (Foxtrick.platform == 'Firefox' && Foxtrick.Prefs.getBool('preferences.updated')) {
		Foxtrick.log('prefs updated');

		Foxtrick.entry.init(true); // reInit

		Foxtrick.util.css.reloadModuleCSS(doc);
		Foxtrick.entry.cssLoaded = true;

		Foxtrick.Prefs.setBool('preferences.updated', false);
	}

	// set up direction and style attributes
	let currentTheme = Foxtrick.util.layout.isStandard(doc) ? 'standard' : 'simple';
	let currentDir = Foxtrick.util.layout.isRtl(doc) ? 'rtl' : 'ltr';
	let oldTheme = Foxtrick.Prefs.getString('theme');
	let oldDir = Foxtrick.Prefs.getString('dir');
	if (currentTheme != oldTheme || currentDir != oldDir) {
		Foxtrick.log('layout change');

		Foxtrick.Prefs.setString('theme', currentTheme);
		Foxtrick.Prefs.setString('dir', currentDir);

		Foxtrick.util.css.reloadModuleCSS(doc);
		Foxtrick.entry.cssLoaded = true;
	}

	let html = doc.documentElement;
	html.dir = currentDir;
	html.dataset.theme = currentTheme;

	// TODO fennec
	if (Foxtrick.platform == 'Android') {
		let fennecTheme = /Forum/i.test(doc.location.href) ? 'forum' : 'default';
		html.dataset.fennecTheme = fennecTheme;
	}

	html.setAttribute(Foxtrick.platform, 'true');

	if (Foxtrick.util.layout.hasMultipleTeams(doc))
		html.dataset.multiple = 'true';

	// reload CSS if not loaded
	if (!Foxtrick.entry.cssLoaded) {
		Foxtrick.log('CSS not loaded');

		Foxtrick.util.css.reloadModuleCSS(doc);
		Foxtrick.entry.cssLoaded = true;
	}
};
