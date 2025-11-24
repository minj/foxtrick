/**
 * dom.js
 * Utilities for HTML and DOM
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

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

// eslint-disable-next-line valid-jsdoc
/**
 * Create an element in SVG namespace. Root element is typically 'svg'.
 * @template {keyof SVGElementTagNameMap} K
 * @param  {document}                     doc
 * @param  {K}                            type
 * @return {SVGElementTagNameMap[K]}
 */
Foxtrick.createSVG = function(doc, type) {
	return doc.createElementNS('http://www.w3.org/2000/svg', type);
};

/**
 * Create an element with Foxtrick feature highlight enabled.
 * This and other similar functions must be used on the outer container
 * of DOM created and/or modified by Foxtrick.
 * Returns the element.
 * @template {keyof HTMLElementTagNameMap} K
 * @param  {document} doc
 * @param  {any}      module // TODO module type
 * @param  {K}        type
 * @return {HTMLElementTagNameMap[K]}
 */
// eslint-disable-next-line consistent-this
Foxtrick.createFeaturedElement = function(doc, module, type) {
	if (module && module.MODULE_NAME && module.MODULE_CATEGORY) {
		let node = doc.createElement(type);
		node.className = 'ft-dummy';
		if (Foxtrick.Prefs.getBool('featureHighlight')) {
			let cat = Foxtrick.L10n.getString('tab.' + module.MODULE_CATEGORY);
			node.title = module.MODULE_NAME + ' (' + cat + '): ' +
				Foxtrick.Prefs.getModuleDescription(module.MODULE_NAME);
		}
		return node;
	}

	let msg = `Incorrect usage of createFeaturedElement. typeof module = '${typeof module}'`;
	Foxtrick.log(new Error(msg));
	return null;
};

/**
 * Insert a new row in a table with Foxtrick feature highlight.
 * Returns the row.
 * @param  {HTMLTableElement} table
 * @param  {any}              module // TODO module type
 * @param  {number}           index
 * @return {HTMLTableRowElement}
 */
// eslint-disable-next-line consistent-this
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
 * @param  {HTMLTableRowElement} row
 * @param  {any}                 module // TODO module type
 * @param  {number}              index
 * @return {HTMLTableCellElement}
 */
// eslint-disable-next-line consistent-this
Foxtrick.insertFeaturedCell = function(row, module, index) {
	let cell = row.insertCell(index);
	cell.className = 'ft-dummy';
	if (Foxtrick.Prefs.getBool('featureHighlight')) {
		let cat = Foxtrick.L10n.getString('tab.' + module.MODULE_CATEGORY);
		cell.title = module.MODULE_NAME + ' (' + cat + '): ' +
			Foxtrick.Prefs.getModuleDescription(module.MODULE_NAME);
	}
	return cell;
};

/**
 * Enable Foxtrick feature highlight on an existing element
 * @template {HTMLElement} E
 * @param  {E}   node
 * @param  {any} module // TODO module type
 * @return {E}
 */
// eslint-disable-next-line consistent-this
Foxtrick.makeFeaturedElement = function(node, module) {
	Foxtrick.addClass(node, 'ft-dummy');
	if (Foxtrick.Prefs.getBool('featureHighlight')) {
		let cat = Foxtrick.L10n.getString('tab.' + module.MODULE_CATEGORY);
		node.title = module.MODULE_NAME + ' (' + cat + '): ' +
			Foxtrick.Prefs.getModuleDescription(module.MODULE_NAME) +
			(node.title ? ' / ' + node.title : '');
	}
	return node;
};

/**
 * Test whether an attribute of an element has the given value
 * or contains it in a space-delimited list
 * @param  {Element} el
 * @param  {string}  attribute
 * @param  {string}  value
 * @return {boolean}
 */
Foxtrick.hasAttributeValue = function(el, attribute, value) {
	let val = String(value).trim();
	let reg = new RegExp(`(\\s|^)${Foxtrick.strToRe(val)}(\\s|$)`);
	return el && typeof el.getAttribute === 'function' && el.getAttribute(attribute) &&
		reg.test(el.getAttribute(attribute));
};

/**
 * Add a value to the space-delimited list of element's attribute
 * @param {Element} el
 * @param {string}  attribute
 * @param {string}  value
 */
Foxtrick.addAttributeValue = function(el, attribute, value) {
	let val = String(value).trim();
	if (Foxtrick.hasAttributeValue(el, attribute, val))
		return;

	let curr = el.getAttribute(attribute);
	if (curr === null || curr === '')
		el.setAttribute(attribute, val);
	else
		el.setAttribute(attribute, `${curr} ${val}`.trim());
};

/**
 * Remove a value from the space-delimited list of element's attribute
 * @param {Element} el
 * @param {string}  attribute
 * @param {string}  value
 */
Foxtrick.removeAttributeValue = function(el, attribute, value) {
	let val = String(value).trim();
	let curr = el.getAttribute(attribute);
	if (curr === null || curr === '')
		return;

	let reg = new RegExp(`(\\s|^)${Foxtrick.strToRe(val)}(\\s|$)`, 'g');
	el.setAttribute(attribute, curr.replace(reg, ' ').trim());
};

/**
 * Set element attributes/properties based on attribute map.
 *
 * Also supports style/dataset and on* listeners.
 *
 * @param {HTMLElement} el
 * @param {any}         attributes // TODO constrain
 */
Foxtrick.setAttributes = function(el, attributes) {
	const ELEMENT_PROPERTIES = [
		'textContent',
		'className',
	];

	const ATTRIBUTE_MAP = Object.assign(Object.create(null), {
		ariaLabel: 'aria-label',
	});

	for (let [attr, val] of Object.entries(attributes)) {
		if ((attr == 'dataset' || attr == 'style') && typeof val == 'object') {
			for (let [item, subVal] of Object.entries(val)) {
				// @ts-ignore
				el[attr][item] = subVal;
			}
		}
		else if (attr.startsWith('on') && typeof val == 'function') {
			let type = /** @type {keyof HTMLElementEventMap} */ (attr.slice(2).toLowerCase());

			if (type == 'click') {
				Foxtrick.onClick(el, val);
			}

			// @ts-ignore
			else if (type == 'mutate') {
				Foxtrick.onChange(el, val);
			}
			else {
				let eventType = /** @type {keyof HTMLElementEventMap} */ (type);
				Foxtrick.listen(el, eventType, val);
			}
		}
		else if (Foxtrick.has(ELEMENT_PROPERTIES, attr)) {
			// @ts-ignore
			el[attr] = val;
		}
		else if (attr in ATTRIBUTE_MAP) {
			el.setAttribute(ATTRIBUTE_MAP[attr], val);
		}
		else {
			el.setAttribute(attr, val);
		}
	}
};

/**
 * Test whether an element has a class
 * @param  {Element} el
 * @param  {string}  cls
 * @return {boolean}
 */
Foxtrick.hasClass = function(el, cls) {
	if (!el || !el.classList)
		return false;

	return el.classList.contains(cls);
};

/**
 * Add a class or a space-delimited list of classes to an alement
 * @param {Element} el
 * @param {string}  cls
 */
Foxtrick.addClass = function(el, cls) {
	if (!el || !el.classList)
		return;

	let classes = cls.trim().split(' ');
	for (let c in classes)
		el.classList.add(classes[c]);
};

/**
 * Remove a class from an element
 * @param {Element} el
 * @param {string}  cls
 */
Foxtrick.removeClass = function(el, cls) {
	if (el && el.classList)
		el.classList.remove(cls);
};

/**
 * Toggle a class of an element
 * @param {Element} el
 * @param {string}  cls
 */
Foxtrick.toggleClass = function(el, cls) {
	if (el && el.classList)
		el.classList.toggle(cls);
};

/**
 * Test whether document contains an element with a given ID
 * @param  {document} doc
 * @param  {string}   id
 * @return {boolean}
 */
Foxtrick.hasElement = function(doc, id) {
	return !!doc.getElementById(id);
};

/**
 * Test whether an element is within another element
 * @param  {Node}    descendant
 * @param  {Node}    ancestor
 * @return {boolean}
 */
Foxtrick.isDescendantOf = function(descendant, ancestor) {
	return ancestor.contains(descendant);
};

/**
 * Get the given element's index among its siblings
 * @param  {Node}   element
 * @return {number}
 */
Foxtrick.getChildIndex = function(element) {
	let count = 0;
	let el = element;
	while (el.previousSibling) {
		++count;
		el = el.previousSibling;
	}
	return count;
};

/**
 * Because types /sigh
 * @template {Element|DocumentFragment} E
 * @param  {E}       el
 * @param  {boolean} [deep]
 * @return {E}
 */
Foxtrick.cloneElement = function(el, deep) {
	return /** @type {E} */ (el.cloneNode(deep));
};

/**
 * Insert adjacent content.
 * ! Target must be Element !
 *
 * @param {InsertPosition} where
 * @param {Node|string}    newNode
 * @param {Element}        target
 */
Foxtrick.insertAdjacent = function(where, newNode, target) {
	let doc = target.ownerDocument;
	let win = doc.defaultView;

	// @ts-ignore
	let isElement = newNode instanceof win.Element;

	// @ts-ignore
	let isNode = newNode instanceof win.Node;

	if (isElement) {
		let element = /** @type {Element} */ (newNode);
		target.insertAdjacentElement(where, element);
	}
	else {
		let text = isNode ? /** @type {Node} */ (newNode).textContent : String(newNode);
		target.insertAdjacentText(where, text);
	}
};

/**
 * Insert newNode before sibling
 * @param {Node|string} newNode
 * @param {Node}        sibling
 */
Foxtrick.insertBefore = function(newNode, sibling) {
	let doc = sibling.ownerDocument;
	let win = doc.defaultView;
	let parent = sibling.parentNode;

	// @ts-ignore
	if (sibling instanceof win.Element) {
		let el = /** @type {Element} */ (sibling);
		Foxtrick.insertAdjacent('beforebegin', newNode, el);
	}

	// @ts-ignore
	else if (newNode instanceof win.Node) {
		let node = /** @type {Node} */ (newNode);
		parent.insertBefore(node, sibling);
	}
	else {
		let text = doc.createTextNode(String(newNode));
		parent.insertBefore(text, sibling);
	}
};

/**
 * Insert newNode after sibling
 * @param {Node|string} newNode
 * @param {Node}        sibling
 */
Foxtrick.insertAfter = function(newNode, sibling) {
	let doc = sibling.ownerDocument;
	let win = doc.defaultView;
	let parent = sibling.parentNode;

	// @ts-ignore
	if (sibling instanceof win.Element) {
		let el = /** @type {Element} */ (sibling);
		Foxtrick.insertAdjacent('afterend', newNode, el);
	}

	// @ts-ignore
	else if (newNode instanceof win.Node) {
		let node = /** @type {Node} */ (newNode);
		parent.insertBefore(node, sibling.nextSibling);
	}
	else {
		let text = doc.createTextNode(String(newNode));
		parent.insertBefore(text, sibling.nextSibling);
	}
};

/**
 * Insert newNode as first child of parent
 * @param {Node|string} newNode
 * @param {Node}        parent
 */
Foxtrick.prependChild = function(newNode, parent) {
	let doc = parent.ownerDocument;
	let win = doc.defaultView;

	// @ts-ignore
	if (parent instanceof win.Element) {
		let el = /** @type {Element} */ (parent);
		Foxtrick.insertAdjacent('afterbegin', newNode, el);
	}

	// @ts-ignore
	else if (newNode instanceof win.Node) {
		let node = /** @type {Node} */ (newNode);
		parent.insertBefore(node, parent.firstChild);
	}
	else {
		let text = doc.createTextNode(String(newNode));
		parent.insertBefore(text, parent.firstChild);
	}
};

/**
 * Insert newNode as last child of parent
 * @param {Node|string} newNode
 * @param {Node}        parent
 */
Foxtrick.appendChild = function(newNode, parent) {
	let doc = parent.ownerDocument;
	let win = doc.defaultView;

	// @ts-ignore
	if (parent instanceof win.Element) {
		let el = /** @type {Element} */ (parent);
		Foxtrick.insertAdjacent('beforeend', newNode, el);
	}

	// @ts-ignore
	else if (newNode instanceof win.Node) {
		let node = /** @type {Node} */ (newNode);
		parent.appendChild(node);
	}
	else {
		let text = doc.createTextNode(String(newNode));
		parent.appendChild(text);
	}
};

/**
 * Append an array of elements to a container
 * @param {Node}            parent
 * @param {(Node|string)[]} children
 */
Foxtrick.appendChildren = function(parent, children) {
	Foxtrick.forEach(function(child) {
		Foxtrick.appendChild(child, parent);
	}, children);
};

/**
 * Append child(ren) to parent.
 *
 * child may be a Node, string or an array of such.
 *
 * @param {Node}                        parent
 * @param {Node|string|(Node|string)[]} child
 */
Foxtrick.append = function(parent, child) {
	let doc = parent.ownerDocument;
	let win = doc.defaultView;

	if (Foxtrick.isArrayLike(child)) {
		let children = /** @type {(Node|string)[]} */ (child);
		Foxtrick.forEach(function(c) {
			Foxtrick.append(parent, c);
		}, children);
	}

	// @ts-ignore
	else if (child instanceof win.Node) {
		let node = /** @type {Node} */ (child);
		parent.appendChild(node);
	}
	else if (child != null) {
		// skip null/undefined
		let str = String(child);
		parent.appendChild(doc.createTextNode(str));
	}
};

/**
 * Adds a click event listener to an element.
 *
 * Sets tabindex=0 and role=button if these attributes have no value.
 *
 * ! This does more harm than good on 'delegated' listeners, listen() should be used instead.
 *
 * The callback is executed with global change listeners stopped.
 *
 * @template {Element} T
 *
 * @param  {T}                      el
 * @param  {Listener<T,MouseEvent>} listener
 * @param  {boolean}                [useCapture]
 * @return {function():void}                     remove wrapped listener
 */
Foxtrick.onClick = function(el, listener, useCapture) {
	Foxtrick.clickTarget(el);
	return Foxtrick.listen(el, 'click', listener, useCapture);
};

/**
 * Sets tabindex=0 and role=button if these attributes have no value.
 *
 * Uses wrappers for elements with important accessibility semantics.
 *
 * ! This does more harm than good on 'delegated' listeners
 *
 * @param  {Element} el
 */
Foxtrick.clickTarget = function(el) {
	/**
	 * @param  {Element} e
	 * @return {Element}
	 */
	const wrapContents = (e) => {
		let span = e.ownerDocument.createElement('span');
		Foxtrick.append(span, [...e.childNodes]);
		return e.appendChild(span);
	};

	/**
	 * @param  {Element} e
	 * @return {Element}
	 */
	const wrapElement = (e) => {
		let span = e.ownerDocument.createElement('span');
		e.parentElement.replaceChild(span, e);
		span.appendChild(e);
		return span;
	};

	/** @type {Partial<Record<keyof HTMLElementTagNameMap, function(Element):Element>>} */
	const ROLES_CBS = {
		h1: wrapContents,
		h2: wrapContents,
		h3: wrapContents,
		h4: wrapContents,
		h5: wrapContents,
		h6: wrapContents,
		td: wrapContents,
		th: wrapContents,

		img: wrapElement,

		input: null,
	};

	/** @type {Element} */
	let target = null;
	let name = el.nodeName.toLowerCase();
	if (name in ROLES_CBS) {
		let tag = /** @type {keyof HTMLElementTagNameMap} */ (name);
		let role = ROLES_CBS[tag];
		if (typeof role == 'function')
			target = role(el);
	}
	else {
		target = el;
	}

	if (!target)
		return;

	if (!target.hasAttribute('tabindex'))
		target.setAttribute('tabindex', '0');
	if (!target.hasAttribute('role'))
		target.setAttribute('role', 'button');
};

/**
 * Add an event listener to an element.
 *
 * The callback is executed with global change listeners stopped.
 *
 * @template {EventTarget} T
 * @template {keyof HTMLElementEventMap} E
 *
 * @param  {T}                        el
 * @param  {E}                        evType       event type
 * @param  {Listener<T,HTMLEvent<E>>} listener
 * @param  {boolean}                  [useCapture]
 * @return {function():void}                       remove wrapped listener
 */
Foxtrick.listen = function(el, evType, listener, useCapture) {
	/**
	 * @this  {T}
	 * @param {HTMLEvent<E>} ev
	 */
	let listen = function listen(ev) {
		let target = /** @type {Element|Document} */ (ev.target);

		let doc = target instanceof Document ? target : target.ownerDocument;
		Foxtrick.stopObserver(doc);

		/** @type {boolean|Promise<any>|void} */
		let ret;
		try {
			ret = listener.call(this, ev);
		}
		catch (e) {
			Foxtrick.log(e);
		}

		if (ret === false) {
			ev.stopPropagation();
			ev.preventDefault();
		}
		else if (ret instanceof Promise) {
			Foxtrick.finally(ret, () => {
				Foxtrick.log.flush(doc);
				Foxtrick.startObserver(doc);
			}).catch(Foxtrick.catch('async listen'));
		}
		else {
			Foxtrick.log.flush(doc);
			Foxtrick.startObserver(doc);
		}
	};

	/*
		README: since TS 3.5 union type checking became 'smarter' and errors here
		since addEventListener API is contravariant (dumb) here,
		it will not accept a callback requiring a more specific Event
		we know better however, since we actually type-check the evType argument
	*/
	let cb = /** @type {EventListener} */ (listen);

	el.addEventListener(evType, cb, useCapture);
	return () => el.removeEventListener(evType, cb, useCapture);
};

/**
 * Activate an element by adding a copy listener.
 *
 * copy maybe a string or a function that returns {mime, content}
 * mime may specify additional mime type
 * 'text/plain' is always used
 *
 * @param {Element}                  el
 * @param {string|function():string} copy   {string|function}
 * @param {?string}                  [mime]
 */
Foxtrick.addCopying = function(el, copy, mime) {
	Foxtrick.onClick(el, function() {
		// eslint-disable-next-line no-invalid-this
		let doc = this.ownerDocument;
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
 * @param  {Node}                                     node       observer target
 * @param  {function(MutationRecord[]): boolean|void} shouldStop
 * @param  {MutationObserverInit}                     [options]  observer options
 * @return {MutationObserver}
 */
Foxtrick.observe = function(node, shouldStop, options) {
	/** @type {MutationObserverInit} */
	let opts = { childList: true, subtree: true };
	Object.assign(opts, options);

	/**
	 * @this {MutationObserver}
	 */
	let observe = function() {
		this.takeRecords();
		this.observe(node, opts);
	};

	let observer = new MutationObserver((mutations, observer) => {
		observer.disconnect();
		if (!shouldStop(mutations))
			observe.call(observer);
	});

	// @ts-ignore
	observer.reconnect = observe;
	observe.call(observer);

	return observer;
};

/**
 * Execute callback(doc, node, observer) when node changes.
 * Stops observing if callback returns true.
 * Returns the observer.
 * @template {Node} T
 * @param  {T}                                   node
 * @param  {function(document, T): boolean|void} callback
 * @param  {MutationObserverInit}                [obsOpts] observer options
 * @return {MutationObserver}
 */
Foxtrick.onChange = function(node, callback, obsOpts) {
	return Foxtrick.observe(node, function() {
		let doc = node.ownerDocument;
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
 * @param  {Node}                          node      container
 * @param  {function(Node[]):boolean|void} callback
 * @param  {MutationObserverInit}          [obsOpts] observer options
 * @return {MutationObserver}
 */
Foxtrick.getChanges = function(node, callback, obsOpts) {
	return Foxtrick.observe(node, function(records) {
		let affectedNodes = records.map(r => r.target);
		let uniques = Foxtrick.unique(affectedNodes);

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
 * @author Ryan Li, LA-MJ
 * @param  {document} doc
 * @param  {string}   title       the title of the box, will create one if inexists
 * @param  {Element}  content     HTML node of the content
 * @param  {number}   prec        precedence of the box, the smaller, the higher
 * @param  {boolean}  [forceLeft] force the box to be displayed on the left
 * @return {Element}              box to be added to
 */
// eslint-disable-next-line complexity
Foxtrick.addBoxToSidebar = function(doc, title, content, prec, forceLeft) { // FIXME support angular
	// class of the box to add
	var boxClass = 'sidebarBox';
	var sidebar = doc.getElementById('sidebar');
	if (!sidebar || forceLeft) {
		if ((sidebar = doc.querySelector('.subMenu')))
			boxClass = 'subMenuBox';
		else if ((sidebar = doc.querySelector('.subMenuConf')))
			boxClass = 'subMenuBox';
	}

	if (!sidebar)
		return null;

	// destination box
	var dest;

	// existing sidebar boxes
	var existings = sidebar.getElementsByClassName(boxClass);
	for (let box of existings) {
		let hdr = box.querySelector('h2').textContent;
		if (hdr == title) {
			// found destination box
			dest = box;
			break;
		}
	}

	// create new box if old one doesn't exist
	if (!dest) {
		dest = doc.createElement('div');
		dest.className = boxClass;
		dest.setAttribute('x-precedence', String(prec));

		// boxHead
		let boxHead = doc.createElement('div');
		boxHead.className = 'boxHead';
		dest.appendChild(boxHead);

		// boxHead - boxLeft
		let headBoxLeft = doc.createElement('div');
		headBoxLeft.className = 'boxLeft';
		boxHead.appendChild(headBoxLeft);

		// boxHead - boxLeft - h2
		let h2 = doc.createElement('h2');
		h2.textContent = title;
		headBoxLeft.appendChild(h2);

		// boxBody
		let boxBody = doc.createElement('div');
		boxBody.className = 'boxBody';
		dest.appendChild(boxBody);

		// append content to boxBody
		boxBody.appendChild(content);

		// boxFooter
		let boxFooter = doc.createElement('div');
		boxFooter.className = 'boxFooter';
		dest.appendChild(boxFooter);

		// boxFooter - boxLeft
		let footBoxLeft = doc.createElement('div');
		footBoxLeft.className = 'boxLeft';
		boxFooter.appendChild(footBoxLeft);

		// now we insert the newly created box
		var inserted = false;
		for (let [i, box] of [...existings].entries()) {
			// precedence of current box, hattrick boxes are set to 0
			let curPrec = parseInt(box.getAttribute('x-precedence'), 10) || 0;
			if (curPrec <= prec)
				continue;

			if (i === 0 && curPrec === 0) {
				// first to be added and placed before HT boxes. add it on top
				// before possible updatepanel div (eg teampage challenge and mailto)
				sidebar.insertBefore(dest, sidebar.firstChild);
			}
			else {
				box.parentNode.insertBefore(dest, box);
			}

			inserted = true;
			break;
		}

		if (!inserted)
			sidebar.appendChild(dest);
	}

	// finally we add the content
	dest.querySelector('.boxBody').appendChild(content);

	return dest;
};

/**
 * Get element position relative to reference.
 * Returns the position as an object {top, left}.
 * @param  {HTMLElement}                 el
 * @param  {HTMLElement}                 ref
 * @return {{top: number, left: number}}     position
 */
Foxtrick.getElementPosition = function(el, ref) {
	let top = 0, left = 0;
	let e = el;
	while (e && e !== ref) {
		top += e.offsetTop;
		left += e.offsetLeft;

		e = /** @type {HTMLElement} */ (e.offsetParent);
	}

	return { top, left };
};

/**
 * Convert a string into data URI text file
 * @param  {string} str
 * @return {string}
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
 * @param {document} doc
 * @param {Node}     parent
 * @param {any}      features       a map of image attributes // TODO constrain
 * @param {Node}     [insertBefore] next sibling
 * @param {function(HTMLImageElement):void} [callback]
 */
Foxtrick.addImage = function(doc, parent, features, insertBefore, callback) {
	let img = doc.createElement('img');

	Foxtrick.setAttributes(img, features);

	if (insertBefore)
		parent.insertBefore(img, insertBefore);
	else
		parent.appendChild(img);

	callback && callback(img);
};

/**
 * Add a specialty icon from a specialty number.
 *
 * options is a map of DOM attributes: {string: string}.
 * NOTE: insertBefore and onError has special meaning.
 *
 * Returns Promise.<HTMLImageElement>
 *
 * @param  {Node}   parent
 * @param  {number} specNum    {Integer}
 * @param  {any}    [features] image attributes // TODO constrain
 * @return {Promise<HTMLImageElement>}
 */
Foxtrick.addSpecialty = function(parent, specNum, features = {}) {
	let doc = parent.ownerDocument;

	let specialtyName = Foxtrick.L10n.getSpecialtyFromNumber(specNum);
	let specialtyUrl = Foxtrick.getSpecialtyImagePathFromNumber(specNum);

	/** @type {Node} */
	let insertBefore = null;
	if (Foxtrick.hasProp(features, 'insertBefore')) {
		// @ts-ignore
		insertBefore = features.insertBefore;
		delete features.insertBefore;
	}

	let imgContainer = doc.createElement('span');
	if (insertBefore)
		parent.insertBefore(imgContainer, insertBefore);
	else
		parent.appendChild(imgContainer);

	if (Foxtrick.Prefs.isModuleEnabled('SpecialtyInfo')) {
		Foxtrick.addClass(imgContainer, 'ft-specInfo-parent');
		imgContainer.dataset.specialty = specNum.toString();

		specialtyName += '\n' + Foxtrick.L10n.getString('SpecialtyInfo.open');
		features.tabindex = '0';
		features.role = 'button';
	}

	let opts = Object.assign({
		alt: specialtyName,
		title: specialtyName,
		src: specialtyUrl,
	}, features);

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
 * @template {HTMLTableSectionElement} T
 * @param  {document}           doc
 * @param  {(HTMLTableRowElement|(*|Node|string|(Node|string)[])[])[]} rows
 * @param  {?T}                 section
 * @return {T|HTMLTableElement}
 */
Foxtrick.makeRows = function(doc, rows, section) {
	let t = section || doc.createElement('table');

	for (let rowItem of Foxtrick.toArray(rows)) {
		if (rowItem instanceof HTMLTableRowElement) {
			t.appendChild(rowItem);
			continue;
		}

		let row = t.insertRow(-1);
		for (let cellItem of Foxtrick.toArray(rowItem)) {
			if (cellItem == null)
				continue;

			if (cellItem instanceof HTMLTableCellElement) {
				row.appendChild(cellItem);
				continue;
			}

			let cell = row.insertCell(-1);

			if (Foxtrick.isMap(cellItem))
				Foxtrick.setAttributes(cell, cellItem);
			else
				Foxtrick.append(cell, cellItem);
		}
	}

	return t;
};

/**
 * @typedef TextAreaSelection
 * @prop {number} selectionStart
 * @prop {number} selectionEnd
 * @prop {number} selectionLength
 * @prop {string} completeText
 * @prop {string} selectedText
 * @prop {string} textBeforeSelection
 * @prop {string} textAfterSelection
 */
/**
 * Describe selected text in a text area.
 * Returns null if no selection or
 * {completeText, selectionStart, selectionEnd, selectionLength,
 * textBeforeSelection, selectedText, textAfterSelection}
 *
 * @param  {HTMLTextAreaElement} ta text area
 * @return {?TextAreaSelection}
 */
Foxtrick.getSelection = function(ta) {
	if (!ta || typeof ta.selectionStart != 'number')
		return null;

	ta.focus();

	/** @type {TextAreaSelection} */
	let taInfo = {
		completeText: '',
		selectionStart: 0,
		selectionEnd: 0,
		selectionLength: 0,
		textBeforeSelection: '',
		selectedText: '',
		textAfterSelection: '',
	};

	taInfo.completeText = ta.value;
	taInfo.selectionStart = ta.selectionStart;

	if (ta.selectionEnd - ta.selectionStart !== 0) {
		while (ta.value.charAt(ta.selectionEnd - 1) === ' ')
			ta.selectionEnd--;
	}

	taInfo.selectionEnd = ta.selectionEnd;
	taInfo.selectionLength = ta.selectionEnd - ta.selectionStart;
	taInfo.textBeforeSelection = ta.value.slice(0, ta.selectionStart);

	let st = ta.value.slice(ta.selectionStart, ta.selectionEnd);

	taInfo.selectedText = st;
	taInfo.textAfterSelection = ta.value.slice(ta.selectionEnd, ta.value.length);
	return taInfo;
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
 *
 * @param  {document}    doc
 * @param  {string}      ID
 * @return {HTMLElement}
 */
Foxtrick.getMBElement = function(doc, ID) {
	const PRE = this.getMainIDPrefix();
	let el = doc.getElementById(PRE + ID);
	return el;
};

/**
 * Get HT Button by the relevant part of its ID.
 *
 * Supports ctl00_ctl00_CPContent_CPMain_$ID,
 * ctl00_ctl00_CPContent_CPMain_btn$ID and
 * ctl00_ctl00_CPContent_CPMain_but$ID
 *
 * @param  {document|Element} scope
 * @param  {string}               ID
 * @return {HTMLInputElement}
 */
Foxtrick.getButton = function(scope, ID) {
	const PRE = this.getMainIDPrefix();

	let btn =
		scope.querySelector(`#${PRE}${ID}`) ||
		scope.querySelector(`#${PRE}btn${ID}`) ||
		scope.querySelector(`#${PRE}but${ID}`);

	return /** @type {HTMLInputElement} */ (btn);
};

/**
 * Get HT Button by the relevant part of HT module's ID.
 *
 * Supports ctl00_ctl00_CPContent_CPMain_$HTModule_$ID,
 * ctl00_ctl00_CPContent_CPMain_$HTModule_btn$ID and
 * ctl00_ctl00_CPContent_CPMain_$HTModule_but$ID
 *
 * @param  {document|Element} scope
 * @param  {string}           HTModule
 * @param  {string}           ID
 * @return {HTMLInputElement}
 */
Foxtrick.getHTModuleButton = function(scope, HTModule, ID) {
       const PRE = this.getMainIDPrefix() + HTModule + '_';

       let btn =
               scope.querySelector(`#${PRE}${ID}`) ||
               scope.querySelector(`#${PRE}btn${ID}`) ||
               scope.querySelector(`#${PRE}but${ID}`);

       return /** @type {HTMLInputElement} */ (btn);
};

/**
 * @param  {document|Element} scope
 * @return {HTMLInputElement}
 */
Foxtrick.getSubmitButton = function(scope) {
	// because HTs do not believe in standards
	const buttons = [
		'OK',
		'SendNew',
		'Add',
		'Edit',
		'SendNewsletter',
		'NewsSend',
		'ActionSend',
		'SendWithoutPreview',
		'ucForumPreferences_btnSave',
	];

	for (let btn of buttons) {
		let el = Foxtrick.getButton(scope, btn);
		if (el)
			return el;
	}

	return null;
};

/**
 * Get all text nodes in the node tree
 * @param  {Element} parent
 * @return {Text[]}
 */
Foxtrick.getTextNodes = function(parent) {
	let doc = parent.ownerDocument;
	let win = doc.defaultView;

	let ret = [];

	// @ts-ignore
	let walker = doc.createTreeWalker(parent, win.NodeFilter.SHOW_TEXT, null, false);
	let node;
	while ((node = walker.nextNode()))
		ret.push(/** @type {Text} */ (node));

	return ret;
};

/**
 * Get all text and element nodes in the node tree
 * @param  {Element} parent
 * @return {(Node|Element)[]}
 */
Foxtrick.getNodes = function(parent) {
	let ret = [];
	let doc = parent.ownerDocument;
	let win = doc.defaultView;

	// @ts-ignore
	// eslint-disable-next-line no-bitwise
	let bitMask = win.NodeFilter.SHOW_TEXT | win.NodeFilter.SHOW_ELEMENT;
	let walker = doc.createTreeWalker(parent, bitMask, null);

	let node;
	while ((node = walker.nextNode()))
		ret.push(node);

	return ret;
};

/**
 * Render pre elements in a container
 * @param {Element} parent
 */
Foxtrick.renderPre = function(parent) {
	const doc = parent.ownerDocument;
	const testRE = /\[\/?pre\]/i;
	if (testRE.test(parent.textContent)) {
		// valid pre found
		let allNodes = Foxtrick.getNodes(parent);

		/** @type {Node[]} */
		let nodes = [];

		/** @type {HTMLPreElement} */
		let pre = null;

		/** @type {HTMLPreElement|Node} */
		let target = null;

		// eslint-disable-next-line complexity
		Foxtrick.forEach(function(node) {
			if (node.hasChildNodes()) {
				// skip containers
				return;
			}

			let text = node.textContent;
			if (!testRE.test(text)) {
				if (pre) {
					// add any nodes in between pre tags as is
					pre.appendChild(node);
				}
				return;
			}

			// create a new RE object for each node
			let preRE = /\[\/?pre\]/ig;
			let mArray, prevIndex = 0;
			while ((mArray = preRE.exec(text))) {
				let [tag] = mArray;
				let start = preRE.lastIndex - tag.length;
				if (start > prevIndex) {
					// add any previous text as a text node
					let previousText = text.slice(prevIndex, start);
					let prevTextNode = doc.createTextNode(previousText);
					if (pre)
						pre.appendChild(prevTextNode);
					else
						nodes.push(prevTextNode);
				}

				if (tag === '[pre]' && !pre) {
					pre = doc.createElement('pre');
					pre.className = 'ft-dummy';
					nodes.push(pre);

					// target is a pointer for DOM insertion
					if (node.parentNode) {
						target = node;
					}
					else if (target.parentNode) {
						// insert dummy
						// README: insertAfter discards the TextNode arg!
						Foxtrick.insertAfter(doc.createTextNode(''), target);
						target = target.nextSibling;
					}
					else {
						Foxtrick.log(new Error('renderPre: unsupported state'));
						return;
					}
				}
				else if (tag === '[/pre]' && pre) {
					let frag = doc.createDocumentFragment();

					Foxtrick.appendChildren(frag, nodes);
					target.parentNode.replaceChild(frag, target);

					// set target as pre to be used outside loop
					target = pre;
					pre = null;
					nodes = [];
				}
				else {
					Foxtrick.log(new Error('renderPre: unsupported state'));
					return;
				}
				prevIndex = preRE.lastIndex;
			}

			if (prevIndex < text.length) {
				// add any ending text
				let endText = text.slice(prevIndex);
				let endTextNode = doc.createTextNode(endText);
				if (pre) {
					// pre still not inserted
					pre.appendChild(endTextNode);
				}
				else {
					// target points to inserted pre instead
					let pre = /** @type {HTMLPreElement} */ (target);
					Foxtrick.insertAfter(endTextNode, pre);
				}
			}

			if (pre == null && node.parentNode) {
				// node is still in DOM, remove it
				node.parentNode.removeChild(node);
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
 * @typedef DialogButton
 * @prop {string} title
 * @prop {Listener<HTMLButtonElement,MouseEvent>} [handler]
 */

/**
 * Make and display a modal dialog.
 * Handles foxtrick:// links automatically
 * content can either be a string or an element/fragment
 * buttons is {Array.<{title:string, handler:function}>} (optional)
 * @param {document}       doc
 * @param {string}         title
 * @param {Node|string}    content
 * @param {DialogButton[]} [buttons]
 */
Foxtrick.makeModal = function(doc, title, content, buttons) {
	/** @type {Listener<HTMLButtonElement,MouseEvent>} */
	const DEFAULT_HANDLER = function() {
		let doc = this.ownerDocument;
		let dialog = doc.getElementById('foxtrick-modal-dialog');
		dialog.remove();
		let scr = doc.getElementById('foxtrick-modal-screen');
		scr.remove();
	};

	/** @type {DialogButton} */
	const DEFAULT_BUTTON = { title: Foxtrick.L10n.getString('button.close') };

	/**
	 * @param  {DialogButton} button
	 * @return {HTMLButtonElement}
	 */
	var createButton = function(button) {
		let btn = doc.createElement('button');
		btn.type = 'button';
		Foxtrick.addClass(btn, 'ft-dialog-button ft-rborder');

		let text = doc.createElement('span');
		Foxtrick.addClass(text, 'ft-dialog-button-text');
		text.textContent = button.title;
		btn.appendChild(text);

		if (typeof button.handler !== 'function')
			button.handler = DEFAULT_HANDLER;

		Foxtrick.onClick(btn, button.handler);

		return btn;
	};

	var dialog = doc.createElement('div');
	dialog.id = 'foxtrick-modal-dialog';

	// handle foxtrick:// links
	// TODO refactor into an util
	var listener = Foxtrick.modules.ForumStripHattrickLinks.changeLinks;
	Foxtrick.listen(dialog, 'mousedown', listener);

	{
		let hdrWrapper = doc.createElement('div');
		Foxtrick.addClass(hdrWrapper, 'ft-dialog-hdrWrapper');
		dialog.appendChild(hdrWrapper);

		let header = doc.createElement('div');
		Foxtrick.addClass(header, 'ft-dialog-header ft-clearfix ft-rborder');
		hdrWrapper.appendChild(header);

		let titleHeader = doc.createElement('h1');
		Foxtrick.addClass(titleHeader, 'ft-dialog-title float_left');
		titleHeader.textContent = 'Foxtrick » ' + title;
		titleHeader.title = title;
		header.appendChild(titleHeader);
	}

	{
		let contentDiv = doc.createElement('div');
		Foxtrick.addClass(contentDiv, 'ft-dialog-content');
		dialog.appendChild(contentDiv);

		let cont;
		if (typeof content == 'string' || content == null) {
			let p = doc.createElement('p');
			p.textContent = String(content);
			cont = p;
		}
		else {
			cont = content;
		}
		contentDiv.appendChild(cont);
	}

	// TODO convert to grid
	{
		let btnWrapper = doc.createElement('div');
		Foxtrick.addClass(btnWrapper, 'ft-dialog-btnWrapper');
		dialog.appendChild(btnWrapper);

		let btnRow = doc.createElement('div');
		Foxtrick.addClass(btnRow, 'ft-dialog-button-row ft-clearfix');
		btnWrapper.appendChild(btnRow);

		let btns = doc.createElement('div');
		Foxtrick.addClass(btns, 'ft-dialog-buttons float_right');
		btnRow.appendChild(btns);

		let btnDefs = Array.isArray(buttons) ? buttons : [];
		btnDefs.push(DEFAULT_BUTTON);

		Foxtrick.forEach(function(button) {
			let btn = createButton(button);
			btns.appendChild(btn);
		}, btnDefs);
	}

	let scr = doc.createElement('div');
	scr.id = 'foxtrick-modal-screen';
	doc.body.appendChild(dialog);
	doc.body.appendChild(scr);
};

/**
 * @template {EventTarget} T
 * @template {Event}       E
 * @typedef  {(this:T,ev:E)=>boolean|Promise<any>|void} Listener<T,E>
 */

/**
 * @template {keyof HTMLElementEventMap} E
 * @typedef {HTMLElementEventMap[E]} HTMLEvent<E>
 */
