/**
 * links-league.js
 * Foxtrick add links to coach pages
 * @author convinced
 */

Foxtrick.util.module.register({
	MODULE_NAME : "LinksCoach",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('coach'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, false, "coachlink");
	},

	run : function(doc) {
		var links = Foxtrick.LinkCollection.getLinks("coachlink", {  }, doc, this);
		var ownBoxBody=null;

		if (links.length > 0) {
			ownBoxBody = doc.createElement("div");
			var header = Foxtrickl10n.getString(
						"foxtrick.links.boxheader" );
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );

			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(links[k].link);
			}

			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = "ft-links-box";
		}
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME ,{});
	}
});
