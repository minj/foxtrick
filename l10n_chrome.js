/**
 * l10n.js
 * Localization tools.
 */
////////////////////////////////////////////////////////////////////////////////
var Foxtrickl10n = {
	properties:null,
	properties_default:null,
	screenshots: null,	
    
	init : function() {	
    },
	
    getString : function( str ) { 
	try{ //Foxtrick.dump('10ln: '+str+' '+Foxtrickl10n.properties.substring(0,20));
		var string_regexp = new RegExp( '\\s'+str+'=(.+)\\s', "i" );
		if (Foxtrickl10n.properties.search(string_regexp)!=-1) value =  Foxtrickl10n.properties.match(string_regexp)[1];
		else if (Foxtrickl10n.properties_default.search(string_regexp)!=-1) value =  Foxtrickl10n.properties_default.match(string_regexp)[1];
		else value = "** Localization error 1 **";;
		return value;
	}catch(e){alert('getString '+e);}
    },

    isStringAvailable : function( str )
    {
		var string_regexp = new RegExp( '\\s'+str+'=(.+)\\s', "i" );
		return (Foxtrickl10n.properties.search(string_regexp)!=-1 
			|| Foxtrickl10n.properties_default.search(string_regexp)!=-1);
    },
	
	isStringAvailableLocal : function( str )
    {
		var string_regexp = new RegExp( '\\s'+str+'=(.+)\\s', "i" );
		return (Foxtrickl10n.properties.search(string_regexp)!=-1); 
    },
	
	getScreenshot : function( str ) {
	try{  
		var string_regexp = new RegExp( '\\s'+str+'=(.+)\\s', "i" ); 
		if (Foxtrickl10n.screenshots.search(string_regexp)!=-1) return Foxtrickl10n.screenshots.match(string_regexp)[1];
		return '';
	}catch(e){alert('getscreenshots '+e);}
    },
};
