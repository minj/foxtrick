'use strict';
/**
* copy-match-id.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

Foxtrick.modules['CopyMatchID'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: [
		'matches', 'worldMatches', 'matchesArchive',
		'matchesHistory', 'matchesLatest', 'arena'
	],
	//CSS: Foxtrick.InternalPath + 'resources/css/copy-match-id.css',

	run: function(doc) {
		var module = this;
		var copyId = function() {
			try {
				var matchid = this.getAttribute('data-matchid');
				Foxtrick.copyStringToClipboard(matchid);
				Foxtrick.util.note.add(doc, Foxtrick.L10n.getString('copy.matchid.copied'),
				                       'ft-match-id-copy-note');
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		var mainBody = doc.getElementById('mainBody');
		var matches = '.' + Foxtrick.Pages.Matches.Types.join(', .');
		var count = 0;

		var images = mainBody.querySelectorAll(matches);
		Foxtrick.forEach(function(image) {
			var parent = image.parentNode;
			if (parent.nodeName !== 'TD')
				// only support tables for now
				return;
			var row = parent.parentNode;
			var matchLink = row.querySelector('a[href*="/Club/Matches/Match.aspx"]');
			if (!matchLink)
				return;

			var href = matchLink.href;
			var matchid = href.replace(/.+matchID=/i, '').match(/^\d+/)[0];

			image.setAttribute('title', image.title + ': ' +
			                   Foxtrick.L10n.getString('copy.matchid'));
			image = Foxtrick.makeFeaturedElement(image, module);
			image.setAttribute('data-matchid', matchid);
			image.id = 'ft_' + module.MODULE_NAME + count;
			Foxtrick.onClick(image, copyId);
			Foxtrick.addClass(image, 'ft-link');

			count++;
		}, images);
	}
};
