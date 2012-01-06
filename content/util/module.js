"use strict";
/*
 * module.js
 * Utilities for FoxTrick categorized module handling
 * @author ryanli
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.module = {};

// provided the name of a categorized module, return the categorized module object
Foxtrick.util.module.get = function(n) {
	return Foxtrick.modules ? Foxtrick.modules[n] : null;
};

// provided an object, register it as a FoxTrick categorized module
Foxtrick.util.module.register = function(obj) {
	// adddfunctions to all categorized modules
	obj.createElement = function(doc, type) {
		var node = doc.createElement(type);
		node.className = 'ft-dummy';
		if (FoxtrickPrefs.getBool("featureHighlight"))
			node.title = Foxtrickl10n.getString("tab."+obj.MODULE_CATEGORY)+'>'+obj.MODULE_NAME + ': ' + FoxtrickPrefs.getModuleDescription(obj.MODULE_NAME);
		return node;
	};
	if (!Foxtrick.modules)
		Foxtrick.modules = {};
	Foxtrick.modules[obj.MODULE_NAME] = obj;
};
