/**
 * matches-training.js
 * url: 'https://www.hattrick-youthclub.org/_data_provider/foxtrick/matchesTraining';
 *
 * params:
 * hash: md5/sha1/base64(app + '_' + teamId + '_' + identifier)
 * lang: the language as mentioned in the html meta tag of hattrick.org
 * identifier: a random (unique, changing with every request) identifier
 * just for securing the request
 * primaryTraining: selected primary training value
 * secondaryTraining: selected secondary training value
 *
 * STATUS CODES
 * HTTP 200:
 * - Ok
 * HTTP 400:
 * - not all data is given
 * HTTP 401
 * - unauthorized request
 * HTTP 503
 * - service temporarly not available
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

Foxtrick.api.hy.URL.matchesTraining = '/_data_provider/foxtrick/matchesTraining';

/**
 * Tries to post the match report to HY
 *
 * @param  {string}  params     specific params for the api
 * @param  {number}  [teamId]   senior team ID to fetch data for
 * @return {Promise}
 */
Foxtrick.api.hy.postTrainingChange = function(params, teamId) {
	return Foxtrick.api.hy._fetchGeneric('matchesTraining', params, teamId);
};
