/**
 * forumwritecreatespace.js.js
 * Foxtrick creates some space for writing posts
 * @author convinced
 */

var FoxtrickForumWriteCreateSpace = {

    MODULE_NAME : "ForumWriteCreateSpace",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
    DEFAULT_ENABLED : true,

    _NEW_MESSAGE_WINDOW : 'ctl00_CPMain_ucEditor_tbBody',
    
    init : function() {
        Foxtrick.registerPageHandler( 'forumWritePost', this );
    },

    run : function( page, doc ) {
        try {       

			var mainBody = doc.getElementById( "mainBody" );
			var table = mainBody.getElementsByTagName('table')[0];
			
			otr1=table.rows[0];
			otr2=table.rows[1];
			otd1=table.rows[0].cells[0];
			otd2=table.rows[0].cells[1];			
			otd3=table.rows[1].cells[0];
			otd4=table.rows[1].cells[1];
			otd1.setAttribute('style','vertical-align:middle;');
			otd2.setAttribute('style','vertical-align:middle;');
			otd3.setAttribute('style','vertical-align:middle;');
			otd4.setAttribute('style','vertical-align:middle;');
			otr1.appendChild(otd3);
			otr1.appendChild(otd4);
			var otd5,otd6;
			if (table.rows.length==3) {
				otd5=table.rows[2].cells[0];
				otd6=table.rows[2].cells[1];
				otd5.setAttribute('style','vertical-align:middle;');
				otr1.appendChild(otd5);			
				otd6.setAttribute('style','vertical-align:middle;');
				otr1.appendChild(otd6);			
			}
			else { 
				var pselect =  mainBody.getElementsByTagName('p')[0];
				pselect=mainBody.removeChild(pselect);
				otd5=doc.createElement('td');
				if (Foxtrick.isStandardLayout( doc )) {
					otd1.innerHTML+=' '+otd2.innerHTML;
					otd3.innerHTML+=' '+otd4.innerHTML;
					otd2.innerHTML='';
					otd4.innerHTML='';
					otd5.innerHTML=pselect.innerHTML;
					otr1.appendChild(otd5);
				}
				else {
					otd5.appendChild(pselect.firstChild);
					otd6=doc.createElement('td');
					otd6.innerHTML=pselect.innerHTML;				    
				}
				
			}
		if(!Foxtrick.isStandardLayout( doc )) {
			
			otr1.insertBefore(otd1,otr1.firstChild);
			otr1.insertBefore(otd3,otr1.firstChild.nextSibling);
			otr1.insertBefore(otd5,otr1.firstChild.nextSibling.nextSibling);
			otr2.insertBefore(otd2,otr2.firstChild);			
			otr2.insertBefore(otd4,otr2.firstChild.nextSibling);
			otr2.insertBefore(otd6,otr2.firstChild.nextSibling.nextSibling);
			
			var span1 = doc.getElementById('ctl00_CPMain_valFolder');
			if (span1) {
				var otr3 = doc.createElement('tr');
				otr2.parentNode.appendChild(otr3);
				var otd31 = doc.createElement('td');
				otr3.appendChild(otd31);
				var otd32 = doc.createElement('td');
				otr3.appendChild(otd32);
				
				span1=span1.parentNode.removeChild(span1); 
				otr3.cells[0].appendChild(span1);
				var span2 = doc.getElementById('ctl00_CPMain_valThreadName');
				span2=span2.parentNode.removeChild(span2);
				otr3.cells[1].appendChild(span2);
			}
			
		}
			var header = doc.getElementById( "ctl00_CPMain_hdrMain" );
			var seperator =  mainBody.getElementsByTagName('div')[0];
			header = mainBody.removeChild(header);
			mainWrapper  = doc.getElementById( "mainWrapper" );
			var h2 = mainWrapper.getElementsByTagName('h2')[0];
			var a2 = h2.getElementsByTagName('a')[1];
			a2.innerHTML += ' » '+header.innerHTML;
			seperator=mainBody.removeChild(seperator);
						
			var remlen;
			var i=0; 
			var inputs=mainBody.getElementsByTagName('input'); 
			while(remlen=inputs[i++]) {if (remlen.getAttribute('name')=='remlen') break;}
			var signature=doc.getElementById( "ctl00_CPMain_ucEditor_chkUseSignature" )
			var signature = signature.parentNode.parentNode.removeChild(signature.parentNode);
			remlen.parentNode.insertBefore(signature,remlen.nextSibling);
			remlen.parentNode.insertBefore(doc.createTextNode(' '),remlen.nextSibling);
			
		}
        catch(e) {
            dump('ForumWriteShrinkHeaderSpace'+e+'\n');
        }
	},

	change : function( page, doc ) {
	},	
};