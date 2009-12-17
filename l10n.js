/**
 * l10n.js
 * Localization tools.
 */
////////////////////////////////////////////////////////////////////////////////
var Foxtrickl10n = {
	properties:null,
	properties_default:null,
	
    init : function() {	
    },
	
    getString : function( str ) { 
	try{
		var string_regexp = new RegExp( '\\s'+str+'=(.+)\\s', "i" );
		if (Foxtrickl10n.properties.search(string_regexp)!=-1) value =  Foxtrickl10n.properties.match(string_regexp)[1];
		else if (Foxtrickl10n.properties_default.search(string_regexp)!=-1) value =  Foxtrickl10n.properties_default.match(string_regexp)[1];
		else value = str;
		return value;
	}catch(e){alert('getString '+e);}
    },

    getFormattedString : function( str, key_array )
    {
            return "** Localization error **";
    },

    isStringAvailable : function( str )
    {
        return true;
    },
	
	isStringAvailableLocal : function( str )
    {
        return false;
    },
	
	getScreenshot : function( str ) {
        return '';
    },
};
