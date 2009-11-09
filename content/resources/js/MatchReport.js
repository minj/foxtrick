function gotoElmentID(elementID) {
    if (elementID === '') {
        scroll(0, 0);
    } else {
        var element = document.getElementById(elementID);
        window.scrollBy(0, element.offsetTop);
    }
}