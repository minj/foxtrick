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
	/* Foxtrick.Note.create
	 * returns a FoxTrick note for confirmation or other uses
	 * parameters:
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
	 */
	create : function(doc, id, msg, buttons) {
		try {
			var container = doc.createElement("div");
			container.id = id;
			container.className = "ft-note";

			var par = doc.createElement("p");
			par.appendChild(doc.createTextNode(msg));

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
								Foxtrick.dump(e);
							}
						}, false);
				}
				buttonContainer.appendChild(button);
			}

			container.appendChild(par);
			container.appendChild(buttonContainer);
			return container;
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
};
