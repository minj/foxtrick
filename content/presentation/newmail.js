/**
 * newmail.js
 * Script which makes the new mails more visible
 * @author htbaumanns
 */

var FoxtrickNewMail = {
	
    MODULE_NAME : "NewMail",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	DEFAULT_ENABLED : true,
	CSS:  "",
	OPTIONS : new Array("CustomColor","HighlightNewMailIcon"),
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("red",""),        
	OPTION_TEXTS_DISABLED_LIST : new Array(false,true),
	NewMailColor:"red",
	
    init : function() {
	if (Foxtrick.isModuleFeatureEnabled( this, "CustomColor")) {
			var color = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "CustomColor_text"); 
			if (color) 	FoxtrickNewMail.NewMailColor=color;
	}
	var HighlightNewMailIconCss="img.scNewMail {background: url('chrome://foxtrick/content/resources/linkicons/new_mail.png') !important;}";
	
	if (!Foxtrick.isModuleFeatureEnabled( this, "HighlightNewMailIcon")) HighlightNewMailIconCss="";
	
	var zaw = '@-moz-document domain(hattrick.org), domain(hattrick.interia.pl), domain(hattrick.ws) {'+
		'div.subMenuBox>div.boxBody>ul>li>span,'+
		'div#folders.sidebarBox>div.boxBody>p>span,'+
		'div#folders.sidebarBox>p>span,'+
		'div#header>div#menu>a>span,'+
		'div#ctl00_pnlSubMenu.subMenu>div.subMenuBox>ul>li>span'+
		'{'+
		'color:'+FoxtrickNewMail.NewMailColor +'!important;'+
		'font-weight:bold !important;'+
		'}'+
		HighlightNewMailIconCss +		
		'}';
		
	this.CSS=FoxtrickGetDataURIText(zaw);
    },

    run : function( page, doc ) {				
 	},
	
	change : function( page, doc ) {	
	}
};