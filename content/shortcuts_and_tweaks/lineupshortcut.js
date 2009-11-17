/**
 * FoxtrickLineupShortcut (Add a direct shortcut to lineup in player detail page)
 * @author taised
 */

FoxtrickLineupShortcut = {

    MODULE_NAME : "FoxtrickLineupShortcut",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    PAGES : new Array('playerdetail','statsBestgames','matchLineup', 'YouthPlayer'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Added shortcut to NT/U20 matches",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
 	OPTIONS : new Array( "HighlightPlayer", "YouthPlayerLink"),

	htNTidsXml : null,
	
    init : function() {
		this.initHtNtlist();
    },

    run : function(page, doc) {

        switch ( page ) {

            case 'playerdetail' : 
                this._Analyze_Player_Page ( doc );
                break;
			case 'YouthPlayer' : 
                this._Analyze_Youth_Player_Page ( doc );
                break;
			case 'statsBestgames':
				this._Analyze_Stat_Page ( doc );
				break;
			case 'matchLineup':
				this._Highlight_Player ( doc );
				break;
        }
    },

	change : function( page, doc ) {
		switch ( page ) {
			case 'statsBestgames':
				this._Analyze_Stat_Page ( doc );
				break;
		}
	},

	//***********************MAIN TEAM
    _Analyze_Player_Page  : function ( doc ) {
		try {
			var mainbody = doc.getElementById( "mainBody" );
			//first getting the serieID to get ntName and u20Name
			var flagElem= Foxtrick.getElementsByClass( "flag inner", mainbody );
			var ntName='';
			var ntId=0;
			var u20Name='';
			var u20Id=0;
			var serieId=FoxtrickHelper.findCountryId(flagElem[0].parentNode);
			var path = "leagues/league[@id='" + serieId + "']";
			var obj = this.htNTidsXml.evaluate(path,this.htNTidsXml,null,this.htNTidsXml.DOCUMENT_NODE,null).singleNodeValue;
			if (obj) {
				ntName=obj.getElementsByTagName('NTName').item(0).firstChild.nodeValue;
				ntId=obj.getElementsByTagName('NTid').item(0).firstChild.nodeValue;
				u20Name=obj.getElementsByTagName('U20Name').item(0).firstChild.nodeValue;
				u20Id=obj.getElementsByTagName('U20id').item(0).firstChild.nodeValue;
				//Foxtrick.LOG('ok: '+ntName+':'+ntId+' - '+u20Name+':'+u20Id);
			}
			else
				Foxtrick.LOG('Error in lineupshortcut: serieId '+serieId+' not found!');

			var issupporter = Foxtrick.getElementsByClass( "bookmark", mainbody );
			
			if (issupporter.length>0) {
				//user is supporter, we check if there are stats
				var divs=Foxtrick.getElementsByClass( "mainBox", mainbody );
				//Otherwise there aren't matches
				//var divs=mainbody.getElementsByTagName('div');
				var lastdiv=divs[divs.length-1];
				if (lastdiv.id=='trainingDetails') {
					//Own player, we must take previous div
					lastdiv=divs[divs.length-2];
				}
				
				//we get the table with rows of played match
				var matchtable=lastdiv.getElementsByTagName('table');
				if (matchtable.length>0) {
					//There are matches
					matchtable=matchtable.item(0);
					//Now getting playerid from top of the page:
					var element=doc.getElementById('mainWrapper');
					var playerid=FoxtrickHelper.findPlayerId(element);
					var teamname=FoxtrickHelper.extractTeamName(element);
					//Fix for longteamname
					if (teamname.length>20) {
						teamname=teamname.substr(0, 20)+"..";
					}
					
					for (var i=0;i<matchtable.rows.length;i++) {
						var link=matchtable.rows[i].cells[1].getElementsByTagName('a').item(0);
						var teamid=FoxtrickHelper.getTeamIdFromUrl(link.href);
						var matchid=FoxtrickHelper.getMatchIdFromUrl(link.href);
						
						//Checking if the team is present
						var matchTeams=link.text;
						matchTeams=matchTeams.split(" - ");
						//Sometimes there is a white space at the end
						while (matchTeams[0].substring(matchTeams[0].length-1, matchTeams[0].length) == ' '){
							matchTeams[0] = matchTeams[0].substring(0,matchTeams[0].length-1);
						}
						while (matchTeams[1].substring(matchTeams[1].length-1, matchTeams[1].length) == ' '){
							matchTeams[1] = matchTeams[1].substring(0,matchTeams[1].length-1);
						}
						
						for (var j=0;j<matchTeams.length;j++) {
							//Foxtrick.LOG(matchTeams[j]+'-'+teamname);
							if (matchTeams[j]==teamname) {
								this._Add_Lineup_Link(doc, matchtable.rows[i], teamid, playerid, matchid, 'normal');
							}
							else {
								if (matchTeams[j]==ntName) {
									this._Add_Lineup_Link(doc, matchtable.rows[i], ntId, playerid, matchid, 'NT');
								}
								else {
									if (matchTeams[j]==u20Name) {
										this._Add_Lineup_Link(doc, matchtable.rows[i], u20Id, playerid, matchid, 'U20');
									}
								}
							}
						}
					}
				}
			}
			
        } catch (e) {
            Foxtrick.dump('FoxtrickLineupShortcut'+e);
			Foxtrick.LOG('FoxtrickLineupShortcut'+e);
        }
    },
	
	_Analyze_Stat_Page : function ( doc ) {
        try {
			var teamid=doc.getElementById('ctl00_CPMain_ddlPreviousClubs').value;
			//Now getting playerid from top of the page:
			var element=doc.getElementById('mainWrapper');
			var playerid=FoxtrickHelper.findPlayerId(element);
			var lineuplabel = Foxtrickl10n.getString( "foxtrick.shortcut.matchlineup" );
			var matchtable=doc.getElementById('ctl00_CPMain_UpdatePanel1').getElementsByTagName('table').item(0);
			//adding lineup to header row
			var newhead=doc.createElement('th');
			newhead.innerHTML=lineuplabel;
			matchtable.rows[0].appendChild(newhead);
			//We start from second row because first is header
			for (var i=1;i<matchtable.rows.length;i++) {
				var link=matchtable.rows[i].cells[1].getElementsByTagName('a').item(0);
				var matchid=FoxtrickHelper.getMatchIdFromUrl(link.href);
				this._Add_Lineup_Link(doc, matchtable.rows[i], teamid, playerid, matchid, 'normal');
			}
		} catch (e) {
            Foxtrick.dump('FoxtrickLineupShortcut'+e);
        }
    },
	
	//@param icon= normal|NT|U20
	_Add_Lineup_Link : function (doc, myrow, teamid, playerid, matchid, icon ) {
		//the link is: /Club/Matches/MatchLineup.aspx?MatchID=<matchid>&TeamID=<teamid>
		var iconImg='formation.gif.gif';
		if (icon=='NT')
			iconImg='formation.nt.png';
		if (icon=='U20')
			iconImg='formation.u20.png';
		try {
			var newcellpos=myrow.cells.length;
			var newcell=myrow.insertCell(newcellpos);
			//HighlightPlayerID is the HT function
			newcell.innerHTML='<a href="/Club/Matches/MatchLineup.aspx?MatchID='+matchid+'&TeamID='+teamid+'&HighlightPlayerID='+playerid+'"><img src="chrome://foxtrick/content/resources/img/foxtrick_skin/HT-Images/Matches/'+iconImg+'"></a>';
		} catch (e) {
            Foxtrick.dump('FoxtrickLineupShortcut'+e);
        }
	},
	
	//***************** YOUTH TEAM ********************
	_Analyze_Youth_Player_Page : function ( doc ) {
		if (Foxtrick.isModuleFeatureEnabled( this, "YouthPlayerLink")) {
			try {
				var mainbody = doc.getElementById( "mainBody" );
				//First thing is to understand if it an own player or a player of another team
				var boxes=Foxtrick.getElementsByClass("mainBox", mainbody);
				if (boxes.length>1) {
					//Own player, the right element is the second
					var matchElement=boxes[1];
				}
				else {
					//Player of another team, right element is the first (there is only one)
					var matchElement=boxes[0];
				}
				
				//we get the table with rows of played match
				var matchtable=matchElement.getElementsByTagName('table');
				if (matchtable.length>0) {
					//There are matches
					matchtable=matchtable.item(0);
					//Now getting playerid from top of the page:
					var element=doc.getElementById('mainWrapper');
					var playerid=FoxtrickHelper.findYouthPlayerId(element);
					var teamid=FoxtrickHelper.findYouthTeamId(element);
					for (i=0;i<matchtable.rows.length;i++) {
						var link=matchtable.rows[i].cells[1].getElementsByTagName('a').item(0);
						//var teamid=FoxtrickHelper.getTeamIdFromUrl(link.href); //For youth teamid taken from link is wrong!
						var matchid=FoxtrickHelper.getMatchIdFromUrl(link.href);
						this._Add_Youth_Lineup_Link(doc, matchtable.rows[i], teamid, playerid, matchid);
					}
				}
				
			} catch (e) {
				Foxtrick.dump('FoxtrickLineupShortcut'+e);
				Foxtrick.LOG('FoxtrickLineupShortcut'+e);
			}
		}
	},
	
	_Add_Youth_Lineup_Link : function (doc, myrow, teamid, playerid, matchid ) {
		//link is /Club/Matches/MatchLineup.aspx?MatchID=28577191&YouthTeamID=7985&isYouth=True
		
		try {
			var newcellpos=myrow.cells.length;
			var newcell=myrow.insertCell(newcellpos);
			//HighlightPlayerID is the HT function
			newcell.innerHTML='<a href="/Club/Matches/MatchLineup.aspx?MatchID='+matchid+'&YouthTeamID='+teamid+'&isYouth=True&HighlightPlayerID='+playerid+'"><img src="chrome://foxtrick/content/resources/img/foxtrick_skin/HT-Images/Matches/formation.gif.gif"></a>';
		} catch (e) {
            Foxtrick.dump('FoxtrickLineupShortcut'+e);
			Foxtrick.LOG('FoxtrickLineupShortcut'+e);
        }
	},
	
	//************************ HIGHLIGHT PLAYER ***********************************
	_Highlight_Player : function ( doc ) {
		if (Foxtrick.isModuleFeatureEnabled( this, "HighlightPlayer")) {
			try {
				var newimg="url(chrome://foxtrick/content/resources/img/foxtrick_skin/HT-Images/Matches/box_yellow.gif.gif)";
				//Getting playerid from url
				var passedid = doc.baseURI.replace(/.+HighlightPlayerID=/i, "").match(/^\d+/);
				if (passedid) {
					var playerdivs = Foxtrick.getElementsByClass( "name", doc );
					for (var i = 0; i < playerdivs.length; i++) {
						var playerid=FoxtrickHelper.findPlayerId(playerdivs[i]);
						if (playerid==passedid) {
							//Found it!
							playerdivs[i].parentNode.style.backgroundImage=newimg;
						}
					}
				}
			} catch (e) {
				Foxtrick.dump('FoxtrickLineupShortcut'+e);
			}
		}
	},
	
	//*************************** init ntidlist **********************************
	
	initHtNtlist: function ()
	{
		try {
			this.htNTidsXml = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/htNTidList.xml");
		} catch (e) {
			Foxtrick.dump('lineupshortcut.js initNTidsXml: '+e+"\n");
		}
	}

};