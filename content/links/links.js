/**
 * links.js
 * External links collection
 * @author others, convinced, ryanli, LA-MJ
 */

'use strict';

/**
 * @typedef FT.Links
 * @prop {()=>Promise<LinkCollection>} getCollection
 * @prop {(doc: document, options: LinkPageQuery)=>Promise<HTMLAnchorElement[]>} getLinks
 * @prop {(doc: document, c: LinkCollection, o: LinkPageQuery)=>HTMLAnchorElement[]} makeAnchors
 */

/**
 * @type {FTAppModuleMixin & FTCoreModuleMixin & FT.Links}
 */
Foxtrick.modules.Links = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	CORE_MODULE: true,
	PAGES: ['all'],
	OPTIONS: ['ReuseTab'],

	/**
	 * @param  {document} doc
	 * @return {Element}
	 */
	OPTION_FUNC: function(doc) {
		this.getCollection();

		let cont = doc.createElement('div');
		let label = doc.createElement('p');

		// README: not using Links.feedsList to preserve translations
		label.dataset.text = 'Links.feeds';
		cont.appendChild(label);

		let textarea = doc.createElement('textarea');
		textarea.setAttribute('pref', 'module.Links.feedsList');
		cont.appendChild(textarea);

		let button = doc.createElement('button');
		button.type = 'button';
		Foxtrick.onClick(button, function(ev) {
			// eslint-disable-next-line no-invalid-this
			let doc = this.ownerDocument;

			/** @type {NodeListOf<HTMLInputElement>} */
			let links = doc.querySelectorAll('input[option][module^="Links"]:not([id])');
			let state = links[0].checked;
			for (let link of links) {
				if (link.checked === state)
					link.click();
			}
		});

		button.dataset.text = 'Links.toggle';
		cont.appendChild(button);

		return cont;
	},

	/** @return {Promise<LinkCollection>} */
	getCollection: async function() {
		// load links from external feeds
		let feedSpec = Foxtrick.Prefs.getString('module.Links.feedsList') || '';
		let feeds = feedSpec.split(/(\n|\r|\\n|\\r)+/);
		feeds = Foxtrick.filter(n => n.trim() !== '', feeds);

		// use the default feed if no feeds set or using dev/android
		if (feeds.length === 0 ||
		    Foxtrick.platform === 'Android' || Foxtrick.branch === 'dev')
			feeds = [Foxtrick.DataPath + 'links.json'];


		/**
		 * @param  {string[]} feeds
		 * @return {LinkCollection}
		 */
		var parseFeeds = function(feeds) {
			/**
			 * Link type => Link name => LinkDefinition
			 * @type {LinkCollection}
			 */
			var collection = {};

			feeds.forEach(function(text) {
				/**
				 * Link name => LinkDefinition
				 * @type {LinkFeedCollection}
				 */
				let links;
				try {
					// Foxtrick.log('parseFeed: ', text.slice(0, 200));
					links = JSON.parse(text);
				}
				catch (e) {
					// eslint-disable-next-line no-magic-numbers
					Foxtrick.log('Failure parsing links:', text.slice(0, 200), e);
					return;
				}

				/** @type {LinkName} */
				for (let key in links) {
					let link = links[key];
					if (link.img) {
						if (link.img.indexOf('resources') === 0) {
							// add path to internal images
							link.img = Foxtrick.InternalPath + link.img;
						}
						link.img = Foxtrick.util.sanitize.parseUrl(link.img);
					}

					/** @type {LinkType} */
					for (let prop in link) {
						if (/link/.test(prop)) {
							link[prop].url = Foxtrick.util.sanitize.parseUrl(link[prop].url);
							if (typeof collection[prop] === 'undefined')
								collection[prop] = {};

							collection[prop][key] = link;
						}
					}
				}
			});

			// Foxtrick.log('Link feeds loaded');
			return collection;
		};

		Foxtrick.log('Loading', feeds.length, 'link feeds from:', feeds);

		/** @type {Promise<string>[]} */
		let promises = Foxtrick.map(function(feed) {
			// Foxtrick.log('loading feed:', feed);

			// load a plain text Promise
			return Foxtrick.load(feed)
				.then(function(text) {
					if (text) {
						Foxtrick.storage.set('LinksFeed.' + feed, text);
						return text;
					}
					Foxtrick.log('Error loading links from:', feed,
					             '. Received empty response. Using cached feed.');

					return Foxtrick.storage.get('LinksFeed.' + feed);
				}, function(resp) {

					Foxtrick.log('Error', resp.status, 'loading links from:', resp.url,
					             '. Using cached feed.');

					return Foxtrick.storage.get('LinksFeed.' + feed);

				}).catch(Foxtrick.catch('StoreLinksCollection'));

		}, feeds);

		const feedTexts = (await Promise.all(promises)).filter(t => t);
		return parseFeeds(feedTexts);
	},

	/**
	 * @param  {document}                     doc
	 * @param  {LinkPageQuery}                options
	 * @return {Promise<HTMLAnchorElement[]>}
	 */
	getLinks: async function(doc, options) {
		const module = this;
		const collection = await module.getCollection();
		return module.makeAnchors(doc, collection, options);
	},

	/**
	 * @param  {document}            doc
	 * @param  {LinkCollection}      collection
	 * @param  {LinkPageQuery}       options
	 * @return {HTMLAnchorElement[]}
	 */
	makeAnchors: function(doc, collection, options) {
		let reuseTab = Foxtrick.Prefs.isModuleOptionEnabled('Links', 'ReuseTab');

		/** @type {LinkPageQuery} */
		let opts = { type: '', info: {}, module: '', className: '' };
		Foxtrick.mergeValid(opts, options);

		let { info: args, type, module } = opts;
		let isTracker = /^tracker/.test(type);

		/** @type {LinkDefinition} */
		var gLink;

		/**
		 * @param  {LinkDefinition} link
		 * @param  {string} url
		 * @param  {string} key
		 * @return {HTMLAnchorElement}
		 */
		var makeAnchorElement = function(link, url, key) {
			let linkNode = doc.createElement('a');
			if (isTracker) {
				let idStr = args.nationality || args.leagueid;
				let id = typeof idStr == 'string' ? parseInt(idStr, 10) : idStr;
				linkNode = Foxtrick.util.id.createFlagFromLeagueId(doc, id, url, link.title);
			}
			else {
				linkNode.title = link.title;
				linkNode.href = url;
				linkNode.className = opts.className;
				if (typeof link.img === 'undefined') {
					linkNode.textContent = link.shorttitle;
				}
				else {
					let img = {
						alt: link.shorttitle || link.title,
						title: link.title,
						src: link.img,
						class: 'ft-link-icon',
					};

					Foxtrick.addImage(doc, linkNode, img);
				}
			}

			if (typeof link.openinthesamewindow === 'undefined')
				linkNode.target = reuseTab ? '_ftlinks' : '_blank';

			linkNode.setAttribute('key', key);
			linkNode.setAttribute('module', module);
			return linkNode;
		};

		/**
		 * @param  {number} sum
		 * @param  {string} prop
		 * @return {number}
		 */
		var addUp = function(sum, prop) {
			var num = parseInt(String(args[prop]), 10) || 0;
			return sum + num;
		};

		/**
		 * @param  {string} filter
		 * @return {boolean}
		 */
		var testFilter = function(filter) {
			// ranges to determine whether to show
			/** @type {*} */
			let f = gLink[filter + 'ranges'] || gLink[filter.replace(/^own/, '') + 'ranges'];

			/** @type {LinkDefinitionRangeFilter} */
			let ranges = f;

			let val = args[filter];
			return Foxtrick.any(([start, end]) => val >= start && val <= end, ranges);
		};

		var COMPARE = {
			/**
			 * @param  {string}  prop
			 * @return {boolean}
			 */
			EXISTS: function(prop) {
				return typeof args[prop] !== 'undefined';
			},

			/**
			 * @param  {string}  first
			 * @param  {string}  second
			 * @return {boolean}
			 */
			GREATER: function(first, second) {
				let firstVal = args[first];
				let secondVal = args[second];
				if (typeof firstVal === 'undefined' || typeof secondVal === 'undefined')
					return false;

				return firstVal > secondVal;
			},

			/**
			 * @param  {string}  first
			 * @param  {string}  second
			 * @return {boolean}
			 */
			SMALLER: function(first, second) {
				let firstVal = args[first];
				let secondVal = args[second];
				if (typeof firstVal === 'undefined' || typeof secondVal === 'undefined')
					return false;

				return firstVal < secondVal;
			},

			/**
			 * @param  {string}  first
			 * @param  {string}  second
			 * @return {boolean}
			 */
			EQUAL: function(first, second) {
				let firstVal = args[first];
				let secondVal = args[second];
				if (typeof firstVal === 'undefined' || typeof secondVal === 'undefined')
					return false;

				return firstVal == secondVal;
			},

			/**
			 * @param  {(LinkAllowLogicFilter|LinkAllowFilter)[]} conds
			 * @return {boolean}
			 */
			OR: function(...conds) {
				let result = false;
				for (let c of conds) {
					let [type, ...rest] = c;
					let filter = COMPARE[type];

					// @ts-ignore
					result = result || filter(...rest);
				}

				return result;
			},

			/**
			 * @param  {(LinkAllowLogicFilter|LinkAllowFilter)[]} conds
			 * @return {boolean}
			 */
			AND: function(...conds) {
				let result = true;
				for (let c of conds) {
					let [type, ...rest] = c;
					let filter = COMPARE[type];

					// @ts-ignore
					result = result && filter(...rest);
				}

				return result;
			},
		};

		// links to return
		var links = [];

		for (let key in collection[type]) {
			gLink = collection[type][key];
			let urlTmpl = gLink[type].url;
			let filters = gLink[type].filters;

			if (typeof gLink.SUM !== 'undefined') {
				// makes calculation of requested parameteres and place values
				// with the others in params
				if (gLink.SUM) {
					for (let sum in gLink.SUM)
						args[sum] = gLink.SUM[sum].reduce(addUp, 0);
				}
			}

			let allowed = true;
			if (!Foxtrick.Prefs.isModuleOptionEnabled(module, key) &&
				Foxtrick.Prefs.isModuleOptionSet(module, key)) {
				// enable all by default unless set otherwise by user
				allowed = false;
			}
			else if (filters && filters.length > 0) {
				allowed = Foxtrick.all(testFilter, filters);
			}

			// check allowed based on value comparison
			else if (typeof gLink.allow !== 'undefined') {
				let test = gLink.allow;
				let [type, ...rest] = test;

				// @ts-ignore
				allowed = COMPARE[type](...rest);
			}

			if (allowed) {
				let url = Foxtrick.util.links.makeUrl(urlTmpl, args);
				if (url) {
					links.push({
						anchor: makeAnchorElement(gLink, url, key),
						obj: gLink,
					});
				}
			}
		}
		links.sort((a, b) => {
			let noA = typeof a.obj.img === 'undefined';
			let noB = typeof b.obj.img === 'undefined';

			// pushing links without images last
			if (noA && noB)
				return 0;
			else if (noA)
				return 1;
			else if (noB)
				return -1;

			return a.obj.title.localeCompare(b.obj.title);
		});

		let anchors = Foxtrick.map(link => link.anchor, links);
		return anchors;
	},
};

/**
 * @typedef {[number, number][]} LinkDefinitionRangeFilter [start, end] inclusive
 * @typedef {'GREATER'|'SMALLER'|'EQUAL'} LinkAllowCompareFilterType
 * @typedef {[LinkAllowCompareFilterType, string, string]} LinkAllowCompareFilter
 * @typedef {'EXISTS'} LinkAllowPredicateFilterType
 * @typedef {[LinkAllowPredicateFilterType, string]} LinkAllowPredicateFilter
 * @typedef {LinkAllowCompareFilter|LinkAllowPredicateFilter} LinkAllowFilter
 * typedef {LinkAllowCompareFilter|LinkAllowPredicateFilter|LinkAllowLogicFilter} LinkAllowFilter
 * @typedef {'OR'|'AND'} LinkAllowLogicFilterType
 * @typedef {[LinkAllowLogicFilterType, ...LinkAllowFilter[]]} LinkAllowLogicFilter recursive!
 * @typedef {LinkAllowFilter|LinkAllowLogicFilter} LinkDefinitionAllowFilter
 */
/**
 * @typedef LinkDefinitionSub
 * @prop {string} url
 * @prop {string[]} filters
 */
/**
 * @typedef LinkDefinitionProps
 * @prop {string} title
 * @prop {string} [img]
 * @prop {string} [shorttitle]
 * @prop {true} [openinthesamewindow]
 * @prop {Object.<string, string[]>} [SUM]
 * @prop {LinkDefinitionAllowFilter} [allow]
 */
/**
 * @typedef {string} LinkType
 * @typedef {string} LinkName
 * @typedef {Object.<string, LinkDefinitionSub>} LinkDefinitionSubs map of link type to sub
 * @typedef {LinkDefinitionSubs & LinkDefinitionProps} LinkDefinition
 * @typedef {Object.<string, LinkDefinition>} LinkFeedCollection Link name => LinkDefinition
 */
/**
 * Link type => Link name => LinkDefinition
 * @typedef {Object.<string, Object.<string, LinkDefinition>>} LinkCollection
 */
