/**
 * background-init.js
 * Initialization functions for MV3 service worker background context
 *
 * Contains ONLY service-worker safe functions extracted from entry.js
 * These functions have NO DOM dependencies.
 *
 * @author Foxtrick Team
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

if (!Foxtrick.entry)
	Foxtrick.entry = {};

/**
 * called on browser load and after preferences changes
 *
 * (background side for sandboxed)
 *
 * MV3: Converted to async to handle XMLData async init
 *
 * @param  {boolean} reInit
 * @return {Promise<void>}
 */
Foxtrick.entry.init = async function(reInit) {
	// Foxtrick.log('Initializing Foxtrick... reInit:', reInit);

	// add MODULE_NAME to modules
	for (let mName in Foxtrick.modules)
		Foxtrick.modules[mName].MODULE_NAME = mName;

	/** @type {FTBackgroundModuleMixin[]} */
	let coreModules = [Foxtrick.Prefs, Foxtrick.L10n, Foxtrick.XMLData];
	for (let core of coreModules) {
		if (typeof core.init === 'function') {
			// MV3: await async init functions (e.g., XMLData.init)
			let result = core.init(reInit);
			if (result instanceof Promise)
				await result;
		}
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
 * Run module functions in order based on NICE priority
 *
 * @param  {FTAppModuleMixin[]} modules
 * @param  {function(FTAppModuleMixin):function} makeFn
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
