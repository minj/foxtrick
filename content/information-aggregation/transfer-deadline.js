/**
 * Transfer list deadline
 * @author spambot, ryanli
 */

'use strict';

Foxtrick.modules['TransferDeadline'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['transferSearchResult', 'playerDetails', 'transfer', 'bookmarks'],
	CSS: Foxtrick.InternalPath + 'resources/css/transfer-deadline.css',

	run: function(doc) {
		// Check if deadline already set
		if (doc.getElementsByClassName('ft-deadline').length > 0)
			return;

		if (Foxtrick.isPage(doc, 'transferSearchResult'))
			this.runTransferResult(doc);
		else if (Foxtrick.isPage(doc, 'playerDetails'))
			this.runPlayerDetail(doc);
		else if (Foxtrick.isPage(doc, 'transfer'))
			this.runPlayerList(doc);
		else if (Foxtrick.isPage(doc, 'bookmarks'))
			this.runTransferResult(doc);
	},

	change: function(doc) {
		if (Foxtrick.isPage(doc, 'playerDetails'))
			this.runPlayerDetail(doc);
		else if (Foxtrick.isPage(doc, 'bookmarks'))
			this.runTransferResult(doc);
	},

	processNode: function(node, userTime) {
		const MSECS = Foxtrick.util.time.MSECS_IN_SEC;

		var doc = node.ownerDocument;
		var dateNode = Foxtrick.hasClass(node, 'date') ? node : node.querySelector('.date');
		if (!dateNode)
			return;

		var deadline;
		if (dateNode.dataset.userDate) {
			// node displays local time instead of user time as modified
			// in LocalTime, user time is saved in attribute data-user-date
			deadline = new Date();
			deadline.setTime(dateNode.dataset.userDate);
		}
		else {
			deadline = Foxtrick.util.time.getDateFromText(dateNode.textContent);
		}

		if (deadline) {
			var countdown = Math.floor((deadline.getTime() - userTime) / MSECS);
			if (!isNaN(countdown) && countdown >= 0) {
				var countdownNode = doc.createElement('span');
				countdownNode.className = 'smallText ft-deadline nowrap';
				var span = Foxtrick.util.time.timeDiffToSpan(doc, countdown);
				countdownNode.textContent = '(' + span.textContent + ')';
				Foxtrick.makeFeaturedElement(countdownNode, this);
				node.appendChild(countdownNode);
			}
		}
	},

	runTransferResult: function(doc) {
		var userDate = Foxtrick.util.time.getDate(doc);
		var userTime = userDate.getTime();
		var dates = doc.getElementsByClassName('date');
		for (var i = 0; i < dates.length; ++i)
			this.processNode(dates[i], userTime);
	},

	runPlayerList: function(doc) {
		var userDate = Foxtrick.util.time.getDate(doc);
		var userTime = userDate.getTime();
		var i = 0;
		var MAIN = Foxtrick.getMainIDPrefix();
		var idPrefix = MAIN + 'lstBids_ctrl';
		var element;
		while ((element = doc.getElementById(idPrefix + i++ + '_jsonDeadLine')))
			this.processNode(element, userTime);
	},

	runPlayerDetail: function(doc) {
		if (Foxtrick.Pages.Player.wasFired(doc))
			return;

		var userDate = Foxtrick.util.time.getDate(doc);
		var userTime = userDate.getTime();
		var sellTimeEl;
		try {
			var div = Foxtrick.Pages.Player.getBidInfo(doc);
			var alert = div.getElementsByClassName('alert')[0];
			sellTimeEl = alert.getElementsByTagName('p')[0];
		}
		catch (e) {
			// these may not be present
		}
		if (!sellTimeEl)
			return;

		// remove old deadlines
		var oldDeadline = sellTimeEl.getElementsByClassName('ft-deadline');
		for (var i = 0; i < oldDeadline.length; ++i)
			oldDeadline[i].parentNode.removeChild(oldDeadline[i]);

		this.processNode(sellTimeEl, userTime);
	},
};
