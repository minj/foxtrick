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
			var ownBoxId = "foxtrick_" + header + "_box";
			var ownBoxBodyId = "foxtrick_" + header + "_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );
                               
			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(doc.createTextNode(" "));
				ownBoxBody.appendChild(links[k].link);
				++added;
			}
					
		}	
		if (Foxtrick.isModuleEnabled(FoxtrickLinksTracker)) { 			
			var links2 = Foxtrick.LinkCollection.getLinks("trackernationalteamlink", { "countryid": countryid,"ntteamid":ntteamid,"LeagueOfficeTypeID":LeagueOfficeTypeID }, doc, this);  
   			if (links2.length > 0) {
				for (var k = 0; k < links2.length; k++) {
					links2[k].link.className ="flag inner"; 
					var img=links2[k].link.getElementsByTagName('img')[0];
					var style="vertical-align:top; margin-top:1px; background: transparent url(/Img/Flags/flags.gif) no-repeat scroll "+countryflags[countryid].flag+"pt; -moz-background-clip: -moz-initial; -moz-background-origin: -moz-initial; -moz-background-inline-policy: -moz-initial;";
					img.setAttribute('style',style); 
					img.src="/Img/Icons/transparent.gif";
					ownBoxBody.appendChild(doc.createTextNode(" "));
					ownBoxBody.appendChild(links2[k].link);
					++added;
				}					
			}	
		}
		if (added) Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");
		
		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME,{ "countryid": countryid,"ntteamid":ntteamid,"LeagueOfficeTypeID":LeagueOfficeTypeID } );	   
		
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