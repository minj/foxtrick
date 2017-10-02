'use strict';
/*
 * log.js
 * Debug log functions
 * @author ryanli, convincedd
 */

if (!Foxtrick)
	var Foxtrick = {};

/**
 * Log an error
 * @param  {string} err String to log. Will be converted into string if otherwise.
 */
Foxtrick.error = function(err) {
	Foxtrick.log(new Error(String(err)));
};


// outputs a list of strings/objects/errors to Foxtrick log
Foxtrick.log = function() {
	if (arguments.length < 2 && typeof arguments[0] === 'undefined')
		// useless logging
		return;

	// compile everything into a single string for trivial logging contexts
	var i, content, hasError = false, concated = '', item = '';
	for (i = 0; i < arguments.length; ++i) {
		content = arguments[i];
		if (content instanceof Error) {
			// exception
			hasError = true;
			if (Foxtrick.arch == 'Gecko') {
				// there also would be Components.stack if someone finds a nice way to display it
				item = content.message + '\n' +
					content.fileName + ': ' + content.lineNumber + '\n' +
					'Stack trace:\n' +
					content.stack.replace(/^.*@/g, ''); // strip function names
			}
			else if (Foxtrick.arch == 'Sandboxed') {
				item = content.message;
				if (typeof content.stack !== 'undefined')
					item += '\n' + content.stack;
			}
		}
		else if (typeof content !== 'string') {
			try {
				item = JSON.stringify(content);
			}
			catch (e) {
				item = String(content);
				var j;
				for (j in content)
					item += j + ':' + content[j] + '\n';
			}
		}
		else {
			item = content;
		}
		concated += ' ' + item;
	}
	concated += '\n';
	// add the compiled string to HTML log container
	Foxtrick.log.cache += concated;
	Foxtrick.log.flush();

	// store in debug storage (retrieved with forum debug log icon)
	if (Foxtrick.context == 'content')
		Foxtrick.SB.ext.sendRequest({ req: 'addDebugLog', log: concated });
	else {
		Foxtrick.addToDebugLogStorage(concated);
	}

	// Foxtrick.Prefs may not have loaded yet
	if (Foxtrick.Prefs && Foxtrick.Prefs.getBool('logDisabled'))
		return;

	if (typeof Firebug !== 'undefined' && typeof Firebug.Console !== 'undefined' &&
	    typeof Firebug.Console.log === 'function') {
		// if Firebug.Console.log is available, make use of it
		Firebug.Console.log(arguments);
	}
	if (typeof console !== 'undefined' && typeof console.log === 'function') {
		// if console.log is available, make use of it
		// for firefox it's in the webconsole (ctrl+shift+K) in preferences.html
		// and logging in the browser console (ctrl+shift+J)
		console.log.apply(console, arguments);
		if (hasError) {
			// print a nice stack trace for exceptions in the console
			var stackDumped = false;
			for (i = 0; i < arguments.length; ++i) {
				content = arguments[i];
				if (content instanceof Error && typeof content.stack !== 'undefined') {
					if (typeof console.error !== 'undefined')
						console.error(content.stack);
					else
						console.log(content.stack);
					stackDumped = true;
				}
			}
			if (!stackDumped && typeof console.trace === 'function')
				console.trace();
		}
	}
	if (Foxtrick.arch == 'Gecko') {
		// goes to JS->Log in the browser console (ctrl+shift+J)
		if (Foxtrick.platform == 'Android' && Foxtrick.context == 'content')
			// logging does not work particularly well in Fennec content
			Cu.reportError(new Error('Foxtrick: ' + concated));
		else
			Services.console.logStringMessage('Foxtrick: ' + concated);
	}
	if (typeof dump === 'function' && Foxtrick.Prefs.getBool('dump')) {
		// window.dump, a Gecko extension
		if (Foxtrick.context === 'background') {
			var lines = concated.split(/\n/);
			Foxtrick.forEach(function(l) {
				dump('FT: ' + l.substr(0, 500) + '\n');
			}, lines);
		}
		else {
			// send it via background since fennec doesn't show all dumps from content side
			Foxtrick.SB.ext.sendRequest({ req: 'log', log: concated });
		}
	}
};

// environment info shown in log as header
Foxtrick.log.header = function(doc) {
	var headString = 'Version %1, %2 platform, %3 locale, %4 layout, %5 direction'.
		replace(/%1/, Foxtrick.version + ' ' + Foxtrick.branch).
		replace(/%2/, Foxtrick.arch + ' ' + Foxtrick.platform).
		replace(/%3/, Foxtrick.Prefs.getString('htLanguage')).
		replace(/%4/, Foxtrick.util.layout.isStandard(doc) ? 'standard' : 'simple').
		replace(/%5/, Foxtrick.util.layout.isRtl(doc) ? 'RTL' : 'LTR');

	if (Foxtrick.isStage(doc))
		headString += ', Stage';

	return headString + '\n';
};

// cache log contents, will be flushed to page after calling
// Foxtrick.log.flush()
Foxtrick.log.cache = '';

// a reference to the last document element for flushing
// this is a potential memory leak,
// therefore it needs to be cleared onbeforeunload
Foxtrick.log.doc = null;

// print to HTML log, when doc is available
Foxtrick.log.flush = function(doc) {
	if (Foxtrick.platform !== 'Firefox' && Foxtrick.context === 'background')
		return;
	if (!Foxtrick.Prefs.getBool('DisplayHTMLDebugOutput'))
		return;

	if (!doc) {
		if (this.doc)
			doc = this.doc;
		else
			return;
	}
	else if (doc !== this.doc) {
		doc.defaultView.addEventListener('beforeunload', function(ev) {
			var doc = ev.target;
			if (Foxtrick.log.doc === doc)
				Foxtrick.log.doc = null;
		});
		this.doc = doc;
	}

	if (doc.getElementById('page') && Foxtrick.log.cache !== '') {
		var div = doc.getElementById('ft-log');
		var consoleDiv;
		if (!div) {
			// create log container
			div = doc.createElement('div');
			div.id = 'ft-log';
			var header = doc.createElement('h2');
			header.textContent = Foxtrick.L10n.getString('log.header');
			div.appendChild(header);
			consoleDiv = doc.createElement('pre');
			consoleDiv.id = 'ft-log-pre';
			consoleDiv.textContent = Foxtrick.log.header(doc);
			div.appendChild(consoleDiv);
			// add to page
			var bottom = doc.getElementById('bottom');
			if (bottom)
				bottom.parentNode.insertBefore(div, bottom);
		}
		else {
			consoleDiv = doc.getElementById('ft-log-pre');
		}
		// add to log
		consoleDiv.textContent += Foxtrick.log.cache;
		// clear the cache
		Foxtrick.log.cache = '';
	}
};

// debug log storage
// (retrieved with forum debug log icon)
Foxtrick.debugLogStorage = '';
Foxtrick.addToDebugLogStorage = function(text) {
	Foxtrick.debugLogStorage += text;
};

// a wrapper around Foxtrick.log for compatibility
Foxtrick.dump = function(content) {
	Foxtrick.log(String(content).replace(/\s+$/, ''));
};
