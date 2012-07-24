"use strict";
/**
 * player-stats-experience.js
 * show how much experience a player gained in invidual matches and shows current subskill
 * @author CatzHoek
 */

Foxtrick.modules["PlayerStatsExperience"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ['playerStats', 'playerDetails'],
	OPTIONS : ['AlwaysShowAll'],
	CSS: Foxtrick.InternalPath + "resources/css/player-stats.css",
	store : {},
	pts_for_skillUp : 28.0,
	run : function(doc) {
		
		// National friendly match	0.1
		// International friendly match	0.2
		// League match	1
		// Cup match	2
		// U20/NT friendly match	2
		// Qualifying match	2
		// Hattrick Masters match	5
		// U20/NT official match	10
		// U20/NT World Cup (semi)final	20

		//don't randomly rename, parts of this are taken from hattrick
		var xp = {};
		xp.matchFriendly = 0.2;			//assume international friendly as default, considered in min-max, minimum uses 1/2 of this value
		xp.matchLeague = 1.0; 
		xp.matchCup = 2.0;
		xp.matchNtFriendly = 2.0;		//fakename: we generate this type (iconsytle + gametype)
		xp.matchQualification = 2.0;
		xp.matchMasters = 5.0;
		xp.matchNtLeague = 10.0;		//fakename: we generate this type (iconsytle + gametype)
 		xp.matchNtFinals = 20.0;

		var xp_column = 6;

		//var store = {};
		this.store.matches = {}
		this.store.matches.matchFriendly = { minutes: 0, count: 0.0, xp: { min:0.0, max:0.0 } }
		this.store.matches.matchLeague = { minutes: 0, count: 0.0, xp: { min:0.0, max:0.0 } }
		this.store.matches.matchCup = { minutes: 0, count: 0.0, xp: { min:0.0, max:0.0 } }
		this.store.matches.matchNtFriendly = { minutes: 0, count: 0.0, xp: { min:0.0, max:0.0 } }
		this.store.matches.matchQualification = { minutes: 0, count: 0.0, xp: { min:0.0, max:0.0 } }
		this.store.matches.matchMasters = { minutes: 0, count: 0.0, xp: { min:0.0, max:0.0 } }
		this.store.matches.matchNtLeague = { minutes: 0, count: 0.0, xp: { min:0.0, max:0.0 } }
		this.store.matches.matchNtFinals = { minutes: 0, count: 0.0, xp: { min:0.0, max:0.0 } }
		this.store.currentSkill = 0;
		this.store.skillup = false;

		var convertLinksToShowAll  = function(){
			var allLinks = doc.getElementsByTagName("a");
			for(var l = 0; l < allLinks.length; l++)
			{
				if(allLinks[l].href.search("PlayerStats.aspx") > -1)
					if(allLinks[l].href.search("ShowAll=True") == -1)
						allLinks[l].href = allLinks[l].href + "&ShowAll=True"
			}
		}
		var isNTmatch = function(node){
				var gametypeParent = node.getElementsByClassName("keyColumn")[0];
				var gameTypeImage = gametypeParent.getElementsByClassName("iconMatchtype")[0].getElementsByTagName("img")[0];
				var gameType = gameTypeImage.className;
				return gameTypeImage.parentNode.getAttribute("style") != null;	
		}
		var getPlayedMinutes = function(node){
			var playtimes = node.getElementsByClassName("endColumn1")[0];
			//sum up the diff positions		
			var intRE = RegExp("\\d+", "g");
			var playMinutes = playtimes.textContent.match(intRE);
			var minutes = 0;
			if(playMinutes != null)
				for (var i = 0; i < playMinutes.length; i++)
					if (!isNaN(playMinutes[i]))
						minutes += parseInt(playMinutes[i]);
			//max 90'
			return Math.min(90, minutes);
		}
		var gotStars = function( node ){
			var stars = node.getElementsByClassName("endColumn2")[0];

			if(Foxtrick.util.layout.isStandard(doc)){
				var wholeStars = stars.getElementsByClassName("starWhole")[0];
				var halfstars = stars.getElementsByClassName("starHalf")[0];
				var bistars = stars.getElementsByClassName("starBig")[0];
				return(wholeStars || halfstars || bistars);
			} else {
				return (stars.textContent.match(/\d+/) !== null)?true:false;
			}
		}

		var gotRedCard = function( node ){
			var cards = node.getElementsByTagName("td")[4].getElementsByTagName("img")[0];
			
			var redcard = false;
			if (cards)
				redcard = cards.src.search("red_card") > -1?true:false;
			
			return redcard;
		}

		var getGameType = function(node, date, u20){

			var getBasicGameType = function(node){
				var gametypeParent = node.getElementsByClassName("keyColumn")[0];
				var gameTypeImage = gametypeParent.getElementsByClassName("iconMatchtype")[0].getElementsByTagName("img")[0];
				return gameTypeImage.className;
			}

			var gameType = getBasicGameType(node);
			var isNT = isNTmatch(node);
			if(isNT){
				if(gameType == "matchFriendly")
					return "matchNtFriendly"
				else if(gameType == "matchLeague"){
					var weekOffset = FoxtrickPrefs.getString("module.HTDateFormat.FirstDayOfWeekOffset_text"); 
					var htDate = Foxtrick.util.time.gregorianToHT(date, weekOffset, false);
					//oldies wc finals are in odd seasons, u20 in even seasons
					var isWcFinalSeason = (htDate.season % 2 && !u20) || (!(htDate.season % 2) && u20);
					if(!isWcFinalSeason)
						return "matchNtLeague";	
					
					var semifinal = date.getDay() == 5;
					var _final = date.getDay() == 0;
					if(htDate.week == 16 && (semifinal || _final))
						return "matchNtFinals";
					else
						return "matchNtLeague";
				}
			} else
				return gameType; 
		}

		var getXpGain = function(minutes, gametype){
			return (xp[gametype]/90.0)*minutes;	
		}

		//get all possible links to show max amount of games
		if(FoxtrickPrefs.isModuleOptionEnabled("PlayerStatsExperience", "AlwaysShowAll")){
			convertLinksToShowAll();
		}
		if(Foxtrick.isPage('playerDetails', doc))
			return;

		//both tables you can alter between atm
		var stats = doc.getElementById("stats");
		var matches = doc.getElementById("matches");

		if(!stats || !matches)
			return;

		//all the entries
		var stats_entries = stats.rows;		
		var matches_entries = matches.rows;

		//header
		var stats_head = stats_entries[0];

		//add XP column
		var ts_xp = doc.createElement("th");
		Foxtrick.addClass(ts_xp,"stats");
		Foxtrick.addClass(ts_xp,"ft-dummy");
		ts_xp.textContent = Foxtrickl10n.getString("PlayerStatsExperience.ExperienceChange.title.abbr");
		ts_xp.title = Foxtrickl10n.getString("PlayerStatsExperience.ExperienceChange.title");
		
		stats_head.insertBefore(ts_xp, stats_head.cells[7] );

		//sum up xp stuff
		var xp_last = null;
		var xp_sub_min = 0.0;
		var xp_sub_max = 0.0;
		var xp_last_min_added = 0.0;

		var walkover_str = Foxtrickl10n.getString("PlayerStatsExperience.Walkover");

		for(var i = 1; i < stats_entries.length; i++ ){

			var entry = stats_entries[i];
			
			var match_date = matches_entries[i].getElementsByClassName("matchdate")[0];
			var date = Foxtrick.util.time.getDateFromText(match_date.textContent);

			//current skilllevel
			var	xp_now = parseInt(entry.cells[xp_column].textContent);
			
			//remember current XP Level to detect skilldowns			
			if(xp_last === null){
				xp_last = parseInt(xp_now);		
				this.store.currentSkill = xp_last;
			} else {

			}
			var u20 = matches_entries[i].getElementsByTagName("a")[0].textContent.search("U-20") > -1;
			var ntMatch = isNTmatch( entry );
			var minutes = getPlayedMinutes( entry );
			var gameType = getGameType( entry, date, u20 );
			var xp_gain = getXpGain( minutes, gameType );
			var redCard = gotRedCard( matches_entries[i] );
			
			//check if he also got stars, a game where he got xpgain but has not even half a star must be a walkover
			var got_stars = gotStars(entry);
			var walkover = !got_stars && minutes == 90 && !redCard;
			var pseudo_points = xp_gain;
			xp_gain = walkover?0:xp_gain;
			
			//adjust min and max values to take care of international vs. nationl friendlies
			var dxp = {}
			if(!ntMatch){
				 if(gameType == "matchFriendly"){
				 	dxp.min = xp_gain/2;
				 	dxp.max = xp_gain;	
				 } else {
				 	dxp.min = xp_gain;
				 	dxp.max = xp_gain;
				 }
			} else {
				dxp.min = xp_gain;
				dxp.max = xp_gain;
			}

			if(xp_now == xp_last){
				xp_sub_min += dxp.min;
				xp_sub_max += dxp.max;
				this.store.matches[gameType].xp["min"] += dxp.min;
				this.store.matches[gameType].xp["max"] += dxp.max;
				this.store.matches[gameType]["minutes"] += minutes;
				this.store.matches[gameType]["count"] += (minutes/90.0);
				this.store.last = {}
				this.store.last.node = stats_entries[i];
				this.store.last.nodeIndex = i;
				this.store.last.gameType = gameType;
				this.store.last.min = dxp.min;
				this.store.last.max = dxp.max;
				this.store.last.minutes = minutes;
				this.store.last.count =  (minutes/90.0);
			} else {
				this.store.skillup = true;
			}
			var ts_xp = doc.createElement("td");
			Foxtrick.addClass(ts_xp,"stats");
			Foxtrick.addClass(ts_xp,"ft-dummy");
			if(walkover){
				Foxtrick.addClass(ts_xp,"ft-playerStats-walkover");
				ts_xp.textContent = pseudo_points.toFixed(3);
				ts_xp.setAttribute("title", walkover_str);
			} else {
				ts_xp.textContent = xp_gain.toFixed(3);
			}
			if(!ntMatch && gameType == "matchFriendly" && minutes > 0)
				ts_xp.textContent =  (xp_gain/2.0).toFixed(3) + "/" + xp_gain.toFixed(3);
			entry.insertBefore(ts_xp, entry.cells[xp_column+1]);
		}

		//highlight the relevant skillup game in the table
		Foxtrick.addClass(this.store.last.node, "ft-xp-skillup");
		Foxtrick.addClass(matches_entries[this.store.last.nodeIndex], "ft-xp-skillup");


		//adjust minimum gained xp depending on the relevant skillup game
		var lastGameType = this.store.last.gameType;
		var lastMinAdded = this.store.last.min;
		this.store.matches[lastGameType].xp["min"] -= lastMinAdded;

		//find out if all games possible are actually showed
		var showAllLink=null;
		if(doc.location.href.search('ShowAll=True') == -1){
			var links = doc.getElementsByTagName("a");
			Foxtrick.map(function (link){
				if(link.href.search(RegExp("ShowAll=True", "i")) != -1)
					showAllLink=link;
			}, links)
		}

		var div = Foxtrick.createFeaturedElement(doc, this, "div");

		// var experienceText = Foxtrickl10n.getString("PlayerStatsExperience.ExperienceText")
		// 				.replace(/%1/, (xp_sub_min.toFixed(3) % this.pts_for_skillUp).toFixed(3))
		// 				.replace(/%2/, (xp_sub_max.toFixed(3) % this.pts_for_skillUp).toFixed(3))
		// 				.replace(/%3/, (xp_last + (xp_sub_min/this.pts_for_skillUp)).toFixed(3))
		// 				.replace(/%4/, (xp_last + (xp_sub_max/this.pts_for_skillUp)).toFixed(3));

		var span =  doc.createElement("span");
		//var textNode = doc.createTextNode(experienceText);
		//span.appendChild(textNode);
		div.appendChild(span);
		div.appendChild(doc.createElement("br"));

		if(showAllLink && !this.store.skillup){
			var span =  doc.createElement("span");
			var textNode = doc.createTextNode(Foxtrickl10n.getString("PlayerStatsExperience.NotAllMatchesVisible"));
			span.appendChild(textNode);
			div.appendChild(span);
		} else if (!this.store.skillup) {
			var span =  doc.createElement("span");
			var textNode = doc.createTextNode(Foxtrickl10n.getString("PlayerStatsExperience.NoSkillUpFound"));
			span.appendChild(textNode);
			div.appendChild(span);
		}

		var navigation = doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlMatchHistorySlideToggle");
		var types = ["matchFriendly", "matchLeague", "matchCup", "matchMasters", "matchQualification", "matchNtFriendly", "matchNtLeague", "matchNtFinals"];

		var xp_header = doc.createElement('h2');
		var headerTitle = doc.createTextNode( Foxtrickl10n.getString("PlayerStatsExperience.Experience") );
		xp_header.appendChild(headerTitle);
		var matchListTable = doc.createElement('div');
		
		var table = doc.createElement('table');
		Foxtrick.addClass(table,"ft-ignore-changes");
		var thead = doc.createElement('thead');
		var tbody = doc.createElement('tbody');

		var thead_tr = doc.createElement('tr');
		var cell = doc.createElement('th');
		cell.textContent = Foxtrickl10n.getString("PlayerStatsExperience.MatchesSinceSkilup");
		
		thead_tr.appendChild(cell);
		thead.appendChild(thead_tr);

		var cell = doc.createElement('th');
		Foxtrick.addClass(cell, "ft-xp-data-value");
		cell.textContent = Foxtrickl10n.getString("PlayerStatsExperience.matches");
		thead_tr.appendChild(cell);
		thead.appendChild(thead_tr);

		var cell = doc.createElement('th');
		Foxtrick.addClass(cell, "ft-xp-data-value");
		cell.textContent = Foxtrickl10n.getString("PlayerStatsExperience.minutes");
		thead_tr.appendChild(cell);
		thead.appendChild(thead_tr);

		var cell = doc.createElement('th');
		Foxtrick.addClass(cell, "ft-xp-data-value");
		cell.textContent = Foxtrickl10n.getString("PlayerStatsExperience.minXPpts");
		thead_tr.appendChild(cell);
		thead.appendChild(thead_tr);

		var cell = doc.createElement('th');
		Foxtrick.addClass(cell, "ft-xp-data-value");
		cell.textContent = Foxtrickl10n.getString("PlayerStatsExperience.maxXPpts");
		thead_tr.appendChild(cell);
		thead.appendChild(thead_tr);

		var addRow = function (type, count, minutes, min, max, i){
				var row = doc.createElement("tr");

				if(i % 2)
					Foxtrick.addClass(row, "darkereven");
				else
					Foxtrick.addClass(row, "odd")
				
				var cell = doc.createElement("td");
				cell.setAttribute("id", "ft-xp-" + type + "-desc");
				cell.textContent = Foxtrickl10n.getString("PlayerStatsExperience." + type);
				row.appendChild(cell);

				var cell = doc.createElement("td");
				cell.setAttribute("id", "ft-xp-" + type + "-count");
				Foxtrick.addClass(cell, "ft-xp-data-value");
				cell.textContent = (count > 0)?count:0;
				row.appendChild(cell);

				var cell = doc.createElement("td");
				cell.textContent = minutes;
				cell.setAttribute("id", "ft-xp-" + type + "-minutes");
				Foxtrick.addClass(cell, "ft-xp-data-value");
				row.appendChild(cell);
				
				var cell = doc.createElement("td");
				cell.setAttribute("id", "ft-xp-" + type + "-min");
				Foxtrick.addClass(cell, "ft-xp-data-value");
				cell.textContent = (min > 0)?min:0;
				row.appendChild(cell);

				var cell = doc.createElement("td");
				cell.setAttribute("id", "ft-xp-" + type + "-max");
				Foxtrick.addClass(cell, "ft-xp-data-value");
				cell.textContent = (max > 0)?max:0;
				row.appendChild(cell);

				table.appendChild(row);
			}

		for(var i=0; i < types.length; i++){
			var count = this.store.matches[types[i]]["count"].toFixed(3);
			var minutes =this.store.matches[types[i]]["minutes"];
			var min = this.store.matches[types[i]].xp["min"].toFixed(3);
			var max = this.store.matches[types[i]].xp["max"].toFixed(3);
			var type = types[i];

			addRow(type, count, minutes, min, max, i);

			//a fake rows for international friendlies
			if(type == "matchFriendly"){
				addRow("matchNationalFriendly", 0, 0, 0, "-", i + 1);
				addRow("matchInternationalFriendly", 0, 0, 0, "-", i + 2);
			}
		}
		
		//xp pts
		var row = doc.createElement("tr");
		var cell = doc.createElement("td");
		cell.textContent = Foxtrickl10n.getString("PlayerStatsExperience.sum");
		row.appendChild(cell);

		var cell = doc.createElement("td");
		cell.setAttribute("colspan", 2);
		row.appendChild(cell);
		
		var cell = doc.createElement("td");
		cell.setAttribute("id", "ft-xp-min-pts")
		Foxtrick.addClass(cell, "ft-xp-data-value");
		cell.textContent = xp_sub_min.toFixed(3);
		row.appendChild(cell);
		
		var cell = doc.createElement("td");
		cell.setAttribute("id", "ft-xp-max-pts")
		Foxtrick.addClass(cell, "ft-xp-data-value");
		cell.textContent = xp_sub_max.toFixed(3);
		row.appendChild(cell);
		table.appendChild(row);

		//xp actual
		var row = doc.createElement("tr");
		var cell = doc.createElement("td");
		var bold = doc.createElement("b");
		bold.textContent = Foxtrickl10n.getString("PlayerStatsExperience.Experience");
		cell.appendChild(bold)
		row.appendChild(cell);

		var cell = doc.createElement("td");
		cell.setAttribute("colspan", 2);
		row.appendChild(cell);
		
		var cell = doc.createElement("td");
		cell.setAttribute("id", "ft-xp-min")
		Foxtrick.addClass(cell, "ft-xp-data-value");
		cell.textContent = xp_sub_min.toFixed(3);
		row.appendChild(cell);
		
		var cell = doc.createElement("td");
		cell.setAttribute("id", "ft-xp-max")
		Foxtrick.addClass(cell, "ft-xp-data-value");
		cell.textContent = xp_sub_max.toFixed(3);
		row.appendChild(cell);

		table.appendChild(row);

//table & headers
		navigation.parentNode.insertBefore(xp_header, navigation);
		navigation.parentNode.insertBefore(matchListTable, navigation);
		table.appendChild(thead);
		table.appendChild(tbody);
		matchListTable.appendChild(table);
		
//slider & coloring

		var container = doc.createElement("div");
		Foxtrick.addClass(container,"ft-slider-option");
		Foxtrick.addClass(container,"ft-ignore-changes");

		var desc = doc.createElement("div");
		Foxtrick.addClass(desc,"ft-desc");
		Foxtrick.addClass(desc,"ft-table-cell");
		var bold = doc.createElement("b");
		bold.textContent  = Foxtrickl10n.getString("PlayerStatsExperience.InternationalPercentage");
		desc.appendChild(bold);

		var sliderContainer = doc.createElement("div");
		Foxtrick.addClass(sliderContainer,"ft-slider-cell");

		var slider = doc.createElement("div");
		slider.setAttribute("id", "simple-slider");
		Foxtrick.addClass(slider, "slider");

		var slider2 = doc.createElement("div");
		Foxtrick.addClass(slider2, "foxtrick-bar handle");
		slider2.setAttribute("id", "ft-xp-slider-handle");
		slider.appendChild(slider2);

		sliderContainer.appendChild(slider);

		var value = doc.createElement("div");
		Foxtrick.addClass(value,"ft-table-cell");
		value.setAttribute("id", "ft-xp-percentage-value");
		value.textContent = "50.0 %"

		container.appendChild(desc);
		container.appendChild(sliderContainer);
		container.appendChild(value);

		div.appendChild(container);
		//navigation.parentNode.insertBefore(container, navigation);
		navigation.parentNode.insertBefore(div, navigation);

		if(this.store.matches.matchFriendly.minutes == 0)
			Foxtrick.addClass(container, 'hidden');

		//if more matches are required, clone showall link for easier access to top of table
		if(showAllLink && !this.store.skillup){
			var showAllLinkClone = showAllLink.cloneNode(true);
			navigation.parentNode.insertBefore(showAllLinkClone, navigation);
		}

		//header for the old table
		var table_header = doc.createElement('h2');
		var table_header_title = doc.createTextNode( Foxtrickl10n.getString("PlayerStatsExperience.PerformanceHistory") );
		table_header.appendChild(table_header_title);
		navigation.parentNode.insertBefore(table_header, navigation);

		new Dragdealer(slider, {
			steps: 1000,
			snap: true,
			slide: false,
			x: 0.5,
			animationCallback: function(x, y)
			{
				var min = 0;
				var max = 0;
				var store = Foxtrick.modules["PlayerStatsExperience"].store;
				var xp_limit = Foxtrick.modules["PlayerStatsExperience"].pts_for_skillUp;
				var friendlyVariance = store.matches.matchFriendly.xp.max -  store.matches.matchFriendly.xp.min;
				
				for(var i in store.matches){
					min += store.matches[i].xp.min;
					max += store.matches[i].xp.max;
				}

				doc.getElementById("ft-xp-percentage-value").textContent = (x*100).toFixed(2) +" %";
				if(!Foxtrick.modules["PlayerStatsExperience"].store.skillup){
					Foxtrick.addClass(doc.getElementById("ft-xp-min-pts"), "ft-xp-incomplete")
					Foxtrick.addClass(doc.getElementById("ft-xp-max-pts"), "ft-xp-incomplete")
					Foxtrick.addClass(doc.getElementById("ft-xp-min"), "ft-xp-incomplete")
					Foxtrick.addClass(doc.getElementById("ft-xp-max"), "ft-xp-incomplete")
				} else {
					Foxtrick.addClass(doc.getElementById("ft-xp-min-pts"), "ft-xp-complete")
					Foxtrick.addClass(doc.getElementById("ft-xp-max-pts"), "ft-xp-complete")
					Foxtrick.addClass(doc.getElementById("ft-xp-min"), "ft-xp-complete")
					Foxtrick.addClass(doc.getElementById("ft-xp-max"), "ft-xp-complete")
				}
				doc.getElementById("ft-xp-min-pts").textContent = (min + friendlyVariance*x).toFixed(3);
				
				var mmin = store.matches.matchFriendly.xp.min*(1-x)
				var mmax = store.matches.matchFriendly.xp.max*x

				doc.getElementById("ft-xp-matchNationalFriendly-min").textContent = mmin>0?mmin.toFixed(3):0;
				doc.getElementById("ft-xp-matchInternationalFriendly-min").textContent = mmax>0?mmax.toFixed(3):0;
				doc.getElementById("ft-xp-matchNationalFriendly-max").textContent = "";
				doc.getElementById("ft-xp-matchInternationalFriendly-max").textContent = "";
				doc.getElementById("ft-xp-matchNationalFriendly-minutes").textContent = Math.floor((store.matches.matchFriendly.minutes*(1-x)) + 0.5);
				doc.getElementById("ft-xp-matchInternationalFriendly-minutes").textContent = Math.floor((store.matches.matchFriendly.minutes*x) + 0.5);
				
				//marks the game that causes prediction error (first game after skillup)
				if(Foxtrick.modules["PlayerStatsExperience"].store.skillup){
					Foxtrick.addClass(doc.getElementById("ft-xp-" + store.last.gameType + "-min"),"ft-xp-skillup");
					Foxtrick.addClass(doc.getElementById("ft-xp-" + store.last.gameType + "-max"),"ft-xp-skillup");
				}

				//counts friendly / international friendlies and dislay
				var ntc = store.matches.matchFriendly.count*(1-x);
				var intc = store.matches.matchFriendly.count*x;

				doc.getElementById("ft-xp-matchNationalFriendly-count").textContent = ntc>0?ntc.toFixed(3):0;
				doc.getElementById("ft-xp-matchInternationalFriendly-count").textContent = intc>0?intc.toFixed(3):0;

				//actual min/max values for xp
				doc.getElementById("ft-xp-min").textContent = (store.currentSkill + ((min + friendlyVariance*x).toFixed(3)/xp_limit)).toFixed(3)
				doc.getElementById("ft-xp-max").textContent = (store.currentSkill + (max/xp_limit)).toFixed(3)
				
				//ft-xp-incomplete

			}
		});
	}
};