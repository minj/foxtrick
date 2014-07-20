'use strict';
/**
 * relive-links.js
 * add missing Re-Live links
 * @author LA-MJ
 */

Foxtrick.modules['ReLiveLinks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: [
		'matches', 'worldMatches', 'matchesArchive', 'cupMatches',
		'fixtures', 'youthFixtures', 'series'
	],
	NICE: -1, // before any modules that might change row count
	run: function(doc) {
		// don't run on live table
		var liveSeriesLink = doc.getElementById('ctl00_ctl00_CPContent_CPMain_hlLive');
		if (liveSeriesLink && liveSeriesLink.hasAttribute('disabled')) {
			return;
		}

		var matchSelector = 'a[href*="/Club/Matches/Match.aspx"]';
		var liveSelector = 'a[href*="/Club/Matches/Live.aspx"]';
		var findMatchTdIdx = function(rows) {
			var tbody = rows[0].parentNode;
			var matchLink = tbody.querySelector(matchSelector);
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

		// var rows, row, liveTdIdx = 4, matchTdIdx = 5, tdCount = 7, scoreIdx = 3;
		var rows, addAllLink, matches, insertCells = false, insertHeader = false;

		if (Foxtrick.isPage(doc, 'series')) {

			matches = [];
			rows = doc.querySelectorAll('table.indent.left.thin > tbody > tr');

			if (!rows)
				return;

			img = doc.createDocumentFragment();
			Foxtrick.addImage(doc, img, { src: Foxtrick.InternalPath +
				'resources/img/relive-small.png', alt: 'HT Re-Live', title: 'HT Re-Live' });

			var addAll = doc.createElement('img');
			addAll.src = '/Img/Icons/transparent.gif';
			addAll.className = 'matchHTReLive';
			addAll.alt = addAll.title =
				Foxtrick.L10n.getString('ReLiveLinks.addRound');

			addAllLink = doc.createElement('a');
			addAllLink.appendChild(addAll);
			var addAllSpan = Foxtrick.createFeaturedElement(doc, this, 'span');
			Foxtrick.addClass(addAllSpan, 'float_right');
			addAllSpan.appendChild(addAllLink);

			if (/\d[^\d]+\d/.test(rows[1].cells[1].textContent))
				// don't add before the first round of the season
				rows[0].cells[0].appendChild(addAllSpan);
		}
		else if (Foxtrick.isPage(doc, 'fixtures') || Foxtrick.isPage(doc, 'youthFixtures')) {
			rows = doc.querySelectorAll('#ctl00_ctl00_CPContent_CPMain_repFixtures tr');

			if (Foxtrick.isPage(doc, 'youthFixtures')) {
				insertCells = true;
			}
		}
		else if (Foxtrick.isPage(doc, 'cupMatches')) {
			rows = doc.querySelectorAll('table.indent > tbody > tr');
			insertCells = true;
			insertHeader = true;
		}
		else if (Foxtrick.isPage(doc, 'matchesArchive')) {
			rows = doc.querySelectorAll('table.indent > tbody > tr');
			insertCells = true;
		}
		else {
			rows = doc.querySelectorAll('table.naked > tbody > tr');
			if (Foxtrick.isPage(doc, 'worldMatches')) {
				insertCells = true;
			}
		}

		var matchTdIdx = findMatchTdIdx(rows);
		if (matchTdIdx === -1)
			return;
		var scoreIdx = matchTdIdx + 1;
		var liveTdIdx = matchTdIdx + 2;

		var i = 0;
		if (insertCells) {
			var j = 0;
			if (insertHeader) {
				var header = Foxtrick.createFeaturedElement(doc, this, 'th');
				var lastCell = rows[0].cells.length - 1;
				if (liveTdIdx < lastCell)
					rows[0].insertBefore(header, rows[0].cells[liveTdIdx]);
				else
					rows[0].appendChild(header);
				i = j = 1;
			}
			for (var m = rows.length; j < m; ++j) {
				Foxtrick.insertFeaturedCell(rows[j], this, liveTdIdx);
			}
		}

		for (var m = rows.length; i < m; ++i) {
			var row = rows[i];
			var tds = row.cells;
			var scoreTd = tds[scoreIdx];
			if (!scoreTd || !/^\d+\D+\d+$/.test(scoreTd.textContent.trim()))
				continue;

			var matchLink = row.querySelector(matchSelector);
			if (!matchLink)
				continue;

			var liveLink = row.querySelector(liveSelector);
			if (liveLink)
				continue;

			var url = matchLink.href;
			var id = Foxtrick.util.id.getMatchIdFromUrl(url);
			var source = Foxtrick.getParameterFromUrl(url, 'SourceSystem');
			if (matches) {
				matches.push(id);
				continue;
				// don't run on series
			}
			url = '/Club/Matches/Live.aspx?matchID=' + id +
				'&actionType=addMatch&SourceSystem=' + source;
			liveLink = Foxtrick.createFeaturedElement(doc, this, 'a');
			liveLink.href = url;
			liveLink.appendChild(img.cloneNode(true));
			tds[liveTdIdx].appendChild(liveLink);
		}
		if (addAllLink)
			addAllLink.href = '/Club/Matches/Live.aspx?matchID=' + matches.join(',') +
				'&actionType=addMatch&SourceSystem=' + source;
		}
};
