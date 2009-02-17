/**
 * l10n.js
 * Localization tools.
 */
////////////////////////////////////////////////////////////////////////////////
var Foxtrickl10n = {
    _strings_bundle : null,
	_strings_bundle_default : null,

    init : function() {
        this._strings_bundle =
             Components.classes["@mozilla.org/intl/stringbundle;1"] 
             .getService(Components.interfaces.nsIStringBundleService)  
             .createBundle("chrome://foxtrick/locale/foxtrick.properties");
        this._strings_bundle_default =
             Components.classes["@mozilla.org/intl/stringbundle;1"] 
             .getService(Components.interfaces.nsIStringBundleService)  
             .createBundle("chrome://foxtrick/content/foxtrick.properties");
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
    }
};

