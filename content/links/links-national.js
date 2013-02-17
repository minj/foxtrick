'use strict';
/**
 * links-national.js
 * Foxtrick add links to national pages
 * @author convinced
 */

Foxtrick.modules['LinksNational'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['national'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links'].getOptionsHtml(doc, 'LinksNational', 'nationalteamlink',
		                                                callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		var countryid;
		var ntteamid;
		var LeagueOfficeTypeID = doc.location.href.replace(/.+LeagueOfficeTypeID=/i, '')
			.match(/^\d+/);
		var main = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
		var ownBoxBody = null;
		var thisdiv = main.getElementsByTagName('div')[0];
		countryid = Foxtrick.util.id.findLeagueId(thisdiv);
		ntteamid = Foxtrick.util.id.findTeamId(thisdiv);

		var links =
			Foxtrick.modules['Links'].getLinks('nationalteamlink',
			                                   { 'countryid': countryid, 'ntteamid': ntteamid,
			                                   'LeagueOfficeTypeID': LeagueOfficeTypeID }, doc, this);

		var added = 0;
		ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
		var header = Foxtrickl10n.getString('links.boxheader');
		var ownBoxBodyId = 'foxtrick_links_content';
		ownBoxBody.setAttribute('id', ownBoxBodyId);

		for (var k = 0; k < links.length; k++) {
			links[k].link.className = 'inner';
			ownBoxBody.appendChild(links[k].link);
			++added;
		}

		if (FoxtrickPrefs.isModuleEnabled('LinksTracker')) {
			var links2 =
				Foxtrick.modules['Links'].getLinks('trackernationalteamlink',
				                                   { 'countryid': countryid, 'ntteamid': ntteamid,
				                                   'LeagueOfficeTypeID': LeagueOfficeTypeID },
				                                   doc, Foxtrick.modules['LinksTracker']);
			for (var k = 0; k < links2.length; k++) {
				links2[k].link.className = 'flag inner';
				var img = links2[k].link.getElementsByTagName('img')[0];
				var style = 'vertical-align:top; margin-top:1px; background: ' +
					'transparent url(/Img/Flags/flags.gif) no-repeat scroll ' + (-20) * countryid +
					'px 0pt; -moz-background-clip: -moz-initial; -moz-background-origin: ' +
					'-moz-initial; -moz-background-inline-policy: -moz-initial;';
				img.setAttribute('style', style);
				img.src = '/Img/Icons/transparent.gif';
				ownBoxBody.appendChild(links2[k].link);
				++added;
			}
		}
		if (added) {
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
		}

		Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME,
		                        { 'countryid': countryid, 'ntteamid': ntteamid,
		                        'LeagueOfficeTypeID': LeagueOfficeTypeID });
	}
};
