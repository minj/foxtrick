/**
 * linksClubTransfers.js
 * Foxtrick add links to arena pages
 * @author convincedd
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksClubTransfers = {
    MODULE_NAME : "LinksClubTransfers",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('transfer'),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.0.5",
	LATEST_CHANGE : "Custom links for club transfer page enabled",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS : {},

    init : function() {
		Foxtrick.initOptionsLinks(this,"clubtransferslink");
    },

    run : function( page, doc ) {
		//addExternalLinksToClubTransfersPage

		var alldivs = doc.getElementsByTagName('div');
		var ownBoxBody=null;
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
				var thisdiv = alldivs[j].getElementsByTagName("div")[0];

 				var links = Foxtrick.LinkCollection.getLinks("clubtransferslink", {}, doc, this );
				if (links.length > 0) {
					ownBoxBody = doc.createElement("div");
					var header = Foxtrickl10n.getString(
						"foxtrick.links.boxheader" );
					var ownBoxId = "foxtrick_links_box";
					var ownBoxBodyId = "foxtrick_links_content";
					ownBoxBody.setAttribute( "id", ownBoxBodyId );

					for (var k = 0; k < links.length; k++) {
						links[k].link.className ="inner";
						ownBoxBody.appendChild(links[k].link);
					}

					Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");
					}
				FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME,{} );
				break;
			}
		}
    }
};
