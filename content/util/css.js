/**
 * css.js
 * css management utilities
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

Foxtrick.util.css = {};

// load images in background and convert them to dataUrl
// needed for opera since they don't allow access to repository from html document
// Foxtrick.util.css.convertImageUrlToData = function(cssTextCollection, callback) {
// 	var pending = 0;

// 	// send back when all images are converted
// 	var resolve = function() {
// 		if (--pending <= 0) {
// 			callback(cssTextCollection);
// 		}
// 	};
// 	// convert an image
// 	var replaceImage = function(url) {
// 		var image = new Image;
// 		image.onload = function() {
// 			var canvas = document.createElement('canvas');
// 			canvas.width = image.width;
// 			canvas.height = image.height;
// 			var context = canvas.getContext('2d');
// 			context.drawImage(image, 0, 0);
// 			var dataUrl = canvas.toDataURL();
// 			Foxtrick.dataUrlStorage[url] = dataUrl;
// 			cssTextCollection = cssTextCollection.replace(RegExp(url, 'g'), dataUrl);
// 			return resolve();
// 		};
// 		image.onerror = function() {
// 			return resolve();
// 		};
// 		return image.src = url;
// 	};

// 	if (cssTextCollection) {
// 		var fullUrlRegExp =
// 			new RegExp("\\(\'?\"?chrome://foxtrick/content/([^\\)]+)\'?\"?\\)", 'gi');
// 		var urls = cssTextCollection.match(fullUrlRegExp);
// 		var InternalPathRE = RegExp('chrome://foxtrick/content/', 'ig');
// 		cssTextCollection = cssTextCollection.replace(InternalPathRE, Foxtrick.InternalPath);

// 		if (urls) {
// 			// first check dataurl cache
// 			for (var i = 0; i < urls.length; ++i) {
// 				urls[i] = urls[i].replace(/\(\'?\"?|\'?\"?\)/g, '').
// 					replace(InternalPathRE, Foxtrick.InternalPath);
// 				if (Foxtrick.dataUrlStorage[urls[i]]) {
// 					cssTextCollection =
// 						cssTextCollection.replace(RegExp(urls[i], 'g'),
// 						                          Foxtrick.dataUrlStorage[urls[i]]);
// 				}
// 			}
// 			// convert missing images
// 			for (var i = 0; i < urls.length; ++i) {
// 				urls[i] = urls[i].replace(/\(\'?\"?|\'?\"?\)/g, '').
// 					replace(InternalPathRE, Foxtrick.InternalPath);
// 				if (!Foxtrick.dataUrlStorage[urls[i]]) {
// 					pending++;
// 					replaceImage(urls[i]);
// 				}
// 			}
// 			// resolve cached dataurls
// 			pending++;
// 			resolve();
// 		}
// 	}
// };

/**
 * replace links in the css files to the approriate chrome resources for each browser
 *
 * @param {string} cssTextCollection
 * @param {function(string):void} callback
 */
Foxtrick.util.css.replaceExtensionDirectory = function(cssTextCollection, callback) {
	const InternalPathRegExp = /chrome:\/\/foxtrick\/content\//ig;

	if (Foxtrick.platform == 'Safari' || Foxtrick.platform == 'Chrome') {
		callback(cssTextCollection.replace(InternalPathRegExp, Foxtrick.InternalPath));
		return;
	}

	callback(cssTextCollection);
};

// ------------------------  css loading ----------------------------

/**
 * unload all css files, enabled or not
 *
 * @param {document} doc
 */
Foxtrick.util.css.unloadModuleCSS = function(doc) {
	Foxtrick.log('unload permanents css');
	var moduleCss = doc.getElementById('ft-module-css');
	if (moduleCss)
		moduleCss.parentNode.removeChild(moduleCss);
};


/**
 * collect all enabled module css urls in cssFiles array
 *
 * @return {string[]} cssFiles
 */
Foxtrick.util.css.collectModuleCSS = function() {
	/** @type {string[]} */
	var cssFiles = [];

	/**
	 * @param {FTAppModuleMixin} module
	 */
	// eslint-disable-next-line consistent-this
	var collect = function(module) {
		if (!Foxtrick.Prefs.isModuleEnabled(module))
			return;

		// module main CSS
		if (module.CSS) {
			if (Array.isArray(module.CSS)) {
				for (let css of module.CSS)
					cssFiles.push(css);
			}
			else if (typeof module.CSS == 'string') {
				cssFiles.push(module.CSS);
			}
			else {
				let msg = [
					'Unrecognized CSS from module',
					module.MODULE_NAME, ':', module.CSS,
				].join(' ');
				Foxtrick.log(new Error(msg));
			}
		}

		// module options CSS
		if (module.OPTIONS && module.OPTIONS_CSS) {
			/**
			 * @param {(string|string[])[]} options
			 * @param {(string|string[])[]} cssArr
			 */
			var pushCss = function(options, cssArr) {
				let len = Math.min(cssArr.length, options.length);
				for (let [i, css] of cssArr.slice(0, len).entries()) {
					let opt = options[i];

					if (Array.isArray(css) && Array.isArray(opt)) {
						pushCss(opt, css);
					}
					else if (typeof css == 'string' && typeof opt == 'string') {
						let enabled = Foxtrick.Prefs.isModuleOptionEnabled(module, opt);
						if (enabled && css)
							cssFiles.push(css);
					}
					else if (css) {
						let msg = [
							'OPTIONS_CSS not matching OPTIONS structure:',
							module.MODULE_NAME, JSON.stringify(opt),
							typeof css, JSON.stringify(css),
						].join(' ');
						Foxtrick.log(new Error(msg));
					}
				}
			};
			pushCss(module.OPTIONS, module.OPTIONS_CSS);
		}

		// module options CSS
		if (module.RADIO_OPTIONS && module.RADIO_OPTIONS_CSS) {
			let value = Foxtrick.Prefs.getModuleValue(module);
			let css = module.RADIO_OPTIONS_CSS[value];
			if (css)
				cssFiles.push(css);
		}
	};

	var modules = /** @type {FTAppModuleMixin[]} */ (Object.values(Foxtrick.modules));

	// sort modules, place SkinPlugin at last
	// FIXME - implement a more general method
	modules.sort(function(a, b) {
		if (a.MODULE_NAME == b.MODULE_NAME)
			return 0;
		if (a.MODULE_NAME == 'SkinPlugin')
			return 1;
		if (b.MODULE_NAME == 'SkinPlugin')
			return -1;

		return 0;
	});
	modules.forEach(collect);

	return cssFiles;
};

/**
 * load all cssFiles into browser or page
 * @param {document} doc
 */
Foxtrick.util.css.loadModuleCSS = function(doc) {
	Foxtrick.util.css.unloadModuleCSS(doc);

	let files = Foxtrick.util.css.collectModuleCSS();
	Foxtrick.SB.ext.sendRequest({ req: 'getCss', files }, (data) => {
		Foxtrick.util.inject.css(doc, data.cssText, 'ft-module-css');
	});
};

/**
 * @param {document} doc
 */
Foxtrick.util.css.reloadModuleCSS = function(doc) {
	try {
		Foxtrick.util.css.loadModuleCSS(doc);
	}
	catch (e) {
		Foxtrick.log(e);
	}
};


/**
 * loads css file from local resource
 *
 * @param  {string} cssUrl
 * @return {string}        string with the content for injection into page
 */
Foxtrick.util.css.getCssTextFromFile = function(cssUrl) {
	// @callback_param cssText - string of CSS content
	var cssText = '';
	if (cssUrl && !/{/.test(cssUrl)) { // has no class, probably file
		try {
			// a resource file, get css file content
			cssText = Foxtrick.util.load.sync(cssUrl);
			if (cssText == null)
				throw new Error(`Cannot load CSS: ${cssUrl}`);
		}
		catch (e) {
			Foxtrick.log(e);
			return '';
		}
	}
	else {
		// not a file. line is css text already
		cssText = cssUrl;
	}
	return cssText;
};

/**
 * gets all css from modules.CSS settings
 *
 * @param  {string[]} cssUrls
 * @return {string}
 */
Foxtrick.util.css.getCssFileArrayToString = function(cssUrls) {
	let coll = cssUrls.map(Foxtrick.util.css.getCssTextFromFile);
	return coll.join('');
};

/**
 * gets all css from modules.CSS settings
 *
 * @return {string}
 */
Foxtrick.util.css.getCssTextCollection = function() {
	let theme = Foxtrick.Prefs.getString('theme');
	let dir = Foxtrick.Prefs.getString('dir');
	Foxtrick.log('getCssTextCollection', theme, '-', dir);
	let files = Foxtrick.util.css.collectModuleCSS();
	return Foxtrick.util.css.getCssFileArrayToString(files);
};
