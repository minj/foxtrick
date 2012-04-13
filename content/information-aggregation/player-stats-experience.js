"use strict";
/**
 * player-stats-experience.js
 * show how much experience a player gained in invidual matches and shows current subskill
 * @author CatzHoek
 */

Foxtrick.modules["PlayerStatsExperience"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ['playerStats'],
	CSS: Foxtrick.InternalPath + "resources/css/player-stats.css",
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

		var xp = {};
		xp.matchFriendly = 0.2;			//assume international friendly as default, considered in min-max, minimum uses 1/2 of this value
		xp.matchLeague = 1.0; 
		xp.matchCup = 2.0;
		xp.matchNtFriendly = 2.0;		//fakename: we generate this type (iconsytle + gametype)
		xp.matchQualification = 2.0;
		xp.matchMasters = 5.0;
		xp.matchNtLeague = 10.0;		//fakename: we generate this type (iconsytle + gametype), (semi)-final matches are downgraded to plain WC matches, errors not considered in min-max
 		

		var xp_column = 6;
		var pts_for_skillUp = 28.0;

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
		var gotStars = function(node, simple){
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

		var getGameType = function(node){

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
				else if(gameType == "matchLeague")
					return  "matchNtLeague"
			} else
				return gameType; 
		}

		var getXpGain = function(minutes, gametype){
			return (xp[gametype]/90)*minutes;	
		}

		//both tables you can alter between atm
		var stats = doc.getElementById("stats");
		var matches = doc.getElementById("matches");

		if(!stats || !matches)
			return;

		//headers
		var stats_head = stats.getElementsByTagName("thead")[0].getElementsByTagName("tr")[0];

		var ts_xp = doc.createElement("th");
		Foxtrick.addClass(ts_xp,"stats");
		Foxtrick.addClass(ts_xp,"ft-dummy");
		ts_xp.textContent = Foxtrickl10n.getString("PlayerStatsExperience.ExperienceChange.title.abbr");
		ts_xp.title = Foxtrickl10n.getString("PlayerStatsExperience.ExperienceChange.title");
		//stats_head.appendChild(ts_xp);
		stats_head.insertBefore(ts_xp, stats_head.getElementsByTagName("th")[7]);

		//and their entries
		var stats_entries = stats.getElementsByTagName("tbody")[0].getElementsByTagName("tr");		

		var xp_last = null;
		var xp_sub_min = 0.0;
		var xp_sub_max = 0.0;
		var friendly_count_since_skillup = 0;
		var xp_skillUp_detected = false;
		var xp_last_min_added = 0.0;

		var walkover_str = Foxtrickl10n.getString("PlayerStatsExperience.Walkover");

		Foxtrick.map( function( entry ){

			//current skilllevel
			var	xp_now = parseInt(entry.getElementsByTagName("td")[xp_column].textContent);
			
			//remember current XP Level to detect skilldowns			
			if(xp_last === null)
				xp_last = parseInt(xp_now);		

			var ntMatch = isNTmatch( entry );
			var minutes = getPlayedMinutes( entry );
			var gameType = getGameType( entry );
			var xp_gain = getXpGain( minutes, gameType );

			//check if he also got stars, a game where he got xpgain but has not even half a star must be a walkover
			var got_stars = gotStars(entry);
			var walkover = !got_stars && xp_gain > 0;
			var pseudo_points = xp_gain;
			xp_gain = got_stars?xp_gain:0;
			

			//adjust min and max values to take care of international vs. nationl friendlies
			if(xp_now == xp_last){
				if(!ntMatch){
					 if(gameType == "matchFriendly"){
					 	xp_sub_min += xp_gain/2;
					 	xp_sub_max += xp_gain;
					 	xp_last_min_added = xp_gain/2;
					 } else {
					 	xp_sub_min += xp_gain;
					 	xp_sub_max += xp_gain;
					 	xp_last_min_added = xp_gain;
					 }
				} else {
					xp_sub_min += xp_gain;
					xp_sub_max += xp_gain;
					xp_last_min_added = xp_gain;
				}
			} else {
				//we found a skillup, gathered data is relyable 
				xp_skillUp_detected = true;
			}

			var ts_xp = doc.createElement("td");
			Foxtrick.addClass(ts_xp,"stats");
			Foxtrick.addClass(ts_xp,"ft-dummy");
			if(walkover){
				Foxtrick.addClass(ts_xp,"ft-playerStats-walkover");
				ts_xp.textContent = pseudo_points.toFixed(2);
				ts_xp.setAttribute("title", walkover_str);
			} else {
				ts_xp.textContent = xp_gain.toFixed(2);
			}
			if(!ntMatch && gameType == "matchFriendly" && minutes > 0)
				ts_xp.textContent =  (xp_gain/2.0).toFixed(2) + "/" + xp_gain.toFixed(2);
			entry.insertBefore(ts_xp, entry.getElementsByTagName("td")[xp_column+1]);

		}, stats_entries);

		xp_sub_min -= xp_last_min_added;

		var showAllLink=null;
		var links = doc.getElementsByTagName("a");
		Foxtrick.map(function (link){
			if(link.href.search(RegExp("ShowAll=True", "i")) != -1)
				showAllLink=link;
		}, links)

		var div = Foxtrick.createFeaturedElement(doc, this, "div"); 

		var experienceText = Foxtrickl10n.getString("PlayerStatsExperience.ExperienceText")
						.replace(/%1/, xp_sub_min.toFixed(2))
						.replace(/%2/, xp_sub_max.toFixed(2))
						.replace(/%3/, (xp_last + (xp_sub_min/pts_for_skillUp)).toFixed(2))
						.replace(/%4/, (xp_last + (xp_sub_max/pts_for_skillUp)).toFixed(2));

		var span =  doc.createElement("span");
		var textNode = doc.createTextNode(experienceText);
		span.appendChild(textNode);
		div.appendChild(span);
		div.appendChild(doc.createElement("br"));
		if(showAllLink && !xp_skillUp_detected){
			var span =  doc.createElement("span");
			var textNode = doc.createTextNode(Foxtrickl10n.getString("PlayerStatsExperience.NotAllMatchesVisible"));
			span.appendChild(textNode);
			div.appendChild(span);
		} else if (!xp_skillUp_detected) {
			var span =  doc.createElement("span");
			var textNode = doc.createTextNode(Foxtrickl10n.getString("PlayerStatsExperience.NoSkillUpFound"));
			span.appendChild(textNode);
			div.appendChild(span);
		}

		var navigation = doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlMatchHistorySlideToggle");
		navigation.parentNode.insertBefore(div, navigation);

		//if more matches are required, clone showall link for easier access to top of table
		if(showAllLink && !xp_skillUp_detected){
			var showAllLinkClone = showAllLink.cloneNode(true);
			navigation.parentNode.insertBefore(showAllLinkClone, navigation);
		}
	}
};