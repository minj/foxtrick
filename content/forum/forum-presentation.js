/**
 * Forum Presentation Fixes
 * @author spambot, ljushaff
 */

'use strict';

Foxtrick.modules.ForumPresentation = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: [
		'forum', 'forumViewThread', 'forumOverview', 'forumDefault', 'forumWritePost',
		'forumModWritePost',
	],

	OPTIONS: [
		'HideFlagsInForumHeader',
		'HideLeagueInForumHeader',
		'Forum_Spoiler_reveal',
		'Forum_NewPostsInBracket',
		'Forum_Link_Grey_Icons',
		'moved_avatarinfo_fix',
	],
	OPTIONS_CSS: [
		Foxtrick.InternalPath + 'resources/css/fixes/HideFlagsInForumHeader.css',
		Foxtrick.InternalPath + 'resources/css/fixes/HideLeagueInForumHeader.css',
		Foxtrick.InternalPath + 'resources/css/fixes/Forum_Spoiler_reveal.css',
		Foxtrick.InternalPath + 'resources/css/fixes/Forum_NewPostsInBracket.css',
		Foxtrick.InternalPath + 'resources/css/fixes/Forum_Link_Grey_Icons.css',
		Foxtrick.InternalPath + 'resources/css/fixes/moved_avatarinfo_fix.css',
	],

	/** @param {document} doc */
	run: function(doc) {
		const module = this;
		if (!Foxtrick.Prefs.isModuleOptionEnabled(module, 'Forum_NewPostsInBracket'))
			return;

		/** @type {NodeListOf<HTMLElement>} */
		let elements = doc.querySelectorAll('.threadInfo');
		for (let element of elements) {
			Foxtrick.makeFeaturedElement(element, module);
			for (let text of Foxtrick.getTextNodes(element))
				if (text.parentElement == element)
					element.removeChild(text);
		}

		// fplThreadInfo should be added to but that's dynamic in default -> more tricky
	},
};
