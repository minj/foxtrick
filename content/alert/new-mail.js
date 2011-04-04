/**
 * new-mail.js
 * Script which makes the new mails more visible
 * @author htbaumanns, ryanli
 */

var FoxtrickNewMail = {
	MODULE_NAME : "NewMail",
	MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : ["all"],

	CSS : Foxtrick.ResourcePath + "resources/css/new-mail.css",

	run : function(page, doc) {
		var menu = doc.getElementById("menu");
		// mail count within My Hattrick link
		var myHt = menu.getElementsByTagName("a")[0];
		if (myHt.getElementsByTagName("span").length) {
			var mailCountSpan = myHt.getElementsByTagName("span")[0];
			mailCountSpan.className = "ft-new-mail";
		}
		// mail count in left menu
		var subMenu = doc.getElementsByClassName("subMenu")[0];
		var subMenuBox = subMenu.getElementsByClassName("subMenuBox")[0];
		var listItems = subMenuBox.getElementsByTagName("li");
		var mailCountItems = Foxtrick.filter(listItems, function(n) {
			return n.getElementsByTagName("span").length > 0;
		});
		if (mailCountItems.length) {
			var mailCount = mailCountItems[0].getElementsByTagName("span")[0];
			mailCount.className = "ft-new-mail";
		}
		// new forum message
		var forum = menu.getElementsByTagName("a")[3];
		if (forum.textContent.indexOf("(") > -1) {
			// has new message, no span this time, we need to add it
			forum.innerHTML = forum.innerHTML.replace(
				/^(.+)(\(\d+\))(.+)$/,
				"$1<span class=\"ft-new-forum-msg\">$2</span>$3"
			);
		}
 	}
};
