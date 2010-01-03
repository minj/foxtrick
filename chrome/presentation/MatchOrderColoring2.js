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
	try{
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
	
	var i=0,child,childes = doc.getElementById('startlineup').childNodes;
	var names = new Array();
	while (child=childes[i++]) {
		if (!child.id) continue;
		var selects=child.getElementsByTagName('select');
		if (selects.length<1) continue;
		
		//Foxtrick.dump(selects[0].options[0].innerHTML+'\n');
		if (selects.length<2) {
			//selects[0].options[0].style.background='#888';
			//selects[0].style.background='#888';
			//selects[0].options[selects[0].selectedIndex].style.background='#888';
			names.push({'name':selects[0].options[0].innerHTML,'color':'background:#888;'});
			continue;			
		}
		
		var select=selects[1];
		if (select.value==5) select.style.background='#f88';
		else if (select.value==6) select.style.background='#ff8';
		else if (select.value==7) select.style.background='#88f';
		//selects[0].options[0].setAttribute('style',select.getAttribute('style'));
		//selects[0].options[selects[0].selectedIndex].setAttribute('style',select.getAttribute('style'));
		names.push({'name':selects[0].options[0].innerHTML,'color':select.getAttribute('style')});	
	}
	Foxtrick.dump(names.length+'\n');
	for (var i=0;i<names.length;++i) {
		Foxtrick.dump(names[i].name+'\t'+names[i].color+'\n');
	}	
	
	var options=doc.getElementById('field').getElementsByTagName('option');
	for (var i=0;i<options.length;++i) {
		for (var j=0;j<names.length;++j) {
			if (names[j].name==options[i].innerHTML) {
				options[i].setAttribute('style',names[j].color);		
			}
		}
	}
		
	} catch(e){Foxtrick.dump('FoxtrickMatchOrderColoring '+e+'\n')}
	},
	
	change : function( page, doc ) {
		Foxtrick.dump('FoxtrickMatchOrderColoring change ->rerun\n');
		this.run(page,doc);
	}
};