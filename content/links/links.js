/**
 * links.js
 * External links collection
 * @author others, convinced, ryanli
 */

Foxtrick.util.module.register((function() {
	var predefinedLinks = {
		"htworld" : {
			"title" : "HT-World NT/U20 tracker",
			"img" : Foxtrick.InternalPath+"resources/linkicons/tracker.png",
			"url" : "http://www.ht-world.org/",
			"urlfunction": function (args) {
				var mapping = {
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
				};
				var href = mapping[args.countryid] || mapping[args.nationality] || null;
				return href ? "http://" + href : null;
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
			"allowlink" : function(args, stattype) {
				if (args.teamid != args.ownteamid) {
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
			"urlfunction": function (args) {
				return 'javascript:'+
					'var i=parseInt(localStorage.getItem("alltidcompare_index"));'+
					'if(!i)i=0;'+
					'var do_remove=false;'+
					'for(var j=0;j<i+1;++j) {if(parseInt(localStorage.getItem("alltidcompare_teamid"+j))=='+args["teamid"]+'){do_remove=true;break;}}'+
					'if (do_remove) {'+
					' localStorage.setItem("alltidcompare_teamid"+j,"0");'+
					' localStorage.setItem("alltidcompare_teamname"+j,"");'+
					'}'+
					'else {'+
					' localStorage.setItem("alltidcompare_teamid"+i, "'+args["teamid"]+'");'+
					' localStorage.setItem("alltidcompare_teamname"+i, "'+args["teamname"]+'");'+
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
			"urlfunction": function (args) {
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
			"urlfunction": function (args) {
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
		"hattrick-youthclub" : {
			"url" : "http://www.",
			"urlfunction": function (args) {
						var server = args["server"];
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
			"allowlink" : function(args, stattype) {
				if (args["teamid"] === args["ownteamid"] ||
						(args["ownyouthteamid"] !== null &&
						(args["teamid"] === args["ownyouthteamid"]
						|| args["teamid2"] === args["ownyouthteamid"]) ) ) {
				return true;
				} else {
				return false;
				}
			},
			"title" : "Hattrick Youthclub",
			"img" : Foxtrick.InternalPath+"resources/linkicons/hyouthclub.png"
		}
	};

	return {
		MODULE_NAME : "Links",
		MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
		CORE_MODULE : true,

		RESOURCES : {},
		
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


		onLoad : function() {
			// load links defined above
			// FIXME - move all links to external sources and remove this
			var collection  = {};
			/* not working atm
			var key, prop;
			for (key in predefinedLinks) {
				var link = predefinedLinks[key];
				for (prop in link) {
					if (prop.match(/link/)) {
						if (typeof(collection[prop]) == 'undefined') {
							collection[prop] = {};
						}
						collection[prop][key] = link;
					}
				}
			}
			Foxtrick.util.module.get('Links').RESOURCES = collection; 
			*/

			// load links from external feeds
			var feeds = FoxtrickPrefs.getString("modules.Links.feeds") || "";
			feeds = feeds.split(/(\n|\r)+/);
			// add default feed if no feeds set
			if (Foxtrick.all(function(n) { return Foxtrick.trim(n) == ""; }, feeds))
				feeds = [Foxtrick.DataPath + "links.json"];
			Foxtrick.map(function(feed) {
				Foxtrick.load(feed, function(text) {
					if (!text) {
						Foxtrick.log("Failure loading links file: ", feed);
						return;
					}
					try {
						var links = JSON.parse(text);
					}
					catch (e) {
						Foxtrick.log("Failure parsing links file: ", text);
						return;
					}
					for (key in links) {
						var link = links[key];
						if (link.url.indexOf("javascript:") == 0) {
							Foxtrick.log("JavaScript not allowed in links: ", link.url);
						}
						else {
							for (prop in link) {
								if (prop.indexOf("link") >= 0) {
									if (typeof(collection[prop]) == 'undefined') {
										collection[prop] = {};
									}
									collection[prop][key] = link;
								}
							}
						}
					}
					Foxtrick.util.module.get('Links').RESOURCES = collection; 
				});
			}, feeds);
		},

		getLinks : function(type, args, doc, module) {
			var makeLink = function(stat, statlink, key) {
				var values = args;
				var params = statlink["params"];
				if (!statlink["path"])  statlink["path"] = "";
				var languages = statlink["languages"];
				var query = "";
				var paramkey;
			
				if (params) {
					for (paramkey in params) {
					if (params[paramkey].search('ftfilter')==0) continue;
						var temp;

						if ((query == "") && statlink["path"].search(/\?/) == -1 && stat["url"].search(/\?/) == -1) {
							temp = "?";
						} else {
							temp = "&";
						}

						if (!params[paramkey].charAt(0).match(/\w+/)) {temp="";}
		
						if (paramkey=="lang") {
							var lang;
							for (lang in languages) {
								if (lang == FoxtrickPrefs.getString("htLanguage")) {
									query += temp + params[paramkey] + "=" + encodeURIComponent(languages[lang]);
									break;
								}
								else if (lang == 'any') {
									query += temp + params[paramkey] + "=" + encodeURIComponent(languages[lang]);
								}
							}
							continue;
						}
		
						// makes calculation of requested parameteres and place values with the others in params
						if (statlink["SUM"]) {
							for (var sum in statlink["SUM"]) {
								values[sum] = 0;
								for (var i=0; i<statlink["SUM"][sum].length; ++i) 
									values[sum] += Number( values[ statlink["SUM"][sum][i] ] );
							}
						}
					 
						// check allowed based on value comparison
						if (typeof(statlink["allowlink2"]) != 'undefined') {
							var allowed = true; 
							if (statlink["allowlink2"]["GREATER"]) {
								allowed &= (values[statlink["allowlink2"]["GREATER"][0]] > values[statlink["allowlink2"]["GREATER"][1]]);
							}
							if (statlink["allowlink2"]["SMALLER"]) {
								allowed &= (values[statlink["allowlink2"]["SMALLER"][0]] < values[statlink["allowlink2"]["SMALLER"][1]]);
							}
							if (statlink["allowlink2"]["EQUAL"]) {
								allowed &= (values[statlink["allowlink2"]["EQUAL"][0]] == values[statlink["allowlink2"]["EQUAL"][1]]);
							}
							if (!allowed) return null;
						}

						if (values[paramkey] != null) {
							query += ( (params[paramkey] != "" && temp !="") ? (temp + params[paramkey] + "=") : params[paramkey])+ encodeURIComponent(values[paramkey]);
						}
						else {
							query += (params[paramkey] != "" ? temp + params[paramkey] : "");
						}
					}
				}

				var url=null;

				if (typeof (stat["urlfunction"]) == 'undefined') {
					url = stat["url"];
				} else {
					url = stat["urlfunction"](args);
				}

				if (url == null) return null;

				var link = url + statlink["path"] + query;
				return link;
			};
			var getLinkElement = function(link, url, key, module) {
				var statslink = doc.createElement("a");
				if (link.openinthesamewindow == undefined) {
					statslink.target = "_stats";
				}

				statslink.title = link.title;
				statslink.setAttribute("key", key);
				statslink.setAttribute("module", module);

				if (link.img == undefined) {
					statslink.appendChild(doc.createTextNode(link.shorttitle));
				}
				else {
					// add path to internal images
					if (link.img.indexOf('resources')==0)
						link.img = Foxtrick.ResourcePath + link.img;
					// add img for tracker flags
					if (module === "LinksTracker")
						link.appendChild(doc.createElement("img"));
					else
						Foxtrick.addImage(doc, statslink, { alt: link.shorttitle || link.title, title: link.title, src: link.img });
				}

				statslink.href = url;

				return statslink;
			};

			// add current server to args first
			args.server = doc.location.hostname;
			// links to return
			var links = [];

			var key;
			for (key in this.RESOURCES[type]) {
				var link = this.RESOURCES[type][key];
				var linkObj = link[type];
				var filters = linkObj.filters;

				var allowed;
				if (!FoxtrickPrefs.isModuleOptionEnabled(module.MODULE_NAME, key)) {
					// link not enabled
					allowed = false;
				}
				else if (filters && filters.length > 0) {
					// ranges to determine whether to show
					var i, j;
					for (i = 0; i < filters.length; i++) {
						var filtertype = filters[i];
						var filterranges = link[filtertype + "ranges"];
						var temp = false;

						for (j = 0; j < filterranges.length; j++) {
							if ( (args[filtertype] >= filterranges[j][0]) && (args[filtertype] <= filterranges[j][1])) {
								temp = true;
								break;
							}
						}
						if (!temp) {
							allowed = false;
							break;
						}
					}
				}
				else if (typeof(link.allowlink) == "function") {
					// function determining whether to show
					allowed = link.allowlink(args, type);
				}
				else {
					// alway shown
					allowed = true;
				}

				if (allowed) {
					var url = makeLink(link, linkObj, args, key);
					if (url != null) {
						links.push({"link" : getLinkElement(link, url, key, module.MODULE_NAME), "obj" : link});
					}
				}
			}
			links.sort(function(a, b) {
				if (a.obj.img == undefined && b.obj.img == undefined)
					return 0;
				else if (a.obj.img == undefined)
					return 1;
				else if (b.obj.img == undefined)
					return -1;
				else
					return a.obj.title.localeCompare(b.obj.title);
			});
			return links;
		}
	};
}()));
