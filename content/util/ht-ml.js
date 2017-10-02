'use strict';
/*
 * ht-ml.js
 * Utilities for HT-ML (Hattrick Markup Language)
 * @author ryanli, LA-MJ
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.htMl = {};

/**
 * Get the language definition for a specific markup language
 * @param  {string} format
 * @return {object}        {?object}
 */
Foxtrick.util.htMl.getFormat = function(format) {
	if (format)
		return {};
	return null;
};
Foxtrick.util.htMl.getFormat = (function() {
	var formats = {};
	/**
	 * HT-ML language definition.
	 * @type {object}
	 */
	formats['htMl'] = {
		/**
		 * These nodes are considered stand-alone elements
		 * They are called as tag(node).
		 * returning null here falls back to recursive (container) mode.
		 * @type {object}
		 */
		el: {
			/**
			 * function called for each element.
			 * returning null falls back to recursive (container) mode
			 * @param  {element} node
			 * @return {string}       {?string}
			 */
			img: function(node) {
				if (node.hasAttribute('alt') && node.getAttribute('alt') !== '') {
					return ' [\u2060' + node.getAttribute('alt') + '\u2060] ';
				}
				else if (node.hasAttribute('title') && node.getAttribute('title') !== '') {
					return ' [\u2060' + node.getAttribute('title') + '\u2060] ';
				}
				else {
					return '';
				}
			},
			hr: function() {
				return '\n[hr]';
			},
			br: function() {
				return '\n';
			},
			pre: function(node) {
				return Foxtrick.format('[pre]{}[/pre]', [node.textContent]);
			},
		},
		/**
		 * These nodes are considered element containers
		 * They are called as tag(content, node, opts).
		 * @type {object}
		 */
		cont: {
			/**
			 * function called for each container
			 * @param  {string}  content
			 * @param  {element} node
			 * @param  {object}  opts
			 * @return {string}          {?string}
			 */
			a: function(content, node, opts) {
				if (node.href) {
					var a = Foxtrick.util.htMl._parseLink(node);
					if (!a.type) {
						// stop if we care about links only
						if (opts.linksOnly) {
							return null;
						}
						content = a.text || content || '';
						if (content && /^javascript:/.test(node.href)) {
							content = '[u]' + content + '[/u]';
						}
					}
					else {
						if (opts.external) {
							if (/^foxtrick:/.test(a.url)) {
								return a.url;
							}
							content = Foxtrick.goToUrl(a.url);
						}
						else {
							content = Foxtrick.format('[{}={}]', [a.type, a.id || a.url]);
						}
						// add text if interesting
						if (!opts.linksOnly && a.text) {
							// strip surrounding '(' and '...blabla)' that's used to shorten urls
							var stripped = a.text.replace(/^\(|(\.\.\..*)?\)$/g, '');

							if (a.type === 'link') {
								// test whether link text is just an URL (i. e. from forum post)
								var path = stripped;

								if (/^\/\//.test(path)) {
									// add protocol if missing
									path = node.ownerDocument.location.protocol + path;
								}

								if (Foxtrick.isHtUrl(path)) {
									// a.url is relative for HT links
									path = path.replace(/^\w+:\/\/.+?(\/.*)/, '$1');
								}

								// using a RegExp to enforce case-insensitivity
								var pathRe = new RegExp('^' + Foxtrick.strToRe(path), 'i');
								if (!pathRe.test(a.url)) {
									// link text is not a URL
									content = Foxtrick.format('{} {}', [stripped, content]);
								}
							}
							else if (stripped !== a.id) {
								// link text is not an ID
								// e. g. <a href="?playerid=1">Name Surname</a> ->
								// Name Surname [playerid=1]
								content = Foxtrick.format('{} {}', [stripped, content]);
							}
						}
					}
				}
				return content;
			},
			blockquote: function(content, node) {
				var tag = Foxtrick.hasClass(node, 'spoiler') ? 'spoiler' : 'q';
				return Foxtrick.format('[{}]', [tag]) + content.trim() +
					Foxtrick.format('[/{}]', [tag]);
			},
			b: function(content) {
				return '[b]' + content.trim() + '[/b]';
			},
			i: function(content) {
				return '[i]' + content.trim() + '[/i]';
			},
			td: function(content, node) {
				var nodeName = node.nodeName.toLowerCase();
				var colspan = '';
				var rowspan = '';
				var align = '';
				if (node.hasAttribute('colspan') && node.getAttribute('colspan') !== '') {
					colspan = ' colspan=' + node.getAttribute('colspan');
				}
				if (node.hasAttribute('rowspan') && node.getAttribute('rowspan') !== '') {
					rowspan = ' rowspan=' + node.getAttribute('rowspan');
				}
				if (Foxtrick.hasClass(node, 'center')) {
					align = ' align=center';
				}
				else if (Foxtrick.hasClass(node, 'left')) {
					align = ' align=left';
				}
				else if (Foxtrick.hasClass(node, 'right')) {
					align = ' align=right';
				}
				return '[' + nodeName + colspan + rowspan + align + ']' + content.trim() +
					'[/' + nodeName + ']';
			},
			table: function(content, node) {
				var nodeName = node.nodeName.toLowerCase();
				// trim white-space between td/th tags
				content = content.trim().replace(/(\[\/t[dh]\])\s+/g, '$1');
				return Foxtrick.format('[{0}]{1}[/{0}]\n', [nodeName, content]);
			},
			// pure html
			u: function(content, node) {
				var tag = node.nodeName.toLowerCase();
				return Foxtrick.format('[{0}]{1}[/{0}]', [tag, content.trim()]);
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
	 * @type {object}
	 */
	formats['md'] = {
		/**
		 * These nodes are considered stand-alone elements
		 * They are called as tag(node).
		 * returning null here falls back to recursive (container) mode.
		 * @type {object}
		 */
		el: {
			/**
			 * function called for each element.
			 * returning null falls back to recursive (container) mode
			 * @param  {element} node
			 * @return {string}       {?string}
			 */
			img: function(node) {
				var alt = '';
				if (node.hasAttribute('alt') && node.getAttribute('alt') !== '') {
					alt = node.alt;
				}
				else if (node.hasAttribute('title') && node.getAttribute('title') !== '') {
					alt = node.title;
				}
				return Foxtrick.format(' ![{}]({}) ', [alt, node.src]);
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
		 * @type {object}
		 */
		cont: {
			/**
			 * function called for each container
			 * @param  {string}  content
			 * @param  {element} node
			 * @param  {object}  opts
			 * @return {string}          {?string}
			 */
			a: function(content, node, opts) {
				if (node.href) {
					var a = Foxtrick.util.htMl._parseLink(node);
					if (!a.type) {
						// stop if we care about links only
						if (opts.linksOnly) {
							return null;
						}
						content = content || a.text || '';
						if (content && /^javascript:/.test(node.href)) {
							content = '_' + content.trim() + '_ ';
						}
					}
					else {
						if (opts.external) {
							if (/^foxtrick:/.test(a.url)) {
								return a.url;
							}
							a.url = Foxtrick.goToUrl(a.url);
						}
						var text = a.id ? '(' + a.id + ')' : a.text || content;
						content = Foxtrick.format('[{}]({})', [text, a.url]);
					}
				}
				return content;
			},
			li: function(content) {
				// README: this does not really work with the aggressive trimming strategy
				// multi-line and multi-level LIs are messed up
				return '* ' + Foxtrick.prepad(content, '  ').trim();
			},
			h1: function(content, node) {
				var hCt = parseInt(node.nodeName.match(/\d/), 10);
				var heading = Foxtrick.repeat('#', hCt);

				return heading + ' ' + content.replace(/\n/g, ' ');
			},
			td: function(content, node) {
				var nodeName = node.nodeName.toLowerCase();
				// README: colspan and rowspan do not work in MD
				// align works on th only

				// no line-feeds in md tables!
				content = content.replace(/\n/g, ' ');
				var ret = content.trim().replace(/\|/g, '\\|');
				if (nodeName == 'th') {
					if (Foxtrick.hasClass(node, 'center')) {
						ret = ':' + ret + ':';
					}
					else if (Foxtrick.hasClass(node, 'right')) {
						ret = ret + ':';
					}
					else {
						ret = ':' + ret;
					}
				}
				// outer loop also adds ' ' to the left
				return '\u2060\u2060' + ret;
			},
			tr: function(content) {
				var header = null;
				content += ' \u2060\u2060';
				var cells = content.split(/ \u2060\u2060/g).slice(1, -1);
				var headers = content.match(/ \u2060{2}:|: \u2060{2}/g);
				if (headers) {
					if (headers.length == cells.length) {
						// full header row
						header = cells.reduce(function(h, cell, i, cells) {
							// generate header cell
							var ret = '---';
							ret = cell.replace(/^(:?)(.*?)(:?)$/, '$1' + ret + '$3');
							// fix original
							cells[i] = cells[i].replace(/^:|:$/g, '');
							// append
							return h + ret + ' | ';
						}, '| ');
					}
					else {
						// skip incomplete headers: remove header markers
						cells = Foxtrick.map(function(cell) {
							return cell.replace(/^:|:$/g, '');
						}, cells);
					}
				}
				var ret = '| ' + cells.join(' | ') + ' |\n';
				if (header)
					ret += header + '\n';
				return ret;
			},
			table: function(content) {
				var lines = content.split(/\n/);
				if (!/\| :?---:? \|/.test(lines[1])) {
					// no header, generate fake
					var cellCts = Foxtrick.map(function(line) {
						// simulating lookbehind to avoid previously escaped '|'
						var m = line.split('').reverse().join('').match(/ \|(?!\\)/g);
						if (m)
							return m.length;

						return 0;
					}, lines);
					var cellCt = Math.max.apply(null, cellCts);
					var line0 = Foxtrick.repeat('| ', cellCt) + '|';
					var line1 = Foxtrick.repeat('| --- ', cellCt) + '|';
					lines.unshift(line0, line1);
					content = lines.join('\n');
				}
				return '\n' + content + '\n';
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
				this.strike = this.del = this.s;
				this._needsInit = false;
			},
		},
	};
	return function(format) {
		var def = formats[format];
		if (def) {
			for (var type in def) {
				if (def[type]._needsInit) {
					def[type]._init();
				}
			}
			return def;
		}
		return null;
	};
})();

/**
 * Parse HT-ML ID from a link.
 * Traverses up the tree from node until the first link is found.
 * Returns {id, markup, type, copyTitle, ?tag}.
 * Returns null if no link was found,
 * the found link was invalid (javascript: or SVG),
 * or the link URL does not contain a HT-ML ID.
 * @param  {element} node
 * @return {object}       ?{id, markup, type, copyTitle, ?tag}
 */
Foxtrick.util.htMl.getId = function(node) {

	// ['title', RE, 'tag']
	// first match first serve
	// a missing tag suppresses url.text conversion
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
	var currentObj = node;
	while (currentObj) {
		if (currentObj.href !== undefined) {
			link = currentObj.href;
			break;
		}
		currentObj = currentObj.parentNode;
	}

	if (typeof link !== 'string' || /^javascript/i.test(link)) {
		// not found or JS or SVG link
		return null;
	}

	for (var spec of HT_ID_TYPES) {
		var type = spec[0];
		var re = spec[1];
		var tag = spec[2];

		if (!re.test(link))
			continue;

		var match = link.match(re);
		var ids = match.slice(1);
		var id = ids.join('.');
		var copyTitle = COPY_TEXT.replace('%s', type + ' ID').replace('%i', id);

		var ret = {
			id: id,
			markup: id,
			type: type,
			copyTitle: copyTitle,
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
 * @param  {element} node
 * @param  {object}  options {external, linksOnly: boolean, format: string}
 * @return {string}          {?string}
 */
Foxtrick.util.htMl.getLink = function(node, options) {
	node = Foxtrick.util.htMl._findNode(node);
	if (node.nodeName.toLowerCase() !== 'a')
		return null;

	var opts = {
		external: false,
		format: 'htMl',
		linksOnly: true,
	};
	Foxtrick.mergeValid(opts, options);

	var copyTitle = opts.external ? 'copy.external' : 'copy.link';
	// reference to format definition
	var format = Foxtrick.util.htMl.getFormat(opts.format);
	var markup = format.cont.a('', node, opts);
	if (markup)
		return { copyTitle: Foxtrick.L10n.getString(copyTitle), markup: markup };
	else
		return null;
};

/**
 * Parse a link node to retrieve basic information.
 * Returns { type, id, url, text }.
 * type is null for useless links, HT ID type for ID-links or 'url' for others.
 * id is null in the last case.
 * @param  {HTMLAnchorElement} node
 * @return {object}                {type, id, url, text: ?string}
 */
Foxtrick.util.htMl._parseLink = function(node) {
	var idObj = Foxtrick.util.htMl.getId(node);
	var link = null;
	var currentObj = node;
	while (currentObj) {
		if (currentObj.href !== undefined) {
			link = currentObj.href;
			break;
		}
		currentObj = currentObj.parentNode;
	}
	var type = null;
	var url = null;
	var id = null;
	var text = null;
	if (idObj !== null && idObj.tag !== undefined) {
		id = idObj.id;
		type = idObj.tag;
	}

	if (typeof(link) === 'string') {
		// don't override idObj
		if (!type) {
			type = 'link';
		}

		// if it's relative link of Hattrick, remove the host
		var relRe = /^https?:\/\/.+?(\/.*)/i;
		if (link.match(relRe) !== null && Foxtrick.isHtUrl(link)) {
			var matched = link.match(relRe);
			var relLink = matched[1];
			url = relLink;
		}
		else {
			url = link;
		}
		text = node.textContent.trim() || node.title || '';

		// ignore boring links
		var ignore = [
			/^\/Help\/Rules\/AppDenominations\.aspx/i,
			/^\/Help\/Supporter\//i,
			/^javascript:/,
		];
		if (Foxtrick.any(function(re) { return re.test(url); }, ignore))
			type = null;
	}
	else if (link !== null && typeof(link) === 'object') {
		// svg anchor
		text = currentObj.getAttribute('title');
		if (text)
			text = text.trim();
	}
	return { type: type, id: id, url: url, text: text };
};

/**
 * Find an appropriate node to start copying from
 * @param  {element} node
 * @return {element}
 */
Foxtrick.util.htMl._findNode = function(node) {
	if (node.nodeName.toLowerCase() === 'bdo') {
		// id links in forums use bdo wrappers that catch click events
		if (node.childNodes.length == 1 &&
		    node.firstChild.nodeType == Foxtrick.NodeTypes.TEXT_NODE)
			node = node.parentNode;
	}

	if (node.nodeName.toLowerCase() === 'img')
		node = node.parentNode;

	return node;
};

/**
 * Get markup from node.
 * Options is { external: boolean, format: string }.
 * external sets whether relative HT links are not used (defaults to false).
 * format is the markup language to use (defaults to htMl).
 * @param  {element} node
 * @param  {object}  options {external: boolean, format: string}
 * @return {string}
 */
Foxtrick.util.htMl.getMarkupFromNode = function(node, options) {
	node = Foxtrick.util.htMl._findNode(node);
	var opts = {
		external: false,
		format: 'htMl'
	};
	Foxtrick.mergeValid(opts, options);
	// reference to format definition
	var format = Foxtrick.util.htMl.getFormat(opts.format);
	var ret = Foxtrick.util.htMl._getMarkupRec(node, format, opts);
	// deprotect pre
	ret = ret.replace(/\u2060\/?pre\u2060/g, '\n');
	return ret.trim();
};

/**
 * Get markup from node recursively.
 * def is a reference to markup language definition.
 * opts is options for tag parsers.
 * @param  {element} node
 * @param  {object}  def  markup language definition
 * @param  {object}  opts tag parser options
 * @return {string}
 */
Foxtrick.util.htMl._getMarkupRec = function(node, def, opts) {
	if (node.nodeName === undefined) {
		return '';
	}

	var doc = node.ownerDocument;
	var win = doc.defaultView;

	var computedStyle = null;
	if (node.nodeType === Foxtrick.NodeTypes.ELEMENT_NODE) {
		computedStyle = win.getComputedStyle(node, null);
	}

	var display = computedStyle && computedStyle.getPropertyValue('display');
	if (display === 'none' && !Foxtrick.hasClass(node, 'spoiler')) {
		// don't skip hidden spoilers
		return '';
	}

	var nodeName = node.nodeName.toLowerCase();

	// junk
	if (nodeName === 'ul' && Foxtrick.hasClass(node, 'ft-popup-list')) {
		return '';
	}
	else if (nodeName === 'desc') {
		// svg description, useless in HT
		return '';
	}
	else if (nodeName === 'blockquote' && node.className === 'spoiler') {
		// skip spoiler teasers
		return '';
	}
	else {
		if (nodeName === 'pre') {
			// special treatment for pre
			// replace line breaks added by HT and take everything else as text
			var pre = Foxtrick.map(function(child) {
				if (child.nodeName.toLowerCase() == 'br') {
					return '\n';
				}
				return child.textContent;
			}, node.childNodes).join('');
			// protect pre by marking it with special 'tags'
			// using u2060 'word joiner' zero-width space
			var mark = String.fromCharCode(8288);
			// trimming only new-lines to prevent their proliferation
			var args = { m: mark, content: pre.replace(/^\n+|\n+$/g, '') };
			// rebind node so that original DOM is untouched
			node = doc.createTextNode(Foxtrick.format('{m}pre{m}{content}{m}/pre{m}', args));
		}
		// elements
		if (typeof def.el[nodeName] === 'function') {
			var elementMarkup = def.el[nodeName](node);
			if (elementMarkup !== null)
				return elementMarkup;
		}
	}

	var ret = '';

	if (!node.hasChildNodes()) {
		if (node.nodeType == Foxtrick.NodeTypes.TEXT_NODE) {
			// skip comments etc
			ret = node.textContent.replace(/\s+/gm, ' ').trim();
			if (ret.length) {
				// if valid text
				// add space if text does not start with punctuation
				// prepended white-space separates this element from other nodes
				ret = ret.replace(/^(?!["',.?!])/, ' ');
			}
		}
	}
	else {
		var children = node.childNodes;
		for (var i = 0; i < children.length; ++i) {
			// recursively get the content of child nodes
			var childMarkup = Foxtrick.util.htMl._getMarkupRec(children[i], def, opts);
			if (childMarkup != null)
				ret += childMarkup;
		}
	}

	// containers
	if (typeof def.cont[nodeName] === 'function') {
		var containerMarkup = def.cont[nodeName](ret, node, opts);
		if (containerMarkup === null)
			containerMarkup = '';

		// prepend white-space to separate this container from other nodes
		ret = ' ' + containerMarkup;
	}

	var blocks = ['h1', 'h2', 'h3', 'h4', 'blockquote'];
	if (display === 'block' ||
	    Foxtrick.any(function(t) { return nodeName === t; }, blocks)) {
		ret = '\n' + ret + '\n';
	}
	else if (display === 'list-item' || nodeName === 'li') {
		ret = ret + '\n';
	}

	// protect pre
	var parts = Foxtrick.map(function(ret) {
		if (/^\u2060pre\u2060/.test(ret)) {
			// no stripping in pre
			// restore end tag
			return ret += '\u2060/pre\u2060';
		}
		// standardize white-space (except LF)
		ret = ret.replace(/[ \f\r\t\v]+/g, ' ');
		// trim white-space around LFs
		ret = ret.replace(/\n /g, '\n').replace(/ \n/g, '\n');
		// no more than 2 LFs in a row
		ret = ret.replace(/\n{3,}/g, '\n\n');
		return ret;
	}, ret.split(/(?=\u2060pre\u2060)|\u2060\/pre\u2060/));
	return parts.join('');
};

/**
 * Get markup from selected node(s) in node's window
 * or a given node if no selection exists.
 * Options is { external: boolean, format: string }.
 * external sets whether relative HT links are not used (defaults to false).
 * format is the markup language to use (defaults to htMl).
 * @param  {element} node
 * @param  {object}  options {external: boolean, format: string}
 * @return {string}
 */
Foxtrick.util.htMl.getHtMl = function(node, options) {
	var win = node.ownerDocument.defaultView;
	var selection = win.getSelection();
	var markup = '';
	if (!selection.isCollapsed && selection.rangeCount > 0) {
		for (var i = 0; i < selection.rangeCount; ++i) {
			// in chrome computedStyle gets lost in cloneContents as it seems.
			var rangeNode = selection.getRangeAt(i).cloneContents();
			markup += Foxtrick.util.htMl.getMarkupFromNode(rangeNode, options);
			if (i !== selection.rangeCount - 1) {
				markup += '\n';
			}
		}
		markup = markup.trim();
		return { copyTitle: Foxtrick.L10n.getString('copy.ht-ml'), markup: markup };
	}
	else {
		markup = Foxtrick.util.htMl.getMarkupFromNode(node, options);
		markup = markup.trim();
		return { copyTitle: Foxtrick.L10n.getString('copy.ht-ml'), markup: markup };
	}
};

/**
 * Get markup from a closest ancestor table to node.
 * Returns a string or null if no ancestor table exists.
 * Options is { external: boolean, format: string }.
 * external sets whether relative HT links are not used (defaults to false).
 * format is the markup language to use (defaults to htMl).
 * @param  {element} node
 * @param  {object}  options {external: boolean, format: string}
 * @return {string}          {?string}
 */
Foxtrick.util.htMl.getTable = function(node, options) {
	var table = null;
	var currentObj = node;
	while (currentObj) {
		if (currentObj.nodeName.toLowerCase() === 'table') {
			table = currentObj;
			break;
		}
		currentObj = currentObj.parentNode;
	}
	if (table !== null) {
		var markup = Foxtrick.util.htMl.getMarkupFromNode(table, options);
		markup = markup.trim();
		return { copyTitle: Foxtrick.L10n.getString('copy.table'), markup: markup };
	}
	return null;
};
