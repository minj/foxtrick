/**
 * module.js
 * Utilities for Foxtrick categorized module handling
 * @author ryanli
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	var Foxtrick = {};
/* eslint-enable */

/**
 * Module categories list
 * @type {Object}
 */
Foxtrick.moduleCategories = {
	INFORMATION_AGGREGATION: 'informationAggregation',
	SHORTCUTS_AND_TWEAKS: 'shortcutsAndTweaks',
	PRESENTATION: 'presentation',
	MATCHES: 'matches',
	FORUM: 'forum',
	LINKS: 'links',
	ALERT: 'alert',
	ACCESSIBILITY: 'accessibility',
};

if (!Foxtrick.modules)
	Foxtrick.modules = {};

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.modules = {};

/**
 * Ensure conditionally essential modules are not disabled by accident
 * causing major UX problems
 */
Foxtrick.util.modules.enableEssential = function() {
	var ANDROID_ESSENTIALS = [
		'ExtraShortcuts',
		'ExtraShortcuts.FoxTrickPrefs',
	];

	if (Foxtrick.platform == 'Android') {
		for (var andrModule of ANDROID_ESSENTIALS)
			Foxtrick.Prefs.setModuleEnableState(andrModule, true);
	}
};

/**
 * Get active modules.
 *
 * doc param is optional: returns only modules that run on that page if provided.
 *
 * @param  {document} doc {?document}
 * @return {array}        {Array.<object>}
 */
Foxtrick.util.modules.getActive = function(doc) {
	this.enableEssential();

	var pages = Foxtrick.htPages;
	if (doc) {
		pages = {};
		for (var page in Foxtrick.htPages) {
			if (Foxtrick.isPage(doc, page))
				pages[page] = true;
		}
	}

	var modules = [];
	for (var m in Foxtrick.modules) {
		var module = Foxtrick.modules[m];
		if (Foxtrick.Prefs.isModuleEnabled(module)) {
			for (var mPage of module.PAGES) {

				if (typeof Foxtrick.htPages[mPage] === 'undefined') {
					var args = [module.MODULE_NAME, mPage];
					var msg = Foxtrick.format('{} wants to run on an unknown page {}', args);

					Foxtrick.error(msg);

					continue;
				}

				if (pages[mPage])
					modules.push(module);
			}
		}
	}

	if (doc) {
		// pages with no mainBody
		var mainBodyExcludes = [
			/^\/Shop\//i,
		];
		var noMainBody = Foxtrick.any(function(ex) {
			return ex.test(doc.location.pathname);
		}, mainBodyExcludes);

		if (noMainBody) {
			modules = modules.filter(function(module) {
				return module.OUTSIDE_MAINBODY;
			});
		}
	}

	return modules;
};
