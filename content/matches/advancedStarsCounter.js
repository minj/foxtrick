/**
 * advancedStarsCounter.js
 * Show separated yellow/brown stars total with ratio graph (just total for youth matches)
 * @author Kurdy_Malloy
 */

////////////////////////////////////////////////////////////////////////////////

var FoxtrickAdvancedStarsCounter = {

	MODULE_NAME : "AdvancedStarsCounter",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('matchLineup'), 
	DEFAULT_ENABLED : true,
	
	init : function() {
    },

    run : function( page, doc ) {
		var url=Foxtrick.getHref( doc );
		// check if its youth match
		var isYouth=url.match(/isYouth/i)
		var divs=doc.getElementsByTagName('div')
		var five=0
		var one=0
		var half=0
		var b_one=0
		var b_half=0
		for(var i=1;i<divs.length;i++){
			if(divs[i].className=='box_lineup'){
				var stars=divs[i].getElementsByTagName('img')
				for(var j=0;j<stars.length;j++){
					var alt=stars[j].alt
					switch (alt){
						case "*****":
						five++
						break;
						case "*":
						one++
						break;
						case "+":
						half++
						break;
						case "+-+b":
						half++
						b_half++
						break;
						case "*b":
						b_one++
						break;
						case "+b":
						b_half++
						break;
					}

				}
			}
		}
		var total=five*5+one+half*0.5+b_half*0.5+b_one
		var yelow=five*5+one+half*0.5
		var brown=b_half*0.5+b_one
		var star_ratio=new Array()
		// create total stars div
		var totalStars=doc.createElement('div')
		var starsHtml= "<b>" + Foxtrickl10n.getString('total_stars') + ":</b> "+total
		// if youth match do not show yellow+brown
		if(!isYouth){
			starsHtml=starsHtml+ " ("+yelow+"<img src='UserControls/Img.axd?res=Matches&amp;img=star_yellow.png'> + "+brown+"<img src='UserControls/Img.axd?res=Matches&amp;img=star_brown.png'>) </b>"
		}
		starsHtml+="</br>"
		// yellow/brown stars ratio
		star_ratio[0]=Math.round(100*yelow/(yelow+brown))
		star_ratio[1]=100-star_ratio[0]
		// number if stars images
		var fy_img=Math.floor(yelow/5)
		var oy_img=Math.floor(yelow%5)
		var yh_img=(yelow-fy_img*5-oy_img)*2
		var yb_img=0
		if(yh_img==1 && brown>0){
			yb_img=1
			yh_img=0
			brown-=0.5
		}
		var ob_img=Math.floor(brown)
		var hb_img=(brown-ob_img)*2
		var img_array=new Array(fy_img,oy_img,yh_img,yb_img,ob_img,hb_img)
		var src_array=new Array("UserControls/Img.axd?res=Matches&amp;img=star_big_yellow.png","UserControls/Img.axd?res=Matches&amp;img=star_yellow.png","UserControls/Img.axd?res=Matches&amp;img=star_half_yellow.png","UserControls/Img.axd?res=Matches&amp;img=star_yellow_to_brown.png","UserControls/Img.axd?res=Matches&amp;img=star_brown.png","UserControls/Img.axd?res=Matches&amp;img=star_half_brown.png")
		// if youth match show blue stars
		if(isYouth){
			var src_array=new Array("UserControls/Img.axd?res=Matches&amp;img=star_big_blue.png","UserControls/Img.axd?res=Matches&amp;img=star_blue.png","UserControls/Img.axd?res=Matches&amp;img=star_half_blue.png")
		}
		// images output
		for(var i=0;i<img_array.length;i++){
			for(j=0;j<img_array[i];j++){
				starsHtml+="<img src='"+src_array[i]+"'/>"
			}
		}
		// yellow/brown graph if not youth match
		if(!isYouth){
			starsHtml+='<br>';
			starsHtml+='<div class="float_left shy smallText"><img src="UserControls/Img.axd?res=Matches&amp;img=star_yellow.png"/>' + star_ratio[0]+'%</div><div class="possesionbar">'
			starsHtml+='<img alt="" src="/Img/Matches/filler.gif" height="10"  width="'+star_ratio[0]+'" /><img src="/Img/Matches/possesiontracker.gif" alt="" /></div>'
			starsHtml+='<div class="float_left shy smallText">'+star_ratio[1]+'%<img src="UserControls/Img.axd?res=Matches&amp;img=star_brown.png"/></div><div style="clear: both"></div>'
		}
		var experienceRuleLink;
		for(var j = 0; j < doc.links.length; j++) {
			if(doc.links[j].className=="skill") {
				experienceRuleLink = doc.links[j];
			}
		}
		var target = experienceRuleLink.parentNode;
		var span = doc.createElement("span");
		span.innerHTML = starsHtml
		target.appendChild(doc.createElement("br"));
		target.appendChild(span, target);
	},

    change: function( page, doc ) {
  
    }
        
};