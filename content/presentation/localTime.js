// show local time
//
// author by convincedd

var FoxtrickLocalTime = {

    MODULE_NAME : "LocalTime",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('all'),
	DEFAULT_ENABLED : false,
	OPTIONS : new Array("DefaultLocal"),
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Show optional local time",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,

    run : function(page, doc) {
		var httime = doc.getElementById('time');
		var localtime = doc.createElement('div');
		localtime.id = 'localtime';
		localtime.title = 'local time';
		localtime.setAttribute('style','float:right; margin-left:5px; cursor:pointer;');
		if (Foxtrick.isModuleFeatureEnabled( this, "DefaultLocal" )) {
			localtime.style.display='inline';
			httime.setAttribute('style','display:none; cursor: pointer;');
		}
		else {
			localtime.style.display='none';
			httime.setAttribute('style','display:inline; cursor: pointer;');
		}
		httime.parentNode.insertBefore(localtime, httime.nextSibling);
		httime.title = 'Hattrick time';
		localtime.addEventListener('click',FoxtrickLocalTime.showHTTime,false);
		httime.addEventListener('click',FoxtrickLocalTime.showLocalTime,false);

		this.runLocalClock(doc,FoxtrickReadHtPrefsFromHeader.ht_dateformat);
	},

	runLocalClock : function(doc,dateFormat) {
		var now = new Date();
		var localDate = getLocalDate(now.getFullYear(), padLeft(now.getMonth()+1,'0'), padLeft(now.getDate(),'0'), dateFormat);
		doc.getElementById('localtime').innerHTML = localDate + ' ' + padLeft(now.getHours(), '0') + ':' + padLeft(now.getMinutes(), '0') + ':' + padLeft(now.getSeconds(),'0');
		setTimeout(FoxtrickLocalTime.runLocalClock, 1000, doc,dateFormat);
	},

	showHTTime : function(evt) {
		var doc = evt.target.ownerDocument;
		doc.getElementById('localtime').style.display='none';
		doc.getElementById('time').style.display='inline';
	},

	showLocalTime : function(evt) {
		var doc = evt.target.ownerDocument;
		doc.getElementById('time').style.display='none';
		doc.getElementById('localtime').style.display='inline';
	},

	change : function( page, doc ) {
//		this.run(page, doc);
	},
};


/**
* Numbers < 10 should be presented with a character in front
*/
function padLeft(number,character) {
    return (number < 10) ? character + number : number;
}

/**
* CLOCK
*/
function getLocalDate(year, month, day, dateFormat) {
if (dateFormat.length < 2) { // When not logged in there is no dateformat
dateFormat = 'yyyy-mm-dd';
}
dateFormat = dateFormat.replace('yyyy', year);
dateFormat = dateFormat.replace('mm', month);
dateFormat = dateFormat.replace('dd', day);
dateFormat = dateFormat.replace('d', day);
dateFormat = dateFormat.replace('m', month);

return dateFormat;
}
