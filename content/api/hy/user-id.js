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


Foxtrick.api.hy.URL['user-id'] = 'http://www.hattrick-youthclub.org' +
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
 * Tries to fetch and save the user ID from HY and executes callback(userId);
 * userId is null if request fails; -1 if not a HY user
 * @param	{function}	callback	function to execute
 * @param	{[integer]}	teamId		senior team ID to fetch data for (optional)
 */
Foxtrick.api.hy._fetchUserId = function(callback, teamId) {
	if (typeof(teamId) == 'undefined')
		teamId = Foxtrick.modules['Core'].getSelfTeamInfo().teamId;
	//assemble param string
	var params = 'teamId=' + teamId;
	params = params + '&app=foxtrick';
	var d = new Date();
	var identifier = teamId + '_' + d.getTime();
	params = params + '&identifier=' + identifier;
	var hash = 'foxtrick_' + teamId + '_' + identifier;
	params = params + '&hash=' + Foxtrick.encodeBase64(hash);

	Foxtrick.log('[HY_API][userId] _fetchUserId:', teamId);

	//load and callback
	Foxtrick.util.load.async(Foxtrick.api.hy.URL['user-id'],
	  function(response, status) {
		switch (status) {
			case 200:
				var userId = parseInt(JSON.parse(response));
				Foxtrick.log('[HY_API][userId] userId received:', userId);
				callback(userId);
				break;
			default:
				Foxtrick.log('[HY_API][userId] Unhandled Error ' + status + ': ' + response);
				callback(null);
				break;
		}
	}, params);
};
/**
 * A localStore wrapper for _fetchUserId
 * Gets HY user ID and executes callback(userId);
 * userId is null if request fails; -1 if not a HY user
 * @param	{function}	callback	function to execute
 * @param	{[integer]}	teamId		senior team ID to fetch data for (optional)
 */
Foxtrick.api.hy.getUserId = function(callback, teamId) {
	if (typeof(teamId) == 'undefined')
		teamId = Foxtrick.modules['Core'].getSelfTeamInfo().teamId;

	Foxtrick.localGet('YouthClub.' + teamId + '.userId',
	  function(userId) {
		if (userId !== null)
			try {
				callback(parseInt(userId));
			}
			catch (e) {
				Foxtrick.log('Uncaught error in callback for HY_API:getUserId', e);
			}
		else
			Foxtrick.api.hy._fetchUserId(function(userId) {
				if (userId !== null)
					Foxtrick.localSet('YouthClub.' + teamId + '.userId', userId);

				try {
					callback(userId);
				}
				catch (e) {
					Foxtrick.log('Uncaught error in callback for HY_API:getUserId', e);
				}
			}, teamId);
	});
};
/**
 * Executes callback(userId) if the team's manager is HY user
 * @param	{function}	callback	function to execute
 * @param	{[integer]}	teamId		senior team ID to check (optional)
 */
Foxtrick.api.hy.runIfHYUser = function(callback, teamId) {
	Foxtrick.api.hy.getUserId(function(userId) {
		if (Foxtrick.api.hy.isUserId(userId))
			try {
				callback(userId);
			}
			catch (e) {
				Foxtrick.log('Uncaught error in callback for HY_API:runIfHyUser', e);
			}
	}, teamId);
};
