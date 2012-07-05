/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

function isFennecNative() {
  let appInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
  return (appInfo.ID == "{aa3c5121-dab2-40e2-81ca-7ea25febc110}");
};

var FoxtrickFirefox = function(window) {
	this.owner = window;
};
FoxtrickFirefox.prototype = {
	loadScript: function() {
		// loading Foxtrick into window.Foxtrick		
		
		//<!-- essential stuffs -->
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/env.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/prefs.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/l10n.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/xml-load.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages.js",this.owner, "UTF-8");
		
		//<!-- utilities -->
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/api.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/array.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/copy-button.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/currency.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/dom.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/ht-ml.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/id.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/inject.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/layout.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/links-box.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/local-store.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/log.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/match-view.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/misc.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/module.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/note.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/notify.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/sanitize.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/session-store.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/string.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/tabs.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/time.js",this.owner, "UTF-8");
		
		//<!-- external libraries -->
		//Services.scriptloader.loadSubScript("chrome://foxtrick/content/lib/jquery.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/lib/oauth.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/lib/sha1.js",this.owner, "UTF-8");
		
		//<!-- core modules -->
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/redirections.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/read-ht-prefs.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum-stage.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/core.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/add-class.js",this.owner, "UTF-8");
		
		//<!-- page utilities -->
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/all.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/country.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/players.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/player.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/youth-player.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/transfer-search-results.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/match.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/matches.js",this.owner, "UTF-8");
		
		//<!-- categorized modules -->
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/access/aria-landmarks.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/alert/live-alert.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/alert/new-mail.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/alert/ticker-alert.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/alert/ticker-coloring.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/add-leave-conf-button.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/embed-media.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-change-posts.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-change-posts-modules.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-direct-page-links.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-last-post.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-next-and-previous.js",this.owner, "UTF-8");
	//	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-mod-link-icons.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-presentation.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-preview.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-strip-hattrick-links.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-templates.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-thread-auto-ignore.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-youth-icons.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/go-to-post-box.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/hide-signatures.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/ht-thread-marker.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/mark-all-as-read.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/mark-unread.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/show-forum-pref-button.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/staff-marker.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/cross-table.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/election-table.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/extended-player-details.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/extra-player-info.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/flag-collection-to-map.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/goal-difference-to-tables.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/history-stats.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/htms-points.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/last-login.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/median-transfer-price.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/my-monitor.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/nt-peek.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/player-birthday.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/player-stats-experience.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/season-stats.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/series-flags.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/show-friendly-booked.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/show-lineup-set.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/skill-table.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/supporterstats-enhancements.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/table-of-statistical-truth.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/team-stats.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/transfer-deadline.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/youth-promotes.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/youth-series-estimation.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/youth-twins.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-achievements.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-alliances.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-arena.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-challenges.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-club-transfers.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-coach.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-country.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-economy.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-fans.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-league.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-manager.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-match.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-national.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-player-detail.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-players.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-staff.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-team.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-tracker.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-training.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-youth.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-world.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/att-vs-def.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/live-match-report-format.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/copy-ratings.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/htev-prediction.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/htms-prediction.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/match-income.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/match-order.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/match-player-colouring.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/match-report-format.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/match-simulator.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/ratings.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/stars-counter.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/background-fixed.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/bookmark-adjust.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/country-list.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/currency-converter.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/custom-medals.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/fix-css-problems.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/friendly-interface.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/friendly-pool.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/header-fix.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/header-toggle.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/highlight-cup-wins.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/highlight-ownerless.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/ht-date-format.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/large-flags.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/league-news-filter.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/local-time.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/loyalty-display.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/match-tables.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/mobile-enhancements.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/move-manager-online.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/move-player-select-box.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/move-player-statement.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/old-style-face.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/original-face.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/personality-images.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/ratings-display.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/safe-for-work.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/simple-presentation.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/skill-coloring.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/skill-translation.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/skin-plugin.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/smaller-pages.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/tabs-test.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/team-select-box.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/youth-skill-hide-unknown.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/confirm-actions.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/context-menu-copy.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/copy-match-id.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/copy-player-ad.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/copy-youth.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/extra-shortcuts.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/filter.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/lineup-shortcut.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/manager-buttons.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/player-filters.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/rapid-id.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/senior-team-shortcuts.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/table-sort.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/team-popup-links.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/transfer-history-filters.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/transfer-search-filters.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/transfer-search-result-filters.js",this.owner, "UTF-8");
		//<!-- end categorized modules -->

		//<!-- browser specific -->
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/ui.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/entry.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/loader-gecko.js",this.owner, "UTF-8");
	},
	init : function (){
		// add ui
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/lib/ToolbarItem.js", this);
		// toolbar
		this.generalButton = this.ToolbarItem.create(
			<>
				<toolbarbutton id="foxtrick-toolbar-button"
					type="menu"
					label={"FoxTrick"}
					tooltiptext={"FoxTrick"}
					context="foxtrick-menu"
					class={this.ToolbarItem.BASIC_ITEM_CLASS + ' ' + this.TOOLBAR_ITEM}
					>
					<menupopup id="foxtrick-menu">							
						<menuitem id="foxtrick-toolbar-preferences"/>
						<menuitem id="foxtrick-toolbar-deactivate" type="checkbox" autocheck="true"/>
						<menuitem id="foxtrick-toolbar-clearCache" />
						<menuitem id="foxtrick-toolbar-highlight" type="checkbox" autocheck="true"/>
						<menuitem id="foxtrick-toolbar-translationKeys" type="checkbox" autocheck="true"/>
					</menupopup>
				</toolbarbutton>
			</>,
			this.owner.document.getElementById('nav-bar'),
			{
				onInit : function() {
				},
				onDestroy : function() {
				}
			}
		);		
		// contextmenu
		let popup = this.owner.document.getElementById('contentAreaContextMenu');
		this.contextLinkItem = this.ToolbarItem.toDOMDocumentFragment(<>
				<menu id="foxtrick-popup-copy"
					class={'menu-iconic '+this.owner.MENU_ITEM}
					label={'FoxTrick'}>
					<menupopup>
						<menuitem id="foxtrick-popup-copy-id"
							label={'Copy ID'}/>
						<menuitem id="foxtrick-popup-copy-link"
							label={'Copy Link Location in HT-ML'}/>
						<menuitem id="foxtrick-popup-copy-ht-ml"
							label={'Copy in HT-ML'}/>
						<menuitem id="foxtrick-popup-copy-table"
							label={'Copy table in HT-ML'}/>
					</menupopup>
				</menu>
			</>, popup).querySelector('*');
		popup.insertBefore(this.contextLinkItem, this.owner.document.getElementById('context-paste').nextSibling);
		//load foxtrick files
		this.loadScript();		
		//init and add listeners
		this.loader.gecko.browserLoad();   
	},
	cleanup : function (){
		// remove ui
		this.generalButton.destroy();
		let popup = this.owner.document.getElementById('contentAreaContextMenu');
		popup.removeChild(this.contextLinkItem)		
		// remove listeners and css
		this.loader.gecko.browserUnLoad()
	}
};

var FoxtrickFennec = function(window) {
	this.owner = window;
};
FoxtrickFennec.prototype = {
	loadScript: function() {
		// loading Foxtrick into window.Foxtrick
		
		//<!-- essential stuffs -->
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/env.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/prefs.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/l10n.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/xml-load.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages.js",this.owner, "UTF-8");
		//<!-- utilities -->
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/api.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/array.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/copy-button.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/currency.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/dom.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/ht-ml.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/id.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/inject.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/layout.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/links-box.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/local-store.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/log.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/match-view.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/misc.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/module.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/note.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/notify.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/sanitize.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/session-store.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/string.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/tabs.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/time.js",this.owner, "UTF-8");
		
		//<!-- external libraries -->
		//Services.scriptloader.loadSubScript("chrome://foxtrick/content/lib/jquery.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/lib/oauth.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/lib/sha1.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/lib/jester.js",this.owner, "UTF-8");
		
		//<!-- categorized modules with init functions -->
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/staff-marker.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/header-fix.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/skill-coloring.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/skin-plugin.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links.js",this.owner, "UTF-8");
		
		//<!-- browser specific -->
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/observer.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/ui.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/entry.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/scripts-fennec.js",this.owner, "UTF-8");
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/background.js",this.owner, "UTF-8");
	},
	init : function (){
		//load foxtrick files
		this.loadScript();			
		// add ui
		this.addObserver();
		//init and add listeners
		this.loader.gecko.browserLoad();   
	},
	cleanup : function (){
		// remove ui
		// remove listeners and css
		this.loader.gecko.browserUnLoad()
	}
};

		
function loadIntoWindow(window) {
	if (!window || !window.document ) return;

	if (isFennecNative()) {
		//create
		window.Foxtrick = new FoxtrickFennec(window);
	}
	else {
		// styles also needed in eg customize-toolbox
		var uri = "chrome://foxtrick/content/resources/css/overlay.css"
		var style = window.document.createProcessingInstruction('xml-stylesheet',
				'id="foxtrick-overlay-css" type="text/css" href="'+uri+'"'
			);
		window.document.insertBefore(style, window.document.documentElement);

		// only in content windows (not menupopups etc)
		if (!window.document.getElementById("appcontent")) return;
		
		// create 
		window.Foxtrick = new FoxtrickFirefox(window);
	}
	// run
	window.Foxtrick.init();
}


function unloadFromWindow(window) {
	if (!window || !window.document) return;
	
	if (isFennecNative()) {
		window.Foxtrick.unload_module_css();
	}
	else {
	  // styles also needed in eg customize-toolbox
	  var style = window.document.getElementById("foxtrick-overlay-css")
	  if (style)  window.document.removeChild(style);
			
	  // only in content windows (not menupopups etc)
	  if (!window.document.getElementById("appcontent")) return;
	}  

	// stop and delete
	window.Foxtrick.cleanup();
	delete window.Foxtrick;
}

// load prefs into default prefs branch
function setDefaultPrefs(pathToDefault, branch) {
	// Load default preferences and set up properties for them
	let defaultBranch = Services.prefs.getDefaultBranch(branch);
	let scope =
	{
		pref: function(key, val)
		{
			if (key.substr(0, branch.length) != branch)
			{
				Cu.reportError(new Error("Ignoring default preference " + key + ", wrong branch."));
				return;
			}
			key = key.substr(branch.length);
			switch (typeof val) {
			  case "boolean":
				defaultBranch.setBoolPref(key, val);
				break;
			  case "number":
				defaultBranch.setIntPref(key, val);
				break;
			  case "string":
				defaultBranch.setCharPref(key, val);
				break;
			}
		}
	};
	Services.scriptloader.loadSubScript(pathToDefault, scope);
};


// bootstrap.js API
var windowListener = {
	onOpenWindow: function(aWindow) {
		// Wait for the window to finish loading
		let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
		domWindow.addEventListener("load", function() {
				domWindow.removeEventListener("load", arguments.callee, false);
				loadIntoWindow(domWindow);
			}, false);
	},
	onCloseWindow: function(aWindow) { },
	onWindowTitleChange: function(aWindow, aTitle) { }
};

function startup(aData, aReason) {
	var pathToDefault = aData.resourceURI.spec + "defaults/preferences/foxtrick.js"
	const branch = "extensions.foxtrick.prefs.";
	setDefaultPrefs(pathToDefault, branch);

	let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

	// Load into any existing windows
	let enumerator = wm.getEnumerator("navigator:browser");
	while (enumerator.hasMoreElements()) {
		let win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
		loadIntoWindow(win);
	}

	// Load into any new windows
	wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
	// When the application is shutting down we normally don't have to clean
	// up any UI changes made
	if (aReason == APP_SHUTDOWN)
		return;

	let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

	// Stop listening for new windows
	wm.removeListener(windowListener);

	// Unload from any existing windows
	let windows = wm.getEnumerator("navigator:browser");
	while (windows.hasMoreElements()) {
		let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
		unloadFromWindow(domWindow);
	}
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}
