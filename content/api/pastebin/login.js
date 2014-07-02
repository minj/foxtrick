'use strict';
if (!Foxtrick.api)
	Foxtrick.api = {};
if (!Foxtrick.api.pastebin)
	Foxtrick.api.pastebin = {};

/**
 * Login to pastebin to receive a <api_user_key>
 * Calls _generic and executes callback(response);
 * In case of success response is a <api_user_key>
 * failure(response, status) is called if the request fails
 * finalize(response, status) is always called
 * @param	{function}		callback	function to execute
 * @param	{String}		user		pastebin username to log in
 * @param	{String}		password	pastebin user password
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 */
Foxtrick.api.pastebin.login = function(callback, user, password, failure, finalize) {
	var params = {
		api_user_name: user,
		api_user_password: password,
		api_dev_key: this.api_dev_key,
	};

	Foxtrick.api.pastebin._generic('login', this.api_login_url, callback, params,
	                               failure, finalize);
};
