/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/**
 * background-entry.js
 * Entry point for Manifest V3 service worker bundle
 *
 * This file loads all background scripts in the correct order
 * as they were loaded in background.html
 *
 * NOTE: We use importScripts() instead of ES6 imports because Foxtrick
 * uses global namespace pattern, not ES6 modules. Files must be loaded
 * sequentially in specific order to build up the Foxtrick global namespace.
 *
 * @author Foxtrick Team
 */



// importScripts loads scripts synchronously in order, perfect for our namespace pattern

// <!-- essential -->
importScripts(
	'./env.js',
	'./prefs-util.js',
	'./l10n.js',
	'./xml-load.js',
	'./pages.js'
);

// <!-- ext-lib -->
importScripts(
	'./lib/indexedDB.polyfill.js',
	'./lib/idbstore.js',
	'./lib/oauth.js',
	'./lib/sha1.js',
	'./lib/PluralForm.js',
	'./lib/yaml.js',
	'./lib/psico.js',
	'./lib/gauge.js'
);
// NOTE: exceptionless.universal.js moved after core.js to ensure Foxtrick namespace exists

importScripts('./lib/integration.js');

// <!-- util -->
importScripts(
	'./util/api.js',
	'./util/array.js',
	'./util/async.js',
	'./util/color.js',
	'./util/cookies.js',
	'./util/copy-button.js',
	'./util/css.js',
	'./util/currency.js',
	'./util/dom.js',
	'./util/ht-ml.js',
	'./util/id.js',
	'./util/links-box.js',
	'./util/load.js',
	'./util/local-store.js',
	'./util/log.js',
	'./util/match-event.js',
	'./util/match-view.js',
	'./util/math.js',
	'./util/misc.js',
	'./util/module.js',
	'./util/note.js',
	'./util/notify.js',
	'./util/permissions.js',
	'./util/sanitize.js',
	'./util/session-store.js',
	'./util/string.js',
	'./util/tabs.js',
	'./util/time.js'
);

// <!-- core -->
importScripts(
	'./add-class.js',
	'./core.js',
	'./fix-links.js',
	'./forum-stage.js',
	'./read-ht-prefs.js',
	'./redirections.js',
	'./ui.js'
);

// Import exceptionless after Foxtrick namespace is established
importScripts('./lib/exceptionless.universal.js');

// <!-- categorized modules -->
importScripts(
	'./access/aria-landmarks.js',
	'./alert/live-alert.js',
	'./alert/new-mail.js',
	'./alert/ticker-alert.js',
	'./alert/ticker-coloring.js',
	'./forum/auto-post-specs.js',
	'./forum/embed-media.js',
	'./forum/forum-change-posts-modules.js',
	'./forum/forum-change-posts.js',
	'./forum/forum-direct-page-links.js',
	'./forum/forum-last-post.js',
	'./forum/forum-leave-button.js',
	'./forum/forum-mod-popup.js',
	'./forum/forum-next-and-previous.js',
	'./forum/forum-presentation.js',
	'./forum/forum-preview.js',
	'./forum/forum-strip-hattrick-links.js',
	'./forum/forum-templates.js',
	'./forum/forum-thread-auto-ignore.js',
	'./forum/forum-youth-icons.js',
	'./forum/go-to-post-box.js',
	'./forum/hide-signatures.js',
	'./forum/ht-thread-marker.js',
	'./forum/mark-all-as-read.js',
	'./forum/show-forum-pref-button.js',
	'./forum/staff-marker.js',
	'./information-aggregation/cross-table.js',
	'./information-aggregation/current-transfers.js',
	'./information-aggregation/dashboard-calendar.js',
	'./information-aggregation/election-table.js',
	'./information-aggregation/extended-player-details.js',
	'./information-aggregation/extra-player-info.js',
	'./information-aggregation/flag-collection-to-map.js',
	'./information-aggregation/history-stats.js',
	'./information-aggregation/htms-points.js',
	'./information-aggregation/last-login.js',
	'./information-aggregation/match-weather.js',
	'./information-aggregation/mercattrick-stats.js',
	'./information-aggregation/my-monitor.js',
	'./information-aggregation/nt-peek.js',
	'./information-aggregation/player-birthday.js',
	'./information-aggregation/player-positions-evaluations.js',
	'./information-aggregation/player-stats-experience.js',
	'./information-aggregation/psico-tsi.js',
	'./information-aggregation/season-stats.js',
	'./information-aggregation/series-flags.js',
	'./information-aggregation/series-transfers.js',
	'./information-aggregation/show-friendly-booked.js',
	'./information-aggregation/show-lineup-set.js',
	'./information-aggregation/skill-table.js',
	'./information-aggregation/specialty-info.js',
	'./information-aggregation/supporterstats-enhancements.js',
	'./information-aggregation/table-of-statistical-truth.js',
	'./information-aggregation/team-stats.js',
	'./information-aggregation/transfer-compare-players.js',
	'./information-aggregation/transfer-deadline.js',
	'./information-aggregation/u21-lastmatch.js',
	'./information-aggregation/youth-promotes.js',
	'./information-aggregation/youth-series-estimation.js',
	'./information-aggregation/youth-skills.js',
	'./links/links-achievements.js',
	'./links/links-alliances.js',
	'./links/links-arena.js',
	'./links/links-challenges.js',
	'./links/links-club-transfers.js',
	'./links/links-coach.js',
	'./links/links-country.js',
	'./links/links-economy.js',
	'./links/links-fans.js',
	'./links/links-league.js',
	'./links/links-manager.js',
	'./links/links-match.js',
	'./links/links-national.js',
	'./links/links-player-detail.js',
	'./links/links-players.js',
	'./links/links-team.js',
	'./links/links-tracker.js',
	'./links/links-training.js',
	'./links/links-world.js',
	'./links/links-youth.js',
	'./links/links.js',
	'./matches/att-vs-def.js',
	'./matches/copy-ratings.js',
	'./matches/htms-prediction.js',
	'./matches/live-match-report-format.js',
	'./matches/match-income.js',
	'./matches/match-lineup-fixes.js',
	'./matches/match-lineup-tweaks.js',
	'./matches/match-order-new.js',
	'./matches/match-order.js',
	'./matches/match-player-colouring.js',
	'./matches/match-ratings-tweaks.js',
	'./matches/match-report-format.js',
	'./matches/match-simulator.js',
	'./matches/ratings.js',
	'./presentation/bookmark-adjust.js',
	'./presentation/country-list.js',
	'./presentation/currency-converter.js',
	'./presentation/custom-medals.js',
	'./presentation/fans.js',
	'./presentation/fix-css-problems.js',
	'./presentation/friendly-interface.js',
	'./presentation/friendly-pool.js',
	'./presentation/header-toggle.js',
	'./presentation/highlight-cup-wins.js',
	'./presentation/highlight-ownerless.js',
	'./presentation/ht-date-format.js',
	'./presentation/large-flags.js',
	'./presentation/league-news-filter.js',
	'./presentation/local-time.js',
	'./presentation/loyalty-display.js',
	'./presentation/mobile-enhancements.js',
	'./presentation/move-manager-online.js',
	'./presentation/move-player-select-box.js',
	'./presentation/move-player-statement.js',
	'./presentation/old-style-face.js',
	'./presentation/original-face.js',
	'./presentation/personality-images.js',
	'./presentation/ratings-display.js',
	'./presentation/safe-for-work.js',
	'./presentation/simple-presentation.js',
	'./presentation/skill-coloring.js',
	'./presentation/skill-translation.js',
	'./presentation/skin-plugin.js',
	'./presentation/supporters-list.js',
	'./presentation/tabs-test.js',
	'./presentation/team-select-box.js',
	'./presentation/youth-skill-hide-unknown.js',
	'./shortcuts-and-tweaks/add-promotion-reminder.js',
	'./shortcuts-and-tweaks/confirm-actions.js',
	'./shortcuts-and-tweaks/context-menu-copy.js',
	'./shortcuts-and-tweaks/copy-bb-ad.js',
	'./shortcuts-and-tweaks/copy-match-id.js',
	'./shortcuts-and-tweaks/copy-player-ad.js',
	'./shortcuts-and-tweaks/copy-youth.js',
	'./shortcuts-and-tweaks/extra-shortcuts.js',
	'./shortcuts-and-tweaks/filter.js',
	'./shortcuts-and-tweaks/lineup-shortcut.js',
	'./shortcuts-and-tweaks/manager-buttons.js',
	'./shortcuts-and-tweaks/player-filters.js',
	'./shortcuts-and-tweaks/rapid-id.js',
	'./shortcuts-and-tweaks/relive-links.js',
	'./shortcuts-and-tweaks/senior-team-shortcuts.js',
	'./shortcuts-and-tweaks/supportership-expiration-date.js',
	'./shortcuts-and-tweaks/table-sort.js',
	'./shortcuts-and-tweaks/team-popup-links.js',
	'./shortcuts-and-tweaks/transfer-history-filters.js',
	'./shortcuts-and-tweaks/transfer-search-filters.js',
	'./shortcuts-and-tweaks/transfer-search-result-filters.js'
);

// <!-- platform-specific -->
importScripts(
	'./entry.js',
	'./background.js'
);

// Log success for debugging
if (typeof self.Foxtrick !== 'undefined') {
	console.log('Foxtrick service worker loaded successfully');
}
else {
	console.error('Foxtrick failed to initialize in service worker');
}

/******/ })()
;
//# sourceMappingURL=background-bundle-unused.js.map