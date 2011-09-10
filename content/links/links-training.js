/**
 * links-league.js
 * Foxtrick add links to coach pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksTraining = {
	MODULE_NAME : "LinksTraining",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('training'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, false, "traininglink");
	},

	run : function(doc) {
		if (doc.location.href.search(/ChangeCoach/i)>-1 || doc.location.href.search(/YouthTraining/i)>-1) {return;}
		//addExternalLinksToCoachPage

		var alldivs = doc.getElementsByTagName('div');
		var ownBoxBody=null;
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
				var Coach,TI,STA,TrainingType, owncountryid;
				var alllinks = alldivs[j].getElementsByTagName('a');
				for (var i = 0; i < alllinks.length; i++) {
					if (alllinks[i].href.match(/skillshort/i)) {
						Coach = Foxtrick.util.id.getSkillLevelFromLink(alllinks[i]);
						break;
					}
				}
				STA = doc.getElementById("ctl00_ctl00_CPContent_CPMain_txtTrainingLevelStamina").value;
				TI = doc.getElementById("ctl00_ctl00_CPContent_CPMain_txtTrainingLevel").value;
				TrainingType = doc.getElementById("ctl00_ctl00_CPContent_CPMain_ddlTrainingType").value;
				owncountryid = Foxtrick.util.id.getOwnLeagueId();


				var links = Foxtrick.LinkCollection.getLinks("traininglink", {"Coach":Coach,"TI":TI,"STA":STA,"TrainingType":TrainingType,'owncountryid':owncountryid}, doc, this);

				if (links.length > 0) {
					ownBoxBody = doc.createElement("div");
					var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
					var ownBoxBodyId = "foxtrick_links_content";
					ownBoxBody.setAttribute( "id", ownBoxBodyId );

					for (var k = 0; k < links.length; k++) {
						links[k].link.className ="inner";
						ownBoxBody.appendChild(links[k].link);
					}

					var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
					box.id = "ft-links-box";
				}
				Foxtrick.util.links.add(doc, ownBoxBody,
					this.MODULE_NAME,{"Coach":Coach,"TrainigIntensity":TI,"StaminaShare":STA,"TrainingType":TrainingType} );
			}
		}
	}
};
Foxtrick.util.module.register(FoxtrickLinksTraining);
