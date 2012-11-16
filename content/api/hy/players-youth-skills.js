'use strict';

if (!Foxtrick)
    var Foxtrick = {};
if (!Foxtrick.api)
    Foxtrick.api = {};
if (!Foxtrick.api.hy)
    Foxtrick.api.hy = {};
if (!Foxtrick.api.hy.URL)
    Foxtrick.api.hy.URL = {};

/* players-youth-skills.js
 * Functions working the HY playersYouthSkills API supplied by HY.
 * @author LA-MJ, HY backend/API by MackShot
 *
 * @Interface:
 * 		Url: http://www.hattrick-youthclub.org/_data_provider/foxtrick/playersYouthSkills
 * @params:
 *		//params send via http 'POST'
 * 		teamId: teamId
 * 		app: foxtrick
 *		hash: sha1/md5/base64 of 'foxtrick_'  + teamId
 * @response
 *		JSON:
 *			{
 *				$playerId: {
 *					speciality: @integer,
 *					skills: {
 *						$skill_id: {
 *							cap: @float,
 *							current: @float,
 *							maxed: @boolean
 *						},
 *						...
 *					}
 *				},
 *				...
 *			}
 * $playerId: @integer
 * $skill_id: @integer, c.f. Foxtrick.api.hy.skillMap
 * current = current skill level
 * cap = the cap of this skill
 * maxed = weather the skill is fully maxed out or not
*/


Foxtrick.api.hy.URL['playersYouthSkills'] = 'http://stage.hattrick-youthclub.org' +
	'/_data_provider/foxtrick/playersYouthSkills';

//this maps HY skill-id to skill
Foxtrick.api.hy.skillMap = {
	3: 'playmaking',
	4: 'winger',
	5: 'scoring',
	6: 'keeper',
	7: 'passing',
	8: 'defending',
	9: 'set pieces',
	10: 'experience'
};
/**
 * Low-level function to access HY's API. Should not be used directly
 * Tries to fetch the youth skills from HY and executes callback(players);
 * failure() is called if the request fails
 * finalize() is always called
 * @param	{function}		callback	function to execute
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 * @param	{[integer]}		teamId		senior team ID to fetch data for (optional)
 * @param	{[String]}		params		specific params for the api (optional)
 */
Foxtrick.api.hy._fetchYouthSkills = function(callback, failure, finalize, teamId, params) {
	if (typeof(teamId) == 'undefined' || teamId === null)
		teamId = Foxtrick.modules['Core'].getSelfTeamInfo().teamId;

	Foxtrick.log('[HY_API][playersYouthSkills] _fetchYouthSkills:', teamId);
	var url = Foxtrick.api.hy.URL['playersYouthSkills'];

	Foxtrick.api.hy._fetchOrIgnore('playersYouthSkills', url, params,
	  function(response) {
		var players = JSON.parse(response);
		Foxtrick.log('[HY_API][playersYouthSkills] players received:', players);
		callback(players);
	}, failure, finalize, teamId);
};
/**
 * A localStore wrapper for _fetchYouthSkills
 * Gets youth skills and executes callback(players);
 * failure() is called if the request fails
 * finalize() is always called
 * @param	{function}		callback	function to execute
 * @param	{[String]}		params		specific params for the api (optional)
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 * @param	{[integer]}		teamId		senior team ID to fetch data for (optional)
 */
Foxtrick.api.hy.getYouthSkills = function(callback, params, failure, finalize, teamId) {
	Foxtrick.api.hy._fetchViaCache(7, 'playersYouthSkills', this._fetchYouthSkills,
								   callback, failure, finalize, teamId, params);
};
