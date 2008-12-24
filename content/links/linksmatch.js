/**
 * linksmatch.js
 * Foxtrick add links to played matches pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
 //---------------------------------------------------------------------------    
function findMatchId(element) {
  var links = element.getElementsByTagName('a');
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/Club\/Matches\/Match\.aspx/i) ) {
      return links[i].href.replace(/.+matchID=/i, "").match(/^\d+/)[0];
    }
  }
  
  return null;
}

function findIsArchievedMatch(element) {
  var links = element.getElementsByTagName('a');
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/Club\/Matches\/Match\.aspx/i) ) {
      return (links[i].href.match(/useArchive/i));
    }
  }
    return false;
}

function findIsYouthMatch(href) {
  if (href.match(/Club\/Matches\/Match\.aspx/i) ) {
      return (href.match(/isYouth/i));
    }
  return false;
}


function findTeamId(element) {
  var links = element.getElementsByTagName('a');
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/TeamID=/i) ) {
      return links[i].href.replace(/.+TeamID=/i, "").match(/^\d+/)[0];
    }
  }
  
  return false;
}

function findSecondTeamId(element,firstteamid) {
  var links = element.getElementsByTagName('a');
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/TeamID=/i) ) {
      var id=links[i].href.replace(/.+TeamID=/i, "").match(/^\d+/)[0];
	  if (id!=firstteamid) return id;
    }
  }
  
  return 0;
}

var FoxtrickLinksMatch = {
	
    MODULE_NAME : "LinksMatch",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 

    init : function() {
            Foxtrick.registerPageHandler( 'match',
                                          FoxtrickLinksMatch);
			var linktypes = new Array("playedmatchlink","nextmatchlink","matchlink");
			Foxtrick.initOptionsLinksArray(this,linktypes);
    },

    run : function( page, doc ) {

		if (findIsYouthMatch(doc.location.href)) {return;}
		var isarchivedmatch=true;
		var matchid,teamid;
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
				var thisdiv = alldivs[j];
				matchid = findMatchId(thisdiv); 
				teamid = findTeamId(thisdiv);
				isarchivedmatch = findIsArchievedMatch(thisdiv)
				//addExternalLinksToPlayedMatch
				if (isarchivedmatch) {
					var links = getLinks("playedmatchlink", { "matchid": matchid, "teamid" : teamid }, doc, this);  

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
					}
			    }
			break;
			}
        }    
		//addExternalLinksToCommingMatch
		if (!isarchivedmatch) { 
			var sidediv = doc.getElementById("sidebar");
			var teamid2 = findSecondTeamId(sidediv,teamid);
			if (teamid2!=0) { 				
				var ownBoxBody = doc.createElement("div");
				var header = Foxtrickl10n.getString(
						"foxtrick.links.boxheader" );
				var ownBoxBodyId = "foxtrick_" + header + "_box";
				ownBoxBody.setAttribute( "id", ownBoxBodyId );
                             
				var HTD = doc.createElement("a");
		        HTD.innerHTML = '<a target=_blank class="inner"  title="Alltid team compare" href="http://alltid.org/teamcompare/'+teamid+','+teamid2+'/" ><img  src="chrome://foxtrick/content/resources/linkicons/ahstats.png" style="background:none" /> </a>';
		        HTD.className ="inner";
				
				ownBoxBody.appendChild(doc.createTextNode(" "));
				ownBoxBody.appendChild(HTD);
				var links = getLinks("nextmatchlink", { "matchid": matchid, "teamid" : teamid  }, doc,this);  
				for (var k = 0; k < links.length; k++) {
							links[k].link.className ="inner";
							ownBoxBody.appendChild(doc.createTextNode(" "));
							ownBoxBody.appendChild(links[k].link);
						}		
				var links2 = getLinks("matchlink", { "matchid": matchid, "teamid" : teamid  }, doc,this);  
				for (var k = 0; k < links2.length; k++) {
							links2[k].link.className ="inner";
							ownBoxBody.appendChild(doc.createTextNode(" "));
							ownBoxBody.appendChild(links2[k].link);
						}		
				Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, "first");
				
			}
        }    
    },
	
	change : function( page, doc ) {
	
	}
};