if (!Foxtrick) var Foxtrick = {};
if (!Foxtrick.util) Foxtrick.util = {};
if (!Foxtrick.util.tabs) Foxtrick.util.tabs = {};

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
		Foxtrick.log("Foxtrick.util.tabs.initialize : pulling out existing tab");
		header.parentNode.insertBefore(tabs, contentNode);
	}

	//mark everything that's already there as main tab content
	while(contentNode){
		try{
			var tab = contentNode.getAttribute("tab");
			if(!tab)
				contentNode.setAttribute("tab", "tab-main");
		}
		catch(e){
			Foxtrick.log("TextNode:", contentNode);
		}
		contentNode = contentNode.nextSibling;
	}
}

//private
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
		try{
			if(content.getAttribute('tab') == id)
				Foxtrick.removeClass(content, "hidden");
			else
				Foxtrick.addClass(content, "hidden");
		} catch(e){
			Foxtrick.log("TextNode:", content);
		}
		content = content.nextSibling;
	}
}
