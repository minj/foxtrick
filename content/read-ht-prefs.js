"use strict";
﻿/**
 * read-ht-prefs.js
 * Read Hattrick preferences and change FoxTrick's accordingly.
 * @author convinced, ryanli
 */

Foxtrick.util.module.register({
	MODULE_NAME : "ReadHtPrefs",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MAIN,
	PAGES : ["all"],
	NICE : -20,

	run : function(doc) {
		// only read preferences if logged in
		if (!Foxtrick.Pages.All.isLoggedIn(doc))
			return;
		this.readLanguage(doc);
		this.readCountry(doc);
		this.readDateFormat(doc);
	},

	isLang : function(menuLinks, lang) {
		var items = ["MyHattrick", "MyClub", "World", "Forum", "Shop", "Help"];

		var languages = Foxtrickl10n.htLanguagesXml;
		if (languages[lang])
			var language = languages[lang]; // mappings of specified lang
		else
			return false; // return if language not found

		for (var i = 0, j = 0;
			i < menuLinks.length && j < items.length;
			++i) {
			if (menuLinks[i].textContent == "Alltid") // 5th entry might be alltid. skip it
				continue;
			var linkTitle = language.getElementsByTagName(items[j])[0];
			if (!linkTitle || menuLinks[i].textContent.indexOf(linkTitle.getAttribute("value")) == -1) {
				// not this language
				return false;
			}
			++j;
		}
		return true;
	},

	readLanguage : function(doc) {
		var newLang = null;
		var oldLang = FoxtrickPrefs.getString("htLanguage");
		var languages = Foxtrickl10n.htLanguagesXml;

		var menu = doc.getElementById("menu");
		var menuLinks = menu.getElementsByTagName("a");

		if (!this.isLang(menuLinks, oldLang)) {
			// language has changed or there is none for some reason, look for the new one
			var found = false;
			for (var k in languages) {
				if (this.isLang(menuLinks, k)) {
					newLang = k;
					found = true;
					Foxtrick.log("Language changed: " + newLang + ", old language: " + oldLang + ".");
					break;
				}
			}
			if (found) {
				FoxtrickPrefs.setString("htLanguage", newLang);
				if (Foxtrick.arch == "Gecko") {
					// change language
					Foxtrickl10n.setUserLocaleGecko(newLang);
				}
				var language = Foxtrick.xml_single_evaluate(languages[newLang], "language", "desc");

				var msg  = Foxtrickl10n.getString("HTLanguageChanged");
				if ( msg.search('%s')!=-1 ) msg = msg.replace("%s", language);
				else msg += ' ' + language; // fallback for outdated description

				Foxtrick.util.note.add(doc, null, "ft-language-changed", msg, null, true, true);
			}
			else {
				Foxtrick.log("Cannot detect language.");
			}
		}
	},

	readCountry : function(doc) {
		var header = doc.getElementById('header');
		var teamLinks = doc.getElementById('teamLinks').getElementsByTagName('a');

		var CountryLink = teamLinks[2];
		var LeagueId = CountryLink.href.replace(/.+leagueid=/i, "").match(/^\d+/)[0];
		var country = Foxtrick.util.id.getLeagueDataFromId(LeagueId).EnglishName;
		FoxtrickPrefs.setString("htCountry", country);
	},

	readDateFormat : function(doc) {
		var scripts = doc.getElementsByTagName("script");
		for (var i = 0; i < scripts.length; ++i) {
			var script = scripts[i].innerHTML;
			var timeDiffOff = script.indexOf("timeDiff");
			if (timeDiffOff != -1) {
				// function call to timeDiff in the script
				var funcCall = script.substr(timeDiffOff);
				var matched = funcCall.match(RegExp("timeDiff\\('\\d+','\\d+','\\d+','\\d+','\\d+','\\d+','(.+)'\\);"));
				// failed to match regular expression
				if (matched == null) {
					Foxtrick.log("Cannot find date format: ", funcCall);
				}
				else {
					var dateFormat = matched[1];
					// make sure the format has characters "d", "m", "y" in it
					if (dateFormat.indexOf("d") != -1
						&& dateFormat.indexOf("m") != -1
						&& dateFormat.indexOf("y") != -1) {
						Foxtrick.util.time.setDateFormat(dateFormat);
					}
				}
				return;
			}
		}
	}
});
