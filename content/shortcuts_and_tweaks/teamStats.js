/**
 * teamStats.js
 * Foxtrick team overview
 * @author OBarros & spambot
 */
////////////////////////////////////////////////////////////////////////////////
Foxtrick.TeamStats = {

	MODULE_NAME : "FTTeamStats",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array("players", "YouthPlayers"),
	DEFAULT_ENABLED : true,
	OPTIONS : new Array("AddFlags", "AddLeadershipAndExperience", "AddCoachType"),
	NEW_AFTER_VERSION : "0.5.1.2",
	LATEST_CHANGE : "Caching last XML for faster load.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,

	// used for coloring NT players when AddFlags is enabled
	NT_COLOR : "#FFCC00",

	init : function() {
	},

	change : function(page, doc) {
	},

	run : function(page, doc) {
		try {
			var totalTSI = 0;
			var olderThanNineteen = 0;
			var transferListed = 0;
			var redCards = 0;
			var yellowCards = 0;
			var twoYellowCards = 0;
			var injured = 0;
			var injuredWeeks = 0;
			var bruised = 0;
			var specialities = {};

			var playerList = Foxtrick.Pages.Players.getPlayerList(doc);
			for (var i = 0; i < playerList.length; ++i) {
				var current = playerList[i];
				if (current.tsi) {
					totalTSI += current.tsi;
				}
				if (current.age.years >= 19) {
					++olderThanNineteen;
				}
				if (current.speciality) {
					if (!specialities[current.speciality]) {
						specialities[current.speciality] = 0;
					}
					++specialities[current.speciality];
				}
				if (current.transferListed) {
					++transferListed;
				}
				if (current.yellowCard === 1) {
					++yellowCards;
				}
				if (current.yellowCard === 2) {
					++twoYellowCards;
				}
				if (current.redCard) {
					++redCards;
				}
				if (current.injured) {
					++injured;
					injuredWeeks += current.injured;
				}
				if (current.bruised) {
					++bruised;
				}
			}

			var specsTable = "";
			//If NT displays Total TSI
			if (Foxtrick.Pages.Players.isNtPlayersPage(doc) && totalTSI) {
				const totalTSILabel = Foxtrickl10n.getString("foxtrick.FTTeamStats.totalTSI.label");
				specsTable += "<tr><td class=\"ch\">" + totalTSILabel + "</td><td>" + totalTSI + "</td></tr>";
			}
			for (var speciality in specialities) {
				specsTable += "<tr><td class=\"ch\">" + speciality + "</td><td>" + specialities[speciality] + "</td></tr>";
			}
			if (transferListed > 0) {
				var img = '<img src="/Img/Icons/dollar.gif" class="transferListed" />';
				specsTable += "<tr><td class=\"ch\">" + img + "</td><td>" + transferListed + "</td></tr>";
			}
			if (yellowCards > 0) {
				var img = '<img src="/Img/Icons/yellow_card.gif" class="cardsOne" />';
				specsTable += "<tr><td class=\"ch\">" + img + "</td><td>" + yellowCards + "</td></tr>";
			}
			if (twoYellowCards > 0) {
				var img = '<img src="/Img/Icons/dual_yellow_card.gif" class="cardsTwo" />';
				specsTable += "<tr><td class=\"ch\">" + img + "</td><td>" + twoYellowCards + "</td></tr>";
			}
			if (redCards > 0) {
				var img = '<img src="/Img/Icons/red_card.gif" class="cardsOne" />';
				specsTable += "<tr><td class=\"ch\">" + img + "</td><td>" + redCards + "</td></tr>";
			}
			if (bruised > 0) {
				var img = '<img src="/Img/Icons/bruised.gif" class="injuryBruised" />';
				specsTable += "<tr><td class=\"ch\">" + img + "</td><td>" + bruised + "</td></tr>";
			}
			if (injured > 0) {
				var img = '<img src="/Img/Icons/injured.gif" class="injuryInjured" />';
				specsTable += "<tr><td class=\"ch\">" + img + "</td><td>" + injured + " (<b>" + injuredWeeks + "</b>)" + "</td></tr>";
			}

			if (Foxtrick.Pages.Players.isYouthPlayersPage(doc)) {
				var youngerThanNineteen = playerList.length - olderThanNineteen;
				var style = "";
				if (youngerThanNineteen < 9) {
					style = "color: red !important; font-weight: bold !important;";
				}
				specsTable += "<tr style='"+style+"'><td class=\"ch\">" + Foxtrickl10n.getString("foxtrick.FTTeamStats.PlayerNotToOld.label") + "</td><td>" + youngerThanNineteen + "</td></tr>";
				if (olderThanNineteen) {
					specsTable += "<tr><td class=\"ch\">" + Foxtrickl10n.getString("foxtrick.FTTeamStats.PlayerToOld.label") + "</td><td>" + olderThanNineteen + "</td></tr>";
				}
			}
			if (Foxtrick.Pages.Players.isOldiesPage(doc)
				|| Foxtrick.Pages.Players.isCoachesPage(doc)) {
				// Early test of country counter. Works, but has no finished design
				var countries = {};
				var found = false;
				var allDivs2 = doc.getElementsByTagName( "p" );
				for (var i = 0; i < allDivs2.length; i++) {
					if( allDivs2[i].innerHTML.indexOf('TeamID=', 0) != -1 ) {
						var ctrc = allDivs2[i].innerHTML;
						// Foxtrick.dump('	['+ctrc + ']\n');
						if(ctrc) {
							// specialities
							var ctrMatch = this._checkCountry( ctrc );
							// Foxtrick.dump(' ==>' + ctrMatch+'\n');
							if (ctrMatch != null) {
								// Foxtrick.dump(' == ==>' + ctrMatch + '\n');
								if (typeof(countries[ctrMatch]) == 'undefined') {
									countries[ctrMatch] = 1;
									found = true;
								}
								else {
									countries[ctrMatch]++;
								}
							}
						}
					}
				}
				if (found) {
					// put in array and sort
					var landarray = new Array();
					for (var land in countries) {
						landarray.push({"land":land,"value":countries[land]});
					}
					landarray.sort(function (a,b) { return a["land"].localeCompare(b["land"])});
					landarray.sort(function (a,b) { return a["value"]<b["value"]});

					var countriesTable = '';
					countriesTable += '<tr><td class="ch"><u>'+ Foxtrickl10n.getString("foxtrick.FTTeamStats.countries.label") + '</u></td></td>';
					for (var i = 0; i < landarray.length; i++) {
						countriesTable += "<tr><td class=\"\">" + landarray[i].land.replace(/\(|\)/g,"") + "</td><td>" + landarray[i].value + "</td></tr>";
					}
					specsTable += countriesTable;
					// Foxtrick.dump(countries);
				}
			}

			var	table = doc.createElement("table");
			table.className = "smallText";
			table.innerHTML = specsTable;

			var ownBoxId = "foxtrick_FTTeamStats_box";
			var	ownBoxBody = doc.createElement("div");
			ownBoxBody.id = "foxtrick_FTTeamStats_content";
			ownBoxBody.appendChild(table);
			var header = Foxtrickl10n.getString("foxtrick.FTTeamStats.label");
			Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, ownBoxId, "last", "");

			this.addExtraInfo(doc, playerList);
			this.addFilters(doc, playerList);
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	addExtraInfo : function(doc, playerList) {
		try {
			var lang = FoxtrickPrefs.getString("htLanguage");
			if (!Foxtrick.isModuleFeatureEnabled(this, "AddCoachType")) {
				return;
			}
			var allPlayers = doc.getElementsByClassName("playerInfo");
			for (var i = 0; i < allPlayers.length; ++i) {
				var id = Foxtrick.Pages.Players.getPlayerId(allPlayers[i]);
				var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);

				var basics = allPlayers[i].getElementsByTagName("p")[0];

				if (Foxtrick.isModuleFeatureEnabled(this, "AddCoachType")
					&& player.trainerData !== undefined) {
					var path = "hattricklanguages/language[@name='" + lang + "']/levels/level[@value='" + player.trainerData.skill + "']";
					var trainerSkillStr = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml, path, "text");
					var trainerTypeStr = "";
					if (player.trainerData.type == 0) {
						trainerTypeStr = Foxtrickl10n.getString('foxtrick.defensiveTrainer');
					}
					else if (player.trainerData.type == 1) {
						trainerTypeStr = Foxtrickl10n.getString('foxtrick.offensiveTrainer');
					}
					else {
						trainerTypeStr = Foxtrickl10n.getString('foxtrick.balancedTrainer');
					}
					var trainerSkillLink = '<a href="/Help/Rules/AppDenominations.aspx?lt=skill&ll='+player.trainerData.skill+'#skill">'+trainerSkillStr+'</a>';
					var title = allPlayers[i].getElementsByTagName("b")[0];
					var trainerStr = trainerTypeStr.replace("%s", trainerSkillLink);
					title.innerHTML += "<br/>" + trainerStr;
				}
				if (Foxtrick.isModuleFeatureEnabled(this, "AddLeadershipAndExperience")
					&& player.leadership !== undefined && player.experience !== undefined
					&& !Foxtrick.Pages.Players.isNtPlayersPage(doc)
					&& !Foxtrick.Pages.Players.isOldiesPage(doc)
					&& !Foxtrick.Pages.Players.isCoachesPage(doc)) {
					// These three kinds of players pages have experience and
					// leadership shown by default, hence no need to process
					// for them
					var path = "hattricklanguages/language[@name='" + lang + "']/levels/level[@value='" + player.leadership + "']";
					var leadershipString = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml, path, "text");
					var path = "hattricklanguages/language[@name='" + lang + "']/levels/level[@value='" + player.experience + "']";
					var experienceString = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml, path, "text");
					var leadershipLink = '<a class="skill" href="/Help/Rules/AppDenominations.aspx?lt=skillshort&ll='+player.leadership+'#skillshort">'+leadershipString+'</a>';
					var experienceLink = '<a class="skill" href="/Help/Rules/AppDenominations.aspx?lt=skill&ll='+player.experience+'#skill">'+experienceString+'</a>';
					var pos = basics.innerHTML.search(/\[/);
					if (pos == -1) {
						pos = basics.innerHTML.length; // no speciality. show after
					}
					else {
						pos -= 2; // has speciality. show before
					}
					var baseStr = Foxtrickl10n.getString("foxtrick.experience_and_leadership");
					basics.innerHTML = basics.innerHTML.substr(0, pos+1)
					+ "<br />" + baseStr.replace("%1", leadershipLink).replace("%2", experienceLink)
					+ " " + basics.innerHTML.substr(pos+1);
				}
				if (Foxtrick.isModuleFeatureEnabled(this, "AddFlags")
					&& player.countryId !== undefined) {
					var links = allPlayers[i].getElementsByTagName("a");
					var isNtPlayer = (links[0].href.search(/NationalTeam/i) != -1);
					var nameLink = isNtPlayer ? links[1] : links[0];
					if (!isNtPlayer) {
						// NT players have flags by default, so only need
						// to add flags for non-NT players
						var a = doc.createElement("a");
						var leagueName = "New Moon";
						var leagueId = Foxtrick.XMLData.getLeagueIdByCountryId(player.countryId);
						if (leagueId) {
							leagueName = FoxtrickHelper.getLeagueDataFromId(leagueId).LeagueName;
						}
						a.href = "/World/Leagues/League.aspx?LeagueID=" + leagueId;
						a.title = leagueName;
						a.className = "flag inner";
						var img = doc.createElement("img");
						var style = "vertical-align: top; margin-top: 1px; background: transparent url(/Img/Flags/flags.gif) no-repeat scroll "+ (-20)*leagueId + "px 0pt; -moz-background-clip: -moz-initial; -moz-background-origin: -moz-initial; -moz-background-inline-policy: -moz-initial;";
						img.setAttribute("style", style);
						img.src = "/Img/Icons/transparent.gif";
						a.appendChild(img);
						nameLink.parentNode.insertBefore(a, nameLink.parentNode.firstChild);
					}
					else {
						var style = "background-color: " + this.NT_COLOR + ";";
						nameLink.setAttribute("style", style);
					}
				}
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	addFilters : function(doc, playerList) {
		var lastMatch = 0;
		for (var i = 0; i < playerList.length; ++i) {
			if (playerList[i].lastMatch) {
				var matchDate = Foxtrick.getUniqueDayfromCellHTML(playerList[i].lastMatch.innerHTML);
				if (matchDate > lastMatch) {
					lastMatch = matchDate;
				}
			}
		}

		var specialities = {};

		var allPlayers = doc.getElementsByClassName("playerInfo");
		for (var i = 0; i < allPlayers.length; ++i) {
			var id = Foxtrick.Pages.Players.getPlayerId(allPlayers[i]);
			var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);
			// All players have attribute "all" set to "true", so that the
			// filter can be cleared using an "all" filter
			allPlayers[i].setAttribute("all", "true");
			if (player.redCard || player.yellowCard) {
				allPlayers[i].setAttribute("cards", "true");
			}
			if (player.transferListed) {
				allPlayers[i].setAttribute("transfer-listed", "true");
			}
			if (player.bruised || player.injured) {
				allPlayers[i].setAttribute("injured", "true");
			}
			if (player.speciality) {
				allPlayers[i].setAttribute(player.speciality, "true");
				if (!specialities[player.speciality]) {
					specialities[player.speciality] = true;
				}
			}
			if (player.lastMatch) {
				if (lastMatch === Foxtrick.getUniqueDayfromCellHTML(player.lastMatch.innerHTML)) {
					allPlayers[i].setAttribute("played-latest", "true");
				}
				else {
					allPlayers[i].setAttribute("not-played-latest", "true");
				}
			}
		}
		var sortbybox = doc.getElementById("ctl00_CPMain_ucSorting_ddlSortBy");
		if (Foxtrick.Pages.Players.isYouthPlayersPage(doc)) {
			sortbybox = doc.getElementById("ctl00_CPMain_ddlSortBy");
		}
		var filterselect = doc.createElement("select");
		Foxtrick.addEventListenerChangeSave(filterselect, "change", Foxtrick.TeamStats.Filter, false);

		// this is used to clear filters, and we use this to select all
		// players
		var option = doc.createElement("option");
		option.value = "all";
		option.innerHTML = Foxtrickl10n.getString("Filter");
		filterselect.appendChild(option);

		if (Foxtrick.Pages.Players.isPropertyInList(playerList, "redCard")
			|| Foxtrick.Pages.Players.isPropertyInList(playerList, "yellowCard")) {
			var option = doc.createElement('option');
			option.value = "cards";
			option.innerHTML = Foxtrickl10n.getString("foxtrick.FTTeamStats.Cards.label");
			filterselect.appendChild(option);
		}

		if (Foxtrick.Pages.Players.isPropertyInList(playerList, "injured")
			|| Foxtrick.Pages.Players.isPropertyInList(playerList, "bruised")) {
			var option = doc.createElement("option");
			option.value = "injured";
			option.innerHTML = Foxtrickl10n.getString("foxtrick.FTTeamStats.Injured.label");
			filterselect.appendChild(option);
		}

		if (Foxtrick.Pages.Players.isPropertyInList(playerList, "transferListed")) {
			var option = doc.createElement("option");
			option.value = "transfer-listed";
			option.innerHTML = Foxtrickl10n.getString("foxtrick.FTTeamStats.TransferListed.label");
			filterselect.appendChild(option);
		}

		if (Foxtrick.Pages.Players.isPropertyInList(playerList, "lastMatch")) {
			var option = doc.createElement("option");
			option.value = "played-latest";
			option.innerHTML = Foxtrickl10n.getString("foxtrick.FTTeamStats.PlayedLatest.label");
			filterselect.appendChild(option);

			var option = doc.createElement("option");
			option.value = "not-played-latest";
			option.innerHTML = Foxtrickl10n.getString("foxtrick.FTTeamStats.NotPlayedLatest.label");
			filterselect.appendChild(option);
		}

		if (Foxtrick.Pages.Players.isPropertyInList(playerList, "speciality")) {
			for (var speciality in specialities) {
				var option = doc.createElement("option");
				option.value = speciality;
				option.innerHTML = speciality;
				filterselect.appendChild(option);
			}
		}

		var mainBody = doc.getElementById("mainBody");
		sortbybox = mainBody.removeChild(sortbybox);
		var container = doc.createElement("div");
		container.className = "ft-select-container";
		container.appendChild(sortbybox);
		container.appendChild(filterselect);
		mainBody.insertBefore(container, mainBody.firstChild);
	},

	_checkCountry : function ( ctrc ) {
		if (ctrc == null ) return;
		//ctrc = Foxtrick._to_utf8(Foxtrick.substr(ctrc, Foxtrick.strrpos( ctrc, "</a>")+4, ctrc.lebgth));
		//ctrc = Foxtrick._to_utf8(ctrc.replace(/<.+>/),'');
		ctrc = ctrc.replace(/<.+>/);
		//Foxtrick.dump('=> stripped => ' + ctrc + '\n');
		var found = -1;
		for (var i = 0; i < this.COUNTRYLIST.length; i++) {
			if (ctrc.search(this.COUNTRYLIST[i]) != -1 ) {
				found = i;
				break;
			}
		}
		if ( found != -1) {
			//	 return Foxtrick._from_utf8(this.COUNTRYLIST[found]);
			return this.COUNTRYLIST[found];
		}
		Foxtrick.dump('=> not found=> ' + this.COUNTRYLIST[found] + '\n');
		return false;
	},

	COUNTRYLIST : new Array (
		"Al Iraq",
		"Al Kuwayt",
		"Al Maghrib",
		"Al Urdun",
		"Al Yaman",
		"Algérie",
		"Andorra",
		"Angola",
		"Argentina",
		"Azərbaycan",
		"Bahrain",
		"Bangladesh",
		"Barbados",
		"Belarus",
		"Belgium",
		"Benin",
		"Bolivia",
		"Bosna i Hercegovina",
		"Brasil",
		"Brunei",
		"Bulgaria",
		"Cabo Verde",
		"Canada",
		"Česká republika",
		"Chile",
		"China",
		"Chinese Taipei",
		"Colombia",
		"Costa Rica",
		"Côte d’Ivoire",
		"Crna Gora",
		"Cymru",
		"Cyprus",
		"Danmark",
		"Dawlat Qatar",
		"Deutschland",
		"Dhivehi Raajje",
		"Ecuador",
		"Eesti",
		"El Salvador",
		"England",
		"España",
		"Føroyar",
		"France",
		"Ghana",
		"Guatemala",
		"Hanguk",
		"Hayastan",
		"Hellas",
		"Honduras",
		"Hong Kong",
		"Hrvatska",
		"India",
		"Indonesia",
		"Iran",
		"Ireland",
		"Ísland",
		"Israel",
		"Italia",
		"Jamaica",
		"Kampuchea",
		"Kazakhstan",
		"Kenya",
		"Kyrgyzstan",
		"Latvija",
		"Lëtzebuerg",
		"Liechtenstein",
		"Lietuva",
		"Lubnan",
		"Magyarország",
		"Makedonija",
		"Malaysia",
		"Malta",
		"México",
		"Misr",
		"Moçambique",
		"Moldova",
		"Mongol Uls",
		"Nederland",
		"Nicaragua",
		"Nigeria",
		"Nippon",
		"Norge",
		"Northern Ireland",
		"Oceania",
		"Oman",
		"Österreich",
		"Pakistan",
		"Panamá",
		"Paraguay",
		"Perú",
		"Philippines",
		"Polska",
		"Portugal",
		"Prathet Thai",
		"Republica Dominicana",
		"România",
		"Rossiya",
		"Sakartvelo",
		"Saudi Arabia",
		"Schweiz",
		"Scotland",
		"Sénégal",
		"Shqiperia",
		"Singapore",
		"Slovenija",
		"Slovensko",
		"South Africa",
		"Srbija",
		"Suomi",
		"Suriname",
		"Suriyah",
		"Sverige",
		"Tanzania",
		"Tounes",
		"Trinidad &amp; Tobago",
		"Türkiye",
		"Uganda",
		"Ukraina",
		"United Arab Emirates",
		"Uruguay",
		"USA",
		"Venezuela",
		"Việt Nam"
	),

	// by convinced
	Filter : function (ev) {
		try {
			var doc = ev.target.ownerDocument;
			var filter = ev.target.value;

			var body = doc.getElementById("mainBody");

			var allDivs;
			if (doc.getElementsByClassName("playerList").length) {
				var playerList = doc.getElementsByClassName("playerList")[0];
				allDivs = playerList.getElementsByTagName("div");
			}
			else {
				allDivs = body.getElementsByTagName("div");
			}

			// recording how many players are shown
			var count = 0;

			var hide = false;
			var hideCategory = true;
			var lastCategory = null;
			var lastborderSeparator = null;
			var lastFace = null;

			for (var i = 0; i < allDivs.length; ++i) {
				var div = allDivs[i];
				if (Foxtrick.hasClass(div, "category")) {
					if (lastCategory) {
						if (hideCategory == true) {
							Foxtrick.addClass(lastCategory, "ft_hidden");
						}
						else {
							Foxtrick.removeClass(lastCategory, "ft_hidden");
						}
					}
					lastCategory = div;
					hideCategory = true;
				}
				else if (Foxtrick.hasClass(div, "faceCard")) {
					lastFace = div;
				}
				else if (Foxtrick.hasClass(div, "playerInfo")) {
					if (div.getAttribute(filter) === "true") {
						Foxtrick.removeClass(div, "ft_hidden");
						hide = false;
						hideCategory = false;
					}
					else {
						Foxtrick.addClass(div, "ft_hidden");
						hide = true;
					}
					if (lastFace) {
						if (hide) {
							Foxtrick.addClass(lastFace, "ft_hidden");
						}
						else {
							Foxtrick.removeClass(lastFace, "ft_hidden");
						}
					}
					if (!hide) {
						++count;
					}
				}
				else if (Foxtrick.hasClass(div, "borderSeparator")
					|| Foxtrick.hasClass(div, "separator")
					|| Foxtrick.hasClass(div, "youthnotes")) {
					if (hide === true) {
						Foxtrick.addClass(div, "ft_hidden");
					}
					else {
						Foxtrick.removeClass(div, "ft_hidden");
					}
				}
				if (Foxtrick.hasClass(div, "borderSeparator")
					|| Foxtrick.hasClass(div, "separator")) {
					lastborderSeparator = div;
				}
			}
			if (lastCategory) {
				if (hideCategory === true) {
					Foxtrick.addClass(lastCategory, "ft_hidden");
				}
				else {
					Foxtrick.removeClasS(lastCategory, "ft_hidden");
				}
			}
			// update player count
			var h = body.getElementsByTagName("h1")[0];
			h.innerHTML = h.innerHTML.replace(/\d+/, count);
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
};
