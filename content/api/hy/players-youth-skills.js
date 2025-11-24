/**
 * players-youth-skills.js
 * Functions working the HY playersYouthSkills API supplied by HY.
 * @author LA-MJ, HY backend/API by MackShot
 *
 * @Interface:
 * 		Url: https://www.hattrick-youthclub.org/_data_provider/foxtrick/playersYouthSkills
 * @params:
 *		//params send via http 'POST'
 * 		teamId: teamId
 * 		app: foxtrick
 *		hash: sha1/md5/base64 of 'foxtrick_'  + teamId
 * @response
 *		JSON:
 *			{
 *				$playerId: {
 *					speciality: @integer, // HY TYPO
 *					skills: {
 *						$skill_id: {
 *							cap: @float,
 *							current: @float,
 *							maxed: @boolean,
 *							cap_minimal: @float,
 *							cap_maximal: @float,
 *							current_estimation: @float,
 *							top3: @boolean
 *						},
 *						...
 *					}
 *				},
 *				...
 *			}
 * $playerId: @integer
 * $skill_id: @integer, c.f. Foxtrick.api.hy.skillMap
 * current = current skill level
 * current_estimation = predicted current skill level when current not available
 * cap = the cap of this skill
 * cap_minimal = minimal cap
 * cap_maximal = maximal cap (from top3)
 * maxed = whether the skill is fully maxed out or not
 * top3 = whether skill is among the 3 with highest potential (mentioned in scout report)
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
if (!Foxtrick.api.hy)
	Foxtrick.api.hy = {};
if (!Foxtrick.api.hy.URL)
	Foxtrick.api.hy.URL = {};

Foxtrick.api.hy.URL.playersYouthSkills = '/_data_provider/foxtrick/playersYouthSkills';

// this maps HY skill-id to skill
Foxtrick.api.hy.skillMap = {
	3: 'playmaking',
	4: 'winger',
	5: 'scoring',
	6: 'keeper',
	7: 'passing',
	8: 'defending',
	9: 'setPieces',
	10: 'experience',
};

/**
 * Low-level function to access HY's API. Should not be used directly
 * Tries to fetch the youth skills from HY and returns a Promise for players
 *
 * @param  {number}  [teamId] senior team ID to fetch data for
 * @return {Promise<HYPlayers>}
 */
Foxtrick.api.hy._fetchYouthSkills = function(teamId) {
	return Foxtrick.api.hy._fetchGeneric('playersYouthSkills', null, teamId);
};

/**
 * A localStore wrapper for _fetchYouthSkills
 *
 * Gets youth skills
 *
 * @param  {number}  [teamId] senior team ID to fetch data for
 * @return {Promise<HYPlayers>}
 */
Foxtrick.api.hy.getYouthSkills = function(teamId) {
	let days = Foxtrick.util.time.DAYS_IN_WEEK;
	let api = Foxtrick.api.hy;
	let fetch = () => api._fetchYouthSkills(teamId);
	return api._fetchViaCache('playersYouthSkills', fetch, days, teamId);
};

/**
 * @typedef HYSkill
 * @prop {boolean} top3
 * @prop {boolean} maxed
 * @prop {number} [current]
 * @prop {number} [cap]
 * @prop {number} [current_estimation]
 * @prop {number} [cap_minimal]
 * @prop {number} [cap_maximal]
 */

/**
 * @typedef {keyof Foxtrick.api.hy.skillMap} HYSkillIdx
 * @typedef {Record<HYSkillIdx, HYSkill>} HYSkills
 */
/**
 * @typedef HYPlayer
 * @prop {number} speciality HY Typo
 * @prop {HYSkills} skills
 */
/** @typedef {Record<number, HYPlayer>} HYPlayers */
