/**
 * Visited countries map
 * @author seben, fixes convincedd, LA-MJ
 */

'use strict';

/* eslint-disable key-spacing */

Foxtrick.modules.FlagCollectionToMap = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['flagCollection'],

	// country codes. see  https://developers.google.com/chart/image/docs/gallery/new_map_charts
	// leaugeid: ISO codes for google chart api
	HTCountries: {
		128: ['IQ'], // Al Iraq
		127: ['KW'], // Al Kuwayt
		77 : ['MA'], // Al Maghrib
		106: ['JO'], // Al Urdun
		133: ['YE'], // Al Yaman
		118: ['DZ'], // Algérie / Al Jazair
		105: ['AD'], // Andorra
		130: ['AO'], // Angola
		7  : ['AR'], // Argentina
		129: ['AZ'], // Azərbaycan
		123: ['BH'], // Bahrain
		132: ['BD'], // Bangladesh
		124: ['BB'], // Barbados
		91 : ['BY'], // Belarus
		158: ['BZ'], // Belize
		44 : ['BE'], // Belgium / België
		139: ['BJ'], // Benin
		74 : ['BO'], // Bolivia
		69 : ['BA'], // Bosna i Hercegovina
		160: ['BW'], // Botswana
		16 : ['BR'], // Brasil
		136: ['BN'], // Brunei
		62 : ['BG'], // Bulgaria
		125: ['CV'], // Cabo Verde
		146: ['CM'], // Cameroon
		17 : ['CA'], // Canada
		52 : ['CZ'], // Česká republika
		18 : ['CL'], // Chile
		34 : ['CN', 'MO'], // China
		60 : ['TW'], // Chinese Taipei / Taiwan
		19 : ['CO'], // Colombia
		151: ['KM'], // Comoros
		81 : ['CR'], // Costa Rica
		126: ['CI'], // Côte d’Ivoire
		131: ['ME'], // Crna Gora
		147: ['CU'], // Cuba
		153: ['CW'], // Curaçao
		61 : ['GB-WLS'], // Cymru
		89 : ['CY'], // Cyprus
		11 : ['DK', 'GL'], // Danmark
		141: ['QA'], // Dawlat Qatar
		3  : ['DE'], // Deutschland
		144: ['MV'], // Dhivehi Raajje / Maldives
		73 : ['EC'], // Ecuador
		56 : ['EE'], // Eesti
		100: ['SV'], // El Salvador
		2  : ['GB-ENG'], // England
		36 : ['ES'], // España
		5  : [
			'FR', 'GF', 'TF', 'BL', 'GP', 'MF', 'MQ', 'NC', 'PF', 'PM', 'RE', 'WF', 'YT',
		], // France PF part of oceania?
		76 : ['FO'], // Føroyar
		137: ['GH'], // Ghana
		154: ['GU'], // Guam
		107: ['GT'], // Guatemala
		164: ['HT'], // Haiti
		30 : ['KR'], // Hanguk / Korea
		122: ['AM'], // Hayastan / Armenia
		50 : ['GR'], // Hellas
		99 : ['HN'], // Honduras
		59 : ['HK'], // Hong Kong
		58 : ['HR'], // Hrvatska
		20 : ['IN'], // India
		54 : ['ID'], // Indonesia
		85 : ['IR'], // Iran
		21 : ['IE'], // Ireland
		38 : ['IS'], // Ísland
		63 : ['IL'], // Israel
		4  : ['IT'], // Italia
		156: ['ET'], // Ītyōṗṗyā / Ethiopia
		94 : ['JM'], // Jamaica
		138: ['KH'], // Kampuchea / Cambodia
		112: ['KZ'], // Kazakhstan
		95 : ['KE'], // Kenya
		102: ['KG'], // Kyrgyz Republic
		53 : ['LV'], // Latvija
		84 : ['LU'], // Lëtzebuerg
		117: ['LI'], // Liechtenstein
		66 : ['LT'], // Lietuva
		120: ['LB'], // Lubnan
		159: ['MG'], // Madagasikara
		51 : ['HU'], // Magyarország
		45 : ['MY'], // Malaysia
		101: ['MT'], // Malta
		6  : ['MX'], // México
		33 : ['EG'], // Misr / Egypt
		135: ['MZ'], // Moçambique / Mozambique
		103: ['MD'], // Moldova
		119: ['MN'], // Mongol Uls
		161: ['MM'], // Myanmar
		14 : ['NL'], // Nederland
		111: ['NI'], // Nicaragua
		75 : ['NG'], // Nigeria
		22 : ['JP'], // Nippon / Japan
		9  : ['NO', 'SJ'], // Norge
		93 : ['GB-NIR'], // Northern Ireland
		145: ['UZ'], // O’zbekiston / Uzbekistan
		15 : [
			'AU', 'NZ', 'CX', 'CC', 'NF', 'FJ', 'NC', 'PG', 'SB', 'VU', 'FM', 'KI', 'MH',
			'NR', 'MP', 'PW', 'AS', 'CK', 'PF', 'NU', 'PN', 'WS', 'TK', 'TO', 'TV', 'WF',
		], // Oceania
		134: ['OM'], // Oman
		39 : ['AT'], // Österreich
		71 : ['PK'], // Pakistan
		148: ['PS'], // Palestine
		96 : ['PA'], // Panamá
		72 : ['PY'], // Paraguay
		23 : ['PE'], // Perú
		55 : ['PH'], // Pilipinas / Philippines
		24 : ['PL'], // Polska
		25 : ['PT'], // Portugal
		31 : ['TH'], // Prathet Thai / Thailand
		165: ['PR'], // Puerto Rico
		155: ['CD'], // RD Congo
		88 : ['DO'], // República Dominicana
		37 : ['RO'], // România
		35 : ['RU'], // Rossiya
		157: ['VC'], // Saint Vincent and the Grenadines
		104: ['GE'], // Sakartvelo / Georgia
		163: ['SM'], // San Marino
		149: ['ST'], // São Tomé e Príncipe
		79 : ['SA'], // Saudi Arabia
		46 : ['CH'], // Schweiz
		26 : ['GB-SCT'], // Scotland
		121: ['SN'], // Sénégal
		97 : ['MK'], // Severna Makedonija / North Macedonia
		98 : ['AL'], // Shqiperia / Albania
		47 : ['SG'], // Singapore
		64 : ['SI'], // Slovenija
		67 : ['SK'], // Slovensko / Slovakia
		27 : ['ZA'], // South Africa
		57 : ['RS'], // Srbija
		152: ['LK'], // Sri Lanka
		12 : ['FI', 'AX'], // Suomi
		113: ['SR'], // Suriname
		140: ['SY'], // Suriyah
		1  : ['SE'], // Sverige
		142: ['TZ'], // Tanzania
		80 : ['TN'], // Tounes
		110: ['TT'], // Trinidad & Tobago
		32 : ['TR'], // Türkiye
		143: ['UG'], // Uganda
		68 : ['UA'], // Ukraina
		83 : ['AE'], // United Arab Emirates
		28 : ['UY'], // Uruguay
		8  : ['US', 'AS', 'MP', 'UM', 'VI'], // USA
		29 : ['VE'], // Venezuela
		70 : ['VN'], // Việt Nam / Vietnam
		162: ['ZM'], // Zambia
	},
	/* eslint-enable key-spacing */

	nonHTCountries: [
		'AF',
		'AG',
		'AI',
		'AN',
		'AQ',
		'AW',
		'AX',
		'BF',
		'BI',
		'BL',
		'BM',
		'BS',
		'BT',
		'BV',
		'CF',
		'CG',
		'DJ',
		'DM',
		'EH',
		'ER',
		'FK',
		'GA',
		'GD',
		'GG',
		'GI',
		'GM',
		'GN',
		'GP',
		'GQ',
		'GS',
		'GW',
		'GY',
		'HM',
		'IM',
		'IO',
		'JE',
		'KN',
		'KP',
		'KY',
		'LA',
		'LC',
		'LR',
		'LS',
		'LY',
		'MC',
		'MF',
		'ML',
		'MO',
		'MQ',
		'MR',
		'MS',
		'MU',
		'MW',
		'NA',
		'NE',
		'NP',
		'PM',
		'RE',
		'RW',
		'SC',
		'SD',
		'SH',
		'SL',
		'SO',
		'SZ',
		'TC',
		'TD',
		'TG',
		'TJ',
		'TL',
		'TM',
		'UM',
		'VA',
		'VG',
		'VI',
		'YT',
		'ZW',
	],

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		var mainboxes = doc.getElementsByClassName('mainBox');

		for (let divElement of mainboxes) {
			let countryIds = [];

			for (let currentNode of [...divElement.children]) {
				if (currentNode.matches('a.flag')) {
					let link = /** @type {HTMLAnchorElement} */ (currentNode);
					countryIds.push(Foxtrick.getUrlParam(link.href, 'LeagueID'));
				}
				else if (currentNode.nodeName == 'P') {
					// not a flag, flush the buffer
					module.createAndInsertMap(doc, countryIds, divElement, currentNode);
					countryIds = [];
				}
			}
			module.createAndInsertMap(doc, countryIds, divElement, null);
		}

	},

	lastMapId: 0,

	/**
	 * @param {Element} parent
	 * @param {Element} what
	 * @param {Element} beforeWhat
	 */
	insertBeforeOrAppend: function(parent, what, beforeWhat) {
		if (beforeWhat == null)
			parent.appendChild(what);
		else
			parent.insertBefore(what, beforeWhat);
	},

	/**
	 * @param {document} doc
	 * @param {string[]} flagCountryIds
	 * @param {Element}  parent
	 * @param {Element}  insertBefore
	 */
	createAndInsertMap: function(doc, flagCountryIds, parent, insertBefore) {
		const module = this;

		if (flagCountryIds.length == 0)
			return;

		/** @type {string[]} */
		var collectedCountryCodes = [];

		/** @type {number[]} */
		var colouringOrder = [];

		// flags
		for (let countryId of flagCountryIds) {

			/** @type {string[]} */
			let countryCodes = module.HTCountries[countryId];
			if (!countryCodes) {
				if (countryId != '1000') // HTI
					Foxtrick.log(`WARNING: ${countryId} country unknown`);

				continue;
			}

			collectedCountryCodes.push(...countryCodes);
			colouringOrder.push(...countryCodes.map(_ => 0));
		}

		// no flag
		for (let [countryId, countryCodes] of Object.entries(module.HTCountries)) {
			if (flagCountryIds.includes(countryId))
				continue;

			// not hasFlag
			collectedCountryCodes.push(...countryCodes);
			colouringOrder.push(...countryCodes.map(_ => 100));
		}

		/** @type {FlagMapUrlDefinition} */
		var urls;

		{
			let codes = collectedCountryCodes.join('|');
			let colors = colouringOrder.join(',');

			let sAfrica = Foxtrick.L10n.getString('flagCollectionToMap.Africa');
			let sAsia = Foxtrick.L10n.getString('flagCollectionToMap.Asia');
			let sEurope = Foxtrick.L10n.getString('flagCollectionToMap.Europe');
			let sMEast = Foxtrick.L10n.getString('flagCollectionToMap.MEast');
			let sSAmerica = Foxtrick.L10n.getString('flagCollectionToMap.SAmerica');
			let sWorld = Foxtrick.L10n.getString('flagCollectionToMap.World');

			// get all required urls
			let africa = module.getMapUrl(sAfrica, codes, colors, '-35,-25,38,50', '440x500');
			let asia = module.getMapUrl(sAsia, codes, colors, '-50,40,70,180', '440x530');
			let europe = module.getMapUrl(sEurope, codes, colors, '34,-11,64,30', '440x540');
			let mEast = module.getMapUrl(sMEast, codes, colors, '12,24,44,64', '440x440');
			let sAmerica = module.getMapUrl(sSAmerica, codes, colors, '-55,-95,25,-30', '440x640');
			let world = module.getMapUrl(sWorld, codes, colors, '-60,-180,80,180', '440x300');

			urls = { africa, asia, europe, mEast, sAmerica, world };
		}

		const mapId = module.lastMapId++;
		const showMap = Foxtrick.L10n.getString('flagCollectionToMap.ShowMap');
		const hideMap = Foxtrick.L10n.getString('flagCollectionToMap.HideMap');

		var openMapA = doc.createElement('a');
		openMapA.appendChild(doc.createTextNode(showMap));
		openMapA.name = 'flags' + mapId;
		openMapA.href = '#foxtrick-top-map-' + mapId;
		openMapA.id = 'flagsA' + mapId;

		Foxtrick.onClick(openMapA, function(ev) {
			if (Foxtrick.hasClass(doc.getElementById('foxtrick-map' + mapId), 'hidden')) {
				Foxtrick.removeClass(doc.getElementById('foxtrick-map' + mapId), 'hidden');
				doc.getElementById('flagsA' + mapId).textContent = hideMap;
			}
			else {
				Foxtrick.addClass(doc.getElementById('foxtrick-map' + mapId), 'hidden');
				doc.getElementById('flagsA' + mapId).textContent = showMap;
			}
			return false;
		});

		var openMapDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
		openMapDiv.appendChild(openMapA);

		var mapDiv = doc.createElement('div');
		mapDiv.id = 'foxtrick-map' + mapId;
		mapDiv.dataset.mapId = String(mapId);
		Foxtrick.addClass(mapDiv, 'hidden');

		module.insertBeforeOrAppend(parent, mapDiv, insertBefore);
		module.insertBeforeOrAppend(parent, openMapDiv, insertBefore);
		module.addMap(doc, mapDiv, urls);
	},

	/**
	 * @typedef FlagMapUrlDefinition
	 * @prop {string} africa
	 * @prop {string} asia
	 * @prop {string} europe
	 * @prop {string} mEast
	 * @prop {string} sAmerica
	 * @prop {string} world
	 */

	/**
	 * @param {document}             doc
	 * @param {HTMLElement}          map
	 * @param {FlagMapUrlDefinition} urls
	 */
	addMap: function(doc, map, urls) {
		let { africa, asia, europe, mEast, sAmerica, world } = urls;

		var mapId = map.dataset.mapId;
		var imgMap = 'foxtrick-img-map-' + mapId;
		var topMap = 'foxtrick-top-map-' + mapId;

		var addNavLink = function(imgUrl, text) {
			let a = doc.createElement('a');
			a.href = `#${topMap}`;
			a.textContent = text;
			Foxtrick.onClick(a, function(ev) {
				let img = /** @type {HTMLImageElement} */ (doc.getElementById(imgMap));
				img.src = imgUrl;
			});
			return map.appendChild(a);
		};

		{
			let maps = [
				[africa, Foxtrick.L10n.getString('flagCollectionToMap.Africa')],
				[asia, Foxtrick.L10n.getString('flagCollectionToMap.Asia')],
				[europe, Foxtrick.L10n.getString('flagCollectionToMap.Europe')],
				[mEast, Foxtrick.L10n.getString('flagCollectionToMap.MEast')],
				[sAmerica, Foxtrick.L10n.getString('flagCollectionToMap.SAmerica')],
				[world, Foxtrick.L10n.getString('flagCollectionToMap.World')],
			];

			for (let [url, txt] of maps) {
				let link = addNavLink(url, txt);
				if (url == africa)
					link.id = topMap;

				map.appendChild(doc.createTextNode(' '));
			}
		}

		let img = doc.createElement('img');
		img.onload = img.onerror = function() {
			// eslint-disable-next-line no-magic-numbers
			if (this.height < 300 || this.width < 300) {
				let msg = Foxtrick.L10n.getString('resource.error');
				msg = msg.replace(/%s/, 'chart.googleapis.com');
				Foxtrick.util.note.add(doc, msg, 'ft-flag-map-failed-note', { to: map });
			}
		};
		img.id = imgMap;
		img.alt = 'Map';
		img.src = world;
		map.appendChild(img);
	},

	/**
	 * Build the url for the map image
	 *
	 * E.g.: https://chart.apis.google.com/chart?cht=t&chs=440x220&chco=ffffff,339933,339933&chd=s:AAAAAA&chld=USCAAUFINODK&chtm=world&chf=bg,s,EAF7FE
	 *
	 * @param  {string} title        map title
	 * @param  {string} countryCodes pipe separated list of ISO 3166-2 codes
	 * @param  {string} colorCodes   comma separated list of gradient codes 0..100
	 * @param  {string} coords       degree coordinates 'S,W,N,E'
	 * @param  {string} size         x*y in pixels, e.g. 400x300
	 * @return {string}              map url
	 */
	getMapUrl: function(title, countryCodes, colorCodes, coords, size) {
		const parts = [
			'https://chart.googleapis.com/chart',
			'?cht=map:fixed=' + coords,
			'&chs=' + size,
			'&chtt=' + title,
			'&chco=CCCCCC,849D84,FCF6DF', // colors: non-ht,flag,noflag,
			'&chf=bg,s,a6dfe7', // bg water color
			'&chd=t:' + colorCodes,
			'&chld=' + countryCodes,
		];

		return parts.join('');
	},
};
