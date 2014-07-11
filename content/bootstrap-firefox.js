'use strict';
Cu.import('resource://gre/modules/Services.jsm');

var FoxtrickFirefox = function(window) {
	this.owner = window;
};
FoxtrickFirefox.prototype = {
	scripts: [
		// loading Foxtrick into window.Foxtrick

		//<!-- essential stuffs -->
		'env.js',
		'prefs.js',
		'l10n.js',
		'xml-load.js',
		'pages.js',

		//<!-- external libraries -->
		'lib/oauth.js',
		'lib/sha1.js',
		// 'lib/yaml.js',
		//'lib/FileSaver.js',
		// 'lib/idbstore.js',
		'lib/psico.js',

		//<!-- utilities -->
		'util/api.js',
		'util/array.js',
		'util/color.js',
		'util/cookies.js',
		'util/copy-button.js',
		'util/css.js',
		'util/currency.js',
		'util/dom.js',
		'util/ht-ml.js',
		'util/id.js',
		'util/inject.js',
		'util/layout.js',
		'util/links-box.js',
		'util/load.js',
		'util/local-store.js',
		'util/log.js',
		'util/match-event.js',
		'util/match-view.js',
		'util/misc.js',
		'util/math.js',
		'util/module.js',
		'util/note.js',
		'util/notify.js',
		'util/permissions.js',
		'util/sanitize.js',
		'util/session-store.js',
		'util/string.js',
		'util/tabs.js',
		'util/time.js',

		//<!-- core modules -->
		'redirections.js',
		'read-ht-prefs.js',
		'forum-stage.js',
		'core.js',
		'add-class.js',
		'fix-links.js',

		//<!-- page utilities -->
		'pages/all.js',
		'pages/players.js',
		'pages/player.js',
		'pages/youth-player.js',
		'pages/transfer-search-results.js',
		'pages/match.js',
		'pages/matches.js',

		//<!-- api utilities -->
		'api/hy/common.js',
		'api/hy/user-id.js',
		'api/hy/players-youth-skills.js',
		'api/hy/players-twins-check.js',
		'api/hy/players-youth-reject-call.js',
		'api/hy/matches-report.js',
		'api/hy/matches-training.js',
		'api/pastebin/common.js',
		'api/pastebin/login.js',
		'api/pastebin/paste.js',
		'api/pastebin/get.js',

		//<!-- categorized modules -->
		'access/aria-landmarks.js',
		'alert/live-alert.js',
		'alert/new-mail.js',
		'alert/ticker-alert.js',
		'alert/ticker-coloring.js',
		'forum/auto-post-specs.js',
		'forum/embed-media.js',
		'forum/forum-change-posts-modules.js',
		'forum/forum-change-posts.js',
		'forum/forum-direct-page-links.js',
		'forum/forum-last-post.js',
		'forum/forum-leave-button.js',
		'forum/forum-mod-popup.js',
		'forum/forum-next-and-previous.js',
		'forum/forum-presentation.js',
		'forum/forum-preview.js',
		'forum/forum-strip-hattrick-links.js',
		'forum/forum-templates.js',
		'forum/forum-thread-auto-ignore.js',
		'forum/forum-youth-icons.js',
		'forum/go-to-post-box.js',
		'forum/hide-signatures.js',
		'forum/ht-thread-marker.js',
		'forum/mark-all-as-read.js',
		'forum/mark-unread.js',
		'forum/show-forum-pref-button.js',
		'forum/staff-marker.js',
		'information-aggregation/best-player-position.js',
		'information-aggregation/cross-table.js',
		'information-aggregation/dashboard-calendar.js',
		'information-aggregation/election-table.js',
		'information-aggregation/extended-player-details.js',
		'information-aggregation/extra-player-info.js',
		'information-aggregation/flag-collection-to-map.js',
		'information-aggregation/goal-difference-to-tables.js',
		'information-aggregation/history-stats.js',
		'information-aggregation/htms-points.js',
		'information-aggregation/last-login.js',
		'information-aggregation/match-weather.js',
		'information-aggregation/transfer-compare-players.js',
		'information-aggregation/my-monitor.js',
		'information-aggregation/nt-peek.js',
		'information-aggregation/player-birthday.js',
		'information-aggregation/player-positions-evaluations.js',
		'information-aggregation/player-stats-experience.js',
		'information-aggregation/psico-tsi.js',
		'information-aggregation/season-stats.js',
		'information-aggregation/series-flags.js',
		'information-aggregation/series-transfers.js',
		'information-aggregation/show-friendly-booked.js',
		'information-aggregation/show-lineup-set.js',
		'information-aggregation/skill-table.js',
		'information-aggregation/supporterstats-enhancements.js',
		'information-aggregation/table-of-statistical-truth.js',
		'information-aggregation/team-stats.js',
		'information-aggregation/transfer-deadline.js',
		'information-aggregation/youth-promotes.js',
		'information-aggregation/youth-series-estimation.js',
		'information-aggregation/youth-skills.js',
		'information-aggregation/youth-twins.js',
		'links/links-achievements.js',
		'links/links-alliances.js',
		'links/links-arena.js',
		'links/links-challenges.js',
		'links/links-club-transfers.js',
		'links/links-coach.js',
		'links/links-country.js',
		'links/links-economy.js',
		'links/links-fans.js',
		'links/links-league.js',
		'links/links-manager.js',
		'links/links-match.js',
		'links/links-national.js',
		'links/links-player-detail.js',
		'links/links-players.js',
		'links/links-team.js',
		'links/links-tracker.js',
		'links/links-training.js',
		'links/links-world.js',
		'links/links-youth.js',
		'links/links.js',
		'matches/att-vs-def.js',
		'matches/copy-ratings.js',
		'matches/htms-prediction.js',
		'matches/live-match-report-format.js',
		'matches/match-income.js',
		'matches/match-lineup-fixes.js',
		'matches/match-lineup-tweaks.js',
		'matches/match-order.js',
		'matches/match-player-colouring.js',
		'matches/match-ratings-tweaks.js',
		'matches/match-report-format.js',
		'matches/match-simulator.js',
		'matches/ratings.js',
		'presentation/bookmark-adjust.js',
		'presentation/country-list.js',
		'presentation/currency-converter.js',
		'presentation/custom-medals.js',
		'presentation/fans.js',
		'presentation/fix-css-problems.js',
		'presentation/friendly-interface.js',
		'presentation/friendly-pool.js',
		'presentation/header-fix.js',
		'presentation/header-toggle.js',
		'presentation/highlight-cup-wins.js',
		'presentation/highlight-ownerless.js',
		'presentation/ht-date-format.js',
		'presentation/large-flags.js',
		'presentation/league-news-filter.js',
		'presentation/local-time.js',
		'presentation/loyalty-display.js',
		'presentation/mobile-enhancements.js',
		'presentation/move-manager-online.js',
		'presentation/move-player-select-box.js',
		'presentation/move-player-statement.js',
		'presentation/old-style-face.js',
		'presentation/original-face.js',
		'presentation/personality-images.js',
		'presentation/player-stats-training-week.js',
		'presentation/ratings-display.js',
		'presentation/safe-for-work.js',
		'presentation/simple-presentation.js',
		'presentation/skill-coloring.js',
		'presentation/skill-translation.js',
		'presentation/skin-plugin.js',
		'presentation/supporters-list.js',
		'presentation/tabs-test.js',
		'presentation/team-select-box.js',
		'presentation/youth-skill-hide-unknown.js',
		'shortcuts-and-tweaks/add-promote-reminder.js',
		'shortcuts-and-tweaks/confirm-actions.js',
		'shortcuts-and-tweaks/context-menu-copy.js',
		'shortcuts-and-tweaks/copy-bb-ad.js',
		'shortcuts-and-tweaks/copy-match-id.js',
		'shortcuts-and-tweaks/copy-player-ad.js',
		'shortcuts-and-tweaks/copy-youth.js',
		'shortcuts-and-tweaks/extra-shortcuts.js',
		'shortcuts-and-tweaks/filter.js',
		'shortcuts-and-tweaks/lineup-shortcut.js',
		'shortcuts-and-tweaks/main-menu-drop-down.js',
		'shortcuts-and-tweaks/manager-buttons.js',
		'shortcuts-and-tweaks/player-filters.js',
		'shortcuts-and-tweaks/rapid-id.js',
		'shortcuts-and-tweaks/relive-links.js',
		'shortcuts-and-tweaks/senior-team-shortcuts.js',
		'shortcuts-and-tweaks/supportership-expiration-date.js',
		'shortcuts-and-tweaks/table-sort.js',
		'shortcuts-and-tweaks/team-popup-links.js',
		'shortcuts-and-tweaks/transfer-history-filters.js',
		'shortcuts-and-tweaks/transfer-search-filters.js',
		'shortcuts-and-tweaks/transfer-search-result-filters.js',
		//<!-- end categorized modules -->

		//<!-- browser specific -->
		'ui.js',
		'entry.js',
		'loader-firefox.js'
	],

	loadScript: function() {
		try {
			// lib scope integration
			let libMap = {
				'saveAs': 'FileSaver.js',
				'YAML': 'yaml.js',
				'IDBStore': 'idbstore.js',
			};
			let scope = {
				self: this.owner,
				Foxtrick: this,
				exports: true,
				module: { exports: true },
				require: {}
			};
			for (let lib in libMap) {
				Services.scriptloader.loadSubScript(PATH + 'lib/' + libMap[lib], scope, 'UTF-8');
				this.owner.Foxtrick[lib] = scope.module.exports;
			}
		}
		catch (e) {
			e.message = 'Foxtrick ERROR: ' + e.message;
			Services.console.logStringMessage(e);
		}
		// loading Foxtrick into window.Foxtrick
		for (var i = 0; i < this.scripts.length; ++i) {
			try {
				Services.scriptloader.loadSubScript(PATH + this.scripts[i], this.owner, 'UTF-8');
			}
			catch (e) {
				e.message = 'Foxtrick ERROR: ' + e.message;
				Services.console.logStringMessage(e);
			}
		}
	},
	toDOMDocumentFragment: function(doc, xmlString, parent) {
		let range = doc.createRange();
		range.selectNodeContents(parent);
		let fragment = range.createContextualFragment(xmlString);
		range.detach();
		return fragment;
	},

	loadUI: function() {
		this.loadContextMenu();

		if (typeof this.owner.CustomizableUI !== 'undefined') {
			// Australis
			this.loadAustralisUI();
		}
		else {
			try {
				Services.scriptloader.loadSubScript(PATH + 'lib/ToolbarItem.js', this);
				this.loadToolbarItem();
			}
			catch (e) {
				dump('FoxTrick error: ToolbarItem failed ' + e + '\n');
				Cu.reportError('FoxTrick error: ToolbarItem failed ' + e);
			}
		}
	},
	removeUI: function() {
		this.removeContextMenu();

		if (typeof this.owner.CustomizableUI !== 'undefined')
			// Australis
			this.removeAustralisUI();

		// defined in ToolbarItem.js
		if (typeof this.shutdown === 'function')
			this.shutdown();
	},
	loadAustralisUI: function() {
		let doc = this.owner.document;
		let panel = doc.createElement('panelview');
		panel.setAttribute('id', 'foxtrick-toolbar-view');
		let menuString =
			'<toolbarbutton id="foxtrick-toolbar-preferences" />' +
			'<toolbarbutton id="foxtrick-toolbar-deactivate" type="checkbox" ' +
				'autocheck="true"/>' +
			'<toolbarbutton id="foxtrick-toolbar-clearCache" />' +
			'<toolbarbutton id="foxtrick-toolbar-highlight" type="checkbox" ' +
				'autocheck="true"/>' +
			'<toolbarbutton id="foxtrick-toolbar-translationKeys" type="checkbox" ' +
				'autocheck="true"/>';
		let fragment = this.toDOMDocumentFragment(doc, menuString, panel);
		panel.appendChild(fragment);
		doc.getElementById('PanelUI-multiView').appendChild(panel);
	},
	removeAustralisUI: function() {
		let panel = this.owner.document.getElementById('foxtrick-toolbar-view');
		if (panel)
			panel.remove();
	},
	loadToolbarItem: function() {
		try {
			// toolbar
			this.generalButton = this.ToolbarItem.create(
				'<toolbarbutton id="foxtrick-toolbar-button" ' +
					'type="menu" ' +
					'label="FoxTrick" ' +
					'tooltiptext="FoxTrick" ' +
					'context="foxtrick-menu" ' +
					'class="' + this.ToolbarItem.BASIC_ITEM_CLASS +
						' foxtrick-toolbar-item">' +
					'<menupopup id="foxtrick-menu">' +
						'<menuitem id="foxtrick-toolbar-preferences"/>' +
						'<menuitem id="foxtrick-toolbar-deactivate" type="checkbox" ' +
							'autocheck="true"/>' +
						'<menuitem id="foxtrick-toolbar-clearCache" />' +
						'<menuitem id="foxtrick-toolbar-highlight" type="checkbox" ' +
							'autocheck="true"/>' +
						'<menuitem id="foxtrick-toolbar-translationKeys" type="checkbox" ' +
							'autocheck="true"/>' +
					'</menupopup>' +
				'</toolbarbutton>',
				this.owner.document.getElementById('nav-bar')
			);
		}
		catch (e) {
			dump('FoxTrick error: Toolbar button init ' + e + '\n');
			Cu.reportError('FoxTrick error: Toolbar button init ' + e);
		}
	},
	loadContextMenu: function() {
		try {
			// contextmenu
			let doc = this.owner.document;
			let popup = doc.getElementById('contentAreaContextMenu');
			let copyPaste = doc.getElementById('context-paste');
			let contextMenuString =
				'<menu id="foxtrick-popup-copy" ' +
					'class="menu-iconic foxtrick-menu-item" ' +
					'label="FoxTrick">' +
					'<menupopup>' +
						'<menuitem id="foxtrick-popup-copy-id" ' +
							'label="Copy ID"/>' +
						'<menuitem id="foxtrick-popup-copy-link" ' +
							'label="Copy Link Location in HT-ML"/>' +
						'<menuitem id="foxtrick-popup-copy-ht-ml" ' +
							'label="Copy in HT-ML"/>' +
						'<menuitem id="foxtrick-popup-copy-table" ' +
							'label="Copy table in HT-ML"/>' +
					'</menupopup>' +
				'</menu>';
			let fragment = this.toDOMDocumentFragment(doc, contextMenuString, popup);
			popup.insertBefore(fragment, copyPaste.nextSibling);
		}
		catch (e) {
			dump('FoxTrick error: Context menu init ' + e + '\n');
			Cu.reportError('FoxTrick error: Context menu init ' + e);
		}
	},
	removeContextMenu: function() {
		let doc = this.owner.document;
		let menu = doc.getElementById('foxtrick-popup-copy');
		if (menu)
			menu.remove();
	},

	init: function() {
		// load foxtrick files
		this.loadScript();
		// add ui
		this.loadUI();
		//init and add listeners
		this.loader.firefox.browserLoad();
	},

	cleanup: function() {
		// remove ui
		this.removeUI();
		// unload FileSaver lib
		this.saveAs.unload();
		// remove listeners and css
		this.loader.firefox.browserUnLoad();
	},
};


// called from main bootstrap.js for each browser window
function loadIntoWindow(window) {
	if (!window || !window.document)
		return;

	// styles also needed in eg customize-toolbox
	var uri = PATH + 'resources/css/overlay.css';
	var attr = 'id="foxtrick-overlay-css" type="text/css" href="' + uri + '"';
	var style = window.document.createProcessingInstruction('xml-stylesheet', attr);
	window.document.insertBefore(style, window.document.documentElement);

	// only in content windows (not menupopups etc)
	if (!window.document.getElementById('appcontent'))
		return;
	if (window.document.documentElement.getAttribute('windowtype') != 'navigator:browser')
		return;

	// create & run
	try {
		window.Foxtrick = new FoxtrickFirefox(window);
		window.Foxtrick.init();
	}
	catch (e) {
		dump('FoxTrick error: ' + e + '\n');
		Cu.reportError('FoxTrick error: ' + e);
	}
}


function unloadFromWindow(window) {
	if (!window || !window.document)
		return;

	// styles also needed in eg customize-toolbox
	var style = window.document.getElementById('foxtrick-overlay-css');
	if (style)
		window.document.removeChild(style);

	// only in content windows (not menupopups etc)
	if (!window.document.getElementById('appcontent'))
		return;

	// stop and delete
	window.Foxtrick.cleanup();
	delete window.Foxtrick;
}
