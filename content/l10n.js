/**
 * l10n.js
 * Localization tools.
 */
////////////////////////////////////////////////////////////////////////////////
var Foxtrickl10n = {
	locale : {
		"84" : "be",
		"43" : "bg",
		"58" : "bs",
		"66" : "ca",
		"35" : "cs",
		"8" : "da",
		"3" : "de",
		"36" : "ee",
		"2" : "en",
		"6" : "es",
		"103" : "es_ca",
		"51" : "es_SU",
		"110" : "eu",
		"75" : "fa",
		"9" : "fi",
		"5" : "fr",
		"113" : "fur",
		"109" : "fy",
		"74" : "gl",
		"34" : "gr",
		"40" : "he",
		"39" : "hr",
		"33" : "hu",
		"4" : "it",
		"111" : "lb",
		"56" : "lt",
		"37" : "lv",
		"83" : "mk",
		"87" : "mt",
		"10" : "nl",
		"7" : "no",
		"136" : "nn",
		"13" : "pl",
		"11" : "pt",
		"50" : "pt_BR",
		"23" : "ro",
		"14" : "ru",
		"53" : "sk",
		"45" : "sl",
		"85" : "sq",
		"32" : "sr",
		"1" : "sv",
		"19" : "tr",
		"57" : "uk",
		"55" : "vi",
		"65" : "vls",
		"15" : "zh",
		"90" : "ka",
		"84" : "be",
		"17" : "ko",
		"12" : "ja"
	},

    _strings_bundle : null,
	_strings_bundle_default : null,
	_strings_bundle_screenshots:null,
	_strings_bundle_screenshots_default:null,

    init : function() {
        this._strings_bundle_default =
             Components.classes["@mozilla.org/intl/stringbundle;1"]
             .getService(Components.interfaces.nsIStringBundleService)
             .createBundle("chrome://foxtrick/content/foxtrick.properties");
		this.get_strings_bundle(FoxtrickPrefs.getString("htLanguage"));

		this._strings_bundle_screenshots_default =
             Components.classes["@mozilla.org/intl/stringbundle;1"]
             .getService(Components.interfaces.nsIStringBundleService)
             .createBundle("chrome://foxtrick/content/foxtrick.screenshots");
    },


	get_strings_bundle :function ( localecode ) {
	  try {
		this._strings_bundle =
             Components.classes["@mozilla.org/intl/stringbundle;1"]
             .getService(Components.interfaces.nsIStringBundleService)
             .createBundle("chrome://foxtrick/content/locale/"+localecode+"/foxtrick.properties");
		this._strings_bundle_screenshots =
             Components.classes["@mozilla.org/intl/stringbundle;1"]
             .getService(Components.interfaces.nsIStringBundleService)
             .createBundle("chrome://foxtrick/content/locale/"+localecode+"/foxtrick.screenshots");
	  } catch (e) { Foxtrick.dump('Foxtrickl10n->get_strings_bundle: Error reading language file: '+e+'\n');}
	},


    getString : function( str ) {
        if ( this._strings_bundle )
        {
            try {
                return this._strings_bundle.GetStringFromName( str );
            } catch( e ) {
				try {
					if ( this._strings_bundle_default ) return this._strings_bundle_default.GetStringFromName( str );
				} catch( ee ) {
                    // DEBUG FOR RELEASE 0.4.3
                    Foxtrick.dump("** Localization error 1 ** '" + str + "'\n");
                    // DEBUG FOR RELEASE 0.4.3
                    return "** Localization error 1 **";
				}
			}
        }
        else {
            // DEBUG FOR RELEASE 0.4.3
            Foxtrick.dump("** Localization error 2 ** '" + str + "'\n");
            // DEBUG FOR RELEASE 0.4.3
            return "** Localization error 2 **";
        }
    },

    getFormattedString : function( str, key_array )
    {
        if ( this._strings_bundle )
        {
            try {
                return this._strings_bundle.formatStringFromName( str, key_array );
            } catch( e ) {
				try {
					return this._strings_bundle_default.formatStringFromName( str, key_array );
				} catch( ee ) {
					return "** Localization error **";
				}
			}
        }
        else
            return "** Localization error **";
    },

    isStringAvailable : function( str )
    {
        if ( this._strings_bundle )
        {
            try {
                return this._strings_bundle.GetStringFromName( str ) != null;
			} catch( e ) {
                try {
					return this._strings_bundle_default.GetStringFromName( str ) != null;
				} catch( e ) {
					return false;
				}
            }
        }
        return false;
    },

	isStringAvailableLocal : function( str )
    {
        if ( this._strings_bundle )
        {
            try {
                return this._strings_bundle.GetStringFromName( str ) != null;
			}  catch( e ) {
					return false;
			}
        }
        return false;
    },

	getScreenshot : function( str ) {
		var link="";
        if ( this._strings_bundle_screenshots )
        {
            try {
                link = this._strings_bundle_screenshots.GetStringFromName( str );
            } catch( e ) {
			}
		}
		if (link=="") {
			try {
				if ( this._strings_bundle_screenshots_default ) link = this._strings_bundle_screenshots_default.GetStringFromName( str );
				} catch( ee ) {
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
		var text = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml[lang], path, "text");
		if (text === null) {
			Foxtrick.dump("Requested level of type " + type + " and value " + val + " don't exist in locale " + lang + ", try en instead.\n");
			text = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml["en"], path, "text");
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
		var text = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml[lang], path, "text");
		if (text === null) {
			Foxtrick.dump("Requested sublevel of value " + val + " doesn't exist in locale " + lang + ", try en instead.\n");
			text = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml["en"], path, "text");
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
			shortPos = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml[lang], path, "short");
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
			shortSpec = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml[lang], path, "short");
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
		return shortSpec ? shortSpec : direct();
	}
};
