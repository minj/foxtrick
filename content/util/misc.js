'use strict';
/*
 * misc.js
 * Miscellaneous utilities
 */

if (!Foxtrick)
	var Foxtrick = {};

// global change listener.
(function() {
	var waitForChanges = function(changes) {
		var doc = changes[0].ownerDocument;
		Foxtrick.stopListenToChange(doc);
		Foxtrick.entry.change(doc, changes);
		Foxtrick.startListenToChange(doc);
	};

	Foxtrick.startListenToChange = function(doc) {
		if (!Foxtrick.isHt(doc))
			return;

		// must store MO on contentWindow
		// otherwise it's killed by Firefox's GC
		var win = doc.defaultView;
		var obs = win._FoxtrickObserver;
		if (obs) {
			obs.reconnect();
		}
		else {
			var content = doc.getElementById('content');
			win._FoxtrickObserver = Foxtrick.getChanges(content, waitForChanges);
			win.addEventListener('beforeunload', function(ev) {
				if (this._FoxtrickObserver)
					delete this._FoxtrickObserver;
			});
		}
	};

	Foxtrick.stopListenToChange = function(doc) {
		var win = doc.defaultView;
		var obs = win._FoxtrickObserver;
		if (obs)
			obs.disconnect();
	};

	Foxtrick.preventChange = function(doc, func) {
		return function() {
			Foxtrick.stopListenToChange(doc);
			func.apply(this, arguments);
			Foxtrick.startListenToChange(doc);
		};
	};
})();

/**
 * Try playing an audio url
 * @param  {document} doc
 * @param  {string} url
 */
Foxtrick.playSound = function(url) {
	var play = function(url, type, volume) {
		try {
			var music = new Audio();
			var canPlay = music.canPlayType('audio/' + type);
			Foxtrick.log('can play', type, ':', canPlay === '' ? 'no' : canPlay);

			if (canPlay === 'no')
				return;

			music.src = url;

			// try overwrite mime type (in case server says wrongly
			// it's a generic application/octet-stream)
			music.type = 'audio/' + type;
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
	url = url.replace(/^foxtrick:\/\//, Foxtrick.ResourcePath);

	var type = 'wav';
	if (url.indexOf('data:audio/') === 0) {
		var dataURLRe = /data:audio\/(.+);/;
		if (!dataURLRe.test(url)) {
			Foxtrick.log('Bad data URL:', url);
			return;
		}

		type = dataURLRe.exec(url)[1];
	}
	else {
		var extRe = /\.([^\.]+)$/;
		if (!extRe.test(url)) {
			Foxtrick.log('Not a sound file:', url);
			return;
		}

		type = extRe.exec(url)[1];
	}

	var volume = (parseInt(Foxtrick.Prefs.getString('volume'), 10) || 100) / 100;
	Foxtrick.log('play', volume, url.slice(0, 100));

	play(url, type, volume);
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
 * @param {string}   copy {string|function}
 * @param {string}   mime {string?}
 */
Foxtrick.copy = function(doc, copy, mime) {
	if (Foxtrick.platform == 'Safari') {
		// FIXME needs testing
		Foxtrick.sessionSet('clipboard', copy);
		Foxtrick.error('Safari copying is untested');
		return;
	}

	const DEFAULT_MIME = 'text/plain';
	var contentMime = null;
	var copyContent;

	if (typeof copy === 'function') {
		var ret = copy();
		if (ret && typeof ret === 'object') {
			contentMime = ret.mime || null;
			copyContent = ret.content;
		}
		else {
			copyContent = ret;
		}
	}
	else {
		contentMime = mime || null;
		copyContent = copy;
	}

	doc.addEventListener('copy', function (ev) {

		ev.clipboardData.setData(DEFAULT_MIME, copyContent);
		if (contentMime)
			ev.clipboardData.setData(contentMime, copyContent);
		ev.preventDefault();

	}, { once: true });

	doc.execCommand('Copy', false, null);
};

Foxtrick.newTab = function(url) {
	var tab;

	if (Foxtrick.context === 'content') {
		Foxtrick.SB.ext.sendRequest({ req: 'newTab', url: url });
	}
	else if (Foxtrick.platform == 'Firefox') {
		tab = window.gBrowser.addTab(url);
		window.gBrowser.selectedTab = tab;
		return tab;
	}
	else if (Foxtrick.platform == 'Android') {
		tab = window.BrowserApp.addTab(url);
		window.BrowserApp.selectedTab = tab;
		return tab;
	}
};

Foxtrick.XML_evaluate = function(xmlresponse, basenodestr, labelstr,
                                 valuestr, value2str, value3str) {
	var result = [];
	if (xmlresponse) {
		//var nodes = xmlresponse.evaluate(basenodestr, xmlresponse, null, 7 , null);
		var splitpath = basenodestr.split(/\/|\[/g);
		var base = xmlresponse;
			for (var j = 0; j < splitpath.length - 1; ++j) {
				base = base.getElementsByTagName(splitpath[j])[0];
			}
		var nodes = base.getElementsByTagName(splitpath[j]);
		for (var i = 0; i < nodes.length; i++) {
		//for (var i = 0; i < nodes.snapshotLength; i++) {
			//var node = nodes.snapshotItem(i);
			var node = nodes[i];
			var label = node.getAttribute(labelstr);
			var value = null;
			var value2 = null;
			var value3 = null;

			if (valuestr) value = node.getAttribute(valuestr);
			if (value2str) value2 = node.getAttribute(value2str);
			if (value3str) value3 = node.getAttribute(value3str);

			if (valuestr)
				result.push([label, value, value2, value3]);
			else
				result.push(label);
		}
	}
	return result;
};

Foxtrick.xml_single_evaluate = function(xmldoc, path, attribute) {
	var obj = xmldoc.evaluate(path, xmldoc, null, xmldoc.DOCUMENT_NODE, null).singleNodeValue;
	if (obj) {
		if (attribute)
			return obj.attributes.getNamedItem(attribute).textContent;
		else
			return obj;
	}
	else
		return null;
};

Foxtrick.lazyProp(Foxtrick, 'version', function() {
	// get rid of user-imported value
	Foxtrick.Prefs.deleteValue('version');
	return Foxtrick.Prefs.getString('version');
});

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

Foxtrick.getHref = function(doc) {
	return doc.location.href;
};

Foxtrick.getParameterFromUrl = function(url, param) {
	param = param.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
	var regexS = '[\\?&]' + param + '=([^&#]*)';
	var regex = new RegExp(regexS, 'i');
	var results = regex.exec(url);
	if (results == null)
		return null;
	else
		return decodeURIComponent(results[1]);
};

Foxtrick.isHt = function(doc) {
	return (Foxtrick.getPanel(doc) !== null)
		&& (doc.getElementById('aspnetForm') !== null);
};

Foxtrick.isHtUrl = function(url) {
	var htMatches = [
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
	return Foxtrick.any(function(re) { return re.test(url); }, htMatches);
};

Foxtrick.isStage = function(doc) {
	var stage_regexp = /^https?:\/\/stage\.hattrick\.org(\/|$)/i;
	return stage_regexp.test(Foxtrick.getHref(doc));
};

Foxtrick.isLoginPage = function(doc) {
	var teamLinks = doc.getElementById('teamLinks');
	if (teamLinks === null)
		return true;
	if (teamLinks.getElementsByTagName('a').length === 0)
		return true;

	return false;
};

Foxtrick.getPanel = function(doc) {
	try {
		if (doc.getElementsByClassName('hattrick').length > 0)
			return doc.getElementsByClassName('hattrick')[0];
		else if (doc.getElementsByClassName('hattrickNoSupporter').length > 0)
			return doc.getElementsByClassName('hattrickNoSupporter')[0];
		else
			return null;
	}
	catch (e) {
		return null;
	}
};

/**
 * Test whether object obj has a property prop
 *
 * Deals with non-objects and null.
 * Traverses prototype chain.
 *
 * @param  {object}  obj
 * @param  {string}  prop
 * @return {Boolean}
 */
Foxtrick.hasProp = function(obj, prop) {
	return obj != null && typeof obj === 'object' && prop in obj;
};

/**
 * Test whether object obj is a simple key-value map
 *
 * @param  {object}  obj
 * @return {Boolean}
 */
Foxtrick.isMap = function(obj) {
	return obj != null && Object.getPrototypeOf(obj) == Object.prototype;
};

/**
 * Test whether object obj is an array-like
 *
 * @param  {object}  obj
 * @return {Boolean}
 */
Foxtrick.isArrayLike = function(obj) {
	return Foxtrick.hasProp(obj, 'length');
};

/**
 * Copy all members from modified to original.
 * Modifies original.
 * @param {object} original
 * @param {object} modified
 */
Foxtrick.mergeAll = function(original, modified) {
	if (original && typeof original === 'object' &&
	    modified && typeof modified === 'object') {
		for (var mem in modified) {
			if (modified.hasOwnProperty(mem)) {
				original[mem] = modified[mem];
			}
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
	if (original && typeof original === 'object' &&
	    modified && typeof modified === 'object') {
		for (var mem in original) {
			if (modified.hasOwnProperty(mem)) {
				original[mem] = modified[mem];
			}
		}
	}
};

Foxtrick.setLastPage = function(host) {
	Foxtrick.Prefs.setString('last-page', String(host));
};

Foxtrick.getLastPage = function(host) {
	return Foxtrick.Prefs.getString('last-page') || 'http://www.hattrick.org';
};

/** Insert text in given textarea at the current position of the cursor */
Foxtrick.insertAtCursor = function(textarea, text) {
	textarea.value = textarea.value.substring(0, textarea.selectionStart) + text +
		textarea.value.substring(textarea.selectionEnd, textarea.value.length);
	textarea.dispatchEvent(new Event('input'));
};

Foxtrick.confirmDialog = function(msg) {
	if (Foxtrick.arch === 'Gecko') {
		return Services.prompt.confirm(null, null, msg);
	}
	else {
		return window.confirm(msg);
	}
};

Foxtrick.alert = function(msg) {
	if (Foxtrick.arch === 'Gecko') {
		Services.prompt.alert(null, null, msg);
	}
	else {
		window.alert(msg);
	}
};

// only gecko
Foxtrick.reloadAll = function() {
	// reload ht tabs
	if (Foxtrick.platform == 'Firefox') {
		var browserEnumerator = Services.wm.getEnumerator('navigator:browser');

		// Check each browser instance for our URL
		while (browserEnumerator.hasMoreElements()) {
			var browserWin = browserEnumerator.getNext();
			var tabbrowser = browserWin.getBrowser();

			// Check each tab of this browser instance
			var numTabs = tabbrowser.browsers.length;
			for (var index = 0; index < numTabs; index++) {
				var currentBrowser = tabbrowser.getBrowserAtIndex(index);
				var url = currentBrowser.currentURI.spec;
				if (Foxtrick.isHtUrl(url)) {
					currentBrowser.reload();
					Foxtrick.log('reload: ', url);
				}
				else if (/^chrome:\/\/foxtrick/.test(url)) {
					currentBrowser.contentWindow.close();
					index--;
					numTabs--;
				}
			}
		}
	}
};


// gecko: find first occurence of host and open+focus there
Foxtrick.openAndReuseOneTabPerURL = function(url, reload) {
	try {
		var host = url.match(/(http:\/\/[a-zA-Z0-9_.-]+)/)[1];

		var browserEnumerator = Services.wm.getEnumerator('navigator:browser');

		// Check each browser instance for our URL
		var found = false;
		while (!found && browserEnumerator.hasMoreElements()) {
			var browserWin = browserEnumerator.getNext();
			var tabbrowser = browserWin.getBrowser();

			// Check each tab of this browser instance
			var numTabs = tabbrowser.browsers.length;
			for (var index = 0; index < numTabs; index++) {
				var currentBrowser = tabbrowser.getBrowserAtIndex(index);
				Foxtrick.log('tab: ', currentBrowser.currentURI.spec, ' is searched url: ', host,
				             ' = ' + (currentBrowser.currentURI.spec.search(host) != -1));
				if (currentBrowser.currentURI.spec.search(host) != -1) {
					// The URL is already opened. Select this tab.
					tabbrowser.selectedTab = tabbrowser.mTabs[index];

					// Focus *this* browser-window
					browserWin.focus();
					if (reload) {
						browserWin.loadURI(url);
						Foxtrick.log('reload: ', url);
					}
					found = true;
					break;
				}
			}
		}

		// Our URL isn't open. Open it now.
		if (!found) {
			var recentWindow = Services.wm.getMostRecentWindow('navigator:browser');
			if (recentWindow) { //Foxtrick.log('open recentWindow: ',url);
				// Use an existing browser window
				recentWindow.delayedOpenTab(url, null, null, null, null);
			}
			else {
				Foxtrick.log('open new window: ', url);
				// No browser windows are open, so open a new one.
				window.open(url);
			}
		}
	}
	catch (e) { Foxtrick.log(e); }
};
Foxtrick.encodeBase64 = function(str) {
	return window.btoa(unescape(encodeURIComponent(str)));
};

Foxtrick.decodeBase64 = function(str) {
	try {
		return decodeURIComponent(escape(window.atob(str)));
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
 * @param {document} doc
 * @param {array}    arr  array of arrays of bytes/chars
 * @param {string}   name file name
 * @param {string}   mime mime type + charset
 */
Foxtrick.saveAs = function(doc, arr, name, mime) {
	var win = doc.defaultView;
	var blob = new win.Blob(arr, { type: mime || 'text/plain;charset=utf-8' });
	var url = win.URL.createObjectURL(blob);
	var link = doc.createElement('a');
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
		Foxtrick.error('rAF needs a window!');
		return;
	}
	var rAF = win.requestAnimationFrame || win.mozRequestAnimationFrame ||
		win.webkitRequestAnimationFrame;
	if (typeof rAF !== 'function') {
		Foxtrick.error('No rAF defined!');
		return;
	}
	if (typeof cb !== 'function') {
		Foxtrick.error('rAF needs a callback!');
		return;
	}
	rAF(function() {
		try {
			cb.bind(win)();
		}
		catch (e) {
			Foxtrick.log('Error in callback for rAF', e);
		}
	});
};


Foxtrick.getSpecialtyImagePathFromNumber = function(type, negative) {
	var base = Foxtrick.InternalPath + 'resources/img/matches/spec';
	var url = base + type;
	if (negative)
		url = url + '_red';

	if (Foxtrick.Prefs.getBool('anstoss2icons'))
		url = url + '_alt';

	return url + '.png';
};
