'use strict';
/**
 * links-league.js
 * Foxtrick add links to coach pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksTraining'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['training'],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'traininglink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var main = doc.getElementById('mainBody');
		var coachLink = main.querySelector('a[href^="/Help/Rules/AppDenominations"]');
		var coach = Foxtrick.util.id.getSkillLevelFromLink(coachLink);
		var sta = Foxtrick.getMBElement(doc, 'txtTrainingLevelStamina').value;
		var ti = Foxtrick.getMBElement(doc, 'txtTrainingLevel').value;
		var trainingtype = Foxtrick.getMBElement(doc, 'ddlTrainingType').value;

		var info = {
			coach: coach,
			ti: ti,
			sta: sta,
			trainingtype: trainingtype,
		};
		var types = ['traininglink'];
		return { types: types, info: info };
	}
};
