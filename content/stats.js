/**
 * stats.js
 * Foxtrick links collection
 * @author other,convinced
 */

/*
 * "params"     : { "infocode" : "text" }   -> ?text=info[infocode]
 * "params"     : { "infocode" : "" }   -> info[infocode]  // eg alltid
 * "params"     : { "" : "#text" }   -> #text   			//eg maptrick , first letter non alphanumeric
 * "params"     : { "infocode" : "," }   -> ,info[infocode]   //eg alltid, first letter non alphanumeric
 * for others use the 'paramfunction' eg natstats
 */
  
var vnukstatsranges = {};

vnukstatsranges["czech"] = [[93617,93784], [115871,116382], [480223, 482270]];
vnukstatsranges["slovakia"] = [[241335,241502]];

var hscountries = {};
var hslevels = {};

hscountries["98"]="Albania";
hscountries["118"]="Algeria";
hscountries["105"]="Andorra";
hscountries["130"]="Angola";
hscountries["7"]="Argentina";
hscountries["122"]="Armenia";
hscountries["39"]="Austria";
hscountries["129"]="Azerbaijan";
hscountries["123"]="Bahrain";
hscountries["132"]="Bangladesh";
hscountries["124"]="Barbados";
hscountries["91"]="Belarus";
hscountries["44"]="Belgium";
hscountries["139"]="Benin";
hscountries["74"]="Bolivia";
hscountries["69"]="Bosnia";
hscountries["16"]="Brazil";
hscountries["136"]="Brunei";
hscountries["62"]="Bulgaria";
hscountries["138"]="Cambodia";
hscountries["17"]="Canada";
hscountries["125"]="CapeVerde";
hscountries["18"]="Chile";
hscountries["60"]="taiwan";
hscountries["19"]="Colombia";
hscountries["81"]="CostaRica";
hscountries["126"]="CotedIvoire";
hscountries["58"]="Croatia";
hscountries["89"]="Cyprus";
hscountries["52"]="Czech";
hscountries["11"]="Danmark";
hscountries["88"]="Dominican";
hscountries["73"]="Ecuador";
hscountries["33"]="Misr";
hscountries["100"]="ElSalvador";
hscountries["2"]="England";
hscountries["56"]="Estonia";
hscountries["76"]="Faroe";
hscountries["12"]="Finland";
hscountries["5"]="France";
hscountries["97"]="FYR";
hscountries["104"]="Georgia";
hscountries["3"]="Germany";
hscountries["137"]="Ghana";
hscountries["50"]="Hellas";
hscountries["107"]="Guatemala";
hscountries["99"]="Honduras";
hscountries["59"]="HongKong";
hscountries["51"]="Hungary";
hscountries["38"]="Ísland";
hscountries["20"]="India";
hscountries["54"]="Indonesia";
hscountries["85"]="Iran";
hscountries["128"]="Iraq";
hscountries["21"]="Ireland";
hscountries["63"]="Israel";
hscountries["4"]="Italy";
hscountries["94"]="Jamaica";
hscountries["22"]="Japan";
hscountries["106"]="Jordan";
hscountries["112"]="Kazakhstan";
hscountries["95"]="Kenya";
hscountries["127"]="Kuwait";
hscountries["102"]="Kyrgyzstan";
hscountries["53"]="Latvia";
hscountries["120"]="Lebanon";
hscountries["117"]="Liechtenstein";
hscountries["66"]="Lithuania";
hscountries["84"]="Luxembourg";
hscountries["45"]="Malaysia";
hscountries["144"]="Maldives";
hscountries["101"]="Malta";
hscountries["6"]="Mexico";
hscountries["103"]="Moldova";
hscountries["119"]="Mongolia";
hscountries["131"]="Montenegro";
hscountries["77"]="Morocco";
hscountries["135"]="Mozambique";
hscountries["14"]="Netherlands";
hscountries["111"]="Nicaragua";
hscountries["75"]="Nigeria";
hscountries["93"]="NIreland";
hscountries["9"]="Norway";
hscountries["15"]="Oceania";
hscountries["134"]="Oman";
hscountries["71"]="Pakistan";
hscountries["96"]="Panama";
hscountries["72"]="Paraguay";
hscountries["34"]="China";
hscountries["23"]="Peru";
hscountries["55"]="Philippines";
hscountries["24"]="Poland";
hscountries["25"]="Portugal";
hscountries["141"]="Qatar";
hscountries["37"]="Romania";
hscountries["35"]="Russia";
hscountries["79"]="SaudiArabia";
hscountries["26"]="Scotland";
hscountries["121"]="Senegal";
hscountries["57"]="Serbia";
hscountries["47"]="Singapore";
hscountries["67"]="Slovakia";
hscountries["64"]="Slovenia";
hscountries["27"]="SouthAfrica";
hscountries["30"]="SouthKorea";
hscountries["36"]="Spain";
hscountries["113"]="Suriname";
hscountries["1"]="Sverige";
hscountries["46"]="Switzerland";
hscountries["140"]="Syria";
hscountries["142"]="Tanzania";
hscountries["31"]="Thailand";
hscountries["110"]="Trinidad";
hscountries["80"]="tunisiyah";
hscountries["32"]="Turkey";
hscountries["143"]="Uganda";
hscountries["68"]="Ukraine";
hscountries["83"]="uae";
hscountries["28"]="Uruguay";
hscountries["8"]="USA";
hscountries["29"]="Venezuela";
hscountries["70"]="Vietnam";
hscountries["61"]="Wales";
hscountries["133"]="Yemen";


// dunno check realy whats for. it's certainly out of date
hslevels["99"]= 	 2;
hslevels["102"]= 	 2;
hslevels["98"]= 	 3;
hslevels["100"]= 	 3;
hslevels["105"]= 	 3;
hslevels["107"]= 	 3;
hslevels["117"]= 	 3;
hslevels["131"]= 	 3;
hslevels["103"]= 	 4;
hslevels["15"]= 	 5;
hslevels["17"]= 	 5;
hslevels["26"]= 	 5;
hslevels["29"]= 	 5;
hslevels["50"]= 	 5;
hslevels["57"]= 	 5;
hslevels["62"]= 	 5;
hslevels["63"]= 	 5;
hslevels["64"]= 	 5;
hslevels["69"]= 	 5;
hslevels["2"]= 	 6;
hslevels["7"]= 	 6;
hslevels["8"]= 	 6;
hslevels["44"]= 	 6;
hslevels["16"]= 	 7;
hslevels["18"]= 	 7;
hslevels["11"]= 	 8;
hslevels["25"]= 	 9;



var stats = {};

//HT Newsfeeds

stats["xray_newsfeed"] =  { 
       "url" : "http://www.databased.at/hattrick/",  
       "newslink" : { "path" : "rss/",
                      "filters"    : []
        },
       "title" : "HT Newsfeeds",
       "img" : "chrome://foxtrick/content/resources/linkicons/htrss2.gif"
  
}

// hattriX-Ray Crossover
stats["xray_crossover"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/",  
        "playerlink" : { "path"       : "?starter=crossover",
                         "filters"    : [], 
                         "params"     : { "playerid" : "pid" }
                       },
        
        "title" : "hattriX-Ray Crossover",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_crossover.png"
};    


// hattriX-Ray Backdraft
stats["xray_backdraft"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",  
        "teamlink" : { "path"       : "?starter=backdraft",
                         "filters"    : [], 
                         "params"     : { "teamid" : "teamid" }
                       },
        
        "title" : "hattriX-Ray Backdraft",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_backdraft.png"
};    

// hattriX-Ray ClubRay
stats["xray_clubray"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",

        "teamlink" : { "path"       : "?starter=clubray",
                         "filters"    : [], 
                         "params"     : { "teamid" : "teamid" }
                       },
        
        "title" : "hattriX-Ray clubray",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_clubray.png"
};    


// hattriX-Ray Friendlier

stats["xray_friendlier"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",

        "challengeslink" : { "path"       : "?starter=friendlier",
                         "filters"    : [], 
                         "params"     : {  }
                       },
        
        "title" : "hattriX-Ray Friendlier",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_friendlier.png"
};    



// hattriX-Ray Rounds 2 go
stats["xray_roundstogo"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",

        "leaguelink" : { "path"       : "?starter=rounds2Go",
                         "filters"    : [], 
                         "params"     : { "leagueid" : "divID" }
                       },
        
        "title" : "hattriX-Ray rounds to go",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_rounds2go.png"
};    

// hattriX-Ray roundrate
stats["xray_roundrate"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",

        "leaguelink" : { "path"       : "?starter=roundrate",
                         "filters"    : [], 
                         "params"     : { "leagueid" : "divID" }
                       },
        
        "title" : "hattriX-Ray roundRate",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_roundrate.png"
};    


// hattriX-Ray leaguemates
stats["xray_leaguemates"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",

        "leaguelink" : { "path"       : "?starter=leaguemates",
                         "filters"    : [], 
                         "params"     : { "leagueid" : "divID" }
                       },
        
        "title" : "hattriX-Ray leaguemates",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_leaguemates.png"
};    


// hattriX-Ray sunray
stats["xray_sunray"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",

        "nextmatchlink" : { "path"       : "?starter=sunray",
                         "filters"    : [], 
                         "params"     : { "teamid" : "teamid" }
                       },
        
        "title" : "hattriX-Ray sunray",
        //"post" : "true",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_sunray.png"
};


// hattriX-Ray live!
stats["xray_live"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",

        "matchlink" : { "path"       : "?starter=live",
                         "filters"    : [], 
                         "params"     : { "matchid" : "matchid" }
                       },
        
        "title" : "hattriX-Ray live!",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_live.png"
};


// hattriX-Ray live! review
stats["xray_livereview"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",

        "playedmatchlink" : { "path"       : "?starter=livereview",
                         "filters"    : [], 
                         "params"     : { "matchid" : "matchid" }
                       },
        
        "title" : "hattriX-Ray live! (played matches)",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_live_review.png"
};

// hattriX-Ray head to head
stats["xray_h2h"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",

        "playedmatchlink" : { "path"       : "?starter=headtohead",
                         "filters"    : [], 
                         "params"     : { "matchid" : "matchid" }
                       },
        
        "title" : "hattriX-Ray head to head (played matches)",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_h2h.png"
};


// hattriX-Ray healing
stats["xray_healing"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",

        "playerhealinglink" : { "path"       : "?starter=healing",
                         "filters"    : [], 
                         "params"     : { "age" : "v1", "injuredweeks" : "v2", "playerid" : "pid"  }
                       },
        
        "title" : "hattriX-Ray healing",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_healing_s.png"
};

// hattriX-Ray healing TSI
stats["xray_healingtsi"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",

        "playerhealinglink" : { "path"       : "?starter=healingTSI",
                         "filters"    : [], 
                         "params"     : { "age" : "v1", "injuredweeks" : "v2", "tsi" : "v3", "playerid" : "pid"  }
                       },
        
        "title" : "hattriX-Ray healing TSI",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_healingtsi_s.png"
};

// hattriX-Ray youngster
stats["xray_youngster"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp?starter=youngster",

        "youthpulllink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : {  }
                       },
        
        "title" : "hattriX-Ray youngster",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_youngster.png"
};


// hattriX-Ray youngster
stats["xray_econray"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",

        "economylink" : { "path"       : "?starter=econray",
                         "filters"    : [], 
                         "params"     : {  }
                       },
        
        "title" : "hattriX-Ray econray",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_econray.png"
};

stats["xray_keeper"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",

        "keeperlink" : { "path"       : "?starter=keepersup",
                         "filters"    : [], 
                         "params"     : { "tsi" : "tsi", "form": "form", "playerid" : "pid", "goalkeeping" : "v1"}
                       },
        
        "title" : "hattriX-Ray keepers-up",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_keepersup_s.png"
};


stats["xray_coach"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/pages/coach.asp",

        "coachlink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : {  }
                       },
        
        "title" : "hattriX-Ray Coach",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_coach.png"
};


// hattriX-Ray HTPE
stats["HTPE"] =  { 
        "url" : "http://www.databased.at/hattrick/htpe/",

        "transfercomparelink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : { "playerid" : "pid", "teamid" : "tid",
                                          "tsi" : "tsi", "age" : "age", "form" : "form", "exp" : "exp",
                                          "stamina" : "st", "goalkeeping" : "gk", "playmaking" : "pm",
                                          "passing" : "pa", "winger" : "wi", "defending" : "de",
                                          "scoring" : "sc", "setpieces" : "sp"
                          }
                       },
        
        "title" : "hattriX-Ray HTPE",
        "img" : "chrome://foxtrick/content/resources/linkicons/htpe.png"
};    

// Hattrick Hall of Fame
stats["halloffame_match"] =  { 
        "url" : "http://www.databased.at/hattrick/halloffame/",
        "playedmatchlink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : { "matchid" : "matchid" }
                       },
        "title" : "Hattrick Hall of Fame (match)",
        "img" : "chrome://foxtrick/content/resources/linkicons/hhof.png"
};    

stats["halloffame_team"] =  { 
        "url" : "http://www.databased.at/hattrick/halloffame/",
        "teamlink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : { "teamid" : "teamid" }
                       },
        "title" : "Hattrick Hall of Fame (team)",
        "img" : "chrome://foxtrick/content/resources/linkicons/hhof.png"
};    

stats["halloffame_player"] =  { 
        "url" : "http://www.databased.at/hattrick/halloffame/",
        "playerlink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : { "playerid" : "pid" }
                       },
        "title" : "Hattrick Hall of Fame (player)",
        "img" : "chrome://foxtrick/content/resources/linkicons/hhof.png"
};    

// hattriX-Ray arenasizer
stats["xray_arenasizer"] =  { 
        "url" : "http://www.databased.at/hattrick/x-ray/index.asp",
        "arenalink" : { "path"       : "?starter=arenasizer",
                         "filters"    : [], 
                         "params"     : { "terraces" : "v1", "basic": "v2", "roof" : "v3", "vip" : "v4"}
                       },
        
        "title" : "hattriX-Ray arenasizer",
        "img" : "chrome://foxtrick/content/resources/linkicons/xray_arenasizer.png"
};

/* // down
// Vnukstats
stats["vnukstats"] =  { 
        "url" : "http://vnukstats.no-ip.com/",

        "leaguelink" : { "path"       : "?page=nejtymy",
                         "filters"    : ["countryid"], 
                         "params"     : { "seriesnum" : "filtr4", "levelnum" : "filtr3" }
                       },

        "playerlink" : { "path"       : "?page=showplayer",
                         "filters"    : ["teamid"], 
                         "params"     : { "playerid" : "plid" }
                       },

        "teamlink" : { "path"       : "?page=showclubmatches",
                         "filters"    : ["levelnum", "countryid"], 
                         "params"     : { "teamid" : "clid" }
                       },

        "countryidranges" : [[52, 52]],  // CZ+SK
        "levelnumranges" : [[1, 6]], 
        "teamidranges" : vnukstatsranges["czech"],
        "title" : "Vnukstats",
        "img" : "chrome://foxtrick/content/resources/linkicons/vnukstats.png"
};*/    

/*  // down
// Vnukstats Slovensko
stats["vnukstats_sk"] =  { 
        "url" : "http://vnukstats.hattrick-sk.com/",

        "leaguelink" : { "path"       : "?page=nejtymy",
                         "filters"    : ["countryid"], 
                         "params"     : { "seriesnum" : "filtr4", "levelnum" : "filtr3" }
                       },

        "playerlink" : { "path"       : "?page=showplayer",
                         "filters"    : ["teamid"], 
                         "params"     : { "playerid" : "plid" }
                       },

        "teamlink" : { "path"       : "?page=showclubmatches",
                         "filters"    : ["levelnum", "countryid"], 
                         "params"     : { "teamid" : "clid" }
                       },

        "countryidranges" : [[67, 67]],  // SK
        "levelnumranges" : [[1, 6]], 
        "teamidranges" : vnukstatsranges["slovakia"],
        "title" : "Vnukstats Slovensko",
        "img" : "chrome://foxtrick/content/resources/linkicons/vnukstats.png"
};    
*/

// Statristix, Belgium
/*  // down
stats["statristix"] =  { 
        "url" : "http://statristix.be/",

        "leaguelink" : { "path"       : "?n=seriedata",
                         "filters"    : ["countryid"], 
                         "params"     : {
                                        "leagueid" : "SerieID",
                                        "countryid" : "CountryID",
                                        "levelnum" : "Level"
                                        }
                       },
        
        "countryidranges" : [[44, 44]], 
        "title" : "Statristix",
        "img" : "chrome://foxtrick/content/resources/linkicons/statristix.png"        
};    
*/

/*// down
// BelRank
stats["belstat"] =  { 
        "url" : "http://belrank.be/",
        "leaguelink" : { "path"       : "serieDetails.php",
                         "filters"    : ["countryid"], 
                         "params"     : { "leagueid" : "serieID" }
                       },
                       
        "teamlink" : { "path"       : "teamdetails.php",
                         "filters"    : ["countryid"], 
                         "params"     : { "teamid" : "teamID" }
                       },
        
        "countryidranges" : [[44, 44]], 
        "title" : "BelRank",
        "img" : "chrome://foxtrick/content/resources/linkicons/belrank.png"

};*/


// Alltid Hattrick Statistikk, International
// Thomas Johnsenn

stats["alltid"] =  { 
    
        "url" : "http://alltid.org/",

        "leaguelink" : { "path"       : "league/",
                         "filters"    : [], 
                         "params"     : { "leagueid" : "" }
                       },

        "teamlink" : { "path"       : "team/",
                         "filters"    : [], 
                         "params"     : { "teamid" : "" }
                       },

        "playerlink" : { "path"       : "player/",
                         "filters"    : [], 
                         "params"     : { "playerid" : "" }
                       },

        "countrylink" : { "path"       : "countrylid/",
                         "filters"    : [], 
                         "params"     : { "countryid" : "" }
                       },

        "federationlink" : { "path"       : "federation/",
                         "filters"    : [], 
                         "params"     : { "federationid" : "" }
                       },
		"playedmatchlink" : { "path"       : "match/",
                         "filters"    : [], 
                         "params"     : { "matchid" : "","match":"" }
                       },
        "matchlink" : { "path"       : "teamcompare/",
                         "filters"    : [], 
                         "params"     : { "teamid" : "","teamid2":"," }
                       },
        
        
        "title" : "Alltid Hattrick Statistics International",
        "img" : "chrome://foxtrick/content/resources/linkicons/ahstats.png"
};    



// HT-Deutschland
stats["ht_deutschland"] =  { 
  "url" : "http://www.ht-deutschland.de/",
  
  "leaguelink" : { "path"       : "liga.php",
                   "filters"    : ["countryid"], 
                   "params"     : { "leaguename" : "leagueLevelUnitName",
                                    "levelnum" : "leagueLevel"
                                  }
                 },
  
  "teamlink" : { "path"       : "teamview.php",
                   "filters"    : ["countryid"], 
                   "params"     : { "teamid" : "teamID" }
                 },
 
 "countrylink" : { "path"       : "overview.php",
                   "filters"    : ["countryid"], 
                   "params"     : []
				}, 
  "countryidranges" : [[3, 3]], 
  "title" : "HT-Deutschland",
  "img" : "chrome://foxtrick/content/resources/linkicons/ht-deutschland.png"
};    


// peasohtstats
stats["htstats"] =  { 
        "url" : "http://htstats.com/",

        "leaguelink" : { "path"       : "liga.php",
                         "filters"    : ["countryid"], 
                         "params"     : { "leagueid" : "htliga"
                                        }
                       },

        "teamlink" : { "path"       : "equipo.php",
                         "filters"    : ["countryid"], 
                         "params"     : { "teamid" : "htequipo" }
                       },
       "countrylink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },

        "countryidranges" : [[36, 36]], 
        
        "title" : "Peaso Hattrick Stats",
        "img" : "chrome://foxtrick/content/resources/linkicons/htstats.png"
};    

stats["htstats_all"] =  { 
        "url" : "http://www.htstats.com/",
        "playedmatchlink" : { "path"       : "matchinfo",
                         "filters"    : [], 
                         "params"     : { "matchid" : "-" }
                       },
        "playedyouthmatchlink" : { "path"       : "matchinfoy",
                         "filters"    : [], 
                         "params"     : { "matchid" : "-" }
                       },
        "title" : "htstats (played match)",
        "img" : "chrome://foxtrick/content/resources/linkicons/htstats.png"        
};
// todohattrick
stats["todohattrick"] =  { 
        "url" : "http://www.stepi.org/todohattrick/",

        "leaguelink" : { "path"       : "grupo.asp",
                         "filters"    : ["countryid"], 
                         "params"     : { "leagueid" : "grupoID"
                                        }
                       },

        "teamlink" : { "path"       : "equipo.asp",
                         "filters"    : ["countryid"], 
                         "params"     : { "teamid" : "equipoID" }
                       },

        "countryidranges" : [[36, 36]], 
        "title" : "TodoHattrick",
        "img" : "chrome://foxtrick/content/resources/linkicons/todohattrick.png"
};    

/*  // down
// Eesti Hattricki statistika
stats["eesti"] =  { 
        "url" : "http://hattrick.luanvi.ee/",

        "leaguelink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     : { "leaguename" : "div"
                                        }
                       },

        "teamlink" : { "path"       : "team-info.php",
                         "filters"    : ["countryid"], 
                         "params"     : { "teamid" : "teamID" }
                       },


        "countryidranges" : [[56, 56]], 
        "title" : "Eesti Hattricki statistika",
        "img" : "chrome://foxtrick/content/resources/linkicons/eesti.gif"
};    
*/
   


// La Gazzetta di HT

stats["lagazzetta"] =  { 
        "url" : "http://www.gazzaht.org/",

        "teamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     : []
                       },
		"leaguelink" : { "path"       : "index.php?pag=13",
                         "filters"    : ["countryid"], 
                         "params"     : { "leagueid" : "girone"
                                        }
                       },
		"countrylink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []                                        
                       },

        
        "countryidranges" : [[4, 4]], 
        "title" : "La Gazzetta di Hattrick",
        "img" : "chrome://foxtrick/content/resources/linkicons/lagazzetta.jpg"
};    
/* // down
stats["playitcool"] =  { 
        "url" : "http://www.playitcool.it/",

        "leaguelink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     : []
                       },
        "countryidranges" : [[4, 4]], 
        "title" : "Play It Cool",
        //"img" : "chrome://foxtrick/content/resources/linkicons/lagazzetta.jpg",
        "shorttitle" : "Play It Cool"
};    
*/




// ht-tools 
stats["ekonomer"] =  { 
        "url" : "http://ht-tools.sytes.net/ekonomer/ekonomer.asp",

        "economylink" : { "path"       : "",
                         "filters"    : ["owncountryid"], 
                         "params"     : {"Cash" : "resultat","kassa":"kassa"} 
                       },
		"owncountryidranges" : [[1, 1]], 
        "title" : "Ekonomkalkylatorn",   
        "img" : "chrome://foxtrick/content/resources/linkicons/httools_economy.png"
};



stats["francestats"] =  { 
        "url" : "http://www.francestats-ht.com/",

        "leaguelink" : { "path"       : "show_league.php",
                         "filters"    : ["countryid"], 
                         "params"     : { "leagueid" : "league"}
                       },

        "teamlink" : {   "path"       : "show_team.php",
                         "filters"    : ["countryid"],         
                         "params"     : { "teamid" : "teamid" }
                       },
       "countrylink" : { "path"       : "",
                         "filters"    : ["countryid"],         
                         "params"     : []
                       },

	    "countryidranges" : [[5, 5]],
        "title" : "FranceStats",
        "img" : "chrome://foxtrick/content/resources/linkicons/francestats.png"        
};  


/*
// htpl  // down
stats["htpl"] =  { 
        "url" : "http://student.owsiiz.edu.pl/~wo4020/ht/index.php",

        "leaguelink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     : { "leaguename" : "series"}
                       },

        "teamlink" : {   "path"       : "",
                         "filters"    : ["countryid"],         
                         "params"     : { "teamid" : "team" }
                       },

	    "countryidranges" : [[24, 24]],
        "title" : "Statystyki polskiego Hattricka by marnow",
        "img" : "chrome://foxtrick/content/resources/linkicons/htpl.gif"        
};  
*/


// not working properly. need some input from argentina there
/*stats["argentinaranking"] =  { 
        "url" : "http://www.htranking.com/",

        "leaguelink" : { "path"       : "ligas.asp",
                         "filters"    : ["countryid"], 
                         "params"     : { "leagueid" : "liga"}
                       },

        "teamlink" : {   "path"       : "equipos.asp",
                         "filters"    : ["countryid"],         
                         "params"     : { "teamid" : "equipo" }
                       },

	    "countryidranges" : [[7, 7]],
        "title" : "Hattrick Argentina Ranking",
        "img" : "chrome://foxtrick/content/resources/linkicons/argentinaranking.gif" 
}; */ 

// Hattrick Chile
stats["estadisticas.hattrick.cl"] =  { 
        "url" : "http://estadisticas.hattrick.cl/",

        "leaguelink" : { "path"       : "leagues/view/",
                         "filters"    : ["countryid"], 
                         "params"     : { "leagueid" : "" }
                       },

        "teamlink" : {   "path"       : "teams/view/",
                         "filters"    : ["countryid"], 
                         "params"     : { "teamid" : "" }
                       },
        
        "countryidranges" : [[18, 18]], 
        "title" : "Estadisticas Chile",
        "img" : "chrome://foxtrick/content/resources/linkicons/hattrick_cl.png"        
};


stats["hattrick.cl"] = { 
  "url" : "http://www.hattrick.cl/",
  "img" : "chrome://foxtrick/content/resources/linkicons/hattrick_cl.png",
  "title" : "hattrick.cl",
  
        "countrylink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
        
        "countryidranges" : [[18, 18]] 
};
    
/*  // down
// Estatisticas HT-Brasil
stats["htbrasil"] =  { 
        "url" : "http://www.htbrstats.com/",

        "teamlink" : {   "path"       : "modules.php?name=Gtrends",
                         "filters"    : ["countryid"], 
                         "params"     : { "teamid" : "teamID"}
                       },
        
        "countryidranges" : [[16, 16]], 
        "title" : "Estatisticas HT-Brasil",
        "img" : "chrome://foxtrick/content/resources/linkicons/htbrazil.gif"
}; */   

// HT-Stats Schweiz
stats["swissstats"] =  { 
        "url" : "http://www.ht-schweiz.ch/cgi-bin/",

        "leaguelink" : { "path"       : "index.cgi?action=stat&type=1&rate=6",
                         "filters"    : ["countryid"], 
                         "params"     : { "leaguename" : "l_name" }
                       },

        "teamlink" : {   "path"       : "index.cgi?action=stat&type=1&rate=5",
                         "filters"    : ["countryid"], 
                         "params"     : { "teamid" : "t_id" }
                       },
        "countrylink" : {   "path"       : "news.cgi",
                         "filters"    : ["countryid"], 
                         "params"     : []
                       },
        "countryidranges" : [[46, 46]], 
        "title" : "HT-Stats Schweiz",
        "img" : "chrome://foxtrick/content/resources/linkicons/statsschweiz.png"
};    

// Hattristics
stats["hattristics"] =  { 
        "url" : "http://www.hattristics.org/",

        "leaguelink" : { "path"       : "pub/viewLeague.php",
                         "filters"    : ["levelnum","countryid"], 
                         "params"     : { "leaguename" : "leagueName" }
                       },

        "teamlink" : {   "path"       : "pub/viewTeam.php",
                         "filters"    : ["countryid"], 
                         "params"     : { "teamid" : "teamID" }
                       },
        "teamlink" : {   "path"       : "index.php",
                         "filters"    : ["countryid"], 
                         "params"     : []
                       },
        "countryidranges" : [[46, 46]], 
		"levelnumranges" : [[1, 5]],
        "title" : "Hattristics",
        "img" : "chrome://foxtrick/content/resources/linkicons/hattrist.png"
};    

/*  // down
// Stats Engine Romania
stats["statsromania"] =  { 
        "url" : "http://www.fubar.ro/stats/",

        "leaguelink" : { "path"       : "sstats.php?do=series",
                         "filters"    : ["countryid"], 
                         "params"     : { "leagueid" : "id" }
                       },
        
        "countryidranges" : [[37, 37]], 
        "title" : "Stats Engine Romania",
        "img" : "/Common/images/37flag.gif"
}; */   

// akickku USA
stats["akickku"] =  { 
        "url" : "http://www.akickku.com/",

        "leaguelink" : { "path"       : "series.php",
                         "filters"    : ["countryid"], 
                         "params"     : { "leaguename" : "seriesname" }
                       },

        "teamlink" : {   "path"       : "team.php",
                         "filters"    : ["countryid"], 
                         "params"     : { "teamid" : "id",
                                          "teamname" : "name"}
                       },
        "countrylink" : {   "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     : []
                       },
        "countryidranges" : [[8, 8]],
        "title" : "Akickku",
        "img" : "chrome://foxtrick/content/resources/linkicons/akickku.png"
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
        "img" : "chrome://foxtrick/content/resources/linkicons/hcstats_hellas.png"        
};    

/* // down
// HTTools Friendly Manager
stats["httoolsfriendlymanager"] =  { 
        "url" : "http://httoolsfriendlymanager.cretze.ro/",

        "challengeslink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : []
                       },
        
        "title" : "HTTools Friendly Manager",
        "img" : "chrome://foxtrick/content/resources/linkicons/httools_friendly.png"
};  */  

 // Maptrick

stats["maptrick_coolness"] =  { 
        "url" : "http://www.maptrick.org/",
 
        "teamlink" : { "path"		: "coolness.php",
						"filters"	: [],
						"params"	: { "teamid" : "team" ,"":"#results"}
						},
         
        "title" : "Maptrick Coolness",
         "img" : "chrome://foxtrick/content/resources/linkicons/maptrick_cool.png"
};

stats["maptrick_hoc"] =  { 
        "url" : "http://www.maptrick.org/",

        "countrylink" : { "path"	: "hallofcool.php",
						"filters"	: [],
						"params"	: { "countryid" : "country" }
						},
		
		"leaguelink" : { "path"		: "hallofcool.php",
						"filters"	: [],
						"params"	: { "leagueid" : "league" }
						},
		"federationlink" : { "path"	: "hallofcool.php",
						"filters"	: [],
						"params"	: { "federationid" : "alliance" }
						},
        
        "title" : "Maptrick Hall of Cool",
        "img" : "chrome://foxtrick/content/resources/linkicons/maptrick_hoc.png"
};

stats["maptrick_botmap"] =  { 
        "url" : "http://www.maptrick.org/",

        "countrylink" : { "path"	: "botmap.php",
						"filters"	: [],
						"params"	: { "countryid" : "country" }
						},
        
        "title" : "Maptrick Botmap",
        "img" : "chrome://foxtrick/content/resources/linkicons/maptrick_bot.png"
};
 

// HT-Dog
stats["ht-dog"] =  { 
        "url" : "http://mikehell.kicks-ass.net/ht-dog/index.jsp",

        "teamlink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : { "teamid" : "otherTeamID" }
                       },

        "title" : "HT-Dog",
        "img" : "chrome://foxtrick/content/resources/linkicons/ht-dog.png"
};    

// Hatstats

stats["hatstats"] =  { 
        "url" : "",
        "urlfunction": function (filterparams) {
                             var countryid = filterparams["countryid"];
                             if (typeof(hscountries[countryid]) == 'undefined') return null;
                             return "http://" + hscountries[countryid] + ".hatstats.info/";
                        },
    
        "leaguelink" : { "path"       : "standings.php?rank=0&round=99",
                         "filters"    : [], 
                         "params"     : { "leagueid" : "series",
                                          "levelnum" : "level" }
                       },

        "teamlink" : {   "path"       : "team_overview.php",
                         "filters"    : [], 
                         "params"     : { "teamid" : "teamid",
                                          "levelnum" : "level" }
                       },
        "countrylink" : {   "path"       : "",
                         "filters"    : [], 
                         "params"     : []
                       },
        "allowlink" : function(filterparams, stattype) {
            
            var maxlevel = 4;
            if (typeof(hslevels[filterparams["countryid"]]) != 'undefined') {
                maxlevel = hslevels[filterparams["countryid"]];
            }
            
            if (maxlevel < filterparams["levelnum"]) {
                return false;
            } else {
                return true;
            }
        },

        "title" : "HatStats",
        "img" : "chrome://foxtrick/content/resources/linkicons/hatstats.png"        
};    


stats["advancedinjurycalc"] =  { 
        "url" : "http://www.student.ru.nl/rvanaarle/injury.php",

        "playerhealinglink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : { "age" : "nAge", "injuredweeks" : "nWeeks", "tsi" : "nTSIafter"  }
                        },
        
        "title" : "Advanced Injury Calculator",
        "img" : "chrome://foxtrick/content/resources/linkicons/redcross_small.png"
};


stats["healingkawasaki"] =  { 
        "url" : "http://club.hattrick.org/KawasakiTigers/default.asp?site=http://av.hattricknippon.org",

        "playerhealinglink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : { }
                       },
        
        "title" : "Kawasaki Tigers Injury Healing Time Prediction Tool",
        "img" : "chrome://foxtrick/content/resources/linkicons/redcross_small.png"
};

stats["healingkawasaki2"] =  { 
        "url" : "http://club.hattrick.org/KawasakiTigers/default.asp?site=http://av2.hattricknippon.org",

        "playerhealinglink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : { }
                       },
        
        "title" : "Kawasaki Tigers Injury Healing Time Prediction Tool 2",
        "img" : "chrome://foxtrick/content/resources/linkicons/redcross_small.png"
};


stats["hottrickkeeper"] =  { 
        "url" : "http://www.hottrick.org/",

        "keeperlink" : { "path"       : "hattrick_keeper_tool.php",
                         "filters"    : [], 
                         "params"     : { }
                       },
        
        "title" : "Hottrick Keeper Tool",
        "img" : "chrome://foxtrick/content/resources/linkicons/hottrick_small.png" 
};

stats["htnipponkeeper"] =  { 
        "url" : "http://keeper.hattricknippon.org/",

        "keeperlink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : { "tsi" : "tsi", "form" : "form" }
                       },
        
        "title" : "Keeper Level Prediction Tool",
        "img" : "chrome://foxtrick/content/resources/linkicons/hattricknippon_small.png"
};

stats["coachexperience"] =  { 
        "url" : "http://www.manager.brygge.dk/Hattrick/experience.htm",

        "coachlink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : []
                       },
        
        "title" : "Coach experience table",
        "shorttitle" : "Cet"
};

/*  // down
stats["cyf"] =  { 
        "url" : "http://cyf.hattrickitalia.org/",

        "youthpulllink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : []
                       },
        
        "title" : "Cross Your Fingers",
        "img" : "chrome://foxtrick/content/resources/linkicons/cyf.png"
};*/

stats["camelmaster_economists"] =  { 
        "url" : "http://www.dulovic.com/fun/hattrick/economists.php",

        "economylink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : []
                       },
        
        "title" : "Camelmasters Economist Tool",
        "img" : "chrome://foxtrick/content/resources/linkicons/camelmasters.png"
};    

stats["htlinks_economists"] =  { 
        "url" : "http://www.ht-links.de/Hattrick/Economist-Checker.html",

        "economylink" : { "path"       : "",
                         "filters"    : [], 
                         //"params"     : {"Cash" : "Cash","Currency":"Currency"}
						 "paramfunction" : function(params) {
							var Cash=params["Cash"];
							var CurrCode=params["Currency"];
                            if (CurrCode!="EUR" && CurrCode!="CHF"){
								Cash=Math.round(Cash*FoxtrickPrefs.getString("currencyRate"));
								CurrCode="EUR";
							}
                            return "?Cash=" + Cash + "&Currency=" + CurrCode;                                                        
						 } 
                       },
        
        "title" : "HT-Links.de Economist Checker",
        "img" : "chrome://foxtrick/content/resources/linkicons/htlinks_lupe.png"
};    

stats["htlinks_trainingspeedchecker"] =  { 
        "url" : "http://www.ht-links.de/Hattrick/TrainingsSpeedCheckerE.html",

        "traininglink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : {"Coach":"Trainer","TI":"TI","STA":"KO","TrainingType":"TrainingType"}
                       },
        
        "title" : "HT-Links.de TrainingSpeedChecker",
        "img" : "chrome://foxtrick/content/resources/linkicons/htlinks_lupe.png"
};    

stats["htlinks_Goalkeeper_Checker"] =  { 
        "url" : "http://www.ht-links.de/Hattrick/Goalkeeper-Checker.html",

        "keeperlink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : { "tsi" : "TSI", "form": "Form","age":"Age"}
                       },
        
        "title" : "HT-Links.de  - Goalkeeper-Checker",
        "img" : "chrome://foxtrick/content/resources/linkicons/htlinks_small.png"
};


stats["htlinks_ti_schrauber"] =  { 
        "url" : "http://www.ht-links.de/Hattrick/TISchrauber.html",

        "traininglink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     : { "tsi" : "TSI"}
                       },
         "countryidranges" : [[3, 3]], 
        "title" : "HT-Links.de  - TISchrauber",
        "img" : "chrome://foxtrick/content/resources/linkicons/htlinks.png"
};

stats["htlinks_general"] =  { 
        "url" : "http://www.ht-links.de/",

        "achievementslink" : { "path"       : "Hattrick/Errungenschaften.html",
                         "filters"    : ["owncountryid"], 
                         "params"     : []
                       },
         "owncountryidranges" : [[3, 3]], 
        "title" : "HT-Links.de - Info",
        "img" : "chrome://foxtrick/content/resources/linkicons/htlinks.png"
};



stats["Hattrick_training_speed_tool"] =  { 
        "url" : "http://trainingspeed.freehostia.com/",

        "traininglink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : {"Coach":"Coach","TI":"TI","STA":"KO","TrainingType":"TrainingType"}
                       },
        
        "title" : "Hattrick training speed tool",
        "img" : "chrome://foxtrick/content/resources/linkicons/trainingspeed.png"
};    


/*  // claims to have CHPP but doesn't. hence illegal
stats["skillraise"] =  { 
        "url" : "http://www.htdaytrading.com/",

        "playerlink" : { "path"       : "?page=showplayer",
                         "filters"    : ["age"], 
                         "params"     : { "age" : "age",
                                          "stamina" : "stamina",  "playmaking" : "playmaking",
                                          "passing" : "passing", "winger" : "winger", "defending" : "defending",
                                          "scoring" : "scoring"
                          }
                       },
                       
        "ageranges" : [[17, 19]], 

        "title" : "SkillRaise Tool",
        "img" : "chrome://foxtrick/content/resources/linkicons/skillraise.png"
};  */  

stats["Hattrickstats_fr"] =  { 
        "url" : "http://friendly.cup.free.fr/",

        "leaguelink" : { "path"       : "Stats.php",
                         "filters"    : ["countryid"], 
                         "params"     : { "leagueid" : "id" }
                       },

        "teamlink" : { "path"       : "Stats.php",
                         "filters"    : ["countryid"], 
                         "params"     : { "teamid" : "team" }
                       },
        "countrylink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     : []
                       },
                
        "countryidranges" : [[5, 5]], 
        "title" : "HATTRICKSTATS.WeB.SiTe",
        "img" : "chrome://foxtrick/content/resources/linkicons/hattrickstats_fr.gif"
};    
/*  // down
stats["EstadisticasHTTP"] =  { 
        "url" : "http://ht-tp.dnsalias.com/http/",

        "leaguelink" : { "path"       : "besteam.jsp?Accion=6A",
                         "filters"    : ["countryid", "levelnum"], 
                         "params"     : { "leagueid" : "GrupoId" }
                       },
                       
        "teamlink" : {   "path"       : "equipo.jsp?Accion=6P",
                         "filters"    : ["countryid", "levelnum"], 
                         "params"     : { "teamid" : "Id" }
                       },

        "countryidranges" : [[36, 36]],
        "levelnumranges" : [[1, 6]],
        "title" : "Estadisticas HTTP",
        "img" : "chrome://foxtrick/content/resources/linkicons/http.png"        
}; */   

stats["natstats"] =  { 
  "url" : "http://doof92.co.uk/",
  "title" : "NatStats",
  "img" : "chrome://foxtrick/content/resources/linkicons/natstats.png",
  
  "nationalteamlink" : { "path"     : "",
                         "filters"  : [],
                         "params"   : {"ntteamid" : "id","LeagueOfficeTypeID":"LeagueOfficeTypeID" },
						 "paramfunction" : function(params) {
                            
                            if (params["LeagueOfficeTypeID"] == 2) {
                             return "HT/team.asp?id=" + params["ntteamid"];
                            } else {
                             return "/HT/u20team.asp?id=" + params["ntteamid"];                
                            }
                            
                        } 
  }
  
};


// Hattrick Today
stats["hattricktoday"] =  { 
        "url" : "http://www.frelive.net/",
        "matchlink" : { "path"       : "HT2D/Viewer/index.php",
                         "filters"    : [], 
                         "params"     : { "matchid" : "urlMatches" }
                       },
         "playedmatchlink" : { "path"       : "HT2D/Viewer/index.php",
                         "filters"    : [], 
                         "params"     : { "matchid" : "urlMatches" }
                       },
        
        "title" : "Hattrick Today",
        "img" : "chrome://foxtrick/content/resources/linkicons/hattricktoday.png"
};

 
stats["magicyp"] =  { 
        "url" : "http://www.rodelhang.at/magicyp",

        "youthpulllink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : []
                       },
        
        "title" : "Magic Youthpull",
        "img" : "chrome://foxtrick/content/resources/linkicons/magicyp.png"
};

/*  // down
stats["beltrickarena"] =  { 
        "url" : "http://www.beltrick.org/calculator",
        "arenalink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : []
                       },
        "title" : "Beltrick Arena Calculator",
        "img" : "chrome://foxtrick/content/resources/linkicons/beltrick_arena.gif"
};

stats["beltrickyouth"] =  { 
        "url" : "http://www.beltrick.org/youthstat",
        "youthlink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : []
                       },
        "title" : "Beltrick YouthStat",
        "img" : "chrome://foxtrick/content/resources/linkicons/beltrick_youthstat.png"
};*/

stats["hattrick-youthclub"] =  { 
        "url" : "http://www.hattrick-youthclub.org/",
        "youthlink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : []
                       },
        "title" : "hattrick youthclub",
        "img" : "chrome://foxtrick/content/resources/linkicons/hyouthclub.png"
};

stats["arenaoptimizer"] =  { 
        "url" : "http://www.arenaoptimizer.es/",
        "arenalink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : []
                       },
        "title" : "Arena Optimizer",
        "img" : "chrome://foxtrick/content/resources/linkicons/arenaoptimizer.gif"
};

stats["htarena"] =  { 
        "url" : "http://www.htarena.org/",
        "arenalink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : []
                       },
        "title" : "HTArena - the calculator",
        "img" : "chrome://foxtrick/content/resources/linkicons/htarena.png"
};

stats["nrg_eco"] =  { 
        "url" : "http://nrgjack.altervista.org/",
        "arenalink" : { "path"       : "eco.php",
                         "filters"    : [], 
                         "params"     : { "terraces" : "t", "basic": "b", "roof" : "r", "vip" : "v"}                       
                       },
        "title" : "NRG ECO",
        "img" : "chrome://foxtrick/content/resources/linkicons/eco.png"
};

stats["nrg_fc"] =  { 
        "url" : "http://nrgjack.altervista.org/",
	    "coachlink" : { "path"       : "fc.php",
                         "filters"    : [], 
                         "params"     : {  }
                       },
        "title" : "NRG FC",
        "img" : "chrome://foxtrick/content/resources/linkicons/nrg_fc.png"
};
					   
stats["nrg_pop"] =  { 
        "url" : "http://nrgjack.altervista.org/",
		"playerlink" : { "path"       : "pop.php",
                         "filters"    : [], 
                         "params"     : { "tsi" : "tsi", "form" : "fo",
                                          "stamina" : "st",  "playmaking" : "pm",
                                          "passing" : "pa", "winger" : "wi", "defending" : "df",
                                          "scoring" : "sc" }
                          },
        "title" : "NRG Pop",
        "img" : "chrome://foxtrick/content/resources/linkicons/nrg_pop.png"
};

// ArgenStat
stats["argenstat"] =  { 
        "url" : "http://argenstat.com.ar/",
        "leaguelink" : { "path"       : "?V=L",
                         "filters"    : ["countryid"], 
                         "params"     : { "leagueid" : "ID" }
                       },
                       
        "teamlink" : { "path"       : "?V=T",
                         "filters"    : ["countryid"], 
                         "params"     : { "teamid" : "ID" }
                       },
        "countrylink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
        
        "countryidranges" : [[7, 7]], 
        "title" : "ArgenStat",
        "img" : "chrome://foxtrick/content/resources/linkicons/argenstat.png"
};




// Gham live
stats["gham"] =  { 
        "url" : "http://hattrickitalia.org/gham/live/",

        "matchlink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : { "matchid" : "matchId" }
                       },
        
        "title" : "Gham live",
        "img" : "chrome://foxtrick/content/resources/linkicons/gham.png"
};
   
   
   
// HT-bet
stats["ht_bet"] =  { 
        "url" : "http://www.ht-bet.org/predict.php",

        "leaguelink" : { "path"       : "",
                         "filters"    : [], 
                         "params"     : { "leagueid" : "league_id" }
                       },
        
        "title" : "HT-bet",
        "img" : "chrome://foxtrick/content/resources/linkicons/ht_bet.png"
};    
   
   
   
// ----------------------------------------------------------------------
// -------------- tracker & national teams ------------------------------
// ----------------------------------------------------------------------


stats["ht_scouting"] =  { 
  "url" : "http://www.ht-deutschland.de/",
 
  "playerlink" : { "path"       : "scouting/index.php?language=2",
                   "filters"    : ["nationality"], 
                   "params"     : []
				}, 
  "nationalteamlink" : { "path"       : "scouting/index.php?language=2",
                   "filters"    : ["countryid"], 
                   "params"     : []
				}, 
  "nationalityranges" : [[3, 3]], 
  "countryidranges" : [[3, 3]], 
  "title" : "HT-Deutschland Scouting DB",
  "img" : "chrome://foxtrick/content/resources/linkicons/ht-d-scout.gif"
};


stats["ht-fff"] =  { 
        "url" : "http://www.ht-fff.org/",

        "playerlink" : { "path"       : "dtn_submitting.php",
                         "filters"    : ["nationality"], 
                         "params"     : []
                       },
		"nationalteamlink" : { "path"       : "dtn_submitting.php",
                   "filters"    : ["countryid"], 
                   "params"     : []
				}, 
        "nationalityranges" : [[5, 5]],
        "countryidranges" : [[5, 5]],
        "title" : "ht-fff.org | french scouting group.",
        "img" : "chrome://foxtrick/content/resources/linkicons/htfff.png"
}; 


stats["scouting_mexico"] =  { 
  "url" : "http://www.hattrick.org.mx/SN/",
 
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
				}, 
  "nationalteamlink" : { "path"       : "",
                   "filters"    : ["countryid"], 
                   "params"     : []
				}, 
  "nationalityranges" : [[6, 6]], 
  "countryidranges" : [[6, 6]], 
  "title" : "Hattrick México",
  "img" : "chrome://foxtrick/content/resources/linkicons/Mexico_scouting.png"
};

stats["brasileira"] =  { 
        "url" : "http://www.opendev.com.br/chpp/br/",

        "playerlink" : { "path"       : "",
                         "filters"    : ["nationality"], 
                         "params"     : []
                       },
        
        "nationalityranges" : [[16, 16]],
        "title" : "Estatísticas da Seleção Brasileira",
        "img" : "chrome://foxtrick/content/resources/linkicons/brasileira.png"
};



stats["u20schweiz"] =  { 
  "url" : "http://u20schweiz.kicks-ass.net",
  "title" : "U20 Schweiz",
  "img" : "chrome://foxtrick/content/resources/linkicons/u20schweiz.jpg",
  
  "playerlink" : { "path"     : "",
                         "filters"  :["nationality","age"],
                         "params"   : []
  },
  "nationalteamlink" : { "path"     : "",
                         "filters"  : ["countryid", "LeagueOfficeTypeID"],
                         "params"   : []
  },
  "ageranges" : [[17,20]],
  "nationalityranges" : [[46,46]],
  
  "countryidranges" : [[46,46]],
  "LeagueOfficeTypeIDranges" : [[4,4]],  
};



stats["czechrepublic_nt"] = { 
  "url" : "http://u20.hattrick-cz.com/?pg=submitPlayer",
  "img" : "chrome://foxtrick/content/resources/linkicons/czech_nt_tracker.png",
  "title" : "Ceská republika U20 Tracker",
  
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality","age"], 
                   "params"     : []
                 },  
  "nationalityranges" : [[52, 52]],
  "ageranges" : [[17,20]],  
};


stats["hattrick-cz"] = { 
  "url" : "http://www.hattrick-cz.com/",
  "img" : "chrome://foxtrick/content/resources/linkicons/czech_nt_tracker.png",
  "title" : "hattrick-cz",
  
        "countrylink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
        "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
        
        "countryidranges" : [[52, 52]] ,
};

stats["crotracker"] = { 
  "url" : "http://cro-tracker.com/index.php",
  "img" : "chrome://foxtrick/content/resources/linkicons/cro-tracker.gif",
  "title" : "Hrvatska NT U20 Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[58,58]] ,
	"nationalityranges" : [[58,58]], 
};

http://www.ht-deutschland.de/nigeria/


stats["ht_scouting_nigeria"] =  { 
  "url" : "http://www.ht-deutschland.de/",
 
  "playerlink" : { "path"       : "nigeria/index.php?language=2",
                   "filters"    : ["nationality"], 
                   "params"     : []
				}, 
  "nationalteamlink" : { "path"       : "nigeria/index.php?language=2",
                   "filters"    : ["countryid"], 
                   "params"     : []
				}, 
  "nationalityranges" : [[75, 75]], 
  "countryidranges" : [[75, 75]], 
  "title" : "Nigeria Scouting DB",
  "img" : "chrome://foxtrick/content/resources/linkicons/ht-d-scout.gif"
}

stats["ht_scouting_alyaman"] =  { 
  "url" : "http://www.ht-deutschland.de/",
 
  "playerlink" : { "path"       : "alyaman/index.php?language=2",
                   "filters"    : ["nationality"], 
                   "params"     : []
				}, 
  "nationalteamlink" : { "path"       : "alyaman/index.php?language=2",
                   "filters"    : ["countryid"], 
                   "params"     : []
				}, 
  "nationalityranges" : [[133, 133]], 
  "countryidranges" : [[133, 133]], 
  "title" : "Al Yaman Scouting DB",
  "img" : "chrome://foxtrick/content/resources/linkicons/ht-d-scout.gif"
}

stats["ht_scouting_bahrain"] =  { 
  "url" : "http://www.ht-deutschland.de/",
 
  "playerlink" : { "path"       : "bahrain/index.php?language=2",
                   "filters"    : ["nationality"], 
                   "params"     : []
				}, 
  "nationalteamlink" : { "path"       : "bahrain/index.php?language=2",
                   "filters"    : ["countryid"], 
                   "params"     : []
				}, 
  "nationalityranges" : [[123, 123]], 
  "countryidranges" : [[123, 123]], 
  "title" : "Bahrain Scouting DB",
  "img" : "chrome://foxtrick/content/resources/linkicons/ht-d-scout.gif"
}



stats["ghanatracker"] = { 
  "url" : "http://www.ghana.comoj.com/?pg=submitPlayer",
  "img" : "chrome://foxtrick/content/resources/linkicons/ghana_tracker.gif",
  "title" : "Ghana U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[137,137]] ,
	"nationalityranges" : [[137,137]], 
};


/*
stats["u20_nt_stats"] = { 
  "url" : "http://www.c10.ch/ant_db/index.php",
  "img" : "chrome://foxtrick/content/resources/linkicons/nt_tracker.png",
  "title" : "U20 & NT Stats",
  
  "nationalteamlink" : { "path"     : "?action=select_country",
                         "filters"  : [],
                         "params"   : {"countryid" : "id"}
                        },  
};*/



stats["u20_nt_tracker"] = { 
  "url" : "http://www.oribi.org/ant_db/index.php",
  "img" : "chrome://foxtrick/content/resources/linkicons/nt_tracker.png",
  "title" : "Global U20 & NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "?action=player_submit&cat=1",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[1,2],[4,4],[7,15],[17,45],[47,51],[53,57],[59,74],[76,122],[124,132],[134,136],[138,200]] ,
	"nationalityranges" : [[1,2],[4,4],[7,15],[17,45],[47,51],[53,57],[59,74],[76,122],[124,132],[134,136],[138,200]], 
};  // own tracker: exclude 3,5,6,16,46,52,58,123,137



//------------------------------------------------------------------
// -----------------------------------------------------------------


function getLinks2(stats, stattype, filterparams, doc, overridesettings, module) { 
    var links = [];
    var counter = 0;
    
    for (var key in stats) {

        if (!Foxtrick.isModuleFeatureEnabled(module, key)  && 
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
             var link = foxtrick_makelink(stat, statlink, filterparams, key, doc);
             if (link != null) { 
                links.push({"link" : getLinkElement(link, stat, doc), "stat" : stat});
             }
        }

    }
  return getSortedLinks(links);
}

function getLinks(stattype, filterparams, doc, module) { 
  return getLinks2(foxtrickStatsHash[stattype], stattype, filterparams, doc, false, module);
}

function foxtrick_makelink(stat, statlink, filterparams, key, doc) { 

    var params = statlink["params"];
    var args = "";

    if (typeof (statlink["paramfunction"]) == 'undefined') {
        for (var paramkey in params) {
            var temp;
            
            if ((args == "") && statlink["path"].search(/\?/) == -1 && stat["url"].search(/\?/) == -1) {
                temp = "?";
             } else {
                temp = "&";
             }
			 	
             if (!params[paramkey].charAt(0).match(/\w+/)) {temp="";}
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
}


function getLinkElement(link, stat, doc) {

    var statslink = doc.createElement("a");
    if (typeof(stat["post"]) == 'undefined') {
       if (typeof(stat["openinthesamewindow"]) == 'undefined') {
          statslink.target = "_stats";
       }   
    }
    statslink.title = stat.title;
    //statslink.style.verticalAlign = "middle";
    
    if (typeof(stat["img"]) == 'undefined') {
        statslink.appendChild(doc.createTextNode(stat.shorttitle));
     } else {
        var img = doc.createElement("img");
        img.alt = stat.title;
        img.title = stat.title;
        img.style.border="0";
		img.src = stat.img;
        statslink.appendChild(img);
    }
    
    statslink.href = link;

    return statslink;    
    
}

function getSortedLinks(links) {
  function sortfunction(a,b) {
    return a.link.title.localeCompare(b.link.title);
  }
  links.sort(sortfunction);
  return links;
}
