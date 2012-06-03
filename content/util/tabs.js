if (!Foxtrick) var Foxtrick = {};
if (!Foxtrick.util) Foxtrick.util = {};
if (!Foxtrick.util.tabs) Foxtrick.util.tabs = {};

Foxtrick.util.tabs.initialize = function(doc){
	if(!Foxtrick.util.tabs.hasTabSupport(doc))
		return;

	var header = doc.getElementsByTagName("h1")[0];
	var tabs = doc.getElementById('tab');

	//copy elements in our container
	var hasByLine = Foxtrick.hasClass(header, "hasByline");
	var byline = doc.getElementsByClassName("byline")[0];
	var start = header.nextSibling;
	if(hasByLine && byline)
		start = byline.nextSibling;

	var container = doc.createElement("div");
	container.setAttribute('id','chpp-tab-main');
	var next = start.nextSibling;
	while(start){
		next = start.nextSibling;
		container.appendChild(start);
		start = next;
	}

	//create tab bar or pull existing one out of subNodes
	if(!tabs)
		Foxtrick.util.tabs._create(doc);
	else {
		Foxtrick.log("Foxtrick.util.tabs.initialize : pulling out existing tab");
		header.parentNode.appendChild(tabs);
	}
	header.parentNode.appendChild(container);
}

//private
Foxtrick.util.tabs._create = function(doc){
	var header = doc.getElementsByTagName("h1")[0];
	var tabs = doc.getElementById('tab');

	if(!header)
		return;
	
	var list = doc.createElement("ul");
	list.setAttribute("id", "tab");
	header.parentNode.appendChild(list);
}

Foxtrick.util.tabs.hasTabSupport = function(doc) {
	return doc.getElementsByTagName("h1")[0];
}

Foxtrick.util.tabs.add = function(doc, title, icon, shows){
	if(!Foxtrick.util.tabs.hasTabSupport(doc))
		return;

	var tabs = doc.getElementById("tab");
	var li = doc.createElement("li");
	var link = doc.createElement("a");
	link.href = "javascript:void(0);";
	link.setAttribute("disabled", "disabled");
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
}

Foxtrick.util.tabs.show = function(doc, id){
	//select tab handle
	var tabs = doc.getElementById("tab");
	var links = tabs.getElementsByTagName("a");
	for(var i = 0; i < links.length; i++){
		if(links[i].getAttribute("shows") == id)
			Foxtrick.addClass(links[i], "active");
		else
			Foxtrick.removeClass(links[i], "active");
	}

	//show
	var content = tabs.nextSibling;
	while(content){
		if(content.getAttribute('id') == id)
			content.setAttribute('style','display:block;');
		else
			content.setAttribute('style','display:none;');

		content = content.nextSibling;
	}
}