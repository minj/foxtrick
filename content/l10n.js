/**
 * l10n.js
 * Localization tools.
 */
////////////////////////////////////////////////////////////////////////////////
var Foxtrickl10n = {
    _strings_bundle : null,

    init : function() {
        this._strings_bundle =
             Components.classes["@mozilla.org/intl/stringbundle;1"] 
             .getService(Components.interfaces.nsIStringBundleService)  
             .createBundle("chrome://foxtrick/locale/foxtrick.properties");
    },

    getString : function( str ) {
        if ( this._strings_bundle )
        {
            try {
                return this._strings_bundle.GetStringFromName( str );
            } catch( e ) {
                return "** Localization error **";
            }
        }
        else
            return "** Localization error **";
    },

    getFormattedString : function( str, key_array )
    {
        if ( this._strings_bundle )
        {
            try {
                return this._strings_bundle.formatStringFromName( str, key_array );
            } catch( e ) {
                return "** Localization error **";
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
                return false;
            }
        }
        return false;
    }
};

