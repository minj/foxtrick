/**
 * Preference dialog functions.
 * @author Mod-PaV
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickPreferencesDialog = {

    init : function() {
        // var doc = ev.originalTarget;
        var i;

        for ( i in FoxtrickPreferencesDialog._core_modules ) {
            FoxtrickPreferencesDialog._core_modules[i].init()
        }


        dump( "this: " + this + "\n" );
        FoxtrickPreferencesDialog._fillModulesList( document );
    },

    onDialogAccept : function() {
        return true;
    },


    _fillModulesList : function( doc ) {
        var listbox = doc.getElementById( "modules_listbox" );
        dump( "listbox: " + listbox + "\n" );

        var test = doc.getElementById( "test_label" );
        dump( "aa: " + test + "\n" );
        test.setAttribute = ("value", "asdawekrlaksdfj" );

        for ( i in Foxtrick.modules ) {
            dump( "doc: " + doc + "\n" );
            dump( "adding\n" );
            var entry = document.createElement( "p" );
            entry.innerHTML = " aaaa ";
            // var entry = doc.createElement( "xul:hbox" );
            // var checkbox = doc.createElement( "xul:checkbox" );
            // entry.appendChild( checkbox );

            listbox.appendChild( entry );
        }
    }

};

FoxtrickPreferencesDialog.core_modules = [ FoxtrickPrefs ];

