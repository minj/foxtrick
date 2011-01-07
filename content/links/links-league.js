/**
 * links-league.js
 * Foxtrick add links to league pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////

var FoxtrickLinksLeague = {
	MODULE_NAME : "LinksLeague",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('league'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, false, "leaguelink");
	},

	run : function( page, doc ) {
		//addExternalLinksToLeagueDetail
		var alldivs = doc.getElementsByTagName('div');
		var ownBoxBody=null;
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
				var thisdiv = alldivs[j];
				var leagueid = FoxtrickHelper.findLeagueLeveUnitId(thisdiv);;
				var countryid = FoxtrickHelper.findCountryId(thisdiv);

				var leaguename = FoxtrickHelper.extractLeagueName(thisdiv);
				var leaguename2 = leaguename;
				var leaguename3 = leaguename;

				var seriesnum = FoxtrickHelper.getSeriesNum(leaguename);
				var levelnum = FoxtrickHelper.getLevelNum(leaguename, countryid);

				if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
					leaguename2="I";
					leaguename3="1";
					}

				var links = Foxtrick.LinkCollection.getLinks("leaguelink", { "countryid": countryid,
					"leagueid": leagueid, "levelnum" : levelnum,
					"seriesnum": seriesnum,	"leaguename" : leaguename,
					"leaguename2" : leaguename2, "leaguename3" : leaguename3 },
					doc, this);

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
				FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME,{ "countryid": countryid,
					"leagueid": leagueid, "levelnum" : levelnum,
					"seriesnum": seriesnum,	"leaguename" : leaguename} );
				break;
			}
		}
	}
};
