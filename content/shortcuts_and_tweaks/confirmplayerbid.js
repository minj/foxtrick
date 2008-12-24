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
            		sConfirmString = Foxtrickl10n.getString( "foxtrick.tweaks.Really_bid" ) + " (' + document.getElementById('ctl00_CPMain_txtBid').value + ')";
            		sOnclick = "if (confirm('" + sConfirmString +"')){" + sOnclick + "} else {return false;}";
            		submitButton.setAttribute("onClick", sOnclick);
            	}
              break;
        }
	},
	
	change : function( page, doc ) {
	
	}
};

