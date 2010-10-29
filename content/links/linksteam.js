/**
 * linksteam.js
 * Foxtrick add links to team pages
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickLinksTeam = {
    MODULE_NAME : "LinksTeam",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('teamPage'),
	DEFAULT_ENABLED : true,
	OPTIONS : {},

    init : function() {
		Foxtrick.initOptionsLinks(this,"teamlink" );
    },

    run : function( page, doc ) {
		this.AddLinksRight(page,doc);
	},

    AddLinksRight : function( page, doc ) {
		if (!this.isTeamPage(doc)) {return;}
		var alldivs = doc.getElementsByTagName('div');
		var ownBoxBody=null;
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
				var teaminfo = this.gatherLinks( alldivs[j], doc );

				var links = Foxtrick.LinkCollection.getLinks("teamlink", teaminfo, doc, this );
				if (links.length > 0) {
					ownBoxBody = doc.createElement("div");
					var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
					var ownBoxId = "foxtrick_links_box";
					var ownBoxBodyId = "foxtrick_links_content";
					ownBoxBody.setAttribute( "id", ownBoxBodyId );

					for (var k = 0; k < links.length; k++) {
						links[k].link.className ="inner";
						ownBoxBody.appendChild(links[k].link);
					}
					Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");
				}
				break;
			}
		}
		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME,teaminfo);
	},

	/*change : function( page, doc ) { // Foxtrick.dump('change : LinksTeam\n');
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		var ownBoxId = "foxtrick_links_content";
		var owncoachlinkId = "foxtrick_content_coach";
		var ownlastmatchlinkId = "foxtrick_content_lastmatch";
		if( !doc.getElementById ( ownBoxId )
		   && this.isTeamPage(doc)) {
		 	Foxtrick.dump('run again : LinksTeamRight\n');
			this.AddLinksRight(page,doc);
		}
	},*/

	isTeamPage : function(doc) {
        var site=doc.location.href;
        var remain=site.substr(site.search(/Club\//i)+5);  //Foxtrick.dump(remain+' '+remain.search(/TeamID=/i)+'\n');
    return (remain=="" || remain.search(/TeamID=/i)==1 || remain.search(/TeamID=/i)==13);
	},

	gatherLinks : function( thisdiv, doc ) {
		var countryid = FoxtrickHelper.findCountryId(thisdiv);
  		var teamid = FoxtrickHelper.findTeamId(thisdiv);
		var teamname = FoxtrickHelper.extractTeamName(thisdiv);
		var leaguename = FoxtrickHelper.extractLeagueName(thisdiv);
		var levelnum = FoxtrickHelper.getLevelNum(leaguename, countryid);
		var leagueid = FoxtrickHelper.findLeagueLeveUnitId(thisdiv);;
		var userid = FoxtrickHelper.findUserId(thisdiv);
		if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
			leaguename="I";
		}
		var leaguepos=0,fans=0;
		try {
		  var teamInfo=doc.getElementById('mainBody').getElementsByTagName('h2')[0].parentNode;
		  var ps=teamInfo.getElementsByTagName('p');
		  try {leaguepos=ps[0].innerHTML.replace(/<.+>/,'').match(/(\d)/)[1];}
		  catch(e){}; // running game, leaguepos not known
		  var children=teamInfo.childNodes;
		  var child,i=0,infocount=0;
		  while (child=children[i++]) {
			if (infocount==2 && child.nodeName=='P'){
			  fans=children[i+1].innerHTML.replace(/&nbsp;/g,'').replace(/<a.+\/a>/ig,'').match(/(\d+)/)[1];
			  /*var l=children[i+1].innerHTML.lastIndexOf('(');
			  if (children[i+1].innerHTML.search(/\(/)!=-1) fans=children[i+1].innerHTML.replace(/&nbsp;/g,'').substr(l).match(/(\d+)/)[1];
			  else fans=children[i+1].innerHTML.replace('&nbsp;','').match(/(\d+)/)[1];*/
			  break;
			}
			if (child.className && child.className=='info') infocount++;
		  }
		}catch(e){Foxtrick.dump('leaguepos/fans: '+e+'\n');}
		return { "teamid": teamid, "teamname": teamname, "countryid" : countryid,
				"levelnum" : levelnum ,"leagueid": leagueid,"userid":userid,
				"fans":fans,'leaguepos':leaguepos};
	}
};
