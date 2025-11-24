/**
 * links-box.js
 * Utilities for adding link-boxes
 * @author convinced, LA-MJ
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

if (!Foxtrick.util)
	Foxtrick.util = {};

if (!Foxtrick.util.links)
	Foxtrick.util.links = {};

/**
 * @param {HTMLElement} ownBoxBody
 * @param {string}      customLinkSet
 * @param {LinkArgs}    info
 * @param {boolean}     hasNewSidebar
 */
Foxtrick.util.links.add = function(ownBoxBody, customLinkSet, info, hasNewSidebar) {
	try {
		var doc = ownBoxBody.ownerDocument;

		// save info for reuse
		ownBoxBody.dataset.linkInfo = JSON.stringify(info);

		var expanded = false;

		/** @type {Listener<HTMLElement, MouseEvent>} */
		var headerClick = function() {
			// eslint-disable-next-line no-invalid-this
			let doc = this.ownerDocument;

			try {
				expanded = !expanded;

				// remove old
				let editbox = doc.getElementById('ft-edit-links');
				if (editbox)
					editbox.remove();

				let links = Foxtrick.util.links.getCustomLinks(customLinkSet);
				Foxtrick.forEach(function(link) {
					let key = link.key;
					let mylink = doc.getElementById('ft-custom-link-' + key);
					if (mylink)
						mylink.remove();

				}, links);

				if (expanded)
					Foxtrick.util.links.showEdit(doc, ownBoxBody, customLinkSet);
				else
					Foxtrick.util.links.showLinks(doc, ownBoxBody, customLinkSet);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		Foxtrick.stopObserver(doc);

		const l10nBoxHeader = Foxtrick.L10n.getString('links.boxheader');
		const l10nCustomLinkTitle = Foxtrick.L10n.getString('links.custom.addpersonallink');
		const l10nRemoveTitle = Foxtrick.L10n.getString('links.custom.remove');

		let sidebarCls = hasNewSidebar ? 'div.ft-newSidebarBox' : 'div.sidebarBox';
		let headerTag = hasNewSidebar ? 'h4' : 'h2';
		let allDivs = doc.querySelectorAll(sidebarCls);
		Foxtrick.any(function(sidebar) {
			let header = sidebar.querySelector(headerTag);
			if (header.textContent != l10nBoxHeader)
				return false;

			let hh = Foxtrick.cloneElement(header, true);
			let div = doc.createElement('div');
			div.appendChild(hh);
			div.setAttribute('aria-label', div.title = l10nCustomLinkTitle);

			Foxtrick.onClick(div, headerClick);

			let pn = header.parentNode;
			pn.replaceChild(div, header);
			return true;
		}, allDivs);

		let allLinks = ownBoxBody.querySelectorAll('a');
		let containers = Foxtrick.map(function(link) {
			let linkContainer = doc.createElement('span');
			Foxtrick.addClass(linkContainer, 'ft-link-span');
			linkContainer.appendChild(link);

			let key = link.dataset.key;
			let moduleName = link.dataset.module;

			if (key && moduleName) {
				let delLink = doc.createElement('span');
				delLink.className = 'ft_actionicon foxtrickRemove';
				delLink.setAttribute('aria-label', delLink.title = l10nRemoveTitle);
				Foxtrick.onClick(delLink, Foxtrick.util.links.delStdLink);

				let img = doc.createElement('img');
				delLink.appendChild(img);
				linkContainer.appendChild(delLink);
			}

			return linkContainer;
		}, allLinks);

		Foxtrick.append(ownBoxBody, containers);

		Foxtrick.util.links.showLinks(doc, ownBoxBody, customLinkSet);

		Foxtrick.startObserver(doc);
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

/**
 * @param {document}    doc
 * @param {HTMLElement} ownBoxBody
 * @param {string}      linkSet
 */
Foxtrick.util.links.showLinks = function(doc, ownBoxBody, linkSet) {
	try {
		let ownBoxId = 'ft-links-box';
		let box = doc.getElementById(ownBoxId);
		if (!box)
			return;

		let div = box.firstElementChild;
		Foxtrick.removeClass(div, 'ft-expander-unexpanded');
		Foxtrick.addClass(div, 'ft-expander-expanded');

		let delLinks = ownBoxBody.querySelectorAll('.foxtrickRemove');
		for (let delLink of delLinks)
			Foxtrick.toggleClass(delLink, 'hidden');

		/** @type {LinkArgs} */
		let args = JSON.parse(ownBoxBody.dataset.linkInfo);

		let links = Foxtrick.util.links.getCustomLinks(linkSet);
		let anchors = Foxtrick.map(function(link) {
			if (!link)
				Foxtrick.log(new Error(`link is ${link}`));

			// replace tags
			let url = Foxtrick.util.links.makeUrl(link.url, args);
			let { title, imgSrc, key } = link;

			let a = doc.createElement('a');
			a.id = 'ft-custom-link-' + key;
			a.className = 'inner';
			a.title = title;
			a.href = url;
			a.target = '_blank';
			a.rel = 'noopener';

			let icon = doc.createElement('img');
			icon.alt = title;
			icon.className = 'ft-link-icon';

			// undefined is a string here: comes from prefs
			if (imgSrc && imgSrc !== 'null' && imgSrc !== 'undefined')
				icon.src = imgSrc;

			a.appendChild(icon);

			return a;
		}, links);

		Foxtrick.append(ownBoxBody, anchors);
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

/**
 * @param {document}    doc
 * @param {HTMLElement} ownBoxBody
 * @param {string}      linkSet
 */
Foxtrick.util.links.showEdit = function(doc, ownBoxBody, linkSet) {
	// TODO convert into a class
	try {
		{
			// box
			let ownBoxId = 'ft-links-box';
			let expander = doc.getElementById(ownBoxId).firstElementChild;
			Foxtrick.removeClass(expander, 'ft-expander-expanded');
			Foxtrick.addClass(expander, 'ft-expander-unexpanded');

			let delLinks = ownBoxBody.querySelectorAll('.foxtrickRemove');
			for (let delLink of delLinks)
				Foxtrick.toggleClass(delLink, 'hidden');
		}

		var editDiv = doc.createElement('div');
		editDiv.id = 'ft-edit-links';
		editDiv.className = 'ft-note';

		var newLinkTable = doc.createElement('table');
		newLinkTable.id = 'ft-new-link-table';
		editDiv.appendChild(newLinkTable);
		ownBoxBody.appendChild(editDiv);

		{
			let customLinkTable = doc.createElement('table');
			customLinkTable.id = 'ft-custom-links-table';

			let tr = doc.createElement('tr');
			let th = doc.createElement('th');
			th.textContent = Foxtrick.L10n.getString('links.custom.addpersonallink');
			th.colSpan = 4;
			tr.appendChild(th);
			customLinkTable.appendChild(tr);

			let links = Foxtrick.util.links.getCustomLinks(linkSet);
			let rows = Foxtrick.map(function(link) {
				return Foxtrick.util.links.createLinkRow(doc, link);
			}, links);

			Foxtrick.append(customLinkTable, rows);

			editDiv.appendChild(customLinkTable);
		}

		{
			// image preview
			let selectLabel = doc.createElement('label');
			selectLabel.textContent = ' ' + Foxtrick.L10n.getString('links.custom.selecticon');
			selectLabel.htmlFor = 'ft-link-img-preview';
			editDiv.appendChild(selectLabel);

			let imgPre = {
				id: 'ft-link-img-preview',
				src: Foxtrick.InternalPath + 'resources/img/browse.png',
			};
			Foxtrick.addImage(doc, editDiv, imgPre, selectLabel);
		}

		{
			// image upload
			let inputDiv = doc.createElement('div');
			inputDiv.id = 'ft-link-img-input';
			let input = Foxtrick.util.links.createImageLoader(doc);
			inputDiv.appendChild(input);
			editDiv.appendChild(inputDiv);
		}

		{
			// title edit field
			let placeholder = Foxtrick.L10n.getString('links.custom.title');
			let inputTitle = doc.createElement('input');
			inputTitle.id = 'ft-link-title-input';
			inputTitle.placeholder = placeholder;
			inputTitle.type = 'text';
			inputTitle.maxLength = 100;
			inputTitle.className = 'ft-expand';

			let trn4 = doc.createElement('tr');
			let tdn4 = doc.createElement('td');
			tdn4.colSpan = 2;
			tdn4.appendChild(inputTitle);
			trn4.appendChild(tdn4);
			newLinkTable.appendChild(trn4);
		}

		{
			// href edit field
			let inputHrefUrl = Foxtrick.L10n.getString('links.custom.exampleUrl');
			let inputHref = doc.createElement('input');
			inputHref.id = 'ft-link-url-input';
			inputHref.placeholder = inputHrefUrl;
			inputHref.type = 'text';
			inputHref.maxLength = 5000;
			inputHref.className = 'inner ft-expand';
			let trn3 = doc.createElement('tr');
			let tdn3 = doc.createElement('td');
			tdn3.colSpan = 2;
			tdn3.appendChild(inputHref);
			trn3.appendChild(tdn3);
			newLinkTable.appendChild(trn3);
		}

		{
			// tag select list
			let selectbox = doc.createElement('select');
			selectbox.title = Foxtrick.L10n.getString('links.custom.addtag');
			selectbox.id = 'ft-link-tag-selector';
			Foxtrick.listen(selectbox, 'change', Foxtrick.util.links.useTag);

			let titleOption = doc.createElement('option');
			titleOption.value = '';
			titleOption.textContent = Foxtrick.L10n.getString('links.custom.tags');
			selectbox.appendChild(titleOption);

			let args = JSON.parse(ownBoxBody.dataset.linkInfo);
			let opts = Object.keys(args).map((key) => {
				let tag = doc.createElement('option');
				tag.value = key;
				tag.textContent = '[' + key + ']';
				return tag;
			});
			Foxtrick.append(selectbox, opts);

			let tdn2 = doc.createElement('td');
			tdn2.colSpan = 2;
			tdn2.appendChild(selectbox);
			let trn2 = doc.createElement('tr');
			trn2.appendChild(tdn2);
			newLinkTable.appendChild(trn2);
		}

		{
			let trn5 = doc.createElement('tr');
			newLinkTable.appendChild(trn5);

			{
				// save link
				let tdn5 = doc.createElement('td');
				let saveLink = doc.createElement('a');
				Foxtrick.addClass(saveLink, 'ft-link');
				saveLink.dataset.set = linkSet;
				saveLink.textContent = Foxtrick.L10n.getString('links.custom.addlink');
				Foxtrick.onClick(saveLink, Foxtrick.util.links.saveMyLink);

				tdn5.appendChild(saveLink);
				trn5.appendChild(tdn5);
			}

			{
				// help link
				let helpText = Foxtrick.L10n.getString('links.custom.helptext');
				let helplink = doc.createElement('a');
				helplink.className = 'ft_actionicon foxtrickHelp float_right ft_link';
				helplink.title = Foxtrick.L10n.getString('links.custom.help');

				Foxtrick.onClick(helplink, function() {
					Foxtrick.util.note.add(doc, helpText);
				});

				let tdn5b = doc.createElement('td');
				tdn5b.appendChild(helplink);
				trn5.appendChild(tdn5b);
			}
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

/**
 * @type {Listener<HTMLElement, MouseEvent>}
 */
Foxtrick.util.links.delStdLink = function() {
	try {
		let link = this.previousElementSibling;
		let key = link.getAttribute('key');
		let moduleName = link.getAttribute('module');
		Foxtrick.Prefs.setModuleEnableState(moduleName + '.' + key, false);
		let linkSpan = this.parentElement;
		linkSpan.remove();
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

/**
 * @type {Listener<HTMLElement, MouseEvent>}
 */
Foxtrick.util.links.delMyLink = function() {
	try {
		let doc = this.ownerDocument;
		let confirmMsg = Foxtrick.L10n.getString('links.custom.confirmremove');

		// FIXME
		let confirm = Foxtrick.confirmDialog(confirmMsg);
		if (!confirm)
			return;

		let fullKey = this.dataset.fullKey;

		Foxtrick.Prefs.deleteValue(fullKey + '.href');
		Foxtrick.Prefs.deleteValue(fullKey + '.title');
		Foxtrick.Prefs.deleteValue(fullKey + '.img');

		let key = this.dataset.key;
		let row = doc.getElementById('ft-link-row-' + key);
		row.remove();
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

/**
 * @type {Listener<HTMLElement, MouseEvent>}
 */
Foxtrick.util.links.copyOldLink = function() {
	try {
		let doc = this.ownerDocument;
		let fullKey = this.dataset.fullKey;

		/** @type {HTMLInputElement[]} */
		let [urlInput, titleInput] = [
			doc.querySelector('#ft-link-url-input'),
			doc.querySelector('#ft-link-title-input'),
		];

		urlInput.value = Foxtrick.Prefs.getString(fullKey + '.href');
		titleInput.value = Foxtrick.Prefs.getString(fullKey + '.title');

		/** @type {HTMLImageElement} */
		let preview = doc.querySelector('#ft-link-img-preview');

		let imgSrc = Foxtrick.Prefs.getString(fullKey + '.img');
		if (imgSrc && imgSrc !== 'null' && imgSrc !== 'undefined')
			preview.src = imgSrc;

	}
	catch (e) {
		Foxtrick.log(e);
	}
};

/** @type {Listener<HTMLAnchorElement, MouseEvent>} */
Foxtrick.util.links.saveMyLink = function() {
	try {
		let doc = this.ownerDocument;
		let key = Math.random().toString(16).slice(2);

		let linkSet = this.dataset.set;
		let basePref = Foxtrick.util.links.getBasePref(linkSet);
		let fullKey = basePref + '.' + key;

		/** @type {HTMLInputElement[]} */
		let [urlInput, titleInput] = [
			doc.querySelector('#ft-link-url-input'),
			doc.querySelector('#ft-link-title-input'),
		];

		let url = urlInput.value;
		let title = titleInput.value;

		/** @type {HTMLImageElement} */
		let inputImg = doc.querySelector('#ft-link-img-preview');
		let imgSrc = inputImg.src;

		Foxtrick.Prefs.setString(fullKey + '.href', url);
		Foxtrick.Prefs.setString(fullKey + '.title', title);
		Foxtrick.Prefs.setString(fullKey + '.img', imgSrc);

		/** @type {CustomLinkDefinition} */
		let link = {
			set: linkSet,
			url,
			title,
			imgSrc,
			key,
			fullKey,
		};

		let row = Foxtrick.util.links.createLinkRow(doc, link);

		let table = doc.getElementById('ft-custom-links-table');
		table.appendChild(row);
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

/**
 * @param  {document}             doc
 * @param  {CustomLinkDefinition} link
 * @return {HTMLElement}
 */
Foxtrick.util.links.createDelLink = function(doc, link) {
	try {
		let delLink = doc.createElement('div');
		delLink.className = 'ft_actionicon foxtrickRemove';
		delLink.title = Foxtrick.L10n.getString('links.custom.remove');
		delLink.dataset.fullKey = link.fullKey;
		delLink.dataset.key = link.key;

		Foxtrick.onClick(delLink, Foxtrick.util.links.delMyLink);

		return delLink;
	}
	catch (e) {
		Foxtrick.log(e);
		return null;
	}
};

/**
 * @param  {document}             doc
 * @param  {CustomLinkDefinition} link
 * @return {HTMLElement}
 */
Foxtrick.util.links.createCopyLink = function(doc, link) {
	try {
		let editOld = doc.createElement('div');
		editOld.className = 'ft_actionicon foxtrickCopy float_right';
		editOld.dataset.fullKey = link.fullKey;
		editOld.title = Foxtrick.L10n.getString('links.custom.copy');
		editOld.setAttribute('aria-label', editOld.title);

		Foxtrick.onClick(editOld, Foxtrick.util.links.copyOldLink);

		return editOld;
	}
	catch (e) {
		Foxtrick.log(e);
		return null;
	}
};

/**
 * @param  {document}         doc
 * @return {HTMLInputElement}
 */
Foxtrick.util.links.createImageLoader = function(doc) {

	/** @param {string} url */
	var handleUrl = function(url) {
		/** @type {HTMLImageElement} */
		let div = doc.querySelector('#ft-link-img-preview');
		div.src = url;
	};

	return Foxtrick.util.load.filePickerForDataUrl(doc, handleUrl);
};

/** @type {Listener<HTMLSelectElement, Event>} */
Foxtrick.util.links.useTag = function() {
	try {

		if (!this.value)
			return;

		let doc = this.ownerDocument;

		/** @type {HTMLSelectElement} */
		let urlInput = doc.querySelector('#ft-link-url-input');

		let value = urlInput.value;
		if (/\?/.test(value))
			value += '&';
		else
			value += '?';

		value += this.value + '=[' + this.value + ']';
		urlInput.value = value;

	}
	catch (e) {
		Foxtrick.log(e);
	}
};

/**
 * @param  {string} linkSet
 * @return {string}
 */
Foxtrick.util.links.getBasePref = function(linkSet) {
	return 'module.LinksCustom.' + linkSet;
};

/**
 * @param  {string}   url
 * @param  {LinkArgs} args
 * @return {string}
 */
Foxtrick.util.links.makeUrl = function(url, args) {
	let u = url;
	for (let i in args) {
		let re = new RegExp('\\[' + i + '\\]', 'ig');
		u = u.replace(re, String(args[i]));
	}

	return u;
};

/**
 * @param  {document}             doc
 * @param  {CustomLinkDefinition} link
 * @return {HTMLTableRowElement}
 */
Foxtrick.util.links.createLinkRow = function(doc, link) {
	let { imgSrc, url, title } = link;

	let icon = doc.createElement('img');
	icon.alt = title;
	icon.className = 'ft-links-custom-icon-edit';
	if (imgSrc && imgSrc !== 'null' && imgSrc !== 'undefined')
		icon.src = imgSrc;

	let a = doc.createElement('a');
	a.title = title;
	a.href = url;
	a.target = '_blank';
	a.relList.add('noopener');
	a.appendChild(icon);

	let tr = doc.createElement('tr');
	tr.id = 'ft-link-row-' + link.key;
	let td1 = doc.createElement('td');
	let td2 = doc.createElement('td');
	let td3 = doc.createElement('td');
	let td4 = doc.createElement('td');

	td1.appendChild(a);
	td2.textContent = title.slice(0, 10);
	td3.appendChild(Foxtrick.util.links.createCopyLink(doc, link));
	td4.appendChild(Foxtrick.util.links.createDelLink(doc, link));

	Foxtrick.appendChildren(tr, [td1, td2, td3, td4]);
	return tr;
};

/**
 * @param  {string}                 linkSet
 * @return {CustomLinkDefinition[]}
 */
Foxtrick.util.links.getCustomLinks = function(linkSet) {
	// format: module.LinksCustom.<module>.<random>.<title|href|img>
	const basePref = this.getBasePref(linkSet);

	let prefs = Foxtrick.Prefs.getAllKeysOfBranch(basePref);

	let keys = new Set(prefs.map((key) => {
		let k = key.replace(basePref + '.', '');
		if (!/\./.test(k))
			return void 0;

		return k.replace(/\..+/, '');
	}).filter(Boolean));

	let links = [...keys].map((key) => {
		let fullKey = basePref + '.' + key;
		let url = Foxtrick.Prefs.getString(fullKey + '.href');
		let imgSrc = Foxtrick.Prefs.getString(fullKey + '.img');
		let title = Foxtrick.Prefs.getString(fullKey + '.title');

		if (!url || !title)
			return void 0;

		/** @type {CustomLinkDefinition} */
		return {
			set: linkSet,
			url,
			title,
			imgSrc,
			key,
			fullKey,
		};

	}).filter(Boolean);

	return links;
};

/**
 * @param {document}          doc
 * @param {FTLinkModuleMixin} module
 */
// eslint-disable-next-line consistent-this
Foxtrick.util.links.run = function(doc, module) {
	const HEADER = Foxtrick.L10n.getString('links.boxheader');
	const LINK_CLASS = 'inner';
	const BOX_ID = 'foxtrick_links_content';

	var o = module.links(doc);
	if (!o)
		return;

	if (!o.types) {
		// default link types
		if (Array.isArray(module.LINK_TYPES))
			o.types = module.LINK_TYPES;
		else
			o.types = [module.LINK_TYPES];
	}

	var box = Foxtrick.createFeaturedElement(doc, module, 'div');
	box.id = BOX_ID;

	/** @type {Record<string, string|number>} */
	let ownInfo = {
		server: doc.location.hostname,
		lang: Foxtrick.Prefs.getString('htLanguage'),
	};
	let ownTeam = Foxtrick.modules.Core.TEAM;
	for (let [key, val] of Object.entries(ownTeam))
		ownInfo['own' + key] = val;

	let output = Object.assign(o.info || {}, ownInfo);

	/** @type {LinkArgs} */
	let info = {};
	for (let tag in output) {
		// convert all tags to lower case
		info[tag.toLowerCase()] = output[tag];
	}

	let specPromises = Foxtrick.map(async (type) => {
		/** @type {LinkPageQuery} */
		let opts = {
			module: module.MODULE_NAME,
			className: LINK_CLASS,
			parent: box,
			type: typeof type == 'string' ? type : '',
			info,
		};

		if (typeof type !== 'string')
			Foxtrick.mergeValid(opts, type);

		let anchors = await Foxtrick.modules.Links.getLinks(doc, opts);

		return { parent: box, anchors };

	}, o.types);

	// allow concurrent resolution
	// but append children in order
	specPromises.reduce(async (prev, now) => {
		await prev;

		try {
			let { parent, anchors } = await now;
			Foxtrick.appendChildren(parent, anchors);
		}
		catch (e) {
			Foxtrick.catch('links.run')(e);
		}

	}, Promise.resolve()).then(function() {

		// append custom links last
		let customLinkSet = o.customLinkSet || module.MODULE_NAME;
		Foxtrick.util.links.add(box, customLinkSet, info, o.hasNewSidebar);

	}).catch(Foxtrick.catch('links.run.custom'));

	let adder = o.hasNewSidebar ? Foxtrick.Pages.Match : Foxtrick;

	// eslint-disable-next-line no-magic-numbers
	let wrapper = adder.addBoxToSidebar(doc, HEADER, box, -20);
	if (wrapper)
		wrapper.id = 'ft-links-box';
};

/**
 * @param  {document}                doc
 * @param  {FTLinkModuleMixin}       module
  * @return {HTMLUListElement}
 */
// eslint-disable-next-line consistent-this
Foxtrick.util.links.getPrefs = function(doc, module) {
	var types = Array.isArray(module.LINK_TYPES) ? module.LINK_TYPES : [module.LINK_TYPES];
	var mName = module.MODULE_NAME;

	var gList = doc.createElement('ul');
	var usedKeys = new Set();

	/**
	 * @param {LinkCollection} collection
	 */
	var parseCollection = function(collection) {
		if (!collection)
			return;

		var hasOpts = false;

		/** @param {string} type */
		var generateOpts = function(type) {
			try {
				if (collection[type]) {
					let links = collection[type];
					for (let [key, link] of Object.entries(links)) {
						if (usedKeys.has(key))
							continue;

						usedKeys.add(key);

						let item = doc.createElement('li');
						gList.appendChild(item);

						let label = doc.createElement('label');
						item.appendChild(label);

						let check = doc.createElement('input');
						check.type = 'checkbox';
						check.setAttribute('module', mName);
						check.setAttribute('option', key);

						// since this is appended asynchronously, we set
						// the checked attribute manually
						if (Foxtrick.Prefs.isModuleOptionEnabled(mName, key) ||
						    !Foxtrick.Prefs.isModuleOptionSet(mName, key)) {

							check.setAttribute('checked', 'checked');

							let pref = mName + '.' + key;
							Foxtrick.Prefs.setModuleEnableState(pref, true);
							hasOpts = true;
						}

						label.appendChild(check);
						label.appendChild(doc.createTextNode(link.title));
					}
				}

				if (hasOpts && Foxtrick.Prefs.isModuleEnabled(mName) === null) {
					let moduleCheck = doc.getElementById('pref-' + mName + '-check');
					moduleCheck.setAttribute('checked', 'checked');

					let moduleOpts = doc.getElementById('pref-' + mName + '-options');
					moduleOpts.setAttribute('style', '');

					Foxtrick.Prefs.setModuleEnableState(mName, true);
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		Foxtrick.forEach(generateOpts, types);
	};

	Foxtrick.modules.Links.getCollection().then(parseCollection);

	return gList;
};

/**
 * @typedef {Record<string, string|number>} LinkArgs
 * @typedef {string|LinkPageTypeDef} LinkPageType
 */
/**
 * @typedef LinkPageDefinition
 * @prop {LinkArgs} info
 * @prop {LinkPageType[]} [types]
 * @prop {string} [customLinkSet]
 * @prop {boolean} [hasNewSidebar]
 */
/**
 * @typedef LinkPageQuery
 * @prop {string} type
 * @prop {string} module
 * @prop {string} className
 * @prop {LinkArgs} info
 * @prop {HTMLElement} [parent]
 */
/**
 * @typedef LinkPageTypeDef
 * @prop {string} type
 * @prop {string} [module]
 * @prop {string} [className]
 */
/**
 * @typedef CustomLinkDefinition
 * @prop {string} url
 * @prop {string} title
 * @prop {string} imgSrc
 * @prop {string} set
 * @prop {string} key
 * @prop {string} fullKey
 */
