/**
 * read-ht-prefs.js
 * Read Hattrick preferences and change FoxTrick's accordingly.
 * @author convinced, ryanli
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickReadHtPrefs = {
	MODULE_NAME : "ReadHtPrefs",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MAIN,
	PAGES : ["all"],
	NICE : -20,

	menu_strings: new Array('MyHattrick','MyClub','World','Forum','Shop','Help'),

	run : function(doc) {
		this.readLanguage(doc);
		this.readOthers(doc);
	},

	isLang : function(menuLinks, lang) {
		var languages = Foxtrickl10n.htLanguagesXml;
		var currentItem = 0; // index of menu item position
		for (var i = 0; currentItem < this.menu_strings.length && i < menuLinks.length; ++i) {
			if (menuLinks[i].textContent == "Alltid") // 5th entry might be alltid. skip it
				continue;
			var linkTitle = languages[lang].getElementsByTagName(this.menu_strings[currentItem])[0];
			if (linkTitle === null || menuLinks[i].textContent.indexOf(linkTitle.getAttribute("value")) == -1) {
				// not this language
				return false;
			}
			++currentItem;
		}
		return true;
	},

	readLanguage : function(doc) {
		var newLang = null;
		var oldLang = FoxtrickPrefs.getString("htLanguage");
		var languages = Foxtrickl10n.htLanguagesXml;

		var menu = doc.getElementById("menu");
		var menuLinks = menu.getElementsByTagName("a");

		if (menuLinks.length < this.menu_strings.length) // pre-login
			return;

		var unchanged = (oldLang !== null) && this.isLang(menuLinks, oldLang);
		if (!unchanged || !oldLang) {
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
				if (Foxtrick.BuildFor == "Gecko") {
					// change language
					Foxtrickl10n.setUserLocaleGecko(newLang);
				}
				var language = Foxtrick.xml_single_evaluate(languages[newLang], "language", "desc");
				var msg = Foxtrickl10n.getString("HTLanguageChanged").replace("%s", language);
				Foxtrick.util.note.add(doc, null, "ft-language-changed", msg, null, true, true);
			}
			else {
				Foxtrick.log("Cannot detect language.");
			}
		}
	},

	// read country and date format
	readOthers : function(doc) {
		var header = doc.getElementById('header');
		var teamLinks = doc.getElementById('teamLinks').getElementsByTagName('a');

		if (!teamLinks[0]) return;

		var CountryLink = teamLinks[2];
		var LeagueId = CountryLink.href.replace(/.+leagueid=/i, "").match(/^\d+/)[0];
		var CountryName = Foxtrick.util.id.getLeagueDataFromId(LeagueId).EnglishName;
		var OldCountryName = FoxtrickPrefs.getString("htCountry");

		if (CountryName != OldCountryName) {
			FoxtrickPrefs.setString("htCountry", CountryName);
			// date format
			var scripts = doc.getElementsByTagName('script');
			for (var i = 0; i < scripts.length; ++i) {
				var script = scripts[i].innerHTML;
				var timeDiffOff = script.indexOf("timeDiff");
				if (timeDiffOff != -1) {
					// function call to timeDiff in the script
					var funcCall = script.substr(timeDiffOff);
					var dateFormat = funcCall.replace(RegExp("^timeDiff('\\d+','\\d+','\\d+','\\d+','\\d+','\\d+','(.+)');"), "$1");
					// make sure the format has characters "d", "m", "y" in it
					if (dateFormat.indexOf("d") != -1
						&& dateFormat.indexOf("m") != -1
						&& dateFormat.indexOf("y") != -1) {
						Foxtrick.util.time.setDateFormat(dateFormat);
						break;
					}
				}
			}
		}
	}
};
Foxtrick.util.module.register(FoxtrickReadHtPrefs);
