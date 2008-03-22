try {
    var	htLanguagesXml = document.implementation.createDocument("", "", null);
    htLanguagesXml.async = false;
    htLanguagesXml.load("chrome://foxtrick/content/htlocales/htlang.xml", "text/xml");
} catch (e) {
	foxtrickdebug(e);
}

try {
    var	htCurrenciesXml = document.implementation.createDocument("", "", null);
    htCurrenciesXml.async = false;
    htCurrenciesXml.load("chrome://foxtrick/content/htlocales/htcurrency.xml", "text/xml");
} catch (e) {
	foxtrickdebug(e);
}
