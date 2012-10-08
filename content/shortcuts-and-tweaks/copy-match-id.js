'use strict';
/**
* copy-match-id.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

Foxtrick.modules['CopyMatchID'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['matches', 'matchesArchive', 'matchesHistory',
					'matchesLatest', 'arena', 'matchLineup', 'match'],

	run: function(doc) {
		var copyId = function(ev) {
			try {
				var matchid = ev.target.parentNode.getAttribute('matchid');
				var insertBefore = doc.getElementById('testingNewHeader') ||
					doc.getElementsByTagName('h1')[0];
				Foxtrick.copyStringToClipboard(matchid);
				var note = Foxtrick.util.note.add(doc, insertBefore, 'ft-match-id-copy-note',
				                                  Foxtrickl10n.getString('copy.matchid.copied'),
				                                  null, true, true);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		var count = 0;

		if (Foxtrick.isPage('matchesArchive', doc)
			|| Foxtrick.isPage('matches', doc)
			|| Foxtrick.isPage('matchesHistory', doc)
			|| Foxtrick.isPage('matchesLatest', doc)
			|| Foxtrick.isPage('arena', doc)) {
			var cells = doc.getElementById('mainBody').getElementsByTagName('td');
			for (var i = 0; i < cells.length; i++) {
				// nested table check
				var td = cells[i].getElementsByTagName('td').length;
				if (td != 0)
					continue;

				var images = cells[i].getElementsByTagName('img');
				for (var j = 0; j < images.length; j++) {
					if (images[j].className.search(new RegExp('matchLeague|matchFriendly' +
					    '|matchMasters|matchCup|matchQualification|matchTournament|matchSingleMatch')) == -1)
						continue;

					var href = '';
					var links = cells[i + 1].getElementsByTagName('a');
					for (var j = 0; j < links.length; j++) {
						if (links[j].href.match(/Club\/Matches\/Match\.aspx/i)) {
							href = links[j].href;
							break;
						}
					}
					var matchid = href.replace(/.+matchID=/i, '').match(/^\d+/)[0];

					images[j].setAttribute('title', images[j].title + ': ' +
					                       Foxtrickl10n.getString('copy.matchid'));
					images[j] = Foxtrick.makeFeaturedElement(images[j], this);
					var link = doc.createElement('a');
					link.appendChild(images[j].cloneNode(true));
					link.href = 'javascript:void(0);';
					link.setAttribute('matchid', matchid);
					link.setAttribute('id', '_' + this.MODULE_NAME + count);
					Foxtrick.onClick(link, copyId);
					var div = images[j].parentNode;
					div.replaceChild(link, images[j]);

					count++;
				}
			}
		}
		else if (Foxtrick.isPage('matchLineup', doc)
			|| Foxtrick.isPage('match', doc)) {
			var images = doc.getElementById('mainBody').getElementsByTagName('img');
			for (var i = 0; i < images.length; i++) {
				if (images[i].className.search(
				    /matchLeague|matchFriendly|matchMasters|matchCup|matchQualification/) == -1)
					continue;

				var href = '';
				var links = doc.getElementsByClassName('main')[0].getElementsByTagName('a');
				for (var j = 0; j < links.length; j++) {
					if (links[j].href.match(/Club\/Matches\/Match\.aspx/i)) {
						href = links[j].href;
						break;
					}
				}
				var matchid = href.replace(/.+matchID=/i, '').match(/^\d+/)[0];

				images[i].setAttribute('title', images[i].title + ': ' +
				                       Foxtrickl10n.getString('copy.matchid'));
				images[i] = Foxtrick.makeFeaturedElement(images[i], this);
				var link = doc.createElement('a');
				link.appendChild(images[i].cloneNode(true));
				link.href = 'javascript:void(0);';
				link.setAttribute('matchid', matchid);
				link.setAttribute('id', '_' + this.MODULE_NAME + count);
				Foxtrick.onClick(link, copyId);
				var div = images[i].parentNode;
				div.replaceChild(link, images[i]);

				count++;
				break;

			}
		}
	}
};
