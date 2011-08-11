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

// provided the name of a module, return the module object
Foxtrick.util.module.getByName = function(n) {
	return Foxtrick.modules ? Foxtrick.modules[n] : null;
};

// provided an object, register it as a FoxTrick module
Foxtrick.util.module.register = function(obj) {
	if (!Foxtrick.modules)
		Foxtrick.modules = {};
	Foxtrick.modules[obj.MODULE_NAME] = obj;
};
