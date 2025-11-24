/**
 * notify.js
 * Utilities for creating a notification
 *
 * @author ryanli, convincedd, LA-MJ
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
if (!Foxtrick.util)
	Foxtrick.util = {};
/* eslint-enable */

Foxtrick.util.notify = {};

/**
 * Create a desktop notification with a given message and link to source
 * Returns a promise that fulfills with the url once user acts on the notification
 * OR rejects with Foxtrick.TIMEOUT_ERROR if the notification is closed
 *
 * source is normally an URL or sender object in the background (non-Gecko).
 * opts is chrome NotificationOptions or
 * {msg, url, id: string, opts: NotificationOptions} in the background (non-Gecko).
 *
 * @param  {string}          msg
 * @param  {string|object}   source
 * @param  {object}          opts
 * @param  {function}        callback {function(string)}
 *
 * @return {Promise<string>}
 */
Foxtrick.util.notify.create = function(msg, source, opts) {
	const TITLE = 'Hattrick';
	const IMG = Foxtrick.InternalPath + 'resources/img/icon-128.png';
	// eslint-disable-next-line no-unused-vars
	const NAME = 'Foxtrick'; // lgtm[js/unused-local-variable]
	const IS_CLICKABLE = true;

	var gId = '', gUrl = '', gTabOpts = {}, gTabOptsBtn = {};

	var updateOriginTab = function(originTab, tabOpts) {
		var focusWindow = function(winId) {
			return new Promise(function(resolve) {
				chrome.windows.update(winId, { focused: true }, resolve);
			});
		};

		return new Promise(function(resolve) {
			if (!tabOpts)
				Foxtrick.log(new Error(`tabOpts is ${tabOpts}`));

			if (tabOpts.url) {
				// open URLs in a new tab next to original
				// set correct position
				// not setting opener since originTab may already be closed
				let newOpts = Object.assign({
					windowId: originTab.windowId,
					index: originTab.index + 1,
				}, tabOpts);

				chrome.tabs.create(newOpts, resolve);
				return;
			}

			chrome.tabs.update(originTab.id, tabOpts, (tab) => {
				if (chrome.runtime.lastError) {
					// tab closed, restore
					let restoreOpts = Object.assign({
						url: gUrl,
						windowId: originTab.windowId,
						index: originTab.index,
					}, tabOpts);

					chrome.tabs.create(restoreOpts, resolve);
				}
				else {
					resolve(tab);
				}
			});
		}).then(function(tab) {
			return focusWindow(tab.windowId).then(function() {
				return tab;
			});
		});
	};

	var createChrome = async function() {
		var options = {
			type: 'basic',
			iconUrl: IMG,
			title: TITLE,
			message: msg,
			contextMessage: Foxtrick.L10n.getString('notify.focus'),
			isClickable: IS_CLICKABLE,

			// buttons: [
			// 	{ title: 'Button1', iconUrl: 'resources/img/hattrick-logo.png' },
			// 	{ title: 'Button2', iconUrl: 'resources/img/hattrick-logo.png' }
			// ],
			// items: [
			// 	{ title: 'Item1', message: 'resources/img/hattrick-logo.png' },
			// 	{ title: 'Item2', message: 'resources/img/hattrick-logo.png' }
			// ],
		};
		if (opts) {
			// overwrite defaults
			for (var opt in opts)
				options[opt] = opts[opt];
		}

		var clearNote = function(noteId) {
			return new Promise(function(resolve) {
				chrome.notifications.clear(noteId, resolve);
			});
		};

		var createNote = function(gId, options) {
			return new Promise((fulfill, reject) => {
				chrome.notifications.create(gId, options, (nId) => {
					var err = chrome.runtime.lastError;
					if (err)
						reject(err);
					else
						fulfill(nId);
				});
			});
		};

		var getNotes = function() {
			return new Promise((fulfill) => {
				chrome.notifications.getAll(function(notes) {
					// eslint-disable-next-line no-empty
					if (chrome.runtime.lastError) {}

					fulfill(notes);
				});
			});
		};

		let notes = await getNotes();

		// clear dupes manually to trigger onClosed listener
		// prevents double execution when a note is duplicated before closing

		if (notes && gId in notes)
			await clearNote(gId);

		try {
			await createNote(gId, options);
		}
		catch (err) {
			// opera and FF do not support buttons
			// retrying without them
			if (!/buttons/.test(err.message))
				throw err;

			delete options.buttons;
			gTabOpts.url = gTabOptsBtn.url;

			await createNote(gId, options);
		}

		return new Promise((fulfill, reject) => {
			var unregister = () => {};

			var onClicked = async function onClicked(noteId) {
				if (noteId !== gId)
					return;

				try {
					unregister();
					await clearNote(noteId);
					await updateOriginTab(source.tab, gTabOpts);
					fulfill(gUrl);
				}
				catch (e) {
					reject(e);
				}
			};

			// eslint-disable-next-line no-unused-vars
			var onButtonClicked = async function onButtonClicked(noteId, btnIdx) {
				if (noteId !== gId)
					return;

				try {
					unregister();
					await clearNote(noteId);
					await updateOriginTab(source.tab, gTabOptsBtn);
					fulfill(gUrl);
				}
				catch (e) {
					reject(e);
				}
			};

			var onClosed = function onClosed(noteId) {
				if (noteId !== gId)
					return;

				unregister();

				reject(new Error(Foxtrick.TIMEOUT_ERROR));
			};

			chrome.notifications.onClicked.addListener(onClicked);
			chrome.notifications.onButtonClicked.addListener(onButtonClicked);
			chrome.notifications.onClosed.addListener(onClosed);
			unregister = () => {
				chrome.notifications.onButtonClicked.removeListener(onButtonClicked);
				chrome.notifications.onClicked.removeListener(onClicked);
				chrome.notifications.onClosed.removeListener(onClosed);
			};
		});
	};

	var createWebkit = function() {
		const WEBKIT_TIMEOUT = 20000;
		return new Promise((fulfill, reject) => {
			var onClick = async function onClick() {
				try {
					if (Foxtrick.platform === 'Chrome')
						await updateOriginTab(source.tab, { url: gUrl, selected: true });
					else
						Foxtrick.SB.tabs.create({ url: gUrl });

					fulfill(gUrl);
				}
				catch (err) {
					reject(err);
				}

				// eslint-disable-next-line no-invalid-this
				this.cancel();
			};

			// MV3: Safari-specific, not available in service workers
		if (typeof window === 'undefined' || !window.webkitNotifications)
			return;
		var notification = window.webkitNotifications.createNotification(IMG, TITLE, msg);

			if (gUrl)
				notification.onclick = onClick;

			// Then show the notification.
			notification.show();

			// close after 20 sec
			// MV3: Use self.setTimeout for service worker compatibility
		self.setTimeout(function() {
				reject(new Error(Foxtrick.TIMEOUT_ERROR));
				notification.cancel();
			}, WEBKIT_TIMEOUT);
		});
	};

	var createGrowl = function() {
		// MV3: Safari Growl bridge not available in service workers
	var bridge = (typeof window !== 'undefined') ? window.GrowlSafariBridge : null;
		try {
			if (bridge && bridge.notifyWithOptions) {
				bridge.notifyWithOptions(TITLE, msg, {
					isSticky: false,
					priority: -1,
					imageUrl: IMG,
				});
			}
			return Promise.reject(new Error(Foxtrick.TIMEOUT_ERROR));
		}
		catch (e) {
			return Promise.reject(e);
		}
	};

	// standardize options
	if (opts && opts.opts) {
		// request to background
		gId = opts.id || '';
		gUrl = opts.url;

		opts = opts.opts; // FIXME
	}
	else {
		// gecko or content
		opts = opts || {}; // FIXME

		if (opts.id) {
			gId = opts.id;
			delete opts.id;
		}

		gUrl = source;
	}

	gTabOpts = { active: true }; // focus only
	gTabOptsBtn = { active: true, url: gUrl }; // focus and open

	// start logic
	if (Foxtrick.context === 'background') {
		if (Foxtrick.platform === 'Chrome' && chrome.notifications)
			return createChrome();
		else if (typeof window !== 'undefined' && window.webkitNotifications)
			return createWebkit();
		else if (Foxtrick.platform === 'Safari')
			return createGrowl();

		return Promise.reject(Error('NotImplemented'));
	}

	return new Promise((fulfill, reject) => {
		// content needs to notify bg
		Foxtrick.SB.ext.sendRequest({
			req: 'notify',
			msg: msg,
			id: gId,
			url: gUrl,
			opts: opts,
		}, function onSendResponse(response) {
			let err = Foxtrick.jsonError(response);
			if (err instanceof Error)
				reject(err);
			else
				fulfill(response);
		});
	});
};
