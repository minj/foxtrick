// options xul observer. should have worked for mobile as well i guess, but didn't. so option-mobile stays old style for now
if (Foxtrick.platform == "Android") {
	var observer = {
	  observe: function(aSubject, aTopic, aData) {
		if (aTopic == "addon-options-displayed" 
		&& aData == "{9d1f059c-cada-4111-9696-41a62d64e3ba}") {
				var doc = aSubject;
				var openPrefsButton = doc.getElementById("pref-reset");
				openPrefsButton.setAttribute("label", "Reset");
				openPrefsButton.addEventListener('click', function(ev) {
					if (window.confirm('Are you sure you want to restore to default settings?')){
						FoxtrickPrefs.cleanupBranch();
					}
				}, false);
				var openPrefsButton = doc.getElementById("pref-open");
				openPrefsButton.setAttribute("label", "Open");
				openPrefsButton.addEventListener('click', function(ev) {
					FoxtrickPrefs.show();
				}, false);
			}
		}
	};

	Components.utils.import( "resource://gre/modules/Services.jsm" );

	Services.obs.addObserver(observer, "addon-options-displayed", false);
}
