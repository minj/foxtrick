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
        "url" : "http://www.francestats.fr/",

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

stats["brasileira_tracker"] =  { 
        "url" : "http://www.opendev.com.br/chpp/br/",

        "playerlink" : { "path"       : "",
                         "filters"    : ["nationality"], 
                         "params"     : []
                       },
        "nationalteamlink" : { "path"       : "",
                   "filters"    : ["countryid"], 
                   "params"     : []
				}, 
		"countryidranges" : [[16, 16]],   
        "nationalityranges" : [[16, 16]],
        "title" : "Estatísticas da Seleção Brasileira",
        "img" : "chrome://foxtrick/content/resources/linkicons/brasileira.png"
};


stats["czechrepublic_nt"] = { 
  "url" : "http://u20.hattrick-cz.com/?pg=submitPlayer",
  "img" : "chrome://foxtrick/content/resources/linkicons/czech_nt_tracker.png",
  "title" : "Ceská republika U20-NT Tracker",
  
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },  
    "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
        
    "countryidranges" : [[52, 52]] ,
	"nationalityranges" : [[52, 52]],
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


stats["ht_scouting_taiwan"] =  { 
  "url" : "http://www.ht-deutschland.de/",
 
  "playerlink" : { "path"       : "taiwan/index.php?language=2",
                   "filters"    : ["nationality"], 
                   "params"     : []
				}, 
  "nationalteamlink" : { "path"       : "taiwan/index.php?language=2",
                   "filters"    : ["countryid"], 
                   "params"     : []
				}, 
  "nationalityranges" : [[60, 60]], 
  "countryidranges" : [[60, 60]], 
  "title" : "Taiwan Scouting DB",
  "img" : "chrome://foxtrick/content/resources/linkicons/ht-d-scout.gif"
}

stats["ht_scouting_TrinidadTobago"] =  { 
  "url" : "http://www.ht-deutschland.de/",
 
  "playerlink" : { "path"       : "trinidadandtobago/index.php?language=2",
                   "filters"    : ["nationality"], 
                   "params"     : []
				}, 
  "nationalteamlink" : { "path"       : "trinidadandtobago/index.php?language=2",
                   "filters"    : ["countryid"], 
                   "params"     : []
				}, 
  "nationalityranges" : [[110, 110]], 
  "countryidranges" : [[110, 110]], 
  "title" : "Trinidad & Tobago Scouting DB",
  "img" : "chrome://foxtrick/content/resources/linkicons/ht-d-scout.gif"
}

stats["ht_scouting_malaysia"] =  { 
  "url" : "http://www.ht-deutschland.de/",
 
  "playerlink" : { "path"       : "malaysia/index.php?language=2",
                   "filters"    : ["nationality"], 
                   "params"     : []
				}, 
  "nationalteamlink" : { "path"       : "malaysia/index.php?language=2",
                   "filters"    : ["countryid"], 
                   "params"     : []
				}, 
  "nationalityranges" : [[45, 45]], 
  "countryidranges" : [[45, 45]], 
  "title" : "Malaysia Scouting DB",
  "img" : "chrome://foxtrick/content/resources/linkicons/ht-d-scout.gif"
}

stats["ht_scouting_kyrgyzstan"] =  { 
  "url" : "http://www.ht-deutschland.de/",
 
  "playerlink" : { "path"       : "kyrgyzstan/index.php?language=2",
                   "filters"    : ["nationality"], 
                   "params"     : []
				}, 
  "nationalteamlink" : { "path"       : "kyrgyzstan/index.php?language=2",
                   "filters"    : ["countryid"], 
                   "params"     : []
				}, 
  "nationalityranges" : [[102, 102]], 
  "countryidranges" : [[102, 102]], 
  "title" : "Kyrgyzstan Scouting DB",
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


stats["armeniatracker"] = { 
  "url" : "http://www.hayastan-u20.de.tl/",
  "img" : "chrome://foxtrick/content/resources/linkicons/tracker.png",
  "title" : "Hayastan U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[122,122]] , 
	"nationalityranges" : [[122,122]], 
};


stats["belgiumtracker"] = { 
  "url" : "http://belgium.beltrick.org/",
  "img" : "chrome://foxtrick/content/resources/linkicons/tracker.png",
  "title" : "BelgiÃ« U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[44,44]] ,
	"nationalityranges" : [[44,44]], 
};

stats["canadatracker"] = { 
  "url" : "http://nattrick.ca",
  "img" : "chrome://foxtrick/content/resources/linkicons/tracker.png",
  "title" : "Canada U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[17,17]] ,
	"nationalityranges" : [[17,17]], 
};

stats["colombiatracker"] = { 
  "url" : "http://seleccion.htcolombia.org/",
  "img" : "chrome://foxtrick/content/resources/linkicons/tracker.png",
  "title" : "Colombia U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[19,19]] ,
	"nationalityranges" : [[19,19]], 
};


stats["cyprustracker"] = { 
  "url" : "http://db.ht-cy.org",
  "img" : "chrome://foxtrick/content/resources/linkicons/tracker.png",
  "title" : "Cyprus U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[89,89]] , 
	"nationalityranges" : [[89,89]], 
};


stats["englandtracker"] = { 
  "url" : "http://www.realfootball.co.uk/hattrick/tracker",
  "img" : "chrome://foxtrick/content/resources/linkicons/tracker.png",
  "title" : "England U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[2,2]] ,
	"nationalityranges" : [[2,2]], 
};


stats["israeltracker"] = { 
  "url" : "http://ht.quickly.co.il",
  "img" : "chrome://foxtrick/content/resources/linkicons/tracker.png",
  "title" : "Israel U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[63,63]] , 
	"nationalityranges" : [[63,63]], 
};

stats["suriyahtracker"] = { 
  "url" : "http://suriyah.ht.quickly.co.il/",
  "img" : "chrome://foxtrick/content/resources/linkicons/tracker.png",
  "title" : "Suriyah U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[140,140]] , 
	"nationalityranges" : [[140,140]], 
};


stats["nederlandtracker"] = { 
  "url" : "http://www.dutchstats.nl/",
  "img" : "chrome://foxtrick/content/resources/linkicons/tracker.png",
  "title" : "Nederland U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[14,14]] ,
	"nationalityranges" : [[14,14]], 
};

stats["polskatracker"] = { 
  "url" : "http://www.nbd.cba.pl",
  "img" : "chrome://foxtrick/content/resources/linkicons/tracker.png",
  "title" : "Polska U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[24,24]] , 
	"nationalityranges" : [[24,24]], 
};

stats["qatartracker"] = { 
  "url" : "http://www.tracker.comyr.com/",
  "img" : "chrome://foxtrick/content/resources/linkicons/qatartracker.png",
  "title" : "Dawlat Qatar U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[141,141]] ,
	"nationalityranges" : [[141,141]], 
};

stats["romaniatracker"] = { 
  "url" : "http://rtc.fubar.ro",
  "img" : "chrome://foxtrick/content/resources/linkicons/tracker.png",
  "title" : "RomÃ¢nia U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[37,37]] ,
	"nationalityranges" : [[37,37]], 
};

stats["surinametracker"] = { 
  "url" : "http://tracker.hattricksuriname.com/players.php",
  "img" : "chrome://foxtrick/content/resources/linkicons/tracker.png",
  "title" : "Suriname U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[113,113]] ,
	"nationalityranges" : [[113,113]], 
};

stats["ugandaracker"] = { 
  "url" : "http://uganda.site50.net",
  "img" : "chrome://foxtrick/content/resources/linkicons/tracker.png",
  "title" : "Uganda U20/NT Tracker",
  
  "nationalteamlink" : { "path"       : "",
                         "filters"    : ["countryid"], 
                         "params"     :  []
                       },
  "playerlink" : { "path"       : "",
                   "filters"    : ["nationality"], 
                   "params"     : []
                 },
	"countryidranges" : [[143,143]] ,
	"nationalityranges" : [[143,143]], 
};


// global tracker
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
	"countryidranges" :   [[1,1],[4,4],[7,13],[15,15],[18,18],[20,23],[25,36],[38,43],[46,51],[53,57],[59,59],[61,62],[64,74],[76,88],[90,101],
						[103,109],[111,112],[114,121],[124,132],[134,136],[138,139],[142,142],[144,200]],
	"nationalityranges" : [[1,1],[4,4],[7,13],[15,15],[18,18],[20,23],[25,36],[38,43],[46,51],[53,57],[59,59],[61,62],[64,74],[76,88],[90,101],
						[103,109],[111,112],[114,121],[124,132],[134,136],[138,139],[142,142],[144,200]], 
};  // own tracker: exclude all above



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
