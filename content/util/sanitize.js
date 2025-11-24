/**
 * sanitize.js
 * Utilities for removing dangerous code from href/html. whitelist-based
 * @author: based on http://refactormycode.com/codes/333-sanitize-html
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

Foxtrick.util.sanitize = {};

Foxtrick.util.sanitize.addHTML = function(doc, html, target) {
	target.innerHTML = Foxtrick.util.sanitize.parseHtml(html);
	return target;
};


// only local web, http(s), // or internal links
Foxtrick.util.sanitize._whitelistUrl =
	new RegExp('^((https?:)?//|/|' + Foxtrick.InternalPath + ')' +
	           '[-a-z0-9+&@#/%?=~_|!:,.;()[\\]]+', 'i');

Foxtrick.util.sanitize.parseUrl = function(url) {
	if (url && Foxtrick.util.sanitize._whitelistUrl.test(url))
		return url.match(Foxtrick.util.sanitize._whitelistUrl)[0];

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
Foxtrick.util.sanitize._whitelist = /^<\/?(b(lockquote)?|code|d(d|t|l|el)|em|h(1|2|3)|i|u|kbd|li|ol|p(re)?|s(ub|up|trong|trike)?|ul|t(able|body|h|r|d))(\s+?colspan=(\d+|['"][^"'<>]+['"]))?(\s+?class=['"][^"'<>]+['"])?(\s+?colspan=(\d+|['"][^"'<>]+['"]))?\s*?>$|^<[bh]r\s*?\/?>$|^<div class='quoteto'>$|^<\/div>|<blockquote class='spoiler hidden' style='display:block!important'>/i;
Foxtrick.util.sanitize._whitelistLink = /^<a\s+?href=(["'])(?:#[-a-z0-9_]*?|(?:(?:https?|ftp|foxtrick):\/\/|\/)[-a-z0-9+&@#/%?=~_|!:,.;()]+)\1(?:\s+?title=(["'])[^<>]*?\2)?(?:\s+?target=(["'])[^<>]*?\3)?(?:\s+?class=(["'])[^<>]*?\4)?\s*?>$|^<\/a>$/i;
Foxtrick.util.sanitize._whitelistImg = /^<img\s+?src=['"](https?|foxtrick):\/\/[-a-z0-9+&@#/%?=~_|!:,.;()]+['"](\s+?width="\d{1,3}")?(\s+?height="\d{1,3}")?(\s+?alt=['"][^"'<>]+['"])?(\s+?title=['"][^"'<>]+['"])?\s*?>$/i;

Foxtrick.util.sanitize.parseHtml = function(html) {
	try {
		if (html === null || html === '')
			return html;

		// match every HTML tag in the input
		let tags = html.match(Foxtrick.util.sanitize._tags);
		if (!tags)
			return html;

		let ret = html;

		for (let tag of tags) {
			let tagLower = tag.toLowerCase();

			if (!Foxtrick.util.sanitize._whitelist.test(tagLower) &&
			    !Foxtrick.util.sanitize._whitelistLink.test(tagLower) &&
			    !Foxtrick.util.sanitize._whitelistImg.test(tagLower)) {

				ret = ret.replace(tag, '');
				Foxtrick.log('tag sanitized: ' + tagLower);
			}
		}
		return ret;

	}
	catch (e) {
		Foxtrick.log(e);
		return '';
	}
};
