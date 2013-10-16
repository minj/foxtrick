'use strict';
/*
 * misc.js
 * Miscellaneous utilities
 */

if (!Foxtrick) var Foxtrick = {};

// global change listener.
// uses setTimout to queue the change function call after
// all current DOMNodeInserted events have passed.
(function() {
	var changeQueued = false;

	var waitForChanges = function(ev) {
		// we ignore further events
		if (changeQueued)
			return;

		// first call. queue our change function call
		changeQueued = true;
		Foxtrick.stopListenToChange(ev.target.ownerDocument);
		window.setTimeout(function() {
			// all events have passed. run change function now and restart listening to changes
			Foxtrick.entry.change(ev);
			Foxtrick.startListenToChange(ev.target.ownerDocument);
			changeQueued = false;
		}, 0);
	};

	Foxtrick.startListenToChange = function(doc) {
		if (!Foxtrick.isHt(doc))
			return;
		var content = doc.getElementById('content');
		content.addEventListener('DOMNodeInserted', waitForChanges, true);
	};

	Foxtrick.stopListenToChange = function(doc) {
		var content = doc.getElementById('content');
		content.removeEventListener('DOMNodeInserted', waitForChanges, true);
	};

	Foxtrick.preventChange = function(doc, func) {
		return function() {
			Foxtrick.stopListenToChange(doc);
			func.apply(this, arguments);
			Foxtrick.startListenToChange(doc);
		};
	};
})();


// Play the sound with URL given as parameter.
// Gecko only supports WAV format at the moment.
// May throw an error if unable to play the sound.
Foxtrick.playSound = function(url, doc) {
	try {
		url = url.replace(/^foxtrick:\/\//, Foxtrick.ResourcePath);
		var type = 'wav';
		if (url.indexOf('data:audio') == 0)
			type = url.match(/data:audio\/(.+);/)[1];
		else
			type = url.match(/.+\.([^\.]+)$/)[1];
		Foxtrick.log('play: ' + url.substring(0, 100));
		//if (Foxtrick.arch === 'Gecko' && url.indexOf('chrome') === 0) {
		//	try {
		//		Foxtrick.log('using ff soundService for chrome url ', url);
		//		var soundService = Components.classes['@mozilla.org/sound;1']
		//			.getService(Components.interfaces.nsISound);
		//		var ioService = Components.classes['@mozilla.org/network/io-service;1']
		//			.getService(Components.interfaces.nsIIOService);
		//		soundService.play(ioService.newURI(url, null, null));
		//		return;
		//	} catch (e) {
		//		Foxtrick.log("ff soundService can't play ", url);
		//	}
		//}
		try {
			var music = new Audio();
			var canPlay = music.canPlayType('audio/' + type);
			Foxtrick.log('can play ' + type + ':' + (canPlay == '' ? 'no' : canPlay));
			if (canPlay == 'maybe' || canPlay == 'probably') {
					music.src = url;
					// try overwrite mime type (in case server says wrongly
					// it's a generic application/octet-stream)
					music.type = 'audio/' + type;
					music.play();
			}
			else {
				Foxtrick.log('try embeded using plugin');
				var videoElement = doc.createElement('embed');
				videoElement.setAttribute('style', 'visibility:hidden');
				videoElement.setAttribute('width', '1');
				videoElement.setAttribute('height', '1');
				videoElement.setAttribute('autoplay', 'true');
				videoElement.setAttribute('type', 'audio/' + type);
				videoElement.setAttribute('src', url);
				doc.getElementsByTagName('body')[0].appendChild(videoElement);
				/*
				flash need media/OriginalMusicPlayer.swf shipped i guess
				var videoElement = doc.createElement('object');
				videoElement.setAttribute('style','visibility:hidden');
				videoElement.setAttribute('width','1');
				videoElement.setAttribute('height','1');
				videoElement.setAttribute('autoplay', 'true');
				videoElement.setAttribute('type', 'application/x-shockwave-flash');
				videoElement.setAttribute('data', 'media/OriginalMusicPlayer.swf');
				var param = doc.createElement('param');
				param.setAttribute('name', 'movie');
				param.setAttribute('value', 'media/OriginalMusicPlayer.swf');
				videoElement.appendChild(param);
				var param = doc.createElement('param');
				param.setAttribute('name', 'FlashVars');
				param.setAttribute('value', 'mediaPath='+url);
				videoElement.appendChild(param);
				doc.getElementsByTagName('body')[0].appendChild(videoElement);*/
			}
		} catch (e) {
			if (Foxtrick.chromeContext() == 'content') {
				// via background since internal sounds might not be acessible
				// from the html page itself
				sandboxed.extension.sendRequest({req: 'playSound', url: url});
			}
			else
			{
				Foxtrick.log(e, '\ntry play with audio tag in document');
				var music = doc.createElement('audio');
				music.setAttribute('autoplay', 'autoplay');
				var source = doc.createElement('source');
				source.setAttribute('src', url);
				source.setAttribute('type', 'audio/' + type);
				music.appendChild(source);
				doc.getElementsByTagName('body')[0].appendChild(music);
			}
		}
	} catch (e) {
		Foxtrick.log('Cannot play sound: ', url.substring(0, 100));
		Foxtrick.log(e);
	}
};

Foxtrick.copyStringToClipboard = function(string) {
	if (Foxtrick.arch === 'Gecko') {
		if (Foxtrick.chromeContext() === 'content') {
			sandboxed.extension.sendRequest({ req: 'clipboard', content: string });
		}
		else {
			var gClipboardHelper = Components
				.classes['@mozilla.org/widget/clipboardhelper;1']
				.getService(Components.interfaces.nsIClipboardHelper);
			gClipboardHelper.copyString(string);
		}
	}
	else if (Foxtrick.platform == 'Opera' || Foxtrick.platform == 'Safari') {
		Foxtrick.sessionSet('clipboard', string);
	}
	else if (Foxtrick.arch === 'Sandboxed') {
		if (Foxtrick.chromeContext() == 'content')
			sandboxed.extension.sendRequest({ req: 'clipboard', content: string });
		else {
			if (Foxtrick.platform == 'Chrome')
				Foxtrick.loader.background.copyToClipBoard(string);
			else
				Foxtrick.copyStringToClipboard(string);
		}
	}
};

Foxtrick.newTab = function(url) {
	if (Foxtrick.chromeContext() === 'content') {
		sandboxed.extension.sendRequest({
			req: 'newTab',
			url: url
		});
	}
	else if (Foxtrick.platform == 'Firefox')
		window.gBrowser.selectedTab = window.gBrowser.addTab(url);
	else if (Foxtrick.platform == 'Mobile')
		Browser.addTab(url, true, null, { 'getAttention': true });
	else if (Foxtrick.platform == 'Android')
		BrowserApp.addTab(url);
};

/*
 * @desc return an XML file parsed from given text
 */
Foxtrick.parseXml = function(text) {
	var parser = new window.DOMParser();
	var xml = parser.parseFromString(text, 'text/xml');
	return xml;
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

Foxtrick.version = function() {
	// get rid of user-imported value
	FoxtrickPrefs.deleteValue('version');
	return FoxtrickPrefs.getString('version');
};

Foxtrick.branch = function() {
	// get rid of user-imported value
	FoxtrickPrefs.deleteValue('branch');
	return FoxtrickPrefs.getString('branch');
};

Foxtrick.isPageHref = function(page, href) {
	var htpage_regexp = new RegExp(page.replace(/\./g, '\\.').replace(/\?/g, '\\?'), 'i');
	return href.replace(/#.+/, '').search(htpage_regexp) > -1;
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
		return results[1];
};

Foxtrick.isHt = function(doc) {
	return (Foxtrick.getPanel(doc) !== null)
		&& (doc.getElementById('aspnetForm') !== null);
};

Foxtrick.isHtUrl = function(url) {
	var htMatches = [
		new RegExp('^http://hattrick\.org(/|$)', 'i'),
		new RegExp('^http://www\\d{2}\.hattrick\.org(/|$)', 'i'),
		new RegExp('^http://stage\.hattrick\.org(/|$)', 'i'),
		new RegExp('^http://www\\d{2}\.hattrick\.interia\.pl(/|$)', 'i'),
		new RegExp('^http://www\\d{2}\.hattrick\.uol\.com\.br(/|$)', 'i'),
		new RegExp('^http://www\\d{2}\.hattrick\.ws(/|$)', 'i'),
		new RegExp('^http://www\\d{2}\.hat-trick\.net(/|$)', 'i'),
		new RegExp('^http://www\\d{2}\.hattrick\.name(/|$)', 'i'),
		new RegExp('^http://www\\d{2}\.hattrick\.fm(/|$)', 'i'),
	];
	return Foxtrick.any(function(re) { return url.match(re) != null; }, htMatches);
};

Foxtrick.isStage = function(doc) {
	var stage_regexp = /http:\/\/stage\.hattrick\.org/i;
	return (Foxtrick.getHref(doc).search(stage_regexp) > -1);
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

Foxtrick.setLastHost = function(host) {
	FoxtrickPrefs.setString('last-host', String(host));
};

Foxtrick.getLastHost = function(host) {
	return FoxtrickPrefs.getString('last-host') || 'http://www.hattrick.org';
};

Foxtrick.setLastPage = function(host) {
	FoxtrickPrefs.setString('last-page', String(host));
};

Foxtrick.getLastPage = function(host) {
	return FoxtrickPrefs.getString('last-page') || 'http://www.hattrick.org';
};

/** Insert text in given textarea at the current position of the cursor */
Foxtrick.insertAtCursor = function(textarea, text) {
	textarea.value = textarea.value.substring(0, textarea.selectionStart)
		+ text
		+ textarea.value.substring(textarea.selectionEnd, textarea.value.length);
};

Foxtrick.confirmDialog = function(msg) {
	if (Foxtrick.arch === 'Gecko') {
		var promptService = Components.classes['@mozilla.org/embedcomp/prompt-service;1']
			.getService(Components.interfaces.nsIPromptService);
		return promptService.confirm(null, null, msg);
	}
	else {
		return window.confirm(msg);
	}
};

Foxtrick.alert = function(msg) {
	if (Foxtrick.arch === 'Gecko') {
		var promptService = Components.classes['@mozilla.org/embedcomp/prompt-service;1']
			.getService(Components.interfaces.nsIPromptService);
		return promptService.alert(null, null, msg);
	}
	else {
		window.alert(msg);
	}
};

// only gecko
Foxtrick.reloadAll = function() {
	// reload ht tabs
	if (Foxtrick.platform == 'Firefox') {
		var wm = Components.classes['@mozilla.org/appshell/window-mediator;1']
							 .getService(Components.interfaces.nsIWindowMediator);
		var browserEnumerator = wm.getEnumerator('navigator:browser');

		// Check each browser instance for our URL
		while (browserEnumerator.hasMoreElements()) {
			var browserWin = browserEnumerator.getNext();
			var tabbrowser = browserWin.getBrowser();

			// Check each tab of this browser instance
			var numTabs = tabbrowser.browsers.length;
			for (var index = 0; index < numTabs; index++) {
				var currentBrowser = tabbrowser.getBrowserAtIndex(index);
				if (Foxtrick.isHtUrl(currentBrowser.currentURI.spec)) {
					currentBrowser.reload();
					Foxtrick.log('reload: ', currentBrowser.currentURI.spec);
				}
			}
		}
	}
};


// gecko: find first occurence of host and open+focus there
Foxtrick.openAndReuseOneTabPerURL = function(url, reload) {
	try {
		var host = url.match(/(http:\/\/[a-zA-Z0-9_.-]+)/)[1];

		var wm = Components.classes['@mozilla.org/appshell/window-mediator;1']
						 .getService(Components.interfaces.nsIWindowMediator);
		var browserEnumerator = wm.getEnumerator('navigator:browser');

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
			var recentWindow = wm.getMostRecentWindow('navigator:browser');
			if (recentWindow) { //Foxtrick.log('open recentWindow: ',url);
				// Use an existing browser window
				recentWindow.delayedOpenTab(url, null, null, null, null);
			}
			else {
				Foxtrick.log('open new window: ', url);
				// No browser windows are open, so open a new one.
				// HT disabled window.open in favour of window.htOpen to try to compete bad ad vendors
				if(window.htOpen)
					window.htOpen(url);
				else
					window.open(url);
			}
		}
	}
	catch (e) { Foxtrick.log(e); }
};
/**
 * Convert HatStats to 0-based (default) or 1-based float level
 * solid (very low) = 6.0; non-existent = disastrous (very low) = 0.0
 * or solid (very low) = 7.0; non-existent = 0; disastrous (very low) = 1.0
 * @param	{Integer}	hs			HatStats
 * @param	{Boolean}	oneBased	return based on solid=7
 * @returns	{Number}				floating point level
 */
Foxtrick.hsToFloat = function(hs, oneBased) {
	var ret = parseInt(hs, 10);
	return ret ? (ret - 1) / 4 + (oneBased ? 1.0 : 0.0) : 0.0;
};
Foxtrick.encodeBase64 = function(str) {
	return window.btoa(unescape(encodeURIComponent(str)));
};

Foxtrick.decodeBase64 = function(str) {
	try {
		return decodeURIComponent(escape(window.atob(str)));
	} catch (e) {
		Foxtrick.log('Error decoding base64 encoded string', str, e);
		return null;
	}
};

Foxtrick.Math = {};
/**
 * Hyperbolic tangent (overflows ~700)
 * Returns [-1; 1]
 * @param	{Number}	x
 * @returns	{Number}
 */
Foxtrick.Math.tanh = function(x) {
	return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
};
/**
 * find the quotent for integer division a / b
 * @param	{Integer}	a
 * @param	{Integer}	b
 * @returns	{Integer}
 */
Foxtrick.Math.div = function(a, b) {
	return (a - a % b) / b;
};
