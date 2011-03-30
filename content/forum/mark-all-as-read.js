/**
 * mark-all-as-read.js
 * a button to mark threads in all forums as read
 * @author ryanli
 */

var FoxtrickMarkAllAsRead = {
	MODULE_NAME : "MarkAllAsRead",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : ["forumViewThread", "forumOverView", "forumDefault"],
	CSS : Foxtrick.ResourcePath + "resources/css/mark-all-as-read.css",

	run : function(page, doc) {
		var threads = doc.getElementsByClassName("threadItem");
		if (threads.length == 0)
			return; // no threads!
		var threadLinks = Foxtrick.map(threads, function(n) {
			return n.getElementsByClassName("url")[0].getElementsByTagName("a")[0];
		});
		var threadIds = Foxtrick.map(threadLinks, function(n) {
			return n.href.match(/\/Forum\/Read\.aspx\?t=(\d+)/)[1];
		});
		var threadList = threadIds.join(",");
		var addr = "javascript:__doPostBack('ctl00$ctl00$CPContent$ucLeftMenu$ucNewPosts','mrk|%s')".replace(/%s/, threadList);

		var container = doc.createElement("div");
		container.className = "ft-mark-all-as-read";
		container.title = Foxtrickl10n.getString("MarkAllAsRead.title");
		container.setAttribute("onclick", addr);

		var forumTabs = doc.getElementsByClassName("forumTabs")[0];
		forumTabs.appendChild(container);
	}
};
