'use strict';
/**
* forum-change-posts-modules.js
* module collection of forum-change-posts.js
* @author convinced
*/

Foxtrick.modules['FormatPostingText'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: [
		'forumWritePost', 'messageWritePost', 'guestbook', 'announcements',
		'newsLetter', 'mailNewsLetter', 'forumModWritePost'
	],
	OPTIONS: ['NestedQuotesAsSpoilers'],
	OPTION_EDITS: true,

	run: function(doc) {
		var format = this.format;
		var reformat = this.reformat;
		//format view
		if (Foxtrick.isPage('messageWritePost', doc)
			|| Foxtrick.isPage('guestbook', doc)
			|| Foxtrick.isPage('forumWritePost', doc)) {
			try {
				if (Foxtrick.isPage('forumWritePost', doc))
					var messages = doc.getElementsByClassName('message');
				else
					var messages = doc.getElementsByClassName('feedItem');
				for (var i = 0; i < messages.length; i++) {
					var count_pre = Foxtrick.substr_count(messages[i].textContent, '[pre');
					var org = [
						/\[pre\](.*?)\[\/pre\]/gi ,
						new RegExp(String.fromCharCode(8288), 'gi')
					];
					var rep = ["<pre class='ft-dummy'>$1</pre>", ''];
					for (var j = 0; j <= count_pre; j++) {
						for (var k = 0; k < org.length; k++) {
							messages[i].innerHTML = messages[i].innerHTML.replace(org[k], rep[k]);
						}
					}
				}
			} catch (e_format) {
				Foxtrick.dump('FormatPostingText: FORMAT TEXT ' + e_format + '\n');
			}
		}
		else { // reformat edit
			var textarea = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
			if (textarea) textarea.value = reformat(textarea.value);
		}

		// add to all targets. send button unclear (eg MyHattrick/Inbox/Default.
		// aspx?actionType=readMail) . doesn't harm to add it to all
		var targets = doc.getElementById('mainBody').getElementsByTagName('input');  // Forum
		for (var i = 0; i < targets.length; ++i) {
			if (targets[i].type == 'submit') {
				Foxtrick.onClick(targets[i], function() {
					var textarea = doc.getElementById('mainBody')
						.getElementsByTagName('textarea')[0];
					textarea.value = format(textarea.value);
				});
			}
		}
	},
	// FIXME - also used by other modules, should extract to util/
	reformat: function(string) {
		// using u2060 'word joiner' zero-width space
		var org = [
			/\[pre\](.*?)\[\/pre\]/gi ,
			new RegExp(String.fromCharCode(8288), 'gi')
		];
		var rep = ['[pre]$1[/pre]', ''];
		var count_pre = Foxtrick.substr_count(string, '[pre');
		for (var j = 0; j <= count_pre; j++) {
			for (var k = 0; k < org.length; k++) {
					string = string.replace(org[k], rep[k]);
			}
		}
		return string;
	},
	// FIXME - also used by other modules, should extract to util/
	format: function(string) {
		string = string.replace(new RegExp(String.fromCharCode(8288), 'gi'), '')
			.replace(/(\<)(\S)/gi, '<' + String.fromCharCode(8288) + '$2');

			var vstring = string.split('[pre]');
			var r_string = vstring[0];
			var remain = 0;
			for (var j = 1; j < vstring.length; j++) {
				r_string += '[pre]';
				var ivstring = vstring[j].split('[/pre]');
				var num_do = Math.min(ivstring.length - 1, remain + 1);
				remain -= (num_do - 1);
				for (var i = 0; i < num_do; ++i)
					r_string += ivstring[i].replace(/\[/g, '[' + String.fromCharCode(8288)) + '[/pre]';
				for (var k = num_do; k < ivstring.length; k++) {
					r_string += ivstring[k];
				}
			}
		return r_string;
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
		'SingleHeaderLine', 'CheckDesign', 'TruncateLongNick', 'TruncateLeagueName', 'HideOldTime',
		'SmallHeaderFont', 'ShortPostId', 'ReplaceSupporterStar', 'BookmarkHeaderSmall',
		'HighlightThreadOpener'
	],
	OPTIONS_CSS: [
		Foxtrick.InternalPath + 'resources/css/fixes/Forum_Header_Single.css',
		Foxtrick.InternalPath + 'resources/css/fixes/Forum_Header_CheckDesign.css',
		'', '', '',
		Foxtrick.InternalPath + 'resources/css/fixes/Forum_Header_Smallsize_Single.css',
		'',
		Foxtrick.InternalPath + 'resources/css/fixes/Forum_Header_RemoveSupporterStar.css',
		Foxtrick.InternalPath + 'resources/css/fixes/BookmarkHeaderSmall.css'
	],

	CSS: Foxtrick.InternalPath + 'resources/css/fixes/Forum_Header_Single_SimpleFix.css'
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
