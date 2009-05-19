/**
 * loader.js
 * Foxtrick loader
 * @author kolmis
 */

var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                       .getService(Components.interfaces.mozIJSSubScriptLoader);
var scripts = [
    'preferences.js',
    'const.js',
    'module.js',
    'stats.js',
    'l10n.js',
    'helper.js',
    'redirections.js',
	'read_ht_pref_changes.js',
    'preferences-dialog.js',
    'preferences-dialog-html.js',

    // individual modules
    'forum/forumchangeposts_modules.js',
    'forum/forumchangeposts.js',
    'forum/forumtemplates.js',
    'forum/forumpreview.js',
    'forum/forumyouthicons.js',
    'forum/forumleaveconfbutton.js',
    'forum/forumstaffmarker.js',
    'forum/forumhidesignatures.js',
    'forum/forumnextandprevious.js',
    'forum/forumshowprefbutton.js',
	'forum/htthreadmarker.js',
    'forum/forumgotopostbox.js',
	'matches/matches.js',
    'matches/matchPlayerColouring.js',
    'matches/ratings.js',
    'matches/attvsdef.js',
    'matches/matchOrdersFlipSides.js',
    'matches/matchOrdersFormationBox.js',
    'matches/starscounter.js',
    'matches/repositionedplayers.js',
    'matches/advancedStarsCounter.js',
    'matches/matchincome.js',
    'matches/promotion.js',
    'presentation/bookmarkadjust.js',
    'shortcuts_and_tweaks/flagCollectionToMap.js',
    'shortcuts_and_tweaks/mediantransferprice.js',
    'shortcuts_and_tweaks/transferListSearchFilters.js',
    'shortcuts_and_tweaks/transferListDeadline.js',
    'presentation/extendedplayerdetails.js',
    'presentation/htdateformat.js',
    'shortcuts_and_tweaks/youthskillnotes.js',
    'shortcuts_and_tweaks/foxtrickalert.js',
    'presentation/facePlugin.js',
    'shortcuts_and_tweaks/addmanagerbuttons.js',
    'shortcuts_and_tweaks/confirmplayerbid.js',
    'shortcuts_and_tweaks/economyDifference.js',
    'presentation/personalityImages.js',
    'shortcuts_and_tweaks/playeradtoclipboard.js',
    'presentation/skillcoloring.js',
    'presentation/skinPlugin.js',
    'shortcuts_and_tweaks/teamStats.js',
    'presentation/largeflags.js',
    'shortcuts_and_tweaks/teamselectbox.js',
    'shortcuts_and_tweaks/seniorteamshortcuts.js',
    'shortcuts_and_tweaks/shortcutsstatistics.js',
    'shortcuts_and_tweaks/copymatchid.js',
    'shortcuts_and_tweaks/matchdaytables.js',
    'shortcuts_and_tweaks/contextmenue.js',
	'shortcuts_and_tweaks/copyTrainingReport.js',
    'shortcuts_and_tweaks/playerbirthday.js',
    'shortcuts_and_tweaks/addhtlivetoongoing.js',
	'shortcuts_and_tweaks/seasonstats.js',	
    'matches/ratingstoclipboard.js',    
    'presentation/custommedals.js',
    'presentation/fixcssproblems.js',
    'presentation/guestbookalltidflags.js',
    'presentation/tickercoloring.js',
	'presentation/headerfix.js',
	'presentation/newmail.js',
    'presentation/leaguenewsfilter.js',
    'presentation/moveplayerselectbox.js',
    'links/linkscustom.js',
    'links/linksleague.js',
    'links/linksteam.js',
    'links/linkscountry.js',
    'links/linkschallenges.js',
    'links/linkseconomy.js',
    'links/linksyouthoverview.js',
    'links/linksarena.js',
    'links/linkscoach.js',
    'links/linksplayerdetail.js',
    'links/linksmatch.js',
    'links/linkstraining.js',
    'links/linksalliances.js',
    'links/linksnational.js',
    'links/linksmanager.js',
    'links/linksachievements.js',
    'links/linksplayers.js',
    'links/linksfans.js',
    'links/linksstaff.js',
    'links/linkstracker.js',

	// following modules all run on 'all_late' pages. order of execution is determined be following order 
    'presentation/currencyConverter.js',
    'shortcuts_and_tweaks/teampopuplinks.js', // keep behind others

    'modules_list.js',
    'foxtrick.js',
];

var all_loaded=true;
for each (var script in scripts) {
	try {
        loader.loadSubScript('chrome://foxtrick/content/' + script);     
	} catch (e) {
        dump('Script loading failed -- ' + script + '\n  ' + e + '\n');
		all_loaded=false;
	}
};
if (!all_loaded) Foxtrick.alert (' --------------- Foxtrick: failed to load one or more scripts -----------------------\n');


FoxtrickMain.init();