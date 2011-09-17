/**
* forumchangepstangelinks.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickForumStripHattrickLinks = {

	MODULE_NAME : "ForumStripHattrickLinks",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumWritePost','messageWritePost','guestbook','announcements','newsletter','mailnewsletter',"forumModWritePost","forumViewThread"),
	OPTIONS: new Array("NoConfirmStripping"),
	NICE: -1, //  needs to be before forum preview for old submit button (order) detection

	onclick : function( ev ) {
		var setRelPath = function(link) {
			link.href = link.href.replace(new RegExp("^http://.+?/"), "/");
		};
		var a = ev.target;
		if (a.nodeName == "A") {
			if (Foxtrick.isHtUrl(a.href)) {
				var hostname = ev.target.ownerDocument.location.hostname;
				if (FoxtrickPrefs.isModuleOptionEnabled("ForumStripHattrickLinks", "NoConfirmStripping"))
					setRelPath(a);
				else if (Foxtrick.confirmDialog('Replace server with '+hostname +'?'))
					setRelPath(a);
			}
			else if (a.href.search(/^chrome|^safari-extension/)==0) {
				var url = a.href;  																		// opera doesn't allow pref access
				url = url.replace('safari-extension://www.ht-foxtrick.com-8J4UNYVFR5/2f738eb7/content/', '');	// safari nightly
				url = url.replace('chrome-extension://bpfbbngccefbbndginomofgpagkjckik/content/',''); 	// official chrome
				url = url.replace('chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/content/',''); 	// nightly chrome
				url = url.replace('chrome://foxtrick/content/', '');									// all gecko
				Foxtrick.newTab(Foxtrick.InternalPath +url);
			}
		}
	},

	run : function(doc) {
		doc.getElementById('mainBody').addEventListener('click',this.onclick,true);
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
					.replace('[link=safari-extension://www.ht-foxtrick.com-8J4UNYVFR5/2f738eb7/content/', '[link=chrome://foxtrick/content/') // safari nightly
					.replace('[link=chrome-extension://bpfbbngccefbbndginomofgpagkjckik/content/','[link=chrome://foxtrick/content/') // official chrome
					.replace('[link=chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/content/','[link=chrome://foxtrick/content/'); // nightly chrome
				return url;
			};
			// add submit listener
			target.addEventListener("click", function() {
				var textarea = doc.getElementById("mainBody").getElementsByTagName("textarea")[0];
				if (FoxtrickPrefs.isModuleOptionEnabled("ForumStripHattrickLinks", "NoConfirmStripping")) {
					textarea.value = strip(textarea.value);
				}
				else {
					if (confirm(Foxtrickl10n.getString("foxtrick.confirmstripserver"))) {
						textarea.value = strip(textarea.value);
					}
				}
			}, false);
		}
	}
};
Foxtrick.util.module.register(FoxtrickForumStripHattrickLinks);
