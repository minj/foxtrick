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
		textarea.setAttribute('pref', 'module.Links.feedsList'); // TODO move to dataset
		cont.appendChild(textarea);

		let button = doc.createElement('button');
		button.type = 'button';
		Foxtrick.onClick(button, function(ev) {
			// eslint-disable-next-line no-invalid-this
			let doc = this.ownerDocument;

			/** @type {NodeListOf<HTMLInputElement>} */
			let links = doc.querySelectorAll('input[option][module^="Links"]:not([id])');
			let [link] = links;
			let state = link && link.checked || false;
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
			 * Link type => Link key => LinkDefinition
			 * @type {LinkCollection}
			 */
			var collection = {};

			feeds.forEach(function(text) {
				/**
				 * Link key => LinkDefinition
				 * @type {LinkDefinitionMap}
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

				/** @type {LinkKey} */
				for (let key in links) {
					let link = links[key];
					if (link.img) {
						if (link.img.startsWith('resources')) {
							// add path to internal images
							link.img = Foxtrick.InternalPath + link.img;
						}
						link.img = Foxtrick.util.sanitize.parseUrl(link.img);
					}

					/** @type {LinkType} */
					for (let type in link) {
						if (/link/.test(type)) {
							link[type].url = Foxtrick.util.sanitize.parseUrl(link[type].url);
							if (typeof collection[type] === 'undefined')
								collection[type] = {};

							collection[type][key] = link;
						}
					}
				}
			});

			// Foxtrick.log('Link feeds loaded');
			return collection;
		};

		Foxtrick.log('Loading', feeds.length, 'link feeds from:', feeds);

		/** @type {Promise<string>[]} */
		let promises = feeds.map(async function fetchFeed(feed) {
			// Foxtrick.log('loading feed:', feed);

			try {
				let text = /** @type {string} */ (await Foxtrick.load(feed));

				if (text) {
					Foxtrick.storage.set('LinksFeed.' + feed, text)
						.catch(Foxtrick.catch('StoreLinksCollection'));

					return text;
				}

				Foxtrick.log('Error loading links from:', feed,
				             '. Received empty response. Using cached feed.');

				return Foxtrick.storage.get('LinksFeed.' + feed);
			}
			catch (e) {
				let resp = /** @type {FetchError} */ e;
				Foxtrick.log('Error', resp.status, 'loading links from:', resp.url,
				             '. Using cached feed.');

				return Foxtrick.storage.get('LinksFeed.' + feed);
			}
		}).map(p => p.catch(Foxtrick.catch('StoreLinksCollection')));

		const feedTexts = (await Promise.all(promises)).filter(Boolean);
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
		/** @type {LinkPageQuery} */
		let opts = { type: '', info: {}, module: '', className: '' };
		Foxtrick.mergeValid(opts, options);

		let { info: args, type, module, className } = opts;
		let isTracker = /^tracker/.test(type);

		/**
		 * @param  {LinkDefinitionProps} link
		 * @param  {string} url
		 * @param  {string} key
		 * @return {HTMLAnchorElement}
		 */
		var makeAnchorElement = function(link, url, key) {
			let { title, shorttitle, img, openinthesamewindow } = link;
			let linkNode = doc.createElement('a');
			if (isTracker) {
				let idStr = args.nationality || args.leagueid;
				let id = typeof idStr == 'string' ? parseInt(idStr, 10) : idStr;
				if (id)
					linkNode = Foxtrick.util.id.createFlagFromLeagueId(doc, id, url, title);
			}
			else {
				linkNode.title = title;
				linkNode.href = url;
				linkNode.className = className;
				if (typeof img === 'undefined') {
					linkNode.textContent = shorttitle;
				}
				else {
					let attr = {
						alt: shorttitle || title,
						title,
						src: img,
						class: 'ft-link-icon',
					};

					Foxtrick.addImage(doc, linkNode, attr);
				}
			}

			if (typeof openinthesamewindow === 'undefined')
				linkNode.target = '_blank';

			linkNode.relList.add('noopener');

			linkNode.dataset.key = key;
			linkNode.dataset.module = module;
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
		 * @param  {string}                  filter
		 * @param  {LinkDefinitionRangeDefs} rangeDefs
		 * @return {boolean}
		 */
		var testFilter = function(filter, rangeDefs) {
			// ranges to determine whether to show
			let fileterName = filter + 'ranges';
			let fileterNameFallback = filter.replace(/^own/, '') + 'ranges';

			/** @type {LinkDefinitionRangeDef} */
			let ranges = rangeDefs[fileterName] || rangeDefs[fileterNameFallback];

			let val = /** @type {number} */ (args[filter]);
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

					// @ts-ignore recursive type fail
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

					// @ts-ignore recursive type fail
					result = result && filter(...rest);
				}

				return result;
			},
		};

		/** @type {LinkDefinitionMap} */
		let linkDefs = collection[type];
		if (!linkDefs)
			return [];

		/** @type {{ anchor: HTMLAnchorElement, obj: LinkDefinitionProps }[]} */
		let links = Object.entries(linkDefs).map(([linkKey, linkDef]) => {
			/** @type {LinkDefinitionSubs} */
			let subs = linkDef;
			let sub = subs[type];
			let { url: urlTmpl, filters } = sub;

			/** @type {LinkDefinitionProps} */
			let props = linkDef;

			if (typeof props.SUM !== 'undefined' && props.SUM) {
				// makes calculation of requested parameteres and place values
				// with the others in params
				for (let sum in props.SUM) {
					let members = props.SUM[sum];

					if (Array.isArray(members))
						args[sum] = members.reduce(addUp, 0);
				}
			}

			/** @type {LinkDefinitionRangeDefs} */
			let rangeDefs = linkDef;

			let allowed = true;
			if (!Foxtrick.Prefs.isModuleOptionEnabled(module, linkKey) &&
				Foxtrick.Prefs.isModuleOptionSet(module, linkKey)) {
				// enable all by default unless set otherwise by user
				allowed = false;
			}
			else if (filters && filters.length > 0) {
				allowed = Foxtrick.all(f => testFilter(f, rangeDefs), filters);
			}

			// check allowed based on value comparison
			else if (typeof props.allow !== 'undefined') {
				let test = props.allow;
				let [type, ...rest] = test;

				// @ts-ignore
				allowed = COMPARE[type](...rest);
			}

			if (!allowed)
				return void 0;

			let url = Foxtrick.util.links.makeUrl(urlTmpl, args);
			if (!url)
				return void 0;

			return {
				anchor: makeAnchorElement(props, url, linkKey),
				obj: props,
			};

		}).filter(Boolean);

		links.sort((a, b) => {
			let noA = typeof a.obj.img === 'undefined';
			let noB = typeof b.obj.img === 'undefined';

			// pushing links without images last
			if (noA && noB)
				return a.obj.title.localeCompare(b.obj.title);
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
 * @prop {Record<string, string[]>} [SUM]
 * @prop {LinkDefinitionAllowFilter} [allow]
 */
/**
 * @typedef {string} LinkType
 * @typedef {string} LinkKey
 * @typedef {[number, number][]} LinkDefinitionRangeDef [start, end] inclusive
 * @typedef {Record<string, LinkDefinitionRangeDef>} LinkDefinitionRangeDefs prop => filter
 * @typedef {Record<LinkType, LinkDefinitionSub>} LinkDefinitionSubs Link Type => LinkDefinitionSub
 * @typedef {LinkDefinitionSubs & LinkDefinitionProps & LinkDefinitionRangeDefs} LinkDefinition
 * @typedef {Record<LinkKey, LinkDefinition>} LinkDefinitionMap Link key => LinkDefinition
 */
/**
 * Link type => Link key => LinkDefinition
 * @typedef {Record<LinkType, LinkDefinitionMap>} LinkCollection
 */
