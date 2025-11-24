/**
 * inject.js
 * Utilities for injecting CSS/JavaScript in a page
 * @author convincedd, ryanli
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

Foxtrick.util.inject = {};

Foxtrick.util.inject.cssLink = function(doc, url) {
	if (Foxtrick.arch == 'Sandboxed') {
		var id = url.match(/([^/]+)\.css$/)[1];

		Foxtrick.load(url).then(function(text) {
			Foxtrick.util.inject.css(doc, text, id);
		}).catch(Foxtrick.catch('cssLink'));

		return;
	}

	var inject = function(doc) {
		var link = doc.createElement('link');
		link.setAttribute('rel', 'stylesheet');
		link.setAttribute('type', 'text/css');
		link.setAttribute('media', 'all');
		link.setAttribute('href', url);

		doc.head.appendChild(link);
	};

	var head = doc.head;
	var body = doc.body;

	if (head && body) {
		inject(doc);
	}
	else {
		Foxtrick.onChange(doc.documentElement, function(doc) {
			var head = doc.head;
			var body = doc.body;
			if (head && body) {
				inject(doc);
				return true;
			}
		}, { subtree: false });
	}
};

Foxtrick.util.inject.css = function(doc, css, id) {
	var inject = function(doc) {
		Foxtrick.util.css.replaceExtensionDirectory(css, function(css) {
			if (!/^(ft|foxtrick)/i.test(id))
				id = 'ft-' + id;

			var sourceName = id + '.css';
			var style = doc.createElement('style');
			style.id = id;
			style.textContent = css + '\n\n/*# sourceURL=' + sourceName + ' */\n';
			style.setAttribute('type', 'text/css');

			doc.head.appendChild(style);
		});
	};

	var head = doc.head;
	var body = doc.body;
	if (head && body) {
		inject(doc);
	}
	else if (doc.documentElement) {
		Foxtrick.onChange(doc.documentElement, function(doc) {
			var head = doc.head;
			var body = doc.body;
			if (head && body) {
				inject(doc);
				return true;
			}
			return void 0;
		}, { subtree: false });
	}
};

// attaches a JavaScript file to the page
// dynamically injected from chrome only
Foxtrick.util.inject.jsLink = function(doc, url) {
	if (Foxtrick.arch == 'Gecko') {
		Services.scriptloader.loadSubScript(url, doc.defaultView, 'UTF-8');
	}
	else {
		var inject = function(doc, js, id) {
			var sourceName = 'ft.' + id + '.js';
			var head = doc.getElementsByTagName('head')[0];

			// README:
			// The following code defeats AMO validator on purpose.
			// Reasons are pretty simple:
			// - this function will not run in Firefox
			// - this function will be used to create only page scripts by design;
			// - the script created is guaranteed to be static from a file in the add-on package;
			// - AMO validator can't validate the above claims;
			// - nobody wants manual review to approve the above claims;
			// - AMO validator can't skip these warnings even if approved.
			// Thank you for your understanding.
			var script = doc['createElement']('script'); // does not run in FF: see above
			script.setAttribute('type', 'text/javascript');
			script.id = id;
			script.textContent = js + '\n\n//# sourceURL=' + sourceName + '\n';
			head.appendChild(script);
			return script;
		};

		var id = url.match(/([^\/]+)\.js$/)[1];

		Foxtrick.load(url).then(function(text) {
			inject(doc, text, id);
		}).catch(Foxtrick.catch('jsLink'));
	}
};
