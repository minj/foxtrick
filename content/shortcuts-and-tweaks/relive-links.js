/**
 * relive-links.js
 * add missing Re-Live links
 * @author LA-MJ
 */

'use strict';

Foxtrick.modules.ReLiveLinks = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: [
		'matchesLive', // export live
		'series', // combo link
		'fans',
		'fixtures', 'youthFixtures', // table mess
		'cupMatches', 'worldCup', // insertCells, insertHeader
		'matchesArchive', 'worldMatches', // insertCells
	],
	NICE: -1, // before any modules that might change row count
	OPTIONS: ['ReLive', 'Live'],

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		if (Foxtrick.isPage(doc, 'matchesLive')) {
			if (Foxtrick.Prefs.isModuleOptionEnabled('ReLiveLinks', 'Live'))
				module.live(doc);
		}
		else if (Foxtrick.Prefs.isModuleOptionEnabled('ReLiveLinks', 'ReLive')) {
			module.reLive(doc);
		}
	},

	/** @param {document} doc */
	live: function(doc) {
		const module = this;
		const COPY = Foxtrick.L10n.getString('copy.asLink');
		const SUCCESS = Foxtrick.L10n.getString('copy.asLink.copied');
		const BUTTON_ID = 'ft-bulk-live-link';
		const LINK_TEMPLATE = '[link=/Club/Matches/Live.aspx' +
			'?matchID={}&actionType=addMatch&SourceSystem={}]\n';

		/**
		 * @param  {string} uid
		 * @return {'HTOIntegrated'|'Youth'|'Hattrick'}
		 */
		var getSourceFromUId = function(uid) {
			switch (uid[0]) {
				case 'X':
					return 'HTOIntegrated';
				case 'Y':
					return 'Youth';
				default:
					return 'Hattrick';
			}
		};

		/** @type {Listener<HTMLAnchorElement, MouseEvent>} */
		var copyBulkLinks = function() {
			// eslint-disable-next-line no-invalid-this
			var doc = this.ownerDocument;
			var links = doc.getElementsByClassName('removeTab2');
			if (!links.length)
				return;

			var matches = {};
			for (let link of links) {
				let attr = link.getAttribute('onclick');
				let [_, url] = attr.match(/['"](.+?)['"]/); // lgtm[js/unused-local-variable]
				{
					let temp = doc.createElement('a');
					temp.href = url;
					url = temp.href;
				}

				let uid = Foxtrick.getUrlParam(url, 'UniqueMatchId');
				let source = getSourceFromUId(uid);
				if (!matches[source])
					matches[source] = [];

				let id = uid.match(/\d+/)[0];
				matches[source].push(id);
			}

			var text = '';
			for (let type in matches) {
				let list = matches[type].toString();
				text += Foxtrick.format(LINK_TEMPLATE, [list, type]);
			}

			Foxtrick.copy(doc, text);
			Foxtrick.util.note.add(doc, SUCCESS, 'ft-relive-copy-note');
		};

		/** @param {document} doc */
		var addBulkButton = function(doc) {
			/** @type {HTMLAnchorElement} */
			let button = doc.querySelector(`#${BUTTON_ID}`);
			if (button)
				button.remove();

			let target = doc.querySelector('.liveConfLink');
			if (!target)
				return;

			button = Foxtrick.createFeaturedElement(doc, module, 'a');
			button.id = BUTTON_ID;
			Foxtrick.addClass(button, 'ft-link liveConfLink shy right');
			button.textContent = COPY;
			Foxtrick.insertBefore(button, target);
			Foxtrick.onClick(button, copyBulkLinks);
		};

		Foxtrick.Pages.Match.addLiveListener(doc, addBulkButton);
	},

	/** @param {document} doc */
	// eslint-disable-next-line complexity
	reLive: function(doc) {
		const module = this;

		// don't run on live table
		let liveSeriesLink = Foxtrick.getMBElement(doc, 'hlLive');
		if (liveSeriesLink && liveSeriesLink.hasAttribute('disabled'))
			return;

		const MATCH_SELECTOR = 'a[href^="/Club/Matches/Match.aspx"]';
		const LIVE_SELECTOR = 'a[href^="/Club/Matches/Live.aspx"]';

		/**
		 * @param  {ArrayLike<HTMLElement>} rows
		 * @return {number}                 index
		 */
		var findMatchTdIdx = function(rows) {
			let [first] = Array.from(rows);
			if (!first)
				return -1;

			let tbody = first.parentNode;
			let matchLink = tbody.querySelector(MATCH_SELECTOR);
			if (!matchLink)
				return -1;

			let cell = matchLink.closest('td');
			if (!cell) {
				// unknown structure
				return -1;
			}

			let row = cell.closest('tr');
			if (!row || row.parentNode !== tbody) {
				// unknown structure
				return -1;
			}

			return Foxtrick.indexOf(row.cells, cell);
		};

		/** @type {Promise<HTMLImageElement>} */
		var imgPromise;
		{
			let img = doc.createElement('img');
			img.src = '/Img/Icons/transparent.gif';
			img.alt = img.title = 'HT Re-Live';
			img.className = 'matchHTReLive';
			imgPromise = Promise.resolve(img);
		}

		/** @type {NodeListOf<HTMLTableRowElement>} */
		var rows;
		var addAllLink, matches;
		var insertCells = false, insertHeader = false, useColSpan = false;

		var scoreIdx = NaN;
		var liveTdIdx = NaN;

		var reLiveSrc = Foxtrick.InternalPath + 'resources/img/relive-small.png';
		if (Foxtrick.isPage(doc, 'series')) {

			matches = [];

			rows = doc.querySelectorAll('table.indent.left.thin > tbody > tr');

			if (!rows.length)
				return;

			imgPromise = new Promise((resolve, _) => {
				let frag = doc.createDocumentFragment();
				let feat = { src: reLiveSrc, alt: 'HT Re-Live', title: 'HT Re-Live' };
				Foxtrick.addImage(doc, frag, feat, null, resolve);
			});


			let addAll = doc.createElement('img');
			addAll.src = '/Img/Icons/transparent.gif';
			addAll.className = 'matchHTReLive';
			addAll.alt = addAll.title =
				Foxtrick.L10n.getString('ReLiveLinks.addRound');

			addAllLink = doc.createElement('a');
			addAllLink.appendChild(addAll);
			let addAllSpan = Foxtrick.createFeaturedElement(doc, module, 'span');
			Foxtrick.addClass(addAllSpan, 'float_right');
			addAllSpan.appendChild(addAllLink);

			if (/\d[^\d]+\d/.test(rows[1].cells[1].textContent)) {
				// don't add before the first round of the season
				rows[0].cells[0].appendChild(addAllSpan);
			}
		}
		else if (Foxtrick.isPage(doc, 'fixtures') || Foxtrick.isPage(doc, 'youthFixtures')) {
			let fixtures = Foxtrick.getMBElement(doc, 'repFixtures');
			if (!fixtures)
				return;
			rows = fixtures.querySelectorAll('tr');

			useColSpan = true; // fixes broken layout due to expanded 1st column

			if (Foxtrick.Pages.All.isYouth(doc))
				insertCells = true;
		}
		else if (Foxtrick.isPage(doc, 'cupMatches')) {
			rows = doc.querySelectorAll('table.indent > tbody > tr');
			insertCells = true;
			insertHeader = true;
		}
		else if (Foxtrick.isPage(doc, 'worldCup')) {
			rows = doc.querySelectorAll('#ctl00_ctl00_CPContent_CPMain_repWCFixtures tr');
			insertCells = true;
			insertHeader = true;
		}
		else if (Foxtrick.isPage(doc, 'matchesArchive')) {
			rows = doc.querySelectorAll('table.indent > tbody > tr');
			insertCells = true;
		}
		else if (Foxtrick.isPage(doc, 'worldMatches')) {
			rows = doc.querySelectorAll('#mainBody tr');
			insertCells = true;
		}
		else if (Foxtrick.isPage(doc, 'fans')) {
			rows = doc.querySelectorAll('#played tr');
			// eslint-disable-next-line no-magic-numbers
			scoreIdx = 3;
			liveTdIdx = 1;
		}
		else {
			Foxtrick.log(new Error('Unhandled case in ReLiveLinks'));
			return;
		}

		if (!rows) {
			Foxtrick.log(new Error(`${module.MODULE_NAME} failed`));
			return;
		}

		var matchTdIdx = findMatchTdIdx(rows);
		if (matchTdIdx === -1)
			return;

		if (!liveTdIdx) {
			scoreIdx = matchTdIdx + 1;
			liveTdIdx = matchTdIdx + 2;
		}

		if (insertHeader) {
			for (let row of rows) {
				if (row.sectionRowIndex != 0)
					continue;

				row.dataset.header = '1';

				let header = Foxtrick.createFeaturedElement(doc, module, 'th');
				let lastCell = row.cells.length - 1;
				if (liveTdIdx < lastCell)
					row.insertBefore(header, row.cells[liveTdIdx]);
				else
					row.appendChild(header);
			}
		}

		if (insertCells) {
			for (let row of rows) {
				if (!row.dataset.header)
					Foxtrick.insertFeaturedCell(row, module, liveTdIdx);
			}
		}

		var source;
		Foxtrick.forEach(function(row) {
			let tds = row.cells;

			/** @type {HTMLAnchorElement} */
			let matchLink = row.querySelector(MATCH_SELECTOR);
			if (!matchLink) {
				// unused row
				if (useColSpan && tds[0])
					tds[0].colSpan = 4;

				return;
			}

			let scoreTd = tds[scoreIdx];
			if (!scoreTd || !/^\d+\D+\d+$/.test(scoreTd.textContent.trim()))
				return;

			/** @type {HTMLAnchorElement} */
			let liveLink = row.querySelector(LIVE_SELECTOR);
			if (liveLink)
				return;

			let url = matchLink.href;
			let id = Foxtrick.util.id.getMatchIdFromUrl(url);
			source = Foxtrick.getUrlParam(url, 'SourceSystem');
			if (matches) {
				matches.push(id);
				return; // don't run on series
			}

			url = '/Club/Matches/Live.aspx?matchID=' + id +
				'&actionType=addMatch&SourceSystem=' + source;
			liveLink = Foxtrick.createFeaturedElement(doc, module, 'a');
			liveLink.href = url;
			tds[liveTdIdx].appendChild(liveLink);

			imgPromise.then(img => liveLink.appendChild(Foxtrick.cloneElement(img, true)));

		}, rows);

		if (addAllLink) {
			addAllLink.href = '/Club/Matches/Live.aspx?matchID=' + matches.join(',') +
				'&actionType=addMatch&SourceSystem=' + source;
		}
	},
};
