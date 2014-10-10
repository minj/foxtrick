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
					if (elems[i].className == 'folderHeader'
					|| elems[i].className == 'folderHeaderHighlight') {
						if (Foxtrick.hasClass(elems[i].getElementsByTagName('div')[0],
						    'foxtrickRemove'))
							continue;

						var divLeaveConfBtn = doc.getElementById(
							'ftLC-btn' + foldersCounter);
						this.addButton(doc, divLeaveConfBtn, elems[i],
							foldersCounter, vValue);
						foldersCounter++;
					}
				}
			}
		}
		else if (Foxtrick.isPage(doc, 'forumSettings')) {
			var sUrl = Foxtrick.getHref(doc);
			var confPos = sUrl.search(/LeaveConf=/i);
			if (confPos > -1) {
				var confName = Foxtrick.getParameterFromUrl(sUrl, 'LeaveConf');
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
		var vPos = sUrl.search(/v=/i);
		var vValue = 1;
		if (vPos > -1) {
			vValue = sUrl.substr(vPos + 2, 1);
		}
		return vValue;
	},

	addButton: function(doc, divId, folderHeader, foldersCounter, vValue) {

		var a = folderHeader.getElementsByTagName('a');
		var link;
		if (a != null) {
			link = a[a.length - 1];
		}
		if (link == null || link.lastChild == null || link.lastChild.data == null) return;

		var confName = link.lastChild.data.trim();

		var leaveConf = doc.createElement('div');
		leaveConf.setAttribute('id', 'ftLC-btn' + foldersCounter);
		leaveConf.setAttribute('class', 'ft_actionicon foxtrickRemove float_right');
		leaveConf.setAttribute('title', Foxtrick.L10n.getString('ForumLeaveButton.LeaveForum'));
		Foxtrick.onClick(leaveConf, function(ev) {
			if (confirm(Foxtrick.L10n.getString('ForumLeaveButton.alert'))) {
				Foxtrick.newTab('http://' + doc.location.hostname +
				                '/MyHattrick/Preferences/ForumSettings.aspx?LeaveConf=' + confName,
				                '_self');
			}
		});
		leaveConf = Foxtrick.makeFeaturedElement(leaveConf, this);
		var markAsReadButton = folderHeader.childNodes[0];
		folderHeader.insertBefore(leaveConf, markAsReadButton);
	}
};
