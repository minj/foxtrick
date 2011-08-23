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
			if (Foxtrick.BuildFor == "Gecko") {
				item = content.fileName + " (" + content.lineNumber + "): " + String(content) + "\n";
				item += "Stack trace: " + content.stack.substr(0,1000);
				Components.utils.reportError(item);
			}
			else if (Foxtrick.BuildFor == "Sandboxed") {
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
	Foxtrick.dumpCache += concated;
	if (Foxtrick.BuildFor === "Gecko") {
		if (Foxtrick.chromeContext() === "content")
			sandboxed.extension.sendRequest({ req : "log", log : concated });
		else
			dump("FT: " + concated);
	}
	else if (Foxtrick.BuildFor === "Sandboxed") {
		if (Foxtrick.chromeContext() == "content")
			sandboxed.extension.sendRequest({req : "addDebugLog", log : concated});
		else {
			Foxtrick.addToDebugLogStorage(concated);
		}
		console.log(concated);
		Foxtrick.dumpFlush(document);
	}
};

Foxtrick.log.header = function(doc) {
	var headString = Foxtrickl10n.getString("foxtrick.log.env")
				.replace(/%1/, Foxtrick.version())
				.replace(/%2/, Foxtrick.BuildFor + ' ' + Foxtrick.BuildForDetail)
				.replace(/%3/, FoxtrickPrefs.getString("htLanguage"))
				.replace(/%4/, Foxtrick.util.layout.isStandard(doc) ? "standard" : "simple")
				.replace(/%5/, Foxtrick.util.layout.isRtl(doc) ? "RTL" : "LTR");
	if (Foxtrick.isStage(doc))
		headString += ", Stage";
	headString += "\n";
	return headString;
};


// debug log storage (sandboxed)
Foxtrick.debugLogStorage = '';

Foxtrick.addToDebugLogStorage = function (text) {
	var cutoff = Foxtrick.debugLogStorage.length-3500;
	cutoff = (cutoff<0)?0:cutoff;
	Foxtrick.debugLogStorage = Foxtrick.debugLogStorage.substr(cutoff) + text;
};

Foxtrick.dumpCache = "";
Foxtrick.dumpFlush = function(doc) {
	if (doc.getElementById("page") != null
		&& FoxtrickPrefs.getBool("DisplayHTMLDebugOutput")
		&& Foxtrick.dumpCache != "") {
		var div = doc.getElementById("ft-log");
		if (div == null) {
			// create log container
			div = doc.createElement("div");
			div.id = "ft-log";
			var header = doc.createElement("h2");
			header.textContent = Foxtrickl10n.getString("foxtrick.log.header");
			div.appendChild(header);
			var pre = doc.createElement("pre");
			pre.textContent = Foxtrick.log.header(doc);
			div.appendChild(pre);
			// add to page
			var bottom = doc.getElementById("bottom");
			if (bottom)
				bottom.parentNode.insertBefore(div, bottom);
		}
		// add to log
		div.getElementsByTagName("pre")[0].textContent += Foxtrick.dumpCache;
		// clear the cache
		Foxtrick.dumpCache = "";
	}
}

// a wrapper around Foxtrick.log for compatibility
Foxtrick.dump = function(content) {
	Foxtrick.log(String(content).replace(/\s+$/, ""));
}
