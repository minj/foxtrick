// script which converting a currency on the all hattrick pages
// Note dev: only if currency in TD tag and in div[id=page]
// author by smates

FoxtrickCurrencyConverter = {

    MODULE_NAME : "CurrencyConverter",
    MODULE_CATEGORY : Foxtrick.moduleCategories.MAIN,
	PAGES : new Array('all_late'),
	NEW_AFTER_VERSION : "0.5.1.2",
	LATEST_CHANGE : "Conversion rates fixed",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

    run : function(page, doc) {
	if ( doc.location.href.search(/Forum/i) != -1 ) return;
    //if ( doc.location.href.search(/Forum/i) != -1 || doc.location.href.search(/\/Club\/ClassicYouth\/Default\.aspx/i) != -1 ) return;

    /*CURRENCY TYPE AND RATE*/

	var oldCurrencySymbol = FoxtrickPrefs.getString("oldCurrencySymbol");//currencysymbol which in the your country
	var oldSymbolLength = oldCurrencySymbol.length;
	var currencySymbol = FoxtrickPrefs.getString("currencySymbol");//
	var currencyRate = FoxtrickPrefs.getString("currencyRate"); // this is value of tag CODE from htcurrency.xml
	var currencyRateNewCurr = FoxtrickPrefs.getString("currencyRateTo");
	var myReg = new RegExp('(-\\d+|\\d+)'+oldCurrencySymbol);
	var myDelReg = new RegExp('(-\\d+|\\d+)'+oldCurrencySymbol+'|<.+>');


    // near all currencies are im tables
   	this.drawNewCurrency(doc, 'td',  oldCurrencySymbol, oldSymbolLength, currencySymbol,currencyRate, currencyRateNewCurr, myReg, myDelReg);
	// some might be in alert boxes which use <p>
    this.drawNewCurrency(doc, 'p',  oldCurrencySymbol, oldSymbolLength, currencySymbol,currencyRate, currencyRateNewCurr, myReg, myDelReg);
    },

	change : function( page, doc ) {
		this.run(page, doc);
	},


	drawNewCurrency : function (doc, tagname, oldCurrencySymbol, oldSymbolLength, currencySymbol, currencyRate, currencyRateNewCurr, myReg, myDelReg) {
	try {
		var div = doc.getElementById( 'page' );
		var table_elm = div.getElementsByTagName( tagname );
   		for ( var i = 0; i < table_elm.length; i++) {
			if (table_elm[i].getElementsByTagName('td').length!=0) continue;  // don't do nested. only most inner gets converted
			else if (table_elm[i].getElementsByTagName('p').length!=0) continue;  // don't do nested. only most inner gets converted

            var pos = table_elm[i].innerHTML.search(oldCurrencySymbol);
			if (pos > 0 && (table_elm[i].id != "foxtrick-currency-converter" || table_elm[i].innerHTML.search(currencySymbol)==-1) ){
				var table_inner = Foxtrick.trim(table_elm[i].innerHTML);
				var inner_raw = table_elm[i].innerHTML;
				var bdo_br='';
				if (doc.location.href.search(/Club\/Finances\//)!=-1) bdo_br='<br>';
				if (inner_raw.search(/bdo dir="ltr"/)!=-1) {
					//bdo_br='<br>';
				//	var style = 'style="direction:ltr !important;';
					//if (table_elm[i].getElementsByTagName('bdo')[0].className == 'red') style += ' color:#aa0000 !important;';
					inner_raw = table_elm[i].innerHTML.replace(/<bdo dir="ltr">/,'').replace(/<\/bdo>/,'') ;
					}
				var res="";
				var only_one_number = false;
				var first = true;
				while (pos!=-1) { pos+=oldSymbolLength;
					var table_inner_stripped = inner_raw.replace(/\s|\&nbsp\;/g,'');
					if (first==true && table_inner_stripped.replace(myDelReg,'')=='') only_one_number=true; // remove html tags and currency to check if this is the only real entry.
					try {
						var val=table_inner_stripped.match(myReg)[1];
					}
					catch (e){return;} // catching currency symbol of tranfer bid
					var conv = Foxtrick.formatNumber(Math.floor(val * currencyRate / currencyRateNewCurr),'&nbsp;');
					conv = conv.replace(/\-\&nbsp\;/,'-');

					// add a <br> if there is only one entry
					var br='';
					if (only_one_number==true) br='<br>';
					// add a space at the end if the next symbol is not ')'
					var space=' ';
					var next_char=inner_raw.charAt(pos);
					if (next_char==')' || next_char=='/' || next_char=='.' || next_char==',') space='';
					if (inner_raw.charAt(pos)=='<') {
						next_char=inner_raw.substr(pos).replace(myDelReg,'').charAt(0);
						if (next_char==')' || next_char=='/' || next_char=='.' || next_char==',') space='';
					}
					// std color green. but use color of span if there is one.
					var color='#377f31';
					if (table_elm[i].getElementsByTagName('span')[0] && table_elm[i].getElementsByTagName('span')[0].style) {
						color = table_elm[i].getElementsByTagName('span')[0].style.color;
					}
					if (conv.charAt(0)=='-') color='#aa0000';   // neg number red
					if (val==0)  color="black";					// zero black

					// add left part plus converted
					res+=inner_raw.substr(0,pos)+' '+br+'<span class="smallText" style="direction:ltr !important; font-weight: normal; color:'+color+';white-space: nowrap;">('+conv+'&nbsp;'+currencySymbol+')</span>'+space+bdo_br;

					// get the remains and check them in next loop
					inner_raw = inner_raw.substring(pos);
					pos= inner_raw.search(oldCurrencySymbol);
					first=false;	bdo_br='';
				}

				table_elm[i].innerHTML = res + inner_raw;
				table_elm[i].id="foxtrick-currency-converter";
			}
		}
    }
    catch(e) {Foxtrick.dumpError(e);}
    }
};
