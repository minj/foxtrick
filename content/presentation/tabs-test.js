Foxtrick.modules["TabsTest"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ['all'],
	OPTIONS: ['Tabify'],
	NICE: 50,
	run : function(doc) {
		if(!Foxtrick.util.tabs.hasTabSupport(doc))
			return;
		Foxtrick.util.tabs.initialize(doc);

		var h1 = doc.getElementsByTagName("h1")[0].textContent;
		
		//Foxtrick.util.tabs.addHandle(doc, h1, { alt: h1, title: h1, src: "/Img/Icons/cross_small.png"}, "tab-main");
		var main_handle = Foxtrick.util.tabs.addHandle(doc, h1, null, "tab-main");
		if(main_handle)
			Foxtrick.addClass(main_handle, "tab-hattrick");

		if (FoxtrickPrefs.isModuleOptionEnabled("TabsTest", "Tabify"))
			Foxtrick.util.tabs.tabify(doc);
		var ft_handle = Foxtrick.util.tabs.addHandle(doc, "Please test this!", null , "ft-tab-readme");
		if(ft_handle)
			Foxtrick.addClass(ft_handle, "ft-tab-foxtrick");

		var div = doc.createElement("div");
		var header = doc.createElement("h2");
		header.textContent = "Please test this!";
		var list = doc.createElement("ul");
		var addEntry = function(list, text){
			var entry = doc.createElement("li");
			var text = doc.createTextNode(text);
			entry.appendChild(text);
			list.appendChild(entry);
		}

		addEntry(list, "- Are your ticker/live/alert sounds working properly?");
		addEntry(list, "- Is HideSignature working to hide/reveal signatures?");
		addEntry(list, "- Any sites that act weird or have weird styling? (These tabs could cause it.)");
		addEntry(list, "- Is everything else alright?");

		div.appendChild(header);
		div.appendChild(list);
		Foxtrick.addClass(div, "ft-tab-custom");

		doc.getElementsByTagName("h1")[0].parentNode.appendChild(div);
		Foxtrick.util.tabs.addElementToTab(doc, div, "ft-tab-readme");

		var container = doc.getElementsByTagName("h1")[0].parentNode;
		Foxtrick.log("addMutationEventListener");
		//match report
		Foxtrick.addMutationEventListener(container, "DOMNodeInserted", function(){
			Foxtrick.util.tabs.initialize(doc);
			if (FoxtrickPrefs.isModuleOptionEnabled("TabsTest", "Tabify"))
				Foxtrick.util.tabs.tabify(doc);
		}, false);

		Foxtrick.util.tabs.show(doc, "tab-main");
	}
}