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
		// any more known?
		var tagmarkers = [['\\[', '\\]'], ['{', '}'], ['\\[', '}'], ['{', '\\]']];

		// blacklist tags
		var tags = null;

		// whitelist thread ids
		var whitelist = null;

		// thread id which is currently processed
		var deletingThreadId = -1;

		// eslint-disable-next-line complexity
		var checkThreads = function() {
			if (!Foxtrick.Prefs.isModuleOptionEnabled('ForumThreadAutoIgnore', 'Tags'))
				return;

			let tagsString = Foxtrick.Prefs.getString('module.ForumThreadAutoIgnore.Tags_text');
			if (!tagsString)
				return;

			// get tags. comma seperated in the prefs
			tags = tagsString.split(',');
			for (let i = 0; i < tags.length; ++i) {
				tags[i] = tags[i].replace(/^\s+/, ''); // leading space removed
				tags[i] = tags[i].replace(/\s+$/, ''); // trailing space removed
			}

			let whitelistString = '';

			// get whitelisted threadIDs. comma seperated in the prefs
			if (Foxtrick.Prefs.isModuleOptionEnabled('ForumThreadAutoIgnore',
			    'Whitelist_ThreadIDs')) {
				let id = 'module.ForumThreadAutoIgnore.Whitelist_ThreadIDs_text';
				whitelistString = Foxtrick.Prefs.getString(id);
				if (whitelistString) {
					whitelist = whitelistString.split(',');
					for (let i = 0; i < whitelist.length; ++i) {
						whitelist[i] = whitelist[i].replace(/^\s+/, ''); // leading space removed
						whitelist[i] = whitelist[i].replace(/\s+$/, ''); // trailing space removed
					}
				}
			}

			var myForums = doc.getElementById('myForums');
			var threadItems = myForums.getElementsByClassName('threadItem');
			for (let i = 0; i < threadItems.length; ++i) {
				let url = threadItems[i].getElementsByClassName('url')[0];

				if (url == null)
					continue;

				let a = url.getElementsByTagName('a')[0];
				for (let j = 0; j < tagmarkers.length; ++j) {
					for (let k = 0; k < tags.length; ++k) {
						let tagMatches = false;
						try {
							let re = Foxtrick.strToRe(tags[k]);
							let reg = new RegExp(tagmarkers[j][0] + re + tagmarkers[j][1], 'i');
							tagMatches = reg.test(a.textContent);
						}
						catch (e) {}

						if (!tagMatches)
							continue;

						// only autoignore if there is ht's ignore option
						let ignore = threadItems[i].getElementsByClassName('ignore')[0];
						if (!ignore)
							continue;

						let threadId = a.href.match(/\/Forum\/Read.aspx\?t=(\d+)/)[1];

						// check whitelist
						let whitelisted = false;
						if (whitelistString) {
							for (let l = 0; l < whitelist.length; ++l) {
								if (whitelist[l] == threadId)
									whitelisted = true;
							}
						}
						if (whitelisted)
							continue;

						// check if finished deleting the last one. if ids match, the last
						// delet order isn't finished. come back with next onchange
						if (threadId == deletingThreadId)
							return;
						deletingThreadId = threadId;

						// ignore thread using ht's javascript link. need to use the
						// webpage's injected script function
						let func = ignore.getAttribute('onclick');
						doc.location.href = func;
						Foxtrick.log('autoignore ' + tags[k] + ': ' + a.textContent + '\n');

						// only one at a time. recheck after page has changed
						return;
					}
				}
			}
		};

		checkThreads();
		let id = 'ctl00_ctl00_CPContent_ucLeftMenu_pnlLeftMenuScrollContent';
		Foxtrick.onChange(doc.getElementById(id), checkThreads);
	},
};
