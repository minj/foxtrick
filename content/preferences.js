function init()
{
	initCoreModules();
	initListeners();
	initTabs();
	initTextAndValues();
	$("#cancel").hover(function() { $(this).hide("slow"); });
}

function initCoreModules()
{
	const core = [FoxtrickPrefs, Foxtrickl10n, Foxtrick.XMLData];
	for (var i in core)
		core[i].init();
}

function initListeners()
{
	$("#save").click(function() { save(); });
	$("#note").click(function() { $(this).hide("slow"); });
}

function initTabs()
{
	$("#tabs li a").each(function() {
		$(this).attr("href", "#" + $(this).parent().attr("id").replace(/^tab-/, "pane-"));
	});
	$("#tabs li a").click(function() {
		$("#panes > div[id^='pane-']").hide();
		$("#tabs > li").removeClass("active");
		$("#" + $(this).parent().attr("id").replace(/^tab-/, "pane-")).show();
		$(this).parent().addClass("active");
	});
	$("#tab-main a").click();
	initMainTab();
	initModuleTabs();
	initHelpTab();
	initAboutTab();
}

function initTextAndValues()
{
	document.title = Foxtrickl10n.getString("foxtrick.prefs.preferences");
	// initialize text
	$("body [text-key]").each(function() {
		if ($(this).attr("text-key"))
			$(this).text(Foxtrickl10n.getString($(this).attr("text-key")));
	});
	// initialize checkboxes
	$("body input:checkbox[pref]").each(function() {
		if ($(this).attr("pref"))
			if (FoxtrickPrefs.getBool($(this).attr("pref")))
				$(this).attr("checked", "checked");
	});
	// initialize elements with blockers
	$("body [blocked-by]").each(function() {
		var blockee = $(this);
		var blocker = $("#" + blockee.attr("blocked-by"));
		blocker.click(function() {
			if (blocker.is(":checked"))
				blockee.attr("disabled", "disabled");
			else
				blockee.removeAttr("disabled");
		});
		if (blocker.is(":checked"))
			blockee.attr("disabled", "disabled");
	});
}

function initMainTab()
{
	var htLocales = [];
	for (var i in Foxtrickl10n.htLanguagesXml) {
		var desc = Foxtrickl10n.htLanguagesXml[i].getElementsByTagName("language")[0].getAttribute("desc");
		htLocales.push({ name: i,  desc: desc });
	}
	htLocales.sort(function(a, b) { return a.desc.localeCompare(b.desc); });
	const selectedLang = FoxtrickPrefs.getString("htLanguage");
	for (var i in htLocales) {
		var locale = htLocales[i];
		var item = document.createElement("option");
		item.value = locale.name;
		item.textContent = locale.desc;
		if (selectedLang == item.value)
			item.selected = "selected";
		$("#pref-read-language").append($(item));
	}

	var leagues = [];
	for (var i in Foxtrick.XMLData.League) {
		var league = Foxtrick.XMLData.League[i]["EnglishName"];
		leagues.push(league);
	}
	leagues.sort(function(a, b) { return a.localeCompare(b); });
	const selectedLeague = FoxtrickPrefs.getString("htCountry");
	for (var i in leagues) {
		var item = document.createElement("option");
		item.value = leagues[i];
		item.textContent = leagues[i];
		if (selectedLeague == item.value)
			item.selected = "selected";
		$("#pref-read-country").append($(item));
	}

	var currencies = [];
	var htCurrencyXml = document.implementation.createDocument("", "", null);
	htCurrencyXml.async = false;
	htCurrencyXml.load("chrome://foxtrick/content/htlocales/htcurrency.xml", "text/xml");
	var currencyNodes = htCurrencyXml.getElementsByTagName("currency");
	for (var i = 0; i < currencyNodes.length; ++i) {
		var code = currencyNodes[i].attributes.getNamedItem("code").textContent;
		var desc = currencyNodes[i].attributes.getNamedItem("name").textContent;
		currencies.push({ code: code, desc : desc });
	}
	currencies.sort(function(a, b) { return a.desc.localeCompare(b.desc); });
	const selectedCurrency = FoxtrickPrefs.getString("htCurrency");
	for (var i in currencies) {
		var item = document.createElement("option");
		item.value = currencies[i].code;
		item.textContent = currencies[i].desc;
		if (selectedCurrency == item.value)
			item.selected = "selected";
		$("#pref-read-currency").append($(item));
	}

	var dateFormats = [];
	var htDateFormatXml = document.implementation.createDocument("", "", null);
	htDateFormatXml.async = false;
	htDateFormatXml.load("chrome://foxtrick/content/htlocales/htdateformat.xml", "text/xml");
	var dateFormatNodes = htDateFormatXml.getElementsByTagName("dateformat");
	for (var i = 0; i < dateFormatNodes.length; ++i) {
		var code = dateFormatNodes[i].attributes.getNamedItem("code").textContent;
		var desc = dateFormatNodes[i].attributes.getNamedItem("name").textContent;
		dateFormats.push({ code: code, desc : desc });
	}
	dateFormats.sort(function(a, b) { return a.desc.localeCompare(b.desc); });
	const selectedDateFormat = FoxtrickPrefs.getString("htDateformat");
	for (var i in dateFormats) {
		var item = document.createElement("option");
		item.value = dateFormats[i].code;
		item.textContent = dateFormats[i].desc;
		if (selectedDateFormat == item.value)
			item.selected = "selected";
		$("#pref-read-date-format").append($(item));
	}
}

function initModuleTabs()
{
	var categories = {
		"shortcuts" : [],
		"presentation" : [],
		"matches" : [],
		"forum" : [],
		"links" : [],
		"alert" : []
	}
	for (var i in Foxtrick.modules) {
		const category = Foxtrick.modules[i].MODULE_CATEGORY;
		if (category == Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS)
			categories["shortcuts"].push(i);
		else if (category == Foxtrick.moduleCategories.PRESENTATION)
			categories["presentation"].push(i);
		else if (category == Foxtrick.moduleCategories.MATCHES)
			categories["matches"].push(i);
		else if (category == Foxtrick.moduleCategories.FORUM)
			categories["forum"].push(i);
		else if (category == Foxtrick.moduleCategories.LINKS)
			categories["links"].push(i);
		else if (category == Foxtrick.moduleCategories.ALERT)
			categories["alert"].push(i);
	}
	for (var i in categories)
		categories[i].sort(function(a, b) { return Foxtrick.modules[a].MODULE_NAME > Foxtrick.modules[b].MODULE_NAME; });
	for (var i in categories)
		for (var j in categories[i])
			$("#pane-" + i).append(getModule(Foxtrick.modules[categories[i][j]]));
}

function getModule(module)
{
	var enabled = Foxtrick.isModuleEnabled(module);

	var entry = document.createElement("div");
	entry.id = "pref-" + module.MODULE_NAME;
	entry.className = "module";

	var title = document.createElement("h3");
	title.id = entry.id + "-title";
	entry.appendChild(title);

	var label = document.createElement("label");
	var check = document.createElement("input");
	check.id = entry.id + "-check";
	check.type = "checkbox";
	check.setAttribute("module", module.MODULE_NAME);
	if (enabled)
		check.setAttribute("checked", "checked");
	label.appendChild(check);
	label.appendChild(document.createTextNode(module.MODULE_NAME));
	title.appendChild(label);

	// screenshot
	if (screenshotLink = Foxtrickl10n.getScreenshot(module.MODULE_NAME))
		title.appendChild(getScreenshot(screenshotLink));

	var desc = document.createElement("p");
	desc.id = entry.id + "-desc";
	desc.textContent = FoxtrickPrefs.getModuleDescription(module.MODULE_NAME);
	entry.appendChild(desc);

	// options container
	var options = document.createElement("div");
	options.id = entry.id + "-options";
	entry.appendChild(options);

	if (!enabled)
		$(options).hide();
	$(check).click(function() { $(this).is(":checked") ? $(options).show() : $(options).hide(); });

	// module-provided function for generating options
	// OPTION_FUNC either returns an HTML object or an array of HTML objects
	if (typeof(module.OPTION_FUNC) == "function") {
		var genOptions = module.OPTION_FUNC(document);
		if (genOptions) {
			if ($.isArray(genOptions)) {
				for (var field in genOptions)
					options.appendChild(field);
			}
			else
				options.appendChild(genOptions);
		}
	}

	// checkbox options
	if (module.OPTIONS) {
		var checkboxes = document.createElement("ul");
		options.appendChild(checkboxes);
		checkboxes.id = module.MODULE_NAME + "-checkboxes";

		for (var i in module.OPTIONS) {
			var item = document.createElement("li");
			checkboxes.appendChild(item);
			var label = document.createElement("label");
			item.appendChild(label);
			var checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.setAttribute("module", module.MODULE_NAME);
			label.appendChild(checkbox);

			var key, title;
			if (module.OPTIONS[i]["key"]) {
				key = module.OPTIONS[i]["key"];
				title = module.OPTIONS[i]["title"];
			}
			else {
				key = module.OPTIONS[i];
				title = FoxtrickPrefs.getModuleElementDescription(module.MODULE_NAME, module.OPTIONS[i]);
			}
			checkbox.id = entry.id + "-" + key;
			checkbox.setAttribute("option", key);
			if (Foxtrick.isModuleFeatureEnabled(module, key))
				checkbox.setAttribute("checked", "checked");
			label.appendChild(document.createTextNode(title));

			// screenshot
			if (screenshotLink = Foxtrickl10n.getScreenshot(module.MODULE_NAME + "." + key))
				label.appendChild(getScreenshot(screenshotLink));

			if (module.OPTION_TEXTS &&
				(!module.OPTION_TEXTS_DISABLED_LIST || !module.OPTION_TEXTS_DISABLED_LIST[i])) {
				var textDiv = document.createElement("div");
				textDiv.id = checkbox.id + "-text-div";
				item.appendChild(textDiv);
				var textInput = document.createElement("input");
				textInput.id = checkbox.id + "-text";
				textInput.setAttribute("module", module.MODULE_NAME);
				textInput.setAttribute("option", module.OPTIONS[i] + "_text");
				textDiv.appendChild(textInput);

				if (!Foxtrick.isModuleFeatureEnabled(module, key)) {
					$(textDiv).hide();
				}

				$(checkbox).click(function() { $(this).is(":checked") ? $(textDiv).show() : $(textDiv).hide(); });

				var val = FoxtrickPrefs.getString("module." + module.MODULE_NAME + "." + textInput.getAttribute("option"));
				if (val === null && module.OPTION_TEXTS_DEFAULT_VALUES && module.OPTION_TEXTS_DEFAULT_VALUES[i]) {
					val = module.OPTION_TEXTS_DEFAULT_VALUES[i];
				}
				textInput.value = val;

				// load buttons
				if (module.OPTION_TEXTS_LOAD_BUTTONS && module.OPTION_TEXTS_LOAD_BUTTONS[i]) {
					var load = document.createElement("button");
					textDiv.appendChild(load);
					load.id = textInput.id + "-load";
					$(load).attr("text", "foxtrick.prefs.buttonLoadPrefs");
					$(load).click(function() {
						const text = $("#" + $(this).attr("id").replace(/-load$/, ""));
						var file = Foxtrick.selectFile(window);
						if (file)
							text[0].value = "file://" + file;
					});
				}
			}
		}
	}

	// radio options
	if (module.RADIO_OPTIONS) {
		var radios = document.createElement("ul");
		radios.id = entry.id + "-radios";
		options.appendChild(radios);

		var selectedValue = Foxtrick.getModuleValue(module);
		for (var i in module.RADIO_OPTIONS) {
			var item = document.createElement("li");
			radios.appendChild(item);
			var label = document.createElement("label");
			item.appendChild(label);
			var radio = document.createElement("input");
			radio.type = "radio";
			radio.name = entry.id + "-radio";
			radio.value = i;
			radio.setAttribute("module", module.MODULE_NAME);
			if (selectedValue == i) {
				radio.setAttribute("checked", "checked");
			}
			label.appendChild(radio);
			label.appendChild(document.createTextNode(
				FoxtrickPrefs.getModuleDescription(module.MODULE_NAME + "." + module.RADIO_OPTIONS[i])));
		}
	}

	return entry;
}

function getScreenshot(link)
{
	var a = document.createElement("a");
	a.className = "screenshot";
	a.href = link;
	a.title = Foxtrickl10n.getString("foxtrick.prefs.commented_screenshots");
	a.setAttribute('target','_blank');
	return a;
}

function initHelpTab()
{
	// external links
	const aboutXml = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/foxtrick_about.xml");
	const links = Foxtrick.XML_evaluate(aboutXml, "about/links/link", "title", "value");
	for (var i = 0; i < links.length; ++i) {
		var item = document.createElement("li");
		$("#external-links-list").append($(item));
		var link = document.createElement("a");
		item.appendChild(link);
		link.textContent = Foxtrickl10n.getString("foxtrick.prefs." + links[i][0]);
		link.href = links[i][1];
	}

	// style tutorial
	var styleTutorial = Foxtrickl10n.getString("StyleTutorial.content").split(/%s/);
	$("#style-tutorial-text").text(styleTutorial[0]);
	var styleLink = document.createElement("a");
	styleLink.href = styleLink.textContent = Foxtrick.ResourcePath + "resources/css/user-content-example.css";
	$("#style-tutorial-text").append($(styleLink));
	$("#style-tutorial-text").append(document.createTextNode(styleTutorial[1]));
}

function initAboutTab()
{
	const aboutXml = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/foxtrick_about.xml");
	$(".about-list").each(function() {
		const items = Foxtrick.XML_evaluate(aboutXml, $(this).attr("path"), "value");
		for (var i = 0; i < items.length; ++i) {
			var item = document.createElement("li");
			item.textContent = items[i];
			$(this).append($(item));
		}
	});
}

function save()
{
	// global preferences
	$("body [pref]").each(function() {
		if ($(this).attr("pref")) {
			const pref = $(this).attr("pref");
			if ($(this).is(":checkbox"))
				FoxtrickPrefs.setBool(pref, $(this).is(":checked"));
			else if ($(this)[0].nodeName == "select")
				FoxtrickPrefs.setString(pref, $(this)[0].value); // calculated just-in-time, so jQuery would fail here
			else if ($(this).is(":input"))
				FoxtrickPrefs.setString(pref, $(this).attr("value"));
		}
	});

	// per-module preferences
	$("body [module]").each(function() {
		const module = $(this).attr("module");
		if ($(this).attr("option")) {
			// option of module
			const option = $(this).attr("option");
			if ($(this).is(":checkbox"))
				FoxtrickPrefs.setModuleEnableState(module + "." + option, $(this).is(":checked"));
			else if ($(this).is(":input"))
				FoxtrickPrefs.setModuleOptionsText(module + "." + option, $(this)[0].value);
		}
		else if ($(this).is(":radio")) {
			if ($(this).is(":checked"))
			 	FoxtrickPrefs.setModuleValue(module, $(this).attr("value"));
		}
		else
			FoxtrickPrefs.setModuleEnableState(module, $(this).is(":checked"));
	});

	notice(Foxtrickl10n.getString("foxtrick.prefs.saved"));
}

function notice(msg)
{
	$("#note").text(msg);
	$("#note").show("slow");
}
