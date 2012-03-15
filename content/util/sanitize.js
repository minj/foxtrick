"use strict";
/*
 * sanitize.js
 * Utilities for removing dangerous code from href/html. whitelist-based
 * @author:  based on http://refactormycode.com/codes/333-sanitize-html
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};

// only local web, http(s) or internal links
Foxtrick.util._whitelist_url = new RegExp("[\/|https?:\/\/|"+Foxtrick.InternalPath.replace(/\//g,'\\/').replace(/-/g,'\\-')+"][-a-z0-9+&@#\\/%\\?=~_\\|!:,.;\\(\\)\\[\\]]+",'i');

Foxtrick.util.sanitizeUrl = function(url) {
	if (url && Foxtrick.util._whitelist_url.test(url))
		return url.match(Foxtrick.util._whitelist_url)[0];
	else
		return '';
}

// <summary>
// sanitize any potentially dangerous tags from the provided raw HTML input using 
// a whitelist based approach, leaving the "safe" HTML tags
// CODESNIPPET:4100A61A-1711-4366-B0B0-144D1179A937
// </summary>
// only allow harmless tags, no attributes other than maybe title, alt, width & height and save href/src for a & img and what we use in forum preview
Foxtrick.util._tags = new RegExp("<[^>]*(>|$)",'g');
Foxtrick.util._whitelist = /^<\/?(b(lockquote)?|code|d(d|t|l|el)|em|h(1|2|3)|i|u|kbd|li|ol|p(re)?|s(ub|up|trong|trike)?|ul|t(able|body|h|r|d))(\s+colspan=(\d+|(\"|\')[^\"\'<>]+(\"|\')))?(\s+class=(\"|\')[^\"\'<>]+(\"|\'))?\s?>$|^<(b|h)r\s?\/?>$|^<div class=\'quoteto\'>$|^<\/div>|<blockquote class='spoiler hidden' style='display:block!important'>/i;
Foxtrick.util._whitelist_a = /^<a\shref=(\"|\')(#[-a-z0-9_]+|((https?|ftp|foxtrick):\/\/|\/)[-a-z0-9+&@#\/%\?=~_\|!:,\.;\(\)]+)(\"|\')(\s+title=(\"|\')[^\"\'<>]+(\"|\'))?(\s+target=(\"|\')[^\"\'<>]+(\"|\'))?(\s+class=(\"|\')[^\"\'<>]+(\"|\'))?\s?>$|^<\/a>$/i;
Foxtrick.util._whitelist_img = /^<img\ssrc=(\"|\')(https?|foxtrick):\/\/[-a-z0-9+&@#\/%\?=~_\|!:,\.;\(\)]+(\"|\')(\s+width=\"\d{1,3}\")?(\s+height=\"\d{1,3}\")?(\s+alt=(\"|\')[^\"\'<>]+(\"|\'))?(\s+title=(\"|\')[^\"\'<>]+(\"|\'))?\s?>$/i;

Foxtrick.util.sanitizeHTML = function(html) {
  try {
	if (html === null || html === '') 
		return html;
	// match every HTML tag in the input
	var tags = html.match(Foxtrick.util._tags);
	if (!tags)
		return html;
	
	for (var i = 0; i < tags.length ; ++i)
	{
		var tag = tags[i];
		var tagname = tag.toLowerCase();
		
		if( !( Foxtrick.util._whitelist.test(tagname) 
			|| Foxtrick.util._whitelist_a.test(tagname) 
			|| Foxtrick.util._whitelist_img.test(tagname) ))
		{
			html = html.replace(tag,'');
			Foxtrick.log("tag sanitized: " + tagname);
		}
	}
	return html;
	
  } catch(e) {
	Foxtrick.log(e);
	return "";
  }
};
