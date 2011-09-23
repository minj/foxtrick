/**
 * links.js
 * External links collection
 * @author others, convinced, ryanli
 */

/*
 * "params"	: { "infocode" : "text" } -> ?text=info[infocode]
 * "params"	: { "infocode" : "" } -> info[infocode] // eg alltid
 * "params"	: { "" : "#text" } -> #text 			//eg maptrick , first letter non alphanumeric
 * "params"	: { "infocode" : "," } -> ,info[infocode] //eg alltid, first letter non alphanumeric
 * "params"	: { "infocode" : "ftfilter_somename" } -> parameter only used for allowlink function and will not be shown in link //eg hattrickchallenge_friendly, first letters = ftfilter
 * for others use the 'paramfunction' eg natstats
 */

Foxtrick.util.module.register({
	MODULE_NAME : "Links",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	CORE_MODULE : true,

	OPTION_FUNC : function(doc) {
		var cont = doc.createElement("div");

		var label = doc.createElement("p");
		label.setAttribute("data-text", "Links.feeds");
		cont.appendChild(label);

		var textarea = doc.createElement("textarea");
		textarea.setAttribute("pref", "module.Links.feeds");
		cont.appendChild(textarea);

		return cont;
	},

	htworld : {
		"118" : "algerie",
		"128" : "aliraq",
		"127" : "alkuwayt",
		"77" : "almaghrib",
		"106" : "alurdun",
		"133" : "alyaman",
		"105" : "andorra",
		"130" : "angola",
		"7" : "argentina",
		"129" : "azerbaycan",
		"123" : "bahrain",
		"132" : "bangladesh",
		"124" : "barbados",
		"91" : "belarus",
		"44" : "belgie",
		"139" : "benin",
		"74" : "bolivia",
		"69" : "bosnaihercegovina",
		"16" : "brasil",
		"136" : "brunei",
		"62" : "bulgaria",
		"125" : "caboverde",
		"17" : "canada",
		"52" : "ceskarepublika",
		"18" : "chile",
		"34" : "china",
		"19" : "colombia",
		"81" : "costarica",
		"126" : "cotedivoire",
		"131" : "crnagora",
		"61" : "cymru",
		"89" : "cyprus",
		"11" : "danmark",
		"141" : "dawlatqatar",
		"144" : "dhivehiraajje",
		"73" : "ecuador",
		"56" : "eesti",
		"100" : "elsalvador",
		"2" : "england",
		"36" : "espana",
		"76" : "foroyar",
		"5" : "france",
		"137" : "ghana",
		"107" : "guatemala",
		"30" : "hanguk",
		"122" : "hayastan",
		"50" : "hellas",
		"99" : "honduras",
		"59" : "hongkong",
		"58" : "hrvatska",
		"20" : "india",
		"54" : "indonesia",
		"85" : "iran",
		"21" : "ireland",
		"38" : "island",
		"63" : "israel",
		"4" : "italia",
		"94" : "jamaica",
		"138" : "kampuchea",
		"112" : "kazakhstan",
		"95" : "kenya",
		"102" : "kyrgyzstan",
		"53" : "latvija",
		"84" : "letzebuerg",
		"117" : "liechtenstein",
		"66" : "lietuva",
		"120" : "lubnan",
		"51" : "magyarorszag",
		"97" : "makedonija",
		"45" : "malaysia",
		"101" : "malta",
		"6" : "mexico",
		"33" : "misr",
		"135" : "mocambique",
		"103" : "moldova",
		"119" : "mongoluls",
		"14" : "nederland",
		"111" : "nicaragua",
		"75" : "nigeria",
		"22" : "nippon",
		"9" : "norge",
		"93" : "northernireland",
		"15" : "oceania",
		"39" : "oesterreich",
		"134" : "oman",
		"71" : "pakistan",
		"96" : "panama",
		"72" : "paraguay",
		"23" : "peru",
		"55" : "philippines",
		"24" : "polska",
		"25" : "portugal",
		"31" : "prathetthai",
		"88" : "republicadominicana",
		"37" : "romania",
		"35" : "rossiya",
		"104" : "sakartvelo",
		"79" : "saudiarabia",
		"46" : "schweiz",
		"26" : "scotland",
		"121" : "senegal",
		"98" : "shqiperia",
		"47" : "singapore",
		"64" : "slovenija",
		"67" : "slovensko",
		"27" : "southafrica",
		"57" : "srbija",
		"12" : "suomi",
		"113" : "suriname",
		"140" : "suriyah",
		"1" : "sverige",
		"60" : "taiwan",
		"142" : "tanzania",
		"80" : "tounes",
		"110" : "trinidadandtobago",
		"32" : "turkiye",
		"143" : "uganda",
		"68" : "ukraina",
		"83" : "unitedarabemirates",
		"28" : "uruguay",
		"8" : "usa",
		"29" : "venezuela",
		"70" : "vietnam",
		"3" : "deutschland"
	},

	links : {
		"htworld" : {
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
		},
		"hattrickchallenge_friendly" : {
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
		},
		"alltid_add" : {
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
		},
		"alltid_clear" : {
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
		},
		"alltid_compare" : {
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
		},
		"Wage_Reduction_Calculator" : {
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
		},
		"hattrick-youthclub" : {
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
		},
		"nrg_deffor" : {
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
		}
	},

	collection : {},

	init : function() {
		var collection = this.collection;
		// load links defined above
		// FIXME - move all links to external sources and remove this
		for (var key in this.links) {
			var stat = this.links[key];
			for (var prop in this.links) {
				if (prop.match(/link/)) {
					if (typeof(collection[prop]) == 'undefined') {
						collection[prop] = {};
					}
					collection[prop][key] = stat;
				}
			}
		}

		// load links from external feeds
		var feeds = FoxtrickPrefs.getString("modules.Links.feeds") || "";
		feeds = feeds.split(/(\n|\r)+/);
		// add default feed if no feeds set
		if (Foxtrick.all(function(n) { return Foxtrick.trim(n) == ""; }, feeds))
			feeds = [Foxtrick.DataPath + "links.json"];
		Foxtrick.map(function(feed) {
			Foxtrick.load(feed, function(text) {
				if (!text) {
					Foxtrick.log("Failure loading links file.");
					return;
				}
				try {
					var links = JSON.parse(text);
				}
				catch (e) {
					Foxtrick.log("Failure parsing links file.");
					return;
				}
				for (var key in links) {
					var link = links[key];
					if (link.url.indexOf("javascript:") == 0) {
						Foxtrick.log("JavaScript not allowed in links.");
					}
					else {
						for (var prop in link) {
							if (prop.indexOf("link") >= 0) {
								if (typeof(collection[prop]) == 'undefined') {
									collection[prop] = {};
								}
								collection[prop][key] = link;
							}
						}
					}
				}
			});
		}, feeds);
	},

	getLinks2 : function(stats, stattype, filterparams, doc, overridesettings, module) {
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
				var link = Foxtrick.util.module.get("Links").makelink(stat, statlink, filterparams, key, doc);
				if (link != null) {
					links.push({"link" : Foxtrick.util.module.get("Links").getLinkElement(link, stat, doc, key, module.MODULE_NAME), "stat" : stat});
				}
			}
		}
		return Foxtrick.util.module.get("Links").getSortedLinks(links);
	},

	getLinks : function(stattype, filterparams, doc, module) {
		try {
			filterparams.server = doc.location.hostname;
			return Foxtrick.util.module.get("Links").getLinks2(this.collection[stattype], stattype, filterparams, doc, false, module);
		} catch (e) { Foxtrick.log('getLinks: ',e) };
	},

	makelink : function(stat, statlink, filterparams, key, doc) {

		var params = statlink["params"];
		if (!statlink["path"])  statlink["path"] = "";
		var languages = statlink["languages"];
		var args = "";
	 
		if (params && typeof(statlink["paramfunction"]) != "function") {
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
		}
		else if (typeof(statlink["paramfunction"]) == "function") {
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
	},

	getLinkElement : function(link, stat, doc, key, module_name) {
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
	},

	getSortedLinks : function(links) {
		function sortfunction(a,b) {
			if (typeof(a.stat["img"]) == 'undefined' && typeof(b.stat["img"]) == 'undefined') return 0;//a.link.title.localeCompare(b.link.title);
			else if (typeof(a.stat["img"]) == 'undefined') return 1;
			else if (typeof(b.stat["img"]) == 'undefined') return -1;
			return a.link.title.localeCompare(b.link.title);
		}
		links.sort(sortfunction);
		return links;
	}
});
