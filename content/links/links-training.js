'use strict';
/**
 * links-league.js
 * Foxtrick add links to coach pages
 * @author convinced
 */

Foxtrick.modules['LinksTraining'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['training'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links'].getOptionsHtml(doc, 'LinksTraining', 'traininglink',
		                                                callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		if (doc.location.href.search(/ChangeCoach/i) > -1 ||
		    doc.location.href.search(/YouthTraining/i) > -1)
		    return;
		//addExternalLinksToCoachPage

		var main = doc.getElementsByClassName('main')[0];
		var ownBoxBody = null;
		var Coach, TI, STA, TrainingType, owncountryid;
		var alllinks = main.getElementsByTagName('a');
		for (var i = 0; i < alllinks.length; i++) {
			if (alllinks[i].href.match(/skillshort/i)) {
				Coach = Foxtrick.util.id.getSkillLevelFromLink(alllinks[i]);
				break;
			}
		}
		STA = doc.getElementById('ctl00_ctl00_CPContent_CPMain_txtTrainingLevelStamina').value;
		TI = doc.getElementById('ctl00_ctl00_CPContent_CPMain_txtTrainingLevel').value;
		TrainingType = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ddlTrainingType').value;
		owncountryid = Foxtrick.util.id.getOwnLeagueId();


		var links = Foxtrick.modules['Links'].getLinks('traininglink',
		                                               { 'Coach': Coach, 'TI': TI, 'STA': STA,
		                                               'TrainingType': TrainingType,
		                                               'owncountryid': owncountryid }, doc, this);

		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			var header = Foxtrickl10n.getString('links.boxheader');
			var ownBoxBodyId = 'foxtrick_links_content';
			ownBoxBody.setAttribute('id', ownBoxBodyId);

			for (var k = 0; k < links.length; k++) {
				links[k].link.className = 'inner';
				ownBoxBody.appendChild(links[k].link);
			}

			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
		}
		Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME,
		                        { 'Coach': Coach, 'TrainigIntensity': TI, 'StaminaShare': STA,
		                        'TrainingType': TrainingType });
	}
};
