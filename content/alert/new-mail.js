"use strict";
/**
 * new-mail.js
 * Script which makes the new mails more visible
 * @author htbaumanns, ryanli
 */

Foxtrick.util.module.register({
	MODULE_NAME : "NewMail",
	MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : ["all"],
	OPTIONS : ["NotifyMail", "NotifyForum"],

	CSS : Foxtrick.InternalPath + "resources/css/new-mail.css",

	run : function(doc) {
		var oldCount = Foxtrick.sessionGet( {"mailCount":0, "forumCount":0} );
		var oldMailCount = oldCount.mailCount;
		var oldForumCount = oldCount.forumCount;

		var menu = doc.getElementById("menu");
		// mail count within My Hattrick link
		var myHt = menu.getElementsByTagName("a")[0];
		if (myHt.getElementsByTagName("span").length) {
			var mailCountSpan = myHt.getElementsByTagName("span")[0];
			mailCountSpan.className = "ft-new-mail";
			var newMailCount = Number(mailCountSpan.textContent.match(/\d+/)[0]);
		}
		else {
			// no unread mails
			var newMailCount = 0;
		}
		Foxtrick.sessionSet("mailCount", newMailCount);
		if (FoxtrickPrefs.isModuleOptionEnabled("NewMail", "NotifyMail")
			&& newMailCount > oldMailCount) {
			Foxtrick.util.notify.create(Foxtrickl10n.getString("notify.newMail").replace(/%s/, newMailCount), 'http://'+doc.location.host+'/MyHattrick/Inbox/Default.aspx');
		}

		// mail count in left menu
		var subMenu = doc.getElementsByClassName("subMenu")[0];
		if (subMenu) {
			var subMenuBox = subMenu.getElementsByClassName("subMenuBox")[0];
			var listItems = subMenuBox.getElementsByTagName("li");
			var mailCountItems = Foxtrick.filter(function(n) {
				return n.getElementsByTagName("span").length > 0;
			}, listItems);
			if (mailCountItems.length) {
				var mailCount = mailCountItems[0].getElementsByTagName("span")[0];
				mailCount.className = "ft-new-mail";
			}
		}

		// new forum message
		var forum = menu.getElementsByTagName("a")[3];
		if (forum.textContent.indexOf("(") > -1) {
			// has new message, no span this time, we need to add it
			forum.innerHTML = forum.innerHTML.replace(
				/(\(\d+\))/,
				"<span class=\"ft-new-forum-msg\">$1</span>"
			);
			var newForumCount = Number(forum.textContent.match(/\d+/)[0]);
		}
		else {
			// no new forum messages
			var newForumCount = 0;
		}
		Foxtrick.sessionSet("forumCount", newForumCount);
		if (FoxtrickPrefs.isModuleOptionEnabled("NewMail", "NotifyForum")
			&& newForumCount > oldForumCount) {
			Foxtrick.util.notify.create(Foxtrickl10n.getString("notify.newForumMessage").replace(/%s/, newForumCount), 'http://'+doc.location.host+'/Forum/Default.aspx?actionType=refresh');
		}
 	}
});
