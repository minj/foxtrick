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
var myScope = {};
		
function loadIntoWindow(window) {
	 
	if (!window) return;
	var doc = window.document;
	
	// styles also needed in eg customize-toolbox
	var uri = "chrome://foxtrick/content/resources/css/overlay.css"
	var style = doc.createProcessingInstruction('xml-stylesheet',
			'type="text/css" href="'+uri+'"'
		);
	doc.insertBefore(style, doc.documentElement);

	// only in content windows (not menupopups etc)
	if ( !window.document || !window.document.getElementById("appcontent")) return;
	dump('loadIntoWindow\n');

	// ui
	try{
		var toolbar = doc.getElementById('nav-bar');
		var self = window;

		myScope.init = function (){
			this.generalButton = this.ToolbarItem.create(
				<>
					<toolbarbutton id="foxtrick-toolbar-button"
						type="menu"
						label={"FoxTrick"}
						tooltiptext={"FoxTrick"}
						context="foxtrick-menu"
						class={this.ToolbarItem.BASIC_ITEM_CLASS + ' ' + this.TOOLBAR_ITEM}
						onclick="dump(myScope)"
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
				toolbar,
				{
					onInit : function() {
					},
					onDestroy : function() {
					}
				}
			);
		};
		
		Services.scriptloader.loadSubScript("chrome://foxtrick/content/lib/ToolbarItem.js", myScope);
		myScope.init();
		
	} catch(e){dump(e+'\n')};
   
   // pass to scope of the scripts
	myScope.window = window;
	myScope.document = window.document;

	// loading our scripts
	//<!-- essential stuffs -->
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/env.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/prefs.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/l10n.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/xml-load.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages.js",myScope, "UTF-8");

	//<!-- utilities -->
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/api.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/array.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/copy-button.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/currency.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/dom.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/ht-ml.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/id.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/inject.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/layout.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/links-box.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/local-store.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/log.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/match-view.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/misc.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/module.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/note.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/notify.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/sanitize.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/session-store.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/string.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/tabs.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/util/time.js",myScope, "UTF-8");

	//<!-- external libraries -->
	//Services.scriptloader.loadSubScript("chrome://foxtrick/content/lib/jquery.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/lib/oauth.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/lib/sha1.js",myScope, "UTF-8");

	//<!-- core modules -->
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/redirections.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/read-ht-prefs.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum-stage.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/core.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/add-class.js",myScope, "UTF-8");

	//<!-- page utilities -->
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/all.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/country.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/players.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/player.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/youth-player.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/transfer-search-results.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/match.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/pages/matches.js",myScope, "UTF-8");

	//<!-- categorized modules -->
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/access/aria-landmarks.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/alert/live-alert.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/alert/new-mail.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/alert/ticker-alert.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/alert/ticker-coloring.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/add-leave-conf-button.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/embed-media.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-change-posts.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-change-posts-modules.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-direct-page-links.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-last-post.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-next-and-previous.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-mod-link-icons.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-presentation.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-preview.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-strip-hattrick-links.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-templates.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-thread-auto-ignore.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/forum-youth-icons.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/go-to-post-box.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/hide-signatures.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/ht-thread-marker.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/mark-all-as-read.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/mark-unread.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/show-forum-pref-button.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/forum/staff-marker.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/cross-table.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/election-table.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/extended-player-details.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/extra-player-info.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/flag-collection-to-map.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/goal-difference-to-tables.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/history-stats.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/htms-points.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/last-login.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/median-transfer-price.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/my-monitor.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/nt-peek.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/player-birthday.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/player-stats-experience.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/season-stats.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/series-flags.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/show-friendly-booked.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/show-lineup-set.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/skill-table.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/supporterstats-enhancements.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/table-of-statistical-truth.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/team-stats.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/transfer-deadline.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/youth-promotes.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/youth-series-estimation.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/information-aggregation/youth-twins.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-achievements.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-alliances.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-arena.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-challenges.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-club-transfers.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-coach.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-country.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-economy.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-fans.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-league.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-manager.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-match.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-national.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-player-detail.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-players.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-staff.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-team.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-tracker.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-training.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-youth.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/links/links-world.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/att-vs-def.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/live-match-report-format.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/copy-ratings.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/htev-prediction.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/htms-prediction.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/match-income.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/match-order.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/match-player-colouring.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/match-report-format.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/match-simulator.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/ratings.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/matches/stars-counter.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/background-fixed.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/bookmark-adjust.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/country-list.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/currency-converter.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/custom-medals.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/fix-css-problems.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/friendly-interface.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/friendly-pool.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/header-fix.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/header-toggle.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/highlight-cup-wins.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/highlight-ownerless.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/ht-date-format.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/large-flags.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/league-news-filter.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/local-time.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/loyalty-display.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/match-tables.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/mobile-enhancements.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/move-manager-online.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/move-player-select-box.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/move-player-statement.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/old-style-face.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/original-face.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/personality-images.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/ratings-display.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/safe-for-work.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/simple-presentation.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/skill-coloring.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/skill-translation.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/skin-plugin.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/smaller-pages.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/tabs-test.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/team-select-box.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/presentation/youth-skill-hide-unknown.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/confirm-actions.js",myScope, "UTF-8");
//		Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/context-menu-copy.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/copy-match-id.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/copy-player-ad.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/copy-youth.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/extra-shortcuts.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/filter.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/lineup-shortcut.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/manager-buttons.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/player-filters.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/rapid-id.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/senior-team-shortcuts.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/table-sort.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/team-popup-links.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/transfer-history-filters.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/transfer-search-filters.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/shortcuts-and-tweaks/transfer-search-result-filters.js",myScope, "UTF-8");
	//<!-- end categorized modules -->

	//Services.scriptloader.loadSubScript("chrome://foxtrick/content/env-fennec.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/ui.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/entry.js",myScope, "UTF-8");
	Services.scriptloader.loadSubScript("chrome://foxtrick/content/loader-gecko.js",myScope, "UTF-8");

	myScope.Foxtrick.loader.gecko.browserLoad();
}

function unloadFromWindow(window) {
  if (!window || !window.document || !window.document.getElementById("appcontent")) return;
  dump('unloadFromWindow\n');
  try{
  myScope.generalButton.destroy();
  } catch(e){dump(e)}
  // todo: unload our css 
}

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
	dump('onOpenWindow\n');
	// Wait for the window to finish loading
	let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	domWindow.addEventListener("load", function() {
			domWindow.removeEventListener("load", arguments.callee, false);
			dump('load\n');
			loadIntoWindow(domWindow);
		}, false);
	},
	onCloseWindow: function(aWindow) { },
	onWindowTitleChange: function(aWindow, aTitle) { }
};

function startup(aData, aReason) {
	dump('startup '+ aData.id+ ' '+aReason+'\n');
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
	dump('shutdown ' + aData.id +' ' + aReason+'\n')
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
