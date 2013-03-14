'use strict';

if (!Foxtrick)
    var Foxtrick = {};
if (!Foxtrick.api)
    Foxtrick.api = {};
if (!Foxtrick.api.hy)
    Foxtrick.api.hy = {};

/* common.js
 * Common functions for the HY API
 * @author LA-MJ, HY backend/API by MackShot
 *
 * There are two types of APIs:
 * a) data-fetchers that get info from HY
 * b) data-miners that send info to HY
 *
 * Data fetchers use a multi-tiered caching mechanism via _fetchViaCache:
 * Obviously if there is nothing cached we access HY.
 * Next, HY cookies provide highest level control:
 * if the timestamp is newer than last api.fetchTime then data is accessed @HY.
 * Otherwise localStore cache is checked: the data is used or refetched if it is stale
 * Stale cache is used if the fecthing fails
 *
 * userID API is also updated via playersTwinsCheck in the YouthTwins module for historic reasons
 *
 * All APIs use the 503 cooldown mechanism via _fetchOrIgnore:
 * If the request returns 503, a flag is set that causes all consequent requests
 * from all APIs to fail automatically with 503 for a specific period of time.
 * This is of course invisible as long as data-fetchers have something in cache (even if it's stale)
 * Data from data-miners, on the other hand, are lost, therefore they should display an error message.
 *
 * All APIs have common request parameters that are injected into _fetchOrIgnore via _buildParams
 *
 * To abstract things even further _fetchGeneric is used:
 * it takes care of generic logging etc
 *
 * Typical function call stack for a data-fetcher:
 * getSomething -> _fetchViaCache -> _fetchSomething -> _fetchGeneric ->
 * _fetchOrIgnore -> _buildParams -> load.async
 *
 * _fetchSomething may be used to customise something...
 *
 * Typical function call stack for a data-miner:
 * postSomething -> _fetchGeneric -> _fetchOrIgnore -> _buildParams -> load.async
 */

/**
 * Low-level function to build the api params and inject them into callback
 * @param	{Function}	callback	calls callback(params)
 * @param	{[String]}	params		specific api params (optional)
 * @param	{[Integer]}	teamId		team id (optional)
 */
Foxtrick.api.hy._buildParams = function(callback, params, teamId) {
	if (typeof(teamId) == 'undefined' || teamId === null)
		teamId = Foxtrick.modules['Core'].getSelfTeamInfo().teamId;
	//assemble param string
	params = params ? params + '&' : '';
	params += 'teamId=' + teamId;
	params += '&app=foxtrick';
	var identifier = teamId + '_' + new Date().getTime();
	params += '&identifier=' + identifier;
	params += '&hash=' + Foxtrick.encodeBase64('foxtrick_' + teamId + '_' + identifier);

	callback(params);
};

/** @type {Number}	The number of hours to back of if HY is in trouble */
Foxtrick.api.hy.ignoreHours = 24;
Foxtrick.api.hy.ignoreMessage = Foxtrickl10n.getString('youthclub.api.down');
// TODO internationalise

/**
 * A generic low-level localStore cache wrapper with Cookie support
 * Calls callback(data) with localStore data for an api unless:
 * a) no data is saved
 * b) data is older than cacheDays
 * c) from_hy cookie[api][timestamp] is newer than data fetchTime
 * In any of these cases fetch(callback, params, failure, finalize, teamId) is called instead
 * @param	{Integer}	cacheDays
 * @param	{String}	api			api name
 * @param	{String}	params		specific params for the api
 * @param	{Function}	fetch		api function to call when accessing servers
 * @param	{Function}	callback	function to call to parse response
 * @param	{Function}	failure
 * @param	{Function}	finalize
 * @param	{Integer}	teamId
 */
Foxtrick.api.hy._fetchViaCache = function(cacheDays, api, params, fetch,
										  callback, failure, finalize, teamId) {
	var now = Foxtrick.modules['Core'].HT_TIME;
	if (typeof(teamId) == 'undefined' || teamId === null)
		teamId = Foxtrick.modules['Core'].getSelfTeamInfo().teamId;

	var do_fetch = function(cached_data) {
		fetch(function(data) {
			if (data !== null) {
				Foxtrick.localSet('YouthClub.' + teamId + '.' + api, JSON.stringify(data));
				Foxtrick.localSet('YouthClub.' + teamId + '.' + api + '.fetchTime', now);
			}

			try {
				callback(data);
			}
			catch (e) {
				Foxtrick.log('Uncaught error in callback for HY_API:get_' + api, e);
			}
		  }, params,
		  function (response, status) {
			if (typeof(failure) == 'function')
				failure(response, status);
			else if (cached_data) {
				try {
					cached_data = JSON.parse(cached_data);
					Foxtrick.log('[HY_API][' + api + '] Using stale cache:',
								 cached_data);
					callback(cached_data);
				}
				catch (e) {
					Foxtrick.log('Uncaught error in callback for HY_API:get_' + api, e);
				}
			}
		}, finalize, teamId);
	};

	Foxtrick.localGet('YouthClub.' + teamId + '.' + api,
	  function(data) {
		if (data !== null) {
			Foxtrick.localGet('YouthClub.' + teamId + '.' + api + '.fetchTime',
			  function(fetchTime) {
				var lifeTime = fetchTime + cacheDays * 24 * 60 * 60 * 1000;
				if (lifeTime > now) {
					Foxtrick.cookieGet('from_hty',
					  function(cookie) {
						Foxtrick.log('[HY_API][' + api + '] HY Cookie:', cookie);
						if (!(cookie && cookie['api'] && cookie['api'][api] &&
							cookie['api'][api]['timestamp'] * 1000 > fetchTime)) {

							// using cache

							try {
								data = JSON.parse(data);
								Foxtrick.log('[HY_API][' + api + '] Using cache:', data,
											 'Valid-until:', new Date(lifeTime));
								callback(data);
							}
							catch (e) {
								Foxtrick.log('Uncaught error in callback for HY_API:get_' + api, e);
							}
						}
						else
							// cookie orders to refetch
							do_fetch(data);
					});
				}
				else
					// cache is stale
					do_fetch(data);
			});
		}
		else
			// nothing saved
			do_fetch();
	});
};

/**
 * Low-level function to generate requests to HY and process the response.
 * Leaves HY alone if trouble is detected. Should be used with all apis.
 * @param	{String}		api			api name for logging purposes
 * @param	{String}		url			api URL
 * @param	{[String]}		params		specific api params (optional)
 * @param	{[Function]}	success		success(response) is called if status = 200 (optional)
 * @param	{[Function]}	failure		failure(response, status) called otherwise (optional)
 * @param	{[Function]}	finalize	finalize(response, status) called in any case (optional)
 * @param	{[Integer]}		teamId		team id (optional)
 */
Foxtrick.api.hy._fetchOrIgnore = function(api, url, params,
										  success, failure, finalize, teamId) {
	if (typeof(teamId) == 'undefined' || teamId === null)
		teamId = Foxtrick.modules['Core'].getSelfTeamInfo().teamId;

	var ignoreHours = this.ignoreHours;
	var buildParams = this._buildParams;
	Foxtrick.localGet('YouthClub.ignoreUntil', function(ignored) {
		var now = Foxtrick.modules['Core'].HT_TIME + 59000;
		if (now > ignored) {
			buildParams(function(params) {
				Foxtrick.util.load.async(url,
				  function(response, status) {
					switch (status) {
						case 0:
							Foxtrick.log('[HY_API][' + api + '] Sending failed', status);
							break;
						case 200:
							Foxtrick.log('[HY_API][' + api + '] Success', status);
							break;
						case 503:
							var ignoreUntil = now + ignoreHours * 60 * 60 * 1000;
							Foxtrick.localSet('YouthClub.ignoreUntil', ignoreUntil);
							Foxtrick.log('[HY_API][' + api + '] Failure', status, response);
							Foxtrick.log('[HY_API] No requests for ' +
										 (ignoreHours / 24.0) + ' day(s).');
							break;
						default:
							Foxtrick.log('[HY_API][' + api + '] Failure', status, response);
							break;
					}
					if (status == 200 && typeof(success) == 'function')
						success(response);
					else if (typeof(failure) == 'function')
						failure(response, status);
					if (typeof(finalize) == 'function')
						finalize(response, status);
				}, params);
			}, params, teamId);
		}
		else {
			Foxtrick.log('[HY_API][' + api + '] Request aborted: HY is in ignore mode.');
			if (typeof(failure) == 'function')
				failure(Foxtrick.api.hy.ignoreMessage, 503);
			if (typeof(finalize) == 'function')
				finalize(Foxtrick.api.hy.ignoreMessage, 503);
		}
	});
};

/**
 * Generic low-level function to access HY's API and log the interaction.
 * Should not be used directly.
 * Calls _fetchOrIgnore and executes callback(json);
 * failure() is called if the request fails
 * finalize() is always called
 * @param	{String}		api			api name
 * @param	{function}		callback	function to execute
 * @param	{[String]}		params		specific params for the api (optional)
 * @param	{[Function]}	failure		function to execute (optional)
 * @param	{[Function]}	finalize	function to execute (optional)
 * @param	{[integer]}		teamId		senior team ID to fetch data for (optional)
 */
Foxtrick.api.hy._fetchGeneric = function(api, callback, params, failure, finalize, teamId) {
	if (typeof(teamId) == 'undefined' || teamId === null)
		teamId = Foxtrick.modules['Core'].getSelfTeamInfo().teamId;

	Foxtrick.log('[HY_API][' + api + '] _fetch:', [params], teamId);
	var url = Foxtrick.api.hy.URL[api];

	Foxtrick.api.hy._fetchOrIgnore(api, url, params,
	  function(response) {
		var json = JSON.parse(response);
		Foxtrick.log('[HY_API][' + api + '] json received:', json);
		callback(json);
	}, failure, finalize, teamId);
};
