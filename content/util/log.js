/**
 * log.js
 * Debug log functions
 * @author ryanli, convincedd
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	// @ts-ignore
	var Foxtrick = {};
/* eslint-enable */

/**
 * Log an error
 *
 * TODO allow varargs
 *
 * @param {string} err String to log. Will be converted into string if otherwise.
 */
Foxtrick.error = function(err) {
	Foxtrick.log(new Error(String(err)));
};


/**
 * outputs a list of strings/objects/errors to Foxtrick log
 *
 * @param {*[]} args
 */
// eslint-disable-next-line complexity
Foxtrick.log = function(...args) {
	if (args.length < 2 && typeof args[0] === 'undefined') {
		// useless logging
		return;
	}

	// compile everything into a single string for trivial logging contexts
	var hasError = false, concated = '';
	for (let content of args) {
		let item = '';
		if (content instanceof Error) {
			// exception
			hasError = true;
			if (Foxtrick.arch == 'Sandboxed') {
				item = content.message;
				if (typeof content.stack !== 'undefined')
					item += '\n' + content.stack;
			}
		}
		else if (typeof content == 'string') {
			item = content;
		}
		else {
			try {
				item = JSON.stringify(content);
			}
			catch (e) {
				item = String(content);
				for (let [k, v] of Object.entries(content))
					item += `${k}:${v}\n`;
			}
		}
		concated += ` ${item}`;
	}

	concated += '\n';

	// add the compiled string to HTML log container
	Foxtrick.log.cache += concated;
	Foxtrick.log.flush();

	// store in debug storage (retrieved with forum debug log icon)
	if (Foxtrick.context == 'content')
		Foxtrick.SB.ext.sendRequest({ req: 'addDebugLog', log: concated });
	else
		Foxtrick.addToDebugLogStorage(concated);

	// Foxtrick.Prefs may not have loaded yet
	if (Foxtrick.Prefs && Foxtrick.Prefs.getBool('logDisabled'))
		return;

	/* eslint-disable no-console */
	if (typeof console !== 'undefined' && typeof console.log === 'function') {
		// if console.log is available, make use of it
		// for firefox it's in the webconsole (ctrl+shift+K) in preferences.html
		// and logging in the browser console (ctrl+shift+J)
		console.log(...args);
		if (!hasError)
			return;

		// print a nice stack trace for exceptions in the console
		let stackDumped = false;
		for (let content of args) {
			if (content instanceof Error && typeof content.stack !== 'undefined') {
				if (typeof console.error == 'undefined')
					console.log(content.stack);
				else
					console.error(content.stack);

				stackDumped = true;
			}
		}

		if (!stackDumped && typeof console.trace === 'function')
			console.trace();

	}
	/* eslint-enable no-console */
};

/**
 * environment info shown in log as header
 *
 * @param  {document} doc
 * @return {string}
 */
Foxtrick.log.header = function(doc) {
	const INFO = [
		Foxtrick.version + ' ' + Foxtrick.branch,
		Foxtrick.arch + ' ' + Foxtrick.platform,
		Foxtrick.Prefs.getString('htLanguage'),
		Foxtrick.util.layout.isStandard(doc) ? 'standard' : 'simple',
		Foxtrick.util.layout.isRtl(doc) ? 'RTL' : 'LTR',
		Foxtrick.isStage(doc) ? ', Stage' : '',
	];
	var h = 'Version {}, {} platform, {} locale, {} layout, {} direction{}\n';
	return Foxtrick.format(h, INFO);
};

/**
 * cache log contents, will be flushed to page after calling Foxtrick.log.flush()
 *
 * @type {string}
 */
Foxtrick.log.cache = '';

/**
 * a reference to the last document element for flushing
 *
 * this is a potential memory leak,
 * therefore it needs to be cleared onbeforeunload
 *
 * @type {document}
 */
Foxtrick.log.doc = null;

/**
 * print to HTML log, when doc is available
 *
 * @param {document} [document]
 */
Foxtrick.log.flush = function(document) {
	if (Foxtrick.platform !== 'Firefox' && Foxtrick.context === 'background')
		return;
	if (!Foxtrick.Prefs.getBool('DisplayHTMLDebugOutput'))
		return;

	var doc = document;
	if (!doc) {
		if (this.doc)
			doc = this.doc;
		else
			return;
	}
	else if (doc !== this.doc) {
		this.doc = doc;
		doc.defaultView.addEventListener('beforeunload', function(ev) {
			if (Foxtrick.log.doc === ev.target)
				Foxtrick.log.doc = null;
		});
	}

	if (!doc.getElementById('page') || Foxtrick.log.cache === '')
		return;

	var div = doc.getElementById('ft-log');
	var consoleDiv;
	if (div) {
		consoleDiv = doc.getElementById('ft-log-pre');
	}
	else {
		// create log container
		div = doc.createElement('div');
		div.id = 'ft-log';
		let header = doc.createElement('h2');
		header.textContent = Foxtrick.L10n.getString('log.header');
		div.appendChild(header);
		consoleDiv = doc.createElement('pre');
		consoleDiv.id = 'ft-log-pre';
		consoleDiv.textContent = Foxtrick.log.header(doc);
		div.appendChild(consoleDiv);

		// add to page
		let bottom = doc.getElementById('bottom');
		if (bottom)
			bottom.parentNode.insertBefore(div, bottom);
	}

	// add to log
	consoleDiv.textContent += Foxtrick.log.cache;

	// clear the cache
	Foxtrick.log.cache = '';
};

/**
 * debug log storage
 *
 * (retrieved with forum debug log icon)
 *
 * @type {string}
 */
Foxtrick.debugLogStorage = '';

/**
 * @param {string} text
 */
Foxtrick.addToDebugLogStorage = function(text) {
	Foxtrick.debugLogStorage += text;
};

/**
 * a wrapper around Foxtrick.log for compatibility
 *
 * @deprecated
 * @param {*} content
 */
Foxtrick.dump = function(content) {
	Foxtrick.log(String(content).trim());
};
