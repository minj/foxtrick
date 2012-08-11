"use strict";
/**
 * relive-links.js
 * add missing Re-Live links
 * @author LA-MJ
 */

Foxtrick.modules["ReLiveLinks"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ['match', 'matches', 'matchesArchive', 'cupMatches', 'fixtures', 'youthFixtures', 'series'],
	CSS : Foxtrick.InternalPath+"resources/css/relive-links.css",
	NICE : -1, //before any modules that might change row count
	run : function(doc) { 

		var img = doc.createElement('img');
		img.src = '/Img/Icons/transparent.gif';
		img.alt = img.title = 'HT Re-Live';
		img.className = 'matchHTReLive';	

		var rows, row, liveTdIdx = 4, cloneUrlIdx = 5, tdCount = 7, scoreIdx = 3;
		
		if (Foxtrick.isPage('match', doc)) {
			
			if (Foxtrick.Pages.Match.isPrematch(doc)
			|| Foxtrick.Pages.Match.inProgress(doc) )
			return;
			
			var SourceSystem = "Hattrick";
			var isYouth = Foxtrick.Pages.Match.isYouth(doc);
			var isHTOIntegrated = Foxtrick.Pages.Match.isHTOIntegrated(doc);
			if (isYouth)
				SourceSystem = "Youth";
			if (isHTOIntegrated)
				SourceSystem = "HTOIntegrated";
			var matchId = Foxtrick.Pages.Match.getId(doc);
			
			var link = Foxtrick.createFeaturedElement(doc, this, 'a');
			link.href = '/Club/Matches/Live.aspx?matchID=' + matchId + '&actionType=addMatch&SourceSystem=' + SourceSystem;
			link.appendChild(img.cloneNode(true));
			doc.getElementsByTagName('h1')[0].appendChild(link);
			
			return;
		}
		else if (Foxtrick.isPage('series', doc)) {
			tdCount = 3;
			cloneUrlIdx = 0;
			liveTdIdx = 2;
			scoreIdx = 1;
			rows = doc.querySelectorAll('table.indent.left.thin > tbody > tr');

			img = doc.createDocumentFragment();
			Foxtrick.addImage(doc, img, { src : Foxtrick.InternalPath+"resources/img/relive-small.png", alt: 'HT Re-Live', title: 'HT Re-Live' });

/*			var addAll = doc.createElement('img');
			addAll.src = '/Img/Icons/transparent.gif';
			addAll.className = 'matchHTReLive';
			addAll.alt = addAll.title = 
				doc.getElementById('ctl00_ctl00_CPContent_CPMain_imgAddRound').alt;*/

			var addAll = doc.createDocumentFragment();
			Foxtrick.addImage(doc, addAll, { src : Foxtrick.InternalPath+"resources/img/relive-small.png", alt: doc.getElementById('ctl00_ctl00_CPContent_CPMain_imgAddRound').alt, title: doc.getElementById('ctl00_ctl00_CPContent_CPMain_imgAddRound').alt });

			var addAllLink = doc.createElement('a');
			addAllLink.appendChild(addAll);
			var addAllSpan = doc.createElement('span');
			addAllSpan.className = 'float_right';
			addAllSpan.appendChild(addAllLink);
			
			var matches = [];

			for (var i = 0, m = rows.length; i < m; ++i) {
				row = rows[i];
				if (i) { 
					Foxtrick.insertFeaturedCell(row, this, -1);
					row.cells[1].textContent = row.cells[1].textContent.replace(/\s/g, '');
				}
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
		
		var tds, liveTd, address, id, source, links, link;
			
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
			link.appendChild(img.cloneNode(true));
			liveTd.appendChild(link);
			
			if (matches) matches.push(id);
		}
		if (addAllLink)
			addAllLink.href = '/Club/Matches/Live.aspx?matchID=' + matches.join(',') + '&actionType=addMatch&SourceSystem=' + source;
	}
};
