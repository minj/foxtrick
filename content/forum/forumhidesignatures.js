/**
 * forumhidesignature.js
 * Script which hides signatures on the forums, but shows a 'Show sig' link
 * @author smates
 */

var FoxtrickHideSignatures = {
	
    MODULE_NAME : "HideSignatures",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,
	
    init : function() {
            Foxtrick.registerPageHandler( 'forumViewThread',
                                          FoxtrickHideSignatures);
    },

    run : function( page, doc ) { 
		var p = 0;
		var elems = doc.getElementsByTagName("div");
		for(var i=0; i < elems.length; i++) {
			if(elems[i].className == "signature") {
				p = p+1;
				if( !doc.getElementById( "foxtrick-st-link"+p ) ) {
					elems[i].style.display="none";
					elems[i].id = "foxtrick-signature-"+p;
			    
					var showSig = [];
					showSig[p] = doc.createElement("a");
					showSig[p].setAttribute("id","foxtrick-st-link"+p);
					showSig[p].className="foxtrick-signaturetoggle";
					showSig[p].innerHTML = "Signature";
					showSig[p].href = "javascript:showHide('foxtrick-signature"
						+ "-" + p + "');";
					elems[i+4].appendChild(showSig[p]);
				}
            }
		}
	}
};