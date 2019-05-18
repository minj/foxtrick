/**
 * read-ht-prefs.js
 * Read Hattrick preferences and change Foxtrick's accordingly.
 *
 * @author ryanli, convinced, CatzHoek, LA-MJ
 */

'use strict';

Foxtrick.modules.ReadHtPrefs = {
	OUTSIDE_MAINBODY: true,
	PAGES: ['all'],
	CORE_MODULE: true,
	NICE: -20,

	/** @param {document} doc */
	run: function(doc) {
		// only read preferences if logged in
		if (!Foxtrick.Pages.All.isLoggedIn(doc))
			return;

		this.readLanguage(doc);
		this.readCountry(doc);
		this.readDateFormat(doc);
	},

	/**
	 * @param  {document} doc
	 * @return {string}
	 */
	readLanguageFromMetaTag: function(doc) {
		var lang = null;
		var metas = doc.querySelectorAll('meta');
		Foxtrick.any(function(meta) {
			if (meta.getAttribute('http-equiv') == 'Content-Language') {
				lang = meta.getAttribute('content');
				return true;
			}
			return false;
		}, metas);
		return lang;
	},

	/** @param {document} doc */
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
			let langDesc = langDef.language.desc;

			let msg = Foxtrick.L10n.getString('ReadHtPrefs.HTLanguageChanged');
			let tag = /%s/;
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

		if (Foxtrick.platform === 'Firefox')
			Foxtrick.modules.UI.update(doc);
	},

	/** @param {document} doc */
	readCountry: function(doc) {
		/** @type {NodeListOf<HTMLAnchorElement>} */
		var teamLinks = doc.querySelectorAll('#teamLinks a');
		var leagueLink = teamLinks[2];
		if (leagueLink) {
			let leagueId = Foxtrick.getUrlParam(leagueLink.href, 'leagueId');
			let id = parseInt(leagueId, 10);
			let country = Foxtrick.L10n.getCountryNameEnglish(id);
			Foxtrick.Prefs.setString('htCountry', country);
		}
		else {
			Foxtrick.log('WARNING: no league found');
			Foxtrick.Prefs.setString('htCountry', 'N/A');
		}
	},

	/** @param {document} doc */
	readDateFormat: function(doc) {
		var clockRe = /HT\.Clock\.init\((?!\))/i;
		var formatRe = /HT\.Clock\.init\(\s*(?:\d+\s*,\s*)*'(.+?)'(?:\s*,\s*-?\d+)*\s*\)/i;
		var scripts = doc.querySelectorAll('script');
		Foxtrick.forEach(function(tag) {
			var script = tag.textContent;
			var clockMatch = script.match(clockRe);
			if (!clockMatch)
				return;

			// function call to timeDiff in the script
			var formatMatch = script.match(formatRe);
			if (formatMatch) {
				let [_, dateFormat] = formatMatch;

				if (dateFormat.indexOf('d') != -1 &&
					dateFormat.indexOf('m') != -1 &&
					dateFormat.indexOf('y') != -1) {
					// make sure the format has characters 'd', 'm', 'y' in it
					Foxtrick.util.time.setDateFormat(dateFormat);
				}
				else {
					Foxtrick.error('Incomplete date format: ' + dateFormat);
				}
			}
			else {
				// failed to match regular expression
				Foxtrick.error('Cannot find date format: ' + script.slice(clockMatch.index));
			}
		}, scripts);
	},
};
