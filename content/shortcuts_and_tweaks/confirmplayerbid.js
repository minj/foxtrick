/**
 * confirmplayerbid.js
 * Adds a confirmation box for bidding
 * @author bummerland
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickConfirmPlayerBid = {
    
    MODULE_NAME : "ConfirmPlayerBid",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,

    init : function() {
        Foxtrick.registerPageHandler( 'playerdetail',
                                      FoxtrickConfirmPlayerBid );
    },

    run : function( page, doc ) {
		
        // var doc = Foxtrick.current_doc;

        switch( page )
        {
            case 'playerdetail':
            	var submitButton = doc.getElementById("ctl00_CPMain_btnBid");
            	if (submitButton){
            		var sOnclick = submitButton.getAttribute("onClick").replace(/javascript\:/, "");
            		if (sOnclick.search(/confirm/) == -1){ // already added?
	            		sConfirmString = Foxtrickl10n.getString( "foxtrick.bidconfirmation" );
	            		sReplace = "document.getElementById('ctl00_CPMain_txtBid').value.split( '' ).reverse().join( '' ).replace( new RegExp( '(.{' + 3 + '})(?!$)', 'g' ), '$1' + ' ' ).split( '' ).reverse().join( '' )";
//	            		dump(doc.getElementById('ctl00_CPMain_txtBid').parentNode.innerHTML+"\n");
//	            		sUnit = doc.getElementById('ctl00_CPMain_txtBid').nextSibling.data;
//	            		sUnit = Foxtrick.trim(sUnit).replace(/\&nbsp\;/, "");
//	            		dump(sUnit+"\n");
//	            		sReplace  = sReplace + sUnit;
	            		sStr = "var str = '"+sConfirmString+"';";
	            		sOnclick = sStr + " if (confirm(str.replace(/\%s/, " + sReplace + "))){" + sOnclick + "} else {return false;}";
	            		submitButton.setAttribute("onClick", sOnclick);
	            	}
            	}
              break;
        }
	},
	
	change : function( page, doc ) {
	
	}
};
