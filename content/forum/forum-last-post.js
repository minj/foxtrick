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

			var perpage = FoxtrickPrefs.getInt('perpage');
			if (perpage == null) perpage = 20;
			var lastpage = (FoxtrickPrefs.isModuleOptionEnabled('ForumLastPost', 'lastpage'));
			var divs = doc.getElementsByClassName('threadInfo');
			for (var i = 0; i < divs.length; i++) {
				var id = divs[i].textContent;
				if (id.search(/\//) > -1)
					continue;
				if (lastpage)
					id = id - perpage + 1;
				if (id < 1)
					id = 1;
				var url = divs[i].parentNode.parentNode.getElementsByTagName('a')[0];
				url.href = url.href.replace(/n=\d+/, 'n=' + id);
			}

			var pager = doc.getElementById('ctl00_ctl00_CPContent_CPMain_updLatestThreads');
			if (pager == null) return;
			var divs = doc.getElementsByClassName('fplThreadInfo');
			for (var i = 0; i < divs.length; i++) {
				var id = Foxtrick.trim(divs[i].textContent);
				if (id.search(/\//) > -1)
					continue;
				if (lastpage) id = id - perpage + 1;
				if (id < 1) id = 1;
				var url = divs[i].parentNode.parentNode.getElementsByTagName('a')[0];
				url.href = url.href.replace(/n=\d+/, 'n=' + id);
			}
		}
		else {
			var select = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ddlMessagesPerPage');
			if (select == null) return;
			var id = select.options[select.selectedIndex].text;
			id = parseInt(id, 10);
			FoxtrickPrefs.setInt('perpage', id);
		}
	}
};
