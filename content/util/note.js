'use strict';
/* note.js
 * Foxtrick.util.note used for creating FoxTrick notes.
 * @author ryanli
 */

if (!Foxtrick) var Foxtrick = {};
if (!Foxtrick.util) Foxtrick.util = {};

Foxtrick.util.note = {
	BUTTON_OK: { name: 'button.ok' },
	// BUTTON_CANCEL has a default event listener to remove the note if
	// listener/onClick parameters are not passed
	BUTTON_CANCEL: { name: 'button.cancel' },

	/* Foxtrick.util.note.add
	 * add a FoxTrick note to current page and turn to it
	 * Foxtrick.util.note.create
	 * returns a FoxTrick note for confirmation or other uses
	 *
	 * they share the same parameters:
	 * doc - the HTML document
	 * insertBefore - the node before which we will insert the note, could be
	 *     set to null, and the default insert position will be used.
	 * id - HTML id of the returned node
	 * msg - message to be shown
	 * buttons - buttons to be shown, along with event listeners, in following
	 *     format:
	 *     [
	 *         {
	 *             type: Foxtrick.util.note.BUTTON_XXX,
	 *             listener: function() { ... },
	 *         },
	 *         ...
	 *     ]
	 * hasClose - whether to add a link labelled 'Close' for closing the note
	 */

	add: function(doc, insertBefore, id, msg, buttons, hasClose, doJump, inline, timeout) {
		// first we remove the old notes with same name
		var old = doc.getElementById(id);
		if (old) {
			old.parentNode.removeChild(old);
		}
		var note = this.create(doc, msg, buttons, hasClose, timeout);
		note.id = id;
		if (insertBefore && insertBefore.parentNode) {
			insertBefore.parentNode.insertBefore(note, insertBefore);
		}
		else {
			// default insert position
			var appendTo = doc.getElementById('ctl00_updNotifications') ||
				doc.getElementById('ctl00_ctl00_CPContent_ucNotifications_updNotifications');
			appendTo.appendChild(note);
		}

		// ensure the note is visible
		if (doJump)
			note.scrollIntoView(false);

		// add copy instructions for opera and safari to copy notes
		if ((Foxtrick.platform == 'Opera' || Foxtrick.platform == 'Safari') &&
		    id.indexOf('copy-note') !== -1) {
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
	},

	create: function(doc, msg, buttons, hasClose, timeout) {
		try {
			var container = doc.createElement('div');
			container.className = 'ft-note';

			// msg could be either a string or an HTML node
			if (typeof(msg) == 'string') {
				var par = doc.createElement('p');
				par.textContent = msg;
				container.appendChild(par);
			}
			else {
				container.appendChild(msg);
			}

			if (buttons && buttons.length) {
				var buttonContainer = doc.createElement('div');
				for (var i = 0; i < buttons.length; ++i) {
					var button = doc.createElement('input');
					button.type = 'button';
					button.value = Foxtrick.L10n.getString(buttons[i].type.name);
					if (buttons[i].listener) {
						Foxtrick.onClick(button, buttons[i].listener);
					}
					else if (buttons[i].type == this.BUTTON_CANCEL) {
						button.setAttribute('container', id);
						// default event listener for BUTTON_CANCEL
						Foxtrick.onClick(button, function(ev) {
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
							});
					}
					buttonContainer.appendChild(button);
				}
				container.appendChild(buttonContainer);
			}

			if (timeout) {
				window.setTimeout(function() {
					try {
							container.parentNode.removeChild(container);
						}
						catch (e) {
							Foxtrick.log(e);
						}
				},timeout);
			}

			if (hasClose === true) {
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
	},

	createLoading: function(doc, inline, loadingText) {
		if (!loadingText)
			loadingText = Foxtrick.L10n.getString('status.loading');
		if (inline) {
			// if the note is inline, return a span with nothing special
			var container = doc.createElement('span');
			container.className = 'hidden';
			container.textContent = loadingText;
			return container;
		}
		else {
			var container = doc.createElement('div');
			var img = doc.createElement('img');
			img.src = '/Img/Icons/loading.gif';
			img.alt = loadingText;
			container.appendChild(img);
			container.appendChild(doc.createTextNode(' '));
			container.appendChild(doc.createTextNode(loadingText));
			var note = this.create(doc, container, null, false);

			// delay showing
			Foxtrick.addClass(note, 'hidden');
			window.setTimeout(function() { Foxtrick.removeClass(note, 'hidden'); }, 500);

			return note;
		}
	}
};
