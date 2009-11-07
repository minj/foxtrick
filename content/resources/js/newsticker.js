var ticktimer;
/*InitFoxtrickNews();

function InitFoxtrickNews() {
	FoxtrickCheckNews();
    if (!ticktimer) {
        ticktimer = window.setInterval('FoxtrickCheckNews()', 30000);
    }
}*/

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
		var objEvent = document.createEvent("Events");
        objEvent.initEvent("FoxtrickMailEvent", true, false);
        document.getElementById('menu').dispatchEvent(objEvent);
	}
}