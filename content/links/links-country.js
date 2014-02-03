'use strict';
/**
 * links-league.js
 * Foxtrick add links to country pages
 * @author convinced
 */

Foxtrick.modules['LinksCountry'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['country'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links'].getOptionsHtml(doc, 'LinksCountry', 'countrylink', callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		var flag = doc.getElementsByClassName('flag')[0];
		var leagueId = Foxtrick.util.id.findLeagueId(flag.parentNode);

		// get English name
		var nameShort = Foxtrick.XMLData.League[leagueId].ShortName;

		var ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
		var header = Foxtrick.L10n.getString('links.boxheader');
		var ownBoxBodyId = 'foxtrick_links_content';
		ownBoxBody.setAttribute('id', ownBoxBodyId);

		var added = 0;

		var links = Foxtrick.modules['Links'].getLinks('countrylink', {
			'countryid': leagueId,
			'english_name': nameShort
		}, doc, this);

		if (links.length > 0) {
			for (var k = 0; k < links.length; k++) {
				links[k].link.className = 'inner';
				ownBoxBody.appendChild(links[k].link);
				added++;
			}
		}

		if (Foxtrick.Prefs.isModuleEnabled('LinksTracker')) {
			var links2 = Foxtrick.modules['Links'].getLinks('trackernationalteamlink', {
				'countryid': leagueId,
			}, doc, Foxtrick.modules['LinksTracker']);
			for (var k = 0; k < links2.length; k++) {
				links2[k].link.className = 'flag inner';
				var img = links2[k].link.getElementsByTagName('img')[0];
				var style = 'vertical-align:top; margin-top:1px; background: ' +
					'transparent url(/Img/Flags/flags.gif) no-repeat scroll ' + (-20) * leagueId +
					'px 0pt; background-clip: -moz-initial; background-origin: ' +
					'-moz-initial; background-inline-policy: -moz-initial;';
				img.setAttribute('style', style);
				img.src = '/Img/Icons/transparent.gif';
				ownBoxBody.appendChild(links2[k].link);
				++added;
			}
		}
		if (added) {
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
			Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME, { 'countryid': leagueId });
		}
	}
};
