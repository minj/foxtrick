function foxtrick_FlagsCounter(doc) {
	
	if (!getShowTweak("flagsCounter")) return;
	if (!isFlagsUrl(doc.location.href)) return;
	
	Body = doc.getElementsByTagName("body");
	BodyContent = Body[0].innerHTML;
	BodyContent = BodyContent.replace(/<BR><BR>/gi,'<BR><BR><a href=\"spacer\"></a>')
	Body[0].innerHTML = BodyContent;

	var links = doc.links;

	var divs = doc.getElementsByTagName("h2");
	for (var i=0; i<divs.length; i++) {
		var replacement = doc.createElement("h2");
		replacement.innerHTML = divs[i].textContent + "<a href=\"spacer\"></a>";        
		divs[i].parentNode.replaceChild(replacement, divs[i]);
	}
	
	var flags = new Array();
	var vlaggen=0;
	var a=0;
	for (var i=0; i<links.length; i++) {
		var link1 = links[i];
		if (link1.href.match(/LeagueSystemDetails\.asp/i))
		{
			vlaggen++;
		}
		else if(link1.href.match(/spacer/i)){
			flags[a] = vlaggen;
			vlaggen=0;
			a++;
		}
	}
	
	flags[a]=vlaggen;
	
	var b=0;
	var a=2;
	var divs = doc.getElementsByTagName("h2");
	for (var i=0; i<divs.length; i++) {
		var replacement = doc.createElement("h2");
		if(b==0){
			extra = flags[a]+'/';
			a++;
			extra += flags[a];
		}
		else{
			extra = flags[a];	
		}
		replacement.innerHTML = divs[i].textContent + "(" + extra + ")";        
		divs[i].parentNode.replaceChild(replacement, divs[i]);
		a++;
		a++;
		b++;
	}
}

function foxtrick_MedianTransferPrice(doc)	{
    
    if (!isTransferCompareUrl(doc.location.href)) return;
	if (!getShowTweak("transferCompareMedianPrice")) return;
    
    var table = doc.getElementsByTagName("table")[3];
    var count = table.rows.length-1;

	var priceArray = new Array();
	for (var i = 1; i<count; i++) {
		if(table.rows[i].cells[2].innerHTML.match(/br/i)){
			var thisPrice = parseInt(table.rows[i].cells[2].lastChild.textContent.replace(/\s/g, ""));
			priceArray[i-1]=thisPrice;
		}
	}
	priceArray.sort(function(a,b){return a-b;});

	var median = 0;
	lengte = priceArray.length;
	
	if(lengte % 2 ==1){
		median = priceArray[(lengte-1)/2]+"";
	}
	else {
		median = ((priceArray[(lengte/2)-1]+priceArray[lengte/2])/2)+"";
	}

	if (count>0) {
        
        var currency = trim(table.rows[1].cells[2].textContent.match(/\D+$/)[0]);
        var row = table.insertRow(table.rows.length);
        var cell = row.insertCell(0);
        cell.setAttribute("style", "text-align: center; font-weight: bold");
        cell.colSpan = 2;
        cell.innerHTML = messageBundle.GetStringFromName("foxtrick.playertransfercompare.medianprice");
        cell = row.insertCell(1);
        cell.innerHTML = median.group(" ") + " " + currency;
    }
}