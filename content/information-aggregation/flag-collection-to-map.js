'use strict';
/**
 * Visited countries map
 * @author seben, fixes convincedd
 */

Foxtrick.modules['FlagCollectionToMap'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['flagCollection'],

	own_countryid: 0,
	own_countryvisited: false,
	own_countryCodes: 'XX',

	// country codes. see  http://code.google.com/apis/chart/#iso_codes
	// leaugeid: ISO codes for google chart api
	HT_countries: {
		128	:	['IQ'],	// Al Iraq
		118	:	['DZ'],	// Al Jazair
		127	:	['KW'],	// Al Kuwayt
		77	:	['MA'],	// Al Maghrib
		106	:	['JO'],	// Al Urdun
		133	:	['YE'],	// Al Yaman
		105	:	['AD'],	// Andorra
		130	:	['AO'],	// Angola
		7	:	['AR'],	// Argentina
		129	:	['AZ'],	// Az?rbaycan
		123	:	['BH'],	// Bahrain
		132	:	['BD'],	// Bangladesh
		124	:	['BB'],	// Barbados
		91	:	['BY'],	// Belarus
		44	:	['BE'],	// België
		139	:	['BJ'],	// Benin
		74	:	['BO'],	// Bolivia
		69	:	['BA'],	// Bosna i Herc
		16	:	['BR'],	// Brasil
		136	:	['BN'],	// Brunei
		62	:	['BG'],	// Bulgaria
		126	:	['CI'],	// C. d']Ivoire
		125	:	['CV'],	// Cabo Verde
		146	:	['CM'],	// Cameroon
		17	:	['CA'],	// Canada
		52	:	['CZ'],	// Ceská rep.
		18	:	['CL'],	// Chile
		60	:	['TW'],	// Chin. Taipei
		34	:	['CN', 'MO'],	// China
		19	:	['CO'],	// Colombia
		81	:	['CR'],	// Costa Rica
		147	:	['CU'],	// Cuba
		131	:	['ME'],	// Crna Gora
		61	:	['GB-WLS'],	// Cymru
		89	:	['CY'],	// Cyprus
		11	:	['DK', 'GL'],	// Danmark
		3	:	['DE'],	// Deutschland
		73	:	['EC'],	// Ecuador
		56	:	['EE'],	// Eesti
		100	:	['SV'],	// El Salvador
		2	:	['GB-ENG'],	// England
		36	:	['ES'],	// Espana
		76	:	['FO'],	// Foroyar
		5	:	['FR', 'GF', 'TF', 'BL', 'GP', 'MF', 'MQ', 'NC', 'PF', 'PM', 'RE', 'WF', 'YT'],
			// France  PF part of oceania?
		137	:	['GH'],	// Ghana
		107	:	['GT'],	// Guatemala
		30	:	['KR'],	// Hanguk
		122	:	['AM'],	// Hayastan
		50	:	['GR'],	// Hellas
		99	:	['HN'],	// Honduras
		59	:	['HK'],	// Hong Kong
		58	:	['HR'],	// Hrvatska
		20	:	['IN'],	// India
		54	:	['ID'],	// Indonesia
		85	:	['IR'],	// Iran
		21	:	['IE'],	// Ireland
		38	:	['IS'],	// Ísland
		63	:	['IL'],	// Israel
		4	:	['IT'],	// Italia
		94	:	['JM'],	// Jamaica
		138	:	['KH'],	// Kampuchea
		112	:	['KZ'],	// Kazakhstan
		95	:	['KE'],	// Kenya
		102	:	['KG'],	// Kyrgyzstan
		53	:	['LV'],	// Latvija
		84	:	['LU'],	// Lëtzebuerg
		117	:	['LI'],	// Liechtenst.
		66	:	['LT'],	// Lietuva
		120	:	['LB'],	// Lubnan
		51	:	['HU'],	// Magyarország
		97	:	['MK'],	// Makedonija
		45	:	['MY'],	// Malaysia
		144	:	['MV'],	// Maldives
		101	:	['MT'],	// Malta
		6	:	['MX'],	// México
		33	:	['EG'],	// Misr
		135	:	['MZ'],	// Moçambique
		103	:	['MD'],	// Moldova
		119	:	['MN'],	// Mongol Uls
		93	:	['GB-NIR'],	// N. Ireland
		14	:	['NL'],	// Nederland
		111	:	['NI'],	// Nicaragua
		75	:	['NG'],	// Nigeria
		22	:	['JP'],	// Nippon
		9	:	['NO', 'SJ'], // Norge
		15	:	[
			'AU', 'NZ', 'CX', 'CC', 'NF', 'FJ', 'NC', 'PG', 'SB', 'VU', 'FM', 'GU', 'KI', 'MH',
			'NR', 'MP', 'PW', 'AS', 'CK', 'PF', 'NU', 'PN', 'WS', 'TK', 'TO', 'TV', 'WF'
		],				// Oceania
		134	:	['OM'],	// Oman
		39	:	['AT'],	// Österreich
		71	:	['PK'],	// Pakistan
		96	:	['PA'],	// Panamá
		148	:	['PS'],	// Palestinian Territory, Occupied
		72	:	['PY'],	// Paraguay
		23	:	['PE'],	// Perú
		55	:	['PH'],	// Philippines
		24	:	['PL'],	// Polska
		25	:	['PT'],	// Portugal
		31	:	['TH'],	// Prathet Thai
		141	:	['QA'],	// Qatar
		88	:	['DO'],	// Rep. Dom.
		37	:	['RO'],	// România
		35	:	['RU'],	// Rossiya
		104	:	['GE'],	// Sakartvelo
		79	:	['SA'],	// Saudi Arabia
		46	:	['CH'],	// Schweiz
		26	:	['GB-SCT'],	// Scotland
		121	:	['SN'],	// Sénégal
		98	:	['AL'],	// Shqiperia
		47	:	['SG'],	// Singapore
		64	:	['SI'],	// Slovenija
		67	:	['SK'],	// Slovensko
		27	:	['ZA'],	// South Africa
		57	:	['RS'],	// Srbija
		12	:	['FI', 'AX'],	// Suomi
		113	:	['SR'],	// Suriname
		140	:	['SY'],	// Suriyah
		1	:	['SE'],	// Sverige
		142	:	['TZ'],	// Tanzania
		80	:	['TN'],	// Tounes
		110	:	['TT'],	// Trinidad/T.
		32	:	['TR'],	// Türkiye
		83	:	['AE'],	// U.A.E.
		143	:	['UG'],	// Uganda
		68	:	['UA'],	// Ukraina
		28	:	['UY'],	// Uruguay
		8	:	['US', 'AS', 'GU', 'MP', 'PR', 'UM', 'VI'],	// USA
		145	:	['UZ'],	// Uzbekistan
		29	:	['VE'],	// Venezuela
		70	:	['VN'],	// Vietnam
	},

	non_HT_countries: [
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
		'CD',
		'CF',
		'CG',
		'DJ',
		'DM',
		'EH',
		'ER',
		'ET',
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
		'KM',
		'KN',
		'KP',
		'KY',
		'LA',
		'LC',
		'LK',
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
		'ST',
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
		'ZW'
	],


	run: function(doc) {
		this.own_countryid = Foxtrick.util.id.getOwnLeagueId();

		var mapId = 0;
		var mainbox = doc.getElementsByClassName('mainBox');
		for (var i = 0; i < mainbox.length; i++) {
			var divElement = mainbox[i];

			var countryIds = [];
			for (var j = 0; j < divElement.childNodes.length; j++) {
				var currentNode = divElement.childNodes[j];
				if (currentNode.nodeName == 'A' && currentNode.href.search(/LeagueID=/i) > -1) {
					var countryId = currentNode.href.substr(currentNode.href.lastIndexOf('=') + 1,
					                                        currentNode.href.length);
					if (currentNode.getElementsByTagName('img')[0].getAttribute('style')
					    .search(/flags\.gif/i) != -1) {
						countryIds.push(countryId);
					}
				} else if (currentNode.nodeName == 'P') {
					// not a flag, flush the buffer
					this.createAndInsertMap(doc, countryIds, mapId++, divElement, currentNode);
					countryIds = [];
				}
			}
			this.createAndInsertMap(doc, countryIds, mapId++, divElement, null);
		}

	},


	insertBeforeOrAppend: function(parent, what, beforeWhat) {
		if (beforeWhat == null) {
			parent.appendChild(what);
		} else {
			parent.insertBefore(what, beforeWhat);
		}
	},

	createAndInsertMap: function(document, countryIdsHasFlags, mapId, parent, insertBefore) {

		if (countryIdsHasFlags.length == 0) return;

		var collectedCountryCodes = '';
		var colouringOrder = '';

		// flags
		for (var i = 0; i < countryIdsHasFlags.length; i++) {
			var countryId = countryIdsHasFlags[i];
			var countryCodes = this.HT_countries[countryId];
			for (var j = 0; j < countryCodes.length; ++j) {
				collectedCountryCodes += countryCodes[j] + '|';
				colouringOrder += '0,';
			}
		}

		// no flag
		var noflags = '';
		for (var countryId in this.HT_countries) {
			var countryCodes = this.HT_countries[countryId];
			if (!Foxtrick.any(function(n) {
				return n == countryId;
				}, countryIdsHasFlags)) { // not hasFlag
				for (var j = 0; j < countryCodes.length; ++j) {
					noflags += countryCodes[j] + '|';
					collectedCountryCodes += countryCodes[j] + '|';
					colouringOrder += '100,';
				}
			}
		}

		/*
		// non-ht countries. not updated to new version and url would get too long probably
		for (var i = 0; i < this.non_HT_countries.length-1 ; i++) {
			collectedCountryCodes += this.non_HT_countries[i]+'|';
			colouringOrder += '0,';
		}
		collectedCountryCodes += this.non_HT_countries[this.non_HT_countries.length-1];
		colouringOrder += '0';*/

		/*
		// own country. add to front. is overwriten by visited color if visited
		this.own_countryCodes = this.countryCodes['c_'+this.own_countryid];
		if (typeof this.own_countryCodes != 'undefined') {
				collectedCountryCodes = this.own_countryCodes + '|'+collectedCountryCodes;
				colouringOrder = '100,' + colouringOrder;
		}*/

		var Africa = Foxtrickl10n.getString('flagCollectionToMap.Africa');
		var Asia = Foxtrickl10n.getString('flagCollectionToMap.Asia');
		var Europe = Foxtrickl10n.getString('flagCollectionToMap.Europe');
		var MEast = Foxtrickl10n.getString('flagCollectionToMap.MEast');
		var SAmerica = Foxtrickl10n.getString('flagCollectionToMap.SAmerica');
		var World = Foxtrickl10n.getString('flagCollectionToMap.World');

		// get all required urls
		var urlAfrica = this.getMapUrl(Africa, collectedCountryCodes, colouringOrder,
		                               '-35,-25,38,50', '440x500');
		var urlAsia = this.getMapUrl(Asia, collectedCountryCodes, colouringOrder,
		                             '-50,40,70,180', '440x530');
		var urlEurope = this.getMapUrl(Europe, collectedCountryCodes, colouringOrder,
		                               '34,-11,64,30', '440x540');
		var urlMEast = this.getMapUrl(MEast, collectedCountryCodes, colouringOrder,
		                              '12,24,44,64', '440x440');
		var urlSAmerica = this.getMapUrl(SAmerica, collectedCountryCodes, colouringOrder,
		                                 '-55,-95,25,-30', '440x640');
		var urlWorld = this.getMapUrl(World, collectedCountryCodes, colouringOrder,
		                              '-60,-180,80,180', '440x300');

		var mapDiv = document.createElement('div');
		mapDiv.id = 'foxtrick-map' + mapId;
		mapDiv.style.padding = '5 0 5 0';
		mapDiv.style.display = 'none';

		var openMapA = document.createElement('A');

		var ShowMap = Foxtrickl10n.getString('flagCollectionToMap.ShowMap');
		var HideMap = Foxtrickl10n.getString('flagCollectionToMap.HideMap');
		openMapA.appendChild(document.createTextNode(ShowMap));
		openMapA.name = 'flags' + mapId;
		openMapA.href = '#' + 'foxtrick-top-map-' + mapId;
		openMapA.id = 'flagsA' + mapId;
		openMapA.style.display = 'block';
		Foxtrick.onClick(openMapA, function(ev) {
			if (document.getElementById('foxtrick-map' + mapId).style.display == 'none') {
				document.getElementById('foxtrick-map' + mapId).style.display = '';
				document.getElementById('flagsA' + mapId).textContent = HideMap;
			}
			else {
				document.getElementById('foxtrick-map' + mapId).style.display = 'none';
				document.getElementById('flagsA' + mapId).textContent = ShowMap;
			}
			return false;
		});

		this.insertBeforeOrAppend(parent, mapDiv, insertBefore);
		this.insertBeforeOrAppend(parent, openMapA, insertBefore);

		this.addMap(document, document.getElementById('foxtrick-map' + mapId), urlAfrica,
		            urlAsia, urlEurope, urlMEast, urlSAmerica, urlWorld, mapId);
	},

	addMap: function(doc, map, urlAfrica, urlAsia, urlEurope, urlMEast,
	                 urlSAmerica, urlWorld, anchorId) {
		var href = '#' + 'foxtrick-img-map-' + anchorId;
		var hrefTop = '#' + 'foxtrick-top-map-' + anchorId;
		var Africa = Foxtrickl10n.getString('flagCollectionToMap.Africa');
		var Asia = Foxtrickl10n.getString('flagCollectionToMap.Asia');
		var Europe = Foxtrickl10n.getString('flagCollectionToMap.Europe');
		var MEast = Foxtrickl10n.getString('flagCollectionToMap.MEast');
		var SAmerica = Foxtrickl10n.getString('flagCollectionToMap.SAmerica');
		var World = Foxtrickl10n.getString('flagCollectionToMap.World');

		var addNavLink = function(imgUrl, text) {
			var a = doc.createElement('a');
			a.href = hrefTop;
			Foxtrick.onClick(a, function(ev) {
				doc.getElementById('foxtrick-img-map-' + anchorId).src = imgUrl;
			});
			a.textContent = text;
			map.appendChild(a);
			return a;
		};
		var top = addNavLink(urlAfrica, 'Africa');
		top.id = 'foxtrick-top-map-' + anchorId;
		map.appendChild(doc.createTextNode(' '));
		addNavLink(urlAsia, 'Asia');
		map.appendChild(doc.createTextNode(' '));
		addNavLink(urlEurope, 'Europe');
		map.appendChild(doc.createTextNode(' '));
		addNavLink(urlMEast, 'MEast');
		map.appendChild(doc.createTextNode(' '));
		addNavLink(urlSAmerica, 'SAmerica');
		map.appendChild(doc.createTextNode(' '));
		addNavLink(urlWorld, 'World');
		map.appendChild(doc.createTextNode(' '));

		var img = doc.createElement('img');
		img.id = 'foxtrick-img-map-' + anchorId;
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
		var base = 'http://chart.apis.google.com/chart';
		var chartType = '?cht=map:fixed=' + areaParam; // lang long: bottom,left,top,right
		var dimensions = '&chs=' + size;

		var colors = '&chco=CCCCCC,849D84,FCF6DF';  // non-ht,flag,noflag,
		var order = '&chd=t:' + colorOrder;
		var countries = '&chld=' + countryCodes;
		var title = '&chtt=' + title;
		var background = '&chf=bg,s,a6dfe7'; // bg water color

		var url = base + chartType + dimensions + title + colors + background + order + countries;
		url = url.replace(',&', '&');
		return url;
	},
};
