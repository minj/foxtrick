"use strict";
/*
 * module.js
 * Utilities for FoxTrick categorized module handling
 * @author ryanli
 */

if (!Foxtrick)
	var Foxtrick = {};

Foxtrick.util.module = {};

if (!Foxtrick.modules)
	Foxtrick.modules = {};


/* alert */
Foxtrick.modules["LiveAlert"]={
	FILE : "alert/live-alert.js",
	MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : [ "matchesLive" ],
	OPTIONS : ["Sound"],
	OPTION_EDITS : true,
	OPTION_EDITS_DATAURL_LOAD_BUTTONS : [true],
};

Foxtrick.modules["NewMail"]={
	FILE :"alert/new-mail.js",
	MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : ["all"],
	OPTIONS : ["NotifyMail", "NotifyMailSound", "NotifyForum", "NotifyForumSound"],
	OPTION_EDITS : true,
	OPTION_EDITS_DISABLED_LIST : [ true, false, true, false],
	OPTION_EDITS_DATAURL_LOAD_BUTTONS : [false, true, false, true ],
	CSS : Foxtrick.InternalPath + "resources/css/new-mail.css",
};

Foxtrick.modules["TickerAlert"] = {
	FILE: "alert/ticker-alert.js",
	MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : ["all"],
	NICE : 20, // after all other modules that make changes to #ticker

	types : {
		"welcome" : /\/MyHattrick\/Dashboard\.aspx$/i,
		"supporter" : /\/Club\/Manager\/\?teamId=/i,
		"forum" : /\/Forum/i,
		"transfer" : /\/Players/i,
		"challenge" : /\/Challenges/i,
		"guestbook" : /\/Club\/Manager\/Guestbook\.aspx\?teamid=/i,
		"mail" : /\/Inbox/i,
		"myht" : /\/Myhattrick\/Dashboard\.aspx\?actionType=/i,
		"others" : /.*/
	},
	
	OPTION_FUNC : function(doc) {
		var table = doc.createElement("table");
		table.className = "bordered center maxed";

		// header
		var header = doc.createElement("tr");
		table.appendChild(header);
		var holder = doc.createElement("th");
		header.appendChild(holder);
		var enableh = doc.createElement("th");
		enableh.setAttribute("data-text", "TickerAlert.enable");
		enableh.className='col_checkbox';
		header.appendChild(enableh);
		var soundh = doc.createElement("th");
		soundh.setAttribute("data-text", "TickerAlert.sound");
		soundh.className='col_textfield';
		header.appendChild(soundh);
		var fileh = doc.createElement("th");
		fileh.className='col_filepicker';
		header.appendChild(fileh);

		for (var type in this.types) {
			var row = doc.createElement("tr");
			table.appendChild(row);
			var rhead = doc.createElement("th");
			rhead.setAttribute("data-text", "ticker.type." + type);
			row.appendChild(rhead);
			var enablec = doc.createElement("td");
			row.appendChild(enablec);
			var enable = doc.createElement("input");
			enable.type = "checkbox";
			enable.setAttribute("pref", "module.TickerAlert." + type + ".enabled");
			enablec.appendChild(enable);
			var soundc = doc.createElement("td");
			row.appendChild(soundc);
			var sound = doc.createElement("input");
			sound.setAttribute("pref", "module.TickerAlert." + type + ".sound");
			soundc.appendChild(sound);
			var filec = doc.createElement("td");
			row.appendChild(filec);
			var input = Foxtrick.filePickerForDataUrl(doc, (function(sound) {
					return function(url) { 
						sound.value = url; 
						Foxtrick.playSound(url);
					};
				})(sound));
			filec.appendChild(input);
		}

		return table;
	}
};

Foxtrick.modules["TickerColoring"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : ["all"],
	CSS : Foxtrick.InternalPath + "resources/css/ticker-coloring.css",
};


/* matches */
Foxtrick.modules["AttVsDef"]={
	FILE: "matches/att-vs-def.js",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ['match'],
	NICE : -1, // before Ratings
	RADIO_OPTIONS : ["newstyle", "oldstyle", "oldstyleifkseparated"],
};

Foxtrick.modules["CopyRatings"]={
	FILE: "matches/copy-ratings.js",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ['match'],
	NICE : 1, // after MatchReportFormat.
	CSS : Foxtrick.InternalPath + "resources/css/copy-ratings.css",
};

Foxtrick.modules["HTMSPrediction"]={
	FILE: "matches/htms-prediction.js",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ['match', 'matchOrder'],
	CSS : Foxtrick.InternalPath + "resources/css/htms-statistics.css",
	NICE : -1,  // before ratings
};

Foxtrick.modules["LiveMatchReportFormat"]={
	FILE: "matches/live-match-report-format.js",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : [ "matchesLive" ],
	NICE: 1,
};

Foxtrick.modules["MatchIncome"]={
	FILE: "matches/match-income.js",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ['match'],
};

Foxtrick.modules["MatchOrderInterface"]={
	FILE: "matches/match-order.js",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ['matchOrder', 'matchLineup'],
	OPTIONS : [["PlayedLastMatch", "PlayedLastMatch.alsoOnField", "PlayedLastMatch.disableForTournaments"],"Specialties", "ShowFaces", "SwapPositions","StayOnPage"],
	CSS : Foxtrick.InternalPath + "resources/css/match-order.css",
	OPTIONS_CSS : [ "", Foxtrick.InternalPath + "resources/css/match-order-specialties.css", Foxtrick.InternalPath + "resources/css/match-order-faces.css"],
};

Foxtrick.modules["MatchPlayerColouring"]={
	FILE: "matches/match-player-colouring.js",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ["match", "playerdetail"],
	OPTIONS : ["SeparateOwnPlayerColors"],
	CSS : Foxtrick.InternalPath + "resources/css/match-player-colouring.css",
};

Foxtrick.modules["MatchReportFormat"]={
	FILE: "matches/match-report-format.js",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ["match"],
	OPTIONS : ['ShowEventIcons'],
	CSS : Foxtrick.InternalPath + "resources/css/match-report.css",
};

Foxtrick.modules["MatchSimulator"]={
	FILE: "matches/match-simulator.js",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ['matchOrder'],
	RADIO_OPTIONS : ["RatingsOnTop","RatingsBelow","RatingsRight"],
	OPTIONS : ["HTMSPrediction"],
	CSS : Foxtrick.InternalPath + "resources/css/match-simulator.css",
};

Foxtrick.modules["Ratings"]={
	FILE: "matches/ratings.js",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ['match'],
	OPTIONS : ["HideAverages", "HatStats", "HatStatsDetailed", "LoddarStats", "PeasoStats", "VnukStats", "HTitaVal", "GardierStats"],
};

Foxtrick.modules["StarsCounter"]={
	FILE: "matches/stars-counter.js",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ["matchLineup"],
};
