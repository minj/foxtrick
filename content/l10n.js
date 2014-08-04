'use strict';
/**
 * l10n.js
 * Localization tools.
 */
////////////////////////////////////////////////////////////////////////////////
if (!Foxtrick)
	var Foxtrick = {};

Foxtrick.L10n = {
	locales: [
		// english names and ids are also in chpps worldlanguages.xml
		'ar',	// العربية, arabic	22
		'az',	// Azərbaycanca, azerbaijani 100
		'be',	// Беларуская, belorus	84
		'bg',	// Български, bulgarian	43
		'bs',	// Bosanski	58
		'ca',	// Català, catalan	66
		'cs',	// Čeština, czech	35
		'da',	// Dansk, danish	8
		'de',	// Deutsch, german	3
		'el',	// Ελληνικά, greek	34
		'en',	// english	2
		'es-ES',	// Español	103
		'es-CR',	//Español centro-americano	51
		'es-AR',	// Español Sudamericano	6
		'et',	// Eesti	36
		'eu',	// Euskara, basque	110
		'fa',	// فارسی, farsi, iranian	75
		'fi',	// Suomi, finnish	9
		'fr',	// french	5
		'fur-IT',	// Furlan, northitaly	113
		'fy-NL',	// Frysk, east-netherland/north germany	109
		'gl',	// Galego, galician	74
		'he',	// עברית, hebrew	40
		'hr',	// Hrvatski, croatian	39
		'hu',	// Magyar, hungarian	33
		'is',	// Íslenska, island	25
		'it',	// italian	4
		'ja',	// 日本語, japanese	12
		'ka',	// Georgian	90
		'ko',	// 한국어, korean	17
		'lb',	// Lëtzebuergesch	111
		'lt',	// Lietuvių	56
		'lv',	// Latviešu	37
		'mk',	// Македонски, macedonian	83
		'mt',	// Malti	87
		'nl',	// netherlands	10
		'nn-NO',	// Norsk nynorsk	136
		'no',	// Norsk bokmål	7
		'pl',	// Polski	13
		'pt-PT',	// Português	11
		'pt-BR',	// Português brasil	50
		'ro',	// Română, romanian	23
		'ru',	// Русский, russain 	14
		'sk',	// Slovenčina, slovak	53
		'sl',	// Slovenščina, slovenian 	45
		'sq',	// Albanian	85
		'sr',	// Српски, serbian	32
		'sv-SE',	// Svenska, swedish	1
		'tr',	// Türkçe	19
		'uk',	// Українська, ukranian	57
		'vi',	// Tiếng Việt, vietnamese	55
		'vls-BE',	// Vlaams, netherland	65
		'zh-CN'	// 中文（简体）, chinese	15
				// Kyrgyz	86
	],
	htMapping: {
		'ar': 'ar',	// العربية, arabic	22
		'az': 'az', // Azərbaycanca, azerbaijani
		'be': 'be',	// Беларуская, belorus	84
		'bg': 'bg',	// Български, bulgarian	43
		'bs': 'bs',	// Bosanski	58
		'ca': 'ca',	// Català, catalan	66
		'cs': 'cs',	// Čeština, czech	35
		'da': 'da',	// Dansk, danish	8
		'de': 'de',	// Deutsch, german	3
		'el': 'el',	// Ελληνικά, greek	34
		'en': 'en',	// english	2
		'es': 'es-ES',	// Español	103
		'es-mx': 'es-CR',	//Español centro-americano	51
		'es-ar': 'es-AR',	// Español Sudamericano	6
		'et': 'et',	// Eesti	36
		'eu': 'eu',	// Euskara, basque	110
		'fa': 'fa',	// فارسی, farsi, iranian	75
		'fi': 'fi',	// Suomi, finnish	9
		'fr': 'fr',	// french	5
		'fu': 'fur-IT',	// Furlan, northitaly	113
		'fy': 'fy-NL',	// Frysk, east-netherland/north germany	109
		'gl': 'gl',	// Galego, galician	74
		'he': 'he',	// עברית, hebrew	40
		'hr': 'hr',	// Hrvatski, croatian	39
		'hu': 'hu',	// Magyar, hungarian	33
		'is': 'is',	// Íslenska, island	25
		'it': 'it',	// italian	4
		'ja': 'ja',	// 日本語, japanese	12
		'ka': 'ka',	// Georgian	90
		'ko': 'ko',	// 한국어, korean	17
		'lb': 'lb',	// Lëtzebuergesch	111
		'lt': 'lt',	// Lietuvių	56
		'lv': 'lv',	// Latviešu	37
		'mk': 'mk',	// Македонски, macedonian	83
		'mt': 'mt',	// Malti	87
		'nl': 'nl',	// netherlands	10
		'nn-no': 'nn-NO',	// Norsk nynorsk	136
		'nn': 'no',	// Norsk bokmål	7
		'pl': 'pl',	// Polski	13
		'pt': 'pt-PT',	// Português	11
		'pt-br': 'pt-BR',	// Português brasil	50
		'ro': 'ro',	// Română, romanian	23
		'ru': 'ru',	// Русский, russain 	14
		'sk': 'sk',	// Slovenčina, slovak	53
		'sl': 'sl',	// Slovenščina, slovenian 	45
		'sq': 'sq',	// Albanian	85
		'sr': 'sr',	// Српски, serbian	32
		'sv': 'sv-SE',	// Svenska, swedish	1
		'tr': 'tr',	// Türkçe	19
		'uk': 'uk',	// Українська, ukranian	57
		'vi': 'vi',	// Tiếng Việt, vietnamese	55
		'vl': 'vls-BE',	// Vlaams, netherland	65
		'zh': 'zh-CN'	// 中文（简体）, chinese	15
				// Kyrgyz	86
	},

	htLanguagesJSON: {},

	// for plural form rule ids see
	// https://developer.mozilla.org/en/Localization_and_Plurals
	plForm: 0,  // plural form of selected language
	plForm_default: 0, // plural form of default language

	/**
	 * test if string is localized
	 * @param	{string}	str	locale key
	 * @return	{Boolean}
	 */
	isStringAvailableLocal: function(str) {},

	/**
	 * test if string exists
	 * @param	{string}	str	locale key
	 * @return	{Boolean}
	 */
	isStringAvailable: function(str) {},

	/**
	 * get string localization
	 * optionally get the correct plural form
	 * throws if string is n/a
	 * uses last plural if matching fails
	 * @param	{string}	str	locale key
	 * @param	{[Integer]}	num	number to substitute in plural (optional)
	 * @return	{string}
	 */
	getString: function(str, num) {},

	/**
	 * Get the value of a certain property from htlang.json.
	 * The query object {category, filter, value, property}
	 * specifies search parameters:
	 * string category to look in (e. g. 'levels');
	 * property to look for (e. g. 'text');
	 * reference (filter) property and it's value (e. g. 'value' = '6').
	 * Optionally lang specifies language code to look in (defaults to user lang).
	 * @param  {Object} query {category, filter, value, property}
	 * @param  {string} lang  language code
	 * @return {string}       property value
	 */
	getHTLangProperty: function(query, lang) {
		var prop = null;
		if (!lang)
			lang = Foxtrick.Prefs.getString('htLanguage');
		var json = Foxtrick.L10n.htLanguagesJSON[lang].language;
		var array = json[query.category];
		if (Array.isArray(array)) {
			var el = Foxtrick.nth(function(e) {
				return e[query.filter] == query.value;
				// return new RegExp('^' + e[query.filter], 'i').test(query.value);
			}, array);
			if (el && typeof el === 'object' && query.property in el)
				prop = el[query.property];
		}
		return prop;
	},

	/**
	 * Get the value of a certain property from htlang.json.
	 * The query object {category, filter, value, property}
	 * specifies search parameters:
	 * string category to look in (e. g. 'levels');
	 * property to look for (e. g. 'text');
	 * reference (filter) property and it's value (e. g. 'value' = '6').
	 * Optionally lang specifies language code to look in (defaults to user lang).
	 * If property is not found English is looked up instead.
	 * If that also fails, raw value is returned.
	 * @param  {Object} query {category, filter, value, property}
	 * @param  {string} lang  language code
	 * @return {string}       property value
	 */
	getLocalOrEnglish: function(query, lang) {
		if (!lang)
			lang = Foxtrick.Prefs.getString('htLanguage');
		var text = this.getHTLangProperty(query, lang);
		if (text === null) {
			var header = 'Requested ' + query.category + ':' + query.property +
				' with ' + query.filter + '=' + query.value;
			Foxtrick.error(header + ' does not exist in locale ' + lang + ', trying en instead.');
			text = this.getHTLangProperty(query, 'en');
			if (text === null) {
				Foxtrick.error(header + ' does not exist, returning raw value.');
				text = query.value;
			}
		}
		return text;
	},

	// this function returns level including decimal subs from text.
	getLevelFromText: function(text) {
		var level = null, sublevel = 0;
		var lang = Foxtrick.Prefs.getString('htLanguage');
		var json = Foxtrick.L10n.htLanguagesJSON[lang].language;

		var levels = json.levels;
		for (var i = 0; i < levels.length; ++i) {
			var leveltext = levels[i].text;
			if (new RegExp('^' + leveltext, 'i').test(text)) {
				level = parseInt(levels[i].value, 10);
				break;
			}
		}
		if (level === null)
			return null;

		var ratingSubLevels = json.ratingSubLevels;
		for (var i = 0; i < ratingSubLevels.length; ++i) {
			var subleveltext = ratingSubLevels[i].text.replace(/([()])/g, '\\$1');
			if (new RegExp(subleveltext + '\\)?$', 'i').test(text)) {
				//using \)? in case LAs remove ) from subleveltext
				sublevel = parseInt(ratingSubLevels[i].value, 10);
				break;
			}
		}

		return level + sublevel;
	},

	getTextByLevel: function(value) {
		var query = {
			category: 'levels',
			property: 'text',
			filter: 'value',
			value: value,
		};
		return this.getLocalOrEnglish(query);
	},


	// this function returns level string of given level type and numeral value.
	// type could be levels, for normal skills;
	// agreeability, honesty, and aggressiveness, which are all obvious.
	getLevelByTypeAndValue: function(type, val) {
		var query = {
			category: type,
			property: 'text',
			filter: 'value',
			value: val,
		};
		return this.getLocalOrEnglish(query);
	},

	getSublevelByValue: function(val) {
		var query = {
			category: 'ratingSubLevels',
			property: 'text',
			filter: 'value',
			value: val,
		};
		var text = this.getLocalOrEnglish(query);
		if (!text.match(/\(/))
			// some LAs (wrongfully) add parathesis here. For others we need our own
			text = '(' + text + ')';
		return text;
	},

	getFullLevelByValue: function(val) {
		var main = Math.floor(val);
		var sub = val - main;
		if (sub >= 0 && sub < 0.25) {
			sub = '0';
		}
		else if (sub >= 0.25 && sub < 0.5) {
			sub = '0.25';
		}
		else if (sub >= 0.5 && sub < 0.75) {
			sub = '0.5';
		}
		else if (sub >= 0.75 && sub < 1) {
			sub = '0.75';
		}
		var mainStr = this.getLevelByTypeAndValue('levels', main);
		var subStr = this.getSublevelByValue(sub);
		return mainStr + ' ' + subStr;
	},

	getTacticById: function(id) {
		var tactics = [
			'normal', //: 0,
			'pressing', //: 1,
			'ca', //: 2,
			'aim', //:3,
			'aow', //: 4,
			'', //: 5, (N/A)
			'', //: 6, (N/A)
			'creatively', //: 7,
			'longshots', //: 8
		];

		var query = {
			category: 'tactics',
			property: 'value',
			filter: 'type',
			value: tactics[id],
		};
		return this.getLocalOrEnglish(query);
	},

	getShortPosition: function(pos) {
		var direct = function() {
			var space = pos.search(/ /);
			if (space == -1) {
				return pos.substr(0, 2);
			}
			else {
				return pos.substr(0, 1) + pos.substr(space + 1, 1);
			}
		};
		var shortPos = '';
		try {
			var query = {
				category: 'positions',
				property: 'type',
				filter: 'value',
				value: pos,
			};
			var type = this.getHTLangProperty(query);
			shortPos = Foxtrick.L10n.getString('match.pos.' + type + '.abbr');
		}
		catch (e) {
			Foxtrick.log(e);
		}
		return shortPos || direct();
	},

	getShortSpecialityFromEnglish: function(spec) {
		Foxtrick.L10n.getString('specialty.' + spec + '.abbr');
	},

	getEnglishSpeciality: function(spec) {
		if (!spec)
			return '';
		try {
			var query = {
				category: 'specialties',
				property: 'type',
				filter: 'value',
				value: spec,
			};
			return this.getHTLangProperty(query);
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},

	getEnglishSpecialityFromNumber: function(number) {
		var specs = [
			'',
			'Technical',
			'Quick',
			'Powerful',
			'Unpredictable',
			'Head',
			'Regainer',
		];
		var spec = specs[number];
		return spec || '';
	},
	getSpecialityFromNumber: function(number) {
		var spec = this.getEnglishSpecialityFromNumber(number);
		var query = {
			category: 'specialties',
			property: 'value',
			filter: 'type',
			value: spec,
		};
		return this.getHTLangProperty(query) || spec;
	},

	getNumberFromSpeciality: function(speciality) {
		var engSpec = this.getEnglishSpeciality(speciality);
		var specs = [
			'',
			'Technical',
			'Quick',
			'Powerful',
			'Unpredictable',
			'Head',
			'Regainer',
		];
		var idx = Foxtrick.indexOf(specs, engSpec);
		if (idx === -1)
			return 0;
		return idx;
	},

	getCategoryId: function(cat) {
		var categories = [null, 'GK', 'WB', 'CD', 'W', 'IM', 'FW', 'S', 'R', 'E1', 'E2'];
		var idx = Foxtrick.indexOf(categories, cat);
		if (idx < 1)
			return 0;
		return idx;
	},
	getCategoryById: function(id) {
		var categories = [null, 'GK', 'WB', 'CD', 'W', 'IM', 'FW', 'S', 'R', 'E1', 'E2'];
		return categories[id] || null;
	},

	getPositionTypeById: function(id) {
		var type = null;
		var idToPosition = {
			100: 'Keeper',
			101: 'WingBack',
			102: 'CentralDefender',
			103: 'CentralDefender',
			104: 'CentralDefender',
			105: 'WingBack',
			106: 'Winger',
			107: 'InnerMidfield',
			108: 'InnerMidfield',
			109: 'InnerMidfield',
			110: 'Winger',
			111: 'Forward',
			112: 'Forward',
			113: 'Forward',
			114: 'Substitution (Keeper)',
			115: 'Substitution (Defender)',
			116: 'InnerMidfield',
			117: 'Substitution (Winger)',
			118: 'Substitution (Forward)',
			17: 'Set pieces',
			18: 'Captain',
			19: 'Replaced Player #1',
			20: 'Replaced Player #2',
			21: 'Replaced Player #3',
		};
		if (id in idToPosition)
			type = idToPosition[id];
		return type;
	},

	getPositionByType: function(val) {
		var query = {
			category: 'positions',
			property: 'value',
			filter: 'type',
			value: val,
		};
		return this.getLocalOrEnglish(query);
	},
	getPositionType: function(pos) {
		var query = {
			category: 'positions',
			property: 'type',
			filter: 'value',
			value: pos,
		};
		return this.getHTLangProperty(query);
	},

};

// ----------------------  Gecko specific get/set preferences --------------------------
if (Foxtrick.arch === 'Gecko') {
	(function() {

	// import PluralForm into it's own scope
	// otherwise fennec fails during first install/update:
	// Could not set symbol 'PluralForm' on target object
	// probably because 'this' is undefined

	var plScope = {};
	Cu.import('resource://gre/modules/PluralForm.jsm', plScope);

	var FoxtrickL10nGecko = {

		// mozilla string bundles of localizations and screenshot links
		_strings_bundle: null,
		_strings_bundle_default: null,
		_strings_bundle_screenshots: null,
		_strings_bundle_screenshots_default: null,

		init: function() {
			if (Foxtrick.chromeContext() === 'background') {
				// get htlang.json for each locale
				for (var i = 0; i < Foxtrick.L10n.locales.length; ++i) {
					var locale = Foxtrick.L10n.locales[i];
					var url = Foxtrick.InternalPath + 'locale/' + locale + '/htlang.json';
					var text = Foxtrick.util.load.sync(url);
					this.htLanguagesJSON[Foxtrick.L10n.locales[i]] = JSON.parse(text);
				}
			}

			this._strings_bundle_default = Services.strings.
				createBundle('chrome://foxtrick/content/foxtrick.properties');

			try {
				var rule = this._strings_bundle_default.GetStringFromName('pluralFormRuleID');
				this.plForm_default = parseInt(rule.match(/\d+/), 10);
			}
			catch (e) {}

			this.setUserLocaleGecko(Foxtrick.Prefs.getString('htLanguage'));

			this._strings_bundle_screenshots_default = Services.strings.
				createBundle('chrome://foxtrick/content/foxtrick.screenshots');
		},

		setUserLocaleGecko: function(localecode) {
			try {
				this._strings_bundle = Services.strings.
					createBundle('chrome://foxtrick/content/locale/' + localecode +
								 '/foxtrick.properties');
			}
			catch (e) {
				this._strings_bundle = this._strings_bundle_default;
				Foxtrick.log('Use default properties for locale ', localecode);
			}

			try {
				var rule = this._strings_bundle.GetStringFromName('pluralFormRuleID');
				this.plForm = parseInt(rule.match(/\d+/), 10);
			}
			catch (e) {}

			try {
				this._strings_bundle_screenshots = Services.strings.
					createBundle('chrome://foxtrick/content/locale/' + localecode +
								  '/foxtrick.screenshots');
			}
			catch (e) {
				this._strings_bundle_screenshots = this._strings_bundle_screenshots_default;
				Foxtrick.log('Use default screenshots for locale ', localecode);
			}
		},

		getString: function(str, num) {
			var get, l10n;
			try {
				if (Foxtrick.Prefs.getBool('translationKeys'))
					return str;

				l10n = this._strings_bundle.GetStringFromName(str);
				if (typeof num !== 'undefined') {
					get = plScope.PluralForm.makeGetter(this.plForm)[0];
					try {
						return get(num, l10n);
					}
					catch (e) {
						return l10n.replace(/.+;/g, '');
					}
				}
				return l10n;
			}
			catch (e) {
				try {
					if (this._strings_bundle_default) {
						l10n = this._strings_bundle_default.GetStringFromName(str);
						if (typeof num !== 'undefined') {
							get = plScope.PluralForm.makeGetter(this.plForm_default)[0];
							try {
								return get(num, l10n);
							}
							catch (e) {
								return l10n.replace(/.+;/g, '');
							}
						}
						return l10n;
					}
					return null;
				}
				catch (ee) {
					Foxtrick.error('Error getString(\'' + str + '\')');
					return str;
				}
			}
		},

		isStringAvailable: function(str) {
			if (this._strings_bundle) {
				try {
					return this._strings_bundle.GetStringFromName(str) !== null;
				}
				catch (e) {
					try {
						return this._strings_bundle_default.GetStringFromName(str) !== null;
					}
					catch (ee) {
						return false;
					}
				}
			}
			return false;
		},

		isStringAvailableLocal: function(str) {
			if (this._strings_bundle) {
				try {
					return this._strings_bundle.GetStringFromName(str) != null;
				}
				catch (e) {
					return false;
				}
			}
			return false;
		},

		getScreenshot: function(str) {
			var link = '';
			if (this._strings_bundle_screenshots) {
				try {
					link = this._strings_bundle_screenshots.GetStringFromName(str);
				}
				catch (e) {
				}
			}
			if (link === '') {
				try {
					if (this._strings_bundle_screenshots_default)
						link = this._strings_bundle_screenshots_default.GetStringFromName(str);
				}
				catch (ee) {
				}
			}
			return link;
		},
	};

	var i;
	for (i in FoxtrickL10nGecko)
		Foxtrick.L10n[i] = FoxtrickL10nGecko[i];

	}());
}



// ----------------------  Chrome specific get/set preferences --------------------------
if (Foxtrick.arch === 'Sandboxed') {

	(function() {
	var FoxtrickL10nChrome = {
		// string collection of localizations and screenshot links
		properties_default: null,
		properties: null,
		screenshots_default: null,
		screenshots: null,

		init: function() {
			var locale;
			// get htlang.json for each locale
			if (!/\/preferences\.html$/.test(window.location.pathname)) {
				// don't run in prefs
				for (var i in Foxtrick.L10n.locales) {
					locale = Foxtrick.L10n.locales[i];
					var url = Foxtrick.InternalPath + 'locale/' + locale + '/htlang.json';
					var text = Foxtrick.util.load.sync(url);
					this.htLanguagesJSON[Foxtrick.L10n.locales[i]] = JSON.parse(text);
				}
			}

			this.properties_default =
				Foxtrick.util.load.sync(Foxtrick.InternalPath + 'foxtrick.properties');
			this.screenshots_default =
				Foxtrick.util.load.sync(Foxtrick.InternalPath + 'foxtrick.screenshots');
			try {
				var rule = this._getString(this.properties_default, 'pluralFormRuleID');
				this.plForm_default = parseInt(rule.match(/\d+/), 10);
			}
			catch (e) {}

			locale = Foxtrick.Prefs.getString('htLanguage');

			try {
				var localUrl = Foxtrick.InternalPath + 'locale/' + locale + '/foxtrick.properties';
				this.properties = Foxtrick.util.load.sync(localUrl);
				if (this.properties === null) {
					Foxtrick.log('Use default properties for locale ', locale);
					this.properties = this.properties_default;
				}
			}
			catch (e) {
				Foxtrick.log('Use default properties for locale ', locale);
				this.properties = this.properties_default;
			}
			try {
				var localRule = this._getString(this.properties, 'pluralFormRuleID');
				this.plForm = parseInt(localRule.match(/\d+/), 10);
			}
			catch (e) {}
			try {
				var ssUrl = Foxtrick.InternalPath + 'locale/' + locale + '/foxtrick.screenshots';
				this.screenshots = Foxtrick.util.load.sync(ssUrl);
				if (this.screenshots === null) {
					Foxtrick.log('Use default screenshots for locale ', locale);
					this.screenshots = this.screenshots_default;
				}
			}
			catch (ee) {
				Foxtrick.log('Use default screenshots for locale ', locale);
				this.screenshots = this.screenshots_default;
			}
		},

		_getString: function(properties, str) {
			var string_regexp = new RegExp('^' + str + '=(.+)$', 'im');
			if (string_regexp.test(properties))
				return properties.match(string_regexp)[1];
			return null;
		},

		getString: function(str, num) {
			try {
				if (Foxtrick.Prefs.getBool('translationKeys'))
					return str;

				var plForm = this.plForm;
				var value = this._getString(this.properties, str);
				if (value === null) {
					value = this._getString(this.properties_default, str);
					plForm = this.plForm_default;
				}
				if (value === null)
					throw null;

				// replace escaped characters as what Gecko does
				value = value.replace(/\\n/g, '\n').replace(/\\:/g, ':').
					replace(/\\=/g, '=').replace(/\\#/g, '#').replace(/\\!/g, '!');
				// get plurals
				if (typeof num !== 'undefined') {
					var get = PluralForm.makeGetter(plForm)[0];
					try {
						return get(num, value);
					}
					catch (e) {
						return value.replace(/.+;/g, '');
					}
				}
				return value;
			}
			catch (e) {
				Foxtrick.error('Error getString(\'' + str + '\')');
				return str.substr(str.lastIndexOf('.') + 1);
			}
		},

		isStringAvailable: function(str) {
			var string_regexp = new RegExp('^' + str + '=(.+)$', 'im');
			return string_regexp.test(Foxtrick.L10n.properties) ||
			       string_regexp.test(Foxtrick.L10n.properties_default);
		},

		isStringAvailableLocal: function(str) {
			var string_regexp = new RegExp('^' + str + '=(.+)$', 'im');
			return string_regexp.test(Foxtrick.L10n.properties);
		},

		getScreenshot: function(str) {
			try {
				var string_regexp = new RegExp('^' + str + '=(.+)$', 'im');
				if (Foxtrick.L10n.screenshots && string_regexp.test(Foxtrick.L10n.screenshots))
					return Foxtrick.L10n.screenshots.match(string_regexp)[1];
				else if (string_regexp.test(Foxtrick.L10n.screenshots_default))
					return Foxtrick.L10n.screenshots_default.match(string_regexp)[1];
				return '';
			}
			catch (e) {
				Foxtrick.error('Error getScreenshot(\'' + str + '\')');
				return '';
			}
		},
	};

	var i;
	for (i in FoxtrickL10nChrome)
		Foxtrick.L10n[i] = FoxtrickL10nChrome[i];
	}());
}
