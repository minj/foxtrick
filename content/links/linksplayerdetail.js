/**
 * linksplayer.js
 * Foxtrick add links to team pages
 * @author convinced
 */

 
////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------    
function findTeamId(element) {
  var links = element.getElementsByTagName('a');
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/Club\/\?TeamID=/i) ) {
      return links[i].href.replace(/.+TeamID=/i, "").match(/^\d+/)[0];
    }
  }
  
  return null;
}

function findCountryId(element) {
  var links = element.getElementsByTagName('a');
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/League\.aspx/i) ) {
      return links[i].href.replace(/.+leagueid=/i, "").match(/^\d+/)[0];
    }
  }
  
  return null;
}

function getSkillLevelFromLink(link) {
  var value = link.href.replace(/.+(ll|labellevel)=/i, "").match(/^\d+/);   
  return value;
}

var FoxtrickLinksPlayerDetail = {
	
    MODULE_NAME : "LinksPlayerDetail",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,


    init : function() {
            Foxtrick.registerPageHandler( 'playerdetail',
                                          FoxtrickLinksPlayerDetail );
    },

    run : function( page, doc ) {
		//addExternalLinksToPlayerDetail
		
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
				var thisdiv = alldivs[j];
				var teamid = findTeamId(thisdiv);
				var nationality = findCountryId(thisdiv);
				var playerid = doc.location.href.replace(/.+playerID=/i, "").match(/^\d+/)[0];
				var form = null, age = null, tsi = null, exp = null;
				var stamina = 0, goalkeeping = 0, playmaking = 0, passing = 0, winger = 0, defending = 0, scoring = 0, setpieces = 0;
				
				//tsi
				var PlayerInfoTable = thisdiv.getElementsByTagName("table")[0];
				tsi = parseInt(PlayerInfoTable.rows[1].cells[1].textContent.replace(/[\s]*/gi, "")); 
				
				// age
				var divs= thisdiv.getElementsByTagName('div');
				for (var j=0; j < divs.length; j++) {
					if ( divs[j].className=="byline" ) { 
						age = divs[j].textContent.match(/\d+/)[0];
						break;
					}
				} 
				// form +sta
				var count = 0;
				var links= thisdiv.getElementsByTagName('a');
				for (var i=0; i < links.length; i++) {
					if ( links[i].href.match(/skillshort/i) ) {
						if (count==0) {form = getSkillLevelFromLink(links[i]);}
						else if (count==1) {sta = getSkillLevelFromLink(links[i]);}
						else if (count==2) break;
						count++;
						}
					} 
				var container = PlayerInfoTable.rows[4].cells[1];
				if (container.textContent.search(/\d+/) > -1) {
					var injuredweeks = container.textContent.match(/\d+/)[0];
					var links = getLinks("playerhealinglink", { "playerid": playerid,
							"form": form, "age" : age, "injuredweeks" : injuredweeks, "tsi" : tsi }, doc );  
					for (var j=0; j< links.length; j++) {
						var linkobj = links[j].link;
						container.appendChild(doc.createTextNode(" "));
						container.appendChild(linkobj);
					}
				}
			    var goalkeeperskillnode;   
				for (var j=0; j < divs.length; j++) {
					if ( divs[j].className=="mainBox" ) {
						var PlayerDetailTable = divs[j].getElementsByTagName("table")[0];
						if (PlayerDetailTable.rows.length==4) {  // old table
							stamina = getSkillLevelFromLink(PlayerDetailTable.rows[0].cells[1].getElementsByTagName('a')[0]);
							goalkeeping = getSkillLevelFromLink(PlayerDetailTable.rows[0].cells[3].getElementsByTagName('a')[0]);
							playmaking = getSkillLevelFromLink(PlayerDetailTable.rows[1].cells[1].getElementsByTagName('a')[0]);
							passing = getSkillLevelFromLink(PlayerDetailTable.rows[1].cells[3].getElementsByTagName('a')[0]);
							winger = getSkillLevelFromLink(PlayerDetailTable.rows[2].cells[1].getElementsByTagName('a')[0]);
							defending = getSkillLevelFromLink(PlayerDetailTable.rows[2].cells[3].getElementsByTagName('a')[0]);
							scoring = getSkillLevelFromLink(PlayerDetailTable.rows[3].cells[1].getElementsByTagName('a')[0]);
							setpieces = getSkillLevelFromLink(PlayerDetailTable.rows[3].cells[3].getElementsByTagName('a')[0]);
							goalkeeperskillnode = PlayerDetailTable.rows[0].cells[3].getElementsByTagName('a')[0];
						}
						if (PlayerDetailTable.rows.length==7) { //new table
							goalkeeping = getSkillLevelFromLink(PlayerDetailTable.rows[0].cells[1].getElementsByTagName('a')[0]);
							defending = getSkillLevelFromLink(PlayerDetailTable.rows[1].cells[1].getElementsByTagName('a')[0]);
							playmaking = getSkillLevelFromLink(PlayerDetailTable.rows[2].cells[1].getElementsByTagName('a')[0]);
							winger = getSkillLevelFromLink(PlayerDetailTable.rows[3].cells[1].getElementsByTagName('a')[0]);
							passing = getSkillLevelFromLink(PlayerDetailTable.rows[4].cells[1].getElementsByTagName('a')[0]);
							scoring = getSkillLevelFromLink(PlayerDetailTable.rows[5].cells[1].getElementsByTagName('a')[0]);
							setpieces = getSkillLevelFromLink(PlayerDetailTable.rows[6].cells[1].getElementsByTagName('a')[0]);
							goalkeeperskillnode = PlayerDetailTable.rows[0].cells[1];
						}
						else {  // something is wrong
						}
						break;
					}
				}
				
				// links
				var params = [];
				var links = new Array(2);
				if (PlayerDetailTable != null) {
					params = {
						"teamid": teamid, "playerid": playerid, "nationality": nationality,
						"tsi" : tsi, "age" : age, "form" : form, "exp" : exp,
						"stamina" : stamina, "goalkeeping" : goalkeeping, "playmaking" : playmaking,
						"passing" : passing, "winger" : winger, "defending" : defending,
						"scoring" : scoring, "setpieces" : setpieces
						};
				links[0] = getLinks("playerlink", params, doc );
				links[1] = getLinks("transfercomparelink", params, doc );
                
				} else {
					params = { "teamid": teamid, "playerid": playerid, "nationality": nationality };
					links[0] = getLinks("playerlink", params, doc );		
				}
				if (goalkeeping > 3) {					
					// keeper links
					var klinks = getLinks("keeperlink", { "playerid": playerid, "tsi" : tsi,
                                                         "form" : form, "goalkeeping" : goalkeeping }, doc );  
					goalkeeperskillnode.parentNode.appendChild(doc.createTextNode("[ "));
					for (var j=0; j< klinks.length; j++) {
						goalkeeperskillnode.parentNode.appendChild(doc.createTextNode(" "));
						goalkeeperskillnode.parentNode.appendChild(klinks[j].link);
						}					
					goalkeeperskillnode.parentNode.appendChild(doc.createTextNode(" ]"));
					
				}
				
				var ownBoxBody = doc.createElement("div");
                                
				for (var l = 0; l < links.length; l++) {
					if (links[l]!=null) {
						for (var k = 0; k < links[l].length; k++) {
							links[l][k].link.className ="inner"
							ownBoxBody.appendChild(doc.createTextNode(" "));
							ownBoxBody.appendChild(links[l][k].link);
						}
					}
				}
						
				Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString(
					"foxtrick.links.boxheader" ), ownBoxBody, "first");
				
				break;
			}
		}
   }	
 
};