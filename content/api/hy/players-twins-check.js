'use strict';

if (!Foxtrick)
    var Foxtrick = {};
if (!Foxtrick.api)
    Foxtrick.api = {};
if (!Foxtrick.api.hy)
    Foxtrick.api.hy = {};
if (!Foxtrick.api.hy.URL)
    Foxtrick.api.hy.URL = {};

/* players-twins-check.js
 * Functions working the HY playersTwinsCheck API supplied by HY.
 * @author LA-MJ, HY backend/API by MackShot
 *
 * @Interface:
 * 		Url: http://www.hattrick-youthclub.org/_data_provider/foxtrick/playersTwinsCheck
 * @params:
 *		//params send via http 'POST'
 * 		forceUpdate (optional): !!!! NOT SUPPORTED FOR THE MOMENT, will be ignored on HY
 *			no param requred but send = 1 for safety reasons
 *			forces HY to recalculate results, should only be used after a new player
 *			was pulled onto the youth squad or if it is really required
 * 		debug (optional):
 *			no param requred but send = 1 for safety reasons
 *			force ht to return a random result so developers can check stuff
 *			without having actual twins
 *		players:
 *			urlencoded version of youthplayerlist chpp file v1.0 with actiontype = 'details'
 *		avatars:
 *			urlencoded version of youthavatars chpp file v1.0
 *		isHyUser (0/1) (optional):
 *			used to simulate HY users or non-HY users for debugging purposes
 *			if not present HY will find out the correct value itself
 *			if set to 1
 *			@response players[id].marked and
 *			@response players[id].non will not be present for non HT users.
 *
 * @response
 *		JSON:
 *			isHyUser (true / false) (deprecated)
 *				the user is using HY already
 *			userID
 *				integer HY userID, -1 if not a user
 *			players: (dictionary)
 *				list of players
 *				non: number of possible twins marked as non-twin (not present if isHyUser = false)
 *				marked: number of possible twins marked as twin (not present if isHyUser = false)
 *				possible: total number of possible twins
 *			fetchTime (deprecated)
 *				Unix timestamp of the fetched information in seconds
 *			lifeTime (deprecated)
 *				LifeTime of the information in seconds, avoid further requests until
 *				fetchTime+lifeTime is met, new pulls to the youth team are a valid reason
 *				to disrespect and use forceUpdate. *
 */


Foxtrick.api.hy.URL['playersTwinsCheck'] = 'http://www.hattrick-youthclub.org' +
	'/_data_provider/foxtrick/playersTwinsCheck';

/**
 * Low-level function to access HY's API. Should not be used directly
 * Tries to fetch the youth twins from HY and executes callback(json);
 * failure() is called if the request fails
 * finalize() is always called
 * @param	{function}		callback	function to execute
 * @param	{String}		params		specific params for the api
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 * @param	{[integer]}		teamId		senior team ID to fetch data for (optional)
 */
Foxtrick.api.hy._fetchYouthTwins = function(callback, params, failure, finalize, teamId) {
	Foxtrick.api.hy._fetchGeneric('playersTwinsCheck', callback, params, failure, finalize, teamId);
};
/**
 * A localStore wrapper for _fetchYouthTwins
 * Gets youth twins and executes callback(json);
 * failure() is called if the request fails
 * finalize() is always called
 * @param	{function}		callback	function to execute
 * @param	{String}		params		specific params for the api
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 * @param	{[integer]}		teamId		senior team ID to fetch data for (optional)
 */
Foxtrick.api.hy.getYouthTwins = function(callback, params, failure, finalize, teamId) {
	Foxtrick.api.hy._fetchViaCache(7, 'playersTwinsCheck', params, this._fetchYouthTwins,
								   callback, failure, finalize, teamId);
};
