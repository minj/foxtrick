/**
 * FoxtrickLineupShortcut (Add a direct shortcut to lineup in player detail page)
 * @author taised
 */

FoxtrickLineupShortcut = {
	MODULE_NAME : "LineupShortcut",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('playerdetail','statsBestgames','matchLineup', 'YouthPlayer'),
 	OPTIONS : new Array("HighlightPlayer"),

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
		// Foxtrick.dump('FoxtrickLineupShortcut run was here...\n');
	},

	change : function( page, doc ) {
		switch ( page ) {
			case 'statsBestgames':
				this._Analyze_Stat_Page ( doc );
				break;
		}
		// Foxtrick.dump('FoxtrickLineupShortcut change was here...\n');
	},

	//***********************MAIN TEAM
	_Analyze_Player_Page  : function ( doc ) {
		var mainbody = doc.getElementById( "mainBody" );
		//first getting the serieID to get ntName and u20Name
		const leagueId = Foxtrick.Pages.Player.getNationalityId(doc);
		var path = "//League[LeagueID='" + leagueId + "']";
		var obj = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.worldDetailsXml, path);
		if (obj) {
			var ntName = obj.getElementsByTagName("LeagueName").item(0).firstChild.nodeValue;
			var ntId = obj.getElementsByTagName("NationalTeamId").item(0).firstChild.nodeValue;
			var u20Name = "U-20 " + ntName;
			var u20Id = obj.getElementsByTagName('U20TeamId').item(0).firstChild.nodeValue;
		}
		else
			Foxtrick.dump('LineupShortcut: leagueId ' + leagueId + ' not found!\n');

		var isSupporter = Foxtrick.isSupporter(doc)

		if (isSupporter) {
			//user is supporter, we check if there are stats
			var divs=mainbody.getElementsByClassName("mainBox");
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
				// splitting teams with '- | -' in their name breaks the system
				//teamname_rep = teamname.replace(/\-\ /gi,'+ ').replace(/\ \-/gi,' +');
				teamname_rep = teamname.replace(/\-/gi,'+');


				//Fix for longteamname --- no longer necessary using titles
				// if (teamname_rep.length>20) {
					// teamname_rep=teamname_rep.substr(0, 20)+"..";
				// }

				for (var i=0;i<matchtable.rows.length;i++) {
					var link=matchtable.rows[i].cells[1].getElementsByTagName('a').item(0);
					var teamid=FoxtrickHelper.getTeamIdFromUrl(link.href);
					var matchid=FoxtrickHelper.getMatchIdFromUrl(link.href);

					//Checking if the team is present
					// var matchTeamsText=link.textContent;
					// matchTeamsText = matchTeamsText.replace(teamname, teamname_rep);
					// var matchTeams = matchTeamsText.split("/\s-\s/");
					// Foxtrick.dump('original '+matchTeamsText+' split in:  '+matchTeams.length+'\n');
					var matchTeamsText=link.title;
					matchTeamsText = matchTeamsText.replace(teamname, teamname_rep);
					var matchTeams = matchTeamsText.split("-");

					if (matchTeams[0]) matchTeams[0] = Foxtrick.trim(matchTeams[0]);
					if (matchTeams[1]) matchTeams[1] = Foxtrick.trim(matchTeams[1]);

					for (var j=0;j<matchTeams.length;j++) {
						Foxtrick.dump( j + ' [' + matchTeams[j] + ']-[' + teamname_rep + ']');
						switch(matchTeams[j])
						{
							case teamname_rep:
								Foxtrick.dump(' [TEAM]\n');
								this._Add_Lineup_Link(doc, matchtable.rows[i], teamid, playerid, matchid, 'normal');
							break;

							case ntName:
								Foxtrick.dump(' [NATIONAL TEAM]\n');
								this._Add_Lineup_Link(doc, matchtable.rows[i], ntId, playerid, matchid, 'NT');
							break;

							case u20Name:
								Foxtrick.dump(' [U20 TEAM]\n');
								this._Add_Lineup_Link(doc, matchtable.rows[i], u20Id, playerid, matchid, 'U20');
							break;

							default:
								Foxtrick.dump('\n');
							break;
						}
					}
				}
			}
		}
	},

	_Analyze_Stat_Page : function ( doc ) {
		var teamid=doc.getElementById('ctl00_ctl00_CPContent_CPMain_ddlPreviousClubs').value;
		//Now getting playerid from top of the page:
		var element=doc.getElementById('mainWrapper');
		var playerid=FoxtrickHelper.findPlayerId(element);
		var lineuplabel = Foxtrickl10n.getString( "foxtrick.shortcut.matchlineup" );
		var matchtable=doc.getElementById('ctl00_ctl00_CPContent_CPMain_UpdatePanel1').getElementsByTagName('table').item(0);
		var checktables = matchtable.getElementsByClassName("ft_lineupheader");
		if (checktables.length == 0)
		{
			//adding lineup to header row
			var newhead=doc.createElement('th');
			newhead.className="ft_lineupheader";
			newhead.innerHTML=lineuplabel;
			matchtable.rows[0].appendChild(newhead);
			//We start from second row because first is header
			for (var i=1;i<matchtable.rows.length;i++) {
				var link=matchtable.rows[i].cells[1].getElementsByTagName('a').item(0);
				var matchid=FoxtrickHelper.getMatchIdFromUrl(link.href);
				this._Add_Lineup_Link(doc, matchtable.rows[i], teamid, playerid, matchid, 'normal');
			}
		}
	},

	//@param type = "normal"|"NT"|"U20"|"youth"
	_Add_Lineup_Link : function(doc, row, teamid, playerid, matchid, type) {
		//the link is: /Club/Matches/MatchLineup.aspx?MatchID=<matchid>&TeamID=<teamid>
		var cell = row.insertCell(-1); // append as the last cell
		cell.className = "ft-lineup-cell";
		var link = doc.createElement("a");
		if (type == "youth") {
			link.href = "/Club/Matches/MatchLineup.aspx?MatchID=" + matchid + "&YouthTeamID=" + teamid + "&isYouth=true&HighlightPlayerID=" + playerid;
		}
		else {
			link.href = "/Club/Matches/MatchLineup.aspx?MatchID=" + matchid + "&TeamID=" + teamid + "&HighlightPlayerID=" + playerid;
		}
		var img = doc.createElement("img");
		img.src = Foxtrick.ResourcePath + "resources/img/foxtrick_skin/HT-Images/Matches/";
		if (type == "NT") {
			img.src += "formation.nt.png";
		}
		else if (type == "U20") {
			img.src += "formation.u20.png";
		}
		else {
			img.src += "formation.gif.gif";
		}
		cell.appendChild(link);
		link.appendChild(img);
	},

	//***************** YOUTH TEAM ********************
	_Analyze_Youth_Player_Page : function ( doc ) {
		var mainbody = doc.getElementById( "mainBody" );
		//First thing is to understand if it an own player or a player of another team
		var boxes=mainbody.getElementsByClassName("mainBox");
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
				this._Add_Lineup_Link(doc, matchtable.rows[i], teamid, playerid, matchid, "youth");
			}
		}
	},

	//************************ HIGHLIGHT PLAYER ***********************************
	_Highlight_Player : function ( doc ) {
		if (Foxtrick.isModuleFeatureEnabled( this, "HighlightPlayer")) {
			var newimg="url("+Foxtrick.ResourcePath+"resources/img/foxtrick_skin/HT-Images/Matches/box_yellow.gif.gif)";
			//Getting playerid from url
			var passedid = doc.baseURI.replace(/.+HighlightPlayerID=/i, "").match(/^\d+/);
			if (passedid) {
				var playerdivs = doc.getElementsByClassName("name");
				for (var i = 0; i < playerdivs.length; i++) {
					var playerid=FoxtrickHelper.findPlayerId(playerdivs[i]);
					if (playerid==passedid) {
						//Found it!
						playerdivs[i].parentNode.style.backgroundImage=newimg;
					}
				}
			}
		}
	},
};
