'use strict';
/*
Copyright (c) 2010 Re4Ver <psicotsitool@gmail.com>, http://www.aldeaglobal.net/psicotsi/
Copyright (c) 2013 lizardopoli <lizardopoli@gmail.com>, http://psicotsi.sourceforge.net/releases/
Copyright (c) 2013 LA-MJ <4mr.minj@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

Foxtrick.psico = {
	/**
	 * Hyperbolic tangent (overflows ~700)
	 * Returns [-1; 1]
	 * @param	{Number}	x
	 * @returns	{Number}
	 */
	tanh: function(x) {
		return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
	},
	/**
	 * get the index of the highest skill
	 * from [frm, sta, pm, w, sco, gk, ps, df, sp]
	 * @param	{Array}		skills	array of integers
	 * @returns	{Integer}			index
	 */
	getMaxSkill: function(skills) {
		var vmax = 0;
		var pmax = 0;
		for (var i = 2; i < skills.length - 1; i++) {
			if (skills[i] - vmax > 0) {
				vmax = skills[i];
				pmax = i;
			}
		}
		return pmax;
	},
	/**
	 * test whether two top skills are the same
	 * from [frm, sta, pm, w, sco, gk, ps, df, sp]
	 * @param	{Array}		vector	array of integers
	 * @returns	{Boolean}
	 */
	undefinedMainSkill: function(vector) {
		var vmax = 0;
		var pmax = 0;
		for (var i = 2; i < vector.length - 1; i++) {
			if (vector[i] - vmax > 0) {
				vmax = vector[i];
				pmax = i;
			};
		}
		for (var i = 2; i < vector.length - 1; i++) {
			if (vector[i] - vector[pmax] == 0 && i != pmax) {
				return true;
			}
		}
		return false;
	},
	//
	/**
	 * checks if player is a goalkeeper by the index of highest skill
	 * @param	{Integer}	maxSkill	index in the skill array
	 * @returns	{Boolean}
	 */
	isGoalkeeper: function(maxSkill) {
		return (maxSkill == 5);
	},
	/**
	 * calculate maximum GK level using TSI
	 * & form with sub {Low Avg High}
	 * @param	{Integer}	TSI
	 * @param	{Integer}	form
	 * @param	{String}	formSubLevel	{Low Avg High}
	 * @returns	{Number}					GK Level
	 */
	calcMaxSkillGK: function(TSI, form, formSubLevel) {
		//tnx to phinetom (8430364)
		var form_factor = (form * 0.025) + 0.110655;
		var level = Math.pow(100.5 * TSI / form_factor, 1 / 3.4) / 10 + 1;

		//form sublevel adjustment
		if (formSubLevel == 'Low') {
			level = level * 1.00854;
		} else if (formSubLevel == 'High') {
			level = level * 0.99179;
		}

		//form adjustment
		switch (form) {
			case 4:
				level = level * 0.99941;
				break;
			case 5:
				level = level * 0.99964;
				break;
			case 6:
				level = level * 0.99984;
				break;
			case 7:
				level = level * 1;
				break;
			case 8:
				level = level * 1.00013;
				break;
			default:
				break;
		}

		return level.toFixed(2);
	},
	/**
	 * calculate maximum skill level
	 * from [frm, sta, pm, w, sco, gk, ps, df, sp]
	 * using TSI & form {Low Avg High}
	 * @param	{Array}		playerskills	array of integers
	 * @param	{Integer}	TSI
	 * @param	{String}	formSubLevel	{Low Avg High}
	 * @returns	{Number}					skill Level
	 */
	calcMaxSkill: function(playerskills, TSI, formSubLevel) {
		var pinput = [1, 0, 0, 0, 0, 0, 0, 0];
		// Neural Network Input values
		// Form
		if (formSubLevel == 'Low') {
			pinput[1] = playerskills[0] + 0.01;
		}
		if (formSubLevel == 'Avg') {
			pinput[1] = playerskills[0] + 0.5;
		}
		if (formSubLevel == 'High') {
			pinput[1] = playerskills[0] + 0.99;
		}
		if (pinput[1] > 8) {
			pinput[1] = 8;
		}
		// Stamina
		if (playerskills[1] < 9) {
			pinput[2] = playerskills[1] + 0.25;
		} else {
			pinput[2] = playerskills[1];
		}
		pinput[3] = playerskills[2] + 0.25;
		pinput[4] = playerskills[3] + 0.25;
		pinput[5] = playerskills[4] + 0.25;
		pinput[6] = playerskills[6] + 0.25;
		pinput[7] = playerskills[7] + 0.25;
		// Main skill
		var pskillMax = this.getMaxSkill(playerskills);
		if (pskillMax > 5) {
			pskillMax = pskillMax - 1;
		}
		pskillMax = pskillMax + 1;
		if (pinput[pskillMax] > 7) {
			pinput[pskillMax] = pinput[pskillMax] - 0.2;
		} else {
			pinput[pskillMax] = pinput[pskillMax] - 0.1;
		}
		// Recognising mainSkill
		var mainSkill;
		switch (pskillMax) {
			case 3:
				mainSkill = 'PM';
				break;
			case 4:
				mainSkill = 'WG';
				break;
			case 5:
				mainSkill = 'SC';
				break;
			case 6:
				mainSkill = 'PS';
				break;
			case 7:
				mainSkill = 'DF';
				break;
		}
		// Starting approximation
		var level = pinput[pskillMax];
		var sublevel = 0;
		var err = 10000;
		var newTSI = this.sim(pinput, mainSkill);
		var cont = 0;
		while (err > 1 && cont < 100) {
			if (newTSI > TSI) {
				sublevel = sublevel - Math.pow(0.5, cont);
			}
			if (newTSI < TSI) {
				sublevel = sublevel + Math.pow(0.5, cont);
			}
			pinput[pskillMax] = level + sublevel;
			newTSI = this.sim(pinput, mainSkill);
			err = Math.abs(newTSI - TSI);
			cont++;
		}
		// Extreme values correction
		if (sublevel < 0) {
			sublevel = sublevel / 8;
		}
		if (sublevel > 1) {
			sublevel = 1 + (sublevel - 1) / 8;
		}
		// Output
		return (level + sublevel).toFixed(2);
	},
	/**
	 * Neural Network simulation
	 * Predicts TSI (float) for {PM WG SC PS DF}
	 * from [1, frm, sta, pm, w, sco, ps, df]
	 * @param	{Arrau}	pinput		array of numbers
	 * @param	{String}	mainSkill	{PM WG SC PS DF}
	 * @returns	{Number}				TSI
	 */
	sim: function(pinput, mainSkill) {
		// PlayMaking
		if (mainSkill == 'PM') {
			var meanp = [0, 6.37560321715818, 6.8295799821269, 9.18572832886573, 3.82265415549598, 3.80478105451296, 3.97028596961573, 3.7316800714924];
			var stdp = [1, 1.27931620538792, 2.068121874063, 2.64814773627783, 1.25944526479215, 1.23643585187472, 1.41074883966057, 1.200261576732];
			var meant = 3.44951885218574;
			var stdt = 0.69620243901134;
			var IW = [
				[-0.978045139728464, 0.00301687457750677, -0.048841998968147, -0.404735131313642, -0.0362317679661696, 0.0379976393063689, 0.010290023976103, -0.0147760361492318],
				[0.177344012094537, -0.0314455259871624, -0.013402962769724, -0.0892159635787965, 0.149684600060107, 0.0129173095791169, -0.0627676826414977, -0.0140624018719683],
				[1.36521889783453, -0.00637939702956546, 0.0153705440757856, 0.556447703939989, -0.0241943951441762, -0.0493823748265197, -0.21427629169483, -0.00101793041393101],
				[0.196053426793117, -0.02079754895227, 0.00105220616818506, -0.0444692661662335, -0.125304863742313, 0.000952177286031863, 0.0555651518906449, -0.0497925245034302],
				[0.692342189504846, -0.651215170938504, -0.0773280848125734, -0.0299899107255201, 0.0102778174399698, -0.00729484262085779, 0.019086283284809, -0.0704572408040264],
				[1.58818822767738, -0.00884634038142363, 0.0255779210123106, 0.487506584936556, 0.0814314344175245, -0.251017981688899, 0.0901880561018751, -0.0166380710765307],
				[-0.349984574105507, -0.00620252485894222, 0.0100312003087919, 0.23260892557538, 0.0260982230419322, 0.111026396362525, 0.037817626462384, -0.319122796193367]
			];
			var LW = [1.45005860984466, -5.08419804987079, -3.09594267675791, -2.19350882485451, -3.55681002955351, 0.212673777310428, -2.17305546140852, 0.669079546193561];
		}
		// Winger
		if (mainSkill == 'WG') {
			var meanp = [0, 6.11559888579387, 6.38544568245125, 4.19986072423398, 9.07820334261824, 3.78899721448468, 4.09261838440111, 3.94707520891365];
			var stdp = [1, 1.35219800030418, 1.87676157709407, 1.60495529959243, 1.92480738248487, 1.23672495343354, 1.35904038569407, 1.42286644873124];
			var meant = 3.34828115361494;
			var stdt = 0.50248598993484;
			var IW = [
				[-0.660772073958308, -0.01833440065284, -0.0878004061319683, 0.00014551774875378, -0.09581305124871, -0.018902774261109, -0.0267581613703629, -0.0533105102621847],
				[0.512421132362667, 0.0382337124466166, 0.0773884058542099, -0.0478971000074065, -0.227090911654096, 0.0749380149540642, -0.0192496230658901, 0.591939574122913],
				[-1.37612347434054, -0.0172255940860493, 0.0372075456228269, 0.732664914012482, -0.636332206449557, 0.0660828680402308, -0.13569710277901, -0.0969683305370428],
				[-0.767604389511557, 0.0164740614163994, 0.0996416926112712, 0.0574768132107605, 0.406081043832447, -0.0338799984024221, -0.755504987651843, 0.0404297482763663],
				[0.51444631220829, 0.0227910340702376, -0.194434226880239, 0.0157033323422596, 0.145696031716467, 0.0280447811851727, 0.0997626514667552, 0.0600548994144656]
			];
			var LW = [-4.87066368568217, -8.12793906828807, -0.56007809906691, 0.451613517207488, 0.354350670244603, 2.07516604461788];
		}
		// Scoring
		if (mainSkill == 'SC') {
			var meanp = [0, 6.21562558619396, 5.79731757643969, 3.79764584505721, 3.78432751828925, 9.20751266179118, 4.23921403113862, 3.88655974488839];
			var stdp = [1, 1.45803238481507, 1.84919443347091, 1.29668412881596, 1.21518918313263, 1.71476790521195, 1.54547609249067, 1.29572069955967];
			var meant = 3.45478105603469;
			var stdt = 0.44019807215147;
			var IW = [
				[1.40301200769146, -0.0193144940635949, 0.0212311747405729, -0.175540588154821, -0.0221115046234967, 0.214900394271821, 0.0193996813745877, -0.0481966024580163],
				[-1.30320677336796, -0.00823005974306588, -0.0639798654429837, -0.0548890263553145, -0.000909477091528763, -0.439094120327123, 0.616393481014018, -0.00643510347147235],
				[0.622274133245999, 0.0155796819413849, 0.231654894650702, -0.0891031925337777, -0.157262349055432, -0.589802519029839, -0.143798421154869, -0.187230559566363],
				[-0.634112378069713, -0.000944335329076177, -0.0544022297082993, 0.0193751289262962, -0.0100586795623683, -0.106747528361095, 9.52666848716332e-005, -0.035002277549141],
				[-0.760416443748201, -0.00710422254483257, -0.0438615652834481, 0.102521784762147, -0.0281872796781719, -0.0687360185898756, 0.0163874310887414, -0.228778191132918],
				[-2.04885929453845, -0.320961567561186, 0.000944441355045404, -0.0305253294471756, -0.00788624645149755, 0.0126358849478757, 0.00808561844967016, -0.00871625102475451],
				[0.283890100480124, 0.0136008146777745, -0.362135507458957, -0.00175774533580776, 0.0181290187333429, 0.220512760178359, 0.044816292969784, 0.032774317851683]
			];
			var LW = [-7.7074616828558, -4.81464556813888, 0.640026643980887, 0.221373217042846, -17.1398121382442, 2.59419730774328, -4.26616397837132, 1.10880653486695];
		}
		// Passing
		if (mainSkill == 'PS') {
			var meanp = [0, 5.9037558685446, 6.04694835680751, 4.12323943661972, 4.09976525821596, 4.21713615023474, 7.21807511737088, 4.38615023474178];
			var stdp = [1, 1.52228260105579, 1.95290122400408, 1.29144037033675, 1.29438644360604, 1.49333417169661, 0.961187627213399, 1.67817798097032];
			var meant = 3.06630240883934;
			var stdt = 0.42308172264001;
			var IW = [
				[-11.8900701342496, -0.024750835138891, -0.965752396040145, -2.09746089518353, -0.321967528454612, -2.38676435871213, -5.1471801821007, 7.79174276667143],
				[0.529380858245977, 0.0291519802983588, 0.0369583467350457, 0.032424613698893, 0.0329191863310305, 0.0396041328798249, 0.0930316090276224, 0.0356752670740693],
				[2.33113350771975, 3.74579049731695, 7.11876326800507, -7.91110226838671, 3.6497359930875, -3.87258670301254, -3.046829371455, 5.84457458310682]
			];
			var LW = [-3.83433618763949, 0.297797052746795, 8.55140826231407, -0.0817402547000788];
		}
		// Defending
		if (mainSkill == 'DF') {
			var meanp = [0, 6.71400113830393, 5.55150825270347, 3.49132043255549, 3.53173022196927, 3.54083665338645, 3.75028457598179, 8.03890153670999];
			var stdp = [1, 1.48828675945146, 1.84177487301679, 1.14089446002011, 1.1547523721879, 1.09262970647274, 1.27111995210437, 1.91951279588256];
			var meant = 3.07079169070856;
			var stdt = 0.54669631751747;
			var IW = [
				[0.6857172999329, 0.144851901928772, 0.00732053581209846, 0.142004608852104, 0.322390526898797, 0.541747526748434, 0.00470511682361453, -0.352618377429687],
				[0.620509248945402, -0.0126640050506412, -0.0313294540757459, 0.0726382032031436, -0.0658046623810817, -0.0531578337102174, 0.14309876313257, -0.262817885221702],
				[0.361958560232547, 0.0191873845346643, 0.0940541699357571, -0.042618354807883, 0.123768814062805, 0.178214776227766, 0.0870625029013581, 0.545801377669313],
				[0.807238317377399, 0.050804039114291, 0.0338844355782919, 0.246852103250382, -0.0694942575939604, -0.10098194009457, -0.354751810513075, -0.124777986713548],
				[-0.341621423026568, 0.000309270803772757, 0.00956076398728777, 0.175139999720122, -0.0332175436812512, -0.0333469154384476, 0.0646493157528646, -0.0239336387359904],
				[2.76039548716256, -0.00904355194026333, 1.64943269580411, -0.0338036046909946, -0.198593977982261, -0.109517200651956, -0.167444994960601, -0.230909331468331],
				[1.58875346153719, 0.293418924006587, 0.0211646546315773, 0.0824895902178759, 0.0040093750686147, 0.0394329201279045, 0.020570514119798, -0.0305463551011085]
			];
			var LW = [0.140377452993393, -0.339571400603176, -2.30959398112466, 0.985381658295128, -0.767870805617256, 2.35039694690841, 0.215556071649187, 2.22390988552588];
		}
		if (typeof(LW) === 'undefined')
			return null;

		var phidden = [1];
		for (var i = 1; i < LW.length; i++) {
			phidden.push(0);
			for (var j = 0; j < 8; j++) {
				phidden[i] = phidden[i] + ((pinput[j] - meanp[j]) / stdp[j]) * IW[i - 1][j];
			}
			phidden[i] = this.tanh(phidden[i]);
		}
		var poutput = 0;
		for (var k = 0; k < LW.length; k++) {
			poutput = poutput + phidden[k] * LW[k];
		}
		return Math.pow(10, poutput * stdt + meant);
	},

	/**
	 * Predict skill using wage and age (type: Low Avg High)
	 * from [frm, sta, pm, w, sco, gk, ps, df, sp]
	 * @param	{Array}	playerskills	array of integers
	 * @param	{Integer}	wage
	 * @param	{Integer}	age
	 * @param	{String}	predictionType	{Low Avg High}
	 * @param	{Boolean}	debugEnabled	print to console
	 * @returns	{Number}					Skill
	 */
	simWage: function(playerskills, wage, age, predictionType, debugEnabled) {
		//                             0    1    2    3    4    5    6    7    8
		//var playerskills = new Array(frm, sta, pla, win, sco, goa, pas, def, sp);
		var magicNumbers = [
			'', '', 'Playmaking', 'Winger', 'Scoring', 'Keeper', 'Passing', 'Defending'
		];

		var comparing_wage = wage;
		//DEBUG
		var debug = '\n';
		debug += 'WAGE (without 20%): ' + parseInt(wage, 10) + '\n';

		//removing base salary from wage
		wage -= 250;

		//removing set pieces from wage
		wage = wage / (1 + 0.0025 * Math.max(0, playerskills[8]));
		debug += 'WAGE (without SP and base salary): ' + parseInt(wage, 10) + '\n';

		if (age >= 29 && age <= 37) {
			wage = wage / (1 - (age - 28) / 10);
			debug += 'WAGE (without AGE impact): ' + parseInt(wage, 10) + '\n';
			comparing_wage = wage * (1 + 0.0025 * Math.max(0, playerskills[8])) + 250;
		}

		var coefficients = {
			// wage = (a * (skill ^ b)) [* c, if secondary skill] [* d, if wage > 20000]
			//sk    a             b             c     d
			'5' : [ 0.0005010000, 6.4000000000, 0.50, 1      ], //keeping    [PLACEHOLDER]
			'7' : [ 0.0007107782, 6.4631407136, 0.50, 0.7908 ], //defending
			'2' : [ 0.0009193936, 6.4521801940, 0.50, 0.7762 ], //playmaking
			'6' : [ 0.0005552801, 6.4335763954, 0.50, 0.9002 ], //passing
			'3' : [ 0.0004312358, 6.4774737732, 0.50, 0.7778 ], //winger
			'4' : [ 0.0009015187, 6.4153497279, 0.50, 0.7935 ]  //scoring
		};

		var subtractFromSkill = 1; //default low prediction

		switch (predictionType) {
			case 'High':
				subtractFromSkill = 0.01;
				break;
			case 'Avg':
				subtractFromSkill = 0.5;
				break;
			default: //Low or invalid parameter
				subtractFromSkill = 1;
				predictionType = 'Low';
		}

		//calculating mainSkill basing on wage
		var mainSkill = 0;
		var max_low = 0;
		var max_high = 0;
		var detectable = false;

		for (var loop = 2; loop <= 7; ++loop) {
			var skill = playerskills[loop];
			if (skill < 1) {
				continue;
			}

			var wage_component_low = 0;
			var wage_component_high = 0;

			if (loop != 5) { // not GK
				wage_component_low = coefficients[loop][0] *
					Math.pow(skill - 1, coefficients[loop][1]);
				wage_component_high = coefficients[loop][0] *
					Math.pow(skill - 0.01, coefficients[loop][1]);
			} else {
				wage_component_low = this.simWageKeeper(skill - 1);
				wage_component_high = this.simWageKeeper(skill - 0.01);
			}

			// > 20000 discount
			if (wage_component_low > 20000)
				wage_component_low = 20000 + (wage_component_low - 20000) * coefficients[loop][3];
			if (wage_component_high > 20000)
				wage_component_high = 20000 + (wage_component_high - 20000) * coefficients[loop][3];
			//GM_log('Testing skill: ' + magicNumbers[loop] + '\nwage_component_low: ' + wage_component_low + '\nwage_component_high: ' + wage_component_high +'\n');

			if (wage_component_low > max_low) {
				mainSkill = loop;
				max_low = wage_component_low;
				if (wage_component_low > max_high) {
					detectable = true;
					max_high = wage_component_high;
				}
				else {
					detectable = false;
				}
			}
		}

		if (!detectable) {
			return 'N/A';
		}

		debug += 'MAIN SKILL: ' + magicNumbers[mainSkill] + '\n';

		var simskill = 0;
		var simwage = 0;
		//removing secondary skills from wage
		for (loop = 2; loop <= 7; ++loop) {
			if (loop == mainSkill)
				continue;
			var subskill = playerskills[loop] - subtractFromSkill;
			var wage_sub_component = 0;

			if (loop != 5) { // not GK
				wage_sub_component = coefficients[loop][0] *
					Math.pow(subskill, coefficients[loop][1]);
			} else {
				wage_sub_component = this.simWageKeeper(subskill);
			}

			// > 20000 discount
			if (wage_sub_component > 20000)
				wage_sub_component = 20000 + (wage_sub_component - 20000) * coefficients[loop][3];

			//secondary skill 50% discount
			wage_sub_component = wage_sub_component * coefficients[loop][2];

			if (isNaN(wage_sub_component) || wage_sub_component < 0) {
				wage_sub_component = 0;
			}
			//high skill discount
			debug += 'WAGE_SECONDARY_COMPONENT (' + magicNumbers[loop] + '): ' +
				parseInt(wage_sub_component, 10) + ' (' + subskill + ')\n';
			wage -= wage_sub_component;
			if (wage < 0)
				return 'N/A';
			simwage += wage_sub_component;
		}

		var wage_main_component = 0;
		wage_main_component = coefficients[mainSkill][0] *
			Math.pow(playerskills[mainSkill] - 1, coefficients[mainSkill][1]);

		// > 20000 discount on main component
		if (wage_main_component > 20000)
			wage_main_component = 20000 + (wage_main_component - 20000) * coefficients[mainSkill][3];

		// N/A wage detection for keepers keeping_ad undefined
		// if (mainSkill == 5) {
		// 	wage_main_component = wage_main_component * keeping_adj;
		// }

		// remove > 20000 discount on wage to get proper skill prediction
		if (wage > 20000)
			wage = 20000 + (wage - 20000) / coefficients[mainSkill][3];

		simwage += wage_main_component;
		simwage = simwage * (1 + 0.0025 * Math.max(0, playerskills[8])) + 250;
		debug += 'EST. WAGE WITHOUT SECONDARIES: ' + parseInt(wage, 10) + '\n';
		debug += 'SIM_MAIN_SKILL_WAGE (0 decimals): ' + parseInt(wage_main_component, 10) + '\n';
		debug += 'SIM_WAGE (main skill + secondaries + sp + base salary): ' +
			parseInt(simwage, 10) + '\n';
		debug += 'DIFFERENCE RATIO (WAGE / SIM_WAGE): ' +
			((1 - comparing_wage / simwage) * 100).toFixed(2) + '%' + '\n';

		//make prediction
		simskill = Math.pow(wage / coefficients[mainSkill][0], 1 / coefficients[mainSkill][1]);

		debug += 'SIM_MAIN_SKILL: ' + (simskill + 1).toFixed(2) + '\n';
		if (debugEnabled) {
			Foxtrick.log(debug);
		}
		return (simskill + 1).toFixed(2);
	},

	// seems rather useless, leaving for now
	simWageKeeper: function (skill) {
		var coefficients = [
			-3.71589339794053e-56,
			1.04009125232652e-50,
			-1.23925532612466e-45,
			8.28233101957159e-41,
			-3.44786999276044e-36,
			9.40005209607577e-32,
			-1.72062171158208e-27,
			2.13678090366430e-23,
			-1.80197689313736e-19,
			1.02533307654267e-15,
			-3.88645216393083e-12,
			9.63752335367394e-09,
			-1.53667425395314e-05,
			0.0162490281050522,
			-0.918881884002134
		];
		return 0;
	},
	/**
	 * Get PsicoTSI prediction data from playerskills
	 * [frm, sta, pm, w, sco, gk, ps, df, sp]
	 * Returns prediction object:
	 * { maxSkill, isGK, undef, limit, formLow, formAvg, formHigh, wageLow, wageAvg, wageHigh }
	 * @param	{Object}	playerskills
	 * @param	{Number}	currTSI
	 * @param	{Number}	currWAGE
	 * @param	{Number}	age
	 * @returns	{Object}
	 */
	getPrediction: function(playerskills, currTSI, currWAGE, age) {
		var frm = playerskills[0];
		var maxSkill = this.getMaxSkill(playerskills);
		// halt if player is a Divine or Non - existent
		if (playerskills[maxSkill] == 20 || playerskills[maxSkill] == 0) {
			return null;
		}
		var formAvg = 0;
		var formLow = 0;
		var formHigh = 0;

		var wageLow = 'N/A';
		var wageAvg = 'N/A';
		var wageHigh = 'N/A';

		var undef = this.undefinedMainSkill(playerskills);
		var limit = 'Medium';
		var isGK = this.isGoalkeeper(maxSkill);
		if (!isGK) {
			formAvg = this.calcMaxSkill(playerskills, currTSI, 'Avg');
			formLow = this.calcMaxSkill(playerskills, currTSI, 'Low');
			formHigh = this.calcMaxSkill(playerskills, currTSI, 'High');
		} else {
			formAvg = this.calcMaxSkillGK(currTSI, frm, 'Avg');
			formLow = this.calcMaxSkillGK(currTSI, frm, 'Low');
			formHigh = this.calcMaxSkillGK(currTSI, frm, 'High');
		}
		if (currWAGE >= 270 && !isGK) {
			wageLow = this.simWage(playerskills, currWAGE, age, 'Low');
			wageAvg = this.simWage(playerskills, currWAGE, age, 'Avg');
			wageHigh = this.simWage(playerskills, currWAGE, age, 'High');
		}
		if (formLow - playerskills[maxSkill] <= 0.1) {
			limit = 'Low';
		}
		if (formHigh - playerskills[maxSkill] >= 0.8 ||
			wageHigh - playerskills[maxSkill] >= 0.8) {
			limit = 'High';
		}

		var pr = {
			maxSkill: maxSkill, isGK: isGK, undef: undef, limit: limit,
			formLow: formLow, formAvg: formAvg, formHigh: formHigh,
			wageLow: wageLow, wageAvg: wageAvg, wageHigh: wageHigh
		};

		return pr;
	}
};
