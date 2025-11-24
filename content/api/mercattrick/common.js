'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

if (!Foxtrick.api)
	Foxtrick.api = {};
if (!Foxtrick.api.mercattrick)
	Foxtrick.api.mercattrick = {};

/** @type {number} the number of hours to back of if Mercattrick is in trouble */
Foxtrick.api.mercattrick.ignoreHours = Foxtrick.util.time.HOURS_IN_DAY;

/**
 * A generic low-level localStore cache wrapper
 *
 * Resolves with localStore data for an api unless:
 * - a) no data is saved
 * - b) data is older than cacheDays
 *
 * In any of these cases fetch() is called instead.
 *
 * @template TData
 * @param  {string}                    api       api name
 * @param  {function({Array}):Promise<TData>} fetch     api function to call
 * @param  {number}                    cacheHours
 * @param  {Array}                     entities
 * @return {Promise<TData>}
 */
Foxtrick.api.mercattrick._fetchViaCache = async (api, fetch, cacheHours, entities) => {
	const now = Foxtrick.modules.Core.HT_TIME;
	const cacheTime = cacheHours * Foxtrick.util.time.MSECS_IN_HOUR;

	const logKey = `[MERCATTRICK_API][${api}]`;

	/**
	 * @param  {Array} entities
	 * @return {Promise<TData>}
	 */
	var doFetch = async (entities) => {
		try {
			let data = await fetch(entities);

			if (data != null) {
				for (let index = 0; index < data.length; index++) {
					let dataKey = `Mercattrick.${data[index].id}.${api}`;
					let timeKey = `${dataKey}.fetchTime`;

					Foxtrick.storage.set(dataKey, JSON.stringify(data[index]))
						.catch(Foxtrick.catch(`failed to set ${dataKey}`));

					Foxtrick.storage.set(timeKey, now)
						.catch(Foxtrick.catch(`failed to set ${timeKey}`));
				}
			}
			return data;
		}
		catch (rej) {
			/** @type {FetchError} */
			let err = rej || { status: 0, text: `unknown error: ${typeof rej}` };

			let { status, text } = err;
			Foxtrick.log(logKey, 'Fetch failed:', status, text);

			return Promise.reject(err);
		}
	};

	let collected = [];
	let missing = [];

	for (let index = 0; index < entities.length; index++) {
		let dataKey = `Mercattrick.${entities[index]}.${api}`;
		let timeKey = `${dataKey}.fetchTime`;

		/** @type {Promise<string>} */
		let dataPromise = Foxtrick.storage.get(dataKey);

		const data = await dataPromise;
		if (data) {
			/** @type {Promise<number>} */
			let timePromise = Foxtrick.storage.get(timeKey);

			const fetchTime = await timePromise;
			const lifeTime = fetchTime + cacheTime;
			if (lifeTime <= now) {
				// cache is stale
				missing.push(entities[index]);
			} else {
				// using cache
				/** @type {TData} */
				let o = JSON.parse(data);
				collected.push(o);

				let t = new Date(lifeTime);
				Foxtrick.log(logKey, 'Using cache:', o, 'Valid-until:', t);
			}
		} else {
			missing.push(entities[index]);
		}
	}

	if (missing.length) {
		let newData = await doFetch(missing);
		return collected.concat(newData);
	}

	return collected;
};

/**
 * Low-level function to generate requests to Mercattrick and process the response.
 *
 * Leaves Mercattrick alone if trouble is detected. Should be used with all apis.
 *
 * @param  {string}          api    api name for logging purposes
 * @param  {string}          url    api URL
 * @return {Promise<string|FetchError>} rejects with { status, text }
 */
Foxtrick.api.mercattrick._fetchOrIgnore = async (api, url) => {
	const MSEC = Foxtrick.util.time.MSECS_IN_SEC;
	const HOURS_IN_DAY = Foxtrick.util.time.HOURS_IN_DAY;
	const MAX_SEC = 59;
	const msecMod = MAX_SEC * MSEC;

	const HTTP_ERROR = 503;

	const logKey = `[MERCATTRICK_API][${api}]`;
	const failed = Foxtrick.L10n.getString('MercattrickStats.api.failed');

	const ignoreHours = Foxtrick.api.mercattrick.ignoreHours;
	const ignoreMsec = ignoreHours * Foxtrick.util.time.MSECS_IN_HOUR;

	const ignored = await Foxtrick.storage.get('Mercattrick.ignoreUntil');
	const now = Foxtrick.modules.Core.HT_TIME + msecMod;
	if (now <= ignored) {
		let text = Foxtrick.L10n.getString('MercattrickStats.api.down');
		let status = HTTP_ERROR;

		/** @type {FetchError} */
		let rej = { text, status };
		Foxtrick.log(logKey, 'Request aborted: Mercattrick is in ignore mode.');

		return Promise.reject(rej);
	}

	try {
		const response = await Foxtrick.fetch(url);
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
				Foxtrick.storage.set('Mercattrick.ignoreUntil', now + ignoreMsec)
					.catch(Foxtrick.catch(`failed to set ignoreUntil`));

				Foxtrick.log(logKey, 'Error', status, text);
				Foxtrick.log(`[MERCATTRICK_API] Cooldown for ${ignoreHours / HOURS_IN_DAY} day(s).`);
				break;
			default:
				Foxtrick.log(logKey, 'Error', status, text);
		}

		return Promise.reject(err);
	}
};

/**
 * Generic low-level function to access Mercattrick's API and log the interaction.
 *
 * Should not be used directly.
 *
 * Calls _fetchOrIgnore and tries to parse the response as json
 *
 * @param  {string} api      api name
 * @param  {string} params   request parameters
 * @return {Promise}         rejects with { status, text }
 */
Foxtrick.api.mercattrick._fetchGeneric = async (api, params) => {
	const logKey = `[MERCATTRICK_API][${api}]`;
	const url = Foxtrick.api.mercattrick._getUrl(api) + params;

	Foxtrick.log(logKey, '_fetch:', params);

	let response = await Foxtrick.api.mercattrick._fetchOrIgnore(api, url);
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
 * Get Mercattrick API URL
 *
 * @param  {string} api API name
 * @return {string}
 */
Foxtrick.api.mercattrick._getUrl = function(api) {
	const path = Foxtrick.api.mercattrick.URL[api];

	return `https://api.mercattrick.com/v1${path}`;
};
