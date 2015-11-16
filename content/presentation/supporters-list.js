'use strict';
/**
 * supporters-list.js
 * show which supported team support you back and vice versa
 * @author teles, LA-MJ
 */

Foxtrick.modules['SupportersList'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: [
		'supported', 'supporters',
		'series', 'nextSeries', 'oldSeries', 'marathon', 'promotion',
	],
	OPTIONS: ['SupporterBack', 'SupportedBack', 'Series'],
	CSS: Foxtrick.InternalPath + 'resources/css/supporters-list.css',

	run: function(doc) {
		if (Foxtrick.isPage(doc, 'supported') || Foxtrick.isPage(doc, 'supporters'))
			this.supporters(doc);
		else if (Foxtrick.Prefs.isModuleOptionEnabled(this, 'Series'))
			this.series(doc);
	},
	supporters: function(doc) {
		var module = this;
		var supporterBack = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SupporterBack');
		var supportedBack = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SupportedBack');
		if (!supporterBack && !supportedBack)
			return;

		var action = Foxtrick.getParameterFromUrl(Foxtrick.getHref(doc), 'actionType');
		var type = 'supporters';

		if (action === 'mysupporters' && supportedBack) {
			// show teams I support on my supporters page:
			type = 'supported';
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

		var callback = function(link) {
			var node;
			if (type === 'supporters')
				node = link.parentNode;
			else
				node = link.parentNode.parentNode.previousElementSibling;

			return node;
		};

		module.fetch(doc, type, function(ids) {
			module.decorateLinks(doc, ids, type, callback);
			loading.parentNode.removeChild(loading);
		});
	},
	series: function(doc) {
		var module = this;
		var supporterBack = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SupporterBack');
		var supportedBack = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SupportedBack');
		if (!supporterBack && !supportedBack)
			return;

		var decorate = function(ids, type) {
			module.decorateLinks(doc, ids, type, function(link) {
				return link.parentNode;
			});
		};

		var run = function(supported, supporters) {
			if (supported && supported.length && supportedBack)
				decorate(supported, 'supported');
			if (supporters && supporters.length && supporterBack)
				decorate(supporters, 'supporters');
		};

		module.fetch(doc, true, function(supporters) {
			module.fetch(doc, false, function(supported) {
				run(supporters, supported);
			});
		});
	},
	decorateLinks: function(doc, ids, type, findParent) {
		var module = this;
		var title = Foxtrick.L10n.getString('supporters.otherSupportYou');
		var className = 'ft-staff-icon ft-staff-supporter';
		if (type === 'supported') {
			title = Foxtrick.L10n.getString('supporters.youSupportOther');
			className = 'ft-staff-icon ft-staff-supported';
		}

		var imgCb = function(img) {
			Foxtrick.makeFeaturedElement(img, module);
			Foxtrick.addClass(img, className);
		};

		var links = doc.querySelectorAll('#mainBody a[href*="TeamID"]');
		var re = /TeamID=([0-9]+)/i;
		for (var l = 0; l < links.length; l++) {
			var href = links[l].href;
			var matches = re.exec(href);
			if (matches[1] && Foxtrick.indexOf(ids, matches[1]) != -1) {
				var node = findParent(links[l]);
				Foxtrick.addImage(doc, node, {
					src: '/Img/Icons/transparent.gif',
					title: title,
					alt: title,
				}, node.firstChild, imgCb);
			}
		}
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
