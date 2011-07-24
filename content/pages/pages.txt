/*
 * pages.js
 * Wrapper for Foxtrick.Pages
 *
 * Pages under this directory need not to be modules, they only provide utility
 * functions for retrieving page-specific information, and serve like libraries.
 *
 * Hence they only need to be included in foxtrick.xul, not needed to include
 * in foxtrick-preferences.xhtml.
 *
 * Furthermore, since the functions here are page-specific, generally speaking
 * their first arguments need to be `doc'.
 */

if (!Foxtrick) var Foxtrick = {};
Foxtrick.Pages = {};
