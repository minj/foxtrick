function gotoElmentID(elementID) {
    if (elementID === '') {
        
    } else {
        var element = document.getElementById(elementID);
        scroll(0, 0);
        window.scrollBy(0, element.offsetTop);
    }
}