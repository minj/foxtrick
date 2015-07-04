'use strict';
/**
 * forum-leave-button.js
 * Foxtrick Leave Conference module
 * @author larsw84
 */

Foxtrick.modules['ForumLeaveButton'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forum', 'forumSettings'],

	run: function(doc) {
		if (Foxtrick.isPage(doc, 'forum')) {
			var vValue = this.getVValue(doc);

			if (vValue != '2') {
				var headers = doc.querySelectorAll('.folderHeader, .folderHeaderHighlight');
				Foxtrick.forEach(this.addButton.bind(this), headers);
			}
		}
		else if (Foxtrick.isPage(doc, 'forumSettings')) {
			var sUrl = Foxtrick.getHref(doc);
			var forumId = Foxtrick.getParameterFromUrl(sUrl, 'LeaveConf');
			if (forumId) {
				var ul = Foxtrick.getMBElement(doc, 'ucForumPreferences_rlFolders__rbl');
				var forums = ul.querySelectorAll('.prioFolderName a');
				Foxtrick.any(function(forum) {
					if (forum.href.match(forumId)) {
						var actions = forum.parentNode.parentNode;
						var leave = actions.querySelector('.leave');
						leave.click();
						return true;
					}
					return false;
				}, forums);
			}
		}
	},

	change: function(doc) {
		if (Foxtrick.isPage(doc, 'forum'))
			this.run(doc);
	},

	getVValue: function(doc) {
		var sUrl = Foxtrick.getHref(doc);
		return Foxtrick.getParameterFromUrl(sUrl, 'v') || '1';
	},

	addButton: function(folderHeader) {
		var doc = folderHeader.ownerDocument;
		if (folderHeader.querySelector('.foxtrickRemove'))
			return;

		var link = folderHeader.querySelector('a[onclick]');
		var forumId = Foxtrick.getParameterFromUrl(link.href, 'f');

		var leaveConf = Foxtrick.createFeaturedElement(doc, this, 'div');
		Foxtrick.addClass(leaveConf, 'ft_actionicon foxtrickRemove float_right');
		leaveConf.title = Foxtrick.L10n.getString('ForumLeaveButton.LeaveForum');
		Foxtrick.onClick(leaveConf, function() {
			if (confirm(Foxtrick.L10n.getString('ForumLeaveButton.alert'))) {
				var host = Foxtrick.getLastHost();
				var url = host + '/MyHattrick/Preferences/ForumSettings.aspx?LeaveConf=' + forumId;
				Foxtrick.newTab(url);
			}
		});
		var markAsReadButton = folderHeader.firstChild;
		folderHeader.insertBefore(leaveConf, markAsReadButton);
	},
};
