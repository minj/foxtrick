'use strict';

if (!Foxtrick)
    var Foxtrick = {};
if (!Foxtrick.api)
    Foxtrick.api = {};
if (!Foxtrick.api.hy)
    Foxtrick.api.hy = {};
if (!Foxtrick.api.hy.URL)
    Foxtrick.api.hy.URL = {};

/* user-id.js
 * Functions working the HY userId API supplied by HY.
 * @author LA-MJ, HY backend/API by MackShot
 *
 * @Interface:
 * 		Url: http://www.hattrick-youthclub.org/_data_provider/foxtrick/userId
 * @params:
 * 		teamid
 * 			teamid
 * 		app
 * 			'foxtrick'
 * 		identifier
 * 			unique string each request
 * 		hash
 * 			'foxtrick_' + teamId + '_' + identifier;
 *
 * @response
 *		double-quoted integer
 *			HY user ID or -1 if not a HY user
 */


Foxtrick.api.hy.URL['userId'] = 'http://www.hattrick-youthclub.org' +
	'/_data_provider/foxtrick/userId';
/**
 * Check if the id could be userId
 * @param	{Integer}	userId	Id to check
 * @returns	{Boolean}			True if possible
 */
Foxtrick.api.hy.isUserId = function(userId) {
	return (userId !== null && userId != -1 && userId != NaN);
};
/**
 * Low-level function to access HY's API. Should not be used directly
 * Tries to fetch the user ID from HY and executes callback(userId);
 * userId is -1 if not a HY user
 * and null if request fails and failure is not a function
 * failure() is called if the request fails
 * finalize() is always called
 * @param	{function}		callback	function to execute
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 * @param	{[integer]}		teamId		senior team ID to fetch data for (optional)
 */
Foxtrick.api.hy._fetchUserId = function(callback, failure, finalize, teamId) {
	Foxtrick.api.hy._fetchGeneric('userId',
	  function(response) {
		var userId = parseInt(JSON.parse(response), 10);
		callback(userId);
	}, null,
	  function(response, status) {
		if (typeof(failure) == 'function')
			failure(response, status);
		else
			callback(null);
	}, finalize, teamId);
};
/**
 * A localStore wrapper for _fetchUserId
 * Gets HY user ID and executes callback(userId);
 * userId is -1 if not a HY user
 * and null if request fails and failure is not a function
 * failure() is called if the request fails
 * finalize() is always called
 * @param	{function}		callback	function to execute
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 * @param	{[integer]}		teamId		senior team ID to fetch data for (optional)
 */
Foxtrick.api.hy.getUserId = function(callback, failure, finalize, teamId) {
	Foxtrick.api.hy._fetchViaCache(14, 'userId', null, this._fetchUserId,
								   callback, failure, finalize, teamId);
};
/**
 * Executes callback(userId) if the team's manager is HY user
 * failure() is called if not or the request fails
 * finalize() is called in both cases
 * @param	{function}		callback	function to execute
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 * @param	{[integer]}		teamId		senior team ID to check (optional)
 */
Foxtrick.api.hy.runIfHYUser = function(callback, failure, finalize, teamId) {
	Foxtrick.api.hy.getUserId(function(userId) {
		if (Foxtrick.api.hy.isUserId(userId)) {
			try {
				callback(userId);
			}
			catch (e) {
				Foxtrick.log('Uncaught error in callback for HY_API:runIfHyUser', e);
			}
		}
		else {
			if (typeof(failure) == 'function')
				failure();
		}
	}, failure, finalize, teamId);
};
