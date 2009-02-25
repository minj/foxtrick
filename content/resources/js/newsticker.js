var ticktimer;
var last_num_message;
InitFoxtrickNews();

function InitFoxtrickNews() {
	last_num_message=0;
    FoxtrickCheckNews();
    if (!ticktimer) {
        ticktimer = window.setInterval('FoxtrickCheckNews()', 30000);
    }
}

function FoxtrickCheckNews() {
    var newsList = document.getElementById('ticker').getElementsByTagName('div');
    var showAlert=false;
    var alertMessage=null;
    
    for (var i=0;i<newsList.length;i++)
    {
        if (newsList[i].innerHTML.indexOf('strong')>0)
        {
            showAlert=true;
            alertMessage='';
            var objEvent = document.createEvent("Events");
            objEvent.initEvent("FoxtrickTickerEvent", true, false);
            document.getElementById('ticker').dispatchEvent(objEvent);
        }
    }
    var message = document.getElementById('menu').getElementsByTagName('a')[0].getElementsByTagName('span')[0];
	if (message) { 
		var num_message = message.innerHTML.replace(/\(|\)/g,'');
		if (num_message>last_num_message) {
			var objEvent = document.createEvent("Events");
            objEvent.initEvent("FoxtrickTickerEvent", true, false);
            document.getElementById('menu').dispatchEvent(objEvent);
        
			last_num_message=num_message;
		}
	}
	else last_num_message=0;
}