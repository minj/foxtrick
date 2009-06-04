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
        try {
            var submitButton = doc.getElementById("ctl00_CPMain_btnBid");
            if (submitButton){
                var sOnclick = submitButton.getAttribute("onClick").replace(/javascript\:/, "");
                var sConfirmString = Foxtrickl10n.getString( "foxtrick.bidconfirmation" );
                var sReplace = "document.getElementById('ctl00_CPMain_txtBid').value.split( '' ).reverse().join( '' ).replace( new RegExp( '(.{' + 3 + '})(?!$)', 'g' ), '$1' + ' ' ).split( '' ).reverse().join( '' )";
                var sStr = "var str = '"+sConfirmString+"';";
                sOnclick = sStr + " if (confirm(str.replace(/\%s/, " + sReplace + "))){" + sOnclick + "} else {return false;}";
                submitButton.setAttribute("onClick", sOnclick);
            }
        } catch( e) {
            dump('ConfirmPlayerBid ' + e + '\n'); 
        }
	},
	
	change : function( page, doc ) {
		var submitButton = doc.getElementById("ctl00_CPMain_btnBid");
        if (submitButton){
        	var sOnclick = submitButton.getAttribute("onClick").replace(/javascript\:/, "");
        	if (sOnclick.search(/confirm/) == -1){ // already added?
	       		var sConfirmString = Foxtrickl10n.getString( "foxtrick.bidconfirmation" );
	       		var sReplace = "document.getElementById('ctl00_CPMain_txtBid').value.split( '' ).reverse().join( '' ).replace( new RegExp( '(.{' + 3 + '})(?!$)', 'g' ), '$1' + ' ' ).split( '' ).reverse().join( '' )";
	       		var sStr = "var str = '"+sConfirmString+"';";
	       		sOnclick = sStr + " if (confirm(str.replace(/\%s/, " + sReplace + "))){" + sOnclick + "} else {return false;}";
	       		submitButton.setAttribute("onClick", sOnclick);
	       	}
        }
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
		try {
            var submitButton = doc.getElementById("ctl00_CPSidebar_ucOwnerActions_btnSell");
            if (submitButton){
                var sOnclick = submitButton.getAttribute("onClick").replace(/javascript\:/, "");
                if (sOnclick.search(/confirm/) == -1){ // already added?
                    var sConfirmString = Foxtrickl10n.getString( "foxtrick.tlconfirmation" );
                    var sReplace = "document.getElementById('ctl00_CPSidebar_ucOwnerActions_txtPrice').value.split( '' ).reverse().join( '' ).replace( new RegExp( '(.{' + 3 + '})(?!$)', 'g' ), '$1' + ' ' ).split( '' ).reverse().join( '' )";
                    var sStr = "var str = \""+sConfirmString+"\";";
                    sOnclick = sStr + " if (confirm(str.replace(/\%s/, " + sReplace + "))){" + sOnclick + ";} else {return false;}";
                    submitButton.setAttribute("onClick", sOnclick);
                }
            }
        } catch(e) { 
            dump('ConfirmTL RUN ' + e + '\n'); 
        }		
	},
	
	change : function( page, doc ) {
		try {
            var submitButton = doc.getElementById("ctl00_CPSidebar_ucOwnerActions_btnSell");
            if (submitButton){
                var sOnclick = submitButton.getAttribute("onClick").replace(/javascript\:/, "");
                if (sOnclick.search(/confirm/) == -1){ // already added?
                    var sConfirmString = Foxtrickl10n.getString( "foxtrick.tlconfirmation" );
                    var sReplace = "document.getElementById('ctl00_CPSidebar_ucOwnerActions_txtPrice').value.split( '' ).reverse().join( '' ).replace( new RegExp( '(.{' + 3 + '})(?!$)', 'g' ), '$1' + ' ' ).split( '' ).reverse().join( '' )";
                    var sStr = "var str = \""+sConfirmString+"\";";
                    sOnclick = sStr + " if (confirm(str.replace(/\%s/, " + sReplace + "))){" + sOnclick + ";} else {return false;}";
                    submitButton.setAttribute("onClick", sOnclick);
                }
            }
        } catch(e) { 
            dump('ConfirmTL CNG' + e + '\n'); 
        }
	}
};

/**
* Adds NT add/remove from squad confirm box
* @author larsw84
*/
var FoxtrickNTConfirmAddRemove = {
	
	MODULE_NAME : "NTConfirmAddRemove",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : false,

    init : function() {
        Foxtrick.registerPageHandler( 'playerdetail',
                                      FoxtrickNTConfirmAddRemove );
    },
	
	run : function( page, doc ) {
		try {
            var submitLink = doc.getElementById("ctl00_CPSidebar_ucNTCoachOptions_repNTActions_ctl00_lnkNTAction");
			if (submitLink){
                var sOnclick = submitLink.href.replace(/javascript\:/, "");
                if (sOnclick.search(/confirm/) == -1){ // already added?
                    sConfirmString = Foxtrickl10n.getString( "foxtrick.ntremoveconfirmation" );
                    sOnclick = "javascript:if(confirm(\"" + sConfirmString + "\")){" + sOnclick + ";}";
                    submitLink.href=sOnclick;
                }
            }
        } catch(e) { 
            dump('FoxtrickNTConfirmRemove RUN ' + e + '\n'); 
        }		
	},
	
	change : function( page, doc ) {
		try {
            var submitLink = doc.getElementById("ctl00_CPSidebar_ucNTCoachOptions_repNTActions_ctl00_lnkNTAction");
            if (submitLink){
                var sOnclick = submitLink.href.replace(/javascript\:/, "");
                if (sOnclick.search(/confirm/) == -1){ // already added?
                    var sConfirmString = Foxtrickl10n.getString( "foxtrick.ntremoveconfirmation" );
                    sOnclick = "javascript:if(confirm(\"" + sConfirmString + "\")){" + sOnclick + ";}";
                    submitLink.href=sOnclick;
                }
            }
        } catch(e) { 
            dump('FoxtrickNTConfirmRemove CHG ' + e + '\n'); 
        }
	}
};
