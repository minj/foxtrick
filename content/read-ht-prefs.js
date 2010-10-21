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
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Detect language on all pages. Merged all preference detection options.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

	menu_strings: new Array('MyHattrick','MyClub','World','Forum','Shop','Help'),

	run : function(page, doc) {
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
		if (!unchanged) {
			// language has changed, look for the new one
			var found = false;
			for (var k in languages) {
				if (this.isLang(menuLinks, k)) {
					newLang = k;
					found = true;
					Foxtrick.dump("Language changed: " + newLang + ", old language: " + oldLang + ".\n");
					break;
				}
			}
			if (found) {
				FoxtrickPrefs.setString("htLanguage", newLang);
				if (Foxtrick.BuildFor == "Chrome") {
					// change language
					FoxtrickPrefs.portsetlang.postMessage({pref: "extensions.foxtrick.prefs.htLanguage", value:newLang, from:'readpref'});
				}
				else if (Foxtrick.BuildFor == "Gecko") {
					// change language
					Foxtrickl10n.get_strings_bundle(newLang);
					var language = Foxtrick.xml_single_evaluate(languages[newLang], "language", "desc");
					var msg = Foxtrickl10n.getString("HTLanguageChanged").replace("%s", language);
					Foxtrick.Note.add(doc, null, "ft-language-changed", msg, null, true, true);
				}
			}
			else {
				Foxtrick.dump("Cannot detect language.\n");
			}
		}
	},

	readOthers : function(doc) {
		var header = doc.getElementById('header');
		var teamLinks = doc.getElementById('teamLinks').getElementsByTagName('a');

		if (!teamLinks[0]) return;

		var CountryLink = teamLinks[2];
		var LeagueId = CountryLink.href.replace(/.+leagueid=/i, "").match(/^\d+/)[0];
		var CountryName = FoxtrickHelper.getLeagueDataFromId(LeagueId).EnglishName;
		var OldCountryName = FoxtrickPrefs.getString("htCountry");

		if (CountryName != OldCountryName) {
			var CurrencyName = FoxtrickHelper.getLeagueDataFromId(LeagueId).Country.CurrencyName;
			var CurrencyRate = FoxtrickHelper.getCurrencyRateFromId(LeagueId);
			if (CurrencyName.search(/000\ /,'')!=-1) {
				CurrencyName=CurrencyName.replace(/000\ /gi,'');
				CurrencyRate=CurrencyRate/1000;
			}
			var CurrencyCode = Foxtrick.util.currency.getCodeByShortName(CurrencyName);

			var scripts = doc.getElementsByTagName('script');
			for (var i = 0; i < scripts.length; ++i) {
				var timeDiffpos = scripts[i].innerHTML.search('timeDiff');
				if (timeDiffpos != -1) {
					var timeDiffParams = scripts[i].innerHTML.substr(timeDiffpos+8);

					var dateformat='ddmmyyyy';
					if (timeDiffParams.search('y') < timeDiffParams.search('d')) {
						dateformat='yyyymmdd';
					}
					else if (timeDiffParams.search('m') < timeDiffParams.search('d')) {
						dateformat='mmddyyyy';
					}
					FoxtrickPrefs.setString("htDateformat", dateformat);
					break;
				}
			}

			FoxtrickPrefs.setString("htCountry", CountryName);
			FoxtrickPrefs.setString("htCurrency", CurrencyCode);
			FoxtrickPrefs.setString("oldCurrencySymbol", CurrencyName);
			FoxtrickPrefs.setString("currencyRate", CurrencyRate);
			FoxtrickPrefs.setInt("htSeasonOffset", Math.floor(FoxtrickPrefsDialogHTML.getOffsetValue(CountryName)));
		}
	}
};
