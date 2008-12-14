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
        var modules_list = document.getElementById( "modules_list" );
        for ( var i = 0; i < modules_list.childNodes.length; ++i ) {
            FoxtrickPreferencesDialog.setModuleEnableState( modules_list.childNodes[i].prefname,
                                                            modules_list.childNodes[i].childNodes[0].childNodes[0].checked );
                                                            // modules_list.childNodes[i].checked );
            // dump( modules_list.childNodes[i].prefname + " " + modules_list.childNodes[i].childNodes[0].childNodes[0].checked + "\n" );
        }
        return true;
    },


    _fillModulesList : function( doc ) {
        var modules_list = doc.getElementById( "modules_list" );

        for ( i in Foxtrick.modules ) {
            var module = Foxtrick.modules[i];
            /*var entry = document.createElement( "listitem" );
            entry.setAttribute( "type", "checkbox" );
            entry.setAttribute( "label", Foxtrick.modules[i].MODULE_NAME );
            entry.setAttribute( "checked", FoxtrickPreferencesDialog.getModuleEnableState( Foxtrick.modules[i].MODULE_NAME ) ); 

            listbox.appendChild( entry );*/

            var entry = document.createElement( "vbox" );
            entry.prefname = module.MODULE_NAME;
            entry.setAttribute( "class", "entry" );
            entry.addEventListener( "click", function( ev ) { 
                        ev.currentTarget.childNodes[0].childNodes[0].checked =
                            !(ev.currentTarget.childNodes[0].childNodes[0].checked);
                    }, false );
            var hbox = document.createElement( "hbox" );
            var check = document.createElement( "checkbox" );
            check.addEventListener( "click", function( ev ) { ev.target.checked = !ev.target.checked; }, true );
            check.setAttribute( "checked", FoxtrickPreferencesDialog.getModuleEnableState( module.MODULE_NAME ) ); 
            hbox.appendChild( check );
            var name = document.createElement( "label" );
            name.setAttribute( "class", "name" );
            name.setAttribute( "value", module.MODULE_NAME );
            hbox.appendChild( name );
            entry.appendChild( hbox );
            var desc = document.createElement( "label" );
            desc.setAttribute( "class", "description" );
            desc.setAttribute( "value", FoxtrickPreferencesDialog.getModuleDescription( module.MODULE_NAME ) );
            entry.appendChild( desc );
            modules_list.appendChild( entry );
        }
    }

};

FoxtrickPreferencesDialog.core_modules = [ FoxtrickPrefs, Foxtrickl10n ];

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

FoxtrickPreferencesDialog.getModuleDescription = function( module_name ) {
    var name = "foxtrick." + module_name + ".desc";
    if ( Foxtrickl10n.isStringAvailable( name ) )
        return Foxtrickl10n.getString( name );
    else
        return "No description";
}

FoxtrickPreferencesDialog.configureFoxtrick = function( ) {
	window.openDialog("chrome://foxtrick/content/preferences-dialog.xul",
                      "", "centerscreen, chrome, modal, resizable=yes");
}