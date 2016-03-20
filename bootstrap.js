/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

/**
 * bootstrap.js
 *
 * @author convincedd, LA-MJ
 */

'use strict';

/* global Services, CustomizableUI, APP_SHUTDOWN */

/* jscs:disable disallowFunctionDeclarations */

/* jshint ignore:start */
const { classes: Cc, interfaces: Ci, utils: Cu, manager: Cm, results: Cr } = Components;
/* jshint ignore:end */
const FOXTRICK_PATH = 'chrome://foxtrick/content/';

let gScope;

Cu.import('resource://gre/modules/Services.jsm');

function isFennecNative() {
	return Services.appinfo.ID == '{aa3c5121-dab2-40e2-81ca-7ea25febc110}';
}

// load prefs into default prefs branch
function setDefaultPrefs(pathToDefault, branch) {
	// Load default preferences and set up properties for them
	let defaultBranch = Services.prefs.getDefaultBranch(branch);
	let scope = {
		pref: function(key, val) {
			if (key.slice(0, branch.length) !== branch) {
				Cu.reportError(new Error('Ignoring default preference ' + key + ', wrong branch.'));
				return;
			}
			key = key.slice(branch.length);
			switch (typeof val) {
				case 'boolean':
					defaultBranch.setBoolPref(key, val);
				break;
				case 'number':
					defaultBranch.setIntPref(key, val);
				break;
				case 'string':
					defaultBranch.setCharPref(key, val);
				break;
			}
		},
	};
	Services.scriptloader.loadSubScript(pathToDefault, scope);
}

// bootstrap.js API
let windowListener = {
	onOpenWindow: function(aWindow) {
		// Wait for the window to finish loading
		let ifRqstr = aWindow.QueryInterface(Ci.nsIInterfaceRequestor);
		let domWindow = ifRqstr.getInterface(Ci.nsIDOMWindow);

		domWindow.addEventListener('DOMContentLoaded', function waitForWindowload() {
			domWindow.removeEventListener('DOMContentLoaded', waitForWindowload);
			gScope.loadIntoWindow(domWindow);
		});
	},
	/* jshint ignore:start */
	onCloseWindow: function(aWindow) {},
	onWindowTitleChange: function(aWindow, aTitle) {},
	/* jshint ignore:end */
};

function initAustralisUI() {
	// this needs to run after existed windows were loaded into
	try {
		Cu.import('resource:///modules/CustomizableUI.jsm');
	}
	catch (e) {
		return;
	}
	CustomizableUI.createWidget({
		id: 'foxtrick-toolbar-button',
		type: 'custom',
		defaultArea: CustomizableUI.AREA_NAVBAR,
		tooltiptext: 'Foxtrick',
		onBuild: function(aDocument) {
			var node = aDocument.createElement('toolbarbutton');
			node.id = 'foxtrick-toolbar-button';
			node.className = 'toolbarbutton-1';
			node.setAttribute('type', 'menu');
			node.setAttribute('label', 'Foxtrick');

			let menu = aDocument.getElementById('foxtrick-toolbar-view');
			node.appendChild(menu);

			let win = aDocument.defaultView;
			win.Foxtrick.modules.UI._updateSingle(win);

			return node;
		},
	});
}

function startup(aData, aReason) { // jshint ignore:line
	// prefs branch
	const branch = 'extensions.foxtrick.prefs.';

	gScope = { FOXTRICK_RUNTIME: new Date().valueOf() };

	let pathToDefault, bootstrap;
	// load specific startup scripts
	if (isFennecNative()) {
		pathToDefault = aData.resourceURI.spec + 'defaults/preferences/foxtrick.android.js';
		bootstrap = 'bootstrap-fennec.js';
	}
	else {
		pathToDefault = aData.resourceURI.spec + 'defaults/preferences/foxtrick.js';
		bootstrap = 'bootstrap-firefox.js';
	}

	setDefaultPrefs(pathToDefault, branch);

	bootstrap += '?bg=' + gScope.FOXTRICK_RUNTIME;
	Services.scriptloader.loadSubScript(FOXTRICK_PATH + bootstrap, gScope, 'UTF-8');

	// Load into any existing windows
	let win;
	let enumerator = Services.wm.getEnumerator('navigator:browser');
	while (enumerator.hasMoreElements()) {
		win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
		gScope.loadIntoWindow(win);
	}

	if (typeof win !== 'undefined') {
		// during FF startup bootstrap runs before any windows are created,
		// hence win is undefined
		// this is not the case if FT is re-enabled from add-ons menu, though
		// probably same thing with upgrades
		win.Foxtrick.reloadAll();
	}

	// Load into any new windows
	Services.wm.addListener(windowListener);

	if (!isFennecNative()) {
		// this needs to run after existed windows were loaded into
		initAustralisUI();
	}
}

function shutdown(aData, aReason) { // jshint ignore:line
	// When the application is shutting down we normally don't have to clean
	// up any UI changes made
	if (aReason == APP_SHUTDOWN)
		return;

	// Stop listening for new windows
	Services.wm.removeListener(windowListener);

	// Unload from any existing windows
	let windows = Services.wm.getEnumerator('navigator:browser');
	while (windows.hasMoreElements()) {
		let win = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
		gScope.unloadFromWindow(win);
	}

	if (typeof CustomizableUI !== 'undefined') {
		CustomizableUI.destroyWidget('foxtrick-toolbar-button');
	}

	// Flush string bundle cache
	Services.strings.flushBundles();

	// destroy scope
	gScope = undefined;
}

/* jshint ignore:start */
function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}
