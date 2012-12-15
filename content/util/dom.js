"use strict";
/*
 * dom.js
 * Utilities for HTML and DOM
 */

if (!Foxtrick) var Foxtrick = {};

Foxtrick.createFeaturedElement = function(doc, module, type) {
	if(module && module.MODULE_NAME && module.MODULE_CATEGORY){
		var node = doc.createElement(type);
		node.className = 'ft-dummy';
		if (FoxtrickPrefs.getBool("featureHighlight"))
			node.title = module.MODULE_NAME + ' (' + Foxtrickl10n.getString("tab."+module.MODULE_CATEGORY) + '): ' + FoxtrickPrefs.getModuleDescription(module.MODULE_NAME);
		return node;
	} else {
		Foxtrick.log("Incorrect usage of Foxtrick.createFeaturedElement. typeof(module) = ", typeof(module));
		return null;
	}
};

Foxtrick.insertFeaturedRow = function(table, module, index) {
	var row = table.insertRow(index);
	row.className = 'ft-dummy';
	if (FoxtrickPrefs.getBool("featureHighlight"))
		row.title = module.MODULE_NAME + ' (' + Foxtrickl10n.getString("tab."+module.MODULE_CATEGORY) + '): ' + FoxtrickPrefs.getModuleDescription(module.MODULE_NAME);
	return row;
};


Foxtrick.insertFeaturedCell = function(row, module, index) {
	var cell = row.insertCell(index);
	cell.className = 'ft-dummy';
	if (FoxtrickPrefs.getBool("featureHighlight"))
		cell.title = module.MODULE_NAME + ' (' + Foxtrickl10n.getString("tab." + module.MODULE_CATEGORY) + '): ' + FoxtrickPrefs.getModuleDescription(module.MODULE_NAME);
	return cell;
};

Foxtrick.makeFeaturedElement = function(node, module) {
	Foxtrick.addClass(node, 'ft-dummy');
	if (FoxtrickPrefs.getBool("featureHighlight"))
		node.title = module.MODULE_NAME + ' (' + Foxtrickl10n.getString("tab." + module.MODULE_CATEGORY) + '): ' + FoxtrickPrefs.getModuleDescription(module.MODULE_NAME) + (node.title ? " / " +node.title : "" );
	return node;
};

Foxtrick.hasAttributeValue = function(obj, attribute, value) {
	var reg = new RegExp("(\\s|^)" + value + "(\\s|$)", "g");
	return (obj && obj.getAttribute !== undefined 
		&& obj.getAttribute(attribute) 
		&& reg.test(obj.getAttribute(attribute)));
}

Foxtrick.addAttributeValue = function(obj, attribute, value) {
	if (!Foxtrick.hasAttributeValue(obj, attribute, value)){
		var _attrib = obj.getAttribute(attribute);
		if(_attrib)
			obj.setAttribute(attribute, _attrib + " " + value);
		else
			obj.setAttribute(attribute, value);
	}
}

Foxtrick.removeAttributeValue = function(obj, attribute, value) {
	var _attrib = obj.getAttribute(attribute);
	if(_attrib){
		var reg = new RegExp("(\\s|^)" + value + "(\\s|$)", "g");
		obj.setAttribute(attribute, Foxtrick.trim(_attrib.replace(reg, " ")));
	}
}

Foxtrick.hasClass = function(obj, cls) {
	return Foxtrick.hasAttributeValue(obj, "class", cls);
}

Foxtrick.addClass = function(obj, cls) {
	Foxtrick.addAttributeValue(obj, "class", cls);
}

Foxtrick.removeClass = function(obj, cls) {
	Foxtrick.removeAttributeValue(obj, "class", cls);
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
Foxtrick.isDescendantOf = function(descendant, ancestor) {
	while (descendant.parentNode){
		if (descendant.parentNode == ancestor)
			return true;
		descendant = descendant.parentNode;
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

Foxtrick.onClick = function(target, listener){
	Foxtrick.listen(target, 'click', listener, false);	
}

Foxtrick.listen = function(target, type, listener, useCapture) {
	target.addEventListener(
		type,
		function(ev) {
			var doc = ev.target.ownerDocument;
			Foxtrick.stopListenToChange(doc);
			listener(ev);
			Foxtrick.log.flush(doc);
			Foxtrick.startListenToChange(doc);
		},
		useCapture
	);
};

// opera doesn't have domtreemodified and webkit not domattrchanged. so we use those for all
// there would be a workaround for domattrchanged if realy needed (keep a copy of the node attribs and check for changes every second) 
Foxtrick.MutationEventListeners = [];

Foxtrick.DOMListener = function(target, type, listener, useCapture) {
	var changeScheduled = false;
	var waitForChanges = function (ev) {
		// if we already have been called return and do nothing
		if (changeScheduled) 
			return;
		changeScheduled = true;
		// use setTimeout append our actual handler to the list of handlers 
		// which are currently scheduled to be executed
		window.setTimeout ( function() {
			// all changes have past and all changehandlers called. no we can call our actual handler
			changeScheduled = false;
			target.removeEventListener(type, waitForChanges, useCapture);
			try{
				listener(ev);
			} catch(e) {
				Foxtrick.log('uncaught error in listener',e);
			}
			target.addEventListener(type, waitForChanges, useCapture);
		}, 0)
	};
	this.start = function () {
		target.addEventListener(type, waitForChanges, useCapture);
	};
	this.stop = function () { 
		target.removeEventListener(type, waitForChanges, useCapture);
	};
};

Foxtrick.addMutationEventListener = function(target, type, listener, useCapture) {
	if ( type!='DOMNodeInserted' && type!='DOMNodeRemoved' && type!= 'DOMCharacterDataModified' ) {
		Foxtrick.log('event type not supported by all browser');
		return;
	}

	// attach an alternative handler which could get executed several times for multiple changes at once. 
	// since our handler should execute only once, we use a different handler to call ours when all changes have past
	var DOMListener = new Foxtrick.DOMListener(target, type, listener, useCapture);
	Foxtrick.MutationEventListeners.push( {target:target, type:type, listener:listener, useCapture:useCapture, DOMListener:DOMListener });
	DOMListener.start();
};

Foxtrick.removeMutationEventListener = function(target, type, listener, useCapture) {
	for (var i=0; i<Foxtrick.MutationEventListeners.length; ++i) {
		if ( target == Foxtrick.MutationEventListeners[i].target
			&& type == Foxtrick.MutationEventListeners[i].type
			&& listener == Foxtrick.MutationEventListeners[i].listener
			&& useCapture == Foxtrick.MutationEventListeners[i].useCapture) {
			
			Foxtrick.MutationEventListeners[i].target = null;
			Foxtrick.MutationEventListeners[i].type = null;
			Foxtrick.MutationEventListeners[i].listener = null;
			Foxtrick.MutationEventListeners[i].useCapture = null;
			
			Foxtrick.MutationEventListeners[i].DOMListener.stop();
			delete Foxtrick.MutationEventListeners[i].DOMListener;
			break;
		}
	}
};


/* Foxtrick.addBoxToSidebar
 * @desc add a box to the sidebar, either on the right or on the left
 * @author Ryan Li
 * @param doc - HTML document the content is to be added on
 * @param title - the title of the box, will create one if inexists
 * @param content - HTML node of the content
 * @param prec - precedence of the box, smaller value will be placed higher
 * @return box to be added to
 */
Foxtrick.addBoxToSidebar = function(doc, title, content, prec) {
	// class of the box to add
	var boxClass = "";
	var sidebar;
	((sidebar = doc.getElementById("sidebar")) && (boxClass = "sidebarBox"))
		|| ((sidebar = doc.getElementsByClassName("subMenu")[0]) && (boxClass = "subMenuBox"))
		|| ((sidebar = doc.getElementsByClassName("subMenuConf")[0]) && (boxClass = "subMenuBox"));

	if (!sidebar)
		return;

	// destination box
	var dest;

	// existing sidebar boxes
	var existings = sidebar.getElementsByClassName(boxClass);
	for (var i = 0; i < existings.length; ++i) {
		var box = existings[i];
		var hdr = box.getElementsByTagName("h2")[0].textContent;
		if (hdr == title)
			dest = box; // found destination box
	}
	// create new box if old one doesn't exist
	if (!dest) {
		var dest = doc.createElement("div");
		dest.className = boxClass;
		dest.setAttribute("x-precedence", prec);
		if (Foxtrick.util.layout.isStandard(doc)) {
			// boxHead
			var boxHead = doc.createElement("div");
			boxHead.className = "boxHead";
			dest.appendChild(boxHead);
			// boxHead - boxLeft
			var headBoxLeft = doc.createElement("div");
			headBoxLeft.className = "boxLeft";
			boxHead.appendChild(headBoxLeft);
			// boxHead - boxLeft - h2
			var h2 = doc.createElement("h2");
			h2.textContent = title;
			headBoxLeft.appendChild(h2);
			// boxBody
			var boxBody = doc.createElement("div");
			boxBody.className = "boxBody";
			dest.appendChild(boxBody);
			// append content to boxBody
			boxBody.appendChild(content);
			// boxFooter
			var boxFooter = doc.createElement("div");
			boxFooter.className = "boxFooter";
			dest.appendChild(boxFooter);
			// boxFooter - boxLeft
			var footBoxLeft = doc.createElement("div");
			footBoxLeft.className = "boxLeft";
			boxFooter.appendChild(footBoxLeft);
		}
		else {
			// header
			var header = doc.createElement("h2");
			header.textContent = title;
			dest.appendChild(header);
		}
		// now we insert the newly created box
		var inserted = false;
		for (var i = 0; i < existings.length; ++i) {
			// precedence of current box, hattrick boxes are set to 0
			var curPrec = existings[i].hasAttribute("x-precedence")
				? Number(existings[i].getAttribute("x-precedence"))
				: 0;
			if (curPrec > prec) {
				if (i == 0 && curPrec == 0 )
					// first to be added and placed before HT boxes. add it on top before possible updatepanel div (eg teampage challenge and mailto)
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
	if (Foxtrick.util.layout.isStandard(doc))
		dest.getElementsByClassName("boxBody")[0].appendChild(content);
	else
		dest.appendChild(content);

	return dest;
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

Foxtrick.addImage = function (doc, elem, features, insertBefore) {
	if ((Foxtrick.platform == 'Opera') && features.src.indexOf('content/resources') == 0) {
		// Get the image resource
		var imgFile = opera.extension.getFile('/' + features.src);

		if (imgFile) {
		// Read out the File object as a Data URI
			var fr = new FileReader();
			fr.onload = function() {
				var img = doc.createElement('img');
				img.src = fr.result;
				for (var i in features) {
					if (features.hasOwnProperty(i) && i != 'src') {
						img.setAttribute(i, features[i]);
					}
				}
				if (insertBefore)
					elem.insertBefore(img, insertBefore);
				else
					elem.appendChild(img);
			};
			fr.readAsDataURL(imgFile);
		}
		//sandboxed.extension.sendRequest({ req: 'getDataUrl', url: features.src },
		//  function(data) {
		//	var img = doc.createElement('img');
		//	for (i in features) {
		//		if (i != 'src') // that one we set bellow. prevents csp warning
		//			img.setAttribute(i, features[i]);
		//	}
		//	img.src = data.url;
		//	if (insertBefore)
		//		elem.insertBefore(img, insertBefore);
		//	else
		//		elem.appendChild(img);
		//});
	}
	else {
		var img = doc.createElement('img');
		for (var i in features)
			img.setAttribute(i, features[i]);
		if (insertBefore)
			elem.insertBefore( img, insertBefore);
		else
			elem.appendChild( img );
	}
};

Foxtrick.getImageFeatures = function(features, callback) {
	if (Foxtrick.platform == 'Opera')
		sandboxed.extension.sendRequest({ req: 'getDataUrl', url: features.src },
		  function(data) {
			var img = {};
			for (var i in features) img[i] = features[i];
			img.src = data.url;
			try {
				callback(img);
			}
			catch (e) {
				Foxtrick.log('Error in callback for getImageFeatures', features, img, e);
			}
		});
	else {
		var img = {};
		for (var i in features) img[i] = features[i];
		callback(img);
	}
};
