"use strict";
/*
 * css.js
 * css management utilities
 */

if (!Foxtrick) 
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};
Foxtrick.util.css = {};

// load images in background and convert them to dataUrl
// needed for opera since they don't allow access to repository from html document
Foxtrick.util.css.convertImageUrlToData = function(cssTextCollection, callback) {
	var pending = 0;

	// send back when all images are converted
	var resolve = function() {
		if (--pending <= 0) {
			callback(cssTextCollection);
		}
	};
	// convert an image
	var replaceImage = function (url) {
		var image = new Image;
		image.onload = function() {
			var canvas = document.createElement("canvas");
			canvas.width = image.width;
			canvas.height = image.height;
			var context = canvas.getContext('2d');
			context.drawImage(image, 0, 0);
			var dataUrl = canvas.toDataURL()
			Foxtrick.dataUrlStorage[url] = dataUrl;
			cssTextCollection = cssTextCollection.replace(RegExp(url,'g'), dataUrl);
			return resolve();
		};
		image.onerror = function() {
			return resolve();
		};
		return image.src = url;
	};

	if (cssTextCollection) {
		var fullUrlRegExp = new RegExp("\\(\'?\"?chrome://foxtrick/content/([^\\)]+)\'?\"?\\)", "gi");
		var urls = cssTextCollection.match(fullUrlRegExp);
		var InternalPathRegExp = RegExp("chrome://foxtrick/content/", "ig");
		cssTextCollection = cssTextCollection.replace(InternalPathRegExp, Foxtrick.InternalPath);

		if (urls) {
			// first check dataurl cache
			for (var i = 0; i<urls.length; ++i) {
				urls[i] = urls[i].replace(/\(\'?\"?|\'?\"?\)/g,'').replace(InternalPathRegExp, Foxtrick.InternalPath);
				if (Foxtrick.dataUrlStorage[urls[i]]) {
					cssTextCollection = cssTextCollection.replace(RegExp(urls[i],'g'), Foxtrick.dataUrlStorage[urls[i]]);
				}
			}
			// convert missing images
			for (var i = 0; i<urls.length; ++i) {
				urls[i] = urls[i].replace(/\(\'?\"?|\'?\"?\)/g,'').replace(InternalPathRegExp, Foxtrick.InternalPath);
				if (!Foxtrick.dataUrlStorage[urls[i]]) {
					pending++;
					replaceImage(urls[i]);
				}
			}
			// resolve cached dataurls
			pending++;
			resolve();
		}
	}
};

// replace links in the css files to the approriate chrome resources for each browser
Foxtrick.util.css.replaceExtensionDirectory = function(cssTextCollection, callback, id) {
	var InternalPathRegExp = RegExp("chrome://foxtrick/content/", "ig");

	if (Foxtrick.platform == "Opera" ) {
		if (cssTextCollection.search(InternalPathRegExp)!=-1 )
			sandboxed.extension.sendRequest({ req : "convertImages", cssText: cssTextCollection, type: id},
				function (data) { callback(data.cssText);
				});
		else callback(cssTextCollection);
	}
	else if (Foxtrick.platform == "Safari" || Foxtrick.platform == "Chrome") {
		callback( cssTextCollection.replace(InternalPathRegExp, Foxtrick.InternalPath) );
	}
	else callback(cssTextCollection);
}

// ------------------------  css loading ----------------------------
// unload all css files, enabled or not
Foxtrick.util.css.unload_module_css = function(doc) {
	Foxtrick.log('unload permanents css');

	if (Foxtrick.arch === "Gecko") {
		if (Foxtrick.current_css) {
			Foxtrick.util.css.unload_css_permanent(Foxtrick.current_css);
		}
	}
	else {
		var moduleCss = doc.getElementById("ft-module-css");
		if (moduleCss)
			moduleCss.parentNode.removeChild(moduleCss);
	}
}

// unload single css file or array of css files
Foxtrick.util.css.unload_css_permanent = function(cssList) {
	var unload_css_permanent_impl = function(css) {
		try {
			// convert text css to data url
			if ( css.search(/^[A-Za-z_-]+:\/\//) == -1 ) {
				// needs to be uncompressed to have the right csss precedence
				css = 'data:text/css;charset=US-ASCII,'+encodeURIComponent(css);
			}
			try {
				var sss = Components
					.classes["@mozilla.org/content/style-sheet-service;1"]
					.getService(Components.interfaces.nsIStyleSheetService);
				var ios = Components
					.classes["@mozilla.org/network/io-service;1"]
					.getService(Components.interfaces.nsIIOService);
				var uri = ios.newURI(css, null, null);
			}
			catch (e) {
				return;
			}
			// try unload
			if (sss.sheetRegistered(uri, sss.USER_SHEET)) {
				sss.unregisterSheet(uri, sss.USER_SHEET);
			}
		}
		catch (e) {
			Foxtrick.log ('> load_css_permanent ' , e , '\n');
		}
	};
	if (Foxtrick.arch === "Gecko") {
		if (typeof(cssList) === "string")
			unload_css_permanent_impl(cssList);
		else if (cssList instanceof Array) {
			for (var i=0; i<cssList.length; ++i)
				unload_css_permanent_impl(cssList[i]);
		}
	}
	else {
		var moduleCss = doc.getElementById("ft-module-css");
		if (moduleCss)
			moduleCss.parentNode.removeChild(moduleCss);
	}
}

// collect all enabled module css urls in Foxtrick.cssFiles array
Foxtrick.util.css.collect_module_css = function() {
	Foxtrick.cssFiles = [];
	var collect = function(module) {
		if (FoxtrickPrefs.isModuleEnabled(module.MODULE_NAME)) {
			// module main CSS
			if (module.CSS) {
				if (module.CSS instanceof Array) {
					for (var i = 0; i < module.CSS.length; ++i)
						Foxtrick.cssFiles.push(module.CSS[i]);
				}
				else if (typeof(module.CSS) == "string") {
					Foxtrick.cssFiles.push(module.CSS);
				}
				else {
					Foxtrick.log("Unrecognized CSS from module ",
						module.MODULE_NAME, ": ", module.CSS);
				}
			}
			// module options CSS
			if (module.OPTIONS && module.OPTIONS_CSS) {
				for (var i = 0;
					i < Math.min(module.OPTIONS.length, module.OPTIONS_CSS.length);
					++i) {
					if (FoxtrickPrefs.isModuleOptionEnabled(module.MODULE_NAME, module.OPTIONS[i])
						&& module.OPTIONS_CSS[i])
						Foxtrick.cssFiles.push(module.OPTIONS_CSS[i]);
				}
			}
			// module options CSS
			if (module.RADIO_OPTIONS 
				&& module.RADIO_OPTIONS_CSS
				&& module.RADIO_OPTIONS_CSS[ FoxtrickPrefs.getInt("module."+module.MODULE_NAME+".value") ]) {
					Foxtrick.cssFiles.push(module.RADIO_OPTIONS_CSS[ FoxtrickPrefs.getInt("module."+module.MODULE_NAME+".value") ]);
			}
		}
	};
	// sort modules, place SkinPlugin at last
	// FIXME - implement a more general method
	var modules = [];
	for (var i in Foxtrick.modules)
		modules.push(Foxtrick.modules[i]);
	modules.sort(function(a, b) {
		if (a.MODULE_NAME == b.MODULE_NAME)
			return 0;
		if (a.MODULE_NAME == "SkinPlugin")
			return 1;
		if (b.MODULE_NAME == "SkinPlugin")
			return -1;
	});
	Foxtrick.map(collect, modules);
};

// load single into browser or page
Foxtrick.util.css.load_css_permanent = function(css) {
	try {
		// convert text css to data url
		if ( css.search(/^[A-Za-z_-]+:\/\//) == -1 ) {
			// needs to be uncompressed to have the right csss precedence
			css = 'data:text/css;charset=US-ASCII,'+encodeURIComponent(css);
		}

		try {
			var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
			var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
			var uri = ios.newURI(css, null, null);
		}
		catch (e) {
			return;
		}
		// load
		if (!sss.sheetRegistered(uri, sss.USER_SHEET)) {
			sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
		}
	}
	catch (e) {
		Foxtrick.log ('> ERROR load_css_permanent: ' , css , '\n');
		Foxtrick.log (e);
	}
};

// load all Foxtrick.cssFiles into browser or page
Foxtrick.util.css.load_module_css = function(doc) {
	Foxtrick.util.css.unload_module_css(doc);

	if (Foxtrick.platform === "Firefox") {
		Foxtrick.current_css = Foxtrick.util.css.getCssTextCollection();
		Foxtrick.util.css.load_css_permanent(Foxtrick.current_css);
	}
	else {
		Foxtrick.util.css.collect_module_css();
		sandboxed.extension.sendRequest(
			{ req : "getCss", files :Foxtrick.cssFiles },
			function (data) {
				if (Foxtrick.platform == "Mobile" || Foxtrick.platform == "Android") {
					Foxtrick.current_css = data.cssText;
					Foxtrick.util.css.load_css_permanent(Foxtrick.current_css);
				} else {
					var style = Foxtrick.util.inject.css(doc, data.cssText);
					style.id = "ft-module-css";
				}
			}
		);
	}
};

Foxtrick.util.css.reload_module_css = function(doc) {
	try {
		Foxtrick.util.css.load_module_css(doc);
	}
	catch (e) {
		Foxtrick.log(e);
	}
};


// loads css file from local resource and return a string with the content for injection into page
Foxtrick.util.css.getCssTextFromFile = function (cssUrl) {
	// @callback_param cssText - string of CSS content
	var css_text = "";
	if (cssUrl && cssUrl.search(/{/) == -1) { // has no class
		try {
			// a resource file, get css file content
			css_text = Foxtrick.util.load.sync(cssUrl);
			if (css_text == null)
				throw "Cannot load CSS: " + cssUrl;
		}
		catch (e) {
			Foxtrick.log(e);
			return;
		}
	}
	else {
		// not a file. line is css text already
		css_text = cssUrl;
	}
	css_text = css_text.replace(new RegExp('\\[data-theme="'+FoxtrickPrefs.getString('theme')+'"\\]','g'), "");
	css_text = css_text.replace(new RegExp('\\[dir="'+FoxtrickPrefs.getString('dir')+'"\\]','g'), "");
	if (Foxtrick.arch == "Sandboxed") {
		// remove moz-document statement
		if (css_text && css_text.search(/@-moz-document/)!=-1) {
			css_text = css_text.replace(/@-moz-document[^\{]+\{/, "");
			var closing_bracket = css_text.lastIndexOf("}");
			css_text = css_text.substr(0, closing_bracket) + css_text.substr(closing_bracket+1);
		}
	}
	return css_text;
};

// gets all css from modules.CSS settings
Foxtrick.util.css.getCssFileArrayToString = function(cssUrls) {
	var cssTextCollection='';
	for (var i = 0; i < cssUrls.length; ++i) {
		cssTextCollection += Foxtrick.util.css.getCssTextFromFile(cssUrls[i]);
	}
	return cssTextCollection;
};

	// gets all css from modules.CSS settings
Foxtrick.util.css.getCssTextCollection = function() {
	Foxtrick.log('getCssTextCollection ',FoxtrickPrefs.getString('theme'),' - ',FoxtrickPrefs.getString('dir'));
	Foxtrick.util.css.collect_module_css();
	return 	Foxtrick.util.css.getCssFileArrayToString(Foxtrick.cssFiles);
};
