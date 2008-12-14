/**
 * l10n.js
 * Localization tools.
 */
////////////////////////////////////////////////////////////////////////////////
var Foxtrickl10n = {
    _strings_bundle : null,

    init : function() {
        this._strings_bundle = document.getElementById( "string-bundle" );
    },

    getString : function( str ) {
        if ( this._strings_bundle )
        {
            try {
                return this._strings_bundle.getString( str );
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
                return this._strings_bundle.getFormattedString( str, key_array );
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
                return this._strings_bundle.getString( str ) != null;
            } catch( e ) {
                return false;
            }
        }
        return false;
    }
};

