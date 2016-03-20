'use strict';
/**
 * read-ht-prefs.js
 * Read Hattrick preferences and change Foxtrick's accordingly.
 *
 * @author ryanli, convinced, CatzHoek, LA-MJ
 */

Foxtrick.modules['ReadHtPrefs'] = {
	OUTSIDE_MAINBODY: true,
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
		var lang = null;
		var metas = doc.getElementsByTagName('meta');
		Foxtrick.any(function(meta) {
			if (meta.getAttribute('http-equiv') == 'Content-Language') {
				lang = meta.getAttribute('content');
				return true;
			}
			return false;
		}, metas);
		return lang;
	},

	readLanguage: function(doc) {
		var metaLang = this.readLanguageFromMetaTag(doc);
		if (!metaLang) {
			Foxtrick.error('No meta lang');
			return;
		}

		var newLang = Foxtrick.L10n.htMapping[metaLang];
		var oldLang = Foxtrick.Prefs.getString('htLanguage');
		if (newLang == oldLang)
			return;

		Foxtrick.log('Language changed. ht:', metaLang, 'ft:', newLang, 'old-ft:', oldLang);

		var langDef = Foxtrick.L10n.htLanguagesJSON[newLang];
		if (langDef) {
			Foxtrick.Prefs.setString('htLanguage', newLang);
			if (Foxtrick.arch == 'Gecko') {
				// change language
				Foxtrick.L10n.setUserLocaleGecko(newLang);
			}
			var langDesc = langDef.language.desc;

			var msg = Foxtrick.L10n.getString('ReadHtPrefs.HTLanguageChanged');
			var tag = /%s/;
			if (tag.test(msg))
				msg = msg.replace(tag, langDesc);
			else
				msg += ' ' + langDesc; // fallback for outdated description

			Foxtrick.util.note.add(doc, msg, 'ft-language-changed', { focus: true });
		}
		else {
			Foxtrick.log('Language changed:', newLang, '(' + metaLang + ')',
			             'but no Foxtrick support yet.');
		}

		if (Foxtrick.platform === 'Firefox') {
			Foxtrick.modules.UI.update(doc);
		}
	},

	readCountry: function(doc) {
		var teamLinks = doc.querySelectorAll('#teamLinks a');
		var leagueLink = teamLinks[2];
		var leagueId = Foxtrick.getParameterFromUrl(leagueLink.href, 'leagueId');
		var country = Foxtrick.L10n.getCountryNameEnglish(leagueId);
		Foxtrick.Prefs.setString('htCountry', country);
	},

	readDateFormat: function(doc) {
		var clockRe = /HT\.Clock\.init\((?!\))/i;
		var formatRe = /HT\.Clock\.init\(\s*(?:\d+\s*,\s*)*'([ymd\-]+)'(?:\s*,\s*-?\d+)*\s*\)/i;
		var scripts = doc.getElementsByTagName('script');
		Foxtrick.forEach(function(tag) {
			var script = tag.textContent;
			var clockMatch = script.match(clockRe);
			if (clockMatch) {
				// function call to timeDiff in the script
				var formatMatch = script.match(formatRe);
				if (!formatMatch) {
					// failed to match regular expression
					Foxtrick.error('Cannot find date format: ' + script.slice(clockMatch.index));
				}
				else {
					var dateFormat = formatMatch[1];
					// make sure the format has characters 'd', 'm', 'y' in it
					if (dateFormat.indexOf('d') != -1 &&
					    dateFormat.indexOf('m') != -1 &&
					    dateFormat.indexOf('y') != -1) {
						Foxtrick.util.time.setDateFormat(dateFormat);
					}
					else {
						Foxtrick.error('Incomplete date format:', dateFormat);
					}
				}
				return;
			}
		}, scripts);
	},
};
