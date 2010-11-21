// script which converting a currency on the all hattrick pages
// Note dev: only if currency in TD tag and in div[id=page]
// author by smates

FoxtrickCurrencyConverter = {

    MODULE_NAME : "CurrencyConverter",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('all_late'),
	NEW_AFTER_VERSION : "0.5.1.2",
	LATEST_CHANGE : "Conversion rates fixed",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

	OPTION_FUNC : function(doc) {
		var currencySelect = doc.createElement("select");
		currencySelect.setAttribute("pref", "module.CurrencyConverter.to");
		var currencies = [];
		var htCurrencyXml = doc.implementation.createDocument("", "", null);
		htCurrencyXml.async = false;
		htCurrencyXml.load("chrome://foxtrick/content/htlocales/htcurrency.xml", "text/xml");
		var currencyNodes = htCurrencyXml.getElementsByTagName("currency");
		for (var i = 0; i < currencyNodes.length; ++i) {
			var code = currencyNodes[i].attributes.getNamedItem("code").textContent;
			var desc = currencyNodes[i].attributes.getNamedItem("name").textContent;
			currencies.push({ code: code, desc : desc });
		}
		currencies.sort(function(a, b) { return a.desc.localeCompare(b.desc); });
		const selectedCurrencyTo = FoxtrickPrefs.getString("module.CurrencyConverter.to");
		for (var i in currencies) {
			var item = doc.createElement("option");
			item.value = currencies[i].code;
			item.textContent = currencies[i].desc;
			if (selectedCurrencyTo == item.value)
				item.selected = "selected";
			currencySelect.appendChild(item);
		}
		return currencySelect;
	},

    run : function(page, doc) {
    	// don't run on forum pages
		if (doc.location.href.search(/Forum/i) != -1)
			return;

		var oldSymbol = Foxtrick.util.currency.getSymbol(); //currencysymbol which in the your country
		var oldLength = oldSymbol.length;
		var oldRate = Foxtrick.util.currency.getRate();

		var code = FoxtrickPrefs.getString("module.CurrencyConverter.to");
		var symbol = Foxtrick.util.currency.getSymbolByCode(code);
		var rate = Foxtrick.util.currency.getRateByCode(code);

		var myReg = new RegExp('(-\\d+|\\d+)' + oldSymbol);
		var myDelReg = new RegExp('(-\\d+|\\d+)' + oldSymbol + '|<.+>');

		// near all currencies are im tables
	   	this.drawNewCurrency(doc, 'td', oldSymbol, oldLength, symbol, oldRate, rate, myReg, myDelReg);
		// some might be in alert boxes which use <p>
		this.drawNewCurrency(doc, 'p', oldSymbol, oldLength, symbol, oldRate, rate, myReg, myDelReg);
    },

	change : function( page, doc ) {
		this.run(page, doc);
	},

	drawNewCurrency : function (doc, tagname, oldCurrencySymbol, oldSymbolLength, currencySymbol, currencyRate, currencyRateNewCurr, myReg, myDelReg) {
		var div = doc.getElementById( 'page' );
		var table_elm = div.getElementsByTagName( tagname );
   		for ( var i = 0; i < table_elm.length; i++) {
			if (table_elm[i].getElementsByTagName('td').length!=0) continue;  // don't do nested. only most inner gets converted
			else if (table_elm[i].getElementsByTagName('p').length!=0) continue;  // don't do nested. only most inner gets converted

            var pos = table_elm[i].innerHTML.indexOf(oldCurrencySymbol);
			if (pos > 0 && (!Foxtrick.hasClass(table_elm[i], "foxtrick-currency-converter") || table_elm[i].innerHTML.indexOf(currencySymbol)==-1)) {
				var table_inner = Foxtrick.trim(table_elm[i].innerHTML);
				var inner_raw = table_elm[i].innerHTML;
				var bdo_br='';
				if (doc.location.href.search(/Club\/Finances\//)!=-1)
					bdo_br='<br>';
				if (inner_raw.search(/bdo dir="ltr"/)!=-1) {
					inner_raw = table_elm[i].innerHTML.replace(/<bdo dir="ltr">/,'').replace(/<\/bdo>/,'') ;
				}
				var res="";
				var only_one_number = false;
				var first = true;
				while (pos!=-1) {
					pos+=oldSymbolLength;
					var table_inner_stripped = inner_raw.replace(/\s|\&nbsp\;/g,'');
					if (first==true && table_inner_stripped.replace(myDelReg,'')=='')
						only_one_number=true; // remove html tags and currency to check if this is the only real entry.
					try {
						var val=table_inner_stripped.match(myReg)[1];
					}
					catch (e) {
						// catching currency symbol of tranfer bid
						return;
					}
					var conv = Foxtrick.formatNumber(Math.floor(val * currencyRate / currencyRateNewCurr),'&nbsp;');
					conv = conv.replace(/\-\&nbsp\;/,'-');

					// add a <br> if there is only one entry
					var br='';
					if (only_one_number==true) br='<br>';
					// add a space at the end if the next symbol is not ')'
					var space=' ';
					var next_char=inner_raw.charAt(pos);
					if (next_char==')' || next_char=='/' || next_char=='.' || next_char==',')
						space='';
					if (inner_raw.charAt(pos)=='<') {
						next_char=inner_raw.substr(pos).replace(myDelReg,'').charAt(0);
						if (next_char==')' || next_char=='/' || next_char=='.' || next_char==',')
							space='';
					}

					// add left part plus converted
					res+=inner_raw.substr(0,pos)+' '+br+'<span>('+conv+'&nbsp;'+currencySymbol+')</span>'+space+bdo_br;

					// get the remains and check them in next loop
					inner_raw = inner_raw.substring(pos);
					pos= inner_raw.search(oldCurrencySymbol);
					bdo_br='';
					first=false;
				}

				table_elm[i].innerHTML = res + inner_raw;
				Foxtrick.addClass(table_elm[i], "foxtrick-currency-converter");
			}
		}
    }
};
