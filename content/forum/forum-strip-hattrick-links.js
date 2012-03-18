"use strict";
/**
* forumchangepstangelinks.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

Foxtrick.modules["ForumStripHattrickLinks"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumWritePost','messageWritePost','guestbook','announcements','newsletter','mailnewsletter',"forumModWritePost","forumViewThread"),
	OPTIONS: new Array("NoConfirmStripping"),
	NICE: -1, //  needs to be before forum preview for old submit button (order) detection

	changeLinks : function( ev ) {
		var a = ev.target;
		if (a.nodeName == "A") { 
			if (Foxtrick.isHtUrl(a.href)) {
				var hostname = ev.target.ownerDocument.location.hostname;
				if (FoxtrickPrefs.isModuleOptionEnabled("ForumStripHattrickLinks", "NoConfirmStripping"))
					a.href = a.href.replace(new RegExp("^http://.+?/"), "/");
				else if (Foxtrick.confirmDialog('Replace server with '+hostname +'?'))
					a.href = a.href.replace(new RegExp("^http://.+?/"), "/");
			}
			else if (a.href.search(/^chrome|^safari-extension|^foxtrick/)==0) {
				var url = a.href;  																		// opera doesn't allow pref access
				Foxtrick.log(url)
				url = url.replace('safari-extension://www.ht-foxtrick.com-8J4UNYVFR5/2f738eb7/content/', '');	// safari nightly
				url = url.replace('chrome-extension://hpmklgcdpljkcojiknpdnjigpidkdcan/content/',''); 	// dev chrome
				url = url.replace('chrome-extension://bpfbbngccefbbndginomofgpagkjckik/content/',''); 	// official chrome
				url = url.replace('chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/content/',''); 	// nightly chrome
				url = url.replace('chrome://foxtrick/content/', '');									// all gecko
				url = url.replace('foxtrick://', '');													// our fake type
				Foxtrick.log(url)				
				a.href = a.href.replace('foxtrick://', Foxtrick.InternalPath);
				Foxtrick.log(url)
				
				// ff doesn't wanna open the changed href
				if (Foxtrick.arch == 'Gecko' )
					Foxtrick.newTab(Foxtrick.InternalPath + url);
			}
		}
	},

	run : function(doc) {
		Foxtrick.listen(doc.getElementById('mainBody'), 'click', this.changeLinks, true);
		if (Foxtrick.isPage("forumViewThread", doc))
			return;

		var targets = doc.getElementById('mainBody').getElementsByTagName("input");  // Forum
		var target = targets[targets.length-1];
		if (Foxtrick.isPage("forumWritePost", doc))
			target = targets[targets.length-2];
		if (Foxtrick.isPage("guestbook", doc))
			target = targets[1];
		if (target) {
			var strip = function(str) {
				var url = str.replace(/\[link=.+(www|www\d+|stage)\.hattrick\.(org|ws|interia\.pl)(.*?)\]/gi, "[link=$3]")
					.replace(/\[link=safari-extension:\/\/www.ht-foxtrick.com-8J4UNYVFR5\/2f738eb7\/content\//g, '[link=foxtrick://')	// safari nightly
					.replace(/\[link=chrome-extension:\/\/hpmklgcdpljkcojiknpdnjigpidkdcan\/content\//g,'[link=foxtrick://') 			// dev chrome
					.replace(/\[link=chrome-extension:\/\/bpfbbngccefbbndginomofgpagkjckik\/content\//g,'[link=foxtrick://') 			// official chrome
					.replace(/\[link=chrome-extension:\/\/kfdfmelkohmkpmpgcbbhpbhgjlkhnepg\/content\//g,'[link=foxtrick://')	 		// nightly chrome
					.replace(/\[link=chrome:\/\/foxtrick\/content\//g,'[link=foxtrick://'); 											// all gecko
				return url;
			};
			// add submit listener
			target.addEventListener("click", function() {
				var textarea = doc.getElementById("mainBody").getElementsByTagName("textarea")[0];
				if (FoxtrickPrefs.isModuleOptionEnabled("ForumStripHattrickLinks", "NoConfirmStripping")) {
					textarea.value = strip(textarea.value);
				}
				else {
					if (confirm(Foxtrickl10n.getString("ForumStripHattrickLinks.ask"))) {
						textarea.value = strip(textarea.value);
					}
				}
			}, false);
		}
	}
};
