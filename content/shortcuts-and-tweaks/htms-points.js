/**
* htms-points.js
* Foxtrick show HTMS points in player page
* @author taised
*/

////////////////////////////////////////////////// //////////////////////////////
//---------------------------------------------------------------------------

var FoxtrickHTMSPoints = {
	MODULE_NAME : "HTMSPoints",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["playerdetail", "transferSearchResult", "players"],
	OPTIONS : ["AddToPlayer", "AddToSearchResult", "AddToPlayerList"],

	run : function(page, doc) {
		var getLink = function(skillList) {
			const lang = FoxtrickPrefs.getString("htLanguage");
			const prefix = "http://www.fantamondi.it/HTMS/index.php?page=nt&lang="+lang+"&action=calc";
			var link = doc.createElement("a");
			link.textContent = Foxtrickl10n.getString("HTMSPoints");
			link.href = prefix + skillList;
			return link;
		};

		var request = function(skillList, target) {
			var showResult = function(target, responseXML) {
				try {
					Foxtrick.stopListenToChange(doc);

					var pointsNow=responseXML.getElementsByTagName('HTMS_points').item(0).firstChild.nodeValue;
					var points28=responseXML.getElementsByTagName('HTMS_points_28').item(0).firstChild.nodeValue;

					// Foxtrick.dump('now: '+pointsNow+' - 28: '+points28);

					target.textContent = Foxtrickl10n.getString("HTMSPoints.AbilityAndPotential")
						.replace(/%1/, pointsNow)
						.replace(/%2/, points28);

					Foxtrick.startListenToChange(doc);
				}
				catch (e) {
					Foxtrick.dumpError(e);
				}
			};
			const prefix = "http://www.fantamondi.it/HTMS/nt.php?action=calc";
			Foxtrick.LoadXML(prefix + skillList, function(xml) {
				showResult(target, xml);
			}, true);
		};

		var AddToPlayer = Foxtrick.isModuleFeatureEnabled(this, "AddToPlayer");
		var AddToSearchResult = Foxtrick.isModuleFeatureEnabled(this, "AddToSearchResult");
		var AddToPlayerList = Foxtrick.isModuleFeatureEnabled(this, "AddToPlayerList");

		if ((page=="playerdetail") && AddToPlayer) {
			var age = Foxtrick.Pages.Player.getAge(doc);
			var skills = Foxtrick.Pages.Player.getSkillsWithText(doc);
			if (skills === null)
				return; // no skills available, goodbye

			var skillList='&anni='+age.years+'&giorni='+age.days;
			//checking if bars or not
			var hasBars = (doc.getElementsByClassName("percentImage").length > 0);
			if (hasBars) {
				//bars
				var htmsValues = ['parate', 'difesa', 'regia', 'cross', 'passaggi', 'attacco', 'cp'];
				var j=0;
				for (var i in skills.names) {
					//Foxtrick.dump('text: '+skills.texts[i]+' name: '+skills.names[i]+'\n');
					skillList+='&'+htmsValues[j]+'='+skills.values[i];
					j++;
				}
			}
			else {
				//normal, we skip stamina
				var htmsValues = ['parate', 'regia', 'passaggi', 'cross', 'difesa', 'attacco', 'cp'];
				var skipStamina=true;
				var j=0;
				for (var i in skills.names) {
					if (skipStamina) {
						skipStamina=false;
					}
					else {
						skillList+='&'+htmsValues[j]+'='+skills.values[i];
						j++;
					}
				}
			}

			//creating the new element
			var table = doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlplayerInfo').getElementsByTagName('table').item(0);
			var row = table.insertRow(table.rows.length);
			row.className = "ft-htms-points";
			var link = row.insertCell(0);
			link.appendChild(getLink(skillList));
			var points = row.insertCell(1);
			points.appendChild(Foxtrick.util.note.createLoading(doc, true));

			request(skillList, points);
		}
		if ((page=="transferSearchResult") && AddToSearchResult) {
			var htmsValues = ['parate', 'regia', 'passaggi', 'cross', 'difesa', 'attacco', 'cp'];
			var skillOrder = ["keeper", "playmaking", "passing", "winger", "defending", "scoring", "setPieces"];
			var players=Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
			//Foxtrick.dump('found pp '+players.length+'\n');
			var transferTable = doc.getElementById("mainBody").getElementsByTagName("table")[0];
			var pcells=new Array();
			var cellId=0;
			var rowId=-8;
			for (var p=0; p<players.length; ++p, ++cellId) {
				//searching in which row is the player
				do {
					rowId=rowId+8;
				} while (transferTable.rows[rowId].style.display=='none');

				//getting skills
				var skillList='&anni='+players[cellId].age.years+'&giorni='+players[cellId].age.days;
				for (var i=0;i<7;i++) {
					skillList+='&'+htmsValues[i]+'='+players[cellId][skillOrder[i]];
				}
				//creating element
				var row = transferTable.rows[rowId].getElementsByTagName('table')[0].rows[0];
				var container = row.insertCell(row.cells.length);
				container.className = "ft-htms-points";
				container.appendChild(getLink(skillList));
				container.appendChild(doc.createTextNode(" "));
				var points = doc.createElement("span");
				points.appendChild(Foxtrick.util.note.createLoading(doc, true));
				container.appendChild(points);

				request(skillList, points);
			}
		}
		if ((page=="players") && AddToPlayerList) {
			var htmsValues = ['parate', 'regia', 'passaggi', 'cross', 'difesa', 'attacco', 'cp'];
			var skillOrder = ["keeper", "playmaking", "passing", "winger", "defending", "scoring", "setPieces"];
			var players=Foxtrick.Pages.Players.getPlayerList(doc, true);
			var playersHtml=doc.getElementsByClassName("playerList")[0].getElementsByClassName("playerInfo");
			for (var p=0;p<players.length;p++) {
				//getting skills...
				var skillList='&anni='+players[p].age.years+'&giorni='+players[p].age.days;
				for (var i=0;i<7;i++) {
					skillList+='&'+htmsValues[i]+'='+players[p][skillOrder[i]];
				}

				// create elements
				var container = doc.createElement("div");
				container.className = "ft-htms-points";
				container.appendChild(getLink(skillList));
				container.appendChild(doc.createTextNode(" "));
				var points = doc.createElement("span");
				points.appendChild(Foxtrick.util.note.createLoading(doc, true));
				container.appendChild(points);

				// insert it
				var tables = playersHtml[p].getElementsByTagName("table");
				var before = tables.item(0).nextSibling;
				before.parentNode.insertBefore(container, before);

				request(skillList, points);
			}
		}
	}
};
