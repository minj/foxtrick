function goToElementById(id) {
    // need to use this in case HeaderFix is enabled
    try {
        var element = document.getElementById(id);
        scroll(0, 0);
        window.scrollBy(0, element.offsetTop);
    }
    catch (e) {
    }
}

function gotoEvent(elementID) {
    if (elementID === '') {

    } else {
        var element = document.getElementsByClassName("ft_mR_format");
        for (var i = 0; i < element.length; i++){
            if (element[i].textContent.search(' '+elementID) > -1) {
                scroll(0, 0);
                window.scrollBy(0, element[i].parentNode.offsetTop);
                break;
            }
        }
    }
}

    var objDrag = null;
    var mouseX 	 = 0;
    var mouseY 	 = 0;
    var offX = 0;
    var offY = 0;

    function init(){
        document.onmousemove = doDrag;
        document.onmouseup = stopDrag;
    }

	function startDrag(objElem) {
        objDrag = objElem;
        offX = mouseX - objDrag.offsetLeft;
        offY = mouseY - objDrag.offsetTop;
	}


	function doDrag(ereignis) {

        mouseX = ereignis.pageX;
        mouseY = ereignis.pageY;

        if (objDrag != null) {

            objDrag.style.left = (mouseX - offX) + "px";
            objDrag.style.top = (mouseY - offY) + "px";

            var sel = window.getSelection();
            sel.removeAllRanges();
        }
	}

	function stopDrag(ereignis) {
        objDrag = null;
	}

    init();
    document.getElementById('scoreboard').onmousedown = function() {startDrag(this)};
    document.getElementById('scoreboard').firstChild.setAttribute('style', 'cursor:move')
