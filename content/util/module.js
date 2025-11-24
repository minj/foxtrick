/**
 * module.js
 * Utilities for Foxtrick categorized module handling
 * @author ryanli
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

/* eslint-disable max-len */
/**
 * TODO
 * @typedef {'informationAggregation'|'shortcutsAndTweaks'|'presentation'|'matches'|'forum'|'links'|'alert'|'accessibility'} ModuleCategory
 */
/* eslint-enable max-len */

/**
 * Module categories list
 * @type {Record<string, ModuleCategory>}
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

if (!Foxtrick.modules) {
	// TODO /** @type {Record<string, FTModule>} */
	Foxtrick.modules = {};
}

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.modules = {};

/**
 * Ensure conditionally essential modules are not disabled by accident
 * causing major UX problems
 */
Foxtrick.util.modules.enableEssential = function() {
	const ANDROID_ESSENTIALS = [
		'ExtraShortcuts',
		'ExtraShortcuts.FoxTrickPrefs',
	];

	if (Foxtrick.platform == 'Android') {
		// FIXME
		for (let andrModule of ANDROID_ESSENTIALS)
			Foxtrick.Prefs.setModuleEnableState(andrModule, true);
	}
};

/**
 * Get active modules.
 *
 * doc param is optional: returns only modules that run on that page if provided.
 *
 * @param  {document}   [doc] {?document}
 * @return {FTModule[]}       {Array.<object>}
 */
Foxtrick.util.modules.getActive = function(doc) {
	this.enableEssential();

	/** @type {Partial<Record<PAGE, boolean|string>>} */
	let pages = Foxtrick.htPages;
	if (doc) {
		pages = {};

		for (let page of /** @type {PAGE[]} */ (Object.keys(Foxtrick.htPages))) {
			if (Foxtrick.isPage(doc, page))
				pages[page] = true;
		}
	}

	/** @type {FTModule[]} */
	let modules = [];
	for (let mod of Object.values(Foxtrick.modules)) {
		let m = /** @type {FTModule} */ (mod);

		if (!Foxtrick.Prefs.isModuleEnabled(m))
			continue;

		for (let mPage of m.PAGES) {
			// @ts-ignore
			if (typeof Foxtrick.htPages[mPage] === 'undefined') {
				let msg = `${m.MODULE_NAME} wants to run on an unknown page ${mPage}`;
				Foxtrick.log(new Error(msg));

				continue;
			}

			// @ts-ignore
			if (pages[mPage])
				modules.push(m);
		}
	}

	if (doc) {
		// pages with no mainBody
		let mainBodyExcludes = [
			/^\/Shop\//i,
		];
		let noMainBody = Foxtrick.any(function(ex) {
			return ex.test(doc.location.pathname);
		}, mainBodyExcludes);

		if (noMainBody)
			modules = modules.filter(m => !!m.OUTSIDE_MAINBODY);
	}

	return modules;
};

/**
 * @typedef FTBackgroundModuleMixin
 * @prop {string} [MODULE_NAME] set automatically
 * @prop {(reInit?: boolean)=>void} [init]
 * @prop {(doc: document)=>void} [onLoad]
 * @prop {(doc: document)=>void} [onTabChange]
 * @prop {(doc: document)=>void} [update]
 */

/**
 * @typedef FTCoreModuleMixin
 * @prop {true} CORE_MODULE
 * @prop {number} [NICE] nice value, lower value => higher prio
 * @prop {boolean} [OUTSIDE_MAINBODY] this module does not touch mainBody
 * @prop {ModuleCategory} [MODULE_CATEGORY]
 * @prop {string[]}                      PAGES
 * @prop {string[]}                      [CSS]
 * @prop {(doc: document)=>void} [run]
 * @prop {(doc: document)=>Element|void} [OPTION_FUNC]
 * @prop {(string|string[])[]}           [OPTIONS]
 */

/**
 * @typedef FTAppModuleMixin
 * @prop {string} [MODULE_NAME] set automatically
 * @prop {number} [NICE] nice value, lower value => higher prio
 * @prop {boolean} [OUTSIDE_MAINBODY] this module does not touch mainBody
 * @prop {ModuleCategory} MODULE_CATEGORY
 * @prop {string[]}                   PAGES
 * @prop {string|string[]}            [CSS]
 * @prop {(doc: document)=>void} [run]
 * @prop {(doc: document)=>void} [change]
 * @prop {(doc: document)=>Node|string|(Node|string)[]|void} [OPTION_FUNC]
 * @prop {(string|string[])[]} [OPTIONS]
 * @prop {(string|string[])[]} [OPTIONS_CSS]
 * @prop {string[]}            [RADIO_OPTIONS]
 * @prop {string[]}            [RADIO_OPTIONS_CSS]
 * @prop {boolean}             [OPTION_TEXTS]
 * @prop {boolean[]}           [OPTION_TEXTS_DISABLED_LIST]
 * @prop {boolean}             [OPTION_EDITS]
 * @prop {boolean[]}           [OPTION_EDITS_DISABLED_LIST]
 * @prop {boolean[]}           [OPTION_EDITS_TEXTFILE_LOAD_BUTTONS]
 * @prop {boolean[]}           [OPTION_EDITS_DATAURL_LOAD_BUTTONS]
 * @prop {boolean[]}           [OPTION_EDITS_DATAURL_IS_SOUND]
 */

/**
 * @typedef FTLinkModuleMixin
 * @prop {string}  [MODULE_NAME] set automatically
 * @prop {'links'} MODULE_CATEGORY
 * @prop {PAGE[]} PAGES
 * @prop {string|string[]} LINK_TYPES
 * @prop {(doc: document)=>Node|string|(Node|string)[]|void} OPTION_FUNC
 * @prop {(doc: document)=>void} [run]
 * @prop {(doc: document)=>LinkPageDefinition} [links]
 */

/**
 * @typedef {keyof Foxtrick.htPages} PAGE
 */

/* eslint-disable max-len */
/**
 * @typedef {FTCoreModuleMixin & FTAppModuleMixin & FTBackgroundModuleMixin & FTLinkModuleMixin} FTModule
 */
