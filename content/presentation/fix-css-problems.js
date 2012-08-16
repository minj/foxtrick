"use strict";
/**
 * Fixes for css isues
 * @author spambot, ljushaff, ryanli
 */

Foxtrick.modules["FixcssProblems"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["all"],

	OPTIONS : [
		"Forum_FoxLink_Headers",
		"Club_Menu_Teamnames",
		"Page_Minimum_Height",
		"RTL_Fixes",
		"ForumScrollBarFix",
		"MatchReportRatingsFontFix",
		"RemoveForumSneakPeak",
		"CalendarAutoMinHeight",
		"HideInvitation",
		"SkillbarsAdjust"
	],
	OPTIONS_CSS : [
		Foxtrick.InternalPath+"resources/css/fixes/Forum_FoxLink_Headers.css",
		Foxtrick.InternalPath+"resources/css/fixes/Club_Menu_Teamnames.css",
		Foxtrick.InternalPath+"resources/css/fixes/Page_Minimum_Height.css",
		Foxtrick.InternalPath+"resources/css/fixes/RTL_Fixes.css",
		Foxtrick.InternalPath+"resources/css/fixes/ForumScrollBarFix.css",
		Foxtrick.InternalPath+"resources/css/fixes/MatchReportRatingsFontFix.css",
		Foxtrick.InternalPath+"resources/css/fixes/RemoveForumSneakPeak.css",
		Foxtrick.InternalPath+"resources/css/fixes/calendar-auto-min-height.css",
		Foxtrick.InternalPath+"resources/css/fixes/hide-invitation.css",
		Foxtrick.InternalPath+"resources/css/fixes/Skillbars.css",
	],

	run : function(doc) {
	   if ( Foxtrick.util.layout.isRtl(doc) && FoxtrickPrefs.isModuleOptionEnabled("FixcssProblems", "RTL_Fixes")) {
			if (!Foxtrick.util.layout.isStandard( doc ) ) {
				var css = Foxtrick.InternalPath+"resources/css/fixes/RTL_Fixes_simple.css";
				Foxtrick.util.inject.cssLink( doc, css );
			}
		}
	}
};
