function foxtrick_visitedCountriesMap(document){
	
	if (!getShowTweak("mapOfVisitedCountries")) return;
	if (!isFlagsUrl(document.location.href)) return;
	
	// country codes. see  http://code.google.com/apis/chart/#iso_codes
	var countryCodes = new Object();

	countryCodes.c_128='IQ' // Al Iraq 
	countryCodes.c_118='DZ' // Al Jazair 
	countryCodes.c_127='KW' // Al Kuwayt 

	countryCodes.c_77='MA' // Al Maghrib 
	countryCodes.c_106='JO' // Al Urdun 
	countryCodes.c_133='YE' // Al Yaman 
	countryCodes.c_105='AD' // Andorra 
	countryCodes.c_130='AO' // Angola 
	countryCodes.c_7='AR' // Argentina 

	countryCodes.c_129='AZ' // Azərbaycan 
	countryCodes.c_123='BH' // Bahrain 
	countryCodes.c_132='BD' // Bangladesh 
	countryCodes.c_124='BB' // Barbados 
	countryCodes.c_91='BY' // Belarus 
	countryCodes.c_44='BE' // België 

	countryCodes.c_139='BJ' // Benin 
	countryCodes.c_74='BO' // Bolivia 
	countryCodes.c_69='BA' // Bosna i Herc 
	countryCodes.c_16='BR' // Brasil 
	countryCodes.c_136='BN' // Brunei 
	countryCodes.c_62='BG' // Bulgaria 

	countryCodes.c_126='CI' // C. d’Ivoire 
	countryCodes.c_125='CV' // Cabo Verde 
	countryCodes.c_17='CA' // Canada 
	countryCodes.c_52='CZ' // Česká rep. 
	countryCodes.c_18='CL' // Chile 
	countryCodes.c_60='TW' // Chin. Taipei 

	countryCodes.c_34='CN' // China 
	countryCodes.c_19='CO' // Colombia 
	countryCodes.c_81='CR' // Costa Rica 
	countryCodes.c_131='ME' // Crna Gora 

	// NOT FOUND, PART OF 
	countryCodes.c_61='' // Cymru 

	countryCodes.c_89='CY' // Cyprus 

	countryCodes.c_11='DK' // Danmark 
	countryCodes.c_3='DE' // Deutschland 
	countryCodes.c_73='EC' // Ecuador 
	countryCodes.c_56='EE' // Eesti 
	countryCodes.c_100='SV' // El Salvador 

	// NOT FOUND, PART OF UK
	countryCodes.c_2='' // England 
	 
	countryCodes.c_36='ES' // España 
	countryCodes.c_76='FO' // Føroyar 
	countryCodes.c_5='FR' // France 
	countryCodes.c_137='GH' // Ghana 
	countryCodes.c_107='GT' // Guatemala 
	countryCodes.c_30='KR' // Hanguk 

	countryCodes.c_122='AM' // Hayastan 
	countryCodes.c_50='GR' // Hellas 
	countryCodes.c_99='HN' // Honduras 
	countryCodes.c_59='HK' // Hong Kong 
	countryCodes.c_58='HR' // Hrvatska 
	countryCodes.c_20='IN' // India 

	countryCodes.c_54='ID' // Indonesia 
	countryCodes.c_85='IR' // Iran 
	countryCodes.c_21='IE' // Ireland 
	countryCodes.c_38='IS' // Ísland 
	countryCodes.c_63='IL' // Israel 
	countryCodes.c_4='IT' // Italia 

	countryCodes.c_94='JM' // Jamaica 
	countryCodes.c_138='KH' // Kampuchea 
	countryCodes.c_112='KZ' // Kazakhstan 
	countryCodes.c_95='KE' // Kenya 
	countryCodes.c_102='KG' // Kyrgyzstan 
	countryCodes.c_53='LV' // Latvija 

	countryCodes.c_84='LU' // Lëtzebuerg 
	countryCodes.c_117='LI' // Liechtenst. 
	countryCodes.c_66='LT' // Lietuva 
	countryCodes.c_120='LB' // Lubnan 
	countryCodes.c_51='HU' // Magyarország 
	countryCodes.c_97='MK' // Makedonija 

	countryCodes.c_45='MY' // Malaysia 
	countryCodes.c_144='MV' // Maldives 
	countryCodes.c_101='MT' // Malta 
	countryCodes.c_6='MX' // México 
	countryCodes.c_33='EG' // Misr 
	countryCodes.c_135='MZ' // Moçambique 

	countryCodes.c_103='MD' // Moldova 
	countryCodes.c_119='MN' // Mongol Uls 

	// NOT FOUND PART OF UK
	countryCodes.c_93='' // N. Ireland 

	countryCodes.c_14='NL' // Nederland 
	countryCodes.c_111='NI' // Nicaragua 
	countryCodes.c_75='NG' // Nigeria 

	countryCodes.c_22='JP' // Nippon 
	countryCodes.c_9='NO' // Norge 

	// OCEANIA, SEVERAL (exclude Indonesia because it exists as a country)
	countryCodes.c_15='AUNZCXCCNFFJNCPGSBVUFMGUKIMHNRMPPWASCKPFNUPNWSTKTOTVWF' // Oceania 

	countryCodes.c_134='OM' // Oman 
	countryCodes.c_39='AT' // Österreich 
	countryCodes.c_71='PK' // Pakistan 

	countryCodes.c_96='PA' // Panamá 
	countryCodes.c_72='PY' // Paraguay 
	countryCodes.c_23='PE' // Perú 
	countryCodes.c_55='PH' // Philippines 
	countryCodes.c_24='PL' // Polska 
	countryCodes.c_25='PT' // Portugal 

	countryCodes.c_31='TH' // Prathet Thai 
	countryCodes.c_141='QA' // Qatar 
	countryCodes.c_88='DO' // Rep. Dom. 
	countryCodes.c_37='RO' // România 
	countryCodes.c_35='RU' // Rossiya 
	countryCodes.c_104='GE' // Sakartvelo 

	countryCodes.c_79='SA' // Saudi Arabia 
	countryCodes.c_46='CH' // Schweiz 

	// NOT FOUND, PART OF UK
	countryCodes.c_26='' // Scotland 

	countryCodes.c_121='SN' // Sénégal 
	countryCodes.c_98='AL' // Shqiperia 
	countryCodes.c_47='SG' // Singapore 

	countryCodes.c_64='SI' // Slovenija 
	countryCodes.c_67='SK' // Slovensko 
	countryCodes.c_27='ZA' // South Africa 
	countryCodes.c_57='RS' // Srbija 
	countryCodes.c_12='FI' // Suomi 
	countryCodes.c_113='SR' // Suriname 

	countryCodes.c_140='SY' // Suriyah 
	countryCodes.c_1='SE' // Sverige 
	countryCodes.c_142='TZ' // Tanzania 
	countryCodes.c_80='TN' // Tounes 
	countryCodes.c_110='TT' // Trinidad/T. 
	countryCodes.c_32='TR' // Türkiye 

	countryCodes.c_83='AE' // U.A.E. 
	countryCodes.c_143='UG' // Uganda 
	countryCodes.c_68='UA' // Ukraina 
	countryCodes.c_28='UY' // Uruguay 
	countryCodes.c_8='US' // USA 
	countryCodes.c_29='VE' // Venezuela 

	countryCodes.c_70='VN' // Vietnam 
	
	/**
	 * Extracts the country ids from the html and puts div element for the map to the correct place.
	 */
	function getVisitedCountryIds(document){
		var visitedCountryIds = new Array(4);

		// the ids are are in the first td of the second table
		var table = document.getElementsByTagName('table')[1];
		var td = table.getElementsByTagName('td')[0];

		// visited ids are between first two brs and second two brs
		var previousNode;
		var placeFound = false;
		var numCountryIds = 0;
		
		for(var i = 0; i < td.childNodes.length; i++){
			var currentNode = td.childNodes[i];
			
				
			if(i > 3 && placeFound == false && currentNode.nodeName == 'BR' &&  td.childNodes[i-1].nodeName == 'BR' &&  td.childNodes[i-3].nodeName == 'BR'){
				// found place where visited countries start
				placeFound = true;
			} else if(i > 3 && placeFound == true && currentNode.nodeName == 'BR' &&  td.childNodes[i - 1].nodeName == 'BR'){
				// found the place where visited countries end. Put the map html here.
				var mapDiv = document.createElement("div");
				mapDiv.id = 'foxtrick-map-visited';
				mapDiv.style.padding = '5 0 5 0';
				td.replaceChild(mapDiv, td.childNodes[i-3]);
				break;
			}
			
			
			// old
			/*if(placeFound == false && previousNode != null && currentNode.nodeName == 'BR' && previousNode.nodeName == 'BR'){
				placeFound = true;
			} else if(placeFound == true && previousNode != null && currentNode.nodeName == 'BR' && previousNode.nodeName == 'BR'){
				// found the place where visited countries end. Put the map html here.
				var mapDiv = document.createElement("div");
				mapDiv.id = 'foxtrick-map-visited';
				mapDiv.style.padding = '5 0 5 0';
				td.replaceChild(mapDiv, td.childNodes[i-3]);
				break;
			}*/

			if(placeFound == true && currentNode.nodeName == 'A' && currentNode.href.indexOf('LeagueID=') > -1){
				var countryId = currentNode.href.substr(currentNode.href.lastIndexOf('=')+1, currentNode.href.length);
				visitedCountryIds[numCountryIds] = countryId;
				numCountryIds++;
			}

			//if(currentNode.nodeName != '#text')
				previousNode = currentNode;
		}

		return visitedCountryIds;
	}
	
	
	function getCountryCodes( countryIds ) {

	// uk is divided to 4 parts in hattrick but google charts only support uk as a whole
	// solution: only if user has visited all parts of uk we paint uk on the map.
	// 61 cymru, 2   england, 93  n ireland, 26  scotland
	var ukIds = 0;
	
	var cCodesString = '';
		for(var i = 0; i < countryIds.length; i++){
			var countryId = countryIds[i];
			
			// uk hack
			if(countryId == 61 || countryId == 2 || countryId == 93 || countryId == 26){
				ukIds++;
				
				if(ukIds == 4) {
					cCodesString += 'GB';
				}
			}
			
			var countryCode = countryCodes['c_'+countryId]; 		
			if( typeof countryCode != 'undefined'){		
				cCodesString += countryCode
			}
			
			
		}
	return cCodesString;
	}
	
	function getMapHtml(urlAfrica, urlAsia, urlEurope, urlMEast, urlSAmerica, urlWorld){
		var mapHtml =  '<a href="#" onclick="document.getElementById(\'foxtrick-img-map-visited\').src=\''+urlAfrica +'\'">Africa</a> |  ';
		mapHtml += 	  '<a href="#" onclick="document.getElementById(\'foxtrick-img-map-visited\').src=\''+urlAsia  +'\'">Asia</a> |  '; 
		mapHtml += 	  '<a href="#" onclick="document.getElementById(\'foxtrick-img-map-visited\').src=\''+urlEurope +'\'">Europe</a> |  ';
		mapHtml +=	  '<a href="#" onclick="document.getElementById(\'foxtrick-img-map-visited\').src=\''+urlMEast +'\'">Middle East</a>  | ';
		mapHtml += 	  '<a href="#" onclick="document.getElementById(\'foxtrick-img-map-visited\').src=\''+urlSAmerica +'\'">South America</a> |  ';
		mapHtml += 	  '<a href="#" onclick="document.getElementById(\'foxtrick-img-map-visited\').src=\''+urlWorld +'\'">World</a><br/>';
		mapHtml +=      '<img alt="Map" id="foxtrick-img-map-visited" src="' + urlWorld + '"/>';
		return mapHtml;
	}

	/**
	 * Build the url for the map image
	 * Example: http://chart.apis.google.com/chart?cht=t&chs=440x220&chco=ffffff,339933,339933&chd=s:AAAAAA&chld=USCAAUFINODK&chtm=world&chf=bg,s,EAF7FE
	 */
	function getMapUrl(areaParam, countryCodes, colorOrder){
		//alert('getMapUrl');
		var base = 'http://chart.apis.google.com/chart';
		var chartType = '?cht=t';
		var dimensions = '&chs=350x175';
		var colors = '&chco=ffffff,339933,339933';
		var order = '&chd=s:' + colorOrder;
		var countries = '&chld=' + countryCodes;
		var area = '&chtm=' + areaParam;
		var background = '&chf=bg,s,EAF7FE';

		var url = base + chartType + dimensions + colors + area + background + order  + countries;

		return url;
	}
	

	/**
	 * The url for google chart api requires a parameter telling the colouring
	 * order for the chart. Because all countries are colored with the same color
	 * we just return string of 'A's. One A for each country code. A = top priority.
	 */
	function getOrder(countryCodes){
		//alert('getOrder');
		var orderString = '';

		if(countryCodes == null || countryCodes.length == 0)
			return '';

			for(var i = 0; i < countryCodes.length / 2; i++){		
				orderString += 'A';
			}

		return orderString;
	}
	
	var countryIds = getVisitedCountryIds(document);
	var countryCodes = getCountryCodes(countryIds);
	var colouringOrder = getOrder(countryCodes);
	
	// get all required urls
	var urlAfrica = getMapUrl('africa', countryCodes, colouringOrder);
	var urlAsia = getMapUrl('asia', countryCodes, colouringOrder);
	var urlEurope = getMapUrl('europe', countryCodes, colouringOrder);
	var urlMEast = getMapUrl('middle_east', countryCodes, colouringOrder);
	var urlSAmerica = getMapUrl('south_america', countryCodes, colouringOrder);
	var urlWorld = getMapUrl('world', countryCodes, colouringOrder);
	
	document.getElementById('foxtrick-map-visited').innerHTML = getMapHtml(urlAfrica, urlAsia, urlEurope, urlMEast, urlSAmerica, urlWorld);
}
