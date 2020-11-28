/* eslint-disable consistent-this */
/* eslint-disable func-style */
/* eslint-disable no-implicit-globals */

'use strict';

/**
 * Foxtrick preferences
 *
 * @author ryanli, convincedd, LA-MJ, CatzHoek
 */

// jscs:disable disallowFunctionDeclarations

// page IDs of last page are stored in array PAGEIDS
var PAGEIDS = [];

// get page IDs in Foxtrick.htPages that last page matches and store them in PAGEIDS
function getPageIds() {
	var lastPage = Foxtrick.getLastPage();
	for (var p in Foxtrick.htPages) {
		// ignore PAGE all, it's shown in universal tab
		if (p === 'all')
			continue;

		if (Foxtrick.isPageHref(lastPage, Foxtrick.htPages[p]))
			PAGEIDS.push(p);
	}
}

// used to cache the searchable module items to prevent the search functionality
// from traversing the DOM all the time
var MODULES = {};

/**
 * Show message box
 *
 * @param {string} msg
 */
function notice(msg) {
	$('#note-content').text(msg);
	$('#note').show('slow');
}

function baseURI() {
	return window.location.href.replace(/#.*$/, '');
}

/**
 * Generate a hash URI to an object.
 *
 * opts is {tab, module, id, search: string}, choose one.
 *
 * @param  {object} opts {tab, module, id, search: string}
 * @return {string}
 */
function generateURI(opts) {
	var location = baseURI();
	if (opts.tab)
		return location + '#tab=' + opts.tab;
	else if (opts.module)
		return location + '#module=' + opts.module;
	else if (opts.id)
		return location + '#' + opts.id;
	else if (opts.search)
		return location + '#search=' + opts.search;
}

/**
 * Index modules and other headers for search
 */
function initSearch() {
	var searchAdd = function(searchStr, item) {
		if (Array.isArray(MODULES[searchStr])) {
			MODULES[searchStr].push(item);
		}
		else if (typeof MODULES[searchStr] === 'object') {
			MODULES[searchStr] = [MODULES[searchStr], item];
		}
		else
			MODULES[searchStr] = item;
	};

	$('.module').each(function() {
		try {

			var $this = $(this);
			var $header;

			var name = $this.attr('id');
			var saveName;

			var prefRe = /^pref-/;
			if (name && prefRe.test(name)) {
				saveName = name.replace(/^pref-/, '');
				searchAdd(saveName, this);
			}
			else if (name) {
				$header = $this.children('h3:first, h2:first');
				saveName = $header.text().replace('¶', '').trim();
				searchAdd(saveName, this);

				var faqLink = $header.children('a')[0];
				saveName = faqLink.href;
				searchAdd(saveName, this);
			}
			else {
				$header = $this.children('h3:first, h2:first');
				if ($header.attr('data-text')) {
					name = Foxtrick.L10n.getString($header.attr('data-text'));
					searchAdd(name, this);
					searchAdd($header.attr('data-text'), this);
				}
				else {
					Foxtrick.log('no search support, missing header and/or data-text:', this);
				}
			}
		}
		catch (e) {
			Foxtrick.log('no search support', e);
		}
	});
}

/**
 * Reflow content to show only matching search results.
 *
 * isModule is used for breadcrumb URL generation.
 *
 * @param {string}  needle
 * @param {boolean} isModule
 */
function search(needle, isModule) {

	// iterate pre-cached modules,
	// jQuery is slow as hell here, directly using DOM methods
	var showModules = function(visibilityPredicate) {
		var shown = new Set();
		for (var m in MODULES) {
			var doShow = visibilityPredicate(m);
			var memo = MODULES[m];
			if (Array.isArray(memo)) {
				for (var module of memo) {
					if (doShow) {
						Foxtrick.removeClass(module, 'hidden');
						shown.add(module);
					}
					else if (!shown.has(module)) {
						// only hide if not shown in a previous iteration
						Foxtrick.addClass(module, 'hidden');
					}
				}
			}
			else {
				if (doShow) {
					Foxtrick.removeClass(memo, 'hidden');
					shown.add(memo);
				}
				else if (!shown.has(memo)) {
					// only hide if not shown in a previous iteration
					Foxtrick.addClass(memo, 'hidden');
				}
			}
		}
	};

	if (needle.length > 0) {
		$('#breadcrumb-2').show();
		$('#breadcrumb-2').text(needle);
		$('#breadcrumb-sep-1').show();

		var opt = isModule ? { module: needle } : { search: needle };
		$('#breadcrumb-2').attr('href', generateURI(opt));

		// README: needle not escaped => supports RegExp
		// consider escaping
		var regex = new RegExp(needle, 'i');

		// show matching
		showModules(function(name) { return regex.test(name); });
	}
	else {
		$('#breadcrumb-2').hide();
		$('#breadcrumb-3').hide();
		$('#breadcrumb-sep-1').hide();
		$('#breadcrumb-sep-2').hide();

		// show all
		showModules(function() { return true; });
	}
}

/**
 * Parse hash fragment into options: {tab, module, id, search: string}.
 *
 * TODO replace with URLSearchParams
 *
 * @param  {string} fragment
 * @return {object}          {tab, module, id, search: string}
 */
function parseFragment(fragment) {
	var pairs = (fragment ? fragment.toString() : '').split(/&/);

	// key - value pairs use ampersand (&) as delimiter
	var ret = {};
	for (var pair of pairs) {
		var param = pair.split(/=/); // key and value are separated by equal sign (=)
		if (param.length == 2)
			ret[decodeURIComponent(param[0])] = decodeURIComponent(param[1]);
	}
	return ret;
}

/**
 * Reflow content according to hash fragment
 *
 * @param {string} uri
 */
function locateFragment(uri) {
	// show functions
	var showTab = function(tab) {
		// if (Foxtrick.Prefs.isModuleEnabled('MobileEnhancements')) {
		// 	// mobile
		// 	$('#navigation-header').text(Foxtrick.L10n.getString('tab.' + tab));
		// }

		$('#breadcrumb-1').text(Foxtrick.L10n.getString('tab.' + tab));
		$('#breadcrumb-1').attr('href', generateURI({ tab: tab }));

		search('', true); // search reset

		$('#pane > div').hide();
		$('.tabs > li').removeClass('active');

		$('#tab-' + tab).addClass('active');
		$('#pane > div[x-on*=' + tab + ']').show();
	};

	var showFaq = function(id) {
		showTab('help');

		var div = $('#faq-' + id)[0];
		if (div)
			div.scrollIntoView(true);
	};

	var showModule = function(module) {
		var $module = $('#pref-' + (module ? String(module) : ''));
		var category = $module.attr('x-category');
		showTab(category || 'search');
		search(module, true); // direct search

		var div = $module[0];
		if (div) {
			div.scrollIntoView(true);
		}
	};

	// only keep the fragment of URI
	var fragment = /#/.test(uri) ? uri.replace(/^.*#/, '') : '';
	var param = parseFragment(fragment);

	if (param.module)
		showModule(param.module);
	else if (param.tab)
		showTab(param.tab);
	else if (param.search) {
		showTab('search');
		search(param.search);
	}
	else if (param.faq)
		showFaq(param.faq);
	else {
		showTab('main'); // show the main tab by default
	}

	// if (Foxtrick.Prefs.isModuleEnabled('MobileEnhancements')) {
	// 	// mobile
	// 	$('.tabs').hide();
	// 	$('#main').show();
	// }
}

/**
 * Search input event handler
 *
 * TODO: improve to batch and throttle 'requests' asynchronously
 *
 * @param {Event} ev
 */
function searchEvent(ev) {
	if (ev.target.value.length < 4)
		return;

	var here = window.location.href;
	var there = generateURI({ tab: 'search' });
	if (here !== there) {
		window.location.href = there;
		locateFragment(there);
	}

	search(ev.target.value);
	$('#js-top')[0].scrollIntoView();
}

// Permissions Management

// TODO: extract and improve

// Check if permissions are granted in init and ask for permission if needed on saving
// that's unsave since we don't check permissions right before asking for them
// but since permission request must be in the click handler and not in a callback.
// This seems to be the only way.

// Should move/get that to the resp. modules
var neededPermissions = [
	{
		modules: ['ExtraShortcuts.No9'],
		types: { origins: ['http://no9-online.de/*'] },
	},
	{
		modules: ['ExtraShortcuts.Latehome'],
		types: { origins: ['http://www.latehome.de/*'] },
	},
	{
		modules: ['EmbedMedia.EmbedModeOEmebed'],
		types: {
			origins: [
				'https://vimeo.com/api/*',
				'https://www.youtube.com/*',
				'https://www.dailymotion.com/services/*',
			],
		},
	},
	{
		modules: ['EmbedMedia.EmbedFlickrImages'],
		types: { origins: ['https://secure.flickr.com/services/oembed/*'] },
	},
	{
		modules: ['EmbedMedia.EmbedDeviantArtImages'],
		types: { origins: ['http://backend.deviantart.com/*'] },
	},
	{
		modules: ['EmbedMedia.EmbedSoundCloud'],
		types: { origins: ['https://soundcloud.com/*'] },
	},
	{
		modules: ['EmbedMedia.EmbedImageshack'],
		types: { origins: ['https://imageshack.us/*'] },
	},
	{
		modules: ['CopyYouth.AutoSendTrainingReportToHY'],
		types: { origins: ['https://*.hattrick-youthclub.org/*'] },
	},
	{
		modules: ['CopyYouth.AutoSendRejectedToHY'],
		types: { origins: ['https://*.hattrick-youthclub.org/*'] },
	},
	{
		modules: ['CopyYouth.AutoSendTrainingChangesToHY'],
		types: { origins: ['https://*.hattrick-youthclub.org/*'] },
	},
	{
		modules: ['YouthSkills'],
		types: { origins: ['https://*.hattrick-youthclub.org/*'] },
	},
	{
		modules: ['MatchWeather'],
		types: { origins: ['http://api.openweathermap.org/*'] },
	},
];

/**
 * Convert module/option into element ID
 *
 * @param  {string} option
 * @return {string}
 */
function getElementIdFromOption(option) {
	var id = '#pref-' + option;

	var re = /\./g;
	if (!re.test(id))
		id = id + '-check'; // main module check
	else
		id = id.replace(re, '-'); // sub-option check

	return id;
}

/**
 * Request optional permissions.
 *
 * needed is {types: { permissions, origins: array}, modules: array}.
 *
 * showSaved: optionally show success message
 *
 * @param {object}  needed
 * @param {boolean} showSaved
 */
function getPermission(needed, showSaved) {
	// Permissions must be requested from inside a user gesture, like a button's click handler.
	chrome.permissions.request(needed.types, function(granted) {
		// The callback argument will be true if the user granted the permissions.
		for (var module of needed.modules) {
			var id = getElementIdFromOption(module);
			if (!granted) {
				$(id).prop('checked', false);
				var pref = 'module.' + module + '.enabled';
				Foxtrick.Prefs.setBool(pref, false);
				Foxtrick.log('Permission declined:', module);
			}
			else {
				$(id).attr('permission-granted', true);
				Foxtrick.log('Permission granted:', module);
			}
			if (showSaved) {
				notice(Foxtrick.L10n.getString('prefs.feedback.saved'));
			}
		}
	});
}

/**
 * Check whether optional permissions are required and ask for them if needed
 *
 * returns true if needed
 *
 * @return {boolean} isNeeded
 */
function checkPermissions() {
	var needsPermissions = false;

	if (Foxtrick.platform === 'Chrome') {
		// combine all need permissions into on request
		var combined = {
			modules: [],
			types: { permissions: [], origins: [] },
		};

		neededPermissions.forEach(function(needed) {
			needed.modules.forEach(function(module, m, modules) { // jshint ignore:line
				var id = getElementIdFromOption(module);
				if (!Foxtrick.Prefs.getBool('module.' + module + '.enabled') ||
				    $(id).attr('permission-granted') === 'true')
					return;

				needsPermissions = true;
				Foxtrick.pushNew(combined.modules, modules);

				if (needed.types.permissions)
					Foxtrick.pushNew(combined.types.permissions, needed.types.permissions);

				if (needed.types.origins)
					Foxtrick.pushNew(combined.types.origins, needed.types.origins);
			});
		});

		getPermission(combined, true);
	}

	// returning true prevents save notice from being shown
	// will be shown asynchronously in getPermission
	return needsPermissions;
}

/**
 * Revoke all permissions.
 *
 * TODO: test/fix/improve
 */
function revokePermissions() {

	if (Foxtrick.platform !== 'Chrome' || !('permissions' in chrome))
	    return;

	var revokeModulePermission = function(needed) {
		chrome.permissions.remove(needed.types, function(result) {
			for (var module of needed.modules) {
				var id = getElementIdFromOption(module);
				$(id).attr('permission-granted', false);
				Foxtrick.log('Permission removed:', module, result);
			}
		});
	};
	if (Foxtrick.platform === 'Chrome') {
		for (var permission of neededPermissions) {
			revokeModulePermission(permission);
		}
	}
}

/**
 * Initialize elements which need permissions, show notice if permissions are missing
 *
 * TODO: test/fix/improve
 */
function testPermissions() {
	if (Foxtrick.platform !== 'Chrome' || !('permissions' in chrome))
		return;

	var modules = [];

	var checkPermission = function(id, neededPermission, module) {
		if ($(id).prop('checked') && $(id).attr('permission-granted') == 'false')
			getPermission(neededPermission);
		else if (!$(id).prop('checked')) {

			modules = Foxtrick.exclude(modules, module);
			if (modules.length > 0) {

				var needsPermHtml = '<strong/>' +
					'<ul><li>' + modules.join('</li><li>') + '</li></ul>';

				var l10n = Foxtrick.L10n.getString('prefs.needPermissions');
				$('#alert-text').html(needsPermHtml).find('strong').text(l10n);

				$('#alert').removeClass('hidden');
				$('#breadcrumbs').addClass('hidden');
			}
			else {
				$('#alert-text').text('');
				$('#alert').addClass('hidden');
			}
		}
	};

	var makeChecker = function(id, perm, module) {
		return function() {
			checkPermission(id, perm, module);
		};
	};

	var testModulePermission = function(needed) {
		chrome.permissions.contains(needed.types, function(result) {
			needed.granted = result;

			for (var module of needed.modules) {
				var id = getElementIdFromOption(module);
				$(id).attr('permission-granted', result);
				$(id).click(makeChecker(id, needed, module));

				if (result === false &&
				    Foxtrick.Prefs.getBool('module.' + module + '.enabled')) {

					Foxtrick.pushNew(modules, needed.modules);

					var needsPermHtml = '<strong/>' +
						'<ul><li>' + modules.join('</li><li>') + '</li></ul>';

					var l10n = Foxtrick.L10n.getString('prefs.needPermissions');
					$('#alert-text').html(needsPermHtml).find('strong').text(l10n);

					$('#alert').removeClass('hidden');
					$('#breadcrumbs').addClass('hidden');
				}
			}
		});
	};

	for (var permission of neededPermissions) {
		testModulePermission(permission);
	}
}

/**
 * Handle save event.
 *
 * Saves the current state of all options.
 *
 * @param {Event} ev
 */
function saveEvent(ev) {
	Foxtrick.log('save');

	var pref;

	var $target = $(ev.target);
	if ($target.attr('pref')) {
		pref = $target.attr('pref');

		if ($target.is(':checkbox'))
			Foxtrick.Prefs.setBool(pref, $target.is(':checked'));
		else if (ev.target.nodeName.toLowerCase() == 'select') {
			// calculated just-in-time, so .attr('value') would fail here
			Foxtrick.Prefs.setString(pref, ev.target.value);
		}
		else if ($target.is(':input'))
			Foxtrick.Prefs.setString(pref, ev.target.value);
	}
	else if (ev.target.nodeName.toLowerCase() == 'option') {
		pref = $target.parent().attr('pref');
		var value = ev.target.value;
		Foxtrick.Prefs.setString(pref, value);
	}
	else {
		var module = $target.attr('module');
		if ($target.attr('option')) {
			Foxtrick.log('option of module');
			var option = $target.attr('option');

			pref = module + '.' + option;
			if ($target.is(':checkbox'))
				Foxtrick.Prefs.setModuleEnableState(pref, $target.is(':checked'));
			else if ($target.is(':input'))
				Foxtrick.Prefs.setModuleOptionsText(pref, ev.target.value);
		}
		else if ($target.is(':radio')) {
			if ($target.is(':checked'))
				Foxtrick.Prefs.setModuleValue(module, $target.prop('value'));
		}
		else {
			Foxtrick.Prefs.setModuleEnableState(module, $target.is(':checked'));
			Foxtrick.log('setModuleEnableState');
		}
	}
	Foxtrick.Prefs.setBool('preferences.updated', true);
}

/**
 * Save button clicked.
 *
 * TODO: unused, remove?
 */
function save() {
	var needsPermissions = checkPermissions();

	// shown save notice only if no permissions needed
	// otherwise triggered in permission request callback
	if (!needsPermissions)
		notice(Foxtrick.L10n.getString('prefs.feedback.saved'));

	Foxtrick.Prefs.setBool('preferences.updated', true);
}

/**
 * Parse and add a note containing white-listed HTML markup
 * and custom, predefined linkTags.
 *
 * @param {string}  note   Raw note to be parsed.
 * @param {Element} parent Element to add the note to.
 * @param {object}  links  A map of custom linkTags and their corresponding URLs.
 */
function addNote(note, parent, links) {
	/**
	 * Create a white-listed tag or fall back to createLink
	 * @param  {string}  tagName    Name of the tag or link
	 * @param  {string}  tagContent Text content of the tag. May be recursive
	 * @return {Element}            Element created
	 */
	var createTag = function(tagName, tagContent) {
		/**
		 * Create specific DOM elements.
		 * This should be called for white-listed elements only.
		 *
		 * @param  {string}  nodeName    Name of the element to create.
		 * @param  {string}  textContent Text content of the element.
		 * @param  {object}  options     Map of properties and values of the element.
		 * @return {Element}             Element created.
		 */
		var createNode = function(nodeName, textContent, options) {
			var node = document.createElement(nodeName);
			if (textContent !== null)
				node.textContent = textContent;

			return Object.assign(node, options);
		};
		var createNestedNode = function(nodeName, tagContent, options) {
			var el = createNode(nodeName, null, options);
			// recursively parse and add content to nodes with nesting enabled
			addNote(tagContent, el, links);
			return el;
		};
		var createLink = function(linkName, linkText) {
			if (typeof links === 'object' && links.hasOwnProperty(linkName)) {
				if (linkName.slice(0, 6) === 'FTlink') {
					// links starting with 'FTlink'
					// are assumed to be internal
					// and open in the same tab
					return createNode('a', linkText, { href: links[linkName] });
				}
				else
					return createNode('a', linkText, { href: links[linkName], target: '_blank' });
			}
			else {
				// default to creating text nodes so no evil tags are actually rendered
				return document.createTextNode(linkText);
			}
		};
		switch (tagName) {
			// simple white-listed HTML
			case 'em':
			case 'strong':
				return createNode(tagName, tagContent);
			// custom simple tags
			case 'module':
				return createNode('a', tagContent, { href: '#module=' + tagContent });
			// white-listed tags allowed to have other tags in them
			case 'ul':
			case 'li':
			case 'p':
				return createNestedNode(tagName, tagContent);
			case 'header':
				return createNestedNode('h5', tagContent);
			default:
				// defaults to links with predefined URLs, e. g. <linkHome>
				return createLink(tagName, tagContent);
		}
	};

	if (note === '')
		return;

	// create a container to add all nodes before appending them to DOM in one go
	var noteContainer = document.createDocumentFragment();

	// tokenize into text and outer tags, nesting will be dealt with recursion
	// allow only word characters for tag names and match only properly paired tags
	// tags have no attributes and are thus safe
	var noteTokens = note.match(/<(\w+)>[\s\S]*?<\/\1>|[\s\S]+?(?=<(\w+)>[\s\S]*?<\/\2>|$)/mg);
	var tagRegex = /^<(\w+)>([\s\S]*?)<\/\1>$/m;
	noteTokens.forEach(function(token) {
		if (tagRegex.test(token)) {
			// 0: whole token, 1: tagName, 2: tagContent
			var tag = tagRegex.exec(token);
			noteContainer.appendChild(createTag(tag[1], tag[2]));
		}
		else
			noteContainer.appendChild(document.createTextNode(token));
	});
	parent.appendChild(noteContainer);
}

/**
 * Run core module init functions
 */
function initCoreModules() {
	// add MODULE_NAME to modules
	for (var m in Foxtrick.modules)
		Foxtrick.modules[m].MODULE_NAME = m;

	// core functions needed for preferences, localization, etc.
	var coreModules = [Foxtrick.Prefs, Foxtrick.L10n, Foxtrick.XMLData];
	for (var module of coreModules)
		if (typeof module.init == 'function')
			module.init();
}

/**
 * Add auto save listeners to all elements that require it.
 *
 * Used for custom options as well
 */
function initAutoSaveListeners() {
	var $parent = $('#pane');

	var listener = function(ev) {
		var $this = $(this);

		if ($this.attr('data-listen') === 'false')
			return;

		saveEvent(ev);
	};

	$parent.on('change', ':checkbox, :radio, select', listener);
	$parent.on('input', ':input, textarea', listener);
}

/**
 * Add save, search and click listeners
 */
function initListeners() {
	initAutoSaveListeners();

	$('#nav-toggle').click(function() {
		$('#navigation').toggleClass('hidden');
	});

	$('#navigation').on('click', 'a', function() {
		if ($('#nav-toggle').is(':visible')) {
			$('#nav-toggle').click();
		}

		$('#js-top')[0].scrollIntoView();
	});

	$('#search-input')[0].addEventListener('input', searchEvent);
	$('#save').click(function() {
		save();
		$('#alert').addClass('hidden');
		$('#breadcrumbs').removeClass('hidden');
	});

	$('body').click(function(ev) {
		var nodeName = ev.target.nodeName.toLowerCase();
		if (nodeName !== 'a' && nodeName !== 'xhtml:a')
			return;

		if (ev.target.href.indexOf(baseURI()) === 0 ||
		    ev.target.getAttribute('href')[0] === '#') {
			locateFragment(ev.target.href);
		}
		else if (Foxtrick.isHtUrl(ev.target.href)) {
			// we redirect Hattrick links to last Hattrick host
			var url = Foxtrick.goToUrl(ev.target.href);
			ev.target.href = url;
		}
	});
}

/**
 * Make module div container with module options and their descriptions
 *
 * @param  {object}         module
 * @return {HTMLDivElement}
 */
// eslint-disable-next-line complexity
function makeModuleDiv(module) {
	// var getScreenshot = function(link) {
	// 	var a = document.createElement('a');
	// 	a.className = 'screenshot';
	// 	a.href = link;
	// 	a.title = Foxtrick.L10n.getString('module.screenshot');
	// 	a.setAttribute('target', '_blank');
	// 	return a;
	// };

	var entry = document.createElement('div');
	entry.id = 'pref-' + module.MODULE_NAME;
	entry.className = 'module';
	entry.setAttribute('x-category', module.MODULE_CATEGORY);

	var title = document.createElement('h3');
	title.id = entry.id + '-title';
	entry.appendChild(title);

	var container = document.createElement('div');
	container.className = 'module-content';

	var label = document.createElement('label');
	var check = document.createElement('input');
	check.id = entry.id + '-check';
	check.type = 'checkbox';

	// do not allow disabling core modules
	if (module.CORE_MODULE) {
		check.setAttribute('checked', 'checked');
		check.setAttribute('disabled', 'disabled');
	}
	else {
		check.setAttribute('module', module.MODULE_NAME);
	}

	label.appendChild(check);
	label.appendChild(document.createTextNode(module.MODULE_NAME));
	title.appendChild(label);

	// link to module
	var link = document.createElement('a');
	link.className = 'module-link';
	link.textContent = '¶';
	link.href = generateURI({ module: module.MODULE_NAME });
	link.title = Foxtrick.L10n.getString('module.link');
	title.appendChild(link);

	// screenshot
	// if (false) {
	// 	var screenshotLink = Foxtrick.L10n.getScreenshot(module.MODULE_NAME);
	// 	if (screenshotLink)
	// 		title.appendChild(getScreenshot(screenshotLink));
	// }

	var desc = document.createElement('p');
	desc.id = entry.id + '-desc';
	desc.textContent = Foxtrick.Prefs.getModuleDescription(module.MODULE_NAME);
	container.appendChild(desc);

	// options container
	var options = document.createElement('div');
	options.id = entry.id + '-options';
	options.setAttribute('depends-on', check.id);
	container.appendChild(options);

	// module-provided function for generating options. will be appended
	// OPTION_FUNC either returns an HTML object or an array of HTML objects
	// or purely initializes them and returns null
	var customOptions = [];
	if (typeof module.OPTION_FUNC == 'function') {
		var genOptions = module.OPTION_FUNC(document);
		if (genOptions) {
			if (Array.isArray(genOptions)) {
				for (var field of genOptions)
					customOptions.push(field);
			}
			else
				customOptions.push(genOptions);
		}
	}

	var item;

	// checkbox options
	if (module.OPTIONS) {
		var checkboxes = document.createElement('ul');
		options.appendChild(checkboxes);
		checkboxes.id = module.MODULE_NAME + '-checkboxes';

		var checkbox, textDiv, textInput;

		var appendOptionToList = function(key, list) {
			item = document.createElement('li');
			list.appendChild(item);

			var label = document.createElement('label');
			item.appendChild(label);

			checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.id = entry.id + '-' + key;
			checkbox.setAttribute('module', module.MODULE_NAME);
			checkbox.setAttribute('option', key);
			label.appendChild(checkbox);

			var desc = Foxtrick.Prefs.getModuleElementDescription(module.MODULE_NAME, key);
			label.appendChild(document.createTextNode(desc));

			// screenshot
			// if (false) { // README: disabled
			// 	var screenshotLink = Foxtrick.L10n.getScreenshot(module.MODULE_NAME + '.' + key);
			// 	if (screenshotLink)
			// 		label.appendChild(getScreenshot(screenshotLink));
			// }
		};

		var appendOptionsArrayToList = function(optionsArray, parentList) {
			for (var k = 0; k < optionsArray.length; ++k) {
				if (k == 1) {
					// first subOption, create subOption list and redirect all options to it
					item = document.createElement('li');
					parentList.appendChild(item);

					parentList = document.createElement('ul');
					parentList.id = module.MODULE_NAME + '-' + optionsArray[0] + '-checkboxes';
					parentList.setAttribute('depends-on', entry.id + '-' + optionsArray[0]);

					item.appendChild(parentList);
				}

				if (Array.isArray(optionsArray[k]))
					appendOptionsArrayToList(optionsArray[k], parentList);
				else
					appendOptionToList(optionsArray[k], parentList);
			}
		};
		var makeTextListener = function(input) {
			return function(text) {
				input.value = text;
				input.dispatchEvent(new Event('input', { bubbles: true }));
			};
		};
		var makePlayListener = function(input) {
			return function() {
				Foxtrick.playSound(input.value);
			};
		};

		var makeDataListener = function(input, isSound) {
			return function(url) {
				input.value = url;
				input.dispatchEvent(new Event('input', { bubbles: true }));

				if (isSound)
					Foxtrick.playSound(url);
			};
		};

		for (var i = 0; i < module.OPTIONS.length; ++i) {
			// super easy way to create subgroups for options, just supply an array
			// first element will toggle visibility for entries 1->n
			// supports nested subgroups
			if (Array.isArray(module.OPTIONS[i])) {
				var parentlist = checkboxes;
				appendOptionsArrayToList(module.OPTIONS[i], parentlist);
				continue;
			}

			var key = module.OPTIONS[i];
			appendOptionToList(key, checkboxes);

			if (module.OPTION_EDITS &&
				(!module.OPTION_EDITS_DISABLED_LIST || !module.OPTION_EDITS_DISABLED_LIST[i])) {

				textDiv = document.createElement('div');
				textDiv.id = checkbox.id + '-text-div';
				textDiv.setAttribute('depends-on', checkbox.id);
				item.appendChild(textDiv);

				textInput = document.createElement('input');
				textInput.id = checkbox.id + '-text';
				textInput.setAttribute('module', module.MODULE_NAME);
				textInput.setAttribute('option', module.OPTIONS[i] + '_text');
				textDiv.appendChild(textInput);

				var load;

				if (module.OPTION_EDITS_TEXTFILE_LOAD_BUTTONS &&
				    module.OPTION_EDITS_TEXTFILE_LOAD_BUTTONS[i]) {

					var loadTextlistener = makeTextListener(textInput);
					load = Foxtrick.util.load.filePickerForText(document, loadTextlistener);
					textDiv.appendChild(load);
				}

				if (module.OPTION_EDITS_DATAURL_LOAD_BUTTONS &&
				    module.OPTION_EDITS_DATAURL_LOAD_BUTTONS[i]) {

					var isSound = module.OPTION_EDITS_DATAURL_IS_SOUND &&
						module.OPTION_EDITS_DATAURL_IS_SOUND[i];

					var loadDatalistener = makeDataListener(textInput, isSound);
					load = Foxtrick.util.load.filePickerForDataUrl(document, loadDatalistener);
					textDiv.appendChild(load);

					if (isSound) {
						var playButton = document.createElement('button');
						playButton.setAttribute('data-text', 'button.play');
						playButton.id = checkbox.id + '-playButton';
						Foxtrick.onClick(playButton, makePlayListener(textInput));
						textDiv.appendChild(playButton);
					}
				}
			}

			if (module.OPTION_TEXTS &&
				(!module.OPTION_TEXTS_DISABLED_LIST || !module.OPTION_TEXTS_DISABLED_LIST[i])) {

				textDiv = document.createElement('div');
				textDiv.id = checkbox.id + '-text-div';

				textDiv.setAttribute('depends-on', checkbox.id);
				item.appendChild(textDiv);

				textInput = document.createElement('textarea');
				textInput.id = checkbox.id + '-text';
				textInput.setAttribute('module', module.MODULE_NAME);
				textInput.setAttribute('option', module.OPTIONS[i] + '_text');
				textDiv.appendChild(textInput);
			}
		}
	}

	// radio options
	if (module.RADIO_OPTIONS) {
		var radios = document.createElement('ul');
		radios.id = entry.id + '-radios';
		options.appendChild(radios);

		Foxtrick.forEach(function(rOpt, i) {
			item = document.createElement('li');
			radios.appendChild(item);

			label = document.createElement('label');
			item.appendChild(label);

			var radio = document.createElement('input');
			radio.type = 'radio';
			radio.name = entry.id + '-radio';
			radio.value = i;
			radio.setAttribute('module', module.MODULE_NAME);
			label.appendChild(radio);

			var radioDesc = Foxtrick.Prefs.getModuleDescription(module.MODULE_NAME + '.' + rOpt);
			label.appendChild(document.createTextNode(radioDesc));
		}, module.RADIO_OPTIONS);
	}

	Foxtrick.appendChildren(options, customOptions);

	entry.appendChild(container);
	return entry;
}

/**
 * Create module containers and initialize their attributes
 */
function initModules() {
	var modules = [];
	for (var m in Foxtrick.modules)
		modules.push(Foxtrick.modules[m]);

	// remove modules without categories
	modules = Foxtrick.filter(function(m) {
		return typeof m.MODULE_CATEGORY !== 'undefined';
	}, modules);

	// Sort modules in alphabetical order. Links modules to the end
	var linksRe = /^Links/;
	modules.sort(function(a, b) {
		if (linksRe.test(a.MODULE_NAME)) {
			if (linksRe.test(b.MODULE_NAME))
				return a.MODULE_NAME.localeCompare(b.MODULE_NAME);
			else
				return 1;
		}
		else if (linksRe.test(b.MODULE_NAME))
			return -1;
		else
			return a.MODULE_NAME.localeCompare(b.MODULE_NAME);
	});

	for (var module of modules) {
		var obj = makeModuleDiv(module);
		var $obj = $(obj);

		// show on view-by-category tab
		$obj.attr('x-on', module.MODULE_CATEGORY + 'search all');

		// show on view-by-page tab
		if (module.PAGES) {
			if (Foxtrick.has(module.PAGES, 'all'))
				$obj.attr('x-on', $obj.attr('x-on') + ' universal');
			else if (Foxtrick.intersect(module.PAGES, PAGEIDS).length > 0)
				$obj.attr('x-on', $obj.attr('x-on') + ' on_page');
		}
		$('#pane').append($obj);
	}
}

/**
 * Setup main tab options and listeners
 */
function initMainTab() {
	var desc = $('#pref-setup-desc')[0];
	var ISSUES_URL = 'https://github.com/minj/foxtrick/issues';
	Foxtrick.L10n.appendLink('prefs.setup.desc', desc, ISSUES_URL);

	// add links to main tab prefs
	$('#pane > div[x-on*="main"] h3').each(function() {
		var $this = $(this);
		if ($this.attr('id')) {
			var link = document.createElement('a');
			link.className = 'module-link';
			link.textContent = '¶';
			link.href = generateURI({ id: $this.attr('id') });
			link.title = Foxtrick.L10n.getString('module.link');
			$this.append(link);
		}
	});

	// save preferences
	$('#pref-save-do').click(function() {
		var savePrefs = $('#pref-save-pref').is(':checked');
		var saveNotes = $('#pref-save-data').is(':checked');
		var saveToken = $('#pref-save-token').is(':checked');
		$('#pref-save-text').val(Foxtrick.Prefs.save({
			prefs: savePrefs,
			notes: saveNotes,
			oauth: saveToken,
			defaults: true,
		}));
	});

	// load preferences
	$('#pref-load-do').click(function() {

		Foxtrick.Prefs.load($('#pref-load-text').val());
		$('#pref-load-text').val('');

		window.location.reload();
	});

	// restore to default
	$('#pref-stored-restore').click(function() {
		if (Foxtrick.confirmDialog(Foxtrick.L10n.getString('prefs.restoreDefault.ask'))) {

			Foxtrick.Prefs.restore();

			window.location.reload();
		}
	});

	// delete OAuth token/secret
	$('#pref-delete-token').click(function() {
		var teamId = $('#select-delete-token-teamIds')[0].value;
		var delToken = Foxtrick.L10n.getString('prefs.deleteToken.ask').replace('%s', teamId);
		if (Foxtrick.confirmDialog(delToken)) {
			var keys = Foxtrick.Prefs.getAllKeysOfBranch('oauth.' + teamId);
			for (var key of keys) {
				Foxtrick.Prefs.deleteValue(key);
			}

			window.location.reload();
		}
	});

	// disable all
	$('#pref-stored-disable').click(function() {
		if (Foxtrick.confirmDialog(Foxtrick.L10n.getString('prefs.disableAllModules.ask'))) {

			Foxtrick.log('preferences: disable all');
			Foxtrick.Prefs.disableAllModules();

			window.location.reload();
		}
	});

	// revoke permissions
	$('#pref-revoke-permissions').click(function() {
		if (Foxtrick.confirmDialog(Foxtrick.L10n.getString('prefs.revokePermissions.ask'))) {

			Foxtrick.log('preferences: revoke permissions');
			revokePermissions();

			window.location.reload();
		}
	});

	// clear cache
	$('#pref-stored-clear-cache').click(function() {
		Foxtrick.clearCaches();
		window.location.reload();
	});
}

/**
 * Setup changes tab layout and release notes
 */
function initChangesTab() {
	var lang = Foxtrick.Prefs.getString('htLanguage');

	var changesLink = document.createElement('a');
	changesLink.href = '#tab=changes';
	changesLink.className = 'module-link';
	changesLink.textContent = '¶';
	changesLink.title = Foxtrick.L10n.getString('module.link');
	$('div[x-on*="changes"] > h2').append(changesLink);

	var parseNotes = function(obj) {
		if (!obj) {
			return {};
		}

		var versions;
		for (var locale in obj) {
			// yaml obj has only one property: locale code
			// ignoring it and taking versions sub-property directly
			versions = obj[locale].versions;
		}

		return versions;
	};

	// version format: x.y[.z[.j]]
	// major version format: x.y.z, adds or removes parts as needed
	var getMajorVersion = function(version) {
		var parts = version.split(/\./).slice(0, 3);
		while (parts.length < 3)
			parts.push(0);

		return parts.join('.');
	};

	var isMajorVersion = function(version) {
		var parts = version.split(/\./);
		return parts.length < 4;
	};

	var updateNotepad = function(selected, versionMap, data) {
		var list = $('#pref-notepad-list')[0];
		list.textContent = ''; // clear list

		var versionL10n = Foxtrick.L10n.getString('releaseNotes.version');

		var versions = data.versions;
		var versionsLocalized = data.versionsLocalized;
		var rNotesLinks = data.rNotesLinks;

		var major = getMajorVersion(selected);
		var minorVersions = versionMap[major];

		for (var version of minorVersions) {
			var notes = versions[version];
			if (!notes)
				continue;

			var versionHeader = versionL10n + ' ' + version;
			var isMajor = isMajorVersion(version);
			if (isMajor) {
				// set main title
				$('#pref-notepad-title').text(versionHeader);
			}

			if (!isMajor || minorVersions.length > 1) {
				// add sub-headers where needed
				var header = document.createElement('h4');
				header.textContent = versionHeader;
				list.appendChild(header);
			}

			var notesLocalized = versionsLocalized[version];
			for (var n in notes) {
				var note = notes[n];
				if (notesLocalized && typeof notesLocalized[n] !== 'undefined' &&
				    notesLocalized[n] !== null)
					note = notesLocalized[n];

				if (note) {
					var item = document.createElement('li');
					item.id = 'pref-note-' + version + '-' + n;
					addNote(note, item, rNotesLinks);
					list.appendChild(item);
				}
			}
		}
	};

	var addBetaNote = function(statusText, data) {
		var versions = data.versions;
		var versionsLocalized = data.versionsLocalized;
		var rNotesLinks = data.rNotesLinks;

		// add nightly and beta notes
		for (var version in versions) {
			if (Foxtrick.branch.indexOf(version) !== 0)
				continue;

			var notes = versions[version];
			var notesLocalized = versionsLocalized[version];
			if (!notes)
				continue;

			// README: branch note must always be 'note_0'
			var note = notesLocalized && notesLocalized['note_0'] || notes['note_0'];
			if (!note)
				continue;

			var $note = $('#translator_note');
			var list = $note[0];

			addNote(note, list, rNotesLinks);

			if (version === 'beta')
				$note.append(' ' + statusText);

			$note.attr('style', 'display:block;');
		}
	};

	var addVersions = function(select, versions) {
		var majorVersions = {};
		for (var version in versions) {
			if (!/^\d/.test(version)) {
				// beta / nightly notes
				continue;
			}

			// sort all versions into buckets by major version
			var major = getMajorVersion(version);
			majorVersions[major] = majorVersions[major] || [];
			majorVersions[major].push(version);

			if (!isMajorVersion(version)) {
				// don't add subversions to select box
				continue;
			}

			var item = document.createElement('option');
			item.textContent = version;
			item.value = major; // setting value to major
			select.appendChild(item);
		}

		var currentVersion = getMajorVersion(Foxtrick.version);
		Foxtrick.any(function(opt, i) {
			if (opt.value == currentVersion) {
				select.selectedIndex = i;
				return true;
			}
			return false;
		}, select.options);

		return majorVersions;
	};

	var statusL10n = Foxtrick.L10n.getString('releaseNotes.translationStatus');
	var status = Foxtrick.load(Foxtrick.InternalPath + 'locale/status.json')
		.then(Foxtrick.parseJSON)
		.then(function(statusData) {
			var statusText = '';
			try {
				if (lang !== 'en') {
					var langStatus = Foxtrick.nth(function(item) {
						return item.code == lang;
					}, statusData.status);
					var pctg = langStatus.translated_progress;
					statusText = statusL10n.replace(/%s/, pctg);
				}
			}
			catch (e) {}

			return statusText;
		});

	var rNotesLinks = Foxtrick.load(Foxtrick.InternalPath + 'release-notes-links.yml')
		.then(Foxtrick.parseYAML);

	var rNotesLocalSrc = Foxtrick.InternalPath + 'locale/' + lang + '/release-notes.yml';
	var releaseNotesLocal = Foxtrick.load(rNotesLocalSrc).then(Foxtrick.parseYAML);

	var releaseNotes = Foxtrick.load(Foxtrick.InternalPath + 'release-notes.yml')
		.then(Foxtrick.parseYAML);

	return Promise.all([releaseNotes, releaseNotesLocal, rNotesLinks, status])
		.then(function(resp) {

			var versions = parseNotes(resp[0]);
			var versionsLocalized = parseNotes(resp[1]);
			var rNotesLinks = resp[2];
			var statusText = resp[3];

			if (!versions) {
				Foxtrick.log(new Error('NO RELEASE NOTES!!!'));
				return;
			}

			var data = {
				versions: versions,
				versionsLocalized: versionsLocalized,
				rNotesLinks: rNotesLinks,
			};

			addBetaNote(statusText, data);

			var select = $('#pref-version-release-notes')[0];
			var majorVersions = addVersions(select, versions);

			var update = function() {
				updateNotepad(select.value, majorVersions, data);
			};

			update();
			$(select).change(update);

		}).catch(Foxtrick.catch('changes'));

}

/**
 * Setup help tab and FAQ layout
 * @return {Promise<void>}
 */
function initHelpTab() {
	// external links
	Foxtrick.load(Foxtrick.InternalPath + 'data/foxtrick_about.json')
		.then(function(aboutJSON) {

			/** @type {AboutJSONSchema} */
			// @ts-ignore
			var aboutData = JSON.parse(aboutJSON);
			var category = aboutData.links;

			Foxtrick.forEach(function(a) {
				var item = document.createElement('li');
				$('#external-links-list').append(item);

				var link = document.createElement('a');
				item.appendChild(link);
				link.textContent = Foxtrick.L10n.getString('link.' + a.id);
				link.href = a.href;
				link.relList.add('noopener');
				link.target = '_blank';
			}, category);

		}).catch(Foxtrick.catch('help-external-links'));

	var parseFaq = function(src) {
		if (!src)
			return {};

		for (var locale in src) {
			// yaml obj has only one property: locale code
			// ignoring it and taking faq sub-property directly
			src = src[locale];
		}

		return src.faq;
	};

	var addFAQItem = function(item, itemLocal, i, faqLinks) {
		// container for question and answer
		var block = document.createElement('div');
		block.id = 'faq-' + i;
		block.className = 'module';
		block.setAttribute('x-on', 'help search');
		$('#pane').append(block);

		// question
		var header = document.createElement('h3');
		var question = itemLocal && typeof itemLocal === 'object' && itemLocal.question ?
			itemLocal.question : item.question;

		addNote(question, header, faqLinks);
		block.appendChild(header);

		// link to question
		var link = document.createElement('a');
		link.textContent = '¶';
		link.className = 'module-link';
		link.href = '#faq=' + i;
		header.appendChild(link);

		// answer
		var content = document.createElement('p');
		var answer = itemLocal && typeof itemLocal === 'object' && itemLocal.answer ?
			itemLocal.answer : item.answer;

		addNote(answer, content, faqLinks);

		var container = document.createElement('div');
		container.className = 'module-content';
		container.appendChild(content);
		block.appendChild(container);
	};

	// FAQ (faq.yml or localized locale/code/faq.yml
	var faqLinks = Foxtrick.load(Foxtrick.InternalPath + 'faq-links.yml').then(Foxtrick.parseYAML);
	var faq = Foxtrick.load(Foxtrick.InternalPath + 'faq.yml').then(Foxtrick.parseYAML);

	var lang = Foxtrick.Prefs.getString('htLanguage');
	var faqLocalSrc = Foxtrick.InternalPath + 'locale/' + lang + '/faq.yml';
	var faqLocal = Foxtrick.load(faqLocalSrc).then(Foxtrick.parseYAML);

	return Promise.all([faqLinks, faq, faqLocal]).then(function(resp) {
		var faqLinks = resp[0];
		var items = parseFaq(resp[1]);
		var itemsLocal = parseFaq(resp[2]);

		if (!items) {
			Foxtrick.log(new Error('NO FAQ!!!'));
			return;
		}

		for (var i in items) {
			var item = items[i];

			// prefer localized ones
			var itemLocal = itemsLocal ? itemsLocal[i] : null;

			addFAQItem(item, itemLocal, i, faqLinks);
		}

	}).catch(Foxtrick.catch('help'));
}

/**
 * Setup about page and contributor layout
 * @return {Promise<void>}
 */
function initAboutTab() {
	var addItem = function(person, list) {
		var item = document.createElement('li');

		var id = person.id || null;
		var name = person.name;
		item.appendChild(document.createTextNode(name));

		if (id) {
			item.appendChild(document.createTextNode(' '));
			var link = document.createElement('a');
			link.href = 'https://www.hattrick.org/goto.ashx?path=/Club/Manager/?userId=' + id;
			link.textContent = Foxtrick.format('({})', [id]);
			item.appendChild(link);
		}

		$(list).append(item);
	};

	return Foxtrick.load(Foxtrick.InternalPath + 'data/foxtrick_about.json')
		.then(function(aboutJSON) {

			/** @type {AboutJSONSchema} */
			// @ts-ignore
			var aboutData = JSON.parse(aboutJSON);

			$('.about-list').each(function() {

				var $container = $(this);
				var type = $container.attr('path');

				/** @type {AboutJSONPerson[]|AboutJSONTranslation[]} */
				// @ts-ignore
				var category = aboutData[type];
				Foxtrick.map(function(data) {
					if (type === 'translations') {
						/** @type {unknown} */
						let foo = data;
						let trData = /** @type {AboutJSONTranslation}*/ (foo);
						var item = document.createElement('li');
						var header = document.createElement('h4');
						header.textContent = String(trData.language);
						item.appendChild(header);

						var list = document.createElement('ul');
						item.appendChild(list);

						Foxtrick.map(function(translator) {
							addItem(translator, $(list));
						}, trData.translators);

						$container.append(item);
					}
					else {
						addItem(data, $container);
					}

				// @ts-ignore
				}, category);

			});

		}).catch(Foxtrick.catch('about'));

}

/**
 * Setup all tabs
 * @return {Promise<void[]>}
 */
function initTabs() {
	// attach each tab with corresponding pane
	$('.tabs li a').each(function() {
		var tab = $(this).parent().attr('id').replace(/^tab-/, '');
		$(this).attr('href', generateURI({ tab: tab }));
	});

	// initialize the tabs

	initMainTab();

	var changes = initChangesTab();
	var help = initHelpTab();
	var about = initAboutTab();

	initModules();

	return Promise.all([changes, help, about]);
}

/**
 * Setup localized descriptions, initial option values and option dependencies
 */
function initTextAndValues() {
	if (Foxtrick.L10n.getString('direction') === 'rtl')
		$('html').attr('dir', 'rtl');

	document.title = Foxtrick.L10n.getString('prefs.title');
	$('#version').text(Foxtrick.version + ' ' + Foxtrick.branch);

	// initialize text
	$('body [data-text]').each(function() {
		var $this = $(this);
		if ($this.attr('data-text')) {
			var text = Foxtrick.L10n.getString($this.attr('data-text'));
			var node = document.createTextNode(text);
			$this.prepend(node);
		}
	});

	// initialize modules
	$('#pane [module]').each(function() {
		var $this = $(this);
		var module = $this.attr('module');
		if ($this.attr('option')) {
			// module option
			var option = $this.attr('option');
			if ($this.is(':checkbox')) {
				if (Foxtrick.Prefs.isModuleOptionEnabled(module, option))
					$this.prop('checked', true);
			}
			else if ($this.is(':input')) {
				// text input
				this.value = Foxtrick.Prefs.getString('module.' + module + '.' + option);
			}
		}
		else if ($this.is(':radio')) {
			// radio input
			var selected = Foxtrick.Prefs.getModuleValue(module);
			if ($this.prop('value') == selected)
				$this.prop('checked', true);
		}
		else if (Foxtrick.Prefs.isModuleEnabled(module)) {
			// module itself
			$this.prop('checked', true);
		}
	});

	// initialize inputs
	$('#pane input[pref]').each(function() {
		var $this = $(this);
		if ($this.is(':checkbox')) {
			// checkbox
			if (Foxtrick.Prefs.getBool($this.attr('pref')))
				$this.prop('checked', true);
		}
		else {
			// text input
			$this.attr('value', Foxtrick.Prefs.getString($this.attr('pref')));
		}
	});

	$('#pane textarea[pref]').each(function() {
		var $this = $(this);
		$this.text(Foxtrick.Prefs.getString($this.attr('pref')));
	});

	// initialize elements with blockers, disable if blocker enabled
	$('body [blocked-by]').each(function() {
		var $blockee = $(this);
		var $blocker = $('#' + $blockee.attr('blocked-by'));

		var updateStatus = function() {
			if ($blocker.is(':checked'))
				$blockee.prop('disabled', true);
			else
				$blockee.prop('disabled', false);
		};
		$blocker.click(updateStatus);

		updateStatus();
	});

	// initialize elements with dependency, show only if dependency met
	$('#pane [depends-on]').each(function() {
		var $depender = $(this);
		var $dependee = $('#' + $depender.attr('depends-on'));

		var updateStatus = function() {
			if ($dependee.is(':checked'))
				Foxtrick.removeClass($depender[0], 'hidden');
			else
				Foxtrick.addClass($depender[0], 'hidden');
		};
		$dependee.click(updateStatus);

		updateStatus();
	});

	// TODO: move oAuth and currency setup to initMainTab

	// delete-token description
	var CHPP_URL = Foxtrick.goToUrl('/MyHattrick/Preferences/ExternalAccessGrants.aspx');
	var delDesc = $('#pref-delete-token-desc')[0];
	Foxtrick.L10n.appendLink('prefs.storedData.oauth.delete.desc', delDesc, CHPP_URL);

	// initialize delete-token
	var oauthKeys = Foxtrick.Prefs.getAllKeysOfBranch('oauth');
	if (oauthKeys) {
		var teamIds = Foxtrick.map(function(n) {
			return n.match(/^oauth\.(.+?)\./)[1];
		}, oauthKeys);
		teamIds = Foxtrick.unique(teamIds);

		for (var teamId of teamIds) {
			var id = parseInt(teamId, 10);

			if (!isNaN(id)) {
				var item = document.createElement('option');
				item.value = id;
				item.textContent = id;

				$('#select-delete-token-teamIds').append(item);
			}
			else {
				// delete invalid
				var keys = Foxtrick.Prefs.getAllKeysOfBranch('oauth.' + teamId);
				for (var key of keys) {
					Foxtrick.Prefs.deleteValue(key);
				}
			}
		}
	}

	// initialize currency display
	var currencyKeys = Foxtrick.Prefs.getAllKeysOfBranch('Currency.Code');
	var rmText = Foxtrick.L10n.getString('button.remove');
	Foxtrick.forEach(function(key) {
		var id = parseInt(key.match(/\d+$/), 10);
		if (isNaN(id) || !id) {
			Foxtrick.Prefs.deleteValue(key);
			return;
		}

		var code = Foxtrick.Prefs.getString('Currency.Code.' + id);
		var rate = Foxtrick.util.currency.getRateByCode(code);

		var row = document.createElement('tr');
		row.id = 'team-currency-row-' + id;

		var tdId = row.appendChild(document.createElement('td'));
		var aId = tdId.appendChild(document.createElement('a'));
		aId.href = Foxtrick.goToUrl('/Club/?TeamID=' + id);
		aId.target = '_blank';
		aId.textContent = id;

		row.appendChild(document.createElement('td')).textContent = code;
		row.appendChild(document.createElement('td')).textContent = rate || '-';

		var rmCell = row.appendChild(document.createElement('td'));
		var rmBtn = rmCell.appendChild(document.createElement('button'));
		rmBtn.textContent = rmText;
		rmBtn.dataset.id = id;
		Foxtrick.onClick(rmBtn, function(ev) {
			var id = this.dataset.id;
			Foxtrick.Prefs.deleteValue('Currency.Code.' + id);
			var row = ev.target.ownerDocument.getElementById('team-currency-row-' + id);
			row.parentNode.removeChild(row);
			Foxtrick.Prefs.setBool('preferences.updated', true);
		});

		$('#pref-setup-currency').append(row);

	}, currencyKeys);
}

/**
 * Main pref logic sequence
 */
function init() {
	try {
		initCoreModules();
		getPageIds();

		initTabs().then(function() {

			initSearch();
			initListeners();
			initTextAndValues();

			locateFragment(window.location.href);

			testPermissions();

			$('#spinner').addClass('hidden');
			$('#subheader').removeClass('hidden');
			$('#content').removeClass('hidden');

		}).catch(Foxtrick.catch('Preferences init'));

		// if (Foxtrick.Prefs.isModuleEnabled('MobileEnhancements')) {
		// 	// mobile
		// 	$('.tabs').hide();
		// 	$('#content').addClass('ft-mobile');
		// 	Foxtrick.log(Foxtrick, 'MobileEnhancements');
		// 	Foxtrick.onClick($('#navigation-header')[0], function() {
		// 		$('.tabs').toggle();
		// 		$('#main').toggle();
		// 	});
		// }

		/* Run a test. */
		// if (window.location.href.search(/saved=true/) !== -1) {
		// 	notice(Foxtrick.L10n.getString('prefs.feedback.saved'));
		// 	window.location.href = window.location.href.
		// 		slice(0, window.location.href.search(/\&saved=true/));
		// }
		// else if (window.location.href.search(/imported=true/) !== -1) {
		// 	notice(Foxtrick.L10n.getString('prefs.feedback.loaded'));
		// 	window.location.href = window.location.href.
		// 		slice(0, window.location.href.search(/\&imported=true/));
		// }
	}
	catch (e) {
		Foxtrick.log('Preferences init:', e);
	}
}

/**
 * Start up
 */
function initLoader() {
	var w = document.location.href.match(/width=(\d+)/);
	if (w)
		document.body.setAttribute('style', 'width:' + w[1] + 'px;');

	if (document.URL.startsWith('moz-extension://'))
		$('#main').attr('gecko', ''); // sigh mozilla

	// Fennec runs init() from injected entry.js (injected)
	// called directly, it'll run and save actually for some reason

	// gecko, chrome
	if (Foxtrick.arch === 'Gecko' || Foxtrick.context === 'background') {
		init();
	}
	else {
		// safari prefs runs in content context for some people?!!
		// add needed resources first
		Foxtrick.SB.ext.sendRequest({ req: 'optionsPageLoad' }, (data) => {
			try {
				Foxtrick.entry.contentScriptInit(data);
				init();
			}
			catch (e) {
				Foxtrick.log('initLoader:', e);
			}
		});
	}
}

// this is the preference script entry point for Sandboxed arch
initLoader();
