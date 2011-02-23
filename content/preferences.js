function init()
{
	initCoreModules();
	initListeners();
	initTabs();
	initTextAndValues();
	$("#cancel").hover(function() { $(this).hide("slow"); }); // trick!
	locateFragment(window.location.toString()); // locate element by fragment
}

function initCoreModules()
{
	// core functions needed for preferences, localization, etc.
	const core = [FoxtrickPrefs, Foxtrickl10n, Foxtrick.XMLData];
	for (var i in core)
		core[i].init();
}

// see http://tools.ietf.org/html/rfc3986#section-3.5
function parseFragment(fragment)
{
	const pairs = String(fragment).split(/&/); // key - value pairs use ampersand (&) as delimiter
	var ret = {};
	for (var i in pairs) {
		var pair = pairs[i].split(/=/); // key and value are separated by equal sign (=)
		if (pair.length == 2)
			ret[pair[0]] = pair[1];
	}
	return ret;
}

function locateFragment(uri)
{
	var fragment = "";
	if (uri.indexOf("#") > -1)
		fragment = uri.replace(/^.+#/, ""); // only keep the fragment
	const param = parseFragment(fragment);
	if (param["module"])
		showModule(param["module"]);
	else if (param["tab"])
		showTab(param["tab"]);
	else
		showTab("main"); // show the main tab by default
}

function showTab(tab)
{
	$("#panes > div[id^='pane-']").hide();
	$("#tabs > li").removeClass("active");
	$("#tab-" + tab).addClass("active");
	$("#pane-" + tab).show();
}

function showModule(module)
{
	const moduleObj = $("#pref-" + String(module));
	const tab = moduleObj.parent().attr("id").replace(/^pane-/, "");
	showTab(tab);
	moduleObj[0].scrollIntoView(true);
}

function baseURI()
{
	return window.location.toString().replace(/#.*$/, "");
}

function generateURI(tab, module)
{
	const location = baseURI();
	if (tab)
		return location + "#tab=" + tab;
	else if (module)
		return location + "#module=" + module;
}

function initListeners()
{
	$("#save").click(function() { save(); });
	$("#note").click(function() { $(this).hide("slow"); });
	$("body").click(function(ev) {
		if ((ev.target.nodeName.toLowerCase() == "a"
			|| ev.target.nodeName.toLowerCase() == "xhtml:a")
			&& (ev.target.href.indexOf(baseURI()) == 0
			|| ev.target.href[0] == "#")) {
			locateFragment(ev.target.href);
		}
	});
}

function initTabs()
{
	// attach each tab with corresponding pane
	$("#tabs li a").each(function() {
		const tab = $(this).parent().attr("id").replace(/^tab-/, "");
		$(this).attr("href", generateURI(tab));
	});
	// initialize the tabs
	initMainTab();
	initModuleTabs();
	initChangesTab();
	initHelpTab();
	initAboutTab();
}

function initTextAndValues()
{
	const rtl = ["fa"];
	const locale = FoxtrickPrefs.getString("htLanguage");
	for (var i = 0; i < rtl.length; ++i)
		if (rtl[i] == locale) {
			$("html").attr("dir", "rtl");
			break;
		}

	document.title = Foxtrickl10n.getString("foxtrick.prefs.preferences");
	$("#version").text(Foxtrick.version());
	// initialize text
	$("body [text-key]").each(function() {
		if ($(this).attr("text-key"))
			$(this).text(Foxtrickl10n.getString($(this).attr("text-key")));
	});
	// initialize modules
	$("body [module]").each(function() {
		const module = $(this).attr("module");
		if ($(this).attr("option")) {
			const option = $(this).attr("option");
			// module option
			if ($(this).is(":checkbox")) {
				 if (Foxtrick.isModuleFeatureEnabled(module, option))
					$(this).attr("checked", "checked");
			}
			else if ($(this).is(":input")) // text input
				$(this)[0].value = FoxtrickPrefs.getString("module." + module + "." + option);
		}
		else if ($(this).is(":radio")) {
			// radio input
			const selected = FoxtrickPrefs.getModuleValue(module);
			if ($(this).attr("value") == selected)
				$(this).attr("checked", "checked");
		}
		else if (Foxtrick.isModuleEnabled(module)) // module itself
			$(this).attr("checked", "checked");
	});
	// initialize checkboxes
	$("body input:checkbox[pref]").each(function() {
		if ($(this).attr("pref"))
			if (FoxtrickPrefs.getBool($(this).attr("pref")))
				$(this).attr("checked", "checked");
	});
	// initialize elements with blockers, disable if blocker enabled
	$("body [blocked-by]").each(function() {
		var blockee = $(this);
		var blocker = $("#" + blockee.attr("blocked-by"));
		var updateStatus = function() {
			if (blocker.is(":checked"))
				blockee.attr("disabled", "disabled");
			else
				blockee.removeAttr("disabled");
		};
		blocker.click(function() { updateStatus(); });
		updateStatus();
	});
	// initialize elements with dependency, show only if dependency met
	$("body [depends-on]").each(function() {
		var depender = $(this);
		var dependee = $("#" + depender.attr("depends-on"));
		var updateStatus = function() {
			if (dependee.is(":checked"))
				depender.show();
			else
				depender.hide();
		};
		dependee.click(function() { updateStatus(); });
		updateStatus();
	});
}

function initMainTab()
{
	// basic preferences
	// language
	var data = [];
	for (var i in Foxtrickl10n.htLanguagesXml) {
		var desc = Foxtrickl10n.htLanguagesXml[i].getElementsByTagName("language")[0].getAttribute("desc");
		data.push({ name: i,  desc: desc });
	}
	data.sort(function(a, b) { return a.desc.localeCompare(b.desc); });
	const selectedLang = FoxtrickPrefs.getString("htLanguage");
	for (var i in data) {
		var locale = data[i];
		var item = document.createElement("option");
		item.value = locale.name;
		item.textContent = locale.desc;
		if (selectedLang == item.value)
			item.selected = "selected";
		$("#pref-read-language").append($(item));
	}

	// country
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

	// date format
	var dateFormats = [];
	var dateFormatXml = Foxtrick.LoadXML(Foxtrick.ResourcePath + "data/htdateformat.xml");
	var dateFormatNodes = dateFormatXml.getElementsByTagName("dateformat");
	for (var i = 0; i < dateFormatNodes.length; ++i) {
		var code = dateFormatNodes[i].getAttribute("code");
		var desc = dateFormatNodes[i].getAttribute("name");
		dateFormats.push({ code: code, desc : desc });
	}
	dateFormats.sort(function(a, b) { return a.desc.localeCompare(b.desc); });
	const selectedDateFormat = Foxtrick.util.time.getDateFormat();
	for (var i in dateFormats) {
		var item = document.createElement("option");
		item.value = dateFormats[i].code;
		item.textContent = dateFormats[i].desc;
		if (selectedDateFormat == item.value)
			item.selected = "selected";
		$("#pref-read-date-format").append($(item));
	}

	// save preferences
	$("#pref-save-do").click(function() {
		var savePrefs = $("#pref-save-pref").is(":checked");
		var saveNotes = $("#pref-save-data").is(":checked");
		$("#pref-save-text").val(FoxtrickPrefs.SavePrefs(savePrefs, saveNotes));
	});

	// load preferences
	$("#pref-load-do").click(function() {
		FoxtrickPrefs.LoadPrefs($("#pref-load-text").val());
		notice(Foxtrickl10n.getString("foxtrick.prefs.loaded"));
	});

	// restore to default
	$("#pref-stored-restore").click(function() {
		if (Foxtrick.confirmDialog(Foxtrickl10n.getString("delete_foxtrick_branches_ask")))
			FoxtrickPrefs.cleanupBranch();
	});

	// disable all
	$("#pref-stored-disable").click(function() {
		if (Foxtrick.confirmDialog(Foxtrickl10n.getString("disable_all_foxtrick_modules_ask")))
			FoxtrickPrefs.disableAll();
	});
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
		var category = Foxtrick.modules[i].MODULE_CATEGORY;
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
	// sort modules in alphabetical order and add to category's tab
	for (var i in categories)
		categories[i].sort(function(a, b) { return Foxtrick.modules[a].MODULE_NAME.localeCompare(Foxtrick.modules[b].MODULE_NAME); });
	for (var i in categories)
		for (var j in categories[i])
			$("#pane-" + i).append(getModule(Foxtrick.modules[categories[i][j]]));
}

function getModule(module)
{
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
	label.appendChild(check);
	label.appendChild(document.createTextNode(module.MODULE_NAME));
	title.appendChild(label);

	// link to module
	var link = document.createElement("a");
	link.className = "module-link";
	link.textContent = "¶";
	link.href = generateURI(null, module.MODULE_NAME);
	title.appendChild(link);

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
	options.setAttribute("depends-on", check.id);
	entry.appendChild(options);

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

			var key = module.OPTIONS[i];
			var desc = FoxtrickPrefs.getModuleElementDescription(module.MODULE_NAME, module.OPTIONS[i]);
			checkbox.id = entry.id + "-" + key;
			checkbox.setAttribute("option", key);
			label.appendChild(document.createTextNode(desc));

			// screenshot
			if (screenshotLink = Foxtrickl10n.getScreenshot(module.MODULE_NAME + "." + key))
				label.appendChild(getScreenshot(screenshotLink));

			if (module.OPTION_TEXTS &&
				(!module.OPTION_TEXTS_DISABLED_LIST || !module.OPTION_TEXTS_DISABLED_LIST[i])) {
				var textDiv = document.createElement("div");
				textDiv.id = checkbox.id + "-text-div";
				textDiv.setAttribute("depends-on", checkbox.id);
				item.appendChild(textDiv);

				var textInput = document.createElement("input");
				textInput.id = checkbox.id + "-text";
				textInput.setAttribute("module", module.MODULE_NAME);
				textInput.setAttribute("option", module.OPTIONS[i] + "_text");
				textDiv.appendChild(textInput);

				// load buttons
				if (module.OPTION_TEXTS_LOAD_BUTTONS && module.OPTION_TEXTS_LOAD_BUTTONS[i]) {
					var load = document.createElement("button");
					textDiv.appendChild(load);
					load.id = textInput.id + "-load";
					$(load).attr("text-key", "foxtrick.prefs.buttonLoadPrefs");
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
			label.appendChild(radio);
			label.appendChild(document.createTextNode(
				FoxtrickPrefs.getModuleDescription(module.MODULE_NAME + "." + module.RADIO_OPTIONS[i])));
		}
	}

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

function initChangesTab()
{
	const releaseNotes = Foxtrick.LoadXML(Foxtrick.ResourcePath + "release-notes.xml");
	const releaseNotesLocalized = Foxtrick.LoadXML(Foxtrick.ResourcePath
		+ "locale/" + FoxtrickPrefs.getString("htLanguage") + "/release-notes.xml");
	var notes = {};
	var notesLocalized = {};

	var parseNotes = function(xml, dest) {
		if (!xml) {
			dest = {};
			return;
		}
		var noteElements = xml.getElementsByTagName("note");
		for (var i = 0; i < noteElements.length; ++i) {
			var version = noteElements[i].getAttribute("version");
			dest[version] = noteElements[i];
		}
	}
	parseNotes(releaseNotes, notes);
	parseNotes(releaseNotesLocalized, notesLocalized);

	var select = $("#pref-version-release-notes")[0];
	for (var i in notes) {
		// unique version name
		var version = notes[i].getAttribute("version");
		// localized version name
		// search by:
		// 1. localized-version in localized release notes
		// 2. localized-version in master release notes
		// 3. version as fall-back
		var localizedVersion = (notesLocalized[version] && notesLocalized[version].getAttribute("localized-version"))
			|| (notes[version] && notes[version].getAttribute("localized-version"))
			|| version;
		var item = document.createElement("option");
		item.textContent = localizedVersion;
		item.value = version;
		select.appendChild(item);
	}

	var updateNotepad = function() {
		var version = select.options[select.selectedIndex].value;
		var list = $("#pref-notepad-list")[0];
		list.textContent = ""; // clear list
		const note = notesLocalized[version] || notes[version];
		if (!note)
			return;
		var items = note.getElementsByTagName("item");
		for (var i = 0; i < items.length; ++i) {
			var item = document.createElement("li");
			list.appendChild(item);
			for (var j = 0; j < items[i].childNodes.length; ++j) {
				var node = items[i].childNodes[j];
				if (node.nodeType == Node.ELEMENT_NODE
					&& node.nodeName.toLowerCase() == "module") {
					var link = document.createElement("a");
					link.textContent = node.textContent;
					link.href = Foxtrick.ResourcePath + "preferences.xhtml#module=" + link.textContent;
					item.appendChild(link);
				}
				else {
					var importedNode = document.importNode(node, true);
					item.appendChild(importedNode);
				}
			}
		}
	}

	updateNotepad();
	$(select).change(updateNotepad);
}

function initHelpTab()
{
	// external links
	const aboutXml = Foxtrick.LoadXML(Foxtrick.ResourcePath + "data/foxtrick_about.xml");
	const links = Foxtrick.XML_evaluate(aboutXml, "about/links/link", "title", "value");
	for (var i = 0; i < links.length; ++i) {
		var item = document.createElement("li");
		$("#external-links-list").append($(item));
		var link = document.createElement("a");
		item.appendChild(link);
		link.textContent = Foxtrickl10n.getString("foxtrick.prefs." + links[i][0]);
		var linkAddress = links[i][1];
		if (linkAddress[0] == "/")
			linkAddress = Foxtrick.getLastHost() + linkAddress;
		link.href = linkAddress;
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
	const aboutXml = Foxtrick.LoadXML(Foxtrick.ResourcePath + "data/foxtrick_about.xml");
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

	FoxtrickPrefs.setBool("preferences.updated", true);
}

function notice(msg)
{
	$("#note-content").text(msg);
	$("#note").show("slow");
}
