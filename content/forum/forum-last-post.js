'use strict';
/**
 * forum-last-post.js
 * Foxtrick replaces the links on forum thread list to last posting of read threads
 * @author spambot
 */

Foxtrick.modules['ForumLastPost'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forum', 'forumSettings'],
	OPTIONS: ['lastpage'],

	run: function(doc) {
		this._change(doc);
	},

	change: function(doc) {
		this._change(doc);
	},

	_change: function(doc) {
		if (Foxtrick.isPage(doc, 'forum')) {
			var perpage = Foxtrick.Prefs.getInt('perpage');
			if (!perpage)
				perpage = 20;

			var lastpage = Foxtrick.Prefs.isModuleOptionEnabled('ForumLastPost', 'lastpage');

			var changeLinks = function(rowClass, countClass, linkClass) {
				var rows = doc.getElementsByClassName(rowClass);
				Foxtrick.forEach(function(row) {
					var div = row.getElementsByClassName(countClass)[0];
					var postCt = div.textContent.trim();
					if (/\//.test(postCt))
						// unread
						return;

					var url = row.querySelector('.' + linkClass + ' a');
					if (url.getElementsByTagName('strong').length) {
						// this thread is open now!
						// default to first post
						return;
					}

					var postNum = parseInt(postCt, 10);

					if (lastpage)
						postNum = postNum - perpage + 1;
					if (postNum < 1)
						postNum = 1;

					url.href = url.href.replace(/n=\d+/i, 'n=' + postNum);
				}, rows);
			};

			// sidebar thread list
			changeLinks('threadItem', 'threadInfo', 'url');
			// last-viewed thread list
			changeLinks('folderitem', 'fplThreadInfo', 'fplLongThreadName');
		}
		else {
			var selectId = 'ctl00_ctl00_CPContent_CPMain_ucForumPreferences_ddlMessagesPerPage';
			var select = doc.getElementById(selectId);
			if (!select)
				return;

			var ct = parseInt(select.value, 10);
			Foxtrick.Prefs.setInt('perpage', ct);
		}
	}
};
