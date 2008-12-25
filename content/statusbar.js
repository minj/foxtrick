/* 
    disables statusbar icon
    spambot
    At the moment i dont know, why excactly wont work...
*/

// alert('status of the bar: ' + FoxtrickPrefs.getBool( "statusbarshow" ) + '.');
try {
    var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
    var win = wm.getMostRecentWindow("navigator:browser");

// alert('+' + wm + '+');
// alert('+' + win + '+');

    if (FoxtrickPrefs.getBool( "statusbarshow" ) == true) {
        win.document.getElementById("foxtrick-status-bar-image").hidden = false;
    } else {
        win.document.getElementById("foxtrick-status-bar-image").hidden = true;
    }

catch (e) {
    dump(e);
}