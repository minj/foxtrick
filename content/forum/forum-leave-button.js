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
				var confName = sUrl.substr(confPos + 10).replace(/\%20/g, ' ');
				var ul = doc.getElementById('ctl00_ctl00_CPContent_CPMain_rlFolders__rbl');
				var liElems = ul.getElementsByTagName('li');
				for (var i = 0; i < liElems.length; i++) {
					var subDivs = liElems[i].firstChild.getElementsByTagName('div');
					for (var k = 0; k < subDivs.length; k++) {
						if (subDivs[k].className == 'float_left prioFolderName'
							&& Foxtrick.trim(subDivs[k].getElementsByTagName('a')[0].textContent)
							== confName) {
							var inputs = subDivs[k + 1].getElementsByTagName('input');
							for (var j = 0; j < inputs.length; j++) {
								if (inputs[j].className == 'leave') {

									var func = "javascript:__doPostBack('";
									func += inputs[j].getAttribute('name');
									func += "', '')";
									if (func) {
										doc.location.href = func;
									}
								}
							}
						}
					}
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

		var confName = Foxtrick.trim(link.lastChild.data);

		var leaveConf = doc.createElement('div');
		leaveConf.setAttribute('id', 'ftLC-btn' + foldersCounter);
		leaveConf.setAttribute('class', 'ft_actionicon foxtrickRemove float_right');
		leaveConf.setAttribute('title', Foxtrickl10n.getString('ForumLeaveButton.LeaveForum'));
		Foxtrick.onClick(leaveConf, function(ev) {
			if (confirm(Foxtrickl10n.getString('ForumLeaveButton.alert'))) {
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
