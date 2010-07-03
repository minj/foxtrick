/**
 * linksplayer.js
 * Foxtrick add links to team pages
 * @author convinced
 */

 
////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksPlayerDetail = {
	
    MODULE_NAME : "LinksPlayerDetail",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('playerdetail'), 
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 
	
    init : function() {
			var linktypes = new Array("playerhealinglink","playerlink","keeperlink","transfercomparelink");
			Foxtrick.initOptionsLinksArray(this,linktypes);
    },

    run : function( page, doc ) {  
	  try{
		//addExternalLinksToPlayerDetail
		var teamdiv = doc.getElementById('teamLinks');
		var owncountryid = FoxtrickHelper.ownTeam.ownCountryId;
		
		var biddiv = doc.getElementById('ctl00_CPMain_updBid');
		if ( biddiv ) { 
			var reg = /(\d{1,4})(.*?)(\d{1,2})(.*?)(\d{1,4})(.*?)(\d+)(.*?)(\d+)(.*?)/i;
			var ar = reg.exec(biddiv.getElementsByTagName('p')[0].innerHTML);
			
			var DATEFORMAT = FoxtrickPrefs.getString("htDateformat");
			if  (DATEFORMAT == null ) DATEFORMAT = 'ddmmyyyy';

			var day = ar[1];
			var month = ar[3];
			var year = ar[5];
			var hour = ar[7];
			var minute = ar[9];

			switch ( DATEFORMAT ) {
				case 'ddmmyyyy':
					var day = ar[1];
					var month = ar[3];
					var year = ar[5];
					break;
				case 'mmddyyyy':
					var day = ar[3];
					var month = ar[1];
					var year = ar[5];
					break;
				case 'yyyymmdd':
					var day = ar[5];
					var month = ar[3];
					var year = ar[1];
					break;
			}
			//if (parseInt(month) > 10) {} else {month = '0' + month;}
			//if (parseInt(hour) > 10) {} else {hour = '0' + hour;}
			
			deadline = year+'-'+month+'-'+day+' '+hour+':'+minute;
		}
		else var deadline='';
		
		var alldivs = doc.getElementById('mainWrapper').getElementsByTagName('div');
		var ownBoxBody=null;
		var added=0;
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
				var thisdiv = alldivs[j];
				var teamid = FoxtrickHelper.findTeamId(thisdiv);
				var teamname=thisdiv.getElementsByTagName("h2")[0].getElementsByTagName("a")[0].innerHTML;
				var nationality = FoxtrickHelper.findCountryId(thisdiv);
				var playerid = FoxtrickHelper.findPlayerId(thisdiv);
				var playername=thisdiv.getElementsByTagName("h2")[0].getElementsByTagName("a")[1].innerHTML;;
				var form = null, age = null, tsi = null, exp = null, wage= null, ls=null, wagebonus=null, sta=null;
				var stamina = 0, goalkeeping = 0, playmaking = 0, passing = 0, winger = 0, defending = 0, scoring = 0, setpieces = 0;
				var age_days;
				
				//tsi
				var PlayerInfoTable = thisdiv.getElementsByTagName("table")[0];
				tsi = parseInt(PlayerInfoTable.rows[1].cells[1].textContent.replace(/[\s]*/gi, "")); 
				
				// wage
				var has_bonus=false;
				var table_inner = Foxtrick.trim(PlayerInfoTable.rows[2].cells[1].textContent);
				if (Foxtrick.strrpos( table_inner, "%") > 0 ) {
					has_bonus=true;
				}	
				wage = parseInt((Foxtrick.trimnum(PlayerInfoTable.rows[2].cells[1].textContent)+' ').match(/\d+/)[0]); 
				wagebonus='0';
				if (has_bonus) {wagebonus=wage/6.0; wage/=1.2;}
				
				// age
				var divs= thisdiv.getElementsByTagName('div');
				for (var j=0; j < divs.length; j++) {
					if ( divs[j].className=="byline" ) { 
						age = divs[j].textContent.match(/\d+/)[0];
						age_days = divs[j].textContent.match(/(\d+)/g)[1]; 
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
					var ilinks = Foxtrick.LinkCollection.getLinks("playerhealinglink", { "playerid": playerid,
							"form": form, "age" : age, "injuredweeks" : injuredweeks, "tsi" : tsi }, doc, this);  
					for (var j=0; j< ilinks.length; j++) {
						ilinks[j].link.setAttribute("id", "foxtrick_keeperlink_"+j);
						container.appendChild(doc.createTextNode(" "));
						container.appendChild(ilinks[j].link);
					}
				}
			    var newtable=false;
				var goalkeeperskillnode=null; 
				for (var j=0; j < divs.length; j++) {
					if ( divs[j].className=="mainBox" ) {
						try  {
						var Tables = divs[j].getElementsByTagName("table");
						if (!Tables) continue;
						var PlayerDetailTable = Tables[0];
						if (PlayerDetailTable.innerHTML.search(/\/Club\/Matches\/Match.aspx\?matchID=/i)!=-1) continue;
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
					} catch(e) {} // no or wrong table	
					} 				
				}
				
				// links
				var params = [];
				var links = new Array(2);
				if (PlayerDetailTable != null) {
					params = {
						"teamid": teamid,"teamname":teamname, "playerid": playerid, "playername":playername,"nationality": nationality,
						"tsi" : tsi, "age" : age, "age_days":age_days, "form" : form, "exp" : exp,"leadership":ls,
						"stamina" : stamina, "goalkeeping" : goalkeeping, "playmaking" : playmaking,
						"passing" : passing, "winger" : winger, "defending" : defending,
						"scoring" : scoring, "setpieces" : setpieces,"wage":wage,"wagebonus":wagebonus,"owncountryid":owncountryid,'deadline':deadline,'lang':FoxtrickPrefs.getString("htLanguage")
						};
				links[0] = Foxtrick.LinkCollection.getLinks("playerlink", params, doc,this); 
				links[1] = Foxtrick.LinkCollection.getLinks("transfercomparelink", params, doc,this); 
                
				} else {
					params = { "teamid": teamid, "playerid": playerid, "nationality": nationality, 
								"tsi" : tsi, "age" : age, "age_days":age_days, "form" : form, "exp" : exp, "leadership":ls,
								"stamina" : stamina, "wage":wage,"wagebonus":wagebonus, "owncountryid":owncountryid,'lang':FoxtrickPrefs.getString("htLanguage") };
					links[0] = Foxtrick.LinkCollection.getLinks("playerlink", params, doc,this); 	
				}
				if (goalkeeping > 3) {					
					// keeper links
					var klinks = Foxtrick.LinkCollection.getLinks("keeperlink", { "playerid": playerid, "tsi" : tsi,
                                                         "form" : form, "goalkeeping" : goalkeeping, "age" : age,"owncountryid":owncountryid }, doc,this);  
					for (var j=0; j< klinks.length; j++) {
						klinks[j].link.setAttribute("id", "foxtrick_keeperlink_"+j);
						if (newtable) klinks[j].link.setAttribute("style", "margin-left:5px !important;");
						if (goalkeeperskillnode) {
							goalkeeperskillnode.parentNode.appendChild(doc.createTextNode(" "));
							goalkeeperskillnode.parentNode.appendChild(klinks[j].link);
						}
						}										
				}
				var num_links=links[0].length;
				if (links[1]!=null) {num_links+=links[1].length;}
				if (num_links>0) {
					ownBoxBody = doc.createElement("div");
					var header = Foxtrickl10n.getString(
						"foxtrick.links.boxheader" );
					var ownBoxId = "foxtrick_links_box";
					var ownBoxBodyId = "foxtrick_links_content";
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
			var links2 = Foxtrick.LinkCollection.getLinks("trackerplayerlink", params, doc,FoxtrickLinksTracker); 
			if (links2.length > 0) {
				for (var k = 0; k < links2.length; k++) { 
					links2[k].link.className ="flag inner"; 
					var img=links2[k].link.getElementsByTagName('img')[0];
					var style="vertical-align:top; margin-top:1px; background: transparent url(/Img/Flags/flags.gif) no-repeat scroll "+ (-20)*nationality+"px 0pt; -moz-background-clip: -moz-initial; -moz-background-origin: -moz-initial; -moz-background-inline-policy: -moz-initial;";
					img.setAttribute('style',style); 
					img.src="/Img/Icons/transparent.gif";
 					ownBoxBody.appendChild(doc.createTextNode(" "));
					ownBoxBody.appendChild(links2[k].link);
					++added;
				}					
			}	
		}
		if (added) Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");
		
		FoxtrickLinksCustom.add( page, doc,ownBoxBody,this.MODULE_NAME, params);	
				break;
			}
		}
	  } catch(e){Foxtrick.dump('LinksPlayerdetails: '+e+'\n');}
    },
	
	change : function( page, doc ) {
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		if( !doc.getElementById ( "foxtrick_links_content" ) 
			&& !doc.getElementById ( "foxtrick_keeperlink_0" ) 
			&& !doc.getElementById ( "foxtrick_injurylink_0" ) ) {
			this.run( page, doc );
		}
	},
};

