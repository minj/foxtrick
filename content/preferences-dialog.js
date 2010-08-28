/**
 * Preference dialog functions.
 * @author Mod-PaV, ryanli
 */
////////////////////////////////////////////////////////////////////////////////


var FoxtrickPreferencesDialog = {

	core_modules : new Array(FoxtrickPrefs, Foxtrickl10n, Foxtrick.XMLData),

	init : function() {
	try {
		for (var i in FoxtrickPreferencesDialog.core_modules) {
			FoxtrickPreferencesDialog.core_modules[i].init();
		}

		FoxtrickPreferencesDialog.initCaptionsAndLabels(document);
		FoxtrickPreferencesDialog.initMainPref(document);
		FoxtrickPreferencesDialog.initAboutPref(document);

		for each (cat in Foxtrick.moduleCategories) {
			FoxtrickPreferencesDialog._fillModulesList(document, cat);
		}
	} catch(e) {Foxtrick.dumpError(e); alert('FoxtrickPreferencesDialog init: '+e+'\n');}
	},

	initCaptionsAndLabels : function(document) {
		// Window title
		document.documentElement.setAttribute("title", Foxtrickl10n.getString("foxtrick.prefs.preferences"));

		// Button labels
		var save = document.documentElement.getButton("accept");
		save.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.buttonSave"));
		var cancel = document.documentElement.getButton("cancel");
		cancel.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.buttonCancel"));

		// Captions and labels
		var allLabels = [ "MainTab", "ShortcutsTab", "PresentationTab", "MatchesTab",
			"ForumTab", "LinksTab", "AboutTab", "AlertTab" ];
		for(var i = 0; i < allLabels.length; ++i) {
			var thisElement = document.getElementById(allLabels[i]);
			thisElement.setAttribute("label", Foxtrickl10n.getString(
				"foxtrick.prefs." + allLabels[i]));
		}
	},

	initMainPref : function(doc) {
		// deafult warning
		if (FoxtrickPrefs.getBool("PrefsSavedOnce")) {
			var defaultWarning = doc.getElementById("defaultWarning");
			defaultWarning.parentNode.removeChild(defaultWarning);
		}
		else {
			var defaultWarningLabel = doc.getElementById("defaultWarningLabel");
			defaultWarningLabel.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.PrefDefaultWarningLabel"));
			var defaultWarningText = doc.getElementById("defaultWarningText");
			defaultWarningText.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.PrefDefaultWarningText")));
		}

		// basic preferences
		var basic = doc.getElementById("basic");
		basic.label = Foxtrickl10n.getString("foxtrick.prefs.basicPreferences");

		// HT language
		var language = doc.getElementById("language");
		language.value = Foxtrickl10n.getString("foxtrick.prefs.captionHTLanguage");
		var languageMenu = document.getElementById("htLanguage");
		var languagePopup = document.getElementById("htLanguagePopup");
		var htLocales = [];
		for (var i in Foxtrick.XMLData.htLanguagesXml) {
			var desc = Foxtrick.XMLData.htLanguagesXml[i].getElementsByTagName("language")[0].getAttribute("desc");
			htLocales.push({ name: i,  desc: desc });
		}
		htLocales.sort(function (a, b) { return a.desc.localeCompare(b.desc); });
		var selectedLang = FoxtrickPrefs.getString("htLanguage");
		var selectedIndex = 0;
		var currentIndex = 0;
		for (var i in htLocales) {
			var locale = htLocales[i];
			var item = document.createElement("menuitem");
			item.id = "htLanguage-" + locale.name;
			item.setAttribute("value", locale.name);
			item.setAttribute("label", locale.desc);
			languagePopup.appendChild(item);
			if (selectedLang == locale.name) {
				selectedIndex = currentIndex;
			}
			++currentIndex;
		}
		languageMenu.selectedIndex = selectedIndex;

		// sync with HT prefs
		var readHtPrefs = doc.getElementById("ReadHtPrefs");
		readHtPrefs.checked = FoxtrickPrefs.getBool("module.ReadHtPrefs.enabled");
		readHtPrefs.label = Foxtrickl10n.getString("foxtrick.ReadHtPrefs.desc");

		// read HT country
		var readHtCountry = doc.getElementById("ReadHtCountry");
		readHtCountry.checked = FoxtrickPrefs.getBool("module.ReadHtPrefsFromHeader.CountryCurrencyDateFormat.enabled");
		readHtCountry.label = Foxtrickl10n.getString("foxtrick.ReadHtCountryCurrencyDateFormat.desc");
		var readHtCountryDescription = doc.getElementById("ReadHtCountryDescription");
		readHtCountryDescription.appendChild(document.createTextNode(
			Foxtrickl10n.getString("foxtrick.CurrentHtCountryCurrencyDateFormat.desc") + " " +
			FoxtrickHelper.countryNameEnglishToLocal(FoxtrickPrefs.getString("htCountry")) + " / " +
			FoxtrickPrefs.getString("oldCurrencySymbol") + " / " +
			FoxtrickPrefs.getString("htDateformat")));
		document.getElementById("countryRow").hidden = readHtCountry.checked;
		document.getElementById("currencyRow").hidden = readHtCountry.checked;
		document.getElementById("dateformatRow").hidden = readHtCountry.checked;
		readHtCountryDescription.hidden = !readHtCountry.checked;

		readHtCountry.addEventListener("click", function(ev) {
				var doc = ev.target.ownerDocument;
				var checked = ev.target.checked;
				doc.getElementById("countryRow").hidden = checked;
				doc.getElementById("currencyRow").hidden = checked;
				doc.getElementById("dateformatRow").hidden = checked;
				doc.getElementById("ReadHtCountryDescription").hidden = !checked;
			},
			false);

		// country
		var country = doc.getElementById("country");
		country.value = Foxtrickl10n.getString("foxtrick.prefs.captionHTCountry");
		document.getElementById("htCountry").selectedIndex =
			FoxtrickPreferencesDialog.fillListFromXml3("htCountryPopup", "htCountry-",
				Foxtrick.XMLData.League, "EnglishName", FoxtrickPrefs.getString("htCountry"));

		// currency
		var currency = doc.getElementById("currency");
		currency.value = Foxtrickl10n.getString("foxtrick.prefs.captionHTCurrency");
		var htCurrencyXml = document.implementation.createDocument("", "", null);
		htCurrencyXml.async = false;
		htCurrencyXml.load("chrome://foxtrick/content/htlocales/htcurrency.xml", "text/xml");
		document.getElementById("htCurrency").selectedIndex =
			FoxtrickPreferencesDialog.fillListFromXml("htCurrencyPopup", "htCurrency-",
				htCurrencyXml, "currency", "name", "code", FoxtrickPrefs.getString("htCurrency"));

		// date format
		var dateformat = doc.getElementById("dateformat");
		dateformat.value = Foxtrickl10n.getString("foxtrick.prefs.captionHTDateformat");
		var htDateFormatXml = document.implementation.createDocument("", "", null);
		htDateFormatXml.async = false;
		htDateFormatXml.load("chrome://foxtrick/content/htlocales/htdateformat.xml", "text/xml");
		document.getElementById("htDateformat").selectedIndex =
			FoxtrickPreferencesDialog.fillListFromXml("htDateformatPopup", "htDateformat-",
				htDateFormatXml, "dateformat", "name", "code", FoxtrickPrefs.getString("htDateformat"));

		// currency converter
		var currencyTo = doc.getElementById("currencyTo");
		currencyTo.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.captionCurrencyConverter"));
		var CurrencyConverter = doc.getElementById("CurrencyConverter");
		CurrencyConverter.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.activeCurrencyConverter"));
		CurrencyConverter.setAttribute("checked", FoxtrickPrefs.getBool("module.CurrencyConverter.enabled"));
		var htCurrencyXml = document.implementation.createDocument("", "", null);
		htCurrencyXml.async = false;
		htCurrencyXml.load("chrome://foxtrick/content/htlocales/htcurrency.xml", "text/xml");
		document.getElementById("htCurrencyTo").selectedIndex =
			FoxtrickPreferencesDialog.fillListFromXml("htCurrencyToPopup", "htCurrency-",
				htCurrencyXml, "currency", "name", "code", FoxtrickPrefs.getString("htCurrencyTo"));

		// load/save prefs
		var loadSavePrefs = doc.getElementById("loadSavePrefs");
		loadSavePrefs.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.captionLoadSavePrefs"));
		// save
		var buttonSavePrefs = doc.getElementById("buttonSavePrefs");
		buttonSavePrefs.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.buttonSavePrefs"));
		var labelSavePrefs = doc.getElementById("labelSavePrefs");
		labelSavePrefs.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.labelSavePrefs")));
		var saveprefsid = doc.getElementById("saveprefsid");
		saveprefsid.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.labelSavePrefs_Prefs"));
		saveprefsid.setAttribute("checked", FoxtrickPrefs.getBool("SavePrefs_Prefs"));
		var savenotesid = doc.getElementById("savenotesid");
		savenotesid.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.labelSavePrefs_Notes"));
		savenotesid.setAttribute("checked", FoxtrickPrefs.getBool("SavePrefs_Notes"));
		// load
		var buttonLoadPrefs = doc.getElementById("buttonLoadPrefs");
		buttonLoadPrefs.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.buttonLoadPrefs"));
		var labelLoadPrefs = doc.getElementById("labelLoadPrefs");
		labelLoadPrefs.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.labelLoadPrefs")));

		// stored prefs
		var cleanupBranch = doc.getElementById("cleanupBranch");
		cleanupBranch.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.captionCleanupBranch"));
		// restore defaults
		var buttonCleanupBranch = doc.getElementById("buttonCleanupBranch");
		buttonCleanupBranch.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.buttonCleanupBranch"));
		var labelCleanupBranch = doc.getElementById("labelCleanupBranch");
		labelCleanupBranch.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.labelCleanupBranch")));
		// disable all modules
		var buttonDisableAll = doc.getElementById("buttonDisableAll");
		buttonDisableAll.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.buttonDisableAll"));
		var labelDisableAll = doc.getElementById("labelDisableAll");
		labelDisableAll.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.labelDisableAll")));

		// disable settings
		var disableSettings = doc.getElementById("disableSettings");
		disableSettings.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.captionDisableSettings"));
		// stage
		var stagepref = doc.getElementById("stagepref");
		stagepref.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.stagepref"));
		stagepref.setAttribute("checked", FoxtrickPrefs.getBool("disableOnStage"));
		// temporarily
		var disableTemporary = doc.getElementById("disableTemporary");
		disableTemporary.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.disableTemporaryLabel"));
		disableTemporary.setAttribute("checked", FoxtrickPrefs.getBool("disableTemporary"));

		// show on statusbar
		var showOnStatusBar = doc.getElementById("showOnStatusBar");
		showOnStatusBar.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.captionShowOnStatusBar"));
		// enable
		var statusbarpref = doc.getElementById("statusbarpref");
		statusbarpref.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.statusbarpref"));
		statusbarpref.setAttribute("checked", FoxtrickPrefs.getBool("statusbarshow"));

		// additional options
		var additionalOptions = doc.getElementById("additionalOptions");
		additionalOptions.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.AdditionalOptions"));
		// header icons
		var smallcopyicons = doc.getElementById("smallcopyicons");
		smallcopyicons.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.smallcopyicons"));
		smallcopyicons.setAttribute("checked", FoxtrickPrefs.getBool("smallcopyicons"));
		// OnPagePrefs
		var OnPagePrefs = doc.getElementById("OnPagePrefs");
		OnPagePrefs.setAttribute("label", Foxtrickl10n.getString("foxtrick.OnPagePrefs.desc"));
		OnPagePrefs.setAttribute("checked", FoxtrickPrefs.getBool("module.OnPagePrefs.enabled"));
		// debug output
		var DisplayHTMLDebugOutput = doc.getElementById("DisplayHTMLDebugOutput");
		DisplayHTMLDebugOutput.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.DisplayHTMLDebugOutput"));
		DisplayHTMLDebugOutput.setAttribute("checked", FoxtrickPrefs.getBool("DisplayHTMLDebugOutput"));
	},

	initAboutPref : function(doc) {
		var xmlresponse = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/foxtrick_about.xml");

		// links
		var links_caption = doc.getElementById("extlinks_caption");
		var links_list = doc.getElementById("extlinks_list");
		var links = Foxtrick.XML_evaluate(xmlresponse, "about/links/link", "title", "value");
		links_caption.setAttribute("label",
			Foxtrickl10n.getString('foxtrick.prefs.' + Foxtrick.XML_evaluate(xmlresponse, "about/links", "value")[0]));
		for (var i = 0; i < links.length; ++i) {
			var item = doc.createElement("label");
			var link = doc.createElement("label");
			links_list.appendChild(item);
			item.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs." + links[i][0]) + ":"));
			item.appendChild(link);
			link.setAttribute("value", links[i][1]);
			link.setAttribute("href", links[i][1]);
			link.className = "text-link";
		}

		var style_tutorial_caption = doc.getElementById("style_tutorial_caption");
		var style_tutorial_content = doc.getElementById("style_tutorial_content");
		style_tutorial_caption.setAttribute("label", Foxtrickl10n.getString("StyleTutorial.title"));
		var item = doc.createElement("label");
		style_tutorial_content.appendChild(item);
		item.appendChild(doc.createTextNode(Foxtrickl10n.getString("StyleTutorial.content").split(/%s/)[0]));
		var link = doc.createElement("label");
		style_tutorial_content.appendChild(item);
		item.appendChild(link);
		link.setAttribute("value",  Foxtrick.ResourcePath + "resources/css/user-content-example.css");
		link.setAttribute("href",  Foxtrick.ResourcePath + "resources/css/user-content-example.css");
		link.addEventListener('click', this.popup_example_css, false);
		link.className = "text-link";
		style_tutorial_content.appendChild(item);
		item.appendChild(doc.createTextNode(Foxtrickl10n.getString("StyleTutorial.content").split(/%s/)[1]));

		// head_developer
		var headdeveloper_caption = doc.getElementById("headdeveloper_caption");
		var headdeveloper_list = doc.getElementById("headdeveloper_list");
		var headdeveloper = Foxtrick.XML_evaluate(xmlresponse, "about/head_developers/head_developer", "value");
		headdeveloper_caption.setAttribute("label", Foxtrick.XML_evaluate(xmlresponse, "about/head_developers", "value")[0]);
		for (var i = 0; i < headdeveloper.length; ++i) {
			var label = doc.createElement("label");
			headdeveloper_list.appendChild(label);
			label.setAttribute("value", headdeveloper[i]);
		}

		// project_owners
		var projectowners_caption = doc.getElementById("projectowners_caption");
		var projectowners_list = doc.getElementById("projectowners_list");
		var projectowners = Foxtrick.XML_evaluate(xmlresponse, "about/project_owners/project_owner", "value");
		projectowners_caption.setAttribute("label", Foxtrick.XML_evaluate(xmlresponse, "about/project_owners", "value")[0]);
		for (var i = 0; i < projectowners.length; ++i) {
			var label = doc.createElement("label");
			projectowners_list.appendChild(label);
			label.setAttribute("value", projectowners[i]);
		}

		// developers
		var developers_caption = doc.getElementById("developers_caption");
		var developers_list = doc.getElementById("developers_list");
		var developers = Foxtrick.XML_evaluate(xmlresponse, "about/developers/developer", "value");
		developers_caption.setAttribute("label", Foxtrick.XML_evaluate(xmlresponse, "about/developers", "value")[0]);
		for (var i = 0; i < developers.length; ++i) {
			var label = doc.createElement("label");
			developers_list.appendChild(label);
			label.setAttribute("value", developers[i]);
		}

		// graphic designers
		var translations_caption = doc.getElementById("graphic-designers_caption");
		var translations_list = doc.getElementById("graphic-designers_list");
		var translations = Foxtrick.XML_evaluate(xmlresponse, "about/graphics/designer", "value");
		translations_caption.setAttribute("label", Foxtrick.XML_evaluate(xmlresponse, "about/graphics", "value")[0]);
		for (var i = 0; i < translations.length; ++i) {
			var label = doc.createElement("label");
			translations_list.appendChild(label);
			label.setAttribute("value", translations[i]);
		}

		// translations
		var translations_caption = doc.getElementById("translations_caption");
		var translations_list = doc.getElementById("translations_list");
		var translations = Foxtrick.XML_evaluate(xmlresponse, "about/translations/translation", "value");
		translations_caption.setAttribute("label", Foxtrick.XML_evaluate(xmlresponse, "about/translations", "value")[0]);
		for (var i = 0; i < translations.length; ++i) {
			var label = doc.createElement("label");
			translations_list.appendChild(label);
			label.setAttribute("value", translations[i]);
		}
	},

	popup_example_css: function (ev) {
		var style_example_uri = Foxtrick.ResourcePath + "resources/css/user-content-example.css"
		window.open(style_example_uri,'user-content-example.css');
	},

	onDialogAccept : function() {
	try {
		var modules_list;

		// clean up
		/*var array = FoxtrickPrefs._getElemNames("");
		if (array)
			for(var i = 0; i < array.length; ++i) {
				if (FoxtrickPrefs.isPrefSetting(array[i]))
					FoxtrickPrefs.deleteValue(array[i]);
			}

		// set version
		var curVersion = FoxtrickPrefs.getString("curVersion");
		var oldVersion = FoxtrickPrefs.getString("oldVersion");
		FoxtrickPrefs.setString("oldVersion", curVersion);
		*/

		// reset main to default. set right bellow if needed
		for (var i in Foxtrick.modules) {
			var module = Foxtrick.modules[i];
			if (!module.MODULE_CATEGORY || module.MODULE_CATEGORY == Foxtrick.moduleCategories.MAIN) {
				FoxtrickPrefs.setModuleEnableState(module.MODULE_NAME, module.DEFAULT_ENABLED);
				continue;
			}
		}

		for each (cat in Foxtrick.moduleCategories) {
			switch (cat) {
				case Foxtrick.moduleCategories.MAIN:
					continue;
					break;
				case Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS:
					modules_list = document.getElementById('shortcuts_list');
					break;
				case Foxtrick.moduleCategories.PRESENTATION:
					modules_list = document.getElementById('presentation_list');
					break;
				case Foxtrick.moduleCategories.MATCHES:
					modules_list = document.getElementById('matchfunctions_list');
					break;
				case Foxtrick.moduleCategories.FORUM:
					modules_list = document.getElementById('forum_list');
					break;
				case Foxtrick.moduleCategories.LINKS:
					modules_list = document.getElementById('links_list');
					break;
				case Foxtrick.moduleCategories.ALERT:
					modules_list = document.getElementById('alert_list');
					break;
				default:
					continue;
					break;
			}

			for (var i = 0; i < modules_list.childNodes.length; ++i) {
				var group = modules_list.childNodes[i];
				var pref = group.id;
				var enabled = document.getElementById(pref + "_check").checked;
				var container = document.getElementById(pref + "_container");
				FoxtrickPrefs.setModuleEnableState(pref, enabled);

				// not normal
				if (container) {
					// checkbox
					var checkboxes = document.getElementById(pref + "_checkboxes");
					if (checkboxes) {
						var checkboxList = checkboxes.getElementsByTagName("checkbox");
						for (var j in checkboxList) {
							FoxtrickPrefs.setModuleEnableState(checkboxList[j].id, checkboxList[j].checked);
						}
						var textboxList = checkboxes.getElementsByTagName("textbox");
						for (var j in textboxList) {
							FoxtrickPrefs.setModuleOptionsText(textboxList[j].id, textboxList[j].value);
						}
					}

					// radio
					var radiogroup = document.getElementById(pref + "_radiogroup");
					if (radiogroup) {
						for (var j in radiogroup.childNodes) {
							if (radiogroup.childNodes[j].selected) {
								FoxtrickPrefs.setModuleValue(pref, j);
								break;
							}
						}
					}
				}
			}
		}
		// disable warning
		FoxtrickPrefs.setBool("PrefsSavedOnce", true);

		//Lang
		FoxtrickPrefs.setString("htLanguage", document.getElementById("htLanguage").value);
		FoxtrickPrefs.setBool("module.ReadHtPrefs.enabled", document.getElementById("ReadHtPrefs").checked);

		// country, currency
		var readHtCountry = document.getElementById("ReadHtCountry").checked;
		FoxtrickPrefs.setBool("module.ReadHtPrefsFromHeader.CountryCurrencyDateFormat.enabled", readHtCountry);
		if (!readHtCountry) {
			FoxtrickPrefs.setString("htCountry", document.getElementById("htCountry").value);
			FoxtrickPrefs.setString("htCurrency", document.getElementById("htCurrency").value);
			FoxtrickPrefs.setString("htDateformat", document.getElementById("htDateformat").value);
		}

		FoxtrickPrefs.setInt("htSeasonOffset", Math.floor(FoxtrickPreferencesDialog.getOffsetValue(document.getElementById("htCountry").value)));

		//Currency Converter

		FoxtrickPrefs.setString("htCurrencyTo", document.getElementById("htCurrencyTo").value);
		FoxtrickPrefs.setString("currencySymbol", FoxtrickPreferencesDialog.getConverterCurrValue(document.getElementById("htCurrencyTo").value, "new", Foxtrick.XMLData.htCurrencyXml));
		FoxtrickPrefs.setString("currencyRateTo", FoxtrickPreferencesDialog.getConverterCurrValue(document.getElementById("htCurrencyTo").value, "rate", Foxtrick.XMLData.htCurrencyXml));

		FoxtrickPrefs.setString("oldCurrencySymbol", FoxtrickPreferencesDialog.getConverterCurrValue(document.getElementById("htCurrency").value, "old", Foxtrick.XMLData.htCurrencyXml));
		FoxtrickPrefs.setString("currencyRate", FoxtrickPreferencesDialog.getConverterCurrValue(document.getElementById("htCurrency").value, "rate", Foxtrick.XMLData.htCurrencyXml));
		FoxtrickPrefs.setString("currencyCode", FoxtrickPreferencesDialog.getConverterCurrValue(document.getElementById("htCurrency").value, "code", Foxtrick.XMLData.htCurrencyXml));

		FoxtrickPrefs.setBool("module.CurrencyConverter.enabled", document.getElementById("CurrencyConverter").checked);

		//Statusbar
		FoxtrickPrefs.setBool("statusbarshow", document.getElementById("statusbarpref").checked);

		//disable
		FoxtrickPrefs.setBool("disableOnStage", document.getElementById("stagepref").checked);
		FoxtrickPrefs.setBool("disableTemporary", document.getElementById("disableTemporary").checked);

		// additional options
		FoxtrickPrefs.setBool("smallcopyicons", document.getElementById("smallcopyicons").checked);
		FoxtrickPrefs.setBool("module.OnPagePrefs.enabled", document.getElementById("OnPagePrefs").checked);


		FoxtrickPrefs.setBool("SavePrefs_Prefs", document.getElementById("saveprefsid").checked);
		FoxtrickPrefs.setBool("SavePrefs_Notes", document.getElementById("savenotesid").checked);

		FoxtrickPrefs.setBool("DisplayHTMLDebugOutput", document.getElementById("DisplayHTMLDebugOutput").checked);

		// reinitialize
		FoxtrickMain.init();

		return true;

		}
		catch(e) {
			Foxtrick.alert(e + " on line " + e.lineNumber + " of file " + e.fileName);
		}
	},

	getOffsetValue: function (itemToSearch) {
		try {
			var returnedOffset = 0;
			for (var i in Foxtrick.XMLData.League) {
				if (itemToSearch == FoxtrickHelper.getLeagueDataFromId(i).EnglishName) {
					returnedOffset = FoxtrickHelper.getLeagueDataFromId(1).Season - FoxtrickHelper.getLeagueDataFromId(i).Season; // sweden season - selected
					break;
				}
			}
			return returnedOffset;
		}
		catch (e) {
			Foxtrick.dump('Offset search for '+ itemToSearch + ' ' + e + '\n');
			return 0;
		}
	},

	getConverterCurrValue: function (itemToSearch, options, xmlDoc) {
		try {
			var returnedItemToSearch = "none";

			var values = xmlDoc.getElementsByTagName("currency");

			var langs = [];

			for (var i=0; i<values.length; ++i) {
				var eurorate = values[i].attributes.getNamedItem("eurorate").textContent;
				var code = values[i].attributes.getNamedItem("code").textContent;
				var sname = values[i].attributes.getNamedItem("shortname").textContent;
				langs.push([eurorate,code,sname]);
			}

			function sortfunction(a, b) {
				return a[0].localeCompare(b[0]);
			}

			langs.sort(sortfunction);

			for (var i = 0; i < langs.length; ++i) {
				var eurorate = langs[i][0];
				var code = langs[i][1];
				var sname = langs[i][2];

				if (options == "old" && itemToSearch == code)
					returnedItemToSearch = sname;
				if (options == "new" && itemToSearch == code)
					returnedItemToSearch = sname;
				if (options == "rate" && itemToSearch == code)
					returnedItemToSearch = eurorate;
				if (options == "code" && itemToSearch == code)
					returnedItemToSearch = code;
			}
			return returnedItemToSearch;
		}
		catch (e) {
			Foxtrick.dump('CurrencyConverter-CurrValue(): ' + e + '\n');
		}
	},

	fillListFromXml: function(id, prefix, xmlDoc, elem, descAttr, valAttr, itemToSelect) {
		var indexToSelect = -1;
		var values = xmlDoc.getElementsByTagName(elem);
		var menupopup = document.getElementById(id);
		var langs = [];

		for (var i = 0; i < values.length; ++i) {
			var label = values[i].attributes.getNamedItem(descAttr).textContent;
			var value = values[i].attributes.getNamedItem(valAttr).textContent;
			langs.push([label, value]);
		}

		function sortfunction(a, b) {
			return a[0].localeCompare(b[0]);
		}

		langs.sort(sortfunction);

		for (var i = 0; i < langs.length; ++i) {

			var label = langs[i][0];
			var value = langs[i][1];

			var obj = document.createElement("menuitem");
			obj.setAttribute("id", prefix+value);
			obj.setAttribute("label", label);
			obj.setAttribute("value", value);

			menupopup.appendChild(obj);

			if (itemToSelect == value)
				indexToSelect = i;
		}

		return indexToSelect;
	},

	fillListFromXml3 : function(id, prefix, xmlarray, valuestr, itemToSelect) {
		try {
			var menupopup = document.getElementById(id);

			var langs = [];
			var indexToSelect=0;

			for (var i in xmlarray) {
				var label = xmlarray[i][valuestr];
				var value = xmlarray[i][valuestr];
				langs.push([label, value]);
			}

			function sortfunction(a, b) {
				return a[0].localeCompare(b[0]);
			}

			langs.sort(sortfunction);

			for (var i = 0; i < langs.length; ++i) {

				var label = langs[i][0];
				var value = langs[i][1];

				var obj = document.createElement("menuitem");
				obj.setAttribute("id", prefix+value);
				obj.setAttribute("label", label);
				obj.setAttribute("value", value);

				menupopup.appendChild(obj);

				if (itemToSelect == value)
					indexToSelect = i;
			}

			return indexToSelect;
		}
		catch(e) {
			Foxtrick.dump(e);
		}
	},

	_fillModulesList : function(doc, category) {
		var modules_list;
		switch(category) {
			case Foxtrick.moduleCategories.MAIN:
				return;
				break;
			case Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS:
				modules_list = document.getElementById('shortcuts_list');
				break;
			case Foxtrick.moduleCategories.PRESENTATION:
				modules_list = document.getElementById('presentation_list');
				break;
			case Foxtrick.moduleCategories.MATCHES:
				modules_list = document.getElementById('matchfunctions_list');
				break;
			case Foxtrick.moduleCategories.FORUM:
				modules_list = document.getElementById('forum_list');
				break;
			case Foxtrick.moduleCategories.LINKS:
				modules_list = document.getElementById('links_list');
				break;
			case Foxtrick.moduleCategories.ALERT:
				modules_list = document.getElementById('alert_list');
				break;
			default:
				return;
				break;
		}

		var modules_entries = new Array();
		for (var i in Foxtrick.modules) {
			var module = Foxtrick.modules[i];
			var module_category;
			module_category = module.MODULE_CATEGORY;
			if (!module_category) {
				// MODULE_CATEGORY isn't set; use default
				module_category = "shortcutsandtweaks";
			}
			if (module_category == category) {
				var entry;
				entry = FoxtrickPreferencesDialog._createModule(module);
				modules_entries.push(entry);
			}
		}

		modules_entries.sort(FoxtrickPreferencesDialog.entry_sortfunction);
		for (var i = 0;i < modules_entries.length; ++i)
			modules_list.appendChild(modules_entries[i]);
	},

	entry_sortfunction: function(a,b) {
		return a.id > b.id;
	},

	_getWrapableBox : function(desc_text) {
		var desc = document.createElement("description");
		var text = document.createTextNode(desc_text);
		desc.appendChild(text);
		return desc;
	},

	_updateModule : function(module) {
		try {
			var enabled = document.getElementById(module.id + "_check").checked;
			var container = document.getElementById(module.id + "_container");
			if (enabled)
				container.setAttribute("hidden", false);
			else
				container.setAttribute("hidden", true);
		}
		catch (e) {
			Foxtrick.alert(e + " on line " + e.lineNumber + " of file " + e.fileName);
		}
	},

	_createModule : function(module) {
		var entry = document.createElement("groupbox");
		var caption = document.createElement("caption");
		var check = document.createElement("checkbox");
		var desc = FoxtrickPreferencesDialog._getWrapableBox(FoxtrickPrefs.getModuleDescription(module.MODULE_NAME));
		var container = document.createElement("vbox");

		var enabled = Foxtrick.isModuleEnabled(module);

		entry.appendChild(caption);
		entry.appendChild(desc);
		entry.appendChild(container);
		caption.appendChild(check);

		entry.id = module.MODULE_NAME;
		caption.id = entry.id + "_caption";
		check.id = entry.id + "_check";
		desc.id = entry.id + "_desc";
		container.id = entry.id + "_container";

		if (!enabled) {
			container.setAttribute("hidden", true);
		}

		check.setAttribute("checked", enabled);
		check.setAttribute("label", module.MODULE_NAME);
		check.addEventListener("command", function(ev) {
			FoxtrickPreferencesDialog._updateModule(ev.target.parentNode.parentNode);
		}, false);

		// checkbox
		if (module.OPTIONS) {
			var checkboxes = document.createElement("vbox");
			container.appendChild(checkboxes);
			checkboxes.id = module.MODULE_NAME + "_checkboxes";

			for (var i in module.OPTIONS) {
				var checkbox = document.createElement("checkbox");
				checkboxes.appendChild(checkbox);

				var key, title;
				if (module.OPTIONS[i]["key"]) {
					key = module.OPTIONS[i]["key"];
					title = module.OPTIONS[i]["title"];
				} else {
					key = module.OPTIONS[i];
					title = FoxtrickPrefs.getModuleElementDescription(module.MODULE_NAME, module.OPTIONS[i]);
				}
				checkbox.id = module.MODULE_NAME + "." + key;
				checkbox.setAttribute("checked", Foxtrick.isModuleFeatureEnabled(module, key));
				checkbox.setAttribute("label", title);

				if (module.OPTION_TEXTS &&
					(!module.OPTION_TEXTS_DISABLED_LIST || !module.OPTION_TEXTS_DISABLED_LIST[i])) {
					var hbox = document.createElement("hbox");
					var textbox = document.createElement("textbox");
					checkboxes.appendChild(hbox);
					hbox.appendChild(textbox);
					hbox.id = checkbox.id + "_textRow";
					textbox.id = checkbox.id + "_text";
					textbox.setAttribute("flex", 1);

					if (!Foxtrick.isModuleFeatureEnabled(module, key)) {
						hbox.setAttribute("hidden", true);
					}

					checkbox.addEventListener("command", function(ev) {
						var optiondiv = document.getElementById(ev.target.id + "_textRow");
						if (ev.target.checked) {
							optiondiv.setAttribute("hidden", false);
						} else {
							optiondiv.setAttribute("hidden", true);
						}
					}, false);

					var val = FoxtrickPrefs.getString("module." + textbox.id);
					if (val === null && module.OPTION_TEXTS_DEFAULT_VALUES && module.OPTION_TEXTS_DEFAULT_VALUES[i]) {
						val = module.OPTION_TEXTS_DEFAULT_VALUES[i];
					}
					textbox.setAttribute("value", val);

					// load buttons
					if (module.OPTION_TEXTS_LOAD_BUTTONS && module.OPTION_TEXTS_LOAD_BUTTONS[i]) {
						var load = document.createElement("button");
						hbox.appendChild(load);
						load.id = textbox.id + "_load";
						load.setAttribute("label", Foxtrickl10n.getString("foxtrick.prefs.buttonLoadPrefs"));
						load.addEventListener("command", function(ev) {
							var textbox = document.getElementById(ev.target.id.replace(/_load$/, ""));
							var file = Foxtrick.selectFile(window);
							if (file) {
								textbox.value = "file://" + file;
							}
						}, false);
					}
				}
			}
		}

		// radio
		if (module.RADIO_OPTIONS) {
			var radiogroup = document.createElement("radiogroup");
			container.appendChild(radiogroup);
			radiogroup.id = module.MODULE_NAME + "_radiogroup";

			var selectedValue = Foxtrick.getModuleValue(module);
			for (var i in module.RADIO_OPTIONS) {
				var radio = document.createElement("radio");
				radiogroup.appendChild(radio);
				if (selectedValue == i) {
					radio.setAttribute("selected", true);
				}
				radio.setAttribute("label",
					FoxtrickPrefs.getModuleDescription(module.MODULE_NAME + "." + module.RADIO_OPTIONS[i]));
			}
		}

		return entry;
	}
};

FoxtrickPreferencesDialog.show = function(button) {
	if (!button) {
		window.openDialog("chrome://foxtrick/content/preferences-dialog.xul",
			"foxtrick-preferences", "resizable=yes,centerscreen=yes,chrome=yes,modal=yes,dialog=no");
		FoxtrickMain.init();
	}
}

FoxtrickPreferencesDialog.deactivate = function(button) {
	try {
		if (!button) {
			var statusBarImg = document.getElementById("foxtrick-status-bar-img");
			FoxtrickPrefs.setBool("disableTemporary", !FoxtrickPrefs.getBool("disableTemporary"));

			Foxtrick.updateStatus();

			FoxtrickMain.init();
		}
	}
	catch (e) {
		alert("FoxtrickPreferencesDialog.deactivate: " + e);
	}
}
