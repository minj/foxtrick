/*
 * html.js
 * Utilities for HTML and DOM
 */

if (!Foxtrick) var Foxtrick = {};

Foxtrick.hasClass = function(obj, cls) {
	return (obj
		&& obj.className !== undefined
		&& obj.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)")) !== null);
}

Foxtrick.addClass = function(obj, cls) {
	if (!Foxtrick.hasClass(obj, cls)) {
		obj.className += " " + cls;
	}
}

Foxtrick.removeClass = function(obj, cls) {
	if (Foxtrick.hasClass(obj, cls)) {
		var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)", "g");
		obj.className = obj.className.replace(reg, " ");
	}
}

Foxtrick.toggleClass = function(obj, cls) {
	if (Foxtrick.hasClass(obj, cls)) {
		Foxtrick.removeClass(obj, cls);
	}
	else {
		Foxtrick.addClass(obj, cls);
	}
}

Foxtrick.hasElement = function(doc, id) {
	if (doc.getElementById(id)) {
		return true;
	}
	return false;
}

Foxtrick.getChildIndex = function(element) {
	var count = 0;
	while (element.previousSibling) {
		++count;
		element = element.previousSibling;
	}
	return count;
}

/* Foxtrick.addBoxToSidebar
* Parameters:
* doc - the document the box needs to be added to
* title - the title of the new box
* content - the content of the new box (should be a DOM element)
* id - the id the new box should get (has to be unique!)
* insertBefore - the header of the reference-object: the new box will be placed *before* this reference-object;
* 	-- Should be a string with the header, e.g. "Actions"
* 	-- or a string "last" if it should be put at the very bottom of the sidebar
* 	-- or a string "first" if it should be put at the very top
*	-- if left empty, it'll be placed on top
* altInsertBefore - specify an alternative header if the referenceHeader cannot be found
* 	-- Can be left empty
* column - specify which column the box shall be added to
*
* Note: if the header is the same as one of the other boxes in the sidebar,
* the content will be added to that sidebarbox instead of creating a new one
*/
Foxtrick.addBoxToSidebar = function(doc, title, content, id, insertBefore, altInsertBefore, column) {
	try {
		if (!id || !content.id) {
			// No id, return
			Foxtrick.log("addBoxToSidebar: error: id should be specified and content should have an id.");
			return;
		}

		if (Foxtrick.hasElement(doc, id) || Foxtrick.hasElement(doc, content.id)) {
			// Box with same id already existed, return
			return;
		}

		var sidebar = null;
		var boxClass;
		if (!column || column == "right") {
			sidebar = doc.getElementById("sidebar");
			boxClass = "sidebarBox";
		}
		else {
			sidebar = doc.getElementsByClassName("subMenu")[0]
				|| doc.getElementsByClassName("subMenuConf")[0];
			boxClass = "subMenuBox";
		}
		if (!sidebar) {
			// No sidebar, nothing can be added.
			// An option to create sidebar could be implemented sometime.
			return;
		}

		var divs = sidebar.getElementsByTagName("div");

		// Check if any of the other sidebarboxes have the same header
		// and find the (alternative/normal) reference-object in the process
		var existingBox = null;
		var insertBeforeObject = null;
		var altInsertBeforeObject = null;
		var currentBox, i = 0;
		while (currentBox = divs[i++]) {
			// Check if this child is of box_class
			if (currentBox.className === boxClass) {
				var header = currentBox.getElementsByTagName("h2")[0];
				if (header.innerHTML === title) {
					existingBox = currentBox;
				}
				if (header.innerHTML === insertBefore) {
					insertBeforeObject = currentBox;
				}
				if (header.innerHTML === altInsertBefore) {
					altInsertBeforeObject = currentBox;
				}
			}
			currentBox = currentBox.nextSibling;
		}

		if (!insertBeforeObject && insertBefore != "first"
			&& insertBefore != "last") {
			// the reference header could not be found; try the alternative
			if (!altInsertBeforeObject && altInsertBefore != "first"
				&& altInsertBefore != "last") {
				// alternative header couldn't be found either
				// place the box on top
				Foxtrick.dump("addBoxToSidebar: Could not find insertBefore " +
				insertBefore + "\n" + "nor altInsertBefore " +
				altInsertBefore + "\n");
				insertBefore = "first";
			}
			else {
				insertBeforeObject = altInsertBeforeObject;
				insertBefore = altInsertBefore;
			}
		}
		if (insertBefore == "first") {
			insertBeforeObject = sidebar.firstChild;
		}

		if (Foxtrick.isStandardLayout(doc)) {
			// Standard layout
			if (existingBox) {
				existingBox.id = id;
				var boxBody = existingBox.getElementsByClassName("boxBody")[0];
				boxBody.insertBefore(content, boxBody.firstChild);
				return existingBox;
			}
			else {
				// sidebarBox
				var sidebarBox = doc.createElement("div");
				sidebarBox.id = id;
				sidebarBox.className = boxClass;
				// boxHead
				var boxHead = doc.createElement("div");
				boxHead.className = "boxHead";
				sidebarBox.appendChild(boxHead);
				// boxHead - boxLeft
				var headBoxLeft = doc.createElement("div");
				headBoxLeft.className = "boxLeft";
				boxHead.appendChild(headBoxLeft);
				// boxHead - boxLeft - h2
				var h2 = doc.createElement("h2");
				h2.innerHTML = title;
				headBoxLeft.appendChild(h2);
				// boxBody
				var boxBody = doc.createElement("div");
				boxBody.className = "boxBody";
				sidebarBox.appendChild(boxBody);
				// append content to boxBody
				boxBody.appendChild(content);
				// boxFooter
				var boxFooter = doc.createElement("div");
				boxFooter.className = "boxFooter";
				sidebarBox.appendChild(boxFooter);
				// boxFooter - boxLeft
				var footBoxLeft = doc.createElement("div");
				footBoxLeft.className = "boxLeft";
				footBoxLeft.innerHTML = "&nbsp;";
				boxFooter.appendChild(footBoxLeft);

				// insert the sidebar box
				sidebar.insertBefore(sidebarBox, insertBeforeObject);
			}
		}
		else {
			// Simple layout
			if (existingBox) {
				var existingBoxHeader = existingBox.getElementsByTagName("h2")[0];
				existingBox.id = id;
				existingBox.insertBefore(content, existingBoxHeader.nextSibling);
			}
			else {
				// sidebar box
				var sidebarBox = doc.createElement("div");
				sidebarBox.id = id;
				sidebarBox.className = boxClass;
				// header
				var header = doc.createElement("h2");
				header.innerHTML = title;
				sidebarBox.appendChild(header);
				// append content to body
				sidebarBox.appendChild(content);

				// insert the sidebar box
				sidebar.insertBefore(sidebarBox, insertBeforeObject);
			}
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
}

Foxtrick.setActiveTextBox = function (field, cssClass, text) {
	var fieldObj = document.getElementById(field);
	fieldObj.className = cssClass;
	if (fieldObj.value == text) {
		fieldObj.value = "";
		return true;
	}
}

Foxtrick.setInactiveTextBox = function (field, cssClass, text) {
	var fieldObj = document.getElementById(field);
	if (fieldObj.value.length === 0) {
		fieldObj.className = cssClass;
		fieldObj.value = text;
	}
	return true;
}


Foxtrick.GetElementPosition = function (This,ref){
	var el = This;var pT = 0; var pL = 0;
	while(el && el!=ref){pT+=el.offsetTop; pL+=el.offsetLeft; el=el.offsetParent;}
	return {'top':pT,'left':pL};
}

Foxtrick.GetDataURIText = function (filetext) {
	return "data:text/plain;charset=utf-8,"+encodeURIComponent(filetext);
}
