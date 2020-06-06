/**
 * Fixes for css isues
 * @author spambot, ljushaff, ryanli
 */

'use strict';

Foxtrick.modules.FixcssProblems = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	OUTSIDE_MAINBODY: true,
	PAGES: ['all'],

	OPTIONS: [
		'RTL_Fixes',
		'MatchReportRatingsFontFix',
		'RemoveForumSneakPeak',
	],

	OPTIONS_CSS: [
		Foxtrick.InternalPath + 'resources/css/fixes/RTL_Fixes.css',
		Foxtrick.InternalPath + 'resources/css/fixes/MatchReportRatingsFontFix.css',
		Foxtrick.InternalPath + 'resources/css/fixes/RemoveForumSneakPeak.css',
	],
};
