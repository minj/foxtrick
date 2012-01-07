"use strict";
// page IDs of last page are stored in array pageIds
var pageIds = [];

function initLoader() {
	// fennec runs init() from injected entry.js (injected)
	// called directly, it'll run and save actually for some reason

	// gecko, safari, chrome
	if (Foxtrick.arch === "Gecko" || Foxtrick.chromeContext() == "background")
		init();
	// opera prefs runs in content context. add need resources first
	else
		sandboxed.extension.sendRequest({ req : "optionsPageLoad" },
			function (data) {
				try {
					Foxtrick.entry.contentScriptInit(data);
					init();
				} catch(e) {Foxtrick.log('initLoader: ',e);}
		});
};

function init()
{
	try {
		initCoreModules();
		initListeners();
		getPageIds();
		initTabs();
		initTextAndValues();
		locateFragment(window.location.toString()); // locate element by fragment
		testPermissions();

		if (window.location.href.search(/saved=true/)!==-1) {
			notice(Foxtrickl10n.getString("foxtrick.prefs.saved"));
			window.location.href = window.location.href.substr(0,window.location.href.search(/\&saved=true/));
		}
		else if (window.location.href.search(/imported=true/)!==-1) {
			notice(Foxtrickl10n.getString("foxtrick.prefs.loaded"));
			window.location.href = window.location.href.substr(0,window.location.href.search(/\&imported=true/));
		}
	} catch (e) {
		Foxtrick.log('init: ', e);
	}
}

function initCoreModules()
{
	// core functions needed for preferences, localization, etc.
	var core = [FoxtrickPrefs, Foxtrickl10n, Foxtrick.XMLData];
	for (var i=0; i<core.length;++i)
		if (typeof(core[i].init)=='function') 
			core[i].init();
}

// see http://tools.ietf.org/html/rfc3986#section-3.5
function parseFragment(fragment)
{
	var pairs = String(fragment).split(/&/); // key - value pairs use ampersand (&) as delimiter
	var ret = {};
	for (var i=0; i<pairs.length; ++i) {
		var pair = pairs[i].split(/=/); // key and value are separated by equal sign (=)
		if (pair.length == 2)
			ret[pair[0]] = pair[1];
	}
	return ret;
}

function locateFragment(uri)
{
	// show functions
	var showModule = function(module) {
		var moduleObj = $("#pref-" + String(module));
		var category = moduleObj.attr("x-category");
		showTab(category);
		moduleObj[0].scrollIntoView(true);
	};
	var showTab = function(tab) {
		$("#pane > div").hide();
		$("#tabs > li").removeClass("active");
		$("#tab-" + tab).addClass("active");
		$("#pane > div[x-on*=" + tab + "]").show();
	};
	var showFaq = function(id) {
		showTab("help");
		$("#faq-" + id)[0].scrollIntoView(true);
	};

	// only keep the fragment of URI
	var fragment = (uri.indexOf("#") > -1)
		? fragment = uri.replace(/^.+#/, "") : "";
	var param = parseFragment(fragment);
	if (param["module"])
		showModule(param["module"]);
	else if (param["tab"])
		showTab(param["tab"]);
	else if (param["faq"])
		showFaq(param["faq"]);
	else if (param["view-by"] == "page")
		showTab("on_page");
	else
		showTab("main"); // show the main tab by default

	// adjust tab visibility according to view-by type
	var viewByPage = (param["view-by"] == "page");
	// add class if view by page, remove class if view by category
	var setClass = function(obj, className) {
		viewByPage ? obj.addClass(className) : obj.removeClass(className);
	};
	// opposite of setClass
	var unsetClass = function(obj, className) {
		viewByPage ? obj.removeClass(className) : obj.addClass(className);
	};
	// set up tab classes
	setClass($("#view-by-page"), "active");
	unsetClass($("#view-by-category"), "active");
	for (var i in Foxtrick.moduleCategories)
		setClass($("#tab-" + Foxtrick.moduleCategories[i]), "hide");
	unsetClass($("#tab-on_page"), "hide");
	unsetClass($("#tab-universal"), "hide");
	$("#tabs li a").each(function() {
		var uri = $(this).attr("href").replace(/&view-by=page/g, "")
		if (viewByPage)
			$(this).attr("href", uri + "&view-by=page");
		else
			$(this).attr("href", uri);
	});
}

function baseURI()
{
	return window.location.toString().replace(/#.*$/, "");
}

function generateURI(tab, module)
{
	var location = baseURI();
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
			|| ev.target.nodeName.toLowerCase() == "xhtml:a")) {
			if ((ev.target.href.indexOf(baseURI()) == 0
				|| ev.target.getAttribute("href")[0] == "#")) {
				locateFragment(ev.target.href);
			}
			else if (ev.target.getAttribute("href").indexOf("http://www.hattrick.org") == 0) {
				// we redirect links starting with
				// "http://www.hattrick.org" to last Hattrick host
				ev.target.setAttribute("href",
					ev.target.getAttribute("href").replace(/^http:\/\/www\.hattrick\.org/, Foxtrick.getLastHost()));
			}
		}
	});
}

// get page IDs in Foxtrick.ht_pages that last page matches and store them
// in pageIds
function getPageIds()
{
	var lastPage = Foxtrick.getLastPage();
	for (var i in Foxtrick.ht_pages) {
		// ignore PAGE all, it's shown in universal tab
		if (i == "all")
			continue;
		if (Foxtrick.isPageHref(Foxtrick.ht_pages[i], lastPage))
			pageIds.push(i);
	}
}

function initTabs()
{
	// attach each tab with corresponding pane
	$("#tabs li a").each(function() {
		var tab = $(this).parent().attr("id").replace(/^tab-/, "");
		$(this).attr("href", generateURI(tab));
	});
	// set up href of "view by" links
	$("#view-by-category a").attr("href", "#view-by=category");
	$("#view-by-page a").attr("href", "#view-by=page");
	// initialize the tabs
	initMainTab();
	initChangesTab();
	initHelpTab();
	initAboutTab();
	initModules();
}

function initTextAndValues()
{
	var locale = FoxtrickPrefs.getString("htLanguage");
	
	if (Foxtrickl10n.getString("direction") == "rtl") 
		$("html").attr("dir", "rtl");

	document.title = Foxtrickl10n.getString("foxtrick.prefs.preferences");
	$("#version").text(Foxtrick.version());

	// initialize text
	$("body [data-text]").each(function() {
		if ($(this).attr("data-text"))
			$(this).text(Foxtrickl10n.getString($(this).attr("data-text")));
	});
	// initialize modules
	$("body [module]").each(function() {
		var module = $(this).attr("module");
		if ($(this).attr("option")) {
			var option = $(this).attr("option");
			// module option
			if ($(this).is(":checkbox")) {
				 if (FoxtrickPrefs.isModuleOptionEnabled(module, option))
					$(this).attr("checked", "checked");
			}
			else if ($(this).is(":input")) // text input
				$(this)[0].value = FoxtrickPrefs.getString("module." + module + "." + option);
		}
		else if ($(this).is(":radio")) {
			// radio input
			var selected = FoxtrickPrefs.getModuleValue(module);
			if ($(this).attr("value") == selected)
				$(this).attr("checked", "checked");
		}
		else if (FoxtrickPrefs.isModuleEnabled(module)) // module itself
			$(this).attr("checked", "checked");
	});
	// initialize inputs
	$("body input[pref]").each(function() {
		if ($(this).is(":checkbox")) {
			// checkbox
			if (FoxtrickPrefs.getBool($(this).attr("pref")))
				$(this).attr("checked", "checked");
		}
		else {
			// text input
			$(this).attr("value", FoxtrickPrefs.getString($(this).attr("pref")));
		}
	});
	$("body textarea[pref]").each(function() {
		$(this).text(FoxtrickPrefs.getString($(this).attr("pref")));
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

	// show page IDs in view-by-page
	$("#view-by-page a").text($("#view-by-page a").text()
		+ " (" + pageIds.join(", ") + ")");

	// initialize delete-token 
	var chpp_url = FoxtrickPrefs.getString("last-host") + "/MyHattrick/Preferences/ExternalAccessGrants.aspx";
	$("#pref-delete-token-desc").html($("#pref-delete-token-desc").text().replace(/\{(.+)\}/, "<a href='"+chpp_url+"' target='_blank'>$1</a>"));
	var oauth_keys = FoxtrickPrefs.getAllKeysOfBranch('oauth');
	if (oauth_keys)	{
		var teamids = Foxtrick.map( function(n){ 
			return n.match(/oauth\.(.+)\.accessToken/)[1];
		}, oauth_keys);
		teamids = Foxtrick.unique(teamids);
		for (var i=0; i<teamids.length; ++i) {
			var id = parseInt(teamids[i]);
			if ( !isNaN(id) ) {
				var item = document.createElement("option");
				item.value = id;
				item.textContent = id;
				$("#select-delete-token-teamids").append($(item));
			}
			else {
				// delete invalid 
				var array = FoxtrickPrefs.getAllKeysOfBranch('oauth.'+teamids[i]);
				for (var i = 0; i < array.length; i++) {
					FoxtrickPrefs.deleteValue(array[i]);
				}
			}
		}
	}
}

function initMainTab()
{
	// setup
	$("#pref-setup-desc").html(Foxtrickl10n.getString("foxtrick.prefs.setup.desc")
		.replace(/{(.+)}/, "<a href=\"http://code.google.com/p/foxtrick/issues/list\" target=\"_blank\">$1</a>"));

	// save preferences
	$("#pref-save-do").click(function() {
		var savePrefs = $("#pref-save-pref").is(":checked");
		var saveNotes = $("#pref-save-data").is(":checked");
		var saveToken = $("#pref-save-token").is(":checked");
		$("#pref-save-text").val(FoxtrickPrefs.SavePrefs(savePrefs, saveNotes, saveToken));
	});

	// load preferences
	$("#pref-load-do").click(function() {
		FoxtrickPrefs.LoadPrefs($("#pref-load-text").val());
		window.location.href = window.location.href + '&imported=true';
		window.location.reload();
	});

	// restore to default
	$("#pref-stored-restore").click(function() {
		if (Foxtrick.confirmDialog(Foxtrickl10n.getString("delete_foxtrick_branches_ask"))) {
			FoxtrickPrefs.cleanupBranch();
			window.location.href = window.location.href + '&imported=true';
			window.location.reload();
		}
	});

	// delete OAuth token/secret
	$("#pref-delete-token").click(function() {
		var teamid = $("#select-delete-token-teamids")[0].value;
		if (Foxtrick.confirmDialog(Foxtrickl10n.getString("delete_oauth_ask").replace('%s',teamid))) {
			var array = FoxtrickPrefs.getAllKeysOfBranch('oauth.'+teamid);
			for (var i = 0; i < array.length; i++) {
				FoxtrickPrefs.deleteValue(array[i]);
			}
			window.location.href = window.location.href + '&imported=true';
			window.location.reload();
		}
	});

	// disable all
	$("#pref-stored-disable").click(function() {
		if (Foxtrick.confirmDialog(Foxtrickl10n.getString("disable_all_foxtrick_modules_ask"))) {
			Foxtrick.log('preferences: diable all');
			FoxtrickPrefs.disableAllModules();
			window.location.href = window.location.href + '&imported=true';
			window.location.reload();
		}
	});

	// revoke permissions
	$("#pref-revoke-permissions").click(function() {
		if (Foxtrick.confirmDialog(Foxtrickl10n.getString("revoke_permissions_ask"))) {
			Foxtrick.log('preferences: revoke permissions');
			revokePermissions();
		}
	});
}

function getModule(module)
{
	var getScreenshot = function(link) {
		var a = document.createElement("a");
		a.className = "screenshot";
		a.href = link;
		a.title = Foxtrickl10n.getString("prefs.screenshot");
		a.setAttribute('target','_blank');
		return a;
	}

	var entry = document.createElement("div");
	entry.id = "pref-" + module.MODULE_NAME;
	entry.className = "module";
	entry.setAttribute("x-category", module.MODULE_CATEGORY);

	var title = document.createElement("h3");
	title.id = entry.id + "-title";
	entry.appendChild(title);

	var label = document.createElement("label");
	var check = document.createElement("input");
	check.id = entry.id + "-check";
	check.type = "checkbox";
	// do not allow disabling core modules
	if (module.CORE_MODULE) {
		check.setAttribute("checked", "checked");
		check.setAttribute("disabled", "disabled");
	}
	else {
		check.setAttribute("module", module.MODULE_NAME);
	}

	label.appendChild(check);
	label.appendChild(document.createTextNode(module.MODULE_NAME));
	title.appendChild(label);

	// link to module
	var link = document.createElement("a");
	link.className = "module-link";
	link.textContent = "¶";
	link.href = generateURI(null, module.MODULE_NAME);
	link.title=Foxtrickl10n.getString('module.link');
	title.appendChild(link);

	// screenshot
	var screenshotLink = Foxtrickl10n.getScreenshot(module.MODULE_NAME);
	if (screenshotLink)
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

	// module-provided function for generating options. will be appended
	// OPTION_FUNC either returns an HTML object or an array of HTML objects
	// or purely initializes them and returns null
	var customCoptions = [];
	if (typeof(module.OPTION_FUNC) == "function") {
		var genOptions = module.OPTION_FUNC(document);
		if (genOptions) {
			if ($.isArray(genOptions)) {
				for (var field=0; field<genOptions.length; ++field)
					customCoptions.push(field);
			}
			else
				customCoptions.push(genOptions);
		}
	}

	// checkbox options
	if (module.OPTIONS) {
		var checkboxes = document.createElement("ul");
		options.appendChild(checkboxes);
		checkboxes.id = module.MODULE_NAME + "-checkboxes";

		for (var i=0; i<module.OPTIONS.length; ++i) {		
			var item, label, checkbox = null;
			
			var appendOptionToList = function (key, list){
				item = document.createElement("li");
				list.appendChild(item);
				label = document.createElement("label");
				item.appendChild(label);
				checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				checkbox.setAttribute("module", module.MODULE_NAME);
				label.appendChild(checkbox);
				
				var desc = FoxtrickPrefs.getModuleElementDescription(module.MODULE_NAME, key);
				checkbox.id = entry.id + "-" + key;
				checkbox.setAttribute("option", key);
				label.appendChild(document.createTextNode(desc));

				// screenshot
				if (screenshotLink = Foxtrickl10n.getScreenshot(module.MODULE_NAME + "." + key))
					label.appendChild(getScreenshot(screenshotLink));
			}
			
			//supereasy way to create subgroups for options, just supply an array
			//first element will toggle visibility for entries 1->n
			//supports nested subgroups
			if(module.OPTIONS[i] instanceof Array){
				var parentlist = checkboxes;
				var appendOptionsArrayToList = function (optionsarray, parentlist){
					for(var k=0; k<optionsarray.length; ++k)
					{
						if(k == 1){
							var item = document.createElement("li");
							parentlist.appendChild(item);
							parentlist = document.createElement("ul");
							parentlist.setAttribute("depends-on", entry.id + "-" + optionsarray[0]);
							item.appendChild(parentlist);
							parentlist.id = module.MODULE_NAME + '-' + optionsarray[0] + "-checkboxes";
						} 
						
						if(optionsarray[k] instanceof Array)
							appendOptionsArrayToList(optionsarray[k], parentlist);
						else
							appendOptionToList(optionsarray[k], parentlist);
					}
				}
				appendOptionsArrayToList(module.OPTIONS[i], parentlist);
				
				continue;
			} 
			
			var key = module.OPTIONS[i];
			appendOptionToList(key, checkboxes);
			
					
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

				if (module.OPTION_TEXTS_TEXTFILE_LOAD_BUTTONS && module.OPTION_TEXTS_TEXTFILE_LOAD_BUTTONS[i]) {
					var load = Foxtrick.filePickerForText(document, (function(textInput) {
						return function(text) { textInput.value = text; };
					})(textInput));
					textDiv.appendChild(load);
				}
				if (module.OPTION_TEXTS_DATAURL_LOAD_BUTTONS && module.OPTION_TEXTS_DATAURL_LOAD_BUTTONS[i]) {
					var load = Foxtrick.filePickerForDataUrl(document, (function(textInput) {
						return function(url) { textInput.value = url; };
					})(textInput));
					textDiv.appendChild(load);
				}
			}
		}
	}

	// radio options
	if (module.RADIO_OPTIONS) {
		var radios = document.createElement("ul");
		radios.id = entry.id + "-radios";
		options.appendChild(radios);

		for (var i=0; i<module.RADIO_OPTIONS.length; ++i) {
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

	for (var i=0; i<customCoptions.length; ++i) {
		options.appendChild(customCoptions[i]);
	}
	return entry;
}

function initChangesTab()
{
	var releaseNotes = Foxtrick.loadXmlSync(Foxtrick.InternalPath + "release-notes.xml");
	var releaseNotesLocalized = Foxtrick.loadXmlSync(Foxtrick.InternalPath
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
		var note = notesLocalized[version] || notes[version];
		if (!note)
			return;
		var items = note.getElementsByTagName("item");
		for (var i = 0; i < items.length; ++i) {
			var item = document.createElement("li");
			list.appendChild(item);
			importContent(items[i], item);
		}
	}

	var version = Foxtrick.version();
	for (var i = 0; i < select.options.length; ++i) {
		if (select.options[i].value == version) {
			select.selectedIndex = i;
			break;
		}
	}

	updateNotepad();
	$(select).change(updateNotepad);
}

function initHelpTab()
{
	// external links
	var aboutXml = Foxtrick.loadXmlSync(Foxtrick.InternalPath + "data/foxtrick_about.xml");
	var links = Foxtrick.XML_evaluate(aboutXml, "about/links/link", "title", "value");
	for (var i = 0; i < links.length; ++i) {
		var item = document.createElement("li");
		$("#external-links-list").append($(item));
		var link = document.createElement("a");
		item.appendChild(link);
		link.textContent = Foxtrickl10n.getString("link." + links[i][0]);
		link.href = links[i][1];
	}

	// FAQ (faq.xml or localized locale/code/faq.xml
	var faq = Foxtrick.loadXmlSync(Foxtrick.InternalPath + "faq.xml");
	var faqLocal = Foxtrick.loadXmlSync(Foxtrick.InternalPath + "locale/"
		+ FoxtrickPrefs.getString("htLanguage") + "/faq.xml");
	var items = {};
	var itemsLocal = {};
	var parseFaq = function(src, dest) {
		if (!src)
			return;
		var items = src.getElementsByTagName("item");
		for (var i = 0; i < items.length; ++i) {
			var item = items[i];
			dest[item.getAttribute("id")] = item;
		}
	};
	parseFaq(faq, items);
	parseFaq(faqLocal, itemsLocal);
	for (var i in items) {
		// we prefer localized ones
		var item = itemsLocal[i] || items[i];
		// container for question and answer
		var block = document.createElement("div");
		block.id = "faq-" + i;
		block.className = "module";
		block.setAttribute("x-on", "help");
		$("#pane").append($(block));
		// question
		var header = document.createElement("h3");
		header.textContent = item.getElementsByTagName("question")[0].textContent;
		block.appendChild(header);
		// link to question
		var link = document.createElement("a");
		link.textContent = "¶";
		link.className = "module-link";
		link.href = "#faq=" + i;
		header.appendChild(link);
		// answer
		var content = document.createElement("p");
		// import child nodes one by one as we may use XHTML there
		importContent(item.getElementsByTagName("answer")[0], content);
		block.appendChild(content);
	}
}

function initAboutTab()
{
	var aboutXml = Foxtrick.loadXmlSync(Foxtrick.InternalPath + "data/foxtrick_about.xml");
	$(".about-list").each(function() {
		var iterator = aboutXml.evaluate($(this).attr("path"), aboutXml, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
		var currentNode = iterator.iterateNext();
		while (currentNode) {
			var item = document.createElement("li");
			var id = currentNode.hasAttribute("id") ? currentNode.getAttribute("id") : null;
			var name = currentNode.getAttribute("name");

			if (currentNode.nodeName == "translator") {
				var translation = currentNode.parentNode;
				var language = translation.getAttribute("language");
				item.appendChild(document.createTextNode(language + ": "));
			}

			item.appendChild(document.createTextNode(name));
			if (id) {
				item.appendChild(document.createTextNode(" "));
				var link = document.createElement("a");
				link.href = "http://www.hattrick.org/Club/Manager/?userId=" + id;
				link.textContent = "(%s)".replace(/%s/, id);
				item.appendChild(link);
			}
			$(this).append($(item));

			currentNode = iterator.iterateNext();
		}
	});
}

function initModules()
{
	var modules = [];
	for (var i in Foxtrick.modules)
		modules.push(Foxtrick.modules[i]);
	// remove modules without categories
	modules = Foxtrick.filter(function(m) { return m.MODULE_CATEGORY != undefined; }, modules);
	// sort modules in alphabetical order. Links modules to the end
	modules.sort(function(a, b) { 
		if (a.MODULE_NAME.search(/Links/)==0)
			if (b.MODULE_NAME.search(/Links/)==0)
				return a.MODULE_NAME.localeCompare(b.MODULE_NAME); 
			else 
				return 1;
		else if (b.MODULE_NAME.search(/Links/)==0)
			return -1;
		else
			return a.MODULE_NAME.localeCompare(b.MODULE_NAME); 
	});

	for (var i = 0; i < modules.length; ++i) {
		var module = modules[i];
		var obj = getModule(module);
		// show on view-by-category tab
		$(obj).attr("x-on", module.MODULE_CATEGORY);
		// show on view-by-page tab
		if (module.PAGES) {
			if (Foxtrick.member("all", module.PAGES))
				$(obj).attr("x-on", $(obj).attr("x-on") + " universal");
			else if (Foxtrick.intersect(module.PAGES, pageIds).length > 0)
				$(obj).attr("x-on", $(obj).attr("x-on") + " on_page");
		}
		$("#pane").append(obj);
	}
}
	
function save()
{
	// global preferences
	$("body [pref]").each(function() {
		if ($(this).attr("pref")) {
			var pref = $(this).attr("pref");
			if ($(this).is(":checkbox"))
				FoxtrickPrefs.setBool(pref, $(this).is(":checked"));
			else if ($(this)[0].nodeName == "select")
				FoxtrickPrefs.setString(pref, $(this)[0].value); // calculated just-in-time, so .attr("value") would fail here
			else if ($(this).is(":input"))
				FoxtrickPrefs.setString(pref, $(this)[0].value);
		}
	});

	// per-module preferences
	$("body [module]").each(function() {
		var module = $(this).attr("module");
		if ($(this).attr("option")) {
			// option of module
			var option = $(this).attr("option");
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

	var needsPermissions = checkPermissions();

	if (!needsPermissions)
		notice(Foxtrickl10n.getString("foxtrick.prefs.saved"));
	// else it is shown in permission request callback
	
	FoxtrickPrefs.setBool("preferences.updated", true);
}

function notice(msg)
{
	$("#note-content").text(msg);
	$("#note").show("slow");
}

function importContent(from, to)
{
	for (var i = 0; i < from.childNodes.length; ++i) {
		var node = from.childNodes[i];
		if (node.nodeType == Node.ELEMENT_NODE
			&& node.nodeName.toLowerCase() == "module") {
			var link = document.createElement("a");
			link.textContent = node.textContent;
			link.href = Foxtrick.InternalPath + "preferences.html#module=" + link.textContent;
			to.appendChild(link);
		}
		else {
			var importedNode = document.importNode(node, true);
			to.appendChild(importedNode);
		}
	}
}



// permissions management

// check if permissions are granted in init and ask for permission if needed on saving
// that's unsave since we don't check permissions right before asking for them
// but since permission request must be in the click handler and not in a callback
// this seems to be the only way 

// should move/get that to the resp. modules
var neededPermissions = [
	{ module: "ExtraShortcuts.HtRadio", url: "http://stream.ht-radio.nl/*" },
	{ module: "ExtraShortcuts.No9", url: "http://no9-online.de/*" },
	{ module: "ExtraShortcuts.Latehome", url: "http://www.latehome.de/*" },
	{ module: "StaffMarker.HT-Youthclub", url: "http://www.hattrick-youthclub.org/*" },
	{ module: "EmbedMedia.EmbedVimeoVideos", url: "https://vimeo.com/api/*" },
	{ module: "EmbedMedia.EmbedYoutubeVideos", url: "https://www.youtube.com/*" },
	//{ module: "EmbedMedia.EmbedFunnyOrDieVideos", url: "http://www.funnyordie.com/*" },
	{ module: "EmbedMedia.EmbedDailymotionVideos", url: "https://www.dailymotion.com/services/*" },
	{ module: "EmbedMedia.EmbedFlickrImages", url: "http://www.flickr.com/services/oembed/*" },
	{ module: "EmbedMedia.EmbedDeviantArtImages", url: "http://backend.deviantart.com/*" },
	{ module: "EmbedMedia.EmbedSoundCloud", url: "http://soundcloud.com/*" }
];

function testPermissions() {
	// initialize elements which need permissions, ask for permission if needed
	if (Foxtrick.platform === "Chrome") {
		for (var i=0; i<neededPermissions.length; ++i) { 
			var testModulePermission = function(neededPermission) {				
				chrome.permissions.contains({
					  origins: [neededPermission.url]
					}, function(result) {
						var id = "#pref-" + neededPermission.module.replace(/\./g,"-");
						$(id).attr("permission-granted", result);
						neededPermission.granted = result;
						var checkPermission = function() {
							if ($(id).attr("permission-granted")=="false")
								getPermission(neededPermission)
						};
						$(id).click(function() { checkPermission(); });
					});
			};				
			testModulePermission(neededPermissions[i]);
		}
	}
}

function getPermission(neededPermission, hint, showSaved) {				
	if (hint)
		alert( hint );
	// Permissions must be requested from inside a user gesture, like a button's
	// click handler.
	chrome.permissions.request({
		origins: [neededPermission.url]
		}, function(granted) {
			// The callback argument will be true if the user granted the permissions.
			var id = "#pref-" + neededPermission.module.replace(/\./g,"-");
			if (!granted) {
				$(id).removeAttr("checked");
				FoxtrickPrefs.setBool("module." + neededPermission.module + ".enabled", false);
				Foxtrick.log("Permission declined: ", neededPermission.module);
			}
			else {
				$(id).attr("permission-granted", true);
				Foxtrick.log("Permission granted: ", neededPermission.module);
			}
			if (showSaved) {
				notice(Foxtrickl10n.getString("foxtrick.prefs.saved"));
			}
	});
}

function revokePermissions() {
	// removes current permissions
	if (Foxtrick.platform === "Chrome") {
		for (var i=0; i<neededPermissions.length; ++i) { 
			var revokeModulePermission = function(neededPermission) {				
				chrome.permissions.remove({
					  origins: [neededPermission.url]
					}, function(result) {
						var id = "#pref-" + neededPermission.module.replace(/\./g,"-");
						$(id).attr("permission-granted", false);
						Foxtrick.log('Permission removed: ', neededPermission.module, result);
				});
			};				
			revokeModulePermission(neededPermissions[i]);
		}
	}
}

function checkPermissions() {
	var needsPermissions = false; 
	// ask for permissions if needed
	if (Foxtrick.platform === "Chrome") {
		for (var i=0; i<neededPermissions.length; ++i) { 
			if (FoxtrickPrefs.getBool("module." + neededPermissions[i].module + ".enabled")) {
				var id = "#pref-" + neededPermissions[i].module.replace(/\./g,"-");
				if ($(id).attr("permission-granted")=="false") {
					var showSaved = (i==neededPermissions.length-1) ? true : false;
					needsPermissions = true;
					getPermission(neededPermissions[i], Foxtrickl10n.getString("foxtrick.prefs.permissionsHint").replace("%s", neededPermissions[i].module), showSaved);
				}
			}
		}
	}
	return needsPermissions;
}
