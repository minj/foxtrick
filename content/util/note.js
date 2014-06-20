'use strict';
/* note.js
 * Foxtrick.util.note used for creating FoxTrick notes.
 * @author ryanli
 */

if (!Foxtrick.util)
	Foxtrick.util = {};
Foxtrick.util.note = {
	BUTTON_OK: { name: 'button.ok' },
	// BUTTON_CANCEL has a default event listener to remove the note if
	// listener/onClick parameters are not passed
	BUTTON_CANCEL: { name: 'button.cancel' },
};

/**
 * Creates a note container with a given message and ID, inserts it and returns it.
 * Note is inserted before options.at, or appended to options.to, or at a default location.
 * Additional options:
 * focus: scrollIntoView (false)
 * timeout: close automatically in X ms (null)
 * closable: adds the close button (true)
 * buttons: additional buttons if any:
 * Array<{type: Foxtrick.util.note.BUTTON_XXX, listener: function}>
 * @param  {document}                                    doc
 * @param  {(String|HTMLElement)}                        msg     message to display
 * @param  {String?}                                     id      note ID
 * @param  {{at, to, focus, timeout, buttons, closable}} options additional options
 * @return {HTMLElement}                                         the constructed note
 */
Foxtrick.util.note.add = function(doc, msg, id, options) {
	var note = this._create(doc, msg, id, options);
	id = note.id; // this may change (if id was null)

	var opts = {
		at: null,
		to: null,
		focus: false,
		timeout: null,
	};
	if (options && typeof options === 'object') {
		for (var o in opts) {
			if (o in options)
				opts[o] = options[o];
		}
	}

	if (opts.at && opts.at.parentNode) {
		opts.at.parentNode.insertBefore(note, opts.at);
	}
	else if (opts.to) {
		opts.to.appendChild(note);
	}
	else {
		// default insert position
		var appendTo = doc.getElementById('ctl00_updNotifications') ||
			doc.getElementById('ctl00_ctl00_CPContent_ucNotifications_updNotifications');
		appendTo.appendChild(note);
	}

	// ensure the note is visible
	if (opts.focus)
		note.scrollIntoView(false);


	if (opts.timeout) {
		var win = doc.defaultView;
		win.setTimeout(function() {
			try {
				var container = this.document.getElementById(id);
				if (container)
					container.parentNode.removeChild(container);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		}, opts.timeout);
	}

	// add copy instructions for safari to copy notes
	if (Foxtrick.platform == 'Safari' && id.indexOf('copy-note') !== -1) {
		Foxtrick.sessionGet('clipboard',
		  function(string) {
			var msg_p = note.getElementsByTagName('p')[0];
			msg_p.textContent = Foxtrick.L10n.getString('specialCopy.hint');
			var textarea = doc.createElement('textarea');
			msg_p.parentNode.insertBefore(textarea, msg_p.nextSibling);
			textarea.value = string;
			textarea.select();
		});
	}

	return note;
};

/**
 * Returns a note with a loading spinner.
 * Loading text can optionally be customized (defaults to Loading...).
 * inline: true returns a basic span
 * @param  {document}    doc
 * @param  {String}      loadingText
 * @param  {Boolean}     inline
 * @return {HTMLElement}
 */
Foxtrick.util.note.createLoading = function(doc, loadingText, inline) {
	if (!loadingText)
		loadingText = Foxtrick.L10n.getString('status.loading');
	var container;
	if (inline) {
		// if the note is inline, return a span with nothing special
		container = doc.createElement('span');
		container.className = 'hidden';
		container.textContent = loadingText;
		return container;
	}
	else {
		container = doc.createElement('div');
		var img = doc.createElement('img');
		img.src = '/Img/Icons/loading.gif';
		img.alt = loadingText;
		container.appendChild(img);
		container.appendChild(doc.createTextNode(' '));
		container.appendChild(doc.createTextNode(loadingText));
		var id = 'ft-loading-' + Math.random().toString().substr(2);
		var note = this._create(doc, container, id, { closable: false });

		// delay showing
		Foxtrick.addClass(note, 'hidden');
		var win = doc.defaultView;
		win.setTimeout(function() {
			Foxtrick.removeClass(this.document.getElementById(id), 'hidden');
		}, 500);

		return note;
	}
};

Foxtrick.util.note._create = function(doc, msg, id, options) {
	var opts = {
		buttons: null,
		closable: true,
	};
	if (options && typeof options === 'object') {
		for (var o in opts) {
			if (o in options)
				opts[o] = options[o];
		}
	}
	try {
		if (!id) {
			id = 'ft-note-' + Foxtrick.hash(msg.textContent || msg);
		}

		// first we remove the old notes with same name
		var old = doc.getElementById(id);
		if (old) {
			old.parentNode.removeChild(old);
		}

		var container = doc.createElement('div');
		container.className = 'ft-note';
		container.id = id;

		// msg could be either a string or an HTML node
		if (typeof msg == 'string') {
			var par = doc.createElement('p');
			par.textContent = msg;
			container.appendChild(par);
		}
		else {
			container.appendChild(msg);
		}

		if (opts.buttons && opts.buttons.length) {
			// default event listener for BUTTON_CANCEL
			var cancel = function(ev) {
				try {
					var doc = ev.target.ownerDocument;
					var containerId = ev.currentTarget.getAttribute('container');
					var container = doc.getElementById(containerId);
					if (container) {
						container.parentNode.removeChild(container);
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}
			};
			var buttonContainer = doc.createElement('div');
			for (var i = 0; i < opts.buttons.length; ++i) {
				var button = doc.createElement('input');
				button.type = 'button';
				button.value = Foxtrick.L10n.getString(opts.buttons[i].type.name);
				if (opts.buttons[i].listener) {
					Foxtrick.onClick(button, opts.buttons[i].listener);
				}
				else if (opts.buttons[i].type == this.BUTTON_CANCEL) {
					button.setAttribute('container', id);
					Foxtrick.onClick(button, cancel);
				}
				buttonContainer.appendChild(button);
			}
			container.appendChild(buttonContainer);
		}

		if (opts.closable) {
			var close = doc.createElement('a');
			close.className = 'close';
			close.textContent = Foxtrick.L10n.getString('button.close');
			Foxtrick.onClick(close, function(ev) {
				try {
					var container = ev.target.parentNode;
					if (container) {
						container.parentNode.removeChild(container);
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}
			});
			container.appendChild(close);
			// we need to add clear since close is floated to the right
			var clear = doc.createElement('div');
			clear.className = 'clear';
			container.appendChild(clear);
		}

		return container;
	}
	catch (e) {
		Foxtrick.log(e);
	}
};
