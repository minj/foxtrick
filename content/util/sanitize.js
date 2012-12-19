'use strict';
/*
 * sanitize.js
 * Utilities for removing dangerous code from href/html. whitelist-based
 * @author:  based on http://refactormycode.com/codes/333-sanitize-html
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};
if (!Foxtrick.util.sanitize)
	Foxtrick.util.sanitize = {};


Foxtrick.util.sanitize.addHTML = function(doc, html, target) {
	if (Foxtrick.arch == 'Gecko') {
		target.textConent = '';
		var fragment;
		try {
			// FF13+
			fragment = Components.classes['@mozilla.org/parserutils;1']
				.getService(Components.interfaces.nsIParserUtils)
				.parseFragment(html, 0, false, null, doc.documentElement);
		}
		catch (e) {
			// older FF
			fragment = Components.classes['@mozilla.org/feed-unescapehtml;1']
				.getService(Components.interfaces.nsIScriptableUnescapeHTML)
				.parseFragment(html, false, null, doc.documentElement);
		}
		return target.appendChild(fragment);
	}
	else {
		target.innerHTML = Foxtrick.util.sanitize.parseHtml(html);
		return target;
	}
};


// only local web, http(s) or internal links
Foxtrick.util.sanitize._whitelist_url =
	new RegExp('[\/|https?:\/\/|' + Foxtrick.InternalPath.replace(/\//g, '\\/')
	           .replace(/-/g, '\\-') + '][-a-z0-9+&@#\\/%\\?=~_\\|!:,.;\\(\\)\\[\\]]+', 'i');

Foxtrick.util.sanitize.parseUrl = function(url) {
	if (url && Foxtrick.util.sanitize._whitelist_url.test(url))
		return url.match(Foxtrick.util.sanitize._whitelist_url)[0];
	else
		return '';
};

// <summary>
// sanitize any potentially dangerous tags from the provided raw HTML input using
// a whitelist based approach, leaving the 'safe' HTML tags
// CODESNIPPET:4100A61A-1711-4366-B0B0-144D1179A937
// </summary>
// only allow harmless tags, no attributes other than maybe title, alt, width & height
// and save href/src for a & img and what we use in forum preview
Foxtrick.util.sanitize._tags = new RegExp('<[^>]*(>|$)', 'g');
Foxtrick.util.sanitize._whitelist = /^<\/?(b(lockquote)?|code|d(d|t|l|el)|em|h(1|2|3)|i|u|kbd|li|ol|p(re)?|s(ub|up|trong|trike)?|ul|t(able|body|h|r|d))(\s+colspan=(\d+|(\"|\')[^\"\'<>]+(\"|\')))?(\s+class=(\"|\')[^\"\'<>]+(\"|\'))?\s?>$|^<(b|h)r\s?\/?>$|^<div class=\'quoteto\'>$|^<\/div>|<blockquote class='spoiler hidden' style='display:block!important'>/i;
Foxtrick.util.sanitize._whitelist_a = /^<a\shref=([\"\'])(?:#[-a-z0-9_]*?|(?:(?:https?|ftp|foxtrick):\/\/|\/)[-a-z0-9+&@#\/%\?=~_\|!:,\.;\(\)]+)\1(?:\s+title=([\"\'])[^<>]*?\2)?(?:\s+target=([\"\'])[^<>]*?\3)?(?:\s+class=([\"\'])[^<>]*?\4)?\s*?>$|^<\/a>$/i;
Foxtrick.util.sanitize._whitelist_img = /^<img\ssrc=(\"|\')(https?|foxtrick):\/\/[-a-z0-9+&@#\/%\?=~_\|!:,\.;\(\)]+(\"|\')(\s+width=\"\d{1,3}\")?(\s+height=\"\d{1,3}\")?(\s+alt=(\"|\')[^\"\'<>]+(\"|\'))?(\s+title=(\"|\')[^\"\'<>]+(\"|\'))?\s?>$/i;

Foxtrick.util.sanitize.parseHtml = function(html) {
	try {
		if (html === null || html === '')
			return html;
		// match every HTML tag in the input
		var tags = html.match(Foxtrick.util.sanitize._tags);
		if (!tags)
			return html;

		for (var i = 0; i < tags.length; ++i) {
			var tag = tags[i];
			var tagname = tag.toLowerCase();

			if (!(Foxtrick.util.sanitize._whitelist.test(tagname)
				|| Foxtrick.util.sanitize._whitelist_a.test(tagname)
				|| Foxtrick.util.sanitize._whitelist_img.test(tagname))) {
				html = html.replace(tag, '');
				Foxtrick.log('tag sanitized: ' + tagname);
			}
		}
		return html;

	} catch (e) {
		Foxtrick.log(e);
		return '';
	}
};
