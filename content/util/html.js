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

Foxtrick.listen = function(target, type, listener, useCapture) {
	target.addEventListener(
		type,
		function(ev) {
			var doc = ev.target.ownerDocument;
			Foxtrick.stopListenToChange(doc);
			listener(ev);
			Foxtrick.startListenToChange(doc);
		},
		useCapture
	);
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
			h2.innerHTML = title;
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
			header.innerHTML = title;
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

Foxtrick.addImage = function (doc, elem, features) {
	if (Foxtrick.platform == "Opera") {
		sandboxed.extension.sendRequest({ req : "getDataUrl", url:features.src},
			function (data) {
				var img = doc.createElement("img");
				for (i in features) 
					img.setAttribute(i, features[i]);
				img.src = data.url;
				elem.appendChild(img);
		});
	}
	else {
		var img = doc.createElement("img");
		for (i in features)  
			img.setAttribute(i, features[i]);
		elem.appendChild(img);
	}
};

Foxtrick.getImageFeatures = function (features, callback) {
	if (Foxtrick.platform == "Opera")
		sandboxed.extension.sendRequest({ req : "getDataUrl", url:features.src},
			function (data) {
				var img = {};
				for (i in features) img[i] = features[i];
				img.src = data.url;
				callback(img);
		});
	else {
		var img = {};
		for (i in features) img[i] = features[i];
		callback(img);
	}
};
