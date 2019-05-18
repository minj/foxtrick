/**
 * math.js
 * Math and prediction utilities
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	var Foxtrick = {};
/* eslint-enable */

Foxtrick.Math = {};
/**
 * Hyperbolic tangent (overflows ~700)
 * Returns [-1; 1]
 * @param	{Number}	x
 * @returns	{Number}
 */
Foxtrick.Math.tanh = function(x) {
	return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
};
/**
 * find the quotent for integer division a / b
 * @param	{Integer}	a
 * @param	{Integer}	b
 * @returns	{Integer}
 */
Foxtrick.Math.div = function(a, b) {
	return (a - a % b) / b;
};

/**
 * Convert HatStats to 0-based (default) or 1-based float level
 * solid (very low) = 6.0; non-existent = disastrous (very low) = 0.0
 * or solid (very low) = 7.0; non-existent = 0; disastrous (very low) = 1.0
 * @param	{Integer}	hs			HatStats
 * @param	{boolean}	oneBased	return based on solid=7
 * @returns	{Number}				floating point level
 */
Foxtrick.Math.hsToFloat = function(hs, oneBased) {
	var ret = parseInt(hs, 10);
	return ret ? (ret - 1) / 4 + (oneBased ? 1.0 : 0.0) : 0.0;
};

Foxtrick.Predict = {};
/**
 * Predict possesion probability according to midfield ratio
 * ratio = mfA / (mfA + mfB)
 * where mfA is 0-based rating (HS, float, w/e)
 * [post=15766691.242]
 * @param	{Number}	ratio	mfA / (mfA + mfB)
 * @returns	{Number}			probability
 */
Foxtrick.Predict.possession = function(ratio) {
	var first = Math.pow(ratio, Math.E);
	var second = Math.pow(1 - ratio, Math.E);
	return first / (first + second);
};
/**
 * Predict scoring probability according to attack ratio
 * ratio = attA / (attA + defB)
 * where attA is 0-based rating (HS, float, w/e)
 * [post=15766691.221]
 * @param	{Number}	ratio	attA / (attA + defB)
 * @returns	{Number}			probability
 */
Foxtrick.Predict.attack = function(ratio) {
	return Foxtrick.Math.tanh(6.9 * (ratio - 0.51)) * 0.455 + 0.46;
};
/**
 * Predict defending probability according to defence ratio
 * ratio = defA / (defA + attB)
 * where defA is 0-based rating (HS, float, w/e)
 * [post=15766691.221]
 * @param	{Number}	ratio	defA / (defA + attB)
 * @returns	{Number}			probability
 */
Foxtrick.Predict.defence = function(ratio) {
	return 1 - (Foxtrick.Math.tanh(6.9 * (1 - ratio - 0.51)) * 0.455 + 0.46);
};
/**
 * Predict average energy for 90 minutes based on stamina level
 * 0 <= Energy <= 1
 * formula by lizardopoli/Senzascrupoli/Pappagallopoli et al
 * [post=15917246.1]
 * latest data:
 * https://docs.google.com/file/d/0Bzy0IjRlxhtxaGp0VXlmNjljaTA/edit?usp=sharing
 * @param	{Number}	stamina	1-based float level
 * @returns	{Number}			average energy/starting energy
 */
Foxtrick.Predict.averageEnergy90 = function(stamina) {
	var checkpoint, currentEnergy, decay, initialEnergy, rest, totalEnergy, _i;
	if (stamina >= 8.63) {
		return 1;
	}
	totalEnergy = 0;
	initialEnergy = 1 + (0.0292 * stamina + 0.05);
	if (stamina > 8) {
		initialEnergy += 0.15 * (stamina - 8);
	}
	decay = Math.max(0.0325, -0.0039 * stamina + 0.0634);
	rest = 0.1875;
	for (checkpoint = _i = 1; _i <= 18; checkpoint = ++_i) {
		currentEnergy = initialEnergy - checkpoint * decay;
		if (checkpoint > 9) {
			currentEnergy += rest;
		}
		currentEnergy = Math.min(1, currentEnergy);
		totalEnergy += currentEnergy;
	}
	return totalEnergy / 18;
};
/**
 * Predict 1-based stamina level based on energy at 90 minutes
 * 0 <= energyAt90 <= 1
 * Player must have played from the start
 * Watch for negative SEs for powerful
 * @param	{Number}	energyAt90	energy/startingEnergy
 * @returns	{Number}				1-based stamina level
 */
Foxtrick.Predict.stamina = function(energyAt90) {
	return energyAt90 <= 0.887 ? energyAt90 * 10.1341 - 0.9899 :
		8 + (energyAt90 - 0.887) / 0.1792;
};

/**
 * Predict bonus for each player skill based on loyalty level.
 * formula
 * loyalty = 1 + sqrt(days/336)*19
 * bonus = sqrt(days/336)
 * -> bonus = (loyalty - 1) / 19
 * @param  {number}  loyaltyLevel Loyalty attribute value
 * @param  {boolean} isMotherClub Is player playing in mother club?
 * @return {number}               Bonus value for each skill
 */
Foxtrick.Predict.loyaltyBonus = function(loyaltyLevel, isMotherClub) {
	if (isMotherClub)
		return 1.5;

	if (typeof loyaltyLevel !== 'undefined')
		return Math.max(0, loyaltyLevel - 1) / 19.0;

	return 0;
};

/**
 * @typedef PlayerContributionParams
 * @prop {number} CTR_VS_WG
 * @prop {number} WBD_VS_CD
 * @prop {number} WO_VS_FW
 * @prop {number} MF_VS_ATT
 * @prop {number} DF_VS_ATT
 * @prop {number} IM_VS_CD
 */

/* eslint-disable max-len */
/**
 * @typedef {'kp'|'cd'|'cdo'|'cdtw'|'wb'|'wbd'|'wbo'|'wbtm'|'w'|'wd'|'wo'|'wtm'|'im'|'imd'|'imo'|'imtw'|'fw'|'fwd'|'tdf'|'fwtw'} PlayerPositionCode
 * @typedef {'defending'|'keeper'|'passing'|'playmaking'|'scoring'|'setPieces'|'winger'} PlayerSkillName
 */
/* eslint-enable max-len */

/**
 * @typedef SkillContribution
 * @prop {number} center
 * @prop {number} side
 * @prop {number} farSide
 * @prop {number} wings
 * @prop {number} factor
 */
/**
 * @typedef {number|SkillContribution} SkillContributionOptional
 * @typedef {Object.<PlayerSkillName, SkillContributionOptional>} PositionContributions
 * @typedef {Object.<PlayerPositionCode, PositionContributions>} ContributionFactors
 * @typedef {Object.<PlayerPositionCode, number>} Contributions
 */

/**
 * Make a position contribution map.
 * Options is {CTR_VS_WG, WBD_VS_CD, WO_VS_FW, MF_VS_ATT, DF_VS_ATT, IM_VS_CD: number} (optional)
 * By default options is assembled from prefs or needs to be fully overridden otherwise.
 *
 * Definition format: {center, side, farSide, wings, factor: number}
 * @param  {PlayerContributionParams} [options]
 * @return {ContributionFactors} position contribution map
 */
Foxtrick.Predict.contributionFactors = function(options) {
	/* eslint-disable no-magic-numbers */
	var opts = options;
	if (!opts)
		opts = Foxtrick.modules['PlayerPositionsEvaluations'].getParams();

	/**
	 * @typedef {number|[number, number]|[number, number, number]} SkillContributionDef
	 * @typedef {Object.<PlayerSkillName, SkillContributionDef>} PositionContributionDef
	 * @typedef {Object.<PlayerPositionCode, PositionContributionDef>} ContributionFactorDef
	 */

	// all factors taken from https://docs.google.com/spreadsheets/d/1bNwtBdOxbY8pdY7uAx0boqHwRtJgj7tNpcFtDsP9Wq8/edit#gid=0
	// format: middle[, side[, farSide]]

	/** @type {ContributionFactorDef} */
	var factors = {
		kp: {
			keeper: [0.87, 0.61, 0.61],
			defending: [0.35, 0.25, 0.25],
		},
		cd: {
			defending: [1, 0.26, 0.26],
			playmaking: 0.25,
		},
		cdo: {
			defending: [0.73, 0.20, 0.20],
			playmaking: 0.40,
		},
		cdtw: {
			defending: [0.67, 0.81],
			playmaking: 0.15,
			winger: [0, 0.26],
		},
		wb: {
			defending: [0.38, 0.92],
			playmaking: 0.15,
			winger: [0, 0.59],
		},
		wbd: {
			defending: [0.43, 1],
			playmaking: 0.10,
			winger: [0, 0.45],
		},
		wbo: {
			defending: [0.35, 0.74],
			playmaking: 0.20,
			winger: [0, 0.69],
		},
		wbtm: {
			defending: [0.70, 0.75],
			playmaking: 0.20,
			winger: [0, 0.35],
		},
		w: {
			defending: [0.20, 0.35],
			playmaking: 0.45,
			passing: [0.11, 0.26],
			winger: [0, 0.86],
		},
		wd: {
			defending: [0.25, 0.61],
			playmaking: 0.30,
			passing: [0.05, 0.21],
			winger: [0, 0.69],
		},
		wo: {
			defending: [0.13, 0.22],
			playmaking: 0.30,
			passing: [0.13, 0.29],
			winger: [0, 1],
		},
		wtm: {
			defending: [0.25, 0.29],
			playmaking: 0.55,
			passing: [0.16, 0.15],
			winger: [0, 0.74],
		},
		im: {
			defending: [0.40, 0.09, 0.09],
			playmaking: 1,
			passing: [0.33, 0.13, 0.13],
			scoring: [0.22, 0],
		},
		imd: {
			defending: [0.58, 0.14, 0.14],
			playmaking: 0.95,
			passing: [0.18, 0.07, 0.07],
			scoring: [0.13, 0],
		},
		imo: {
			defending: [0.16, 0.04, 0.04],
			playmaking: 0.95,
			passing: [0.49, 0.18, 0.18],
			scoring: [0.31, 0],
		},
		imtw: {
			defending: [0.33, 0.24],
			playmaking: 0.90,
			passing: [0.23, 0.31],
			winger: [0, 0.59],
		},
		fw: {
			playmaking: 0.25,
			passing: [0.33, 0.14, 0.14],
			scoring: [1, 0.27, 0.27],
			winger: [0, 0.24, 0.24],
		},
		fwd: {
			playmaking: 0.35,
			passing: [0.53, 0.31, 0.31],
			scoring: [0.56, 0.13, 0.13],
			winger: [0, 0.13, 0.13],
		},
		tdf: {
			playmaking: 0.35,
			passing: [0.53, 0.41, 0.41],
			scoring: [0.56, 0.13, 0.13],
			winger: [0, 0.13, 0.13],
		},
		fwtw: {
			playmaking: 0.15,
			passing: [0.23, 0.21, 0.06],
			scoring: [0.66, 0.51, 0.19],
			winger: [0, 0.64, 0.21],
		},
	};

	/**
	 * @param  {PlayerPositionCode} position
	 * @param  {PlayerSkillName} skill
	 * @return {SkillContributionOptional}
	 */
	var getSkillData = function(position, skill) {
		/** @type {PositionContributionDef} */
		let pos = factors[position];

		if (!(skill in pos))
			return 0;

		/** @type {SkillContributionDef} */
		let contr = pos[skill];
		let isDef = skill === 'defending' || skill === 'keeper';

		let factor = 0, center = 0, side = 0, farSide = 0, wings = 0;
		if (Array.isArray(contr)) {
			center = contr[0];
			side = contr[1];
			farSide = contr[2] || 0;

			side *= isDef ? opts.WBD_VS_CD : opts.WO_VS_FW;
			farSide *= isDef ? opts.WBD_VS_CD : opts.WO_VS_FW;
			wings = side + farSide;

			// weighted average for 3 sectors
			factor = (center + wings / opts.CTR_VS_WG) / (1 + 2 / opts.CTR_VS_WG);
			if (isDef)
				factor *= opts.DF_VS_ATT;
		}
		else {
			// PM
			center = contr * opts.IM_VS_CD;
			factor = center * opts.MF_VS_ATT;
		}

		// Foxtrick.log(position, skill, factor);

		return { center, side, farSide, wings, factor };
		/* eslint-disable no-magic-numbers */
	};

	/** @type {ContributionFactors} */
	var ret = {};

	for (let pos in factors) {
		// eslint-disable-next-line no-extra-parens
		let code = /** @type {PlayerPositionCode} */ (pos);
		ret[code] = {};

		/** @type {PositionContributionDef} */
		let skillDef = factors[code];

		for (let s in skillDef) {
			// eslint-disable-next-line no-extra-parens
			let skill = /** @type {PlayerSkillName} */ (s);
			ret[code][skill] = getSkillData(code, skill);
		}
	}

	return ret;
};

/**
 * Get effective skill levels based on player attributes.
 * Skill map must be {keeper, defending, playmaking, winger, passing, scoring, setPieces}.
 * Attributes map must be:
 * {form, stamina, ?staminaPred, experience, loyalty, motherClubBonus, bruised, transferListed}
 * Options is {form, stamina, experience, loyalty, bruised: Boolean} (optional)
 * By default options is assembled from prefs or needs to be fully overridden otherwise.
 *
 * Returns effective skill map.
 * @author Greblys, LA-MJ
 * @param  {PlayerSkills}          skills   Object.<string, number>  skill map
 * @param  {PlayerProps}            attrs    Object.<string, ?>       attribute map
 * @param  {PlayerContributionOpts} options  Object.<string, Boolean> options map
 * @return {PlayerSkills}                                             effective skill map
 */
// eslint-disable-next-line complexity
Foxtrick.Predict.effectiveSkills = function(skills, attrs, options) {
	let opts = options || Foxtrick.modules['PlayerPositionsEvaluations'].getPrefs();

	var ret = {};
	Foxtrick.mergeAll(ret, skills);

	// Source [post=16376110.4]
	var bonus, skill;
	if (opts.experience && attrs.experience) { // don't do log 0
		bonus = Math.log(attrs.experience) / Math.log(10) * 4.0 / 3.0;
		for (skill in ret)
			ret[skill] += bonus;
	}

	let loyalty = attrs.loyalty;
	let mcb = !!attrs.motherClubBonus;
	let tl = attrs.transferListed; // loyalty can be undefined in transfer pages
	if (opts.loyalty && typeof loyalty !== 'undefined' && !tl) {
		bonus = Foxtrick.Predict.loyaltyBonus(loyalty, mcb);
		for (skill in ret)
			ret[skill] += bonus;
	}

	if (opts.stamina) {
		var energy = Foxtrick.Predict.averageEnergy90(attrs.staminaPred || attrs.stamina);
		for (skill in ret)
			ret[skill] *= energy;
	}

	/**
	 * Source [post=16376110.4]
	 * Probably we will never know if the form affect needs to be calculated before or after
	 * other bonuses' addition to the main skills.
	 */
	if (opts.form) {
		var formInfls = [
			0,
			0.305,
			0.5,
			0.629,
			0.732,
			0.82,
			0.897,
			0.967,
			1,
		];
		for (skill in ret)
			ret[skill] *= formInfls[attrs.form];
	}

	// source: http://www.hattrickinfo.com/en/training/284/#281-
	if (opts.bruised && attrs.bruised) {
		for (skill in ret)
			ret[skill] *= 0.95;
	}

	return ret;
};
