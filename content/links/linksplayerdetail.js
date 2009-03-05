/**
 * linksplayer.js
 * Foxtrick add links to team pages
 * @author convinced
 */

 
////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksPlayerDetail = {
	
    MODULE_NAME : "LinksPlayerDetail",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 
	
    init : function() {
            Foxtrick.registerPageHandler( 'playerdetail',
                                          FoxtrickLinksPlayerDetail );
			var linktypes = new Array("playerhealinglink","playerlink","keeperlink","transfercomparelink");
			Foxtrick.initOptionsLinksArray(this,linktypes);
    },

    run : function( page, doc ) {
		//addExternalLinksToPlayerDetail
		
		var alldivs = doc.getElementsByTagName('div');
		var ownBoxBody=null;
		var added=0;
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
				var thisdiv = alldivs[j];
				var teamid = FoxtrickHelper.findTeamId(thisdiv);
				var nationality = FoxtrickHelper.findCountryId(thisdiv);
				var playerid = FoxtrickHelper.findPlayerId(thisdiv);
				var form = null, age = null, tsi = null, exp = null, wage= null, ls=null, wagebonus=null;
				var stamina = 0, goalkeeping = 0, playmaking = 0, passing = 0, winger = 0, defending = 0, scoring = 0, setpieces = 0;
				
				//tsi
				var PlayerInfoTable = thisdiv.getElementsByTagName("table")[0];
				tsi = parseInt(PlayerInfoTable.rows[1].cells[1].textContent.replace(/[\s]*/gi, "")); 
				wage = parseInt((Foxtrick.trimnum(PlayerInfoTable.rows[2].cells[1].textContent)+' ').match(/\d+/)[0]); 
				wagebonus='0';
				if (nationality!=FoxtrickHelper.OWNTEAMINFO['owncountryid']) {wagebonus=wage/6.0; wage/=1.2;}
				
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
				if (links!=null) { 
					for (var i=0; i < links.length; i++) {
						if ( links[i].href.match(/skill/i) ) {
							if (count==0) {form = FoxtrickHelper.getSkillLevelFromLink(links[i]);}
							else if (count==1) {sta = FoxtrickHelper.getSkillLevelFromLink(links[i]);}
							else if (count==2) {exp = FoxtrickHelper.getSkillLevelFromLink(links[i]);}
							else if (count==3) {ls = FoxtrickHelper.getSkillLevelFromLink(links[i]);}
							count++;
						}
					} 
				}
				
				var injuredweeks=0;
				var container = PlayerInfoTable.rows[4].cells[1];
				if (container.textContent.search(/\d+/) > -1) {
					injuredweeks = container.textContent.match(/\d+/)[0];
					var ilinks = getLinks("playerhealinglink", { "playerid": playerid,
							"form": form, "age" : age, "injuredweeks" : injuredweeks, "tsi" : tsi }, doc, this);  
					for (var j=0; j< ilinks.length; j++) {
						ilinks[j].link.setAttribute("id", "foxtrick_keeperlink_"+j);
						container.appendChild(doc.createTextNode(" "));
						container.appendChild(ilinks[j].link);
					}
				}
			    var newtable=false;
				var goalkeeperskillnode;   
				for (var j=0; j < divs.length; j++) {
					if ( divs[j].className=="mainBox" ) {
						var PlayerDetailTable = divs[j].getElementsByTagName("table")[0];
						if (PlayerDetailTable.rows.length==4) {  // old table
							stamina = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[0].cells[1].getElementsByTagName('a')[0]);
							goalkeeping = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[0].cells[3].getElementsByTagName('a')[0]);
							playmaking = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[1].cells[1].getElementsByTagName('a')[0]);
							passing = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[1].cells[3].getElementsByTagName('a')[0]);
							winger = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[2].cells[1].getElementsByTagName('a')[0]);
							defending = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[2].cells[3].getElementsByTagName('a')[0]);
							scoring = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[3].cells[1].getElementsByTagName('a')[0]);
							setpieces = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[3].cells[3].getElementsByTagName('a')[0]);
							goalkeeperskillnode = PlayerDetailTable.rows[0].cells[3].getElementsByTagName('a')[0];
						}
						if (PlayerDetailTable.rows.length==7) { //new table
							newtable=true;
							goalkeeping = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[0].cells[1].getElementsByTagName('a')[0]);
							defending = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[1].cells[1].getElementsByTagName('a')[0]);
							playmaking = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[2].cells[1].getElementsByTagName('a')[0]);
							winger = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[3].cells[1].getElementsByTagName('a')[0]);
							passing = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[4].cells[1].getElementsByTagName('a')[0]);
							scoring = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[5].cells[1].getElementsByTagName('a')[0]);
							setpieces = FoxtrickHelper.getSkillLevelFromLink(PlayerDetailTable.rows[6].cells[1].getElementsByTagName('a')[0]);
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
						"tsi" : tsi, "age" : age, "form" : form, "exp" : exp,"leadership":ls,
						"stamina" : stamina, "goalkeeping" : goalkeeping, "playmaking" : playmaking,
						"passing" : passing, "winger" : winger, "defending" : defending,
						"scoring" : scoring, "setpieces" : setpieces,"wage":wage,"wagebonus":wagebonus
						};
				links[0] = getLinks("playerlink", params, doc,this); 
				links[1] = getLinks("transfercomparelink", params, doc,this); 
                
				} else {
					params = { "teamid": teamid, "playerid": playerid, "nationality": nationality };
					links[0] = getLinks("playerlink", params, doc,this); 	
				}
				if (goalkeeping > 3) {					
					// keeper links
					var klinks = getLinks("keeperlink", { "playerid": playerid, "tsi" : tsi,
                                                         "form" : form, "goalkeeping" : goalkeeping, "age" : age }, doc,this);  
					for (var j=0; j< klinks.length; j++) {
						klinks[j].link.setAttribute("id", "foxtrick_keeperlink_"+j);
						if (newtable) klinks[j].link.setAttribute("style", "margin-left:5px !important;");
						goalkeeperskillnode.parentNode.appendChild(doc.createTextNode(" "));
						goalkeeperskillnode.parentNode.appendChild(klinks[j].link);
						}										
				}
				var num_links=links[0].length;
				if (links[1]!=null) {num_links+=links[1].length;}
				if (num_links>0) {
					ownBoxBody = doc.createElement("div");
					var header = Foxtrickl10n.getString(
						"foxtrick.links.boxheader" );
					var ownBoxId = "foxtrick_" + header + "_box";
					var ownBoxBodyId = "foxtrick_" + header + "_content";
					ownBoxBody.setAttribute( "id", ownBoxBodyId );
                            
					for (var l = 0; l < links.length; l++) {
						if (links[l]!=null) {
							for (var k = 0; k < links[l].length; k++) {
								links[l][k].link.className ="inner"
								ownBoxBody.appendChild(doc.createTextNode(" "));
								ownBoxBody.appendChild(links[l][k].link);
								++added;
							}
						}
					}
				}

		if (Foxtrick.isModuleEnabled(FoxtrickLinksTracker)) {		
			var links2 = getLinks("trackerplayerlink", params, doc,this); 
			if (links2.length > 0) {
				for (var k = 0; k < links2.length; k++) {
					links2[k].link.className ="inner";
					ownBoxBody.appendChild(doc.createTextNode(" "));
					ownBoxBody.appendChild(links2[k].link);
					++added;
				}					
			}	
		}
		if (added) Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");
		
		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME,{
						"teamid": teamid, "playerid": playerid, "nationality": nationality,
						"tsi" : tsi, "age" : age, "form" : form, "exp" : exp,"leadership":ls,
						"stamina" : stamina, "goalkeeping" : goalkeeping, "playmaking" : playmaking,
						"passing" : passing, "winger" : winger, "defending" : defending,
						"scoring" : scoring, "setpieces" : setpieces ,"injuredweeks" : injuredweeks,"wage":wage,"wagebonus":wagebonus
						});	
				break;
			}
		}
    },
	
	change : function( page, doc ) {
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		if( !doc.getElementById ( "foxtrick_" + header + "_content" ) 
			&& !doc.getElementById ( "foxtrick_keeperlink_0" ) 
			&& !doc.getElementById ( "foxtrick_injurylink_0" ) ) {
			this.run( page, doc );
		}
	},
};




/**
 * linkstracker.js
 * Foxtrick add links to national pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksTracker = {
	
    MODULE_NAME : "LinksTracker",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 

    init : function() {
 		//var linktypes = new Array("trackernationalteamlink","trackerplayerlink");
		//Foxtrick.initOptionsLinksArray(this,linktypes);
		Foxtrick.initOptionsLinks(this,"trackerplayerlink");    
 	 },

    run : function( page, doc ) {
	},
	
};