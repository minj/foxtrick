/**
 * layout.js
 * Utilities for Hattrick layout
 * @author unknown (NOTE - fill in yourself!)
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.layout = {};

// Returns whether the HTML document uses standard theme
Foxtrick.util.layout.isStandard = function(doc) {
	var head = doc.head;
	if (!head)
		throw new Error('Not a valid document');

	var links = head.querySelectorAll('link');
	if (links.length == 0) { // mobile internet may have style embedded
		var styles = head.querySelectorAll('style');
		for (var style of styles) {
			if (/\/App_Themes\/Simple/i.test(style.textContent))
				return false;
		}
	}
	else {
		for (var link of links) {
			if (/\/App_Themes\/Simple/i.test(link.href))
				return false;
		}
	}
	return true;
};

// Returns whether the HTML document uses right-to-left language
Foxtrick.util.layout.isRtl = function(doc) {
	var head = doc.head;
	if (!head)
		throw new Error('Not a valid document');

	var links = head.querySelectorAll('link');
	if (links.length == 0) { // mobile internet may have style embedded
		var styles = head.querySelectorAll('style');
		for (var style of styles) {
			if (/direction:rtl/i.test(style.textContent))
				return true;
		}
	}
	else {
		for (var link of links) {
			if (/_rtl\.css/.test(link.href))
				return true;
		}

	}
	return false;
};

// Returns whether the HTML document uses eastern language
Foxtrick.util.layout.isEastern = function(doc) {
	var body = doc.body;
	if (!body)
		throw new Error('Not a valid document');

	var style = body.getAttribute('style');
	if (style && style.indexOf('font-size:0.79em;') != -1)
		return true;

	return false;
};

// Returns whether the match order interface is flipped
Foxtrick.util.layout.isFlipped = function(doc) {
	var head = doc.head;
	if (!head)
		throw new Error('Not a valid document');

	var links = head.querySelectorAll('link');
	if (links.length == 0) { // mobile internet may have style embedded
		var styles = head.querySelectorAll('style');
		for (var style of styles) {
			if (/field_flip.png/i.test(style.textContent))
				return true;
		}
	}
	else {
		for (var link of links) {
			if (/orders_flip.css/i.test(link.href))
				return true;
		}
	}
	return false;
};


// Returns whether the user logged in is supporter
Foxtrick.util.layout.isSupporter = function(doc) {
	return doc.getElementsByClassName('hattrickNoSupporter').length === 0;
};

// Returns whether scrolling is on for #mainBody
Foxtrick.util.layout.mainBodyHasScroll = function(doc) {
	var mainBody = doc.getElementById('mainBody');
	if (!mainBody)
		return false;

	var mainBodyChildren = mainBody.querySelectorAll('script');
	for (var child of mainBodyChildren) {
		if (child.textContent && /adjustHeight\('mainBody'/.test(child.textContent))
			return true;
	}
	return false;
};

/**
 * tests whether user has multiple teams
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.util.layout.hasMultipleTeams = function(doc) {
	return doc.querySelector('[id*="ucClubSwitcher"i]') != null;
};
