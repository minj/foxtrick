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
				var elems = doc.getElementById('myForums').getElementsByTagName('div');
				var foldersCounter = 0;
				for (var i = 0; i < elems.length; i++) {
					if (elems[i].className == 'folderHeader' ||
					    elems[i].className == 'folderHeaderHighlight') {
						if (Foxtrick.hasClass(elems[i].getElementsByTagName('div')[0],
						    'foxtrickRemove'))
							continue;

						this.addButton(doc, elems[i]);
						foldersCounter++;
					}
				}
			}
		}
		else if (Foxtrick.isPage(doc, 'forumSettings')) {
			var sUrl = Foxtrick.getHref(doc);
			var confName = Foxtrick.getParameterFromUrl(sUrl, 'LeaveConf');
			if (confName) {
				confName = confName.replace(/\%20/g, ' ');
				var ul = Foxtrick.getMBElement(doc, 'ucForumPreferences_rlFolders__rbl');
				var names = ul.getElementsByClassName('prioFolderName');
				Foxtrick.any(function(div) {
					if (div.textContent.trim() === confName) {
						var leave = div.parentNode.getElementsByClassName('leave')[0];
						leave.click();
						return true;
					}
					return false;
				}, names);
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

	addButton: function(doc, folderHeader) {
		var a = folderHeader.getElementsByTagName('a');
		var link;
		if (a.length) {
			link = a[a.length - 1];
		}
		if (!link || !link.lastChild || !link.lastChild.textContent)
			return;

		var conf = link.lastChild.textContent.trim();

		var leaveConf = Foxtrick.createFeaturedElement(doc, this, 'div');
		Foxtrick.addClass(leaveConf, 'ft_actionicon foxtrickRemove float_right');
		leaveConf.title = Foxtrick.L10n.getString('ForumLeaveButton.LeaveForum');
		Foxtrick.onClick(leaveConf, function() {
			if (confirm(Foxtrick.L10n.getString('ForumLeaveButton.alert'))) {
				var host = Foxtrick.getLastHost();
				var url = host + '/MyHattrick/Preferences/ForumSettings.aspx?LeaveConf=' + conf;
				Foxtrick.newTab(url);
			}
		});
		var markAsReadButton = folderHeader.firstChild;
		folderHeader.insertBefore(leaveConf, markAsReadButton);
	},
};
