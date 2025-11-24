/**
 * misc.js
 * Miscellaneous utilities
 * @author convincedd, ryanli, LA-MJ, CatzHoek
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

/**
 * @param {document} doc
 */
Foxtrick.startObserver = function(doc) {
	if (!Foxtrick.isHt(doc))
		return;

	/** @param {Node[]} changes */
	let waitForChanges = function(changes) {
		if (!changes || !changes.length)
			return;

		let [first] = changes;
		let doc = first.ownerDocument;
		Foxtrick.stopObserver(doc);
		Foxtrick.entry.change(doc, changes);
		Foxtrick.startObserver(doc);
	};

	// must store MO on contentWindow
	// otherwise it's killed by Firefox's GC
	let win = doc.defaultView;

	// @ts-ignore
	let obs = win._FoxtrickObserver;
	if (obs) {
		obs.reconnect();
	}
	else {
		let content = doc.getElementById('content');

		// @ts-ignore
		win._FoxtrickObserver = Foxtrick.getChanges(content, waitForChanges);

		/**
		 * @this {Window}
		 */
		let beforeUnload = () => {
			if (this._FoxtrickObserver) {
				this._FoxtrickObserver.disconnect();
				delete this._FoxtrickObserver;
			}
		};
		win.addEventListener('beforeunload', beforeUnload);
	}
};

/**
 * @param {document} doc
 */
Foxtrick.stopObserver = function(doc) {
	let win = doc.defaultView;

	// @ts-ignore
	let obs = win._FoxtrickObserver;
	if (obs)
		obs.disconnect();
};

/**
 * @template T, A, R
 * @typedef {(this: T, ...args: A[]) => R} Callback
 */

/**
 * @template T, A, R
 * @param {document}         doc
 * @param {Callback<T,A,R>}  func
 * @return {Callback<T,A,R>}      wrapper
 */
Foxtrick.preventChange = function(doc, func) {
	/**
	 * @this {T}
	 * @return {R}
	 */
	return function(...args) {
		Foxtrick.stopObserver(doc);
		let ret = func.apply(this, args);
		Foxtrick.startObserver(doc);
		return ret;
	};
};

/**
 * @typedef {'__ftErrorSymbol'} FT_ERROR_SYMBOL
 * @typedef SerializedError
 * @prop {number} __ftErrorSymbol
 * @prop {string} name
 * @prop {string} message
 * @prop {string} stack
 */

/**
 * A hack to enable passing Error instances over the message port.
 *
 * @param  {Error|SerializedError} err An Error instance here, an object there
 * @return {SerializedError|Error}     An object here, an Error instance there
 */
Foxtrick.jsonError = (err) => {
	/** @type {FT_ERROR_SYMBOL} */
	const ERROR_SYMBOL = '__ftErrorSymbol';
	if (err == null)
		return err;

	if (typeof err == 'object') {
		if (err instanceof Error) {
			return {
				[ERROR_SYMBOL]: 1,
				name: err.name,
				message: err.message,
				stack: err.stack,
			};
		}
		else if (ERROR_SYMBOL in err) {
			// MV3: Use self instead of window for global error constructors
		let obj = new self[err.name]();
			obj.message = err.message;
			obj.stack = err.stack;
			return obj;
		}

		for (let k of Object.keys(err)) {
			if (!Object.getOwnPropertyDescriptor(err, k).writable)
				continue;

			err[k] = Foxtrick.jsonError(err[k]);
		}

	}

	return err;
};

/**
 * Try playing an audio url
 * @param {string} url
 */
Foxtrick.playSound = function(url) {
	let play = function(url, type, volume) {
		try {
			let music = new Audio();
			let canPlay = music.canPlayType('audio/' + type);
			Foxtrick.log('can play', type, ':', canPlay === '' ? 'no' : canPlay);

			// @ts-ignore
			if (canPlay === '' || canPlay === 'no')
				return;

			music.src = url;
			music.volume = volume;
			music.play();
		}
		catch (e) {
			Foxtrick.log('Playback failed', e);
		}
	};

	if (Foxtrick.context == 'content') {
		// delegate to background due to playback delay
		Foxtrick.SB.ext.sendRequest({ req: 'playSound', url: url });
		return;
	}

	if (typeof url !== 'string') {
		Foxtrick.log('Bad sound:', url);
		return;
	}
	let soundUrl = url.replace(/^foxtrick:\/\//, Foxtrick.ResourcePath);

	let type = 'wav'; // lgtm[js/useless-assignment-to-local]
	if (soundUrl.indexOf('data:audio/') === 0) {
		let dataURLRe = /^data:audio\/(.+?);/;
		if (!dataURLRe.test(soundUrl)) {
			Foxtrick.log('Bad data URL:', soundUrl);
			return;
		}

		type = dataURLRe.exec(soundUrl)[1];
	}
	else {
		let extRe = /\.([^.]+)$/;
		if (!extRe.test(soundUrl)) {
			Foxtrick.log('Not a sound file:', url);
			return;
		}

		type = extRe.exec(soundUrl)[1];
	}

	let volume = (parseInt(Foxtrick.Prefs.getString('volume'), 10) || 100) / 100;
	Foxtrick.log('play', volume, soundUrl.slice(0, 100));

	play(soundUrl, type, volume);
};

/**
 * Copy something to the clipboard.
 *
 * Must be used in a listener for a user-initiated event.
 * Use addCopying instead
 *
 * copy maybe a string or a function that returns a string or {mime, content}
 * mime may specify additional mime type
 * 'text/plain' is always used
 *
 * c.f. https://stackoverflow.com/questions/3436102/copy-to-clipboard-in-chrome-extension/12693636#12693636
 *
 * @param {document} doc
 * @param {string|function():string|{mime:string, content:string}} copy
 * @param {?string} [mime]
 */
Foxtrick.copy = function(doc, copy, mime) {
	if (Foxtrick.platform == 'Safari') {
		// FIXME needs testing
		Foxtrick.sessionSet('clipboard', copy);
		Foxtrick.log(new Error('Safari copying is untested'));
		return;
	}

	const DEFAULT_MIME = 'text/plain';
	var contentMime = null;
	var copyContent = '';

	if (typeof copy === 'function') {
		let ret = copy();
		if (ret && typeof ret === 'object') {
			contentMime = ret.mime || null;
			copyContent = ret.content;
		}
		else if (typeof ret === 'string') {
			copyContent = ret;
		}
	}
	else {
		contentMime = mime || null;
		copyContent = copy;
	}

	doc.addEventListener('copy', function(ev) {

		ev.clipboardData.setData(DEFAULT_MIME, copyContent);
		if (contentMime)
			ev.clipboardData.setData(contentMime, copyContent);

		ev.preventDefault();

	}, { once: true });

	doc.execCommand('Copy', false, null);
};

/**
 * @param {string} url
 */
Foxtrick.newTab = function(url) {
	if (Foxtrick.context === 'content')
		Foxtrick.SB.ext.sendRequest({ req: 'newTab', url: url });
	else
		Foxtrick.SB.tabs.create({ url });
};

/**
 * @param  {XMLDocument}         xml
 * @param  {string}              containerPath
 * @param  {string}              valueAttr
 * @param  {string[]}            attributes
 * @return {(string|string[])[]}
 */
Foxtrick.xmlEval = function(xml, containerPath, valueAttr, ...attributes) {
	if (!xml)
		return [];

	let pathParts = containerPath.split(/\/|\[/g);
	let last = pathParts.pop();

	/** @type {Element} */
	let base = xml.documentElement;
	for (let part of pathParts) {
		let nodes = base.getElementsByTagName(part);
		[base] = nodes;
	}

	var ret = [];
	let nodes = base.getElementsByTagName(last);
	for (let node of nodes) {
		let label = node.getAttribute(valueAttr);
		let values = attributes.map(a => node.getAttribute(a));
		if (values.length)
			ret.push([label, ...values]);
		else
			ret.push(label);
	}

	return ret;
};

/**
 * @param  {XMLDocument} xml
 * @param  {string}      path
 * @param  {string}      attribute
 * @return {Node|string}
 */
Foxtrick.xmlEvalSingle = function(xml, path, attribute) {
	let result = xml.evaluate(path, xml, null, xml.DOCUMENT_NODE, null);

	let node = /** @type {Element} */ (result.singleNodeValue);
	if (!node)
		return null;

	if (attribute)
		return node.attributes.getNamedItem(attribute).textContent;

	return node;
};

Foxtrick.version = '0.0.0';
Foxtrick.lazyProp(Foxtrick, 'version', function() {
	// get rid of user-imported value
	Foxtrick.Prefs.deleteValue('version');
	return Foxtrick.Prefs.getString('version');
});

/**
 * FT distribution branch
 *
 * @typedef {'dev'|'beta'|'stable'|'nightly'|'alpha'} FoxtrickBranch
 * @type {FoxtrickBranch}
 */
Foxtrick.branch = 'dev';
Foxtrick.lazyProp(Foxtrick, 'branch', function() {
	// get rid of user-imported value
	Foxtrick.Prefs.deleteValue('branch');
	return Foxtrick.Prefs.getString('branch');
});

/**
 * Clear all caches
 */
Foxtrick.clearCaches = function() {
	Foxtrick.sessionDeleteBranch('');
	Foxtrick.localDeleteBranch('');
	Foxtrick.cache.clear();
};

/**
 * @param  {string}  url
 * @param  {string}  param
 * @return {?string}       ?value
 */
Foxtrick.getUrlParam = function(url, param) {
	if (url == null || url === '')
		return null;

	let needle = param.toLowerCase();
	let params = new URL(url, Foxtrick.getLastPage()).searchParams;
	let entries = [...params]; // keys() is not iterable in FF :(
	let entry = Foxtrick.nth(([k]) => k.toLowerCase() == needle, entries);
	if (entry) {
		let [_, val] = entry; // lgtm[js/unused-local-variable]
		return val;
	}

	return null;
};

/**
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.isHt = function(doc) {
	return Foxtrick.getPanel(doc) !== null && doc.getElementById('aspnetForm') !== null;
};

/**
 * @param  {string} url
 * @return {boolean}
 */
Foxtrick.isHtUrl = function(url) {
	const HT_RES = [
		/^(https?:)?\/\/(www(\d{2})?\.)?hattrick\.org(\/|$)/i,
		/^(https?:)?\/\/stage\.hattrick\.org(\/|$)/i,
		/^(https?:)?\/\/www(\d{2})?\.hattrick\.ws(\/|$)/i,
		/^(https?:)?\/\/www(\d{2})?\.hattrick\.bz(\/|$)/i,
		/^(https?:)?\/\/www(\d{2})?\.hat-trick\.net(\/|$)/i,
		/^(https?:)?\/\/www(\d{2})?\.hattrick\.uol\.com\.br(\/|$)/i,
		/^(https?:)?\/\/www(\d{2})?\.hattrick\.interia\.pl(\/|$)/i,
		/^(https?:)?\/\/www(\d{2})?\.hattrick\.name(\/|$)/i,
		/^(https?:)?\/\/www(\d{2})?\.hattrick\.fm(\/|$)/i,
	];
	return Foxtrick.any(re => re.test(url), HT_RES);
};

/**
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.isStage = function(doc) {
	const STAGE_RE = /^https?:\/\/stage\.hattrick\.org(\/|$)/i;
	return STAGE_RE.test(doc.URL);
};

/**
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.isLoginPage = function(doc) {
	let teamLinks = doc.getElementById('teamLinks');
	if (teamLinks === null)
		return true;
	if (teamLinks.getElementsByTagName('a').length === 0)
		return true;

	return false;
};

/**
 * @param  {document} doc
 * @return {HTMLDivElement}
 */
Foxtrick.getPanel = function(doc) {
	return doc.querySelector('.hattrick, .hattrickNoSupporter');
};

/**
 * @template {unknown}     T
 * @template {PropertyKey} K
 * @typedef {import('./types').Ensure<T,K>} Ensure
 */

// eslint-disable-next-line valid-jsdoc
/**
 * Test whether object obj has a property prop
 *
 * Deals with non-objects and null.
 * Traverses prototype chain.
 *
 * @template {unknown}     T
 * @template {PropertyKey} K
 * @param  {T} obj
 * @param  {K} prop
 * @return {obj is Ensure<T, K>}
 */
Foxtrick.hasProp = function(obj, prop) {
	return obj != null && typeof obj === 'object' && prop in obj;
};

// eslint-disable-next-line valid-jsdoc
/**
 * Test whether object obj is a simple key-value map
 *
 * @param  {unknown} obj
 * @return {obj is Record<PropertyKey, unknown>}
 */
Foxtrick.isMap = function(obj) {
	if (obj == null)
		return false;

	let proto = Object.getPrototypeOf(obj);
	return proto == null || proto == Object.prototype;
};

// eslint-disable-next-line valid-jsdoc
/**
 * Test whether object obj is an array-like
 *
 * @param  {unknown}          obj
 * @return {obj is ArrayLike}
 */
Foxtrick.isArrayLike = function(obj) {
	return Foxtrick.hasProp(obj, 'length') && !(obj instanceof Text) &&
		!(obj instanceof HTMLSelectElement);
};

/**
 * Copy all members from modified to original.
 * Modifies original.
 * @param {object} original
 * @param {object} modified
 */
Foxtrick.mergeAll = function(original, modified) {
	let hasOwnProperty = {}.hasOwnProperty;
	if (original && typeof original === 'object' &&
	    modified && typeof modified === 'object') {
		for (let mem in modified) {
			if (hasOwnProperty.call(modified, mem))
				original[mem] = modified[mem];
		}
	}
};

/**
 * Overwrite members in original with members from modified.
 * Modifies original. No new members added.
 * @param  {object} original
 * @param  {object} modified
 */
Foxtrick.mergeValid = function(original, modified) {
	let hasOwnProperty = {}.hasOwnProperty;
	if (original && typeof original === 'object' &&
	    modified && typeof modified === 'object') {
		for (let mem in original) {
			if (hasOwnProperty.call(modified, mem))
				original[mem] = modified[mem];
		}
	}
};

/**
 * @param {string} url
 */
Foxtrick.setLastPage = function(url) {
	Foxtrick.Prefs.setString('last-page', String(url));
};

/**
 * @return {string}
 */
Foxtrick.getLastPage = function() {
	return Foxtrick.Prefs.getString('last-page') || 'https://www.hattrick.org';
};

/**
 * Insert text in given textarea at the current position of the cursor
 * @param {HTMLTextAreaElement} textarea
 * @param {string}              text
 */
Foxtrick.insertAtCursor = function(textarea, text) {
	let val = textarea.value;
	let before = val.slice(0, textarea.selectionStart);
	let after = val.slice(textarea.selectionEnd);
	textarea.value = before + text + after;
	textarea.dispatchEvent(new Event('input'));
};

/**
 * @param  {string} msg
 * @return {boolean}
 */
Foxtrick.confirmDialog = function(msg) {
	// MV3: Dialogs not available in service workers
	if (typeof window !== 'undefined' && window.confirm) {
		// eslint-disable-next-line no-alert
		return window.confirm(msg);
	}
	return false; // Default to cancel in service worker
};

/**
 * @param  {string} msg
 */
Foxtrick.alert = function(msg) {
	// MV3: Dialogs not available in service workers
	if (typeof window !== 'undefined' && window.alert) {
		// eslint-disable-next-line no-alert
		window.alert(msg);
	}
	else {
		// Log in service worker context
		console.log('Alert:', msg);
	}
};

/**
 * @param  {string} str
 * @return {string}
 */
Foxtrick.encodeBase64 = function(str) {
	// MV3: btoa is available on self in service workers
	return self.btoa(unescape(encodeURIComponent(str)));
};

/**
 * @param  {string} str
 * @return {string}
 */
Foxtrick.decodeBase64 = function(str) {
	try {
		// MV3: atob is available on self in service workers
		return decodeURIComponent(escape(self.atob(str)));
	}
	catch (e) {
		Foxtrick.log('Error decoding base64 encoded string', str, e);
		return null;
	}
};

/**
 * Save an array of arrays of bytes/chars as a file.
 *
 * Default name: foxtrick.txt
 * Default mime: text/plain;charset=utf-8'
 * @param {document}   doc
 * @param {BlobPart[]} arr  array of arrays of bytes/chars
 * @param {string}     name file name
 * @param {string}     mime mime type + charset
 */
Foxtrick.saveAs = function(doc, arr, name, mime) {
	/** @type {unknown} */
	let global = doc.defaultView;
	let win = /** @type {typeof globalThis} */ (global);
	let blob = new win.Blob(arr, { type: mime || 'text/plain;charset=utf-8' });
	let url = win.URL.createObjectURL(blob);
	let link = doc.createElement('a');
	link.href = url;
	link.download = name || 'foxtrick.txt';
	link.dispatchEvent(new MouseEvent('click'));
};

/**
 * requestAnimationFrame wrapper
 * Finds rAF and attaches cb callback to it
 * Ensures $this in cb refers to the window
 * @param  {Window}   win
 * @param  {function} cb
 */
Foxtrick.rAF = function(win, cb) {
	if (typeof win !== 'object') {
		Foxtrick.log(new Error('rAF needs a window!'));
		return;
	}
	var rAF = win.requestAnimationFrame;
	if (typeof rAF !== 'function') {
		Foxtrick.log(new Error('No rAF defined!'));
		return;
	}
	if (typeof cb !== 'function') {
		Foxtrick.log(new Error('rAF needs a callback!'));
		return;
	}

	rAF.call(win, function() {
		try {
			cb.call(win);
		}
		catch (e) {
			Foxtrick.log('Error in callback for rAF', e);
		}
	});
};

/**
 * @param  {number}  type
 * @param  {boolean} [negative]
 * @return {string}             url
 */
Foxtrick.getSpecialtyImagePathFromNumber = function(type, negative) {
	let base = Foxtrick.InternalPath + 'resources/img/matches/spec';
	let url = base + type;
	if (negative)
		url += '_red';

	return url + '.png';
};

/**
 * Given a number in decimal representation, returns its roman representation
 * Source: http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
 *
 * @param  {number} num
 * @return {string}
 */
Foxtrick.decToRoman = function(num) {
	if (isNaN(num))
		return '';

	const KEY = [
		'',
		'C',
		'CC',
		'CCC',
		'CD',
		'D',
		'DC',
		'DCC',
		'DCCC',
		'CM',
		'',
		'X',
		'XX',
		'XXX',
		'XL',
		'L',
		'LX',
		'LXX',
		'LXXX',
		'XC',
		'',
		'I',
		'II',
		'III',
		'IV',
		'V',
		'VI',
		'VII',
		'VIII',
		'IX',
	];

	let str = Number(num).toString();
	let digits = str.split('').map(d => Number(d));
	if (str[0] == '-')
		digits.shift();

	let roman = [];
	let i = 3;
	while (i--)
		roman.unshift(KEY[digits.pop() + i * 10] || '');

	let ct = parseInt(digits.join(''), 10);
	roman.unshift('M'.repeat(ct));

	if (str[0] == '-')
		roman.unshift('-');

	return roman.join('');
};
