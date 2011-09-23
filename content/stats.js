/**
 *
 *
 * stats.js
 * Foxtrick links collection
 * @author other,convinced
 */

/*
 * "params"	: { "infocode" : "text" } -> ?text=info[infocode]
 * "params"	: { "infocode" : "" } -> info[infocode] // eg alltid
 * "params"	: { "" : "#text" } -> #text 			//eg maptrick , first letter non alphanumeric
 * "params"	: { "infocode" : "," } -> ,info[infocode] //eg alltid, first letter non alphanumeric
 * "params"	: { "infocode" : "ftfilter_somename" } -> parameter only used for allowlink function and will not be shown in link //eg hattrickchallenge_friendly, first letters = ftfilter
 * for others use the 'paramfunction' eg natstats
 */

if (!Foxtrick) var Foxtrick={};

Foxtrick.LinkCollection = {};
Foxtrick.LinkCollection.stats = {};
Foxtrick.LinkCollection.htworld = {};


with (Foxtrick.LinkCollection) {

htworld[118]='algerie';
htworld[128]='aliraq';
htworld[127]='alkuwayt';
htworld[77]='almaghrib';
htworld[106]='alurdun';
htworld[133]='alyaman';
htworld[105]='andorra';
htworld[130]='angola';
htworld[7]='argentina';
htworld[129]='azerbaycan';
htworld[123]='bahrain';
htworld[132]='bangladesh';
htworld[124]='barbados';
htworld[91]='belarus';
htworld[44]='belgie';
htworld[139]='benin';
htworld[74]='bolivia';
htworld[69]='bosnaihercegovina';
htworld[16]='brasil';
htworld[136]='brunei';
htworld[62]='bulgaria';
htworld[125]='caboverde';
htworld[17]='canada';
htworld[52]='ceskarepublika';
htworld[18]='chile';
htworld[34]='china';
htworld[19]='colombia';
htworld[81]='costarica';
htworld[126]='cotedivoire';
htworld[131]='crnagora';
htworld[61]='cymru';
htworld[89]='cyprus';
htworld[11]='danmark';
htworld[141]='dawlatqatar';
htworld[144]='dhivehiraajje';
htworld[73]='ecuador';
htworld[56]='eesti';
htworld[100]='elsalvador';
htworld[2]='england';
htworld[36]='espana';
htworld[76]='foroyar';
htworld[5]='france';
htworld[137]='ghana';
htworld[107]='guatemala';
htworld[30]='hanguk';
htworld[122]='hayastan';
htworld[50]='hellas';
htworld[99]='honduras';
htworld[59]='hongkong';
htworld[58]='hrvatska';
htworld[20]='india';
htworld[54]='indonesia';
htworld[85]='iran';
htworld[21]='ireland';
htworld[38]='island';
htworld[63]='israel';
htworld[4]='italia';
htworld[94]='jamaica';
htworld[138]='kampuchea';
htworld[112]='kazakhstan';
htworld[95]='kenya';
htworld[102]='kyrgyzstan';
htworld[53]='latvija';
htworld[84]='letzebuerg';
htworld[117]='liechtenstein';
htworld[66]='lietuva';
htworld[120]='lubnan';
htworld[51]='magyarorszag';
htworld[97]='makedonija';
htworld[45]='malaysia';
htworld[101]='malta';
htworld[6]='mexico';
htworld[33]='misr';
htworld[135]='mocambique';
htworld[103]='moldova';
htworld[119]='mongoluls';
htworld[14]='nederland';
htworld[111]='nicaragua';
htworld[75]='nigeria';
htworld[22]='nippon';
htworld[9]='norge';
htworld[93]='northernireland';
htworld[15]='oceania';
htworld[39]='oesterreich';
htworld[134]='oman';
htworld[71]='pakistan';
htworld[96]='panama';
htworld[72]='paraguay';
htworld[23]='peru';
htworld[55]='philippines';
htworld[24]='polska';
htworld[25]='portugal';
htworld[31]='prathetthai';
htworld[88]='republicadominicana';
htworld[37]='romania';
htworld[35]='rossiya';
htworld[104]='sakartvelo';
htworld[79]='saudiarabia';
htworld[46]='schweiz';
htworld[26]='scotland';
htworld[121]='senegal';
htworld[98]='shqiperia';
htworld[47]='singapore';
htworld[64]='slovenija';
htworld[67]='slovensko';
htworld[27]='southafrica';
htworld[57]='srbija';
htworld[12]='suomi';
htworld[113]='suriname';
htworld[140]='suriyah';
htworld[1]='sverige';
htworld[60]='taiwan';
htworld[142]='tanzania';
htworld[80]='tounes';
htworld[110]='trinidadandtobago';
htworld[32]='turkiye';
htworld[143]='uganda';
htworld[68]='ukraina';
htworld[83]='unitedarabemirates';
htworld[28]='uruguay';
htworld[8]='usa';
htworld[29]='venezuela';
htworld[70]='vietnam';
htworld[3]='deutschland';

stats["htworld"] = {
	"title" : "HT-World NT/U20 tracker",
	"img" : Foxtrick.InternalPath+"resources/linkicons/tracker.png",
	"url" : "http://www.ht-world.org/",
	"urlfunction": function (filterparams) {
		var countryid = filterparams["countryid"];
		var nationality = filterparams["nationality"];
		if (typeof(htworld[countryid]) == 'undefined') {
			if (typeof(htworld[nationality]) == 'undefined') return null;
			return "http://" + htworld[nationality];
		}
		return "http://" + htworld[countryid];
	},
	"trackernationalteamlink" : { 
		"path"		: "/index.php?language=2",
		"filters"	: [],
		"params"	: []
	},
	"trackerplayerlink" : { 
		"path"		: "/scouting.php?language=2",
		"filters"	: [],
		"params"	: []
	}
};


// hattrick challenge
stats["hattrickchallenge_friendly"] = {
	"url" : "http://www.hattrickchallenge.com/Tools/Entry.php",
	"challengeslink" : { 
		"path"		: "?tool=friendly",
		"filters"	: [],
		"params"	: {"teamid":"teamid","ownteamid":"ftfilter_ownteamid"}
	},
	"youthchallengeslink" : { 
		"path"		: "?tool=youthfriendly",
		"filters"	: [],
		"params"	: {"youthteamid":"youthteamid","teamid":"teamid","ownteamid":"ftfilter_ownteamid"}
	},
	"youthlink" : { 
		"path"		: "?tool=youthfriendly",
		"filters"	: [],
		"params"	: {"youthteamid":"youthteamid","teamid":"teamid","ownteamid":"ftfilter_ownteamid"}
	},
	"allowlink" : function(filterparams, stattype) {
		if (filterparams["teamid"] != filterparams["ownteamid"]) {
			return false;
		} else {
			return true;
		}
	},
	"title" : "HattrickChallenge Friendly ads",
	"img" : Foxtrick.InternalPath+"resources/linkicons/hattrickchallenge_main.png"
};


stats["alltid_add"] = {
	"url" : "",
	"urlfunction": function (filterparams) {
		return 'javascript:'+
			'var i=parseInt(localStorage.getItem("alltidcompare_index"));'+
			'if(!i)i=0;'+
			'var do_remove=false;'+
			'for(var j=0;j<i+1;++j) {if(parseInt(localStorage.getItem("alltidcompare_teamid"+j))=='+filterparams["teamid"]+'){do_remove=true;break;}}'+
			'if (do_remove) {'+
			' localStorage.setItem("alltidcompare_teamid"+j,"0");'+
			' localStorage.setItem("alltidcompare_teamname"+j,"");'+
			'}'+
			'else {'+
			' localStorage.setItem("alltidcompare_teamid"+i, "'+filterparams["teamid"]+'");'+
			' localStorage.setItem("alltidcompare_teamname"+i, "'+filterparams["teamname"]+'");'+
			' i=i+1;'+
			' localStorage.setItem("alltidcompare_index",i);'+
			'}'+
			'var teams="";'+
			'for(var j=0;j<i;++j) {if(localStorage.getItem("alltidcompare_teamid"+j)!=0) teams+=localStorage.getItem("alltidcompare_teamname"+j)+" --- ";}'+
			'alert("Selected teams: "+teams)';
	},
	"openinthesamewindow" : "true",
	"teamlink" : { 
		"path"		: "",
		"filters"	: { "teamid" : "teamid", "teamname" : "teamname" },
		"params"	: [],
	},
	"img" : Foxtrick.InternalPath+"resources/linkicons/ahaddremove.png",
	"title" : "Alltid: add to or remove from compare list",
	"shorttitle" : "Add/Remove"
};

stats["alltid_clear"] = {
	"url" : "",
	"urlfunction": function (filterparams) {
		return 'javascript:'+
				'localStorage.setItem("alltidcompare_index",0);'+
				'alert("Cleared team compare list");';
	},
	"openinthesamewindow" : "true",
	"teamlink" : { 
		"path"		: "",
		"filters"	: [],
		"params"	: []
	},
	"img" : Foxtrick.InternalPath+"resources/linkicons/ahclear.png",
	"title" : "Alltid: clear compare list",
	"shorttitle" : "Clear"
};

stats["alltid_compare"] = {
	"url" : "",
	"urlfunction": function (filterparams) {
		return 'javascript:'+
				'var alltidcompare_index=parseInt(localStorage.getItem("alltidcompare_index"));'+
				'var teams="";'+
				'for(var i=0;i<alltidcompare_index;++i) if(localStorage.getItem("alltidcompare_teamid"+i)!=0) teams+=localStorage.getItem("alltidcompare_teamid"+i)+",";'+
				'location.href="http://alltid.org/teamcompare/"+teams;';
	},
	"teamlink" : { "path"	: "",
					"filters"	: [],
					"params"	: []
				},
	"img" : Foxtrick.InternalPath+"resources/linkicons/ahcompare.png",
	"title" : "Alltid: compare teams",
	"shorttitle" : "Compare"
};


//NrgJack Wage Reduction Calculator
stats["Wage_Reduction_Calculator"] = {
	"url" : "http://www.nrgjack.altervista.org/",
	"playerlink" : { 
		"path"		: "wagereduction.php",
		"filters"	: ["age"],
		"paramfunction" : function(params) {
			var wage=params["wage"];
			var wagebonus=params["wagebonus"];
			var age=params["age"];
			var CurrCode=params["Currency"];
			if (CurrCode!="EUR"){
				wage=Math.round(wage*Foxtrick.util.currency.getRate());
				wagebonus=Math.round(wagebonus*Foxtrick.util.currency.getRate());
				age=Math.round(age);
			}
			return "?wage=" + wage + "&wagebonus=" + wagebonus + "&age=" + age;
		}
	},
	"ageranges" : [[28, 99]],
	"title" : "Wage Reduction Calculator",
	"img" : Foxtrick.InternalPath+"resources/linkicons/wagereduction.png"
};


stats["hattrick-youthclub"] = {
	"url" : "http://www.",
	"urlfunction": function (filterparams) {
				var server = filterparams["server"];
				return "http://" +server + ".hattrick-youthclub.org/";
			},
	"youthlink" : { "path"	: "",
				"filters"	: [],
				"params"	: {"teamid":"ftfilter_teamid","ownteamid":"ftfilter_ownteamid"}
			},
	"youthplayerlistlink" : { "path"	: "site/players",
				"filters"	: [],
				"params"	: {"teamid":"ftfilter_teamid","ownteamid":"ftfilter_ownteamid"}
			},
	"youthplayerdetaillink" : { "path"	: "redirect/type/player_details/ht_id/",
				"filters"	: [],
				"params"	: {"playerid" : "", "teamid":"ftfilter_teamid","ownteamid":"ftfilter_ownteamid"}
			},
	"youthmatchlistlink" : { "path"	: "site/matches",
				"filters"	: [],
				"params"	: {"teamid":"ftfilter_teamid","ownteamid":"ftfilter_ownteamid"}
			},
	"youthtraininglink" : { "path"	: "",
				"filters"	: [],
				"params"	: {"teamid":"ftfilter_teamid","ownteamid":"ftfilter_ownteamid"}
			},
	"playedyouthmatchlink" : { "path"	: "redirect/type/lineup/ht_id/",
				"filters"	: [],
				"params"	: {"matchid" : "", "teamid":"ftfilter_teamid", "teamid2":"ftfilter_teamid2", "ownteamid":"ftfilter_ownteamid"}
			},
	"allowlink" : function(filterparams, stattype) {
		if (filterparams["teamid"] === filterparams["ownteamid"] ||
				(filterparams["ownyouthteamid"] !== null &&
				(filterparams["teamid"] === filterparams["ownyouthteamid"]
				|| filterparams["teamid2"] === filterparams["ownyouthteamid"]) ) ) {
		return true;
		} else {
		return false;
		}
	},
	"title" : "Hattrick Youthclub",
	"img" : Foxtrick.InternalPath+"resources/linkicons/hyouthclub.png"
};

stats["nrg_deffor"] = {
	"url" : "http://nrgjack.altervista.org/",
	"playerlink" : { "path"	: "trequartista.php",
					"filters"	: [],
					"params"	: { "playmaking" : "pm", "passing" : "pa",
									"winger" : "wi", "defending" : "df",
									"scoring" : "sc", "goalkeeping" : "gk" }
					},
	"allowlink" : function(filterparams, stattype) {
		if (parseInt(filterparams["passing"])+ parseInt(filterparams["scoring"])+ parseInt(filterparams["playmaking"]) >
			2*(parseInt(filterparams["winger"]) + parseInt(filterparams["defending"]) + parseInt(filterparams["goalkeeping"])))
		{
			return true;
		} else {
			return false;
		}
	},
	"title" : "NRG The Perfect Defensive Forward",
	"img" : Foxtrick.InternalPath+"resources/linkicons/nrg_deffor.gif"
};

/* //down
// Team Position Probability Calculator
stats["tppc"] = {
	"url" : "http://www.adrianomoutinho.com/hattrick/index.php",
	"leaguelink" : { "path"	: "",
					"filters"	: [],
					"params"	: { "leagueid" : "leagueid" },
					"paramfunction" : function(params) {
						return '?LeagueId'+params["leagueid"]+'&Language='+FoxtrickPrefs.getString("htLanguage");
					}
				},
	"title" : "Team Position Probability Calculator",
	"img" : "resources/linkicons/tppc.png"
}; */


/* 
"httoolsfriendlymanager" : {
	"url" : "http://httoolsfriendlymanager.cretze.ro/"
	"challengeslink" : { "path"	: "",
					"filters"	: [],
					"params"	: []
				},
	"title" : "HTTools Friendly Manager",
	"img" : "resources/linkicons/httools_friendly.png"
}, */


/* 
"hat_com_coolness" : {
	"url" : "http://coolness.hat-com.com/",
	"teamlink" : {
		"path" : "countries.php",
		"filters" : [],
		"params" : { "teamid" : "team_id" }
	},
	"challengeslink" : {
		"path" : "countries.php",
		"filters" : [],
		"params" : { "teamid" : "team_id" }
	},
	"title" : "Hat-com Coolness",
	"img" : "resources/linkicons/hat-com.png"
}, */


/* 
"Training_Team_Evaluation" : {
	"url" : "http://www.adrianomoutinho.com/tte/",
	"playerlink" : { "path"	: "playertraining.php?PlayerId=",
					"filters"	: [],
					"params"	: {"playerid" : "" }
					},
	"traininglink" : { "path"	: "playertraining.php",
					"filters"	: [],
					"params"	: []
					},
	"title" : "Training Team Evaluation",
	"img" : "resources/linkicons/training_evaluation.png"
}, 
*/
};

//------------------------------------------------------------------
// -----------------------------------------------------------------


if (!Foxtrick) var Foxtrick={};

Foxtrick.StatsHash = {};

Foxtrick.MakeStatsHash = function(){
	// create stats Hash for Foxtrick.LinkCollection
	for (var key in Foxtrick.LinkCollection.stats) {
		var stat = Foxtrick.LinkCollection.stats[key];
		for (var prop in stat) {
			if (prop.match(/link/)) {
				if (typeof(Foxtrick.StatsHash[prop]) == 'undefined') {
					Foxtrick.StatsHash[prop] = {};
				}
				Foxtrick.StatsHash[prop][key] = stat;
			}
		}
	}
	
	var externalLinks = Foxtrick.load(Foxtrick.InternalPath + "stats.json");
	if (externalLinks.indexOf('javascript') !== -1) {
		Foxtrick.log('No javascript in external links');
		return;
	}
	externalLinks = JSON.parse(externalLinks);
	
	for (var key in externalLinks) {
		var stat = externalLinks[key];
		for (var prop in stat) {
			if (prop.match(/link/)) {
				if (typeof(Foxtrick.StatsHash[prop]) == 'undefined') {
					Foxtrick.StatsHash[prop] = {};
				}
				Foxtrick.StatsHash[prop][key] = stat;
			}
		}
	}
}


Foxtrick.LinkCollection.getLinks2 = function(stats, stattype, filterparams, doc, overridesettings, module) {
	var links = [];
	var counter = 0;

	for (var key in stats) {

		if (!FoxtrickPrefs.isModuleOptionEnabled(module.MODULE_NAME, key) && !overridesettings) {
			continue;
		}
		var stat = stats[key];
		var statlink = stat[stattype];
		var filters = statlink["filters"];

		var allowed = true;

		if ( (!filters || filters.length == 0) && (typeof(stat["allowlink"]) == 'undefined')) {
			allowed = true;
		} else {
			if (filters.length > 0) {
				for (var i=0; i<filters.length; i++) {
					var filtertype = filters[i];
					var filterranges = stat[filtertype + "ranges"];
					var temp = false;

					for (var j=0; j<filterranges.length; j++) {
						if ( (filterparams[filtertype] >= filterranges[j][0]) && (filterparams[filtertype] <= filterranges[j][1])) {
							temp = true;
							break;
						}
					}
					if (!temp) {
						allowed = false;
						break;
					}
				}
			} else {
				if (typeof(stat["allowlink"]) != 'undefined') {
					if (stat["allowlink"](filterparams, stattype)) {
						allowed = true;
					} else {
						allowed = false;
					}
				}
			}
		}

		if (allowed) {
			var link = Foxtrick.LinkCollection.makelink(stat, statlink, filterparams, key, doc);
			if (link != null) {
				links.push({"link" : Foxtrick.LinkCollection.getLinkElement(link, stat, doc, key, module.MODULE_NAME), "stat" : stat});
			}
		}
	}
 return Foxtrick.LinkCollection.getSortedLinks(links);
};


Foxtrick.LinkCollection.getLinks = function(stattype, filterparams, doc, module) {
	try {
		filterparams.server = doc.location.hostname;
		return Foxtrick.LinkCollection.getLinks2(Foxtrick.StatsHash[stattype], stattype, filterparams, doc, false, module);
	} catch (e) { Foxtrick.log('getLinks: ',e) };
};


Foxtrick.LinkCollection.makelink = function(stat, statlink, filterparams, key, doc) {

	var params = statlink["params"];
	if (!statlink["path"])  statlink["path"] = "";
	var languages = statlink["languages"];
	var args = "";
 
	if (params && typeof (statlink["paramfunction"]) == 'undefined') {
		for (var paramkey in params) {
		if (params[paramkey].search('ftfilter')==0) continue;
			var temp;

			if ((args == "") && statlink["path"].search(/\?/) == -1 && stat["url"].search(/\?/) == -1) {
				temp = "?";
			} else {
				temp = "&";
			}

			if (!params[paramkey].charAt(0).match(/\w+/)) {temp="";}
			
			if (paramkey=="lang") {
				for (var lang in languages) {
					if (lang == FoxtrickPrefs.getString("htLanguage")) {
						args += temp + params[paramkey] + "=" + encodeURIComponent(languages[lang]);
						break;
					}
					else if (lang == 'any') {
						args += temp + params[paramkey] + "=" + encodeURIComponent(languages[lang]);
					}
				}
				continue;
			}
			
			if (filterparams[paramkey] != null) {
				args += ( (params[paramkey] != "" && temp !="") ? (temp + params[paramkey] + "=") : params[paramkey])+ encodeURIComponent(filterparams[paramkey]);
				}
			else {args += (params[paramkey] != "" ? temp + params[paramkey] : "");}
		}

	} else {
		args = statlink["paramfunction"](filterparams);
	}

	var url=null;

	if (typeof (stat["urlfunction"]) == 'undefined') {
		url = stat["url"];
	} else {
		url = stat["urlfunction"](filterparams);
	}

	if (url == null) return null;

	var link;

	if (typeof(stat["post"]) == 'undefined') {
		link = url + statlink["path"] + args;
	} else {
		var temp = "";

		for (var paramkey in params) {
			temp = temp + "-" + params[paramkey] + "-" + filterparams[paramkey];
		}

		link = "javascript:document.forms.namedItem('" + key + temp + "').submit();";

		var form = doc.createElement("form");
		form.name = key + temp;
		form.action = url + statlink["path"];
		form.method = "post";
		form.target = "_stats";
		form.style.display = "none";

		for (var paramkey in params) {
			var input = doc.createElement("input");
			input.type="hidden";
			input.name=params[paramkey];
			input.value=filterparams[paramkey];
			form.appendChild(input);
		}

		doc.getElementsByTagName("body")[0].appendChild(form);

	}

	return link;
};


Foxtrick.LinkCollection.getLinkElement = function(link, stat, doc, key, module_name) {

	var statslink = doc.createElement("a");
	if (typeof(stat["post"]) == 'undefined') {
	if (typeof(stat["openinthesamewindow"]) == 'undefined') {
		statslink.target = "_stats";
	}
	}
	//if (link.search(/javascript/i)!=-1) statslink.target = "";

	statslink.title = stat.title;
	//statslink.style.verticalAlign = "middle";
	statslink.setAttribute('key',key);
	statslink.setAttribute('module',module_name);

	if (typeof(stat["img"]) == 'undefined') {
		statslink.appendChild(doc.createTextNode(stat.shorttitle));
	} else {
		// add path to internal images
		if (stat.img.indexOf('resources')==0) 
			stat.img = Foxtrick.ResourcePath + stat.img;
		// add img for tracker flags
		if (module_name === "LinksTracker")
			statslink.appendChild(doc.createElement('img'));
		else
			Foxtrick.addImage(doc, statslink, { alt:stat.title, title: stat.title, src: stat.img });
	}

	statslink.href = link;

	return statslink;
};

Foxtrick.LinkCollection.getSortedLinks = function(links) {
	function sortfunction(a,b) {
		if (typeof(a.stat["img"]) == 'undefined' && typeof(b.stat["img"]) == 'undefined') return 0;//a.link.title.localeCompare(b.link.title);
		else if (typeof(a.stat["img"]) == 'undefined') return 1;
		else if (typeof(b.stat["img"]) == 'undefined') return -1;
		return a.link.title.localeCompare(b.link.title);
	}
	links.sort(sortfunction);
	return links;
};
