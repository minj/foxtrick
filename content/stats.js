/**
 *
 *
 * stats.js
 * Foxtrick links collection
 * @author other,convinced
 */

/*
 * "params"     : { "infocode" : "text" }   -> ?text=info[infocode]
 * "params"     : { "infocode" : "" }   -> info[infocode]  // eg alltid
 * "params"     : { "" : "#text" }   -> #text   			//eg maptrick , first letter non alphanumeric
 * "params"     : { "infocode" : "," }   -> ,info[infocode]   //eg alltid, first letter non alphanumeric
 * "params"     : { "infocode" : "ftfilter_somename" }   -> parameter only used for allowlink function and will not be shown in link   //eg hattrickchallenge_friendly, first letters = ftfilter
 * for others use the 'paramfunction' eg natstats
 */

if (!Foxtrick) var Foxtrick={};

Foxtrick.LinkCollection = {};
Foxtrick.LinkCollection.stats = {};
Foxtrick.LinkCollection.htworld = {};


with (Foxtrick.LinkCollection) {

htworld[118]='www.ht-world.org/algerie';
htworld[128]='www.ht-world.org/aliraq';
htworld[127]='www.ht-world.org/alkuwayt';
htworld[77]='www.ht-world.org/almaghrib';
htworld[106]='www.ht-world.org/alurdun';
htworld[133]='www.ht-world.org/alyaman';
htworld[105]='www.ht-world.org/andorra';
htworld[130]='www.ht-world.org/angola';
htworld[7]='www.ht-world.org/argentina';
htworld[129]='www.ht-world.org/azerbaycan';
htworld[123]='www.ht-world.org/bahrain';
htworld[132]='www.ht-world.org/bangladesh';
htworld[124]='www.ht-world.org/barbados';
htworld[91]='www.ht-world.org/belarus';
htworld[44]='www.ht-world.org/belgie';
htworld[139]='www.ht-world.org/benin';
htworld[74]='www.ht-world.org/bolivia';
htworld[69]='www.ht-world.org/bosnaihercegovina';
htworld[16]='www.ht-world.org/brasil';
htworld[136]='www.ht-world.org/brunei';
htworld[62]='www.ht-world.org/bulgaria';
htworld[125]='www.ht-world.org/caboverde';
htworld[17]='www.ht-world.org/canada';
htworld[52]='www.ht-world.org/ceskarepublika';
htworld[18]='www.ht-world.org/chile';
htworld[34]='www.ht-world.org/china';
htworld[19]='www.ht-world.org/colombia';
htworld[81]='www.ht-world.org/costarica';
htworld[126]='www.ht-world.org/cotedivoire';
htworld[131]='www.ht-world.org/crnagora';
htworld[61]='www.ht-world.org/cymru';
htworld[89]='www.ht-world.org/cyprus';
htworld[11]='www.ht-world.org/danmark';
htworld[141]='www.ht-world.org/dawlatqatar';
htworld[144]='www.ht-world.org/dhivehiraajje';
htworld[73]='www.ht-world.org/ecuador';
htworld[56]='www.ht-world.org/eesti';
htworld[100]='www.ht-world.org/elsalvador';
htworld[2]='www.ht-world.org/england';
htworld[36]='www.ht-world.org/espana';
htworld[76]='www.ht-world.org/foroyar';
htworld[5]='www.ht-world.org/france';
htworld[137]='www.ht-world.org/ghana';
htworld[107]='www.ht-world.org/guatemala';
htworld[30]='www.ht-world.org/hanguk';
htworld[122]='www.ht-world.org/hayastan';
htworld[50]='www.ht-world.org/hellas';
htworld[99]='www.ht-world.org/honduras';
htworld[59]='www.ht-world.org/hongkong';
htworld[58]='www.ht-world.org/hrvatska';
htworld[20]='www.ht-world.org/india';
htworld[54]='www.ht-world.org/indonesia';
htworld[85]='www.ht-world.org/iran';
htworld[21]='www.ht-world.org/ireland';
htworld[38]='www.ht-world.org/island';
htworld[63]='www.ht-world.org/israel';
htworld[4]='www.ht-world.org/italia';
htworld[94]='www.ht-world.org/jamaica';
htworld[138]='www.ht-world.org/kampuchea';
htworld[112]='www.ht-world.org/kazakhstan';
htworld[95]='www.ht-world.org/kenya';
htworld[102]='www.ht-world.org/kyrgyzstan';
htworld[53]='www.ht-world.org/latvija';
htworld[84]='www.ht-world.org/letzebuerg';
htworld[117]='www.ht-world.org/liechtenstein';
htworld[66]='www.ht-world.org/lietuva';
htworld[120]='www.ht-world.org/lubnan';
htworld[51]='www.ht-world.org/magyarorszag';
htworld[97]='www.ht-world.org/makedonija';
htworld[45]='www.ht-world.org/malaysia';
htworld[101]='www.ht-world.org/malta';
htworld[6]='www.ht-world.org/mexico';
htworld[33]='www.ht-world.org/misr';
htworld[135]='www.ht-world.org/mocambique';
htworld[103]='www.ht-world.org/moldova';
htworld[119]='www.ht-world.org/mongoluls';
htworld[14]='www.ht-world.org/nederland';
htworld[111]='www.ht-world.org/nicaragua';
htworld[75]='www.ht-world.org/nigeria';
htworld[22]='www.ht-world.org/nippon';
htworld[9]='www.ht-world.org/norge';
htworld[93]='www.ht-world.org/northernireland';
htworld[15]='www.ht-world.org/oceania';
htworld[39]='www.ht-world.org/oesterreich';
htworld[134]='www.ht-world.org/oman';
htworld[71]='www.ht-world.org/pakistan';
htworld[96]='www.ht-world.org/panama';
htworld[72]='www.ht-world.org/paraguay';
htworld[23]='www.ht-world.org/peru';
htworld[55]='www.ht-world.org/philippines';
htworld[24]='www.ht-world.org/polska';
htworld[25]='www.ht-world.org/portugal';
htworld[31]='www.ht-world.org/prathetthai';
htworld[88]='www.ht-world.org/republicadominicana';
htworld[37]='www.ht-world.org/romania';
htworld[35]='www.ht-world.org/rossiya';
htworld[104]='www.ht-world.org/sakartvelo';
htworld[79]='www.ht-world.org/saudiarabia';
htworld[46]='www.ht-world.org/schweiz';
htworld[26]='www.ht-world.org/scotland';
htworld[121]='www.ht-world.org/senegal';
htworld[98]='www.ht-world.org/shqiperia';
htworld[47]='www.ht-world.org/singapore';
htworld[64]='www.ht-world.org/slovenija';
htworld[67]='www.ht-world.org/slovensko';
htworld[27]='www.ht-world.org/southafrica';
htworld[57]='www.ht-world.org/srbija';
htworld[12]='www.ht-world.org/suomi';
htworld[113]='www.ht-world.org/suriname';
htworld[140]='www.ht-world.org/suriyah';
htworld[1]='www.ht-world.org/sverige';
htworld[60]='www.ht-world.org/taiwan';
htworld[142]='www.ht-world.org/tanzania';
htworld[80]='www.ht-world.org/tounes';
htworld[110]='www.ht-world.org/trinidadandtobago';
htworld[32]='www.ht-world.org/turkiye';
htworld[143]='www.ht-world.org/uganda';
htworld[68]='www.ht-world.org/ukraina';
htworld[83]='www.ht-world.org/unitedarabemirates';
htworld[28]='www.ht-world.org/uruguay';
htworld[8]='www.ht-world.org/usa';
htworld[29]='www.ht-world.org/venezuela';
htworld[70]='www.ht-world.org/vietnam';
htworld[3]='www.ht-world.org/deutschland';

stats["htworld"] =  {
    "title" : "HT-World NT/U20 tracker",
    "img" : Foxtrick.InternalPath+"resources/linkicons/tracker.png",
    "url" : "",
    "urlfunction": function (filterparams) {
                             var countryid = filterparams["countryid"];
                             var nationality = filterparams["nationality"];
                             if (typeof(htworld[countryid]) == 'undefined') {
								if (typeof(htworld[nationality]) == 'undefined') return null;
								return "http://" + htworld[nationality];
								}
                             return "http://" + htworld[countryid];
                        },
  "trackernationalteamlink" : { "path"       : "/index.php?language=2",
                         "filters"    : [],
                         "params"     :  []
                       },
  "trackerplayerlink" : { "path"       : "/scouting.php?language=2",
                   "filters"    : [],
                   "params"     : []
                 },

};

// hattrick challenge
stats["hattrickchallenge_friendly"] =  {
        "url" : "http://www.hattrickchallenge.com/Tools/Entry.php",

        "challengeslink" : { "path"       : "?tool=friendly",
                         "filters"    : [],
                          "params"     : {"teamid":"teamid","ownteamid":"ftfilter_ownteamid"}
                       },

		"youthchallengeslink" : { "path"       : "?tool=youthfriendly",
                         "filters"    : [],
                          "params"     : {"youthteamid":"youthteamid","teamid":"teamid","ownteamid":"ftfilter_ownteamid"}
                       },

        "youthlink" : { "path"       : "?tool=youthfriendly",
                         "filters"    : [],
                         "params"     : {"youthteamid":"youthteamid","teamid":"teamid","ownteamid":"ftfilter_ownteamid"}
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

stats["alltid_add"] =  {
        "url" : "",
		"urlfunction": function (filterparams) {
                           return 'javascript:'+
									'var i=parseInt(localStorage.getItem("alltidcompare_index"));'+
									'if(!i)i=0;'+
									'var do_remove=false;'+
									'for(var j=0;j<i+1;++j) {if(parseInt(localStorage.getItem("alltidcompare_teamid"+j))=='+filterparams["teamid"]+'){do_remove=true;break;}}'+
									'if (do_remove) {'+
									'   localStorage.setItem("alltidcompare_teamid"+j,"0");'+
									'   localStorage.setItem("alltidcompare_teamname"+j,"");'+
									'}'+
									'else {'+
									'  localStorage.setItem("alltidcompare_teamid"+i, "'+filterparams["teamid"]+'");'+
									'  localStorage.setItem("alltidcompare_teamname"+i, "'+filterparams["teamname"]+'");'+
									'  i=i+1;'+
									'  localStorage.setItem("alltidcompare_index",i);'+
									'}'+
									'var teams="";'+
									'for(var j=0;j<i;++j) {if(localStorage.getItem("alltidcompare_teamid"+j)!=0) teams+=localStorage.getItem("alltidcompare_teamname"+j)+" --- ";}'+
									'alert("Selected teams: "+teams)';
						},
        "openinthesamewindow" : "true",
        "teamlink" : { "path"       : "",
                         "filters"    : { "teamid" : "teamid",  "teamname" : "teamname" },
                         "params"     : [],
                      },
		"img" : Foxtrick.InternalPath+"resources/linkicons/ahaddremove.png",
        "title" : "Alltid: add to or remove from compare list",
        "shorttitle":"Add/Remove"
};
stats["alltid_clear"] =  {
        "url" : "",
		"urlfunction": function (filterparams) {
							return 'javascript:'+
									'localStorage.setItem("alltidcompare_index",0);'+
									'alert("Cleared team compare list");';
						},
        "openinthesamewindow" : "true",
        "teamlink" : { "path"       : "",
                         "filters"    : [],
                         "params"     : []
                     },
        "img" : Foxtrick.InternalPath+"resources/linkicons/ahclear.png",
        "title" : "Alltid: clear compare list",
        "shorttitle":"Clear"
};
stats["alltid_compare"] =  {
        "url" : "",
		"urlfunction": function (filterparams) {
							return 'javascript:'+
									'var alltidcompare_index=parseInt(localStorage.getItem("alltidcompare_index"));'+
									'var teams="";'+
									'for(var i=0;i<alltidcompare_index;++i) if(localStorage.getItem("alltidcompare_teamid"+i)!=0) teams+=localStorage.getItem("alltidcompare_teamid"+i)+",";'+
									'location.href="http://alltid.org/teamcompare/"+teams;';
						},
        "teamlink" : { "path"       : "",
                         "filters"    : [],
                         "params"     : []
                       },
		"img" : Foxtrick.InternalPath+"resources/linkicons/ahcompare.png",
        "title" : "Alltid: compare teams",
        "shorttitle":"Compare"
};

stats["htstats_all"] =  {
        "url" : "http://www.htstats.com/",
        "playedmatchlink" : { "path"       : "",
                         "filters"    : [],
                         "paramfunction" : function(params) {
							var matchid=params["matchid"];
							var lang=FoxtrickPrefs.getString("htLanguage");
                            if (lang=='ca') lang='cat';
							else if (lang=='es') lang='es';
                            else lang='en';
                            return "matchinfo-" + matchid + "&setlang=" + lang;
							}
						 },
        "playedyouthmatchlink" : { "path"       : "",
							"filters"    : [],
							"paramfunction" : function(params) {
							var matchid=params["matchid"];
							var lang=FoxtrickPrefs.getString("htLanguage");
                            if (lang=='ca') lang='cat';
							else if (lang=='es') lang='es';
                            else lang='en';
                            return "matchinfoy-" + matchid + "&setlang=" + lang;
							}
						 },
        "title" : "htstats (played match)",
        "img" : Foxtrick.InternalPath+"resources/linkicons/htstats.png"
};

stats["htms_stats"] =  {
        "url" : "http://www.fantamondi.it/HTMS/index.php?page=predictor",
        "nextmatchlink" : { "path"       : "",
                         "filters"    : [],
                         "paramfunction" : function(params) {
							var lang=FoxtrickPrefs.getString("htLanguage");
                            if (lang!='it') lang='en';
                            return "&lang=" + lang;
							}
						 },
        "title" : "htms predictor",
        "img" : Foxtrick.InternalPath+"resources/linkicons/htms.png"
};

// HC Stats - Hellas, Cyprus
stats["hcstatshellas"] =  {
        "url" : "http://www.hattrick.gr/",  //"http://www.hattrick.gr/~hcstats/", stats page not working atm

        "leaguelink" : { "path"       : "", 			//"content/db/series.php?lang=gr",
                         "filters"    : ["countryid"],
                         "params"     : {
                                        "leaguename" : "name",
                                        "countryid" : "country"
                                        },
                        "paramfunction" : function(params) {

                            if (params["levelnum"] == 1) {
                             return "&country=" + params["countryid"] + "&level=1";
                            } else {
                             return "&country=" + params["countryid"] + "&name=" + params["leaguename"];
                            }

                        }
                       },

        "teamlink" : {   "path"       : "", //"content/db/team.php?lang=gr",
                         "filters"    : ["countryid"],
                         "params"     : { "teamid" : "teamId", "countryid" : "country" }
                       },
        "countrylink" : {   "path"       : "",
                         "filters"    : ["countryid"],
                         "params"     : []
                       },
        "countryidranges" : [[50, 50], [89, 89]],
        "title" : "HC Stats",
        "img" : Foxtrick.InternalPath+"resources/linkicons/hcstats_hellas.png"
};

//NrgJack Wage Reduction Calculator
stats["Wage_Reduction_Calculator"] =  {
        "url" : "http://www.nrgjack.altervista.org/",

        "playerlink" : { "path"       : "wagereduction.php",
                         "filters"    : ["age"],
                        /*"params"     :  {"age" : "age",
										 "wage" : "wage",
										 "wagebonus" : "wagebonus"
										}*/
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

stats["hattrick-youthclub"] =  {
        "url" : "http://www.",
        "urlfunction": function (filterparams) {
                             var server = filterparams["server"];
                             return "http://" +server + ".hattrick-youthclub.org/";
                        },
		"youthlink" : { "path"       : "",
                         "filters"    : [],
                         "params"     : {"teamid":"ftfilter_teamid","ownteamid":"ftfilter_ownteamid"}
                       },
        "youthplayerlistlink" : { "path"       : "site/players",
                         "filters"    : [],
                         "params"     : {"teamid":"ftfilter_teamid","ownteamid":"ftfilter_ownteamid"}
                       },
       "youthplayerdetaillink" : { "path"       : "redirect/type/player_details/ht_id/",
                         "filters"    : [],
                         "params"     : {"playerid" : "", "teamid":"ftfilter_teamid","ownteamid":"ftfilter_ownteamid"}
                       },
        "youthmatchlistlink" : { "path"       : "site/matches",
                         "filters"    : [],
                         "params"     : {"teamid":"ftfilter_teamid","ownteamid":"ftfilter_ownteamid"}
                       },
        "youthtraininglink" : { "path"       : "",
                         "filters"    : [],
                         "params"     : {"teamid":"ftfilter_teamid","ownteamid":"ftfilter_ownteamid"}
                       },
        "playedyouthmatchlink" : { "path"       : "redirect/type/lineup/ht_id/",
                         "filters"    : [],
                         "params"     : {"matchid" : "", "teamid":"ftfilter_teamid", "teamid2":"ftfilter_teamid2", "ownteamid":"ftfilter_ownteamid"}
                       },

		"allowlink" : function(filterparams, stattype) {
			//Foxtrick.dump(filterparams["ownyouthteamid"]+' '+filterparams["teamid"]+' '+filterparams["teamid"]+'\n')
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

stats["nrg_deffor"] =  {
        "url" : "http://nrgjack.altervista.org/",
		"playerlink" : { "path"       : "trequartista.php",
                         "filters"    : [],
                         "params"     : { "playmaking" : "pm", "passing" : "pa",
                                          "winger" : "wi", "defending" : "df",
                                          "scoring" : "sc", "goalkeeping" : "gk" }
                          },
        "allowlink" : function(filterparams, stattype) {
			if (parseInt(filterparams["passing"])+ parseInt(filterparams["scoring"])+ parseInt(filterparams["playmaking"]) >
				2*(parseInt(filterparams["winger"]) + parseInt(filterparams["defending"]) + parseInt(filterparams["goalkeeping"])))
			/*var pa=filterparams["passing"];
            var sc=filterparams["scoring"];
            if ((pa >= filterparams["playmaking"] && pa > filterparams["winger"]
				&& pa > filterparams["defending"] && pa > filterparams["goalkeeping"])
			|| (sc >= filterparams["playmaking"] && sc > filterparams["winger"]
				&& sc > filterparams["defending"] && sc > filterparams["goalkeeping"]))*/ {
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
stats["tppc"] =  {
        "url" : "http://www.adrianomoutinho.com/hattrick/index.php",

        "leaguelink" : { "path"       : "",
                         "filters"    : [],
                         "params"     : { "leagueid" : "leagueid" },
						 "paramfunction" : function(params) {
							return '?LeagueId'+params["leagueid"]+'&Language='+FoxtrickPrefs.getString("htLanguage");
						}
                       },

        "title" : "Team Position Probability Calculator",
        "img" : Foxtrick.InternalPath+"resources/linkicons/tppc.png"
};  */


/* 
"httoolsfriendlymanager" : {
        "url" : "http:

        "challengeslink" : { "path"       : "",
                         "filters"    : [],
                         "params"     : []
                       },

        "title" : "HTTools Friendly Manager",
        "img" : Foxtrick.InternalPath+"resources/linkicons/httools_friendly.png"
},  */


/*   
"hat_com_coolness" : {
	"url" : "http:

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
	"img" : Foxtrick.InternalPath+"resources/linkicons/hat-com.png"
}, */


/* 
"Training_Team_Evaluation" : {
        "url" : "http:

        "playerlink" : { "path"       : "playertraining.php?PlayerId=",
                         "filters"    : [],
                        "params"     :  {"playerid" : "" }
                        },

		"traininglink" : { "path"       : "playertraining.php",
                         "filters"    : [],
                         "params"     : []
						},
        "title" : "Training Team Evaluation",
        "img" : Foxtrick.InternalPath+"resources/linkicons/training_evaluation.png"
}, */

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





Foxtrick.LinkCollection.getLinks2  = function(stats, stattype, filterparams, doc, overridesettings, module) {
    var links = [];
    var counter = 0;

    for (var key in stats) {

        if (!FoxtrickPrefs.isModuleOptionEnabled(module.MODULE_NAME, key)  &&
			!overridesettings) {
			 continue;
        }
        var stat = stats[key];
        var statlink = stat[stattype];
        var filters = statlink["filters"];

        var allowed = true;

        if (filters.length == 0 && (typeof(stat["allowlink"]) == 'undefined')) {
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


Foxtrick.LinkCollection.getLinks  = function(stattype, filterparams, doc, module) {
	try {
		filterparams.server = doc.location.hostname;
		return Foxtrick.LinkCollection.getLinks2(Foxtrick.StatsHash[stattype], stattype, filterparams, doc, false, module);
	} catch (e) { Foxtrick.log('getLinks: ',e) };
};


Foxtrick.LinkCollection.makelink  = function(stat, statlink, filterparams, key, doc) {

	var params = statlink["params"];
	var args = "";

	if (typeof (statlink["paramfunction"]) == 'undefined') {
		for (var paramkey in params) {
		if (params[paramkey].search('ftfilter')==0) continue;
			var temp;

			if ((args == "") && statlink["path"].search(/\?/) == -1 && stat["url"].search(/\?/) == -1) {
				temp = "?";
			 } else {
				temp = "&";
			 }

			 if (!params[paramkey].charAt(0).match(/\w+/)) {temp="";}
			 //dump(params[paramkey].charAt(0)+' '+ (!params[paramkey].charAt(0).match(/\w+/))+' '+temp+' '+filterparams[paramkey]+'\n');
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


Foxtrick.LinkCollection.getLinkElement  = function(link, stat, doc, key, module_name) {

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
