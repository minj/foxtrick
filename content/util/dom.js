'use strict';
/*
 * dom.js
 * Utilities for HTML and DOM
 */

/**
 * Create a foxtrick feature dom node
 * @param doc Document
 * @param module Object
 * @param type String
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
 * Insert a new row in table for foxtrick highlight feature
 * @param table Node
 * @param module Object
 * @param index Integer
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
 * Insert a new cell in a row for foxtrick highlight feature
 * @param row Node
 * @param module Object
 * @param index Integer
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

Foxtrick.hasAttributeValue = function(el, attribute, value) {
	var reg = new RegExp('(\\s|^)' + value + '(\\s|$)');
	return el && typeof el.getAttribute === 'function' && el.getAttribute(attribute) &&
		reg.test(el.getAttribute(attribute));
};

Foxtrick.addAttributeValue = function(el, attribute, value) {
	if (!Foxtrick.hasAttributeValue(el, attribute, value)) {
		var _attrib = el.getAttribute(attribute);
		if (_attrib !== null)
			el.setAttribute(attribute, _attrib + ' ' + value);
		else
			el.setAttribute(attribute, value);
	}
};

Foxtrick.removeAttributeValue = function(el, attribute, value) {
	var _attrib = el.getAttribute(attribute);
	if (_attrib !== null) {
		var reg = new RegExp('(\\s|^)' + value + '(\\s|$)', 'g');
		el.setAttribute(attribute, _attrib.replace(reg, ' ').trim());
	}
};

Foxtrick.hasClass = function(el, cls) {
	if (!el || !el.classList)
		return false;

	return el.classList.contains(cls);
};

Foxtrick.addClass = function(el, cls) {
	if (!el || !el.classList)
		return;

	var classes = cls.trim().split(' ');
	for (var c in classes)
		el.classList.add(classes[c]);
};

Foxtrick.removeClass = function(el, cls) {
	if (el && el.classList)
		el.classList.remove(cls);
};

Foxtrick.toggleClass = function(el, cls) {
	if (el && el.classList)
		el.classList.toggle(cls);
};

Foxtrick.hasElement = function(doc, id) {
	if (doc.getElementById(id)) {
		return true;
	}
	return false;
};

Foxtrick.isDescendantOf = function(descendant, ancestor) {
	while (descendant.parentNode) {
		if (descendant.parentNode === ancestor)
			return true;
		descendant = descendant.parentNode;
	}
	return false;
};

Foxtrick.getChildIndex = function(element) {
	var count = 0;
	while (element.previousSibling) {
		++count;
		element = element.previousSibling;
	}
	return count;
};

/**
 * Adds event listener, tabindex=0 and role=button
 * @param	{element}	target
 * @param	{Function}	listener
 */
Foxtrick.onClick = function(el, listener) {
	Foxtrick.listen(el, 'click', listener, false);
	if (!el.hasAttribute('tabindex'))
		el.setAttribute('tabindex', '0');
	if (!el.hasAttribute('role'))
		el.setAttribute('role', 'button');
};

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
 * Calls callback(mutations) on childList changes in the whole tree.
 * Default behavior can be overriden by specifying observer options.
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

/* Foxtrick.addBoxToSidebar
 * @desc add a box to the sidebar, either on the right or on the left
 * @author Ryan Li
 * @param doc - HTML document the content is to be added on
 * @param title - the title of the box, will create one if inexists
 * @param content - HTML node of the content
 * @param prec - precedence of the box, smaller value will be placed higher
 * @param forceLeft - force the box to be desplayed on the left
 * @return box to be added to
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

Foxtrick.setActiveTextBox = function(el, cssClass, text) {
	el.className = cssClass;
	if (el.value === text) {
		el.value = '';
		return false;
	}
	return true;
};

Foxtrick.setInactiveTextBox = function(el, cssClass, text) {
	el.className = cssClass;
	if (el.value === '') {
		el.value = text;
		return false;
	}
	return true;
};

Foxtrick.getElementPosition = function(el, ref) {
	var pT = 0, pL = 0;
	while (el && el !== ref) {
		pT += el.offsetTop;
		pL += el.offsetLeft;
		el = el.offsetParent;
	}
	return { top: pT, left: pL };
};

Foxtrick.getDataURIText = function(str) {
	return 'data:text/plain;charset=utf-8,' + encodeURIComponent(str);
};

/**
 *	Proper way to add an image,
 *	for some crazy reason opera has this weird async step.
 *	@param doc The document
 *	@parem elem The desired parent element
 *	@param features Attributes to be added to the new img element in dictionary form
 *	@param insertBefore If appendChild is not what you want to do, use this
 *	@param callback When further steps are required, handle in this callback function expecting callback(imgElem)
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
