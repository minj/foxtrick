"use strict";
/*
 * scripts-fennec.js
 * content script inject for fennec
 */
 
if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.loader)
	Foxtrick.loader = {};
if (!Foxtrick.loader.background)
	Foxtrick.loader.background = {};

Foxtrick.loader.background.contentScriptManager = {
	contentScripts : [
		//<!-- essential stuffs -->
		"env.js",
		"prefs.js",
		"l10n.js",
		"xml-load.js",
		"pages.js",

		//<!-- utilities -->
		"util/api.js",
		"util/array.js",
		"util/cookies.js",
		"util/copy-button.js",
		"util/css.js",
		"util/currency.js",
		"util/dom.js",
		"util/ht-ml.js",
		"util/id.js",
		"util/inject.js",
		"util/layout.js",
		"util/links-box.js",
		"util/load.js",
		"util/local-store.js",
		"util/log.js",
		"util/match-view.js",
		"util/misc.js",
		"util/module.js",
		"util/note.js",
		"util/notify.js",
		"util/sanitize.js",
		"util/session-store.js",
		"util/string.js",
		"util/tabs.js",
		"util/time.js",

		//<!-- external libraries -->
		"lib/oauth.js",
		"lib/sha1.js",
		"lib/jquery.js",
		"lib/jester.js",
		"lib/yaml.js",
		"lib/BlobBuilder.min.js",
		"lib/FileSaver.min.js",

		//<!-- core modules -->
		"redirections.js",
		"read-ht-prefs.js",
		"forum-stage.js",
		"core.js",
		"add-class.js",

		//<!-- page utilities -->
		"pages/all.js",
		"pages/country.js",
		"pages/players.js",
		"pages/player.js",
		"pages/youth-player.js",
		"pages/transfer-search-results.js",
		"pages/match.js",
		"pages/matches.js",

		//<!-- categorized modules -->
		messageManager.loadFrameScript("chrome://foxtrick/content/access/aria-landmarks.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/alert/live-alert.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/alert/new-mail.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/alert/ticker-alert.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/alert/ticker-coloring.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/add-leave-conf-button.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/embed-media.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-change-posts.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-change-posts-modules.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-direct-page-links.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-last-post.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-next-and-previous.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-mod-popup.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-presentation.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-preview.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-strip-hattrick-links.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-templates.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-thread-auto-ignore.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/forum-youth-icons.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/go-to-post-box.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/hide-signatures.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/ht-thread-marker.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/mark-all-as-read.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/mark-unread.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/show-forum-pref-button.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/forum/staff-marker.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/cross-table.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/dashboard-calendar.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/election-table.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/extended-player-details.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/extra-player-info.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/flag-collection-to-map.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/goal-difference-to-tables.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/history-stats.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/htms-points.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/last-login.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/median-transfer-price.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/my-monitor.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/nt-peek.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/player-birthday.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/player-stats-experience.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/season-stats.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/series-flags.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/show-friendly-booked.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/show-lineup-set.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/skill-table.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/supporterstats-enhancements.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/table-of-statistical-truth.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/team-stats.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/transfer-deadline.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/youth-promotes.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/youth-series-estimation.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/information-aggregation/youth-twins.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-achievements.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-alliances.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-arena.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-challenges.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-club-transfers.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-coach.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-country.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-economy.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-fans.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-league.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-manager.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-match.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-national.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-player-detail.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-players.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-staff.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-team.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-tracker.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-training.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-youth.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/links/links-world.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/att-vs-def.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/live-match-report-format.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/copy-ratings.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/htev-prediction.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/htms-prediction.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/match-income.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/match-order.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/match-player-colouring.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/match-report-format.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/match-simulator.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/ratings.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/matches/stars-counter.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/background-fixed.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/bookmark-adjust.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/country-list.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/currency-converter.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/custom-medals.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/fix-css-problems.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/friendly-interface.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/friendly-pool.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/header-fix.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/header-toggle.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/highlight-cup-wins.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/highlight-ownerless.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/ht-date-format.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/large-flags.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/league-news-filter.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/local-time.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/loyalty-display.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/match-tables.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/mobile-enhancements.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/move-manager-online.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/move-player-select-box.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/move-player-statement.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/old-style-face.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/original-face.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/personality-images.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/player-stats-training-week.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/ratings-display.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/safe-for-work.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/simple-presentation.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/skill-coloring.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/skill-translation.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/skin-plugin.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/smaller-pages.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/tabs-test.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/team-select-box.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/presentation/youth-skill-hide-unknown.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/confirm-actions.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/context-menu-copy.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/copy-match-id.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/copy-player-ad.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/copy-youth.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/extra-shortcuts.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/filter.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/lineup-shortcut.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/manager-buttons.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/player-filters.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/rapid-id.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/senior-team-shortcuts.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/table-sort.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/team-popup-links.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/transfer-history-filters.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/transfer-search-filters.js", true);
		messageManager.loadFrameScript("chrome://foxtrick/content/shortcuts-and-tweaks/transfer-search-result-filters.js", true);
		//<!-- end categorized modules -->

		"env-fennec.js",
		"ui.js",
		"entry.js",
		"loader-fennec.js"
	],

	load : function() {
		// load content scripts into content pages. those start running in loader-fennec
		for (var i=0; i<this.contentScripts.length; ++i) 
			messageManager.loadFrameScript("chrome://foxtrick/content/" + this.contentScripts[i], true);
	},

	unload : function() {
		// tell content script to unload
		sandboxed.extension.broadcastMessage("unload");		
		
		// unload content scripts
		for (var i=0; i<this.contentScripts.length; ++i) 
			messageManager.removeDelayedFrameScript("chrome://foxtrick/content/" + this.contentScripts[i]);
	},
};
