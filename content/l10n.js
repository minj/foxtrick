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
            return this._strings_bundle.getString( str );
        else
            return "** Localization error **";
    }
};

