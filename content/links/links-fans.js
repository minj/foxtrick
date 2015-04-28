'use strict';
/**
 * links-players.js
 * Foxtrick add links to fans pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksFans'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['fans'],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		var name = this.MODULE_NAME;
		return Foxtrick.modules['Links'].getOptionsHtml(doc, name, 'fanlink', cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var fanmood = '';
		var main = doc.getElementById('mainBody');
		var fansText = main.getElementsByTagName('td')[1].textContent;
		var fans = Foxtrick.trimnum(fansText);

		var links = main.getElementsByTagName('a');
		Foxtrick.any(function(link) {
			if (/FanMood/i.test(link.href)) {
				fanmood = link.href.match(/ll=(\d+)/)[1];
				return true;
			}
			return false;
		}, links);

		var info = {
			fanmood: fanmood,
			fans: fans,
		};
		var types = ['fanlink'];
		return { types: types, info: info };
	}
};
