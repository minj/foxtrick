'use strict';
// redefine external libs on top of Foxtrick
// for those contexts where boot-strap does not take affect
(function(global) {
	const LIBS = [
		'jsyaml',
		'IDBStore',
		'Gauge',
		'Donut',
		'BaseDonut',
		'TextRenderer',
	];

	debugger;

	LIBS.forEach(lib => {
		if (typeof Foxtrick[lib] === 'undefined')
			Foxtrick[lib] = global[lib];

		if (typeof global[lib] === 'undefined')
			return;

		global[lib] = undefined;
		try {
			delete global[lib];
		}
		catch (e) {}
	});

})(this);
