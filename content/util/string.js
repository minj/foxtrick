'use strict';
/*
 * string.js
 * Utilities for string processing
 */

if (!Foxtrick)
	var Foxtrick = {};

/**
 * Prepare a string to be used as regex.
 * Escapes some trivial cases of special regex characters.
 * @param  {string} str
 * @return {string}
 */
Foxtrick.strToRe = function(str) {
	return str.replace(/([[\](){}?+*.|^$])/g, '\\$1');
};

/**
 * Get a nested array representation of a nested tag in str.
 * Array elements are either strings (perhaps empty) or other arrays.
 * Strings may contain instances of nested tag in case they were unmatched.
 * opts is {start, end: string} (required)
 * @param  {string} str
 * @param  {object} opts {start, end: str}
 * @return {array}
 */
Foxtrick.parseNestedTag = function(str, opts) {
	var mArray, tag;
	if (!opts.re) {
		// initialize
		var start = Foxtrick.strToRe(opts.start);
		var end = Foxtrick.strToRe(opts.end);
		opts.re = new RegExp(start + '|' + end, 'g');
		opts.prevIndex = 0;

		// pre-pass to find unmatched starting tags
		var level = 0, maxLevel = 0;
		while ((mArray = opts.re.exec(str))) {
			tag = mArray[0];
			if (tag === opts.start) {
				level += 1;
				maxLevel = Math.max(maxLevel, level);
			}
			else if (tag === opts.end) {
				if (level) {
					// skip unmatched ending tags
					level -= 1;
				}
			}
			else {
				Foxtrick.error('parseNestedTag: incorrectly escaped regex for tag ' + tag);
				return [''];
			}
		}
		if (level) {
			// unmatched starting tags
			maxLevel -= level;
		}
		opts.maxLevel = maxLevel;
		opts.level = 0;
	}

	var nodes = [];
	while ((mArray = opts.re.exec(str))) {
		tag = mArray[0];
		var startIndex = opts.re.lastIndex - tag.length;
		// add any previous str (even if empty)
		var previousText = str.slice(opts.prevIndex, startIndex);
		nodes.push(previousText);
		opts.prevIndex = opts.re.lastIndex;
		if (tag === opts.start) {
			if (opts.level < opts.maxLevel) {
				opts.level += 1;
				// continue recursively
				nodes.push(Foxtrick.parseNestedTag(str, opts));
				opts.level -= 1;
				// update where recursion left off
				opts.prevIndex = opts.re.lastIndex;
			}
			else {
				// unmatched starting tag
				nodes.push(tag);
			}
		}
		else if (tag === opts.end) {
			if (!opts.level) {
				// unmatched ending tag
				nodes.push(tag);
			}
			else {
				// tag level finished, returning to previous stack frame
				return nodes;
			}
		}
	}
	// no more tags in str
	// add any ending text
	var endText = str.slice(opts.prevIndex);
	nodes.push(endText);
	return nodes;
};

/**
 * Remove escaping symbols used inside pre tags
 * @param  {string} string
 * @return {string}
 */
Foxtrick.unescapePre = function(string) {
	return string.replace(/([\[<])\u2060/g, '$1');
};

/**
 * Add escaping symbols inside pre tags
 * @param  {string} string
 * @return {string}
 */
Foxtrick.escapePre = function(string) {
	var joinNestedPre = function(arr) {
		var ret = '[pre]';
		Foxtrick.forEach(function(el) {
			if (typeof el === 'string') {
				ret += el;
				return;
			}
			// add pre tags recursively
			ret += joinNestedPre(el);
		}, arr);
		ret += '[/pre]';
		return ret;
	};

	var tokens = Foxtrick.parseNestedTag(string, { start: '[pre]', end: '[/pre]' });
	tokens = Foxtrick.map(function(token) {
		// unescaped level
		if (typeof token === 'string') {
			// deal with unmatched pre tags but leave others as is
			return token.replace(/\[(\/)?(?=pre\])/g, '[\u2060$1');
		}
		// join array
		var ret = Foxtrick.map(function(nToken) {
			// escaped level (inside pre)
			var ret;
			if (typeof nToken === 'string') {
				ret = nToken;
			}
			else {
				// add pre tags recursively
				ret = joinNestedPre(nToken);
			}
			// escape every tag inside pre
			return ret.replace(/([\[<])(?=\S)/g, '$1\u2060');
		}, token).join('');
		// wrap with first-level pre tags
		return Foxtrick.format('[pre]{}[/pre]', [ret]);
	}, tokens);
	return tokens.join('');
};

/** Remove any occurences of tags ('<something>') from text */
Foxtrick.stripHTML = function(text) {
	return text.replace(/(<([^>]+)>)/ig, '');
};

Foxtrick.trimnum = function(text) {
	text = String(text);
	return text ? parseInt(text.replace(/\D+|\s|&nbsp;|\u00a0/g, ''), 10) : 0;
};

Foxtrick.formatNumber = function(num, sep) {
	var digits = String(num).match(/\..+/);  // seperate digits
	if (digits == null) digits = '';
	var num = Number(num);
	num = Math.floor(num, 0);
	var negative = (num < 0);
	num = String(Math.abs(num));
	var output = num;
	if (sep === undefined) {
		sep = ' ';
	}
	if (num.length > 3) {
		var mod = num.length % 3;
		output = (num > 0 ? (num.substring(0, mod)) : '');
		for (var i = 0; i < Math.floor(num.length / 3); ++i) {
			if (mod == 0 && i == 0)
				output += num.substring(mod + 3 * i, mod + 3 * i + 3);
			else
				output += sep + num.substring(mod + 3 * i, mod + 3 * i + 3);
		}
	}
	if (negative)
		output = '-' + output;
	return output + digits; // add digits again
};

Foxtrick.substr_count = function(haystack, needle, offset, length) {
	// http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_substr_count/
	// Returns count of needle in a haystack.
	var pos = 0, cnt = 0;
	haystack += '';
	needle += '';
	if (isNaN(offset)) offset = 0;
	if (isNaN(length)) length = 0;
	offset--;
	while ((offset = haystack.indexOf(needle, offset + 1)) != -1) {
		if (length > 0 && (offset + needle.length) > length) {
			return false;
		}
		else {
			cnt++;
		}
	}
	return cnt;
};

Foxtrick.substr = function(f_string, f_start, f_length) {
	f_string += '';

	if (f_start < 0) {
		f_start += f_string.length;
	}

	if (f_length == undefined) {
		f_length = f_string.length;
	}
	else if (f_length < 0) {
		f_length += f_string.length;
	}
	else {
		f_length += f_start;
	}

	if (f_length < f_start) {
		f_length = f_start;
	}

	return f_string.substring(f_start, f_length);
};

Foxtrick.strrpos = function(haystack, needle, offset) {
	var i = (haystack + '').lastIndexOf(needle, offset); // returns -1
	return i >= 0 ? i : false;
};

Foxtrick.linebreak = function(txt, where) {
	try {
		if (txt == null) return '';
		txt = txt.replace(/\<br\>/gi, ' <br> ');
		var d = txt.split(' ');
		// Foxtrick.dump ('TEXT= [' + d + ']\n');
		for (var j = 0; j < d.length; j++) {
			//Foxtrick.dump(' LB [' + j + '] => "'+ d[j] + '"\n');
			if (d[j].length > where && d[j].search(/href\=|title\=/i) == -1) {
				d[j] = Foxtrick.cut_word(d[j], where);
				//Foxtrick.dump(' LB [' + j + '] <= "'+ d[j] + '"\n');
			}
		}
		return d.join(' ');
	}
	catch (e) {
		Foxtrick.dump('LINEBREAK: ' + e + '\n');
	}
};

Foxtrick.cut_word = function(txt, where) {
	try {
		if (txt == null) return '';
		txt = txt.replace(/\<\//g, ' </');
		var c, a = 0, g = 0, d = [];
		for (c = 0; c < txt.length; c++) {

			d[c + g] = txt[c];
			if (txt[c] != ' ') a++;
			else if (txt[c] == ' ') a = 0;
			if (a == where) {
				g++;
				d[c + g] = ' ';
				a = 0;
			}

		}
		return d.join('');
	}
	catch (e) {
		Foxtrick.dump('CUT WORD: ' + e + '\n');
	}
};
/*
 * Split a long line into multiple portions
 * E. g.:
 * portions[0] + lineEnd + lineStart + portions[1] + lineEnd + ...
 * @param length integer maximum length of one block (lineStart+portion+lineEnd)
 * @param recursive boolean whether to nest proceding lines with multiple lineStarts
 */
Foxtrick.foldLines = function(string, length, lineEnd, lineStart, recursive) {
	var sLength = string.length;
	var i = 0, prepend = '';
	var ret = '', portion = '';
	while (i < sLength) {
		portion = string.substr(i, length - (prepend.length + lineEnd.length));
		ret += prepend + portion + lineEnd;
		if (recursive || !i) prepend += lineStart;
		i += portion.length;
	}
	return ret;
};

/**
 * Pre-pad each line in a given textblock with pre
 * @param  {string} textblock
 * @param  {string} pre
 * @return {string}
 */
Foxtrick.prepad = function(textblock, pre) {
	return textblock.trim().replace(/^/mg, pre);
};

/**
 * Repeat str num times
 * @param  {string} str
 * @param  {number} num
 * @return {string}
 */
Foxtrick.repeat = function(str, num) {
	var ret = '';
	str = String(str);
	for (var i = 0; i < num; i++)
		ret += str;
	return ret;
};

/**
 * Format a string by replacing instances of '{}' with arbitrary values.
 * Works similarly to python's string.format:
 * If args is an array, replaces '{}', '{0}', '{1}', etc.
 * If args is an object, replaces '{property1}', '{property2}', etc
 * @param  {string}       str
 * @param  {array|object} args array or object
 * @return {string}
 */
Foxtrick.format = function(str, args) {
	if (Array.isArray(args)) {
		Foxtrick.forEach(function(arg, i) {
			str = str.replace('{}', arg);
			str = str.replace(new RegExp('\\{' + i + '\\}', 'g'), arg);
		}, args);
	}
	else {
		for (var arg in args) {
			if (args.hasOwnProperty(arg))
				str = str.replace(new RegExp('\\{' + arg + '\\}', 'g'), args[arg]);
		}
	}
	return str;
};

/**
 * Convert a HT URL to a domain agnostic (goto.ashx?path=) URL.
 * Non-HT URLs are left unchanged.
 * Domain-relative URLs are always considered HT URLs.
 * @param  {string} url
 * @return {string}
 */
Foxtrick.goToUrl = function(url) {
	if (/^\/\//.test(url)) {
		// revert domain-agnostic URLs for easier handling
		url = 'https:' + url;
	}
	if (Foxtrick.isHtUrl(url) || /^\//.test(url)) {
		var path = url.replace(/^\w+:\/\/.+?(\/|$)/, '/');
		url = 'https://www.hattrick.org/goto.ashx?path=' + encodeURIComponent(path);
	}
	return url;
};

/**
 * Get a HT URL to a specific post in the forum.
 * postId ex: 123456.1
 * @param  {string} postId 123456.1
 * @return {string}
 */
Foxtrick.getForumUrl = function(postId) {
	var template = 'https://stage.hattrick.org/Forum/Read.aspx?t={}&n={}&v=0';
	var post = postId.match(/(\d+)\.(\d+)/);
	if (!post)
		return null;

	var url = Foxtrick.format(template, Foxtrick.toArray(post).slice(1));
	return Foxtrick.goToUrl(url);
};

/* jshint -W016 */
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */
Foxtrick.hash = function(s) {
	/*
	 * Configurable variables. You may need to tweak these to be compatible with
	 * the server-side, but the defaults work in most cases.
	 */
	var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */

	/*
	 * Calculate the SHA1 of a raw string
	 */
	var rstr_sha1 = function(s)
	{
		return binb2rstr(binb_sha1(rstr2binb(s), s.length * 8));
	};

	/*
	 * Convert a raw string to a hex string
	 */
	var rstr2hex = function(input)
	{
		try { hexcase } catch (e) { hexcase = 0; }
		var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
		var output = '';
		var x;
		for (var i = 0; i < input.length; i++)
		{
			x = input.charCodeAt(i);
			output += hex_tab.charAt((x >>> 4) & 0x0F)
						 +  hex_tab.charAt(x        & 0x0F);
		}
		return output;
	};
	/*
	 * Encode a string as utf-8.
	 * For efficiency, this assumes the input is valid utf-16.
	 */
	var str2rstr_utf8 = function(input)
	{
		var output = '';
		var i = -1;
		var x, y;

		while (++i < input.length)
		{
			/* Decode utf-16 surrogate pairs */
			x = input.charCodeAt(i);
			y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
			if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
			{
				x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
				i++;
			}

			/* Encode output as utf-8 */
			if (x <= 0x7F)
				output += String.fromCharCode(x);
			else if (x <= 0x7FF)
				output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
																			0x80 | (x         & 0x3F));
			else if (x <= 0xFFFF)
				output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
																			0x80 | ((x >>> 6) & 0x3F),
																			0x80 | (x         & 0x3F));
			else if (x <= 0x1FFFFF)
				output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
																			0x80 | ((x >>> 12) & 0x3F),
																			0x80 | ((x >>> 6) & 0x3F),
																			0x80 | (x         & 0x3F));
		}
		return output;
	};

	/*
	 * Convert a raw string to an array of big-endian words
	 * Characters >255 have their high-byte silently ignored.
	 */
	var rstr2binb = function(input)
	{
		var output = Array(input.length >> 2);
		for (var i = 0; i < output.length; i++)
			output[i] = 0;
		for (var i = 0; i < input.length * 8; i += 8)
			output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
		return output;
	};

	/*
	 * Convert an array of big-endian words to a string
	 */
	var binb2rstr = function(input)
	{
		var output = '';
		for (var i = 0; i < input.length * 32; i += 8)
			output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
		return output;
	};

	/*
	 * Calculate the SHA-1 of an array of big-endian words, and a bit length
	 */
	var binb_sha1 = function(x, len)
	{
		/* append padding */
		x[len >> 5] |= 0x80 << (24 - len % 32);
		x[((len + 64 >> 9) << 4) + 15] = len;

		var w = Array(80);
		var a =  1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d =  271733878;
		var e = -1009589776;

		for (var i = 0; i < x.length; i += 16)
		{
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;
			var olde = e;

			for (var j = 0; j < 80; j++)
			{
				if (j < 16) w[j] = x[i + j];
				else w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
				var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
												 safe_add(safe_add(e, w[j]), sha1_kt(j)));
				e = d;
				d = c;
				c = bit_rol(b, 30);
				b = a;
				a = t;
			}

			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
			e = safe_add(e, olde);
		}
		return Array(a, b, c, d, e);

	};

	/*
	 * Perform the appropriate triplet combination function for the current
	 * iteration
	 */
	var sha1_ft = function(t, b, c, d)
	{
		if (t < 20) return (b & c) | ((~b) & d);
		if (t < 40) return b ^ c ^ d;
		if (t < 60) return (b & c) | (b & d) | (c & d);
		return b ^ c ^ d;
	};

	/*
	 * Determine the appropriate additive constant for the current iteration
	 */
	var sha1_kt = function(t)
	{
		return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
					 (t < 60) ? -1894007588 : -899497514;
	};

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	var safe_add = function(x, y)
	{
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	};

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	var bit_rol = function(num, cnt)
	{
		return (num << cnt) | (num >>> (32 - cnt));
	};

	return rstr2hex(rstr_sha1(str2rstr_utf8(s)));
};
/* jshint +W016 */
