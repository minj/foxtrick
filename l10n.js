/**
 * l10n.js
 * Localization tools.
 */
////////////////////////////////////////////////////////////////////////////////
var Foxtrickl10n = {
	properties:null,
	
    init : function() {	
    },
	
    getString : function( str ) { 
	try{
		var string_regexp = new RegExp( '\n'+str+'=(.+)\n', "i" );
		if (Foxtrickl10n.properties.search(string_regexp)!=-1) value=  Foxtrickl10n.properties.match(string_regexp)[1];
		//else if (myres_default.search(string_regexp)!=-1) value = this._strings_bundle_default.match(string_regexp)[1];		
		else return "** Localization error **";
		return value;
	}catch(e){alert('getString '+e);}
    },

    getFormattedString : function( str, key_array )
    {
            return "** Localization error **";
    },

    isStringAvailable : function( str )
    {
        return false;
    },
	
	isStringAvailableLocal : function( str )
    {
        return false;
    },
	
	getScreenshot : function( str ) {
        return '';
    },
};

// Open a port to the extension
var port = chrome.extension.connect({name: "ftproperties-query"});

port.onMessage.addListener(function(msg) {
    Foxtrickl10n.properties = msg.properties;
});

port.postMessage({reqtype: "properties"});

