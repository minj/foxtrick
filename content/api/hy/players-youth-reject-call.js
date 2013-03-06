'use strict';

if (!Foxtrick)
    var Foxtrick = {};
if (!Foxtrick.api)
    Foxtrick.api = {};
if (!Foxtrick.api.hy)
    Foxtrick.api.hy = {};
if (!Foxtrick.api.hy.URL)
    Foxtrick.api.hy.URL = {};

/* players-youth-reject-call.js
 * url: http://www.hattrick-youthclub.org/_data_provider/foxtrick/playersYouthRejectCall
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
 * HTTP 304:
 * - Comment already exists
 * HTTP 409:
 * - This language is not available on hattrick youthclub!
 * - Given scout call is not valid!
 * - Scout does not exist on hattrick youthclub!
 * - No scoutcomments found in scout call!
 * HTTP 400:
 * - not all data is given
 * HTTP 401:
 * - unauthorized request
 */

Foxtrick.api.hy.URL['playersYouthRejectCall'] = 'http://www.hattrick-youthclub.org' +
	'/_data_provider/foxtrick/playersYouthRejectCall';
/**
 * Tries to post the youth scout call to HY and executes callback(response);
 * failure() is called if the request fails
 * finalize() is always called
 * @param	{function}		callback	function to execute
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 * @param	{[integer]}		teamId		senior team ID to fetch data for (optional)
 */
Foxtrick.api.hy.postScoutCall = function(data, callback, failure, finalize, teamId) {
	if (typeof(teamId) == 'undefined' || teamId === null)
		teamId = Foxtrick.modules['Core'].getSelfTeamInfo().teamId;

	Foxtrick.log('[HY_API][playersYouthRejectCall] postScoutCall:', data, teamId);

	Foxtrick.api.hy._postOrIgnore('playersYouthRejectCall',
								  Foxtrick.api.hy.URL['playersYouthRejectCall'], data,
	  function(response) {
		Foxtrick.log('[HY_API][playersYouthRejectCall] scout call posted');
		callback(response);
	  },
	  function(response, status) {
		if (typeof(failure) == 'function')
			failure(response, status);
		else
			callback(response, status);
	}, finalize, teamId);
};
