/**
 * FoxtrickLineupShortcut (Add a direct shortcut to lineup in player detail page)
 * @author taised
 */

FoxtrickLineupShortcut = {

    MODULE_NAME : "FoxtrickLineupShortcut",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    PAGES : new Array('playerdetail','statsBestgames','matchLineup', 'YouthPlayer'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.2",
	LASTEST_CHANGE:"Add a direct shortcut to lineup in player detail page",
	OPTIONS : new Array( "HighlightPlayer", "YouthPlayerLink"),

    init : function() {
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
			var divs=mainbody.getElementsByTagName('div');
			var lastdiv=divs.item(divs.length-1);
			if (lastdiv.id=='trainingDetails') {
				//Own player, we must take previous div
				lastdiv=divs.item(divs.length-2);
			}
            
			//we get the table with rows of played match
			var matchtable=lastdiv.getElementsByTagName('table');
			if (matchtable.length>0) {
				//There are matches
				matchtable=matchtable.item(0);
				//Now getting playerid from top of the page:
				var element=doc.getElementById('mainWrapper');
				var playerid=FoxtrickHelper.findPlayerId(element);
				
				for (var i=0;i<matchtable.rows.length;i++) {
					var link=matchtable.rows[i].cells[1].getElementsByTagName('a').item(0);
					var teamid=FoxtrickHelper.getTeamIdFromUrl(link.href);
					var matchid=FoxtrickHelper.getMatchIdFromUrl(link.href);
					this._Add_Lineup_Link(doc, matchtable.rows[i], teamid, playerid, matchid);
				}
			}
			
        } catch (e) {
            dump('FoxtrickLineupShortcut'+e);
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
				this._Add_Lineup_Link(doc, matchtable.rows[i], teamid, playerid, matchid);
			}
		} catch (e) {
            dump('FoxtrickLineupShortcut'+e);
        }
    },
	
	_Add_Lineup_Link : function (doc, myrow, teamid, playerid, matchid ) {
		//the link is: /Club/Matches/MatchLineup.aspx?MatchID=<matchid>&TeamID=<teamid>
		try {
			var newcellpos=myrow.cells.length;
			var newcell=myrow.insertCell(newcellpos);
			newcell.innerHTML='<a href="/Club/Matches/MatchLineup.aspx?MatchID='+matchid+'&TeamID='+teamid+'&HighlightPlayer='+playerid+'"><img src="chrome://foxtrick/content/resources/img/foxtrick_skin/HT-Images/Matches/formation.gif.gif"></a>';
		} catch (e) {
            dump('FoxtrickLineupShortcut'+e);
        }
	},
	
	_Highlight_Player : function ( doc ) {
		if (Foxtrick.isModuleFeatureEnabled( this, "HighlightPlayer")) {
			try {
				var newimg="url(chrome://foxtrick/content/resources/img/foxtrick_skin/HT-Images/Matches/box_yellow.gif.gif)";
				//Getting playerid from url
				var passedid = doc.baseURI.replace(/.+HighlightPlayer=/i, "").match(/^\d+/);
				var playerdivs = Foxtrick.getElementsByClass( "name", doc );
				for (var i = 0; i < playerdivs.length; i++) {
					var playerid=FoxtrickHelper.findPlayerId(playerdivs[i]);
					if (playerid==passedid) {
						//Found it!
						playerdivs[i].parentNode.style.backgroundImage=newimg;
					}
				}
			} catch (e) {
				dump('FoxtrickLineupShortcut'+e);
			}
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
				dump('FoxtrickLineupShortcut'+e);
				Foxtrick.LOG('FoxtrickLineupShortcut'+e);
			}
		}
	},
	
	_Add_Youth_Lineup_Link : function (doc, myrow, teamid, playerid, matchid ) {
		//link is /Club/Matches/MatchLineup.aspx?MatchID=28577191&YouthTeamID=7985&isYouth=True
		
		try {
			var newcellpos=myrow.cells.length;
			var newcell=myrow.insertCell(newcellpos);
			newcell.innerHTML='<a href="/Club/Matches/MatchLineup.aspx?MatchID='+matchid+'&YouthTeamID='+teamid+'&isYouth=True&HighlightPlayer='+playerid+'"><img src="chrome://foxtrick/content/resources/img/foxtrick_skin/HT-Images/Matches/formation.gif.gif"></a>';
		} catch (e) {
            dump('FoxtrickLineupShortcut'+e);
			Foxtrick.LOG('FoxtrickLineupShortcut'+e);
        }
	}

};