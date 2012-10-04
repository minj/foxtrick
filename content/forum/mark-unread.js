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
		//return;
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
						markunread[p].className = 'foxtrick-unreadlink';
						markunread[p].textContent = Foxtrickl10n.getString('MarkUnread.markunread');
						markunread[p].title = Foxtrickl10n.getString('MarkUnread.markunread');
						markunread[p].href = 'javascript:void(0);';
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
								markunread[p].href = 'javascript: ' + 'try {'
									+ "document.getElementById('"
									+ "ctl00_ctl00_CPContent_CPMain_ucThread_ucPagerTop_ddlAction'"
									+ ").selectedIndex='1';"
									+ "document.getElementById('"
								+ 'ctl00_ctl00_CPContent_CPMain_ucThread_ucPagerTop_txtMessageNumber'
									+ "').value='" + nr + "';"
									+ "document.getElementById('"
									+ "ctl00_ctl00_CPContent_CPMain_ucThread_ucPagerTop_btnGo'"
									+ ').click();'
									+ '}'
									+ 'catch (e) {}';
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
