// script which converting a currency on the all hattrick pages
// Note dev: only if currency in TD tag and in div[id=page]
// author by smates

FoxtrickCurrencyConverter = {

    MODULE_NAME : "CurrencyConverter",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : false,

    init : function() {
        Foxtrick.registerPageHandler('all', this);
    },

    run : function(page, doc) {
    
    /*CURRENCY TYPE AND RATE*/
  
   var oldCurrencySymbol = FoxtrickPrefs.getString("oldCurrencySymbol");//currencysymbol which in the your country
   var currencySymbol = FoxtrickPrefs.getString("currencySymbol");//
   var currencyRate = FoxtrickPrefs.getString("currencyRate"); // this is value of tag CODE from htcurrency.xml
   var currencyRateNewCurr = "1";
   
   if (oldCurrencySymbol == "€"){
   var currencyRateNewCurr = currencyRate;
  var currencyRate = "1";
  }
   
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
            
            if (table_elm_bonus == null) return;
            table_inner = Foxtrick.trim(table_elm_bonus.innerHTML);

            var part = substr(table_inner, 0, table_inner.lastIndexOf("&nbsp;"));
            var mezera = "&nbsp;";
            var part_1_save = part;
            var part_2_save = substr(table_inner, table_inner.lastIndexOf("&nbsp;") + mezera.length , table_inner.length );
       

              //this loop removing 10 &nbsp;  From 15 000 000 make 15000000  
                 var part = part;
                 for ( i=0; i<10; i++ ) { 
                  var part = part.replace('&nbsp;', ''); 
                 }
                 
            //part = Math.floor(parseInt(part.replace('&nbsp;', '')) * rata);
            part = Math.floor(parseInt(part.replace('&nbsp;', ''))  * currencyRate / currencyRateNewCurr);
            part = ReturnFormatedValue (part, ' ');

            if (part != 'NaN'){ 
            table_elm_bonus.innerHTML = part_1_save +'&nbsp;'+ part_2_save + '&nbsp;<br><span class="smallText" style="color:green;white-space: nowrap;">(' + part + '&nbsp;' + currencySymbol + ')</span>&nbsp;';
            table_elm_bonus.id="foxtrick-currency-converter";

}

        } catch (e) {
            dump('  CurrencyConverter: ' + e + '\n');
        }

}
	
};