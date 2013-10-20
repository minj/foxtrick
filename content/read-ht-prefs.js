'use strict';
/**
 * read-ht-prefs.js
 * Read Hattrick preferences and change FoxTrick's accordingly.
 * @author convinced, ryanli
 */

Foxtrick.modules['ReadHtPrefs'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MAIN,
	PAGES: ['all'],
	CORE_MODULE: true,
	NICE: -20,

	run: function(doc) {
		// only read preferences if logged in
		if (!Foxtrick.Pages.All.isLoggedIn(doc))
			return;
		this.readLanguage(doc);
		this.readCountry(doc);
		this.readDateFormat(doc);
	},

	readLanguageFromMetaTag: function(doc) {
		var meta = doc.getElementsByTagName('meta');
		var lang = null;
		for (var i = 0; i < meta.length; i++)
		{
			if (meta[i].getAttribute('http-equiv') == 'Content-Language')
				var lang = meta[i].getAttribute('content');
		}
		return lang;
	},

	readLanguage: function(doc) {
		var readLang = this.readLanguageFromMetaTag(doc);
		var newLang = Foxtrickl10n.htMapping[readLang];
		var oldLang = FoxtrickPrefs.getString('htLanguage');

		if (newLang != oldLang) {
			Foxtrick.log('Language changed. ht: ' + readLang + ' ft: ' + newLang +
			             ', old language: ft: ' + oldLang + '.');
			if (Foxtrickl10n.htLanguagesJSON[newLang]) {
				FoxtrickPrefs.setString('htLanguage', newLang);
				if (Foxtrick.arch == 'Gecko') {
					// change language
					Foxtrickl10n.setUserLocaleGecko(newLang);
				}
				var language = Foxtrickl10n.htLanguagesJSON[newLang].language.desc;

				var msg = Foxtrickl10n.getString('ReadHtPrefs.HTLanguageChanged');
				if (msg.search('%s') != -1)
					msg = msg.replace('%s', language);
				else
					msg += ' ' + language; // fallback for outdated description

				Foxtrick.util.note.add(doc, null, 'ft-language-changed', msg, null, true, true);
			} else {
				Foxtrick.log('Language changed: ' + newLang + '(' + readLang +
				             ') but no Foxtrick support yet.');
			}
		}
	},

	readCountry: function(doc) {
		var header = doc.getElementById('header');
		var teamLinks = doc.getElementById('teamLinks').getElementsByTagName('a');

		var CountryLink = teamLinks[2];
		var LeagueId = CountryLink.href.replace(/.+leagueid=/i, '').match(/^\d+/)[0];
		var country = Foxtrick.util.id.getLeagueDataFromId(LeagueId).EnglishName;
		FoxtrickPrefs.setString('htCountry', country);
	},

	readDateFormat: function(doc) {
		var scripts = doc.getElementsByTagName('script');
		for (var i = 0; i < scripts.length; ++i) {
			var script = scripts[i].innerHTML;
			var timeDiffOff = script.search(/HT.Clock.init/i);
			if (timeDiffOff != -1) {
				// function call to timeDiff in the script
				var funcCall = script.substr(timeDiffOff);
				var matched = funcCall.match(RegExp('HT.Clock.init\\(\\d+,\\s?\\d+,\\s?\\d+,\\s?' +
				                             '\\d+,\\s?\\d+,\\s?\\d+,\\s?\'(.+)\'\\);'));
				// failed to match regular expression
				if (matched == null) {
					Foxtrick.log('Cannot find date format: ', funcCall);
				}
				else {
					var dateFormat = matched[1];
					// make sure the format has characters 'd', 'm', 'y' in it
					if (dateFormat.indexOf('d') != -1
						&& dateFormat.indexOf('m') != -1
						&& dateFormat.indexOf('y') != -1) {
						Foxtrick.util.time.setDateFormat(dateFormat);
					}
				}
				return;
			}
		}
	}
};
