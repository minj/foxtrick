/**
* helper.js
*  tools.
*/
////////////////////////////////////////////////////////////////////////////////
var FoxtrickHelper = {
	MODULE_NAME : "Helper",
	CORE_MODULE : true,
	PAGES : new Array('all', 'teamPageAny'),
	ownTeam: null,

	run : function(page, doc) {
		this.getOwnTeamInfo(doc, page);
	},

	ownTeam : { "ownTeamId": null,
				"ownTeamName" : null,
				"ownCountryId" : null,
				"ownLeagueName" : null,
				"ownSeriesNum" : null,
				"ownLevelNum" : null,
				"ownYouthTeamId" :null	},

	//---------------------------------------------------------------------------
	getOwnTeamInfo : function(doc, page) {
		var teamdiv = doc.getElementById('teamLinks');
		if ( teamdiv.getElementsByTagName('a').length!=0 && (this.ownTeam.ownTeamId === null || this.ownTeam.ownTeamId != this.findTeamId(teamdiv))) {
			var ownleagueid = this.findLeagueLeveUnitId(teamdiv);
			var owncountryid = this.findCountryId(teamdiv);
			var ownleaguename = this.extractLeagueName(teamdiv);
			var ownseriesnum = this.getSeriesNum(ownleaguename);
			var ownlevelnum = this.getLevelNum(ownleaguename, owncountryid);

			this.ownTeam.ownTeamId = this.findTeamId(teamdiv);
			this.ownTeam.ownTeamName = this.extractTeamName(teamdiv);
			this.ownTeam.ownCountryId = owncountryid;
			this.ownTeam.ownLeagueName = ownleaguename;
			this.ownTeam.ownSeriesNum = ownseriesnum;
			this.ownTeam.ownLevelNum = ownlevelnum ;

			/*Foxtrick.dump('FoxtrickHelper.ownTeam\n'+
					'ownTeamId ' + this.ownTeam.ownTeamId+'\n'+
					'ownTeamName ' + this.ownTeam.ownTeamName+'\n'+
					'ownCountryId ' + this.ownTeam.ownCountryId+'\n'+
					'ownLeagueName ' + this.ownTeam.ownLeagueName+'\n'+
					'ownSeriesNum ' + this.ownTeam.ownSeriesNum+'\n'+
					'ownLevelNum ' + this.ownTeam.ownLevelNum+'\n');*/

			this.ownTeam.ownYouthTeamId = null;
		}
		if (page=='teamPageAny') {
			if  (this.ownTeam.ownYouthTeamId==null) {
				var leftMenuTeamId = FoxtrickHelper.findTeamId(doc.getElementsByClassName("subMenu")[0]);
				if (this.ownTeam.ownTeamId==leftMenuTeamId) {
					this.ownTeam.ownYouthTeamId = FoxtrickHelper.findYouthTeamId(doc.getElementsByClassName("subMenu")[0]);
					// Foxtrick.dump('ownYouthTeamId: '+this.ownTeam.ownYouthTeamId+'\n');
				}
			}
		}
	},

	getOwnTeamId : function() {
		if (this.ownTeam!==null) return this.ownTeam.ownTeamId;
		return null;
	},

	getOwnYouthTeamId : function() {
		if (this.ownTeam!==null) return this.ownTeam.ownYouthTeamId;
		return null;
	},

	getOwnCountryId : function() {
		if (this.ownTeam!==null) return this.ownTeam.ownCountryId;
		return null;
	},


	//---------------------------------------------------------------------------
	isSeriesDetailUrl : function(href) {
		return href.match(/Series\/Default\.aspx/i) ;
	},

	//---------------------------------------------------------------------------
	getLeagueLeveUnitIdFromUrl : function(url) {
		return url.replace(/.+leagueLevelUnitID=/i, "").match(/^\d+/);
	},

	//---------------------------------------------------------------------------
	findCountryId : function(element) {
		var links = element.getElementsByTagName('a');
		for (var i=0; i < links.length; i++) {
			if ( links[i].href.match(/League\.aspx/i) ) {
				return links[i].href.replace(/.+leagueid=/i, "").match(/^\d+/)[0];
			}
		}
		return null;
	},

	//---------------------------------------------------------------------------
	findUserId : function(element) {
		var links = element.getElementsByTagName('a');
		for (var i=0; i < links.length; i++) {
			if ( links[i].href.match(/userId/i) ) {
				return links[i].href.replace(/.+userId=/i, "").match(/^\d+/)[0];
			}
		}
		return null;
	},
	//---------------------------------------------------------------------------
	getUserIdFromUrl : function(url) {
		return url.replace(/.+UserID=/i, "").match(/^\d+/);
	},

	//---------------------------------------------------------------------------
	getTeamIdFromUrl : function(url) {
		return url.replace(/.+TeamID=/i, "").match(/^\d+/);
	},

	//---------------------------------------------------------------------------
	getMatchIdFromUrl : function(url) {
		return url.replace(/.+matchID=/i, "").match(/^\d+/);
	},

	//---------------------------------------------------------------------------
	isTeamDetailUrl : function(href) {
		return href.match(/.+TeamID=/i) ;
	},

	//---------------------------------------------------------------------------
	extractTeamName : function(element) {
		var links = element.getElementsByTagName('a');
		for (var i=0; i<links.length; i++) {
			if (this.isTeamDetailUrl(links[i].href)) {
				return Foxtrick.trim(links[i].text);
			}
		}
		return null;
	},

	//---------------------------------------------------------------------------
	findMatchId : function(element) {
		var links = element.getElementsByTagName('a');
		for (var i=0; i < links.length; i++) {
			if ( links[i].href.match(/Club\/Matches\/Match\.aspx/i) ) {
				return links[i].href.replace(/.+matchID=/i, "").match(/^\d+/)[0];
			}
		}
		return null;
	},

	//---------------------------------------------------------------------------
	findIsYouthMatch : function(href) {
		if (href.match(/Club\/Matches\/Match\.aspx/i) ) {
			return (href.search(/isYouth=true/i)!=-1);
		}
		return false;
	},

	//---------------------------------------------------------------------------
	findTeamId : function(element) {
		var links = element.getElementsByTagName('a');
		for (var i=0; i < links.length; i++) {
			if ( links[i].href.match(/TeamID=/i) ) {
				return links[i].href.replace(/.+TeamID=/i, "").match(/^\d+/)[0];
			}
		}
		return false;
	},

	//---------------------------------------------------------------------------
	findYouthTeamId : function(element) {
		var links = element.getElementsByTagName('a');
		for (var i=0; i < links.length; i++) {
			if ( links[i].href.match(/YouthTeamID=/i) ) {
				return links[i].href.replace(/.+YouthTeamID=/i, "").match(/^\d+/)[0];
			}
		}
		return null;
	},

	//---------------------------------------------------------------------------
	findUserId : function(element) {
		var links = element.getElementsByTagName('a');
		for (var i=0; i < links.length; i++) {
			if ( links[i].href.match(/UserID=/i) ) {
				return links[i].href.replace(/.+UserID=/i, "").match(/^\d+/);
			}
		}
		return false;
	},


	//---------------------------------------------------------------------------
	findSecondTeamId : function(element,firstteamid) {
		var links = element.getElementsByTagName('a');
		for (var i=0; i < links.length; i++) {
			if ( links[i].href.match(/TeamID=/i) ) {
				var id=links[i].href.replace(/.+TeamID=/i, "").match(/^\d+/)[0];
				if (id!=firstteamid) return id;
			}
		}
		return 0;
	},

	//---------------------------------------------------------------------------
	findPlayerId : function(element) {
		var links = element.getElementsByTagName('a');
		for (var i=0; i < links.length; i++) {
			if ( links[i].href.match(/playerID=/i) ) {
				return links[i].href.replace(/.+playerID=/i, "").match(/^\d+/)[0];
			}
		}
		return null;
	},

	//---------------------------------------------------------------------------
	findYouthPlayerId : function(element) {
		var links = element.getElementsByTagName('a');
		for (var i=0; i < links.length; i++) {
			if ( links[i].href.match(/YouthPlayerID=/i) ) {
				return links[i].href.replace(/.+YouthPlayerID=/i, "").match(/^\d+/)[0];
			}
		}
		return null;
	},

	//---------------------------------------------------------------------------
	getSkillLevelFromLink : function(link) {
		var value = link.href.replace(/.+(ll|labellevel)=/i, "").match(/^\d+/);
		return value;
	},

	//---------------------------------------------------------------------------
	extractLeagueName : function(element) {
		var links = element.getElementsByTagName('a');
		for (var i=0; i<links.length; i++) {
			if (this.isSeriesDetailUrl(links[i].href)) {
				return Foxtrick.trim(links[i].text);
			}
		}
		return null;
	},

	//---------------------------------------------------------------------------
	getSeriesNum : function(leaguename) {
		if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
			return "1";
		} else {
			return leaguename.match(/\d+/)[0];
		}
	},

	//---------------------------------------------------------------------------
	getLevelNum : function(leaguename, countryid) {
		if (leaguename == null || countryid == null) return null;
		if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
			// sweden
			if (countryid == "1") {
				if (leaguename.match(/^II[a-z]+/)) {
					return "3";
				}
				if (leaguename.match(/^I[a-z]+/)) {
					return "2";
				}
				return "1";
			}
			return "1";
		} else {
			var temp = this.romantodecimal(leaguename.match(/[A-Z]+/)[0]);
			// sweden
			if (countryid == "1") {
				return temp + 1;
			} else {
				return temp;
			}
		}
	},

	//---------------------------------------------------------------------------
	romantodecimal : function(roman) {
		// very very stupid ....
		switch (roman) {
		case ("I"): return 1;
		case ("II"): return 2;
		case ("III"): return 3;
		case ("IV"): return 4;
		case ("V"): return 5;
		case ("VI"): return 6;
		case ("VII"): return 7;
		case ("VIII"): return 8;
		case ("IX"): return 9;
		case ("X"): return 10;
		default: return null;
		}
	},

	//---------------------------------------------------------------------------
	findLeagueLeveUnitId : function(element) {
		var links = element.getElementsByTagName('a');
		for (var i=0; i < links.length; i++) {
			if ( links[i].href.match(/Series\/Default\.aspx/i) ) {
				return links[i].href.replace(/.+leagueLevelUnitID=/i, "").match(/^\d+/)[0];
			}
		}
		return null;
	},

	countryNameEnglishToLocal : function(engName) {
		for (var i in Foxtrick.XMLData.League) {
			if (Foxtrick.XMLData.League[i].EnglishName === engName) {
				return Foxtrick.XMLData.League[i].LeagueName;
			}
		}
		return null;
	},

	countryNameLocalToEnglish : function(localName) {
		for (var i in Foxtrick.XMLData.League) {
			if (Foxtrick.XMLData.League[i].LeagueName === localName) {
				return Foxtrick.XMLData.League[i].EnglishName;
			}
		}
		return null;
	},

	getLeagueDataFromId :function(id) {
		var data=null;
		try { data = Foxtrick.XMLData.League[id];}
		catch(e){}

		if (data==null) Foxtrick.dump('getLeagueDataFromId error. id: '+id+'\n');
		Foxtrick.dumpFlush(document);
		return data;
	},

	getCurrencyRateFromId  :function(id) {
		try {
			Foxtrick.dump(FoxtrickHelper.getLeagueDataFromId(id).Country.CurrencyRate.replace(',','.')+'\n');
			return parseFloat(FoxtrickHelper.getLeagueDataFromId(id).Country.CurrencyRate.replace(',','.'))/10;
		}
		catch(e){}
		Foxtrick.dump('getCurrencyRate error. id: '+id+'\n');
	},

	createFlagFromCountryId : function(doc, countryId) {
		var leagueId = Foxtrick.XMLData.getLeagueIdByCountryId(countryId);
		var leagueName = "New Moon";
		if (leagueId) {
			leagueName = FoxtrickHelper.getLeagueDataFromId(leagueId).LeagueName;
		}
		var a = doc.createElement("a");
		a.href = "/World/Leagues/League.aspx?LeagueID=" + leagueId;
		a.className = "flag inner";
		var img = doc.createElement("img");
		var style = "vertical-align:top; margin-top:1px; background: transparent url(/Img/Flags/flags.gif) no-repeat scroll " + (-20) * leagueId + "px 0pt;";
		img.setAttribute("style", style);
		img.alt = img.title = leagueName;
		img.src = "/Img/Icons/transparent.gif";
		a.appendChild(img);
		return a;
	}
};
