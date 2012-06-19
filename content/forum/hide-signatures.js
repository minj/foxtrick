"use strict";
/**
 * forumhidesignature.js
 * Script which hides signatures on the forums, but shows a 'Show sig' link
 * @author smates, larsw84, CatzHoek
 */

Foxtrick.modules["HideSignatures"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : ['forumViewThread'],
	run : function(doc) {
		var elems = doc.getElementsByClassName("signature");
		for(var i=0; i < elems.length; i++) {
			//the signature
			Foxtrick.addClass(elems[i], "hidden");
			elems[i].setAttribute("id", "foxtrick-signature-" + i);

			//the button
			var showSigLink = Foxtrick.createFeaturedElement(doc, this, "a");
			Foxtrick.addClass(showSigLink, "foxtrick-signaturetoggle");
			showSigLink.setAttribute("style", "cursor: pointer;");
			showSigLink.setAttribute("title", Foxtrickl10n.getString('HideSignatures.signaturetoggle') );
			showSigLink.setAttribute("id","foxtrick-st-link" + i);

			var text = doc.createTextNode( Foxtrickl10n.getString('HideSignatures.signaturetoggle') );
			showSigLink.appendChild( text );

			try {
				// append the show sig link to the right footer
				var cfWrapper = elems[i].parentNode.parentNode.parentNode;
				var cfFooter = cfWrapper.getElementsByClassName("cfFooter")[0];
				var floatRight = cfFooter.getElementsByClassName("float_right")[0];
				floatRight.appendChild(showSigLink);
			} catch(e){
				Foxtrick.dump('HideSignatures: Unexpected DOM Structure', e);
			}
			//toogle
			Foxtrick.listen(showSigLink, 'click', function(ev) {
				try {
					var id = ev.target.getAttribute("id").match(/\d+/)[0];
					var sig = doc.getElementById("foxtrick-signature-" + id);
					Foxtrick.toggleClass(sig, "hidden");
				} catch(e){
					Foxtrick.dump('HideSignatures click listener error. Id: ' + id + ' ' + sig + ' ' + e + '\n');	
				}							
			}, false);			
		}
	}
};
