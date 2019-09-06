/**
 * user-id.js
 * Functions working the HY userId API supplied by HY.
 * @author LA-MJ, HY backend/API by MackShot
 *
 * @Interface:
 * 		Url: https://www.hattrick-youthclub.org/_data_provider/foxtrick/userId
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

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	// @ts-ignore
	var Foxtrick = {};
/* eslint-enable */

if (!Foxtrick.api)
	Foxtrick.api = {};
if (!Foxtrick.api.hy)
	Foxtrick.api.hy = {};
if (!Foxtrick.api.hy.URL)
	Foxtrick.api.hy.URL = {};

Foxtrick.api.hy.URL.userId = 'https://www.hattrick-youthclub.org' +
	'/_data_provider/foxtrick/userId';

Foxtrick.api.hy.USER_ID_CACHE = 14;

/**
 * Check if the id could be userId
 * @param  {number}  userId Id to check
 * @return {boolean}        True if possible
 */
Foxtrick.api.hy.isUserId = function(userId) {
	return userId !== null && userId != -1 && !isNaN(userId);
};

/**
 * Low-level function to access HY's API. Should not be used directly
 * Tries to fetch the user ID from HY and executes callback(userId);
 * userId is -1 if not a HY user
 * and null if request fails and failure is not a function
 * failure() is called if the request fails
 * finalize() is always called
 * @param  {function} callback   function to execute
 * @param  {string}   params     specific params for the api = null
 * @param  {function} [failure]  function to execute
 * @param  {function} [finalize] function to execute
 * @param  {number}   [teamId]   senior team ID to fetch data for
 */
Foxtrick.api.hy._fetchUserId = function(callback, params, failure, finalize, teamId) {
	Foxtrick.api.hy._fetchGeneric('userId', (response) => {
		let userId = parseInt(JSON.parse(response), 10);
		callback(userId);
	}, params, (response, status) => {
		if (typeof failure == 'function') {
			failure(response, status);
			return;
		}

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
 * @param  {function} callback   function to execute
 * @param  {function} [failure]  function to execute
 * @param  {function} [finalize] function to execute
 * @param  {number}   [teamId]   senior team ID to fetch data for
 */
Foxtrick.api.hy.getUserId = function(callback, failure, finalize, teamId) {
	this._fetchViaCache(this.USER_ID_CACHE, 'userId', null, this._fetchUserId,
	                    callback, failure, finalize, teamId);
};

/**
 * Executes callback(userId) if the team's manager is HY user
 * failure() is called if not or the request fails
 * finalize() is called in both cases
 * NOTE: finalize is specific to getUserId call, not forwarded to callback
 * @param  {function} callback   function to execute
 * @param  {function} [failure]  function to execute
 * @param  {function} [finalize] function to execute
 * @param  {number}   [teamId]   senior team ID to check
 */
Foxtrick.api.hy.runIfHYUser = function(callback, failure, finalize, teamId) {
	Foxtrick.api.hy.getUserId(function(userId) {

		if (Foxtrick.api.hy.isUserId(userId)) {
			try {
				callback(userId);
				return;
			}
			catch (e) {
				Foxtrick.log('Uncaught error in callback for HY_API:runIfHyUser', e);
			}
		}
		else if (typeof failure == 'function') {
			failure();
		}

	}, failure, finalize, teamId);
};
