/* note.js
 * Foxtrick.Note used for creating FoxTrick notes.
 * @author ryanli
 */
if (!Foxtrick) var Foxtrick = {};
Foxtrick.Note = {
	BUTTON_OK : { name : "button.ok" },
	// BUTTON_CANCEL has a default event listener to remove the note if
	// listener/onClick parameters are not passed
	BUTTON_CANCEL : { name : "button.cancel" },
	
	/* Foxtrick.Note.add
	 * add a FoxTrick note to current page and turn to it
	 * Foxtrick.Note.create
	 * returns a FoxTrick note for confirmation or other uses
	 *
	 * they share the same parameters:
	 * doc - the HTML document
	 * id - HTML id of the returned node
	 * msg - message to be shown
	 * buttons - buttons to be shown, along with event listeners, in following
	 *     format:
	 *     [
	 *         {
	 *             type: Foxtrick.Note.BUTTON_XXX,
	 *             listener: function() { ... },
	 *             // if listener is not specified, we will use onclick instead
	 *             onClick: "..."
	 *         },
	 *         ...
	 *     ]
	 * hasClose - whether to add a link labelled "Close" for closing the note
	 */

	add : function(doc, insertBefore, id, msg, buttons, hasClose, doJump) {
		Foxtrick.dump(insertBefore.className+'\n');
		// first we remove the old notes with same name
		var old = doc.getElementById(id);
		if (old) {
			old.parentNode.removeChild(old);
		}
		var note = this.create(doc, id, msg, buttons, hasClose);
		insertBefore.parentNode.insertBefore(note,insertBefore);
		// go to the note
		if (doJump) doc.location = doc.location.href.replace(/#.*?$/, "") + "#" + id;
		return note;
	},

	create : function(doc, id, msg, buttons, hasClose) {
		try {
			var container = doc.createElement("div");
			container.id = id;
			container.className = "ft-note";

			var par = doc.createElement("p");
			par.textContent = msg;
			container.appendChild(par);

			if (buttons && buttons.length) {
				var buttonContainer = doc.createElement("div");
				for (var i in buttons) {
					var button = doc.createElement("input");
					button.type = "button";
					button.value = Foxtrickl10n.getString(buttons[i].type.name);
					if (buttons[i].listener) {
						button.addEventListener("click", buttons[i].listener, false);
					}
					else if (buttons[i].onClick) {
						button.setAttribute("onclick", buttons[i].onClick);
					}
					else if (buttons[i].type == this.BUTTON_CANCEL) {
						button.setAttribute("container", id);
						// default event listener for BUTTON_CANCEL
						button.addEventListener("click", function(ev) {
								try {
									var doc = ev.target.ownerDocument;
									var containerId = ev.currentTarget.getAttribute("container");
									var container = doc.getElementById(containerId);
									if (container) {
										container.parentNode.removeChild(container);
									}
								}
								catch (e) {
									Foxtrick.dumpError(e);
								}
							}, false);
					}
					buttonContainer.appendChild(button);
				}
				container.appendChild(buttonContainer);
			}

			if (hasClose === true) {
				var close = doc.createElement("a");
				close.className = "close";
				close.textContent = Foxtrickl10n.getString("button.close");
				close.addEventListener("click", function(ev) {
						try {
							var container = ev.target.parentNode;
							if (container) {
								container.parentNode.removeChild(container);
							}
						}
						catch (e) {
							Foxtrick.dumpError(e);
						}
					}, false);
				container.appendChild(close);
				// we need to add clear since close is floated to the right
				var clear = doc.createElement("div");
				clear.className = "clear";
				container.appendChild(clear);
			}

			return container;
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},
};
