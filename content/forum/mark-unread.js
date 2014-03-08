'use strict';
/**
 * mark-unread.js
 * adds a link to mark hread unread until...
 * @author spambot
 */

Foxtrick.modules['MarkUnread'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread'],

	run: function(doc) {
		var PAGER_ACTION_ID =
			'ctl00_ctl00_CPContent_CPMain_ucThread_ucPagerTop_ddlAction';
		var PAGER_NUMBER_ID =
			'ctl00_ctl00_CPContent_CPMain_ucThread_ucPagerTop_txtMessageNumber';
		var PAGER_BUTTON_ID =
			'ctl00_ctl00_CPContent_CPMain_ucThread_ucPagerTop_btnGo';

		var makeListener = function(nr) {
			return function(ev) {
				var doc = ev.target.ownerDocument;
				doc.getElementById(PAGER_ACTION_ID).selectedIndex = 1;
				doc.getElementById(PAGER_NUMBER_ID).value = nr;
				doc.getElementById(PAGER_BUTTON_ID).click();
			};
		};

		var p = 0;
		var elems = doc.getElementsByTagName('div');
		for (var i = 0; i < elems.length; i++) {
			if (elems[i].className == 'message') {
				p++;
				if (!doc.getElementById('foxtrick-ur-link' + p)) {
					try {
						var markunread = [];
						markunread[p] = doc.createElement('a');
						markunread[p].setAttribute('id', 'foxtrick-ur-link' + p);
						markunread[p].className = 'foxtrick-unreadlink ft-link';
						markunread[p].textContent = Foxtrick.L10n.getString('MarkUnread.markunread');
						markunread[p].title = Foxtrick.L10n.getString('MarkUnread.markunread');
						markunread[p] = Foxtrick.makeFeaturedElement(markunread[p], this);
						var cfInnerWrapper = elems[i].parentNode.parentNode;
						var cfFooter = cfInnerWrapper.nextSibling;
						while (cfFooter.className != 'cfFooter') {
							cfFooter = cfFooter.nextSibling;
						}
						var divsInFooter = cfFooter.getElementsByTagName('div');
						for (var j = 0; j < divsInFooter.length; j++) {
							if (divsInFooter[j].className == 'float_left') {
								var nr = 1;
								var a = divsInFooter[j].getElementsByTagName('a');
								var ahref = a[a.length - 1].href;
								var reg = /^(.*?)\&n\=(\d+)(.*?)/;
								var ar = reg.exec(+ ' ' + ahref + ' ');
								if (ar[2] != null) {
									//nr = '&n=' + ar[2];
									nr = '' + ar[2] + '';
								}
								Foxtrick.onClick(markunread[p], makeListener(nr));
							}
							if (divsInFooter[j].className == 'float_right') {
								divsInFooter[j].appendChild(doc.createTextNode('\u00a0'));
								divsInFooter[j].appendChild(markunread[p]);
							}
						}
					} catch (e) {
						Foxtrick.dump('MarkUnread ERROR ' + e + '\n');
					}
				}
			}
		}
	}
};
