'use strict';
/**
 * relive-links.js
 * add missing Re-Live links
 * @author LA-MJ
 */

Foxtrick.modules['ReLiveLinks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['matches', 'matchesArchive', 'cupMatches',
			 'fixtures', 'youthFixtures', 'series'],
	NICE: -1, //before any modules that might change row count
	run: function(doc) {
		//don't run on live table
		var liveSeriesLink = doc.getElementById('ctl00_ctl00_CPContent_CPMain_hlLive');
		if (liveSeriesLink && liveSeriesLink.hasAttribute('disabled')) {
			this.CSS = null;
			Foxtrick.util.css.reload_module_css(doc);
			return;
		}

		var img = doc.createElement('img');
		img.src = '/Img/Icons/transparent.gif';
		img.alt = img.title = 'HT Re-Live';
		img.className = 'matchHTReLive';

		var rows, row, liveTdIdx = 4, cloneUrlIdx = 5, tdCount = 7, scoreIdx = 3;

		if (Foxtrick.isPage(doc, 'series')) {

			tdCount = 2;//3;
			cloneUrlIdx = 0;
			liveTdIdx = 2;
			scoreIdx = 1;
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

/*			var addAll = doc.createDocumentFragment();
			Foxtrick.addImage(doc, addAll, {
				src: Foxtrick.InternalPath+'resources/img/relive-small.png',
				alt: doc.getElementById('ctl00_ctl00_CPContent_CPMain_imgAddRound').alt,
				title: doc.getElementById('ctl00_ctl00_CPContent_CPMain_imgAddRound').alt });*/

			var addAllLink = doc.createElement('a');
			addAllLink.appendChild(addAll);
			var addAllSpan = Foxtrick.createFeaturedElement(doc, this, 'span');
			Foxtrick.addClass(addAllSpan, 'float_right');
			addAllSpan.appendChild(addAllLink);

			var matches = [];

			for (var i = 0, m = rows.length; i < m; ++i) {
				row = rows[i];
				if (i);//Foxtrick.insertFeaturedCell(row, this, -1);
				else {
/*					var header = Foxtrick.createFeaturedElement(doc, this, 'th');
					header.appendChild(addAllSpan);
					row.appendChild(header);*/
					if (/\d[^\d]+\d/.test(rows[1].cells[1].textContent))
						// don't add before the first round of the season
						row.cells[0].appendChild(addAllSpan);
				}
			}
		}
		else if (Foxtrick.isPage(doc, 'fixtures') || Foxtrick.isPage(doc, 'youthFixtures')) {
			tdCount = 4;
			cloneUrlIdx = 1;
			liveTdIdx = 3;
			scoreIdx = 2;
			rows = doc.querySelectorAll('#ctl00_ctl00_CPContent_CPMain_repFixtures > table ' +
			                            '> tbody > tr');
			if (Foxtrick.isPage(doc, 'youthFixtures')) {
				for (var i = 0, m = rows.length; i < m; ++i) {
					row = rows[i];
					Foxtrick.insertFeaturedCell(row, this, liveTdIdx);
				}
			}
		}
		else if (Foxtrick.isPage(doc, 'cupMatches')) {
			tdCount = 6;
			cloneUrlIdx = 2;
			rows = doc.querySelectorAll('table.indent > tbody > tr');
			for (var i = 0, m = rows.length; i < m; ++i) {
				row = rows[i];
				if (i)
					Foxtrick.insertFeaturedCell(row, this, liveTdIdx);
				else {
					var header = Foxtrick.createFeaturedElement(doc, this, 'th');
					row.appendChild(header);
				}
			}
		}
		else if (Foxtrick.isPage(doc, 'matchesArchive')) {
			rows = doc.querySelectorAll('table.indent > tbody > tr');
			for (var i = 0, m = rows.length; i < m; ++i) {
				row = rows[i];
				Foxtrick.insertFeaturedCell(row, this, liveTdIdx);
			}
		}
		else rows = doc.querySelectorAll('table.naked > tbody > tr');

		var tds, liveTd, address, id, source, links, link;

		for (var i = 0, m = rows.length; i < m; ++i) {
			row = rows[i];
			tds = row.getElementsByTagName('td');
			if (tds.length != tdCount) continue;
			if (!tds[scoreIdx].textContent.trim().match(/^\d/))
				continue;
			liveTd = tds[liveTdIdx];
			if (liveTd && liveTd.getElementsByTagName('a').length) continue;
			links = tds[cloneUrlIdx].getElementsByTagName('a');
			if (!links.length) continue;
			address = links[0].href;
			id = Foxtrick.util.id.getMatchIdFromUrl(address);
			source = Foxtrick.getParameterFromUrl(address, 'SourceSystem');
			if (matches) {
				matches.push(id);
				continue;
				//don't run on series
			}
			address = '/Club/Matches/Live.aspx?matchID=' + id + '&actionType=addMatch&SourceSystem='
				+ source;
			link = Foxtrick.createFeaturedElement(doc, this, 'a');
			link.href = address;
			link.appendChild(img.cloneNode(true));
			liveTd.appendChild(link);
		}
		if (addAllLink)
			addAllLink.href = '/Club/Matches/Live.aspx?matchID=' + matches.join(',') + '&actionType=addMatch&SourceSystem=' + source;
		}
};
