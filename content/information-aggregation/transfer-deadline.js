/**
 * Transfer list deadline
 * @author spambot, ryanli
 */

FoxtrickTransferDeadline = {
	MODULE_NAME : "TransferDeadline",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["teamPageGeneral", "transferSearchResult", "playerdetail", "transfer"],
	CSS : Foxtrick.ResourcePath + "resources/css/transfer-deadline.css",

	run : function(page, doc) {
		// Check if deadline already set
		if (doc.getElementsByClassName("ft-deadline").length > 0)
			return;

		if (Foxtrick.isPage(Foxtrick.ht_pages["transferSearchResult"], doc))
			this.runTransferResult(doc);
		else if (Foxtrick.isPage(Foxtrick.ht_pages["playerdetail"], doc))
			this.runPlayerDetail(doc);
		else if (Foxtrick.isPage(Foxtrick.ht_pages["transfer"], doc))
			this.runPlayerList(doc);
		else if (Foxtrick.isPage(Foxtrick.ht_pages["teamPageGeneral"], doc))
			this.runPlayerList(doc);
	},

	change : function( page, doc ) {
		if (Foxtrick.isPage(Foxtrick.ht_pages["playerdetail"], doc))
			this.runPlayerDetail(doc);
	},

	processNode : function(node, htTime) {
		var deadline = Foxtrick.util.time.getDateFromText(node.textContent);
		if (deadline) {
			var countdown = Math.floor((deadline.getTime() - htTime) / 1000);
			if (!isNaN(countdown) && countdown >= 0) {
				var countdownText = Foxtrick.util.time.timeDifferenceToText(countdown);
				node.innerHTML += "<span class=\"smallText ft-deadline\">(" + countdownText + ")</span>";
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
