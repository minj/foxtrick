/**
 * FoxtrickLineupShortcut (Add a direct shortcut to lineup in player detail page)
 * @author taised
 */

FoxtrickLineupShortcut = {
	MODULE_NAME : "LineupShortcut",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ['playerdetail','statsBestgames','matchLineup', 'YouthPlayer'],
 	OPTIONS : ["HighlightPlayer"],

	run : function(page, doc) {
		switch (page) {
		case 'playerdetail' :
			this._Analyze_Player_Page(doc);
			break;
		case 'YouthPlayer' :
			this._Analyze_Youth_Player_Page(doc);
			break;
		case 'statsBestgames':
			this._Analyze_Stat_Page(doc);
			break;
		case 'matchLineup':
			this._Highlight_Player(doc);
			break;
		}
	},

	change : function(page, doc) {
		if (doc.getElementsByClassName("ft-lineup-cell").length > 0)
			return;
		switch (page) {
		case 'statsBestgames':
			this._Analyze_Stat_Page(doc);
			break;
		}
	},

	_Analyze_Player_Page : function(doc) {
		// non-supporters don't have match history listed
		if (!Foxtrick.isSupporter(doc))
			return;

		// get leagueId for ntName and u20Name
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
			Foxtrick.log('LineupShortcut: leagueId ', leagueId, ' not found!\n');

		// to get match history table
		var mainBody = doc.getElementById("mainBody");
		var boxes = mainBody.getElementsByClassName("mainBox");
		boxes = Foxtrick.filter(boxes, function(n) {
			return n.id != "trainingDetails";
		});
		var matchHistory = boxes[boxes.length - 1];
		var matchTable = matchHistory.getElementsByTagName("table")[0];
		if (!matchTable)
			return;

		// get player ID from top of the page:
		var mainWrapper = doc.getElementById('mainWrapper');
		var playerId = FoxtrickHelper.findPlayerId(mainWrapper);
		var teamName = FoxtrickHelper.extractTeamName(mainWrapper);

		for (var i = 0; i < matchTable.rows.length; i++) {
			var link = matchTable.rows[i].cells[1].getElementsByTagName('a')[0];
			var teamId = FoxtrickHelper.getTeamIdFromUrl(link.href);
			var matchId = FoxtrickHelper.getMatchIdFromUrl(link.href);

			// find out home/away team names
			var teamsTrimmed = link.innerHTML.split(/&nbsp;-&nbsp;/);
			var teamsText = link.title;
			var homeIdx = teamsText.indexOf(teamsTrimmed[0]);
			var awayIdx = teamsText.indexOf(teamsTrimmed[1]);
			var matchTeams = [teamsText.substr(homeIdx, awayIdx-1), teamsText.substr(awayIdx)];

			for (var j = 0; j < matchTeams.length; j++) {
				switch (matchTeams[j]) {
				case teamName:
					this._Add_Lineup_Link(doc, matchTable.rows[i], teamId, playerId, matchId, 'normal');
					break;
				case ntName:
					this._Add_Lineup_Link(doc, matchTable.rows[i], ntId, playerId, matchId, 'NT');
					break;
				case u20Name:
					this._Add_Lineup_Link(doc, matchTable.rows[i], u20Id, playerId, matchId, 'U20');
					break;
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
		if (type == "youth")
			link.href = "/Club/Matches/MatchLineup.aspx?MatchID=" + matchid + "&YouthTeamID=" + teamid + "&isYouth=true&HighlightPlayerID=" + playerid;
		else
			link.href = "/Club/Matches/MatchLineup.aspx?MatchID=" + matchid + "&TeamID=" + teamid + "&HighlightPlayerID=" + playerid;
		var img = doc.createElement("img");
		img.src = Foxtrick.ResourcePath + "resources/img/";
		if (type == "NT")
			img.src += "formation.nt.png";
		else if (type == "U20")
			img.src += "formation.u20.png";
		else
			img.src += "formation.gif.gif";
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
			var newimg="url("+Foxtrick.ResourcePath+"resources/img/box_yellow.gif)";
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
	}
};
