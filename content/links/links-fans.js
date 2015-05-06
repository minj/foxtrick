'use strict';
/**
 * links-players.js
 * Foxtrick add links to fans pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksFans'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['fans'],
	LINK_TYPE: 'fanlink',
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		return Foxtrick.util.links.getPrefs(doc, this, cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		var fanMood = '';
		var main = doc.getElementById('mainBody');
		var fansText = main.getElementsByTagName('td')[1].textContent;
		var fans = Foxtrick.trimnum(fansText);

		var links = main.getElementsByTagName('a');
		Foxtrick.any(function(link) {
			if (/FanMood/i.test(link.href)) {
				fanMood = link.href.match(/ll=(\d+)/)[1];
				return true;
			}
			return false;
		}, links);

		var info = {
			fanMood: fanMood,
			fans: fans,
		};
		return { info: info };
	}
};
