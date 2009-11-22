/**
 * preferences.js
 * Foxtrick preferences service
 * @author Mod-PaV
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickPrefs = {

    _pref_branch : null,

    init : function() {

        var prefs = Components.classes[ "@mozilla.org/preferences-service;1"].
                           getService( Components.interfaces.nsIPrefService );

        this._pref_branch = prefs.getBranch( "extensions.foxtrick.prefs." );
		
    },

    getString : function( pref_name ) {
        var str;
		try { 
            str = this._pref_branch.getComplexValue( encodeURI(pref_name),
                                 Components.interfaces.nsISupportsString ).data;
        } catch( e ) {
 				str = null;
		}
		if (str==null) {
			try { 
				str = this._pref_branch.getComplexValue( pref_name,
                                Components.interfaces.nsISupportsString ).data;
 			} catch( e ) {
				str = null;
			}
		}
 		return str;
    },

    setString : function( pref_name, value ) {
        var str = Components.classes[ "@mozilla.org/supports-string;1" ].
                     createInstance( Components.interfaces.nsISupportsString );
        str.data = value;
        this._pref_branch.setComplexValue( encodeURI(pref_name),
                                Components.interfaces.nsISupportsString, str );
    },

    setInt : function( pref_name, value ) {
        this._pref_branch.setIntPref( encodeURI(pref_name), value );
    },

    getInt : function( pref_name ) {
        var value;
		try {
            value = this._pref_branch.getIntPref( encodeURI(pref_name) );
        } catch( e ) {
			value = null;
        }
        if (value==null) {
			try {
				value = this._pref_branch.getIntPref( pref_name );
			} catch( e ) {
				value = null;
			}
		}
		return value;
    },

    setBool : function( pref_name, value ) {
        this._pref_branch.setBoolPref( encodeURI(pref_name), value );
    },

    getBool : function( pref_name ) {
		var value;
		try {
            value = this._pref_branch.getBoolPref( encodeURI(pref_name) );
        } catch( e ) {
			value = null;
        }	        
		if (value == null) {
			try {
				value = this._pref_branch.getBoolPref( pref_name );
			} catch( e ) {
				value = null;
			}	        
		}
		return value;
    },

    /** Add a new preference "pref_name" of under "list_name".
     * Creates the list if not present.
     * Returns true if added (false if empty or already on the list).
     */
    addPrefToList : function( list_name, pref_value ) {

        if ( pref_value == "" )
            return false;

        var existing = FoxtrickPrefs.getList( list_name );

        // already exists?
        var exists = existing.some(
            function( el ) {
                if ( el == pref_value ) {
                    return true;
                }
            }
        );

        if ( !exists ) {
            existing.push( pref_value );
            FoxtrickPrefs._populateList( list_name, existing );

            return true;
        }

        return false
    },

    getList : function( list_name ) {
        var names = FoxtrickPrefs._getElemNames( list_name );
		var list = new Array();
        for ( var i in names ) 
			list.push( FoxtrickPrefs.getString( names[i] ) );
		
        return list;
    },

    _getElemNames : function( list_name ) {
        try {
			var array = null;
			if( list_name != "" ) 
				array = this._pref_branch.getChildList( encodeURI(list_name + "."), {} );
			else
				array = this._pref_branch.getChildList( "", {} );
			for (var i=0;i<array.length;++i) {array[i] = decodeURI(array[i]);}
			return array;
        } catch( e ) {
            return null;
        }
    },

    /** Remove a list element. */
    delListPref : function( list_name, pref_value ) {
        var existing = FoxtrickPrefs.getList( list_name );

        existing = existing.filter(
            function( el ) {
                if ( el != pref_value )
                    return el;
            }
        );

        FoxtrickPrefs._populateList( list_name, existing );
    },

    /** Populate list_name with given array deleting if exists */
    _populateList : function( list_name, values )
    {
        this._pref_branch.deleteBranch( encodeURI(list_name) );
        for (var  i in values )
            FoxtrickPrefs.setString( decodeURI(list_name + "." + i), values[i] );
    },
    
    deleteValue : function( value_name ){
    	this._pref_branch.deleteBranch( encodeURI(value_name) );
    },
};
