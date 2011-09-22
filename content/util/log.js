/*
 * log.js
 * Debug log functions
 * @author ryanli, convincedd
 */

if (!Foxtrick)
	var Foxtrick = {};

// outputs a list of strings/objects/errors to FoxTrick log
Foxtrick.log = function() {
	var i, concated = "";
	for (i = 0; i < arguments.length; ++i) {
		var content = arguments[i];
		var item = "";
		if (content instanceof Error) {
			if (Foxtrick.arch == "Gecko") {
				item = content.fileName + " (" + content.lineNumber + "): " + String(content) + "\n";
				item += "Stack trace: " + content.stack.substr(0,1000);
				Components.utils.reportError(item);
			}
			else if (Foxtrick.arch == "Sandboxed") {
				for (var i in content)
					item += i + ": " + content[i] + ";\n";
			}
		}
		else if (typeof(content) != "string") {
			try {
				item = JSON.stringify(content).substr(0,1000);
			}
			catch (e) {
				item = String(content).substr(0,1000);
			}
		}
		else {
			item = content;
		}
		concated += item;
	}
	concated += "\n";
	Foxtrick.log.cache += concated;

	// log on browser
	var args = Array.prototype.slice.apply(arguments);
	if (typeof(Firebug.Console.log) == "function") {
		// if Firebug console is available, make use of it
		Firebug.Console.log.apply(Firebug.Console, args);
	}
	if (typeof(console.log) == "function") {
		// if console.log is available, make use of it
		console.log.apply(console, args);
	}
	else if (typeof(dump) == "function") {
		dump(concated);
	}

	// add to stored log
	if (Foxtrick.arch === "Gecko") {
		if (Foxtrick.chromeContext() === "content")
			sandboxed.extension.sendRequest({ req : "log", log : concated });
	}
	else if (Foxtrick.arch === "Sandboxed") {
		if (Foxtrick.chromeContext() == "content")
			sandboxed.extension.sendRequest({req : "addDebugLog", log : concated});
		else {
			Foxtrick.addToDebugLogStorage(concated);
		}
	}
	Foxtrick.log.flush();
};

// environment info shown in log as header
Foxtrick.log.header = function(doc) {
	var headString = Foxtrickl10n.getString("foxtrick.log.env")
				.replace(/%1/, Foxtrick.version())
				.replace(/%2/, Foxtrick.arch + ' ' + Foxtrick.platform)
				.replace(/%3/, FoxtrickPrefs.getString("htLanguage"))
				.replace(/%4/, Foxtrick.util.layout.isStandard(doc) ? "standard" : "simple")
				.replace(/%5/, Foxtrick.util.layout.isRtl(doc) ? "RTL" : "LTR");
	if (Foxtrick.isStage(doc))
		headString += ", Stage";
	headString += "\n";
	return headString;
};

// cache log contents, will be flushed to page after calling
// Foxtrick.log.flush()
Foxtrick.log.cache = "";

Foxtrick.log.flush = (function() {
	var lastDoc = null;
	return function(doc) {
		doc = lastDoc = doc || lastDoc;
		if (!doc)
			return;
		
		if (doc.getElementById("page") != null
			&& FoxtrickPrefs.getBool("DisplayHTMLDebugOutput")
			&& Foxtrick.log.cache != "") {
			var div = doc.getElementById("ft-log");
			if (div == null) {
				// create log container
				div = doc.createElement("div");
				div.id = "ft-log";
				var header = doc.createElement("h2");
				header.textContent = Foxtrickl10n.getString("foxtrick.log.header");
				div.appendChild(header);
				var console = doc.createElement("pre");
				console.textContent = Foxtrick.log.header(doc);
				div.appendChild(console);
				// add to page
				var bottom = doc.getElementById("bottom");
				if (bottom)
					bottom.parentNode.insertBefore(div, bottom);
			}
			else {
				var console = div.getElementsByTagName("pre")[0];
			}
			// add to log
			console.textContent += Foxtrick.log.cache;
			// clear the cache
			Foxtrick.log.cache = "";
		}
	};
})();

// debug log storage (sandboxed)
Foxtrick.debugLogStorage = '';

Foxtrick.addToDebugLogStorage = function (text) {
	var cutoff = Foxtrick.debugLogStorage.length-3500;
	cutoff = (cutoff<0)?0:cutoff;
	Foxtrick.debugLogStorage = Foxtrick.debugLogStorage.substr(cutoff) + text;
};

// a wrapper around Foxtrick.log for compatibility
Foxtrick.dump = function(content) {
	Foxtrick.log(String(content).replace(/\s+$/, ""));
}
