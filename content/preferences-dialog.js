/**
 * Preference dialog functions.
 * @author Mod-PaV
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickPreferencesDialog = {

    init : function() {
        // var doc = ev.originalTarget;
        var i;

        for ( i in FoxtrickPreferencesDialog.core_modules ) {
            FoxtrickPreferencesDialog.core_modules[i].init()
        }

        FoxtrickPreferencesDialog._fillModulesList( document );
    },

    onDialogAccept : function() {
        var listbox = document.getElementById( "modules_listbox" );
        for ( var i = 0; i < listbox.childNodes.length; ++i ) {
            FoxtrickPreferencesDialog.setModuleEnableState( listbox.childNodes[i].label,
                                                            listbox.childNodes[i].checked );
        }
        return true;
    },


    _fillModulesList : function( doc ) {
        var listbox = doc.getElementById( "modules_listbox" );

        for ( i in Foxtrick.modules ) {
            var entry = document.createElement( "listitem" );
            entry.setAttribute( "type", "checkbox" );
            entry.setAttribute( "label", Foxtrick.modules[i].MODULE_NAME );
            entry.setAttribute( "checked", FoxtrickPreferencesDialog.getModuleEnableState( Foxtrick.modules[i].MODULE_NAME ) ); 

            listbox.appendChild( entry );
        }
    }

};

FoxtrickPreferencesDialog.core_modules = [ FoxtrickPrefs ];

FoxtrickPreferencesDialog.getModuleEnableState = function( module_name ) {
    try {
        return FoxtrickPrefs.getBool( "module." + module_name + ".enabled" );
    } catch( e ) {
        return false;
    }
}

FoxtrickPreferencesDialog.setModuleEnableState = function( module_name, value ) {
    FoxtrickPrefs.setBool( "module." + module_name + ".enabled", value );
}

