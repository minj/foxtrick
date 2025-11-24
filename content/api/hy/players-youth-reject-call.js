/**
 * players-youth-reject-call.js
 * url: https://www.hattrick-youthclub.org/_data_provider/foxtrick/playersYouthRejectCall
 *
 * params:
 * teamid or managerid: teamid or managerid
 * app: 'foxtrick'
 * scoutcall: urlencoded scoutcall
 * identifier: unique string each request
 * lang: language from hattricks meta tag
 * hash: 'foxtrick_' + teamId + '_' + identifier;
 *
 * possible returns
 * HTTP 200:
 * - Ok
 * HTTP 409:
 * - Comment already exists
 * - This language is not available on hattrick youthclub!
 * - Given scout call is not valid!
 * - Scout does not exist on hattrick youthclub!
 * - No scoutcomments found in scout call!
 * HTTP 400:
 * - not all data is given
 * HTTP 401:
 * - unauthorized request
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

Foxtrick.api.hy.URL.playersYouthRejectCall = '/_data_provider/foxtrick/playersYouthRejectCall';

/**
 * Tries to post the youth scout call to HY
 *
 * @param  {string}   params     specific params for the api
 * @param  {number}   [teamId]   senior team ID to fetch data for
 * @return {Promise}
 */
Foxtrick.api.hy.postScoutCall = function(params, teamId) {
	return Foxtrick.api.hy._fetchGeneric('playersYouthRejectCall', params, teamId);
};
