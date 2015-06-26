'use strict';
/**
* forumchangepstangelinks.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

Foxtrick.modules['ForumStripHattrickLinks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: [
		'forumWritePost', 'messageWritePost', 'guestbook', 'announcements',
		'newsLetter', 'mailNewsLetter', 'ntNewsLetter',
		'forumModWritePost', 'forumViewThread'
	],
	OPTIONS: ['NoConfirmStripping'],
	NICE: -1, //  needs to be before forum preview for old submit button (order) detection

	changeLinks: function(ev) {
		var a = ev.target;
		if (a.nodeName == 'A' && a.href.search('foxtrick://') != -1) {
			a.href = a.href.replace('foxtrick://', Foxtrick.InternalPath);

			// ff doesn't wanna open the changed href
			if (Foxtrick.arch == 'Gecko')
				Foxtrick.newTab(a.href);
		}
	},

	run: function(doc) {
		var URLs = [
			{
				reg: /\[link=https?:\/\/(www(\d+)?|stage)\.hattrick\.(org|ws|bz|uol\.com\.br|interia\.pl|name|fm)(\/.+?)\]/g,
				repl: '[link=$4]'
			},
			// safari nightly
			{
				reg: /\[link=safari-extension:\/\/www\.foxtrick\.org-[\w\d]+\/[\w\d]+\/content\//g,
				repl: '[link=foxtrick://'
			},
			// official chrome
			{
				reg: /\[link=chrome-extension:\/\/bpfbbngccefbbndginomofgpagkjckik\/content\//g,
				repl: '[link=foxtrick://'
			},
			// official beta chrome
			{
				reg: /\[link=chrome-extension:\/\/bcbhbklnhonhojfmkobhhjkfaggkoali\/content\//g,
				repl: '[link=foxtrick://'
			},
			// foxtrick.org chrome (beta/release)
			{
				reg: /\[link=chrome-extension:\/\/gpfggkkkmpaalfemiafhfobkfnadeegj\/content\//g,
				repl: '[link=foxtrick://'
			},
			// all gecko
			{
				reg: /\[link=chrome:\/\/foxtrick\/content\//g,
				repl: '[link=foxtrick://'
			}
		];

		Foxtrick.listen(doc.getElementById('mainBody'), 'mousedown', this.changeLinks, true);

		if (Foxtrick.isPage(doc, 'forumViewThread'))
			return;

		var targets = doc.getElementById('mainBody').getElementsByTagName('input');  // Forum
		var target = targets[targets.length - 1];
		if (Foxtrick.isPage(doc, 'forumWritePost'))
			target = targets[targets.length - 2];
		if (Foxtrick.isPage(doc, 'guestbook'))
			target = targets[1];
		if (target) {
			// add submit listener
			Foxtrick.onClick(target, function() {
				// assume svn users post only FT links
				if (Foxtrick.branch() == 'dev')
					URLs.push({
						reg: /\[link=chrome-extension:\/\/\w+\/content\//g,
						repl: '[link=foxtrick://'
					});
				var textarea = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
				var has_url = false;
				for (var i = 0; i < URLs.length; ++i) {
					if (URLs[i].reg.test(textarea.value))
						has_url = true;
				}
				if (has_url
					&& (Foxtrick.Prefs.isModuleOptionEnabled('ForumStripHattrickLinks',
					    'NoConfirmStripping')
						|| confirm(Foxtrick.L10n.getString('ForumStripHattrickLinks.ask')))) {
					for (var i = 0; i < URLs.length; ++i) {
						textarea.value = textarea.value.replace(URLs[i].reg, URLs[i].repl);
					}
				}
			});
		}
	}
};
