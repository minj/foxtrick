'use strict';
/**
 * supporters-list.js
 * show which supported team support you back and vice versa
 * @author teles, LA-MJ
 */

Foxtrick.modules['SupportersList'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['supporters'],
	OPTIONS: ['SupporterBack', 'SupportedBack'],
	CSS: Foxtrick.InternalPath + 'resources/css/supporters-list.css',

	run: function(doc) {
		var TEAMS_PER_PAGE = 200;
		var supporterBack = Foxtrick.Prefs.isModuleOptionEnabled('SupportersList', 'SupporterBack');
		var supportedBack = Foxtrick.Prefs.isModuleOptionEnabled('SupportersList', 'SupportedBack');
		if (!supporterBack && !supportedBack)
			return;

		var teamId = Foxtrick.util.id.getOwnTeamId();

		var entry = doc.querySelector('#mainBody table') ||
			doc.querySelector('#ctl00_ctl00_CPContent_CPMain_pnlMySupporters > br');
		var loading = Foxtrick.util.note.createLoading(doc);
		entry.parentNode.insertBefore(loading, entry);

		var action = Foxtrick.getParameterFromUrl(Foxtrick.getHref(doc), 'actionType');
		var mine = false;
		var tag = '', title = '', className = '';
		if (action === null && supportedBack) {
			action = 'supportedteams';
			tag = 'SupportedTeams';
			title = Foxtrick.L10n.getString('supporters.otherSupportYou');
			className = 'scFans ft-supporter';
			tag = 'MySupporters'; // TODO remove
		}
		else if (action === 'mysupporters' && supporterBack) {
			tag = 'MySupporters';
			title = Foxtrick.L10n.getString('supporters.youSupportOther');
			className = 'scMySupporters ft-supported';
			mine = true;
			tag = 'SupportedTeams'; // TODO remove
		}

		var ids = [];

		var addDecorations = function() {
			var links = doc.querySelectorAll('#mainBody a[href*="TeamID"]');
			var re = /TeamID=([0-9]+)/i;
			for (var l = 0; l < links.length; l++) {
				var href = links[l].href;
				var matches = re.exec(href);
				if (matches[1] && Foxtrick.indexOf(ids, matches[1]) != -1) {
					var node = mine ? links[l].parentNode.parentNode.previousElementSibling :
						links[l].parentNode;
					Foxtrick.addImage(doc, node, {
						'src': '/Img/Icons/transparent.gif',
						'class': className,
						'width': '22px',
						'height': '22px',
						'title': title,
						'alt': title
					}, node.firstChild, function(img){
						Foxtrick.makeFeaturedElement(img, Foxtrick.modules.SupportersList);
					});
				}
			}
			loading.parentNode.removeChild(loading);
		};

		Foxtrick.util.api.retrieve(doc, [
			['file', 'supporters'],
			['version', '1.0'],
			['actionType', action],
			['teamId', teamId],
			['pageSize', TEAMS_PER_PAGE],
			//['pageIndex', 0],
		  ],
		  { cache_lifetime: 'session' },
		  function(xml, errorText) {
			if (errorText) {
				Foxtrick.log(errorText);
				return;
			}
			var sup = xml.getElementsByTagName(tag)[0];
			if (typeof sup === 'undefined')
				return;

			var all = sup.getElementsByTagName('TeamId');
			for (var i = 0; i < all.length; i++)
				ids.push(all[i].textContent);

			var total = sup.getAttribute('TotalItems');
			if (total > TEAMS_PER_PAGE) {
				var pageCt = Math.ceil(total / TEAMS_PER_PAGE);
				var batchArgs = [];
				for (var p = 1; p < pageCt; p++) {
					batchArgs.push([
						['file', 'supporters'],
						['version', '1.0'],
						['actionType', action],
						['teamId', teamId],
						['pageSize', TEAMS_PER_PAGE],
						['pageIndex', p],
					]);
				}
				Foxtrick.util.api.batchRetrieve(doc, batchArgs, { cache_lifetime: 'session' },
				  function(xmls, errorText) {
					if (errorText) {
						Foxtrick.log(errorText);
					}
					if (xmls) {
						for (var x = 0; x < xmls.length; ++x) {
							var xml = xmls[x];
							var sup = xml.getElementsByTagName(tag)[0];
							if (typeof sup === 'undefined')
								continue;

							var all = sup.getElementsByTagName('TeamId');
							for (var i = 0; i < all.length; i++)
								ids.push(all[i].textContent);
						}
					}
					addDecorations();
				});
			}
			else
				addDecorations();
		});
	}
};
