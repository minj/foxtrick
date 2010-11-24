/**
* forumchangepstangelinks.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickForumStripHattrickLinks = {

	MODULE_NAME : "ForumStripHattrickLinks",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumWritePost','messageWritePost','guestbook','announcements','ads','newsletter',"forumModWritePost","forumViewThread"),
	NEW_AFTER_VERSION: "0.5.1.2",
	LATEST_CHANGE: "Module back.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS: new Array("NoConfirmStripping"),

	onclick : function( ev ) {
		try{
			var a = ev.target;
			if (a.nodeName=='A') {
				var hostname = ev.target.ownerDocument.location.hostname;
				if ( a.href.search(/wiki/i)==-1 && a.href.search(/.+hattrick\.(org|ws|interia\.pl).*?/i)!=-1 && a.href.search(hostname)==-1) {
					if (Foxtrick.isModuleFeatureEnabled( FoxtrickForumStripHattrickLinks, "NoConfirmStripping" )) {
						a.href = a.href.replace(/.+hattrick\.(org|ws|interia\.pl)(.*?)/i,'http://'+hostname+'$2');
					}
					else if (Foxtrick.confirmDialog('Replace server with '+hostname +'?')) a.href = a.href.replace(/.+hattrick\.(org|ws|interia\.pl)(.*?)/i,'http://'+hostname+'$2');
				}
				//else a.target=+'_blank';
			}
		}
		catch (e) {
			Foxtrick.dump('FoxtrickForumStripHattrickLinksonclick '+e+'\n');
		}
	},

	run : function( page, doc ) {
		doc.getElementById('mainBody').addEventListener('click',this.onclick,true);
		if (page=='forumViewThread') return;

		var targets = doc.getElementById('mainBody').getElementsByTagName("input");  // Forum
	    var target = targets[targets.length-1];
	    var button_ok = null;
		if (page=='forumWritePost') button_ok = targets[targets.length-2];
	    if (page=='guestbook') target = null;

		button_ok.addEventListener("click", this.submitListener, false);
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
