"use strict";
/**
 * mobile-enhancements.js
 * Collection of enhancements using mobile device/fennec
 * @author convinced
 */


//if (Foxtrick.platform == "Mobile" || Foxtrick.platform == "Android")
  Foxtrick.modules["MobileEnhancements"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["all"],
	CSS : Foxtrick.InternalPath + "resources/css/mobile-enhancements.css",
	OPTIONS : ['ViewPort'],
	OPTION_EDITS : true,
	

	run : function(doc) { 
		// get viewport size
		var viewport_size = FoxtrickPrefs.getString("module.MobileEnhancements.ViewPort_text");
		if (Foxtrick.isPage("matchOrder", doc))	{
			viewport_size = "765";
		}
		// smaller than 430 time cause flicker. don't ask me why, i tried like everything
		if (Number(viewport_size) < 430)
			Foxtrick.addClass(doc.getElementById("time"), "hidden");

		// functions to select left, right, center, header
		var select = function(area) {
			// retract menu
			Foxtrick.removeClass(mobile_header_center,"out");
			
			if (area=="left" && lb) {
				if (lb)
					Foxtrick.removeClass(lb,'out');
				if (rb)
					Foxtrick.addClass(rb,'out');
				if (header)
					Foxtrick.addClass(header,'out');
			} 
			else if (area=="right" && rb) {
				if (rb)
					Foxtrick.removeClass(rb,'out');
				if (lb)
					Foxtrick.addClass(lb,'out');
				if (header) 
					Foxtrick.addClass(header,'out');
			}
			else if ((area=="center" || (area=="right" &&!rb)) && cb ) {
				if (lb)
					Foxtrick.addClass(lb,'out');
				if (rb)
					Foxtrick.addClass(rb,'out');
				if (header) 
					Foxtrick.addClass(header,'out');
			}
			else if (area=="header") {
				if (header)
					Foxtrick.removeClass(header,'out');
				if (lb)
					Foxtrick.addClass(lb,'out');
				if (rb)
					Foxtrick.addClass(rb,'out');
			}
			else if (area=="header_toggle") {
				if (header)
					Foxtrick.toggleClass(header,'out');
				if (lb)
					Foxtrick.addClass(lb,'out');
				if (rb)
					Foxtrick.addClass(rb,'out');
			}
		};

		// all relevant elements
		var lb = doc.getElementsByClassName("subMenu")[0] || doc.getElementsByClassName("subMenuConf")[0];
		var cb = doc.getElementsByClassName("main")[0];
		var rb = doc.getElementById("sidebar");
		var header = doc.getElementById("header"); 
		var page = doc.getElementById("page"); 
		var footer = doc.getElementById("footer"); 
		var hattrick = doc.getElementsByClassName("hattrick")[0] || doc.getElementsByClassName("hattrickNoSupporter")[0];
		var header = doc.getElementById("header");
		var menu = doc.getElementById("menu");
		
		// move menu bellow header
		var mobile_header = doc.createElement('div');
		mobile_header.id = 'mobile_header';
		header.parentNode.insertBefore(mobile_header, header);	
		var mobile_header_center = doc.createElement('div');
		mobile_header_center.id = 'mobile_header_center';
		mobile_header_center.classNme = 'mobile_header_center out';
		Foxtrick.onClick(mobile_header_center, function(ev){
			Foxtrick.toggleClass(mobile_header_center,"out");
		});
		mobile_header.appendChild(mobile_header_center);
		menu = mobile_header_center.appendChild(menu);
		var mobile_header_center_tab = doc.createElement('div');
		mobile_header_center_tab.id = 'mobile_header_center_tab';
		var a = doc.createElement('a');
		a.href="#";
		a.textContent = "Menu";
		mobile_header_center_tab.appendChild(a);
		mobile_header_center.appendChild(mobile_header_center_tab);

		// add gestures and clicks/taps
		try {
			// attach a handler to the element's swipe event		
			var gestures = { 
				swipes : [
					{ el:cb, 			dist:40, 	dir:"left", 	select: "right" },
					{ el:cb, 			dist:40, 	dir:"right", 	select: "left" },
					{ el:mobile_header, dist:10, 	dir:"down", 	select: "header" },
					{ el:mobile_header, dist:10, 	dir:"up",	 	select: "center" },
					{ el:lb, 			dist:40, 	dir:"left", 	select: "center" },
					{ el:rb, 			dist:40, 	dir:"right", 	select: "center" },
					{ el:header,		dist:20, 	dir:"down", 	select: "center" },
				]
			};
			for (var i=0; i< gestures.swipes.length; ++i) {
				var addSwipe= function(swipe){
					if (swipe.el)
						Foxtrick.jester(swipe.el,{swipeDistance: swipe.dist})
								.swipe(function(touches, swipeDirection){
							if (swipeDirection[swipe.dir]) {
								select(swipe.select);
							}
						});
				};
				addSwipe(gestures.swipes[i]);
			}
			// swipe log
			Foxtrick.jester(page,{swipeDistance: swipe.dist})
					.swipe(function(touches, swipeDirection){
				Foxtrick.log("swipe", {swipeDirection:swipeDirection}) 
			});
			
			// toggle header on mobile_header tap
			Foxtrick.jester(mobile_header)
					.tap(function(touches){
				if (touches.event.originalTarget !==  mobile_header_center_tab &&
					touches.event.originalTarget !==  menu  )
					select("header_toggle");
			});
			
			Foxtrick.addClass(hattrick,"ft-touch-available");
		
		} catch(e) {
			Foxtrick.log("no touch events")
		}
		
		// tap/click anywhere on cb to get back to center
		Foxtrick.onClick(cb, function(ev){
			select("center");
		});

		if (lb)
			Foxtrick.addClass(lb,'out');
		if (rb)
			Foxtrick.addClass(rb,'out');
		if (header) {
			Foxtrick.removeClass(header,'out');
		}
		
		if (!Foxtrick.isLoginPage(doc))
			select("center");

		Foxtrick.addClass(hattrick,"ft-mobile");
		
		this.setMetaViewport(doc, viewport_size);
	},

	setMetaViewport : function (doc, width) {
		Foxtrick.log('setMetaViewport size: ',width)
		var html = doc.getElementsByTagName('html')[0];
		var old_viewport = doc.getElementById('foxtrick-viewport');
		if (old_viewport !== null) 
			html.removeChild(old_viewport);

		var meta = doc.createElement('meta');
		meta.id = "foxtrick-viewport";
		meta.setAttribute('name',"viewport" );
		meta.setAttribute('content', "width = "+width );
		html.insertBefore(meta, doc.getElementsByTagName('html')[0].firstChild);
	},
};
