/**
 * linksnational.js
 * Foxtrick add links to national pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksNational = {
    MODULE_NAME : "LinksNational",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('national'),
	DEFAULT_ENABLED : true,
	OPTIONS : {},

    init : function() {
		Foxtrick.initOptionsLinks(this,"nationalteamlink");
    },

    run : function( page, doc ) {
		//addExternalLinksToNationalDetail
        var countryid;
		var ntteamid;
		var LeagueOfficeTypeID=doc.location.href.replace(/.+LeagueOfficeTypeID=/i, "").match(/^\d+/);
		var ownBoxBody=null;
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
					var thisdiv = alldivs[j];
					countryid = FoxtrickHelper.findCountryId(thisdiv);
					ntteamid = FoxtrickHelper.findTeamId(thisdiv);
					}
			}

        var links = Foxtrick.LinkCollection.getLinks("nationalteamlink", { "countryid": countryid,"ntteamid":ntteamid,"LeagueOfficeTypeID":LeagueOfficeTypeID }, doc, this);

		var added=0;
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
				++added;
			}

		}
		if (Foxtrick.isModuleEnabled(FoxtrickLinksTracker)) {
			var links2 = Foxtrick.LinkCollection.getLinks("trackernationalteamlink", { "countryid": countryid,"ntteamid":ntteamid,"LeagueOfficeTypeID":LeagueOfficeTypeID }, doc, FoxtrickLinksTracker);
   			if (links2.length > 0) {
				for (var k = 0; k < links2.length; k++) {
					links2[k].link.className ="flag inner";
					var img=links2[k].link.getElementsByTagName('img')[0];
					var style="vertical-align:top; margin-top:1px; background: transparent url(/Img/Flags/flags.gif) no-repeat scroll "+ (-20)*countryid+"px 0pt; -moz-background-clip: -moz-initial; -moz-background-origin: -moz-initial; -moz-background-inline-policy: -moz-initial;";
					img.setAttribute('style',style);
					img.src="/Img/Icons/transparent.gif";
					ownBoxBody.appendChild(links2[k].link);
					++added;
				}
			}
		}
		if (added) Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");

		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME,{ "countryid": countryid,"ntteamid":ntteamid,"LeagueOfficeTypeID":LeagueOfficeTypeID } );
    }
};
