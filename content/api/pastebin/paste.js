'use strict';
if (!Foxtrick.api)
	Foxtrick.api = {};
if (!Foxtrick.api.pastebin)
	Foxtrick.api.pastebin = {};

/**
 * Pastebin paste api access
 * Calls _generic and executes callback(response);
 * In case of success response is a URL to the pasted code.
 * failure(response, status) is called if the request fails
 * finalize(response, status) is always called
 * @param	{function}		callback	function to execute
 * @param	{String}		name		Name of the paste
 * @param	{String}		text		Text to be pasted
 * @param	{String}		type		Paste type (optional), defaults to 'public'.
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 */
Foxtrick.api.pastebin.paste = function(callback, name, text, type, failure, finalize) {
	var params = {
		api_option: 'paste',
		//api_user_key: this.api_user_key,
		api_dev_key: this.api_dev_key,
		api_paste_private: this.api_paste_private[type || 'public'],
		api_paste_expire_date: this.api_paste_expire_date,
		api_paste_format: this.api_paste_format,
		api_paste_name: encodeURIComponent(name),
		api_paste_code: encodeURIComponent(text),
	};

	Foxtrick.api.pastebin._generic(params.api_option, this.api_url, callback, params,
	                               failure, finalize);
};
