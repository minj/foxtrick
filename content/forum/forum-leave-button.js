'use strict';
/**
 * forum-leave-button.js
 * Foxtrick Leave Conference module
 * @author larsw84, LA-MJ
 */

Foxtrick.modules['ForumLeaveButton'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forum', 'forumSettings'],

	run: function(doc) {
		var module = this;
		if (Foxtrick.isPage(doc, 'forum')) {
			var LEAVE = Foxtrick.L10n.getString('ForumLeaveButton.LeaveForum');
			var ALERT = Foxtrick.L10n.getString('ForumLeaveButton.alert');
			var host = Foxtrick.getLastHost();
			var URL = host + '/MyHattrick/Preferences/ForumSettings.aspx?LeaveConf=';

			var addButton = function(folderHeader) {
				var doc = folderHeader.ownerDocument;
				if (folderHeader.querySelector('.foxtrickRemove'))
					return;

				var link = folderHeader.querySelector('a[href*="f="]');
				var forumId = Foxtrick.getParameterFromUrl(link.href, 'f');
				var url = URL + forumId;

				var forumName = link.textContent.trim();
				var alertText = ALERT.replace('%s', forumName);

				var leaveConf = Foxtrick.createFeaturedElement(doc, module, 'div');
				Foxtrick.addClass(leaveConf, 'ft_actionicon foxtrickRemove float_right');
				leaveConf.title = LEAVE;

				Foxtrick.onClick(leaveConf, function() {
					if (Foxtrick.confirmDialog(alertText)) {
						var folder = this.parentNode.parentNode;
						folder.parentNode.removeChild(folder);
						Foxtrick.newTab(url);
					}
				});
				var markAsReadButton = folderHeader.firstChild;
				folderHeader.insertBefore(leaveConf, markAsReadButton);
			};

			var vValue = this.getVValue(doc);
			if (vValue != '2') {
				var headers = doc.querySelectorAll('.folderHeader, .folderHeaderHighlight');
				Foxtrick.forEach(addButton, headers);
			}
		}
		else if (Foxtrick.isPage(doc, 'forumSettings')) {
			var sUrl = Foxtrick.getHref(doc);
			var forumId = Foxtrick.getParameterFromUrl(sUrl, 'LeaveConf');
			if (forumId) {
				var ul = Foxtrick.getMBElement(doc, 'ucForumPreferences_rlFolders__rbl');
				var forums = ul.querySelectorAll('.prioFolderName a');
				var found = Foxtrick.any(function(forum) {
					if (forum.href.match(forumId)) {
						var actions = forum.parentNode.parentNode;
						var leave = actions.querySelector('.leave');
						leave.click();
						return true;
					}
					return false;
				}, forums);
				if (found) {
					// need to wait for removal otherwise it results in a continuous reload loop
					var cont = Foxtrick.getMBElement(doc, 'ucForumPreferences_pnlFolders');
					Foxtrick.onChange(cont, function(doc) {
						var save = Foxtrick.getMBElement(doc, 'ucForumPreferences_btnSave');
						save.click();
						return true;
					});
				}
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
};
