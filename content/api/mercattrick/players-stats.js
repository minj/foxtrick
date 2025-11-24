/**
 * players-stats.js
 * @author dromichet
 *
 * @Interface:
 * 		Url: https://api.mercattrick.com/v1/players/stats/
 * @params:
 *		//params send via http 'GET'
 * 		playerIds: ids separated by comma
 * @response
 *		JSON:
 *			[
 *			 {
 *			    "id": @integer,
 *			    "filters_count": @integer,
 *			    "bookmarks_count": @integer
 *			  },
 *			  ...
 *			]
 * id: player id
 * filters_count: number of search filters the player belongs to
 * bookmarks_count: how many users have bookmarked this transfer
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
if (!Foxtrick.api.mercattrick)
	Foxtrick.api.mercattrick = {};
if (!Foxtrick.api.mercattrick.URL)
	Foxtrick.api.mercattrick.URL = {};

Foxtrick.api.mercattrick.URL.playersStats = '/players/stats/';

/**
 * Tries to fetch the player stats from Mercattrick and returns a Promise for players
 *
 * @param  {Array}  playerIds players ID to fetch data for
 * @return {Promise<MercattrickStatsList>}
 */
Foxtrick.api.mercattrick._getPlayersStats = function(playerIds) {
	let req = playerIds.join(',');

	return Foxtrick.api.mercattrick._fetchGeneric('playersStats', req);
};

/**
 * Get Mercattrick player stats
 *
 * @param  {Array}  playerIds IDs to fetch data for
 * @return {Promise<MercattrickStatsList>}
 */
Foxtrick.api.mercattrick.getPlayersStats = function(playerIds) {
	let hours = 1;
	let api = Foxtrick.api.mercattrick;
	let fetch = ids => api._getPlayersStats(ids);

	return api._fetchViaCache('playersStats', fetch, hours, playerIds);
};

/**
 * @typedef MercattrickStats
 * @prop {number} id
 * @prop {number} filters_count
 * @prop {number} filters_count
 */

/** @typedef {MercattrickStats[]} MercattrickStatsList */
