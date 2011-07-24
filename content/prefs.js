/**
 * preferences.js
 * Foxtrick preferences service
 * @author Mod-PaV, ryanli, convincedd
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickPrefs = {

	/* get an entry from preferences with generic type,
	 * return null if not found
	 */
	get : function(key) {
		if ((string = FoxtrickPrefs.getString(key)) != null)
			return string;
		if ((num = FoxtrickPrefs.getInt(key)) != null)
			return num;
		if ((bool = FoxtrickPrefs.getBool(key)) != null)
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

	
	// -----------------------  list function ----------------------------
	
	/* list are sets of numbered settings which contain titles
	/* and the values corresponding to that title
	/* eg templatelist.0 = 'MyTemplate'
	/* template.MyTemplate = 'Hello and Goodbye'
	

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
		FoxtrickPrefs.populateList(branch, values);

		return true;
	},

	// returns a list in an array
	getList : function(branch) {
		var keys = FoxtrickPrefs.getAllKeysOfBranch(branch);
		return Foxtrick.map(keys, function(k) {
			return FoxtrickPrefs.get(k);
		});
	},

	/** Remove a list element. */
	delListPref : function(branch, delValue) {
		var values = FoxtrickPrefs.getList(branch);
		values = Foxtrick.filter(values, function(e) {
			return e != delValue;
		});
		FoxtrickPrefs.populateList(branch, values);
	},

	/** Populate list_name with given array deleting if exists */
	populateList : function(branch, values) {
		const keys = FoxtrickPrefs.getAllKeysOfBranch(branch);
		for (var i = 0; i < keys.length; ++i) {
			FoxtrickPrefs.deleteValue(keys[i]);
		}
		for (var i in values) {
			FoxtrickPrefs.set(decodeURI(branch + "." + i), values[i]);
		}
	},


	// ---------------------- common function --------------------------------------

	// returns whether FoxTrick is enabled on doc
	isEnabled : function(doc) {
		if (FoxtrickPrefs.getBool("disableOnStage") && Foxtrick.isStage(doc))
			return false;
		if (FoxtrickPrefs.getBool("disableTemporary"))
			return false;
		return true;
	},

	getModuleName : function(module) {
		return (module.MODULE_NAME) ? String(module.MODULE_NAME) : String(module);
	},
	
	isModuleEnabled : function(module) {
		// core modules must be executed no matter what user's preference is
		if (module.CORE_MODULE)
			return true;
		return Boolean(FoxtrickPrefs.getBool("module." + FoxtrickPrefs.getModuleName(module) + ".enabled"));
	},

	isModuleOptionEnabled : function(module, option) {
		const val = Boolean(FoxtrickPrefs.getBool("module." + FoxtrickPrefs.getModuleName(module) + "." + option + ".enabled"));
		return val;
	},

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

	// personal settings to be skipped eg. when resetting
	isPrefSetting : function(key) {
		return key.indexOf("oauth") == -1
			&& key.indexOf("transferfilter") == -1
			&& key.indexOf("post_templates") == -1
			&& key.indexOf("mail_templates") == -1
			&& (key.indexOf("LinksCustom") == -1
				|| key.indexOf("LinksCustom.enabled") != -1) ;
	},

	//  ----------------- function for preference.js ---------------------------
	cleanupBranch : function() {
		if (Foxtrick.BuildFor == "Gecko") {
			try {
				var array = FoxtrickPrefs.getAllKeysOfBranch('module');
				for (var i = 0; i < array.length; i++) {
					if (FoxtrickPrefs.isPrefSetting(array[i])) {
						FoxtrickPrefs.deleteValue(array[i]);
					}
				}
				FoxtrickPrefs.setBool("preferences.updated", true);
				Foxtrick.entry.init();
				return true;
			}
			catch (e) {
				Foxtrick.log(e);
				return false;
			}
		}
		else if (Foxtrick.BuildFor == "Chrome") {
			FoxtrickPrefs._prefs_chrome_user = {};
			chrome.extension.sendRequest({ req : "clearPrefs" },
				Foxtrick.entry.init);
			return true;
		}
	},

	disableAllModules : function() {
		try { 
			var array = FoxtrickPrefs.getAllKeysOfBranch('module');
			
			for (var i = 0; i < array.length; i++) {
				if (array[i].search(/enabled$/) != -1) {
					FoxtrickPrefs.setBool(array[i], false);
				}
			}
			FoxtrickPrefs.setBool("preferences.updated", true);
			Foxtrick.entry.init();
		}
		catch (e) {
			Foxtrick.log(e);
			return false;
		}
		return true;
	},

	SavePrefs : function(savePrefs, saveNotes, userSettings, format) {
		try {
			if (!format) format = 'user_pref("extensions.foxtrick.prefs.%key",%value);';
			var ret = "";
			var array = FoxtrickPrefs.getAllKeysOfBranch("");
			array.sort();
			for (var i = 0; i < array.length; i++) {
				var key = array[i]; if(i>0 && key==array[i-1]) continue; // some appear twice!?
				if (!userSettings || FoxtrickPrefs.prefHasUserValue(key)) 
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

	show : function(page) {
		if (!page) var page = '#tab=main';
		Foxtrick.newTab(Foxtrick.ResourcePath + "preferences.xhtml" + page);
	},

	disable : function(tab) {
		FoxtrickPrefs.setBool("disableTemporary", !FoxtrickPrefs.getBool("disableTemporary"));
		if (Foxtrick.BuildFor === "Gecko") {
			FoxtrickCore.updateStatus();
			Foxtrick.entry.init();
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			FoxtrickCore.setPageIcon(tab);
		}
	}
};


// ----------------------  Gecko specific get/set preferences --------------------------
if (Foxtrick.BuildFor === "Gecko") {

	var FoxtrickPrefsGecko = {
		_prefs_gecko : null,

		init : function() {
			FoxtrickPrefs._prefs_gecko = Components
				.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.foxtrick.prefs.");
		},
		
		getString : function(key) {
			var str;
			try {
				str = FoxtrickPrefs._prefs_gecko.getComplexValue(encodeURI(key),
					Components.interfaces.nsISupportsString).data;
			}
			catch (e) {
				try {
					str = FoxtrickPrefs._prefs_gecko.getComplexValue(pref_name,
						Components.interfaces.nsISupportsString).data;
	 			}
	 			catch (e) {
					str = null;
				}
			}
	 		return str;
		},

		setString : function(key, value) {
			var str = Components
					.classes["@mozilla.org/supports-string;1"]
					.createInstance(Components.interfaces.nsISupportsString);
				str.data = value;
				FoxtrickPrefs._prefs_gecko.setComplexValue(encodeURI(key),
					Components.interfaces.nsISupportsString, str);
		},

		getInt : function(key) {
			var value;
			try {
				value = FoxtrickPrefs._prefs_gecko.getIntPref(encodeURI(key));
			}
			catch (e) {
				try {
					value = FoxtrickPrefs._prefs_gecko.getIntPref(key);
				}
				catch (e) {
					value = null;
				}
			}
			return value;
		},

		setInt : function(key, value) {
			FoxtrickPrefs._prefs_gecko.setIntPref(encodeURI(key), value);
		},

		getBool : function(key) {
			var value;
			try {
				value = FoxtrickPrefs._prefs_gecko.getBoolPref(encodeURI(key));
			}
			catch (e) {
				try {
					value = FoxtrickPrefs._prefs_gecko.getBoolPref(key);
				}
				catch (e) {
					value = null;
				}
			}
			return value;
		},

		setBool : function(key, value) {
			FoxtrickPrefs._prefs_gecko.setBoolPref(encodeURI(key), value);
		},

		deleteValue : function(key) {
			if (FoxtrickPrefs._prefs_gecko.prefHasUserValue(encodeURI(key)))
				FoxtrickPrefs._prefs_gecko.clearUserPref(encodeURI(key));   // reset to default
		},

		prefHasUserValue : function(key) {
			return FoxtrickPrefs._prefs_gecko.prefHasUserValue(key);
		},
		/* get all preference entry keys under a branch.
		 * - if branch is "", return the names of all entries;
		 * - if branch is not "", return the names of entries with name
			 starting with the branch name.
		 */
		getAllKeysOfBranch : function(branch) {
			var prefix = (branch == "") ? "" : encodeURI(branch + ".");
			var array = FoxtrickPrefs._prefs_gecko.getChildList(prefix, {});
			for (var i = 0; i < array.length; ++i)
				array[i] = decodeURI(array[i]);
			return array;
		},
	}

for (i in FoxtrickPrefsGecko)
		FoxtrickPrefs[i] = FoxtrickPrefsGecko[i];
}



// ----------------------  Chrome specific get/set preferences --------------------------
if (Foxtrick.BuildFor === "Chrome") {

	var FoxtrickPrefsChrome = {
		_prefs_chrome_user : {}, 	// contains mapped copies of user settings localStore.
		_prefs_chrome_default : {},	// defaults from foxtrick.prefs
		
		getString : function(key) {
			var value = this.getValue(key);
			if (typeof(value) == "string")
				return value;
			return null;
		},

		setString : function(key, value) {
			FoxtrickPrefs.setValue(key, String(value));
		},

		getInt : function(key) {
			var value = FoxtrickPrefs.getValue(key);
			if (typeof(value) == "number")
				return value;
			return null;
		},

		setInt : function(key, value) {
			FoxtrickPrefs.setValue(key, Number(value));
		},

		getBool : function(key) {
			var value = FoxtrickPrefs.getValue(key);
			if (typeof(value) == "boolean")
				return value;
			return null;
		},

		setBool : function(key, value) {
			FoxtrickPrefs.setValue(key, Boolean(value));
		},

		getValue : function(key) {
			try { 
				if (FoxtrickPrefs._prefs_chrome_user[key] !== undefined)
					return FoxtrickPrefs._prefs_chrome_user[key];
				else if (FoxtrickPrefs._prefs_chrome_default[key] !== undefined)
					return FoxtrickPrefs._prefs_chrome_default[key];
				else
					return null;
			}
			catch (e) {
				return null;
			}
		},
		
		prefHasUserValue : function(key) {
			return (typeof(FoxtrickPrefs._prefs_chrome_user[key])!='undefined');
		},

		/* get all preference entry keys under a branch.
		 * - if branch is "", return the names of all entries;
		 * - if branch is not "", return the names of entries with name
			 starting with the branch name.
		 */
		getAllKeysOfBranch : function(branch) {
			var prefix = (branch == "") ? "" : encodeURI(branch + ".");
			var array = [];
			for (var i in FoxtrickPrefs._prefs_chrome_user) {
				if (i.indexOf(prefix) == 0)
					if (!FoxtrickPrefs._prefs_chrome_default[i]) // only if not default to eliminate duplicacy
						array.push(i);
			}
			for (var i in FoxtrickPrefs._prefs_chrome_default) {
				if (i.indexOf(prefix) == 0)
					array.push(i);
			}
			return array;
		},
	}

	if (Foxtrick.chromeContext() == "background") {

		var FoxtrickPrefsChromeBackground = {
			init : function() {
				// get prefrences
				// this is used when loading from options page, not valid
				// in content script since access to localStorage is forbidden
				try {
					// user preferences
					FoxtrickPrefs._prefs_chrome_user = {};
					var length = localStorage.length;
					for (var i = 0; i < length; ++i) {
						var key = localStorage.key(i);
						var value = localStorage.getItem(key);
						try {
							FoxtrickPrefs._prefs_chrome_user[key] = JSON.parse(value);
						}
						catch (e) {
							Foxtrick.dump("Preference parse error: "
								+ "key: " + key
								+ ", value: " + value + "\n");
						}
					}

					var prefUrl = Foxtrick.ResourcePath+("../defaults/preferences/foxtrick.js");
					var prefXhr = new XMLHttpRequest();
					prefXhr.open("GET", prefUrl, false);
					prefXhr.send();
					var prefList = prefXhr.responseText.split(/[\n\r]+/);
					const prefRe = /pref\("extensions\.foxtrick\.prefs\.(.+)",\s*(.+)\);/;
					FoxtrickPrefs._prefs_chrome_default = {};
					for (var i = 0; i < prefList.length; ++i) {
						var pref = prefList[i];
						var matches = pref.match(prefRe);
						if (matches) {
							var key = matches[1];
							var value = matches[2];
							if (value == "true")
								FoxtrickPrefs._prefs_chrome_default[key] = true;
							else if (value == "false")
								FoxtrickPrefs._prefs_chrome_default[key] = false;
							else if (!isNaN(Number(value)))
								FoxtrickPrefs._prefs_chrome_default[key] = Number(value)
							else if (value.match(/^"(.*)"$/))
								FoxtrickPrefs._prefs_chrome_default[key] = String(value.match(/^"(.*)"$/)[1]);
						}
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}
			},

			// set and delete for background script side
			setValue : function(key, value) {
				try {
					if (FoxtrickPrefs._prefs_chrome_default[key] === value)
						FoxtrickPrefs.deleteValue(key);
					else {
						FoxtrickPrefs._prefs_chrome_user[key] = value; // not default, set it
						localStorage.setItem(key, JSON.stringify(value));
					}
				}
				catch (e) {}
			},

			deleteValue : function(key) {
				delete(FoxtrickPrefs._prefs_chrome_user[key]);
				localStorage.removeItem(key);
			},
		};

		for (i in FoxtrickPrefsChromeBackground)
			FoxtrickPrefsChrome[i] = FoxtrickPrefsChromeBackground[i];
	}

	
	if (Foxtrick.chromeContext() == "content") {
		// set and delete for contents script side
		var FoxtrickPrefsChromeContent = {
			init : function() {
				// done in loader_chrome
			},
			
			setValue : function(key, value) {
				try {
					if (FoxtrickPrefs._prefs_chrome_default[key] === value)
						// is default. deleteing user pref, will set it to default
						FoxtrickPrefs.deleteValue(key);
					else {
						// not default, set it
						FoxtrickPrefs._prefs_chrome_user[key] = value; 
						chrome.extension.sendRequest({ req : "setValue", key : key, value : value });
					}
				}
				catch (e) {}
			},

			deleteValue : function(key) {
				delete(FoxtrickPrefs._prefs_chrome_user[key]);
				chrome.extension.sendRequest({ req : "deleteValue", key : key });
			},
		};

		for (i in FoxtrickPrefsChromeContent)
			FoxtrickPrefsChrome[i] = FoxtrickPrefsChromeContent[i];
	}

	for (i in FoxtrickPrefsChrome)
		FoxtrickPrefs[i] = FoxtrickPrefsChrome[i];
}
