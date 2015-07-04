'use strict';
/**
 * prefs-util.js
 * Foxtrick preferences service
 * @author Mod-PaV, ryanli, convincedd
 */
////////////////////////////////////////////////////////////////////////////////

if (!Foxtrick)
	var Foxtrick = {};

Foxtrick.Prefs = {

	// --------------------- function stubs ----------------

	/**
	 * test if user has saved a custom value for key
	 * @param	key			pref key to check
	 * @returns	{Boolean}
	 */
	prefHasUserValue: function(key) {},

	/**
	 * get all preference entry keys under a branch.
	 * - if branch is '', return the names of all entries;
	 * - if branch is not '', return the names of entries with name
	 * starting with the branch name.
	 * @param	{string}	branch	branch to fetch
	 * @returns	{Array}				array of key names
	 */
	getAllKeysOfBranch: function(branch) {},

	/**
	 * remove a saved pref value
	 * @param	{string}	key		key to delete
	 */
	deleteValue: function(key) {},

	/**
	 * get an integer value from prefs
	 * @param	{string}	key		pref key
	 * @returns	{Integer}			pref value
	 */
	getInt: function(key) {},

	/**
	 * get a boolean value from prefs
	 * @param	{string}	key		pref key
	 * @returns	{Boolean}			pref value
	 */
	getBool: function(key) {},

	/**
	 * get a string value from prefs
	 * @param	{string}	key		pref key
	 * @returns	{string}			pref value
	 */
	getString: function(key) {},

	/**
	 * save an integer value in prefs
	 * @param	{string}	key		pref key
	 * @param	{Integer}	value	pref value
	 */
	setInt: function(key, value) {},

	/**
	 * save a boolean value in prefs
	 * @param	{string}	key		pref key
	 * @param	{Boolean}	value	pref value
	 */
	setBool: function(key, value) {},

	/**
	 * save a string value in prefs
	 * @param	{string}	key		pref key
	 * @param	{string}	value	pref value
	 */
	setString: function(key, value) {},

	/**
	 * get an entry from preferences with generic type,
	 * should not be used in modules!
	 * return null if not found
	 * @param	{string}	key	pref key
	 * @returns	{Object}		value
	 */
	get: function(key) {
		var val;
		if ((val = Foxtrick.Prefs.getString(key)) != null)
			return val;
		if ((val = Foxtrick.Prefs.getInt(key)) != null)
			return val;
		if ((val = Foxtrick.Prefs.getBool(key)) != null)
			return val;
		return null;
	},

	/**
	 * set a value in prefs
	 * should not be used in modules!
	 * must pass floats as strings!
	 * @param	{String}	key
	 * @param	{mixed}	value
	 */
	set: function(key, value) {
		var map = {
			'string': Foxtrick.Prefs.setString,
			'number': Foxtrick.Prefs.setInt,
			'boolean': Foxtrick.Prefs.setBool
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

		var values = Foxtrick.Prefs.getList(branch);

		// already exists?
		var exists = Foxtrick.has(values, value);

		if (exists)
			return false;

		values.push(value);
		Foxtrick.Prefs.populateList(branch, values);

		return true;
	},

	// returns a list in an array
	getList: function(branch) {
		var keys = Foxtrick.Prefs.getAllKeysOfBranch(branch);
		return Foxtrick.map(function(k) {
			return Foxtrick.Prefs.get(k);
		}, keys);
	},

	/** Remove a list element. */
	delListPref: function(branch, delValue) {
		var values = Foxtrick.Prefs.getList(branch);
		values = Foxtrick.filter(function(e) {
			return e != delValue;
		}, values);
		Foxtrick.Prefs.populateList(branch, values);
	},

	/** Populate list_name with given array deleting if exists */
	populateList: function(branch, values) {
		var keys = Foxtrick.Prefs.getAllKeysOfBranch(branch);
		for (var i = 0; i < keys.length; ++i) {
			Foxtrick.Prefs.deleteValue(keys[i]);
		}
		for (var i = 0; i < values.length; ++i) {
			Foxtrick.Prefs.set(decodeURI(branch + '.' + i), values[i]);
		}
	},


	// ---------------------- common function --------------------------------------

	// returns whether FoxTrick is enabled on doc
	isEnabled: function(doc) {
		if (Foxtrick.Prefs.getBool('disableOnStage') && Foxtrick.isStage(doc))
			return false;
		if (Foxtrick.Prefs.getBool('disableTemporary'))
			return false;
		return true;
	},

	isModuleEnabled: function(module) {
		if (typeof module === 'string')
			module = Foxtrick.modules[module];
		if (!module)
			return false;

		// core modules must be executed no matter what user's preference is
		if (module.CORE_MODULE)
			return true;

		return Foxtrick.Prefs.getBool('module.' + module.MODULE_NAME + '.enabled');
	},

	isModuleOptionEnabled: function(module, option) {
		if (typeof module !== 'string')
			module = module.MODULE_NAME;

		return Foxtrick.Prefs.getBool('module.' + module + '.' + option + '.enabled');
	},

	isModuleOptionSet: function(module, option) {
		if (typeof module !== 'string')
			module = module.MODULE_NAME;

		return Foxtrick.Prefs.prefHasUserValue('module.' + module + '.' + option + '.enabled');
	},

	setModuleEnableState: function(module, value) {
		if (typeof module !== 'string')
			module = module.MODULE_NAME;

		Foxtrick.Prefs.setBool('module.' + module + '.enabled', value);
	},

	setModuleOptionsText: function(module, value) {
		if (typeof module !== 'string')
			module = module.MODULE_NAME;

		Foxtrick.Prefs.setString('module.' + module, value);
	},

	getModuleValue: function(module) {
		if (typeof module !== 'string')
			module = module.MODULE_NAME;

		return Foxtrick.Prefs.getInt('module.' + module + '.value');
	},

	setModuleValue: function(module, value) {
		if (typeof module !== 'string')
			module = module.MODULE_NAME;

		Foxtrick.Prefs.setInt('module.' + module + '.value', value);
	},

	getModuleDescription: function(module) {
		if (typeof module !== 'string')
			module = module.MODULE_NAME;

		var name = 'module.' + module + '.desc';
		if (Foxtrick.L10n.isStringAvailable(name))
			return Foxtrick.L10n.getString(name);
		else {
			Foxtrick.log('Module not localized: ' + module + '.');
			return module;
		}
	},

	getModuleElementDescription: function(module, option) {
		if (typeof module !== 'string')
			module = module.MODULE_NAME;

		var name = 'module.' + module + '.' + option + '.desc';
		if (Foxtrick.L10n.isStringAvailable(name))
			return Foxtrick.L10n.getString(name);
		else {
			Foxtrick.log('Module option not localized: ' + module + '.' + option + '.');
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
					var array = Foxtrick.Prefs.getAllKeysOfBranch('module');
					for (var i = 0; i < array.length; i++) {
						if (Foxtrick.Prefs.isPrefSetting(array[i])) {
							Foxtrick.Prefs.deleteValue(array[i]);
						}
					}
					Foxtrick.Prefs.setBool('preferences.updated', true);
					Foxtrick.entry.init(true); // reinit
					return true;
				}
				catch (e) {
					Foxtrick.log(e);
					return false;
				}
			}
			else {
				Foxtrick.SB.ext.sendRequest({ req: 'clearPrefs' });
			}
		}
		else if (Foxtrick.arch == 'Sandboxed') {
			Foxtrick.Prefs._prefs_chrome_user = {};
			Foxtrick.SB.ext.sendRequest({ req: 'clearPrefs' }, function () {
				Foxtrick.entry.init(true); // reinit
			});
			return true;
		}
		return false;
	},

	disableAllModules: function() {
		try {
			var array = Foxtrick.Prefs.getAllKeysOfBranch('module');

			for (var i = 0; i < array.length; i++) {
				if (array[i].search(/enabled$/) != -1) {
					Foxtrick.Prefs.setBool(array[i], false);
				}
			}
			Foxtrick.Prefs.setBool('preferences.updated', true);
			Foxtrick.entry.init(true); // reinit
		}
		catch (e) {
			Foxtrick.log(e);
			return false;
		}
		return true;
	},
	/**
	 * Save preferences. Skips default values, CHPP tokens and notes by default
	 * @param  {{format, defaults, oauth, notes, prefs, skipFiles}} options export options
	 * @return {String}                                                     preferences
	 */
	save: function(options) {
		var opts = {
			format: 'user_pref("extensions.foxtrick.prefs.%key",%value);',
			defaults: false, // include default values
			oauth: false, // include CHPP tokens
			notes: false, // include templates, filters
			prefs: true, // other prefs
			skipFiles: false, // whether to exclude dataURIs
		};
		Foxtrick.mergeValid(opts, options);
		try {
			var ret = '';
			var array = Foxtrick.Prefs.getAllKeysOfBranch('');
			array.sort();
			array = Foxtrick.unique(array);
			var fileRe = /^data:\w+\/[\w\d.+-]+;base64,/;
			Foxtrick.map(function(key) {
				var isCustom = Foxtrick.Prefs.prefHasUserValue(key);
				var isRegular = Foxtrick.Prefs.isPrefSetting(key);
				var isOauth = (key.indexOf('oauth.') === 0);
				if (opts.defaults || isCustom) {
					if (isRegular && opts.prefs || isOauth && opts.oauth ||
					    !isRegular && !isOauth && opts.notes) {
						var item = opts.format.replace(/%key/, key);

						var value = null;
						if ((value = Foxtrick.Prefs.getString(key)) !== null) {
							if (!opts.skipFiles || !fileRe.test(value)) {
								value = value.replace(/\n/g, '\\n');
								item = item.replace(/%value/, '"' + value + '"');
							}
						}
						else if ((value = Foxtrick.Prefs.getInt(key)) !== null)
							item = item.replace(/%value/, value);
						else if ((value = Foxtrick.Prefs.getBool(key)) !== null)
							item = item.replace(/%value/, value);
						if (value !== null)
							ret += item + '\n';
					}
				}
			}, array);
			return ret;
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},

	load: function(string) {
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
				// skip old version
				try {
					if (key === 'oldVersion' && value.match(/\d+\.\d+(\.\d+)?/)[0] !==
						Foxtrick.version().match(/\d+\.\d+(\.\d+)?/)[0])
						continue;
				}
				catch (e) {}
				if (value === true || value === false || value === 'true' || value === 'false')
					Foxtrick.Prefs.setBool(key, (value === true || value == 'true'));
				else if (value.match(/^".+"$/))
					Foxtrick.Prefs.setString(key, value.match(/^"(.+)"$/)[1]);
				else if (!isNaN(value))
					Foxtrick.Prefs.setInt(key, Number(value));
			}
			catch (e) {
				Foxtrick.dump('Value: ' + matches[2]);
				Foxtrick.log(e);
			}
		}
		Foxtrick.Prefs.setBool('preferences.updated', true);
	},

	show: function(page) {
		if (!page)
			page = '#tab=main';
		Foxtrick.newTab(Foxtrick.InternalPath + 'preferences.html' + page);
	},

	disable: function(sender) {
		Foxtrick.Prefs.setBool('disableTemporary', !Foxtrick.Prefs.getBool('disableTemporary'));
		Foxtrick.modules.UI.update(sender);
		if (Foxtrick.arch === 'Gecko') {
			Foxtrick.entry.init(true); // reinit
			Foxtrick.reloadAll();
		}
	},
	highlight: function(sender) {
		Foxtrick.Prefs.setBool('featureHighlight', !Foxtrick.Prefs.getBool('featureHighlight'));
		Foxtrick.modules.UI.update(sender);
		if (Foxtrick.arch === 'Gecko') {
			Foxtrick.entry.init(true);  // reinit
		}
	},
	translationKeys: function(sender) {
		Foxtrick.Prefs.setBool('translationKeys', !Foxtrick.Prefs.getBool('translationKeys'));
		Foxtrick.modules.UI.update(sender);
		if (Foxtrick.arch === 'Gecko') {
			Foxtrick.entry.init(true); // reinit
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
			Foxtrick.Prefs._prefs_gecko = Services.prefs.getBranch('extensions.foxtrick.prefs.');
		},

		getString: function(key) {
			try {
				return Foxtrick.Prefs._prefs_gecko.getComplexValue(encodeURI(key),
						Ci.nsISupportsString).data;
			} catch (e) {
				return null;
			}
		},

		setString: function(key, value) {
			value = String(value);
			value = value.replace(/\\./g, unescape);
			if (Foxtrick.chromeContext() === 'content')
				Foxtrick.SB.ext.sendRequest({
					req: 'setValue',
					type: 'string',
					key: key,
					value: value
				});
			else {
				var str = Cc['@mozilla.org/supports-string;1'].
					createInstance(Ci.nsISupportsString);
				str.data = value;
				Foxtrick.Prefs._prefs_gecko.setComplexValue(encodeURI(key),
					Ci.nsISupportsString, str);
			}
		},

		getInt: function(key) {
			try {
				return Foxtrick.Prefs._prefs_gecko.getIntPref(encodeURI(key));
			} catch (e) {
				return null;
			}
		},

		setInt: function(key, value) {
			if (Foxtrick.chromeContext() === 'content')
				Foxtrick.SB.ext.sendRequest({
					req: 'setValue',
					type: 'int',
					key: key,
					value: value
				});
			else
				Foxtrick.Prefs._prefs_gecko.setIntPref(encodeURI(key), value);
		},

		getBool: function(key) {
			try {
				return Foxtrick.Prefs._prefs_gecko.getBoolPref(encodeURI(key));
			} catch (e) {
				return null;
			}
		},

		setBool: function(key, value) {
			if (Foxtrick.chromeContext() === 'content')
				Foxtrick.SB.ext.sendRequest({
					req: 'setValue',
					type: 'bool',
					key: key,
					value: value
				});
			else
				Foxtrick.Prefs._prefs_gecko.setBoolPref(encodeURI(key), value);
		},

		deleteValue: function(key) {
			if (Foxtrick.chromeContext() === 'background') {
				if (Foxtrick.Prefs._prefs_gecko.prefHasUserValue(encodeURI(key)))
					Foxtrick.Prefs._prefs_gecko.clearUserPref(encodeURI(key));   // reset to default
			}
			else {
				Foxtrick.SB.ext.sendRequest({ req: 'deleteValue', key: key });
			}
		},

		// set for fennec background script side
		setValue: function(key, value, type) {
			if (type == 'string') {
				value = value.replace(/\\./, unescape);
				Foxtrick.Prefs.setString(key, value);
			}
			else if (type == 'int')
				Foxtrick.Prefs.setInt(key, value);
			else if (type == 'bool')
				Foxtrick.Prefs.setBool(key, value);
		},

		prefHasUserValue: function(key) {
			return Foxtrick.Prefs._prefs_gecko.prefHasUserValue(key);
		},
		/* get all preference entry keys under a branch.
		 * - if branch is '', return the names of all entries;
		 * - if branch is not '', return the names of entries with name
			 starting with the branch name.
		 */
		getAllKeysOfBranch: function(branch) {
			var prefix = (branch == '') ? '' : encodeURI(branch + '.');
			var array = Foxtrick.Prefs._prefs_gecko.getChildList(prefix, {});
			for (var i = 0; i < array.length; ++i)
				array[i] = decodeURI(array[i]);
			return array;
		},
	};

	var i;
	for (i in FoxtrickPrefsGecko)
		Foxtrick.Prefs[i] = FoxtrickPrefsGecko[i];

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
			Foxtrick.Prefs.setValue(key, newVal);
		},

		getInt: function(key) {
			var value = Foxtrick.Prefs.getValue(key);
			if (typeof(value) == 'number')
				return value;
			return null;
		},

		setInt: function(key, value) {
			Foxtrick.Prefs.setValue(key, Number(value));
		},

		getBool: function(key) {
			var value = Foxtrick.Prefs.getValue(key);
			if (typeof(value) == 'boolean')
				return value;
			return null;
		},

		setBool: function(key, value) {
			Foxtrick.Prefs.setValue(key, Boolean(value));
		},

		getValue: function(key) {
			try {
				if (Foxtrick.Prefs._prefs_chrome_user[key] !== undefined)
					return Foxtrick.Prefs._prefs_chrome_user[key];
				else if (Foxtrick.Prefs._prefs_chrome_default[key] !== undefined)
					return Foxtrick.Prefs._prefs_chrome_default[key];
				else
					return null;
			}
			catch (e) {
				return null;
			}
		},

		prefHasUserValue: function(key) {
			return (typeof(Foxtrick.Prefs._prefs_chrome_user[key]) != 'undefined');
		},

		/* get all preference entry keys under a branch.
		 * - if branch is '', return the names of all entries;
		 * - if branch is not '', return the names of entries with name
			 starting with the branch name.
		 */
		getAllKeysOfBranch: function(branch) {
			var prefix = (branch == '') ? '' : encodeURI(branch + '.');
			var array = [], i;
			for (i in Foxtrick.Prefs._prefs_chrome_user) {
				if (i.indexOf(prefix) == 0)
					if (!Foxtrick.Prefs._prefs_chrome_default[i])
						// only if not default to eliminate duplicacy
						array.push(i);
			}
			for (i in Foxtrick.Prefs._prefs_chrome_default) {
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
					Foxtrick.Prefs._prefs_chrome_user = {};
					var length = localStorage.length;
					for (var i = 0; i < length; ++i) {
						var key = localStorage.key(i);
						if (key.indexOf('localStore') !== 0) {
							var value = localStorage.getItem(key);
							try {
								Foxtrick.Prefs._prefs_chrome_user[key] = JSON.parse(value);
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

					Foxtrick.Prefs._prefs_chrome_default = {};

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
									Foxtrick.Prefs._prefs_chrome_default[key] = true;
								else if (value == 'false')
									Foxtrick.Prefs._prefs_chrome_default[key] = false;
								else if (!isNaN(Number(value)))
									Foxtrick.Prefs._prefs_chrome_default[key] = Number(value);
								else if (value.match(/^"(.*)"$/))
									Foxtrick.Prefs._prefs_chrome_default[key] =
										String(value.match(/^"(.*)"$/)[1].replace(/\\./g, unescape));
							}
						}
					};

					parsePrefsFile('../defaults/preferences/foxtrick.js');
					if (Foxtrick.platform == 'Chrome')
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
					if (Foxtrick.Prefs._prefs_chrome_default[key] === value)
						Foxtrick.Prefs.deleteValue(key);
					else {
						Foxtrick.Prefs._prefs_chrome_user[key] = value; // not default, set it
						localStorage.setItem(key, JSON.stringify(value));
					}
				}
				catch (e) {}
			},

			deleteValue: function(key) {
				delete(Foxtrick.Prefs._prefs_chrome_user[key]);
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
					if (Foxtrick.Prefs._prefs_chrome_default[key] === value)
						// is default. deleteing user pref, will set it to default
						Foxtrick.Prefs.deleteValue(key);
					else {
						// not default, set it
						Foxtrick.Prefs._prefs_chrome_user[key] = value;
						Foxtrick.SB.ext.sendRequest({ req: 'setValue', key: key, value: value });
					}
				}
				catch (e) {}
			},

			deleteValue: function(key) {
				delete(Foxtrick.Prefs._prefs_chrome_user[key]);
				Foxtrick.SB.ext.sendRequest({ req: 'deleteValue', key: key });
			},
		};

		var i;
		for (i in FoxtrickPrefsChromeContent)
			FoxtrickPrefsChrome[i] = FoxtrickPrefsChromeContent[i];
	}

	var i;
	for (i in FoxtrickPrefsChrome)
		Foxtrick.Prefs[i] = FoxtrickPrefsChrome[i];
}

})();
