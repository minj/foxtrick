'use strict';
// redefine external libs on top of Foxtrick
// for those contexts where boot-strap does not take affect
(function(global) {
	var libs = [
		'saveAs',
		'YAML',
		'IDBStore',
	];
	libs.forEach(function(lib) {
		if (typeof Foxtrick[lib] === 'undefined' && typeof global[lib] !== 'undefined') {
			Foxtrick[lib] = global[lib];
			global[lib] = undefined;
		}
	});
})(this);
