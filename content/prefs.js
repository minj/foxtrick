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
			"string" : this.setString,
			"number" : this.setInt,
			"boolean" : this.setBool
		};
		if (map[typeof(value)])
			map[typeof(value)](key, value);
		else
			throw "Type error: value is " + typeof(value);
	},

	/* Add a new preference with value given as argument under a
	 * specified branch.
	 * Creates the list if not present.
	 * Returns true if added (false if empty or already on the list).
	 */
	addPrefToList : function(branch, value) {
		if (value == "")
			return false;

		var values = this.getList(branch);

		// already exists?
		var exists = Foxtrick.some(values,
			function(v) { return v == value; });

		if (exists)
			return false;

		values.push(value);
		this.populateList(branch, values);

		return true;
	},

	getList : function(branch) {
		var keys = this.getElemNames(branch);
		return Foxtrick.map(keys, function(k) {
			return this.get(k);
		});
	},

	/** Remove a list element. */
	delListPref : function(branch, delValue) {
		var values = this.getList(branch);
		values = Foxtrick.filter(values, function(e) {
			return e != delValue;
		});
		this.populateList(branch, values);
	},

	// ---------------------- common function --------------------------------------
	
	// returns whether FoxTrick is enabled on doc
	isEnabled : function(doc) {
		if (this.getBool("disableOnStage") && Foxtrick.isStage(doc))
			return false;
		if (this.getBool("disableTemporary"))
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
		return Boolean(this.getBool("module." + this.getModuleName(module) + ".enabled"));
	},

	isModuleOptionEnabled : function(module, option) {
		const val = Boolean(this.getBool("module." + this.getModuleName(module) + "." + option + ".enabled"));
		return val;
	},

	setModuleEnableState : function(module, value) {
		this.setBool("module." + module + ".enabled", value);
	},

	setModuleOptionsText : function(module, value) {
		this.setString("module." + module, value);
	},

	getModuleValue : function(module) {
		const moduleName = (module.MODULE_NAME) ? String(module.MODULE_NAME) : String(module);
		return this.getInt("module." + moduleName + ".value");
	},

	setModuleValue : function(module, value) {
		const moduleName = (module.MODULE_NAME) ? String(module.MODULE_NAME) : String(module);
		this.setInt("module." + moduleName + ".value", value);
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
		return key.indexOf("oauth") == -1
			&& key.indexOf("transferfilter") == -1
			&& key.indexOf("post_templates") == -1
			&& key.indexOf("mail_templates") == -1
			&& (key.indexOf("LinksCustom") == -1
				|| key.indexOf("LinksCustom.enabled") != -1) ;
	},

	SavePrefs : function(savePrefs, saveNotes, userSettings, format) {
		try {
			if (!format) format = 'user_pref("extensions.foxtrick.prefs.%key",%value);';
			var ret = "";
			var array = this.getElemNames("");
			array.sort();
			for (var i = 0; i < array.length; i++) {
				var key = array[i]; if(i>0 && key==array[i-1]) continue; // some appear twice!?
				if (!userSettings || this.prefHasUserValue(key)) 
				if ((this.isPrefSetting(key) && savePrefs)
					|| (!this.isPrefSetting(key) && saveNotes)) {
					var item = format.replace(/%key/, key);

					var value = null;
					if ((value = this.getString(key)) !== null)
						item = item.replace(/%value/, "\"" + value.replace(/\n/g, "\\n") + "\"");
					else if ((value = this.getInt(key)) !== null)
						item = item.replace(/%value/, value);
					else if ((value = this.getBool(key)) !== null)
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
					this.setString(key, value.match(/^"(.+)"$/)[1]);
				else if (!isNaN(value))
					this.setInt(key, Number(value));
				else if (value == "true" || value == "false")
					this.setBool(key, value == "true");
			}
			catch (e) {
				Foxtrick.dump("Value: " + matches[2]);
				Foxtrick.log(e);
			}
		}
		this.setBool("preferences.updated", true);
	},

	disableAll : function(branch) {
		try { 
			Foxtrick.log('disable all: "',branch,'"');
			if (!branch) var branch = '';
			var array = this.getElemNames(branch);
			for (var i = 0; i < array.length; i++) {
				if (array[i].search(/enabled$/) != -1) {
					this.setBool(array[i], false);
				}
			}
			Foxtrick.entry.init();
		}
		catch (e) {
			Foxtrick.log(e);
			return false;
		}
		return true;
	},
};



// ----------------------  Gecko specific get/set preferences --------------------------
if (Foxtrick.BuildFor === "Gecko") {

	var FoxtrickPrefsGecko = {
		_prefs_gecko : null,

		init : function() {
			this._prefs_gecko = Components
				.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.foxtrick.prefs.");
		},


		getString : function(key) {
			var str;
			try {
				str = this._prefs_gecko.getComplexValue(encodeURI(key),
					Components.interfaces.nsISupportsString).data;
			}
			catch (e) {
				try {
					str = this._prefs_gecko.getComplexValue(pref_name,
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
			this._prefs_gecko.setComplexValue(encodeURI(key),
				Components.interfaces.nsISupportsString, str);
		},

		getInt : function(key) {
			var value;
			try {
				value = this._prefs_gecko.getIntPref(encodeURI(key));
			}
			catch (e) {
				try {
					value = this._prefs_gecko.getIntPref(key);
				}
				catch (e) {
					value = null;
				}
			}
			return value;
		},

		setInt : function(key, value) {
			this._prefs_gecko.setIntPref(encodeURI(key), value);
		},

		getBool : function(key) {
			var value;
			try {
				value = this._prefs_gecko.getBoolPref(encodeURI(key));
			}
			catch (e) {
				try {
					value = this._prefs_gecko.getBoolPref(key);
				}
				catch (e) {
					value = null;
				}
			}
			return value;
		},

		setBool : function(key, value) {
			this._prefs_gecko.setBoolPref(encodeURI(key), value);
		},

		deleteValue : function(key) {
			if (this._prefs_gecko.prefHasUserValue(encodeURI(key)))
				this._prefs_gecko.clearUserPref(encodeURI(key));   // reset to default
		},

		/* get all preference entry keys under a branch.
		 * - if branch is "", return the names of all entries;
		 * - if branch is not "", return the names of entries with name
			 starting with the branch name.
		 */
		getElemNames : function(branch) {
			var prefix = (branch == "") ? "" : encodeURI(branch + ".");
			var array = this._prefs_gecko.getChildList(prefix, {});
			for (var i = 0; i < array.length; ++i)
				array[i] = decodeURI(array[i]);
			return array;
		},

		/** Populate list_name with given array deleting if exists */
		populateList : function(branch, values) {
			this._prefs_gecko.deleteBranch(encodeURI(branch));
			for (var i in values)
				this.set(decodeURI(branch + "." + i), values[i]);
		},
		
		prefHasUserValue : function(key) {
			return this._prefs_gecko.prefHasUserValue(key);
		},
		
		cleanupBranch : function( branch) {
			if (!branch) var branch = '';
			try {
				var array = this.getElemNames(branch);
				for (var i = 0; i < array.length; i++) {
					if (this.isPrefSetting(array[i])) {
						this.deleteValue(array[i]);
					}
				}
				Foxtrick.entry.init();
				return true;
			}
			catch (e) {
				Foxtrick.log(e);
				return false;
			}
		},
	}

	for (i in FoxtrickPrefsGecko)
		FoxtrickPrefs[i]=FoxtrickPrefsGecko[i];
}



// ----------------------  Chrome specific get/set preferences --------------------------
if (Foxtrick.BuildFor === "Chrome") {

	var FoxtrickPrefsChrome = {
		_user_prefs_chrome : {},
		_default_prefs_chrome : {}, 

		no_update_needed : {'last-host':true, 'last-page':true},

		init : function() {
			// init for chrome content is in loader_chrome

			// get prefrences
			// this is used when loading from options page, not valid
			// in content script since access to localStorage is forbidden
			if (Foxtrick.chromeContext() == "background") {
				try {
					// user preferences
					var length = localStorage.length;
					for (var i = 0; i < length; ++i) {
						var key = localStorage.key(i);
						var value = localStorage.getItem(key);
						try {
							this._user_prefs_chrome[key] = JSON.parse(value);
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
					for (var i = 0; i < prefList.length; ++i) {
						var pref = prefList[i];
						var matches = pref.match(prefRe);
						if (matches) {
							var key = matches[1];
							var value = matches[2];
							if (value == "true")
								this._default_prefs_chrome[key] = true;
							else if (value == "false")
								this._default_prefs_chrome[key] = false;
							else if (!isNaN(Number(value)))
								this._default_prefs_chrome[key] = Number(value)
							else if (value.match(/^"(.*)"$/))
								this._default_prefs_chrome[key] = String(value.match(/^"(.*)"$/)[1]);
						}
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}
			}
		},

		getString : function(key) {
			var value = this.getValue(key);
			if (typeof(value) == "string")
				return value;
			return null;
		},

		setString : function(key, value) {
			this.setValue(key, String(value));
		},

		getInt : function(key) {
			var value = this.getValue(key);
			if (typeof(value) == "number")
				return value;
			return null;
		},

		setInt : function(key, value) {
			this.setValue(key, Number(value));
		},

		getBool : function(key) {
			var value = this.getValue(key);
			if (typeof(value) == "boolean")
				return value;
			return null;
		},

		setBool : function(key, value) {
			this.setValue(key, Boolean(value));
		},

		getValue : function(key) {
			try { 
				// retrieve from local copy
				if (this._user_prefs_chrome[key] !== undefined)
					return this._user_prefs_chrome[key];
				else if (this._default_prefs_chrome[key] !== undefined)
					return this._default_prefs_chrome[key];
				else
					return null;
			}
			catch (e) {
				return null;
			}
		},
		
		setValue : function(key, value) {
			try {
				if (this._default_prefs_chrome[key] === value) {
					// deleting sets it back to the wanted default value
					if (Foxtrick.chromeContext() == "background") 
						localStorage.removeItem(key);
					else 
						delete (this._user_prefs_chrome[key]);  
				}
				else {
					if (this._user_prefs_chrome[key] !== value) {
						// not default and value changed
						if (Foxtrick.chromeContext() == "background") 
							localStorage.setItem(key, JSON.stringify(value));
						else
							this._user_prefs_chrome[key] = value;  
					}
				}
				if (Foxtrick.chromeContext() == "content") 
						chrome.extension.sendRequest({ req : "setValue", key : key, value : value });
				if (Foxtrick.chromeContext() == "background" && !this.no_update_needed[ key ] ) 
					localStorage.setItem("preferences.updated",'true');
			}
			catch (e) {}
		},

		/* get all preference entry keys under a branch.
		 * - if branch is "", return the names of all entries;
		 * - if branch is not "", return the names of entries with name
			 starting with the branch name.
		 */
		getElemNames : function(branch) {
			var array = [];
			for (var i in this._user_prefs_chrome) {
				if (i.indexOf(prefix) == 0)
					if (!this._default_prefs_chrome[i]) // only if not default to eliminate duplicacy
						array.push(i);
			}
			for (var i in this._default_prefs_chrome) {
				if (i.indexOf(prefix) == 0)
					array.push(i);
			}
			return array;
		},

		/** Populate list_name with given array deleting if exists */
		populateList : function(branch, values) {
			const keys = this.getElemNames(branch);
			for (var i = 0; i < keys.length; ++i) {
				this.deleteValue(keys[i]);
			}
			for (var i in values) {
				this.set(branch + "." + i, values[i]);
			}
		},

		deleteValue : function(key) {
			if (Foxtrick.chromeContext() == "background") {
				localStorage.removeItem(key);
				if ( !this.no_update_needed[key] ) 
					localStorage.setItem("preferences.updated", 'true');
			}
			else if (Foxtrick.chromeContext() == "content") {
				delete (this._user_prefs_chrome[key]);  
				chrome.extension.sendRequest({ req : "deleteValue", key : key }); 
			}
		},

		prefHasUserValue : function(key) {
			return (typeof(this._user_prefs_chrome[key])!='undefined');
		},
		
		cleanupBranch : function( branch) {
			if (!branch) var branch = '';
			if (Foxtrick.chromeContext() == "background") {
				for (var i in localStorage) {
					if (i.indexOf(branch)===0) 
						localStorage.removeItem(i);
				}
				localStorage["preferences.updated"] = true;
			}
			else {
				for (var i in this._user_prefs_chrome) {
					if (i.indexOf(branch)===0)  {
						delete this._user_prefs_chrome[i];
					}
				}
				chrome.extension.sendRequest(
					{ req : "clearPrefs", branch: branch },
					Foxtrick.entry.init );
				return true;
			}
		},
	};

	for (i in FoxtrickPrefsChrome)
		FoxtrickPrefs[i] = FoxtrickPrefsChrome[i];
}
