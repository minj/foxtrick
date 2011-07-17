/**
* forumchangepstangelinks.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickForumStripHattrickLinks = {

	MODULE_NAME : "ForumStripHattrickLinks",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumWritePost','messageWritePost','guestbook','announcements','ads','newsletter',"forumModWritePost","forumViewThread"),
	OPTIONS: new Array("NoConfirmStripping"),

	onclick : function( ev ) {
		var setRelPath = function(link) {
			link.href = link.href.replace(new RegExp("^http://.+?/"), "/");
		};
		var a = ev.target;
		if (a.nodeName == "A") {
			if (Foxtrick.isHtUrl(a.href)) {
				var hostname = ev.target.ownerDocument.location.hostname;
				if (Foxtrick.isModuleFeatureEnabled(FoxtrickForumStripHattrickLinks, "NoConfirmStripping"))
					setRelPath(a);
				else if (Foxtrick.confirmDialog('Replace server with '+hostname +'?'))
					setRelPath(a);
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

		if (target)
			target.addEventListener("click", this.submitListener, false);
	},

	strip : function(string) {
		return string.replace(/\[link=.+(www|www\d+|stage)\.hattrick\.(org|ws|interia\.pl)(.*?)\]/gi, "[link=$3]");
	},

	submitListener : function(ev) {
		var doc = ev.target.ownerDocument;
		var textarea = doc.getElementById("mainBody").getElementsByTagName("textarea")[0];
		if (Foxtrick.isModuleFeatureEnabled(FoxtrickForumStripHattrickLinks, "NoConfirmStripping")) {
			textarea.value = FoxtrickForumStripHattrickLinks.strip(textarea.value);
		}
		else {
			if (confirm(Foxtrickl10n.getString("foxtrick.confirmstripserver"))) {
				textarea.value = FoxtrickForumStripHattrickLinks.strip(textarea.value);
			}
		}
	}
};
