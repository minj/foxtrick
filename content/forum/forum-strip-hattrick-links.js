/**
* forumchangepstangelinks.js
* Foxtrick Copies post id to clipboard
* @author convinced, LA-MJ
*/

'use strict';

Foxtrick.modules['ForumStripHattrickLinks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: [
		'forumWritePost', 'messageWritePost', 'guestbook', 'announcementsWrite',
		'newsLetter', 'mailNewsLetter', 'ntNewsLetter', 'helpContact',
		'forumSettings', 'forumModWritePost', 'ticket', 'forumViewThread',
	],
	OPTIONS: ['NoConfirmStripping'],
	NICE: -1, // needs to be before forum preview for old submit button (order) detection

	changeLinks: function(ev) {
		/** @type {HTMLAnchorElement} */
		let a = ev.target;
		if (a.nodeName == 'A' && a.href.startsWith('foxtrick://'))
			a.href = a.href.replace(/^foxtrick:\/\//, Foxtrick.InternalPath);
	},

	/** @param {document} doc */
	run: function(doc) {
		const module = this;
		const URLs = [
			{
				reg: /\[link=https?:\/\/(www(\d+)?|stage)\.hattrick\.(org|ws|bz|uol\.com\.br|interia\.pl|name|fm)(\/.+?)\]/g,
				repl: '[link=$4]',
			},

			// safari nightly
			{
				reg: /\[link=safari-extension:\/\/www\.foxtrick\.org-[\w\d]+\/[\w\d]+\/content\//g,
				repl: '[link=foxtrick://',
			},

			// official chrome
			{
				reg: /\[link=chrome-extension:\/\/bpfbbngccefbbndginomofgpagkjckik\/content\//g,
				repl: '[link=foxtrick://',
			},

			// official beta chrome
			{
				reg: /\[link=chrome-extension:\/\/bcbhbklnhonhojfmkobhhjkfaggkoali\/content\//g,
				repl: '[link=foxtrick://',
			},

			// foxtrick.org chrome (beta/release)
			{
				reg: /\[link=chrome-extension:\/\/gpfggkkkmpaalfemiafhfobkfnadeegj\/content\//g,
				repl: '[link=foxtrick://',
			},
		];

		if (Foxtrick.platform == 'Chrome') {
			// this will add random dev-mode URLs
			// in web-ext ids are always generated randomly
			try {
				let url = chrome.runtime.getURL('content/');
				let reUrl = Foxtrick.strToRe(url);
				URLs.push({
					reg: new RegExp(`\\[link=${reUrl}`, 'g'),
					repl: '[link=foxtrick://',
				});
			}
			catch (e) {
				Foxtrick.log(e.message);
			}
		}

		const noConfirm = Foxtrick.Prefs.isModuleOptionEnabled(module, 'NoConfirmStripping');
		const confirmMsg = Foxtrick.L10n.getString('ForumStripHattrickLinks.ask');

		let mainBody = doc.getElementById('mainBody');
		if (!mainBody)
			return;

		Foxtrick.listen(mainBody, 'mousedown', module.changeLinks, true);

		if (Foxtrick.isPage(doc, 'forumViewThread'))
			return;

		/** @type {HTMLTextAreaElement} */
		let textarea = doc.querySelector('#mainBody textarea');
		if (!textarea)
			return;

		let scope = textarea.closest('.info, .boxBody');
		let target = Foxtrick.getSubmitButton(scope);

		if (!target)
			return;

		// add submit listener
		Foxtrick.onClick(target, function() {
			/** @type {HTMLTextAreaElement} */
			const textarea = doc.querySelector('#mainBody textarea');
			let hasUrl = Foxtrick.any(u => u.reg.test(textarea.value), URLs);
			if (!hasUrl)
				return;

			// eslint-disable-next-line no-alert
			if (noConfirm || confirm(confirmMsg)) {
				let val = textarea.value;
				for (let u of URLs)
					val = val.replace(u.reg, u.repl);

				textarea.value = val;
			}
		});
	},
};
