'use strict';
/*
 * dom.js
 * Utilities for HTML and DOM
 */

if (!Foxtrick)
	var Foxtrick = {};

/**
 * Node type map.
 *
 * Allegedly not available in some browsers
 * @type {Object}
 */
Foxtrick.NodeTypes = {
	ELEMENT_NODE: 1,
	ATTRIBUTE_NODE: 2,
	TEXT_NODE: 3,
	CDATA_SECTION_NODE: 4,
	ENTITY_REFERENCE_NODE: 5,
	ENTITY_NODE: 6,
	PROCESSING_INSTRUCTION_NODE: 7,
	COMMENT_NODE: 8,
	DOCUMENT_NODE: 9,
	DOCUMENT_TYPE_NODE: 10,
	DOCUMENT_FRAGMENT_NODE: 11,
	NOTATION_NODE: 12,
};

/**
 * Create an element in SVG namespace. Root element is typically 'svg'.
 * @param  {document} doc
 * @param  {string}   type
 * @return {element}
 */
Foxtrick.createSVG = function(doc, type) {
	return doc.createElementNS('http://www.w3.org/2000/svg', type);
};

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
 * Set element attributes/properties based on attribute map.
 *
 * Also supports style/dataset and on* listeners.
 *
 * @param {element} el
 * @param {object}  attributes
 */
Foxtrick.setAttributes = function(el, attributes) {
	var ELEMENT_PROPERTIES = [
		'textContent',
		'className',
	];

	for (var attr in attributes) {
		if ((attr == 'dataset' || attr == 'style') && typeof attributes[attr] == 'object') {
			for (var item of attributes[attr]) {
				el[attr][item] = attributes[attr][item];
			}
		}
		else if (attr.slice(0, 2) == 'on' && typeof attributes[attr] == 'function') {
			var cb = attributes[attr];
			var type = attr.slice(2).toLowerCase();

			if (type == 'click')
				Foxtrick.onClick(el, cb);
			else if (type == 'change')
				Foxtrick.onChange(el, cb);
			else
				Foxtrick.listen(el, type, cb);
		}
		else if (Foxtrick.has(ELEMENT_PROPERTIES, attr))
			el[attr] = attributes[attr];
		else
			el.setAttribute(attr, attributes[attr]);
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
 * Insert newNode after sibling
 * @param {element} newNode
 * @param {element} sibling
 */
Foxtrick.insertAfter = function(newNode, sibling) {
	if (sibling.nextSibling) {
		sibling.parentNode.insertBefore(newNode, sibling.nextSibling);
	}
	else {
		sibling.parentNode.appendChild(newNode);
	}
};

/**
 * Append an array of elements to a container
 * @param {element} parent
 * @param {array}   children Array.<element>
 */
Foxtrick.appendChildren = function(parent, children) {
	Foxtrick.forEach(function(child) {
		parent.appendChild(child);
	}, children);
};

/**
 * Append child(ren) to parent.
 *
 * child may be a Node, String or an array of such.
 *
 * @param {element} parent
 * @param {object}  child
 */
Foxtrick.append = function(parent, child) {
	var doc = parent.ownerDocument;
	var win = doc.defaultView;

	if (Foxtrick.isArrayLike(child)) {
		Foxtrick.forEach(function(c) {
			Foxtrick.append(parent, c);
		}, child);
	}
	else if (win.Node.prototype.isPrototypeOf(child))
		parent.appendChild(child);
	else if (child != null) // skip null/undefined
		parent.appendChild(doc.createTextNode(child.toString()));
};

/**
 * Adds a click event listener to an element.
 * Sets tabindex=0 and role=button if these attributes have no value.
 * The callback is executed with global change listeners stopped.
 *
 * @param {HTMLElement} el
 * @param {function}    listener
 * @param {Boolean}     useCapture
 */
Foxtrick.onClick = function(el, listener, useCapture) {
	Foxtrick.listen(el, 'click', listener, useCapture);
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
		var doc = ev.target.ownerDocument || ev.target;
		Foxtrick.stopListenToChange(doc);

		var ret = listener.bind(this)(ev);

		Foxtrick.log.flush(doc);
		Foxtrick.startListenToChange(doc);

		if (ret === false) {
			// simply returning false does not seem to work in capture phase
			ev.stopPropagation();
			ev.preventDefault();
		}

		return ret;
	}, useCapture);
};

/**
 * Activate an element by adding a copy listener.
 *
 * copy maybe a string or a function that returns {mime, content}
 * mime may specify additional mime type
 * 'text/plain' is always used
 *
 * @param {element} el
 * @param {string}  copy {string|function}
 * @param {string}  mime {string?}
 */
Foxtrick.addCopying = function(el, copy, mime) {
	Foxtrick.onClick(el, function() {
		var doc = this.ownerDocument;

		Foxtrick.copy(doc, copy, mime);
	});
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
 * TODO: promisify
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

	Foxtrick.setAttributes(img, features);

	if (insertBefore)
		parent.insertBefore(img, insertBefore);
	else
		parent.appendChild(img);

	if (callback)
		callback(img);
};

/**
 * Add a specialty icon from a specialty number.
 *
 * options is a map of DOM attributes: {string: string}.
 * NOTE: insertBefore and onError has special meaning.
 *
 * Returns Promise.<HTMLImageElement>
 *
 * @param  {element} parent
 * @param  {number}  specNum {Integer}
 * @param  {object}  options {string: string}
 * @return {Promise}         Promise.<HTMLImageElement>
 */
Foxtrick.addSpecialty = function(parent, specNum, options) {
	var doc = parent.ownerDocument;

	var specialtyName = Foxtrick.L10n.getSpecialityFromNumber(specNum);
	var specialtyUrl = Foxtrick.getSpecialtyImagePathFromNumber(specNum);

	var insertBefore = null;
	if (Foxtrick.hasProp(options, 'insertBefore')) {
		insertBefore = options.insertBefore;
		delete options.insertBefore;
	}

	var imgContainer = doc.createElement('span');
	if (insertBefore)
		parent.insertBefore(imgContainer, insertBefore);
	else
		parent.appendChild(imgContainer);

	if (Foxtrick.Prefs.isModuleEnabled('SpecialtyInfo')) {
		Foxtrick.addClass(imgContainer, 'ft-specInfo-parent');
		imgContainer.dataset.specialty = specNum;

		specialtyName += '\n' + Foxtrick.L10n.getString('SpecialtyInfo.open');
	}

	var opts = {
		alt: specialtyName,
		title: specialtyName,
		src: specialtyUrl,
	};
	Foxtrick.mergeAll(opts, options);

	return new Promise(function(resolve) {
		Foxtrick.addImage(doc, imgContainer, opts, null, resolve);
	});
};

/**
 * Make table rows from a row definition array.
 *
 * Row definitions may be <TR>s or arrays of cell definitions.
 * Cell definitions may be either cell attribute maps,
 * or Nodes, Strings and arrays of such.
 *
 * An optional section param is a <TABLE>, <THEAD>, <TBODY> or <TFOOT>
 * to add rows to. A new table is created by default.
 *
 * Returns the created table or section.
 *
 * @param  {document}                doc
 * @param  {array}                   rows
 * @param  {HTMLTableSectionElement} section
 * @return {HTMLTableSectionElement}
 */
Foxtrick.makeRows = function(doc, rows, section) {
	var win = doc.defaultView;

	if (!section)
		section = doc.createElement('table');

	for (var rowItem of Foxtrick.toArray(rows)) {
		if (win.HTMLTableRowElement.prototype.isPrototypeOf(rowItem)) {
			section.appendChild(rowItem);
			continue;
		}

		var row = section.insertRow(-1);

		for (var cellItem of Foxtrick.toArray(rowItem)) {
			if (cellItem == null)
				continue;

			if (win.HTMLTableCellElement.prototype.isPrototypeOf(cellItem)) {
				row.appendChild(cellItem);
				continue;
			}

			var cell = row.insertCell(-1);

			if (Foxtrick.isMap(cellItem))
				Foxtrick.setAttributes(cell, cellItem);
			else
				Foxtrick.append(cell, cellItem);
		}
	}

	return section;
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

/**
 * Get the mainBody HT ID prefix.
 * @return {string}
 */
Foxtrick.getMainIDPrefix = function() {
	return 'ctl00_ctl00_CPContent_CPMain_';
};

/**
 * Get main body HT element by the relevant part of its ID.
 * I. e. ctl00_ctl00_CPContent_CPMain_$ID.
 * @param  {document}    doc
 * @param  {string}      ID
 * @return {HTMLElement}
 */
Foxtrick.getMBElement = function(doc, ID) {
	var PRE = this.getMainIDPrefix();
	var el = doc.getElementById(PRE + ID);
	return el;
};

/**
 * Get HT Button by the relevant part of its ID.
 * Supports ctl00_ctl00_CPContent_CPMain_btn$ID and
 * ctl00_ctl00_CPContent_CPMain_but$ID.
 * @param  {document}    doc
 * @param  {string}      ID
 * @return {HTMLElement}
 */
Foxtrick.getButton = function(doc, ID) {
	var PRE = this.getMainIDPrefix();
	var btn = doc.getElementById(PRE + 'btn' + ID);
	if (!btn)
		btn = doc.getElementById(PRE + 'but' + ID);
	return btn;
};

/**
 * Get all text nodes in the node tree
 * @param  {element} parent
 * @return {array}          Array.<element>
 */
Foxtrick.getTextNodes = function(parent) {
	var ret = [];
	var doc = parent.ownerDocument;
	var win = doc.defaultView;
	var walker = doc.createTreeWalker(parent, win.NodeFilter.SHOW_TEXT, null, false);
	var node;
	while ((node = walker.nextNode())) {
		ret.push(node);
	}
	return ret;
};

/**
 * Get all text and element nodes in the node tree
 * @param  {element} parent
 * @return {array}          Array.<element>
 */
Foxtrick.getNodes = function(parent) {
	var ret = [];
	var doc = parent.ownerDocument;
	var win = doc.defaultView;
	/* jshint -W016 */
	var bitMask = win.NodeFilter.SHOW_TEXT | win.NodeFilter.SHOW_ELEMENT;
	/* jshint +W016 */
	var walker = doc.createTreeWalker(parent, bitMask, null, false);
	var node;
	while ((node = walker.nextNode())) {
		ret.push(node);
	}
	return ret;
};

/**
 * Render pre elements in a container
 * @param  {element} parent
 */
Foxtrick.renderPre = function(parent) {
	var doc = parent.ownerDocument;
	var testRE = /\[\/?pre\]/i;
	if (testRE.test(parent.textContent)) {
		// valid pre found
		var allNodes = Foxtrick.getNodes(parent);
		var pre = null, target = null, nodes = [];
		Foxtrick.forEach(function(node) {
			if (node.hasChildNodes()) {
				// skip containers
				return;
			}
			var text = node.textContent;
			if (testRE.test(text)) {
				// create a new RE object for each node
				var preRE = /\[\/?pre\]/ig;
				var mArray, prevIndex = 0;
				while ((mArray = preRE.exec(text))) {
					var tag = mArray[0];
					var start = preRE.lastIndex - tag.length;
					if (start > prevIndex) {
						// add any previous text as a text node
						var previousText = text.slice(prevIndex, start);
						var prevTextNode = doc.createTextNode(previousText);
						if (pre) {
							pre.appendChild(prevTextNode);
						}
						else {
							nodes.push(prevTextNode);
						}
					}
					if (tag === '[pre]' && !pre) {
						pre = doc.createElement('pre');
						pre.className = 'ft-dummy';
						nodes.push(pre);
						// target is a pointer for DOM insertion
						target = node;
					}
					else if (tag === '[/pre]' && pre) {
						var frag = doc.createDocumentFragment();
						Foxtrick.appendChildren(frag, nodes);
						target.parentNode.replaceChild(frag, target);

						if (node !== target) {
							// node is still in DOM, remove it
							node.parentNode.removeChild(node);
						}

						// set target as pre to be used outside loop
						target = pre;
						pre = null;
						nodes = [];
					}
					else {
						Foxtrick.log('renderPre: unsupported state');
						return;
					}
					prevIndex = preRE.lastIndex;
				}
				if (prevIndex < text.length) {
					// add any ending text
					var endText = text.slice(prevIndex);
					var endTextNode = doc.createTextNode(endText);
					if (pre) {
						// pre still not inserted
						pre.appendChild(endTextNode);
					}
					else {
						// target points to inserted pre instead
						Foxtrick.insertAfter(endTextNode, target);
					}
				}
			}
			else if (pre) {
				// add any nodes in between pre tags as is
				pre.appendChild(node);
			}
		}, allNodes);
	}
	// replace \u2060 everywhere
	var tNodes = Foxtrick.getTextNodes(parent);
	Foxtrick.forEach(function(node) {
		node.textContent = node.textContent.replace(/\u2060/g, '');
	}, tNodes);
};

/**
 * Make and display a modal dialog.
 * Handles foxtrick:// links automatically
 * content can either be a string or an element/fragment
 * buttons is {Array.<{title:string, handler:function}>} (optional)
 * @param {document} doc
 * @param {string}   title
 * @param {element}  content {element|string}
 * @param {array}    buttons {?Array.<{title:string, handler:function}>}
 */
Foxtrick.makeModal = function(doc, title, content, buttons) {
	var DEFAULT_HANDLER = function(ev) {
		var doc = ev.target.ownerDocument;
		var dialog = doc.getElementById('foxtrick-modal-dialog');
		doc.body.removeChild(dialog);
		var scr = doc.getElementById('foxtrick-modal-screen');
		doc.body.removeChild(scr);
	};
	var DEFAULT_BUTTON = { title: Foxtrick.L10n.getString('button.close') };

	var createButton = function(button) {
		var btn = doc.createElement('button');
		btn.type = 'button';
		Foxtrick.addClass(btn, 'ft-dialog-button ft-rborder');

		var text = doc.createElement('span');
		Foxtrick.addClass(text, 'ft-dialog-button-text');
		text.textContent = button.title;
		btn.appendChild(text);

		if (typeof button.handler !== 'function') {
			button.handler = DEFAULT_HANDLER;
		}
		Foxtrick.onClick(btn, button.handler);

		return btn;
	};

	var dialog = doc.createElement('div');
	dialog.id = 'foxtrick-modal-dialog';

	// handle foxtrick:// links
	// TODO refactor into an util
	var listener = Foxtrick.modules['ForumStripHattrickLinks'].changeLinks;
	Foxtrick.listen(dialog, 'mousedown', listener);

	var hdrWrapper = doc.createElement('div');
	Foxtrick.addClass(hdrWrapper, 'ft-dialog-hdrWrapper');
	dialog.appendChild(hdrWrapper);

	var header = doc.createElement('div');
	Foxtrick.addClass(header, 'ft-dialog-header ft-clearfix ft-rborder');
	hdrWrapper.appendChild(header);

	var titleHeader = doc.createElement('h1');
	Foxtrick.addClass(titleHeader, 'ft-dialog-title float_left');
	titleHeader.textContent = 'Foxtrick » ' + title;
	titleHeader.title = title;
	header.appendChild(titleHeader);

	var contentDiv = doc.createElement('div');
	Foxtrick.addClass(contentDiv, 'ft-dialog-content');
	dialog.appendChild(contentDiv);

	if (typeof content !== 'object' || content === null) {
		var p = doc.createElement('p');
		p.textContent = content;
		content = p;
	}
	contentDiv.appendChild(content);

	var btnWrapper = doc.createElement('div');
	Foxtrick.addClass(btnWrapper, 'ft-dialog-btnWrapper');
	dialog.appendChild(btnWrapper);

	var btnRow = doc.createElement('div');
	Foxtrick.addClass(btnRow, 'ft-dialog-button-row ft-clearfix');
	btnWrapper.appendChild(btnRow);

	var btns = doc.createElement('div');
	Foxtrick.addClass(btns, 'ft-dialog-buttons float_right');
	btnRow.appendChild(btns);

	buttons = Array.isArray(buttons) ? buttons : [];
	buttons.push(DEFAULT_BUTTON);
	Foxtrick.forEach(function(button) {
		var btn = createButton(button);
		btns.appendChild(btn);
	}, buttons);

	var scr = doc.createElement('div');
	scr.id = 'foxtrick-modal-screen';
	doc.body.appendChild(dialog);
	doc.body.appendChild(scr);
};
