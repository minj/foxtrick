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
		Foxtrick.util.load.get(url)('success', function(text) {
			Foxtrick.util.inject.css(doc, text);
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
	var head = doc.getElementsByTagName('head')[0];
	var style = doc.createElement('style');
	style.setAttribute('type', 'text/css');
	style.id = id;
	head.appendChild(style);

	var inject = function(css) {
		style.appendChild(doc.createTextNode(css));
	};
	Foxtrick.util.css.replaceExtensionDirectory(css, inject, id);

	return style;
};

// attaches a JavaScript file to the page
Foxtrick.util.inject.jsLink = function(doc, url) {
	if (Foxtrick.arch == 'Sandboxed') {
		Foxtrick.util.load.get(url)('success', function(text) {
			Foxtrick.util.inject.js(doc, text);
		});
		return;
	}
	var head = doc.getElementsByTagName('head')[0];
	var script = doc.createElement('script');
	script.setAttribute('type', 'application/javascript');
	script.setAttribute('src', url);
	head.appendChild(script);
	return script;
};

// attaches a JavaScript snippet to the page
Foxtrick.util.inject.js = function(doc, js) {
	var head = doc.getElementsByTagName('head')[0];
	var script = doc.createElement('script');
	script.setAttribute('type', 'text/javascript');
	script.textContent = js;
	head.appendChild(script);
	return script;
};
