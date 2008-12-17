/**
 * Visited countries map  
 * @author seben
 */
 
FoxtrickFlagCollectionToMap = {
	
    MODULE_NAME : "FlagCollectionToMap",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : true,

    init : function() {
        Foxtrick.registerPageHandler('flagCollection', this);
        this.setupCountryCodes();
    },

    run : function(page, document) {
        
        var path = "//div[@class='mainBox']";
        var result = document.evaluate(path, document.documentElement, null,
                                       Components.interfaces.nsIDOMXPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        
        var mapId = 0;
        for (var i=0; i< result.snapshotLength; i++) {
            var divElement = result.snapshotItem(i);
        
            var countryIds = new Array();
            
            for(var j = 0; j < divElement.childNodes.length; j++){
                var currentNode = divElement.childNodes[j];
                if (currentNode.nodeName == 'A' && currentNode.href.indexOf('LeagueID=') > -1) {
                    if (currentNode.innerHTML.indexOf('inactive') == -1) {
                        var countryId = currentNode.href.substr(currentNode.href.lastIndexOf('=')+1, currentNode.href.length);
                        countryIds.push(countryId);
                    }
                } else if (currentNode.nodeName == 'P') {
                    // not a flag, flush the buffer 
                    this.createAndInsertMap(document, countryIds, mapId++, divElement, currentNode);
                    countryIds = new Array();
                }
            }
            this.createAndInsertMap(document, countryIds, mapId++, divElement, null);
        }

    },
    
    insertBeforeOrAppend : function(parent, what, beforeWhat) {
        if (beforeWhat == null) {
            parent.appendChild(what);
        } else {
            parent.insertBefore(what, beforeWhat);
        }
    },
    
    createAndInsertMap : function(document, countryIds, mapId, parent, insertBefore) {
    
        if (countryIds.length == 0) return;
    
        var countryCodes = this.getCountryCodes(countryIds);
        var colouringOrder = this.getOrder(countryCodes);
        
        // get all required urls
        var urlAfrica = this.getMapUrl('africa', countryCodes, colouringOrder);
        var urlAsia = this.getMapUrl('asia', countryCodes, colouringOrder);
        var urlEurope = this.getMapUrl('europe', countryCodes, colouringOrder);
        var urlMEast = this.getMapUrl('middle_east', countryCodes, colouringOrder);
        var urlSAmerica = this.getMapUrl('south_america', countryCodes, colouringOrder);
        var urlWorld = this.getMapUrl('world', countryCodes, colouringOrder);
    
        var mapDiv = document.createElement("div");
        mapDiv.id = 'foxtrick-map' + mapId;
        mapDiv.style.padding = '5 0 5 0';
        mapDiv.style.display = 'none';
        mapDiv.style.width = '355px';
    
        var openMapA = document.createElement('A');
        openMapA.appendChild(document.createTextNode("Show map"));
        openMapA.name = 'flags' + mapId;
        openMapA.href = '#';
        openMapA.id = 'flagsA' + mapId;
        openMapA.setAttribute('onClick', 'if(document.getElementById(\'foxtrick-map' + mapId + '\').style.display == \'none\'){document.getElementById(\'foxtrick-map' + mapId + '\').style.display = \'block\'; document.getElementById(\'flagsA' + mapId +'\').innerHTML = \'Hide map\'; }else {document.getElementById(\'foxtrick-map' + mapId +'\').style.display = \'none\';document.getElementById(\'flagsA' + mapId +'\').innerHTML = \'Show map\';}; return false');

        this.insertBeforeOrAppend(parent, mapDiv, insertBefore);
        this.insertBeforeOrAppend(parent, document.createElement('br'), insertBefore);
        this.insertBeforeOrAppend(parent, openMapA, insertBefore);
        
        document.getElementById('foxtrick-map'+mapId).innerHTML = this.getMapHtml(urlAfrica, urlAsia, urlEurope, urlMEast, urlSAmerica, urlWorld, mapId);
    },
    
    setupCountryCodes : function() {
        //test: http://www87.hattrick.org/Common/Team/FlagCollection.aspx?teamId=258161
        // country codes. see  http://code.google.com/apis/chart/#iso_codes
        this.countryCodes = {};
    
        this.countryCodes.c_128='IQ' // Al Iraq
        this.countryCodes.c_118='DZ' // Al Jazair
        this.countryCodes.c_127='KW' // Al Kuwayt
    
        this.countryCodes.c_77='MA' // Al Maghrib
        this.countryCodes.c_106='JO' // Al Urdun
        this.countryCodes.c_133='YE' // Al Yaman
        this.countryCodes.c_105='AD' // Andorra
        this.countryCodes.c_130='AO' // Angola
        this.countryCodes.c_7='AR' // Argentina
    
        this.countryCodes.c_129='AZ' // Az?rbaycan
        this.countryCodes.c_123='BH' // Bahrain
        this.countryCodes.c_132='BD' // Bangladesh
        this.countryCodes.c_124='BB' // Barbados
        this.countryCodes.c_91='BY' // Belarus
        this.countryCodes.c_44='BE' // België
    
        this.countryCodes.c_139='BJ' // Benin
        this.countryCodes.c_74='BO' // Bolivia
        this.countryCodes.c_69='BA' // Bosna i Herc
        this.countryCodes.c_16='BR' // Brasil
        this.countryCodes.c_136='BN' // Brunei
        this.countryCodes.c_62='BG' // Bulgaria
    
        this.countryCodes.c_126='CI' // C. d'Ivoire
        this.countryCodes.c_125='CV' // Cabo Verde
        this.countryCodes.c_17='CA' // Canada
        this.countryCodes.c_52='CZ' // Česká rep.
        this.countryCodes.c_18='CL' // Chile
        this.countryCodes.c_60='TW' // Chin. Taipei
    
        this.countryCodes.c_34='CN' // China
        this.countryCodes.c_19='CO' // Colombia
        this.countryCodes.c_81='CR' // Costa Rica
        this.countryCodes.c_131='ME' // Crna Gora
    
        // NOT FOUND, PART OF UK
        this.countryCodes.c_61='' // Cymru
    
        this.countryCodes.c_89='CY' // Cyprus
    
        this.countryCodes.c_11='DK' // Danmark
        this.countryCodes.c_3='DE' // Deutschland
        this.countryCodes.c_73='EC' // Ecuador
        this.countryCodes.c_56='EE' // Eesti
        this.countryCodes.c_100='SV' // El Salvador
    
        // NOT FOUND, PART OF UK
        this.countryCodes.c_2='' // England
         
        this.countryCodes.c_36='ES' // Espana
        this.countryCodes.c_76='FO' // Foroyar
        this.countryCodes.c_5='FR' // France
        this.countryCodes.c_137='GH' // Ghana
        this.countryCodes.c_107='GT' // Guatemala
        this.countryCodes.c_30='KR' // Hanguk
    
        this.countryCodes.c_122='AM' // Hayastan
        this.countryCodes.c_50='GR' // Hellas
        this.countryCodes.c_99='HN' // Honduras
        this.countryCodes.c_59='HK' // Hong Kong
        this.countryCodes.c_58='HR' // Hrvatska
        this.countryCodes.c_20='IN' // India
    
        this.countryCodes.c_54='ID' // Indonesia
        this.countryCodes.c_85='IR' // Iran
        this.countryCodes.c_21='IE' // Ireland
        this.countryCodes.c_38='IS' // Ísland
        this.countryCodes.c_63='IL' // Israel
        this.countryCodes.c_4='IT' // Italia
    
        this.countryCodes.c_94='JM' // Jamaica
        this.countryCodes.c_138='KH' // Kampuchea
        this.countryCodes.c_112='KZ' // Kazakhstan
        this.countryCodes.c_95='KE' // Kenya
        this.countryCodes.c_102='KG' // Kyrgyzstan
        this.countryCodes.c_53='LV' // Latvija
    
        this.countryCodes.c_84='LU' // Lëtzebuerg
        this.countryCodes.c_117='LI' // Liechtenst.
        this.countryCodes.c_66='LT' // Lietuva
        this.countryCodes.c_120='LB' // Lubnan
        this.countryCodes.c_51='HU' // Magyarország
        this.countryCodes.c_97='MK' // Makedonija
    
        this.countryCodes.c_45='MY' // Malaysia
        this.countryCodes.c_144='MV' // Maldives
        this.countryCodes.c_101='MT' // Malta
        this.countryCodes.c_6='MX' // México
        this.countryCodes.c_33='EG' // Misr
        this.countryCodes.c_135='MZ' // Moçambique
    
        this.countryCodes.c_103='MD' // Moldova
        this.countryCodes.c_119='MN' // Mongol Uls
    
        // NOT FOUND PART OF UK
        this.countryCodes.c_93='' // N. Ireland
    
        this.countryCodes.c_14='NL' // Nederland
        this.countryCodes.c_111='NI' // Nicaragua
        this.countryCodes.c_75='NG' // Nigeria
    
        this.countryCodes.c_22='JP' // Nippon
        this.countryCodes.c_9='NO' // Norge
    
        // OCEANIA, SEVERAL (exclude Indonesia because it exists as a country)
        this.countryCodes.c_15='AUNZCXCCNFFJNCPGSBVUFMGUKIMHNRMPPWASCKPFNUPNWSTKTOTVWF' // Oceania
    
        this.countryCodes.c_134='OM' // Oman
        this.countryCodes.c_39='AT' // Österreich
        this.countryCodes.c_71='PK' // Pakistan
    
        this.countryCodes.c_96='PA' // Panamá
        this.countryCodes.c_72='PY' // Paraguay
        this.countryCodes.c_23='PE' // Perú
        this.countryCodes.c_55='PH' // Philippines
        this.countryCodes.c_24='PL' // Polska
        this.countryCodes.c_25='PT' // Portugal
    
        this.countryCodes.c_31='TH' // Prathet Thai
        this.countryCodes.c_141='QA' // Qatar
        this.countryCodes.c_88='DO' // Rep. Dom.
        this.countryCodes.c_37='RO' // România
        this.countryCodes.c_35='RU' // Rossiya
        this.countryCodes.c_104='GE' // Sakartvelo
    
        this.countryCodes.c_79='SA' // Saudi Arabia
        this.countryCodes.c_46='CH' // Schweiz
    
        // NOT FOUND, PART OF UK
        this.countryCodes.c_26='' // Scotland
    
        this.countryCodes.c_121='SN' // Sénégal
        this.countryCodes.c_98='AL' // Shqiperia
        this.countryCodes.c_47='SG' // Singapore
    
        this.countryCodes.c_64='SI' // Slovenija
        this.countryCodes.c_67='SK' // Slovensko
        this.countryCodes.c_27='ZA' // South Africa
        this.countryCodes.c_57='RS' // Srbija
        this.countryCodes.c_12='FI' // Suomi
        this.countryCodes.c_113='SR' // Suriname
    
        this.countryCodes.c_140='SY' // Suriyah
        this.countryCodes.c_1='SE' // Sverige
        this.countryCodes.c_142='TZ' // Tanzania
        this.countryCodes.c_80='TN' // Tounes
        this.countryCodes.c_110='TT' // Trinidad/T.
        this.countryCodes.c_32='TR' // Türkiye
    
        this.countryCodes.c_83='AE' // U.A.E.
        this.countryCodes.c_143='UG' // Uganda
        this.countryCodes.c_68='UA' // Ukraina
        this.countryCodes.c_28='UY' // Uruguay
        this.countryCodes.c_8='US' // USA
        this.countryCodes.c_29='VE' // Venezuela
    
        this.countryCodes.c_70='VN' // Vietnam
    },
    
    getCountryCodes : function(countryIds) {

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
           
            var countryCode = this.countryCodes['c_'+countryId];                
            if (typeof countryCode != 'undefined') {        
                cCodesString += countryCode
            }
        }
        return cCodesString;
    },
    
    getMapHtml: function(urlAfrica, urlAsia, urlEurope, urlMEast, urlSAmerica, urlWorld, anchorId){
        var href = '#';
        
        var mapHtml = '<a href="'+href+'" onclick="document.getElementById(\'foxtrick-img-map-'+anchorId+'\').src=\''+urlAfrica +'\';return false;">Africa</a> |  ';
        mapHtml +=    '<a href="'+href+'" onclick="document.getElementById(\'foxtrick-img-map-'+anchorId+'\').src=\''+urlAsia  +'\';return false;">Asia</a> |  ';
        mapHtml +=    '<a href="'+href+'" onclick="document.getElementById(\'foxtrick-img-map-'+anchorId+'\').src=\''+urlEurope +'\';return false;">Europe</a> |  ';
        mapHtml +=    '<a href="'+href+'" onclick="document.getElementById(\'foxtrick-img-map-'+anchorId+'\').src=\''+urlMEast +'\';return false;">Middle East</a>  | ';
        mapHtml +=    '<a href="'+href+'" onclick="document.getElementById(\'foxtrick-img-map-'+anchorId+'\').src=\''+urlSAmerica +'\';return false;">South America</a> |  ';
        mapHtml +=    '<a href="'+href+'" onclick="document.getElementById(\'foxtrick-img-map-'+anchorId+'\').src=\''+urlWorld +'\';return false;">World</a><br/>';
        mapHtml +=    '<img alt="Map" id="foxtrick-img-map-'+anchorId+'" src="' + urlWorld + '"/>';
        return mapHtml;
    },
    
    /**
     * Build the url for the map image
     * Example: http://chart.apis.google.com/chart?cht=t&chs=440x220&chco=ffffff,339933,339933&chd=s:AAAAAA&chld=USCAAUFINODK&chtm=world&chf=bg,s,EAF7FE
     */
    getMapUrl : function(areaParam, countryCodes, colorOrder) {
        var base = 'http://chart.apis.google.com/chart';
        var chartType = '?cht=t';
        var dimensions = '&chs=355x180';
        var colors = '&chco=ffffff,339933,339933';
        var order = '&chd=s:' + colorOrder;
        var countries = '&chld=' + countryCodes;
        var area = '&chtm=' + areaParam;
        var background = '&chf=bg,s,EAF7FE';

        var url = base + chartType + dimensions + colors + area + background + order  + countries;

        return url;
    },
           
    
    /**
     * The url for google chart api requires a parameter telling the colouring
     * order for the chart. Because all countries are colored with the same color
     * we just return string of 'A's. One A for each country code. A = top priority.
     */
    getOrder : function(countryCodes){
        var orderString = '';

        if(countryCodes == null || countryCodes.length == 0) return '';

        for(var i = 0; i < countryCodes.length / 2; i++){
            orderString += 'A';
        }
        return orderString;
    }

};