/**
 * l10n.js
 * Localization tools.
 *
 * @author ryan, convincedd, CatzHoek, LA-MJ
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	var Foxtrick = {};
/* eslint-enable */

/* global PluralForm */

Foxtrick.L10n = {};

// jscs:disable disallowMultipleSpaces

/**
 * List of FT locale IDs/folders.
 *
 * Names and ids are also used in:
 * a) maintainer/locale/Hattrick/Language.py
 * b) content/locale/ * /htlang.json
 *
 * {Array.<string>}
 * @type {Array} {Array.<string>}
 */
Foxtrick.L10n.locales = [
	'ar',     // 22  العربية, arabic
	'az',     // 100 Azərbaycanca, Azerbaijani
	'be',     // 84  Беларуская, Belorussian
	'bg',     // 43  Български, Bulgarian
	'bs',     // 58  Bosanski, Bosnian
	'ca',     // 66  Català, Catalan
	'cs',     // 35  Čeština, Czech
	'da',     // 8   Dansk, Danish
	'de',     // 3   Deutsch, German
	'el',     // 34  Ελληνικά, Greek
	'en-GB',  // 2   English (UK)
	'en-US',  // 151 English (US)
	'es-ES',  // 103 Español España, Spanish
	'es-CR',  // 51  Español Latinoamericano, Spanish Costa Rica/Mexico
	'es-AR',  // 6   Español Rioplatense, Spanish Argentina
	'et',     // 36  Eesti, Estonian
	'eu',     // 110 Euskara, Basque
	'fa',     // 75  فارسی, Farsi/Persian/Iranian
	'fi',     // 9   Suomi, Finnish
	'fr',     // 5   Français, French
	'fur-IT', // 113 Furlan, Friulian (Northern Italy)
	'fy-NL',  // 109 Frysk, West Frisian (Eastern Netherlands/Northern Germany)
	'gl',     // 74  Galego, Galician (Northwestern Spain)
	'he',     // 40  עברית, Hebrew
	'hr',     // 39  Hrvatski, Croatian
	'hu',     // 33  Magyar, Hungarian
	'id',     // 38  Bahasa Indonesia, Indonesian
	'is',     // 25  Íslenska, Icelandic
	'it',     // 4   Italiano, Italian
	'ja',     // 12  日本語, Japanese
	'ka',     // 90  ქართული ენა, Kartvelian/Georgian
	'ko',     // 17  한국어, Korean
	'lb',     // 111 Lëtzebuergesch, Luxembourgian
	'lt',     // 56  Lietuvių, Lithuanian
	'lv',     // 37  Latviešu, Latvian
	'mk',     // 83  Македонски, Macedonian
	'mt',     // 87  Malti
	'nl',     // 10  Nederlands, Dutch
	'nn-NO',  // 136 Norsk nynorsk, Norwegian Nynorsk
	'no',     // 7   Norsk bokmål, Norwegian (Bokmål)
	'pl',     // 13  Polski, Polish
	'pt-PT',  // 11  Português, Portuguese
	'pt-BR',  // 50  Português Brasil, Portuguese Brazilian
	'ro',     // 23  Română, Romanian
	'ru',     // 14  Русский, Russian
	'sk',     // 53  Slovenčina, Slovakian
	'sl',     // 45  Slovenščina, Slovenian
	'sq',     // 85  Albanian
	'sr',     // 32  Српски, Serbian
	'sv-SE',  // 1   Svenska, Swedish
	'tr',     // 19  Türkçe, Turkish
	'uk',     // 57  Українська, Ukrainian
	'vi',     // 55  Tiếng Việt, Vietnamese
	'vls-BE', // 65  Vlaams, Flemish (Belgian Dutch)
	'zh-CN',  // 15  中文（简体）, Chinese (Simplified)
],
// jscs:disable disallowSpaceAfterObjectKeys, disallowQuotedKeysInObjects

/**
 * Map HT Content-Language to FT locale ID/folder.
 *
 * Data comes from language selector and meta tag.
 * Names and numeric IDs are also available in worldlanguages.xml
 *
 * {string: string}
 * @type {Object} {string: string}
 */
Foxtrick.L10n.htMapping = {
	'ar':    'ar',     // 22  العربية, arabic
	'az':    'az',     // 100 Azərbaycanca, Azerbaijani
	'be':    'be',     // 84  Беларуская, Belorussian
	'bg':    'bg',     // 43  Български, Bulgarian
	'bs':    'bs',     // 58  Bosanski, Bosnian
	'ca':    'ca',     // 66  Català, Catalan
	'cs':    'cs',     // 35  Čeština, Czech
	'da':    'da',     // 8   Dansk, Danish
	'de':    'de',     // 3   Deutsch, German
	'el':    'el',     // 34  Ελληνικά, Greek
	'en':    'en-GB',  // 2   English (UK)
	'en-us': 'en-US',  // 151 English (US)
	'es':    'es-ES',  // 103 Español España, Spanish
	'es-mx': 'es-CR',  // 51  Español Latinoamericano, Spanish Costa Rica/Mexico
	'es-ar': 'es-AR',  // 6   Español Rioplatense, Spanish Argentina
	'et':    'et',     // 36  Eesti, Estonian
	'eu':    'eu',     // 110 Euskara, Basque
	'fa':    'fa',     // 75  فارسی, Farsi/Persian/Iranian
	'fi':    'fi',     // 9   Suomi, Finnish
	'fr':    'fr',     // 5   Français, French
	'fu':    'fur-IT', // 113 Furlan, Friulian (Northern Italy)
	'fy':    'fy-NL',  // 109 Frysk, West Frisian (Eastern Netherlands/Northern Germany)
	'gl':    'gl',     // 74  Galego, Galician (Northwestern Spain)
	'he':    'he',     // 40  עברית, Hebrew
	'hr':    'hr',     // 39  Hrvatski, Croatian
	'hu':    'hu',     // 33  Magyar, Hungarian
	'id':    'id',     // 38  Bahasa Indonesia, Indonesian
	'is':    'is',     // 25  Íslenska, Icelandic
	'it':    'it',     // 4   Italiano, Italian
	'ja':    'ja',     // 12  日本語, Japanese
	'ka':    'ka',     // 90  ქართული ენა, Kartvelian/Georgian
	'ko':    'ko',     // 17  한국어, Korean
	'lb':    'lb',     // 111 Lëtzebuergesch, Luxembourgian
	'lt':    'lt',     // 56  Lietuvių, Lithuanian
	'lv':    'lv',     // 37  Latviešu, Latvian
	'mk':    'mk',     // 83  Македонски, Macedonian
	'mt':    'mt',     // 87  Malti
	'nl':    'nl',     // 10  Nederlands, Dutch
	'nn-no': 'nn-NO',  // 136 Norsk nynorsk, Norwegian Nynorsk
	'nn':    'no',     // 7   Norsk bokmål, Norwegian (Bokmål)
	'pl':    'pl',     // 13  Polski, Polish
	'pt':    'pt-PT',  // 11  Português, Portuguese
	'pt-br': 'pt-BR',  // 50  Português Brasil, Portuguese Brazilian
	'ro':    'ro',     // 23  Română, Romanian
	'ru':    'ru',     // 14  Русский, Russian
	'sk':    'sk',     // 53  Slovenčina, Slovakian
	'sl':    'sl',     // 45  Slovenščina, Slovenian
	'sq':    'sq',     // 85  Albanian
	'sr':    'sr',     // 32  Српски, Serbian
	'sv':    'sv-SE',  // 1   Svenska, Swedish
	'tr':    'tr',     // 19  Türkçe, Turkish
	'uk':    'uk',     // 57  Українська, Ukrainian
	'vi':    'vi',     // 55  Tiếng Việt, Vietnamese
	'vl':    'vls-BE', // 65  Vlaams, Flemish (Belgian Dutch)
	'zh':    'zh-CN',  // 15  中文（简体）, Chinese (Simplified)
}; // jshint ignore:line
// jscs:enable disallowSpaceAfterObjectKeys, disallowQuotedKeysInObjects
// jscs:enable disallowMultipleSpaces

/**
 * Language definitions from htlang.json files
 *
 * langCode->object map
 * @type {Object} {string: object}
 */
Foxtrick.L10n.htLanguagesJSON = {};

/**
 * Plural form of the selected language
 *
 * @see https://developer.mozilla.org/en/Localization_and_Plurals
 * @type {Number} {Integer}
 */
Foxtrick.L10n.plForm = 0;

/**
 * Plural form of the default language
 *
 * @type {Number} {Integer}
 */
Foxtrick.L10n.plForm_default = 0;

// ------------------------- function stubs ---------------------------
// jshint ignore:start

/**
 * Test if a string is localized
 *
 * @param  {string}  str locale key
 * @return {Boolean}
 */
Foxtrick.L10n.isStringAvailableLocal = function(str) {};

/**
 * Test if a string exists
 *
 * @param  {string}  str locale key
 * @return {Boolean}
 */
Foxtrick.L10n.isStringAvailable = function(str) {};

/**
 * Get string localization.
 *
 * Optionally returns the correct plural form (or last if matching fails).
 * @throws if string is n/a
 *
 * @param  {string} str locale key
 * @param  {number} [num] number to substitute in plural (optional integer)
 * @return {string}
 */
Foxtrick.L10n.getString = function(str, num) {};
// jshint ignore:end

/**
 * Generate a link from a l10n key with a link tag,
 * append it to parent and return it
 *
 * @param  {string}            str    locale key
 * @param  {Element}           parent
 * @param  {string}            url
 * @return {HTMLAnchorElement}
 */
Foxtrick.L10n.appendLink = function(str, parent, url) {
	var doc = parent.ownerDocument;
	var text = this.getString(str);
	var parts = text.split(/<\/?a>/ig);

	parent.appendChild(doc.createTextNode(parts[0]));

	var link;

	if (parts.length > 1) {
		link = doc.createElement('a');
		link.href = url;
		link.target = '_blank';
		link.textContent = parts[1];
		parent.appendChild(link);
	}

	if (parts.length > 2)
		parent.appendChild(doc.createTextNode(parts[2]));

	return link;
};

/**
 * @typedef HTLangPropQuery
 * @prop {string} category
 * @prop {string} filter
 * @prop {string} value
 * @prop {string} property
 */

/**
 * Get the value of a certain property from htlang.json.
 *
 * The query object {category, filter, value, property: string}
 * specifies search parameters:
 * string category to look in (e. g. 'levels');
 * property to look for (e. g. 'text');
 * reference (filter) property and it's value (e. g. 'value' = '6').
 *
 * Optionally lang overrides language code to look in (defaults to user).
 *
 * @param  {HTLangPropQuery} query  {category, filter, value, property: string}
 * @param  {string}          [lang] language code
 * @return {string}                 property value
 */
Foxtrick.L10n.getHTLangProperty = function(query, lang) {
	var prop = null;

	let l = lang || Foxtrick.Prefs.getString('htLanguage');
	let json = Foxtrick.L10n.htLanguagesJSON[l].language;
	let array = json[query.category];

	if (Array.isArray(array)) {
		let value = query.value.toString().trim();
		let el = Foxtrick.nth(function(e) {
			return e[query.filter] === value;

			// return new RegExp('^' + e[query.filter], 'i').test(value);
		}, array);

		if (el && typeof el === 'object' && query.property in el)
			prop = el[query.property];
	}

	return prop;
};

/**
 * Get the value of a certain property from htlang.json.
 *
 * The query object {category, filter, value, property: string}
 * specifies search parameters:
 * string category to look in (e. g. 'levels');
 * property to look for (e. g. 'text');
 * reference (filter) property and it's value (e. g. 'value' = '6').
 *
 * Optionally lang specifies language code to look in (defaults to user lang).
 *
 * If property is not found English is looked up instead.
 * If that also fails, raw value is returned.
 *
 * @param  {HTLangPropQuery} query  {category, filter, value, property: string}
 * @param  {string}          [lang] language code
 * @return {string}                 property value
 */
Foxtrick.L10n.getLocalOrEnglish = function(query, lang) {
	let l = lang || Foxtrick.Prefs.getString('htLanguage');

	var text = this.getHTLangProperty(query, l);
	if (text === null) {
		let header = 'Requested ' + query.category + ':' + query.property +
			' with ' + query.filter + '=' + query.value;
		Foxtrick.error(header + ' does not exist in locale ' + l + ', trying en instead.');

		text = this.getHTLangProperty(query, 'en');
		if (text === null) {
			Foxtrick.error(header + ' does not exist, returning raw value.');
			text = query.value;
		}
	}
	return text;
};

/**
 * Get a numeric (1-based) representation of a skill level.
 *
 * Skill level may also include sub-skill.
 *
 * @param  {string} text
 * @return {number}
 */
Foxtrick.L10n.getLevelFromText = function(text) {
	var txt = text.trim();
	var lang = Foxtrick.Prefs.getString('htLanguage');
	var json = Foxtrick.L10n.htLanguagesJSON[lang].language;

	var levelObj = Foxtrick.nth(function(jsonLevel) {
		var levelText = Foxtrick.strToRe(jsonLevel.text);
		return new RegExp('^' + levelText, 'i').test(txt);
	}, json.levels);

	if (levelObj === null)
		return null;

	var level = parseInt(levelObj.value, 10);
	var sublevel = 0;

	var subObj = Foxtrick.nth(function(jsonSubLevel) {
		var sublevelText = Foxtrick.strToRe(jsonSubLevel.text);

		// using \)? in case LAs remove ) from sublevelText
		return new RegExp(sublevelText + '\\)?$', 'i').test(txt);
	}, json.ratingSubLevels);

	if (subObj)
		sublevel = parseFloat(subObj.value);

	return level + sublevel;
};

/**
 * Get a (trimmed) string representation of a 1-based level.
 *
 * Takes an integer, e.g. 7->solid.
 *
 * @param  {number} value {Integer}
 * @return {string}
 */
Foxtrick.L10n.getTextByLevel = function(value) {
	var query = {
		category: 'levels',
		property: 'text',
		filter: 'value',
		value: value,
	};
	return this.getLocalOrEnglish(query);
};

/**
 * Get a (trimmed) string representation of a specific 1-based level.
 *
 * type could be levels, for normal skills,
 * or agreeability, honesty, and aggressiveness.
 *
 * Takes an integer, e.g. 1->controversial (agreeability).
 *
 * @param  {string} type {levels|agreeability|honesty|aggressiveness}
 * @param  {number} val  {Integer}
 * @return {string}
 */
Foxtrick.L10n.getLevelByTypeAndValue = function(type, val) {
	var numVal = parseInt(val, 10) || 0;
	var cappedVal = Math.min(numVal, 20); // cap divine
	var query = {
		category: type,
		property: 'text',
		filter: 'value',
		value: cappedVal,
	};
	var l10n = this.getLocalOrEnglish(query);

	if (l10n && numVal > cappedVal)
		l10n += Foxtrick.format(' (+{})', [numVal - cappedVal]);

	return l10n;
};

/**
 * Get a string representation of a sublevel.
 *
 * Takes a string, e.g. 0->(very low); 0.75->(very high).
 *
 * NOTE: returned string is trimmed and parenthesized
 *
 * @param  {string} val
 * @return {string}
 */
Foxtrick.L10n.getSublevelByValue = function(val) {
	var query = {
		category: 'ratingSubLevels',
		property: 'text',
		filter: 'value',
		value: val,
	};
	var text = this.getLocalOrEnglish(query);

	if (!text.match(/\(/)) {
		// some LAs (wrongfully) add parenthesis here. For others we need our own
		text = '(' + text + ')';
	}

	return text;
};

/**
 * Get a (trimmed) string representation of a numeric (1-based) skill level.
 *
 * Skill level may also include sub-skill.
 *
 * @param  {number} val
 * @return {string}
 */
Foxtrick.L10n.getFullLevelByValue = function(val) {
	var main = Math.floor(val);
	var sub = val - main;

	// subStr is just a representation
	// actually sublevels are rounded up
	// hence these calculations do not reflect reality
	// subStr should be 0.25 higher in all cases
	var subStr = '';

	if (sub >= 0 && sub < 0.25) {
		subStr = '0';
	}
	else if (sub >= 0.25 && sub < 0.5) {
		subStr = '0.25';
	}
	else if (sub >= 0.5 && sub < 0.75) {
		subStr = '0.5';
	}
	else if (sub >= 0.75 && sub < 1) {
		subStr = '0.75';
	}

	var mainL10n = this.getLevelByTypeAndValue('levels', main);
	var subL10n = this.getSublevelByValue(subStr);
	return mainL10n + ' ' + subL10n;
};

/**
 * Get a (trimmed) string representation of a tactic
 *
 * @param  {number} id {Integer}
 * @return {string}
 */
Foxtrick.L10n.getTacticById = function(id) {
	var tactics = [
		// jscs:disable disallowMultipleSpaces
		'normal',     // 0
		'pressing',   // 1
		'ca',         // 2
		'aim',        // 3
		'aow',        // 4
		'',           // 5 (N/A)
		'',           // 6 (N/A)
		'creatively', // 7
		'longshots',  // 8
		// jscs:enable disallowMultipleSpaces
	];

	var query = {
		category: 'tactics',
		property: 'value',
		filter: 'type',
		value: tactics[id],
	};
	return this.getLocalOrEnglish(query);
};

/**
 * Get position abbreviation from position.
 *
 * Both strings localized.
 *
 * @param  {string} pos
 * @return {string}
 */
Foxtrick.L10n.getShortPosition = function(pos) {
	var defaultAbbr = function(pos) {
		var space = pos.search(/ /);
		if (space == -1)
			return pos.slice(0, 2);

		return pos.slice(0, 1) + pos.slice(space + 1, space + 2);
	};

	var shortPos = '';
	try {
		var query = {
			category: 'positions',
			property: 'type',
			filter: 'value',
			value: pos,
		};
		var type = this.getHTLangProperty(query);

		shortPos = Foxtrick.L10n.getString('match.pos.' + type + '.abbr');
	}
	catch (e) {
		Foxtrick.log(e);
	}

	return shortPos || defaultAbbr(pos);
};

/**
 * Get l10n spec abbreviation from English spec
 *
 * @param  {string} spec
 * @return {string}
 */
Foxtrick.L10n.getShortSpecialtyFromEnglish = function(spec) {
	Foxtrick.L10n.getString('specialty.' + spec + '.abbr');
};

/**
 * Translate spec
 *
 * @param  {string} spec
 * @return {string}
 */
Foxtrick.L10n.getEnglishSpecialty = function(spec) {
	if (!spec)
		return '';

	try {
		var query = {
			category: 'specialties',
			property: 'type',
			filter: 'value',
			value: spec,
		};
		return this.getHTLangProperty(query);
	}
	catch (e) {
		Foxtrick.log(e);
		return null;
	}
};

/**
 * Map spec code to English spec
 *
 * @param  {number} number {Integer}
 * @return {string}
 */
Foxtrick.L10n.getEnglishSpecialtyFromNumber = function(number) {
	var specs = [
		'',
		'Technical',
		'Quick',
		'Powerful',
		'Unpredictable',
		'Head',
		'Regainer',
	];
	var spec = specs[number];

	return spec || '';
};

/**
 * Map spec code to l10n spec (trimmed)
 *
 * @param  {number} number {Integer}
 * @return {string}
 */
Foxtrick.L10n.getSpecialtyFromNumber = function(number) {
	var spec = this.getEnglishSpecialtyFromNumber(number);
	var query = {
		category: 'specialties',
		property: 'value',
		filter: 'type',
		value: spec,
	};

	return this.getHTLangProperty(query) || spec;
};

/**
 * Map l10n spec to spec code
 *
 * @param  {string} specialty
 * @return {number}            {Integer}
 */
Foxtrick.L10n.getNumberFromSpecialty = function(specialty) {
	var engSpec = this.getEnglishSpecialty(specialty);

	var specs = [
		'',
		'Technical',
		'Quick',
		'Powerful',
		'Unpredictable',
		'Head',
		'Regainer',
	];
	var idx = Foxtrick.indexOf(specs, engSpec);
	if (idx === -1)
		return 0;

	return idx;
};

/**
 * Map English category abbr to category id
 *
 * @param  {string} cat
 * @return {number}     {Integer}
 */
Foxtrick.L10n.getCategoryId = function(cat) {
	var categories = [null, 'GK', 'WB', 'CD', 'W', 'IM', 'FW', 'S', 'R', 'E1', 'E2'];

	var idx = Foxtrick.indexOf(categories, cat);
	if (idx < 1)
		return 0;

	return idx;
};

/**
 * Map category id to English category abbr
 *
 * @param  {number} id {Integer}
 * @return {string}
 */
Foxtrick.L10n.getCategoryById = function(id) {
	var categories = [null, 'GK', 'WB', 'CD', 'W', 'IM', 'FW', 'S', 'R', 'E1', 'E2'];
	return categories[id] || null;
};

/**
 * Map position id to position type
 *
 * @param  {number} id {Integer}
 * @return {PositionType}
 */
Foxtrick.L10n.getPositionTypeById = function(id) {
	var type = null;

	var idToPosition = {
		100: 'Keeper',
		101: 'WingBack',
		102: 'CentralDefender',
		103: 'CentralDefender',
		104: 'CentralDefender',
		105: 'WingBack',
		106: 'Winger',
		107: 'InnerMidfield',
		108: 'InnerMidfield',
		109: 'InnerMidfield',
		110: 'Winger',
		111: 'Forward',
		112: 'Forward',
		113: 'Forward',
		114: 'Substitution (Keeper)',
		115: 'Substitution (Defender)',
		116: 'InnerMidfield',
		117: 'Substitution (Winger)',
		118: 'Substitution (Forward)',
		17: 'Set pieces',
		18: 'Captain',
		19: 'Replaced Player #1',
		20: 'Replaced Player #2',
		21: 'Replaced Player #3',
	};
	if (id in idToPosition)
		type = idToPosition[id];

	return type;
};

/**
 * Map position type to l10n position
 *
 * @param  {string} val
 * @return {string}
 */
Foxtrick.L10n.getPositionByType = function(val) {
	var query = {
		category: 'positions',
		property: 'value',
		filter: 'type',
		value: val,
	};
	return this.getLocalOrEnglish(query);
};

/**
 * @typedef {'Keeper'|'WingBack'|'CentralDefender'|'InnerMidfield'|'Winger'|'Forward'} PositionType
 */

/**
 * Map l10n position to position type
 *
 * @param  {string} pos
 * @return {PositionType}
 */
Foxtrick.L10n.getPositionType = function(pos) {
	var query = {
		category: 'positions',
		property: 'type',
		filter: 'value',
		value: pos,
	};

	// eslint-disable-next-line no-extra-parens
	return /** @type {PositionType} */ (this.getHTLangProperty(query));
};

/**
 * Get country name (trimmed) for display purposes.
 *
 * Honors language settings in CountryList.
 * Returns 'New Moon' if the method fails.
 *
 * @param  {number} leagueId
 * @return {string}
 */
Foxtrick.L10n.getCountryName = function(leagueId) {
	var method = this.getCountryNameLocal;

	if (Foxtrick.Prefs.isModuleEnabled('CountryList')) {
		if (Foxtrick.Prefs.isModuleOptionEnabled('CountryList', 'UseEnglish'))
			method = this.getCountryNameEnglish;
		else
			method = this.getCountryNameNative;
	}

	method = method.bind(this);

	return method(leagueId);
};

/**
 * Get English country name (trimmed).
 *
 * Returns 'New Moon' if the method fails.
 *
 * @param  {number} leagueId
 * @return {string}
 */
Foxtrick.L10n.getCountryNameEnglish = function(leagueId) {
	var ret = 'New Moon';
	try {
		ret = Foxtrick.XMLData.League[leagueId].EnglishName;
	}
	catch (e) {
		Foxtrick.log('getCountryNameEnglish:', leagueId, e);
	}
	return ret;
};

/**
 * Get native country name (trimmed).
 *
 * Returns 'New Moon' if the method fails.
 *
 * @param  {number} leagueId
 * @return {string}
 */
Foxtrick.L10n.getCountryNameNative = function(leagueId) {
	var ret = 'New Moon';
	try {
		var league = Foxtrick.XMLData.League[leagueId];
		ret = league.Country.CountryName || league.EnglishName; // HTI
	}
	catch (e) {
		Foxtrick.log('getCountryNameNative:', leagueId, e);
	}
	return ret;
};

/**
 * Get localized country name (trimmed).
 * Returns 'New Moon' if the method fails.
 *
 * @param  {number} leagueId
 * @param  {string} lang     language (optional)
 * @return {string}
 */
Foxtrick.L10n.getCountryNameLocal = function(leagueId, lang) {
	var ret = 'New Moon';
	try {
		if (!lang)
			lang = Foxtrick.Prefs.getString('htLanguage');

		var json = Foxtrick.L10n.htLanguagesJSON[lang].language;
		if (leagueId in json.leagueNames)
			ret = json.leagueNames[leagueId];
		else
			throw new Error('no leagueId in json.leagueNames');
	}
	catch (e) {
		Foxtrick.log('getCountryNameLocal:', lang, leagueId, e);
	}

	return ret;
};

(function() {

	// -------------------- Gecko-specific getters/setters ----------------------
	if (Foxtrick.arch === 'Gecko') {

		// import PluralForm into it's own scope
		// otherwise Fennec fails during first install/update:
		// Could not set symbol 'PluralForm' on target object
		// probably because 'this' is undefined

		var plScope = {};
		Cu.import('resource://gre/modules/PluralForm.jsm', plScope);

		var FoxtrickL10nGecko = {

			// Mozilla string bundles of localizations and screen-shot links
			_strings_bundle: null,
			_strings_bundle_default: null,
			_strings_bundle_screenshots: null,
			_strings_bundle_screenshots_default: null,

			init: function() {
				var L10N_BUNDLE_PATH = Foxtrick.InternalPath + 'foxtrick.properties';
				// var SS_BUNDLE_PATH = Foxtrick.InternalPath + 'foxtrick.screenshots';

				var L10N_PATH = Foxtrick.InternalPath + 'locale/';

				if (Foxtrick.context === 'background') {
					if (!/\/preferences\.html$/.test(window.location.pathname)) {
						// don't run in prefs
						// unnecessary and hurts performance
						for (var locale of Foxtrick.L10n.locales) {
							var url = L10N_PATH + locale + '/htlang.json';
							var text = Foxtrick.util.load.sync(url);
							this.htLanguagesJSON[locale] = JSON.parse(text);
						}
					}
				}

				this._strings_bundle_default = Services.strings.createBundle(L10N_BUNDLE_PATH);

				try {
					var rule = this._strings_bundle_default.GetStringFromName('pluralFormRuleID');
					this.plForm_default = parseInt(rule.match(/\d+/), 10);
				}
				catch (e) {}

				this.setUserLocaleGecko(Foxtrick.Prefs.getString('htLanguage'));

				// this._strings_bundle_screenshots_default =
				// 	Services.strings.createBundle(SS_BUNDLE_PATH);
			},

			setUserLocaleGecko: function(localeCode) {
				var L10N_PATH = Foxtrick.InternalPath + 'locale/';

				var l10nBundlePath = L10N_PATH + localeCode + '/foxtrick.properties';
				try {
					this._strings_bundle = Services.strings.createBundle(l10nBundlePath);
				}
				catch (e) {
					this._strings_bundle = this._strings_bundle_default;
					Foxtrick.log('Use default properties for locale', localeCode);
				}

				try {
					var rule = this._strings_bundle.GetStringFromName('pluralFormRuleID');
					this.plForm = parseInt(rule.match(/\d+/), 10);
				}
				catch (e) {}

				// var ssBundlePath = L10N_PATH + localeCode + '/foxtrick.screenshots';
				// try {
				// 	this._strings_bundle_screenshots = Services.strings.createBundle(ssBundlePath);
				// }
				// catch (e) {
				// 	this._strings_bundle_screenshots = this._strings_bundle_screenshots_default;
				// 	Foxtrick.log('Use default screenshots for locale', localeCode);
				// }
			},

			getString: function(str, num) {
				var get, l10n;

				try {
					if (Foxtrick.Prefs.getBool('translationKeys'))
						return str;

					l10n = this._strings_bundle.GetStringFromName(str);
					if (typeof num === 'undefined')
						return l10n;

					get = plScope.PluralForm.makeGetter(this.plForm)[0];
					try {
						return get(num, l10n);
					}
					catch (e) {
						return l10n.replace(/.+;/g, '');
					}
				}
				catch (e) {
					try {
						if (!this._strings_bundle_default)
							return null;

						l10n = this._strings_bundle_default.GetStringFromName(str);
						if (typeof num === 'undefined')
							return l10n;

						get = plScope.PluralForm.makeGetter(this.plForm_default)[0];
						try {
							return get(num, l10n);
						}
						catch (e) {
							return l10n.replace(/.+;/g, '');
						}
					}
					catch (ee) {
						Foxtrick.error('Error getString(\'' + str + '\')');
						return str.slice(str.lastIndexOf('.') + 1);
					}
				}
			},

			isStringAvailable: function(str) {
				if (!this._strings_bundle)
					return false;

				try {
					return this._strings_bundle.GetStringFromName(str) !== null;
				}
				catch (e) {
					try {
						return this._strings_bundle_default.GetStringFromName(str) !== null;
					}
					catch (ee) {
						return false;
					}
				}
			},

			isStringAvailableLocal: function(str) {
				if (!this._strings_bundle)
					return false;

				try {
					return this._strings_bundle.GetStringFromName(str) != null;
				}
				catch (e) {
					return false;
				}
			},

			getScreenshot: function(str) {
				var link = '';

				if (this._strings_bundle_screenshots) {
					try {
						link = this._strings_bundle_screenshots.GetStringFromName(str);
					}
					catch (e) {}
				}

				if (link === '') {
					try {
						if (this._strings_bundle_screenshots_default)
							link = this._strings_bundle_screenshots_default.GetStringFromName(str);
					}
					catch (ee) {}
				}

				return link;
			},
		};

		for (var flg in FoxtrickL10nGecko)
			Foxtrick.L10n[flg] = FoxtrickL10nGecko[flg];

	}


	// -------------------- Chrome-specific getters/setters ----------------------
	if (Foxtrick.arch === 'Sandboxed') {

		var FoxtrickL10nChrome = {
			// string collection of localizations and screen-shot links
			properties_default: null,
			properties: null,
			screenshots_default: null,
			screenshots: null,

			init: function() {
				var L10N_BUNDLE_PATH = Foxtrick.InternalPath + 'foxtrick.properties';
				// var SS_BUNDLE_PATH = Foxtrick.InternalPath + 'foxtrick.screenshots';
				var L10N_PATH = Foxtrick.InternalPath + 'locale/';

				// get htlang.json for each locale
				if (!/\/preferences\.html$/.test(window.location.pathname)) {
					// don't run in prefs
					// unnecessary and hurts performance
					for (var locale of Foxtrick.L10n.locales) {
						var url = L10N_PATH + locale + '/htlang.json';
						var text = Foxtrick.util.load.sync(url);
						this.htLanguagesJSON[locale] = JSON.parse(text);
					}
				}

				var propsDefault = Foxtrick.util.load.sync(L10N_BUNDLE_PATH);
				this.properties_default = this.__parse(propsDefault);

				// this.screenshots_default = Foxtrick.util.load.sync(SS_BUNDLE_PATH);
				try {
					var rule = this._getString(this.properties_default, 'pluralFormRuleID');
					this.plForm_default = parseInt(rule.match(/\d+/), 10);
				}
				catch (e) {}

				var localeCode = Foxtrick.Prefs.getString('htLanguage');

				var l10nBundlePath = L10N_PATH + localeCode + '/foxtrick.properties';
				try {
					var props = Foxtrick.util.load.sync(l10nBundlePath);
					if (props === null) {
						Foxtrick.log('Use default properties for locale', localeCode);
						this.properties = this.properties_default;
					}
					else
						this.properties = this.__parse(props);
				}
				catch (e) {
					Foxtrick.log('Use default properties for locale', localeCode);
					this.properties = this.properties_default;
				}

				try {
					var localRule = this._getString(this.properties, 'pluralFormRuleID');
					this.plForm = parseInt(localRule.match(/\d+/), 10);
				}
				catch (e) {}

				// var ssBundlePath = L10N_PATH + localeCode + '/foxtrick.screenshots';
				// try {
				// 	this.screenshots = Foxtrick.util.load.sync(ssBundlePath);
				// 	if (this.screenshots === null) {
				// 		Foxtrick.log('Use default screenshots for locale', localeCode);
				// 		this.screenshots = this.screenshots_default;
				// 	}
				// }
				// catch (ee) {
				// 	Foxtrick.log('Use default screenshots for locale', localeCode);
				// 	this.screenshots = this.screenshots_default;
				// }
			},

			__parse: function(props) {
				var L10N_RE = /^(.+?)=(.+)$/mg;
				var ret = {};

				var prop;
				while ((prop = L10N_RE.exec(props)))
					ret[prop[1]] = prop[2];

				return ret;
			},

			_getString: function(properties, str) {
				if (str in properties)
					return properties[str];

				return null;
			},

			getString: function(str, num) {
				try {
					if (Foxtrick.Prefs.getBool('translationKeys'))
						return str;

					var plForm = this.plForm;
					var value = this._getString(this.properties, str);

					if (value === null) {
						value = this._getString(this.properties_default, str);
						plForm = this.plForm_default;
					}

					if (value === null)
						throw new Error('no such l10n ID');

					// replace escaped characters just like Gecko does
					value = value.replace(/^\\ /, ' ')
						.replace(/\\n/g, '\n')
						.replace(/\\:/g, ':')
						.replace(/\\=/g, '=')
						.replace(/\\#/g, '#')
						.replace(/\\!/g, '!');

					// get plurals
					if (typeof num === 'undefined')
						return value;

					var get = PluralForm.makeGetter(plForm)[0];
					try {
						return get(num, value);
					}
					catch (e) {
						return value.replace(/.+;/g, '');
					}
				}
				catch (e) {
					Foxtrick.error('Error getString(\'' + str + '\')');
					return str.slice(str.lastIndexOf('.') + 1);
				}
			},

			isStringAvailable: function(str) {
				return str in Foxtrick.L10n.properties || str in Foxtrick.L10n.properties_default;
			},

			isStringAvailableLocal: function(str) {
				return str in Foxtrick.L10n.properties;
			},

			getScreenshot: function(str) {
				try {
					var string_regexp = new RegExp('^' + str + '=(.+)$', 'im');

					if (Foxtrick.L10n.screenshots && string_regexp.test(Foxtrick.L10n.screenshots))
						return Foxtrick.L10n.screenshots.match(string_regexp)[1];
					else if (string_regexp.test(Foxtrick.L10n.screenshots_default))
						return Foxtrick.L10n.screenshots_default.match(string_regexp)[1];

					return '';
				}
				catch (e) {
					Foxtrick.error('Error getScreenshot(\'' + str + '\')');
					return '';
				}
			},
		};

		for (var flc in FoxtrickL10nChrome)
			Foxtrick.L10n[flc] = FoxtrickL10nChrome[flc];

	}

})();
