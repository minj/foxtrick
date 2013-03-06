'use strict';

if (!Foxtrick)
    var Foxtrick = {};
if (!Foxtrick.api)
    Foxtrick.api = {};
if (!Foxtrick.api.hy)
    Foxtrick.api.hy = {};
if (!Foxtrick.api.hy.URL)
    Foxtrick.api.hy.URL = {};

/* matches-report.js
 * url: 'http://www.hattrick-youthclub.org/_data_provider/foxtrick/matchesReport';
 *
 * params:
 * teamid or managerid: teamid or managerid
 * app: 'foxtrick'
 * report: urlencoded report (.playerInfo)
 * trainer: urlencoded trainer introduction (p.shy above)
 * matchId: matchId
 * identifier: unique string each request
 * lang: language from hattricks meta tag
 * hash: 'foxtrick_' + teamId + '_' + identifier;
 *
 * expected returns
 * HTTP 200:
 * - Ok
 * HTTP: 304
 * 1. At least one coach comment could not be imported on HY!
 * 2. There is already a match report for this match on HY!
 * HTTP 400:
 * - not all data is given
 * HTTP 401:
 * - unauthorized request
 * HTTP 409:
 * 1. The match must be inserted in HY before!
 * 2. Match report is empty, too short or in wrong format!
 */


Foxtrick.api.hy.URL['matchesReport'] = 'http://www.hattrick-youthclub.org' +
	'/_data_provider/foxtrick/matchesReport';
/**
 * Tries to post the match report to HY and executes callback(response);
 * failure() is called if the request fails
 * finalize() is always called
 * @param	{function}		callback	function to execute
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 * @param	{[integer]}		teamId		senior team ID to fetch data for (optional)
 */
Foxtrick.api.hy.postMatchReport = function(data, callback, failure, finalize, teamId) {
	if (typeof(teamId) == 'undefined' || teamId === null)
		teamId = Foxtrick.modules['Core'].getSelfTeamInfo().teamId;

	Foxtrick.log('[HY_API][matchesReport] postMatchReport:', data, teamId);

	Foxtrick.api.hy._postOrIgnore('matchesReport', Foxtrick.api.hy.URL['matchesReport'], data,
	  function(response) {
		Foxtrick.log('[HY_API][matchesReport] matchesReport posted');
		callback(response);
	  },
	  function(response, status) {
		if (typeof(failure) == 'function')
			failure(response, status);
		else
			callback(response, status);
	}, finalize, teamId);
};
