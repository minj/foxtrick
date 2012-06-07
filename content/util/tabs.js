if (!Foxtrick) var Foxtrick = {};
if (!Foxtrick.util) Foxtrick.util = {};
if (!Foxtrick.util.tabs) Foxtrick.util.tabs = {};

//first header is the starting point
//create or get tab-bar
//mark all sibling of the tab-bar as content of the main tab
Foxtrick.util.tabs.initialize = function(doc){
	if(!Foxtrick.util.tabs.hasTabSupport(doc))
		return;

	var header = doc.getElementsByTagName("h1")[0];	
	var hasByLine = Foxtrick.hasClass(header, "hasByline");
	var byline = doc.getElementsByClassName("byline")[0];
	var contentNode = header.nextSibling;
	if(hasByLine && byline)
		contentNode = byline.nextSibling;

	//create tab bar or pull existing one out of subNodes
	var tabs = doc.getElementById('tab');
	if(!tabs)
		Foxtrick.util.tabs._create(doc);
	else {
		header.parentNode.insertBefore(tabs, contentNode);
	}
	contentNode = doc.getElementById("tab").nextSibling;
	//mark everything that's already there as main tab content
	while(contentNode){
		if(contentNode.nodeType != Foxtrick.NodeTypes.TEXT_NODE){
			try {
				var tab = contentNode.getAttribute("tab");
				if(!tab){
					Foxtrick.util.tabs.addToAttribute(contentNode, "tab", "tab-main");
					Foxtrick.addClass(contentNode, "tab-content");
				}
			}
			catch(e){}
		} else if(contentNode.nodeType == Foxtrick.NodeTypes.TEXT_NODE && contentNode.textContent.replace(/ /g,'').replace(/\n/g,'') != ''){
			var before = contentNode.nextSibling;
			var p = doc.createElement("p");
			Foxtrick.util.tabs.addToAttribute(p, "tab", "tab-main");
			Foxtrick.addClass(p, "tab-content");
			p.appendChild(contentNode);

			if(before)
				header.parentNode.insertBefore(p, before);
			else
				header.parentNode.appendChild(p);

			contentNode = before;
			continue;
		}
		contentNode = contentNode.nextSibling;
	}
	if(!Foxtrick.hasClass(doc.getElementById("tab").nextSibling, "ft-clear-both")){
		var clear = doc.createElement("div")
		Foxtrick.addClass(clear, "ft-clear-both");
		header.parentNode.insertBefore(clear, doc.getElementById("tab").nextSibling);
	}
}

//private, creates the tab bar and add it's after the h1 header or it's byline
Foxtrick.util.tabs._create = function(doc){
	var header = doc.getElementsByTagName("h1")[0];
	if(!header)
		return;

	var hasByLine = Foxtrick.hasClass(header, "hasByline");
	var byline = doc.getElementsByClassName("byline")[0];
	var contentNode = header.nextSibling;
	if(hasByLine && byline)
		contentNode = byline.nextSibling;

	var list = doc.createElement("ul");
	list.setAttribute("id", "tab");
	header.parentNode.insertBefore(list, contentNode);
}

//support only for pages with a h1 header atm
Foxtrick.util.tabs.hasTabSupport = function(doc) {
	var h1 = doc.getElementsByTagName("h1")[0];
	if(h1){
		var content = h1.textContent;
		return content.replace(/ /g,'').replace(/\n/g,'') != '';
	} else 
		return false;
}

//add's tab hande, requires existing tab
Foxtrick.util.tabs.addHandle = function(doc, title, icon, shows){
	if(!Foxtrick.util.tabs.hasTabSupport(doc))
		return null;

	var tabs = doc.getElementById("tab");
	var li = doc.createElement("li");
	li.id = shows + "-handle";
	var link = doc.createElement("a");
	link.href = "javascript:void(0);";
	link.setAttribute("disabled", "disabled");
	var _shows = link.getAttribute("shows");
	if(_shows)
		shows = _shows + ',' + shows;
	
	link.setAttribute("shows", shows);
	if(icon){
		Foxtrick.addImage(doc, link, icon); 
	}
	var text = doc.createTextNode(title);
	link.appendChild(text);

	Foxtrick.onClick(link, function() {
		Foxtrick.util.tabs.show(doc, link.getAttribute("shows"));
	});

	li.appendChild(link);
	tabs.appendChild(li);
	return link;
}
//shows last selected tab, if not present, shows "tab-main"
Foxtrick.util.tabs.showLast = function(doc){
	var tab = doc.getElementById("tab");
	var active = tab.getElementsByClassName("active");
	var shows = "tab-main";
	if(active[0])
		shows = active[0].getAttribute("shows");

	Foxtrick.util.tabs.show(doc, shows);
}
//shows tab by id
Foxtrick.util.tabs.show = function(doc, id){
	Foxtrick.log("Show" + id);
	
	//select tab handle
	var tabs = doc.getElementById("tab");
	var links = tabs.getElementsByTagName("a");
	for(var i = 0; i < links.length; i++){
		if(links[i].getAttribute("shows").search(id) > -1)
			Foxtrick.addClass(links[i], "active");
		else
			Foxtrick.removeClass(links[i], "active");
	}
	//show
	var tabContents = doc.getElementsByClassName("tab-content");
	for(var i = 0; i < tabContents.length; ++i){
		var tabs = tabContents[i].getAttribute("tab");
		if(tabs.search(id) > -1)
			Foxtrick.removeClass(tabContents[i], "hidden");
		else
			Foxtrick.addClass(tabContents[i], "hidden");
	}
}
Foxtrick.util.tabs.addToAttribute = function(elem, attrib, value){
	var _attrib = elem.getAttribute(attrib);
	if(_attrib  && _attrib.search(value) == -1)
		elem.setAttribute(attrib,_attrib +"," + value);	
	else
		elem.setAttribute(attrib, value);	
} 

Foxtrick.util.tabs.addElementToTab = function(doc, elem, tab){
	Foxtrick.addClass(elem, "tab-content");
	Foxtrick.util.tabs.addToAttribute(elem, "tab", tab);
	var parent = doc.getElementsByTagName("h1")[0].parentNode;
	var elemParent = elem.parentNode;
	while(elemParent != parent){
		Foxtrick.util.tabs.addToAttribute(elemParent, "tab", tab);
		elemParent = elemParent.parentNode;
	}
}

Foxtrick.util.tabs.tabify = function(doc){
	if(!Foxtrick.util.tabs.hasTabSupport(doc))
		return;

	var parent = doc.getElementsByTagName("h1")[0].parentNode;
	var h2s = parent.getElementsByTagName("h2");
	for(var i = 0; i < h2s.length; ++i){
		if(Foxtrick.hasClass(h2s[i], "info"))
			continue;

		var label = h2s[i].textContent.replace(/ /g, "");
		if(doc.getElementById("tab-" + label + "-handle"))
			continue;

		Foxtrick.util.tabs.addHandle(doc, h2s[i].textContent, null, "tab-" + label);
		Foxtrick.util.tabs._addH2ToTab(doc, h2s[i], "tab-" + label);
		
	}
	Foxtrick.util.tabs.initialize(doc);
	Foxtrick.util.tabs.showLast(doc);
}

Foxtrick.util.tabs._addH2ToTab = function(doc, h2, tab) {
	var setupHeaderSiblings = function(el, tab) {
		var parent = el.parentNode;
		el = el.nextSibling;
		var forumThreads = {}, numUnread = 0, idString='';
		while ( el ) { 
			// if text node, wrap in span on first encounter
			if (el.nodeType ==  Foxtrick.NodeTypes.TEXT_NODE) {
				if (Foxtrick.trim(el.nodeValue) != "") {
					var target = el.nextSibling;
					var span =  doc.createElement('span');
					span.appendChild(el);
					el = parent.insertBefore(span, target);
				} else {
					el = el.nextSibling;
					continue;
				}
			}

			// stop with next header or dedicated parentNode mainBox
			if ( (el.className == 'mainBox' && el.getElementsByTagName('h2')[0] != undefined)
				|| el.nodeName == 'H1'
				|| (el.nodeName == 'H2' && !Foxtrick.hasClass(el, 'info'))
				|| (el.getElementsByTagName('h2')[0] !== undefined && !Foxtrick.hasClass(el.getElementsByTagName('h2')[0],'info') )) {
				break;
			}

			// // don't show which is hidden originally, eg ft-forum-preview-area 
			// if (el.id == 'ft-forum-preview-area' && foxtrick.hasclass(el, 'hidden')) {
			// 	el = el.nextsibling;
			// 	continue;
			// }
			Foxtrick.addClass(el, "tab-content");
			Foxtrick.util.tabs.addToAttribute(el, "tab", tab);

			// count new forum postings
			if ( Foxtrick.hasClass(el,'hidden') && el.getElementsByClassName('fplThreadInfo')[0] != undefined ) {
				var rows = el.getElementsByClassName('fplThreadInfo');
				Foxtrick.map(function(n) {
					var unread = n.getElementsByClassName('highlight')[0];
					if (unread !== undefined) {
						var tid = unread.getAttribute('onclick').match(/'read\|(\d+)'/)[1];
						if (!forumThreads[tid])
							numUnread += Number(unread.textContent);
						forumThreads[tid] = true;
						if (idString)
							idString += ',';
						idString += tid;
						
						//idString += "__doPostBack('ctl00$ctl00$CPContent$CPMain$updLatestThreads','read|" + tid + "');\n"
					}
				}, rows);
			}
			el = el.nextSibling;
		}
		
		// show new forum postings
		if (numUnread && h2.getElementsByClassName('highlight')[0] == undefined) {
			var page_num = 0;
			var pages = h2.parentNode.getElementsByClassName('page');
			for (var i=0; i<pages.length; ++i) {
				if (pages[i].getAttribute('disabled')=='disabled') {
					page_num = Number(pages[i].textContent)-1;
				}
			}
			h2.appendChild(doc.createTextNode(' '));
			var span = doc.createElement('span');
			span.className = 'highlight ft-dummy';
			span.textContent = '('+numUnread+')';
			Foxtrick.makeFeaturedElement(span, Foxtrick.modules.HeaderToggle);
			h2.appendChild(span);
		}
	};

	Foxtrick.util.tabs.addElementToTab(doc, h2, tab);
	Foxtrick.addClass(h2, "tab-content");
	setupHeaderSiblings(h2, tab);
	if (h2.parentNode.nodeName=='TD') {
		// in tables we also toggle sibling rows
		setupHeaderSiblings(h2.parentNode.parentNode, tab);
	}
}
