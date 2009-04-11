/**
 * l10n.js
 * Localization tools.
 */
////////////////////////////////////////////////////////////////////////////////
var Foxtrickl10n = {
    _strings_bundle : null,
	_strings_bundle_default : null,
	_strings_bundle_screenshots:null,
	
    init : function() {
        this._strings_bundle_default =
             Components.classes["@mozilla.org/intl/stringbundle;1"] 
             .getService(Components.interfaces.nsIStringBundleService)  
             .createBundle("chrome://foxtrick/content/foxtrick.properties");
		this.get_strings_bundle(FoxtrickPrefs.getString("htLanguage")); 
		
		this._strings_bundle_screenshots =
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
	  } catch (e) { dump('Foxtrickl10n->get_strings_bundle: Error reading language file: '+e+'\n');}
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
                    dump("** Localization error 1 ** '" + str + "'\n");
                    // DEBUG FOR RELEASE 0.4.3
                    return "** Localization error 1 **";
				}
			}            
        }
        else {
            // DEBUG FOR RELEASE 0.4.3
            dump("** Localization error 2 ** '" + str + "'\n");
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
        if ( this._strings_bundle_screenshots )
        {
            try {
                return this._strings_bundle_screenshots.GetStringFromName( str );
            } catch( e ) {
				return "";
			}            
        }
        else {
            dump("** _strings_bundle_screenshots error  ** \n");
            return "";
        }
    },
};

