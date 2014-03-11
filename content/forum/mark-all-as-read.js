'use strict';
/**
 * mark-all-as-read.js
 * a button to mark threads in all forums as read
 * @author ryanli
 */

Foxtrick.modules['MarkAllAsRead'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread', 'forumOverview', 'forumDefault', 'forumWritePost'],
	CSS: Foxtrick.InternalPath + 'resources/css/mark-all-as-read.css',

	run: function(doc) {
		var threads = doc.getElementsByClassName('threadItem');
		if (threads.length == 0)
			return; // no threads!
		var threadLinks = Foxtrick.map(function(n) {
			//check if there are url or urlShort
			var urltest = n.getElementsByClassName('url');
			var urlclass = (urltest.length != 0) ? 'url' : 'urlShort';
			return n.getElementsByClassName(urlclass)[0].getElementsByTagName('a')[0];

		}, threads);
		var threadIds = Foxtrick.map(function(n) {
			return n.href.match(/\/Forum\/Read\.aspx\?t=(\d+)/)[1];
		}, threadLinks);
		var threadList = threadIds.join(', ');

		var container = doc.createElement('span');
		container.className = 'ft-mark-all-as-read';
		container.title = Foxtrick.L10n.getString('MarkAllAsRead.title');

		container = Foxtrick.makeFeaturedElement(container, this);

		if (Foxtrick.util.layout.isStandard(doc))
			var target = doc.getElementById('myForums').getElementsByClassName('forumTabs')[0];
		else
			var target = doc.getElementById('myForums').previousSibling;
		target.appendChild(container);
		var js =
			'document.getElementsByClassName("ft-mark-all-as-read")[0].' +
				'addEventListener("click", function() {\n' +
					'__doPostBack("ctl00$ctl00$CPContent$ucLeftMenu$ucNewPosts", "mrk|%s");\n' +
				'}, false);';
		js = js.replace(/%s/, threadList);
		Foxtrick.util.inject.js(doc, js, 'ft-mark-all-as-read');
	}
};
