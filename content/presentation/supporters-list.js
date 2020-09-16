/**
 * supporters-list.js
 * show which supported team support you back and vice versa
 * @author teles, LA-MJ
 */

'use strict';

Foxtrick.modules.SupportersList = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: [
		'supported', 'supporters',
		'series', 'nextSeries', 'oldSeries', 'marathon', 'promotion', 'seriesHistoryNew',
	],
	OPTIONS: ['SupporterBack', 'SupportedBack', 'Series'],
	CSS: Foxtrick.InternalPath + 'resources/css/supporters-list.css',

	/** @param {document} doc */
	run: function(doc) {
		const module = this;
		if (Foxtrick.isPage(doc, 'supported') || Foxtrick.isPage(doc, 'supporters'))
			module.supporters(doc);
		else if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Series'))
			module.series(doc);
	},

	/** @param {document} doc */
	change: function(doc) {
		const module = this;
		if (Foxtrick.isPage(doc, 'seriesHistoryNew'))
			module.run(doc);
	},

	/** @param {document} doc */
	supporters: function(doc) {
		var module = this;
		var supporterBack = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SupporterBack');
		var supportedBack = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SupportedBack');
		if (!supporterBack && !supportedBack)
			return;

		var action = Foxtrick.getUrlParam(doc.URL, 'actionType');

		/** @type {SupporterListType} */
		var type = 'supporters';

		if (action === 'mysupporters' && supportedBack) {
			// show teams I support on my supporters page:
			type = 'supported';
		}
		else if (!supporterBack) {
			return;
		}

		/** @type {HTMLElement} */
		var loading;
		if (Foxtrick.Prefs.getBool('xmlLoad')) {
			let entry = doc.querySelector('#mainBody table') ||
				Foxtrick.getMBElement(doc, 'pnlMySupporters').querySelector('br');

			loading = Foxtrick.util.note.createLoading(doc);
			Foxtrick.insertBefore(loading, entry);
		}

		/**
		 * @param  {HTMLAnchorElement} link
		 * @return {Node}
		 */
		var callback = function(link) {
			var node;
			if (type === 'supporters')
				node = link.parentNode;
			else
				node = link.parentNode.parentElement.previousElementSibling;

			return node;
		};

		module.fetch(doc, type, function(ids) {
			module.decorateLinks(doc, ids, type, callback);
			if (loading)
				loading.remove();
		});
	},

	/** @param {document} doc */
	series: function(doc) {
		var module = this;
		var supporterBack = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SupporterBack');
		var supportedBack = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SupportedBack');
		if (!supporterBack && !supportedBack)
			return;

		/**
		 * @param {string[]} ids
		 * @param {SupporterListType} type
		 */
		var decorate = function(ids, type) {
			module.decorateLinks(doc, ids, type, function(link) {
				return link.parentNode;
			});
		};

		/**
		 * @param {string[]} supported
		 * @param {string[]} supporters
		 */
		var run = function(supported, supporters) {
			if (supported && supported.length && supportedBack)
				decorate(supported, 'supported');
			if (supporters && supporters.length && supporterBack)
				decorate(supporters, 'supporters');
		};

		module.fetch(doc, 'supported', function(supported) {
			module.fetch(doc, 'supporters', function(supporters) {
				run(supported, supporters);
			});
		});
	},

	/**
	 * @param {document} doc
	 * @param {string[]} ids
	 * @param {SupporterListType} type
	 * @param {function(HTMLAnchorElement):Node} findParent
	 */
	decorateLinks: function(doc, ids, type, findParent) {
		const module = this;

		var title = Foxtrick.L10n.getString('supporters.otherSupportYou');
		var className = 'ft-suppList ft-staff-icon ft-staff-supporter';
		if (type === 'supported') {
			title = Foxtrick.L10n.getString('supporters.youSupportOther');
			className = 'ft-suppList ft-staff-icon ft-staff-supported';
		}

		/** @param {HTMLImageElement} img */
		var imgCb = function(img) {
			Foxtrick.makeFeaturedElement(img, module);
			Foxtrick.addClass(img, className);
		};

		// assuming team links start with TeamID here, otherwise matches are caught
		/** @type {NodeListOf<HTMLAnchorElement>} */
		var links = doc.querySelectorAll('#mainBody a[href*="?TeamID"]');
		var re = /\?TeamID=([0-9]+)/;
		for (let link of links) {
			let matches = re.exec(link.href);
			if (!matches)
				continue;

			let [_, id] = matches;
			if (!id || ids.indexOf(id) == -1)
				continue;

			let cls = `ft-suppList-${type}`;
			if (Foxtrick.hasClass(link, cls))
				continue;

			Foxtrick.addClass(link, cls);
			let node = findParent(link);
			Foxtrick.addImage(doc, node, {
				src: '/Img/Icons/transparent.gif',
				title: title,
				alt: title,
			}, node.firstChild, imgCb);
		}
	},

	/**
	 * @param {document} doc
	 * @param {SupporterListType} type
	 * @param {function(string[]):void} callback
	 */
	fetch: function(doc, type, callback) {
		const TEAMS_PER_PAGE = 200;
		const teamId = Foxtrick.util.id.getOwnTeamId();

		var tag = 'MySupporters', action = 'mysupporters';
		if (type === 'supported') {
			action = 'supportedteams';
			tag = 'SupportedTeams';
		}

		/** @type {string[]} */
		var ids = [];

		/** @type {CHPPParams} */
		let args = [
			['file', 'supporters'],
			['version', '1.0'],
			['teamId', teamId],
			['actionType', action],
			['pageSize', TEAMS_PER_PAGE],
			['pageIndex', 0],
		];

		Foxtrick.util.api.retrieve(doc, args, { cache: 'session' }, (xml, errorText) => {
			if (!xml || errorText) {
				Foxtrick.log(errorText);
				return;
			}
			var sup = xml.getElementsByTagName(tag)[0];
			if (typeof sup === 'undefined')
				return;

			var all = sup.getElementsByTagName('TeamId');
			for (let id of all)
				ids.push(id.textContent);

			var total = parseInt(sup.getAttribute('TotalItems'), 10);
			if (total <= TEAMS_PER_PAGE) {
				callback(ids);
				return;
			}

			/** @type {CHPPOpts} */
			let cOpts = { cache: 'session' };

			/** @type {CHPPParams[]} */
			let bArgs = [];
			var pageCt = Math.ceil(total / TEAMS_PER_PAGE);
			for (var p = 1; p < pageCt; p++) {
				bArgs.push([
					['file', 'supporters'],
					['version', '1.0'],
					['teamId', teamId],
					['actionType', action],
					['pageSize', TEAMS_PER_PAGE],
					['pageIndex', p],
				]);
			}
			Foxtrick.util.api.batchRetrieve(doc, bArgs, cOpts, (xmls, errors) => {
				if (xmls) {
					for (var x = 0; x < xmls.length; ++x) {
						var xml = xmls[x];
						var errorText = errors[x];
						if (!xml || errorText) {
							Foxtrick.log('No XML in batchRetrieve', bArgs[x], errorText);
							continue;
						}
						var sup = xml.node(tag);
						if (sup == null)
							continue;

						var all = sup.getElementsByTagName('TeamId');
						for (let id of all)
							ids.push(id.textContent);
					}
				}
				callback(ids);
			});
		});
	},
};

/** @typedef {'supported'|'supporters'} SupporterListType */
