/**
 * LastLogin Modifies last login time with HT Dateformat
 * @author spambot
 */

FoxtrickLastLogin = {

    MODULE_NAME : "LastLogin",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('managerPage'), 
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE: "Modifies last login time with HT Dateformat",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	
    init : function() {
    },

    run : function(page, doc) {
    if (doc.getElementById('ctl00_CPMain_upGB') != null) return;
	try {
		var divs = doc.getElementById( "mainBody" ).getElementsByTagName('div');
		var playerinfo; 
		for (var i=0;i<divs.length;++i) {
			if (divs[i].className=='playerInfo') {
				playerinfo=divs[i];
				break;
			}
		}
		var playerinfodivs = playerinfo.getElementsByTagName('div');
		var logindiv = playerinfodivs[playerinfodivs.length-1];
		logindiv=playerinfo.removeChild(logindiv);
		playerinfo.parentNode.insertBefore(logindiv,playerinfo.nextSibling );
		
		//var logindiv = doc.getElementById( "ctl00_CPMain_pnlLogins");
		//logindiv.addEventListener("DOMSubtreeModified", FoxtrickLastLogin.loginchange, true ) ;  */        			
	} catch(e) {Foxtrick.dump('lastlogin run '+e+'\n');}
    },

	change : function( page, doc ) { 
    if (doc.getElementById('ctl00_CPMain_upGB') != null) return;
        var div = doc.getElementById( "ft_lastlogin" );
        if (div != null) return;
		FoxtrickLastLogin._Show(doc);
	},

	loginchange : function( ev ) {
		var doc = ev.target.ownerDocument;
        var div = doc.getElementById( "ft_lastlogin" );
        if (div != null) return;
		FoxtrickLastLogin._Show(doc);
	},

    _Show : function(doc){ 
		var div = doc.getElementById( "ft_lastlogin" );
        if (div == null) 
        try {
			var httime = doc.getElementById( "time" ).innerHTML;
            var HT_date = Foxtrick.getDateFromText( httime );
            
            if (!Foxtrick.HT_date) return;
            var div = doc.getElementById( "pnlLogin" );
			if (!div) return;
			//div.parentNode.removeEventListener("DOMSubtreeModified", FoxtrickLastLogin.loginchange, true ) ;          
			
			var avatarstyle='margin-left:-10px'
			/*var hasavatar=false;
			var divs=doc.getElementById('mainBody').getElementsByTagName('div');
			for (var i=0;i< divs.length;++i) 
				if (divs[i].className=='faceCard') {hasavatar=true;break;}
			if (hasavatar) avatarstyle='margin-top:60px; margin-left:-125px';
			*/
			var simple_style='';
			if (!Foxtrick.isStandardLayout(doc)) {
				simple_style='';
				div.setAttribute('style',"padding: 7px 3px !important;"+avatarstyle); 
			}
			else {div.setAttribute('style',"padding: 7px 3px !important;"+avatarstyle);}
			
            var login_elm = div.innerHTML.split('<br>');
            var newInner= '<div id="ft_lastlogin">';
            for (var i=0; i<login_elm.length;i++){
                login_elm[i] = Foxtrick.trim(login_elm[i]);
                var last = '';
                if (login_elm[i].search(/\*\*\*\.\*\*\*/) != -1) {
                    var ST_date = Foxtrick.getDateFromText( login_elm[i] );
					
				//	Foxtrick.dump(login_elm[i]+'\n'+ST_date+'\n');
                    var _s = Math.floor( (HT_date.getTime() - ST_date.getTime()) / 1000); //Sec
                    var DiffText = TimeDifferenceToText (_s);
                    if (DiffText.search("NaN") == -1)
                        last +=  simple_style+'<span class="date smallText" id="ft_deadline" style="padding-right:0px;important!; margin-left:10px; color:#800000">(' + DiffText + ')</span>';
                    else Foxtrick.dump('  Could not create timediff (NaN)\n');
                }
                newInner += login_elm[i] + last + '<br>\n';
            }
            newInner += '</div>';
			div.innerHTML = newInner;
			//div.parentNode.addEventListener("DOMSubtreeModified", FoxtrickLastLogin.loginchange, true ) ;          
			
        } catch (e) {
            Foxtrick.dump('FoxtrickLastLogin '+e+'\n');
        }
    }
};