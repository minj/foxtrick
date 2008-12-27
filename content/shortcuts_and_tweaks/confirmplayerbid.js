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
		
        var submitButton = doc.getElementById("ctl00_CPMain_btnBid");
        if (submitButton){
        	var sOnclick = submitButton.getAttribute("onClick").replace(/javascript\:/, "");
        	if (sOnclick.search(/confirm/) == -1){ // already added?
	       		sConfirmString = Foxtrickl10n.getString( "foxtrick.bidconfirmation" );
	       		sReplace = "document.getElementById('ctl00_CPMain_txtBid').value.split( '' ).reverse().join( '' ).replace( new RegExp( '(.{' + 3 + '})(?!$)', 'g' ), '$1' + ' ' ).split( '' ).reverse().join( '' )";
	       		sStr = "var str = '"+sConfirmString+"';";
	       		sOnclick = sStr + " if (confirm(str.replace(/\%s/, " + sReplace + "))){" + sOnclick + "} else {return false;}";
	       		submitButton.setAttribute("onClick", sOnclick);
	       	}
        }
	},
	
	change : function( page, doc ) {
	
	}
};

/**
* Adds player transferlist confirm box
* @author larsw84
*/
var FoxtrickConfirmTL = {
	
	MODULE_NAME : "ConfirmTL",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,

    init : function() {
        Foxtrick.registerPageHandler( 'playerdetail',
                                      FoxtrickConfirmTL );
    },
	
	run : function( page, doc ) {
		
	},
	
	change : function( page, doc ) {
		var submitButton = doc.getElementById("ctl00_CPSidebar_ucOwnerActions_btnSell");
		if (submitButton){
        	var sOnclick = submitButton.getAttribute("onClick").replace(/javascript\:/, "");
        	if (sOnclick.search(/confirm/) == -1){ // already added?
	       		sConfirmString = Foxtrickl10n.getString( "foxtrick.tlconfirmation" );
	       		sReplace = "document.getElementById('ctl00_CPSidebar_ucOwnerActions_txtPrice').value.split( '' ).reverse().join( '' ).replace( new RegExp( '(.{' + 3 + '})(?!$)', 'g' ), '$1' + ' ' ).split( '' ).reverse().join( '' )";
	       		sStr = "var str = \""+sConfirmString+"\";";
				sOnclick = sStr + " if (confirm(str.replace(/\%s/, " + sReplace + "))){" + sOnclick + ";} else {return false;}";
				submitButton.setAttribute("onClick", sOnclick);
	       	}
        }
	}
};
