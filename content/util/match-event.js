/**
 * Utilities to handle match events as delivered by HT
 * Also including common functionality shared by
 * match report format and live match report format
*/

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	var Foxtrick = {};
/* eslint-enable */

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.matchEvent = {};

/*
	 * Source: /Community/CHPP/ChppMatchEventTypes.aspx
	 * Event Types and Icon mapping
	 *
	 * 20,21,40,47,70,71,599 are used for match indicators, don't convert them to objects
	 *
	 * for events that require several icons specify a dictionary with
	 * keys 'team' and 'other' and an array of icons as values.
	 * If only one team needs icons the other key can be omnitted.
	 *
	 * Example:
	 * { team: ['miss', 'se_technical'], other: ['se_head_specialist'] },
	 * { team: ['goal', 'se_technical']},
	 * { other: ['goal']}
*/
Foxtrick.util.matchEvent.eventIcons = {
	19: null,
	20: 'formation',
	21: 'formation',
	22: 'kids',
	23: 'formation',
	24: 'formation',
	25: { away: ['derby'] },
	26: { home: ['neutral'] },
	27: { away: ['home'] },
	30: { home: ['weather_rainy'] },
	31: { home: ['weather_cloudy'] },
	32: { home: ['weather_fair'] },
	33: { home: ['weather_sunny'] },

	// TODO START
	35: null,
	36: null,
	37: null,
	38: null,
	39: null,
	// TODO END

	40: 'possession',
	41: 'best_player',
	42: 'worst_player',
	45: 0,
	46: 'hattrick',
	47: 'possession',
	55: { team: ['goal', 'se_technical'] },
	56: 'goal',
	57: 'goal',
	58: 'miss',
	59: 'miss',
	60: 'underestimation',
	61: 'confusion',
	62: 'pullback',
	63: 'underest_gone',
	64: 'reorganize',
	65: 'nerves',
	66: 'underest_decr',
	67: 'underest_decr',
	68: 'pressing',
	69: 'underest_gone',
	70: 'extraTime',
	71: 'penaltyShootOut',
	72: 0,
	73: 'tossing_coin',
	75: null, // TODO
	76: null, // TODO
	80: 'captain',
	81: 'setPieces',
	90: 'bruised',
	91: { team: ['injured', 'substitution'] },
	92: { team: ['injured', 'substitution'] },
	93: { team: ['injured', 'sub_out'] },
	94: 'bruised',
	95: { team: ['injured', 'substitution'] },
	96: { team: ['injured', 'sub_out'] },
	97: { team: ['injured', 'formation'] },
	100: { team: ['goal', 'whistle'] },
	101: { team: ['goal_C'] },
	102: { team: ['goal_L'] },
	103: { team: ['goal_R'] },
	104: { team: ['goal', 'penalty'] },
	105: { team: ['goal', 'se_unpredictable'] },
	106: { team: ['goal', 'se_unpredictable'] },
	107: { team: ['goal', 'longshot'] },
	108: { team: ['goal', 'se_unpredictable'] },
	109: { team: ['goal'], other: ['se_unpredictable_negative'] },
	110: { team: ['goal', 'whistle'] },
	111: { team: ['goal_C'] },
	112: { team: ['goal_L'] },
	113: { team: ['goal_R'] },
	114: { team: ['goal', 'penalty'] },
	115: { team: ['goal', 'se_quick'] },
	116: { team: ['goal', 'se_quick'] },
	117: { team: ['goal'], other: ['tired'] },
	118: { team: ['goal', 'corner'] },
	119: { team: ['goal', 'se_head_specialist'] },
	120: { team: ['goal', 'whistle'] },
	121: { team: ['goal_C'] },
	122: { team: ['goal_L'] },
	123: { team: ['goal_R'] },
	124: { team: ['goal', 'penalty'] },
	125: { team: ['goal', 'se_unpredictable'] },
	130: { team: ['goal', 'whistle'] },
	131: { team: ['goal_C'] },
	132: { team: ['goal_L'] },
	133: { team: ['goal_R'] },
	134: { team: ['goal', 'penalty'] },
	135: { team: ['goal', 'experience'] },
	136: { team: ['goal'], other: ['experience'] },
	137: { team: ['goal', 'winger', 'se_head_specialist'] },
	138: { team: ['goal', 'winger'] },
	139: { team: ['goal', 'se_technical'], other: ['se_head_specialist_negative'] },
	140: { team: ['goal', 'counter_attack', 'whistle'] },
	141: { team: ['goal_C', 'counter_attack'] },
	142: { team: ['goal_L', 'counter_attack'] },
	143: { team: ['goal_R', 'counter_attack'] },
	150: { team: ['goal', 'whistle'] },
	151: { team: ['goal_C'] },
	152: { team: ['goal_L'] },
	153: { team: ['goal_R'] },
	154: { team: ['goal', 'penalty'] },
	160: { team: ['goal', 'whistle'] },
	161: { team: ['goal_C'] },
	162: { team: ['goal_L'] },
	163: { team: ['goal_R'] },
	164: { team: ['goal', 'penalty'] },
	170: { team: ['goal', 'whistle'] },
	171: { team: ['goal_C'] },
	172: { team: ['goal_L'] },
	173: { team: ['goal_R'] },
	174: { team: ['goal', 'penalty'] },
	180: { team: ['goal', 'whistle'] },
	181: { team: ['goal_C'] },
	182: { team: ['goal_L'] },
	183: { team: ['goal_R'] },
	184: { team: ['goal', 'penalty'] },
	185: { team: ['goal', 'indirect'] },
	186: { team: ['goal', 'counter_attack', 'indirect'] },
	187: { team: ['goal', 'longshot'] },
	190: { team: ['goal', 'se_powerful'] },
	200: { team: ['miss', 'whistle'] },
	201: { team: ['miss_C'] },
	202: { team: ['miss_L'] },
	203: { team: ['miss_R'] },
	204: { team: ['miss', 'penalty'] },
	205: { team: ['miss', 'se_unpredictable'] },
	206: { team: ['miss', 'se_unpredictable'] },
	207: { team: ['miss', 'longshot'] },
	208: { team: ['miss', 'se_unpredictable'] },
	209: { team: ['miss'], other: ['se_unpredictable_negative'] },
	210: { team: ['miss', 'whistle'] },
	211: { team: ['miss_C'] },
	212: { team: ['miss_L'] },
	213: { team: ['miss_R'] },
	214: { team: ['miss', 'penalty'] },
	215: { team: ['miss', 'se_quick'] },
	216: { team: ['miss', 'se_quick'] },
	217: { team: ['miss'], other: ['tired'] },
	218: { team: ['miss', 'corner'] },
	219: { team: ['miss', 'se_head_specialist'] },
	220: { team: ['miss', 'whistle'] },
	221: { team: ['miss_C'] },
	222: { team: ['miss_L'] },
	223: { team: ['miss_R'] },
	224: { team: ['miss', 'penalty'] },
	225: { team: ['miss', 'se_unpredictable'] },
	230: { team: ['miss', 'whistle'] },
	231: { team: ['miss_C'] },
	232: { team: ['miss_L'] },
	233: { team: ['miss_R'] },
	234: { team: ['miss', 'penalty'] },
	235: { team: ['miss', 'experience'] },
	236: { team: ['miss'], other: ['experience'] },
	237: { team: ['miss', 'winger'] },
	239: { team: ['miss', 'se_technical'], other: ['se_head_specialist_negative'] },
	240: { team: ['miss', 'counter_attack', 'whistle'] },
	241: { team: ['miss_C', 'counter_attack'] },
	242: { team: ['miss_L', 'counter_attack'] },
	243: { team: ['miss_R', 'counter_attack'] },
	250: { team: ['miss', 'whistle'] },
	251: { team: ['miss_C'] },
	252: { team: ['miss_L'] },
	253: { team: ['miss_R'] },
	254: { team: ['miss', 'penalty'] },
	260: { team: ['miss', 'whistle'] },
	261: { team: ['miss_C'] },
	262: { team: ['miss_L'] },
	263: { team: ['miss_R'] },
	264: { team: ['miss', 'penalty'] },
	270: { team: ['miss', 'whistle'] },
	271: { team: ['miss_C'] },
	272: { team: ['miss_L'] },
	273: { team: ['miss_R'] },
	274: { team: ['miss', 'penalty'] },
	280: { team: ['miss', 'whistle'] },
	281: { team: ['miss_C'] },
	282: { team: ['miss_L'] },
	283: { team: ['miss_R'] },
	284: { team: ['miss', 'penalty'] },
	285: { team: ['miss', 'indirect'] },
	286: { team: ['miss', 'counter_attack', 'indirect'] },
	287: { team: ['miss', 'longshot'] },
	288: { team: ['miss', 'longshot'] },
	289: { team: ['se_quick_negative'], other: ['se_quick'] },
	290: { team: ['miss', 'se_powerful'] },
	301: { team: ['se_technical_negative', 'weather_rainy'] },
	302: { team: ['se_powerful', 'weather_rainy'] },
	303: { team: ['se_technical', 'weather_sunny'] },
	304: { team: ['se_powerful_negative', 'weather_sunny'] },
	305: { team: ['se_quick_negative', 'weather_rainy'] },
	306: { team: ['se_quick_negative', 'weather_sunny'] },

	// TODO START
	307: null,
	308: null,
	309: null,
	// TODO END

	310: { team: ['se_powerful'], other: ['pressing'] },
	331: 'pressing',
	332: 'counter_attack',
	333: 'aim',
	334: 'aow',
	335: 'creative',
	336: 'longshot',
	343: 'aim',
	344: 'aow',
	350: 'substitution',
	351: 'substitution',
	352: 'substitution',
	360: 'change_tactics',
	361: 'change_tactics',
	362: 'formation',
	370: 'swap',
	371: 'swap',
	372: 'swap',
	380: 'mm_short',
	381: 'mm_long',
	382: 'mm_long',
	383: 'mm_short',
	384: 'mm_penalty',
	385: 'mm_long',
	386: 'mm_short',
	387: 'mm_penalty',
	388: 'mm_penalty',
	389: 'mm_penalty',
	390: { home: ['weather_rainy'] },
	391: { home: ['weather_sunny'] },
	401: 'injured',
	402: 'injured',
	403: 'injured',
	404: 'injured',
	405: 'injured',
	406: 'injured',
	407: 'injured',
	408: 'injured',
	409: 'injured',
	410: 'injured',
	411: 'injured',
	412: 'injured',
	413: 'injured',
	414: 'injured',
	415: 'injured',
	416: 'injured',
	417: 'injured',
	418: 'injured',
	419: 'injured',
	420: 'injured',
	421: 'injured',
	422: 'injured',
	423: 'injured',
	424: 'substitution',
	425: 'sub_out',
	426: 'swap',
	427: 'bruised',

	// TODO START
	450: null,
	451: null,
	452: null,
	453: null,
	454: null,
	455: null,
	456: null,
	457: null,
	458: null,
	459: null,
	460: null,
	461: null,
	462: null,
	463: null,
	464: null,
	465: null,
	466: null,
	467: null,
	468: null,
	469: null,
	470: null,
	471: null,
	472: null,
	473: null,
	474: null,
	475: null,
	476: null,
	477: null,
	478: null,
	479: null,
	480: null,
	481: null,
	482: null,
	483: null,
	484: null,
	485: null,
	486: null,
	487: null,
	488: null,
	489: null,
	490: null,
	491: null,
	492: null,
	493: null,
	// TODO END

	500: { home: ['stop'], away: ['stop'] },
	501: { home: ['stop'] },
	502: { away: ['stop'] },
	503: { home: ['stop'], away: ['stop'] },
	504: { home: ['stop'] },
	505: { away: ['stop'] },
	510: 'yellow_card',
	511: 'yellow_card',
	512: { team: ['yellow_card', 'red_card'] },
	513: { team: ['yellow_card', 'red_card'] },
	514: 'red_card',
	597: null,
	598: null,
	599: 'result',

	// TODO START
	601: null,
	602: null,
	603: null,
	604: null,
	// TODO END

	605: null,
	606: null,

	// TODO START
	650: null,
	651: null,
	// TODO END

	700: 'thumb_down',
	701: 'thumb_up',
	702: 'fan',
	703: 'fire',
	704: 'trophy',
};

/* eslint-disable camelcase */
Foxtrick.util.matchEvent.eventIconDefinition = {
	aow: Foxtrick.InternalPath + 'resources/img/matches/aow.png',
	aim: Foxtrick.InternalPath + 'resources/img/matches/aim.png',
	best_player: '/Img/Matches/star_yellow.png',
	bruised: '/Img/Icons/bruised.gif',
	captain: '/Club/Matches/images/captain.png',
	change_tactics: '/Img/Matches/behaviorchange.gif',
	confusion: '/Club/Matches/images/confusion.png',
	corner: Foxtrick.InternalPath + 'resources/img/matches/corner.png',
	counter_attack: Foxtrick.InternalPath + 'resources/img/matches/ca.png',
	creative: Foxtrick.InternalPath + 'resources/img/matches/pc.png',
	derby: Foxtrick.InternalPath + 'resources/img/matches/derby.png',
	experience: Foxtrick.InternalPath + 'resources/img/matches/exp.png',
	fan: Foxtrick.InternalPath + 'resources/img/fan.png',
	fire: Foxtrick.InternalPath + 'resources/img/fire.png',
	formation: '/Img/Matches/formation.gif',
	goal: Foxtrick.InternalPath + 'resources/img/matches/ball.png',
	goal_C: Foxtrick.InternalPath + 'resources/img/matches/ball_C.png',
	goal_L: Foxtrick.InternalPath + 'resources/img/matches/ball_L.png',
	goal_R: Foxtrick.InternalPath + 'resources/img/matches/ball_R.png',
	hattrick: '/favicon.ico',
	home: Foxtrick.InternalPath + 'resources/img/matches/home.png',
	indirect: Foxtrick.InternalPath + 'resources/img/matches/indirect.png',
	injured: '/Img/Icons/injured.gif',
	injured_leaves: ['/Img/Icons/injured.gif', '/Img/Matches/substitution.gif'],
	kids: Foxtrick.InternalPath + 'resources/img/matches/kids.png',
	left_wing: '/Img/Matches/sub_in.gif',
	longshot: Foxtrick.InternalPath + 'resources/img/matches/longshot.png',
	mm_short: Foxtrick.InternalPath + 'resources/img/matches/mm_short.png',
	mm_long: Foxtrick.InternalPath + 'resources/img/matches/mm_long.png',
	mm_penalty: Foxtrick.InternalPath + 'resources/img/matches/mm_penalty.png',
	middle: Foxtrick.InternalPath + 'resources/img/matches/middle.png',
	miss: Foxtrick.InternalPath + 'resources/img/matches/redball.png',
	miss_C: Foxtrick.InternalPath + 'resources/img/matches/red_ball_C.png',
	miss_L: Foxtrick.InternalPath + 'resources/img/matches/red_ball_L.png',
	miss_R: Foxtrick.InternalPath + 'resources/img/matches/red_ball_R.png',
	nerves: '/Club/Matches/images/nerves.png',
	neutral: Foxtrick.InternalPath + 'resources/img/matches/neutral.png',
	penalty: Foxtrick.InternalPath + 'resources/img/matches/penalty.png',
	pressing: Foxtrick.InternalPath + 'resources/img/matches/press.png',
	pullback: '/Club/Matches/images/pullback.png',
	red_card: '/Img/Icons/red_card.gif',
	reorganize: Foxtrick.InternalPath + 'resources/img/matches/reorg.png',
	right_wing: '/Img/Matches/sub_out.gif',
	se_head_specialist: function() {
		return { specialty: 5 };
	},
	se_head_specialist_negative: function() {
		return { specialty: 5, failure: true };
	},
	se_powerful: function() {
		return { specialty: 3 };
	},
	se_powerful_negative: function() {
		return { specialty: 3, failure: true };
	},
	se_quick: function() {
		return { specialty: 2 };
	},
	se_quick_negative: function() {
		return { specialty: 2, failure: true };
	},
	se_technical: function() {
		return { specialty: 1 };
	},
	se_technical_negative: function() {
		return { specialty: 1, failure: true };
	},
	se_unpredictable: function() {
		return { specialty: 4 };
	},
	se_unpredictable_negative: function() {
		return { specialty: 4, failure: true };
	},
	setPieces: '/Club/Matches/images/set_Pieces.png',
	stop: Foxtrick.InternalPath + 'resources/img/stop.png',
	sub_out: '/Img/Matches/sub_out.gif',
	substitution: '/Img/Matches/substitution.gif',
	swap: '/Img/Matches/player_swap.gif',
	thumb_down: Foxtrick.InternalPath + 'resources/img/thumb_down.png',
	thumb_up: Foxtrick.InternalPath + 'resources/img/thumb_up.png',
	tired: Foxtrick.InternalPath + 'resources/img/matches/tired.png',
	tossing_coin: Foxtrick.InternalPath + 'resources/img/matches/coin.png',
	transparent: Foxtrick.InternalPath + 'resources/img/matches/trans_14x14.png',
	trophy: Foxtrick.InternalPath + 'resources/img/trophy.png',
	underestimation: Foxtrick.InternalPath + 'resources/img/matches/underest.png',
	underest_decr: Foxtrick.InternalPath + 'resources/img/matches/underest_decr.png',
	underest_gone: Foxtrick.InternalPath + 'resources/img/matches/underest_gone.png',
	weather_cloudy: '/Club/Matches/images/weather1.png',
	weather_fair: '/Club/Matches/images/weather2.png',
	weather_rainy: '/Club/Matches/images/weather0.png',
	weather_sunny: '/Club/Matches/images/weather3.png',
	whistle: Foxtrick.InternalPath + 'resources/img/matches/whistle.png',
	winger: Foxtrick.InternalPath + 'resources/img/matches/winger.png',
	worst_player: '/Img/Matches/star_brown.png',
	yellow_card: '/Img/Icons/yellow_card.gif',
};
/* eslint-enable camelcase */

Foxtrick.util.matchEvent.eventDescription = {
	19: 'Players enter the field',
	20: 'Tactical disposition',
	21: 'Player names in lineup',
	22: 'Incomplete lineup, players from neighborhood used',
	23: 'Same formation both teams',
	24: 'Team formations different',
	25: 'Regional derby',
	26: 'Neutral ground',
	27: 'Away is actually home',
	30: 'Spectators/venue - rain',
	31: 'Spectators/venue - cloudy',
	32: 'Spectators/venue - fair weather',
	33: 'Spectators/venue - sunny',
	35: 'Arena extended with temporary seats',
	36: 'Only venue - rain',
	37: 'Only venue - cloudy',
	38: 'Only venue - fair weather',
	39: 'Only venue - sunny',
	40: 'Midfield domination',
	41: 'Best player',
	42: 'Worst player',
	45: 'Half time results',
	46: 'Hat-trick',
	47: 'No team dominated midfield',
	55: 'Penalty contest: Goal by Technical (no nerves)',
	56: 'Penalty contest: Goal, no nerves',
	57: 'Penalty contest: Goal in spite of nerves',
	58: 'Penalty contest: No goal because of nerves',
	59: 'Penalty contest: No goal in spite of no nerves',
	60: 'Underestimation',
	61: 'Organization breaks',
	62: 'Withdraw',
	63: 'Remove underestimation on break',
	64: 'Reorganize',
	65: 'Nerves in important thrilling game',
	66: 'Decrease underestimation on break (equal score)',
	67: 'Decrease underestimation on break (up by 1 goal)',
	68: 'Successful pressing',
	69: 'Remove underestimation',
	70: 'Extra time',
	71: 'Penalty contest (after extra time)',
	72: 'Extra time decided',
	73: 'After 22 penalties tossing coin!',
	75: 'Added time',
	76: 'No added time',
	80: 'New captain',
	81: 'New set pieces taker',
	90: 'Injured but keeps playing',
	91: 'Moderately injured, leaves field',
	92: 'Badly injured, leaves field',
	93: 'Injured and no replacement existed',
	94: 'Injured after foul but continues',
	95: 'Injured after foul and exits',
	96: 'Injured after foul and no replacement existed',
	97: 'Keeper injured, field player has to take his place',
	100: 'Reducing goal home team free kick',
	101: 'Reducing goal home team middle',
	102: 'Reducing goal home team left wing',
	103: 'Reducing goal home team right wing',
	104: 'Reducing goal home team penalty kick normal',
	105: 'SE: Goal. Unpredictable long pass',
	106: 'SE: Goal. Unpredictable scores on his own',
	107: 'SE: Goal. Long shot',
	108: 'SE: Goal. Unpredictable special action',
	109: 'SE: Goal. Unpredictable mistake',
	110: 'Equalizer goal home team free kick',
	111: 'Equalizer goal home team middle',
	112: 'Equalizer goal home team left wing',
	113: 'Equalizer goal home team right wing',
	114: 'Equalizer goal home team penalty kick normal',
	115: 'SE: Quick scores after rush',
	116: 'SE: Quick rushes, passes and receiver scores',
	117: 'SE: Tired defender mistake, striker scores',
	118: 'SE: Goal. Corner to anyone',
	119: 'SE: Goal. Corner to Head spec.',
	120: 'Goal to take lead home team free kick',
	121: 'Goal to take lead home team middle',
	122: 'Goal to take lead home team left wing',
	123: 'Goal to take lead home team right wing',
	124: 'Goal to take lead home team penalty kick normal',
	125: 'SE: Goal. Unpredictable, own goal',
	130: 'Increase goal home team free kick',
	131: 'Increase goal home team middle',
	132: 'Increase goal home team left wing',
	133: 'Increase goal home team right wing',
	134: 'Increase goal home team penalty kick normal',
	135: 'SE: Experienced forward scores',
	136: 'SE: Inexperienced defender causes goal',
	137: 'SE: Goal. Winger to Head spec.',
	138: 'SE: Goal. Winger to anyone',
	139: 'SE: Goal. Technical vs Head spec.',
	140: 'Counter attack goal, free kick',
	141: 'Counter attack goal, middle',
	142: 'Counter attack goal, left',
	143: 'Counter attack goal, right',
	150: 'Reducing goal away team free kick',
	151: 'Reducing goal away team middle',
	152: 'Reducing goal away team left wing',
	153: 'Reducing goal away team right wing',
	154: 'Reducing goal away team penalty kick normal',
	160: 'Equalizer goal away team free kick',
	161: 'Equalizer goal away team middle',
	162: 'Equalizer goal away team left wing',
	163: 'Equalizer goal away team right wing',
	164: 'Equalizer goal away team penalty kick normal',
	170: 'Goal to take lead away team free kick',
	171: 'Goal to take lead away team middle',
	172: 'Goal to take lead away team left wing',
	173: 'Goal to take lead away team right wing',
	174: 'Goal to take lead away team penalty kick normal',
	180: 'Increase goal away team free kick',
	181: 'Increase goal away team middle',
	182: 'Increase goal away team left wing',
	183: 'Increase goal away team right wing',
	184: 'Increase goal away team penalty kick normal',
	185: 'Goal indirect free kick',
	186: 'Counter attack goal, indirect free kick',
	187: 'Goal: long shot',
	190: 'SE: Goal. Powerful normal forward generates extra chance',
	200: 'No reducing goal home team free kick',
	201: 'No reducing goal home team middle',
	202: 'No reducing goal home team left wing',
	203: 'No reducing goal home team right wing',
	204: 'No reducing goal home team penalty kick normal',
	205: 'SE: No goal. Unpredictable long pass',
	206: 'SE: No goal. Unpredictable almost scores',
	207: 'SE: No goal. Long shot',
	208: 'SE: No goal. Unpredictable special action',
	209: 'SE: No goal. Unpredictable mistake',
	210: 'No equalizer goal home team free kick',
	211: 'No equalizer goal home team middle',
	212: 'No equalizer goal home team left wing',
	213: 'No equalizer goal home team right wing',
	214: 'No equalizer goal home team penalty kick normal',
	215: 'SE: Quick misses after rush',
	216: 'SE: Quick rushes, passes but receiver fails',
	217: 'SE: Tired defender mistake but no goal',
	218: 'SE: No goal. Corner to anyone',
	219: 'SE: No goal. Corner to Head spec.',
	220: 'No goal to take lead home team free kick',
	221: 'No goal to take lead home team middle',
	222: 'No goal to take lead home team left wing',
	223: 'No goal to take lead home team right wing',
	224: 'No goal to take lead home team penalty kick normal',
	225: 'SE: No goal. Unpredictable, own goal almost',
	230: 'No increase goal home team free kick',
	231: 'No increase goal home team middle',
	232: 'No increase goal home team left wing',
	233: 'No increase goal home team right wing',
	234: 'No increase goal home team penalty kick normal',
	235: 'SE: Experienced forward fails to score',
	236: 'SE: Inexperienced defender almost causes goal',
	237: 'SE: Winger to someone: No goal',
	239: 'SE: Technical goes around head player, no goal',
	240: 'Counter attack, no goal, free kick',
	241: 'Counter attack, no goal, middle',
	242: 'Counter attack, no goal, left',
	243: 'Counter attack, no goal, right',
	250: 'No reducing goal away team free kick',
	251: 'No reducing goal away team middle',
	252: 'No reducing goal away team left wing',
	253: 'No reducing goal away team right wing',
	254: 'No reducing goal away team penalty kick normal',
	260: 'No equalizer goal away team free kick',
	261: 'No equalizer goal away team middle',
	262: 'No equalizer goal away team left wing',
	263: 'No equalizer goal away team right wing',
	264: 'No equalizer goal away team penalty kick normal',
	270: 'No goal to take lead away team free kick',
	271: 'No goal to take lead away team middle',
	272: 'No goal to take lead away team left wing',
	273: 'No goal to take lead away team right wing',
	274: 'No goal to take lead away team penalty kick normal',
	280: 'No increase goal away team free kick',
	281: 'No increase goal away team middle',
	282: 'No increase goal away team left wing',
	283: 'No increase goal away team right wing',
	284: 'No increase goal away team penalty kick normal',
	285: 'No goal indirect free kick',
	286: 'Counter attack, no goal, indirect free kick',
	287: 'No goal long shot',
	288: 'No goal long shot, defended',
	289: 'SE: Quick rushes, stopped by quick defender',
	290: 'SE: No goal. Powerful normal forward generates extra chance',
	301: 'SE: Technical suffers from rain',
	302: 'SE: Powerful thrives in rain',
	303: 'SE: Technical thrives in sun',
	304: 'SE: Powerful suffers from sun',
	305: 'SE: Quick suffers in rain',
	306: 'SE: Quick suffers in sun',
	307: 'SE: Support player boost succeeded',
	308: 'SE: Support player boost failed and organization dropped',
	309: 'SE: Support player boost failed',
	310: 'SE: Powerful defensive inner presses chance',
	331: 'Tactic Type: Pressing',
	332: 'Tactic Type: Counter-attacks',
	333: 'Tactic Type: Attack in the middle',
	334: 'Tactic Type: Attack on wings',
	335: 'Tactic Type: Play creatively',
	336: 'Tactic Type: Long shots',
	343: 'Tactic: Attack in the middle used',
	344: 'Tactic: Attack on wings used',
	350: 'Player substitution: team is behind',
	351: 'Player substitution: team is ahead',
	352: 'Player substitution: minute',
	360: 'Change of tactic: team is behind',
	361: 'Change of tactic: team is ahead',
	362: 'Change of tactic: minute',
	370: 'Player position swap: team is behind',
	371: 'Player position swap: team is ahead',
	372: 'Player position swap: minute',
	380: 'Man marking success, short distance',
	381: 'Man marking success, long distance',
	382: 'Man marked changed from short to long distance',
	383: 'Man marked changed from long to short distance',
	384: 'Man marker penalty, man marked not on the field',
	385: 'Man marker changed from short to long distance',
	386: 'Man marker changed from long to short distance',
	387: 'Man marker penalty, man marked not in marking position',
	388: 'Man marker penalty, man marker not in marking position',
	389: 'Man Marker penalty, no man marked in opponent team',
	390: 'Rainy weather - Many players affected',
	391: 'Sunny weather - Many players affected',
	401: 'Injury: Knee left',
	402: 'Injury: Knee right',
	403: 'Injury: Thigh left',
	404: 'Injury: Thigh right',
	405: 'Injury: Foot left',
	406: 'Injury: Foot right',
	407: 'Injury: Ankle left',
	408: 'Injury: Ankle right',
	409: 'Injury: Calf left',
	410: 'Injury: Calf right',
	411: 'Injury: Groin left',
	412: 'Injury: Groin right',
	413: 'Injury: Collarbone',
	414: 'Injury: Back',
	415: 'Injury: Hand left',
	416: 'Injury: Hand right',
	417: 'Injury: Arm left',
	418: 'Injury: Arm right',
	419: 'Injury: Shoulder left',
	420: 'Injury: Shoulder right',
	421: 'Injury: Rib',
	422: 'Injury: Head',
	423: 'Injured by foul',
	424: 'Injured player replaced',
	425: 'No replacement for injured player',
	426: 'Field player has to take injured keeper\'s place',
	427: 'Player injured was regainer so got bruised instead',
	450: 'Player got third yellow card: misses next match',
	451: 'With this standing team will relegate',
	452: 'Anniversary: 100s matches in the current team',
	453: 'Possibly the last game in this team',
	454: 'Doctor report of injury length',
	455: 'New star player of the team',
	456: 'Player career goals: multiple of 50',
	457: 'Player league goals this season',
	458: 'Player cup goals this season',
	459: 'Bench player warming up',
	460: 'Fans shocked by losing',
	461: 'Fans upset by losing',
	462: 'Fans surprised by winning',
	463: 'Fans excited by winning',
	464: 'Exact number of spectators',
	465: 'Team should win match to secure winning the league',
	466: 'Team should win match to have chance of winning league',
	467: 'The winner of this match may have a chance of winning the league',
	468: 'Team should win match to prevent demotion',
	469: 'Team should win match to have a chance of not demoting',
	470: 'The loser of this match will demote',
	471: 'Team has most possession in beginning of match',
	472: 'Equal possession in beginning of match',
	473: 'Career ending injury',
	474: 'Possession shifted',
	475: 'Low attendance because of fan mood',
	476: 'Extra security because of fan mood',
	477: 'Fans of both teams are angry',
	478: 'Team will achieve the best cup run if won',
	479: 'Both teams could achieve the best cup run',
	480: 'Current round is team\'s best cup run',
	481: 'New formation today',
	482: 'Teams using the same style of play',
	483: 'Teams using different styles of play',
	484: 'One team\'s style of play',
	485: 'Team of oldies',
	486: 'Team is aggressive',
	487: 'Team has only homegrown players',
	488: 'Team has all players from the same country',
	489: 'Comeback after a long injury',
	490: 'Previous match (cup) had similar outcome',
	491: 'Previous match (cup) had different outcome',
	492: 'Previous match (league) had similar outcome',
	493: 'Previous match (league) had different outcome',
	500: 'Both teams walkover',
	501: 'Home team walkover',
	502: 'Away team walkover',
	503: 'Both teams break game (2 players remaining)',
	504: 'Home team breaks game (2 players remaining)',
	505: 'Away team breaks game (2 players remaining)',
	510: 'Yellow card nasty play',
	511: 'Yellow card cheating',
	512: 'Red card (2nd warning) nasty play',
	513: 'Red card (2nd warning) cheating',
	514: 'Red card without warning',
	597: 'Second half started',
	598: 'Match started',
	599: 'Match finished',
	601: 'Congratulations to the winner',
	602: 'Winner advances to the next cup round (no relegation cup for the loser)',
	603: 'Winner advances to the next cup round and loser relegates to another cup',
	604: 'Match ended in a tie',
	605: 'End of match, congratulations to series champions',
	606: 'End of match, regrets that team will demote directly',
	650: 'Hattrick Anniversary',
	651: 'Team Anniversary',
	700: 'Event-o-Matic: Taunt Opponent',
	701: 'Event-o-Matic: Praise Opponent',
	702: 'Event-o-Matic: Plead for Fan Support',
	703: 'Event-o-Matic: Build Positive Atmosphere',
	704: 'Event-o-Matic: Honour Club Legacy',
};

Foxtrick.util.matchEvent.isLiveEvent = function(evnt) {
	return Foxtrick.hasClass(evnt, 'liveHomeEvent') ||
		Foxtrick.hasClass(evnt, 'liveAwayEvent') ||
		evnt.getElementsByClassName('liveEvent').length;
};

Foxtrick.util.matchEvent.isHomeEvent = function(evnt) {
	return Foxtrick.hasClass(evnt, 'liveHomeEvent') || Foxtrick.hasClass(evnt, 'homeevent');
};

Foxtrick.util.matchEvent.isAwayEvent = function(evnt) {
	return Foxtrick.hasClass(evnt, 'liveAwayEvent') || Foxtrick.hasClass(evnt, 'awayevent');
};

Foxtrick.util.matchEvent.isNeutralEvent = function(evnt) {
	return !Foxtrick.util.matchEvent.isHomeEvent(evnt) &&
	!Foxtrick.util.matchEvent.isAwayEvent(evnt);
};

Foxtrick.util.matchEvent.getEventMinute = function(evnt) {
	var min = 0;

	if (Foxtrick.util.matchEvent.isLiveEvent(evnt)) {
		let minute = evnt.firstChild;
		if (minute)
			min = parseInt(minute.textContent.match(/\d+/)[0], 10);
	}
	else {
		let minute = evnt.getAttribute('data-match-minute');
		if (minute)
			min = parseInt(minute.match(/\d+/)[0], 10);
	}
	return min;
};

Foxtrick.util.matchEvent.getEventTitle = function(eventId) {
	var l10nId = 'match.events.' + eventId;
	var eventText = Foxtrick.L10n.isStringAvailable(l10nId) ?
		Foxtrick.L10n.getString(l10nId) :
		Foxtrick.L10n.getString('match.events.unknown');

	return eventText + ' (' + eventId + ')';
};

Foxtrick.util.matchEvent.getEventId = function(evnt) {
	var id = 0;
	var type = evnt.getAttribute('data-eventtype');
	if (type)
		id = parseInt(type.match(/\d+/)[0], 10);

	return id;
};

Foxtrick.util.matchEvent.isFirstEvent = function(evnt) {
	var id = Foxtrick.util.matchEvent.getEventId(evnt);

	// in HTO matches there is no weather event
	// so lineup event 20 is first instead
	// in neighborhood matches (friendly WOs) 22 is the first event
	// event-o-Matic events: 700-705

	// eslint-disable-next-line no-magic-numbers
	return id >= 30 && id <= 33 || id === 20 || id === 22 || id >= 700 && id < 710;
};

Foxtrick.util.matchEvent.getEventIcons = function(evnt, type) {
	var eventId = typeof evnt == 'number' ? evnt : Foxtrick.util.matchEvent.getEventId(evnt);
	if (!Foxtrick.util.matchEvent.eventIcons[eventId])
		return null;

	var eventIcons = Foxtrick.util.matchEvent.eventIcons[eventId];
	if (typeof eventIcons === 'object')
		return eventIcons[type] || null;

	else if (type == 'team')
		return [eventIcons];


	return null;
};

Foxtrick.util.matchEvent.getEventTeamIcons = function(evnt) {
	return Foxtrick.util.matchEvent.getEventIcons(evnt, 'team');
};

Foxtrick.util.matchEvent.getOtherTeamIcons = function(evnt) {
	return Foxtrick.util.matchEvent.getEventIcons(evnt, 'other');
};

Foxtrick.util.matchEvent.getGeneralIconsHome = function(evnt) {
	return Foxtrick.util.matchEvent.getEventIcons(evnt, 'home');
};

Foxtrick.util.matchEvent.getGeneralIconsAway = function(evnt) {
	return Foxtrick.util.matchEvent.getEventIcons(evnt, 'away');
};

Foxtrick.util.matchEvent.getHomeIcons = function(evnt) {
	if (Foxtrick.util.matchEvent.isHomeEvent(evnt))
		return Foxtrick.util.matchEvent.getEventTeamIcons(evnt);
	else if (Foxtrick.util.matchEvent.isAwayEvent(evnt))
		return Foxtrick.util.matchEvent.getOtherTeamIcons(evnt);
	return Foxtrick.util.matchEvent.getGeneralIconsHome(evnt);
};

Foxtrick.util.matchEvent.getAwayIcons = function(evnt) {
	if (Foxtrick.util.matchEvent.isAwayEvent(evnt))
		return Foxtrick.util.matchEvent.getEventTeamIcons(evnt);
	else if (Foxtrick.util.matchEvent.isHomeEvent(evnt))
		return Foxtrick.util.matchEvent.getOtherTeamIcons(evnt);
	return Foxtrick.util.matchEvent.getGeneralIconsAway(evnt);
};

Foxtrick.util.matchEvent.addEventIcons = function(evnt) {
	var doc = evnt.ownerDocument;

	var eventId = Foxtrick.util.matchEvent.getEventId(evnt);
	var title = Foxtrick.util.matchEvent.getEventTitle(eventId);

	// eslint-disable-next-line consistent-this
	var module = Foxtrick.modules.MatchReportFormat;
	var insertBefore = evnt.firstChild.nextSibling;

	var homeIcons = Foxtrick.util.matchEvent.getHomeIcons(evnt);
	var awayIcons = Foxtrick.util.matchEvent.getAwayIcons(evnt);
	var hasNeither = !(homeIcons || awayIcons);
	if (hasNeither) {
		var container = Foxtrick.createFeaturedElement(doc, module, 'td');
		Foxtrick.util.matchEvent.appendIcons(doc, container, ['transparent'], title);
		container.colSpan = 2;
		evnt.insertBefore(container, insertBefore);
		return;
	}

	var homeContainer = Foxtrick.createFeaturedElement(doc, module, 'td');
	evnt.insertBefore(homeContainer, insertBefore);
	var awayContainer = Foxtrick.createFeaturedElement(doc, module, 'td');
	evnt.insertBefore(awayContainer, insertBefore);

	if (homeIcons)
		Foxtrick.util.matchEvent.appendIcons(doc, homeContainer, homeIcons, title);

	if (awayIcons)
		Foxtrick.util.matchEvent.appendIcons(doc, awayContainer, awayIcons, homeIcons ? '' : title);

};

Foxtrick.util.matchEvent.appendIcons = function(doc, container, icons, title) {
	var addSpaceBeforeImg = function(img) {
		img.parentNode.insertBefore(doc.createTextNode(' '), img);
	};

	for (var idx = 0; idx < icons.length; idx++) {
		var alt = idx ? '' : title;
		var features = { alt: alt, title: title, 'aria-label': alt };

		var src = Foxtrick.util.matchEvent.eventIconDefinition[icons[idx]];
		if (typeof src === 'function') {
			var ret = src();
			if (ret.specialty) {
				container.dataset.specialty = ret.specialty;
				Foxtrick.addClass(container, 'ft-specInfo-parent');

				src = Foxtrick.getSpecialtyImagePathFromNumber(ret.specialty, ret.failure);
			}
			else {
				src = ret;
			}
		}

		if (src == null)
			src = Foxtrick.util.matchEvent.eventIconDefinition.transparent;

		features.src = src;

		Foxtrick.addImage(doc, container, features, null, addSpaceBeforeImg);
	}
};

Foxtrick.util.matchEvent.addEventIndicators = function(container) {
	var eventRows = container.querySelectorAll('tr[data-eventtype]');
	if (!eventRows.length)
		return;

	// figure out if the reading direction is inverted (last event first)
	var inverted = !Foxtrick.util.matchEvent.isFirstEvent(eventRows[0]);
	for (var e = 0; e < eventRows.length; e++)
		Foxtrick.util.matchEvent.addEventIndicator(eventRows[e], inverted);
};

Foxtrick.util.matchEvent.addEventIndicator = function(evnt, invert) {
	var doc = evnt.ownerDocument;
	var eventId = Foxtrick.util.matchEvent.getEventId(evnt);
	var eventMinute = Foxtrick.util.matchEvent.getEventMinute(evnt);
	var eventType = Foxtrick.util.matchEvent.eventIcons[eventId];
	var table = evnt.parentNode;

	// indicators to be added
	var indicatorList = [
		{
			class: 'kick-off',
			text: 'kickOff',
			before: true,
			func: function() {
				var koPending = !table.getElementsByClassName('ft-match-report-kick-off').length;

				if (koPending && !invert && eventMinute !== 0) {
					return true;
				}
				else if (koPending && invert && eventMinute !== 0 && evnt.nextSibling) {
					var node = evnt.nextElementSibling;
					if (node) {
						var nextEventMinute = Foxtrick.util.matchEvent.getEventMinute(node);
						return nextEventMinute === 0;
					}

					return false;
				}
				return false;
			},
		},
		{
			class: 'half-time',
			text: 'halfTime',
			// eslint-disable-next-line no-magic-numbers
			func: () => eventType == 'possession' && eventMinute == 45,
		},
		{
			class: 'full-time',
			text: 'fullTime',
			// eslint-disable-next-line no-magic-numbers
			func: () => eventType == 'possession' && eventMinute == 90,
		},
		{
			class: 'extra-time',
			text: 'extraTime',
			func: function() {
				return eventType == 'extraTime';
			},
		},
		{
			class: 'penalty-shoot-out',
			text: 'penaltyShootOut',
			func: function() {
				return eventType == 'penaltyShootOut';
			},
		},
		{
			class: 'result',
			text: 'result',
			before: true,
			func: function() {
				return eventType == 'result';
			},
		},
	];

	var indType = Foxtrick.nth(function(n) {
		return n.func();
	}, indicatorList);

	if (indType) {
		// found a matching indicator
		var indicator = doc.createElement('tr');
		var indicatorCell = doc.createElement('td');
		indicator.appendChild(indicatorCell);

		var cells = Foxtrick.toArray(evnt.cells);
		var colSpan = cells.reduce(function(sum, cell) {
			return sum + cell.colSpan;
		}, 0);
		indicatorCell.colSpan = colSpan;
		indicatorCell.textContent = Foxtrick.L10n.getString('MatchReportFormat.' + indType.text);
		Foxtrick.addClass(indicator, 'ft-match-report-' + indType.class);

		// invert before when reading direction is flipped
		var before = indType.before;
		if (invert)
			before = !before;

		if (before)
			table.insertBefore(indicator, evnt);
		else if (evnt.nextSibling)
			table.insertBefore(indicator, evnt.nextSibling);
		else
			table.appendChild(indicator);
	}
};
