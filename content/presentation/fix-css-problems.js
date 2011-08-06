/**
 * Fixes for css isues
 * @author spambot, ljushaff, ryanli
 */

var FoxtrickFixcssProblems = {
	MODULE_NAME : "FixcssProblems",
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
		"HideInvitation"
	],
	OPTIONS_CSS : [
		Foxtrick.ResourcePath+"resources/css/fixes/Forum_FoxLink_Headers.css",
		Foxtrick.ResourcePath+"resources/css/fixes/Club_Menu_Teamnames.css",
		Foxtrick.ResourcePath+"resources/css/fixes/Page_Minimum_Height.css",
		"",
		Foxtrick.ResourcePath+"resources/css/fixes/ForumScrollBarFix.css",
		Foxtrick.ResourcePath+"resources/css/fixes/MatchReportRatingsFontFix.css",
		Foxtrick.ResourcePath+"resources/css/fixes/RemoveForumSneakPeak.css",
		Foxtrick.ResourcePath+"resources/css/fixes/calendar-auto-min-height.css",
		Foxtrick.ResourcePath+"resources/css/fixes/hide-invitation.css"
	],
	OPTIONS_CSS_RTL : [
		Foxtrick.ResourcePath+"resources/css/fixes/Forum_FoxLink_Headers.css",
		Foxtrick.ResourcePath+"resources/css/fixes/Club_Menu_Teamnames.css",
		Foxtrick.ResourcePath+"resources/css/fixes/Page_Minimum_Height.css",
		Foxtrick.ResourcePath+"resources/css/fixes/RTL_Fixes.css",
		Foxtrick.ResourcePath+"resources/css/fixes/ForumScrollBarFix.css",
		Foxtrick.ResourcePath+"resources/css/fixes/MatchReportRatingsFontFix.css",
		Foxtrick.ResourcePath+"resources/css/fixes/RemoveForumSneakPeak.css",
		Foxtrick.ResourcePath+"resources/css/fixes/calendar-auto-min-height.css",
		Foxtrick.ResourcePath+"resources/css/fixes/hide-invitation.css"
	],

	run : function(doc) {
	   if ( Foxtrick.util.layout.isRtl(doc) && FoxtrickPrefs.isModuleOptionEnabled("FixcssProblems", "RTL_Fixes")) {
			if (!Foxtrick.util.layout.isStandard( doc ) ) {
				var css = Foxtrick.ResourcePath+"resources/css/fixes/RTL_Fixes_simple.css";
				Foxtrick.util.inject.cssLink( doc, css );
			}
		}
	}
};
Foxtrick.util.module.register(FoxtrickFixcssProblems);
