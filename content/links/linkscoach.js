/**
 * linksleague.js
 * Foxtrick add links to coach pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksCoach = {
    MODULE_NAME : "LinksCoach",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('coach'),
	DEFAULT_ENABLED : true,
	OPTIONS : {},

    init : function() {
		Foxtrick.initOptionsLinks(this,"coachlink");
    },

    run : function( page, doc ) {
		//addExternalLinksToCoachPage
		var links = Foxtrick.LinkCollection.getLinks("coachlink", {  }, doc, this);
		var ownBoxBody=null;

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
		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME ,{});
	}
};
