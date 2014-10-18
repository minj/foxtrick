'use strict';
if (!Foxtrick)
	var Foxtrick = this.Foxtrick;
if (!Foxtrick.api)
	Foxtrick.api = {};
if (!Foxtrick.api.pastebin)
	Foxtrick.api.pastebin = {};

/**
 * Retrieve pastebin pasted text as raw string
 * This isn't technically an API function, just a simple get request
 * Calls _generic and executes callback(response);
 * In case of success response is a the raw text of the paste
 * failure(response, status) is called if the request fails
 * finalize(response, status) is always called
 * @param	{function}		callback	function to execute
 * @param	{String}		paste_key	the pastebin paste_key
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 */
Foxtrick.api.pastebin.get = function(callback, paste_key, failure, finalize) {
	Foxtrick.api.pastebin._generic('get', this.api_get_url, callback, { i: paste_key },
	                               failure, finalize);
};
