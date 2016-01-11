'use strict';
/**
 * prefs-util.js
 * Foxtrick preferences service
 * @author Mod-PaV, ryanli, convincedd, LA-MJ
 */

// jscs:disable validateIndentation

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore:line

Foxtrick.Prefs = {

	// --------------------- function stubs ----------------
	// jshint ignore:start

	/**
	 * test if user has saved a custom value for key
	 *
	 * @param  key       pref key to check
	 * @return {Boolean}
	 */
	hasUserValue: function(key) {},

	/**
	 * get all preference entry keys under a branch.
	 * - if branch is '', return the names of all entries;
	 * - if branch is not '', return the names of entries with name
	 * starting with the branch name.
	 *
	 * @param  {string} branch branch to fetch
	 * @return {array}         array of key names
	 */
	getAllKeysOfBranch: function(branch) {},

	/**
	 * remove a saved pref value
	 *
	 * @param {string} key key to delete
	 */
	deleteValue: function(key) {},

	/**
	 * get an integer value from prefs
	 *
	 * @param  {string} key  pref key
	 * @return {number} pref value    {Integer}
	 */
	getInt: function(key) {},

	/**
	 * get a boolean value from prefs
	 *
	 * @param  {string}  key  pref key
	 * @return {Boolean} pref value
	 */
	getBool: function(key) {},

	/**
	 * get a string value from prefs
	 *
	 * @param  {string} key  pref key
	 * @return {string} pref value
	 */
	getString: function(key) {},

	/**
	 * save an integer value in prefs
	 *
	 * @param {string} key   pref key
	 * @param {number} value pref value {Integer}
	 */
	setInt: function(key, value) {},

	/**
	 * save a boolean value in prefs
	 *
	 * @param {string}  key   pref key
	 * @param {Boolean} value pref value
	 */
	setBool: function(key, value) {},

	/**
	 * save a string value in prefs
	 *
	 * @param {string} key   pref key
	 * @param {string} value pref value
	 */
	setString: function(key, value) {},

	// jshint ignore:end

	/**
	 * get an entry from preferences with generic type,
	 * should not be used in modules!
	 * return null if not found
	 *
	 * @param  {string} key   pref key
	 * @return {Object} value
	 */
	__getAny: function(key) {
		var val;
		if ((val = this.getString(key)) != null)
			return val;
		if ((val = this.getInt(key)) != null)
			return val;
		if ((val = this.getBool(key)) != null)
			return val;

		return null;
	},

	/**
	 * set a value in prefs
	 * should not be used in modules!
	 * must pass floats as strings!
	 *
	 * @param {string} key
	 * @param {mixed}  value
	 */
	__setAny: function(key, value) {
		var map = {
			string: this.setString,
			number: this.setInt,
			boolean: this.setBool,
		};

		var type = typeof value;
		if (map[type])
			map[type](key, value);
		else
			throw new TypeError('Type error: value is ' + type);
	},

	/**
	 * set a value in prefs with a specific type.
	 *
	 * type can be any of 'string', 'int', 'bool'.
	 * @param {string} type
	 * @param {string} key
	 * @param {mixed}  value
	 */
	setValueWithType: function(type, key, value) {
		if (type == 'string') {
			this.setString(key, value);
		}
		else if (type == 'int')
			this.setInt(key, value);
		else if (type == 'bool')
			this.setBool(key, value);
	},

	// -----------------------  list functions ----------------------------

	// list are sets of numbered settings which contain titles
	// and the values corresponding to that title
	// e.g. templatelist.0 = 'MyTemplate'
	// template.MyTemplate = 'Hello and Goodbye'

	/**
	 * Add a new preference with a value under a specified branch.
	 * Creates the list if not present.
	 * Returns true if added (false if empty or already on the list).
	 *
	 * @param {string} branch
	 * @param {string} value
	 */
	addPrefToList: function(branch, value) {
		if (!value)
			return false;

		var values = this.getList(branch);

		// already exists?
		var exists = Foxtrick.has(values, value);
		if (exists)
			return false;

		values.push(value);
		this.populateList(branch, values);

		return true;
	},

	// return a list in an array
	getList: function(branch) {
		var getNum = function(key) {
			var numStr = key.slice(branch.length + 1); // skip '.'
			return parseInt(numStr, 10);
		};

		var keys = this.getAllKeysOfBranch(branch);
		keys.sort(function(a, b) {
			var aNum = getNum(a) || 0;
			var bNum = getNum(b) || 0;
			return aNum - bNum;
		});

		return Foxtrick.map(function(k) {
			return Foxtrick.Prefs.__getAny(k);
		}, keys);
	},

	/** Remove a list element. */
	delListPref: function(branch, delValue) {
		var values = this.getList(branch);
		values = Foxtrick.filter(function(e) {
			return e != delValue;
		}, values);
		this.populateList(branch, values);
	},

	/** Populate list_name with given array deleting if exists */
	populateList: function(branch, values) {
		var keys = this.getAllKeysOfBranch(branch);
		for (var key of keys) {
			this.deleteValue(key);
		}
		for (var i = 0; i < values.length; ++i) {
			this.__setAny(decodeURI(branch + '.' + i), values[i]);
		}
	},


	// ---------------------- common function --------------------------------------

	// return whether Foxtrick is enabled on doc
	isEnabled: function(doc) {
		if (this.getBool('disableTemporary'))
			return false;
		if (this.getBool('disableOnStage') && Foxtrick.isStage(doc))
			return false;
		if (!this.getBool('runLoggedOff') && Foxtrick.isLoginPage(doc))
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

		return this.getBool('module.' + module.MODULE_NAME + '.enabled');
	},

	isModuleOptionEnabled: function(module, option) {
		if (module && typeof module === 'object')
			module = module.MODULE_NAME;

		return this.getBool('module.' + module + '.' + option + '.enabled');
	},

	isModuleOptionSet: function(module, option) {
		if (module && typeof module === 'object')
			module = module.MODULE_NAME;

		return this.hasUserValue('module.' + module + '.' + option + '.enabled');
	},

	setModuleEnableState: function(module, value) {
		if (module && typeof module === 'object')
			module = module.MODULE_NAME;

		this.setBool('module.' + module + '.enabled', value);
	},

	setModuleOptionsText: function(module, value) {
		if (module && typeof module === 'object')
			module = module.MODULE_NAME;

		this.setString('module.' + module, value);
	},

	getModuleValue: function(module) {
		if (module && typeof module === 'object')
			module = module.MODULE_NAME;

		return this.getInt('module.' + module + '.value');
	},

	setModuleValue: function(module, value) {
		if (module && typeof module === 'object')
			module = module.MODULE_NAME;

		this.setInt('module.' + module + '.value', value);
	},

	getModuleDescription: function(module) {
		if (module && typeof module === 'object')
			module = module.MODULE_NAME;

		var name = 'module.' + module + '.desc';
		if (Foxtrick.L10n.isStringAvailable(name)) {
			return Foxtrick.L10n.getString(name);
		}
		else {
			Foxtrick.log('Module not localized:', module);
			return module;
		}
	},

	getModuleElementDescription: function(module, option) {
		if (module && typeof module === 'object')
			module = module.MODULE_NAME;

		var name = 'module.' + module + '.' + option + '.desc';
		if (Foxtrick.L10n.isStringAvailable(name)) {
			return Foxtrick.L10n.getString(name);
		}
		else {
			Foxtrick.log('Module option not localized:', module + '.' + option);
			return option;
		}
	},

	// personal settings to be skipped e.g. when resetting
	isPrefSetting: function(key) {
		return key.indexOf('oauth') !== 0 &&
			key.indexOf('transferfilter') !== 0 &&
			key.indexOf('post_templates') !== 0 && key.indexOf('mail_templates') !== 0 &&
			(key.indexOf('LinksCustom') !== 0 || key.indexOf('LinksCustom.enabled') === 0);
	},

	//  ----------------- function for preference.js ---------------------------
	restore: function() {
		if (Foxtrick.arch == 'Gecko') {
			if (Foxtrick.context === 'background') {
				try {
					var keys = this.getAllKeysOfBranch('module');
					for (var key of keys) {
						if (this.isPrefSetting(key)) {
							this.deleteValue(key);
						}
					}
					this.setBool('preferences.updated', true);
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
			this._prefs_chrome_user = {};
			Foxtrick.SB.ext.sendRequest({ req: 'clearPrefs' }, function() {
				Foxtrick.entry.init(true); // reinit
			});
			return true;
		}
		return false;
	},

	disableAllModules: function() {
		try {
			var keys = this.getAllKeysOfBranch('module');

			for (var key of keys) {
				if (/enabled$/.test(key)) {
					this.setBool(key, false);
				}
			}
			this.setBool('preferences.updated', true);
			Foxtrick.entry.init(true); // reinit
		}
		catch (e) {
			Foxtrick.log(e);
			return false;
		}
		return true;
	},

	/**
	 * Save preferences.
	 * Skips default values, CHPP tokens and notes by default.
	 *
	 * options is {format: string, defaults, oauth, notes, prefs, skipFiles: boolean}
	 *
	 * @param  {object} options
	 * @return {string}         preferences
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

			var keys = this.getAllKeysOfBranch();
			keys.sort();
			keys = Foxtrick.unique(keys);

			var fileRe = /^data:\w+\/[\w\d.+-]+;base64,/;
			Foxtrick.map(function(key) {
				var isCustom = Foxtrick.Prefs.hasUserValue(key);
				var isRegular = Foxtrick.Prefs.isPrefSetting(key);
				var isOauth = key.indexOf('oauth.') === 0;

				if (opts.defaults || isCustom) {
					if (isRegular && opts.prefs || isOauth && opts.oauth ||
					    !isRegular && !isOauth && opts.notes) {

						var item = opts.format.replace(/%key/, key);

						var value = null;
						if ((value = Foxtrick.Prefs.getString(key)) !== null) {
							if (!opts.skipFiles || !fileRe.test(value)) {
								value = value.replace(/\n/g, '\\n');
								// README: quotes are not escaped here
								// the format regex takes care of it regardless
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
			}, keys);
			return ret;
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},

	unescape: function(escaped) {
		switch (escaped.charAt(1)) {
			case 't':
			case '\t':
				return '\t';
			case 'n':
				return '\n';
			case 'r':
				return '\r';
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
	},

	parsePrefs: function(string, eachCb) {
		var format = /(?:user_)?pref\("extensions\.foxtrick\.prefs\.(.+?)",(.+)\);/;
		// README: quotes are not escaped here, the format regex takes care of it regardless
		var stringRe = /^(["'])(.*)\1$/;

		var lines = string.split(/[\r\n]+/);
		for (var line of lines) {
			if (line === '')
				continue;

			var matches = line.match(format);
			if (!matches) {
				Foxtrick.log('Warning: faulty pref', line);
				continue;
			}

			var key = matches[1];
			var value = matches[2].trim();

			try {
				if (value === 'true' || value === 'false')
					eachCb(key, value === 'true');
				else if (stringRe.test(value))
					eachCb(key, value.match(stringRe)[2]);
				else if (!isNaN(parseInt(value, 10)))
					eachCb(key, parseInt(value, 10));
				else
					Foxtrick.log('Warning: faulty pref', key, value);
			}
			catch (e) {
				Foxtrick.log('Error in parsePrefs', e);
			}
		}
	},

	load: function(string) {
		var versionRe = /\d+\.\d+(\.\d+)?/;
		var version = Foxtrick.version.match(versionRe)[0];

		this.parsePrefs(string, function(key, value) {
			try {
				// skip old version
				if (key === 'oldVersion' && value.match(versionRe)[0] !== version)
					return;
			}
			catch (e) {
				return;
			}

			Foxtrick.Prefs.__setAny(key, value);
		});
		this.setBool('preferences.updated', true);
	},

	show: function(page) {
		if (!page)
			page = '#tab=main';

		Foxtrick.newTab(Foxtrick.InternalPath + 'preferences.html' + page);
	},

	disable: function(sender) {
		this.setBool('disableTemporary', !this.getBool('disableTemporary'));
		Foxtrick.modules.UI.update(sender);
		if (Foxtrick.arch === 'Gecko') {
			Foxtrick.entry.init(true); // reinit
			Foxtrick.reloadAll();
		}
	},
	highlight: function(sender) {
		this.setBool('featureHighlight', !this.getBool('featureHighlight'));
		Foxtrick.modules.UI.update(sender);
		if (Foxtrick.arch === 'Gecko') {
			Foxtrick.entry.init(true); // reinit
		}
	},
	translationKeys: function(sender) {
		this.setBool('translationKeys', !this.getBool('translationKeys'));
		Foxtrick.modules.UI.update(sender);
		if (Foxtrick.arch === 'Gecko') {
			Foxtrick.entry.init(true); // reinit
		}
	},
};

// wrap browser-specific configuration to prevenr global scope pollution
(function() {

// ----------------------  Gecko specific get/set preferences --------------------------
if (Foxtrick.arch === 'Gecko') {

	var NSI_STR = Ci.nsISupportsString;

	var FoxtrickPrefsGecko = {
		_prefs_gecko: null,

		init: function() {
			this._prefs_gecko = Services.prefs.getBranch('extensions.foxtrick.prefs.');
		},

		getString: function(key) {
			try {
				return this._prefs_gecko.getComplexValue(encodeURI(key), NSI_STR).data;
			}
			catch (e) {
				return null;
			}
		},

		setString: function(key, value) {
			value = String(value);
			if (Foxtrick.context === 'content') {
				Foxtrick.SB.ext.sendRequest({
					req: 'setValue',
					type: 'string',
					key: key,
					value: value,
				});
			}
			else {
				value = value.replace(/\\./g, this.unescape);
				var str = Cc['@mozilla.org/supports-string;1'].createInstance(NSI_STR);
				str.data = value;

				this._prefs_gecko.setComplexValue(encodeURI(key), NSI_STR, str);
			}
		},

		getInt: function(key) {
			try {
				return this._prefs_gecko.getIntPref(encodeURI(key));
			}
			catch (e) {
				return null;
			}
		},

		setInt: function(key, value) {
			if (Foxtrick.context === 'content') {
				Foxtrick.SB.ext.sendRequest({
					req: 'setValue',
					type: 'int',
					key: key,
					value: value,
				});
			}
			else
				this._prefs_gecko.setIntPref(encodeURI(key), value);
		},

		getBool: function(key) {
			try {
				return this._prefs_gecko.getBoolPref(encodeURI(key));
			}
			catch (e) {
				return null;
			}
		},

		setBool: function(key, value) {
			if (Foxtrick.context === 'content') {
				Foxtrick.SB.ext.sendRequest({
					req: 'setValue',
					type: 'bool',
					key: key,
					value: value,
				});
			}
			else
				this._prefs_gecko.setBoolPref(encodeURI(key), value);
		},

		deleteValue: function(key) {
			if (Foxtrick.context === 'background') {
				if (this._prefs_gecko.prefHasUserValue(encodeURI(key)))
					this._prefs_gecko.clearUserPref(encodeURI(key)); // reset to default
			}
			else {
				Foxtrick.SB.ext.sendRequest({ req: 'deleteValue', key: key });
			}
		},

		hasUserValue: function(key) {
			return this._prefs_gecko.hasUserValue(key);
		},
		/* get all preference entry keys under a branch.
		 * - if branch is '', return the names of all entries;
		 * - if branch is not '', return the names of entries with name
			 starting with the branch name.
		 */
		getAllKeysOfBranch: function(branch) {
			var prefix = !branch ? '' : encodeURI(branch + '.');
			var keys = this._prefs_gecko.getChildList(prefix, {});
			return Foxtrick.map(function(key) {
				return decodeURI(key);
			}, keys);
		},
	};

	for (var fpg in FoxtrickPrefsGecko) {
		Foxtrick.Prefs[fpg] = FoxtrickPrefsGecko[fpg];
	}
}



// ----------------------  Chrome specific get/set preferences --------------------------
if (Foxtrick.arch === 'Sandboxed') {

	var FoxtrickPrefsChrome = {
		_prefs_chrome_user: {}, // contains mapped copies of user settings localStore.
		_prefs_chrome_default: {}, // defaults from foxtrick.prefs

		getString: function(key) {
			var value = this.getValue(key);
			if (typeof value === 'string')
				return value;

			return null;
		},

		setString: function(key, value) {
			var newVal = String(value);
			this.__setValue(key, newVal);
		},

		getInt: function(key) {
			var value = this.getValue(key);
			if (typeof value === 'number')
				return value;

			return null;
		},

		setInt: function(key, value) {
			this.__setValue(key, parseInt(value, 10) || 0);
		},

		getBool: function(key) {
			var value = this.getValue(key);
			if (typeof value === 'boolean')
				return value;

			return null;
		},

		setBool: function(key, value) {
			this.__setValue(key, Boolean(value));
		},

		getValue: function(key) {
			if (key in this._prefs_chrome_user)
				return this._prefs_chrome_user[key];
			else if (key in this._prefs_chrome_default)
				return this._prefs_chrome_default[key];
			else
				return null;
		},

		hasUserValue: function(key) {
			return key in this._prefs_chrome_user;
		},

		/* get all preference entry keys under a branch.
		 * - if branch is '', return the names of all entries;
		 * - if branch is not '', return the names of entries with name
			 starting with the branch name.
		 */
		getAllKeysOfBranch: function(branch) {
			var prefix = !branch ? '' : encodeURI(branch + '.');

			var ret = [];

			for (var userKey in this._prefs_chrome_user) {
				if (userKey.indexOf(prefix) === 0) {
					if (!(userKey in this._prefs_chrome_default)) {
						// only if not in default to eliminate duplicates
						ret.push(userKey);
					}
				}
			}

			for (var key in this._prefs_chrome_default) {
				if (key.indexOf(prefix) === 0)
					ret.push(key);
			}

			return ret;
		},
	};

	if (Foxtrick.context == 'background') {

		var FoxtrickPrefsChromeBackground = {
			init: function() {
				// get preferences
				// this is used when loading from options page, not valid
				// in content script since access to localStorage is forbidden
				try {
					// user preferences
					this._prefs_chrome_user = {};
					var length = localStorage.length;
					for (var i = 0; i < length; ++i) {
						var key = localStorage.key(i);
						if (key.indexOf('localStore') !== 0) {
							// we don't want our localStore to get passed to pages every page load
							// those values are accessed async with Foxtrick.localStore

							var value = localStorage.getItem(key);
							try {
								this._prefs_chrome_user[key] = JSON.parse(value);
							}
							catch (e) {
								Foxtrick.log('Preference parse error: key:', key, 'value:', value);
							}
						}
					}

					this._prefs_chrome_default = {};

					var parsePrefsFile = function(url) {
						var string = Foxtrick.util.load.sync(Foxtrick.InternalPath + url);
						Foxtrick.Prefs.parsePrefs(string, function(key, value) {
							Foxtrick.Prefs._prefs_chrome_default[key] = value;
						});
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
			__setValue: function(key, value) {
				if (typeof value === 'string')
					value = value.replace(/\\./g, this.unescape);

				try {
					if (this._prefs_chrome_default[key] === value) {
						this.deleteValue(key);
					}
					else {
						this._prefs_chrome_user[key] = value; // not default, set it
						localStorage.setItem(key, JSON.stringify(value));
					}
				}
				catch (e) {}
			},

			deleteValue: function(key) {
				delete this._prefs_chrome_user[key];
				localStorage.removeItem(key);
			},
		};

		for (var fpcb in FoxtrickPrefsChromeBackground) {
			FoxtrickPrefsChrome[fpcb] = FoxtrickPrefsChromeBackground[fpcb];
		}
	}


	if (Foxtrick.context == 'content') {
		// set and delete for contents script side
		var FoxtrickPrefsChromeContent = {

			__setValue: function(key, value) {

				// using a temp var to prevent double unescaping on the background side
				var temp = value;
				if (typeof value === 'string')
					temp = value.replace(/\\./g, this.unescape);

				try {
					if (this._prefs_chrome_default[key] === temp) {
						// is default. deleting user pref, will set it to default
						this.deleteValue(key);
					}
					else {
						// not default, set it
						this._prefs_chrome_user[key] = temp;
						Foxtrick.SB.ext.sendRequest({ req: 'setValue', key: key, value: value });
					}
				}
				catch (e) {}
			},

			deleteValue: function(key) {
				delete this._prefs_chrome_user[key];
				Foxtrick.SB.ext.sendRequest({ req: 'deleteValue', key: key });
			},
		};

		for (var fpcc in FoxtrickPrefsChromeContent) {
			FoxtrickPrefsChrome[fpcc] = FoxtrickPrefsChromeContent[fpcc];
		}
	}

	for (var fpc in FoxtrickPrefsChrome) {
		Foxtrick.Prefs[fpc] = FoxtrickPrefsChrome[fpc];
	}
}

})();
