"use strict";
/**
 * l10n.js
 * Localization tools.
 */
////////////////////////////////////////////////////////////////////////////////
var Foxtrickl10n = {
	locales : [
		"ar",	// العربية, arabic	22
		"be",	// Беларуская, belorus	84
		"bg",	// Български, bulgarian	43
		"bs",	// Bosanski	58
		"ca",	// Català, catalan	66
		"cs",	// Čeština, czech	35
		"da",	// Dansk, danish	3
		"de",	// Deutsch, german	8
		"ee",	// Eesti	36
		"en",	// english	2
		"es",	// Español	103
		"es_ca",	//Español centro-americano	51
		"es_SU",	// Español Sudamericano	6
		"eu",	// Euskara, basque	110
		"fa",	// فارسی, farsi, iranian	75
		"fi",	// Suomi, finnish	9
		"fr",	// frensh	5
		"fur",	// Furlan, northitaly	113
		"fy",	// Frysk, east-netherland/north germany	109
		"gl",	// Galego, galician	74
		"gr",	// Ελληνικά, greek	34
		"he",	// עברית, hebrew	40
		"hr",	// Hrvatski, croatian	39
		"hu",	// Magyar, hungarian	33
		"is",	// Íslenska, island	25
		"it",	// italian	4
		"ja",	// 日本語, japanese	12
		"ka",	// Georgian	90
		"ko",	// 한국어, korean	17
		"lb",	// Lëtzebuergesch	111
		"lt",	// Lietuvių	56
		"lv",	// Latviešu	37
		"mk",	// Македонски, macedonian	83
		"mt",	// Malti	87
		"nl",	// netherlands	10
		"nn",	// Norsk nynorsk	136
		"no",	// Norsk bokmål	7
		"pl",	// Polski	13
		"pt",	// Português	11
		"pt_BR",	// Português brasil	50
		"ro",	// Română, romanian	23
		"ru",	// Русский, russain 	14
		"sk",	// Slovenčina, slovak	53
		"sl",	// Slovenščina, slovenian 	45
		"sq",	// Albanian	85
		"sr",	// Српски, serbian	32
		"sv",	// Svenska, swedish	1
		"tr",	// Türkçe	19
		"uk",	// Українська, ukranian	57
		"vi",	// Tiếng Việt, vietnamese	55
		"vls",	// Vlaams, netherland	65
		"zh"	// 中文（简体）, chinese	15
				// Kyrgyz	86 
	],

	htLanguagesXml : {},

	// this function returns level including decimal subs from text.
	getLevelFromText : function(text) {
		var level, sublevel=0;
		var lang = FoxtrickPrefs.getString("htLanguage");
		var xml = Foxtrickl10n.htLanguagesXml[lang];

		var levels = xml.getElementsByTagName('level');
		for (var i=0; i<levels.length; ++i) {
			var leveltext = levels[i].getAttribute('text');
			if (RegExp('^'+leveltext,'i').test(text)) {
				level = Number(levels[i].getAttribute('value'));
				break;
			}
		}
		if (level===null)
			return null;

		var ratingSubLevels = xml.getElementsByTagName('sublevel');
		for (var i=0; i<ratingSubLevels.length; ++i) {
			var subleveltext = ratingSubLevels[i].getAttribute('text').replace('(','\\(').replace(')','\\)');
			if (RegExp(subleveltext+'$','i').test(text)) {
				sublevel = Number(ratingSubLevels[i].getAttribute('value'));
				break;
			}
		}

		return level + sublevel;
	},

	// this function returns level string of given level type and numeral value.
	// type could be levels, for normal skills;
	// agreeability, honesty, and aggressiveness, which are all obvious.
	getLevelByTypeAndValue : function(type, val) {
		var lang = FoxtrickPrefs.getString("htLanguage");
		var path = "language/" + type + "/level[@value='" + val + "']";
		var text = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "text");
		if (text === null) {
			Foxtrick.log("Requested level of type " + type + " and value " + val + " don't exist in locale " + lang + ", try en instead.");
			text = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml.en, path, "text");
			if (text === null) {
				Foxtrick.log("Requested level of type " + type + " and value " + val + " don't exist, returning raw value.");
				text = val;
			}
		}
		return text;
	},

	getSublevelByValue : function(val) {
		var lang = FoxtrickPrefs.getString("htLanguage");
		var path = "language/ratingSubLevels/sublevel[@value='" + val + "']";
		var text = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "text");
		if (text === null) {
			Foxtrick.log("Requested sublevel of value " + val + " doesn't exist in locale " + lang + ", try en instead.");
			text = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml.en, path, "text");
			if (text === null) {
				Foxtrick.log("Requested sublevel of value " + val + " doesn't exist, returning raw value.");
				text = val;
			}
		}
		return text;
	},

	getFullLevelByValue : function(val) {
		var main = Math.floor(val);
		var sub = val - main;
		if (sub >= 0 && sub < 0.25) {
			sub = "0.0";
		}
		else if (sub >= 0.25 && sub < 0.5) {
			sub = "0.25";
		}
		else if (sub >= 0.5 && sub < 0.75) {
			sub = "0.50";
		}
		else if (sub >= 0.75 && sub < 1) {
			sub = "0.75";
		}
		var mainStr = this.getLevelByTypeAndValue("levels", main);
		var subStr = this.getSublevelByValue(sub);
		return mainStr + " " + subStr;
	},

	getTacticById: function(id) {
		var tactics = [
			"normal",	//:	0,
			"pressing",	//:	1,
			"ca",		//:	2,
			"aim",		//:	3,
			"aow",		//:	4,
			"creatively",//:5,
			"longshots"//:6
		];
		
		var lang = FoxtrickPrefs.getString("htLanguage");
		var path = "language/tactics/tactic[@type='" + tactics[id] + "']";
		var text = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "value");
		if (text === null) {
			Foxtrick.log("Requested tactic of id " + tactics[id] + " doesn't exist in locale " + lang + ", try en instead.");
			text = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml.en, path, "value");
			if (text === null) {
				Foxtrick.log("Requested tactic of id " + tactics[id] + " doesn't exist, returning raw value.");
				text = tactics[id];
			}
		}
		return text;
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
		var shortPos = "";
		try {
			var lang = FoxtrickPrefs.getString("htLanguage");
			var path = "language/positions/position[@value=\"" + pos + "\"]";
			shortPos = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "short");
		}
		catch (e) {
			Foxtrick.log(e);
		}
		return shortPos || direct();
	},

	getShortSpeciality: function(spec) {
		var direct = function() {
			return spec.substr(0, 2);
		};
		var shortSpec = "";
		try {
			var lang = FoxtrickPrefs.getString("htLanguage");
			var path = "language/specialties/specialty[@value=\"" + spec + "\"]";
			shortSpec = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "short");
		}
		catch (e) {
			Foxtrick.log(e);
		}
		return shortSpec || direct();
	},

	getShortSpecialityFromEnglish: function(spec) {
		var direct = function() {
			return spec.substr(0, 2);
		};
		var shortSpec = "";
		try {
			var lang = FoxtrickPrefs.getString("htLanguage");
			var path = "language/specialties/specialty[@type=\"" + spec + "\"]";
			shortSpec = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "short");
		}
		catch (e) {
			Foxtrick.log(e);
		}
		return shortSpec || direct();
	},
	
	getEnglishSpeciality: function(spec) {
		var engSpec = spec;
		try {
			var lang = FoxtrickPrefs.getString("htLanguage");
			var path = "language/specialties/specialty[@value=\"" + spec + "\"]";
			engSpec = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "type");
		}
		catch (e) {
			Foxtrick.log(e);
		}
		return engSpec;
	},
	
	getSpecialityFromNumber: function(number) {
		var specs = {0:'', 1:'Technical', 2:'Quick', 3:'Powerful', 4:'Unpredictable', 5:'Head', 6:'Regainer'};
		var spec = specs[number];
		try {
			var lang = FoxtrickPrefs.getString("htLanguage");
			var path = "language/specialties/specialty[@type=\"" + spec + "\"]";
			spec = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "value");
		}
		catch (e) {
			Foxtrick.log(e);
		}
		return spec;
	},
	
	getPositionByType : function(val) {
		var lang = FoxtrickPrefs.getString("htLanguage");
		var path = "language/positions/position[@type='" + val + "']";
		var text = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "value");
		if (text === null) {
			Foxtrick.log("Requested sublevel of value " + val + " doesn't exist in locale " + lang + ", try en instead.");
			text = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml.en, path, "value");
			if (text === null) {
				Foxtrick.log("Requested sublevel of value " + val + " doesn't exist, returning raw value.");
				text = val;
			}
		}
		return text;
	},

};


// ----------------------  Gecko specific get/set preferences --------------------------
if (Foxtrick.arch === "Gecko") {
	(function() {
	var Foxtrickl10nGecko = {

		// mozilla string bundles of localizations and screenshot links
		_strings_bundle : null,
		_strings_bundle_default : null,
		_strings_bundle_screenshots:null,
		_strings_bundle_screenshots_default:null,

		init : function() {
			if (Foxtrick.chromeContext()==='background') {
				// get htlang.xml for each locale
				var i;
				for (i in Foxtrickl10n.locales) {
					var locale = Foxtrickl10n.locales[i];
					var url = Foxtrick.InternalPath + "locale/" + locale + "/htlang.xml";
					this.htLanguagesXml[Foxtrickl10n.locales[i]] = Foxtrick.loadXmlSync(url);
				}
			}

			this._strings_bundle_default =
				Components.classes["@mozilla.org/intl/stringbundle;1"]
				.getService(Components.interfaces.nsIStringBundleService)
				.createBundle("chrome://foxtrick/content/foxtrick.properties");

			this.setUserLocaleGecko(FoxtrickPrefs.getString("htLanguage"));

			this._strings_bundle_screenshots_default =
				Components.classes["@mozilla.org/intl/stringbundle;1"]
				.getService(Components.interfaces.nsIStringBundleService)
				.createBundle("chrome://foxtrick/content/foxtrick.screenshots");
		},

		setUserLocaleGecko :function(localecode) {
			try {
				this._strings_bundle =
					Components.classes["@mozilla.org/intl/stringbundle;1"]
					.getService(Components.interfaces.nsIStringBundleService)
					.createBundle("chrome://foxtrick/content/locale/"+localecode+"/foxtrick.properties");
				this._strings_bundle_screenshots =
					Components.classes["@mozilla.org/intl/stringbundle;1"]
					.getService(Components.interfaces.nsIStringBundleService)
					.createBundle("chrome://foxtrick/content/locale/"+localecode+"/foxtrick.screenshots");
			}
			catch (e) {
				Foxtrick.log(e);
			}
		},

		getString : function(str) {
			try {
				return this._strings_bundle.GetStringFromName(str);
			}
			catch (e) {
				try {
					if (this._strings_bundle_default)
						return this._strings_bundle_default.GetStringFromName(str);
				}
				catch (ee) {
					Foxtrick.log("** Localization error 1 ** '" + str + "'");
					return str;
				}
			}
		},

		isStringAvailable : function(str) {
			if (this._strings_bundle) {
				try {
					return this._strings_bundle.GetStringFromName( str ) != null;
				}
				catch (e) {
					try {
						return this._strings_bundle_default.GetStringFromName( str ) != null;
					}
					catch (ee) {
						return false;
					}
				}
			}
			return false;
		},

		isStringAvailableLocal : function(str) {
			if (this._strings_bundle) {
				try {
					return this._strings_bundle.GetStringFromName( str ) != null;
				}
				catch (e) {
					return false;
				}
			}
			return false;
		},

		getScreenshot : function(str) {
			var link = "";
			if (this._strings_bundle_screenshots) {
				try {
					link = this._strings_bundle_screenshots.GetStringFromName( str );
				}
				catch (e) {
				}
			}
			if (link=="") {
				try {
					if (this._strings_bundle_screenshots_default)
						link = this._strings_bundle_screenshots_default.GetStringFromName( str );
				}
				catch (ee) {
				}
			}
			return link;
		},
	};

	var i;
	for (i in Foxtrickl10nGecko)
		Foxtrickl10n[i] = Foxtrickl10nGecko[i];
	}());
}



// ----------------------  Chrome specific get/set preferences --------------------------
if (Foxtrick.arch === "Sandboxed") {

	(function() {
	var Foxtrickl10nChrome = {
		// string collection of localizations and screenshot links
		properties_default : null,
		properties : null,
		screenshots_default : null,
		screenshots : null,

		init : function() { 
			// get htlang.xml for each locale
			var i;
			var locale;
			for (i in Foxtrickl10n.locales) {
				locale = Foxtrickl10n.locales[i];
				var url = Foxtrick.InternalPath + "locale/" + locale + "/htlang.xml";
				this.htLanguagesXml[Foxtrickl10n.locales[i]] = Foxtrick.loadXmlSync(url);
			}

			this.properties_default = Foxtrick.loadSync(Foxtrick.InternalPath+"foxtrick.properties");
			this.screenshots_default = Foxtrick.loadSync(Foxtrick.InternalPath+"foxtrick.screenshots");

			locale = FoxtrickPrefs.getString("htLanguage");
			if (locale == "en") {
				// en locale is just default locale
				this.properties = this.properties_default;
				this.screenshots = this.screenshots_default;
			}
			else {
				try {
					this.properties = Foxtrick.loadSync(Foxtrick.InternalPath + "locale/" + locale + "/foxtrick.properties");
				}
				catch (e) {
					Foxtrick.log("Use default properties for locale ", locale);
					this.properties = this.properties_default;
				}
				try {
					this.screenshots = Foxtrick.loadSync(Foxtrick.InternalPath + "locale/" + locale + "/foxtrick.screenshots");
				}
				catch (ee) {
					Foxtrick.log("Use default screenshots for locale ", locale);
					this.screenshots = this.screenshots_default;
				}
			}
		},

		getString : function(str) {
			try {
				var value;
				var string_regexp = new RegExp( '\\s'+str+'=(.+)\\s', "i" );

				if (Foxtrickl10n.properties.search(string_regexp)!=-1)
					value = Foxtrickl10n.properties.match(string_regexp)[1];
				else if (Foxtrickl10n.properties_default.search(string_regexp)!=-1)
					value = Foxtrickl10n.properties_default.match(string_regexp)[1];
				else {
					value = str;
					Foxtrick.log('getString error: ' ,str);
				}
				// replace escaped characters as what Gecko does
				value = value.replace(/\\n/g, "\n");
				return value;
			}
			catch (e) {
				Foxtrick.log(e);
				Foxtrick.log('getString error: ' ,str);
				return str.substr(str.lastIndexOf('.')+1);
			}
		},

		isStringAvailable : function(str) {
			var string_regexp = new RegExp('\\s'+str+'=(.+)\\s', "i");
			return (Foxtrickl10n.properties.search(string_regexp)!=-1
				|| Foxtrickl10n.properties_default.search(string_regexp)!=-1);
		},

		isStringAvailableLocal : function(str) {
			var string_regexp = new RegExp( '\\s'+str+'=(.+)\\s', "i" );
			return (Foxtrickl10n.properties.search(string_regexp)!=-1);
		},

		getScreenshot : function(str) {
			try {
				var string_regexp = new RegExp( '\\s'+str+'=(.+)\\s', "i" );
				if (Foxtrickl10n.screenshots && Foxtrickl10n.screenshots.search(string_regexp)!=-1)
					return Foxtrickl10n.screenshots.match(string_regexp)[1];
				else if (Foxtrickl10n.screenshots_default.search(string_regexp)!=-1)
					return Foxtrickl10n.screenshots_default.match(string_regexp)[1];
				return '';
			}
			catch (e) {
				Foxtrick.log('getscreenshots ',e);
			}
		},
	};

	var i;
	for (i in Foxtrickl10nChrome)
		Foxtrickl10n[i] = Foxtrickl10nChrome[i];
	}());
}
