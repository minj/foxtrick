/**
 * Colors the player name in the match report.
 * @author tychobrailleur, Stephan57, convincedd, ryanli
 */

FoxtrickMatchPlayerColouring = {
	MODULE_NAME : "MatchPlayerColouring",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('match', 'playerdetail'),
	ONPAGEPREF_PAGE : 'match',
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Use CSS file for styling.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	OPTIONS:['SeparateOwnPlayerColors'],

	CSS : Foxtrick.ResourcePath + "resources/css/match-player-colouring.css",

	OwnYouthTeamId : null,

	run : function(page, doc) {
		if (page == "playerdetail") {
			this.addHighlightParam(doc);
			return;
		}

		if (doc.location.search.search(/&HighlightPlayerID=(\d+)/) != -1) {
			// highlight single player
			var playerId = doc.location.search.match(/&HighlightPlayerID=(\d+)/)[1];
			var links = doc.getElementById("mainWrapper").getElementsByTagName("a");
			for (var i = 0; i < links.length; ++i) {
				if (links[i].href.indexOf(playerId) > -1) {
					// add an arbitrarily home class
					Foxtrick.addClass(links[i], "ft-match-player-home");
				}
			}
			return;
		}

		var isarchivedmatch = (doc.getElementById("ctl00_ctl00_CPContent_CPMain_lblMatchInfo")==null);
		var isprematch = (doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlPreMatch")!=null);
		if (isprematch) return;

		var isyouth = false;
		var as = doc.getElementById("mainBody").getElementsByTagName("a");
		for (var i=0;i<as.length;i++) {
			if (as[i].href.search(/YouthArenaID/i)!=-1) {
				isyouth = true;
				break;
			}
			else if (as[i].href.search(/ArenaID/i)!=-1) {
				isyouth=false;
				break;
			}
		}

		var matchid = FoxtrickHelper.getMatchIdFromUrl(doc.location.href);
		// exmaple xml use
		//Foxtrick.dump(Foxtrick.Matches.matchxmls[matchid].getElementsByTagName('AwayTeam')[0].getElementsByTagName('RatingMidfield')[0].textContent+'\n');
		//Foxtrick.alert(Foxtrick.Matches.matchxmls[matchid].getElementsByTagName('AwayTeam')[0].getElementsByTagName('RatingMidfield')[0].textContent+'\n');

		//Retrieve teams id
		var myTeamId = isyouth ? FoxtrickHelper.getOwnYouthTeamId() : FoxtrickHelper.getOwnTeamId();
		if (!Foxtrick.isModuleFeatureEnabled(this,'SeparateOwnPlayerColors')) myTeamId=null;
		var table = doc.getElementById('mainBody').getElementsByTagName('table');
		if (!table[0]) {
			// match not finished
			var HomeTeamId=FoxtrickHelper.getTeamIdFromUrl(doc.getElementById('sidebar').getElementsByTagName('a')[0].href);
			var AwayTeamId=FoxtrickHelper.getTeamIdFromUrl(doc.getElementById('sidebar').getElementsByTagName('a')[1].href);
		}
		else {
			var HomeTeamId=FoxtrickHelper.findTeamId(table[0].rows[0].cells[1]);
			var AwayTeamId=FoxtrickHelper.findTeamId(table[0].rows[0].cells[2]);
		}
		const HOME_TEAM_CLASS_NAME = (myTeamId == HomeTeamId) ? "ft-match-player-mine" : "ft-match-player-home";
		const AWAY_TEAM_CLASS_NAME = (myTeamId == AwayTeamId) ? "ft-match-player-mine" : "ft-match-player-away";

		var content_div = doc.getElementById('content');
		if (content_div == null) return;

		var content = content_div.getElementsByTagName("h1")[0].parentNode.innerHTML;
		if (content.indexOf('ft_mR_format')==-1) {
			// the full stop in Chinese is a little different from other languages
			var fullstop = (FoxtrickPrefs.getString("htLanguage") == "zh") ? "。" : ".";
			// get part between first full stop after formation and end of paragraph
			var contentA = content.substring(content.search(/Default\.aspx\?ArenaID=/i));
			contentA = contentA.substring(0,contentA.search(RegExp(fullstop + "<br><br>")));
			contentA=contentA.substring(contentA.search(/\d-\d-\d/));
			contentA=contentA.substring(contentA.indexOf(fullstop));

			// get part between first full stop after formation and end of paragraph
			var contentB = content.substring(content.search(/Default\.aspx\?ArenaID=/i));
			contentB = contentB.substring(contentB.search(RegExp(fullstop + "<br>")) + 9);
			contentB=contentB.substring(0,contentB.search(RegExp(fullstop + "<br>")));
			contentB=contentB.substring(contentB.search(/\d-\d-\d/));
			contentB=contentB.substring(contentB.indexOf(fullstop));
		}
		else { // matchreport coloring active
			var contentA=null;
			var contentB='';

			var divs=content_div.getElementsByTagName("h1")[0].parentNode.getElementsByTagName('div');
			for (var i=0;i<divs.length;++i) {
				if (divs[i].innerHTML.indexOf('ft_mR_format')!=-1) {
					if (contentA==null) {
						contentA=divs[i+1].innerHTML;
						contentA=contentA.substring(0,contentA.length-1);
					}
					else {
						contentB=divs[i+1].innerHTML;
						contentB=contentB.substring(0,contentB.length-1);
						break;
					}
				}
			}
		}

		// lastNames is a hash mapping player last names to teams
		// fullNames is a hash mapping player full names to teams
		// ids is a hash mapping player IDs to teams
		// keys are player last/full names and IDs respectively
		// values could be "home", "away", or "unknown"
		var lastNames = {};
		var fullNames = {};
		var ids = {};

		var addPlayer = function(key, side, type) {
			if (type[key] !== undefined && type[key] !== side) {
				type[key] = "unknown";
			}
			else {
				type[key] = side;
			}
		};

		var contents = { home : contentA, away : contentB };
		for (var team in contents) {
			var squad = contents[team].replace(/ - /g, ", ").split(", ");
			if (squad[0].indexOf(":") !== -1) {
				// first player may have a preceding colon
				squad[0] = squad[0].substring(squad[0].indexOf(":") + 2);
			}
			else {
				squad[0] = squad[0].substring(squad[0].lastIndexOf(" ") + 1);
			}
			for (var k = 0; k < squad.length; ++k) {
				if (squad[k] !== "") {
					addPlayer(squad[k], team, lastNames);
				}
			}
		}

		var spans = doc.getElementById('sidebar').getElementsByTagName("td");
		var hgoals=0;
		for (var i=0; i<spans.length; i++) {
			// first we get goals, this is the most accurate
			if (spans[i].innerHTML.search(/\d+&nbsp;-&nbsp;\d+/)!=-1) {
				var hg = parseInt(spans[i].innerHTML.match(/(\d+)&nbsp;-&nbsp;\d+/)[1]);
				var as = spans[i+1].getElementsByTagName("a");
				if (hg > hgoals) {
					// home goal
					hgoals = hg;
					if (as.length != 0) {
						addPlayer(as[0].href.match(/PlayerId=(\d+)/i)[1], "home", ids);
						addPlayer(as[0].textContent, "home", fullNames);
					}
					else {
						// sometimes the link may not be linked
						addPlayer(spans[i + 1].textContent, "home", fullNames);
					}
				}
				else {
					// away goal
					if (as.length != 0) {
						addPlayer(as[0].href.match(/PlayerId=(\d+)/i)[1], "away", ids);
						addPlayer(as[0].textContent, "away", fullNames);
					}
					else {
						addPlayer(spans[i + 1].textContent, "away", fullNames);
					}
				}
			}

			// and then we deal with substitutions
			var span_img = spans[i].getElementsByTagName("img");
			for (var j=0; j<span_img.length; j++) {
				if (span_img[j].src.search(/sub_out/)!=-1) {
					// stores in/out players' name/id respectively
					var inName = "", inId = 0;
					var outName = "", outId = 0;

					var span_a = span_img[j].parentNode.childNodes;
					for (var k=1;k<span_a.length;++k) {
						if (!outName) {
							if (span_a[k].nodeType == Node.TEXT_NODE && span_a[k].textContent.length>2) {
								// unlinked
								outName = span_a[k].textContent;
								k+=2;
							}
							else if (span_a[k].nodeName=='A') {
								outName = span_a[k].textContent;
								outId = span_a[k].href.match(/PlayerId=(\d+)/i)[1];
								k+=2;
							}
						}
						else if (!inName) {
							if (span_a[k].nodeType == Node.TEXT_NODE && span_a[k].textContent.length>2) {
								inName = span_a[k].textContent;
								break;
							}
							else if (span_a[k].nodeName=='A') {
								inName = span_a[k].textContent;
								inId = span_a[k].href.match(/PlayerId=(\d+)/i)[1]
								break;
							}
						}
					}

					// search which team the out player is in
					var foundId = false;
					for (var k in ids) {
						if (outId === k) {
							addPlayer(inId, ids[k], ids);
							addPlayer(inName, ids[k], fullNames);
							foundId = true;
							break;
						}
					}
					if (!foundId) {
						// if ID is not found, check full name
						// and last name
						if (fullNames[outName] !== undefined) {
							addPlayer(inName, fullNames[k], fullNames);
							addPlayer(inId, fullNames[k], ids);
						}
						else {
							for (var k in lastNames) {
								if (this.isLastName(k, outName)) {
									addPlayer(inName, lastNames[k], fullNames);
									addPlayer(inId, lastNames[k], ids);
								}
							}
						}
					}
				}
			}
		}

		// now we colour the links
		var links = content_div.getElementsByTagName("a");

		var firstTeam = true;
		for (var i=0; i<links.length; i++) {
			if (FoxtrickMatchPlayerColouring._isLinkPlayer(links[i].href)) {
				links[i].href += "&colored";

				var id = links[i].href.match(/PlayerId=(\d+)/i)[1];
				var fullName = links[i].textContent.replace(/^\s+/, "");

				// if ID matches, surely it's the answer we want
				var isHome = (ids[id] === "home");
				var isAway = (ids[id] === "away");
				// otherwise, look up the fullNames
				if (!isHome && !isAway) {
					isHome = (fullNames[fullName] === "home");
					isAway = (fullNames[fullName] === "away");
					if (!isHome && !isAway) {
						// and then, look up lastNames
						var lastNameInHome = false, lastNameInAway = false;
						for (var j in lastNames) {
							if (this.isLastName(j, fullName)) {
								if (lastNames[j] === "home")
									lastNameInHome = true;
								else if (lastNames[j] === "away")
									lastNameInAway = true;
							}
						}
						isHome = (lastNameInHome > lastNameInAway);
						isAway = (lastNameInHome < lastNameInAway);
					}
				}

				// we adjust the image's position if it's in highlights
				// table
				var iseventsbox=(links[i].parentNode.tagName=="TD");
				if (isHome) {
					Foxtrick.addClass(links[i], HOME_TEAM_CLASS_NAME);
					if (iseventsbox) {
						links[i].parentNode.parentNode.getElementsByTagName('td')[0].className = "left";
					}
				}
				else if (isAway) {
					Foxtrick.addClass(links[i], AWAY_TEAM_CLASS_NAME);
					if (iseventsbox) {
						links[i].parentNode.parentNode.getElementsByTagName('td')[0].className = "right";
					}
				}
				else {
					Foxtrick.addClass(links[i], "ft-match-player-unknown");
				}
			}
			//Colors the name of the teams on the right box like the players
			else if (FoxtrickMatchPlayerColouring._isLinkTeam(links[i].href)) {
				var linkParent = links[i];
				while (linkParent && linkParent.className !== "sidebarBox") {
					linkParent = linkParent.parentNode;
				}
				if (linkParent && linkParent.className === "sidebarBox") {
					if (firstTeam) {
						Foxtrick.addClass(links[i], HOME_TEAM_CLASS_NAME);
						firstTeam = false;
					}
					else {
						Foxtrick.addClass(links[i], AWAY_TEAM_CLASS_NAME);
					}
				}
			}
		}
	},

	change : function(page, doc) {
		if (page == "playerdetail") {
			this.addHighlightParam(doc);
		}
	},

	// add matchreport highlight links to playerdetails
	addHighlightParam : function(doc) {
		try {
			var playerId = Foxtrick.Pages.Player.getId(doc);
			var as = doc.getElementById("mainBody").getElementsByTagName("a");
			for (var i = 0; i < as.length; ++i) {
				if (as[i].href.search(/Club\/Matches\/Match\.aspx\?matchID=/i) != -1
					&& as[i].href.search(/HighlightPlayerID/) == -1) {
					as[i].href += "&HighlightPlayerID=" + playerId;
				}
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	isLastName : function(last, full) {
		try {
			var ret = (full.lastIndexOf(last) > -1)
				&& (full.lastIndexOf(last) + last.length === full.length);
			return ret;
		}
		catch (e) {
			// throw the error away
			return false;
		}
	},

	_isLinkPlayer : function(url) {
		if (url) {
			return url.match(/Player\.aspx/);
		}
		return false;
	},

	_isLinkTeam : function(url) {
		if (url) {
			return url.match(/Club\/\?TeamID=/i);
		}
		return false;
	}
};
