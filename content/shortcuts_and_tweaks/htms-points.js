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
		var lang = FoxtrickPrefs.getString("htLanguage");
		var pageBase = "http://www.fantamondi.it/HTMS/nt.php?action=calc";
		var linkpage = "http://www.fantamondi.it/HTMS/index.php?page=nt&lang="+lang+"&action=calc";

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
			var ptable=doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlplayerInfo').getElementsByTagName('table').item(0);
			var nrow=ptable.insertRow(ptable.rows.length);
			var hcell=nrow.insertCell(0);
			hcell.innerHTML='<a href="'+linkpage+skillList+'" target="_blank">'+Foxtrickl10n.getString('HTMSPoints')+'</a>';
			var ccell=nrow.insertCell(1);
			ccell.id='ft-htms-points-0';

			Foxtrick.LoadXML(pageBase + skillList, (function(target) {
					return function(xml) {
						FoxtrickHTMSPoints.show_result(target, xml);
					};
					})(ccell), true);
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
			for (var p=0;p<players.length;p++) {
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
				var prow=transferTable.rows[rowId].getElementsByTagName('table')[0].rows[0];
				var pcell=prow.insertCell(prow.cells.length);
				pcell.innerHTML='<a href="'+linkpage+skillList+'" target="_blank">'+Foxtrickl10n.getString('HTMSPoints')+'</a>';
				var pcell2=prow.insertCell(prow.cells.length);
				pcell2.id='ft-htms-points-'+cellId;

				Foxtrick.LoadXML(pageBase + skillList, (function(target) {
					return function(xml) {
						FoxtrickHTMSPoints.show_result(target, xml);
					};
					})(pcell2), true);
				cellId++;
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

				//creating elements
				var parag=playersHtml[p].getElementsByTagName('p')[0];
				parag.appendChild(doc.createElement('br'));
				var htmsLink=doc.createElement('a');
				htmsLink.href=linkpage+skillList;
				htmsLink.target='_blank';
				htmsLink.textContent=Foxtrickl10n.getString('HTMSPoints')+" ";
				parag.appendChild(htmsLink);
				var htmsPoints=doc.createElement('span');
				htmsPoints.id='ft-htms-points-'+p;
				parag.appendChild(htmsPoints);

				Foxtrick.LoadXML(pageBase + skillList, (function(target) {
					return function(xml) {
						FoxtrickHTMSPoints.show_result(target, xml);
					};
					})(htmsPoints), true);
			}
		}
	},

	show_result : function(target, responseXML) {
		try {
			var doc = target.ownerDocument;
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
	}
};
