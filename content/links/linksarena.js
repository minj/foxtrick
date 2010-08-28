/**
 * linksyouthoverview.js
 * Foxtrick add links to arena pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksArena = {

    MODULE_NAME : "LinksArena",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('arena'),
	DEFAULT_ENABLED : true,
	OPTIONS : {},

    init : function() {
			Foxtrick.initOptionsLinks(this,"arenalink");
    },

    run : function( page, doc ) {
		//addExternalLinksToArenaPage

		var alldivs = doc.getElementsByTagName('div');
		var ownBoxBody=null;
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="arenaInfo") {
				var thisdiv = alldivs[j];
				var arenaTable = thisdiv.getElementsByTagName("table")[0];

 				var links = Foxtrick.LinkCollection.getLinks("arenalink", { "terraces" : Foxtrick.trimnum(arenaTable.rows[3].cells[1].textContent),
                                            "basic": Foxtrick.trimnum(arenaTable.rows[4].cells[1].textContent),
                                            "roof" : Foxtrick.trimnum(arenaTable.rows[5].cells[1].textContent),
                                            "vip" : Foxtrick.trimnum(arenaTable.rows[6].cells[1].textContent),  }, doc, this );
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
				FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME ,{ "terraces" : Foxtrick.trimnum(arenaTable.rows[3].cells[1].textContent),
                                            "basic": Foxtrick.trimnum(arenaTable.rows[4].cells[1].textContent),
                                            "roof" : Foxtrick.trimnum(arenaTable.rows[5].cells[1].textContent),
                                            "vip" : Foxtrick.trimnum(arenaTable.rows[6].cells[1].textContent),  });

				break;
			}
		}
    },

 };
