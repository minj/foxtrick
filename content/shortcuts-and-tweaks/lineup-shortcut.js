/**
 * FoxtrickLineupShortcut (Add a direct shortcut to lineup in player detail page)
 * @author taised, ryanli
 */

var FoxtrickLineupShortcut = {
	MODULE_NAME : "LineupShortcut",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ['playerdetail','statsBestgames','matchLineup', 'YouthPlayer'],
 	OPTIONS : ["HighlightPlayer"],

	run : function(doc) {
		if (Foxtrick.isPage("playerdetail", doc))
			this._Analyze_Player_Page(doc);
		else if (Foxtrick.isPage("YouthPlayer", doc))
			this._Analyze_Youth_Player_Page(doc);
		else if (Foxtrick.isPage("statsBestgames", doc))
			this._Analyze_Stat_Page(doc);
		else if (Foxtrick.isPage("matchLineup", doc))
			this._Highlight_Player(doc);
	},

	change : function(doc) {
		if (doc.getElementsByClassName("ft-lineup-cell").length > 0)
			return;
		if (Foxtrick.isPage("statsBestgames", doc))
			this._Analyze_Stat_Page(doc);
	},

	_Analyze_Player_Page : function(doc) {
		// non-supporters don't have match history listed
		if (!Foxtrick.util.layout.isSupporter(doc))
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
		boxes = Foxtrick.filter(function(n) {
			return n.id != "trainingDetails";
		}, boxes);
		var matchHistory = boxes[boxes.length - 1];
		var matchTable = matchHistory.getElementsByTagName("table")[0];
		if (!matchTable)
			return;

		// get player ID from top of the page:
		var mainWrapper = doc.getElementById('mainWrapper');
		var playerId = Foxtrick.util.id.findPlayerId(mainWrapper);
		var teamName = Foxtrick.util.id.extractTeamName(mainWrapper);

		for (var i = 0; i < matchTable.rows.length; i++) {
			var link = matchTable.rows[i].cells[1].getElementsByTagName('a')[0];
			var teamId = Foxtrick.util.id.getTeamIdFromUrl(link.href);
			var matchId = Foxtrick.util.id.getMatchIdFromUrl(link.href);

			// find out home/away team names
			// \u00a0 is no-break space (entity &nbsp;)
			// use textContent to deal with encoded entities (like &amp;)
			// which innerHTML isn't capable of
			var teamsTrimmed = link.textContent.split(new RegExp("\u00a0-\u00a0"));
			var teamsText = link.title;
			var homeIdx = teamsText.indexOf(teamsTrimmed[0]);
			var awayIdx = teamsText.indexOf(teamsTrimmed[1]);
			var matchTeams = [teamsText.substr(homeIdx, awayIdx-1), teamsText.substr(awayIdx)];
			Foxtrick.log("matchTeams: ", matchTeams);

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
		var playerid=Foxtrick.util.id.findPlayerId(element);
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
				var matchid=Foxtrick.util.id.getMatchIdFromUrl(link.href);
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
		var src = '';
		if (type == "NT")
			src = "formation.nt.png";
		else if (type == "U20")
			src = "formation.u20.png";
		else
			src = "formation.png";
		Foxtrick.addImage(doc, link, { src : Foxtrick.InternalPath + "resources/img/" + src });
		cell.appendChild(link);
	},

	//***************** YOUTH TEAM ********************
	_Analyze_Youth_Player_Page : function ( doc ) {
		var mainWrapper = doc.getElementById("mainWrapper");
		var mainBody = doc.getElementById("mainBody");

		var matchLinks = Foxtrick.filter(function(n) {
				return n.href.indexOf("/Club/Matches/Match.aspx") >= 0;
			}, mainBody.getElementsByTagName("a"));
		if (!matchLinks.length)
			return; // hasn't played a match yet

		// get matchTable which contains matches played
		var matchTable = matchLinks[0];
		while (matchTable.tagName.toLowerCase() != "table" && matchTable.parentNode)
			matchTable = matchTable.parentNode;
		if (matchTable.tagName.toLowerCase() != "table")
			return;

		var playerid=Foxtrick.util.id.findYouthPlayerId(mainWrapper);
		var teamid=Foxtrick.util.id.findYouthTeamId(mainWrapper);
		for (i=0;i<matchTable.rows.length;i++) {
			var link=matchTable.rows[i].cells[1].getElementsByTagName('a').item(0);
			var matchid=Foxtrick.util.id.getMatchIdFromUrl(link.href);
			this._Add_Lineup_Link(doc, matchTable.rows[i], teamid, playerid, matchid, "youth");
		}
	},

	//************************ HIGHLIGHT PLAYER ***********************************
	_Highlight_Player : function ( doc ) {
		if (FoxtrickPrefs.isModuleOptionEnabled("LineupShortcut", "HighlightPlayer")) {
			var newimg="url("+Foxtrick.ResourcePath+"resources/img/box_yellow.gif)";
			//Getting playerid from url
			var passedid = doc.baseURI.replace(/.+HighlightPlayerID=/i, "").match(/^\d+/);
			if (passedid) {
				var playerdivs = doc.getElementsByClassName("name");
				for (var i = 0; i < playerdivs.length; i++) {
					var playerid=Foxtrick.util.id.findPlayerId(playerdivs[i]);
					if (playerid==passedid) {
						//Found it!
						playerdivs[i].parentNode.style.backgroundImage=newimg;
					}
				}
			}
		}
	}
};
Foxtrick.util.module.register(FoxtrickLineupShortcut);
