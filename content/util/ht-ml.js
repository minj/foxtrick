/**
 * ht-ml.js
 * Utilities for HT-ML (Hattrick Markup Language)
 * @author ryanli, LA-MJ
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

Foxtrick.util.htMl = {};


/**
 * @typedef {'htMl'|'md'} FTCopyFormat
 * @typedef {{ copyTitle: string, markup: string}} FTCopyResult nullable
 */

/**
 * @typedef FTCopyOpts
 * @prop {boolean} [external] whether relative HT links are not used
 * @prop {FTCopyFormat} [format] markup language to use (defaults to htMl)
 * @prop {boolean} [linksOnly] skip invalid links
 */

/**
 * @typedef FTCopyLinkOpts
 * @prop {string} [id] null when type is not HT ID
 * @prop {string} [type] null for useless links, HT ID type for ID-links or 'url' for others
 * @prop {string} [url]
 * @prop {string} [text]
 */

/**
 * @typedef FThtMLID
 * @prop {string} id
 * @prop {string} markup
 * @prop {string} type
 * @prop {string} copyTitle
 * @prop {string} [tag]
 */

/**
 * @typedef FTCopyFormater
 * @prop {FTCopyFormaterTypeBase & Partial<FTCopyFormaterTypeContMixin>} cont
 * @prop {FTCopyFormaterTypeBase & Partial<FTCopyFormaterTypeElMixin>} el
 */
/**
 * @typedef FTCopyFormaterTypeBase
 * @prop {boolean} [_needsInit]
 * @prop {()=>void} [_init]
 */
/* eslint-disable max-len */
/**
 * @typedef {Record<keyof HTMLElementTagNameMap, FTCopyFormaterTypeContCB<keyof HTMLElementTagNameMap>>} FTCopyFormaterTypeContMixin
 */
/**
 * @typedef {Record<keyof HTMLElementTagNameMap, FTCopyFormaterTypeElCB<keyof HTMLElementTagNameMap>>} FTCopyFormaterTypeElMixin
 */
/* eslint-enable max-len */
/**
 * @template {keyof HTMLElementTagNameMap} T
 * @callback FTCopyFormaterTypeContCB function called for each container
 * @param  {string} content
 * @param  {HTMLElementTagNameMap[T]} node
 * @param  {FTCopyOpts} opts
 * @return {string}          {?string}
 */
/**
 * @template {keyof HTMLElementTagNameMap} T
 * @callback FTCopyFormaterTypeElCB function called for each element
 * @param  {HTMLElementTagNameMap[T]} node
 * @return {string} returning null here falls back to recursive (container) mode.
 */

/**
 * Get the language definition for a specific markup language
 * @param  {FTCopyFormat} format
 * @return {FTCopyFormater}
 */
Foxtrick.util.htMl.getFormat = function(format) {
	return null && format;
};

Foxtrick.util.htMl.getFormat = (function() {

	/** @type {Record<FTCopyFormat, FTCopyFormater>} */
	var formats = {};

	/**
	 * HT-ML language definition.
	 */
	formats.htMl = {
		/*
		 * These nodes are considered stand-alone elements
		 * They are called as tag(node).
		 * returning null here falls back to recursive (container) mode.
		 */
		el: {
			img: function(node) {
				if (node.hasAttribute('alt') && node.getAttribute('alt') !== '')
					return ' [\u2060' + node.getAttribute('alt') + '\u2060] ';
				else if (node.hasAttribute('title') && node.getAttribute('title') !== '')
					return ' [\u2060' + node.getAttribute('title') + '\u2060] ';

				return '';
			},
			hr: function() {
				return '\n[hr]';
			},
			br: function() {
				return '\n';
			},
			pre: function(node) {
				return `[pre]${node.textContent}[/pre]`;
			},
		},

		/*
		 * These nodes are considered element containers
		 * They are called as tag(content, node, opts).
		 */
		cont: {
			/*
			 * function called for each container
			 */
			// eslint-disable-next-line complexity
			a: function(content, node, opts) {
				let ret = content;
				let link = /** @type {HTMLAnchorElement} */ (node);
				if (!link.href)
					return ret;

				var a = Foxtrick.util.htMl._parseLink(link);
				if (a.type) {
					if (opts.external) {
						if (/^foxtrick:/.test(a.url))
							return a.url;

						ret = Foxtrick.goToUrl(a.url);
					}
					else {
						ret = `[${a.type}=${a.id || a.url}]`;
					}

					// add text if interesting
					if (!opts.linksOnly && a.text) {
						// strip surrounding '(' and '...blabla)' that's used to shorten urls
						let stripped = a.text.replace(/^\(|(\.\.\..*)?\)$/g, '');

						if (a.type === 'link') {
							// test whether link text is just an URL (i. e. from forum post)
							let meaningful = true;
							let path = stripped;

							if (/^\/\//.test(path)) {
								// add protocol if missing
								path = link.ownerDocument.location.protocol + path;
							}

							if (Foxtrick.isHtUrl(path)) {
								// a.url is relative for HT links
								path = path.replace(/^\w+:\/\/.+?(\/.*)/, '$1');
							}

							try {
								// using a RegExp to enforce case-insensitivity
								let pathRe = new RegExp('^' + Foxtrick.strToRe(path), 'i');
								meaningful = !pathRe.test(a.url);
							}
							catch (e) {}

							if (meaningful) {
								// link text is not a URL
								ret = `${stripped} ${ret}`;
							}
						}
						else if (stripped !== a.id) {
							// link text is not an ID
							// e. g. <a href="?playerid=1">Name Surname</a> ->
							// Name Surname [playerid=1]
							ret = `${stripped} ${ret}`;
						}
					}
				}
				else {
					// stop if we care about links only
					if (opts.linksOnly)
						return null;

					ret = a && a.text || ret || '';
					if (ret && /^javascript:/.test(link.href))
						ret = `[u]${ret}[/u]`;
				}

				return ret;
			},
			blockquote: function(content, node) {
				let tag = Foxtrick.hasClass(node, 'spoiler') ? 'spoiler' : 'q';
				return `[${tag}]${content.trim()}[/${tag}]`;
			},
			b: function(content) {
				return `[b]${content.trim()}[/b]`;
			},
			i: function(content) {
				return `[i]${content.trim()}[/i]`;
			},
			td: function(content, node) {
				var nodeName = node.nodeName.toLowerCase();
				let colspan = '';
				let rowspan = '';
				let align = '';
				if (node.hasAttribute('colspan') && node.getAttribute('colspan') !== '')
					colspan = ' colspan=' + node.getAttribute('colspan');
				if (node.hasAttribute('rowspan') && node.getAttribute('rowspan') !== '')
					rowspan = ' rowspan=' + node.getAttribute('rowspan');
				if (Foxtrick.hasClass(node, 'center'))
					align = ' align=center';
				else if (Foxtrick.hasClass(node, 'left'))
					align = ' align=left';
				else if (Foxtrick.hasClass(node, 'right'))
					align = ' align=right';

				return `[${nodeName}${colspan}${rowspan}${align}]${content.trim()}[/${nodeName}]`;
			},
			table: function(content, node) {
				var nodeName = node.nodeName.toLowerCase();

				// trim white-space between td/th tags
				let ret = content.trim().replace(/(\[\/t[dh]\])\s+/g, '$1');
				return `[${nodeName}]${ret}[/${nodeName}]\n`;
			},

			// pure html
			u: function(content, node) {
				var tag = node.nodeName.toLowerCase();
				return `[${tag}]${content.trim()}[/${tag}]`;
			},

			_needsInit: true,
			_init: function() {
				this.strong = this.h1 = this.h2 = this.h3 = this.h4 = this.b;
				this.em = this.i;
				this.th = this.td;
				this.tr = this.table;

				// pure html
				this.pre = this.u;
				this._needsInit = false;
			},
		},
	};

	/**
	 * Markdown language definition.
	 */
	formats.md = {
		/*
		 * These nodes are considered stand-alone elements
		 * They are called as tag(node).
		 * returning null here falls back to recursive (container) mode.
		 */
		el: {
			/*
			 * function called for each element.
			 * returning null falls back to recursive (container) mode
			 */
			img: function(el) {
				let img = /** @type {HTMLImageElement} */ (el);
				let alt = '';
				if (img.hasAttribute('alt') && img.getAttribute('alt') !== '')
					alt = img.alt;
				else if (img.hasAttribute('title') && img.getAttribute('title') !== '')
					alt = img.title;

				return ` ![${alt}](${img.src})`;
			},
			hr: function() {
				return '\n\n---\n';
			},
			br: function() {
				return '\n\n';
			},
			pre: function(node) {
				return Foxtrick.format('```{}```', [node.textContent]);
			},
		},

		/**
		 * These nodes are considered element containers
		 * They are called as tag(content, node, opts).
		 */
		cont: {
			// eslint-disable-next-line complexity
			a: function(content, node, opts) {
				let ret = content;
				let link = /** @type {HTMLAnchorElement} */ (node);
				if (link.href) {
					let a = Foxtrick.util.htMl._parseLink(link);
					if (a.type) {
						if (opts.external) {
							if (/^foxtrick:/.test(a.url))
								return a.url;

							a.url = Foxtrick.goToUrl(a.url);
						}
						let text = a.id ? '(' + a.id + ')' : a.text || ret;
						ret = Foxtrick.format('[{}]({})', [text, a.url]);
					}
					else {
						// stop if we care about links only
						if (opts.linksOnly)
							return null;

						ret = ret || a && a.text || '';
						if (ret && /^javascript:/.test(link.href))
							ret = '_' + ret.trim() + '_ ';

					}
				}
				return ret;
			},
			li: function(content) {
				// README: this does not really work with the aggressive trimming strategy
				// multi-line and multi-level LIs are messed up
				return '* ' + Foxtrick.prepad(content, '  ').trim();
			},
			h1: function(content, node) {
				let hCt = parseInt(String(node.nodeName.match(/\d/)), 10);
				let heading = Foxtrick.repeat('#', hCt);

				return heading + ' ' + content.replace(/\n/g, ' ');
			},
			td: function(content, node) {
				let nodeName = node.nodeName.toLowerCase();

				// README: colspan and rowspan do not work in MD
				// align works on th only

				// no line-feeds in md tables!
				var ret = content.replace(/\n/g, ' ').trim();
				ret = ret.replace(/([\\|])/g, '\\$1');
				if (nodeName == 'th') {
					if (Foxtrick.hasClass(node, 'center'))
						ret = `:${ret}:`;
					else if (Foxtrick.hasClass(node, 'right'))
						ret = `${ret}:`;
					else
						ret = `:${ret}`;
				}

				// outer loop also adds ' ' to the left
				return `\u2060\u2060${ret}`;
			},
			tr: function(arg) {
				var header = null;

				let content = arg + ' \u2060\u2060';
				var cells = content.split(/ \u2060\u2060/g).slice(1, -1);
				var headers = content.match(/ \u2060{2}:|: \u2060{2}/g);

				if (headers) {
					if (headers.length == cells.length) {
						// full header row
						header = cells.reduce(function(h, cell, i, cells) {
							// generate header cell
							let ret = '---';
							ret = cell.replace(/^(:?)(.*?)(:?)$/, `$1${ret}$3`);

							// fix original
							cells[i] = cells[i].replace(/^:|:$/g, '');

							// append
							return `${h}${ret} | `;
						}, '| ');
					}
					else {
						// skip incomplete headers: remove header markers
						cells = cells.map(cell => cell.replace(/^:|:$/g, ''));
					}
				}

				let ret = `| ${cells.join(' | ')} |\n`;
				if (header)
					ret += header + '\n';

				return ret;
			},
			table: function(content) {
				var ret = content;
				var lines = ret.split(/\n/);
				if (!/\| :?---:? \|/.test(lines[1])) {
					// no header, generate fake
					let cellCts = Foxtrick.map(function(line) {
						// simulating lookbehind to avoid previously escaped '|'
						let m = line.split('').reverse().join('').match(/ \|(?!\\)/g);
						if (m)
							return m.length;

						return 0;
					}, lines);
					let cellCt = Math.max.apply(null, cellCts);
					let line0 = Foxtrick.repeat('| ', cellCt) + '|';
					let line1 = Foxtrick.repeat('| --- ', cellCt) + '|';
					lines.unshift(line0, line1);
					ret = lines.join('\n');
				}
				return `\n${ret}\n`;
			},
			blockquote: function(content) {
				return Foxtrick.prepad(content, '> ');
			},
			b: function(content) {
				return '**' + content.trim() + '**';
			},
			i: function(content) {
				return '*' + content.trim() + '*';
			},
			u: function(content) {
				return '_' + content.trim() + '_';
			},
			s: function(content) {
				return '~~' + content.trim() + '~~';
			},

			_needsInit: true,
			_init: function() {
				this.ul = this.p;
				this.th = this.td;
				this.strong = this.b;
				this.h2 = this.h3 = this.h4 = this.h1;
				this.em = this.i;
				this.del = this.s;

				// @ts-ignore
				this.strike = this.s;

				this._needsInit = false;
			},
		},
	};

	/**
	 * @param  {FTCopyFormat} format
	 * @return {FTCopyFormater}
	 */
	var getFormat = function(format) {
		let def = formats[format];
		if (!def)
			return null;

		for (let key of Object.keys(def)) {
			let type = /** @type {keyof FTCopyFormater} */ (key);
			if (def[type]._needsInit)
				def[type]._init();
		}
		return def;
	};

	return getFormat;

})();

/**
 * Parse HT-ML ID from a link.
 * Traverses up the tree from node until the first link is found.
 *
 * Returns null if no link was found,
 * the found link was invalid (javascript: or SVG),
 * or the link URL does not contain a HT-ML ID.
 *
 * @param  {Element} node
 * @return {FThtMLID}       ?{id, markup, type, copyTitle, ?tag}
 */
Foxtrick.util.htMl.getId = function(node) {

	// ['title', RE, 'tag']
	// first match first serve
	// a missing tag suppresses url.text conversion
	/**
	 * @type {([string, RegExp]|[string, RegExp, string])[]}
	 */
	var HT_ID_TYPES = [
		[
			'Youth Match',
			/Match\.aspx\?matchID=(\d+).*?&SourceSystem=Youth(?!.*?#tab[1-9])/i,
			'youthmatchid',
		],
		['Youth Match', /matchID=(\d+).*?&SourceSystem=Youth/i],
		[
			'Tournament Match',
			/Match\.aspx\?matchID=(\d+).*?SourceSystem=HTO(?!.*?#tab[1-9])/i,
			'tournamentmatchid',
		],
		['Tournament Match', /matchID=(\d+).*?SourceSystem=HTO/i],

		// regular matches after youth and tournament, so they get detected first
		['Match', /Match\.aspx\?matchID=(\d+)(?!.*?#tab[1-9])/i, 'matchid'],
		['Match', /matchID=(\d+)/i],
		['Youth Player', /YouthPlayer\.aspx\?YouthPlayerID=(\d+)/i, 'youthplayerid'],
		['Youth Player', /YouthPlayerID=(\d+)/i],
		['Player', /Player\.aspx\?playerId=(\d+)/i, 'playerid'],
		['Player', /playerId=(\d+)/i],
		['Series', /\/World\/Series\/(?:Default\.aspx)?\?LeagueLevelUnitID=(\d+)/i, 'leagueid'],
		['Series', /LeagueLevelUnitID=(\d+)/i],
		['Youth Series', /YouthSeries\.aspx\?YouthLeagueId=(\d+)/i, 'youthleagueid'],
		['Youth Series', /YouthLeagueId=(\d+)/i],
		['Federation', /Federation\.aspx\?AllianceID=(\d+)/i, 'federationid'],
		['Federation', /AllianceID=(\d+)/i],
		['Tournament', /Tournament(?:History)?\.aspx\?tournamentId=(\d+)/i, 'tournamentid'],
		['Tournament', /\?tournamentId=(\d+)/i],
		['Kit', /\?KitID=(\d+)/i, 'kitid'],
		['Article', /\?ArticleID=(\d+)/i, 'articleid'],
		['Post', /\/Forum\/Read\.aspx\?t=(\d+).*&n=(\d+)/i, 'post'],
		['Arena', /\/Club\/Arena\/(?:Default\.aspx)?\?ArenaID=(\d+)/i],
		['League', /\/World\/Leagues\/League\.aspx\?LeagueID=(\d+)/i],
		['Cup', /\/World\/Cup\/(?:Default\.aspx)?\?CupID=(\d+)/i],
		['Region', /\/World\/Regions\/Region\.aspx\?RegionID=(\d+)/i],
		['Youth Team', /\/Club\/Youth\/(?:Default\.aspx)?\?YouthTeamID=(\d+)/i, 'youthteamid'],
		['Youth Team', /YouthTeamID=(\d+)/i],
		['National Team', /\/Club\/NationalTeam\/NationalTeam\.aspx\?teamId=(\d+)/i, 'ntteamid'],
		['Team', /\/Club\/(?:Default\.aspx)?\?TeamID=(\d+)/i, 'teamid'],
		['Team', /TeamID=(\d+)/i],
		['User', /\/Club\/Manager\/(?:Default\.aspx)?\?userId=(\d+)/i, 'userid'],
		['User', /\?userId=(\d+)/i],
	];
	var COPY_TEXT = Foxtrick.L10n.getString('copy.id');

	var link = null;
	let currentObj = /** @type {HTMLAnchorElement} */ (node);
	while (currentObj) {
		if (typeof currentObj.href !== 'undefined') {
			link = currentObj.href;
			break;
		}

		// @ts-ignore
		currentObj = currentObj.parentNode;
	}

	if (typeof link !== 'string' || /^javascript/i.test(link)) {
		// not found or JS or SVG link
		return null;
	}

	for (let spec of HT_ID_TYPES) {
		let [type, re, tag] = spec;
		if (!re.test(link))
			continue;

		let match = link.match(re);
		let ids = match.slice(1);
		let id = ids.join('.');
		let copyTitle = COPY_TEXT.replace('%s', `${type} ID`).replace('%i', id);

		/** @type {FThtMLID} */
		let ret = {
			id,
			copyTitle,
			type,
			markup: id,
		};

		if (tag) {
			// some ID types may not have corresponding tags
			ret.tag = tag;
		}

		return ret;

	}

	// no ID
	return null;
};

/**
 * Get markup from a link node.
 * Returns a string or null if no valid markup was generated.
 * options is { external, linksOnly: boolean, format: string }.
 * external sets whether relative HT links are not used (defaults to false).
 * linksOnly is whether to reject non-link markup generated.
 * format is the markup language to use (defaults to htMl).
 * @param  {Element} el
 * @param  {object}  options {external, linksOnly: boolean, format: string}
 * @return {FTCopyResult}
 */
Foxtrick.util.htMl.getLink = function(el, options) {
	let node = Foxtrick.util.htMl._findNode(el);
	if (node.nodeName.toLowerCase() !== 'a')
		return null;

	let link = /** @type {HTMLAnchorElement} */ (node);

	/** @type {FTCopyOpts} */
	let opts = {
		external: false,
		format: 'htMl',
		linksOnly: true,
	};
	Foxtrick.mergeValid(opts, options);

	let copyTitle = opts.external ? 'copy.external' : 'copy.link';

	// reference to format definition
	let format = Foxtrick.util.htMl.getFormat(opts.format);
	let markup = format.cont.a('', link, opts);
	if (markup)
		return { copyTitle: Foxtrick.L10n.getString(copyTitle), markup: markup };

	return null;
};

/**
 * Parse a link node to retrieve basic information.
 *
 * @param  {HTMLAnchorElement} node
 * @return {FTCopyLinkOpts}
 */
// eslint-disable-next-line complexity
Foxtrick.util.htMl._parseLink = function(node) {
	var idObj = Foxtrick.util.htMl.getId(node);
	var link = null;
	var currentObj = node;

	while (currentObj) {
		if (typeof currentObj.href !== 'undefined') {
			link = currentObj.href;
			break;
		}

		// @ts-ignore
		currentObj = currentObj.parentNode;
	}

	/** @type {string} */
	var url = null;
	var type = null;
	var id = null;
	var text = null;
	if (idObj !== null && typeof idObj.tag !== 'undefined') {
		id = idObj.id;
		type = idObj.tag;
	}

	if (typeof link === 'string') {
		// don't override idObj
		if (!type)
			type = 'link';

		// if it's relative link of Hattrick, remove the host
		let relRe = /^https?:\/\/.+?(\/.*)/i;
		if (relRe.test(link) && Foxtrick.isHtUrl(link)) {
			let [_, relLink] = link.match(relRe);
			url = relLink;
		}
		else {
			url = link;
		}
		text = node.textContent.trim() || node.title || '';

		// ignore boring links
		let ignore = [
			/^\/Help\/Rules\/AppDenominations\.aspx/i,
			/^\/Help\/Supporter\//i,
			/^javascript:/,
		];
		if (ignore.some(re => re.test(url)))
			type = null;
	}
	else if (link !== null && typeof link === 'object') {
		// svg anchor
		text = currentObj.getAttribute('title');
		if (text)
			text = text.trim();
	}
	return { type, id, url, text };
};

/**
 * Find an appropriate node to start copying from
 * @param  {Node} node
 * @return {Element}
 */
Foxtrick.util.htMl._findNode = function(node) {
	// FIXME documentFragment
	let ret = /** @type {Element} */ (node);
	if (ret.nodeName.toLowerCase() === 'bdo') {
		// id links in forums use bdo wrappers that catch click events
		if (ret.childNodes.length == 1 &&
		    ret.firstChild.nodeType == ret.TEXT_NODE)
			ret = ret.parentElement;
	}

	if (ret.nodeName.toLowerCase() === 'img')
		ret = ret.parentElement;

	return ret;
};

/**
 * Get markup from node.
 *
 * @param  {Node} node
 * @param  {FTCopyOpts} [options]
 * @return {string}
 */
Foxtrick.util.htMl.getMarkupFromNode = function(node, options) {
	var start = Foxtrick.util.htMl._findNode(node);

	/** @type {FTCopyOpts} */
	var opts = {
		external: false,
		format: 'htMl',
	};
	Foxtrick.mergeValid(opts, options);

	// reference to format definition
	let format = Foxtrick.util.htMl.getFormat(opts.format);
	let ret = Foxtrick.util.htMl._getMarkupRec(start, format, opts);

	// deprotect pre
	ret = ret.replace(/\u2060\/?pre\u2060/g, '\n');
	return ret.trim();
};

/**
 * Get markup from node recursively.
 * def is a reference to markup language definition.
 * opts is options for tag parsers.
 * @param  {Node} arg
 * @param  {FTCopyFormater} def markup language definition
 * @param  {object}  opts tag parser options
 * @return {string}
 */
// eslint-disable-next-line complexity
Foxtrick.util.htMl._getMarkupRec = function(arg, def, opts) {
	let node = arg;
	if (typeof node.nodeName === 'undefined') // FIXME fragment?
		return '';

	var doc = node.ownerDocument;
	var win = doc.defaultView;

	/**
	 * replace line breaks added by HT and take everything else as text
	 *
	 * @param  {HTMLElement} preEl
	 * @return {Node}
	 */
	var maskPre = function(preEl) {
		let pre = Foxtrick.map(function(child) {
			if (child.nodeName.toLowerCase() == 'br')
				return '\n';
			return child.textContent;
		}, preEl.childNodes).join('');

		// protect pre by marking it with special 'tags'
		// using u2060 'word joiner' zero-width space
		// eslint-disable-next-line no-magic-numbers
		let mark = String.fromCharCode(8288);

		// trimming only new-lines to prevent their proliferation
		let content = pre.replace(/^\n+|\n+$/g, '');


		// rebind node so that original DOM is untouched
		return doc.createTextNode(`${mark}pre${mark}${content}${mark}/pre${mark}`);
	};


	/** @type {HTMLElement} */
	var el;
	var display;
	if (node instanceof HTMLElement) {
		el = node;
		let computedStyle = win.getComputedStyle(node, null);
		display = computedStyle && computedStyle.getPropertyValue('display');
		if (display === 'none' && !Foxtrick.hasClass(node, 'spoiler')) {
			// don't skip hidden spoilers
			return '';
		}
	}

	var nodeName = /** @type {keyof HTMLElementTagNameMap} */ (node.nodeName.toLowerCase());

	// junk
	if (el && nodeName === 'ul' && Foxtrick.hasClass(el, 'ft-popup-list')) {
		return '';
	}

	// @ts-ignore
	else if (nodeName === 'desc') {
		// svg description, useless in HT
		return '';
	}
	else if (el && nodeName === 'blockquote' && el.className === 'spoiler') {
		// skip spoiler teasers
		return '';
	}

	if (el && nodeName === 'pre') {
		// special treatment for pre
		node = maskPre(el);

		// @ts-ignore pre deals with it as element
		el = node;
	}

	// element
	if (el && typeof def.el[nodeName] === 'function') {
		let elementMarkup = def.el[nodeName](el);
		if (elementMarkup !== null)
			return elementMarkup;
	}

	var ret = '';

	// content
	if (node.hasChildNodes()) {
		for (let child of [...node.childNodes]) {
			// recursively get the content of child nodes
			let childMarkup = Foxtrick.util.htMl._getMarkupRec(child, def, opts);
			if (childMarkup != null)
				ret += childMarkup;
		}
	}
	else if (node.nodeType == node.TEXT_NODE) {
		// skip comments etc
		ret = node.textContent.replace(/\s+/gm, ' ').trim();
		if (ret.length) {
			// if valid text
			// add space if text does not start with punctuation
			// prepended white-space separates this element from other nodes
			ret = ret.replace(/^(?!["',.?!])/, ' ');
		}
	}

	// container
	if (el && typeof def.cont[nodeName] === 'function') {
		let containerMarkup = def.cont[nodeName](ret, el, opts);
		if (containerMarkup === null)
			containerMarkup = '';

		// prepend white-space to separate this container from other nodes
		ret = ' ' + containerMarkup;
	}

	// ::after
	if (el) {
		let blocks = ['h1', 'h2', 'h3', 'h4', 'blockquote'];
		if (display === 'block' || blocks.indexOf(nodeName) != -1)
			ret = '\n' + ret + '\n';
		else if (display === 'list-item' || nodeName === 'li')
			ret += '\n';
	}

	// protect pre
	let parts = ret.split(/(?=\u2060pre\u2060)|\u2060\/pre\u2060/).map((part) => {
		let ret = part;
		if (/^\u2060pre\u2060/.test(ret)) {
			// no stripping in pre
			// restore end tag
			ret += '\u2060/pre\u2060';
			return ret;
		}

		// standardize white-space (except LF)
		ret = ret.replace(/[ \f\r\t\v]+/g, ' ');

		// trim white-space around LFs
		ret = ret.replace(/\n /g, '\n').replace(/ \n/g, '\n');

		// no more than 2 LFs in a row
		ret = ret.replace(/\n{3,}/g, '\n\n');

		return ret;
	});
	return parts.join('');
};

/**
 * Get markup from selected node(s) in node's window
 * or a given node if no selection exists.
 *
 * @param  {Element} node
 * @param  {FTCopyOpts}  options
 * @return {FTCopyResult}
 */
Foxtrick.util.htMl.getHtMl = function(node, options) {
	var win = node.ownerDocument.defaultView;
	var selection = win.getSelection();
	var markup = '';
	if (!selection.isCollapsed && selection.rangeCount > 0) {
		for (let i = 0; i < selection.rangeCount; ++i) {
			// in chrome computedStyle gets lost in cloneContents as it seems.
			let rangeNode = selection.getRangeAt(i).cloneContents();
			markup += Foxtrick.util.htMl.getMarkupFromNode(rangeNode, options);
			if (i !== selection.rangeCount - 1)
				markup += '\n';
		}
		markup = markup.trim();
		return { copyTitle: Foxtrick.L10n.getString('copy.ht-ml'), markup: markup };
	}

	markup = Foxtrick.util.htMl.getMarkupFromNode(node, options);
	markup = markup.trim();
	return { copyTitle: Foxtrick.L10n.getString('copy.ht-ml'), markup: markup };
};

/**
 * Get markup from a closest ancestor table to node.
 *
 * Returns a string or null if no ancestor table exists.
 *
 * @param  {Element}      node
 * @param  {FTCopyOpts}   options
 * @return {FTCopyResult}
 */
Foxtrick.util.htMl.getTable = function(node, options) {
	var table = null;

	let currentObj = node;
	while (currentObj) {
		if (currentObj.nodeName.toLowerCase() === 'table') {
			table = currentObj;
			break;
		}
		currentObj = currentObj.parentElement;
	}

	if (table !== null) {
		let markup = Foxtrick.util.htMl.getMarkupFromNode(table, options);
		markup = markup.trim();
		return { copyTitle: Foxtrick.L10n.getString('copy.table'), markup: markup };
	}

	return null;
};
