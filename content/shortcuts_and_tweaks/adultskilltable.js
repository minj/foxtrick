/**
 * adultskilltable.js
 * hide unknown youthskills
 * @Authors:  convincedd
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickAdultSkillTable = {

    MODULE_NAME : "AdultSkillTable",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('players'),
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.5.0.2",
	LATEST_CHANGE:"Used abbr for better accessibilty and fixed copy empty cells. More options and some moved to table itself",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
    OPTIONS : new Array("CopySkillTable","AlsoOtherTeams"),

    init : function() {
    },

    run : function( page, doc ) {
		try  {
			var ownteamid = FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));
			var teamid = FoxtrickHelper.findTeamId(doc.getElementById('content').getElementsByTagName('div')[0]);
			var is_ownteam = (ownteamid==teamid);
			if (!is_ownteam && !Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, 'AlsoOtherTeams')) return;

			var tablediv = doc.createElement('div');
			tablediv.id = "ft_adultskilltablediv";
			tablediv.className = "ft_skilltablediv";
			var h2 = doc.createElement('h2');
			h2.innerHTML = Foxtrickl10n.getString('Youthskills.Skilltable');
			h2.addEventListener( "click", this.HeaderClick, true );
			h2.setAttribute('class','ft_boxBodyCollapsed');
			tablediv.appendChild(h2);
			var header=doc.getElementsByTagName('h1')[0];
			header.parentNode.insertBefore(tablediv,header.nextSibling);
		}
		catch(e) {Foxtrick.dump('FoxtrickAdultSkillTable.run error: '+e+'\n');}
	},

	change : function( page, doc ) {
	},


	copyTable : function( ev ) {
		try {
			var doc = ev.target.ownerDocument;
			var table = doc.getElementById("ft_adultskilltable");
			Foxtrick.copyStringToClipboard(FoxtrickSkillTable.toHtMl(table));
			if (FoxtrickPrefs.getBool( "copyfeedback" ))
				Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.yskilltablecopied"));
		}
		catch (e) {
			Foxtrick.dump("AdultSkillTable: " + e + "\n");
		}
	},

	sortfunction: function(a,b) {return a.cells[FoxtrickAdultSkillTable.s_index].innerHTML.localeCompare(b.cells[FoxtrickAdultSkillTable.s_index].innerHTML);},
	sortindexfunction: function(a,b) {return parseInt(b.cells[FoxtrickAdultSkillTable.s_index].getAttribute('index')) < parseInt(a.cells[FoxtrickAdultSkillTable.s_index].getAttribute('index'));},
	sortdownfunction: function(a,b) {return parseInt(b.cells[FoxtrickAdultSkillTable.s_index].innerHTML.replace(/\&nbsp| /g,'')) > parseInt(a.cells[FoxtrickAdultSkillTable.s_index].innerHTML.replace(/\&nbsp| /g,''));},
	sortdowntextfunction: function(a,b) {return (b.cells[FoxtrickAdultSkillTable.s_index].innerHTML.localeCompare(a.cells[FoxtrickAdultSkillTable.s_index].innerHTML));},
	sortlinksfunction: function(a,b) {return a.cells[FoxtrickAdultSkillTable.s_index].getElementsByTagName('a')[0].innerHTML.localeCompare(b.cells[FoxtrickAdultSkillTable.s_index].getElementsByTagName('a')[0].innerHTML);},
	sortagefunction: function(a,b) {return a.cells[FoxtrickAdultSkillTable.s_index].getAttribute('age').localeCompare(b.cells[FoxtrickAdultSkillTable.s_index].getAttribute('age'));},

	sortClick : function(ev,doc,index,sort) {
		try{
			if (ev) {
				var doc = ev.target.ownerDocument;
				FoxtrickAdultSkillTable.s_index = ev.target.getAttribute('s_index');
				FoxtrickAdultSkillTable.sort = ev.target.getAttribute('sort');
				if (!FoxtrickAdultSkillTable.s_index) {
					FoxtrickAdultSkillTable.s_index = ev.target.parentNode.getAttribute('s_index');
					FoxtrickAdultSkillTable.sort = ev.target.parentNode.getAttribute('sort');
				}
			}
			else {
				FoxtrickAdultSkillTable.s_index = index;
				FoxtrickAdultSkillTable.sort = sort;
			}
			var tablediv = doc.getElementById('ft_adultskilltablediv');
			var table = tablediv.getElementsByTagName('table')[0];
			var table_old = table.cloneNode(true);
			Foxtrick.dump('sortby: '+FoxtrickAdultSkillTable.s_index+' '+FoxtrickAdultSkillTable.sort+'\n');

			var rows = new Array();
			for (var i=2;i<table.rows.length;++i) {
				rows.push(table_old.rows[i]);
			}
			//table.rows[3].innerHTML = table_old.rows[1].innerHTML;
			if (FoxtrickAdultSkillTable.sort == "link")
				rows.sort(FoxtrickAdultSkillTable.sortlinksfunction);
			else if (FoxtrickAdultSkillTable.sort == "age")
				rows.sort(FoxtrickAdultSkillTable.sortagefunction);
			else if (FoxtrickAdultSkillTable.sort == "int")
				rows.sort(FoxtrickAdultSkillTable.sortdownfunction);
			else if (FoxtrickAdultSkillTable.sort == "index")
				rows.sort(FoxtrickAdultSkillTable.sortindexfunction);
			else if (FoxtrickAdultSkillTable.sort == "text")
				rows.sort(FoxtrickAdultSkillTable.sortdowntextfunction);

			for (var i=2;i<table.rows.length;++i) {
				table.rows[i].innerHTML = rows[i-2].innerHTML;
			}
		}
		catch(e) {Foxtrick.dump('sortClick '+e+'\n');}
	},

	customize : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			doc.getElementById('customizelinkid').setAttribute('style','display:none;');
			doc.getElementById('customizesavelinkid').setAttribute('style','display:inline;cursor:pointer;');
			doc.getElementById('customizecancellinkid').setAttribute('style','display:inline; cursor:pointer; margin-left:10px;');
			doc.getElementById('customizerow').setAttribute('style','display:table-row');

			var tablediv = doc.getElementById('ft_adultskilltablediv');
			var ths = tablediv.getElementsByTagName('tr')[0].getElementsByTagName('th'); 
			for (var i=0;i<ths.length;++i) ths[i].setAttribute('style','display:table-cell');		// disabled in preferences
			tablediv.getElementsByTagName('tbody')[0].setAttribute('style','display:none'); 

		}catch(e) {Foxtrick.dump('customize '+e+'\n');}
	},

	customizesave : function(ev) {
		try {
			var doc = ev.target.ownerDocument;

			var ownteamid = FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));
			var teamid = FoxtrickHelper.findTeamId(doc.getElementById('content').getElementsByTagName('div')[0]);
			var is_ownteam = (ownteamid==teamid);
			Foxtrick.dump('is_ownteam: '+is_ownteam+'\n');

			var kind='own';
			if (!is_ownteam) kind='other';

			var tablediv = doc.getElementById('ft_adultskilltablediv');
			var input = tablediv.getElementsByTagName('input'); 
			for (var i=0;i<input.length;++i) {
				FoxtrickPrefs.setBool( "module." + FoxtrickAdultSkillTable.MODULE_NAME + "." + kind+'.'+input[i].name + ".enabled", input[i].checked );
			}
			doc.location.reload();			
		}catch(e) {Foxtrick.dump('customize '+e+'\n');}
	},

	customizecancel : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			doc.location.reload();			
		}catch(e) {Foxtrick.dump('customize '+e+'\n');}
	},

	HeaderClick : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			var tablediv = doc.getElementById('ft_adultskilltablediv');
			var NT_players = (doc.location.href.indexOf("NTPlayers") != -1);
			var Oldies = (doc.location.href.indexOf("Oldies.aspx") != -1);			
			var Youth_players = (doc.location.href.indexOf("YouthPlayers\.aspx") != -1);
			var coach = (doc.location.href.indexOf("Coaches\.aspx") != -1);
			var OldiesCoach = (Oldies || coach)
			var ownteamid = FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));
			var teamid = FoxtrickHelper.findTeamId(doc.getElementById('content').getElementsByTagName('div')[0]);
			var is_ownteam = (ownteamid==teamid);
			Foxtrick.dump('is_ownteam:'+is_ownteam+' Oldies:'+Oldies+' coach:'+coach+' NT_players:'+NT_players+'\n');
					
			var table = tablediv.getElementsByTagName('table')[0]
			if (!table || table.style.display=='none')  {
				tablediv.getElementsByTagName('h2')[0].setAttribute('class','ft_boxBodyUnfolded');
				if (table) {
					table.style.display = "table";
					doc.getElementById('customizediv').setAttribute('style','display:inline');
					return;
				}

				var customizediv = doc.createElement('div');
				customizediv.id='customizediv';
				var customizesavelink = doc.createElement('a');
				customizesavelink.id='customizesavelinkid';
				customizesavelink.innerHTML=Foxtrickl10n.getString('foxtrick.prefs.buttonSave');
				customizesavelink.addEventListener('click',FoxtrickAdultSkillTable.customizesave,true);
				customizesavelink.setAttribute('style','display:none; cursor:pointer;');
				customizediv.appendChild(customizesavelink);
			
				var customizecancellink = doc.createElement('a');
				customizecancellink.id='customizecancellinkid';
				customizecancellink.innerHTML=Foxtrickl10n.getString('foxtrick.prefs.buttonCancel');
				customizecancellink.addEventListener('click',FoxtrickAdultSkillTable.customizecancel,true);
				customizecancellink.setAttribute('style','display:none; cursor:pointer;');
				customizediv.appendChild(customizecancellink);

				var customizelink = doc.createElement('a');
				customizelink.id='customizelinkid';
				customizelink.innerHTML=Foxtrickl10n.getString('foxtrick.prefs.buttonCustomize');
				customizelink.addEventListener('click',FoxtrickAdultSkillTable.customize,true);
				customizelink.setAttribute('style','cursor:pointer;');
				customizediv.appendChild(customizelink);
				tablediv.appendChild(customizediv);

				var kind='own';
				if (!is_ownteam) kind='other';
				
				var hasbars=true;
				var allDivs = doc.getElementsByTagName("div");
				if (is_ownteam && !Oldies && !coach) {
					for (var i = 0; i < allDivs.length; i++) {
						if(allDivs[i].className=="playerInfo") {
							var trs = allDivs[i].getElementsByTagName("table")[0].getElementsByTagName("tr");
							if (trs.length==4) {hasbars=false; break;}
						}
					}
					Foxtrick.dump('hasbars: '+hasbars+'\n');
				}

				table = doc.createElement('table');
				table.id = "ft_adultskilltable";
				table.className = "ft_skilltable";
				thead = doc.createElement("thead");
				var tr = doc.createElement('tr');
				thead.appendChild(tr);
				var tr2 = doc.createElement('tr');
				tr2.id='customizerow';
				tr2.setAttribute('style','display:none');
				thead.appendChild(tr2);
				table.appendChild(thead);

				var sn;
				if (hasbars) {
					sn = [
						{ name: "PlayerNumber", abbr: true, sort: "index",NT:false ,OldiesCoach:false},
						{ name: "Flag", abbr: false, sort: "link" ,NT:false ,OldiesCoach:false},
						{ name: "Player", abbr: false, sort: "link",NT:true ,OldiesCoach:true },
						{ name: "Age", abbr: false, sort: "age" ,NT:true ,OldiesCoach:true},
						{ name: "TSI", abbr: true, sort: "int",NT:true ,OldiesCoach:true },
						{ name: "Agreeability", abbr: true, sort: "int",NT:false ,OldiesCoach:true},
						{ name: "Aggressiveness", abbr: true, sort: "int" ,NT:false ,OldiesCoach:true},
						{ name: "Honesty", abbr: true, sort: "int",NT:false ,OldiesCoach:true},
						{ name: "Leadership", abbr: true, sort: "int" ,NT:true ,OldiesCoach:true},
						{ name: "Experience", abbr: true, sort: "int",NT:true ,OldiesCoach:true},
						{ name: "Form", abbr: true, sort: "int",NT:true ,OldiesCoach:true },
						{ name: "Stamina", abbr: true, sort: "int" ,NT:true ,OldiesCoach:true},
						{ name: "Keeper", abbr: true, sort: "int" },
						{ name: "Defending", abbr: true, sort: "int" },
						{ name: "Playmaking", abbr: true, sort: "int" },
						{ name: "Winger", abbr: true, sort: "int" },
						{ name: "Passing", abbr: true, sort: "int" },
						{ name: "Scoring", abbr: true, sort: "int" },
						{ name: "Set_pieces", abbr: true, sort: "int" },
						{ name: "Yellow_card", abbr: true, sort: "text",NT:true ,OldiesCoach:true, img: "/Img/Icons/yellow_card.gif" },
						{ name: "Red_card", abbr: true, sort: "text",NT:true ,OldiesCoach:true, img: "/Img/Icons/red_card.gif" },
						{ name: "Bruised", abbr: true, sort: "text",NT:true ,OldiesCoach:true, img: "/Img/Icons/bruised.gif" },
						{ name: "Injured", abbr: true, sort: "text",NT:true ,OldiesCoach:true, img: "/Img/Icons/injured.gif" },
						{ name: "Speciality", abbr: true, sort: "text" ,NT:true ,OldiesCoach:true},
						{ name: "Last_stars", abbr: true, sort: "text",NT:false ,OldiesCoach:false, img: "/Img/Matches/star_blue.png" },
						{ name: "Last_position", abbr: true, sort: "text",NT:false ,OldiesCoach:false },
						{ name: "Salary", abbr: false, sort: "int",NT:false ,OldiesCoach:false},
						{ name: "TransferListed", abbr: true, sort: "int",NT:false ,OldiesCoach:true, img: "/Img/Icons/dollar.gif" },
						{ name: "NrOfMatches", abbr: true, sort: "int",NT:true ,OldiesCoach:false},						
						{ name: "LeagueGoals", abbr: true, sort: "int",NT:false ,OldiesCoach:true},
						{ name: "CareerGoals", abbr: true, sort: "int",NT:false ,OldiesCoach:true}						
					];
				}
				else {
					sn = [
						{ name: "PlayerNumber", abbr: true, sort: "index",NT:false,OldiesCoach:false  },
						{ name: "Flag", abbr: false, sort: "link",NT:false ,OldiesCoach:false },
						{ name: "Player", abbr: false, sort: "link",NT:true,OldiesCoach:true  },
						{ name: "Age", abbr: false, sort: "age",NT:true,OldiesCoach:true  },
						{ name: "TSI", abbr: true, sort: "int",NT:true ,OldiesCoach:true },
						{ name: "Agreeability", abbr: true, sort: "int",NT:false ,OldiesCoach:true },
						{ name: "Aggressiveness", abbr: true, sort: "int",NT:false ,OldiesCoach:true },
						{ name: "Honesty", abbr: true, sort: "int",NT:false ,OldiesCoach:true },
						{ name: "Leadership", abbr: true, sort: "int",NT:true ,OldiesCoach:true },
						{ name: "Experience", abbr: true, sort: "int",NT:true ,OldiesCoach:true },
						{ name: "Form", abbr: true, sort: "int",NT:true ,OldiesCoach:true },
						{ name: "Stamina", abbr: true, sort: "int",NT:true ,OldiesCoach:true },
						{ name: "Keeper", abbr: true, sort: "int" },
						{ name: "Playmaking", abbr: true, sort: "int" },
						{ name: "Passing", abbr: true, sort: "int" },
						{ name: "Winger", abbr: true, sort: "int" },
						{ name: "Defending", abbr: true, sort: "int" },
						{ name: "Scoring", abbr: true, sort: "int" },
						{ name: "Set_pieces", abbr: true, sort: "int" },
						{ name: "Yellow_card", abbr: true, sort: "text",NT:true, OldiesCoach:true, img: "/Img/Icons/yellow_card.gif" },
						{ name: "Red_card", abbr: true, sort: "text",NT:true, OldiesCoach:true , img: "/Img/Icons/red_card.gif" },
						{ name: "Bruised", abbr: true, sort: "text",NT:true ,OldiesCoach:true, img: "/Img/Icons/bruised.gif" },
						{ name: "Injured", abbr: true, sort: "text",NT:true ,OldiesCoach:true, img: "/Img/Icons/injured.gif" },
						{ name: "Speciality", abbr: true, sort: "text",NT:true ,OldiesCoach:true },
						{ name: "Last_stars", abbr: true, sort: "text",NT:false ,OldiesCoach:false, img: "/Img/Matches/star_blue.png" },
						{ name: "Last_position", abbr: true, sort: "text",NT:false ,OldiesCoach:false }, 
						{ name: "Salary", abbr: false, sort: "int",NT:false ,OldiesCoach:false },
						{ name: "TransferListed", abbr: true, sort: "int",NT:false ,OldiesCoach:true, img: "/Img/Icons/dollar.gif" },
						{ name: "NrOfMatches", abbr: true, sort: "int",NT:true ,OldiesCoach:false}, 						
						{ name: "LeagueGoals", abbr: true, sort: "int",NT:false ,OldiesCoach:true },
						{ name: "CareerGoals", abbr: true, sort: "int",NT:false ,OldiesCoach:true }						
					];
				}
				var s_index = 0;
				for (var j = 0; j < sn.length; j++) {
					if ((!is_ownteam || Oldies || NT_players || coach) && j>=12 && j<=18)
						continue;
					if ((OldiesCoach && sn[j].OldiesCoach==false) || (NT_players && sn[j].NT==false)) continue;
					if (!NT_players && sn[j].name=='NrOfMatches') continue;
					
					var th = doc.createElement('th');					
					var th2 = doc.createElement('th');					
					var check = doc.createElement( "input" );	
					check.setAttribute( "type", "checkbox" );
					check.setAttribute( "name", sn[j].name );
					check.setAttribute( "id", sn[j].name ); 
					if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[j].name) && (!OldiesCoach || sn[j].OldiesCoach==true) && (!NT_players || sn[j].NT==true)) {
						check.setAttribute( "checked", "checked" );
						th.setAttribute("s_index", s_index++);
					}
					else {
						th.style.display = "none"; // disabled in preferences
					}
					if (sn[j].sort) {
						th.setAttribute("sort", sn[j].sort);
					}
					th.addEventListener("click", FoxtrickAdultSkillTable.sortClick, true);
					th2.appendChild( check );
					
					
					if (sn[j].abbr) {
						if (sn[j].img) {
							var img = doc.createElement("img");
							img.setAttribute("src", sn[j].img);
							img.setAttribute("alt", Foxtrickl10n.getString(sn[j].name + ".abbr"));
							img.setAttribute("title", Foxtrickl10n.getString(sn[j].name));
							th.appendChild(img);
						}
						else {
							var abbr = doc.createElement("abbr");
							abbr.setAttribute("title", Foxtrickl10n.getString(sn[j].name));
							abbr.appendChild(doc.createTextNode(Foxtrickl10n.getString(sn[j].name + ".abbr")));
							th.appendChild(abbr);
						}
					}
					else {
						if (sn[j].img) {
							var img = doc.createElement("img");
							img.setAttribute("src", sn[j].img);
							img.setAttribute("alt", Foxtrickl10n.getString(sn[j].name));
							img.setAttribute("title", Foxtrickl10n.getString(sn[j].name));
						}
						else {
							th.appendChild(doc.createTextNode(Foxtrickl10n.getString(sn[j].name)));
						}
					}
					tr.appendChild(th);
					tr2.appendChild(th2);
				}

				var tbody = doc.createElement("tbody");
				table.appendChild(tbody);

				// get last match
				var latestMatch=-1;
				if (!Oldies && !NT_players && !coach) {
					for(var i = 0; i < allDivs.length; i++) {
						if(allDivs[i].className=="playerInfo") {
							var as=allDivs[i].getElementsByTagName('a');
							var j=0,a=null;
							while(a=as[j++]){if (a.href.search(/matchid/i)!=-1) break;}
							var matchday=0;
							if (a) matchday=Foxtrick.getUniqueDayfromCellHTML(a.innerHTML);
							if (matchday>latestMatch) latestMatch = matchday;
						}
					}
				}

				var count =0;
				for(var i = 0; i < allDivs.length; i++) {
					if(allDivs[i].className=="playerInfo") {
						count++;
						var k=0;
						var sktable = allDivs[i].getElementsByTagName("table")[0];
						if (sktable && sktable.parentNode.className.search('myht2')!=-1) sktable=null;
						if (sktable) var trs = sktable.getElementsByTagName("tr");

						var hasflag = (allDivs[i].getElementsByTagName("a")[0].innerHTML.search(/flags.gif/i)!=-1);
						var link_off=0;
						if (hasflag) link_off=1;

						if (Foxtrick.XMLData.playersxml) {
							var playerid = allDivs[i].getElementsByTagName("a")[0+link_off].href.replace(/.+playerID=/i, "").match(/^\d+/)[0];
				 
							var playerlist = Foxtrick.XMLData.playersxml.getElementsByTagName('Player');
							for (var j=0; j<playerlist.length; ++j) { 
								var thisPlayerID = playerlist[j].getElementsByTagName('PlayerID')[0].textContent;
								if (thisPlayerID==playerid) {
								  if (NT_players) {
									var NrOfMatches = playerlist[j].getElementsByTagName('NrOfMatches')[0].textContent;										
								  }
								  else {
									var Agreeability  = playerlist[j].getElementsByTagName('Agreeability')[0].textContent;	
									var Aggressiveness  = playerlist[j].getElementsByTagName('Aggressiveness')[0].textContent;	
									var Honesty  = playerlist[j].getElementsByTagName('Honesty')[0].textContent;	
									var LeagueGoals  = playerlist[j].getElementsByTagName('LeagueGoals')[0].textContent;
									if (LeagueGoals=='NOT AVAILABLE') LeagueGoals='';
									var CareerGoals = playerlist[j].getElementsByTagName('CareerGoals')[0].textContent;	
									if (CareerGoals=='NOT AVAILABLE') CareerGoals='';
									var TransferListed = playerlist[j].getElementsByTagName('TransferListed')[0].textContent;	//Returns 1 if the player is on the transfer list, otherwise 0.
									var NationalTeamID = playerlist[j].getElementsByTagName('NationalTeamID')[0].textContent;	//If the player is enrolled on a national team, this is that national team's ID. Otherwise will return 0. 
									//var Caps = playerlist[j].getElementsByTagName('Caps')[0].textContent;	//The number of matches played for the national team. 
									var Salary = playerlist[j].getElementsByTagName('Salary')[0].textContent;																		
									var Leadership = playerlist[j].getElementsByTagName('Leadership')[0].textContent;	
									var Experience = playerlist[j].getElementsByTagName('Experience')[0].textContent;
									var CountryID = playerlist[j].getElementsByTagName('CountryID')[0].textContent;	
									var LeagueID = Foxtrick.XMLData.countryid_to_leagueid[CountryID];	
									var TrainerData  = playerlist[j].getElementsByTagName('TrainerData')[0];	
									var PlayerNumber  = playerlist[j].getElementsByTagName('PlayerNumber')[0].textContent;	
									
									break;
								  }
								}	
							}
						}

						
						var tr = doc.createElement('tr');
						tbody.appendChild(tr);

						// PlayerNumber
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 td.setAttribute('style','text-align:right !important;');
						 var val = PlayerNumber;
						 td.setAttribute('index',val);						 
						 if (val==100) val='';
						 td.appendChild(doc.createTextNode(val));
						 tr.appendChild(td);
						} 
						k++;

						// flag
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 	var td = doc.createElement('td');
							var a=doc.createElement('a');
							a.href='';
							a.className ="flag inner"; 						
							var img=doc.createElement('img');
							var style="vertical-align:top; margin-top:1px; background: transparent url(/Img/Flags/flags.gif) no-repeat scroll "+ (-20)*LeagueID+"px 0pt; -moz-background-clip: -moz-initial; -moz-background-origin: -moz-initial; -moz-background-inline-policy: -moz-initial;";
							img.setAttribute('style',style); 
							img.src="/Img/Icons/transparent.gif";						
							a.appendChild(img);							
							td.appendChild(a);							
							tr.appendChild(td);
						}
						k++;

						// name (linked)
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 td.appendChild(allDivs[i].getElementsByTagName("a")[0+link_off].cloneNode(true));
						 if (TrainerData)  td.setAttribute('style','font-weight:bold;');
						 tr.appendChild(td);
						}
						k++;

						// age
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {						 var age = allDivs[i].getElementsByTagName("p")[0].innerHTML.match(/(\d+)/g);
						 var td = doc.createElement('td');
						 td.innerHTML=age[0]+'.'+age[1];
						 td.setAttribute('age',age[0]+'.'+(age[1].length==1?('00'+age[1]):(age[1].length==2?('0'+age[1]):age[1])));
						 tr.appendChild(td);
						}
						k++;
						
						var specc = allDivs[i].getElementsByTagName( "p" )[0];

						// tsi
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 td.setAttribute('style','text-align:right !important;');
						 var tsitot_in = allDivs[i].getElementsByTagName('p')[0].innerHTML.substr(0,specc.innerHTML.lastIndexOf('<br>'));
						 if (Oldies || NT_players) tsitot_in = tsitot_in.substr(0,tsitot_in.lastIndexOf('<br>'));
						 //Foxtrick.dump (' => tsitot_in => [' + tsitot_in + ']\n');
						 if (tsitot_in.search(/^\s*TSI/) != -1)
							tsitot_in = tsitot_in.replace(/,.+/,''); // In the language Vlaams, TSI and age are switched. This is a fix for that
						 var lastindex = tsitot_in.lastIndexOf(' ');
						 if (tsitot_in.lastIndexOf('=') > lastindex)
							lastindex = tsitot_in.lastIndexOf('=');
						 tsitot_in = tsitot_in.substr(lastindex+1).replace('&nbsp;','');
						 tsitot_in = parseInt(tsitot_in);
						 td.appendChild(doc.createTextNode(tsitot_in));
						 tr.appendChild(td);
						}
						k++;

						// Agreeability
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 td.setAttribute('style','text-align:right !important;');
						 var val = Agreeability;
						 td.appendChild(doc.createTextNode(val));
						 tr.appendChild(td);
						}
						k++;

						// Aggressiveness
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 td.setAttribute('style','text-align:right !important;');
						 var val = Aggressiveness;
						 td.appendChild(doc.createTextNode(val));
						 tr.appendChild(td);
						}
						k++;

						// Honesty
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 td.setAttribute('style','text-align:right !important;');
						 var val = Honesty;
						 td.appendChild(doc.createTextNode(val));
						 tr.appendChild(td);
						}
						k++;

						// Leadership
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 td.setAttribute('style','text-align:right !important;');
						 if (NT_players) var val = allDivs[i].getElementsByTagName("a")[3+link_off].href.match(/ll=(\d+)/)[1];
						 else var val = Leadership;
						 td.appendChild(doc.createTextNode(val));
						 tr.appendChild(td);
						}
						k++;
						
						// Experience
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 td.setAttribute('style','text-align:right !important;');
						 var val = Experience;
						 if (NT_players) var val = allDivs[i].getElementsByTagName("a")[4+link_off].href.match(/ll=(\d+)/)[1];
						 else var val = Experience;
						 td.appendChild(doc.createTextNode(val));
						 tr.appendChild(td);
						}
						k++;

						// form
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 td.setAttribute('style','text-align:right !important;');
						 var val = allDivs[i].getElementsByTagName("a")[1+link_off].href.match(/ll=(\d+)/)[1];
						 td.appendChild(doc.createTextNode(val));
						 tr.appendChild(td);
						}
						k++;
						
						// stamina
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 td.setAttribute('style','text-align:right !important;');
						 var val = allDivs[i].getElementsByTagName("a")[2+link_off].href.match(/ll=(\d+)/)[1];
						 td.appendChild(doc.createTextNode(val));
						 tr.appendChild(td);
						}
						k++;


						// skills
						if (is_ownteam && !Oldies && !NT_players && !coach ) {
							var start=0,end=7,inc=1;
							if (!hasbars) {start=2,end=16;inc=2;}
							for(var j = start; j < end; j+=inc) {
							if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k++].name)) {
								var td = doc.createElement('td');
								td.setAttribute('style','text-align:right !important;');
								tr.appendChild(td);

								if (sktable) {
									if (hasbars) {
										var tds = trs[j].getElementsByTagName("td");
										var imgs = tds[1].getElementsByTagName('img');
										var cur = imgs[0].title.match(/-?\d+/);
										td.innerHTML = cur;
									}
									else {
										var tds= allDivs[i].getElementsByTagName("table")[0].getElementsByTagName("td");
										var cur = tds[j+1].getElementsByTagName('a')[0].href.match(/ll=(\d+)/)[1];
										td.innerHTML = cur;
									}
								}
							}
							}
						}
						else {k+=7;}
						
						// card+injuries
						var cardsyellow=0;
						var cardsred=0;
						var bruised=0;
						var injured=0;
						var img = allDivs[i].getElementsByTagName("img");

						for(var j = 0; j < img.length; j++) {
							if (img[j].className=='cardsOne') {
								if (img[j].src.indexOf('red_card', 0) != -1 ) cardsred = 1;
								else cardsyellow=1;
							}
							if (img[j].className=='cardsTwo') {
								cardsyellow=2;
							}
							if (img[j].className=='injuryBruised') bruised=1;
							if (img[j].className=='injuryInjured') injured = img[j].nextSibling.innerHTML;
						}

						// yellow cards
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 if (cardsyellow>0) {
							td.appendChild(doc.createTextNode(cardsyellow));
						 }
						 tr.appendChild(td);
						}
						k++;

						// red cards
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 if (cardsred>0) {
							td.appendChild(doc.createTextNode(cardsred));
						 }
						 tr.appendChild(td);
						}
						k++;
						
						// bruised
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 if (bruised>0) {
							td.appendChild(doc.createTextNode(bruised));
						 }
						 tr.appendChild(td);
						}
						k++;
						
						// injured
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 if (injured>0) {
							td.appendChild(doc.createTextNode(injured));
						 }
						 tr.appendChild(td);
						}
						k++;

						// specialty
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
							var td = doc.createElement('td');
							specMatch = specc.textContent.match(/\[(\D+)\]/);
							if (specMatch) {
								var shortspecc = FoxtrickAdultSkillTable._getShortSpecialty(specMatch[1]);
								if (shortspecc) {
									specMatch = shortspecc;
								}
								else {
									specMatch = specMatch[1].substr(0,2);
									Foxtrick.dump('fallback '+specMatch+'\n')
								}
							}
							else specMatch='';
							td.appendChild(doc.createTextNode(specMatch));
							tr.appendChild(td);
						}
						k++;

						// get played last match
						var as=allDivs[i].getElementsByTagName('a');
						var kk=0,a=null;
						while(a=as[kk++]){if (a.href.search(/matchid/i)!=-1) break;}
						var matchday=0;
						if (a) matchday=Foxtrick.getUniqueDayfromCellHTML(a.innerHTML);

						// stars
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
							var td = doc.createElement('td');
							if (matchday==latestMatch) {
								var imgs=a.parentNode.parentNode.getElementsByTagName('img');
								var starcount=0;
								for (var sc=0;sc<imgs.length;++sc) {
									if (imgs[sc].className=='starBig') starcount+=5;
									else if (imgs[sc].className=='starWhole') starcount+=1;
									else if (imgs[sc].className=='starHalf') starcount+=0.5;
								}
								td.appendChild(doc.createTextNode(starcount));
							}
							tr.appendChild(td);
						}
						k++;

						// last position
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
							var td = doc.createElement('td');
							if (matchday == latestMatch) {
								var pos = a.parentNode.nextSibling.nextSibling.innerHTML.match(/\((.+)\)/)[1];
								var shortpos = FoxtrickAdultSkillTable._getShortPos(pos);
								if (shortpos) {
									pos = shortpos;
								}
								else {
									var sp_pos = pos.search(/ |\&nbsp;/);
									if (sp_pos == -1) pos=pos.substr(0,2)
									else pos = pos.substr(0,1)+pos.substr(sp_pos+1,1);
									Foxtrick.dump('fallback '+pos+'\n')
								}
								td.appendChild(doc.createTextNode(pos));
							}
							tr.appendChild(td);
						}
						k++;

						// Salary
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 td.setAttribute('style','text-align:right !important;');
						 var val = Salary;
						 td.appendChild(doc.createTextNode(val));
						 tr.appendChild(td);
						}
						k++;

						// TransferListed
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 td.setAttribute('style','text-align:right !important;');
						 var val = TransferListed;
						 td.appendChild(doc.createTextNode(val));
						 tr.appendChild(td);
						}
						k++;

						// #matches ntplayers only
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && NT_players) {
						 var td = doc.createElement('td');
						 var val = NrOfMatches;
						 td.appendChild(doc.createTextNode(val));
						 tr.appendChild(td);
						}
						k++;

						// LeagueGoals
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 var val = LeagueGoals;
						 td.appendChild(doc.createTextNode(val));
						 tr.appendChild(td);
						}
						k++;

						// CareerGoals
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickAdultSkillTable, kind+'.'+sn[k].name) && (!OldiesCoach || sn[k].OldiesCoach==true) && (!NT_players || sn[k].NT==true)) {
						 var td = doc.createElement('td');
						 var val = CareerGoals;
						 td.appendChild(doc.createTextNode(val));
						 tr.appendChild(td);
						}
						k++;

						//Foxtrick.dump(matchday+' '+latestMatch+'\n');
					}
				}

				tablediv.appendChild(table);

				// copy button
				if (Foxtrick.isModuleFeatureEnabled( FoxtrickAdultSkillTable, "CopySkillTable" )) {
					if (FoxtrickPrefs.getBool( "smallcopyicons" )) {
						if (doc.getElementById('copyskilltable')) return;
						var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
						if (boxHead.className!='boxHead') return;

						if (Foxtrick.isStandardLayout(doc)) doc.getElementById('mainBody').setAttribute('style','padding-top:20px;');

						var messageLink = doc.createElement("a");
						messageLink.className = "inner copyicon copyplayerad ci_first";
						messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copyskilltable" );
						messageLink.id = "copyskilltable" ;
						messageLink.addEventListener("click", FoxtrickAdultSkillTable.copyTable, false)

						var img = doc.createElement("img");
						img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyskilltable" );
						img.src = Foxtrick.ResourcePath+"resources/img/transparent_002.gif";

						messageLink.appendChild(img);
						boxHead.insertBefore(messageLink,boxHead.firstChild);
					}
					else {
						var parentDiv = doc.createElement("div");
						parentDiv.id = "foxtrick_copy_parentDiv";

						var messageLink = doc.createElement("a");
						messageLink.className = "inner";
						messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copyskilltable" );
						messageLink.setAttribute("style","cursor: pointer;");
						messageLink.addEventListener("click", FoxtrickAdultSkillTable.copyTable, false)

						var img = doc.createElement("img");
						img.style.padding = "0px 5px 0px 0px;";
						img.className = "actionIcon";
						img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyskilltable" );
						img.src = Foxtrick.ResourcePath+"resources/img/copyplayerad.png";
						messageLink.appendChild(img);

						parentDiv.appendChild(messageLink);

						var newBoxId = "foxtrick_actions_box";
						Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString(
							"foxtrick.tweaks.actions" ), parentDiv, newBoxId, "first", "");
					}
				}
				//sorting by playernumer. slow!
				//FoxtrickAdultSkillTable.sortClick(null,doc,0,'int_rev');
			}
			else {
				table.style.display='none';
				doc.getElementById('customizediv').setAttribute('style','display:none');
				tablediv.getElementsByTagName('h2')[0].setAttribute('class','ft_boxBodyCollapsed');
			}
		}
		catch(e) {Foxtrick.dump(k+'SkillTableHeaderClick: '+e+'\n');}
	},

	_getShortPos: function(pos) {
		var short_pos='';
		try {
		  var lang = FoxtrickPrefs.getString("htLanguage");
		}
		catch (e) {
		  return null;
		}

		try {
			var type = pos.replace(/&nbsp;/,' ');
			var path = "hattricklanguages/language[@name='" + lang + "']/positions/position[@value='" + type + "']";
			short_pos = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml, path, "short");
			return short_pos
		}
		catch (e) {
			Foxtrick.dump('youthskill.js _getShort: '+e + "\n");
			return null;
		}

		return short_pos;
	},

	_getShortSpecialty: function(pos)
	{
		var short_pos='';
		try {
		  var lang = FoxtrickPrefs.getString("htLanguage");
		}
		catch (e) {
		  return null;
		}

		try {
			var type = pos.replace(/&nbsp;/,' ');
			var path = "hattricklanguages/language[@name='" + lang + "']/specialties/specialty[@value='" + type + "']";
			short_pos = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml, path, "short");
			return short_pos
		}
		catch (e) {
			Foxtrick.dump('youthskill.js _getShort: '+e + "\n");
			return null;
		}

		return short_pos;
	},
}
