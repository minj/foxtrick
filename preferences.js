/**
 * preferences.js
 * Foxtrick preferences service
 * @author Mod-PaV
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickPrefs = {

    pref:null,
	
    init : function() {		
    },

    getString : function( pref_name ) {  
		var string_regexp = new RegExp( 'user_pref\\("extensions.foxtrick.prefs.'+ pref_name+ '","(.+)"\\);', "i" );
		if (FoxtrickPrefs.pref.search(string_regexp)!=-1) return  FoxtrickPrefs.pref.match(string_regexp)[1];
		Foxtrick.dump("** preference error ** "+pref_name+'\n');
		return null;
    },

    setString : function( pref_name, value ) {
    },

    setInt : function( pref_name, value ) {
    },

    getInt : function( pref_name ) { 
		var string_regexp = new RegExp( 'user_pref\\("extensions.foxtrick.prefs.'+ pref_name+ '",(\d+)\\);', "i" );
		if (FoxtrickPrefs.pref.search(string_regexp)!=-1) return  parseInt(FoxtrickPrefs.pref.match(string_regexp)[1]);
		Foxtrick.dump("** preference error ** "+pref_name+'\n');
		return null;
    },

    setBool : function( pref_name, value ) {
    },

    getBool : function( pref_name ) {  
	try{ 
		var string_regexp = new RegExp( 'user_pref\\("extensions.foxtrick.prefs.'+ pref_name+ '",(.+)\\);', "i" );		
		if (FoxtrickPrefs.pref.search(string_regexp)!=-1) {
			//Foxtrick.dump(pref_name+' : '+FoxtrickPrefs.pref.match(string_regexp)[1]+'\n');
			return  FoxtrickPrefs.pref.match(string_regexp)[1]=='true';
		}
		Foxtrick.dump("** preference error ** "+pref_name+'\n');
		return null;
	} catch(e){alert('getBool error'+ pref_name+'  ' +e);}
    },
	

    /** Add a new preference "pref_name" of under "list_name".
     * Creates the list if not present.
     * Returns true if added (false if empty or already on the list).
     */
    addPrefToList : function( list_name, pref_value ) {
    },

    getList : function( list_name ) {
    },

    _getElemNames : function( list_name ) {
    },

    /** Remove a list element. */
    delListPref : function( list_name, pref_value ) {
    },

    /** Populate list_name with given array deleting if exists */
    _populateList : function( list_name, values ) {
    },
    
    deleteValue : function( value_name ){
    },	
};


// Open a port to the extension
var port2 = chrome.extension.connect({name: "ftpref-query"});

port2.onMessage.addListener(function(msg) {
    FoxtrickPrefs.pref = msg.pref;
});

port2.postMessage({reqtype: "pref"});

