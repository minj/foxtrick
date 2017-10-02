'use strict';
/**
 * relive-links.js
 * add missing Re-Live links
 * @author LA-MJ
 */

Foxtrick.modules['ReLiveLinks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: [
		'matchesLive', // export live
		'series', // combo link
		'fixtures', 'youthFixtures', // table mess
		'cupMatches', 'worldCup', // insertCells, insertHeader
		'matchesArchive', 'worldMatches', // insertCells
	],
	NICE: -1, // before any modules that might change row count
	OPTIONS: ['ReLive', 'Live'],
	run: function(doc) {
		if (Foxtrick.isPage(doc, 'matchesLive') &&
		    Foxtrick.Prefs.isModuleOptionEnabled('ReLiveLinks', 'Live'))
			this.live(doc);
		else if (Foxtrick.Prefs.isModuleOptionEnabled('ReLiveLinks', 'ReLive'))
			this.reLive(doc);
	},
	live: function(doc) {
		var module = this;
		var LINK_TEMPLATE = '[link=/Club/Matches/Live.aspx' +
			'?matchID={}&actionType=addMatch&SourceSystem={}]\n';
		var COPY = Foxtrick.L10n.getString('copy.asLink');
		var SUCCESS = Foxtrick.L10n.getString('copy.asLink.copied');
		var BUTTON_ID = 'ft-bulk-live-link';

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

		var copyBulkLinks = function() {
			var doc = this.ownerDocument;
			var links = doc.getElementsByClassName('removeTab2');
			if (!links.length)
				return;

			var matches = {};
			Foxtrick.forEach(function(link) {
				var url = link.getAttribute('onclick');
				var uid = Foxtrick.getParameterFromUrl(url, 'UniqueMatchId');
				var source = getSourceFromUId(uid);
				if (!matches[source])
					matches[source] = [];

				var id = uid.match(/\d+/)[0];
				matches[source].push(id);
			}, links);

			var text = '';
			for (var type in matches) {
				var list = matches[type].toString();
				text += Foxtrick.format(LINK_TEMPLATE, [list, type]);
			}

			Foxtrick.copy(doc, text);
			Foxtrick.util.note.add(doc, SUCCESS, 'ft-relive-copy-note');
		};

		var addBulkButton = function() {
			var button = doc.getElementById(BUTTON_ID);
			if (button)
				button.parentNode.removeChild(button);

			var target = doc.querySelector('.liveConfLink');
			if (!target)
				return;

			button = Foxtrick.createFeaturedElement(doc, module, 'a');
			button.id = BUTTON_ID;
			button.className = 'ft-link liveConfLink shy right';
			button.textContent = COPY;
			Foxtrick.onClick(button, copyBulkLinks);
			target.parentNode.insertBefore(button, target);
		};

		Foxtrick.Pages.Match.addLiveListener(doc, addBulkButton);
	},
	reLive: function(doc) {
		var module = this;
		// don't run on live table
		var liveSeriesLink = Foxtrick.getMBElement(doc, 'hlLive');
		if (liveSeriesLink && liveSeriesLink.hasAttribute('disabled')) {
			return;
		}

		var MATCH_SELECTOR = 'a[href^="/Club/Matches/Match.aspx"]';
		var LIVE_SELECTOR = 'a[href^="/Club/Matches/Live.aspx"]';

		var findMatchTdIdx = function(rows) {
			if (!rows[0])
				return -1;
			var tbody = rows[0].parentNode;
			var matchLink = tbody.querySelector(MATCH_SELECTOR);
			if (!matchLink)
				return -1;
			var cell = matchLink.parentNode;
			if (cell.nodeName !== 'TD')
				// unknown structure
				return -1;
			var row = cell.parentNode;
			if (row.parentNode !== tbody)
				// unknown structure
				return -1;
			return Foxtrick.indexOf(row.cells, cell);
		};

		var img = doc.createElement('img');
		img.src = '/Img/Icons/transparent.gif';
		img.alt = img.title = 'HT Re-Live';
		img.className = 'matchHTReLive';

		var rows, addAllLink, matches;
		var insertCells = false, insertHeader = false, useColSpan = false;

		var reLiveSrc = Foxtrick.InternalPath + 'resources/img/relive-small.png';
		if (Foxtrick.isPage(doc, 'series')) {

			matches = [];
			rows = doc.querySelectorAll('table.indent.left.thin > tbody > tr');

			if (!rows.length)
				return;

			img = doc.createDocumentFragment();
			Foxtrick.addImage(doc, img, { src: reLiveSrc, alt: 'HT Re-Live', title: 'HT Re-Live' });

			var addAll = doc.createElement('img');
			addAll.src = '/Img/Icons/transparent.gif';
			addAll.className = 'matchHTReLive';
			addAll.alt = addAll.title =
				Foxtrick.L10n.getString('ReLiveLinks.addRound');

			addAllLink = doc.createElement('a');
			addAllLink.appendChild(addAll);
			var addAllSpan = Foxtrick.createFeaturedElement(doc, module, 'span');
			Foxtrick.addClass(addAllSpan, 'float_right');
			addAllSpan.appendChild(addAllLink);

			if (/\d[^\d]+\d/.test(rows[1].cells[1].textContent))
				// don't add before the first round of the season
				rows[0].cells[0].appendChild(addAllSpan);
		}
		else if (Foxtrick.isPage(doc, 'fixtures') || Foxtrick.isPage(doc, 'youthFixtures')) {
			var fixtures = Foxtrick.getMBElement(doc, 'repFixtures');
			rows = fixtures.querySelectorAll('tr');

			useColSpan = true; // fixes broken layout due to expanded 1st column

			if (Foxtrick.Pages.All.isYouth(doc)) {
				insertCells = true;
			}
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
		else {
			Foxtrick.error('Unhandled case in ReLiveLinks');
			return;
		}

		var matchTdIdx = findMatchTdIdx(rows);
		if (matchTdIdx === -1)
			return;

		var scoreIdx = matchTdIdx + 1;
		var liveTdIdx = matchTdIdx + 2;

		if (insertHeader) {
			Foxtrick.forEach(function(row) {
				var tbody = row.parentNode;
				if (tbody.rows[0] !== row)
					return;

				row.dataset.header = '1';

				var header = Foxtrick.createFeaturedElement(doc, module, 'th');
				var lastCell = row.cells.length - 1;
				if (liveTdIdx < lastCell)
					row.insertBefore(header, row.cells[liveTdIdx]);
				else
					row.appendChild(header);
			}, rows);
		}

		if (insertCells) {
			Foxtrick.forEach(function(row) {
				if (!row.dataset.header)
					Foxtrick.insertFeaturedCell(row, module, liveTdIdx);
			}, rows);
		}

		var source;
		Foxtrick.forEach(function(row) {
			var tds = row.cells;

			var matchLink = row.querySelector(MATCH_SELECTOR);
			if (!matchLink) {
				// unused row
				if (useColSpan && tds[0])
					tds[0].colSpan = 4;

				return;
			}

			var scoreTd = tds[scoreIdx];
			if (!scoreTd || !/^\d+\D+\d+$/.test(scoreTd.textContent.trim()))
				return;

			var liveLink = row.querySelector(LIVE_SELECTOR);
			if (liveLink)
				return;

			var url = matchLink.href;
			var id = Foxtrick.util.id.getMatchIdFromUrl(url);
			source = Foxtrick.getParameterFromUrl(url, 'SourceSystem');
			if (matches) {
				matches.push(id);
				return;
				// don't run on series
			}

			url = '/Club/Matches/Live.aspx?matchID=' + id +
				'&actionType=addMatch&SourceSystem=' + source;
			liveLink = Foxtrick.createFeaturedElement(doc, module, 'a');
			liveLink.href = url;
			liveLink.appendChild(img.cloneNode(true));
			tds[liveTdIdx].appendChild(liveLink);
		}, rows);

		if (addAllLink)
			addAllLink.href = '/Club/Matches/Live.aspx?matchID=' + matches.join(',') +
				'&actionType=addMatch&SourceSystem=' + source;
	},
};
