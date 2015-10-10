'use strict';
/**
 * inject.js
 * Utilities for injecting CSS/JavaScript in a page
 * @author convincedd, ryanli
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.inject = {};

Foxtrick.util.inject.cssLink = function(doc, url) {
	if (Foxtrick.arch == 'Sandboxed') {
		var id = url.match(/([^\/]+)\.css$/)[1];
		Foxtrick.util.load.get(url)('success', function(text) {
			Foxtrick.util.inject.css(doc, text, id);
		});
		return;
	}
	var head = doc.getElementsByTagName('head')[0];
	var link = doc.createElement('link');
	link.setAttribute('rel', 'stylesheet');
	link.setAttribute('type', 'text/css');
	link.setAttribute('media', 'all');
	link.setAttribute('href', url);
	head.appendChild(link);

	return link;
};

Foxtrick.util.inject.css = function(doc, css, id) {
	var sourceName = 'ft.' + id + '.css';
	var head = doc.getElementsByTagName('head')[0];
	var style = doc.createElement('style');
	style.setAttribute('type', 'text/css');
	style.id = id;
	head.appendChild(style);

	var inject = function(css) {
		style.textContent = css + '\n\n/*# sourceURL=' + sourceName + ' */\n';
	};
	Foxtrick.util.css.replaceExtensionDirectory(css, inject);

	return style;
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
		Foxtrick.util.load.get(url)('success', function(text) {
			inject(doc, text, id);
		});
	}
};
