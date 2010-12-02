/**
 * l10n.js
 * Localization tools.
 */
////////////////////////////////////////////////////////////////////////////////
var Foxtrickl10n = {
	locales : [
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

	_strings_bundle : null,
	_strings_bundle_default : null,
	_strings_bundle_screenshots:null,
	_strings_bundle_screenshots_default:null,

	init : function() {
		for (var i in Foxtrickl10n.locales) {
			var locale = Foxtrickl10n.locales[i];
			try {
				var url = Foxtrick.ResourcePath + "locale/" + locale + "/htlang.xml";
				if (Foxtrick.BuildFor === "Gecko") {
					this.htLanguagesXml[locale] = Foxtrick.LoadXML(url);
				}
			}
			catch (e) {
				Foxtrick.dump("Cannot load HT language for " + locale + ".\n");
				Foxtrick.dumpError(e);
			}
		}
		if (Foxtrick.BuildFor === "Gecko") {
			this._strings_bundle_default =
				Components.classes["@mozilla.org/intl/stringbundle;1"]
				.getService(Components.interfaces.nsIStringBundleService)
				.createBundle("chrome://foxtrick/content/foxtrick.properties");
			this.get_strings_bundle(FoxtrickPrefs.getString("htLanguage"));

			this._strings_bundle_screenshots_default =
				Components.classes["@mozilla.org/intl/stringbundle;1"]
				.getService(Components.interfaces.nsIStringBundleService)
				.createBundle("chrome://foxtrick/content/foxtrick.screenshots");
		}
	},

	get_strings_bundle :function(localecode) {
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
			Foxtrick.dumpError(e);
		}
	},

	getString : function(str) {
		if (this._strings_bundle) {
			try {
				return this._strings_bundle.GetStringFromName(str);
			}
			catch (e) {
				try {
					if (this._strings_bundle_default)
						return this._strings_bundle_default.GetStringFromName(str);
				}
				catch (ee) {
					Foxtrick.dump("** Localization error 1 ** '" + str + "'\n");
					return "** Localization error 1 **";
				}
			}
		}
		else {
			Foxtrick.dump("** Localization error 2 ** '" + str + "'\n");
			return "** Localization error 2 **";
		}
	},

	getFormattedString : function(str, key_array) {
		if (this._strings_bundle) {
			try {
				return this._strings_bundle.formatStringFromName( str, key_array );
			}
			catch (e) {
				try {
					return this._strings_bundle_default.formatStringFromName( str, key_array );
				}
				catch (ee) {
					return "** Localization error **";
				}
			}
		}
		else
			return "** Localization error **";
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

	// this function returns level string of given level type and numeral value.
	// type could be levels, for normal skills;
	// agreeability, honesty, and aggressiveness, which are all obvious.
	getLevelByTypeAndValue : function(type, val) {
		var lang = FoxtrickPrefs.getString("htLanguage");
		var path = "language/" + type + "/level[@value='" + val + "']";
		var text = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml[lang], path, "text");
		if (text === null) {
			Foxtrick.dump("Requested level of type " + type + " and value " + val + " don't exist in locale " + lang + ", try en instead.\n");
			text = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml["en"], path, "text");
			if (text === null) {
				Foxtrick.dump("Requested level of type " + type + " and value " + val + " don't exist, returning raw value.\n");
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
			Foxtrick.dump("Requested sublevel of value " + val + " doesn't exist in locale " + lang + ", try en instead.\n");
			text = Foxtrick.xml_single_evaluate(Foxtrickl10n.htLanguagesXml["en"], path, "text");
			if (text === null) {
				Foxtrick.dump("Requested sublevel of value " + val + " doesn't exist, returning raw value.\n");
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
			Foxtrick.dumpError(e);
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
			Foxtrick.dumpError(e);
		}
		return shortSpec ? shortSpec : direct();
	}
};
