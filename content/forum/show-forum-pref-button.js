'use strict';
/**
* show-forum-pref-button.js
* Foxtrick shows forum preference link on forum pages
* @author convinced, ryanli
*/

Foxtrick.modules['ShowForumPrefButton'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread', 'forumOverview', 'forumDefault'],

	run: function(doc) {
		var myForums = doc.getElementById('myForums');
		if (!myForums)
			return;
		var separator = doc.createElement('div');
		separator.className = 'borderSeparator';
		var strong = Foxtrick.createFeaturedElement(doc, this, 'strong');
		var link = doc.createElement('a');
		link.href = '/MyHattrick/Preferences/ForumSettings.aspx';
		link.textContent = Foxtrick.L10n.getString('ShowForumPrefButton.forumPreferences');
		strong.appendChild(link);
		myForums.appendChild(separator);
		myForums.appendChild(strong);
	}
};
