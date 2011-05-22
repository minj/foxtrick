/**
 * preferences.js
 * Foxtrick preferences service
 * @author Mod-PaV
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickPrefs = {
	_pref_branch : null,
	pref_default:'',

	init : function() {
		if (Foxtrick.BuildFor === "Gecko") {
			var prefs = Components
				.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService);
			FoxtrickPrefs._pref_branch = prefs.getBranch("extensions.foxtrick.prefs.");
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			// get prefrences
			// this is used when loading from options page, not valid
			// in content script since access to localStorage is forbidden
			if (Foxtrick.chromeContext() == "background") {
				try {
					// user preferences
					FoxtrickPrefs.pref = {};
					var length = localStorage.length;
					for (var i = 0; i < length; ++i) {
						var key = localStorage.key(i);
						var value = localStorage.getItem(key);
						try {
							FoxtrickPrefs.pref[key] = JSON.parse(value);
						}
						catch (e) {
							Foxtrick.dump("Preference parse error: "
								+ "key: " + key
								+ ", value: " + value + "\n");
						}
					}

					var prefUrl = chrome.extension.getURL("defaults/preferences/foxtrick.js");
					var prefXhr = new XMLHttpRequest();
					prefXhr.open("GET", prefUrl, false);
					prefXhr.send();
					var prefList = prefXhr.responseText.split(/[\n\r]+/);
					const prefRe = /pref\("extensions\.foxtrick\.prefs\.(.+)",\s*(.+)\);/;
					FoxtrickPrefs.prefDefault = {};
					for (var i = 0; i < prefList.length; ++i) {
						var pref = prefList[i];
						var matches = pref.match(prefRe);
						if (matches) {
							var key = matches[1];
							var value = matches[2];
							if (value == "true")
								FoxtrickPrefs.prefDefault[key] = true;
							else if (value == "false")
								FoxtrickPrefs.prefDefault[key] = false;
							else if (!isNaN(Number(value)))
								FoxtrickPrefs.prefDefault[key] = Number(value)
							else if (value.match(/^"(.*)"$/))
								FoxtrickPrefs.prefDefault[key] = String(value.match(/^"(.*)"$/)[1]);
						}
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}
			}
			else if (Foxtrick.chromeContext() == "content") {
				chrome.extension.sendRequest({ req : "getPrefs" },
					function(data) {
						FoxtrickPrefs.pref = data.pref;
						FoxtrickPrefs.prefDefault = data.prefDefault;
					});
			}
		}
	},

	/* get an entry from preferences with generic type,
	 * return null if not found
	 */
	get : function(key) {
		if ((string = this.getString(key)) != null)
			return string;
		if ((num = this.getInt(key)) != null)
			return num;
		if ((bool = this.getBool(key)) != null)
			return bool;
		return null;
	},

	set : function(key, value) {
		const map = {
			"string" : FoxtrickPrefs.setString,
			"number" : FoxtrickPrefs.setInt,
			"boolean" : FoxtrickPrefs.setBool
		};
		if (map[typeof(value)])
			map[typeof(value)](key, value);
		else
			throw "Type error: value is " + typeof(value);
	},

	getString : function(key) {
		if (Foxtrick.BuildFor === "Gecko") {
			var str;
			try {
				str = FoxtrickPrefs._pref_branch.getComplexValue(encodeURI(key),
					Components.interfaces.nsISupportsString).data;
			}
			catch (e) {
				try {
					str = FoxtrickPrefs._pref_branch.getComplexValue(pref_name,
						Components.interfaces.nsISupportsString).data;
	 			}
	 			catch (e) {
					str = null;
				}
			}
	 		return str;
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			var value = this.getValue(key);
			if (typeof(value) == "string")
				return value;
			return null;
		}
	},

	setString : function(key, value) {
		if (Foxtrick.BuildFor === "Gecko") {
			var str = Components
				.classes["@mozilla.org/supports-string;1"]
				.createInstance(Components.interfaces.nsISupportsString);
			str.data = value;
			FoxtrickPrefs._pref_branch.setComplexValue(encodeURI(key),
				Components.interfaces.nsISupportsString, str);
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			FoxtrickPrefs.setValue(key, String(value));
		}
	},

	getInt : function(key) {
		if (Foxtrick.BuildFor === "Gecko") {
			var value;
			try {
				value = FoxtrickPrefs._pref_branch.getIntPref(encodeURI(key));
			}
			catch (e) {
				try {
					value = FoxtrickPrefs._pref_branch.getIntPref(key);
				}
				catch (e) {
					value = null;
				}
			}
			return value;
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			var value = FoxtrickPrefs.getValue(key);
			if (typeof(value) == "number")
				return value;
			return null;
		}
	},

	setInt : function(key, value) {
		if (Foxtrick.BuildFor === "Gecko") {
			FoxtrickPrefs._pref_branch.setIntPref(encodeURI(key), value);
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			FoxtrickPrefs.setValue(key, Number(value));
		}
	},

	getBool : function(key) {
		if (Foxtrick.BuildFor === "Gecko") {
			var value;
			try {
				value = FoxtrickPrefs._pref_branch.getBoolPref(encodeURI(key));
			}
			catch (e) {
				try {
					value = FoxtrickPrefs._pref_branch.getBoolPref(key);
				}
				catch (e) {
					value = null;
				}
			}
			return value;
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			var value = FoxtrickPrefs.getValue(key);
			if (typeof(value) == "boolean")
				return value;
			return null;
		}
	},

	setBool : function(key, value) {
		if (Foxtrick.BuildFor === "Gecko") {
			FoxtrickPrefs._pref_branch.setBoolPref(encodeURI(key), value);
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			FoxtrickPrefs.setValue(key, Boolean(value));
		}
	},

	/* Add a new preference with value given as argument under a
	 * specified branch.
	 * Creates the list if not present.
	 * Returns true if added (false if empty or already on the list).
	 */
	addPrefToList : function(branch, value) {
		if (value == "")
			return false;

		var values = FoxtrickPrefs.getList(branch);

		// already exists?
		var exists = Foxtrick.some(values,
			function(v) { return v == value; });

		if (exists)
			return false;

		values.push(value);
		FoxtrickPrefs._populateList(branch, values);

		return true;
	},

	getList : function(branch) {
		var keys = FoxtrickPrefs._getElemNames(branch);
		return Foxtrick.map(keys, function(k) {
			return FoxtrickPrefs.get(k);
		});
	},

	/* get all preference entry keys under a branch.
	 * - if branch is "", return the names of all entries;
	 * - if branch is not "", return the names of entries with name
	     starting with the branch name.
	 */
	_getElemNames : function(branch) {
		var prefix = (branch == "") ? "" : encodeURI(branch + ".");
		if (Foxtrick.BuildFor === "Gecko") {
			var array = FoxtrickPrefs._pref_branch.getChildList(prefix, {});
			for (var i = 0; i < array.length; ++i)
				array[i] = decodeURI(array[i]);
			return array;
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			var array = [];
			for (var i in FoxtrickPrefs.pref) {
				if (i.indexOf(prefix) == 0)
					if (!FoxtrickPrefs.prefDefault[i]) // only if not default to eliminate duplicacy
						array.push(i);
			}
			for (var i in FoxtrickPrefs.prefDefault) {
				if (i.indexOf(prefix) == 0)
					array.push(i);
			}
			return array;
		}
	},

	/** Remove a list element. */
	delListPref : function(branch, delValue) {
		var values = FoxtrickPrefs.getList(branch);
		values = Foxtrick.filter(values, function(e) {
			return e != delValue;
		});
		FoxtrickPrefs._populateList(branch, values);
	},

	/** Populate list_name with given array deleting if exists */
	_populateList : function(branch, values) {
		if (Foxtrick.BuildFor === "Gecko") {
			FoxtrickPrefs._pref_branch.deleteBranch(encodeURI(branch));
			for (var i in values)
				FoxtrickPrefs.set(decodeURI(branch + "." + i), values[i]);
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			const keys = FoxtrickPrefs._getElemNames(branch);
			for (var i = 0; i < keys.length; ++i) {
				FoxtrickPrefs.deleteValue(keys[i]);
			}
			for (var i in values) {
				FoxtrickPrefs.set(branch + "." + i, values[i]);
			}
		}
	},

	deleteValue : function(key) {
		if (Foxtrick.BuildFor === "Gecko") {
			if (FoxtrickPrefs._pref_branch.prefHasUserValue(encodeURI(key)))
				FoxtrickPrefs._pref_branch.clearUserPref(encodeURI(key));   // reset to default
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			delete(FoxtrickPrefs.pref[key]);
			if (Foxtrick.chromeContext() == "background") {
				localStorage.removeItem(key);
			}
			else if (Foxtrick.chromeContext() == "content") {
				FoxtrickPrefs.dumpPrefs();
			}
		}
	},

	// ---------------------- common function --------------------------------------
	setModuleEnableState : function(module, value) {
		FoxtrickPrefs.setBool("module." + module + ".enabled", value);
	},

	setModuleOptionsText : function(module, value) {
		FoxtrickPrefs.setString("module." + module, value);
	},

	getModuleValue : function(module) {
		const moduleName = (module.MODULE_NAME) ? String(module.MODULE_NAME) : String(module);
		return FoxtrickPrefs.getInt("module." + moduleName + ".value");
	},

	setModuleValue : function(module, value) {
		const moduleName = (module.MODULE_NAME) ? String(module.MODULE_NAME) : String(module);
		FoxtrickPrefs.setInt("module." + moduleName + ".value", value);
	},

	getModuleDescription : function(module) {
		var name = "foxtrick." + module + ".desc";
		if (Foxtrickl10n.isStringAvailable(name) )
			return Foxtrickl10n.getString(name);
		else {
			Foxtrick.log("Module not localized: " + module + ".");
			return module;
		}
	},

	getModuleElementDescription : function(module, option) {
		var name = "foxtrick." + module + "." + option + ".desc";
		if (Foxtrickl10n.isStringAvailable(name))
			return Foxtrickl10n.getString(name);
		else {
			Foxtrick.log("Module option not localized: " + module + "." + option + ".");
			return option;
		}
	},


	isPrefSetting : function(key) {
		return key.indexOf("transferfilter") == -1
			&& key.indexOf("post_templates") == -1
			&& key.indexOf("mail_templates") == -1
			&& (key.indexOf("LinksCustom") == -1
				|| key.indexOf("LinksCustom.enabled") != -1) ;
	},

	cleanupBranch : function() {
		if (Foxtrick.BuildFor == "Gecko") {
			try {
				var array = FoxtrickPrefs._getElemNames("");
				for (var i = 0; i < array.length; i++) {
					if (FoxtrickPrefs.isPrefSetting(array[i])) {
						FoxtrickPrefs.deleteValue(array[i]);
					}
				}
				FoxtrickMain.init();
				return true;
			}
			catch (e) {
				Foxtrick.log(e);
				return false;
			}
		}
		else if (Foxtrick.BuildFor == "Chrome") {
			FoxtrickPrefs.pref = {};
			chrome.extension.sendRequest({ req : "clearPrefs" },
				FoxtrickMain.init);
			return true;
		}
	},

	disableAll : function() {
		try {
			var array = FoxtrickPrefs._getElemNames("");
			for (var i = 0; i < array.length; i++) {
				if (array[i].search(/enabled$/) != -1) {
					FoxtrickPrefs.setBool(array[i], false);
				}
			}
			FoxtrickMain.init();
		}
		catch (e) {
			Foxtrick.log(e);
			return false;
		}
		return true;
	},

	SavePrefs : function(savePrefs, saveNotes) {
		try {
			const format = 'user_pref("extensions.foxtrick.prefs.%key",%value);';
			var ret = "";
			var array = FoxtrickPrefs._getElemNames("");
			array.sort();
			for (var i = 0; i < array.length; i++) {
				var key = array[i];
				if ((FoxtrickPrefs.isPrefSetting(key) && savePrefs)
					|| (!FoxtrickPrefs.isPrefSetting(key) && saveNotes)) {
					var item = format.replace(/%key/, key);

					var value = null;
					if ((value = FoxtrickPrefs.getString(key)) !== null)
						item = item.replace(/%value/, "\"" + value.replace(/\n/g, "\\n") + "\"");
					else if ((value = FoxtrickPrefs.getInt(key)) !== null)
						item = item.replace(/%value/, value);
					else if ((value = FoxtrickPrefs.getBool(key)) !== null)
						item = item.replace(/%value/, value);
					if (value !== null)
						ret += item + "\n";
				}
			}
			return ret;
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},

	LoadPrefs : function(string) {
		const format = /user_pref\("extensions\.foxtrick\.prefs\.(.+)",(.+)\);/;
		var lines = string.split("\n");
		for (var i = 0; i < lines.length; ++i) {
			try {
				var line = lines[i];
				var matches = line.match(format);
				if (!matches)
					continue;
				var key = matches[1];
				var value = matches[2];
				if (value.match(/^".+"$/))
					FoxtrickPrefs.setString(key, value.match(/^"(.+)"$/)[1]);
				else if (!isNaN(value))
					FoxtrickPrefs.setInt(key, Number(value));
				else if (value == "true" || value == "false")
					FoxtrickPrefs.setBool(key, value == "true");
			}
			catch (e) {
				Foxtrick.dump("Value: " + matches[2]);
				Foxtrick.log(e);
			}
		}
		FoxtrickPrefs.setBool("preferences.updated", true);
	},

	show : function() {
		Foxtrick.newTab(Foxtrick.ResourcePath + "preferences.xhtml");
	},

	disable : function() {
		FoxtrickPrefs.setBool("disableTemporary", !FoxtrickPrefs.getBool("disableTemporary"));
		if (Foxtrick.BuildFor === "Gecko") {
			var statusBarImg = document.getElementById("foxtrick-status-bar-img");
			FoxtrickCore.updateStatus();
			FoxtrickMain.init();
		}
		else if (Foxtrick.BuildFor === "Chrome") {
	 		if (FoxtrickPrefs.getBool("disableTemporary"))
	 			chrome.browserAction.setIcon({path : "../skin/disabled-24.png"});
 			else
 				chrome.browserAction.setIcon({path : "../skin/icon-24.png"});
		}
	}
};

if (Foxtrick.BuildFor == "Chrome") {
	FoxtrickPrefs.getValue = function(key) {
		try {
			if (FoxtrickPrefs.pref[key] !== undefined)
				return FoxtrickPrefs.pref[key];
			else if (FoxtrickPrefs.prefDefault[key] !== undefined)
				return FoxtrickPrefs.prefDefault[key];
			else
				return null;
		}
		catch (e) {
			return null;
		}
	};
	FoxtrickPrefs.setValue = function(key, value) {
		try {
			if (FoxtrickPrefs.prefDefault[key] === value)
				FoxtrickPrefs.deleteValue(key);
			else {
				FoxtrickPrefs.pref[key] = value; // not default, set it
				if (Foxtrick.chromeContext() == "background") {
					localStorage.setItem(key, JSON.stringify(value));
				}
				else if (Foxtrick.chromeContext() == "content") {
					FoxtrickPrefs.dumpPrefs();
				}
			}
		}
		catch (e) {}
	};
	FoxtrickPrefs.dumpPrefs = function() {
		chrome.extension.sendRequest({
			req : "setPrefs",
			prefs : FoxtrickPrefs.pref
		});
	};
}
