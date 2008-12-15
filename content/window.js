/**
 * window.js
 * Foxtrick window init, load the Foxtrick symblos into window's namespace
 * @author kolmis
 */
 
var myFoxtrickService = Components.classes["@foxtrick;1"].getService().wrappedJSObject;

var FoxtrickMain = myFoxtrickService.getFoxtrickMain();
var Foxtrick = myFoxtrickService.getFoxtrick();
var FoxtrickPrefs = myFoxtrickService.getFoxtrickPrefs();
var Foxtrickl10n = myFoxtrickService.getFoxtrickl10n();
