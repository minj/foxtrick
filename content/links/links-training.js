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
		return Foxtrick.modules['Links']
			.getOptionsHtml(doc, 'LinksTraining', 'traininglink', callback);
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

		var main = doc.getElementById('mainBody');
		var ownBoxBody = null;
		var Coach, TI, STA, TrainingType, owncountryid;
		var coachLink = main.querySelector('a[href^="/Help/Rules/AppDenominations"]');
		Coach = Foxtrick.util.id.getSkillLevelFromLink(coachLink);
		STA = Foxtrick.getMBElement(doc, 'txtTrainingLevelStamina').value;
		TI = Foxtrick.getMBElement(doc, 'txtTrainingLevel').value;
		TrainingType = Foxtrick.getMBElement(doc, 'ddlTrainingType').value;
		owncountryid = Foxtrick.util.id.getOwnLeagueId();


		var links = Foxtrick.modules['Links'].getLinks('traininglink', {
			'Coach': Coach,
			'TI': TI,
			'STA': STA,
			'TrainingType': TrainingType,
			'owncountryid': owncountryid
		}, doc, this);

		if (links.length > 0) {
			ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			var header = Foxtrick.L10n.getString('links.boxheader');
			var ownBoxBodyId = 'foxtrick_links_content';
			ownBoxBody.setAttribute('id', ownBoxBodyId);

			for (var k = 0; k < links.length; k++) {
				links[k].link.className = 'inner';
				ownBoxBody.appendChild(links[k].link);
			}

			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
		}
		Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME, {
			'Coach': Coach,
			'TrainigIntensity': TI,
			'StaminaShare': STA,
			'TrainingType': TrainingType
		});
	}
};
