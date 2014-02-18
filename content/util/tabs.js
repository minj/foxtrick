'use strict';
if (!Foxtrick) var Foxtrick = {};
if (!Foxtrick.util) Foxtrick.util = {};
if (!Foxtrick.util.tabs) Foxtrick.util.tabs = {};

//first header is the starting point
//create or get tab-bar
//mark all sibling of the tab-bar as content of the main tab
Foxtrick.util.tabs.initialize = function(doc) {
	if (!Foxtrick.util.tabs.hasTabSupport(doc))
		return;

	var header = doc.getElementsByTagName('h1')[1];
	var hasByLine = Foxtrick.hasClass(header, 'hasByline');
	var byline = doc.getElementsByClassName('byline')[0];
	var contentNode = header.nextSibling;
	if (hasByLine && byline)
		contentNode = byline.nextSibling;

	//create tab bar or pull existing one out of subNodes
	var tabs = Foxtrick.util.tabs.getTabs(doc);
	if (!tabs) {
		tabs = Foxtrick.util.tabs._create(doc);
	} else {
		if (!Foxtrick.isPage(doc, 'match'))
			header.parentNode.insertBefore(tabs, contentNode);
	}
	contentNode = tabs.nextSibling;


	//mark everything that's already there as main tab content
	while (contentNode) {
		if (contentNode.nodeType != Foxtrick.NodeTypes.TEXT_NODE) {
			try {
				var tab = contentNode.getAttribute('tabs');
				if (!tab) {
					Foxtrick.addAttributeValue(contentNode, 'tabs', 'tab-main');
					Foxtrick.addClass(contentNode, 'tab-content');
				}
			}
			catch (e) {}
		} else if (contentNode.nodeType == Foxtrick.NodeTypes.TEXT_NODE &&
		           contentNode.textContent.replace(/ /g, '').replace(/\n/g, '') != '') {
			var before = contentNode.nextSibling;
			var p = doc.createElement('p');
			Foxtrick.addAttributeValue(p, 'tabs', 'tab-main');
			Foxtrick.addClass(p, 'tab-content');
			p.appendChild(contentNode);

			if (before)
				header.parentNode.insertBefore(p, before);
			else
				header.parentNode.appendChild(p);

			contentNode = before;
			continue;
		}
		contentNode = contentNode.nextSibling;
	}


	if (!Foxtrick.isPage(doc, 'match') && !Foxtrick.hasClass(Foxtrick.util.tabs
	    .getTabs(doc).nextSibling, 'ft-clear-both')) {
		var clear = doc.createElement('div');
		Foxtrick.addClass(clear, 'ft-clear-both');
		Foxtrick.addAttributeValue(clear, 'tabs', 'all-tabs');
		header.parentNode.insertBefore(clear, Foxtrick.util.tabs.getTabs(doc).nextSibling);
	}
};

Foxtrick.util.tabs.getTabs = function(doc) {
	//future match or custom created tabs
	var tab = doc.getElementById('tab');

	//new match page
	if (!tab)
		tab = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucMatchTabs_ulTabs');

	//new challenges page
	//if(!tab)
	//	tab = doc.getElementsByClassName('tabbedList')[0];

	return tab;
};

//private, creates the tab bar and add it's after the h1 header or it's byline
Foxtrick.util.tabs._create = function(doc) {
	var header = doc.getElementsByTagName('h1')[1];
	if (!header)
		return;

	var hasByLine = Foxtrick.hasClass(header, 'hasByline');
	var byline = doc.getElementsByClassName('byline')[0];
	var contentNode = header.nextSibling;
	if (hasByLine && byline)
		contentNode = byline.nextSibling;

	var list = doc.createElement('ul');
	list.setAttribute('id', 'tab');
	header.parentNode.insertBefore(list, contentNode);

	return list;
};

//support only for pages with a h1 header atm
Foxtrick.util.tabs.hasTabSupport = function(doc) {
	var h1 = doc.getElementsByTagName('h1')[1];
	if (h1) {
		var content = h1.textContent;
		return content.replace(/ /g, '').replace(/\n/g, '') != '';
	} else
		return false;
};

//add's tab hande, requires existing tab
Foxtrick.util.tabs.addHandle = function(doc, title, icon, shows) {
	if (!Foxtrick.util.tabs.hasTabSupport(doc))
		return null;

	var tabs = Foxtrick.util.tabs.getTabs(doc);
	var li = doc.createElement('li');
	li.id = shows + '-handle';

	var link = doc.createElement('a');
	link.href = 'javascript:void(0);';
	link.setAttribute('disabled', 'disabled');
	Foxtrick.addClass(link, 'tabItem');
	var _shows = link.getAttribute('shows');
	if (_shows)
		shows = _shows + ',' + shows;

	link.setAttribute('shows', shows);
	if (icon) {
		Foxtrick.addImage(doc, link, icon);
	}
	var text = doc.createTextNode(title);
	link.appendChild(text);

	Foxtrick.onClick(link, function() {
		Foxtrick.util.tabs.show(doc, link.getAttribute('shows'));
	});

	li.appendChild(link);
	tabs.appendChild(li);
	return link;
};
//shows last selected tab, if not present, shows 'tab-main'
Foxtrick.util.tabs.showLast = function(doc) {
	var tab = Foxtrick.util.tabs.getTabs(doc);
	var active = tab.getElementsByClassName('active');
	var shows = 'tab-main';
	if (active[0])
		shows = active[0].getAttribute('shows');

	Foxtrick.util.tabs.show(doc, shows);
};
//shows tab by id
Foxtrick.util.tabs.show = function(doc, id) {
	//select tab handle
	var tabs = Foxtrick.util.tabs.getTabs(doc);
	var links = tabs.getElementsByTagName('a');
	for (var i = 0; i < links.length; i++) {
		try {
			if (links[i].getAttribute('shows').search(id) > -1)
				Foxtrick.addClass(links[i], 'active');
			else
				Foxtrick.removeClass(links[i], 'active');
		}
		catch (e) {
			Foxtrick.removeClass(links[i], 'active');
			Foxtrick.log('Unitialized tab handle is causing problems!');
		}
	}
	//show
	var tabContents = doc.getElementsByClassName('tab-content');
	for (var i = 0; i < tabContents.length; ++i) {
		var tabs = tabContents[i].getAttribute('tabs');
		if (tabs.search(id) > -1 || tabs.search('all-tabs') > -1)
			Foxtrick.removeClass(tabContents[i], 'hidden');
		else
			Foxtrick.addClass(tabContents[i], 'hidden');
	}
};

Foxtrick.util.tabs.addElementToTab = function(doc, elem, tab) {
	Foxtrick.addClass(elem, 'tab-content');
	Foxtrick.addAttributeValue(elem, 'tabs', tab);
	var parent = doc.getElementsByTagName('h1')[1].parentNode;
	var elemParent = elem.parentNode;
	while (elemParent != parent) {
		Foxtrick.addAttributeValue(elemParent, 'tabs', tab);
		elemParent = elemParent.parentNode;
	}
};
