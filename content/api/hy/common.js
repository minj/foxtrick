/**
 * common.js
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
 *
 * All APIs use the 503 cooldown mechanism via _fetchOrIgnore:
 * If the request returns 503, a flag is set that causes all consequent requests
 * from all APIs to fail automatically with 503 for a specific period of time.
 * This is of course invisible as long as data-fetchers have something in cache
 * (even if it's stale)
 * Data from data-miners, on the other hand, are lost,
 * therefore they should display an error message.
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

/**
 * Low-level function to build the api params
 * @param  {string} [args]   specific api params
 * @param  {number} [teamId] team id
 * @return {string}
 */
Foxtrick.api.hy._buildParams = function(args, teamId) {
	let id = teamId || Foxtrick.modules.Core.TEAM.teamId;
	let identifier = id + '_' + new Date().getTime();

	// assemble param string
	let params = args ? args + '&' : '';
	params += 'teamId=' + id;
	params += '&app=foxtrick';
	params += '&version=' + Foxtrick.version;
	params += '&identifier=' + identifier;
	params += '&hash=' + Foxtrick.encodeBase64(`foxtrick_${id}_${identifier}`);

	return params;
};

/** @type {number} the number of hours to back of if HY is in trouble */
Foxtrick.api.hy.ignoreHours = Foxtrick.util.time.HOURS_IN_DAY;

/**
 * A generic low-level localStore cache wrapper with Cookie support
 *
 * Resolves with localStore data for an api unless:
 * - a) no data is saved
 * - b) data is older than cacheDays
 * - c) from_hy cookie[api][timestamp] is newer than data fetchTime
 *
 * In any of these cases fetch() is called instead.
 *
 * In case of failure, stale cached data will be used, if possible
 *
 * @template TData
 * @param  {string}                    api       api name
 * @param  {function():Promise<TData>} fetch     api function to call
 * @param  {number}                    cacheDays
 * @param  {number}                    [teamId]
 * @return {Promise<TData>}
 */
Foxtrick.api.hy._fetchViaCache = async (api, fetch, cacheDays, teamId) => {
	// this produces a valid UNIX timestamp that can be compared to HY
	const now = Foxtrick.modules.Core.HT_TIME;
	const MSEC = Foxtrick.util.time.MSECS_IN_SEC;
	const cacheTime = cacheDays * Foxtrick.util.time.MSECS_IN_DAY;

	const id = teamId || Foxtrick.modules.Core.TEAM.teamId;

	const logKey = `[HY_API][${api}]`;
	const dataKey = `YouthClub.${id}.${api}`;
	const timeKey = `${dataKey}.fetchTime`;

	/**
	 * @param  {string} [cachedData]
	 * @return {Promise<TData>}
	 */
	var doFetch = async (cachedData) => {
		try {
			let data = await fetch();
			if (data != null) {
				Foxtrick.storage.set(dataKey, JSON.stringify(data))
					.catch(Foxtrick.catch(`failed to set ${dataKey}`));

				Foxtrick.storage.set(timeKey, now)
					.catch(Foxtrick.catch(`failed to set ${timeKey}`));
			}
			return data;
		}
		catch (rej) {
			/** @type {FetchError} */
			let err = rej;

			if (cachedData == null)
				return Promise.reject(err);

			if (err) {
				let { status, text } = err;
				Foxtrick.log(logKey, 'Fetch failed:', status, text);
			}
			else {
				Foxtrick.log(logKey, 'Fetch failed with unknown:', status, err);
			}


			/** @type {TData} */
			let o = JSON.parse(cachedData);
			Foxtrick.log(logKey, 'Using stale cache:', o);
			return o;
		}
	};

	let cookiePromise = Foxtrick.cookies.get('from_hty');

	/** @type {Promise<string>} */
	let dataPromise = Foxtrick.storage.get(dataKey);

	/** @type {Promise<number>} */
	let timePromise = Foxtrick.storage.get(timeKey);

	const data = await dataPromise;
	if (data == null) {
		// nothing saved
		return doFetch();
	}

	const fetchTime = await timePromise;
	const lifeTime = fetchTime + cacheTime;
	if (lifeTime <= now) {
		// cache is stale
		return doFetch(data);
	}

	const cookie = await cookiePromise;
	Foxtrick.log(logKey, 'HY Cookie:', cookie);
	if (cookie && cookie.api && cookie.api[api] &&
		cookie.api[api].timestamp * MSEC > fetchTime) {
		// cookie orders to refetch
		return doFetch(data);
	}

	// using cache
	/** @type {TData} */
	let o = JSON.parse(data);
	let t = new Date(lifeTime);

	Foxtrick.log(logKey, 'Using cache:', o, 'Valid-until:', t);

	return o;
};

/**
 * Low-level function to generate requests to HY and process the response.
 *
 * Leaves HY alone if trouble is detected. Should be used with all apis.
 *
 * @param  {string}          api    api name for logging purposes
 * @param  {string}          url    api URL
 * @param  {string}          params api params
 * @return {Promise<string|FetchError>} rejects with { status, text }
 */
Foxtrick.api.hy._fetchOrIgnore = async (api, url, params) => {
	const MSEC = Foxtrick.util.time.MSECS_IN_SEC;
	const HOURS_IN_DAY = Foxtrick.util.time.HOURS_IN_DAY;
	const MAX_SEC = 59;
	const msecMod = MAX_SEC * MSEC;

	const HTTP_ERROR = 503;

	const logKey = `[HY_API][${api}]`;
	const failed = Foxtrick.L10n.getString('youthclub.api.failed');

	const ignoreHours = Foxtrick.api.hy.ignoreHours;
	const ignoreMsec = ignoreHours * Foxtrick.util.time.MSECS_IN_HOUR;

	const ignored = await Foxtrick.storage.get('YouthClub.ignoreUntil');
	const now = Foxtrick.modules.Core.HT_TIME + msecMod;
	if (now <= ignored) {
		let text = Foxtrick.L10n.getString('youthclub.api.down');
		let status = HTTP_ERROR;

		/** @type {FetchError} */
		let rej = { text, status };
		Foxtrick.log(logKey, 'Request aborted: HY is in ignore mode.');

		return Promise.reject(rej);
	}

	try {
		const response = await Foxtrick.fetch(url, params);
		Foxtrick.log(logKey, 'Success');
		return /** @type {string} */ (response);
	}
	catch (rej) {
		let err = /** @type {FetchError} */ (rej) ||
			{ status: 0, text: `unknown error: ${typeof rej}` };
		let { status, text } = err;
		switch (status) {
			case 0:
				Foxtrick.log(logKey, 'Sending failed', status);
				text = `{ "error": "${failed}" }`;
				err.text = text;
				break;
			case HTTP_ERROR:
				Foxtrick.storage.set('YouthClub.ignoreUntil', now + ignoreMsec)
					.catch(Foxtrick.catch(`failed to set ignoreUntil`));

				Foxtrick.log(logKey, 'Error', status, text);
				Foxtrick.log(`[HY_API] Cooldown for ${ignoreHours / HOURS_IN_DAY} day(s).`);
				break;
			default:
				Foxtrick.log(logKey, 'Error', status, text);
		}

		return Promise.reject(err);
	}
};

/**
 * Generic low-level function to access HY's API and log the interaction.
 *
 * Should not be used directly.
 *
 * Calls _fetchOrIgnore and tries to parse the response as json
 *
 * @param  {string} api      api name
 * @param  {string} [args]   specific params for the api
 * @param  {number} [teamId] senior team ID to fetch data for
 * @return {Promise}         rejects with { status, text }
 */
Foxtrick.api.hy._fetchGeneric = async (api, args, teamId) => {
	const id = teamId || Foxtrick.modules.Core.TEAM.teamId;
	const logKey = `[HY_API][${api}]`;
	const url = Foxtrick.api.hy._getUrl(api);

	Foxtrick.log(logKey, '_fetch:', [args], id);

	const params = Foxtrick.api.hy._buildParams(args, id);

	let response = await Foxtrick.api.hy._fetchOrIgnore(api, url, params);
	let json = null;
	try {
		json = JSON.parse(/** @type {string} */ (response));
		Foxtrick.log(logKey, 'json received:', json);
	}
	catch (e) {
		Foxtrick.log(logKey, 'json parsing failed:', response);
	}

	return json;
};

/**
 * Get HY API URL
 *
 * @param  {string} api api name
 * @return {string}
 */
Foxtrick.api.hy._getUrl = function(api) {
	const path = Foxtrick.api.hy.URL[api];
	const domain = Foxtrick.Prefs.getBool('YouthClub.useStage') ? 'stage' : 'www';

	return `https://${domain}.hattrick-youthclub.org${path}`;
};
