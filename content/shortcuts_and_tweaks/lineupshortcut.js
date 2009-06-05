/**
 * FoxtrickLineupShortcut (Add a direct shortcut to lineup in player detail page)
 * @author taised
 */

FoxtrickLineupShortcut = {

    MODULE_NAME : "FoxtrickLineupShortcut",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    PAGES : new Array('playerdetail','statsBestgames','matchLineup'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.2",
	LASTEST_CHANGE:"Add a direct shortcut to lineup in player detail page",
	OPTIONS : new Array( "HighlightPlayer"),

    init : function() {
    },

    run : function(page, doc) {

        switch ( page ) {

            case 'playerdetail' : 
                this._Analyze_Player_Page ( doc );
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

	},

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
				for (i=0;i<matchtable.rows.length;i++) {
					this._Add_Lineup_Link(doc, matchtable.rows[i]);
				}
			}
			
        } catch (e) {
            dump('FoxtrickLineupShortcut'+e);
        }
    },
	
	_Analyze_Stat_Page : function ( doc ) {
        
        try {
			//TO BE DONE
			var lineuplabel = Foxtrickl10n.getString( "foxtrick.shortcut.matchlineup" );
		} catch (e) {
            dump('FoxtrickLineupShortcut'+e);
        }
    },
	
	_Add_Lineup_Link : function (doc, myrow ) {
		//the link is: /Club/Matches/MatchLineup.aspx?MatchID=<matchid>&TeamID=<teamid>
		try {
			var newcellpos=myrow.cells.length;
			var link=myrow.cells[1].getElementsByTagName('a').item(0);
			var newcell=myrow.insertCell(newcellpos);
			
			var teamid=FoxtrickHelper.getTeamIdFromUrl(link.href);
			var matchid=FoxtrickHelper.getMatchIdFromUrl(link.href);
			//Now getting playerid from top of the page:
			var element=doc.getElementById('mainWrapper');
			var playerid=FoxtrickHelper.findPlayerId(element);
			
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
	}

};