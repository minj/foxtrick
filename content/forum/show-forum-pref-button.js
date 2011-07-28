/**
* show-forum-pref-button.js
* Foxtrick shows forum preference link on forum pages
* @author convinced, ryanli
*/

var FoxtrickShowForumPrefButton = {
	MODULE_NAME : "ShowForumPrefButton",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumViewThread','forumOverView','forumDefault'),

	run : function(doc) {
		var myForums = doc.getElementById("myForums");
		if (!myForums)
			return;
		var separator = doc.createElement("div");
		separator.className = "borderSeparator";
		var strong = doc.createElement("strong");
		var link = doc.createElement("a");
		link.href = "/MyHattrick/Preferences/ForumSettings.aspx";
		link.textContent = Foxtrickl10n.getString("forum.preferences");
		strong.appendChild(link);
		myForums.appendChild(separator);
		myForums.appendChild(strong);
	}
};
Foxtrick.util.module.register(FoxtrickShowForumPrefButton);
