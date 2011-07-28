/*
 * module.js
 * Utilities for FoxTrick module handling
 * @author ryanli
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.module = {};

Foxtrick.util.module.getByName = function(n) {
	for (var i = 0; i < Foxtrick.modules.length; ++i)
		if (Foxtrick.modules[i].MODULE_NAME == n)
			return Foxtrick.modules[i];
};
