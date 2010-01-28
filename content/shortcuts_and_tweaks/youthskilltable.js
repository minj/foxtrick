/**
 * youthskilltable.js
 * Showing skill table on youth player's page
 * @Authors:  convincedd
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickYouthSkillTable = {

    MODULE_NAME : "YouthSkillTable",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('YouthPlayers'),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.0.2",
	LATEST_CHANGE : "Used abbr for better accessibilty and fixed copy empty cells. More options and some moved to table itself",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
    OPTIONS : new Array("CopySkillTable", "AlsoOtherTeams"),

    init : function() {
    },

    run : function(page, doc) {
		try {
			this.tableCreated = false;

			var ownteamid = FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));
			var teamid = FoxtrickHelper.findTeamId(doc.getElementById('content').getElementsByTagName('div')[0]);
			var is_ownteam = (ownteamid==teamid);
			if (!is_ownteam && !Foxtrick.isModuleFeatureEnabled(FoxtrickYouthSkillTable, "AlsoOtherTeams")) return;

			var tablediv = doc.createElement('div');
			tablediv.id = "ft_youthskilltablediv";
			tablediv.className = "ft_skilltablediv";
			var h2 = doc.createElement('h2');
			h2.innerHTML = Foxtrickl10n.getString('Youthskills.Skilltable');
			h2.addEventListener( "click", FoxtrickSkillTable.headerClick, false );
			h2.setAttribute('class','ft_boxBodyCollapsed');
			tablediv.appendChild(h2);
			var header=doc.getElementsByTagName('h1')[0];
			header.parentNode.insertBefore(tablediv,header.nextSibling);

			if (FoxtrickPrefs.getBool("module.YouthSkillTable.show")) {
				FoxtrickSkillTable.toggleDisplay(doc);
			}
		}
		catch(e) {Foxtrick.dump('FoxtrickYouthSkillTable.run error: '+e+'\n');}
	},

	change: function(page, doc) {
	},

	createTable : function(doc) {
		var ownteamid = FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));
		var teamid = FoxtrickHelper.findTeamId(doc.getElementById('content').getElementsByTagName('div')[0]);
		var is_ownteam = (ownteamid==teamid);

		var kind;
		if (is_ownteam) {
			kind = "own";
		}
		else {
			kind = "other";
		}

		var tablediv = doc.getElementById("ft_youthskilltablediv");

		var customize = FoxtrickSkillTable.createCustomize(doc);
		Foxtrick.addClass(customize, "hidden");
		tablediv.appendChild(customize);

		// table headers
		// name: its corresponding name in foxtrick.properties
		// abbr: whether to use an abbreviation
		// pref: preference name of disabling this column
		var sn = [
			{ name: "Player", abbr: false, sort: "link" },
			{ name: "Age", abbr: false, sort: "age" },
			{ name: "Keeper", abbr: true, sort: "text" },
			{ name: "Defending", abbr: true, sort: "text" },
			{ name: "Playmaking", abbr: true, sort: "text" },
			{ name: "Winger", abbr: true, sort: "text" },
			{ name: "Passing", abbr: true, sort: "text" },
			{ name: "Scoring", abbr: true, sort: "text" },
			{ name: "Set_pieces", abbr: true, sort: "text" },
			{ name: "Yellow_card", abbr: true, sort: "text", img: "/Img/Icons/yellow_card.gif" },
			{ name: "Red_card", abbr: true, sort: "text", img: "/Img/Icons/red_card.gif" },
			{ name: "Bruised", abbr: true, sort: "text", img: "/Img/Icons/bruised.gif" },
			{ name: "Injured", abbr: true, sort: "text", img: "/Img/Icons/injured.gif" },
			{ name: "Speciality", abbr: true, sort: "text", pref: "HideSpecialty" },
			{ name: "Last_stars", abbr: true, sort: "text", pref: "HideLastStars", img: "/Img/Matches/star_blue.png" },
			{ name: "Last_position", abbr: true, sort: "text", pref: "HideLastPosition" }
		];

		for (var j = 0; j < sn.length; ++j) {
			if (!is_ownteam && j>=2 && j<=8) {
				sn[j].available = false;
			}
			else {
				sn[j].available = true;
				if (Foxtrick.isModuleFeatureEnabled(FoxtrickYouthSkillTable, kind+'.'+sn[j].name)) {
					sn[j].enabled = true;
				}
			}
		}
		var customizeTable = FoxtrickSkillTable.createCustomizeTable("youth", sn, doc);
		Foxtrick.addClass(customizeTable, "hidden");
		tablediv.appendChild(customizeTable);

		var viewContainer = doc.createElement("div");
		viewContainer.className = "ft_skilltable_viewcont";
		Foxtrick.addClass(viewContainer, "hidden");
		if (FoxtrickPrefs.getBool("module.YouthSkillTable.top")) {
			Foxtrick.addClass(viewContainer, "on_top");
		}
		tablediv.appendChild(viewContainer);

		var view = FoxtrickSkillTable.createView(doc);
		viewContainer.appendChild(view);

		var table = doc.createElement('table');
		table.id = "ft_youthskilltable";
		table.className = "ft_skilltable";
		thead = doc.createElement("thead");
		var tr = doc.createElement('tr');
		thead.appendChild(tr)
		table.appendChild(thead);
		var s_index = 0;
		for (var j = 0; j < sn.length; ++j) {
			if (!is_ownteam && j>=2 && j<=8)
				continue;
			if (Foxtrick.isModuleFeatureEnabled(FoxtrickYouthSkillTable, kind+'.'+sn[j].name)) {
				var th = doc.createElement('th');
				th.setAttribute("s_index", s_index++);
				if (sn[j].sort) {
					th.setAttribute("sort", sn[j].sort);
				}
				th.addEventListener("click", FoxtrickSkillTable.sortClick, false);

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
			}
		}

		var tbody = doc.createElement("tbody");
		table.appendChild(tbody);

		var allDivs = doc.getElementsByTagName("div");
		// get last match
		var latestMatch=-1;
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

		var count =0;
		for(var i = 0; i < allDivs.length; i++) {
			if(allDivs[i].className=="playerInfo") {
				count++;

				var trs = allDivs[i].getElementsByTagName("table")[0].getElementsByTagName("tr");

				var tr = doc.createElement('tr');
				tbody.appendChild(tr);

				var k = 0;

				// name (linked)
				if (Foxtrick.isModuleFeatureEnabled(FoxtrickYouthSkillTable, kind+'.'+sn[k++].name)) {
					var td = doc.createElement('td');
					td.innerHTML = allDivs[i].getElementsByTagName("b")[0].innerHTML;
					tr.appendChild(td);
				}

				// age
				if (Foxtrick.isModuleFeatureEnabled(FoxtrickYouthSkillTable, kind+'.'+sn[k++].name)) {
					var age = allDivs[i].getElementsByTagName("p")[0].innerHTML.match(/(\d+)/g);
					var td = doc.createElement('td');
					td.innerHTML=age[0]+'.'+age[1];
					td.setAttribute('age',age[0]+'.'+(age[1].length==1?('00'+age[1]):(age[1].length==2?('0'+age[1]):age[1])));
					tr.appendChild(td);
				}

				// skills
				if (is_ownteam) {
					for(var j = 0; j < 7; j++) {
						if (Foxtrick.isModuleFeatureEnabled(FoxtrickYouthSkillTable, kind+'.'+sn[j+2].name)) {
							var td = doc.createElement('td');
							tr.appendChild(td);

							var tds = trs[j].getElementsByTagName("td");
							var imgs = tds[1].getElementsByTagName('img');
							if (imgs.length!=0) {
								var max = imgs[0].getAttribute('title').match(/\d/);
								var cur = imgs[1].title.match(/-?\d/);
								var unknown = imgs[1].title.match(/-1/);
								if (!cur) {
									td.innerHTML = max+'/'+max;
									td.setAttribute('class', td.getAttribute('class')+' ft_skilltable_maxed');
								}
								else {
									if (unknown) cur='-';
									if (!max) max='-';
									td.innerHTML = cur+'/'+max;
								}
							}
						}
					}
				}
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

				k = 9;

				if (Foxtrick.isModuleFeatureEnabled(FoxtrickYouthSkillTable, kind+'.'+sn[k++].name)) {
					var td = doc.createElement('td');
					if (cardsyellow>0) {
						td.appendChild(doc.createTextNode(cardsyellow));
					}
					tr.appendChild(td);
				}

				if (Foxtrick.isModuleFeatureEnabled(FoxtrickYouthSkillTable, kind+'.'+sn[k++].name)) {
					var td = doc.createElement('td');
					if (cardsred>0) {
						td.appendChild(doc.createTextNode(cardsred));
					}
					tr.appendChild(td);
				}

				if (Foxtrick.isModuleFeatureEnabled(FoxtrickYouthSkillTable, kind+'.'+sn[k++].name)) {
					var td = doc.createElement('td');
					if (bruised>0) {
						td.appendChild(doc.createTextNode(bruised));
					}
					tr.appendChild(td);
				}
				if (Foxtrick.isModuleFeatureEnabled(FoxtrickYouthSkillTable, kind+'.'+sn[k++].name)) {
					var td = doc.createElement('td');
					if (injured>0) {
						td.appendChild(doc.createTextNode(injured));
					}
					tr.appendChild(td);
				}

				// specialty
				if (Foxtrick.isModuleFeatureEnabled(FoxtrickYouthSkillTable, kind+'.'+sn[k++].name)) {
					var td = doc.createElement('td');
					var specc = allDivs[i].getElementsByTagName( "p" )[0];
					specMatch = specc.textContent.match(/\[(\D+)\]/);
					if (specMatch) {
						var shortspecc = FoxtrickSkillTable._getShortSpecialty(specMatch[1]);
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
				// get played last match
				var as=allDivs[i].getElementsByTagName('a');
				var kk=0,a=null;
				while(a=as[kk++]){if (a.href.search(/matchid/i)!=-1) break;}
				var matchday=0;
				if (a) matchday=Foxtrick.getUniqueDayfromCellHTML(a.innerHTML);

				// stars
				if (Foxtrick.isModuleFeatureEnabled(FoxtrickYouthSkillTable, kind+'.'+sn[k++].name)) {
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
				// last position
				if (Foxtrick.isModuleFeatureEnabled(FoxtrickYouthSkillTable, kind+'.'+sn[k++].name)) {
					var td = doc.createElement('td');
					if (matchday == latestMatch) {
						var pos = a.parentNode.nextSibling.nextSibling.innerHTML.match(/\((.+)\)/)[1];
						var shortpos = FoxtrickSkillTable._getShortPos(pos);
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
				//Foxtrick.dump(matchday+' '+latestMatch+'\n');
			}
		}

		viewContainer.appendChild(table);
	
		// copy button
		if (Foxtrick.isModuleFeatureEnabled( FoxtrickYouthSkillTable, "CopySkillTable" )) {
			FoxtrickSkillTable.addCopyButton(doc);
		}
	}
}
