"use strict";
/**
 * links-world.js
 * Foxtrick add links to manager pages
 * @author convinced
 */

Foxtrick.modules["LinksWorld"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('world'),

	OPTION_FUNC : function(doc) {
		return Foxtrick.util.module.get("Links").getOptionsHtml(doc, "LinksWorld", "worldlink");
	},

	run : function(doc) {
		var ownBoxBody = null;
		var mainBody = doc.getElementsByClassName("main")[0];

		var links = Foxtrick.util.module.get("Links").getLinks("worldlink", {}, doc, this);
		if (links.length > 0){
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, "div");
			var header = Foxtrickl10n.getString(
						"links.boxheader" );
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
};
