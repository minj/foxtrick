"use strict";
/**
 * forum-mod-link-icons.js
 * @author CatzHoek
 */
/*
Foxtrick.modules["ForumModeratorIconLinks"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"),
	CSS: Foxtrick.InternalPath + "resources/css/forum-mod-link-icons.css",

	run : function(doc) {
		
		//current setup is optimized for standart layout, "disable" for simple skin for now
		if(!Foxtrick.util.layout.isStandard(doc))
			return;
			
		var modoption = doc.getElementById("cfModFunctions");
		
		if(modoption) {			
			
			var addIconImageLink = function(target, srclinknode, src){
				var addModIcon = function(node, src, title, alt) {
					Foxtrick.addImage(doc, node, { alt: alt, title: title, src: src});
				}
				var link = srclinknode.cloneNode(true)
				link.textContent = ''
				link.className = 'ft-mod-link';
				addModIcon(link, src, srclinknode.textContent, srclinknode.textContent);
				target.appendChild( link );
			}
			
			var content = doc.getElementById("ctl00_ctl00_CPContent_pnlScrollContent");
			var div = Foxtrick.createFeaturedElement(doc, this, 'div');
			div.className = "ft-mod-link-icons";
			
			var links = modoption.getElementsByTagName("a");
			
			for(var l = 0; l < links.length; l++){
				var actionTypeFunctions = Foxtrick.getParameterFromUrl(links[l].href, "actionTypeFunctions");
				switch(actionTypeFunctions){
					case "threadclose":
						addIconImageLink(div, links[l], Foxtrick.InternalPath + 'resources/img/moderators/thread_close.png');						
						break;
					case "threaddelete":
						addIconImageLink(div, links[l], Foxtrick.InternalPath + 'resources/img/moderators/thread_delete.png');
						break;
					case "threadrename":
						addIconImageLink(div, links[l], Foxtrick.InternalPath + 'resources/img/moderators/thread_rename.png');
						break;
					case "changestickydate":
						addIconImageLink(div, links[l], Foxtrick.InternalPath + 'resources/img/moderators/thread_sticky_settings.png');						
						break;
				};
				var actionTypeWrite = Foxtrick.getParameterFromUrl(links[l].href, "actionTypeWrite");
				switch(actionTypeWrite){
					case "threadclosereply":
						addIconImageLink(div, links[l], Foxtrick.InternalPath + 'resources/img/moderators/thread_close_and_answer.png');
						break;
				};
			}
			content.insertBefore(div, content.firstChild);
		}
	}
};*/
