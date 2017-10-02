'use strict';
/**
* forum-change-posts-modules.js
* module collection of forum-change-posts.js
* @author convinced
*/

Foxtrick.modules['FormatPostingText'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: [
		'forumWritePost', 'messageWritePost', 'guestbook',
		'announcementsView', 'announcementsWrite',
		'teamPage',
		'newsLetter', 'mailNewsLetter', 'ntNewsLetter',
		'forumModWritePost'
	],
	OPTIONS: ['NestedQuotesAsSpoilers'],
	OPTION_EDITS: true,

	run: function(doc) {
		// format view
		var VIEW_PAGES = [
			'forumWritePost', 'messageWritePost', 'guestbook', // view + edit
			'announcementsView', 'teamPage' // view-only
		];
		if (Foxtrick.any(function(page) { return Foxtrick.isPage(doc, page); }, VIEW_PAGES)) {
			try {
				var messages;
				if (Foxtrick.isPage(doc, 'forumWritePost'))
					messages = doc.getElementsByClassName('message');
				else if (Foxtrick.isPage(doc, 'teamPage'))
					messages = doc.getElementsByClassName('mainBox');
				else
					messages = doc.getElementsByClassName('feedItem');

				Foxtrick.forEach(function(message) {
					Foxtrick.renderPre(message);
				}, messages);
			}
			catch (e) {
				Foxtrick.log('FormatPostingText: FORMAT TEXT ', e);
			}
		}
		// unescape edit area
		var textarea = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
		if (textarea)
			textarea.value = Foxtrick.unescapePre(textarea.value);

		// add to all targets. send button unclear (eg MyHattrick/Inbox/Default.
		// aspx?actionType=readMail) . doesn't harm to add it to all
		var targets = doc.querySelectorAll('#mainBody input[type="submit"]');
		var handler = function(ev) {
			var doc = ev.target.ownerDocument;
			var textarea = doc.querySelector('#mainBody textarea');
			if (textarea) {
				// remove escaping if any (e. g. from quote tag)
				var value = Foxtrick.unescapePre(textarea.value);
				// reapply correct escaping
				textarea.value = Foxtrick.escapePre(value);
			}
		};
		Foxtrick.forEach(function(target) {
			Foxtrick.onClick(target, handler);
		}, targets);
	}
};


Foxtrick.modules['CopyPostID'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread']
};


/**
* forumcopyposting.js
* Copies posting to clipboard
* @author convinced
*/

Foxtrick.modules['CopyPosting'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread'],
};


/**
 * forumalterheaderline.js
 * Truncate long nicks in forum posts
 * @author larsw84/convinced
 */

Foxtrick.modules['ForumAlterHeaderLine'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread'],
	OPTIONS: [
		'SingleHeaderLine',
		'CheckDesign',

		'TruncateLongNick', 'TruncateLeagueName', 'HideOldTime',

		'SmallHeaderFont',

		'ShortPostId',

		'ReplaceSupporterStar',
		'BookmarkHeaderSmall',

		'HighlightThreadOpener',
	],
	OPTIONS_CSS: [
		Foxtrick.InternalPath + 'resources/css/fixes/Forum_Header_Single.css',
		Foxtrick.InternalPath + 'resources/css/fixes/Forum_Header_CheckDesign.css',
		null, null, null,
		Foxtrick.InternalPath + 'resources/css/fixes/Forum_Header_Smallsize_Single.css',
		null,
		Foxtrick.InternalPath + 'resources/css/fixes/Forum_Header_RemoveSupporterStar.css',
		Foxtrick.InternalPath + 'resources/css/fixes/BookmarkHeaderSmall.css',
		null,
	],

	CSS: Foxtrick.InternalPath + 'resources/css/fixes/Forum_Header_Single_SimpleFix.css',
	ensureUnbrokenHeaders: function(doc) {
		if (Foxtrick.Prefs.isModuleEnabled('ForumAlterHeaderLine') &&
		    Foxtrick.Prefs.isModuleOptionEnabled('ForumAlterHeaderLine', 'CheckDesign')) {

			var headers = doc.getElementsByClassName('cfHeader');
			var badHeaders = Foxtrick.filter(function(header) {
				var header_right = header.getElementsByClassName('float_right')[0];
				return (header.offsetTop - header_right.offsetTop < -3);
			}, headers);
			Foxtrick.forEach(function(header) {
				header.setAttribute('class', 'cfHeader ftdoubleLine');
			}, badHeaders);
		}
	},
};


/**
 * forumredirmanagertoteam.js
 * redirect from manager to team page
 * @author convinced
 */

Foxtrick.modules['ForumRedirManagerToTeam'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread'],
};


/**
 * forummovelinks.js
 * Move Links in forum posts
 * @author larsw84
 */

Foxtrick.modules['MoveLinks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread'],
};


/**
 * forumadddefaultfacecard.js
 * Add default face card
 * @author larsw84
 */

Foxtrick.modules['AddDefaultFaceCard'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread'],
};
