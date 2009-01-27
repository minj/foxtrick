// script which converting a currency on the all hattrick pages
// Note dev: only if currency in TD tag and in div[id=page]
// author by smates

FoxtrickCurrencyConverter = {

    MODULE_NAME : "CurrencyConverter",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : false,

    init : function() {
        Foxtrick.registerPageHandler('all_late', this);
    },

    run : function(page, doc) {
    
    /*CURRENCY TYPE AND RATE*/
  
   var oldCurrencySymbol = FoxtrickPrefs.getString("oldCurrencySymbol");//currencysymbol which in the your country
   var currencySymbol = FoxtrickPrefs.getString("currencySymbol");//
   var currencyRate = FoxtrickPrefs.getString("currencyRate"); // this is value of tag CODE from htcurrency.xml
   var currencyRateNewCurr = FoxtrickPrefs.getString("currencyRateTo");
   
   var div = doc.getElementById( 'page' );
   
           
   var table_elm = div.getElementsByTagName( 'td' );
           
            for ( var i = 0; i < table_elm.length; i++) {
                var table_inner = Foxtrick.trim(table_elm[i].innerHTML);
                try {  
                    if (strrpos( table_inner, oldCurrencySymbol) > 0 && table_elm[i].id != "foxtrick-currency-converter") {
						var table_elm_bonus = table_elm[i];  
						this.drawNewCurrency(doc,table_elm_bonus,table_inner,currencySymbol,currencyRate,currencyRateNewCurr); 
                    }
                }
                catch(e) {dump('    >' + e + '\n');} 
            }         
    },

	change : function( page, doc ) {

	},


drawNewCurrency : function (doc,table_elm_bonus,table_inner,currencySymbol,currencyRate,currencyRateNewCurr) {

try {	

			var oldCurrencySymbol = FoxtrickPrefs.getString("oldCurrencySymbol");//currencysymbol which in the your country
            var table_inner_stripped="";
			var newtext="";
			var newnum="";
			var symbol="";
			var br="";
			var only_one_number=true;
			var inside_span=false;
			for (var i=0;i<table_inner.length;i++){
				table_inner_stripped += table_inner.charAt(i);
				if (table_inner.charAt(i)=='>') { inside_span=false; continue;}
				if (table_inner.charAt(i)=='<' || inside_span==true) {inside_span=true; continue;}
				if (table_inner.charAt(i).search(/\d|-/)!=-1) {
					if (newnum=="" && symbol!="") {only_one_number=false; symbol="";} 
					newnum+=table_inner.charAt(i); 
				}
				else if (newnum!="") {  
					symbol+=table_inner.charAt(i); 
					if (symbol==" " || symbol=="&nbsp;") symbol="";
					if (symbol.charAt(0)!='&' && symbol.length==oldCurrencySymbol.length) {
						if (symbol==oldCurrencySymbol) { 
							var conv=ReturnFormatedValue(Math.floor(newnum * currencyRate / currencyRateNewCurr),'&nbsp;');
							conv=conv.replace(/\-\&nbsp\;/,'-'); 
							br='<mybr>';
							var color='#377f31';
							if (table_elm_bonus.firstChild && table_elm_bonus.firstChild.style) {
									color = table_elm_bonus.firstChild.style.color;	
							}
							if (conv.charAt(0)=='-') color='#aa0000';
							if (newnum==0)  color="black";
							
							table_inner_stripped+=' '+br+'<span class="smallText" style="font-weight: normal; color:'+color+';white-space: nowrap;">('+conv+'&nbsp;'+currencySymbol+')</span> '; 
							newnum=""; 
							symbol="";  
						}
						else {symbol="";newnum="";only_one_number=false;}
					}
				
				
				}
				else {if (table_inner.charAt(i).search(/\S/)!=-1) only_one_number=false;}
			} 
			if (only_one_number==true) table_inner_stripped=table_inner_stripped.replace('<mybr>','<br>');
			else table_inner_stripped=table_inner_stripped.replace('<mybr>','');
			
            table_elm_bonus.innerHTML = table_inner_stripped;
			table_elm_bonus.id="foxtrick-currency-converter";

        } catch (e) {
            dump('  CurrencyConverter: ' + e + '\n');
        }

}
	
};