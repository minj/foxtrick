/**
 * Visited countries map
 * @author seben, fixes convincedd
 */

var FoxtrickFlagCollectionToMap = {

	MODULE_NAME : "FlagCollectionToMap",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : new Array('flagCollection'),

	own_countryid:0,
	own_countryvisited:false,
	own_countryCodes:'XX',

	non_HT_countries:[
	"AF",
	"AG",
	"AI",
	"AN",
	"AQ",
	"AW",
	"AX",
	"BF",
	"BI",
	"BL",
	"BM",
	"BS",
	"BT",
	"BV",
	"BW",
	"BZ",
	"CD",
	"CF",
	"CG",
	"DJ",
	"DM",
	"EH",
	"ER",
	"ET",
	"FK",
	"GA",
	"GD",
	"GG",
	"GI",
	"GM",
	"GN",
	"GP",
	"GQ",
	"GS",
	"GW",
	"GY",
	"HM",
	"HT",
	"IM",
	"IO",
	"JE",
	"KM",
	"KN",
	"KP",
	"KY",
	"LA",
	"LC",
	"LK",
	"LR",
	"LS",
	"LY",
	"MC",
	"MF",
	"MG",
	"ML",
	"MM",
	"MO",
	"MQ",
	"MR",
	"MS",
	"MU",
	"MW",
	"NA",
	"NE",
	"NP",
	"PM",
	"PR",
	"RE",
	"RW",
	"SC",
	"SD",
	"SH",
	"SL",
	"SM",
	"SO",
	"ST",
	"SZ",
	"TC",
	"TD",
	"TG",
	"TJ",
	"TL",
	"TM",
	"UM",
	"VA",
	"VC",
	"VG",
	"VI",
	"YT",
	"ZM",
	"ZW"],


	init : function() {
		this.setupCountryCodes();
	},

	run : function(doc) {

		this.own_countryid = Foxtrick.util.id.getOwnCountryId();

		var mapId = 0;
		var mainbox = doc.getElementsByClassName("mainBox");
		for (var i=0; i< mainbox.length; i++) {
			var divElement = mainbox[i];

			var countryIds = new Array();
			var countryIdsNV = new Array();

			for(var j = 0; j < divElement.childNodes.length; j++){
				var currentNode = divElement.childNodes[j];
				if (currentNode.nodeName == 'A' && currentNode.href.indexOf('LeagueID=') > -1) {
					if (currentNode.innerHTML.indexOf('inactive') == -1) {
						var countryId = currentNode.href.substr(currentNode.href.lastIndexOf('=')+1, currentNode.href.length);
						countryIds.push(countryId);
					}
					else {
						var countryId = currentNode.href.substr(currentNode.href.lastIndexOf('=')+1, currentNode.href.length);
						countryIdsNV.push(countryId);
					}
				} else if (currentNode.nodeName == 'P') {
					// not a flag, flush the buffer
					this.createAndInsertMap(doc, countryIds, countryIdsNV, mapId++, divElement, currentNode);
					countryIds = new Array();
					countryIdsNV = new Array();
				}
			}
			this.createAndInsertMap(doc, countryIds, countryIdsNV, mapId++, divElement, null);
		}

	},


	insertBeforeOrAppend : function(parent, what, beforeWhat) {
		if (beforeWhat == null) {
			parent.appendChild(what);
		} else {
			parent.insertBefore(what, beforeWhat);
		}
	},

	createAndInsertMap : function(document, countryIds, countryIdsNV, mapId, parent, insertBefore) {

		if (countryIds.length == 0) return;

		var countryCodes= '';
		var colouringOrder='';
		for(var i = 0; i < countryIds.length; i++){
			var countryId = countryIds[i];
			var countryCode = this.countryCodes['c_'+countryId];
			if (typeof countryCode != 'undefined') {
				for (var j=0;j<countryCode.length;++j) {
				countryCodes += countryCode[j]+'|'
				colouringOrder += '0,';
				}
			}
		}

		for(var i = 0; i < countryIdsNV.length; i++){
			var countryId = countryIdsNV[i];
			var countryCode = this.countryCodes['c_'+countryId];
			if (typeof countryCode != 'undefined') {
				for (var j=0;j<countryCode.length;++j) {
				countryCodes += countryCode[j]+'|'
				colouringOrder += '100,';
				}
			}
		}

		/*
		// non-ht countries. not updated to new version and url would get to long probably
		for(var i = 0; i < this.non_HT_countries.length-1 ; i++){
			countryCodes += this.non_HT_countries[i]+'|';
			colouringOrder += '2,';
		}
		countryCodes += this.non_HT_countries[this.non_HT_countries.length-1];
		colouringOrder += '2';*/

		/*
		// own country. add to front. is overwriten by visited color if visited
		this.own_countryCodes = this.countryCodes['c_'+this.own_countryid];
		if (typeof this.own_countryCodes != 'undefined') {
				countryCodes = this.own_countryCodes + '|'+countryCodes;
				colouringOrder = '0,' + colouringOrder;
		}*/

		const Africa = Foxtrickl10n.getString("foxtrick.FlagCollectionToMap.Africa");
		const Asia = Foxtrickl10n.getString("foxtrick.FlagCollectionToMap.Asia");
		const Europe = Foxtrickl10n.getString("foxtrick.FlagCollectionToMap.Europe");
		const MEast = Foxtrickl10n.getString("foxtrick.FlagCollectionToMap.MEast");
		const SAmerica = Foxtrickl10n.getString("foxtrick.FlagCollectionToMap.SAmerica");
		const World = Foxtrickl10n.getString("foxtrick.FlagCollectionToMap.World");

		// get all required urls
		var urlAfrica = this.getMapUrl(Africa, countryCodes, colouringOrder,'-35,-20,38,55','440x500');
		var urlAsia = this.getMapUrl(Asia, countryCodes, colouringOrder,'-50,40,70,180','440x530');
		var urlEurope = this.getMapUrl(Europe, countryCodes, colouringOrder,'34,-25,71,50','440x420');
		var urlMEast = this.getMapUrl(MEast, countryCodes, colouringOrder,'12,24,44,64','440x440');
		var urlSAmerica = this.getMapUrl(SAmerica, countryCodes, colouringOrder,'-55,-95,25,-30','440x640');
		var urlWorld = this.getMapUrl(World, countryCodes, colouringOrder,'-60,-180,80,180','440x300');

		var mapDiv = document.createElement("div");
		mapDiv.id = 'foxtrick-map' + mapId;
		mapDiv.style.padding = '5 0 5 0';
		mapDiv.style.display = 'none';
		mapDiv.style.width = '550px';

		var openMapA = document.createElement('A');

		const ShowMap = Foxtrickl10n.getString("foxtrick.FlagCollectionToMap.ShowMap");
		const HideMap = Foxtrickl10n.getString("foxtrick.FlagCollectionToMap.HideMap");
		openMapA.appendChild(document.createTextNode(ShowMap));
		openMapA.name = 'flags' + mapId;
		openMapA.href = '#';
		openMapA.id = 'flagsA' + mapId;
		openMapA.setAttribute('onClick', 'if(document.getElementById(\'foxtrick-map' + mapId + '\').style.display == \'none\'){document.getElementById(\'foxtrick-map' + mapId + '\').style.display = \'\'; document.getElementById(\'flagsA' + mapId + '\').innerHTML = \'' + HideMap + '\'; }else {document.getElementById(\'foxtrick-map' + mapId +'\').style.display = \'none\';document.getElementById(\'flagsA' + mapId +'\').innerHTML = \'' + ShowMap + '\';}; return false');

		this.insertBeforeOrAppend(parent, mapDiv, insertBefore);
		this.insertBeforeOrAppend(parent, document.createElement('br'), insertBefore);
		this.insertBeforeOrAppend(parent, openMapA, insertBefore);

		document.getElementById('foxtrick-map'+mapId).innerHTML = this.getMapHtml(urlAfrica, urlAsia, urlEurope, urlMEast, urlSAmerica, urlWorld, mapId);
	},

	setupCountryCodes : function() {
		//test: http://www87.hattrick.org/Common/Team/FlagCollection.aspx?teamId=258161
		// country codes. see  http://code.google.com/apis/chart/#iso_codes
		this.countryCodes = {};

		this.countryCodes.c_128=['IQ'] // Al Iraq
		this.countryCodes.c_118=['DZ'] // Al Jazair
		this.countryCodes.c_127=['KW'] // Al Kuwayt
		this.countryCodes.c_77=['MA'] // Al Maghrib
		this.countryCodes.c_106=['JO'] // Al Urdun
		this.countryCodes.c_133=['YE'] // Al Yaman
		this.countryCodes.c_105=['AD'] // Andorra
		this.countryCodes.c_130=['AO'] // Angola
		this.countryCodes.c_7=['AR'] // Argentina
		this.countryCodes.c_129=['AZ'] // Az?rbaycan
		this.countryCodes.c_123=['BH'] // Bahrain
		this.countryCodes.c_132=['BD'] // Bangladesh
		this.countryCodes.c_124=['BB'] // Barbados
		this.countryCodes.c_91=['BY'] // Belarus
		this.countryCodes.c_44=['BE'] // België
		this.countryCodes.c_139=['BJ'] // Benin
		this.countryCodes.c_74=['BO'] // Bolivia
		this.countryCodes.c_69=['BA'] // Bosna i Herc
		this.countryCodes.c_16=['BR'] // Brasil
		this.countryCodes.c_136=['BN'] // Brunei
		this.countryCodes.c_62=['BG'] // Bulgaria
		this.countryCodes.c_126=['CI'] // C. d']Ivoire
		this.countryCodes.c_125=['CV'] // Cabo Verde
		this.countryCodes.c_146=['CM'] // Cameroon
		this.countryCodes.c_17=['CA'] // Canada
		this.countryCodes.c_52=['CZ'] // Česká rep.
		this.countryCodes.c_18=['CL'] // Chile
		this.countryCodes.c_60=['TW'] // Chin. Taipei
		this.countryCodes.c_34=['CN','MO'] // China
		this.countryCodes.c_19=['CO'] // Colombia
		this.countryCodes.c_81=['CR'] // Costa Rica
		this.countryCodes.c_147=['CU'] // Cuba
		this.countryCodes.c_131=['ME'] // Crna Gora
		this.countryCodes.c_61=['GB-WLS'] // Cymru
		this.countryCodes.c_89=['CY'] // Cyprus
		this.countryCodes.c_11=['DK','GL'] // Danmark
		this.countryCodes.c_3=['DE'] // Deutschland
		this.countryCodes.c_73=['EC'] // Ecuador
		this.countryCodes.c_56=['EE'] // Eesti
		this.countryCodes.c_100=['SV'] // El Salvador
		this.countryCodes.c_2=['GB-ENG'] // England
		this.countryCodes.c_36=['ES'] // Espana
		this.countryCodes.c_76=['FO'] // Foroyar
		this.countryCodes.c_5=['FR','GF','TF','BL','GP','MF','MQ','NC','PF','PM','RE','WF','YT'] // France  PF part of oceania?
		this.countryCodes.c_137=['GH'] // Ghana
		this.countryCodes.c_107=['GT'] // Guatemala
		this.countryCodes.c_30=['KR'] // Hanguk
		this.countryCodes.c_122=['AM'] // Hayastan
		this.countryCodes.c_50=['GR'] // Hellas
		this.countryCodes.c_99=['HN'] // Honduras
		this.countryCodes.c_59=['HK'] // Hong Kong
		this.countryCodes.c_58=['HR'] // Hrvatska
		this.countryCodes.c_20=['IN'] // India
		this.countryCodes.c_54=['ID'] // Indonesia
		this.countryCodes.c_85=['IR'] // Iran
		this.countryCodes.c_21=['IE'] // Ireland
		this.countryCodes.c_38=['IS'] // Ísland
		this.countryCodes.c_63=['IL'] // Israel
		this.countryCodes.c_4=['IT'] // Italia
		this.countryCodes.c_94=['JM'] // Jamaica
		this.countryCodes.c_138=['KH'] // Kampuchea
		this.countryCodes.c_112=['KZ'] // Kazakhstan
		this.countryCodes.c_95=['KE'] // Kenya
		this.countryCodes.c_102=['KG'] // Kyrgyzstan
		this.countryCodes.c_53=['LV'] // Latvija
		this.countryCodes.c_84=['LU'] // Lëtzebuerg
		this.countryCodes.c_117=['LI'] // Liechtenst.
		this.countryCodes.c_66=['LT'] // Lietuva
		this.countryCodes.c_120=['LB'] // Lubnan
		this.countryCodes.c_51=['HU'] // Magyarország
		this.countryCodes.c_97=['MK'] // Makedonija
		this.countryCodes.c_45=['MY'] // Malaysia
		this.countryCodes.c_144=['MV'] // Maldives
		this.countryCodes.c_101=['MT'] // Malta
		this.countryCodes.c_6=['MX'] // México
		this.countryCodes.c_33=['EG'] // Misr
		this.countryCodes.c_135=['MZ'] // Moçambique
		this.countryCodes.c_103=['MD'] // Moldova
		this.countryCodes.c_119=['MN'] // Mongol Uls
		this.countryCodes.c_93=['GB-NIR'] // N. Ireland
		this.countryCodes.c_14=['NL'] // Nederland
		this.countryCodes.c_111=['NI'] // Nicaragua
		this.countryCodes.c_75=['NG'] // Nigeria
		this.countryCodes.c_22=['JP'] // Nippon
		this.countryCodes.c_9=['NO','SJ'] // Norge
		// OCEANIA, SEVERAL (exclude Indonesia because it exists as a country)
		this.countryCodes.c_15=['AU','NZ','CX','CC','NF','FJ','NC','PG','SB','VU','FM','GU','KI','MH','NR','MP','PW','AS','CK','PF','NU','PN','WS','TK','TO','TV','WF'] // Oceania
		this.countryCodes.c_134=['OM'] // Oman
		this.countryCodes.c_39=['AT'] // Österreich
		this.countryCodes.c_71=['PK'] // Pakistan
		this.countryCodes.c_96=['PA'] // Panamá
		this.countryCodes.c_148=['PS'] // Palestinian Territory, Occupied
		this.countryCodes.c_72=['PY'] // Paraguay
		this.countryCodes.c_23=['PE'] // Perú
		this.countryCodes.c_55=['PH'] // Philippines
		this.countryCodes.c_24=['PL'] // Polska
		this.countryCodes.c_25=['PT'] // Portugal
		this.countryCodes.c_31=['TH'] // Prathet Thai
		this.countryCodes.c_141=['QA'] // Qatar
		this.countryCodes.c_88=['DO'] // Rep. Dom.
		this.countryCodes.c_37=['RO'] // România
		this.countryCodes.c_35=['RU'] // Rossiya
		this.countryCodes.c_104=['GE'] // Sakartvelo
		this.countryCodes.c_79=['SA'] // Saudi Arabia
		this.countryCodes.c_46=['CH'] // Schweiz
		this.countryCodes.c_26=['GB-SCT'] // Scotland
		this.countryCodes.c_121=['SN'] // Sénégal
		this.countryCodes.c_98=['AL'] // Shqiperia
		this.countryCodes.c_47=['SG'] // Singapore
		this.countryCodes.c_64=['SI'] // Slovenija
		this.countryCodes.c_67=['SK'] // Slovensko
		this.countryCodes.c_27=['ZA'] // South Africa
		this.countryCodes.c_57=['RS'] // Srbija
		this.countryCodes.c_12=['FI','AX'] // Suomi
		this.countryCodes.c_113=['SR'] // Suriname
		this.countryCodes.c_140=['SY'] // Suriyah
		this.countryCodes.c_1=['SE'] // Sverige
		this.countryCodes.c_142=['TZ'] // Tanzania
		this.countryCodes.c_80=['TN'] // Tounes
		this.countryCodes.c_110=['TT'] // Trinidad/T.
		this.countryCodes.c_32=['TR'] // Türkiye
		this.countryCodes.c_83=['AE'] // U.A.E.
		this.countryCodes.c_143=['UG'] // Uganda
		this.countryCodes.c_68=['UA'] // Ukraina
		this.countryCodes.c_28=['UY'] // Uruguay
		this.countryCodes.c_8=['US','AS','GU','MP','PR','UM','VI'] // USA
		this.countryCodes.c_145=['UZ'] // Uzbekistan
		this.countryCodes.c_29=['VE'] // Venezuela
		this.countryCodes.c_70='VN' // Vietnam
	},

	getMapHtml: function(urlAfrica, urlAsia, urlEurope, urlMEast, urlSAmerica, urlWorld, anchorId){
		var href = '#';
		//Get locale name of the continents - Stephan57
		const Africa = Foxtrickl10n.getString("foxtrick.FlagCollectionToMap.Africa");
		const Asia = Foxtrickl10n.getString("foxtrick.FlagCollectionToMap.Asia");
		const Europe = Foxtrickl10n.getString("foxtrick.FlagCollectionToMap.Europe");
		const MEast = Foxtrickl10n.getString("foxtrick.FlagCollectionToMap.MEast");
		const SAmerica = Foxtrickl10n.getString("foxtrick.FlagCollectionToMap.SAmerica");
		const World = Foxtrickl10n.getString("foxtrick.FlagCollectionToMap.World");

		var mapHtml = '<a href="'+href+'" onclick="document.getElementById(\'foxtrick-img-map-'+anchorId+'\').src=\''+urlAfrica +'\';return false;">'+ Africa + '</a> |  ';
		mapHtml += '<a href="'+href+'" onclick="document.getElementById(\'foxtrick-img-map-'+anchorId+'\').src=\''+urlAsia  +'\';return false;">' + Asia + '</a> |  ';
		mapHtml += '<a href="'+href+'" onclick="document.getElementById(\'foxtrick-img-map-'+anchorId+'\').src=\''+urlEurope +'\';return false;">' + Europe + '</a> |  ';
		mapHtml += '<a href="'+href+'" onclick="document.getElementById(\'foxtrick-img-map-'+anchorId+'\').src=\''+urlMEast +'\';return false;">' + MEast + '</a>  | ';
		mapHtml += '<a href="'+href+'" onclick="document.getElementById(\'foxtrick-img-map-'+anchorId+'\').src=\''+urlSAmerica +'\';return false;">' + SAmerica + '</a> |  ';
		mapHtml += '<a href="'+href+'" onclick="document.getElementById(\'foxtrick-img-map-'+anchorId+'\').src=\''+urlWorld +'\';return false;">' + World + '</a><br/>';
		mapHtml += '<img alt="Map" id="foxtrick-img-map-'+anchorId+'" src="' + urlWorld + '"/>';
		return mapHtml;
	},

	/**
	 * Build the url for the map image
	 * Example: http://chart.apis.google.com/chart?cht=t&chs=440x220&chco=ffffff,339933,339933&chd=s:AAAAAA&chld=USCAAUFINODK&chtm=world&chf=bg,s,EAF7FE
	 */
	//* @param: title, ISO 3166-2 countrycodes, gradient codes (0-100), lang-long box, x*y 
	getMapUrl : function(title, countryCodes, colorOrder, areaParam, size) {
		var base = 'http://chart.apis.google.com/chart';
		var chartType = '?cht=map:fixed='+areaParam;
		var dimensions = '&chs='+size;

		var colors = '&chco=CCCCCC,849D84,FCF6DF';  // non-ht,flag,noflag,
		var order = '&chd=t:' + colorOrder;
		var countries = '&chld=' + countryCodes;
		var title = '&chtt='+title;
		var background = '&chf=bg,s,c6eff7'; // bg water color

		var url = base + chartType + dimensions + title + colors + background  + order + countries;
		url=url.replace(',&','&');
		return url;
	},
};
Foxtrick.util.module.register(FoxtrickFlagCollectionToMap);
