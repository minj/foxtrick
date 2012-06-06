Foxtrick.modules["TabsTest"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ['all'],
	OPTIONS: ['Tabify'],
	nightly: "This is a proof of concept module by Foxtrick. Please report any problems or weird things to the Foxtrick developer.",
	NICE: 50,
	run : function(doc) {
		if(!Foxtrick.util.tabs.hasTabSupport(doc))
			return;
		Foxtrick.util.tabs.initialize(doc);

		var h1 = doc.getElementsByTagName("h1")[0].textContent;
		
		Foxtrick.util.tabs.addHandle(doc, h1, { alt: h1, title: h1, src: "/Img/Icons/cross_small.png"}, "tab-main");
		if (FoxtrickPrefs.isModuleOptionEnabled("TabsTest", "Tabify"))
			Foxtrick.util.tabs.tabify(doc);
		Foxtrick.util.tabs.addHandle(doc, "Read me", { alt: "Read me", title: "Read me", src: "/Img/Icons/cross_small.png"} , "ft-tab-readme");

		var div = doc.createElement("div");
		div.textContent = this.nightly;
		div.setAttribute("tab", "ft-tab-readme");
		Foxtrick.addClass(div, "ft-tab-custom")

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

		Foxtrick.log("fix display");		
		Foxtrick.util.tabs.show(doc, "tab-main");
	}
}