"use strict";
/**
 * relive-links.js
 * add missing Re-Live links
 * @author LA-MJ
 */

Foxtrick.modules["ReLiveLinks"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ['matches', 'matchesArchive', 'cupMatches', 'fixtures', 'youthFixtures', 'series'],
	NICE : -1, //before any modules that might change row count
	run : function(doc) { 
	
		var rows, row, liveTdIdx = 4, cloneUrlIdx = 5, tdCount = 7, scoreIdx = 3;
		
		if (Foxtrick.isPage('series', doc)) {
			tdCount = 3;
			cloneUrlIdx = 0;
			liveTdIdx = 2;
			scoreIdx = 1;
			rows = doc.querySelectorAll('table.indent.left.thin > tbody > tr');

			var addAll = doc.createElement('img');
			addAll.src = '/Img/Icons/transparent.gif';
			addAll.className = 'matchHTReLive';
			addAll.alt = addAll.title = 
				doc.getElementById('ctl00_ctl00_CPContent_CPMain_imgAddRound').alt;
			var addAllLink = doc.createElement('a');
			addAllLink.appendChild(addAll);
			var addAllSpan = doc.createElement('span');
			addAllSpan.className = 'float_right';
			addAllSpan.appendChild(addAllLink);
			
			var matches = [];

			for (var i = 0, m = rows.length; i < m; ++i) {
				row = rows[i];
				if (i) 
					Foxtrick.insertFeaturedCell(row, this, -1);
				else {
					var header = Foxtrick.createFeaturedElement(doc, this, "th");
					header.appendChild(addAllSpan);
					row.appendChild(header);
				}
			}
		}
		else if (Foxtrick.isPage('fixtures', doc) || Foxtrick.isPage('youthFixtures', doc)) {
			tdCount = 4;
			cloneUrlIdx = 1;
			liveTdIdx = 3;
			scoreIdx = 2;
			rows = doc.querySelectorAll('#ctl00_ctl00_CPContent_CPMain_repFixtures > table > tbody > tr');
			if (Foxtrick.isPage('youthFixtures', doc)) {
				for (var i = 0, m = rows.length; i < m; ++i) {
					row = rows[i];
					Foxtrick.insertFeaturedCell(row, this, liveTdIdx);
				}
			}
		}
		else if (Foxtrick.isPage('cupMatches', doc)) {
			tdCount = 6;
			cloneUrlIdx = 2;
			rows = doc.querySelectorAll('table.indent > tbody > tr');
			for (var i = 0, m = rows.length; i < m; ++i) {
				row = rows[i];
				if (i) 
					Foxtrick.insertFeaturedCell(row, this, liveTdIdx);
				else {
					var header = Foxtrick.createFeaturedElement(doc, this, "th");
					row.appendChild(header);
				}
			}			
		}
		else if (Foxtrick.isPage('matchesArchive', doc)) {
			rows = doc.querySelectorAll('table.indent > tbody > tr');
			for (var i = 0, m = rows.length; i < m; ++i) {
				row = rows[i];
				Foxtrick.insertFeaturedCell(row, this, liveTdIdx);
			}
		}
		else rows = doc.querySelectorAll('table.naked > tbody > tr');
		
		var img, tds, liveTd, address, id, source, links, link;
		img = doc.createElement('img');
		img.src = '/Img/Icons/transparent.gif';
		img.alt = img.title = 'HT Re-Live';
		img.className = 'matchHTReLive';
		
		for (var i = 0, m = rows.length; i < m; ++i) {
			row = rows[i];
			tds = row.getElementsByTagName('td');
			if (tds.length != tdCount) continue;
			if ( ! Foxtrick.trim(tds[scoreIdx].textContent).match(/^\d/)) continue;
			liveTd = tds[liveTdIdx];
			if (liveTd.getElementsByTagName('a').length) continue;
			links = tds[cloneUrlIdx].getElementsByTagName('a');
			if (!links.length) continue;
			address = links[0].href;
			id = Foxtrick.util.id.getMatchIdFromUrl(address);
			source = Foxtrick.getParameterFromUrl(address, 'SourceSystem');
			address = '/Club/Matches/Live.aspx?matchID=' + id + '&actionType=addMatch&SourceSystem=' + source;
			link = Foxtrick.createFeaturedElement(doc, this, 'a');
			link.href = address;
			link.appendChild(img.cloneNode());
			liveTd.appendChild(link);
			
			if (matches) matches.push(id);
		}
		if (addAllLink)
			addAllLink.href = '/Club/Matches/Live.aspx?matchID=' + matches.join(',') + '&actionType=addMatch&SourceSystem=' + source;
	}
};
