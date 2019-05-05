/**
 * matches-report.js
 * url: 'https://www.hattrick-youthclub.org/_data_provider/foxtrick/matchesReport';
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
 * HTTP 400:
 * - not all data is given
 * HTTP 401:
 * - unauthorized request
 * HTTP 409:
 * 1. The match must be inserted in HY before!
 * 2. Match report is empty, too short or in wrong format!
 * 3. At least one coach comment could not be imported on HY!
 * 4. There is already a match report for this match on HY!
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

Foxtrick.api.hy.URL.matchesReport = 'https://www.hattrick-youthclub.org' +
	'/_data_provider/foxtrick/matchesReport';

/**
 * Tries to post the match report to HY and executes callback(response);
 * failure() is called if the request fails
 * finalize() is always called
 * @param  {function} callback   function to execute
 * @param  {string}   params     specific params for the api
 * @param  {function} [failure]  function to execute
 * @param  {function} [finalize] function to execute
 * @param  {number}   [teamId]   senior team ID to fetch data for
 */
Foxtrick.api.hy.postMatchReport = function(callback, params, failure, finalize, teamId) {
	Foxtrick.api.hy._fetchGeneric('matchesReport', callback, params, failure, finalize, teamId);
};
