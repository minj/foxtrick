'use strict';
/*
 * dom.js
 * Utilities for HTML and DOM
 */

if (!Foxtrick)
	var Foxtrick = {};

/**
 * Create an element with Foxtrick feature highlight enabled.
 * This and other similar functions must be used on the outer container
 * of DOM created and/or modified by Foxtrick.
 * Returns the element.
 * @param  {document} doc
 * @param  {Object}   module
 * @param  {String}   type
 * @return {HTMLElement}
 */
Foxtrick.createFeaturedElement = function(doc, module, type) {
	if (module && module.MODULE_NAME && module.MODULE_CATEGORY) {
		var node = doc.createElement(type);
		node.className = 'ft-dummy';
		if (Foxtrick.Prefs.getBool('featureHighlight')) {
			var cat = Foxtrick.L10n.getString('tab.' + module.MODULE_CATEGORY);
			node.title = module.MODULE_NAME + ' (' + cat + '): ' +
				Foxtrick.Prefs.getModuleDescription(module.MODULE_NAME);
		}
		return node;
	}
	else {
		Foxtrick.log('Incorrect usage of Foxtrick.createFeaturedElement. typeof(module) = ',
		             typeof(module));
		return null;
	}
};

/**
 * Insert a new row in a table with Foxtrick feature highlight.
 * Returns the row.
 * @param  {HTMLTableElement}    table
 * @param  {Object}              module
 * @param  {Integer}             index
 * @return {HTMLTableRowElement}
 */
Foxtrick.insertFeaturedRow = function(table, module, index) {
	var row = table.insertRow(index);
	row.className = 'ft-dummy';
	if (Foxtrick.Prefs.getBool('featureHighlight')) {
		var cat = Foxtrick.L10n.getString('tab.' + module.MODULE_CATEGORY);
		row.title = module.MODULE_NAME + ' (' + cat + '): ' +
			Foxtrick.Prefs.getModuleDescription(module.MODULE_NAME);
	}
	return row;
};

/**
 * Insert a new cell in a row with Foxtrick feature highlight.
 * Returns the cell.
 * @param  {HTMLTableRowElement}  row
 * @param  {Object}               module
 * @param  {Integer}              index
 * @return {HTMLTableCellElement}
 */
Foxtrick.insertFeaturedCell = function(row, module, index) {
	var cell = row.insertCell(index);
	cell.className = 'ft-dummy';
	if (Foxtrick.Prefs.getBool('featureHighlight')) {
		var cat = Foxtrick.L10n.getString('tab.' + module.MODULE_CATEGORY);
		cell.title = module.MODULE_NAME + ' (' + cat + '): ' +
			Foxtrick.Prefs.getModuleDescription(module.MODULE_NAME);
	}
	return cell;
};

/**
 * Enable Foxtrick feature highlight on an existing element
 * @param  {HTMLElement} node
 * @param  {Object} module
 * @return {HTMLElement}
 */
Foxtrick.makeFeaturedElement = function(node, module) {
	Foxtrick.addClass(node, 'ft-dummy');
	if (Foxtrick.Prefs.getBool('featureHighlight')) {
		var cat = Foxtrick.L10n.getString('tab.' + module.MODULE_CATEGORY);
		node.title = module.MODULE_NAME + ' (' + cat + '): ' +
			Foxtrick.Prefs.getModuleDescription(module.MODULE_NAME) +
			(node.title ? ' / ' + node.title : '');
	}
	return node;
};

/**
 * Test whether an attribute of an element has the given value
 * or contains it in a space-delimited list
 * @param  {HTMLElement}  el
 * @param  {String}       attribute
 * @param  {String}       value
 * @return {Boolean}
 */
Foxtrick.hasAttributeValue = function(el, attribute, value) {
	var reg = new RegExp('(\\s|^)' + value + '(\\s|$)');
	return el && typeof el.getAttribute === 'function' && el.getAttribute(attribute) &&
		reg.test(el.getAttribute(attribute));
};

/**
 * Add a value to the space-delimited list of element's attribute
 * @param {HTMLElement} el
 * @param {String}      attribute
 * @param {String}      value
 */
Foxtrick.addAttributeValue = function(el, attribute, value) {
	if (!Foxtrick.hasAttributeValue(el, attribute, value)) {
		var _attrib = el.getAttribute(attribute);
		if (_attrib !== null)
			el.setAttribute(attribute, _attrib + ' ' + value);
		else
			el.setAttribute(attribute, value);
	}
};

/**
 * Remove a value from the space-delimited list of element's attribute
 * @param {HTMLElement} el
 * @param {String}      attribute
 * @param {String}      value
 */
Foxtrick.removeAttributeValue = function(el, attribute, value) {
	var _attrib = el.getAttribute(attribute);
	if (_attrib !== null) {
		var reg = new RegExp('(\\s|^)' + value + '(\\s|$)', 'g');
		el.setAttribute(attribute, _attrib.replace(reg, ' ').trim());
	}
};

/**
 * Test whether an element has a class
 * @param  {HTMLElement} el
 * @param  {String}      cls
 * @return {Boolean}
 */
Foxtrick.hasClass = function(el, cls) {
	if (!el || !el.classList)
		return false;

	return el.classList.contains(cls);
};

/**
 * Add a class or a space-delimited list of classes to an alement
 * @param {HTMLElement} el
 * @param {String}      cls
 */
Foxtrick.addClass = function(el, cls) {
	if (!el || !el.classList)
		return;

	var classes = cls.trim().split(' ');
	for (var c in classes)
		el.classList.add(classes[c]);
};

/**
 * Remove a class from an element
 * @param {HTMLElement} el
 * @param {String}      cls
 */
Foxtrick.removeClass = function(el, cls) {
	if (el && el.classList)
		el.classList.remove(cls);
};

/**
 * Toggle a class of an element
 * @param {HTMLElement} el
 * @param {String}      cls
 */
Foxtrick.toggleClass = function(el, cls) {
	if (el && el.classList)
		el.classList.toggle(cls);
};

/**
 * Test whether document contains an element with a given ID
 * @param  {document} doc
 * @param  {String}   id
 * @return {Boolean}
 */
Foxtrick.hasElement = function(doc, id) {
	if (doc.getElementById(id)) {
		return true;
	}
	return false;
};

/**
 * Test whether an element is within another element
 * @param  {HTMLElement} descendant
 * @param  {HTMLElement} ancestor
 * @return {Boolean}
 */
Foxtrick.isDescendantOf = function(descendant, ancestor) {
	while (descendant.parentNode) {
		if (descendant.parentNode === ancestor)
			return true;
		descendant = descendant.parentNode;
	}
	return false;
};

/**
 * Get the given element's index among its siblings
 * @param  {HTMLElement} element
 * @return {Integer}
 */
Foxtrick.getChildIndex = function(element) {
	var count = 0;
	while (element.previousSibling) {
		++count;
		element = element.previousSibling;
	}
	return count;
};

/**
 * Adds a click event listener to an element.
 * Sets tabindex=0 and role=button if these attributes have no value.
 * The callback is executed with global change listeners stopped.
 * @param {HTMLElement} el
 * @param {function}    listener
 */
Foxtrick.onClick = function(el, listener) {
	Foxtrick.listen(el, 'click', listener, false);
	if (!el.hasAttribute('tabindex'))
		el.setAttribute('tabindex', '0');
	if (!el.hasAttribute('role'))
		el.setAttribute('role', 'button');
};

/**
 * Add an event listener to an element.
 * The callback is executed with global change listeners stopped.
 * @param {HTMLElement} el
 * @param {String}      type       event type
 * @param {function}    listener
 * @param {Boolean}     useCapture
 */
Foxtrick.listen = function(el, type, listener, useCapture) {
	el.addEventListener(type, function(ev) {
		var doc = ev.target.ownerDocument;
		Foxtrick.stopListenToChange(doc);
		listener.bind(this)(ev);
		Foxtrick.log.flush(doc);
		Foxtrick.startListenToChange(doc);
	}, useCapture);
};

/**
 * Add a mutation observer to a node.
 * Should not be used directly.
 * Calls callback(mutations) on childList changes in the whole tree.
 * Default behavior can be overridden by specifying observer options.
 * Stops observing in case callback returns true.
 * Returns the observer.
 * @param  {Node}                                      node     observer target
 * @param  {function(Array.<MutationRecord>): boolean} callback
 * @param  {MutationObserverInit}                      options  observer options
 * @return {MutationObserver}
 */
Foxtrick.observe = function(node, callback, options) {
	var doc = node.ownerDocument;
	var win = doc.defaultView;
	var MO = win.MutationObserver || win.WebKitMutationObserver;
	var opts = { childList: true, subtree: true };
	for (var opt in options) {
		opts[opt] = options[opt];
	}
	var observe = function() {
		observer.takeRecords();
		observer.observe(node, opts);
	};
	var observer = new MO(function(mutations) {
		observer.disconnect();
		if (!callback(mutations))
			observe();
	});
	observer.reconnect = observe;
	observe();
	return observer;
};

/**
 * Execute callback(doc, node, observer) when node changes.
 * Stops observing if callback returns true.
 * Returns the observer.
 * @param  {Node}                                  node
 * @param  {function(HTMLDocument, Node): boolean} callback
 * @param  {MutationObserverInit}                  obsOpts  observer options
 * @return {MutationObserver}
 */
Foxtrick.onChange = function(node, callback, obsOpts) {
	return Foxtrick.observe(node, function() {
		var doc = node.ownerDocument;
		try {
			return callback(doc, node);
		}
		catch (e) {
			Foxtrick.log('Error in callback for onChange', e);
			return true;
		}
	}, obsOpts);
};

/**
 * Get nodes whose children change.
 * Stops observing if callback returns true.
 * Returns the observer.
 * @param  {Node}                            node     container
 * @param  {function(Array.<Node>): boolean} callback
 * @param  {MutationObserverInit}            obsOpts  observer options
 * @return {MutationObserver}
 */
Foxtrick.getChanges = function(node, callback, obsOpts) {
	return Foxtrick.observe(node, function(records) {
		var affectedNodes = [];
		records.forEach(function(record) {
			affectedNodes.push(record.target);
		});
		var uniques = Foxtrick.unique(affectedNodes);
		try {
			return callback(uniques);
		}
		catch (e) {
			Foxtrick.log('Error in callback for getChanges', e);
			return true;
		}
	}, obsOpts);
};

/**
 * Add a box to the sidebar, either on the right or on the left.
 * Returns the added box.
 * @author Ryan Li
 * @param  {document}    doc
 * @param  {String}      title     the title of the box, will create one if inexists
 * @param  {HTMLElement} content   HTML node of the content
 * @param  {Integer}     prec      precedence of the box, the smaller, the higher
 * @param  {Boolean}     forceLeft force the box to be displayed on the left
 * @return {HTMLElement}           box to be added to
 */
Foxtrick.addBoxToSidebar = function(doc, title, content, prec, forceLeft) {
	// class of the box to add
	var boxClass = 'sidebarBox';
	var sidebar = doc.getElementById('sidebar');
	if (!sidebar || forceLeft) {
		if ((sidebar = doc.getElementsByClassName('subMenu')[0]))
			boxClass = 'subMenuBox';
		else if ((sidebar = doc.getElementsByClassName('subMenuConf')[0]))
			boxClass = 'subMenuBox';
	}

	if (!sidebar)
		return;

	// destination box
	var dest;

	// existing sidebar boxes
	var existings = sidebar.getElementsByClassName(boxClass);
	for (var i = 0; i < existings.length; ++i) {
		var box = existings[i];
		var hdr = box.getElementsByTagName('h2')[0].textContent;
		if (hdr == title)
			dest = box; // found destination box
	}
	// create new box if old one doesn't exist
	if (!dest) {
		dest = doc.createElement('div');
		dest.className = boxClass;
		dest.setAttribute('x-precedence', prec);
		// boxHead
		var boxHead = doc.createElement('div');
		boxHead.className = 'boxHead';
		dest.appendChild(boxHead);
		// boxHead - boxLeft
		var headBoxLeft = doc.createElement('div');
		headBoxLeft.className = 'boxLeft';
		boxHead.appendChild(headBoxLeft);
		// boxHead - boxLeft - h2
		var h2 = doc.createElement('h2');
		h2.textContent = title;
		headBoxLeft.appendChild(h2);
		// boxBody
		var boxBody = doc.createElement('div');
		boxBody.className = 'boxBody';
		dest.appendChild(boxBody);
		// append content to boxBody
		boxBody.appendChild(content);
		// boxFooter
		var boxFooter = doc.createElement('div');
		boxFooter.className = 'boxFooter';
		dest.appendChild(boxFooter);
		// boxFooter - boxLeft
		var footBoxLeft = doc.createElement('div');
		footBoxLeft.className = 'boxLeft';
		boxFooter.appendChild(footBoxLeft);
		// now we insert the newly created box
		var inserted = false;
		for (var i = 0; i < existings.length; ++i) {
			// precedence of current box, hattrick boxes are set to 0
			var curPrec = parseInt(existings[i].hasAttribute('x-precedence'), 10) || 0;
			if (curPrec > prec) {
				if (i === 0 && curPrec === 0)
					// first to be added and placed before HT boxes. add it on top
					// before possible updatepanel div (eg teampage challenge and mailto)
					sidebar.insertBefore(dest, sidebar.firstChild);
				else
					existings[i].parentNode.insertBefore(dest, existings[i]);
				inserted = true;
				break;
			}
		}
		if (!inserted)
			sidebar.appendChild(dest);
	}

	// finally we add the content
	dest.getElementsByClassName('boxBody')[0].appendChild(content);

	return dest;
};

/**
 * Activate a text box with a place-holder value.
 * Returns whether it contains custom value
 * @param  {HTMLElement} el
 * @param  {String}      cssClass class name for the active state
 * @param  {String}      text     place-holder text
 * @return {Boolean}              whether current value is custom
 */
Foxtrick.setActiveTextBox = function(el, cssClass, text) {
	el.className = cssClass;
	if (el.value === text) {
		el.value = '';
		return false;
	}
	return true;
};

/**
 * Deactivate a text box with a place-holder value.
 * Returns whether it contains custom value
 * @param  {HTMLElement} el
 * @param  {String}      cssClass class name for the inactive state
 * @param  {String}      text     place-holder text
 * @return {Boolean}              whether current value is custom
 */
Foxtrick.setInactiveTextBox = function(el, cssClass, text) {
	el.className = cssClass;
	if (el.value === '') {
		el.value = text;
		return false;
	}
	return true;
};

/**
 * Get element position relative to reference.
 * Returns the position as an object {top, left}.
 * @param  {HTMLElement}                 el
 * @param  {HTMLElement}                 ref
 * @return {{top: Number, left: Number}}     position
 */
Foxtrick.getElementPosition = function(el, ref) {
	var pT = 0, pL = 0;
	while (el && el !== ref) {
		pT += el.offsetTop;
		pL += el.offsetLeft;
		el = el.offsetParent;
	}
	return { top: pT, left: pL };
};

/**
 * Convert a string into data URI text file
 * @param  {String} str
 * @return {String}
 */
Foxtrick.getDataURIText = function(str) {
	return 'data:text/plain;charset=utf-8,' + encodeURIComponent(str);
};

/**
 * Add an image in an asynchronous way.
 * Used to be the only way to add images from FT package
 * in some extension architectures.
 * Continued to be used with forward compatibility in mind.
 * Callback receives the created image.
 * @param {document}                   doc
 * @param {HTMLElement}                parent
 * @param {Object}                     features     a map of image attributes
 * @param {HTMLElement}                insertBefore next sibling
 * @param {function(HTMLImageElement)} callback
 */
Foxtrick.addImage = function(doc, parent, features, insertBefore, callback) {
	var img = doc.createElement('img');
	for (var i in features)
		img.setAttribute(i, features[i]);
	if (insertBefore)
		parent.insertBefore(img, insertBefore);
	else
		parent.appendChild(img);

	if (callback)
		callback(img);
};

/**
 * Describe selected text in a text area.
 * Returns null if no selection or
 * {completeText, selectionStart, selectionEnd, selectionLength,
 * textBeforeSelection, selectedText, textAfterSelection}
 * @param  {HTMLElement} ta text area
 * @return {Object}
 */
Foxtrick.getSelection = function(ta) {
	if (ta) {
		ta.focus();

		var textAreaContents = {
			completeText: '',
			selectionStart: 0,
			selectionEnd: 0,
			selectionLength: 0,
			textBeforeSelection: '',
			selectedText: '',
			textAfterSelection: ''
		};

		if (ta.selectionStart || ta.selectionStart === 0) {
			textAreaContents.completeText = ta.value;
			textAreaContents.selectionStart = ta.selectionStart;

			if ((ta.selectionEnd - ta.selectionStart) !== 0) {
				while (ta.value.charAt(ta.selectionEnd - 1) === ' ') {
					ta.selectionEnd--;
				}
			}

			textAreaContents.selectionEnd = ta.selectionEnd;
			textAreaContents.selectionLength = ta.selectionEnd - ta.selectionStart;
			textAreaContents.textBeforeSelection = ta.value.substring(0, ta.selectionStart);

			var st = ta.value.substring(ta.selectionStart, ta.selectionEnd);

			textAreaContents.selectedText = st;
			textAreaContents.textAfterSelection =
				ta.value.substring(ta.selectionEnd, ta.value.length);
			return textAreaContents;
		}
		return null;
	}
};
