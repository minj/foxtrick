'use strict';
// page IDs of last page are stored in array pageIds
var pageIds = [];

//used to cache the searchable module items to prevent the search functionality
//from traversing the dom all the time
var _modules = {};

function notice(msg) {
	$('#note-content').text(msg);
	$('#note').show('slow');
}

function baseURI() {
	return window.location.toString().replace(/#.*$/, '');
}

function generateURI(tab, module, id, search) {
	var location = baseURI();
	if (tab)
		return location + '#tab=' + tab;
	else if (module)
		return location + '#module=' + module;
	else if (id)
		return location + '#' + id;
	else if (search)
		return location + '#search=' + search;
}

//feed the search bar with options, no effect yet
function initSearch() {
	var searchadd = function(searchstr, item) {
		if (_modules[searchstr] instanceof Array)
			_modules[searchstr].push(item);
		else if (_modules[searchstr] instanceof Object) {
			var tmp = _modules[searchstr];
			_modules[searchstr] = [];
			_modules[searchstr].push(tmp);
			_modules[searchstr].push(item);
		}
		else
			_modules[searchstr] = item;
	};
	$('.module').each(function() {
		try {
			var savename, h3;
			var name = $(this).attr('id');
			if (name && name.match(/^pref-/)) {
				savename = name.replace(/^pref-/, '');
				searchadd(savename, $('#' + name)[0]);
				//addToModuleList(name.replace(/^pref-/, ''));
			}
			else if (name && name.match(/^faq-/)) {
				h3 = $(this).children('h3:first');
				savename = h3.text().replace('¶', '');
				searchadd(savename, $(this)[0]);
			}
			else {
				h3 = $(this).children('h3:first');
				if (h3.attr('data-text')) {
					name = Foxtrick.L10n.getString(h3.attr('data-text'));
					searchadd(name, $(this)[0]);
				}
				else {
					Foxtrick.log('no search support, missing h3 and/or data-text');
				}
			}
		}
		catch (e) {
			Foxtrick.log('no search support', e);
		}
	});
}

//search
function search(string, perform) {
	if (string.length > 0) {
		$('#breadcrumb-2').show();
		$('#breadcrumb-3').show();
		if (perform) {
			$('#breadcrumb-2').text(Foxtrick.L10n.getString('prefs.search'));
			$('#breadcrumb-3').text(string);
			$('#breadcrumb-3').attr('href', generateURI(null, null, null, string));
			$('#breadcrumb-sep-1').show();
			$('#breadcrumb-sep-2').show();
		}
		else {
			$('#breadcrumb-2').text(string);
			$('#breadcrumb-2').attr('href', generateURI(null, string, null, null));
			$('#breadcrumb-sep-1').show();
			$('#breadcrumb-sep-2').hide();
			$('#breadcrumb-3').hide();
		}

		var regex = new RegExp(string, 'i');

		//iterate pre-cached modules, jquery is slow as hell here, directly using dom methods
		var i;
		for (i in _modules) {
			try {
				if (i.search(regex) > -1) {
					if (_modules[i] instanceof Array) {
						for (var k = 0; k < _modules[i].length; k++) {
							_modules[i][k].className =
								_modules[i][k].className.replace(/hidden/g, '');
						}
					}
					else
						_modules[i].className = _modules[i].className.replace(/hidden/g, '');
				}
				else {
					if (_modules[i] instanceof Array) {
						for (var k = 0; k < _modules[i].length; k++) {
							_modules[i][k].className = _modules[i][k].className + ' hidden';
						}
					}
					else
						_modules[i].className = _modules[i].className + ' hidden';
				}
			}
			catch (e) {
				continue;
			}
		}
	}
	else {
		$('#breadcrumb-2').hide();
		$('#breadcrumb-3').hide();
		$('#breadcrumb-sep-1').hide();
		$('#breadcrumb-sep-2').hide();
		var i;
		for (i in _modules) {
			try {
				if (_modules[i] instanceof Array) {
					for (var k = 0; k < _modules[i].length; k++) {
						_modules[i][k].className = _modules[i][k].className.replace(/hidden/g, '');
					}
				}
				else
					_modules[i].className = _modules[i].className.replace(/hidden/g, '');
			}
			catch (e) {}
		}
	}

}

// see http://tools.ietf.org/html/rfc3986#section-3.5
function parseFragment(fragment) {
	var pairs = String(fragment).split(/&/);
	// key - value pairs use ampersand (&) as delimiter
	var ret = {};
	for (var i = 0; i < pairs.length; ++i) {
		var pair = pairs[i].split(/=/); // key and value are separated by equal sign (=)
		if (pair.length == 2)
			ret[pair[0]] = pair[1];
	}
	return ret;
}


function locateFragment(uri) {
	// show functions
	var showModule = function(module) {
		var moduleObj = $('#pref-' + String(module));
		var category = moduleObj.attr('x-category');
		showTab(category);
		search(module, false); //search
		moduleObj[0].scrollIntoView(true);
	};
	var showTab = function(tab) {
		//mobile start
		if (Foxtrick.Prefs.isModuleEnabled('MobileEnhancements'))
			$('#navigation-header').text(Foxtrick.L10n.getString('tab.' + tab));
		//mobile end
		$('#breadcrumb-1').text(Foxtrick.L10n.getString('tab.' + tab));
		$('#breadcrumb-1').attr('href', generateURI(tab, null, null, null));
		search(''); //search reset
		$('#pane > div').hide();
		$('#tabs > li').removeClass('active');
		$('#tab-' + tab).addClass('active');
		$('#pane > div[x-on*=' + tab + ']').show();
	};
	var showFaq = function(id) {
		showTab('help');
		$('#faq-' + id)[0].scrollIntoView(true);
	};

	// only keep the fragment of URI
	var fragment = (uri.indexOf('#') > -1) ? fragment = uri.replace(/^.+#/, '') : '';
	var param = parseFragment(fragment);
	if (param['module'])
		showModule(param['module']);
	else if (param['tab'])
		showTab(param['tab']);
	else if (param['search']) {
		showTab('all');
		search(param['search'], true);
	}
	else if (param['faq'])
		showFaq(param['faq']);
	else if (param['view-by'] == 'page')
		showTab('on_page');
	else
		showTab('main'); // show the main tab by default

	// adjust tab visibility according to view-by type
	var viewByPage = (param['view-by'] == 'page');
	// add class if view by page, remove class if view by category
	var setClass = function(obj, className) {
		viewByPage ? obj.addClass(className) : obj.removeClass(className);
	};
	// opposite of setClass
	var unsetClass = function(obj, className) {
		viewByPage ? obj.removeClass(className) : obj.addClass(className);
	};
	// set up tab classes
	//setClass($('#view-by-page'), 'active');
	//unsetClass($('#view-by-category'), 'active');
	//for (var i in Foxtrick.moduleCategories)
	//	setClass($('#tab-' + Foxtrick.moduleCategories[i]), 'hide');
	//unsetClass($('#tab-on_page'), 'hide');
	//unsetClass($('#tab-universal'), 'hide');
	$('#tabs li a').each(function() {
		var uri = $(this).attr('href').replace(/&view-by=page/g, '');
		if (viewByPage)
			$(this).attr('href', uri + '&view-by=page');
		else
			$(this).attr('href', uri);
	});

	//mobile start
	if (Foxtrick.Prefs.isModuleEnabled('MobileEnhancements')) {
		$('#tabs').hide();
		$('#main').show();
	}
	//mobile end
}

function searchEvent(ev) {
	if (ev.target.value.length < 4)
		return;
	var here = window.location.toString();
	var there = generateURI('all');
	if (here != there) {
		window.location.href = there;
		locateFragment(window.location.toString());
	}
	search(ev.target.value, true);
}

// permissions management

// check if permissions are granted in init and ask for permission if needed on saving
// that's unsave since we don't check permissions right before asking for them
// but since permission request must be in the click handler and not in a callback
// this seems to be the only way

// should move/get that to the resp. modules
var neededPermissions = [
	{
		modules: ['ExtraShortcuts.No9'],
		types: { origins: ['http://no9-online.de/*'] }
	},
	{
		modules: ['ExtraShortcuts.Latehome'],
		types: { origins: ['http://www.latehome.de/*'] }
	},
	{
		modules: ['EmbedMedia.EmbedModeOEmebed'],
		types: {
			origins: [
				'https://vimeo.com/api/*',
				'https://www.youtube.com/*',
				'https://www.dailymotion.com/services/*'
			]
		}
	},
	{
		modules: ['EmbedMedia.EmbedFlickrImages'],
		types: { origins: ['https://secure.flickr.com/services/oembed/*'] }
	},
	{
		modules: ['EmbedMedia.EmbedDeviantArtImages'],
		types: { origins: ['http://backend.deviantart.com/*'] }
	},
	{
		modules: ['EmbedMedia.EmbedSoundCloud'],
		types: { origins: ['https://soundcloud.com/*'] }
	},
	{
		modules: ['EmbedMedia.EmbedImageshack'],
		types: { origins: ['https://imageshack.us/*'] }
	},
	{
		modules: ['YouthTwins'],
		types: { origins: ['http://*.hattrick-youthclub.org/*'] }
	},
	{
		modules: ['CopyYouth.AutoSendTrainingReportToHY'],
		types: { origins: ['http://*.hattrick-youthclub.org/*'] }
	},
	{
		modules: ['CopyYouth.AutoSendRejectedToHY'],
		types: { origins: ['http://*.hattrick-youthclub.org/*'] }
	},
	{
		modules: ['CopyYouth.AutoSendTrainingChangesToHY'],
		types: { origins: ['http://*.hattrick-youthclub.org/*'] }
	},
	{
		modules: ['YouthSkills'],
		types: { origins: ['http://*.hattrick-youthclub.org/*'] }
	},
	{
		modules: ['MatchWeather'],
		types: { origins: ['http://api.openweathermap.org/*'] }
	}
];

function permissionsMakeIdFromName(module) {
	var id = '#pref-' + module;
	if (id.indexOf('.') == -1)
		id = id + '-check'; // main module check
	else
		id = id.replace(/\./g, '-'); // suboption check
	return id;
}

function getPermission(neededPermission, showSaved) {
	// Permissions must be requested from inside a user gesture, like a button's
	// click handler.
	chrome.permissions.request(neededPermission['types'],
	  function(granted) {
		// The callback argument will be true if the user granted the permissions.
		for (var m = 0; m < neededPermission.modules.length; ++m) {
			var id = permissionsMakeIdFromName(neededPermission.modules[m]);
			if (!granted) {
				$(id).prop('checked', false);
				Foxtrick.Prefs.setBool('module.' + neededPermission.modules[m] + '.enabled', false);
				Foxtrick.log('Permission declined: ', neededPermission.modules[m]);
			}
			else {
				$(id).attr('permission-granted', true);
				Foxtrick.log('Permission granted: ', neededPermission.modules[m]);
			}
			if (showSaved) {
				notice(Foxtrick.L10n.getString('prefs.feedback.saved'));
			}
		}
	});
}

function checkPermissions() {
	var needsPermissions = false;
	// ask for permissions if needed
	if (Foxtrick.platform === 'Chrome') {
		// combine all need permissions into on request
		var combined_permissions = {
			modules: [],
			types: { permissions: [], origins: [] }
		};
		neededPermissions.forEach(function(neededPermission) {
			neededPermission.modules.forEach(function(module, m, modules) {
				var id = permissionsMakeIdFromName(module);
				if (Foxtrick.Prefs.getBool('module.' + module + '.enabled') === true &&
				    $(id).attr('permission-granted') == 'false') {
					needsPermissions = true;
					Foxtrick.pushNew(combined_permissions.modules, modules);
					if (neededPermission.types.permissions)
						Foxtrick.pushNew(combined_permissions.types.permissions,
						                 neededPermission.types.permissions);
					if (neededPermission.types.origins)
						Foxtrick.pushNew(combined_permissions.types.origins,
						                 neededPermission.types.origins);
				}
			});
		});

		getPermission(combined_permissions, true);
	}
	return needsPermissions;
	// false prevents save notived be shown. will be shown delayed in getPermissions
}

function revokePermissions() {
	// removes current permissions
	var revokeModulePermission = function(neededPermission) {
		chrome.permissions.remove(neededPermission['types'],
		  function(result) {
			for (var m = 0; m < neededPermission.modules.length; ++m) {
				var id = permissionsMakeIdFromName(neededPermission.modules[m]);
				$(id).attr('permission-granted', false);
				Foxtrick.log('Permission removed: ', neededPermission.modules[m], result);
			}
		});
	};
	if (Foxtrick.platform === 'Chrome') {
		for (var i = 0; i < neededPermissions.length; ++i) {
			revokeModulePermission(neededPermissions[i]);
		}
	}
}

function testPermissions() {
	// initialize elements which need permissions, ask for permission if needed
	if (Foxtrick.platform === 'Chrome') {
		var makeChecker = function(id, perm, module) {
			return function() {
				checkPermission(id, perm, module);
			};
		};

		var testModulePermission = function(neededPermission) {
			chrome.permissions.contains(neededPermission['types'],
			  function(result) {
				for (var m = 0; m < neededPermission.modules.length; ++m) {
					var module = neededPermission.modules[m];
					var id = permissionsMakeIdFromName(module);
					$(id).attr('permission-granted', result);
					neededPermission.granted = result;
					$(id).click(makeChecker(id, neededPermission, module));

					if (result === false &&
					    Foxtrick.Prefs.getBool('module.' + module + '.enabled')) {
						Foxtrick.pushNew(modulelist, neededPermission.modules);
						var needsPermHtml = Foxtrick.L10n.getString('prefs.needPermissions') +
							'<ul><li>' + modulelist.join('</li><li>') + '</li></ul>';
						$('#alert-text').html(needsPermHtml);
						$('#alert').attr('style', 'display:block;');
					}
				}
			});
		};
		var checkPermission = function(id, neededPermission, module) {
			if ($(id).prop('checked') &&
			    $(id).attr('permission-granted') == 'false')
				getPermission(neededPermission);
			else if (!$(id).prop('checked')) {
				modulelist = Foxtrick.exclude(modulelist, module);
				if (modulelist.length > 0) {
					var needsPermText = Foxtrick.L10n.getString('prefs.needPermissions') +
						' ' + modulelist.join(', ');
					$('#alert-text').text(needsPermText);
					$('#alert').attr('style', 'display:block;');
				}
				else {
					$('#alert-text').text('');
					$('#alert').attr('style', 'display:none;');
				}
			}
		};
		var modulelist = [];
		for (var i = 0; i < neededPermissions.length; ++i) {
			testModulePermission(neededPermissions[i]);
		}
	}
}

function saveEvent(ev) {
	Foxtrick.log('save');
	var pref;
	if ($(ev.target).attr('pref')) {
		pref = $(ev.target).attr('pref');

		if ($(ev.target).is(':checkbox'))
			Foxtrick.Prefs.setBool(pref, $(ev.target).is(':checked'));
		else if ($(ev.target)[0].nodeName.toLowerCase() == 'select')
			Foxtrick.Prefs.setString(pref, $(ev.target)[0].value);
			// calculated just-in-time, so .attr('value') would fail here
		else if ($(ev.target).is(':input'))
			Foxtrick.Prefs.setString(pref, $(ev.target)[0].value);
	}
	else if ($(ev.target)[0].nodeName.toLowerCase() == 'option') {
		pref = $($(ev.target)[0]).parent().attr('pref');
		var value = $(ev.target)[0].value;
		Foxtrick.Prefs.setString(pref, $(ev.target)[0].value);
	}
	else {
		var module = $(ev.target).attr('module');
		if ($(ev.target).attr('option')) {
			Foxtrick.log('option of module');
			// option of module
			var option = $(ev.target).attr('option');
			if ($(ev.target).is(':checkbox'))
				Foxtrick.Prefs.
					setModuleEnableState(module + '.' + option, $(ev.target).is(':checked'));
			else if ($(ev.target).is(':input'))
				Foxtrick.Prefs.setModuleOptionsText(module + '.' + option, $(ev.target)[0].value);
		}
		else if ($(ev.target).is(':radio')) {
			if ($(ev.target).is(':checked'))
				Foxtrick.Prefs.setModuleValue(module, $(ev.target).prop('value'));
		}
		else {
			Foxtrick.Prefs.setModuleEnableState(module, $(ev.target).is(':checked'));
			Foxtrick.log('setModuleEnableState');
		}
	}
	Foxtrick.Prefs.setBool('preferences.updated', true);
}
function save() {
	var needsPermissions = checkPermissions();

	if (!needsPermissions)
		notice(Foxtrick.L10n.getString('prefs.feedback.saved'));
	// else it is shown in permission request callback

	Foxtrick.Prefs.setBool('preferences.updated', true);
}

/**
 * Parse and add a note containing whitelisted HTML
 * markup and custom, predefined linkTags.
 * @param {String} note  Raw note to be parsed.
 * @param {DOMElement} parent    Element to add the note to.
 * @param {Object} links A map containing custom linkTags and their corresponding URLs.
 */
function addNote(note, parent, links)
{
	/**
	 * Create a white-listed tag or fall back to createLink
	 * @param  {String} tagName    Name of the tag or link.
	 * @param  {String} tagContent Text content of the tag.
	 *                             Some tags may have other tags in them.
	 * @return {DOMElement}        Element created.
	 */
	var createTag = function(tagName, tagContent) {
		/**
		 * Create specific DOM elements. This should be called for white-listed elements only.
		 * @param  {String}     nodeName    Name of the element to create.
		 * @param  {String}     textContent Text content of the element.
		 * @param  {[Object]}   options     Map of properties and values of the element.
		 * @return {DOMElement}             Element created.
		 */
		var createNode = function(nodeName, textContent, options) {
			var opt;
			var node = document.createElement(nodeName);
			if (textContent !== null)
				node.textContent = textContent;
			if (options !== undefined && typeof(options) === 'object')
				for (opt in options)
					if (options.hasOwnProperty(opt))
						node[opt] = options[opt];
			return node;
		};
		var createNestedNode = function(nodeName, tagContent, options) {
			var el = createNode(nodeName, null, options);
			addNote(tagContent, el, links);
			// recursively parse and add content to nodes with nesting enabled
			return el;
		};
		var createLink = function(linkName, linkText) {
			if (typeof(links) === 'object' && links.hasOwnProperty(linkName)) {
				if (linkName.search('FTlink') === 0)
					// links starting with 'FTlink' are assumed to be internal
					// and open in the same tab
					return createNode('a', linkText, { href: links[linkName] });
				else
					return createNode('a', linkText, { href: links[linkName], target: '_blank' });
			}
			else
				// default to creating text nodes so no evil tags are actually rendered
				return document.createTextNode(linkText);
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
				return createNestedNode('h5', tagContent); //TODO change header if needed
			default:
				// defaults to links with predefined URLs, e. g. <linkHome>
				return createLink(tagName, tagContent);
		}
	};

	if (note === '')
		return;

	var noteContainer = document.createDocumentFragment();
	// create a container to add all nodes before appending them to DOM in one go

	var noteTokens =
		note.match(/<(\w+)>[\s\S]*?<\/\1>|[\s\S]+?(?=<(\w+)>[\s\S]*?<\/\2>|$)/mg);
	// tokenize into text and outer tags, nesting will be dealt with recursion
	// allow only word characters for tag names and match only properly paired tags
	// tags have no attributes and are thus safe
	var tagRegex = /^<(\w+)>([\s\S]*?)<\/\1>$/m;
	noteTokens.forEach(function(token) {
		if (tagRegex.test(token)) {
			var tag = tagRegex.exec(token);
			// 0: whole token, 1: tagName, 2: tagContent
			noteContainer.appendChild(createTag(tag[1], tag[2]));
		}
		else
			noteContainer.appendChild(document.createTextNode(token));
	});
	parent.appendChild(noteContainer);
}

function initCoreModules() {
	// add MODULE_NAME to modules
	var i;
	for (i in Foxtrick.modules)
		Foxtrick.modules[i].MODULE_NAME = i;

	// core functions needed for preferences, localization, etc.
	var core = [Foxtrick.Prefs, Foxtrick.L10n, Foxtrick.XMLData];
	for (var i = 0; i < core.length; ++i)
		if (typeof(core[i].init) == 'function')
			core[i].init();
}

function initAutoSaveListeners() {
	// save on click/input
	$('#pane input').each(function() {
		if ($(this).attr('savelistener'))
			return;
		$(this).attr('savelistener', 'true');
		if ($(this).is(':checkbox')) {
			$(this).click(function(ev) { saveEvent(ev); });
		}
		else if ($(this)[0].nodeName.toLowerCase() == 'select') {
			$(this)[0].addEventListener('change', saveEvent, false);
		}
		else if ($(this).is(':input')) {
			$(this)[0].addEventListener('input', saveEvent, false);
			$(this)[0].addEventListener('change', saveEvent, false);
		}
		else {
			$(this).attr('savelistener', 'false');
		}
	});
	$('#pane select').each(function() {
		if ($(this).attr('savelistener'))
			return;
		$(this).attr('savelistener', 'true');
		$(this).click(function(ev) { saveEvent(ev); });
	});
	$('#pane textarea').each(function() {
		if ($(this).attr('savelistener'))
			return;
		$(this)[0].addEventListener('input', saveEvent, false);
		$(this).attr('savelistener', 'false');
	});
}

function initListeners() {
	initAutoSaveListeners();

	$('#search-input')[0].addEventListener('input', searchEvent, false);
	$('#save').click(function() { save(); $('#alert').attr('style', 'display:none;'); });
	$('body').click(function(ev) {
		if (ev.target.nodeName.toLowerCase() == 'a' ||
		    ev.target.nodeName.toLowerCase() == 'xhtml:a') {
			if ((ev.target.href.indexOf(baseURI()) === 0 ||
			    ev.target.getAttribute('href')[0] == '#')) {
				locateFragment(ev.target.href);
			}
			else if (ev.target.getAttribute('href').indexOf('http://www.hattrick.org') === 0) {
				// we redirect links starting with
				// 'http://www.hattrick.org' to last Hattrick host
				var url =
					ev.target.href.replace(/^http:\/\/www\.hattrick\.org/, Foxtrick.getLastHost());
				ev.target.setAttribute('href', url);
			}
		}
	});
}

// get page IDs in Foxtrick.ht_pages that last page matches and store them
// in pageIds
function getPageIds() {
	var lastPage = Foxtrick.getLastPage();
	var i;
	for (i in Foxtrick.ht_pages) {
		// ignore PAGE all, it's shown in universal tab
		if (i == 'all')
			continue;
		if (Foxtrick.isPageHref(Foxtrick.ht_pages[i], lastPage))
			pageIds.push(i);
	}
}


function getModule(module) {
	var getScreenshot = function(link) {
		var a = document.createElement('a');
		a.className = 'screenshot';
		a.href = link;
		a.title = Foxtrick.L10n.getString('module.screenshot');
		a.setAttribute('target', '_blank');
		return a;
	};

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
	link.href = generateURI(null, module.MODULE_NAME);
	link.title = Foxtrick.L10n.getString('module.link');
	title.appendChild(link);

	// screenshot (disabled until we get them hosted/prefarably redone again)
	var screenshotLink = Foxtrick.L10n.getScreenshot(module.MODULE_NAME);
	if (false && screenshotLink)
		title.appendChild(getScreenshot(screenshotLink));

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
	var customCoptions = [];
	if (typeof(module.OPTION_FUNC) == 'function') {
		var genOptions = module.OPTION_FUNC(document, initAutoSaveListeners);
		if (genOptions) {
			if ($.isArray(genOptions)) {
				for (var field = 0; field < genOptions.length; ++field)
					customCoptions.push(field);
			}
			else
				customCoptions.push(genOptions);
		}
	}

	var item;

	// checkbox options
	if (module.OPTIONS) {
		var checkboxes = document.createElement('ul');
		options.appendChild(checkboxes);
		checkboxes.id = module.MODULE_NAME + '-checkboxes';

		var appendOptionToList = function(key, list) {
			item = document.createElement('li');
			list.appendChild(item);
			var label = document.createElement('label');
			item.appendChild(label);
			checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.setAttribute('module', module.MODULE_NAME);
			label.appendChild(checkbox);

			var desc = Foxtrick.Prefs.getModuleElementDescription(module.MODULE_NAME, key);
			checkbox.id = entry.id + '-' + key;
			checkbox.setAttribute('option', key);
			label.appendChild(document.createTextNode(desc));

			// screenshot
			var screenshotLink = Foxtrick.L10n.getScreenshot(module.MODULE_NAME + '.' + key);
			if (false && screenshotLink)
				label.appendChild(getScreenshot(screenshotLink));
		};

		var appendOptionsArrayToList = function(optionsarray, parentlist) {
			for (var k = 0; k < optionsarray.length; ++k) {
				if (k == 1) {
					item = document.createElement('li');
					parentlist.appendChild(item);
					parentlist = document.createElement('ul');
					parentlist.setAttribute('depends-on', entry.id + '-' + optionsarray[0]);
					item.appendChild(parentlist);
					parentlist.id = module.MODULE_NAME + '-' +
						optionsarray[0] + '-checkboxes';
				}

				if (optionsarray[k] instanceof Array)
					appendOptionsArrayToList(optionsarray[k], parentlist);
				else
					appendOptionToList(optionsarray[k], parentlist);
			}
		};
		var makeTextListener = function(input) {
			return function(text) {
				input.value = text;
				input.dispatchEvent(new Event('input'));
			};
		};
		var makePlayListener = function(input) {
			return function() {
				Foxtrick.playSound(input.value, this.ownerDocument);
			};
		};

		var makeDataListener = function(input, isSound) {
			return function(url) {
				input.value = url;
				input.dispatchEvent(new Event('change'));
				if (isSound)
					Foxtrick.playSound(url, input.ownerDocument);
			};
		};


		for (var i = 0; i < module.OPTIONS.length; ++i) {
			var checkbox, textDiv, textInput;

			//supereasy way to create subgroups for options, just supply an array
			//first element will toggle visibility for entries 1->n
			//supports nested subgroups
			if (module.OPTIONS[i] instanceof Array) {
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
					load = Foxtrick.util.load.
							filePickerForText(document, makeTextListener(textInput));
					textDiv.appendChild(load);
				}
				if (module.OPTION_EDITS_DATAURL_LOAD_BUTTONS &&
				    module.OPTION_EDITS_DATAURL_LOAD_BUTTONS[i]) {

					var isSound = module.OPTION_EDITS_DATAURL_IS_SOUND &&
						module.OPTION_EDITS_DATAURL_IS_SOUND[i];

					load = Foxtrick.util.load.
						filePickerForDataUrl(document, makeDataListener(textInput, isSound));
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

		for (var i = 0; i < module.RADIO_OPTIONS.length; ++i) {
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
			label.appendChild(document.createTextNode(
				Foxtrick.Prefs.getModuleDescription(module.MODULE_NAME + '.' +
				                                   module.RADIO_OPTIONS[i])));
		}
	}

	for (var i = 0; i < customCoptions.length; ++i) {
		options.appendChild(customCoptions[i]);
	}
	entry.appendChild(container);
	return entry;
}

function initModules() {
	var modules = [], i;
	for (i in Foxtrick.modules)
		modules.push(Foxtrick.modules[i]);
	// remove modules without categories
	modules = Foxtrick.filter(function(m) {
		return m.MODULE_CATEGORY !== undefined;
	}, modules);
	// sort modules in alphabetical order. Links modules to the end
	modules.sort(function(a, b) {
		if (a.MODULE_NAME.search(/Links/) === 0)
			if (b.MODULE_NAME.search(/Links/) === 0)
				return a.MODULE_NAME.localeCompare(b.MODULE_NAME);
			else
				return 1;
		else if (b.MODULE_NAME.search(/Links/) === 0)
			return -1;
		else
			return a.MODULE_NAME.localeCompare(b.MODULE_NAME);
	});

	for (var i = 0; i < modules.length; ++i) {
		var module = modules[i];
		var obj = getModule(module);
		// show on view-by-category tab
		$(obj).attr('x-on', module.MODULE_CATEGORY + ' all');
		// show on view-by-page tab
		if (module.PAGES) {
			if (Foxtrick.has(module.PAGES, 'all'))
				$(obj).attr('x-on', $(obj).attr('x-on') + ' universal');
			else if (Foxtrick.intersect(module.PAGES, pageIds).length > 0)
				$(obj).attr('x-on', $(obj).attr('x-on') + ' on_page');
		}
		$('#pane').append(obj);
	}
}

function initMainTab() {
	// setup
	var gcUrl = '<a href="https://code.google.com/p/foxtrick/issues/list" ' +
		'target="_blank">$1</a>';
	var desc = Foxtrick.L10n.getString('prefs.setup.desc').replace(/{(.+)}/, gcUrl);
	$('#pref-setup-desc').html(desc);

	// add links to main tab prefs
	$('#pane > div[x-on*="main"] h3').each(function() {
		if ($(this).attr('id')) {
			var link = document.createElement('a');
			link.className = 'module-link';
			link.textContent = '¶';
			link.href = generateURI(null, null, $(this).attr('id'));
			link.title = Foxtrick.L10n.getString('module.link');
			$(this).append($(link));
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
			defaults: true
		}));
	});

	// load preferences
	$('#pref-load-do').click(function() {
		Foxtrick.Prefs.load($('#pref-load-text').val());
		$('#pref-load-text').val('');
		window.location.href = window.location.href + '&imported=true';
		window.location.reload();
	});

	// restore to default
	$('#pref-stored-restore').click(function() {
		if (Foxtrick.confirmDialog(Foxtrick.L10n.getString('prefs.restoreDefault.ask'))) {
			Foxtrick.Prefs.cleanupBranch();
			window.location.href = window.location.href + '&imported=true';
			window.location.reload();
		}
	});

	// delete OAuth token/secret
	$('#pref-delete-token').click(function() {
		var teamid = $('#select-delete-token-teamids')[0].value;
		var delToken = Foxtrick.L10n.getString('prefs.deleteToken.ask').replace('%s', teamid);
		if (Foxtrick.confirmDialog(delToken)) {
			var array = Foxtrick.Prefs.getAllKeysOfBranch('oauth.' + teamid);
			for (var i = 0; i < array.length; i++) {
				Foxtrick.Prefs.deleteValue(array[i]);
			}
			window.location.href = window.location.href + '&imported=true';
			window.location.reload();
		}
	});

	// disable all
	$('#pref-stored-disable').click(function() {
		if (Foxtrick.confirmDialog(Foxtrick.L10n.getString('prefs.disableAllModules.ask'))) {
			Foxtrick.log('preferences: diable all');
			Foxtrick.Prefs.disableAllModules();
			window.location.href = window.location.href + '&imported=true';
			window.location.reload();
		}
	});

	// revoke permissions
	$('#pref-revoke-permissions').click(function() {
		if (Foxtrick.confirmDialog(Foxtrick.L10n.getString('prefs.revokePermissions.ask'))) {
			Foxtrick.log('preferences: revoke permissions');
			revokePermissions();
		}
	});

	// clear cche
	$('#pref-stored-clear-cache').click(function() {
		Foxtrick.sessionDeleteBranch('');
		Foxtrick.localDeleteBranch('');
		//Foxtrick.util.api.clearCache();
		window.location.reload();
	});
}

function initChangesTab() {
	var changesLink = document.createElement('a');
	changesLink.href = '#tab=changes';
	changesLink.className = 'module-link';
	changesLink.textContent = '¶';
	changesLink.title = Foxtrick.L10n.getString('module.link');
	$('div[x-on*="changes"] > h3')[0].appendChild(changesLink);

	var lang = Foxtrick.Prefs.getString('htLanguage');

	var releaseNotesLinks =
		Foxtrick.util.load.ymlSync(Foxtrick.InternalPath + 'release-notes-links.yml');

	var releaseNotesLocalized =
		Foxtrick.util.load.ymlSync(Foxtrick.InternalPath + 'locale/' +
		                           lang + '/release-notes.yml');
	var releaseNotes =
		Foxtrick.util.load.ymlSync(Foxtrick.InternalPath + 'release-notes.yml');

	if (releaseNotesLinks === null ||
	    releaseNotesLocalized === null || releaseNotes === null) {
		Foxtrick.log('Release notes failed');
		return;
	}

	var status = Foxtrick.util.load.sync(Foxtrick.InternalPath + 'locale/status.json');
	var statusJSON = JSON.parse(status);

	var statusText = '';
	try {
		if (lang != 'en') {
			var category = statusJSON.status;
			var st = Foxtrick.nth(function(item) {
				return item.code == lang;
			}, category).translated_progress;
			statusText =
				Foxtrick.L10n.getString('releaseNotes.translationStatus').replace(/%s/, st);
		}
	}
	catch (e) {}

	var versions = {};
	var versionsLocalized = {};

	var parseNotes = function(json, dest) {
		if (!json) {
			dest = {};
			return;
		}
		var locale, v, n, idx, rawVersions, prefixedNotes;
		for (locale in json)
			if (json.hasOwnProperty(locale))
				rawVersions = json[locale].versions;
		for (v in rawVersions) {
			prefixedNotes = rawVersions[v];
			notes = [];
			for (n in prefixedNotes) {
				//idx = n.match(/\d+/);
				notes[n] = prefixedNotes[n];
			}
			dest[v] = notes;
		}
	};
	parseNotes(releaseNotes, versions);
	parseNotes(releaseNotesLocalized, versionsLocalized);

	if (!versions) {
		Foxtrick.error('NO RELEASE NOTES!!!');
		return;
	}

	// add nightly and beta notes
	var i, version;
	for (i in versions) {
		version = i;
		if (Foxtrick.branch().indexOf(version) !== -1) {
			var notes = versions[version];
			var notesLocalized = versionsLocalized[version];
			if (!notes)
				continue;
			var list = $('#translator_note')[0];
			// IMPORTANT!!! branch note must always be 'note_0'
			var note = (notesLocalized && notesLocalized['note_0']) || notes['note_0'];
			addNote(note, list, releaseNotesLinks);
			$('#translator_note').attr('style', 'display:block;');
			if (version == 'beta')
				$('#translator_note').append(statusText);
		}
	}

	var select = $('#pref-version-release-notes')[0];
	for (i in versions) {
		// unique version name
		version = i;
		// not beta / nightly notes
		if (version.search(/^\d/) == -1)
			continue;
		// don't add subversions
		if (version.search(/\d\.\d\.\d\.\d/) != -1)
			continue;
		// localized version name
		// search by:
		// 1. localized-version in localized release notes
		// 2. localized-version in master release notes
		// 3. version as fall-back
		/*var localizedVersion = (versionsLocalized[version] &&
			versionsLocalized[version].getAttribute('localized-version'))
			|| (versions[version] && versions[version].getAttribute('localized-version'))
			|| version; */
		var item = document.createElement('option');
		item.textContent = version; //localizedVersion;
		item.value = version;
		select.appendChild(item);
	}

	var updateNotepad = function() {
		var version = select.value.replace(/(\d\.\d\.\d)\.\d/, '$1');
		var list = $('#pref-notepad-list')[0];
		list.textContent = ''; // clear list
		for (var j = 10; j >= -1; --j) {
			var sub = (j != -1) ? ('.' + j) : '';
			for (var k = 10; k >= -1; --k) {
				var subsub = (k != -1) ? ('.' + k) : '';
				if (j == -1 && k > -1)
					continue;
				var notes = versions[version + sub + subsub];
				var notesLocalized = versionsLocalized[version + sub + subsub];
				if (!notes)
					continue;
				$('#pref-notepad-title')[0].textContent =
					Foxtrick.L10n.getString('releaseNotes.version') + ' ' +
						version + sub + subsub;

				for (var i in notes) {
					note = notes[i];
					if (notesLocalized && typeof notesLocalized[i] !== 'undefined' &&
					    notesLocalized[i] !== null)
						note = notesLocalized[i];
					if (note) {
						var item = document.createElement('li');
						item.id = 'pref-note-' + version + sub + subsub + '-' + i;
						addNote(note, item, releaseNotesLinks);
						list.appendChild(item);
					}
				}
			}
		}
	};

	var currentVersion = Foxtrick.version().replace(/(\d\.\d\.\d)\.\d/, '$1');
	for (var i = 0; i < select.options.length; ++i) {
		if (select.options[i].value == currentVersion) {
			select.selectedIndex = i;
			break;
		}
	}

	updateNotepad();
	$(select).change(updateNotepad);
}

function initHelpTab() {
	// external links
	var about = Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/foxtrick_about.json');
	var aboutJSON = JSON.parse(about);
	var category = aboutJSON.links;
	Foxtrick.map(function(a) {
		var item = document.createElement('li');
		$('#external-links-list').append($(item));
		var link = document.createElement('a');
		item.appendChild(link);
		link.textContent = Foxtrick.L10n.getString('link.' + a.id);
		link.href = a.href;
	}, category);

	// FAQ (faq.yml or localized locale/code/faq.yml
	var faqLinks = Foxtrick.util.load.ymlSync(Foxtrick.InternalPath + 'faq-links.yml');
	var faq = Foxtrick.util.load.ymlSync(Foxtrick.InternalPath + 'faq.yml');
	var faqLocal =
		Foxtrick.util.load.ymlSync(Foxtrick.InternalPath + 'locale/' +
		                           Foxtrick.Prefs.getString('htLanguage') + '/faq.yml');
	var items = {};
	var itemsLocal = {};
	var parseFaq = function(src, dest) {
		if (!src)
			return;
		var i, item, locale;
		for (locale in src)
			if (src.hasOwnProperty(locale))
				src = src[locale];
		var items = src.faq;
		for (i in items) {
			item = items[i];
			dest[i] = item;
		}
	};
	parseFaq(faq, items);
	parseFaq(faqLocal, itemsLocal);

	if (!items) {
		Foxtrick.error('NO FAQ!!!');
		return;
	}

	var i, item;
	for (i in items) {
		// we prefer localized ones
		var itemLocal = (itemsLocal) ? itemsLocal[i] : null;
		item = items[i];
		// container for question and answer
		var block = document.createElement('div');
		block.id = 'faq-' + i;
		block.className = 'module';
		block.setAttribute('x-on', 'help all');
		$('#pane').append($(block));
		// question
		var header = document.createElement('h3');
		var question = (typeof itemLocal === 'object' && itemLocal.question) ?
			itemLocal.question : item.question;
		addNote(question, header, faqLinks);
		block.appendChild(header);

		var container = document.createElement('div');
		container.className = 'module-content';

		// link to question
		var link = document.createElement('a');
		link.textContent = '¶';
		link.className = 'module-link';
		link.href = '#faq=' + i;
		header.appendChild(link);
		// answer
		var content = document.createElement('p');
		// import child nodes one by one as we may use XHTML there
		var answer = (typeof itemLocal === 'object' && itemLocal.answer) ?
			itemLocal.answer : item.answer;

		addNote(answer, content, faqLinks);
		container.appendChild(content);
		block.appendChild(container);
	}
}

function initAboutTab()
{
	var about = Foxtrick.util.load.sync(Foxtrick.InternalPath + 'data/foxtrick_about.json');
	var aboutJSON = JSON.parse(about);

	var addItem = function(person, list) {
		var item = document.createElement('li');
		var id = person.hasOwnProperty('id') ? person.id : null;
		var name = person.name;
		item.appendChild(document.createTextNode(name));
		if (id) {
			item.appendChild(document.createTextNode(' '));
			var link = document.createElement('a');
			link.href = 'http://www.hattrick.org/Club/Manager/?userId=' + id;
			link.textContent = '(%s)'.replace(/%s/, id);
			item.appendChild(link);
		}
		list.append($(item));
	};

	$('.about-list').each(function() {

		var type = $(this).attr('path');
		var container = this;

		var category = aboutJSON[type];
		Foxtrick.map(function(data) {
			if (type == 'translations') {
				var item = document.createElement('li');
				var language = data.language;
				var header = document.createElement('h4');
				header.textContent = language;
				item.appendChild(header);
				var list = document.createElement('ul');
				item.appendChild(list);
				Foxtrick.map(function(translator) {
					addItem(translator, $(list));
				}, data.translators);
				$(container).append($(item));
			}
			else {
				addItem(data, $(container));
			}
		}, category);

	});
}

function initTabs() {
	// attach each tab with corresponding pane
	$('#tabs li a').each(function() {
		var tab = $(this).parent().attr('id').replace(/^tab-/, '');
		$(this).attr('href', generateURI(tab));
	});
	// set up href of 'view by' links
	$('#view-by-category a').attr('href', '#view-by=category');
	$('#view-by-page a').attr('href', '#view-by=page');
	// initialize the tabs
	initMainTab();
	initChangesTab();
	initHelpTab();
	initAboutTab();
	initModules();
}

function initTextAndValues() {
	var locale = Foxtrick.Prefs.getString('htLanguage');

	if (Foxtrick.L10n.getString('direction') == 'rtl')
		$('html').attr('dir', 'rtl');

	document.title = Foxtrick.L10n.getString('prefs.title');
	$('#version').text(Foxtrick.version() + ' ' + Foxtrick.branch());

	// initialize text
	$('body [data-text]').each(function() {
		if ($(this).attr('data-text')) {
			var text = Foxtrick.L10n.getString($(this).attr('data-text'));
			var node = document.createTextNode(text);
			$(this).prepend(node);
		}
	});

	// initialize modules
	$('#pane [module]').each(function() {
		var module = $(this).attr('module');
		if ($(this).attr('option')) {
			var option = $(this).attr('option');
			// module option
			if ($(this).is(':checkbox')) {
				if (Foxtrick.Prefs.isModuleOptionEnabled(module, option))
					$(this).prop('checked', true);
			}
			else if ($(this).is(':input')) // text input
				$(this)[0].value = Foxtrick.Prefs.getString('module.' + module + '.' + option);
		}
		else if ($(this).is(':radio')) {
			// radio input
			var selected = Foxtrick.Prefs.getModuleValue(module);
			if ($(this).prop('value') == selected)
				$(this).prop('checked', true);
		}
		else if (Foxtrick.Prefs.isModuleEnabled(module)) // module itself
			$(this).prop('checked', true);
	});
	// initialize inputs
	$('#pane input[pref]').each(function() {
		if ($(this).is(':checkbox')) {
			// checkbox
			if (Foxtrick.Prefs.getBool($(this).attr('pref')))
				$(this).prop('checked', true);
		}
		else {
			// text input
			$(this).attr('value', Foxtrick.Prefs.getString($(this).attr('pref')));
		}
	});
	$('#pane textarea[pref]').each(function() {
		$(this).text(Foxtrick.Prefs.getString($(this).attr('pref')));
	});
	// initialize elements with blockers, disable if blocker enabled
	$('body [blocked-by]').each(function() {
		var blockee = $(this);
		var blocker = $('#' + blockee.attr('blocked-by'));
		var updateStatus = function() {
			if (blocker.is(':checked'))
				blockee.prop('disabled', true);
			else
				blockee.prop('disabled', false);
		};
		blocker.click(function() { updateStatus(); });
		updateStatus();
	});
	// initialize elements with dependency, show only if dependency met
	$('#pane [depends-on]').each(function() {
		var depender = $(this);
		var dependee = $('#' + depender.attr('depends-on'));
		var updateStatus = function() {
			if (dependee.is(':checked'))
				Foxtrick.removeClass(depender[0], 'hidden');
			else
				Foxtrick.addClass(depender[0], 'hidden');
		};
		dependee.click(function() { updateStatus(); });
		updateStatus();
	});

	// show page IDs in view-by-page
	$('#view-by-page a').text($('#view-by-page a').text() + ' (' + pageIds.join(', ') + ')');

	// initialize delete-token
	var chpp_url = Foxtrick.Prefs.getString('last-host') +
		'/MyHattrick/Preferences/ExternalAccessGrants.aspx';
	var delDesc = $('#pref-delete-token-desc').text().
		replace(/\{(.+)\}/, '<a href="' + chpp_url + '" target="_blank">$1</a>');
	$('#pref-delete-token-desc').html(delDesc);
	var oauth_keys = Foxtrick.Prefs.getAllKeysOfBranch('oauth');
	if (oauth_keys) {
		var teamids = Foxtrick.map(function(n) {
			return n.match(/oauth\.(.+)\.accessToken/)[1];
		}, oauth_keys);
		teamids = Foxtrick.unique(teamids);
		for (var i = 0; i < teamids.length; ++i) {
			var id = parseInt(teamids[i], 10);
			if (!isNaN(id)) {
				var item = document.createElement('option');
				item.value = id;
				item.textContent = id;
				$('#select-delete-token-teamids').append($(item));
			}
			else {
				// delete invalid
				var array = Foxtrick.Prefs.getAllKeysOfBranch('oauth.' + teamids[i]);
				for (var j = 0; j < array.length; j++) {
					Foxtrick.Prefs.deleteValue(array[j]);
				}
			}
		}
	}
}

function init() {
	try {
		$('body').hide();
		initCoreModules();
		getPageIds();
		initTabs();
		initSearch();    // important, run after module divs have been created (initTabs)
		initListeners(); // important, run after module divs have been created (initTabs)
		initTextAndValues();
		locateFragment(window.location.toString()); // locate element by fragment
		testPermissions();
		$('body').show();

		// mobile
		if (Foxtrick.Prefs.isModuleEnabled('MobileEnhancements')) {
			$('#tabs').hide();
			$('#content').addClass('ft-mobile');
			Foxtrick.log(Foxtrick, 'MobileEnhancements');
			Foxtrick.onClick($('#navigation-header')[0], function() {
				$('#tabs').toggle();
				$('#main').toggle();
			});
		}

		/* Run a test. */
		if (window.location.href.search(/saved=true/) !== -1) {
			notice(Foxtrick.L10n.getString('prefs.feedback.saved'));
			window.location.href = window.location.href.
				substr(0, window.location.href.search(/\&saved=true/));
		}
		else if (window.location.href.search(/imported=true/) !== -1) {
			notice(Foxtrick.L10n.getString('prefs.feedback.loaded'));
			window.location.href = window.location.href.
				substr(0, window.location.href.search(/\&imported=true/));
		}
	}
	catch (e) {
		Foxtrick.log('init: ', e);
	}
}

function initLoader() {
	var w = document.location.href.match(/width=(\d+)/);
	if (w)
		document.getElementsByTagName('body')[0].setAttribute('style', 'width:' + w[1] + 'px;');

	// fennec runs init() from injected entry.js (injected)
	// called directly, it'll run and save actually for some reason

	// gecko, safari, chrome
	if (Foxtrick.arch === 'Gecko' || Foxtrick.chromeContext() === 'background')
		init();
}
// this is the preference script entry point for sandboxed arch
initLoader();
