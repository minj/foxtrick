function economistsCalculator(document)
{
	if (isEconomyUrl(document.location.href))
	{
		var tds;
		var kar;
		var unekoDiru, aurrekoDiru;
		
		var Diru;
		var temp = document.links;
		for (var i=0; i < temp.length; i++) 
		{
            		if ( temp[i].href.match(/economyHelp\.asp/i) ) 
			{
                		tds=temp[i].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.childNodes[3].childNodes[1].firstChild.childNodes[3].childNodes[6].childNodes[1].firstChild.childNodes[3];
                		break;
            		}
		}

		var Diru=tds.firstChild.data.toString();
		var bal="-0123456789."
		for(var i=0;i<=Diru.length;i++)
		{
			kar=Diru.charAt(i);
			if (bal.indexOf(kar)!=-1)
			{
				if (aurrekoDiru==null)
					aurrekoDiru=kar;
				else
					aurrekoDiru=aurrekoDiru + kar;
			}
			else
			{
				if(kar=="(")
					break;
			}
		}
		for(var j=i+1;j<=Diru.length;j++)
		{
			kar=Diru.charAt(j);
			if (bal.indexOf(kar)!=-1)
			{
				if (unekoDiru==null)
					unekoDiru=kar;
				else
					unekoDiru=unekoDiru + kar;
			}
			else
			{
				if(kar==")")
					break;
			}
		}
		var unekoEko=(ekonomistaKopuruOptimoa(unekoDiru)).toString();
		var aurrekoEko=(ekonomistaKopuruOptimoa(aurrekoDiru)).toString();
		var ekoOp;
		if (unekoDiru > 0 && aurrekoDiru > 0)
			ekoOp = unekoEko;
		if (unekoDiru < 0 && aurrekoDiru < 0)
			ekoOp = aurrekoEko;
		if (aurrekoDiru < 0 && unekoDiru > 0)
		{
			if (unekoEko.charAt(unekoEko.length-1) > aurrekoEko.charAt(aurrekoEko.length-1))
				ekoOp = unekoEko;
			if (unekoEko.charAt(unekoEko.length-1) < aurrekoEko.charAt(aurrekoEko.length-1))
				ekoOp = aurrekoEko;
			if (unekoEko.charAt(unekoEko.length-1) == aurrekoEko.charAt(aurrekoEko.length-1))
			{
				if(unekoEko.length < aurrekoEko.length)
					ekoOp = unekoEko;
				else
					ekoOp = aurrekoEko;
			}
		}
		if (aurrekoDiru >= 0 && unekoDiru <= 0)
			ekoOp = 0;

		var txt="<tr><td><b>With the current money: </b></td><td>";
		for(var i=0;i<unekoEko.length-1;i++)
		{
			txt=txt +"<b><FONT COLOR=#0000FF>"+unekoEko.charAt(i)+"</FONT></b> or ";
		}
		txt=txt + "<b><FONT COLOR=#0000FF>" + unekoEko.charAt(unekoEko.length-1) + "</FONT></b><br></td></tr><tr><td><b>With previous week's money: </b></td><tr><td>";
		
		for(var i=0;i<aurrekoEko.length-1;i++)
		{
		 	txt=txt +"<b><FONT COLOR=#0000FF>"+ aurrekoEko.charAt(i)+"</FONT></b> or ";
		}
		txt=txt + "<b><FONT COLOR=#0000FF>" + aurrekoEko.charAt(aurrekoEko.length-1) + "</FONT></b><br><br></td></tr><tr><td><b>You should have this economists before the next economical update: </b></td><td>";

		for(var i=0;i<ekoOp.length-1;i++)
		{
			txt=txt +"<b><FONT COLOR=#0000FF>"+ ekoOp.charAt(i) +"</FONT></b> or ";
		}
		txt=txt + "<b><FONT COLOR=#0000FF>" + ekoOp.charAt(ekoOp.length-1) + "</FONT></b> economists</td></tr>";

		var eko = document.createElement("p");
		eko.innerHTML = txt;
		var div = document.createElement("div");
		div.innerHTML = "<br><div class=\"rub1\">" + "Economists Calculator" + "</div>";
		div.appendChild(eko);

		var tdp=tds.parentNode.parentNode.parentNode.parentNode.parentNode.childNodes[5];
		tdp.setAttribute ("valign", "top");
		tdp.appendChild(div);
	}
}


function interesak(diruKop)
{
	if (diruKop < 0)
		return (parseInt((diruKop * (-1)) * 0.05));
	else
		return 0;
}


function etekina(diruKop, ekoKop)
{

  // _KOHb_ {
  var currency = "";
  var rate = 1.0;
  try {
    var currencyCode = PrefsBranch.getCharPref("htCurrency");
  } catch (e) {
    currencyCode = "EUR";
  }

  try {
    var path = "hattrickcurrencies/currency[@code='" + currencyCode + "']";
    var obj = htCurrenciesXml.evaluate(path,htCurrenciesXml,null,htCurrenciesXml.DOCUMENT_NODE,null).singleNodeValue;
    currency = obj.attributes.getNamedItem("shortname").textContent;
    rate = 1.0/parseFloat(obj.attributes.getNamedItem("eurorate").textContent);
  } catch (e) {
    currency = "&euro;";
    rate = 1.0;
  }
  // }


	if (diruKop >= 0)
		return (diruSarrera(diruKop, ekoKop) - ((1500*rate) * ekoKop));
	else
	{
		if (ekoKop <= 4)
			return (diruSarrera(diruKop, ekoKop) - ((1500*rate) * ekoKop));
		else
			return 0;
	}
}


function diruSarrera(diruKop, ekoKop)
{
	var emaitza;
	var ehunekoak= new Array(11);
	var ehunekoNeg= new Array(5);

		ehunekoak[0]=0.0;
		ehunekoak[1]=0.3;
		ehunekoak[2]=0.42;
		ehunekoak[3]=0.52;
		ehunekoak[4]=0.6;
		ehunekoak[5]=0.67;
		ehunekoak[6]=0.73;
		ehunekoak[7]=0.79;
		ehunekoak[8]=0.85;
		ehunekoak[9]=0.9;
		ehunekoak[10]=0.95;

		ehunekoNeg[0]=0;
		ehunekoNeg[1]=20;
		ehunekoNeg[2]=28;
		ehunekoNeg[3]=34;
		ehunekoNeg[4]=40;

	if (diruKop >= 0)
	{	
		//Data taken from the tables made by mayor (http://www.academiamayor.tk)
		//1  -> %0,3
		//2  -> %0,42
		//3  -> %0,52
		//4  -> %0,6
		//5  -> %0,67
		//6  -> %0,73
		//7  -> %0,79
		//8  -> %0,85
		//9  -> %0,9
		//10 -> %0,95
		emaitza = parseInt(diruKop * (parseFloat(ehunekoak[ekoKop]) / 100));
		if (diruKop != 500000)
		{
			emaitza = parseInt(emaitza / 100);
			emaitza = parseInt(emaitza * 100);
		}
	}
	else
	{
		//Interesak %5
		//1 -> %20
		//2 -> %28
		//3 -> %34
		//4 -> %40
		if (ekoKop <= 4)
		{
			emaitza = parseInt(interesak(diruKop) * (parseFloat(ehunekoNeg[ekoKop]) / 100));
			emaitza = parseInt(emaitza / 100);
			emaitza = parseInt(emaitza * 100);
		}
		else
			emaitza = 0;
	}
	return emaitza;
}

function ekonomistaKopuruOptimoa(diruKop) 
{
	var diruMax=0;
	var unekoEtekin;
	var pos = 0;
	var i = 1;
	var aurkitua = false;
	while(i<=10 & aurkitua==false)
	{
		unekoEtekin = etekina(diruKop, i);
		if (unekoEtekin > diruMax)
		{
			diruMax = unekoEtekin;
			pos = i.toString();
			i = i + 1;
		}
		else
		{
			if (unekoEtekin == diruMax)
			{
				pos = pos + i.toString();
				i = i + 1;
			}
			else
				aurkitua = true;
		}
	}
	return (pos);
}
