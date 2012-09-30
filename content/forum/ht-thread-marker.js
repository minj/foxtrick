'use strict';
/**
 * ht-thread-marker.js
 * Marks threads created by HTs.
 * @author Mod-PaV
 */

Foxtrick.modules['HTThreadMarker'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forum'],
	CSS: Foxtrick.InternalPath + 'resources/css/ht-thread.css',

	run: function(doc) {
		this.ColorLatest(doc, 'threadContent', 'folderitem');

		var myForums = doc.getElementsByClassName('subMenuConf')[0];

		var folders = myForums.getElementsByClassName('forumFolder');
		for (var j = 0; j < folders.length; ++j) {
			var folderName = folders[j].getElementsByClassName('folderName')[0]
				.getElementsByTagName('a')[0].textContent;
			var divs = folders[j].getElementsByTagName('div');
			var cname;

			var i = 0, div;
			while (div = divs[++i]) {
				cname = div.getAttribute('class');
				if (cname == 'url') {
					var inner = div.childNodes[0];
					var strong = div.getElementsByTagName('strong');
					if (strong != null && strong[0] != null) {
						inner = strong[0];
					}
					inner = inner.firstChild.data;
					var title = div.childNodes[0].getAttribute('title').replace(inner, '');
					var poster = title.replace(folderName, '');

					if (poster.match(/ HT-\S+/)) {
						Foxtrick.addClass(div, 'ft-ht-thread');
					}
				}
			}
		}
	},

	change: function(doc) {
		this.run(doc);
	},

	ColorLatest: function(doc, id, classname) {
		var myForums = doc.getElementById(id);
		if (myForums) {
			var links = myForums.getElementsByTagName('table');

			for (var j = 0; j < links.length; j++) {
				var cname;

				if (links[j].rows.length == 0
					|| links[j].rows[0].cells.length == 0
					|| links[j].rows[0].cells[0].className.search('date') == -1)
					continue;

				for (var i = 0; i < links[j].rows.length; ++i) {
					if (links[j].rows[i].cells.length <= 1)
						continue;
					var node = links[j].rows[i].cells[1].childNodes[1];
					var title = node.getElementsByTagName('a')[0].title;
					if (title.match(/.* HT-[^\s]*$/i)) {
						Foxtrick.addClass(node, 'ft-ht-thread');
					}
				}
			}
		}
	}
};
