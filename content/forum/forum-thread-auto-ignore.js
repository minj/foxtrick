'use strict';
/**
 * forum-thread-auto-ignore.js
 * Foxtrick Leave Conference module
 * @author convincedd
 */

Foxtrick.modules.ForumThreadAutoIgnore = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forum'],
	OPTIONS: ['Tags', 'Whitelist_ThreadIDs'],
	OPTION_EDITS: true,

	run: function(doc) {
		var tagmarkers = [['\\[', '\\]'], ['{', '}'], ['\\[', '}'], ['{', '\\]']];
		// any more known?
		// blacklist tags
		var tags = null;
		// whitelist thread ids
		var whitelist = null;
		// thread id which is currently processed
		var deletingThreadId = -1;

		var checkThreads = function() {
			if (!FoxtrickPrefs.isModuleOptionEnabled('ForumThreadAutoIgnore', 'Tags'))
				return;
			var tags_string = FoxtrickPrefs.getString('module.ForumThreadAutoIgnore.Tags_text');
			if (!tags_string)
				return;

			// get tags. comma seperated in the prefs
			tags = tags_string.split(',');
			for (var i = 0; i < tags.length; ++i) {
				tags[i] = tags[i].replace(/^\s+/, ''); // leading space removed
				tags[i] = tags[i].replace(/\s+$/, ''); // trailing space removed
			}

			// get whitelisted threadIDs. comma seperated in the prefs
			if (FoxtrickPrefs.isModuleOptionEnabled('ForumThreadAutoIgnore',
			    'Whitelist_ThreadIDs')) {
				var whitelist_string =
					FoxtrickPrefs.getString('module.ForumThreadAutoIgnore.Whitelist_ThreadIDs_text');
				if (whitelist_string) {
					whitelist = whitelist_string.split(',');
					for (var i = 0; i < whitelist.length; ++i) {
						whitelist[i] = whitelist[i].replace(/^\s+/, ''); // leading space removed
						whitelist[i] = whitelist[i].replace(/\s+$/, ''); // trailing space removed
						 //Foxtrick.dump(whitelist[i]+ '\n');
					}
				}
			}

			var myForums = doc.getElementById('myForums');
			var threadItems = myForums.getElementsByClassName('threadItem');
			for (var i = 0; i < threadItems.length; ++i) {
				var url = threadItems[i].getElementsByClassName('url')[0];

				if (url == null)
					continue;

				var a = url.getElementsByTagName('a')[0];
				for (var j = 0; j < tagmarkers.length; ++j) {
					for (var k = 0; k < tags.length; ++k) {
						var reg = new RegExp(tagmarkers[j][0] + tags[k] + tagmarkers[j][1], 'i');
						if (a.textContent.search(reg) != -1) {
							// only autoignore if there is ht's ignore option
							var ignore = threadItems[i].getElementsByClassName('ignore')[0];
							if (ignore) {
								var thread_id = a.href.match(/\/Forum\/Read.aspx\?t=(\d+)/)[1];
								// check whitelist
								var whitelisted = false;
								if (whitelist_string) {
									for (var l = 0; l < whitelist.length; ++l) {
										if (whitelist[l] == thread_id) {
											whitelisted = true;
											continue;
										}
									}
								}
								if (whitelisted)
									continue;

								// check if finished deleting the last one. if ids match, the last
								// delet order isn't finished. come back with next onchange
								if (thread_id == deletingThreadId)
									return;
								deletingThreadId = thread_id;

								// ignore thread using ht's javascript link. need to use the
								// webpage's injected script function
								var func = ignore.getAttribute('onclick');
								doc.location.href = func;
								Foxtrick.log('autoignore ' + tags[k] + ': ' + a.textContent + '\n');

								// only one at a time. recheck after page has changed
								return;
							}
						}
					}
				}
			}
		};
		checkThreads();
		Foxtrick.listen(doc.getElementById('ctl00_ctl00_CPContent_ucLeftMenu_' +
		                'pnlLeftMenuScrollContent'), 'DOMSubtreeModified', checkThreads, true);
	}
};
