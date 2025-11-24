/**
 * note.js
 * Foxtrick.util.note used for creating Foxtrick notes.
 * @author ryanli
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.note = {};

/** @type {Object<string, NoteButtonType>} */
Foxtrick.util.note.BUTTONS = {};

Foxtrick.util.note.BUTTONS.OK = { name: 'button.ok' };

// BUTTON_CANCEL has a default event listener to remove the note if
// listener/onClick parameters are not passed
Foxtrick.util.note.BUTTONS.CANCEL = { name: 'button.cancel' };

/**
 * @typedef NoteButtonType
 * @prop {string} name
 * @typedef NoteButton
 * @prop {NoteButtonType} type
 * @prop {Listener<HTMLInputElement, MouseEvent>} [listener]
 * @typedef NoteOptions
 * @prop {HTMLElement} [at]
 * @prop {HTMLElement} [to]
 * @prop {boolean} [focus]
 * @prop {boolean} [closable]
 * @prop {number} [timeout]
 * @prop {NoteButton[]} [buttons]
 */

/**
 * Creates a note container with a given message and ID, inserts it and returns it.
 * Note is inserted before options.at, or appended to options.to, or at a default location.
 * Additional options:
 * focus: scrollIntoView (false)
 * timeout: close automatically in X ms (null)
 * closable: adds the close button (true)
 * buttons: additional buttons if any:
 * Array<{type: Foxtrick.util.note.BUTTONS.XXX, listener: function}>
 *
 * @param  {document}    doc
 * @param  {string|Node} msg       message to display
 * @param  {string?}     [noteId]  note ID
 * @param  {NoteOptions} [options] additional options
 * @return {HTMLElement}           the constructed note
 */
Foxtrick.util.note.add = function(doc, msg, noteId, options) {
	var note = this._create(doc, msg, noteId, options);
	var id = note.id; // this may change (if id was null)

	/** @type {NoteOptions} */
	var opts = {
		at: null,
		to: null,
		focus: false,
		timeout: null,
	};

	if (options && typeof options === 'object')
		Foxtrick.mergeValid(opts, options);

	if (opts.at && opts.at.parentNode) {
		opts.at.parentNode.insertBefore(note, opts.at);
	}
	else if (opts.to) {
		opts.to.appendChild(note);
	}
	else {
		// default insert position
		let appendTo = Foxtrick.Pages.All.getNotes(doc);
		appendTo.appendChild(note);
	}

	// ensure the note is visible
	if (opts.focus)
		note.scrollIntoView(false);

	if (opts.timeout) {
		let win = doc.defaultView;
		win.setTimeout(function() {
			try {
				// eslint-disable-next-line no-invalid-this
				let container = this.document.getElementById(id);
				if (container)
					container.parentNode.removeChild(container);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		}, opts.timeout);
	}

	// // add copy instructions for safari to copy notes
	// if (Foxtrick.platform == 'Safari' && id.indexOf('copy-note') !== -1) {
	// 	Foxtrick.sessionGet('clipboard', (string) => {
	// 		let msgP = note.querySelector('p');
	// 		msgP.textContent = Foxtrick.L10n.getString('specialCopy.hint');
	// 		let textarea = doc.createElement('textarea');
	// 		msgP.parentNode.insertBefore(textarea, msgP.nextSibling);
	// 		textarea.value = string;
	// 		textarea.select();
	// 	});
	// }

	return note;
};


/**
 * Returns a note with a loading spinner.
 * Loading text can optionally be customized (defaults to Loading...).
 * inline: true returns a basic span
 *
 * TODO check if all calls test for xmlLoad pref
 *
 * @param  {document}    doc
 * @param  {string}      [loadingText]
 * @param  {boolean}     [inline]
 * @return {HTMLElement}
 */
Foxtrick.util.note.createLoading = function(doc, loadingText, inline) {
	var text = loadingText || Foxtrick.L10n.getString('status.loading');

	var container;
	if (inline) {
		// if the note is inline, return a span with nothing special
		container = doc.createElement('span');
		container.className = 'hidden';
		container.textContent = text;
		return container;
	}

	container = doc.createElement('div');
	let img = doc.createElement('img');
	img.src = '/Img/Icons/loading.gif';
	img.alt = text;
	container.appendChild(img);
	container.appendChild(doc.createTextNode(' '));
	container.appendChild(doc.createTextNode(text));

	let id = 'ft-loading-' + Math.random().toString().slice(2);
	let note = this._create(doc, container, id, { closable: false });

	// delay showing
	Foxtrick.addClass(note, 'hidden');
	let win = doc.defaultView;
	win.setTimeout(function() {
		// eslint-disable-next-line no-invalid-this
		Foxtrick.removeClass(this.document.getElementById(id), 'hidden');
		// eslint-disable-next-line no-magic-numbers
	}, 500);

	return note;
};

/**
 * @param  {document}    doc
 * @param  {string|Node} msg
 * @param  {string}      [noteId]
 * @param  {NoteOptions} [options]
 * @return {HTMLElement}
 */
// eslint-disable-next-line complexity
Foxtrick.util.note._create = function(doc, msg, noteId, options) {
	/** @type {NoteOptions} */
	var opts = {
		buttons: null,
		closable: true,
	};
	if (options && typeof options === 'object')
		Foxtrick.mergeValid(opts, options);

	try {
		let id = noteId ||
			'ft-note-' + Foxtrick.hash(typeof msg == 'string' ? msg : msg.textContent);

		// first we remove the old notes with same name
		let old = doc.getElementById(id);
		if (old)
			old.parentNode.removeChild(old);

		var container = doc.createElement('div');
		container.className = 'ft-note';
		container.id = id;

		// msg could be either a string or an HTML node
		if (typeof msg == 'string') {
			let par = doc.createElement('p');
			par.textContent = msg;
			container.appendChild(par);
		}
		else {
			container.appendChild(msg);
		}

		if (opts.buttons && opts.buttons.length) {
			/**
			 * default event listener for BUTTON_CANCEL
			 *
			 * @type {Listener<HTMLInputElement, MouseEvent>}
			 * */
			let cancel = function() {
				try {
					// eslint-disable-next-line no-invalid-this, consistent-this
					let button = this;
					let doc = button.ownerDocument;
					let containerId = button.getAttribute('container');
					let container = doc.getElementById(containerId);
					if (container)
						container.parentNode.removeChild(container);
				}
				catch (e) {
					Foxtrick.log(e);
				}
			};

			let buttonContainer = doc.createElement('div');
			for (let btn of opts.buttons) {
				let button = doc.createElement('input');
				button.type = 'button';
				button.value = Foxtrick.L10n.getString(btn.type.name);
				if (btn.listener) {
					Foxtrick.onClick(button, btn.listener);
				}
				else if (btn.type == this.BUTTONS.CANCEL) {
					button.setAttribute('container', id);
					Foxtrick.onClick(button, cancel);
				}
				buttonContainer.appendChild(button);
			}
			container.appendChild(buttonContainer);
		}

		if (opts.closable) {
			let close = doc.createElement('a');
			close.className = 'close';
			close.textContent = Foxtrick.L10n.getString('button.close');

			Foxtrick.onClick(close, function() {
				try {
					// eslint-disable-next-line no-invalid-this
					let container = this.parentNode;
					if (container)
						container.parentNode.removeChild(container);
				}
				catch (e) {
					Foxtrick.log(e);
				}
			});
			container.appendChild(close);

			// we need to add clear since close is floated to the right
			let clear = doc.createElement('div');
			clear.className = 'clear';
			container.appendChild(clear);
		}

		return container;
	}
	catch (e) {
		Foxtrick.log(e);
	}

	return null;
};
