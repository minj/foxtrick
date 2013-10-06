if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.api)
	Foxtrick.api = {};
if (!Foxtrick.api.pastebin)
	Foxtrick.api.pastebin = {};

/**
 * Global api settings
 * http://pastebin.com/api
 */
Foxtrick.api.pastebin.api_url				= "http://pastebin.com/api/api_post.php";
Foxtrick.api.pastebin.api_login_url			= "http://pastebin.com/api/api_login.php";
Foxtrick.api.pastebin.api_dev_key			= '4c9908e8d8f0cb90d7f7328b499f457c';
Foxtrick.api.pastebin.api_paste_private		= '0'; // 0=public 1=unlisted 2=private
Foxtrick.api.pastebin.api_paste_expire_date	= 'N'; //N=never
Foxtrick.api.pastebin.api_paste_format		= 'text';

/**
 * Constructs post parameter String from params object and calls callback function
 * @param	{function}		callback	function to call
 * @param	{Object}		params		specific params for the api (optional)
 */
Foxtrick.api.pastebin._buildParams = function(callback, params){
	var post = '';
	for(var p in params){
		post = post ? post + '&' : '';
		post = post + p + '=' + params[p];
	}
	callback(post);
}

/**
 * Generic low-level function to access Pastebin API
 * Should not be used directly.
 * Executes callback(response);
 * failure() is called if the request fails
 * finalize() is always called
 * @param	{String}		api			api name
 * @param	{String}		url			url to call
 * @param	{function}		callback	function to execute
 * @param	{[Object]}		params		specific params for the api (optional)
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 * @param	{[integer]}		teamId		senior team ID to fetch data for (optional)
 */
Foxtrick.api.pastebin._generic = function(api, url, success, params, failure, finalize) {
	params = params || {};
	params['api_dev_key'] = params['api_dev_key'] || Foxtrick.api.pastebin.api_dev_key;
	Foxtrick.api.pastebin._buildParams( function(params){
		Foxtrick.util.load.async(url,
			function(response, status) {
				if(status == 200)
					if(!response.match(/http/))
						status = 429; //429 Too Many Requests

				switch (status) {
					case 0:
						Foxtrick.log('[PASTEBIN_API][' + api + '] Error', status, response);
						break;
					case 200:
						Foxtrick.log('[PASTEBIN_API][' + api + '] Success', status, response);
						break;
					case 429:
						Foxtrick.log('[PASTEBIN_API][' + api + '] Failure', status, response);
						break;
					case 503:
						Foxtrick.log('[PASTEBIN_API][' + api + '] Service Unavailable', status, response);
						break;
					default:
						Foxtrick.log('[PASTEBIN_API][' + api + '] Failure', status, response);
						break;
				}
				if (status == 200 && typeof(success) == 'function')
					success(response);
				else if (typeof(failure) == 'function')
					failure(response, status);
				if (typeof(finalize) == 'function')
					finalize(response, status);
			}, params);
		}, params);
};
