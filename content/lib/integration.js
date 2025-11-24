'use strict';

/* global globalThis */

// TODO find a way to fake AMD define to satisfy all libs
// redefine external libs on top of Foxtrick
// for those contexts where boot-strap does not take affect
(function() {
	const LIBS = [
		'jsyaml',
		'IDBStore',
		'Gauge',
		'Donut',
		'BaseDonut',
		'TextRenderer',
		'AnimationUpdater',
		'exceptionless',
	];

	LIBS.forEach((lib) => {
		// MV3: Fallback to self instead of window for service worker compatibility
		var global = typeof globalThis == 'undefined' || typeof globalThis[lib] == 'undefined'
			? (typeof window !== 'undefined' ? window : self)
			: globalThis;

		if (typeof Foxtrick[lib] == 'undefined')
			Foxtrick[lib] = global[lib];

		try {
			global[lib] = void 0;
			delete global[lib];
		}
		catch (e) { }
	});

})();
