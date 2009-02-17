/**
 * window.js
 * Foxtrick window init, load the Foxtrick symblos into window's namespace
 * @author kolmis
 */
 
var FoxtrickService = Components.classes["@foxtrick;1"].getService().wrappedJSObject;

var FoxtrickMain = FoxtrickService.getFoxtrickMain();
var Foxtrick = FoxtrickService.getFoxtrick();
var FoxtrickPrefs = FoxtrickService.getFoxtrickPrefs();
var Foxtrickl10n = FoxtrickService.getFoxtrickl10n();
