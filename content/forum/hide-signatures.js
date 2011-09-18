/**
 * forumhidesignature.js
 * Script which hides signatures on the forums, but shows a 'Show sig' link
 * @author smates, larsw84
 */

Foxtrick.util.module.register({
	MODULE_NAME : "HideSignatures",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumViewThread'),

	run : function(doc) {
		//return;
		var p = 0;
		var elems = doc.getElementsByTagName("div");
		for(var i=0; i < elems.length; i++) {
			if( elems[i].className == "signature" ||
				elems[i].className == "signature-trunc") {
				p++;
				if( !doc.getElementById( "foxtrick-st-link"+p ) ) {
					try {
						elems[i].style.display="none";
						var sigId = elems[i].id;
						if( !sigId ) {
							sigId = "foxtrick-signature-"+p;
							elems[i].id = sigId;
						}

						var showSig = [];
						showSig[p] = doc.createElement("a");
						showSig[p].setAttribute("id","foxtrick-st-link"+p);
						showSig[p].title = Foxtrickl10n.getString('foxtrick.conferences.signaturetoggle');
						showSig[p].className="foxtrick-signaturetoggle";
						showSig[p].innerHTML = Foxtrickl10n.getString('foxtrick.conferences.signaturetoggle');
						showSig[p].href = "javascript:showHide('" + sigId + "');";
						// append the show sig link to the right footer
						var cfInnerWrapper = elems[i].parentNode.parentNode;
						var cfFooter = cfInnerWrapper.nextSibling;
						while( cfFooter.className != "cfFooter" ) {
							cfFooter = cfFooter.nextSibling;
						}
						var divsInFooter = cfFooter.getElementsByTagName("div");
						for(var j = 0; j < divsInFooter.length; j++) {
							if( divsInFooter[j].className == "float_right" ) {
								divsInFooter[j].appendChild(showSig[p]);
							}
						}
					} catch(e) {Foxtrick.dump('HideSignatures ERROR ' + e + '\n');}
				}
			}
		}
	}
});
