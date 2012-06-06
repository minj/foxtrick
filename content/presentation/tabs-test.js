Foxtrick.modules["TabsTest"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ['all'],
	OPTIONS: ['Tabify'],
	nightly: "These tab elements on all pages are part of a proof of concept module by Foxtrick. Please report any problems or weird things to the Foxtrick developers. If this annoys you just disable it. If you can't even find the disable button please use release or beta. ;)",
	NICE: 50,
	run : function(doc) {
		if(!Foxtrick.util.tabs.hasTabSupport(doc))
			return;
		Foxtrick.util.tabs.initialize(doc);

		var h1 = doc.getElementsByTagName("h1")[0].textContent;
		
		//Foxtrick.util.tabs.addHandle(doc, h1, { alt: h1, title: h1, src: "/Img/Icons/cross_small.png"}, "tab-main");
		var main_handle = Foxtrick.util.tabs.addHandle(doc, h1, null, "tab-main");
		if (FoxtrickPrefs.isModuleOptionEnabled("TabsTest", "Tabify"))
			Foxtrick.util.tabs.tabify(doc);
		var ft_handle = Foxtrick.util.tabs.addHandle(doc, "Read me", null , "ft-tab-readme");
		if(ft_handle)
			Foxtrick.addClass(ft_handle, "ft-tab-foxtrick");

		var div = doc.createElement("div");
		div.textContent = this.nightly;
		div.setAttribute("tab", "ft-tab-readme");
		Foxtrick.addClass(div, "ft-tab-custom");
		Foxtrick.addClass(div, "tab-content")

		doc.getElementsByTagName("h1")[0].parentNode.appendChild(div);
		//Foxtrick.util.tabs.addElementToTab(doc, div, "ft-tab-readme");

		var container = doc.getElementsByTagName("h1")[0].parentNode;
		Foxtrick.log("addMutationEventListener");
		//match report
		Foxtrick.addMutationEventListener(container, "DOMNodeInserted", function(){
			Foxtrick.util.tabs.initialize(doc);
			if (FoxtrickPrefs.isModuleOptionEnabled("TabsTest", "Tabify"))
				Foxtrick.util.tabs.tabify(doc);
		}, false);

		Foxtrick.log("fix display");		
		Foxtrick.util.tabs.show(doc, "tab-main");
	}
}