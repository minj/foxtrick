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

Foxtrick.util.inject.addStyleSheet = function(doc, css) {
	Foxtrick.log('addStyleSheet: '+css+'\n');
	var path = "head[1]";
	var head = doc.evaluate(path,doc.documentElement,null,doc.DOCUMENT_NODE,null).singleNodeValue;

	var link = doc.createElement("link");
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("media", "all");
	link.setAttribute("href", css);
	head.appendChild(link);
};

Foxtrick.util.inject.addStyleSheetSnippet = function(doc, css, id) {
	var inject = function (css) {
		var head = doc.getElementsByTagName("head")[0];
		var style = doc.createElement("style");
		style.setAttribute("type", "text/css");
		if (id) {
			Foxtrick.util.inject.removeStyleSheetSnippet(doc, id);
			style.id = id;
		}
		style.appendChild(doc.createTextNode(css));
		head.appendChild(style);
		//Foxtrick.log('inject: ', id);
	}
	
	Foxtrick.replaceExtensionDirectory(css, inject, id);
};

Foxtrick.util.inject.removeStyleSheetSnippet = function(doc, id) {
	var head = doc.getElementsByTagName("head")[0];
	var style = doc.getElementById(id);
	if (style)
		head.removeChild(style);
};


// attaches a JavaScript snippet to the page
Foxtrick.util.inject.addJavaScriptSnippet = function(doc, js) {
	Foxtrick.log('addJavaScriptSnippet');
	var path = "head[1]";
	var head = doc.evaluate(path,doc.documentElement,null,doc.DOCUMENT_NODE,null).singleNodeValue;

	var script = doc.createElement("script");
	script.setAttribute("type", "text/javascript");
	script.textContent = js;
	head.appendChild(script);
};


// attaches a JavaScript file to the page
Foxtrick.util.inject.addJavaScript = function(doc, url) {
	/*if (typeof(opera)=='object') {
		Foxtrick.load(url, function(text) {
			Foxtrick.util.inject.addJavaScriptSnippet(doc, text);
		}, false);
		return;
	}*/
	var path = "head[1]";
	var head = doc.evaluate(path,doc.documentElement,null,doc.DOCUMENT_NODE,null).singleNodeValue;

	var script = doc.createElement("script");
	script.setAttribute("language", "JavaScript");
	script.setAttribute("src", url);
	head.appendChild(script);
};
