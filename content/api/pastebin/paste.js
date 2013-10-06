if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.api)
	Foxtrick.api = {};
if (!Foxtrick.api.pastebin)
	Foxtrick.api.pastebin = {};

/**
 * Pastebin paste api access
 * Calls _generic and executes callback(response);
 * In case of success response is a URL to the pasted code. 
 * failure() is called if the request fails
 * finalize() is always called
 * @param	{function}		callback	function to execute
 * @param	{String}		name		Name of the paste
 * @param	{String}		text		Text to be pasted
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 */
Foxtrick.api.pastebin.paste = function(callback, name, text, failure, finalize) {
	var params = {}
	params['api_option']			= 'paste';
	//params['api_user_key']			= Foxtrick.api.pastebin.api_user_key;
	params['api_paste_private']		= Foxtrick.api.pastebin.api_paste_private;
	params['api_paste_expire_date']	= Foxtrick.api.pastebin.api_paste_expire_date;
	params['api_paste_format']		= Foxtrick.api.pastebin.api_paste_format;
	params['api_paste_name']		= encodeURIComponent(name);
	params['api_paste_code']		= encodeURIComponent(text);

	Foxtrick.api.pastebin._generic(params['api_option'], Foxtrick.api.pastebin.api_url, callback, params, failure, finalize)
};
