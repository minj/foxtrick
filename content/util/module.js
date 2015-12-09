'use strict';
/*
 * module.js
 * Utilities for Foxtrick categorized module handling
 * @author ryanli
 */

if (!Foxtrick)
	var Foxtrick = {};

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

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.module = {};

if (!Foxtrick.modules)
	Foxtrick.modules = {};

