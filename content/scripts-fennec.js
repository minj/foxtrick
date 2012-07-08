"use strict";
/*
 * scripts-fennec.js
 * content script inject for fennec
 */
 
if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.loader)
	Foxtrick.loader = {};

Foxtrick.loader.fennec_background = {
	contentScripts : [
		//<!-- essential stuffs -->
		"chrome://foxtrick/content/env.js",
		"chrome://foxtrick/content/env-fennec.js",
		"chrome://foxtrick/content/prefs.js",
		"chrome://foxtrick/content/l10n.js",
		"chrome://foxtrick/content/xml-load.js",
		"chrome://foxtrick/content/pages.js",

		//<!-- utilities -->
		"chrome://foxtrick/content/util/api.js",
		"chrome://foxtrick/content/util/array.js",
		"chrome://foxtrick/content/util/copy-button.js",
		"chrome://foxtrick/content/util/currency.js",
		"chrome://foxtrick/content/util/dom.js",
		"chrome://foxtrick/content/util/ht-ml.js",
		"chrome://foxtrick/content/util/id.js",
		"chrome://foxtrick/content/util/inject.js",
		"chrome://foxtrick/content/util/layout.js",
		"chrome://foxtrick/content/util/links-box.js",
		"chrome://foxtrick/content/util/local-store.js",
		"chrome://foxtrick/content/util/log.js",
		"chrome://foxtrick/content/util/match-view.js",
		"chrome://foxtrick/content/util/misc.js",
		"chrome://foxtrick/content/util/module.js",
		"chrome://foxtrick/content/util/note.js",
		"chrome://foxtrick/content/util/notify.js",
		"chrome://foxtrick/content/util/sanitize.js",
		"chrome://foxtrick/content/util/session-store.js",
		"chrome://foxtrick/content/util/string.js",
		"chrome://foxtrick/content/util/tabs.js",
		"chrome://foxtrick/content/util/time.js",

		//<!-- external libraries -->
		"chrome://foxtrick/content/lib/oauth.js",
		"chrome://foxtrick/content/lib/sha1.js",
		"chrome://foxtrick/content/lib/jquery.js",
		"chrome://foxtrick/content/lib/jester.js",
		"chrome://foxtrick/content/lib/js-yaml.min.js",

		//<!-- core modules -->
		"chrome://foxtrick/content/redirections.js",
		"chrome://foxtrick/content/read-ht-prefs.js",
		"chrome://foxtrick/content/forum-stage.js",
		"chrome://foxtrick/content/core.js",
		"chrome://foxtrick/content/add-class.js",

		//<!-- page utilities -->
		"chrome://foxtrick/content/pages/all.js",
		"chrome://foxtrick/content/pages/country.js",
		"chrome://foxtrick/content/pages/players.js",
		"chrome://foxtrick/content/pages/player.js",
		"chrome://foxtrick/content/pages/youth-player.js",
		"chrome://foxtrick/content/pages/transfer-search-results.js",
		"chrome://foxtrick/content/pages/match.js",
		"chrome://foxtrick/content/pages/matches.js",

		//<!-- categorized modules -->
		"chrome://foxtrick/content/access/aria-landmarks.js",
		"chrome://foxtrick/content/alert/live-alert.js",
		"chrome://foxtrick/content/alert/new-mail.js",
		"chrome://foxtrick/content/alert/ticker-alert.js",
		"chrome://foxtrick/content/alert/ticker-coloring.js",
		"chrome://foxtrick/content/forum/add-leave-conf-button.js",
		"chrome://foxtrick/content/forum/embed-media.js",
		"chrome://foxtrick/content/forum/forum-change-posts.js",
		"chrome://foxtrick/content/forum/forum-change-posts-modules.js",
		"chrome://foxtrick/content/forum/forum-direct-page-links.js",
		"chrome://foxtrick/content/forum/forum-last-post.js",
		"chrome://foxtrick/content/forum/forum-next-and-previous.js",
		"chrome://foxtrick/content/forum/forum-mod-popup.js",
		"chrome://foxtrick/content/forum/forum-presentation.js",
		"chrome://foxtrick/content/forum/forum-preview.js",
		"chrome://foxtrick/content/forum/forum-strip-hattrick-links.js",
		"chrome://foxtrick/content/forum/forum-templates.js",
		"chrome://foxtrick/content/forum/forum-thread-auto-ignore.js",
		"chrome://foxtrick/content/forum/forum-youth-icons.js",
		"chrome://foxtrick/content/forum/go-to-post-box.js",
		"chrome://foxtrick/content/forum/hide-signatures.js",
		"chrome://foxtrick/content/forum/ht-thread-marker.js",
		"chrome://foxtrick/content/forum/mark-all-as-read.js",
		"chrome://foxtrick/content/forum/mark-unread.js",
		"chrome://foxtrick/content/forum/show-forum-pref-button.js",
		"chrome://foxtrick/content/forum/staff-marker.js",
		"chrome://foxtrick/content/information-aggregation/cross-table.js",
		"chrome://foxtrick/content/information-aggregation/election-table.js",
		"chrome://foxtrick/content/information-aggregation/extended-player-details.js",
		"chrome://foxtrick/content/information-aggregation/extra-player-info.js",
		"chrome://foxtrick/content/information-aggregation/flag-collection-to-map.js",
		"chrome://foxtrick/content/information-aggregation/goal-difference-to-tables.js",
		"chrome://foxtrick/content/information-aggregation/history-stats.js",
		"chrome://foxtrick/content/information-aggregation/htms-points.js",
		"chrome://foxtrick/content/information-aggregation/last-login.js",
		"chrome://foxtrick/content/information-aggregation/median-transfer-price.js",
		"chrome://foxtrick/content/information-aggregation/my-monitor.js",
		"chrome://foxtrick/content/information-aggregation/nt-peek.js",
		"chrome://foxtrick/content/information-aggregation/player-birthday.js",
		"chrome://foxtrick/content/information-aggregation/player-stats-experience.js",
		"chrome://foxtrick/content/information-aggregation/season-stats.js",
		"chrome://foxtrick/content/information-aggregation/series-flags.js",
		"chrome://foxtrick/content/information-aggregation/show-friendly-booked.js",
		"chrome://foxtrick/content/information-aggregation/show-lineup-set.js",
		"chrome://foxtrick/content/information-aggregation/skill-table.js",
		"chrome://foxtrick/content/information-aggregation/supporterstats-enhancements.js",
		"chrome://foxtrick/content/information-aggregation/table-of-statistical-truth.js",
		"chrome://foxtrick/content/information-aggregation/team-stats.js",
		"chrome://foxtrick/content/information-aggregation/transfer-deadline.js",
		"chrome://foxtrick/content/information-aggregation/youth-promotes.js",
		"chrome://foxtrick/content/information-aggregation/youth-series-estimation.js",
		"chrome://foxtrick/content/information-aggregation/youth-twins.js",
		"chrome://foxtrick/content/links/links-achievements.js",
		"chrome://foxtrick/content/links/links-alliances.js",
		"chrome://foxtrick/content/links/links-arena.js",
		"chrome://foxtrick/content/links/links-challenges.js",
		"chrome://foxtrick/content/links/links-club-transfers.js",
		"chrome://foxtrick/content/links/links-coach.js",
		"chrome://foxtrick/content/links/links-country.js",
		"chrome://foxtrick/content/links/links-economy.js",
		"chrome://foxtrick/content/links/links-fans.js",
		"chrome://foxtrick/content/links/links.js",
		"chrome://foxtrick/content/links/links-league.js",
		"chrome://foxtrick/content/links/links-manager.js",
		"chrome://foxtrick/content/links/links-match.js",
		"chrome://foxtrick/content/links/links-national.js",
		"chrome://foxtrick/content/links/links-player-detail.js",
		"chrome://foxtrick/content/links/links-players.js",
		"chrome://foxtrick/content/links/links-staff.js",
		"chrome://foxtrick/content/links/links-team.js",
		"chrome://foxtrick/content/links/links-tracker.js",
		"chrome://foxtrick/content/links/links-training.js",
		"chrome://foxtrick/content/links/links-youth.js",
		"chrome://foxtrick/content/links/links-world.js",
		"chrome://foxtrick/content/matches/att-vs-def.js",
		"chrome://foxtrick/content/matches/live-match-report-format.js",
		"chrome://foxtrick/content/matches/copy-ratings.js",
		"chrome://foxtrick/content/matches/htev-prediction.js",
		"chrome://foxtrick/content/matches/htms-prediction.js",
		"chrome://foxtrick/content/matches/match-income.js",
		"chrome://foxtrick/content/matches/match-order.js",
		"chrome://foxtrick/content/matches/match-player-colouring.js",
		"chrome://foxtrick/content/matches/match-report-format.js",
		"chrome://foxtrick/content/matches/match-simulator.js",
		"chrome://foxtrick/content/matches/ratings.js",
		"chrome://foxtrick/content/matches/stars-counter.js",
		"chrome://foxtrick/content/presentation/background-fixed.js",
		"chrome://foxtrick/content/presentation/bookmark-adjust.js",
		"chrome://foxtrick/content/presentation/country-list.js",
		"chrome://foxtrick/content/presentation/currency-converter.js",
		"chrome://foxtrick/content/presentation/custom-medals.js",
		"chrome://foxtrick/content/presentation/fix-css-problems.js",
		"chrome://foxtrick/content/presentation/friendly-interface.js",
		"chrome://foxtrick/content/presentation/friendly-pool.js",
		"chrome://foxtrick/content/presentation/header-fix.js",
		"chrome://foxtrick/content/presentation/header-toggle.js",
		"chrome://foxtrick/content/presentation/highlight-cup-wins.js",
		"chrome://foxtrick/content/presentation/highlight-ownerless.js",
		"chrome://foxtrick/content/presentation/ht-date-format.js",
		"chrome://foxtrick/content/presentation/large-flags.js",
		"chrome://foxtrick/content/presentation/league-news-filter.js",
		"chrome://foxtrick/content/presentation/local-time.js",
		"chrome://foxtrick/content/presentation/loyalty-display.js",
		"chrome://foxtrick/content/presentation/match-tables.js",
		"chrome://foxtrick/content/presentation/mobile-enhancements.js",
		"chrome://foxtrick/content/presentation/move-manager-online.js",
		"chrome://foxtrick/content/presentation/move-player-select-box.js",
		"chrome://foxtrick/content/presentation/move-player-statement.js",
		"chrome://foxtrick/content/presentation/old-style-face.js",
		"chrome://foxtrick/content/presentation/original-face.js",
		"chrome://foxtrick/content/presentation/personality-images.js",
		"chrome://foxtrick/content/presentation/player-stats-training-week.js",
		"chrome://foxtrick/content/presentation/ratings-display.js",
		"chrome://foxtrick/content/presentation/safe-for-work.js",
		"chrome://foxtrick/content/presentation/simple-presentation.js",
		"chrome://foxtrick/content/presentation/skill-coloring.js",
		"chrome://foxtrick/content/presentation/skill-translation.js",
		"chrome://foxtrick/content/presentation/skin-plugin.js",
		"chrome://foxtrick/content/presentation/smaller-pages.js",
		"chrome://foxtrick/content/presentation/tabs-test.js",
		"chrome://foxtrick/content/presentation/team-select-box.js",
		"chrome://foxtrick/content/presentation/youth-skill-hide-unknown.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/confirm-actions.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/context-menu-copy.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/copy-match-id.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/copy-player-ad.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/copy-youth.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/extra-shortcuts.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/filter.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/lineup-shortcut.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/manager-buttons.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/player-filters.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/rapid-id.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/senior-team-shortcuts.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/table-sort.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/team-popup-links.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/transfer-history-filters.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/transfer-search-filters.js",
		"chrome://foxtrick/content/shortcuts-and-tweaks/transfer-search-result-filters.js",
		//<!-- end categorized modules -->

		"chrome://foxtrick/content/env-fennec.js",
		"chrome://foxtrick/content/ui.js",
		"chrome://foxtrick/content/entry.js",
		"chrome://foxtrick/content/loader-fennec.js"
	],

	UIReady : function(event) {
		// run only once
//		removeEventListener("UIReady", this.UIReady, false);

		// load content scripts into content pages. those start running in loader-fennec
		for (var i=0; i<this.contentScripts.length; ++i) 
			messageManager.loadFrameScript(this.contentScripts[i], true);
	},

	// listen to ui ready and only then load content scripts
	init : function() {
//	  	addEventListener("c", this.UIReady, false);
		this.UIReady();
	},

	unload : function() {
		// tell content script to unload
		sandboxed.extension.broadcastMessage("unload");		
		
		// unload content scripts
		for (var i=0; i<this.contentScripts.length; ++i) 
			messageManager.removeDelayedFrameScript(this.contentScripts[i]);
	},
};
