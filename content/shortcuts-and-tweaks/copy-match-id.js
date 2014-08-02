'use strict';
/**
* copy-match-id.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

Foxtrick.modules['CopyMatchID'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['matches', 'matchesArchive', 'matchesHistory', 'matchesCup',
					'matchesLatest', 'arena'],
	//CSS: Foxtrick.InternalPath + 'resources/css/copy-match-id.css',

	run: function(doc) {
		var copyId = function(ev) {
			try {
				var matchid = ev.target.getAttribute('matchid');
				Foxtrick.copyStringToClipboard(matchid);
				Foxtrick.util.note.add(doc, Foxtrick.L10n.getString('copy.matchid.copied'),
				                       'ft-match-id-copy-note');
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		var count = 0;

		if (Foxtrick.isPage(doc, 'matchesArchive')
			|| Foxtrick.isPage(doc, 'matches')
			|| Foxtrick.isPage(doc, 'matchesCup')
			|| Foxtrick.isPage(doc, 'matchesHistory')
			|| Foxtrick.isPage(doc, 'matchesLatest')
			|| Foxtrick.isPage(doc, 'arena')) {
			var cells = doc.getElementById('mainBody').getElementsByTagName('td');
			for (var i = 0; i < cells.length; i++) {
				// nested table check
				var td = cells[i].getElementsByTagName('td').length;
				if (td != 0)
					continue;

				var images = cells[i].getElementsByTagName('img');
				for (var j = 0; j < images.length; j++) {
					var image = images[j];
					if (image.className.search(new RegExp('matchLeague|matchFriendly' +
					    '|matchMasters|matchCup|matchQualification|matchTournament' +
						'|matchSingleMatch')) == -1)
						continue;

					var href = '';
					var links = cells[i + 1].getElementsByTagName('a');
					for (var j = 0; j < links.length; j++) {
						if (links[j].href.match(/Club\/Matches\/Match\.aspx/i)) {
							href = links[j].href;
							break;
						}
					}
					if (href == '')
						continue;
					var matchid = href.replace(/.+matchID=/i, '').match(/^\d+/)[0];

					image.setAttribute('title', image.title + ': ' +
					                   Foxtrick.L10n.getString('copy.matchid'));
					image = Foxtrick.makeFeaturedElement(image, this);
					image.setAttribute('matchid', matchid);
					image.setAttribute('id', '_' + this.MODULE_NAME + count);
					Foxtrick.onClick(image, copyId);
					Foxtrick.addClass(image, 'ft-link');

					count++;
				}
			}
		}
	}
};
