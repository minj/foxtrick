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
	Foxtrick.log(new Error('' + err));
};


// outputs a list of strings/objects/errors to FoxTrick log
Foxtrick.log = function() {
	try {
		if (Foxtrick.Prefs.getBool('logDisabled'))
			return;
	} catch (e) {}

	var i, concated = '', hasError = false;
	var args = Array.prototype.slice.apply(arguments);
	if (args.length < 2 && typeof args[0] === 'undefined')
		return;
	for (i = 0; i < arguments.length; ++i) {
		var content = arguments[i];
		var item = '';
		if (content instanceof Error) {
			hasError = true;
			if (Foxtrick.arch == 'Gecko') {
				// there also would be Components.stack if someone finds a nice way to display it
				item = content.message + '\n'
					+ content.fileName + ': ' + content.lineNumber + '\n'
					+ 'Stack trace:\n'
					+ content.stack;
				item = item.replace(/.+@/g, '');
				// readability. the place/object doesn't get shown for me in a readable way
				// in any console i tried
				// goes to the error console ctrl+shift+j
				Components.utils.reportError(item);
			}
			else if (Foxtrick.arch == 'Sandboxed') {
				item = content.message;
				if (typeof (content.stack) != 'undefined')
					item += '\n' + content.stack;
				if (args[i].arguments) {
					args[i] = args[i].arguments.concat(args[i]);
				}
			}
		}
		else if (typeof(content) != 'string') {
			try {
				item = JSON.stringify(content);
				if (item == '{}' && typeof(content) == 'object') {
					// stringify didn't work as intented
					var j;
					for (j in content)
						item += j + ':' + content[j] + '\n';
				}
			}
			catch (e) {
				item = String(content);
			}
		}
		else {
			item = content;
		}
		concated += ' ' + item;
	}
	Foxtrick.log.cache += concated + '\n';

	// log on browser
	if (typeof(Firebug) != 'undefined'
		&& typeof(Firebug.Console) != 'undefined'
		&& typeof(Firebug.Console.log) == 'function') {
		// if Firebug.Console.log is available, make use of it
		if (hasError)
			// could just use just 'args', but i didn't get tracing to work nice
			Firebug.Console.log(concated);
		else
			Firebug.Console.log(args);
	}
	else if (typeof(opera) != 'undefined'
		&& typeof(opera.postError) == 'function') {
		opera.postError(args);
	}
	if (typeof(console) != 'undefined'
		&& typeof(console.log) == 'function') {
		// if console.log is available, make use of it
		// (support multiple arguments)
		// for firefox it's in the webconsole (only injected, thus preferences.html only)
		console.log.apply(console, args);
		if (hasError) {
			var stackDumped = false;
			for (i = 0; i < arguments.length; ++i) {
				var content = arguments[i];
				if (content instanceof Error && typeof (content.stack) != 'undefined') {
					console.log(content.stack);
					stackDumped = true;
				}
			}
			if (!stackDumped && typeof(console.trace) == 'function')
				console.trace();
		}
	}
	if (Foxtrick.arch == 'Gecko') {
		// goes to the error console ctrl+shift+j
		var consoleService = Components.classes['@mozilla.org/consoleservice;1']
							.getService(Components.interfaces.nsIConsoleService);
		consoleService.logStringMessage('FoxTrick: ' + concated);
	}
	if (typeof(dump) == 'function' && Foxtrick.Prefs.getBool('dump')) {
		if (Foxtrick.chromeContext() === 'background') {
			var lines = concated.split(/\n/);
			lines = Foxtrick.map(function(l) {
				dump('FT: ' + l.substr(0, 500) + '\n');
			}, lines);
		}
		else {
			// send it via background since fennec doesn't show all dumps from content side
			sandboxed.extension.sendRequest({ req: 'log', log: concated + '\n' });
		}
	}

	// add to stored log
	if (Foxtrick.arch === 'Sandboxed') {
		if (Foxtrick.chromeContext() == 'content')
			sandboxed.extension.sendRequest({ req: 'addDebugLog', log: concated + '\n' });
		else {
			Foxtrick.addToDebugLogStorage(concated + '\n');
		}
	}
	Foxtrick.log.flush();
};

// environment info shown in log as header
Foxtrick.log.header = function(doc) {
	var headString = 'Version %1, %2 platform, %3 locale, %4 layout, %5 direction'
				.replace(/%1/, Foxtrick.version() + ' ' + Foxtrick.branch())
				.replace(/%2/, Foxtrick.arch + ' ' + Foxtrick.platform)
				.replace(/%3/, Foxtrick.Prefs.getString('htLanguage'))
				.replace(/%4/, Foxtrick.util.layout.isStandard(doc) ? 'standard' : 'simple')
				.replace(/%5/, Foxtrick.util.layout.isRtl(doc) ? 'RTL' : 'LTR');
	if (Foxtrick.isStage(doc))
		headString += ', Stage';
	headString += '\n';
	return headString;
};

// cache log contents, will be flushed to page after calling
// Foxtrick.log.flush()
Foxtrick.log.cache = '';

Foxtrick.log.flush = (function() {
	var lastDoc = null;
	return function(doc) {
		if (Foxtrick.arch == 'Sandboxed' && Foxtrick.chromeContext() == 'background')
			return;

		doc = (lastDoc = doc || lastDoc);
		if (!doc)
			return;

		if (doc.getElementById('page') != null
			&& Foxtrick.Prefs.getBool('DisplayHTMLDebugOutput')
			&& Foxtrick.log.cache != '') {
			var div = doc.getElementById('ft-log');
			if (div == null) {
				// create log container
				div = doc.createElement('div');
				div.id = 'ft-log';
				var header = doc.createElement('h2');
				header.textContent = Foxtrick.L10n.getString('log.header');
				div.appendChild(header);
				var consoleDiv = doc.createElement('pre');
				consoleDiv.textContent = Foxtrick.log.header(doc);
				div.appendChild(consoleDiv);
				// add to page
				var bottom = doc.getElementById('bottom');
				if (bottom)
					bottom.parentNode.insertBefore(div, bottom);
			}
			else {
				var consoleDiv = div.getElementsByTagName('pre')[0];
			}
			// add to log
			consoleDiv.textContent += Foxtrick.log.cache;
			// clear the cache
			Foxtrick.log.cache = '';
		}
	};
})();

// debug log storage (sandboxed)
Foxtrick.debugLogStorage = '';

Foxtrick.addToDebugLogStorage = function(text) {
	var cutoff = Foxtrick.debugLogStorage.length - 3500;
	cutoff = (cutoff < 0) ? 0 : cutoff;
	Foxtrick.debugLogStorage = Foxtrick.debugLogStorage.substr(cutoff) + text;
};

// a wrapper around Foxtrick.log for compatibility
Foxtrick.dump = function(content) {
	Foxtrick.log(String(content).replace(/\s+$/, ''));
};
