/**
 * linksnational.js
 * Foxtrick add links to national pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksNational = {
	
    MODULE_NAME : "LinksNational",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 

    init : function() {
            Foxtrick.registerPageHandler( 'national',
                                          FoxtrickLinksNational );
			Foxtrick.initOptionsLinks(this,"nationalteamlink");
    },

    run : function( page, doc ) {
		try{ 
		//addExternalLinksToNationalDetail
        var countryid;
		var ntteamid; 
		var LeagueOfficeTypeID=doc.location.href.replace(/.+LeagueOfficeTypeID=/i, "").match(/^\d+/);
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
					var thisdiv = alldivs[j];
					countryid = FoxtrickHelper.findCountryId(thisdiv);
					ntteamid = FoxtrickHelper.findTeamId(thisdiv);
					}
			}
			
        var links = getLinks("nationalteamlink", { "countryid": countryid,"ntteamid":ntteamid,"LeagueOfficeTypeID":LeagueOfficeTypeID }, doc, this);  
        
		if (links.length > 0) {
			var ownBoxBody = doc.createElement("div");
			var header = Foxtrickl10n.getString(
						"foxtrick.links.boxheader" );
			var ownBoxId = "foxtrick_" + header + "_box";
			var ownBoxBodyId = "foxtrick_" + header + "_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );
                               
			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(doc.createTextNode(" "));
				ownBoxBody.appendChild(links[k].link);
			}
						
			Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");
			
			FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME,{ "countryid": countryid,"ntteamid":ntteamid,"LeagueOfficeTypeID":LeagueOfficeTypeID } );	
		}   
		}catch(e){dump("linksnational->"+e+'\n');}
    },
	
	change : function( page, doc ) {
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		var ownBoxId = "foxtrick_" + header + "_content";
		if( !doc.getElementById ( ownBoxId ) ) {
			this.run( page, doc );
		}
	},
};