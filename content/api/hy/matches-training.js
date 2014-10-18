'use strict';

if (!Foxtrick)
	var Foxtrick = this.Foxtrick;
if (!Foxtrick.api)
	Foxtrick.api = {};
if (!Foxtrick.api.hy)
	Foxtrick.api.hy = {};
if (!Foxtrick.api.hy.URL)
	Foxtrick.api.hy.URL = {};

/* matches-training.js
 * url: 'http://www.hattrick-youthclub.org/_data_provider/foxtrick/matchesTraining';
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


Foxtrick.api.hy.URL['matchesTraining'] = 'http://www.hattrick-youthclub.org' +
	'/_data_provider/foxtrick/matchesTraining';
/**
 * Tries to post the match report to HY and executes callback(response);
 * failure() is called if the request fails
 * finalize() is always called
 * @param	{function}		callback	function to execute
 * @param	{String}		params		specific params for the api
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 * @param	{[integer]}		teamId		senior team ID to fetch data for (optional)
 */
Foxtrick.api.hy.postTrainingChange = function(callback, params, failure, finalize, teamId) {
	Foxtrick.api.hy._fetchGeneric('matchesTraining', callback, params, failure, finalize, teamId);
};
