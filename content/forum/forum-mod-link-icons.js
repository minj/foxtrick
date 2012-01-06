"use strict";
/**
 * forum-mod-link-icons.js
 * @author CatzHoek
 */

Foxtrick.util.module.register({
	MODULE_NAME : "ForumModeratorIconLinks",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"),
	CSS: Foxtrick.InternalPath + "resources/css/forum-mod-link-icons.css",

	run : function(doc) {
		
		//current setup is optimized for standart layout, "disable" for simple skin for now
		if(!Foxtrick.util.layout.isStandard(doc))
			return;
			
		var modoption = doc.getElementById("cfModFunctions");
		
		if(modoption) {
			var content = doc.getElementById("ctl00_ctl00_CPContent_pnlScrollContent");
			var div = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.ForumModeratorIconLinks, 'div');
			div.className = "ft-mod-link-icons";
		
			var links = modoption.getElementsByTagName("a");
			
			for(var l = 0; l < links.length; l++){
				var actionTypeFunctions = Foxtrick.getParameterFromUrl(links[l].href, "actionTypeFunctions");
				switch(actionTypeFunctions){
					case "threadclose":
						var image = doc.createElement("img");
						image.src = Foxtrick.InternalPath + 'resources/img/moderators/thread_close.png';
						var link = links[l].cloneNode(true)
						link.innerText = ''
						link.className = 'ft-mod-link';
						div.appendChild( link );
						link.appendChild( image);
						break;
					case "threaddelete":
						var image = doc.createElement("img");
						image.src = Foxtrick.InternalPath + 'resources/img/moderators/thread_delete.png';
						var link = links[l].cloneNode(true)
						link.innerText = ''
						link.className = 'ft-mod-link';
						div.appendChild( link );
						link.appendChild( image);
						break;
					case "threadrename":
						var image = doc.createElement("img");
						image.src = Foxtrick.InternalPath + 'resources/img/moderators/thread_rename.png';
						var link = links[l].cloneNode(true)
						link.innerText = ''
						link.className = 'ft-mod-link';
						div.appendChild( link );
						link.appendChild( image);
						break;
					case "changestickydate":
						var image = doc.createElement("img");
						image.src = Foxtrick.InternalPath + 'resources/img/moderators/thread_sticky_settings.png';
						var link = links[l].cloneNode(true)
						link.innerText = ''
						link.className = 'ft-mod-link';
						div.appendChild( link );
						link.appendChild( image);
						break;
				};
				var actionTypeWrite = Foxtrick.getParameterFromUrl(links[l].href, "actionTypeWrite");
				switch(actionTypeWrite){
					case "threadclosereply":
						var image = doc.createElement("img");
						image.src = Foxtrick.InternalPath + 'resources/img/moderators/thread_close_and_answer.png';
						var link = links[l].cloneNode(true)
						link.innerText = ''
						link.className = 'ft-mod-link';
						div.appendChild( link );
						link.appendChild( image );
						break;
				};
			}
			content.insertBefore(div, content.firstChild);
		}
	}
});
