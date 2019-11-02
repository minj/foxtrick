/**
 * Visited countries map
 * @author seben, fixes convincedd
 */

'use strict';

/* eslint-disable key-spacing */

Foxtrick.modules.FlagCollectionToMap = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['flagCollection'],

	// country codes. see  http://code.google.com/apis/chart/#iso_codes
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
		44 : ['BE'], // Belgium / België
		139: ['BJ'], // Benin
		74 : ['BO'], // Bolivia
		69 : ['BA'], // Bosna i Hercegovina
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
		151: ['KM'], // Comoros # NEW
		81 : ['CR'], // Costa Rica
		126: ['CI'], // Côte d’Ivoire
		131: ['ME'], // Crna Gora
		147: ['CU'], // Cuba
		153: ['CW'], // Curaçao # NEW
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
		154: ['GU'], // Guam # NEW
		107: ['GT'], // Guatemala
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
		156: ['ET'], // Ītyōṗṗyā / Ethiopia # NEW
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
		51 : ['HU'], // Magyarország
		45 : ['MY'], // Malaysia
		101: ['MT'], // Malta
		6  : ['MX'], // México
		33 : ['EG'], // Misr / Egypt
		135: ['MZ'], // Moçambique / Mozambique
		103: ['MD'], // Moldova
		119: ['MN'], // Mongol Uls
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
		155: ['CD'], // RD Congo # NEW
		88 : ['DO'], // República Dominicana
		37 : ['RO'], // România
		35 : ['RU'], // Rossiya
		104: ['GE'], // Sakartvelo / Georgia
		149: ['ST'], // São Tomé e Príncipe # NEW
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
		152: ['LK'], // Sri Lanka # NEW
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
		8  : ['US', 'AS', 'MP', 'PR', 'UM', 'VI'], // USA
		29 : ['VE'], // Venezuela
		70 : ['VN'], // Việt Nam / Vietnam
	},

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
		'BW',
		'BZ',
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
		'HT',
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
		'MG',
		'ML',
		'MM',
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
		'PR',
		'RE',
		'RW',
		'SC',
		'SD',
		'SH',
		'SL',
		'SM',
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
		'VC',
		'VG',
		'VI',
		'YT',
		'ZM',
		'ZW',
	],


	run: function(doc) {
		const module = this;

		var mapId = 0;
		var mainboxes = doc.getElementsByClassName('mainBox');

		for (let divElement of mainboxes) {
			let countryIds = [];
			for (let currentNode of [...divElement.childNodes]) {
				if (currentNode.nodeName == 'A' && /LeagueID=/i.test(currentNode.href)) {
					let idx = currentNode.href.lastIndexOf('=') + 1;
					let countryId = currentNode.href.slice(idx, idx + currentNode.href.length);
					let style = currentNode.querySelector('img').getAttribute('style');
					if (/flags\.gif/i.test(style))
						countryIds.push(countryId);
				}
				else if (currentNode.nodeName == 'P') {
					// not a flag, flush the buffer
					module.createAndInsertMap(doc, countryIds, mapId++, divElement, currentNode);
					countryIds = [];
				}
			}
			module.createAndInsertMap(doc, countryIds, mapId++, divElement, null);
		}

	},


	insertBeforeOrAppend: function(parent, what, beforeWhat) {
		if (beforeWhat == null)
			parent.appendChild(what);
		else
			parent.insertBefore(what, beforeWhat);
	},

	createAndInsertMap: function(doc, countryIdsHasFlags, mapId, parent, insertBefore) {
		const module = this;

		if (countryIdsHasFlags.length == 0)
			return;

		var collectedCountryCodes = '';
		var colouringOrder = '';

		// flags
		for (let i = 0; i < countryIdsHasFlags.length; i++) {
			let countryId = countryIdsHasFlags[i];
			let countryCodes = module.HTCountries[countryId];
			for (let code of countryCodes) {
				collectedCountryCodes += code + '|';
				colouringOrder += '0,';
			}
		}

		// no flag
		for (let [countryId, countryCodes] of Object.entries(module.HTCountries)) {
			if (countryIdsHasFlags.includes(countryId))
				continue;

			// not hasFlag
			for (let code of countryCodes) {
				collectedCountryCodes += code + '|';
				colouringOrder += '100,';
			}
		}

		var Africa = Foxtrick.L10n.getString('flagCollectionToMap.Africa');
		var Asia = Foxtrick.L10n.getString('flagCollectionToMap.Asia');
		var Europe = Foxtrick.L10n.getString('flagCollectionToMap.Europe');
		var MEast = Foxtrick.L10n.getString('flagCollectionToMap.MEast');
		var SAmerica = Foxtrick.L10n.getString('flagCollectionToMap.SAmerica');
		var World = Foxtrick.L10n.getString('flagCollectionToMap.World');

		// get all required urls
		var urlAfrica = module.getMapUrl(Africa, collectedCountryCodes, colouringOrder,
		                               '-35,-25,38,50', '440x500');
		var urlAsia = module.getMapUrl(Asia, collectedCountryCodes, colouringOrder,
		                             '-50,40,70,180', '440x530');
		var urlEurope = module.getMapUrl(Europe, collectedCountryCodes, colouringOrder,
		                               '34,-11,64,30', '440x540');
		var urlMEast = module.getMapUrl(MEast, collectedCountryCodes, colouringOrder,
		                              '12,24,44,64', '440x440');
		var urlSAmerica = module.getMapUrl(SAmerica, collectedCountryCodes, colouringOrder,
		                                 '-55,-95,25,-30', '440x640');
		var urlWorld = module.getMapUrl(World, collectedCountryCodes, colouringOrder,
		                              '-60,-180,80,180', '440x300');

		var mapDiv = doc.createElement('div');
		mapDiv.id = 'foxtrick-map' + mapId;
		Foxtrick.addClass(mapDiv, 'hidden');

		var openMapA = doc.createElement('A');

		var ShowMap = Foxtrick.L10n.getString('flagCollectionToMap.ShowMap');
		var HideMap = Foxtrick.L10n.getString('flagCollectionToMap.HideMap');
		openMapA.appendChild(doc.createTextNode(ShowMap));
		openMapA.name = 'flags' + mapId;
		openMapA.href = '#foxtrick-top-map-' + mapId;
		openMapA.id = 'flagsA' + mapId;
		Foxtrick.onClick(openMapA, function(ev) {
			if (Foxtrick.hasClass(doc.getElementById('foxtrick-map' + mapId), 'hidden')) {
				Foxtrick.removeClass(doc.getElementById('foxtrick-map' + mapId), 'hidden');
				doc.getElementById('flagsA' + mapId).textContent = HideMap;
			}
			else {
				Foxtrick.addClass(doc.getElementById('foxtrick-map' + mapId), 'hidden');
				doc.getElementById('flagsA' + mapId).textContent = ShowMap;
			}
			return false;
		});
		var openMapDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
		openMapDiv.appendChild(openMapA);

		module.insertBeforeOrAppend(parent, mapDiv, insertBefore);
		module.insertBeforeOrAppend(parent, openMapDiv, insertBefore);

		module.addMap(doc, doc.getElementById('foxtrick-map' + mapId), urlAfrica,
		            urlAsia, urlEurope, urlMEast, urlSAmerica, urlWorld, mapId);
	},

	addMap: function(doc, map, urlAfrica, urlAsia, urlEurope, urlMEast,
	                 urlSAmerica, urlWorld, anchorId) {
		var imgMap = 'foxtrick-img-map-' + anchorId;
		var topMap = 'foxtrick-top-map-' + anchorId;
		var Africa = Foxtrick.L10n.getString('flagCollectionToMap.Africa');
		var Asia = Foxtrick.L10n.getString('flagCollectionToMap.Asia');
		var Europe = Foxtrick.L10n.getString('flagCollectionToMap.Europe');
		var MEast = Foxtrick.L10n.getString('flagCollectionToMap.MEast');
		var SAmerica = Foxtrick.L10n.getString('flagCollectionToMap.SAmerica');
		var World = Foxtrick.L10n.getString('flagCollectionToMap.World');

		var addNavLink = function(imgUrl, text) {
			var a = doc.createElement('a');
			a.href = `#${topMap}`;
			Foxtrick.onClick(a, function(ev) {
				doc.getElementById(imgMap).src = imgUrl;
			});
			a.textContent = text;
			map.appendChild(a);
			return a;
		};
		var top = addNavLink(urlAfrica, Africa);
		top.id = topMap;
		map.appendChild(doc.createTextNode(' '));
		addNavLink(urlAsia, Asia);
		map.appendChild(doc.createTextNode(' '));
		addNavLink(urlEurope, Europe);
		map.appendChild(doc.createTextNode(' '));
		addNavLink(urlMEast, MEast);
		map.appendChild(doc.createTextNode(' '));
		addNavLink(urlSAmerica, SAmerica);
		map.appendChild(doc.createTextNode(' '));
		addNavLink(urlWorld, World);
		map.appendChild(doc.createTextNode(' '));

		var img = doc.createElement('img');
		img.onload = img.onerror = function() {
			// eslint-disable-next-line no-magic-numbers
			if (this.height < 300 || this.width < 300) {
				var msg = Foxtrick.L10n.getString('resource.error');
				msg = msg.replace(/%s/, 'chart.googleapis.com');
				Foxtrick.util.note.add(doc, msg, 'ft-flag-map-failed-note', { to: map });
			}
		};
		img.id = imgMap;
		img.alt = 'Map';
		img.src = urlWorld;
		map.appendChild(img);
	},

	/**
	 * Build the url for the map image
	 * Example: http://chart.apis.google.com/chart?cht=t&chs=440x220&chco=ffffff,339933,339933&chd=s:AAAAAA&chld=USCAAUFINODK&chtm=world&chf=bg,s,EAF7FE
	 */
	//* @param: title, ISO 3166-2 countrycodes, gradient codes (0-100), lang-long box, x*y
	getMapUrl: function(title, countryCodes, colorOrder, areaParam, size) {
		var base = 'https://chart.googleapis.com/chart';
		var chartType = '?cht=map:fixed=' + areaParam; // lang long: bottom,left,top,right
		var dimensions = '&chs=' + size;

		var colors = '&chco=CCCCCC,849D84,FCF6DF'; // non-ht,flag,noflag,
		var order = '&chd=t:' + colorOrder;
		var countries = '&chld=' + countryCodes;
		title = '&chtt=' + title;
		var background = '&chf=bg,s,a6dfe7'; // bg water color

		var url = base + chartType + dimensions + title + colors + background + order + countries;
		url = url.replace(',&', '&');
		return url;
	},
};
