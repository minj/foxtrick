/**
 * l10n.js
 * Localization tools.
 */
////////////////////////////////////////////////////////////////////////////////
var Foxtrickl10n = {
	locales : [
		"ar",
		"be",
		"bg",
		"bs",
		"ca",
		"cs",
		"da",
		"de",
		"ee",
		"en",
		"es",
		"es_ca",
		"es_SU",
		"eu",
		"fa",
		"fi",
		"fr",
		"fur",
		"fy",
		"gl",
		"gr",
		"he",
		"hr",
		"hu",
		"is",
		"it",
		"ja",
		"ka",
		"ko",
		"lb",
		"lt",
		"lv",
		"mk",
		"mt",
		"nl",
		"nn",
		"no",
		"pl",
		"pt",
		"pt_BR",
		"ro",
		"ru",
		"sk",
		"sl",
		"sq",
		"sr",
		"sv",
		"tr",
		"uk",
		"vi",
		"vls",
		"zh"
	],

	htLanguagesXml : {},

	// this function returns level string of given level type and numeral value.
	// type could be levels, for normal skills;
	// agreeability, honesty, and aggressiveness, which are all obvious.
	getLevelByTypeAndValue : function(type, val) {
		var lang = FoxtrickPrefs.getString("htLanguage");
		var path = "language/" + type + "/level[@value='" + val + "']";
		var text = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "text");
		if (text === null) {
			Foxtrick.log("Requested level of type " + type + " and value " + val + " don't exist in locale " + lang + ", try en instead.");
			text = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml["en"], path, "text");
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
			text = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml["en"], path, "text");
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
		return shortPos ? shortPos : direct();
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
		return shortSpec ? shortSpec : direct();
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
		return shortSpec ? shortSpec : direct();
	}
};


// ----------------------  Gecko specific get/set preferences --------------------------
if (Foxtrick.arch === "Gecko") {

	var Foxtrickl10nGecko = {

		// mozilla string bundles of localizations and screenshot links
		_strings_bundle : null,
		_strings_bundle_default : null,
		_strings_bundle_screenshots:null,
		_strings_bundle_screenshots_default:null,

		init : function() {
			if (Foxtrick.chromeContext()==='background') {
				// get htlang.xml for each locale
				for (var i in Foxtrickl10n.locales) {
					var locale = Foxtrickl10n.locales[i];
					var url = Foxtrick.InternalPath + "locale/" + locale + "/htlang.xml";
					this.htLanguagesXml[Foxtrickl10n.locales[i]] = Foxtrick.loadXml(url);
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

		getString : function(str) {;
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
					catch (e) {
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

	for (i in Foxtrickl10nGecko)
		Foxtrickl10n[i] = Foxtrickl10nGecko[i];
}



// ----------------------  Chrome specific get/set preferences --------------------------
if (Foxtrick.arch === "Sandboxed") {

	var Foxtrickl10nChrome = {

		// string collection of localizations and screenshot links
		properties_default : null,
		properties : null,
		screenshots_default : null,
		screenshots : null,

		init : function() {
			if (Foxtrick.chromeContext() == "background") {
				// get htlang.xml for each locale
				for (var i in Foxtrickl10n.locales) {
					var locale = Foxtrickl10n.locales[i];
					var url = Foxtrick.InternalPath + "locale/" + locale + "/htlang.xml";
					this.htLanguagesXml[Foxtrickl10n.locales[i]] = Foxtrick.loadXml(url);
				}

				this.properties_default = Foxtrick.load(Foxtrick.InternalPath+"foxtrick.properties");
				this.screenshots_default = Foxtrick.load(Foxtrick.InternalPath+"foxtrick.screenshots");

				var locale = FoxtrickPrefs.getString("htLanguage");
				if (locale == "en") {
					// en locale is just default locale
					this.properties = this.properties_default;
					this.screenshots = this.screenshots_default;
				}
				else {
					try {
						this.properties = Foxtrick.load(Foxtrick.ResourcePath + "locale/" + locale + "/foxtrick.properties");
					}
					catch (e) {
						Foxtrick.log("Use default properties for locale ", locale);
						this.properties = this.properties_default;
					}
					try {
						this.screenshots = Foxtrick.load(Foxtrick.ResourcePath + "locale/" + localecode + "/foxtrick.screenshots");
					}
					catch (e) {
						Foxtrick.log("Use default properties for locale ", locale);
						this.screenshots = this.screenshots_default;
					}
				}
			}
			else if (Foxtrick.chromeContext() == "content") {
				// init for chrome content is in loader_chrome
			}
		},

		getString : function(str) {
			try {
				var string_regexp = new RegExp( '\\s'+str+'=(.+)\\s', "i" );
				if (Foxtrickl10n.properties.search(string_regexp)!=-1)
					value = Foxtrickl10n.properties.match(string_regexp)[1];
				else if (Foxtrickl10n.properties_default.search(string_regexp)!=-1)
					value = Foxtrickl10n.properties_default.match(string_regexp)[1];
				else {
					value = str;
					Foxtrick.log('getString error' ,str);
				}
				return value;
			}
			catch (e) {
				Foxtrick.log(e);
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
				if (Foxtrickl10n.screenshots.search(string_regexp)!=-1)
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

	for (i in Foxtrickl10nChrome)
		Foxtrickl10n[i] = Foxtrickl10nChrome[i];
}
