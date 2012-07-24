"use strict";
/**
 * Transfer list deadline
 * @author spambot, ryanli
 */

Foxtrick.modules["TransferDeadline"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["transferSearchResult", "playerDetails", "transfer", "bookmarks"],
	CSS : Foxtrick.InternalPath + "resources/css/transfer-deadline.css",

	run : function(doc) {
		// Check if deadline already set
		if (doc.getElementsByClassName("ft-deadline").length > 0)
			return;

		if (Foxtrick.isPage("transferSearchResult", doc))
			this.runTransferResult(doc);
		else if (Foxtrick.isPage("playerDetails", doc))
			this.runPlayerDetail(doc);
		else if (Foxtrick.isPage("transfer", doc))
			this.runPlayerList(doc);
		else if (Foxtrick.isPage("bookmarks", doc))
			this.runTransferResult(doc);
	},

	change : function(doc) {
		if (Foxtrick.isPage("playerDetails", doc))
			this.runPlayerDetail(doc);
	},

	processNode : function(node, htTime) {
		var doc = node.ownerDocument;
		var dateNode = Foxtrick.hasClass(node, "date") ? node : node.getElementsByClassName("date")[0];
		if (!dateNode)
			return;
		if (dateNode.hasAttribute("x-ht-date")) {
			// node displays local time instead of HT time as modified
			// in LocalTime, HT time is saved in attribute x-ht-date
			var deadline = new Date();
			deadline.setTime(dateNode.getAttribute("x-ht-date"));
		}
		else
			var deadline = Foxtrick.util.time.getDateFromText(dateNode.textContent);
		if (deadline) {
			var countdown = Math.floor((deadline.getTime() - htTime) / 1000);
			if (!isNaN(countdown) && countdown >= 0) {
				var countdownNode = doc.createElement('span');
				countdownNode.className = "smallText ft-deadline nowrap";
				countdownNode.textContent = "(" + Foxtrick.util.time.timeDifferenceToElement(doc, countdown).textContent + ")";
				Foxtrick.makeFeaturedElement(countdownNode, this);
				node.appendChild(countdownNode);
			}
		}
	},

	runTransferResult : function(doc) {
		var htDate = Foxtrick.util.time.getHtDate(doc);
		var htTime = htDate.getTime();
		var dates = doc.getElementsByClassName("date");
		for (var i = 0; i < dates.length; ++i)
			this.processNode(dates[i], htTime);
	},

	runPlayerList : function(doc) {
		var htDate = Foxtrick.util.time.getHtDate(doc);
		var htTime = htDate.getTime();
		var i = 0;
		var element;
		while (element = doc.getElementById("ctl00_ctl00_CPContent_CPMain_lstBids_ctrl" + (i++) + "_jsonDeadLine"))
			this.processNode(element, htTime);
	},

	runPlayerDetail : function(doc) {
		var htDate = Foxtrick.util.time.getHtDate(doc);
		var htTime = htDate.getTime();
		try {
			var div = doc.getElementById('ctl00_ctl00_CPContent_CPMain_updBid');
			var alert = div.getElementsByClassName("alert")[0];
			var selltime_elm = alert.getElementsByTagName("p")[0];
		}
		catch (e) {
			// these may not be present
		}
		if (!selltime_elm)
			return;

		// remove old deadlines
		var oldDeadline = selltime_elm.getElementsByClassName("ft-deadline");
		for (var i = 0; i < oldDeadline.length; ++i)
			oldDeadline[i].parentNode.removeChild(oldDeadline[i]);

		this.processNode(selltime_elm, htTime);
	}
};
