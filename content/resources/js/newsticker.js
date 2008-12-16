var ticktimer;
InitFoxtrickNews();

function InitFoxtrickNews() {
    if (!ticktimer) {
        ticktimer = window.setInterval('FoxtrickCheckNews()', 30000);
    }
}

function FoxtrickCheckNews() {
    var newsList = document.getElementById('ticker').getElementsByTagName('div');
    var showAlert=false;
    var alertMessage=null;
    
    for (i=0;i<newsList.length;i++)
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
    
}