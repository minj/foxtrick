'use strict';
/*
 * math.js
 * Math and prediction utilities
 */

if (!Foxtrick)
	var Foxtrick = {};

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
 * @param	{Boolean}	oneBased	return based on solid=7
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
}
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
