'use strict';
/**
 * forum-last-post.js
 * Foxtrick replaces the links on forum thread list to last posting of read threads
 * @author spambot
 */

Foxtrick.modules['ForumLastPost'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forum', 'forumSettings'],
	OPTIONS: ['unlessOpen', 'lastpage'],

	run: function(doc) {
		this._change(doc);
	},

	change: function(doc) {
		this._change(doc);
	},

	_change: function(doc) {
		if (!Foxtrick.isPage(doc, 'forumSettings')) {
			var perpage = Foxtrick.Prefs.getInt('perpage');
			if (!perpage)
				perpage = 20;

			var unlessOpen = Foxtrick.Prefs.isModuleOptionEnabled('ForumLastPost', 'unlessOpen');
			var lastpage = Foxtrick.Prefs.isModuleOptionEnabled('ForumLastPost', 'lastpage');

			var changeLinks = function(rowClass, countClass, linkClass) {
				var rows = doc.getElementsByClassName(rowClass);
				Foxtrick.forEach(function(row) {
					var div = row.getElementsByClassName(countClass)[0];
					if (!div || div.querySelector('span[onclick]')) {
						// mark-read span -> unread thread
						return;
					}

					var url = row.querySelector('.' + linkClass + ' a');
					if (!url)
						return;

					if (url.querySelector('strong') && unlessOpen) {
						// this thread is open now!
						// default to first post
						return;
					}

					var postNum = parseInt(div.textContent.trim(), 10) || 1;

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
			var select = Foxtrick.getMBElement(doc, 'ucForumPreferences_ddlMessagesPerPage');
			if (!select)
				return;

			var ct = parseInt(select.value, 10);
			Foxtrick.Prefs.setInt('perpage', ct);
		}
	}
};
