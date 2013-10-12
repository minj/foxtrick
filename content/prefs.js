'use strict';
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
	get: function(key) {
		var val;
		if ((val = FoxtrickPrefs.getString(key)) != null)
			return val;
		if ((val = FoxtrickPrefs.getInt(key)) != null)
			return val;
		if ((val = FoxtrickPrefs.getBool(key)) != null)
			return val;
		return null;
	},

	/**
	 * set a value in prefs
	 * must pass floats as strings!
	 * @param	{String}	key
	 * @param	{mixed}	value
	 */
	set: function(key, value) {
		var map = {
			'string': FoxtrickPrefs.setString,
			'number': FoxtrickPrefs.setInt,
			'boolean': FoxtrickPrefs.setBool
		};
		if (map[typeof(value)])
			map[typeof(value)](key, value);
		else
			throw 'Type error: value is ' + typeof(value);
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
	addPrefToList: function(branch, value) {
		if (value == '')
			return false;

		var values = FoxtrickPrefs.getList(branch);

		// already exists?
		var exists = Foxtrick.member(value, values);

		if (exists)
			return false;

		values.push(value);
		FoxtrickPrefs.populateList(branch, values);

		return true;
	},

	// returns a list in an array
	getList: function(branch) {
		var keys = FoxtrickPrefs.getAllKeysOfBranch(branch);
		return Foxtrick.map(function(k) {
			return FoxtrickPrefs.get(k);
		}, keys);
	},

	/** Remove a list element. */
	delListPref: function(branch, delValue) {
		var values = FoxtrickPrefs.getList(branch);
		values = Foxtrick.filter(function(e) {
			return e != delValue;
		}, values);
		FoxtrickPrefs.populateList(branch, values);
	},

	/** Populate list_name with given array deleting if exists */
	populateList: function(branch, values) {
		var keys = FoxtrickPrefs.getAllKeysOfBranch(branch);
		for (var i = 0; i < keys.length; ++i) {
			FoxtrickPrefs.deleteValue(keys[i]);
		}
		for (var i = 0; i < values.length; ++i) {
			FoxtrickPrefs.set(decodeURI(branch + '.' + i), values[i]);
		}
	},


	// ---------------------- common function --------------------------------------

	// returns whether FoxTrick is enabled on doc
	isEnabled: function(doc) {
		if (FoxtrickPrefs.getBool('disableOnStage') && Foxtrick.isStage(doc))
			return false;
		if (FoxtrickPrefs.getBool('disableTemporary'))
			return false;
		return true;
	},

	isModuleEnabled: function(moduleName) {
		// core modules must be executed no matter what user's preference is
		var obj = Foxtrick.modules[moduleName];
		if (!obj)
			return false;
		if (obj.CORE_MODULE)
			return true;
		return FoxtrickPrefs.getBool('module.' + moduleName + '.enabled');
	},

	isModuleOptionEnabled: function(moduleName, option) {
		return FoxtrickPrefs.getBool('module.' + moduleName + '.' + option + '.enabled');
	},

	setModuleEnableState: function(moduleName, value) {
		FoxtrickPrefs.setBool('module.' + moduleName + '.enabled', value);
	},

	setModuleOptionsText: function(moduleName, value) {
		FoxtrickPrefs.setString('module.' + moduleName, value);
	},

	getModuleValue: function(moduleName) {
		return FoxtrickPrefs.getInt('module.' + moduleName + '.value');
	},

	setModuleValue: function(moduleName, value) {
		FoxtrickPrefs.setInt('module.' + moduleName + '.value', value);
	},

	getModuleDescription: function(moduleName) {
		var name = 'module.' + moduleName + '.desc';
		if (Foxtrickl10n.isStringAvailable(name))
			return Foxtrickl10n.getString(name);
		else {
			Foxtrick.log('Module not localized: ' + moduleName + '.');
			return moduleName;
		}
	},

	getModuleElementDescription: function(moduleName, option) {
		var name = 'module.' + moduleName + '.' + option + '.desc';
		if (Foxtrickl10n.isStringAvailable(name))
			return Foxtrickl10n.getString(name);
		else {
			Foxtrick.log('Module option not localized: ' + moduleName + '.' + option + '.');
			return option;
		}
	},

	// personal settings to be skipped eg. when resetting
	isPrefSetting: function(key) {
		return key.indexOf('oauth') == -1
			&& key.indexOf('transferfilter') == -1
			&& key.indexOf('post_templates') == -1
			&& key.indexOf('mail_templates') == -1
			&& (key.indexOf('LinksCustom') == -1
				|| key.indexOf('LinksCustom.enabled') != -1);
	},

	//  ----------------- function for preference.js ---------------------------
	cleanupBranch: function() {
		if (Foxtrick.arch == 'Gecko') {
			if (Foxtrick.chromeContext() === 'background') {
				try {
					var array = FoxtrickPrefs.getAllKeysOfBranch('module');
					for (var i = 0; i < array.length; i++) {
						if (FoxtrickPrefs.isPrefSetting(array[i])) {
							FoxtrickPrefs.deleteValue(array[i]);
						}
					}
					FoxtrickPrefs.setBool('preferences.updated', true);
					Foxtrick.entry.init();
					return true;
				}
				catch (e) {
					Foxtrick.log(e);
					return false;
				}
			}
			else {
				sandboxed.extension.sendRequest({ req: 'clearPrefs' });
			}
		}
		else if (Foxtrick.arch == 'Sandboxed') {
			FoxtrickPrefs._prefs_chrome_user = {};
			sandboxed.extension.sendRequest({ req: 'clearPrefs' },
				Foxtrick.entry.init);
			return true;
		}
	},

	disableAllModules: function() {
		try {
			var array = FoxtrickPrefs.getAllKeysOfBranch('module');

			for (var i = 0; i < array.length; i++) {
				if (array[i].search(/enabled$/) != -1) {
					FoxtrickPrefs.setBool(array[i], false);
				}
			}
			FoxtrickPrefs.setBool('preferences.updated', true);
			Foxtrick.entry.init();
		}
		catch (e) {
			Foxtrick.log(e);
			return false;
		}
		return true;
	},

	SavePrefs: function(savePrefs, saveNotes, saveToken, userSettings, format) {
		// userSettings = null from prefs export -> output all including default
		// userSettings = true from forumyouthicon-pref-output-button -> output only non-default

		try {
			if (!format) format = 'user_pref("extensions.foxtrick.prefs.%key",%value);';
			var ret = '';
			var array = FoxtrickPrefs.getAllKeysOfBranch('');
			array.sort();
			for (var i = 0; i < array.length; i++) {
				var key = array[i];
				if (i > 0 && key == array[i - 1])
					continue; // some appear twice!?
				if (!userSettings || FoxtrickPrefs.prefHasUserValue(key)) {
					// output all or only non-default switch
					if ((FoxtrickPrefs.isPrefSetting(key) && savePrefs)
						|| (!FoxtrickPrefs.isPrefSetting(key) && key.indexOf('oauth.') == -1
						    && saveNotes)
						|| (key.indexOf('oauth') != -1 && saveToken)) {
						var item = format.replace(/%key/, key);

						var value = null;
						if ((value = FoxtrickPrefs.getString(key)) !== null)
							item = item.replace(/%value/, '"' + value.replace(/\n/g, '\\n') + '"');
						else if ((value = FoxtrickPrefs.getInt(key)) !== null)
							item = item.replace(/%value/, value);
						else if ((value = FoxtrickPrefs.getBool(key)) !== null)
							item = item.replace(/%value/, value);
						if (value !== null)
							ret += item + '\n';
					}
				}
			}
			return ret;
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},

	LoadPrefs: function(string) {
		var format = /user_pref\("extensions\.foxtrick\.prefs\.(.+?)",(.+)\);/;
		var lines = string.split('\n');
		for (var i = 0; i < lines.length; ++i) {
			try {
				var line = lines[i];
				var matches = line.match(format);
				if (!matches)
					continue;
				var key = matches[1];
				var value = matches[2];
				if (value === true || value === false || value === 'true' || value === 'false')
					FoxtrickPrefs.setBool(key, (value === true || value == 'true'));
				else if (value.match(/^".+"$/))
					FoxtrickPrefs.setString(key, value.match(/^"(.+)"$/)[1]);
				else if (!isNaN(value))
					FoxtrickPrefs.setInt(key, Number(value));
			}
			catch (e) {
				Foxtrick.dump('Value: ' + matches[2]);
				Foxtrick.log(e);
			}
		}
		FoxtrickPrefs.setBool('preferences.updated', true);
	},

	show: function(page) {
		if (!page) var page = '#tab=main';
		Foxtrick.newTab(Foxtrick.InternalPath + 'preferences.html' + page);
	},

	disable: function(sender) {
		FoxtrickPrefs.setBool('disableTemporary', !FoxtrickPrefs.getBool('disableTemporary'));
		Foxtrick.modules.UI.update(sender);
		if (Foxtrick.arch === 'Gecko') {
			Foxtrick.entry.init();
			Foxtrick.reloadAll();
		}
	},
	highlight: function(sender) {
		FoxtrickPrefs.setBool('featureHighlight', !FoxtrickPrefs.getBool('featureHighlight'));
		Foxtrick.modules.UI.update(sender);
		if (Foxtrick.arch === 'Gecko') {
			Foxtrick.entry.init();
		}
	},
	translationKeys: function(sender) {
		FoxtrickPrefs.setBool('translationKeys', !FoxtrickPrefs.getBool('translationKeys'));
		Foxtrick.modules.UI.update(sender);
		if (Foxtrick.arch === 'Gecko') {
			Foxtrick.entry.init();
		}
	}
};

// wrap browser-specific configuration to prevenr global scope pollution
(function() {

var unescape = function(escaped) {
	switch (escaped.charAt(1)) {
		case 't':
		case '\t':
			return '\t';
		case 'n':
			return '\n';
		case 'r':
			return String.fromCharCode(13);
		case ' ':
			return ' ';
		case '"':
			return '"';
		case '/':
			return '/';
		case '\\':
			return '\\';
		default:
			return escaped;
	}
};


// ----------------------  Gecko specific get/set preferences --------------------------
if (Foxtrick.arch === 'Gecko') {

	var FoxtrickPrefsGecko = {
		_prefs_gecko: null,

		init: function() {
			FoxtrickPrefs._prefs_gecko = Components
				.classes['@mozilla.org/preferences-service;1']
				.getService(Components.interfaces.nsIPrefService)
				.getBranch('extensions.foxtrick.prefs.');
		},

		getString: function(key) {
			try {
				return FoxtrickPrefs._prefs_gecko.getComplexValue(encodeURI(key),
						Components.interfaces.nsISupportsString).data;
			} catch (e) {
				return null;
			}
		},

		setString: function(key, value) {
			value = value.replace(/\\./g, unescape);
			if (Foxtrick.chromeContext() === 'content')
				sandboxed.extension.sendRequest({ req: 'setValue', type: 'string',
				                                key: key, value: value });
			else {
				var str = Components
					.classes['@mozilla.org/supports-string;1']
					.createInstance(Components.interfaces.nsISupportsString);
				str.data = value;
				FoxtrickPrefs._prefs_gecko.setComplexValue(encodeURI(key),
					Components.interfaces.nsISupportsString, str);
				}
		},

		getInt: function(key) {
			try {
				return FoxtrickPrefs._prefs_gecko.getIntPref(encodeURI(key));
			} catch (e) {
				return null;
			}
		},

		setInt: function(key, value) {
			if (Foxtrick.chromeContext() === 'content')
				sandboxed.extension.sendRequest({ req: 'setValue', type: 'int',
				                                key: key, value: value });
			else
				FoxtrickPrefs._prefs_gecko.setIntPref(encodeURI(key), value);
		},

		getBool: function(key) {
			try {
				return FoxtrickPrefs._prefs_gecko.getBoolPref(encodeURI(key));
			} catch (e) {
				return null;
			}
		},

		setBool: function(key, value) {
			if (Foxtrick.chromeContext() === 'content')
				sandboxed.extension.sendRequest({ req: 'setValue', type: 'bool',
				                                key: key, value: value });
			else
				FoxtrickPrefs._prefs_gecko.setBoolPref(encodeURI(key), value);
		},

		deleteValue: function(key) {
			if (Foxtrick.chromeContext() === 'background') {
				if (FoxtrickPrefs._prefs_gecko.prefHasUserValue(encodeURI(key)))
					FoxtrickPrefs._prefs_gecko.clearUserPref(encodeURI(key));   // reset to default
			}
			else {
				sandboxed.extension.sendRequest({ req: 'deleteValue', key: key });
			}
		},

		// set for fennec background script side
		setValue: function(key, value, type) {
			if (type == 'string')
				FoxtrickPrefs.setString(key, value);
			else if (type == 'int')
				FoxtrickPrefs.setInt(key, value);
			else if (type == 'bool')
				FoxtrickPrefs.setBool(key, value);
		},

		prefHasUserValue: function(key) {
			return FoxtrickPrefs._prefs_gecko.prefHasUserValue(key);
		},
		/* get all preference entry keys under a branch.
		 * - if branch is '', return the names of all entries;
		 * - if branch is not '', return the names of entries with name
			 starting with the branch name.
		 */
		getAllKeysOfBranch: function(branch) {
			var prefix = (branch == '') ? '' : encodeURI(branch + '.');
			var array = FoxtrickPrefs._prefs_gecko.getChildList(prefix, {});
			for (var i = 0; i < array.length; ++i)
				array[i] = decodeURI(array[i]);
			return array;
		},
	};

	var i;
	for (i in FoxtrickPrefsGecko)
		FoxtrickPrefs[i] = FoxtrickPrefsGecko[i];

}



// ----------------------  Chrome specific get/set preferences --------------------------
if (Foxtrick.arch === 'Sandboxed') {

	var FoxtrickPrefsChrome = {
		_prefs_chrome_user: {}, 	// contains mapped copies of user settings localStore.
		_prefs_chrome_default: {},	// defaults from foxtrick.prefs

		getString: function(key) {
			var value = this.getValue(key);
			if (typeof(value) == 'string')
				return value;
			return null;
		},

		setString: function(key, value) {
			var newVal = String(value);
			newVal = newVal.replace(/\\./g, unescape);
			FoxtrickPrefs.setValue(key, newVal);
		},

		getInt: function(key) {
			var value = FoxtrickPrefs.getValue(key);
			if (typeof(value) == 'number')
				return value;
			return null;
		},

		setInt: function(key, value) {
			FoxtrickPrefs.setValue(key, Number(value));
		},

		getBool: function(key) {
			var value = FoxtrickPrefs.getValue(key);
			if (typeof(value) == 'boolean')
				return value;
			return null;
		},

		setBool: function(key, value) {
			FoxtrickPrefs.setValue(key, Boolean(value));
		},

		getValue: function(key) {
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

		prefHasUserValue: function(key) {
			return (typeof(FoxtrickPrefs._prefs_chrome_user[key]) != 'undefined');
		},

		/* get all preference entry keys under a branch.
		 * - if branch is '', return the names of all entries;
		 * - if branch is not '', return the names of entries with name
			 starting with the branch name.
		 */
		getAllKeysOfBranch: function(branch) {
			var prefix = (branch == '') ? '' : encodeURI(branch + '.');
			var array = [], i;
			for (i in FoxtrickPrefs._prefs_chrome_user) {
				if (i.indexOf(prefix) == 0)
					if (!FoxtrickPrefs._prefs_chrome_default[i])
						// only if not default to eliminate duplicacy
						array.push(i);
			}
			for (i in FoxtrickPrefs._prefs_chrome_default) {
				if (i.indexOf(prefix) == 0)
					array.push(i);
			}
			return array;
		},
	};

	if (Foxtrick.chromeContext() == 'background') {

		var FoxtrickPrefsChromeBackground = {
			init: function() {
				// get prefrences
				// this is used when loading from options page, not valid
				// in content script since access to localStorage is forbidden
				try {
					// user preferences
					FoxtrickPrefs._prefs_chrome_user = {};
					var length = localStorage.length;
					for (var i = 0; i < length; ++i) {
						var key = localStorage.key(i);
						if (key.indexOf('localStore') !== 0) {
							var value = localStorage.getItem(key);
							try {
								FoxtrickPrefs._prefs_chrome_user[key] = JSON.parse(value);
							}
							catch (e) {
								Foxtrick.log('Preference parse error: key: ', key,
								             ', value: ', value);
							}
						}
						else {
							// we don't want our localStore to get passed to pages every page load
							// those values are access async with Foxtrick.localStore
						}
					}

					FoxtrickPrefs._prefs_chrome_default = {};

					var parsePrefsFile = function(url) {
						var prefText = Foxtrick.util.load.sync(Foxtrick.InternalPath + url);
						var prefList = prefText.split(/[\n\r]+/);
						var prefRe = /pref\("extensions\.foxtrick\.prefs\.(.+?)",\s*(.+)\);/;
						for (var i = 0; i < prefList.length; ++i) {
							var pref = prefList[i];
							var matches = pref.match(prefRe);
							if (matches) {
								var key = matches[1];
								var value = matches[2];
								if (value == 'true')
									FoxtrickPrefs._prefs_chrome_default[key] = true;
								else if (value == 'false')
									FoxtrickPrefs._prefs_chrome_default[key] = false;
								else if (!isNaN(Number(value)))
									FoxtrickPrefs._prefs_chrome_default[key] = Number(value);
								else if (value.match(/^"(.*)"$/))
									FoxtrickPrefs._prefs_chrome_default[key] =
										String(value.match(/^"(.*)"$/)[1].replace(/\\./g, unescape));
							}
						}
					};

					parsePrefsFile('../defaults/preferences/foxtrick.js');
					if (Foxtrick.platform == 'Opera')
						parsePrefsFile('../defaults/preferences/foxtrick.opera');
					else if (Foxtrick.platform == 'Chrome')
						parsePrefsFile('../defaults/preferences/foxtrick.chrome');
					else if (Foxtrick.platform == 'Safari')
						parsePrefsFile('../defaults/preferences/foxtrick.safari');

				}
				catch (e) {
					Foxtrick.log(e);
				}
			},

			// set and delete for background script side
			setValue: function(key, value) {
				if (typeof (value) == 'string')
					value = value.replace(/\\./g, unescape);
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

			deleteValue: function(key) {
				delete(FoxtrickPrefs._prefs_chrome_user[key]);
				localStorage.removeItem(key);
			},
		};

		var i;
		for (i in FoxtrickPrefsChromeBackground)
			FoxtrickPrefsChrome[i] = FoxtrickPrefsChromeBackground[i];
	}


	if (Foxtrick.chromeContext() == 'content') {
		// set and delete for contents script side
		var FoxtrickPrefsChromeContent = {

		setValue: function(key, value) {
			if (typeof (value) == 'string')
				value = value.replace(/\\./g, unescape);
			try {
				if (FoxtrickPrefs._prefs_chrome_default[key] === value)
					// is default. deleteing user pref, will set it to default
					FoxtrickPrefs.deleteValue(key);
				else {
					// not default, set it
					FoxtrickPrefs._prefs_chrome_user[key] = value;
					sandboxed.extension.sendRequest({ req: 'setValue', key: key, value: value });
				}
			}
			catch (e) {}
		},

		deleteValue: function(key) {
			delete(FoxtrickPrefs._prefs_chrome_user[key]);
			sandboxed.extension.sendRequest({ req: 'deleteValue', key: key });
		},
	};

		var i;
		for (i in FoxtrickPrefsChromeContent)
			FoxtrickPrefsChrome[i] = FoxtrickPrefsChromeContent[i];
	}

	var i;
	for (i in FoxtrickPrefsChrome)
		FoxtrickPrefs[i] = FoxtrickPrefsChrome[i];
}

})();
