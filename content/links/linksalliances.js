/**
 * linksyouthoverview.js
 * Foxtrick add links to arena pages
 * @author larsw84
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksAlliances = {

    MODULE_NAME : "LinksAlliances",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('federation'),
	DEFAULT_ENABLED : true,
	OPTIONS : {},

    init : function() {
			Foxtrick.initOptionsLinks(this,"federationlink");
    },

    run : function( page, doc ) {
		//addExternalLinksToArenaPage

		var alldivs = doc.getElementsByTagName('div');
		var ownBoxBody=null;
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
				var thisdiv = alldivs[j].getElementsByTagName("div")[0];
				var allianceLink = thisdiv.getElementsByTagName("a")[2];
				var startPos = allianceLink.href.search("=")+1;
				var allianceId = allianceLink.href.substr(startPos);

 				var links = Foxtrick.LinkCollection.getLinks("federationlink", { "federationid" : allianceId}, doc, this );
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
				FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME,{ "AllianceID" : allianceId} );
				break;
			}
		}
    },

 };
