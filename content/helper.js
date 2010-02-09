/**
* helper.js
*  tools.
*/
////////////////////////////////////////////////////////////////////////////////
var FoxtrickHelper = {

	
	MODULE_NAME : "Helper",
	PAGES : new Array('myhattrick'), 
	DEFAULT_ENABLED : true,
	OWNTEAMINFO:"",
	
	init : function() {
	},
	
	run : function( page, doc ) {
		this.getOwnTeamInfo(doc);	
	},

	change : function( page, doc ) {
		
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

	/* obsolete
	//---------------------------------------------------------------------------    
	findIsArchievedMatch : function(element) {
		var links = element.getElementsByTagName('a');
		for (var i=0; i < links.length; i++) {
			if ( links[i].href.match(/Club\/Matches\/Match\.aspx/i) ) {
				return (links[i].href.match(/useArchive/i));
			}
		}
		return false;
	},*/

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
	
	//---------------------------------------------------------------------------    
	getOwnTeamInfo : function(doc) {
		var teamdiv = doc.getElementById('teamLinks');
		var ownleagueid = this.findLeagueLeveUnitId(teamdiv);
		if (ownleagueid!=null) {
			var owncountryid =this.findCountryId(teamdiv);
			var ownleaguename= this.extractLeagueName(teamdiv);        		
			var ownseriesnum =this.getSeriesNum(ownleaguename);
			var ownlevelnum = this.getLevelNum(ownleaguename, owncountryid);
			
			this.OWNTEAMINFO={"ownteamid": this.findTeamId(teamdiv),
				"ownteamname" : this.extractTeamName(teamdiv),	
				"owncountryid" : owncountryid,
				"ownleaguename" : ownleaguename,        		
				"ownseriesnum" : ownseriesnum,
				"ownlevelnum" : ownlevelnum};
				//Foxtrick.dump('got ownteaminfo\n');
		} 
	}
};

