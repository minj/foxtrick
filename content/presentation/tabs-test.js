Foxtrick.modules["TabsTest"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ['all'],
	lorum : "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
	ipsum : "Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
	nightly: "You are a Foxtrick nightly user, found a bug? Report it please. If you don't know where to report you shouldn't use this version.\n Known issues: Finances Page, MatchReport.",
	NICE: -1,
	run : function(doc) {
		if(!Foxtrick.util.tabs.hasTabSupport(doc))
			return;

		Foxtrick.util.tabs.initialize(doc);

		Foxtrick.util.tabs.add(doc, "Main", { alt: "Main", title: "Main", src: "/Img/Icons/cross_small.png"}, "tab-main");
		Foxtrick.util.tabs.add(doc, "Lorum" , { alt: "Lorum", title: "Lorum", src: "/Img/Icons/cross_small.png"}, "ft-tab-test");
		Foxtrick.util.tabs.add(doc, "Ipsum", { alt: "Ipsum", title: "Ipsum", src: "/Img/Icons/cross_small.png"} , "ft-tab-test2");
		Foxtrick.util.tabs.add(doc, "Read me", { alt: "Read me", title: "Read me", src: "/Img/Icons/cross_small.png"} , "ft-tab-nightly");

		var div1 = doc.createElement("div");
		div1.textContent = this.lorum;
		div1.setAttribute("tab", "ft-tab-test");

		var div2 = doc.createElement("div");
		div2.textContent = this.ipsum;
		div2.setAttribute("tab", "ft-tab-test2");

		var div3 = doc.createElement("div");
		div3.textContent = this.nightly;
		div3.setAttribute("tab", "ft-tab-nightly");

		doc.getElementsByTagName("h1")[0].parentNode.appendChild(div1);
		doc.getElementsByTagName("h1")[0].parentNode.appendChild(div2);
		doc.getElementsByTagName("h1")[0].parentNode.appendChild(div3);

		Foxtrick.util.tabs.show(doc, "tab-main");
	}
}