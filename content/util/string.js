"use strict";
/*
 * string.js
 * Utilities for string processing
 */

if (!Foxtrick) var Foxtrick = {};

/** Remove any occurences of tags ("<something>") from text */
Foxtrick.stripHTML = function(text) {
	return text.replace(/(<([^>]+)>)/ig,"");
}

Foxtrick.trim = function (text) {
	return text.replace(/^\s+|\s+$|&nbsp;|\u00a0/g,"");
}

Foxtrick.trimnum = function(text) {
	text = String(text);
	return text ? parseInt(text.replace(/\D+|\s|&nbsp;|\u00a0/g, "")) : 0;
}

Foxtrick.formatNumber = function(num, sep) {
	var digits = String(num).match(/\..+/);  // seperate digits
	if (digits == null) digits = '';
	var num = Number(num);
	num = Math.floor(num, 0)
	var negative = (num < 0);
	num = String(Math.abs(num));
	var output = num;
	if (sep === undefined) {
		sep = " ";
	}
	if (num.length > 3) {
		var mod = num.length % 3;
		output = (num > 0 ? (num.substring(0, mod)) : "");
		for (var i = 0; i < Math.floor(num.length / 3); ++i) {
			if (mod == 0 && i == 0)
				output += num.substring(mod+ 3 * i, mod + 3 * i + 3);
			else
				output += sep + num.substring(mod + 3 * i, mod + 3 * i + 3);
		}
	}
	if (negative)
		output = "-" + output;
	return output + digits; // add digits again
}

Foxtrick.substr_count = function (haystack, needle, offset, length) {
	// http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_substr_count/
	// Returns count of needle in a haystack.
	var pos = 0, cnt = 0;
	haystack += '';
	needle += '';
	if(isNaN(offset)) offset = 0;
	if(isNaN(length)) length = 0;
	offset--;
	while ((offset = haystack.indexOf(needle, offset+1)) != -1) {
		if (length > 0 && (offset+needle.length) > length) {
			return false;
		}
		else {
			cnt++;
		}
	}
	return cnt;
}

Foxtrick.substr = function(f_string, f_start, f_length) {
	f_string += '';

	if(f_start < 0) {
		f_start += f_string.length;
	}

	if(f_length == undefined) {
		f_length = f_string.length;
	}
	else if (f_length < 0){
		f_length += f_string.length;
	}
	else {
		f_length += f_start;
	}

	if (f_length < f_start) {
		f_length = f_start;
	}

	return f_string.substring(f_start, f_length);
}

Foxtrick.strrpos = function(haystack, needle, offset){
	var i = (haystack+'').lastIndexOf(needle, offset); // returns -1
	return i >= 0 ? i : false;
}

Foxtrick.linebreak = function (txt, where) {
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
		return d.join(" ");
	}
	catch (e) {
		Foxtrick.dump('LINEBREAK: ' + e + '\n');
	}
}

Foxtrick.cut_word = function (txt, where) {
	try {
		if (txt == null) return '';
		txt = txt.replace(/\<\//g, ' </')
		var c, a=0, g=0, d = new Array();
		for (c = 0; c < txt.length; c++) {

			d[c + g] = txt[c];
			if (txt[c] != " ") a++;
			else if (txt[c] == " ") a = 0;
			if (a == where) {
				g++;
				d[c+g] = " ";
				a = 0;
			}

		}
		return d.join("");
	}
	catch (e) {
		Foxtrick.dump('CUT WORD: ' + e + '\n');
	}
}

/*
 * Split a long line into multiple portions
 * E. g. :
 * portions[0] + lineEnd + lineStart + portions[1] + lineEnd + ...
 * @param length integer maximum length of one block (lineStart+portion+lineEnd)
 * @param recursive boolean whether to nest proceding lines with multiple lineStarts
 */
Foxtrick.foldLines = function (string, length, lineEnd, lineStart, recursive) {
	var sLength = string.length;
	var i = 0, prepend = '';
	var ret = '', portion ='';
	while (i < sLength) {
		portion = string.substr(i, length - (prepend.length + lineEnd.length));
		ret += prepend + portion + lineEnd;
		if (recursive || !i) prepend += lineStart;
		i += portion.length;
	}
	return ret;
}
