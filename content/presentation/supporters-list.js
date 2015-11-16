'use strict';
/**
 * supporters-list.js
 * show which supported team support you back and vice versa
 * @author teles, LA-MJ
 */

Foxtrick.modules['SupportersList'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['supported', 'supporters'],
	OPTIONS: ['SupporterBack', 'SupportedBack'],
	CSS: Foxtrick.InternalPath + 'resources/css/supporters-list.css',

	run: function(doc) {
		var supporterBack = Foxtrick.Prefs.isModuleOptionEnabled('SupportersList', 'SupporterBack');
		var supportedBack = Foxtrick.Prefs.isModuleOptionEnabled('SupportersList', 'SupportedBack');
		if (!supporterBack && !supportedBack)
			return;

		var action = Foxtrick.getParameterFromUrl(Foxtrick.getHref(doc), 'actionType');
		var title = Foxtrick.L10n.getString('supporters.otherSupportYou');
		var className = 'scFans ft-supporter';
		var type = 'supporters';

		if (action === 'mysupporters' && supportedBack) {
			// show teams I support on my supporters page:
			type = 'supported';
			title = Foxtrick.L10n.getString('supporters.youSupportOther');
			className = 'scMySupporters ft-supported';
		}
		else if (!supporterBack) {
			return;
		}

		if (Foxtrick.Prefs.getBool('xmlLoad')) {
			var entry = doc.querySelector('#mainBody table') ||
				Foxtrick.getMBElement(doc, 'pnlMySupporters').querySelector('br');
			var loading = Foxtrick.util.note.createLoading(doc);
			entry.parentNode.insertBefore(loading, entry);
		}

		var callback = function(ids) {
			var imgCb = function(img) {
				Foxtrick.makeFeaturedElement(img, Foxtrick.modules.SupportersList);
				Foxtrick.addClass(img, className);
			};

			var links = doc.querySelectorAll('#mainBody a[href*="TeamID"]');
			var re = /TeamID=([0-9]+)/i;
			for (var l = 0; l < links.length; l++) {
				var href = links[l].href;
				var matches = re.exec(href);
				if (matches[1] && Foxtrick.indexOf(ids, matches[1]) != -1) {
					var node;
					if (type === 'supporters')
						node = links[l].parentNode;
					else
						node = links[l].parentNode.parentNode.previousElementSibling;

					Foxtrick.addImage(doc, node, {
						src: '/Img/Icons/transparent.gif',
						width: 22,
						height: 22,
						title: title,
						alt: title,
					}, node.firstChild, imgCb);
				}
			}
			loading.parentNode.removeChild(loading);
		};

		this.fetch(doc, type, callback);
	},
	fetch: function(doc, type, callback) {
		var TEAMS_PER_PAGE = 200;
		var teamId = Foxtrick.util.id.getOwnTeamId();

		var tag = 'MySupporters', action = 'mysupporters';
		if (type === 'supported') {
			action = 'supportedteams';
			tag = 'SupportedTeams';
		}

		var ids = [];

		Foxtrick.util.api.retrieve(doc, [
			['file', 'supporters'],
			['version', '1.0'],
			['teamId', teamId],
			['actionType', action],
			['pageSize', TEAMS_PER_PAGE],
			['pageIndex', 0],
		  ],
		  { cache_lifetime: 'session' },
		  function(xml, errorText) {
			if (!xml || errorText) {
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
						['teamId', teamId],
						['actionType', action],
						['pageSize', TEAMS_PER_PAGE],
						['pageIndex', p],
					]);
				}
				Foxtrick.util.api.batchRetrieve(doc, batchArgs, { cache_lifetime: 'session' },
				  function(xmls, errors) {
					if (xmls) {
						for (var x = 0; x < xmls.length; ++x) {
							var xml = xmls[x];
							var errorText = errors[x];
							if (!xml || errorText) {
								Foxtrick.log('No XML in batchRetrieve', batchArgs[x], errorText);
								continue;
							}
							var sup = xml.getElementsByTagName(tag)[0];
							if (typeof sup === 'undefined')
								continue;

							var all = sup.getElementsByTagName('TeamId');
							for (var i = 0; i < all.length; i++)
								ids.push(all[i].textContent);
						}
					}
					callback(ids);
				});
			}
			else
				callback(ids);
		});
	},
};
