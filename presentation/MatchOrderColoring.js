/**
 * MatchOrderColoring.js
 * 
 * @author convincedd
 */

var FoxtrickMatchOrderColoring = {
	
    MODULE_NAME : "MatchOrderColoring",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('matchOrders'), 
	DEFAULT_ENABLED : false,
	CSS:"chrome-extension://bpfbbngccefbbndginomofgpagkjckik/resources/css/MatchOrderColoring.css",
	NEW_AFTER_VERSION: "0.4.8.3",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	LATEST_CHANGE:"Colors positions on html match order page (default off)",
	
    init : function() {
    },
    run : function( page, doc ) {
	
	doc.getElementById('ctl00_CPMain_plyRightBack_ddlBehaviour').style.background='#8f8';
	doc.getElementById('ctl00_CPMain_plyDef1_ddlBehaviour').style.background='#88f';
	doc.getElementById('ctl00_CPMain_plyDef2_ddlBehaviour').style.background='#88f';
	doc.getElementById('ctl00_CPMain_plyLeftBack_ddlBehaviour').style.background='#8f8';
	doc.getElementById('ctl00_CPMain_plyRightWing_ddlBehaviour').style.background='#fd8';
	doc.getElementById('ctl00_CPMain_plyMid1_ddlBehaviour').style.background='#ff8'; 
	doc.getElementById('ctl00_CPMain_plyMid2_ddlBehaviour').style.background='#ff8'; 
	doc.getElementById('ctl00_CPMain_plyLeftWing_ddlBehaviour').style.background='#fd8'; 
	doc.getElementById('ctl00_CPMain_plyForward1_ddlBehaviour').style.background='#f88';
	doc.getElementById('ctl00_CPMain_plyForward2_ddlBehaviour').style.background='#f88';
	
	var i=2,child,childes = doc.getElementById('startlineup').childNodes;
	while (child=childes[i++]) {
		if (!child.id) continue;
		var select=child.getElementsByTagName('select')[1];
		if (select.value==5) select.style.background='#f88';
		else if (select.value==6) select.style.background='#ff8';
		else if (select.value==7) select.style.background='#88f';

		}
	
	},
	
	change : function( page, doc ) {
		this.run(page,doc);
	}
};