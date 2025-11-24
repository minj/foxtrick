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
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

if (!Foxtrick.api)
	Foxtrick.api = {};
if (!Foxtrick.api.hy)
	Foxtrick.api.hy = {};
if (!Foxtrick.api.hy.URL)
	Foxtrick.api.hy.URL = {};

Foxtrick.api.hy.URL.userId = '/_data_provider/foxtrick/userId';

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
 * Low-level function to access HY's API. Should not be used directly.
 *
 * Tries to fetch the user ID from HY.
 *
 * Will never reject
 *
 * userId is -1 if not a HY user
 * and null if request fails
 *
 * @param  {number}   [teamId]   senior team ID to fetch data for
 * @return {Promise<number>}
 */
Foxtrick.api.hy._fetchUserId = async (teamId) => {
	let id = null;
	try {
		let resp = await Foxtrick.api.hy._fetchGeneric('userId', null, teamId);
		id = parseInt(resp, 10);
	}
	catch (rej) {}
	return id;
};

/**
 * A localStore wrapper for _fetchUserId
 *
 * Gets HY user ID
 *
 * Will never reject
 *
 * userId is -1 if not a HY user
 * and null if request fails
 *
 * @param  {number}   [teamId]   senior team ID to fetch data for
 * @return {Promise<number>}
 */
Foxtrick.api.hy.getUserId = function(teamId) {
	const cache = this.USER_ID_CACHE;
	return this._fetchViaCache('userId', () => this._fetchUserId(teamId), cache, teamId);
};

/**
 * Async test whether the team's manager is HY user
 *
 * Will never reject
 *
 * @param  {number}   [teamId]   senior team ID to check
 * @return {Promise<boolean>}
 */
Foxtrick.api.hy.isHYUser = async (teamId) => {
	let userId = await Foxtrick.api.hy.getUserId(teamId);
	return Foxtrick.api.hy.isUserId(userId);
};
