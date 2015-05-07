'use strict';
/**
 * links-box.js
 * Utilities for adding link-boxes
 * @author convinced, LA-MJ
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.links = {
	add: function(ownBoxBody, customLinkSet, info, hasNewSidebar) {
		try {
			var doc = ownBoxBody.ownerDocument;

			// save info for reuse
			ownBoxBody.setAttribute('data-link-info', JSON.stringify(info));

			var expanded = false;
			var headerClick = function(ev) {
				var doc = ev.target.ownerDocument;

				try {
					expanded = !expanded;

					// remove old
					var editbox = doc.getElementById('ft-edit-links');
					if (editbox)
						editbox.parentNode.removeChild(editbox);

					var links = Foxtrick.util.links.getCustomLinks(customLinkSet);
					Foxtrick.forEach(function(link) {
						var key = link.key;
						var mylink = doc.getElementById('ft-custom-link-' + key);
						if (mylink) {
							mylink.parentNode.removeChild(mylink);
						}
					}, links);

					if (expanded) {
						Foxtrick.util.links.showEdit(doc, ownBoxBody, customLinkSet);
					}
					else {
						Foxtrick.util.links.showLinks(doc, ownBoxBody, customLinkSet);
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}
			};

			Foxtrick.stopListenToChange(doc);

			var boxHeader = Foxtrick.L10n.getString('links.boxheader');
			var customLinkTitle = Foxtrick.L10n.getString('links.custom.addpersonallink');
			var removeTitle = Foxtrick.L10n.getString('links.custom.remove');

			var sidebarCls = hasNewSidebar ? 'div.ft-newSidebarBox' : 'div.sidebarBox';
			var headerTag = hasNewSidebar ? 'h4' : 'h2';
			var allDivs = doc.querySelectorAll(sidebarCls);
			Foxtrick.any(function(sidebar) {
				var header = sidebar.querySelector(headerTag);
				if (header.textContent == boxHeader) {
					var hh = header.cloneNode(true);
					var div = doc.createElement('div');
					div.appendChild(hh);
					div.title = customLinkTitle;
					Foxtrick.onClick(div, headerClick);

					var pn = header.parentNode;
					pn.replaceChild(div, header);
					return true;
				}
				return false;
			}, allDivs);

			var all_links = ownBoxBody.getElementsByTagName('a');
			Foxtrick.forEach(function(link) {
				var linkContainer = doc.createElement('span');
				Foxtrick.addClass(linkContainer, 'ft-link-span');
				linkContainer.appendChild(link);
				var key = link.getAttribute('key');
				var module = link.getAttribute('module');
				if (key && module) {
					var delLink = doc.createElement('span');
					delLink.className = 'ft_actionicon foxtrickRemove';
					delLink.title = removeTitle;
					Foxtrick.onClick(delLink, Foxtrick.util.links.delStdLink);

					var img = doc.createElement('img');
					delLink.appendChild(img);
					linkContainer.appendChild(delLink);
				}
				ownBoxBody.appendChild(linkContainer);
			}, all_links);

			Foxtrick.util.links.showLinks(doc, ownBoxBody, customLinkSet);

			Foxtrick.startListenToChange(doc);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	showLinks: function(doc, ownBoxBody, linkSet) {
		try {
			var ownBoxId = 'ft-links-box';
			var div = doc.getElementById(ownBoxId).firstChild;
			Foxtrick.removeClass(div, 'ft-expander-unexpanded');
			Foxtrick.addClass(div, 'ft-expander-expanded');

			var foxtrickRemove = ownBoxBody.getElementsByClassName('foxtrickRemove');
			for (var i = 0; i < foxtrickRemove.length; ++i) {
				Foxtrick.toggleClass(foxtrickRemove[i], 'hidden');
			}

			var args = JSON.parse(ownBoxBody.getAttribute('data-link-info'));

			var links = Foxtrick.util.links.getCustomLinks(linkSet);
			Foxtrick.forEach(function(link) {
				// replace tags
				var url = Foxtrick.util.links.makeUrl(link.url, args);
				var title = link.title;
				var imgref = link.img;
				var key = link.key;

				var a = doc.createElement('a');
				a.id = 'ft-custom-link-' + key;
				a.className = 'inner';
				a.title = title;
				a.href = url;
				a.target = '_blank';

				var img = doc.createElement('img');
				img.alt = title;
				img.className = 'ft-link-icon';
				// undefined is a string here: comes from prefs
				if (imgref && imgref !== 'null' && imgref !== 'undefined')
					img.src = imgref;

				a.appendChild(img);
				ownBoxBody.appendChild(a);
			}, links);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	showEdit: function(doc , ownBoxBody, linkSet) {
		try {
			// box
			var ownBoxId = 'ft-links-box';
			var expander = doc.getElementById(ownBoxId).firstChild;
			Foxtrick.removeClass(expander, 'ft-expander-expanded');
			Foxtrick.addClass(expander, 'ft-expander-unexpanded');

			var foxtrickRemove = ownBoxBody.getElementsByClassName('foxtrickRemove');
			for (var i = 0; i < foxtrickRemove.length; ++i) {
				Foxtrick.toggleClass(foxtrickRemove[i], 'hidden');
			}

			var divED = doc.createElement('div');
			divED.id = 'ft-edit-links';
			divED.className = 'ft-note';

			var customLinkTable = doc.createElement('table');
			customLinkTable.id = 'ft-custom-links-table';
			var tr0 = doc.createElement('tr');
			var th = doc.createElement('th');
			th.textContent = Foxtrick.L10n.getString('links.custom.addpersonallink');
			th.colSpan = 4;
			tr0.appendChild(th);
			customLinkTable.appendChild(tr0);

			var links = Foxtrick.util.links.getCustomLinks(linkSet);
			Foxtrick.forEach(function(link) {
				Foxtrick.util.links.addLinkRow(customLinkTable, link);
			}, links);

			divED.appendChild(customLinkTable);

			// image preview
			var imgDiv = doc.createElement('div');
			imgDiv.id = 'ft-link-img-preview';
			imgDiv.className = 'ft_icon foxtrickBrowse inner';
			var img = doc.createElement('img');
			imgDiv.appendChild(img);

			var selectLabel = doc.createElement('span');
			selectLabel.textContent = ' ' + Foxtrick.L10n.getString('links.custom.selecticon');

			divED.appendChild(imgDiv);
			divED.appendChild(selectLabel);

			// image upload
			var inputDiv = doc.createElement('div');
			inputDiv.id = 'ft-link-img-input';
			divED.appendChild(inputDiv);
			Foxtrick.util.links.addImageLoader(doc, inputDiv);

			var newLinkTable = doc.createElement('table');
			newLinkTable.id = 'ft-new-link-table';

			// title edit field
			var inputTitleText = Foxtrick.L10n.getString('links.custom.title');
			var inputTitle = doc.createElement('input');
			inputTitle.id = 'ft-link-title-input';
			inputTitle.value = inputTitleText;
			Foxtrick.listen(inputTitle, 'focus', function(ev) {
				if (ev.target.value == inputTitleText)
					ev.target.value = '';
			});
			inputTitle.type = 'text';
			inputTitle.maxLength = 100;
			var trn4 = doc.createElement('tr');
			var tdn4 = doc.createElement('td');
			tdn4.colSpan = 2;
			tdn4.appendChild(inputTitle);
			trn4.appendChild(tdn4);
			newLinkTable.appendChild(trn4);

			// href edit field
			var inputHrefUrl = Foxtrick.L10n.getString('links.custom.exampleUrl');
			var inputHref = doc.createElement('input');
			inputHref.id = 'ft-link-url-input';
			inputHref.value = inputHrefUrl;
			Foxtrick.listen(inputHref, 'focus', function() {
				if (this.value == inputHrefUrl)
					this.value = 'http://';
			});
			inputHref.type = 'text';
			inputHref.maxLength = 5000;
			inputHref.className = 'inner';
			var trn3 = doc.createElement('tr');
			var tdn3 = doc.createElement('td');
			tdn3.colSpan = 2;
			tdn3.appendChild(inputHref);
			trn3.appendChild(tdn3);
			newLinkTable.appendChild(trn3);

			// tag select list
			var selectbox = doc.createElement('select');
			selectbox.title = Foxtrick.L10n.getString('links.custom.addtag');
			selectbox.id = 'ft-link-tag-selector';
			Foxtrick.listen(selectbox, 'change', Foxtrick.util.links.useTag);

			var titleOption = doc.createElement('option');
			titleOption.value = '';
			titleOption.textContent = Foxtrick.L10n.getString('links.custom.tags');
			selectbox.appendChild(titleOption);

			var args = JSON.parse(ownBoxBody.getAttribute('data-link-info'));
			for (var key in args) {
				var tag = doc.createElement('option');
				tag.value = key;
				tag.textContent = '[' + key + ']';
				selectbox.appendChild(tag);
			}

			var tdn2 = doc.createElement('td');
			tdn2.colSpan = 2;
			tdn2.appendChild(selectbox);
			var trn2 = doc.createElement('tr');
			trn2.appendChild(tdn2);
			newLinkTable.appendChild(trn2);

			// save link
			var saveLink = doc.createElement('a');
			Foxtrick.addClass(saveLink, 'ft-link');
			saveLink.setAttribute('data-set', linkSet);
			saveLink.textContent = Foxtrick.L10n.getString('links.custom.addlink');
			Foxtrick.onClick(saveLink, Foxtrick.util.links.saveMyLink);

			var tdn5 = doc.createElement('td');
			tdn5.appendChild(saveLink);

			// help link
			var helpText = Foxtrick.L10n.getString('links.custom.helptext');
			var helplink = doc.createElement('a');
			helplink.className = 'ft_actionicon foxtrickHelp float_right ft_link';
			helplink.title = Foxtrick.L10n.getString('links.custom.help');
			Foxtrick.onClick(helplink, function() {
				Foxtrick.alert(helpText);
			});

			var tdn5b = doc.createElement('td');
			tdn5b.appendChild(helplink);
			var trn5 = doc.createElement('tr');
			trn5.appendChild(tdn5);
			trn5.appendChild(tdn5b);
			newLinkTable.appendChild(trn5);

			divED.appendChild(newLinkTable);

			ownBoxBody.appendChild(divED);

		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	delStdLink: function() {
		try {
			var link = this.previousElementSibling;
			var key = link.getAttribute('key');
			var module = link.getAttribute('module');
			Foxtrick.Prefs.setModuleEnableState(module + '.' + key, false);
			var linkSpan = this.parentNode;
			linkSpan.parentNode.removeChild(linkSpan);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	delMyLink: function() {
		try {
			var doc = this.ownerDocument;
			var confirmMsg = Foxtrick.L10n.getString('links.custom.confirmremove');
			var confirm = Foxtrick.confirmDialog(confirmMsg);
			if (!confirm)
				return;

			var fullKey = this.getAttribute('data-full-key');
			Foxtrick.Prefs.deleteValue(fullKey + '.href');
			Foxtrick.Prefs.deleteValue(fullKey + '.title');
			Foxtrick.Prefs.deleteValue(fullKey + '.img');

			var key = this.getAttribute('data-key');
			var row = doc.getElementById('ft-link-row-' + key);
			row.parentNode.removeChild(row);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	copyOldLink: function() {
		try {
			var doc = this.ownerDocument;
			var fullKey = this.getAttribute('data-full-key');
			doc.getElementById('ft-link-url-input').value =
				Foxtrick.Prefs.getString(fullKey + '.href');
			doc.getElementById('ft-link-title-input').value =
				Foxtrick.Prefs.getString(fullKey + '.title');
			var img = doc.getElementById('ft-link-img-preview');
			var imgref = Foxtrick.Prefs.getString(fullKey + '.img');
			if (imgref && imgref !== 'null' && imgref !== 'undefined') {
				img.style.backgroundImage = 'url("' + imgref + '")';
				img.setAttribute('data-img', imgref);
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	saveMyLink: function() {
		try {
			var doc = this.ownerDocument;
			var uniquekey = Math.random().toString(16).slice(2);

			var linkSet = this.getAttribute('data-set');
			var basePref = Foxtrick.util.links.getBasePref(linkSet);
			var fullKey = basePref + '.' + uniquekey;

			var href = doc.getElementById('ft-link-url-input').value;
			var title = doc.getElementById('ft-link-title-input').value;
			var inputImg = doc.getElementById('ft-link-img-preview');
			var imgref = inputImg.getAttribute('data-img');

			Foxtrick.Prefs.setString(fullKey + '.href', href);
			Foxtrick.Prefs.setString(fullKey + '.title', title);
			Foxtrick.Prefs.setString(fullKey + '.img', imgref);

			var link = {
				url: href,
				title: title,
				img: imgref,
				set: linkSet,
				key: uniquekey,
				fullKey: fullKey,
			};

			var table = doc.getElementById('ft-custom-links-table');
			Foxtrick.util.links.addLinkRow(table, link);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	makeDelLink: function(doc, link) {
		try {
			var delLink = doc.createElement('div');
			delLink.className = 'ft_actionicon foxtrickRemove';
			delLink.title = Foxtrick.L10n.getString('links.custom.remove');
			delLink.setAttribute('data-full-key', link.fullKey);
			delLink.setAttribute('data-key', link.key);
			Foxtrick.onClick(delLink, Foxtrick.util.links.delMyLink);
			return delLink;
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},

	makeCopyLink: function(doc, link) {
		try {
			var editOld = doc.createElement('div');
			editOld.className = 'ft_actionicon foxtrickCopy float_right';
			editOld.setAttribute('data-full-key', link.fullKey);
			editOld.title = Foxtrick.L10n.getString('links.custom.copy');
			Foxtrick.onClick(editOld, Foxtrick.util.links.copyOldLink);
			return editOld;
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},

	addImageLoader: function(doc, divED) {
		var handleUrl = function(url) {
			// if (url.length > 5000) {
			// 	Foxtrick.alert('Image too large.');
			// 	return;
			// }
			var div = doc.getElementById('ft-link-img-preview');
			div.setAttribute('data-img', url);
			div.style.backgroundImage = 'url("' + url + '")';
		};
		var form = Foxtrick.util.load.filePickerForDataUrl(doc, handleUrl);
		divED.appendChild(form);
	},

	useTag: function() {
		try {

			if (!this.value)
				return;

			var doc = this.ownerDocument;
			var urlInput = doc.getElementById('ft-link-url-input');
			var value = urlInput.value;
			if (!/\?/.test(value))
				value += '?';
			else
				value += '&';

			value += this.value + '=[' + this.value + ']';
			urlInput.value = value;
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}
};

Foxtrick.util.links.getBasePref = function(linkSet) {
	return 'module.LinksCustom.' + linkSet;
};

Foxtrick.util.links.makeUrl = function(url, args) {
	for (var i in args) {
		url = url.replace(new RegExp('\\[' + i + '\\]', 'ig'), args[i]);
	}
	return url;
};

Foxtrick.util.links.addLinkRow = function(table, link) {
	var doc = table.ownerDocument;
	var imgref = link.img;
	var title = link.title;
	var url = link.url;

	var img = doc.createElement('img');
	img.alt = title;
	img.className = 'ft-links-custom-icon-edit';
	if (imgref && imgref !== 'null' && imgref !== 'undefined')
		img.src = imgref;

	var a = doc.createElement('a');
	a.title = title;
	a.href = url;
	a.target = '_blank';
	a.appendChild(img);

	var tr1 = doc.createElement('tr');
	tr1.id = 'ft-link-row-' + link.key;
	var td1 = doc.createElement('td');
	var td2 = doc.createElement('td');
	var td3 = doc.createElement('td');
	var td4 = doc.createElement('td');

	td1.appendChild(a);
	td2.textContent = title.slice(0, 10);
	td3.appendChild(Foxtrick.util.links.makeCopyLink(doc, link));
	td4.appendChild(Foxtrick.util.links.makeDelLink(doc, link));

	Foxtrick.appendChildren(tr1, [td1, td2, td3, td4]);
	table.appendChild(tr1);
};

Foxtrick.util.links.getCustomLinks = function(linkSet) {
	// format: module.LinksCustom.<module>.<random>.<title|href|img>
	var basePref = this.getBasePref(linkSet);
	var prefs = Foxtrick.Prefs.getAllKeysOfBranch(basePref);
	var keys = {};
	Foxtrick.forEach(function(key) {
		key = key.replace(basePref + '.', '');
		if (/\./.test(key)) {
			key = key.replace(/\..+/, '');
			keys[key] = key;
		}
	}, prefs);

	var links = [];
	for (var key in keys) {
		var fullKey = basePref + '.' + key;
		var href = Foxtrick.Prefs.getString(fullKey + '.href');
		var img = Foxtrick.Prefs.getString(fullKey + '.img');
		var title = Foxtrick.Prefs.getString(fullKey + '.title');

		if (!href || !title)
			continue;

		var link = {
			url: href,
			title: title,
			img: img,
			set: linkSet,
			key: key,
			fullKey: fullKey,
		};
		links.push(link);
	}
	return links;
};

Foxtrick.util.links.run = function(doc, module) {
	var HEADER = Foxtrick.L10n.getString('links.boxheader');
	var LINK_CLASS = 'inner';
	var BOX_ID = 'foxtrick_links_content';

	var ownInfo = {
		server: doc.location.hostname,
		lang: Foxtrick.Prefs.getString('htLanguage')
	};

	var ownTeam = Foxtrick.modules.Core.TEAM;
	for (var key in ownTeam) {
		ownInfo['own' + key] = ownTeam[key];
	}

	var run = function() {
		var o = module.links(doc);
		if (!o)
			return;

		var output = o.info || {};
		Foxtrick.mergeAll(output, ownInfo);

		var info = {};
		for (var key in output) {
			// convert all tags to lower case
			info[key.toLowerCase()] = output[key];
		}

		var box = Foxtrick.createFeaturedElement(doc, module, 'div');
		box.id = BOX_ID;

		if (!o.types) {
			// default link types
			if (module.LINK_TYPES)
				o.types = module.LINK_TYPES;
			else
				o.types = [module.LINK_TYPE];
		}
		Foxtrick.forEach(function(type) {
			var opts = {
				module: module.MODULE_NAME,
				className: LINK_CLASS,
				type: type,
				parent: box,
				info: info,
			};

			if (typeof type !== 'string') {
				Foxtrick.mergeValid(opts, type);
			}
			var anchors = Foxtrick.modules['Links'].getLinks(doc, opts);
			Foxtrick.appendChildren(opts.parent, anchors);
		}, o.types);

		var adder = o.hasNewSidebar ? Foxtrick.Pages.Match : Foxtrick;
		var wrapper = adder.addBoxToSidebar(doc, HEADER, box, -20);
		wrapper.id = 'ft-links-box';

		var customLinkSet = o.customLinkSet || module.MODULE_NAME;
		Foxtrick.util.links.add(box, customLinkSet, info, o.hasNewSidebar);

	};

	Foxtrick.modules['Links'].getCollection(run);
};

Foxtrick.util.links.getPrefs = function(doc, module, cb) {
	var types = module.LINK_TYPES || [module.LINK_TYPE];
	var mName = module.MODULE_NAME;
	var parseCollection = function(collection) {
		if (!collection)
			return;

		var hasOpts = false;
		var generateOpts = function(type) {
			try {
				if (collection[type]) {
					var links = collection[type];
					for (var key in links) {
						var link = links[key];
						var item = doc.createElement('li');
						list.appendChild(item);

						var label = doc.createElement('label');
						item.appendChild(label);

						var check = doc.createElement('input');
						check.type = 'checkbox';
						check.setAttribute('module', mName);
						check.setAttribute('option', key);

						// since this is appended asynchronously, we set
						// the checked attribute manually
						if (Foxtrick.Prefs.isModuleOptionEnabled(mName, key) ||
						    !Foxtrick.Prefs.isModuleOptionSet(mName, key)) {
							check.setAttribute('checked', 'checked');
							var pref = mName + '.' + key;
							Foxtrick.Prefs.setModuleEnableState(pref, true);
							hasOpts = true;
						}
						label.appendChild(check);
						label.appendChild(doc.createTextNode(link.title));
					}
				}
				if (hasOpts && Foxtrick.Prefs.isModuleEnabled(mName) === null) {
					var moduleCheck = doc.getElementById('pref-' + mName + '-check');
					moduleCheck.setAttribute('checked', 'checked');
					var moduleOpts = doc.getElementById('pref-' + mName + '-options');
					moduleOpts.setAttribute('style', '');
					Foxtrick.Prefs.setModuleEnableState(mName, true);
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		Foxtrick.map(generateOpts, types);

		if (typeof cb === 'function') {
			try {
				cb();
			}
			catch (e) {
				Foxtrick.log('Error in callback for getPrefs', e);
			}
		}
	};

	var list = doc.createElement('ul');
	Foxtrick.modules['Links'].getCollection(parseCollection);
	return list;
};
